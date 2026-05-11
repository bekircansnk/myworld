"""Rename venus tables to generic names

Revision ID: f7925b50af97
Revises: 98716029b849
Create Date: 2026-05-11 18:12:19.282401

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f7925b50af97'
down_revision: Union[str, Sequence[str], None] = '98716029b849'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Rename tables
    op.rename_table('venus_ad_accounts', 'ad_accounts')
    op.rename_table('venus_ads_tasks', 'ads_tasks')
    op.rename_table('venus_ai_analysis_reports', 'ai_analysis_reports')
    op.rename_table('venus_ai_observations', 'ai_observations')
    op.rename_table('venus_campaigns', 'campaigns')
    op.rename_table('venus_creatives', 'creatives')
    op.rename_table('venus_csv_imports', 'csv_imports')
    op.rename_table('venus_daily_metrics', 'daily_metrics')
    op.rename_table('venus_experiments', 'experiments')
    op.rename_table('venus_onboarding_checklists', 'onboarding_checklists')
    op.rename_table('venus_report_templates', 'report_templates')

def downgrade() -> None:
    op.rename_table('ad_accounts', 'venus_ad_accounts')
    op.rename_table('ads_tasks', 'venus_ads_tasks')
    op.rename_table('ai_analysis_reports', 'venus_ai_analysis_reports')
    op.rename_table('ai_observations', 'venus_ai_observations')
    op.rename_table('campaigns', 'venus_campaigns')
    op.rename_table('creatives', 'venus_creatives')
    op.rename_table('csv_imports', 'venus_csv_imports')
    op.rename_table('daily_metrics', 'venus_daily_metrics')
    op.rename_table('experiments', 'venus_experiments')
    op.rename_table('onboarding_checklists', 'venus_onboarding_checklists')
    op.rename_table('report_templates', 'venus_report_templates')
