"""Venus Ads Metric Calculator Service.
Calculates KPIs (ROAS, CPA, CTR, etc.) from venus_daily_metrics data.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List


def calculate_kpi_summary(
    db: Session,
    user_id: int,
    project_id: Optional[int] = None,
    days: int = 7
) -> Dict[str, Any]:
    """Calculate overall KPI summary for the given date range."""
    from app.models.venus.daily_metric import VenusDailyMetric

    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days)
    prev_start = start_date - timedelta(days=days)

    query = db.query(VenusDailyMetric).filter(
        VenusDailyMetric.user_id == user_id,
        VenusDailyMetric.date >= str(start_date),
        VenusDailyMetric.date <= str(end_date),
    )
    if project_id:
        from app.models.venus.campaign import VenusCampaign
        campaign_ids = [c.id for c in db.query(VenusCampaign.id).filter(
            VenusCampaign.user_id == user_id,
            VenusCampaign.project_id == project_id
        ).all()]
        if campaign_ids:
            query = query.filter(VenusDailyMetric.campaign_id.in_(campaign_ids))

    metrics = query.all()

    # Calculate current period
    total_spend = sum(m.spend or 0 for m in metrics)
    total_impressions = sum(m.impressions or 0 for m in metrics)
    total_clicks = sum(m.clicks or 0 for m in metrics)
    total_conversions = sum(m.conversions or 0 for m in metrics)
    total_conv_value = sum(m.conversion_value or 0 for m in metrics)
    total_purchases = sum(m.purchases or 0 for m in metrics)
    total_purchase_value = sum(m.purchase_value or 0 for m in metrics)

    ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
    cpc = (total_spend / total_clicks) if total_clicks > 0 else 0
    roas = (total_conv_value / total_spend) if total_spend > 0 else 0
    cpa = (total_spend / total_conversions) if total_conversions > 0 else 0

    # Previous period for trend
    prev_query = db.query(VenusDailyMetric).filter(
        VenusDailyMetric.user_id == user_id,
        VenusDailyMetric.date >= str(prev_start),
        VenusDailyMetric.date < str(start_date),
    )
    prev_metrics = prev_query.all()
    prev_spend = sum(m.spend or 0 for m in prev_metrics)
    prev_roas_val = sum(m.conversion_value or 0 for m in prev_metrics)
    prev_roas = (prev_roas_val / prev_spend) if prev_spend > 0 else 0

    spend_change = ((total_spend - prev_spend) / prev_spend * 100) if prev_spend > 0 else 0
    roas_change = ((roas - prev_roas) / prev_roas * 100) if prev_roas > 0 else 0

    return {
        "total_spend": round(total_spend, 2),
        "total_impressions": total_impressions,
        "total_clicks": total_clicks,
        "total_conversions": total_conversions,
        "total_purchases": total_purchases,
        "total_purchase_value": round(total_purchase_value, 2),
        "ctr": round(ctr, 2),
        "cpc": round(cpc, 2),
        "roas": round(roas, 2),
        "cpa": round(cpa, 2),
        "spend_change_pct": round(spend_change, 1),
        "roas_change_pct": round(roas_change, 1),
        "period_days": days,
        "date_range": f"{start_date} → {end_date}",
    }


def calculate_campaign_trend(
    db: Session,
    campaign_id: int,
    user_id: int,
    days: int = 30
) -> List[Dict[str, Any]]:
    """Get daily trend data for a specific campaign."""
    from app.models.venus.daily_metric import VenusDailyMetric

    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days)

    metrics = db.query(VenusDailyMetric).filter(
        VenusDailyMetric.user_id == user_id,
        VenusDailyMetric.campaign_id == campaign_id,
        VenusDailyMetric.date >= str(start_date),
    ).order_by(VenusDailyMetric.date.asc()).all()

    return [
        {
            "date": m.date,
            "spend": round(m.spend or 0, 2),
            "impressions": m.impressions or 0,
            "clicks": m.clicks or 0,
            "conversions": m.conversions or 0,
            "roas": round((m.conversion_value / m.spend) if m.spend and m.spend > 0 else 0, 2),
            "ctr": round((m.clicks / m.impressions * 100) if m.impressions and m.impressions > 0 else 0, 2),
        }
        for m in metrics
    ]


def detect_anomalies(
    db: Session,
    user_id: int,
    project_id: Optional[int] = None,
    threshold: float = 2.0
) -> List[Dict[str, Any]]:
    """Detect anomalies in recent metric data using simple Z-score approach."""
    from app.models.venus.daily_metric import VenusDailyMetric

    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=30)

    query = db.query(VenusDailyMetric).filter(
        VenusDailyMetric.user_id == user_id,
        VenusDailyMetric.date >= str(start_date),
    )
    metrics = query.all()

    if len(metrics) < 7:
        return []

    anomalies = []

    # Check for CPA spikes
    cpas = [(m.spend / m.conversions) if m.conversions and m.conversions > 0 else None for m in metrics]
    valid_cpas = [c for c in cpas if c is not None]
    if len(valid_cpas) > 3:
        avg_cpa = sum(valid_cpas) / len(valid_cpas)
        import statistics
        std_cpa = statistics.stdev(valid_cpas) if len(valid_cpas) > 1 else 0

        if std_cpa > 0:
            for i, cpa in enumerate(cpas):
                if cpa is not None and (cpa - avg_cpa) / std_cpa > threshold:
                    anomalies.append({
                        "type": "cpa_spike",
                        "severity": "warning",
                        "title": f"CPA Spike: ₺{cpa:.2f} (Avg: ₺{avg_cpa:.2f})",
                        "date": metrics[i].date,
                        "campaign_id": metrics[i].campaign_id,
                    })

    # Check for ROAS drops
    roas_vals = [(m.conversion_value / m.spend) if m.spend and m.spend > 0 else None for m in metrics]
    valid_roas = [r for r in roas_vals if r is not None]
    if len(valid_roas) > 3:
        avg_roas = sum(valid_roas) / len(valid_roas)
        for i, roas in enumerate(roas_vals):
            if roas is not None and roas < avg_roas * 0.5:
                anomalies.append({
                    "type": "roas_drop",
                    "severity": "critical",
                    "title": f"ROAS Drop: {roas:.2f}x (Avg: {avg_roas:.2f}x)",
                    "date": metrics[i].date,
                    "campaign_id": metrics[i].campaign_id,
                })

    return anomalies
