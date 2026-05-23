from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.task import Task
from app.models.project import Project
from app.models.task_comment import TaskComment
from app.schemas.task_comment import TaskCommentCreate, TaskCommentResponse
from app.routers.websocket import manager
from app.services.webhook_service import WebhookService

router = APIRouter(prefix="/api", tags=["Task Comments"])

@router.post("/tasks/{task_id}/comments", response_model=TaskCommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    task_id: int,
    comment_in: TaskCommentCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Görevi doğrula
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar()
    if not task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı.")

    # Yorum oluştur
    comment = TaskComment(
        task_id=task_id,
        user_id=current_user.id,
        content=comment_in.content
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)

    # User ilişkisini yükle
    result = await db.execute(
        select(TaskComment)
        .options(selectinload(TaskComment.user))
        .where(TaskComment.id == comment.id)
    )
    comment_with_user = result.scalar()

    # WebSocket ile anlık bildirim yap
    ws_payload = {
        "type": "NEW_COMMENT",
        "data": {
            "id": comment_with_user.id,
            "task_id": comment_with_user.task_id,
            "user_id": comment_with_user.user_id,
            "content": comment_with_user.content,
            "created_at": comment_with_user.created_at.isoformat() if comment_with_user.created_at else None,
            "user": {
                "id": current_user.id,
                "username": current_user.username,
                "name": current_user.name,
                "avatar_url": current_user.avatar_url
            }
        }
    }
    background_tasks.add_task(manager.broadcast, ws_payload)

    # Discord & Slack Webhook bildirimlerini tetikle
    if task.project_id:
        proj_result = await db.execute(select(Project).where(Project.id == task.project_id))
        project = proj_result.scalar()
        if project:
            background_tasks.add_task(
                WebhookService.send_task_comment_added,
                task,
                comment_with_user.content,
                project,
                current_user.name
            )

    return comment_with_user

@router.get("/tasks/{task_id}/comments", response_model=List[TaskCommentResponse])
async def get_comments(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Görevi doğrula
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar()
    if not task:
        raise HTTPException(status_code=404, detail="Görev bulunamadı.")

    # Yorumları getir (User ilişkisi ile birlikte)
    result = await db.execute(
        select(TaskComment)
        .options(selectinload(TaskComment.user))
        .where(TaskComment.task_id == task_id)
        .order_by(TaskComment.id.asc())
    )
    comments = result.scalars().all()
    return comments

@router.delete("/tasks/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(TaskComment)
        .where(TaskComment.id == comment_id)
    )
    comment = result.scalar()
    if not comment:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı.")

    # Yalnızca yorum sahibi veya firma yöneticisi silebilir
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu yorumu silme yetkiniz yok.")

    task_id = comment.task_id
    await db.delete(comment)
    await db.commit()

    # WebSocket ile anlık bildirim yap
    ws_payload = {
        "type": "DELETE_COMMENT",
        "data": {
            "id": comment_id,
            "task_id": task_id
        }
    }
    background_tasks.add_task(manager.broadcast, ws_payload)

    return None
