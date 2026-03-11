from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    project_name: str = "My World API"
    environment: str = "development"
    frontend_url: str = "http://localhost:3000"
    
    # Database
    db_user: str
    db_password: str
    db_name: str
    db_host: str
    db_port: int
    database_url: str

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Security
    secret_key: str
    access_token_expire_minutes: int = 1440
    
    # AI (Gemini)
    gemini_api_key: str
    
    # Telegram Bot
    telegram_bot_token: str
    telegram_admin_id: str

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent.parent.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Force load from .env if running from subdirectories like alembic
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent.parent.parent / ".env")

settings = Settings()
