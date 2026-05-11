"""Add company-based permissions and enhanced activity logging

Revision ID: a1b2c3d4e5f6
Revises: f7925b50af97
Create Date: 2026-05-11 18:27:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'f7925b50af97'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # UserCompanyAccess tablosuna yeni sütunlar
    op.add_column('user_company_access', sa.Column('permissions', sa.JSON(), nullable=True, server_default='{}'))
    op.add_column('user_company_access', sa.Column('is_owner', sa.Boolean(), nullable=True, server_default='false'))
    
    # ActivityLog tablosuna yeni sütunlar
    op.add_column('activity_logs', sa.Column('project_id', sa.Integer(), sa.ForeignKey('projects.id'), nullable=True))
    op.add_column('activity_logs', sa.Column('target_user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))

    # Mevcut firma sahiplerini is_owner olarak işaretle
    # Firma oluşturan user_id ile eşleşen kayıtlar
    op.execute("""
        UPDATE user_company_access 
        SET is_owner = true 
        WHERE user_id IN (
            SELECT p.user_id FROM projects p 
            WHERE p.id = user_company_access.project_id
        )
    """)

def downgrade() -> None:
    op.drop_column('activity_logs', 'target_user_id')
    op.drop_column('activity_logs', 'project_id')
    op.drop_column('user_company_access', 'is_owner')
    op.drop_column('user_company_access', 'permissions')
