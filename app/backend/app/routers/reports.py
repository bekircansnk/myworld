import os
import re
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse, HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.report import DailyReport, WeeklyReport
from app.schemas.report import DailyReportResponse, WeeklyReportResponse
from app.services.report_service import generate_daily_report
from app.dependencies.auth import get_current_user, get_current_user_optional
from app.models.user import User

router = APIRouter()

VAULT_LOCAL_PATHS = [
    "/root/.gemini/maestro/research_vault/daily",
    "/Users/bekir/.gemini/maestro/research_vault/daily",
    os.path.expanduser("~/.gemini/maestro/research_vault/daily")
]

def load_vault_file_for_date(date_str: str) -> Optional[str]:
    for base in VAULT_LOCAL_PATHS:
        candidate = os.path.join(base, date_str, f"AI_INTELLIGENCE_{date_str}.md")
        if os.path.exists(candidate):
            try:
                with open(candidate, "r", encoding="utf-8") as f:
                    return f.read()
            except Exception:
                pass
        candidate2 = os.path.join(base, f"AI_INTELLIGENCE_{date_str}.md")
        if os.path.exists(candidate2):
            try:
                with open(candidate2, "r", encoding="utf-8") as f:
                    return f.read()
            except Exception:
                pass
    return None

def parse_markdown_to_html(md_text: str, title: str) -> str:
    try:
        import markdown
        body = markdown.markdown(md_text, extensions=['tables', 'fenced_code', 'toc', 'nl2br'])
    except Exception:
        body = f"<pre style='white-space: pre-wrap;'>{md_text}</pre>"
        
    return f"""<!DOCTYPE html>
<html lang="tr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {{ background: #0b0d13; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
    .prose table {{ width: 100%; border-collapse: separate; border-spacing: 0; border-radius: 1rem; overflow: hidden; margin: 1.5rem 0; background: rgba(20, 24, 36, 0.7); border: 1px solid rgba(255,255,255,0.08); }}
    .prose th {{ background: rgba(30, 41, 59, 0.8); padding: 0.75rem 1rem; font-weight: 700; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); color: #818cf8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }}
    .prose td {{ padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.875rem; color: #cbd5e1; }}
    .prose tr:last-child td {{ border-bottom: none; }}
    .prose pre {{ background: #0f172a; padding: 1.25rem; border-radius: 1rem; overflow-x: auto; border: 1px solid rgba(255,255,255,0.1); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.82rem; line-height: 1.6; color: #38bdf8; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }}
    .prose code {{ background: rgba(99, 102, 241, 0.15); color: #a5b4fc; padding: 0.2rem 0.4rem; border-radius: 0.375rem; font-size: 0.85em; }}
    .prose pre code {{ background: transparent; padding: 0; color: inherit; font-size: inherit; }}
    .prose h1 {{ font-size: 2rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; margin-bottom: 1rem; }}
    .prose h2 {{ font-size: 1.35rem; font-weight: 700; color: #f8fafc; margin-top: 2rem; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }}
    .prose h3 {{ font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin-top: 1.25rem; margin-bottom: 0.5rem; }}
    .prose p {{ line-height: 1.7; margin-bottom: 1rem; color: #94a3b8; font-size: 0.95rem; }}
    .prose ul, .prose ol {{ margin-left: 1.5rem; margin-bottom: 1rem; color: #cbd5e1; font-size: 0.95rem; }}
    .prose li {{ margin-bottom: 0.5rem; line-height: 1.6; }}
    .prose a {{ color: #818cf8; text-decoration: none; font-weight: 500; transition: color 0.15s; }}
    .prose a:hover {{ color: #a5b4fc; text-decoration: underline; }}
    .prose blockquote {{ border-left: 4px solid #6366f1; padding-left: 1rem; color: #94a3b8; font-style: italic; margin: 1rem 0; background: rgba(99, 102, 241, 0.05); padding: 0.75rem 1rem; border-radius: 0 0.75rem 0.75rem 0; }}
    .prose hr {{ border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 2rem 0; }}
  </style>
</head>
<body class="min-h-screen p-4 md:p-8 bg-[#0b0d13]">
  <div class="max-w-5xl mx-auto">
    <div class="bg-[#121622]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="prose max-w-none">
        {body}
      </div>
    </div>
  </div>
</body>
</html>"""

def parse_report_sections(content: str) -> Dict[str, Any]:
    sections: Dict[str, str] = {}
    pattern = r'##\s+([^\n]+)\n(.*?)(?=\n##\s+|$)'
    matches = re.findall(pattern, content, re.DOTALL)
    for title, body in matches:
        sections[title.strip()] = body.strip()

    # Telemetri tablosu ayrıştırma
    telemetry_rows = []
    telemetry_text = ""
    for k, v in sections.items():
        if "Telemetri" in k or "Orkestrasyon" in k:
            telemetry_text = v
            break

    if telemetry_text:
        lines = [l.strip() for l in telemetry_text.split("\n") if l.strip().startswith("|")]
        if len(lines) >= 3:
            headers = [c.strip().replace("*", "").replace("_", "") for c in lines[0].split("|")[1:-1]]
            for line in lines[2:]:
                cols = [c.strip().replace("*", "").replace("`", "") for c in line.split("|")[1:-1]]
                if len(cols) == len(headers):
                    telemetry_rows.append(dict(zip(headers, cols)))

    # GitHub Projeleri çıkarma
    github_projects = []
    gh_section = ""
    for k, v in sections.items():
        if "GitHub" in k or "MCP" in k:
            gh_section = v
            break
    if gh_section:
        items = re.findall(r'\*\s+\*\*\[(.*?)\]\((.*?)\)\s*—?\s*(.*?)\*\*(.*?)(?=\n\*|\Z)', gh_section, re.DOTALL)
        for repo_name, repo_url, short_desc, rest in items:
            github_projects.append({
                "repo": repo_name.strip(),
                "url": repo_url.strip(),
                "headline": short_desc.strip(),
                "details": rest.strip()
            })

    # Checklist maddeleri çıkarma
    checklist_items = []
    check_section = ""
    for k, v in sections.items():
        if "Aksiyon" in k or "Checklist" in k:
            check_section = v
            break
    if check_section:
        checks = re.findall(r'-\s+\[([ xX])\]\s+\*\*(.*?)\*\*:?\s*(.*?)(?=\n-|\Z)', check_section, re.DOTALL)
        for state, title, desc in checks:
            checklist_items.append({
                "completed": state.lower() == "x",
                "title": title.strip(),
                "description": desc.strip()
            })

    words = len(content.split())
    reading_time = max(1, round(words / 220))

    return {
        "raw_sections": sections,
        "telemetry_rows": telemetry_rows,
        "github_projects": github_projects,
        "checklist_items": checklist_items,
        "word_count": words,
        "reading_time_min": reading_time,
        "metrics": {
            "total_workers": len(telemetry_rows) if telemetry_rows else 5,
            "token_saving_pct": 99,
            "architecture_nodes": 4,
            "reading_time_min": reading_time
        }
    }

@router.get("/daily", response_model=List[DailyReportResponse])
async def get_daily_reports(limit: int = 14, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Son {limit} günlük raporları getirir."""
    query = select(DailyReport).where(DailyReport.user_id == current_user.id).order_by(desc(DailyReport.report_date)).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/generate/daily", response_model=DailyReportResponse)
async def trigger_daily_report(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Senkron / Trigger ile bugünün raporunu oluşturup veritabanına ve telegrama atar (Genelde N8N taraflı tetiklenir)."""
    report = await generate_daily_report(db, current_user.id)
    return report

@router.get("/weekly", response_model=List[WeeklyReportResponse])
async def get_weekly_reports(limit: int = 12, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Son {limit} haftalık raporları getirir."""
    query = select(WeeklyReport).where(WeeklyReport.user_id == current_user.id).order_by(desc(WeeklyReport.week_start)).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/scout")
async def get_scout_briefings(
    limit: int = 30, 
    db: AsyncSession = Depends(get_db), 
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Maestro 360-Scout tarafından takvime ve veritabanına eklenen günlük istihbarat brifinglerini zengin içerikle listeler."""
    from app.models.calendar_event import CalendarEvent
    query = (
        select(CalendarEvent)
        .where(CalendarEvent.title.like("%İstihbarat Brifingi%"))
        .order_by(desc(CalendarEvent.id))
        .limit(limit)
    )
    result = await db.execute(query)
    events = result.scalars().all()

    formatted = []
    for e in events:
        date_str = e.start_time.strftime("%Y-%m-%d") if e.start_time else ""
        content = e.description or ""

        # Eğer description eski ve çok kısaysa vault dosyasından tamamla
        if len(content.strip()) < 500 and date_str:
            vault_content = load_vault_file_for_date(date_str)
            if vault_content:
                content = vault_content

        parsed = parse_report_sections(content) if content else {
            "raw_sections": {},
            "telemetry_rows": [],
            "github_projects": [],
            "checklist_items": [],
            "word_count": 0,
            "reading_time_min": 1,
            "metrics": {"total_workers": 5, "token_saving_pct": 99, "architecture_nodes": 4, "reading_time_min": 1}
        }

        # Özet metni (60s özeti veya ilk 300 karakter)
        summary = ""
        for k, v in parsed["raw_sections"].items():
            if "Özet" in k or "Summary" in k:
                summary = v
                break
        if not summary:
            summary = content[:350] + ("..." if len(content) > 350 else "")

        formatted.append({
            "id": e.id,
            "title": e.title,
            "description": summary,
            "date": date_str,
            "created_at": e.created_at.isoformat() if e.created_at else None,
            "project_id": e.project_id,
            "content": content,
            "parsed": parsed
        })

    return formatted

@router.get("/scout/{briefing_id}")
async def get_scout_briefing_detail(
    briefing_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Belirli bir istihbarat brifinginin tam detayını getirir."""
    from app.models.calendar_event import CalendarEvent
    query = select(CalendarEvent).where(CalendarEvent.id == briefing_id)
    result = await db.execute(query)
    e = result.scalars().first()
    if not e:
        raise HTTPException(status_code=404, detail="Brifing bulunamadı")

    date_str = e.start_time.strftime("%Y-%m-%d") if e.start_time else ""
    content = e.description or ""
    if len(content.strip()) < 500 and date_str:
        vault_content = load_vault_file_for_date(date_str)
        if vault_content:
            content = vault_content

    parsed = parse_report_sections(content)
    html_rendered = parse_markdown_to_html(content, e.title)

    return {
        "id": e.id,
        "title": e.title,
        "date": date_str,
        "created_at": e.created_at.isoformat() if e.created_at else None,
        "project_id": e.project_id,
        "content": content,
        "html": html_rendered,
        "parsed": parsed
    }

@router.get("/scout/{briefing_id}/download")
async def download_scout_briefing(
    briefing_id: int,
    format: str = Query("markdown", regex="^(markdown|html|json)$"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """İstihbarat brifingini Markdown, HTML veya JSON formatında indirir."""
    from app.models.calendar_event import CalendarEvent
    query = select(CalendarEvent).where(CalendarEvent.id == briefing_id)
    result = await db.execute(query)
    e = result.scalars().first()
    if not e:
        raise HTTPException(status_code=404, detail="Brifing bulunamadı")

    date_str = e.start_time.strftime("%Y-%m-%d") if e.start_time else "rapor"
    content = e.description or ""
    if len(content.strip()) < 500 and date_str:
        vault_content = load_vault_file_for_date(date_str)
        if vault_content:
            content = vault_content

    if format == "html":
        html_code = parse_markdown_to_html(content, e.title)
        return HTMLResponse(
            content=html_code,
            headers={"Content-Disposition": f'attachment; filename="AI_INTELLIGENCE_{date_str}.html"'}
        )
    elif format == "json":
        import json
        parsed = parse_report_sections(content)
        data = {
            "id": e.id,
            "title": e.title,
            "date": date_str,
            "content": content,
            "parsed": parsed
        }
        return Response(
            content=json.dumps(data, ensure_ascii=False, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="AI_INTELLIGENCE_{date_str}.json"'}
        )
    else:
        return PlainTextResponse(
            content=content,
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="AI_INTELLIGENCE_{date_str}.md"'}
        )

