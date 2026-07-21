"""add indexes to foreign keys

Revision ID: 049d921b3fff
Revises: f8199a6848b6
Create Date: 2026-07-21 12:55:08.933155

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '049d921b3fff'
down_revision: Union[str, Sequence[str], None] = 'f8199a6848b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add indexes to tasks table
    op.create_index(op.f('ix_tasks_user_id'), 'tasks', ['user_id'], unique=False)
    op.create_index(op.f('ix_tasks_project_id'), 'tasks', ['project_id'], unique=False)
    op.create_index(op.f('ix_tasks_parent_task_id'), 'tasks', ['parent_task_id'], unique=False)

    # Add indexes to calendar_events table
    op.create_index(op.f('ix_calendar_events_user_id'), 'calendar_events', ['user_id'], unique=False)
    op.create_index(op.f('ix_calendar_events_task_id'), 'calendar_events', ['task_id'], unique=False)
    op.create_index(op.f('ix_calendar_events_note_id'), 'calendar_events', ['note_id'], unique=False)
    op.create_index(op.f('ix_calendar_events_project_id'), 'calendar_events', ['project_id'], unique=False)

    # Add indexes to notes table
    op.create_index(op.f('ix_notes_user_id'), 'notes', ['user_id'], unique=False)
    op.create_index(op.f('ix_notes_project_id'), 'notes', ['project_id'], unique=False)
    op.create_index(op.f('ix_notes_task_id'), 'notes', ['task_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes from notes table
    op.drop_index(op.f('ix_notes_task_id'), table_name='notes')
    op.drop_index(op.f('ix_notes_project_id'), table_name='notes')
    op.drop_index(op.f('ix_notes_user_id'), table_name='notes')

    # Drop indexes from calendar_events table
    op.drop_index(op.f('ix_calendar_events_project_id'), table_name='calendar_events')
    op.drop_index(op.f('ix_calendar_events_note_id'), table_name='calendar_events')
    op.drop_index(op.f('ix_calendar_events_task_id'), table_name='calendar_events')
    op.drop_index(op.f('ix_calendar_events_user_id'), table_name='calendar_events')

    # Drop indexes from tasks table
    op.drop_index(op.f('ix_tasks_parent_task_id'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_project_id'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_user_id'), table_name='tasks')
