import re
import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, timezone

from app.database import get_db
from app.models.task import Task
from app.models.project import Project
from app.models.note import Note
from app.schemas.task import TaskResponse
from app.services.gemini import generate_chat_response, breakdown_task_with_ai, get_dynamic_motivation
from app.ai.context import build_system_context
from app.ai.memory import optimize_context_tokens

logger = logging.getLogger("myworld.ai")

router = APIRouter()

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]

class ActionLog(BaseModel):
    action: str
    details: str
    success: bool

class ChatResponse(BaseModel):
    reply: str
    actions_executed: List[ActionLog] = []
    debug: Optional[Dict[str, Any]] = None


# ---- KOMUT KALIPLARI ----
NOTE_PATTERN = r"\[ACTION:ADD_NOTE\|([^\]]*)\]"
# Eski uyumluluk: tek task komutu
LEGACY_TASK_PATTERN = r"\[ACTION:ADD_TASK\|([^|\]]*)\|([^|\]]*)\|([^\]]*)\]"
# Yeni akıllı plan bloğu
PLAN_PATTERN = r"\[PLAN_START\]\s*(.*?)\s*\[PLAN_END\]"


async def _resolve_project_id(db: AsyncSession, project_name: str, user_id: int) -> Optional[int]:
    """Proje adını DB'deki ID ile eşleştirir."""
    if not project_name or project_name.lower() in ("null", "genel", "yok", ""):
        return None
    p_query = select(Project).where(
        Project.name.ilike(f"%{project_name}%"),
        Project.user_id == user_id
    )
    p_res = await db.execute(p_query)
    proj = p_res.scalars().first()
    return proj.id if proj else None


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    MOCK_USER_ID = 1
    actions_executed: List[ActionLog] = []
    debug_info: Dict[str, Any] = {}
    
    try:
        # 1. Bağlam Oluştur
        raw_context = await build_system_context(db, MOCK_USER_ID)
        context = optimize_context_tokens(raw_context)
        debug_info["context_length"] = len(context)
        
        # 2. AI Yanıtı Al
        ai_reply = generate_chat_response(request.messages, context=context)
        debug_info["raw_reply_length"] = len(ai_reply)
        
        logger.info(f"🤖 AI Raw Reply ({len(ai_reply)} chars)")
        
        # =============================================
        # 3. AKILLI PLAN KOMUTU [PLAN_START]...[PLAN_END]
        # =============================================
        plan_matches = list(re.finditer(PLAN_PATTERN, ai_reply, re.DOTALL))
        debug_info["plan_commands_found"] = len(plan_matches)
        
        for match in plan_matches:
            json_str = match.group(1).strip()
            try:
                plan_data = json.loads(json_str)
                
                project_name = plan_data.get("project", "")
                main_title = plan_data.get("title", "")
                priority = plan_data.get("priority", "medium").lower()
                description = plan_data.get("description", "")
                subtasks_data = plan_data.get("subtasks", [])
                raw_due_date = plan_data.get("due_date", None)
                
                if not main_title:
                    logger.warning("⚠️ Plan komutu boş başlık, atlanıyor")
                    continue
                
                # Due date parse
                due_date = None
                if raw_due_date and raw_due_date != "null" and str(raw_due_date).lower() != "none":
                    try:
                        due_date = datetime.fromisoformat(str(raw_due_date)).replace(tzinfo=timezone.utc)
                        logger.info(f"📅 Due date ayarlandı: {due_date}")
                    except (ValueError, TypeError) as de:
                        logger.warning(f"⚠️ Geçersiz due_date: {raw_due_date} - {de}")
                
                # Proje eşleştirme
                project_id = await _resolve_project_id(db, project_name, MOCK_USER_ID)
                
                valid_priorities = ['urgent', 'medium', 'low']
                final_priority = priority if priority in valid_priorities else 'medium'
                
                # ANA GÖREV oluştur
                main_task = Task(
                    user_id=MOCK_USER_ID,
                    project_id=project_id,
                    title=main_title,
                    description=description,
                    priority=final_priority,
                    status="todo",
                    due_date=due_date
                )
                db.add(main_task)
                await db.commit()
                await db.refresh(main_task)
                
                main_task_id = main_task.id
                logger.info(f"✅ Ana görev oluşturuldu: '{main_title}' (ID: {main_task_id})")
                
                actions_executed.append(ActionLog(
                    action="CREATE_PLAN",
                    details=f"📋 {main_title} → {project_name or 'Genel'} ({final_priority})",
                    success=True
                ))
                
                # ALT GÖREVLER oluştur
                for idx, st in enumerate(subtasks_data):
                    st_title = st.get("title", f"Adım {idx+1}")
                    st_desc = st.get("description", "")
                    st_minutes = st.get("estimated_minutes", 15)
                    
                    subtask = Task(
                        user_id=MOCK_USER_ID,
                        project_id=project_id,
                        parent_task_id=main_task_id,
                        title=st_title,
                        description=st_desc,
                        estimated_minutes=st_minutes if isinstance(st_minutes, int) else 15,
                        priority=final_priority,
                        status="todo",
                        sort_order=idx
                    )
                    db.add(subtask)
                
                await db.commit()
                
                logger.info(f"  ↳ {len(subtasks_data)} alt görev oluşturuldu")
                actions_executed.append(ActionLog(
                    action="ADD_SUBTASKS",
                    details=f"{len(subtasks_data)} alt görev → '{main_title}'",
                    success=True
                ))
                
            except json.JSONDecodeError as je:
                logger.error(f"❌ Plan JSON parse hatası: {je}")
                logger.error(f"   JSON String: {json_str[:200]}...")
                actions_executed.append(ActionLog(
                    action="CREATE_PLAN",
                    details=f"JSON parse hatası: {str(je)[:50]}",
                    success=False
                ))
        
        # =============================================
        # 4. ESKİ FORMAT DESTEĞİ: [ACTION:ADD_TASK|...]
        # =============================================
        if not plan_matches:  # Sadece PLAN yoksa eski formatı ara
            legacy_matches = list(re.finditer(LEGACY_TASK_PATTERN, ai_reply))
            debug_info["legacy_task_commands"] = len(legacy_matches)
            
            for match in legacy_matches:
                project_name = match.group(1).strip()
                task_title = match.group(2).strip()
                priority = match.group(3).strip().lower()
                
                if not task_title:
                    continue
                
                project_id = await _resolve_project_id(db, project_name, MOCK_USER_ID)
                valid_priorities = ['urgent', 'medium', 'low']
                final_priority = priority if priority in valid_priorities else 'medium'
                
                new_task = Task(
                    user_id=MOCK_USER_ID,
                    project_id=project_id,
                    title=task_title,
                    priority=final_priority,
                    status="todo"
                )
                db.add(new_task)
                await db.commit()
                await db.refresh(new_task)
                
                actions_executed.append(ActionLog(
                    action="ADD_TASK",
                    details=f"{task_title} → {project_name or 'Genel'}",
                    success=True
                ))
        
        # =============================================
        # 5. NOT KOMUTU: [ACTION:ADD_NOTE|...]
        # =============================================
        note_matches = list(re.finditer(NOTE_PATTERN, ai_reply))
        debug_info["note_commands_found"] = len(note_matches)
        
        for match in note_matches:
            note_content = match.group(1).strip()
            if not note_content:
                continue
            new_note = Note(user_id=MOCK_USER_ID, content=note_content, source="ai")
            db.add(new_note)
            await db.commit()
            actions_executed.append(ActionLog(
                action="ADD_NOTE",
                details=note_content[:80],
                success=True
            ))
        
        # 6. Tüm komut kodlarını metinden temizle
        clean_reply = ai_reply
        clean_reply = re.sub(PLAN_PATTERN, "", clean_reply, flags=re.DOTALL)
        clean_reply = re.sub(LEGACY_TASK_PATTERN, "", clean_reply)
        clean_reply = re.sub(NOTE_PATTERN, "", clean_reply)
        clean_reply = re.sub(r'\n{3,}', '\n\n', clean_reply).strip()
        
        debug_info["actions_total"] = len(actions_executed)
        
        return ChatResponse(
            reply=clean_reply,
            actions_executed=actions_executed,
            debug=debug_info
        )
    except Exception as e:
        logger.error(f"❌ AI Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


class BreakdownResponse(BaseModel):
    subtasks: List[TaskResponse]

@router.post("/breakdown/{task_id}", response_model=BreakdownResponse)
async def ai_breakdown_task(task_id: int, db: AsyncSession = Depends(get_db)):
    MOCK_USER_ID = 1
    query = select(Task).where(Task.id == task_id, Task.user_id == MOCK_USER_ID)
    result = await db.execute(query)
    parent_task = result.scalars().first()
    
    if not parent_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task_desc = parent_task.description or ""
    subtasks_data = breakdown_task_with_ai(parent_task.title, task_desc)
    
    created_subtasks = []
    for idx, st in enumerate(subtasks_data):
        new_task = Task(
            user_id=MOCK_USER_ID,
            project_id=parent_task.project_id,
            parent_task_id=parent_task.id,
            title=st.get("title", "Alt Görev"),
            description=st.get("description", ""),
            estimated_minutes=st.get("estimated_minutes", 15),
            priority=parent_task.priority,
            status="todo",
            sort_order=idx
        )
        db.add(new_task)
        created_subtasks.append(new_task)
        
    await db.commit()
    for t in created_subtasks:
        await db.refresh(t)
        
    return BreakdownResponse(subtasks=created_subtasks)


class MotivationResponse(BaseModel):
    message: str

@router.get("/motivation", response_model=MotivationResponse)
async def get_ai_motivation(db: AsyncSession = Depends(get_db)):
    MOCK_USER_ID = 1
    
    done_result = await db.execute(select(func.count(Task.id)).where(Task.user_id == MOCK_USER_ID, Task.status == "done"))
    pending_result = await db.execute(select(func.count(Task.id)).where(Task.user_id == MOCK_USER_ID, Task.status != "done"))
    
    completed_count = done_result.scalar() or 0
    pending_count = pending_result.scalar() or 0
    
    hour = datetime.now().hour
    if hour < 12:
        time_of_day = "Sabah"
    elif hour < 18:
        time_of_day = "Öğleden Sonra"
    elif hour < 22:
        time_of_day = "Akşam"
    else:
        time_of_day = "Gece Yarısı"
        
    msg = get_dynamic_motivation(time_of_day, completed_count, pending_count)
    return MotivationResponse(message=msg)
