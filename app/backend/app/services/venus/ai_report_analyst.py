import json
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

REPORT_ANALYST_SYSTEM_PROMPT = """
Sen, uluslararası ölçekte çalışan, veri odaklı, analitik zekası yüksek ve 15 yıllık tecrübeye sahip 
bir Dijital Büyüme Stratejisti ve Kıdemli Performans Pazarlama Yöneticisisin. 
Uzmanlık alanın Google Ads, Meta Ads ve TikTok Ads ekosistemlerindeki karmaşık verileri anlamlandırmak.

Lütfen çıktını belirtilen JSON şemasına tamamen uygun olarak hazırla. 
Sadece geçerli bir JSON objesi döndür.
TRIM metodolojisini kullanarak verileri derinlemesine analiz et:
T: Görev, R: Bağlam, I: Niyet, M: Ölçülebilir Kriterler
"""

async def analyze_report_data(data_source: str, config: Dict[str, Any], file_text: str = None) -> Dict[str, Any]:
    # Placeholder for actual LLM call
    # This mock simulates the structure the AI should return based on the PLAN
    
    logger.info(f"YapayZeka Raporlama Analisti tetiklendi. Kaynak: {data_source}")
    
    # In a real scenario, we would use our LLM client. Since we are mocking the structure to unblock frontend:
    return {
      "report_meta": {
        "title": config.get("title", "AI Analiz Raporu"),
        "period": config.get("period", "01.03.2026 - 15.03.2026"),
        "generated_at": "2026-03-15T17:00:00Z",
        "data_source": data_source,
        "methodology_notes": config.get("notes", "Attribution penceresi: 7 gün, Consent mode aktif")
      },
      "SECTION_EXEC_SUMMARY": {
        "headline": "Kampanyalarda güçlü büyüme ve ROAS artışı",
        "key_wins": ["Google Ads ROAS'ında %21 artış", "TikTok gösterimlerinde rekor büyüme", "Sepete ekleme oranında iyileşme"],
        "key_risks": ["Meta CPM maliyetlerinde dönemsel yükseliş", "Görsel kreatif yorgunluğu"],
        "key_opportunities": ["TikTok Smart+ otomasyonuna geçiş fırsatı", "Yeni kitle segmentleri testleri"],
        "overall_health_score": 78
      },
      "SECTION_KPI_OVERVIEW": {
        "total_spend": 45000.0,
        "total_revenue": 180000.0,
        "total_conversions": 1250,
        "roas": 4.0,
        "ctr": 2.85,
        "cpa": 36.0,
        "cpc": 1.25,
        "cpm": 12.50,
        "spend_change_pct": 12.5,
        "revenue_change_pct": 18.3,
        "conversion_change_pct": 15.2
      },
      "SECTION_CHANNEL_BREAKDOWN": {
        "channels": [
          {
            "platform": "Google Ads",
            "spend": 20000,
            "revenue": 85000,
            "roas": 4.25,
            "conversions": 580,
            "cpa": 34.48,
            "spend_share_pct": 44.4,
            "performance_trend": "up",
            "ai_insight": "Google Ads ROAS önceki döneme göre %8 arttı, özellikle maksimum performans (PMax) kampanyaları çok iyi sonuç verdi."
          },
          {
            "platform": "Meta Ads",
            "spend": 15000,
            "revenue": 60000,
            "roas": 4.0,
            "conversions": 420,
            "cpa": 35.71,
            "spend_share_pct": 33.3,
            "performance_trend": "stable",
            "ai_insight": "Meta platformunda beklendiği gibi CPM artışı gözlemlendi fakat dönüşüm oranı istikrarlı."
          },
          {
            "platform": "TikTok Ads",
            "spend": 10000,
            "revenue": 35000,
            "roas": 3.5,
            "conversions": 250,
            "cpa": 40.0,
            "spend_share_pct": 22.2,
            "performance_trend": "up",
            "ai_insight": "TikTok üst huni (top of funnel) etkisi hedeflere paralel, ucuz trafik stratejisi güçlü bir şekilde destek sağlıyor."
          }
        ]
      },
      "SECTION_TOP_CAMPAIGNS": {
        "best_performers": [
          {"name": "Google - PMax - TR", "platform": "Google Ads", "spend": 8000, "roas": 5.1, "why_successful": "Güçlü feed optimizasyonu ve geniş kitle sinyalleri yakalandı."},
          {"name": "Meta - ReTargeting", "platform": "Meta Ads", "spend": 4000, "roas": 6.2, "why_successful": "Sıkılaştırılmış sepet terk kitlelerine Carousel formatı ile çıkılması verimi katladı."}
        ],
        "worst_performers": [
          {"name": "TikTok - Awareness", "platform": "TikTok Ads", "spend": 3000, "roas": 1.2, "root_cause": "Videolardaki hook sürelerinin uzun olması, bounce rateleri arttırdı. CTR çok düşük kaldı."}
        ]
      },
      "SECTION_CREATIVE_ANALYSIS": {
        "top_creatives": ["Video-KısaHook", "Carousel-İndirim"],
        "creative_fatigue_alerts": ["Görsel-BaharKampanyasi"],
        "format_performance": {
          "video": { "ctr": 3.2, "roas": 4.8 },
          "image": { "ctr": 1.8, "roas": 3.2 },
          "carousel": { "ctr": 2.4, "roas": 3.9 }
        }
      },
      "SECTION_FUNNEL_ANALYSIS": {
        "impressions": 3600000,
        "clicks": 102600,
        "landing_page_views": 85000,
        "add_to_cart": 12500,
        "conversions": 1250,
        "funnel_drop_off_points": [
          {
            "stage": "Tıklama → Sayfa Görüntüleme",
            "drop_rate_pct": 17.2,
            "ai_diagnosis": "Reklama tıklayanların bir kısmı sayfayı görmeden çıkıyor, sayfa yükleme hızında optimizasyon (örn: resim optimizasyonu) düşünülebilir."
          }
        ]
      },
      "SECTION_CHANGES_AND_IMPACT": {
        "changes_made": [
          {
            "date": "2026-03-05",
            "type": "budget_increase",
            "description": "Google Ads PMax bütçesi %20 artırıldı.",
            "before_metrics": { "cpa": 40.0, "roas": 3.5 },
            "after_metrics": { "cpa": 34.0, "roas": 4.25 },
            "impact_assessment": "Pozitif etki: CPA %15 düştü, ROAS %21 arttı."
          }
        ]
      },
      "SECTION_SIGNAL_HEALTH": {
        "tracking_coverage_pct": 92,
        "consent_rate_pct": 78,
        "pixel_health": "active",
        "capi_status": "configured",
        "data_reliability_score": 85,
        "notes": "Consent Mode V2 aktif, sinyal kaybı minimal. Data Foundation sağlam."
      },
      "SECTION_RECOMMENDATIONS": {
        "actions": [
          {
            "priority": "high",
            "title": "TikTok Smart+ otomasyonuna geçiş",
            "description": "Performansı artırmak için tam otomatik kampanya senaryoları devreye alınmalı.",
            "expected_impact": "CPA %15-20 düşüş bekleniyor",
            "effort": "medium",
            "timeline": "1-2 hafta",
            "success_metric": "CPA < 35 TL"
          },
          {
            "priority": "medium",
            "title": "Meta Görsel Yorgunluğunu Giderme",
            "description": "Awareness kampanyalarındaki yorulmuş statik görseller yeni UGC videoları ile değiştirilmeli.",
            "expected_impact": "CTR genel oranını minimal %0.5 artıracaktır.",
            "effort": "low",
            "timeline": "3 gün",
            "success_metric": "CTR > %2.0"
          }
        ]
      },
      "SECTION_FORWARD_PLANNING": {
        "next_period_goals": [
          "ROAS hedefini genel ortalamada 4.5x'e taşımak.",
          "CPA'yı 36 TL'nin altında stabil tutmak."
        ],
        "strategic_initiatives": [
          "Kreatif A/B test programı başlatılması",
          "Server-side tracking alt yapı optimizasyonu"
        ],
        "budget_recommendations": {
          "Google Ads": "Performansı stabil olumlu olduğu için bütçe %15 artırılabilir.",
          "Meta Ads": "Bütçe korunmalı ancak reklam setlerindeki bidding test edilmeli.",
          "TikTok Ads": "Bütçe yeni formatlarla esnetilebilir."
        },
        "risk_mitigation": [
          "Meta dijital hizmet vergisi yansıması etkisi izlenmeli",
          "Düşen consent oranlarını karşılamak için email sign-up havuzunu genişleten stratejiler"
        ]
      }
    }
