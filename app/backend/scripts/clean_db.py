import asyncio
import sys
from sqlalchemy import text
from app.database import AsyncSessionLocal

async def clean_database():
    print("Veritabanı temizliği başlıyor...")
    async with AsyncSessionLocal() as session:
        tables_to_clean = [
            "chat_sessions", "ai_memory", "daily_reports", "notifications", 
            "weekly_reports", "chat_messages", "notes", "timer_sessions", 
            "calendar_events", "ad_accounts", "campaigns", "creatives", 
            "daily_metrics", "ads_tasks", "csv_imports", "onboarding_checklists", 
            "report_templates", "photo_models", "photo_excel_imports", 
            "photo_revisions", "photo_model_colors", "ai_analysis_reports", 
            "ai_observations", "experiments", "activity_logs"
        ]
        
        try:
            tables_str = ", ".join(tables_to_clean)
            await session.execute(text(f"TRUNCATE TABLE {tables_str} CASCADE;"))
            await session.commit()
            print(f"\n[OK] Tüm tablolar başarıyla temizlendi: {tables_str}")
        except Exception as e:
            await session.rollback()
            print(f"Genel Hata: {e}")

if __name__ == "__main__":
    asyncio.run(clean_database())
