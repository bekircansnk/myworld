from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel

class AIPrioritizeRequest(BaseModel):
    message: str

from app.database import get_db, AsyncSessionLocal
from app.models.task import Task
from app.models.project import Project
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskReorder, TaskBulkUpdate
from app.services.gemini import categorize_task, _get_gemini_client, log_cost_sync, log_cost_awaitable

async def background_categorize_task(task_id: int, task_text: str, project_context: str, tasks_context: str):
    try:
        ai_data = categorize_task(task_text, project_context, tasks_context)
        if not ai_data: return
        
        async with AsyncSessionLocal() as db:
            query = select(Task).where(Task.id == task_id)
            result = await db.execute(query)
            db_task = result.scalars().first()
            if not db_task: return
            
            modified = False
            if "project_id" in ai_data and ai_data["project_id"] is not None and not db_task.project_id:
                db_task.project_id = ai_data["project_id"]
                modified = True
            
            if "priority" in ai_data and db_task.priority == "normal":
                ai_prio = ai_data["priority"]
                db_task.priority = "normal" if ai_prio == "medium" else ai_prio
                modified = True

            if "estimated_minutes" in ai_data and isinstance(ai_data["estimated_minutes"], int) and not db_task.estimated_minutes:
                db_task.estimated_minutes = ai_data["estimated_minutes"]
                modified = True
                
            if "suggested_due_date" in ai_data and ai_data["suggested_due_date"] and not db_task.due_date:
                from dateutil import parser
                try:
                    db_task.due_date = parser.isoparse(ai_data["suggested_due_date"])
                    modified = True
                except Exception as e:
                    print(f"Due date parsing error: {e}")
                    
            if modified:
                await db.commit()
    except Exception as e:
        print(f"Background Task Categorization error: {e}")


router = APIRouter(prefix="/tasks", tags=["tasks"])

from app.dependencies.auth import get_current_user
from app.models.user import User

@router.get("/", response_model=List[TaskResponse])
async def read_tasks(
    db: AsyncSession = Depends(get_db),
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    query = select(Task).options(selectinload(Task.project)).where(Task.user_id == current_user.id, Task.is_deleted == False)
    
    # Filtreleme
    if project_id is not None:
        query = query.where(Task.project_id == project_id)
    if status is not None:
        query = query.where(Task.status == status)
    if priority is not None:
        query = query.where(Task.priority == priority)
        
    query = query.order_by(Task.sort_order.asc(), Task.due_date.asc().nulls_last(), Task.id.asc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    # The models returned from selectinload need scalars().all()
    tasks = result.scalars().all()
    return tasks

@router.post("/", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Önce görevi veritabanına ekle
    db_task = Task(**task.model_dump(), user_id=current_user.id)
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)

    # 2. AI Kategorizasyon ve Süre/Proje Tahminini Arka Plana At
    try:
        proj_result = await db.execute(select(Project).filter(Project.user_id == current_user.id, Project.is_active == True))
        projects = proj_result.scalars().all()
        project_context = "\\n".join([f"- ID: {p.id}, İsim: {p.name}" for p in projects])

        tasks_result = await db.execute(select(Task).filter(Task.user_id == current_user.id, Task.status != "done"))
        active_tasks = tasks_result.scalars().all()
        tasks_context = "\\n".join([f"- {t.title} (Öncelik: {t.priority}, Bitiş: {t.due_date})" for t in active_tasks])

        task_text = f"{task.title} {task.description or ''}"
        
        # Asenkron arka plan görevine gönder
        background_tasks.add_task(
            background_categorize_task,
            task_id=db_task.id,
            task_text=task_text,
            project_context=project_context,
            tasks_context=tasks_context
        )
    except Exception as e:
        print(f"Background task dispatch error: {e}")

    # selectinload project again to return nested object instead of none
    query = select(Task).options(selectinload(Task.project)).where(Task.id == db_task.id)
    result = await db.execute(query)
    db_task_loaded = result.scalars().first()
    return db_task_loaded

@router.put("/reorder", response_model=dict)
async def reorder_tasks(
    reorder_data: TaskReorder,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    for item in reorder_data.items:
        query = select(Task).where(Task.id == item.id, Task.user_id == current_user.id)
        result = await db.execute(query)
        task = result.scalars().first()
        if task:
            task.sort_order = item.sort_order
    await db.commit()
    return {"status": "ok", "message": "Tasks reordered"}

@router.post("/ai-prioritize", response_model=dict)
async def ai_prioritize_tasks(
    req: AIPrioritizeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Bekleyen ana görevleri al
    query = select(Task).where(Task.user_id == current_user.id, Task.status != 'done', Task.parent_task_id == None)
    result = await db.execute(query)
    active_tasks = result.scalars().all()
    
    if not active_tasks:
         return {"status": "ok", "message": "No tasks to prioritize"}
         
    # 2. Gemini'ye mesaj ve görevleri gönderip yeni sıralamayı json list of IDs formatında iste
    tasks_context = "\\n".join([f"ID: {t.id} | Başlık: {t.title} | Öncelik: {t.priority}" for t in active_tasks])
    
    prompt = f"""
Kullanıcı mesajı: "{req.message}"
Mevcut görevler:
{tasks_context}

Kullanıcının mesajına göre bu görevleri yeniden önceliklendir. En acil olanı en başa al, sırasıyla diz. Eğer kullanıcı spesifik bir şeye odaklanmak istediğini söylüyorsa, o konudaki görevleri en başa taşı.
Lütfen sadece JSON formatında, yeni sıralamaya göre task ID'lerini içeren bir liste dön. 
Örnek çıktı formatı: [5, 2, 8, 1]
ÖNEMLİ: SADECE JSON ÇIKTISI VER. BAŞKA HİÇBİR YAZI, MESAJ VEYA MARKDOWN FORMATI (```json vs) YAZMA. SADECE ARRAY.
"""
    client = _get_gemini_client()
    try:
        response = await client.aio.models.generate_content(
            model='gemini-3.1-flash-lite-preview',
            contents=prompt,
        )
        await log_cost_awaitable(response, 'gemini-3.1-flash-lite-preview')
        text = response.text.replace("```json", "").replace("```", "").strip()
        import json
        ordered_ids = json.loads(text)
        
        # update sort_order in db
        for idx, task_id in enumerate(ordered_ids):
            task = next((t for t in active_tasks if t.id == task_id), None)
            if task:
                task.sort_order = idx
                
        await db.commit()
    except Exception as e:
        print(f"AI Prioritize error: {e}")
        return {"status": "error", "message": str(e)}

    return {"status": "ok"}

@router.post("/bulk", response_model=dict)
async def bulk_update_tasks(
    bulk_data: TaskBulkUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Task).where(Task.id.in_(bulk_data.task_ids), Task.user_id == current_user.id)
    result = await db.execute(query)
    tasks = result.scalars().all()
    for task in tasks:
        if bulk_data.status is not None:
            task.status = bulk_data.status
        if bulk_data.priority is not None:
            task.priority = bulk_data.priority
        if bulk_data.project_id is not None:
            task.project_id = bulk_data.project_id
            
        if bulk_data.status == "done" and task.status != "done":
            task.completed_at = datetime.now(timezone.utc)
        elif bulk_data.status != "done" and task.status == "done":
            task.completed_at = None

    await db.commit()
    return {"status": "ok", "message": f"{len(tasks)} tasks updated"}

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Task).options(selectinload(Task.project)).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(query)
    db_task = result.scalars().first()
    
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
        
    update_data = task_update.model_dump(exclude_unset=True)
    
    # Status => done yapıldığında zamanını kaydet
    if "status" in update_data and update_data["status"] == "done" and db_task.status != "done":
        db_task.completed_at = datetime.now(timezone.utc)
    # Done durumundan çıkarıldığında geri çek
    elif "status" in update_data and update_data["status"] != "done" and db_task.status == "done":
         db_task.completed_at = None

    for key, value in update_data.items():
        setattr(db_task, key, value)
        
    await db.commit()
    # Refresh logic using select to load relationship
    result_loaded = await db.execute(select(Task).options(selectinload(Task.project)).where(Task.id == task_id))
    db_task_refreshed = result_loaded.scalars().first()
    return db_task_refreshed

@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: int,
    status: str = Query(..., description="todo, in_progress, done"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Task).options(selectinload(Task.project)).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(query)
    db_task = result.scalars().first()
    
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
        
    db_task.status = status
    if status == "done":
        db_task.completed_at = datetime.now(timezone.utc)
    else:
        db_task.completed_at = None
        
    await db.commit()
    await db.refresh(db_task)
    return db_task

@router.post("/{task_id}/subtasks", response_model=TaskResponse)
async def create_subtask(
    task_id: int,
    subtask: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subtask.parent_task_id = task_id
    db_task = Task(**subtask.model_dump(), user_id=current_user.id)
    db.add(db_task)
    await db.commit()
    
    query = select(Task).options(selectinload(Task.project)).where(Task.id == db_task.id)
    result = await db.execute(query)
    return result.scalars().first()

@router.post("/{task_id}/ai-analysis", response_model=TaskResponse)
async def generate_task_ai_analysis(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Görevi ve alt görevlerini al
    query = select(Task).options(selectinload(Task.project)).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(query)
    db_task = result.scalars().first()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    subtasks_query = select(Task).where(Task.parent_task_id == task_id)
    subtasks_result = await db.execute(subtasks_query)
    subtasks = subtasks_result.scalars().all()
    
    done_count = sum(1 for st in subtasks if st.status == 'done')
    
    # 2. Gemini asenkron çağrısı
    client = _get_gemini_client()
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API not configured")

    prompt = f"""Şu görev hakkında kısa bir analiz ve yönlendirme yaz (3-4 satır, motivasyonel):
Görev: "{db_task.title}"
Açıklama: "{db_task.description or 'Yok'}"
Durum: {db_task.status}
Öncelik: {db_task.priority}
Alt görev sayısı: {len(subtasks)}, Tamamlanan: {done_count}
⚠️ Sadece analiz yaz, PLAN_START veya herhangi bir komut kodu EKLEME."""

    try:
        response = await client.aio.models.generate_content(
            model='gemini-3.1-flash-lite-preview',
            contents=prompt,
        )
        await log_cost_awaitable(response, 'gemini-3.1-flash-lite-preview')
        new_analysis = response.text

        # 3. Geçmişi güncelle
        history = list(db_task.ai_analysis_history) if db_task.ai_analysis_history else []
        if db_task.ai_analysis:
            history.append({
                "text": db_task.ai_analysis,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
        db_task.ai_analysis = new_analysis
        db_task.ai_analysis_history = history
        
        # SQL update için mutate attribute assign logic
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(db_task, "ai_analysis_history")
        
        await db.commit()
        await db.refresh(db_task)
        
        # Refresh via select to ensure project loads correctly if needed
        return db_task
    except Exception as e:
        print(f"Detail Analysis error: {e}")
        raise HTTPException(status_code=500, detail="Failed to run AI analysis")

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(query)
    db_task = result.scalars().first()
    
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    from sqlalchemy import update
    from app.models.calendar_event import CalendarEvent
    from app.models.timer_session import TimerSession
    from app.models.note import Note
    
    # 1. Clear FKs in related tables
    await db.execute(update(CalendarEvent).where(CalendarEvent.task_id == task_id).values(task_id=None))
    await db.execute(update(TimerSession).where(TimerSession.task_id == task_id).values(task_id=None))
    await db.execute(update(Note).where(Note.task_id == task_id).values(task_id=None))
    
    # 2. Delete subtasks
    sub_query = select(Task).where(Task.parent_task_id == task_id)
    sub_result = await db.execute(sub_query)
    subtasks = sub_result.scalars().all()
    for st in subtasks:
        await db.execute(update(CalendarEvent).where(CalendarEvent.task_id == st.id).values(task_id=None))
        await db.execute(update(TimerSession).where(TimerSession.task_id == st.id).values(task_id=None))
        await db.execute(update(Note).where(Note.task_id == st.id).values(task_id=None))
        await db.delete(st)

    # 3. Finally delete the task
    await db.delete(db_task)
    await db.commit()
    return {"status": "ok", "message": "Task deleted successfully"}
