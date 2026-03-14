"""Venus Ads CSV Parser Service.
Parses Google Ads and Meta Ads CSV export files and maps columns to venus_daily_metrics format.
"""
import csv
import io
from typing import Dict, List, Optional, Any
from datetime import datetime


# Google Ads export column mappings
GOOGLE_ADS_MAP = {
    "Campaign": "campaign_name",
    "Day": "date",
    "Cost": "spend",
    "Impr.": "impressions",
    "Impressions": "impressions",
    "Clicks": "clicks",
    "CTR": "ctr",
    "Avg. CPC": "cpc",
    "Conversions": "conversions",
    "Conv. value": "conversion_value",
    "All conv.": "conversions",
    "All conv. value": "conversion_value",
}

# Meta Ads export column mappings
META_ADS_MAP = {
    "Campaign name": "campaign_name",
    "Kampanya adı": "campaign_name",
    "Day": "date",
    "Reporting starts": "date",
    "Amount spent (TRY)": "spend",
    "Harcanan tutar (TRY)": "spend",
    "Impressions": "impressions",
    "Gösterim": "impressions",
    "Link clicks": "clicks",
    "Bağlantı tıklamaları": "clicks",
    "CTR (link click-through rate)": "ctr",
    "CPC (cost per link click)": "cpc",
    "Results": "conversions",
    "Sonuçlar": "conversions",
    "Purchase ROAS": "roas",
    "Purchases": "purchases",
    "Satın almalar": "purchases",
    "Purchase conversion value": "purchase_value",
}


def detect_platform(headers: List[str]) -> str:
    """Auto-detect CSV platform based on headers."""
    header_set = set(h.strip() for h in headers)

    meta_indicators = {"Campaign name", "Kampanya adı", "Amount spent (TRY)", "Harcanan tutar (TRY)"}
    google_indicators = {"Campaign", "Cost", "Impr.", "Avg. CPC"}

    if meta_indicators & header_set:
        return "meta_ads"
    if google_indicators & header_set:
        return "google_ads"
    return "custom"


def map_columns(headers: List[str], platform: str) -> Dict[str, str]:
    """Map CSV column headers to internal metric field names."""
    col_map = META_ADS_MAP if platform == "meta_ads" else GOOGLE_ADS_MAP
    mapping = {}

    for header in headers:
        clean = header.strip()
        if clean in col_map:
            mapping[clean] = col_map[clean]

    return mapping


def parse_csv_content(
    content: str,
    platform: str = "auto"
) -> Dict[str, Any]:
    """Parse CSV content and return structured data.
    
    Returns:
        {
            "platform": str,
            "headers": List[str],
            "mapping": Dict[str, str],
            "rows": List[Dict[str, Any]],
            "row_count": int,
            "errors": List[str],
        }
    """
    errors = []
    reader = csv.reader(io.StringIO(content))

    try:
        headers = next(reader)
    except StopIteration:
        return {"platform": platform, "headers": [], "mapping": {}, "rows": [], "row_count": 0, "errors": ["Empty CSV file"]}

    # Auto-detect platform if not specified
    if platform == "auto":
        platform = detect_platform(headers)

    mapping = map_columns(headers, platform)

    if not mapping:
        errors.append(f"Could not map any columns for platform: {platform}")
        return {"platform": platform, "headers": headers, "mapping": {}, "rows": [], "row_count": 0, "errors": errors}

    rows = []
    for line_num, row in enumerate(reader, start=2):
        if len(row) != len(headers):
            errors.append(f"Row {line_num}: Column count mismatch")
            continue

        mapped_row: Dict[str, Any] = {"source": f"csv_{platform}"}
        for i, header in enumerate(headers):
            clean_header = header.strip()
            if clean_header in mapping:
                field = mapping[clean_header]
                value = row[i].strip()

                # Type conversion
                if field in ("spend", "ctr", "cpc", "roas", "conversion_value", "purchase_value"):
                    try:
                        value = float(value.replace(",", "").replace("₺", "").replace("$", "").replace("%", ""))
                    except (ValueError, AttributeError):
                        value = 0.0
                elif field in ("impressions", "clicks", "conversions", "purchases"):
                    try:
                        value = int(float(value.replace(",", "")))
                    except (ValueError, AttributeError):
                        value = 0
                elif field == "date":
                    # Try common date formats
                    for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%m/%d/%Y", "%d/%m/%Y"):
                        try:
                            value = datetime.strptime(value, fmt).strftime("%Y-%m-%d")
                            break
                        except ValueError:
                            continue

                mapped_row[field] = value

        rows.append(mapped_row)

    return {
        "platform": platform,
        "headers": headers,
        "mapping": mapping,
        "rows": rows,
        "row_count": len(rows),
        "errors": errors,
    }


def import_rows_to_db(
    db,
    rows: List[Dict[str, Any]],
    user_id: int,
    campaign_id_map: Optional[Dict[str, int]] = None
) -> Dict[str, int]:
    """Import parsed CSV rows into venus_daily_metrics table.
    
    Args:
        campaign_id_map: Optional dict mapping campaign_name -> campaign_id.
                         If not provided, a new campaign lookup will be made.
    """
    from app.models.venus.daily_metric import VenusDailyMetric

    imported = 0
    skipped = 0

    for row in rows:
        campaign_name = row.pop("campaign_name", None)
        campaign_id = None

        if campaign_name and campaign_id_map:
            campaign_id = campaign_id_map.get(campaign_name)

        try:
            metric = VenusDailyMetric(
                user_id=user_id,
                campaign_id=campaign_id,
                date=row.get("date", datetime.utcnow().strftime("%Y-%m-%d")),
                platform=row.get("source", "csv").replace("csv_", ""),
                spend=row.get("spend", 0),
                impressions=row.get("impressions", 0),
                clicks=row.get("clicks", 0),
                ctr=row.get("ctr", 0),
                cpc=row.get("cpc", 0),
                conversions=row.get("conversions", 0),
                conversion_value=row.get("conversion_value", 0),
                purchases=row.get("purchases", 0),
                purchase_value=row.get("purchase_value", 0),
                roas=row.get("roas", 0),
                cpa=0,
                frequency=0,
                source=row.get("source", "csv"),
            )
            db.add(metric)
            imported += 1
        except Exception:
            skipped += 1

    db.commit()
    return {"imported": imported, "skipped": skipped}
