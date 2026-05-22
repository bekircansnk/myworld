import os
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete, and_, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel

from app.database import get_db
from app.models.task import Task
from app.models.project import Project
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskReorder, TaskBulkUpdate
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_company_permission
from app.models.user import User
from app.services.gemini import _get_gemini_client, log_cost_awaitable

router = APIRouter(prefix="/tasks", tags=["tasks"])

class AIPrioritizeRequest(BaseModel):
    message: str

@router.get("", response_model=List[TaskResponse])
async def read_tasks(
    request: Request,
    db: AsyncSession = Depends(get_db),
    project_id: Optional[int] = Query(None),
    status: Optional[str] = None,
    current_user: User = Depends(require_company_permission("tasks", "view"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    # Firma seçildiyse tüm firmanın görevlerini göster, seçilmediyse kullanıcının görevleri
    if effective_project_id:
        query = select(Task).options(selectinload(Task.project)).where(Task.project_id == effective_project_id, (Task.is_deleted == False) | (Task.is_deleted == None))
    else:
        from app.models.user_company_access import UserCompanyAccess
        # Kullanıcının erişebildiği proje ID'lerini al
        access_query = select(UserCompanyAccess.project_id).where(UserCompanyAccess.user_id == current_user.id)
        
        # Filtre: (Kendi görevi VE (Projesiz VEYA Erişim Yetkisi Olan Proje))
        query = select(Task).options(selectinload(Task.project)).where(
            Task.user_id == current_user.id,
            or_(
                Task.project_id == None,
                Task.project_id.in_(access_query)
            ),
            (Task.is_deleted == False) | (Task.is_deleted == None)
        )
    
    if status:
        query = query.where(Task.status == status)
        
    query = query.order_by(Task.sort_order.asc(), Task.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/reorder", response_model=dict)
async def reorder_tasks(
    reorder_data: TaskReorder,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("tasks", "edit"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    for item in reorder_data.items:
        if current_user.role == "super_admin":
            query = select(Task).where(Task.id == item.id)
        elif effective_project_id:
            query = select(Task).where(Task.id == item.id, Task.project_id == effective_project_id)
        else:
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
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("tasks", "edit"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    # 1. Bekleyen ana görevleri al
    if current_user.role == "super_admin":
        query = select(Task).where(Task.status != 'done', Task.parent_task_id == None)
    elif effective_project_id:
        query = select(Task).where(Task.project_id == effective_project_id, Task.status != 'done', Task.parent_task_id == None)
    else:
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
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("tasks", "edit"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    if current_user.role == "super_admin":
        query = select(Task).where(Task.id.in_(bulk_data.task_ids))
    elif effective_project_id:
        query = select(Task).where(Task.id.in_(bulk_data.task_ids), Task.project_id == effective_project_id)
    else:
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
            
    await db.commit()
    return {"status": "ok", "message": f"{len(tasks)} tasks updated"}

@router.post("", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    background_tasks: BackgroundTasks,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("tasks", "edit"))
):
    try:
        # 1. Önce görevi veritabanına ekle
        db_task = Task(**task.model_dump(), user_id=current_user.id)
        db.add(db_task)
        await db.commit()
        await db.refresh(db_task)

        # 2. AI Kategorizasyon ve Süre/Proje Tahminini Arka Plana At
        try:
            # Kullanıcının erişebildiği TÜM aktif firmaları al (AI context için)
            if current_user.role == "super_admin":
                proj_query = select(Project).filter(Project.is_active == True)
            else:
                from app.models.user_company_access import UserCompanyAccess
                proj_query = select(Project).join(UserCompanyAccess).filter(
                    UserCompanyAccess.user_id == current_user.id,
                    Project.is_active == True
                )
                
            proj_result = await db.execute(proj_query)
            projects = proj_result.scalars().all()
            project_context = "\\n".join([f"- ID: {p.id}, İsim: {p.name}" for p in projects])

            # Kullanıcının bekleyen görevlerini al
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
    except Exception as e:
        from app.models.activity_log import ActivityLog
        import traceback
        error_log = ActivityLog(
            user_id=current_user.id,
            action="task_create_error",
            module="tasks",
            details={"error": str(e), "trace": traceback.format_exc(), "payload": task.model_dump()}
        )
        db.add(error_log)
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Görev eklenirken hata oluştu: {str(e)}")

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("tasks", "edit"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    # Super admin değilse, ya kendi görevi olmalı ya da yetkili olduğu firmanın görevi olmalı
    if current_user.role == "super_admin":
        query = select(Task).options(selectinload(Task.project)).where(Task.id == task_id)
    elif effective_project_id:
        query = select(Task).options(selectinload(Task.project)).where(Task.id == task_id, Task.project_id == effective_project_id)
    else:
        query = select(Task).options(selectinload(Task.project)).where(Task.id == task_id, Task.user_id == current_user.id)
        
    result = await db.execute(query)
    db_task = result.scalars().first()
    
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found or permission denied")
        
    update_data = task_update.model_dump(exclude_unset=True)
    
    # Status => done yapıldığında zamanını kaydet
    if "status" in update_data and update_data["status"] == "done" and db_task.status != "done":
        db_task.completed_at = datetime.now(timezone.utc)
    # Done durumundan çıkarıldığında geri çek
    elif "status" in update_data and update_data["status"] != "done" and db_task.status == "done":
         db_task.completed_at = None

    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    # JSON alanlarında değişiklik tespiti için flag_modified
    if "task_photos" in update_data:
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(db_task, "task_photos")
        
    await db.commit()
    # Refresh via select
    result_loaded = await db.execute(select(Task).options(selectinload(Task.project)).where(Task.id == task_id))
    db_task_refreshed = result_loaded.scalars().first()
    return db_task_refreshed

@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: int,
    request: Request,
    status: str = Query(..., description="todo, in_progress, done"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("tasks", "edit"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    if current_user.role == "super_admin":
        query = select(Task).options(selectinload(Task.project)).where(Task.id == task_id)
    elif effective_project_id:
        query = select(Task).options(selectinload(Task.project)).where(Task.id == task_id, Task.project_id == effective_project_id)
    else:
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
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("tasks", "edit"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    # Parent task access check
    if current_user.role == "super_admin":
        query = select(Task).where(Task.id == task_id)
    elif effective_project_id:
        query = select(Task).where(Task.id == task_id, Task.project_id == effective_project_id)
    else:
        query = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
        
    result = await db.execute(query)
    parent_task = result.scalars().first()
    if not parent_task:
        raise HTTPException(status_code=404, detail="Parent task not found")
        
    db_task_data = subtask.model_dump()
    if not db_task_data.get("project_id") and parent_task.project_id:
        db_task_data["project_id"] = parent_task.project_id
    db_task_data["parent_task_id"] = task_id

    db_task = Task(**db_task_data, user_id=current_user.id)
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    
    query = select(Task).options(selectinload(Task.project)).where(Task.id == db_task.id)
    result = await db.execute(query)
    return result.scalars().first()

@router.post("/{task_id}/ai-analysis", response_model=TaskResponse)
async def generate_task_ai_analysis(
    task_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("tasks", "edit"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    if current_user.role == "super_admin":
        query = select(Task).options(selectinload(Task.project)).where(Task.id == task_id)
    elif effective_project_id:
        query = select(Task).options(selectinload(Task.project)).where(Task.id == task_id, Task.project_id == effective_project_id)
    else:
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
Açıklama: "{db_task.description or 'Açıklama yok'}"
Öncelik: {db_task.priority}
Durum: {db_task.status}
Alt Görevler: {len(subtasks)} adet ({done_count} tamamlandı)

⚠️ Sadece analiz yaz."""

    try:
        response = await client.aio.models.generate_content(
            model='gemini-3.1-flash-lite-preview',
            contents=prompt,
        )
        await log_cost_awaitable(response, 'gemini-3.1-flash-lite-preview')
        new_analysis = response.text

        history = list(db_task.ai_analysis_history) if db_task.ai_analysis_history else []
        if db_task.ai_analysis:
            history.append({
                "text": db_task.ai_analysis,
                "created_at": datetime.now(timezone.utc).isoformat()
            })

        db_task.ai_analysis = new_analysis
        db_task.ai_analysis_history = history
        
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(db_task, "ai_analysis_history")
        
        await db.commit()
        await db.refresh(db_task)
        return db_task
    except Exception as e:
        print(f"AI Analysis error: {e}")
        raise HTTPException(status_code=500, detail="Failed to run AI analysis")

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_company_permission("tasks", "delete"))
):
    effective_project_id = getattr(request.state, "project_id", None)
    
    if current_user.role == "super_admin":
        query = select(Task).where(Task.id == task_id)
    elif effective_project_id:
        query = select(Task).where(Task.id == task_id, Task.project_id == effective_project_id)
    else:
        query = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
        
    result = await db.execute(query)
    db_task = result.scalars().first()
    
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
        
    db_task.is_deleted = True
    await db.commit()
    return {"status": "ok"}

async def background_categorize_task(task_id: int, task_text: str, project_context: str, tasks_context: str):
    from app.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        query = select(Task).where(Task.id == task_id)
        result = await db.execute(query)
        db_task = result.scalars().first()
        if not db_task: return

        prompt = f"""Bir görev yöneticisi asistanısın. Şu görevi analiz et:
"{task_text}"

Bağlam - Mevcut Projeler (ID ve İsim):
{project_context}

Bağlam - Kullanıcının Diğer Görevleri:
{tasks_context}

Görevi şu açılardan değerlendir:
1. Hangi projeye (ID) ait olabilir? (Eğer listedeki bir projeye çok yakınsa ID'sini ver, değilse null bırak)
2. Kategori nedir? (Örn: Toplantı, Geliştirme, Tasarım, Kişisel, Operasyon)
3. Yapay zeka gözüyle önerilen öncelik nedir? (urgent, normal, low)

SADECE JSON döndür:
{{
  "project_id": ID veya null,
  "ai_category": "Kategori",
  "ai_suggested_priority": "urgent/normal/low"
}}
"""
        client = _get_gemini_client()
        if not client: return
        
        try:
            response = await client.aio.models.generate_content(
                model='gemini-3.1-flash-lite-preview',
                contents=prompt,
            )
            await log_cost_awaitable(response, 'gemini-3.1-flash-lite-preview')
            import json
            import re
            text = response.text
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                ai_data = json.loads(json_match.group(0))
                modified = False
                
                if "ai_category" in ai_data:
                    db_task.ai_category = ai_data["ai_category"]
                    modified = True
                if "ai_suggested_priority" in ai_data:
                    db_task.ai_suggested_priority = ai_data["ai_suggested_priority"]
                    modified = True
                if "project_id" in ai_data and ai_data["project_id"] is not None and not db_task.project_id:
                    db_task.project_id = ai_data["project_id"]
                    modified = True
                
                if modified:
                    await db.commit()
        except Exception as e:
            print(f"Categorization error: {e}")
