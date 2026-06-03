"""add_columns_config_to_project

Revision ID: 259bddeb7bb0
Revises: 299cbef24782
Create Date: 2026-06-03 18:17:26.271301

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '259bddeb7bb0'
down_revision: Union[str, Sequence[str], None] = '299cbef24782'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('projects')]
    if 'columns_config' not in columns:
        op.add_column('projects', sa.Column('columns_config', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('projects')]
    if 'columns_config' in columns:
        op.drop_column('projects', 'columns_config')
