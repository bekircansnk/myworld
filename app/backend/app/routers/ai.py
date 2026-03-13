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
from app.models.user import User
from app.models.calendar_event import CalendarEvent
from app.models.chat_session import ChatSession
from app.schemas.task import TaskResponse
from app.schemas.chat_session import ChatSessionCreate, ChatSessionResponse, ChatSessionListResponse
from app.services.gemini import generate_chat_response, breakdown_task_with_ai, get_dynamic_motivation
from app.ai.context import build_system_context
from app.ai.memory import optimize_context_tokens
from app.models.chat_message import ChatMessage

logger = logging.getLogger("myworld.ai")

router = APIRouter()

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    session_id: Optional[int] = None

class ActionLog(BaseModel):
    action: str
    details: str
    success: bool
    payload: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
    actions_executed: List[ActionLog] = []
    debug: Optional[Dict[str, Any]] = None
    tone: Optional[str] = None
    session_id: Optional[int] = None

# ---- KOMUT KALIPLARI ----
NOTE_PATTERN = r"\[ACTION:ADD_NOTE\|([^\]]*)\]"
LEGACY_TASK_PATTERN = r"\[ACTION:ADD_TASK\|([^|\]]*)\|([^|\]]*)\|([^\]]*)\]"
PLAN_PATTERN = r"\[PLAN_START\]\s*(.*?)\s*\[PLAN_END\]"
EVENT_PATTERN = r"\[ACTION:ADD_EVENT\|([^|\]]*)\|([^|\]]*)\|([^|\]]*)(?:\|([^\]]*))?\]"
TONE_PATTERN = r"\[TONE:([^\]]*)\]"


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
    # Cross-reference tracker: aynı sohbette oluşturulan öğeleri bağlamak için
    created_items: Dict[str, list] = {"tasks": [], "notes": [], "events": []}
    
    try:
        # 0. Session Management
        session_id = request.session_id
        current_session: Optional[ChatSession] = None
        
        if session_id:
            # Load existing session
            sess_q = select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == MOCK_USER_ID)
            sess_r = await db.execute(sess_q)
            current_session = sess_r.scalars().first()
        
        if not current_session:
            # Create new session
            current_session = ChatSession(
                user_id=MOCK_USER_ID,
                title=None,  # Will be set after first AI response
                ai_categories=["genel"]
            )
            db.add(current_session)
            await db.flush()  # Get the ID
            session_id = current_session.id
            debug_info["new_session_created"] = session_id
        
        # 1. Bağlam Oluştur
        raw_context = await build_system_context(db, MOCK_USER_ID)
        context = optimize_context_tokens(raw_context)
        debug_info["context_length"] = len(context)
        debug_info["session_id"] = session_id
        
        # 2. AI Yanıtı Al
        last_msg = request.messages[-1].get("content", "").lower()
        is_day_planning = "günümü planla" in last_msg or "günü planla" in last_msg
        
        # Save user message with session
        user_content = request.messages[-1].get("content", "")
        user_msg_db = ChatMessage(
            user_id=MOCK_USER_ID,
            session_id=session_id,
            role="user",
            content=user_content
        )
        db.add(user_msg_db)
        
        ai_reply = generate_chat_response(request.messages, context=context, is_day_planning=is_day_planning)
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
                
                # --- DUPLICATE GUARD ---
                existing_task = await db.execute(
                    select(Task).where(
                        Task.user_id == MOCK_USER_ID,
                        Task.title == main_title,
                        Task.status != "done"
                    )
                )
                if existing_task.scalars().first():
                    logger.info(f"⏭️ Mükerrer görev atlandı: {main_title}")
                    actions_executed.append(ActionLog(
                        action="DUPLICATE_SKIPPED",
                        details=f"'{main_title}' zaten aktif",
                        success=False
                    ))
                    continue
                # -----------------------
                
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
                created_items["tasks"].append(new_task)
                
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
                
            # --- DUPLICATE GUARD ---
            existing_note = await db.execute(
                select(Note).where(
                    Note.user_id == MOCK_USER_ID,
                    Note.content == note_content
                )
            )
            if existing_note.scalars().first():
                logger.info(f"⏭️ Mükerrer not atlandı")
                actions_executed.append(ActionLog(
                    action="DUPLICATE_SKIPPED",
                    details=f"Aynı içerikli not zaten var",
                    success=False
                ))
                continue
            # -----------------------
            
            new_note = Note(user_id=MOCK_USER_ID, content=note_content, source="ai")
            db.add(new_note)
            await db.commit()
            await db.refresh(new_note)
            created_items["notes"].append(new_note)
            actions_executed.append(ActionLog(
                action="ADD_NOTE",
                details=note_content[:80],
                success=True
            ))
            
        # =============================================
        # 5.5 TAKVİM ETKİNLİĞİ: [ACTION:ADD_EVENT|Title|DateIso|Minutes]
        # =============================================
        event_matches = list(re.finditer(EVENT_PATTERN, ai_reply))
        debug_info["event_commands_found"] = len(event_matches)
        
        for match in event_matches:
            title = match.group(1).strip()
            raw_start = match.group(2).strip()
            raw_mins = match.group(3).strip()
            raw_task_id = match.group(4).strip() if match.group(4) else None
            
            task_id_val = None
            if raw_task_id and raw_task_id.isdigit():
                task_id_val = int(raw_task_id)
            
            if not title:
                continue
                
            try:
                # ISO'dan datetime'a çevir, UTC'ye sabitle
                start_dt = datetime.fromisoformat(raw_start)
                if start_dt.tzinfo is None:
                    start_dt = start_dt.replace(tzinfo=timezone.utc)
                
                # Mins'i parse et, bitiş saatini hesapla
                from datetime import timedelta
                mins = int(raw_mins)
                end_dt = start_dt + timedelta(minutes=mins)
                
                # --- DUPLICATE GUARD ---
                existing_event = await db.execute(
                    select(CalendarEvent).where(
                        CalendarEvent.user_id == MOCK_USER_ID,
                        CalendarEvent.title == title,
                        CalendarEvent.start_time >= start_dt - timedelta(minutes=30),
                        CalendarEvent.start_time <= start_dt + timedelta(minutes=30)
                    )
                )
                if existing_event.scalars().first():
                    logger.info(f"⏭️ Mükerrer takvim etkinliği atlandı: {title}")
                    actions_executed.append(ActionLog(
                        action="DUPLICATE_SKIPPED",
                        details=f"'{title}' zaten takvimde var",
                        success=False
                    ))
                    continue
                # -----------------------
                
                new_event = CalendarEvent(
                    user_id=MOCK_USER_ID,
                    title=title,
                    start_time=start_dt,
                    end_time=end_dt,
                    event_type="ai_planned",
                    task_id=task_id_val
                )
                db.add(new_event)
                await db.commit()
                await db.refresh(new_event)
                created_items["events"].append(new_event)
                
                actions_executed.append(ActionLog(
                    action="ADD_EVENT",
                    details=f"{title} ({mins}dk)",
                    success=True,
                    payload={
                        "id": f"ai_{new_event.id or int(start_dt.timestamp())}",
                        "title": title,
                        "date": start_dt.strftime('%Y-%m-%d'),
                        "startTime": start_dt.strftime('%H:%M'),
                        "endTime": end_dt.strftime('%H:%M'),
                        "allDay": False,
                        "color": "blue",
                        "category": "task",
                        "taskId": task_id_val
                    }
                ))
            except Exception as e:
                logger.error(f"❌ Event ekleme hatası: {e}")
                actions_executed.append(ActionLog(
                    action="ADD_EVENT",
                    details=f"Hata: {str(e)[:50]}",
                    success=False
                ))
        
        # 5. TONE (RUH HALİ) ALGILAMA
        tone_match = re.search(TONE_PATTERN, ai_reply)
        detected_tone = tone_match.group(1).strip() if tone_match else None

        # =============================================
        # 5.5 CROSS-REFERENCE: Oluşturulan öğeleri bağla
        # =============================================
        try:
            # Not'ları görevlere bağla
            if created_items["notes"] and created_items["tasks"]:
                for note in created_items["notes"]:
                    note.task_id = created_items["tasks"][0].id
                logger.info(f"🔗 {len(created_items['notes'])} not ↔ görev bağlandı")
            
            # Etkinlikleri notlara bağla
            if created_items["events"] and created_items["notes"]:
                for event in created_items["events"]:
                    if not event.note_id:
                        event.note_id = created_items["notes"][0].id
                logger.info(f"🔗 {len(created_items['events'])} etkinlik ↔ not bağlandı")
            
            if created_items["notes"] or created_items["events"]:
                await db.commit()
                debug_info["cross_refs_linked"] = True
        except Exception as xref_err:
            logger.warning(f"⚠️ Cross-reference bağlama hatası: {xref_err}")
            debug_info["cross_ref_error"] = str(xref_err)

        # 6. Tüm komut kodlarını metinden temizle
        clean_reply = ai_reply
        clean_reply = re.sub(PLAN_PATTERN, "", clean_reply, flags=re.DOTALL)
        clean_reply = re.sub(LEGACY_TASK_PATTERN, "", clean_reply)
        clean_reply = re.sub(NOTE_PATTERN, "", clean_reply)
        clean_reply = re.sub(EVENT_PATTERN, "", clean_reply)
        clean_reply = re.sub(TONE_PATTERN, "", clean_reply)
        clean_reply = re.sub(r'\n{3,}', '\n\n', clean_reply).strip()
        
        debug_info["actions_total"] = len(actions_executed)
        if detected_tone:
            debug_info["tone"] = detected_tone
            actions_executed.append(ActionLog(action="DETECT_TONE", details=detected_tone, success=True))
        
        # Save AI reply with session
        ai_msg_db = ChatMessage(
            user_id=MOCK_USER_ID,
            session_id=session_id,
            role="ai",
            content=clean_reply,
            actions=[a.dict() for a in actions_executed]
        )
        db.add(ai_msg_db)
        
        # Update session metadata
        if current_session:
            current_session.last_message_preview = clean_reply[:200] if clean_reply else None
            current_session.last_user_message = user_content[:200] if user_content else None
            current_session.message_count = (current_session.message_count or 0) + 2  # user + ai
            current_session.updated_at = datetime.now(timezone.utc)
            
            # Auto-generate title from first message
            if not current_session.title and user_content:
                current_session.title = user_content[:80].strip()
            
            # Auto-categorize based on actions
            action_types = {a.action for a in actions_executed if a.success}
            new_categories = set(current_session.ai_categories or [])
            if action_types & {"CREATE_PLAN", "ADD_TASK", "ADD_SUBTASKS"}:
                new_categories.add("gorev")
            if "ADD_EVENT" in action_types:
                new_categories.add("takvim")
            if "ADD_NOTE" in action_types:
                new_categories.add("not")
                
            if len(new_categories) > 1:
                new_categories.discard("genel")
            
            # Atama sırasında listenin geçerli bir JSON array formatında olduğundan emin ol
            current_session.ai_categories = sorted(list(new_categories))
            # else stays "genel"
        
        await db.commit()
        
        return ChatResponse(
            reply=clean_reply,
            session_id=session_id,
            actions_executed=actions_executed,
            debug=debug_info,
            tone=detected_tone
        )
    except Exception as e:
        logger.error(f"❌ AI Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


class ChatHistoryResponse(BaseModel):
    id: int
    role: str
    content: str
    actions: Optional[List[dict]]
    created_at: datetime

@router.get("/chat/history", response_model=List[ChatHistoryResponse])
async def get_chat_history(limit: int = 50, db: AsyncSession = Depends(get_db)):
    MOCK_USER_ID = 1
    query = select(ChatMessage).where(ChatMessage.user_id == MOCK_USER_ID).order_by(ChatMessage.created_at.desc()).limit(limit)
    result = await db.execute(query)
    messages = result.scalars().all()
    
    # Return in chronological order (latest 50 messages)
    return [
        ChatHistoryResponse(
            id=m.id,
            role=m.role,
            content=m.content,
            actions=m.actions,
            created_at=m.created_at
        )
        for m in reversed(messages)
    ]


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

class CostResponse(BaseModel):
    input_tokens: int
    output_tokens: int
    total_usd: float

@router.get("/cost", response_model=CostResponse)
async def get_ai_cost(db: AsyncSession = Depends(get_db)):
    MOCK_USER_ID = 1
    query = select(User).where(User.id == MOCK_USER_ID)
    result = await db.execute(query)
    user = result.scalars().first()
    
    cost_data = {"input_tokens": 0, "output_tokens": 0, "total_usd": 0.0}
    
    if user and user.settings and isinstance(user.settings, dict):
        cost_data = user.settings.get("api_cost", cost_data)
        
    return CostResponse(**cost_data)


# =============================================
# SESSION MANAGEMENT ENDPOINTS
# =============================================

@router.post("/chat/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    request: ChatSessionCreate = None,
    db: AsyncSession = Depends(get_db)
):
    """Create a new chat session."""
    MOCK_USER_ID = 1
    session = ChatSession(
        user_id=MOCK_USER_ID,
        title=request.title if request else None,
        ai_categories=["genel"]
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/chat/sessions", response_model=ChatSessionListResponse)
async def list_chat_sessions(
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """List chat sessions with optional category filter."""
    MOCK_USER_ID = 1
    query = select(ChatSession).where(
        ChatSession.user_id == MOCK_USER_ID,
        ChatSession.is_active == True
    )
    
    if category and category != "tümü":
        from sqlalchemy import cast, String
        query = query.where(cast(ChatSession.ai_categories, String).like(f'%"{category}"%'))
    
    if search:
        query = query.where(
            ChatSession.title.ilike(f"%{search}%") |
            ChatSession.last_user_message.ilike(f"%{search}%")
        )
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0
    
    # Fetch with pagination
    query = query.order_by(ChatSession.updated_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    sessions = result.scalars().all()
    
    return ChatSessionListResponse(sessions=sessions, total=total)


@router.get("/chat/sessions/{session_id}/messages", response_model=List[ChatHistoryResponse])
async def get_session_messages(
    session_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get all messages for a specific session."""
    MOCK_USER_ID = 1
    query = select(ChatMessage).where(
        ChatMessage.user_id == MOCK_USER_ID,
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc())
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    return [
        ChatHistoryResponse(
            id=m.id,
            role=m.role,
            content=m.content,
            actions=m.actions,
            created_at=m.created_at
        )
        for m in messages
    ]
