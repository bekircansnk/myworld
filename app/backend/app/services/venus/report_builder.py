"""Venus Ads Report Builder Service.
Generates structured reports from metrics data using templates.
"""
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta


from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

async def generate_report(
    db: AsyncSession,
    user_id: int,
    template_type: str = "weekly",
    project_id: Optional[int] = None,
) -> Dict[str, Any]:
    """Generate a report based on template type."""
    from app.services.venus.metric_calculator import calculate_kpi_summary

    if template_type == "weekly":
        days = 7
    elif template_type == "monthly":
        days = 30
    else:
        days = 7

    kpis = await calculate_kpi_summary(db, user_id, project_id, days=days)

    # Get top campaigns
    from app.models.venus.daily_metric import VenusDailyMetric
    from app.models.venus.campaign import VenusCampaign

    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days)

    top_campaigns = []
    
    query = select(
        VenusDailyMetric.campaign_id,
        func.sum(VenusDailyMetric.spend).label("total_spend"),
        func.sum(VenusDailyMetric.clicks).label("total_clicks"),
        func.sum(VenusDailyMetric.conversions).label("total_conv"),
        func.sum(VenusDailyMetric.conversion_value).label("total_value"),
    ).where(
        VenusDailyMetric.user_id == user_id,
        VenusDailyMetric.date >= str(start_date),
    ).group_by(VenusDailyMetric.campaign_id).order_by(
        desc(func.sum(VenusDailyMetric.spend))
    ).limit(10)
    
    result = await db.execute(query)
    campaign_metrics = result.all()

    for cm in campaign_metrics:
        # cm elements: [campaign_id, total_spend, total_clicks, total_conv, total_value]
        camp_query = select(VenusCampaign).where(VenusCampaign.id == cm[0])
        camp_res = await db.execute(camp_query)
        campaign = camp_res.scalar_one_or_none()
        
        if campaign:
            spend = float(cm[1] or 0)
            value = float(cm[4] or 0)
            top_campaigns.append({
                "campaign_name": campaign.campaign_name,
                "platform": campaign.platform,
                "spend": round(spend, 2),
                "clicks": int(cm[2] or 0),
                "conversions": int(cm[3] or 0),
                "roas": round(value / spend, 2) if spend > 0 else 0,
            })

    report = {
        "title": f"{'Haftalık' if template_type == 'weekly' else 'Aylık'} Performans Raporu",
        "period": f"{start_date.strftime('%d.%m.%Y')} - {end_date.strftime('%d.%m.%Y')}",
        "generated_at": datetime.utcnow().isoformat(),
        "sections": {
            "overview": {
                "title": "Genel Performans",
                "kpis": kpis,
            },
            "top_campaigns": {
                "title": "En Çok Harcanan Kampanyalar",
                "campaigns": top_campaigns,
            },
            "summary": {
                "title": "Özet",
                "highlights": [],
            },
        },
    }

    # Auto-generate highlights
    highlights = []
    if kpis["total_spend"] > 0:
        highlights.append(f"Toplam ₺{kpis['total_spend']:,.2f} harcandı")
    if kpis["roas"] > 0:
        highlights.append(f"Genel ROAS: {kpis['roas']}x")
    if kpis["total_conversions"] > 0:
        highlights.append(f"{kpis['total_conversions']} dönüşüm elde edildi")
    if kpis["spend_change_pct"] != 0:
        direction = "artış" if kpis["spend_change_pct"] > 0 else "azalış"
        highlights.append(f"Önceki döneme göre %{abs(kpis['spend_change_pct']):.1f} harcama {direction}ı")

    report["sections"]["summary"]["highlights"] = highlights

    return report


def format_report_html(report_data: Dict[str, Any]) -> str:
    """Format report data as simple HTML structure."""
    kpis = report_data["sections"]["overview"]["kpis"]
    campaigns = report_data["sections"]["top_campaigns"]["campaigns"]
    highlights = report_data["sections"]["summary"]["highlights"]

    html = f"""
    <div style="font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1>{report_data['title']}</h1>
        <p style="color: #666;">{report_data['period']}</p>
        <hr/>
        
        <h2>📊 Genel Performans</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
                    <strong>Harcama</strong><br/>₺{kpis['total_spend']:,.2f}
                </td>
                <td style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
                    <strong>ROAS</strong><br/>{kpis['roas']}x
                </td>
                <td style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
                    <strong>Dönüşüm</strong><br/>{kpis['total_conversions']}
                </td>
                <td style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
                    <strong>CTR</strong><br/>%{kpis['ctr']}
                </td>
            </tr>
        </table>
        
        <h2>🏆 En İyi Kampanyalar</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f1f5f9;">
                    <th style="padding: 8px; text-align: left;">Kampanya</th>
                    <th style="padding: 8px;">Harcama</th>
                    <th style="padding: 8px;">Tıklama</th>
                    <th style="padding: 8px;">ROAS</th>
                </tr>
            </thead>
            <tbody>
    """

    for c in campaigns[:5]:
        html += f"""
                <tr>
                    <td style="padding: 8px;">{c['campaign_name']}</td>
                    <td style="padding: 8px; text-align: center;">₺{c['spend']:,.2f}</td>
                    <td style="padding: 8px; text-align: center;">{c['clicks']}</td>
                    <td style="padding: 8px; text-align: center;">{c['roas']}x</td>
                </tr>
        """

    html += """
            </tbody>
        </table>
        
        <h2>📝 Özet</h2>
        <ul>
    """

    for h in highlights:
        html += f"<li>{h}</li>"

    html += """
        </ul>
    </div>
    """

    return html
