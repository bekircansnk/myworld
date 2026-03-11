from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models.task import Task
from app.models.project import Project
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskReorder, TaskBulkUpdate
from app.services.gemini import categorize_task, _get_gemini_client

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Mock User ID for local dev
MOCK_USER_ID = 1

@router.get("/", response_model=List[TaskResponse])
async def read_tasks(
    db: AsyncSession = Depends(get_db),
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    query = select(Task).options(selectinload(Task.project)).where(Task.user_id == MOCK_USER_ID)
    
    # Filtreleme
    if project_id is not None:
        query = query.where(Task.project_id == project_id)
    if status is not None:
        query = query.where(Task.status == status)
    if priority is not None:
        query = query.where(Task.priority == priority)
        
    query = query.order_by(Task.sort_order.asc(), Task.due_date.asc().nulls_last(), Task.id.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    # The models returned from selectinload need scalars().all()
    tasks = result.scalars().all()
    return tasks

@router.post("/", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    db: AsyncSession = Depends(get_db)
):
    # AI Kategorizasyon ve Süre/Proje Tahmini
    try:
        proj_result = await db.execute(select(Project).filter(Project.user_id == MOCK_USER_ID, Project.is_active == True))
        projects = proj_result.scalars().all()
        project_context = "\\n".join([f"- ID: {p.id}, İsim: {p.name}" for p in projects])

        tasks_result = await db.execute(select(Task).filter(Task.user_id == MOCK_USER_ID, Task.status != "done"))
        active_tasks = tasks_result.scalars().all()
        tasks_context = "\\n".join([f"- {t.title} (Öncelik: {t.priority}, Bitiş: {t.due_date})" for t in active_tasks])

        task_text = f"{task.title} {task.description or ''}"
        ai_data = categorize_task(task_text, project_context, tasks_context)

        if ai_data:
            if "project_id" in ai_data and ai_data["project_id"] is not None and not task.project_id:
                task.project_id = ai_data["project_id"]
            
            if "priority" in ai_data and task.priority == "normal":
                ai_prio = ai_data["priority"]
                task.priority = "normal" if ai_prio == "medium" else ai_prio

            if "estimated_minutes" in ai_data and isinstance(ai_data["estimated_minutes"], int) and not task.estimated_minutes:
                task.estimated_minutes = ai_data["estimated_minutes"]
                
            if "suggested_due_date" in ai_data and ai_data["suggested_due_date"] and not task.due_date:
                from dateutil import parser
                try:
                    task.due_date = parser.isoparse(ai_data["suggested_due_date"])
                except Exception as e:
                    print(f"Due date parsing error: {e}")
                
    except Exception as e:
        print(f"AI Task Categorization error: {e}")

    db_task = Task(**task.model_dump(), user_id=MOCK_USER_ID)
    db.add(db_task)
    await db.commit()
    # selectinload project again to return nested object instead of none
    query = select(Task).options(selectinload(Task.project)).where(Task.id == db_task.id)
    result = await db.execute(query)
    db_task_loaded = result.scalars().first()
    return db_task_loaded

@router.put("/reorder", response_model=dict)
async def reorder_tasks(
    reorder_data: TaskReorder,
    db: AsyncSession = Depends(get_db)
):
    for item in reorder_data.items:
        query = select(Task).where(Task.id == item.id, Task.user_id == MOCK_USER_ID)
        result = await db.execute(query)
        task = result.scalars().first()
        if task:
            task.sort_order = item.sort_order
    await db.commit()
    return {"status": "ok", "message": "Tasks reordered"}

@router.post("/bulk", response_model=dict)
async def bulk_update_tasks(
    bulk_data: TaskBulkUpdate,
    db: AsyncSession = Depends(get_db)
):
    query = select(Task).where(Task.id.in_(bulk_data.task_ids), Task.user_id == MOCK_USER_ID)
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
    db: AsyncSession = Depends(get_db)
):
    query = select(Task).options(selectinload(Task.project)).where(Task.id == task_id, Task.user_id == MOCK_USER_ID)
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
    db: AsyncSession = Depends(get_db)
):
    query = select(Task).options(selectinload(Task.project)).where(Task.id == task_id, Task.user_id == MOCK_USER_ID)
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
    db: AsyncSession = Depends(get_db)
):
    subtask.parent_task_id = task_id
    db_task = Task(**subtask.model_dump(), user_id=MOCK_USER_ID)
    db.add(db_task)
    await db.commit()
    
    query = select(Task).options(selectinload(Task.project)).where(Task.id == db_task.id)
    result = await db.execute(query)
    return result.scalars().first()

@router.post("/{task_id}/ai-analysis", response_model=TaskResponse)
async def generate_task_ai_analysis(
    task_id: int,
    db: AsyncSession = Depends(get_db)
):
    # 1. Görevi ve alt görevlerini al
    query = select(Task).options(selectinload(Task.project)).where(Task.id == task_id, Task.user_id == MOCK_USER_ID)
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
    db: AsyncSession = Depends(get_db)
):
    query = select(Task).where(Task.id == task_id, Task.user_id == MOCK_USER_ID)
    result = await db.execute(query)
    db_task = result.scalars().first()
    
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
        
    await db.delete(db_task)
    await db.commit()
    return {"status": "ok", "message": "Task deleted successfully"}
