"""Venus Ads AI Analyzer Service.
Uses existing Gemini service to provide campaign analysis, anomaly reports, and optimization suggestions.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, Dict, Any, List
from datetime import datetime


async def generate_campaign_analysis(
    db: AsyncSession,
    campaign_id: int,
    user_id: int
) -> Dict[str, Any]:
    """Generate AI analysis for a specific campaign using Gemini."""
    from app.models.venus.campaign import VenusCampaign
    from app.services.venus.metric_calculator import calculate_campaign_trend

    query = select(VenusCampaign).where(
        VenusCampaign.id == campaign_id,
        VenusCampaign.user_id == user_id,
    )
    result = await db.execute(query)
    campaign = result.scalar_one_or_none()

    if not campaign:
        return {"error": "Campaign not found"}

    trend_data = await calculate_campaign_trend(db, campaign_id, user_id, days=14)

    if not trend_data:
        return {
            "campaign_name": campaign.campaign_name,
            "analysis": "Yeterli veri yok. Kampanyaya ait günlük metrikler eklendiğinde AI analizi yapılabilecektir.",
            "suggestions": [],
        }

    # Build prompt for Gemini
    prompt = f"""
Sen bir dijital reklam uzmanısın. Aşağıdaki kampanya verilerini analiz et ve Türkçe olarak öneriler sun.

Kampanya: {campaign.campaign_name}
Platform: {campaign.platform}
Hedef: {campaign.objective or 'Belirtilmemiş'}
Günlük Bütçe: ₺{campaign.budget_daily or 'Belirtilmemiş'}
Durum: {campaign.status}

Son 14 Günlük Performans:
"""
    for d in trend_data[-14:]:
        prompt += f"  {d['date']}: Harcama=₺{d['spend']}, Tıklama={d['clicks']}, ROAS={d['roas']}x, CTR=%{d['ctr']}\n"

    prompt += """
Lütfen şu başlıklarda yorum yap:
1. **Genel Performans Değerlendirmesi** (1-2 cümle)
2. **Tespit Edilen Sorunlar** (varsa)
3. **Optimizasyon Önerileri** (en az 3 madde)
4. **A/B Test Fikirleri** (en az 2 madde)

JSON formatında yanıt ver:
{
  "summary": "...",
  "issues": ["...", "..."],
  "suggestions": ["...", "...", "..."],
  "test_ideas": ["...", "..."]
}
"""

    try:
        from app.services.gemini import generate_response
        response = await generate_response(prompt)

        # Try to parse JSON from response
        import json
        import re

        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            parsed = json.loads(json_match.group())
            return {
                "campaign_name": campaign.campaign_name,
                "analysis": parsed.get("summary", response),
                "issues": parsed.get("issues", []),
                "suggestions": parsed.get("suggestions", []),
                "test_ideas": parsed.get("test_ideas", []),
                "generated_at": datetime.utcnow().isoformat(),
            }

        return {
            "campaign_name": campaign.campaign_name,
            "analysis": response,
            "suggestions": [],
            "generated_at": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        return {
            "campaign_name": campaign.campaign_name,
            "analysis": f"AI analizi şu an kullanılamıyor: {str(e)}",
            "suggestions": [],
            "error": str(e),
        }


async def generate_daily_summary(
    db: AsyncSession,
    user_id: int,
    project_id: Optional[int] = None
) -> Dict[str, Any]:
    """Generate a daily AI summary of all campaigns."""
    from app.services.venus.metric_calculator import calculate_kpi_summary, detect_anomalies

    kpis = await calculate_kpi_summary(db, user_id, project_id, days=1)
    anomalies = await detect_anomalies(db, user_id, project_id)

    prompt = f"""
Sen bir dijital reklam ajansı yöneticisisin. Bugünkü performans özetini Türkçe olarak hazırla.

Bugünün Metrikleri:
- Toplam Harcama: ₺{kpis['total_spend']}
- Gösterim: {kpis['total_impressions']}
- Tıklama: {kpis['total_clicks']}
- Dönüşüm: {kpis['total_conversions']}
- ROAS: {kpis['roas']}x
- CPA: ₺{kpis['cpa']}

Anomaliler ({len(anomalies)} adet):
"""
    for a in anomalies[:5]:
        prompt += f"- {a['title']}\n"

    prompt += "\nKısa, özlü bir günlük brifing hazırla (maks 3 paragraf)."

    try:
        from app.services.gemini import generate_response
        response = await generate_response(prompt)
        return {
            "summary": response,
            "kpis": kpis,
            "anomaly_count": len(anomalies),
            "generated_at": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        return {
            "summary": f"AI özet şu an kullanılamıyor: {str(e)}",
            "kpis": kpis,
            "error": str(e),
        }


async def suggest_test_ideas(
    db: AsyncSession,
    campaign_id: int,
    user_id: int
) -> List[str]:
    """Suggest A/B test ideas based on campaign data."""
    result = await generate_campaign_analysis(db, campaign_id, user_id)
    return result.get("test_ideas", [
        "Farklı hedef kitle segmentleri ile test yapın",
        "Kreatif formatlarını (görsel vs video) karşılaştırın",
    ])
