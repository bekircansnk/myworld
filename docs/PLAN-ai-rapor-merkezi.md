# PLAN: YapayZeka Destekli Gelişmiş Rapor Merkezi

> **Proje:** My World – Venus Ads Raporlama Sistemi
> **Tarih:** 15 Mart 2026
> **Durum:** PLANLAMA (Kod yazılmayacak – Onay bekleniyor)

---

## 📋 Genel Bakış ve Amaç

Mevcut raporlama sistemi sadece içerideki verilerle (kampanya metrikleri) çalışan basit bir şablon oluşturma mekanizmasına sahiptir. Bu plan, sistemi **tamamen YapayZeka destekli**, hem iç verilerden hem de **dışarıdan yüklenen dosyalardan** (PDF, Word, Excel, CSV vb.) kapsamlı analiz raporları üretebilen bir **Akıllı Rapor Merkezi**ne dönüştürecektir.

### Mevcut Durum Analizi

| Bileşen | Mevcut | Hedef |
|---------|--------|-------|
| **Frontend** | `AdsReportCenter.tsx` – Basit şablon listesi | Dosya yükleme + AI analiz + İndirilebilir PDF + Canlı Dashboard |
| **Backend Model** | `VenusReportTemplate` – title, type, sections | Yeni `AIAnalysisReport` modeli – dosya desteği, AI sonuçları, durum takibi |
| **Backend Servis** | `report_builder.py` – Basit KPI özeti | AI entegrasyonlu kapsamlı analiz motoru |
| **AI Sistemi** | `context.py` + `prompts.py` – Görev bazlı | Raporlama uzmanı rol + TRIM metodolojisi + Yapılandırılmış çıktı |
| **Rapor Çıktısı** | HTML tablo | **Faz 1:** İndirilebilir PDF / **Faz 2:** Canlı Analiz Dashboard'u |

---

## 🏗️ MİMARİ GENEL GÖRÜNÜM

```
┌──────────────────────────────────────────────────────────────┐
│                    KULLANICI ARAYÜZÜ (Frontend)              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ İç Veri      │  │ Dış Dosya    │  │ Oluşturulan        │  │
│  │ Rapor Şablon │  │ Yükleme Alan │  │ Raporlar Listesi   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────────┘  │
│         │                 │                    │              │
│         ▼                 ▼                    ▼              │
│  ┌─────────────────────────────┐   ┌────────────────────┐    │
│  │  AI Analiz Tetikleyicisi   │   │ Faz1: PDF İndir    │    │
│  │  (Rapor Oluştur Butonu)    │   │ Faz2: Dashboard    │    │
│  └────────────┬───────────────┘   └────────────────────┘    │
│               │                                              │
└───────────────┼──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND API KATMANI                        │
│                                                              │
│  /api/venus/reports/ai-analysis     (POST - Analiz Başlat)   │
│  /api/venus/reports/ai-analysis/:id (GET  - Sonuç Al)        │
│  /api/venus/reports/upload          (POST - Dosya Yükle)     │
│  /api/venus/reports/download/:id    (GET  - PDF İndir)       │
│                                                              │
└──────────────────────────────────┬───────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────┐
│                    AI ANALİZ MOTORU                           │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                    │
│  │ Dosya İşleme    │  │ İç Veri Toplama │                    │
│  │ (PDF/Word/Excel)│  │ (Metrik Hesap)  │                    │
│  └────────┬────────┘  └────────┬────────┘                    │
│           │                    │                              │
│           ▼                    ▼                              │
│  ┌─────────────────────────────────────┐                     │
│  │  YAPAYZEKA RAPORLAMA ANALİSTİ     │                     │
│  │  (Yapılandırılmış Prompt Sistemi)  │                     │
│  │                                     │                     │
│  │  • KPI Ağacı Analizi               │                     │
│  │  • Kök Neden Teşhisi               │                     │
│  │  • Önce/Sonra Karşılaştırma        │                     │
│  │  • Kreatif Performans Değerlendirme│                     │
│  │  • İleriye Dönük Aksiyon Önerileri │                     │
│  └────────────────┬────────────────────┘                     │
│                   │                                          │
│                   ▼                                          │
│  ┌─────────────────────────────────────┐                     │
│  │  YAPILANDIRILMIŞ JSON ÇIKTI        │                     │
│  │  (Tüm alanlar kodlanmış + isimli)  │                     │
│  └────────────────┬────────────────────┘                     │
│                   │                                          │
│                   ▼                                          │
│  ┌───────────────────────────┐  ┌──────────────────────┐     │
│  │ Faz 1: PDF Üretim Motoru │  │ Faz 2: Dashboard     │     │
│  │ (HTML → PDF / ReportLab) │  │ Veri Doldurma Motoru │     │
│  └───────────────────────────┘  └──────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 FAZ 1: İndirilebilir AI Analiz Raporu (PDF)

### 1.1 Veritabanı Modeli

#### [YENİ] `app/backend/app/models/venus/ai_analysis_report.py`

Yeni bir model oluşturulacak:

```python
class AIAnalysisReport:
    id                  # Primary Key
    user_id             # Kullanıcı
    project_id          # Proje (opsiyonel)
    
    # Rapor Türü
    report_source       # "internal" (iç veri) | "external" (dış dosya) | "hybrid" (her ikisi)
    report_type         # "weekly" | "monthly" | "campaign" | "custom" | "file_analysis"
    title               # Rapor başlığı
    
    # Dosya Bilgileri (Dış kaynak için)
    uploaded_file_name  # Yüklenen dosyanın adı
    uploaded_file_path  # Sunucudaki yol
    uploaded_file_type  # "pdf" | "docx" | "xlsx" | "csv" | "txt"
    uploaded_file_size  # Dosya boyutu (byte)
    
    # AI Analiz Sonuçları (JSON - Yapılandırılmış)
    analysis_result     # JSON: Tüm AI analiz verileri (kodlanmış alan isimleriyle)
    
    # Durum Takibi
    status              # "pending" | "processing" | "completed" | "failed"
    progress_pct        # İlerleme yüzdesi (0-100)
    error_message       # Hata mesajı (başarısız olursa)
    
    # PDF Dosyası
    pdf_file_path       # Oluşturulan PDF'in yolu
    
    # Zaman Damgaları
    created_at
    completed_at
    
    # Metadata
    analysis_config     # JSON: Analiz ayarları (dönem, KPI hedefleri vb.)
```

### 1.2 AI Analiz Sonuç Yapısı (Yapılandırılmış JSON)

AI'ın ürettiği her rapor, aşağıdaki **kodlanmış alan isimleriyle** standart bir JSON formatında döndürülecek:

```json
{
  "report_meta": {
    "title": "...",
    "period": "01.03.2026 - 15.03.2026",
    "generated_at": "2026-03-15T17:00:00Z",
    "data_source": "internal | external | hybrid",
    "methodology_notes": "Attribution penceresi: 7 gün, Consent mode aktif"
  },
  
  "SECTION_EXEC_SUMMARY": {
    "headline": "Bu dönemin hikayesi...",
    "key_wins": ["...", "...", "..."],
    "key_risks": ["...", "...", "..."],
    "key_opportunities": ["...", "..."],
    "overall_health_score": 78
  },
  
  "SECTION_KPI_OVERVIEW": {
    "total_spend": 45000.00,
    "total_revenue": 180000.00,
    "total_conversions": 1250,
    "roas": 4.0,
    "ctr": 2.85,
    "cpa": 36.00,
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
        "ai_insight": "Google Ads ROAS önceki döneme göre %8 arttı..."
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
        "ai_insight": "Meta platformunda CPM artışı gözlemlendi..."
      },
      {
        "platform": "TikTok Ads",
        "spend": 10000,
        "revenue": 35000,
        "roas": 3.5,
        "conversions": 250,
        "cpa": 40.00,
        "spend_share_pct": 22.2,
        "performance_trend": "up",
        "ai_insight": "TikTok üst huni etkisi güçlü..."
      }
    ]
  },
  
  "SECTION_TOP_CAMPAIGNS": {
    "best_performers": [
      {
        "name": "...",
        "platform": "...",
        "spend": 0,
        "roas": 0,
        "why_successful": "AI açıklaması..."
      }
    ],
    "worst_performers": [
      {
        "name": "...",
        "platform": "...",
        "spend": 0,
        "roas": 0,
        "root_cause": "AI kök neden analizi..."
      }
    ]
  },
  
  "SECTION_CREATIVE_ANALYSIS": {
    "top_creatives": [...],
    "creative_fatigue_alerts": [...],
    "format_performance": {
      "video": { "ctr": 0, "roas": 0 },
      "image": { "ctr": 0, "roas": 0 },
      "carousel": { "ctr": 0, "roas": 0 }
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
        "ai_diagnosis": "Açılış sayfası yükleme süresi sorunlu olabilir"
      }
    ]
  },
  
  "SECTION_CHANGES_AND_IMPACT": {
    "changes_made": [
      {
        "date": "2026-03-05",
        "type": "budget_increase",
        "description": "Google Ads bütçesi %20 artırıldı",
        "before_metrics": { "cpa": 40, "roas": 3.5 },
        "after_metrics": { "cpa": 34, "roas": 4.25 },
        "impact_assessment": "Pozitif etki: CPA %15 düştü, ROAS %21 arttı"
      }
    ]
  },
  
  "SECTION_SIGNAL_HEALTH": {
    "tracking_coverage_pct": 92,
    "consent_rate_pct": 78,
    "pixel_health": "active",
    "capi_status": "configured",
    "data_reliability_score": 85,
    "notes": "Consent Mode V2 aktif, sinyal kaybı minimal"
  },
  
  "SECTION_RECOMMENDATIONS": {
    "actions": [
      {
        "priority": "high",
        "title": "TikTok Smart+ otomasyonuna geçiş",
        "description": "...",
        "expected_impact": "CPA %15-20 düşüş bekleniyor",
        "effort": "medium",
        "timeline": "1-2 hafta",
        "success_metric": "CPA < 35 TL"
      }
    ]
  },
  
  "SECTION_FORWARD_PLANNING": {
    "next_period_goals": [...],
    "strategic_initiatives": [...],
    "budget_recommendations": {...},
    "risk_mitigation": [...]
  }
}
```

### 1.3 Backend API Endpoint'leri

#### [DEĞİŞTİR] `app/backend/app/routers/venus/reports.py`

Mevcut endpoint'lere ek olarak yeni endpoint'ler eklenecek:

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/venus/reports/ai-analysis` | `POST` | AI analiz raporu başlat (iç veri veya dış dosya) |
| `/api/venus/reports/ai-analysis/{id}` | `GET` | Analiz sonucunu al (durum + sonuçlar) |
| `/api/venus/reports/ai-analysis` | `GET` | Tüm AI raporları listele |
| `/api/venus/reports/ai-analysis/{id}` | `DELETE` | AI raporunu sil |
| `/api/venus/reports/upload` | `POST` | Dosya yükle (PDF/Word/Excel/CSV) |
| `/api/venus/reports/download/{id}` | `GET` | PDF rapor indir |

### 1.4 AI Raporlama Analisti – Prompt Mimarisi

#### [YENİ] `app/backend/app/ai/report_analyst.py`

Bu dosya, raporlama yapay zekasının tüm prompt'larını ve yönlendirme kurallarını içerecek:

**Sistem Yönergesi (System Prompt):**
```
Sen, uluslararası ölçekte çalışan, veri odaklı, analitik zekası yüksek ve 15 yıllık
tecrübeye sahip bir Dijital Büyüme Stratejisti ve Kıdemli Performans Pazarlama 
Yöneticisisin. Uzmanlık alanın Google Ads, Meta Ads ve TikTok Ads ekosistemlerindeki 
karmaşık verileri anlamlandırmak, çok kanallı bütçe optimizasyonu yapmak ve 
kampanyalardaki gizli anomalileri tespit etmektir.

Kararlarını asla genel geçer varsayımlara dayanarak alma. Metinlerini, bir markanın 
C-Level yöneticisine sunum yapacak profesyonellikte hazırla. 'Çok iyi gidiyor', 
'Büyük başarı' gibi soyut sıfatlar yerine somut, istatistiksel ve kanıta dayalı 
ifadeler kullan.
```

**TRIM Metodolojisi Entegrasyonu:**
- **T (Görev):** Her analiz modülü için spesifik görev tanımı
- **R (Bağlam):** Sektör, marka hedefleri, pazar koşulları
- **I (Niyet):** Analizin arkasındaki stratejik hedef
- **M (Ölçülebilir Kriterler):** Çıktı formatı ve sayısal eşikler

**İçgörü Üretim Standardı (Her bulgu için):**
1. **Gözlem** – Metrik değişimi (ör: CPA ↑ %18)
2. **Kanıt** – Hangi tarih aralığı, kırılım
3. **Hipotez** – Olası neden (kreatif yorgunluğu, sinyal kaybı vb.)
4. **Doğrulama Önerisi** – Test planı
5. **Eylem** – Kısa/orta vadeli aksiyon
6. **Beklenen Etki & Risk**

### 1.5 Dosya İşleme Servisi

#### [YENİ] `app/backend/app/services/venus/file_processor.py`

Dışarıdan yüklenen dosyaları AI'a göndermek üzere işleyen servis:

| Dosya Türü | İşleme Yöntemi |
|------------|----------------|
| **PDF** | Metin + Görseller çıkarılır → AI'a multimodal girdi olarak gönderilir |
| **DOCX** | python-docx ile metin çıkarılır |
| **XLSX/CSV** | Tablo verileri pandas ile parse edilir → Yapılandırılmış özet |
| **TXT** | Doğrudan metin olarak gönderilir |

**Dosya Boyut Limiti:** Maksimum 25 MB
**Desteklenen Formatlar:** `.pdf`, `.docx`, `.xlsx`, `.csv`, `.txt`

### 1.6 PDF Üretim Motoru

#### [YENİ] `app/backend/app/services/venus/pdf_generator.py`

AI'ın ürettiği yapılandırılmış JSON çıktısını profesyonel bir PDF'e dönüştüren motor:

**PDF Rapor Bölümleri (Hiyerarşik Düzen):**

1. **📊 Kapak + Yönetici Özeti**
   - Logo, dönem, müşteri adı
   - KPI kutucukları (Harcama, Gelir, ROAS, Dönüşüm)
   - "Bu dönemin hikâyesi" – 3-5 satır AI özeti
   - Genel sağlık puanı (yüzdelik gösterge)

2. **📈 Hedef ve İlerleme Durumu**
   - Hedefe yaklaşma ilerleme çubukları
   - Önceki dönemle karşılaştırmalı yüzdeler

3. **💰 Harcama ve Gelir Analizi**
   - Waterfall (Şelale) grafiği mantığı – tablo formatında
   - Kanal bazlı bütçe dağılımı pasta/çubuk grafik

4. **🔍 Platform/Kanal Analizi**
   - Google / Meta / TikTok ayrı sayfalar
   - Her kanalde: KPI şeridi + trend tablosu + AI içgörüsü

5. **🎨 Kreatif ve Format Analizi**
   - En iyi/kötü performanslı kreatifler
   - Format karşılaştırması (video vs görsel vs carousel)

6. **🔄 Dönüşüm Hunisi**
   - Huni aşaması tablosu + darboğaz tespiti

7. **⚡ Değişiklikler ve Etki Analizi**
   - Önce/Sonra karşılaştırma tabloları
   - Bu dönemde yapılan optimizasyonlar

8. **📡 Sinyal Sağlığı ve Veri Güvenilirliği**
   - Tracking kapsama oranı
   - Consent/CAPI/Pixel durumu

9. **🎯 AI Strateji ve Aksiyon Önerileri**
   - Önceliklendirilmiş aksiyon listesi (Etki × Efor matrisi)
   - Her aksiyon için başarı kriteri

10. **🚀 İleriye Dönük Planlama**
    - Sonraki dönem hedefleri
    - Stratejik girişimler
    - Bütçe önerileri
    - Risk azaltma planı

**Tasarım Kuralları:**
- Minimalist, kurumsal ton
- Pastel renk paleti (tutarlı)
- Aynı sayfada max 1 ana grafik + 2 küçük yardımcı
- Yüzdeler/oranlar tek formatta (%12,5)
- Her tabloda metrik tanımı + attribution penceresi notu

### 1.7 Frontend Değişiklikleri

#### [DEĞİŞTİR] `app/web/src/components/venus-ads/reports/AdsReportCenter.tsx`

Mevcut sayfaya eklenecek yeni bölümler:

1. **"Yeni Şablon" Modalı Güncellemesi:**
   - Mevcut 4 şablon türüne ek olarak **"Dosya Analizi"** seçeneği
   - Dosya yükleme alanı (drag & drop)
   - Desteklenen format bilgileri
   - Analiz konfigürasyonu (dönem, hedef KPI'lar, notlar)

2. **Rapor Kartları Güncellemesi:**
   - "AI Analiz" rapor türü kartı (farklı ikon – BrainCircuit)
   - Durum göstergesi (İşleniyor / Tamamlandı / Hata)
   - İlerleme çubuğu (analiz sürerken)
   - **"PDF İndir"** butonu (tamamlanınca)
   - **"Raporu Gör"** butonu (Faz 2 için hazırlık)

#### [YENİ] `app/web/src/components/venus-ads/reports/AIAnalysisForm.tsx`

AI Analiz raporu oluşturma formu:
- Rapor kaynağı seçimi (İç Veri / Dış Dosya / Hibrit)
- Dosya yükleme bölgesi
- Analiz ayarları

#### [YENİ] `app/web/src/components/venus-ads/reports/AIReportProgress.tsx`

AI analiz sürerken gösterilen ilerleme ekranı:
- Animasyonlu progress bar
- Adım adım durum (Dosya okunuyor > Veri analiz ediliyor > Rapor oluşturuluyor)

### 1.8 Store Güncellemesi

#### [DEĞİŞTİR] `app/web/src/stores/venusAdsStore.ts`

Yeni state ve action'lar:
```typescript
// State
aiReports: AIAnalysisReport[]
isAnalyzing: boolean
analysisProgress: number

// Actions
createAIAnalysis(data, file?)
fetchAIReports(projectId?)
deleteAIReport(id)
downloadAIPDF(id)
pollAnalysisStatus(id)
```

---

## 🎨 FAZ 2: Canlı Analiz Dashboard Ekranı (İnteraktif)

### 2.1 Konsept ve Vizyon

Faz 2'de, oluşturulan AI raporuna tıklandığında **tam ekran bir dashboard** açılacaktır. Bu dashboard, **önceden kodlanmış sabit alanlardan** oluşan bir yapıya sahip olacak ve AI bu alanların her birini yapılandırılmış çıktısıyla dolduracaktır.

### 2.2 Dashboard Ekran Tasarımı

```
┌──────────────────────────────────────────────────────────────────┐
│                   📊 AI ANALİZ RAPORU BAŞLIĞI                    │
│            Dönem: 01-15 Mart 2026 | Kaynak: İç Veri             │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │HARCAMA │  │GELİR   │  │ROAS    │  │DÖNÜŞÜM │  │CPA     │    │
│  │₺45.000 │  │₺180.000│  │4.0x    │  │1.250   │  │₺36     │    │
│  │ ▲ %12  │  │ ▲ %18  │  │ ▲ %8   │  │ ▲ %15  │  │ ▼ %10  │    │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘    │
│                                                                  │
│  ┌───────────────────────────┐ ┌───────────────────────────┐    │
│  │ 🏆 YÖNETİCİ ÖZETİ       │ │ 📡 SİNYAL SAĞLIĞI       │    │
│  │                           │ │                           │    │
│  │  Bu dönemin hikâyesi:     │ │  Tracking: ██████░░ %85  │    │
│  │  • ROAS %8 arttı          │ │  Consent:  █████░░░ %78  │    │
│  │  • TikTok büyüdü          │ │  Pixel:    ████████ Aktif│    │
│  │  • Kreatif yenilemesi     │ │  CAPI:     ████████ Tamam│    │
│  │    gerekiyor              │ │                           │    │
│  └───────────────────────────┘ └───────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  📈 KANAL PERFORMANS KARŞILAŞTIRMASI                     │    │
│  │                                                          │    │
│  │  Platform    Harcama    Gelir     ROAS  CPA    Pay       │    │
│  │  ─────────  ────────  ────────  ─────  ─────  ────       │    │
│  │  Google     ₺20.000   ₺85.000   4.25x ₺34    44%       │    │
│  │  Meta       ₺15.000   ₺60.000   4.00x ₺36    33%       │    │
│  │  TikTok     ₺10.000   ₺35.000   3.50x ₺40    22%       │    │
│  │                                                          │    │
│  │  [AI İçgörü: Google kanalı en yüksek ROAS'a sahip...]   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────┐  ┌───────────────────────────┐    │
│  │  🔄 DÖNÜŞÜM HUNİSİ     │  │  ⚡ DEĞİŞİKLİK ETKİSİ   │    │
│  │                          │  │                           │    │
│  │  Gösterim:  3.600.000   │  │  05/03 - Bütçe %20 ↑     │    │
│  │  ████████████████████   │  │  Önce: CPA ₺40 / ROAS 3.5│    │
│  │  Tıklama:     102.600   │  │  Sonra: CPA ₺34 / ROAS 4.2│   │
│  │  █████████████████      │  │  ──────────────────────── │    │
│  │  Sayfa:        85.000   │  │  Net Etki: CPA ▼%15      │    │
│  │  ████████████████       │  │            ROAS ▲%21      │    │
│  │  Sepet:        12.500   │  │                           │    │
│  │  ██████                 │  │  ✅ Pozitif Etki          │    │
│  │  Dönüşüm:      1.250   │  │                           │    │
│  │  ██                     │  │                           │    │
│  └──────────────────────────┘  └───────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  🎨 KREATİF PERFORMANS ANALİZİ                          │    │
│  │                                                          │    │
│  │  Format    CTR    ROAS   Durum                           │    │
│  │  Video     3.2%   4.8x   ✅ Optimal                     │    │
│  │  Görsel    1.8%   3.2x   ⚠️ Yorgunluk belirtisi        │    │
│  │  Carousel  2.4%   3.9x   ✅ İyi                         │    │
│  │                                                          │    │
│  │  [AI: Video formatı en yüksek ROAS getiriyor...]        │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  🎯 AI STRATEJİ VE AKSİYON ÖNERİLERİ                   │    │
│  │                                                          │    │
│  │  #  Aksiyon              Etki   Efor   Süre   Durum     │    │
│  │  1  TikTok Smart+        Yüksek Orta   1-2h   🔴 Acil  │    │
│  │  2  Meta kreatif yenile  Yüksek Düşük  3gün   🟡 Orta  │    │
│  │  3  Google bid strateji  Orta   Düşük  1h     🟢 Plan  │    │
│  │                                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  🚀 İLERİYE DÖNÜK PLANLAMA                              │    │
│  │                                                          │    │
│  │  Sonraki Dönem Hedefleri:                                │    │
│  │  • ROAS hedefi: 4.5x (mevcut: 4.0x)                    │    │
│  │  • CPA hedefi: ₺30 (mevcut: ₺36)                       │    │
│  │  • Yeni platform testi: Pinterest / LinkedIn             │    │
│  │                                                          │    │
│  │  Stratejik Girişimler:                                   │    │
│  │  • Kreatif A/B test programı başlatılması                │    │
│  │  • Server-side tracking altyapı güçlendirmesi           │    │
│  │  • Çapraz kanal attribution modeli kurulması             │    │
│  │                                                          │    │
│  │  Risk Azaltma:                                           │    │
│  │  • Meta dijital hizmet vergisi etkisi izlenmeli          │    │
│  │  • Google API sürüm geçişleri takip edilmeli             │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [📥 PDF İndir]  [🔄 Yeniden Analiz Et]  [📤 Paylaş]          │
└──────────────────────────────────────────────────────────────────┘
```

### 2.3 Dashboard Bileşen Yapısı

#### [YENİ] `app/web/src/components/venus-ads/reports/AIReportDashboard.tsx`

Ana dashboard konteyneri – URL: `/venus-ads/reports/ai/{reportId}`

#### [YENİ] `app/web/src/components/venus-ads/reports/dashboard/`

```
dashboard/
├── KPICardRow.tsx           # Üst KPI kutucukları satırı
├── ExecutiveSummary.tsx      # Yönetici özeti kartı
├── SignalHealthCard.tsx      # Sinyal sağlığı kartı
├── ChannelBreakdownTable.tsx # Kanal performans tablosu
├── FunnelVisualization.tsx   # Dönüşüm hunisi görseli
├── ChangeImpactCard.tsx      # Değişiklik etki analizi
├── CreativeAnalysis.tsx      # Kreatif performans kartı
├── RecommendationsTable.tsx  # AI aksiyon önerileri
├── ForwardPlanningCard.tsx   # İleriye dönük planlama
└── ReportHeader.tsx          # Rapor başlık ve meta bilgiler
```

### 2.4 AI – Dashboard Veri Eşleştirmesi

AI'ın ürettiği her JSON alanı, dashboard'daki karşılık gelen bileşene otomatik olarak eşlenecek:

| AI JSON Alanı | Dashboard Bileşeni | Görsel Tip |
|---------------|--------------------|------------|
| `SECTION_EXEC_SUMMARY` | `ExecutiveSummary.tsx` | Metin + Badge'ler |
| `SECTION_KPI_OVERVIEW` | `KPICardRow.tsx` | Sayısal kutucuklar + Yüzde değişim okları |
| `SECTION_CHANNEL_BREAKDOWN` | `ChannelBreakdownTable.tsx` | Tablo + Yatay çubuklar |
| `SECTION_TOP_CAMPAIGNS` | `ChannelBreakdownTable.tsx` içinde | Sıralanmış liste |
| `SECTION_CREATIVE_ANALYSIS` | `CreativeAnalysis.tsx` | Tablo + Durum ikonları |
| `SECTION_FUNNEL_ANALYSIS` | `FunnelVisualization.tsx` | Huni grafiği + Darboğaz işaretleri |
| `SECTION_CHANGES_AND_IMPACT` | `ChangeImpactCard.tsx` | Önce/Sonra karşılaştırma tablosu |
| `SECTION_SIGNAL_HEALTH` | `SignalHealthCard.tsx` | Progress barlar + Durum ikonları |
| `SECTION_RECOMMENDATIONS` | `RecommendationsTable.tsx` | Etki/Efor matrisi tablosu |
| `SECTION_FORWARD_PLANNING` | `ForwardPlanningCard.tsx` | Hedef listesi + Girişimler |

### 2.5 Tasarım Prensipleri

- **Genel tasarım bütünlüğüne uyum:** My World'ün mevcut dark/light mode yapısıyla uyumlu
- **Renk paleti:** Mevcut `brand-dark`, `brand-gray` + yeşil (pozitif), kırmızı (negatif), sarı (uyarı)
- **Kart yapısı:** Mevcut `rounded-2xl shadow-sm border` stiliyle uyumlu
- **Responsive:** Desktop-first ama mobilde de kullanılabilir akıcı grid
- **Animasyonlar:** Sayılar yüklenirken count-up animasyonu, kartlar fade-in
- **Minimalizm:** Edward Tufte prensibi – her piksel veri taşımalı

---

## 📁 FAZ BAZLI DOSYA ÖZETİ

### Faz 1 – İndirilebilir PDF Rapor

| İşlem | Dosya | Açıklama |
|-------|-------|----------|
| [YENİ] | `models/venus/ai_analysis_report.py` | Veritabanı modeli |
| [YENİ] | `schemas/venus/ai_analysis_report.py` | Pydantic şemaları |
| [YENİ] | `services/venus/ai_report_analyst.py` | AI prompt motoru & analiz servisi |
| [YENİ] | `services/venus/file_processor.py` | Dosya işleme servisi (PDF/Word/Excel) |
| [YENİ] | `services/venus/pdf_generator.py` | PDF oluşturma motoru |
| [DEĞİŞTİR] | `routers/venus/reports.py` | Yeni endpoint'ler |
| [DEĞİŞTİR] | `ai/prompts.py` | Rapor analisti prompt'ları |
| [DEĞİŞTİR] | `AdsReportCenter.tsx` | Dosya yükleme + AI rapor kartları |
| [YENİ] | `reports/AIAnalysisForm.tsx` | AI analiz formu |
| [YENİ] | `reports/AIReportProgress.tsx` | İlerleme ekranı |
| [DEĞİŞTİR] | `venusAdsStore.ts` | Yeni state/action'lar |
| [DEĞİŞTİR] | `types/venus-ads.ts` | Yeni tip tanımları |

### Faz 2 – Canlı Analiz Dashboard

| İşlem | Dosya | Açıklama |
|-------|-------|----------|
| [YENİ] | `reports/AIReportDashboard.tsx` | Ana dashboard ekranı |
| [YENİ] | `reports/dashboard/KPICardRow.tsx` | KPI kutucukları |
| [YENİ] | `reports/dashboard/ExecutiveSummary.tsx` | Yönetici özeti |
| [YENİ] | `reports/dashboard/SignalHealthCard.tsx` | Sinyal sağlığı |
| [YENİ] | `reports/dashboard/ChannelBreakdownTable.tsx` | Kanal analizi |
| [YENİ] | `reports/dashboard/FunnelVisualization.tsx` | Huni görseli |
| [YENİ] | `reports/dashboard/ChangeImpactCard.tsx` | Değişiklik etkisi |
| [YENİ] | `reports/dashboard/CreativeAnalysis.tsx` | Kreatif analiz |
| [YENİ] | `reports/dashboard/RecommendationsTable.tsx` | Öneriler |
| [YENİ] | `reports/dashboard/ForwardPlanningCard.tsx` | İleriye dönük plan |
| [YENİ] | `reports/dashboard/ReportHeader.tsx` | Rapor başlığı |

---

## 🔄 İŞ AKIŞI DİYAGRAMI

### Faz 1: İç Veri ile Rapor Oluşturma

```
Kullanıcı "Yeni Şablon" → "İç Veri Raporu" seçer
    ↓
Analiz ayarları (dönem, KPI hedefleri) girer
    ↓
Backend: İç metrik verileri toplanır (kampanya, kreatif, dönüşüm)
    ↓
AI Analiz Motoru: Verileri TRIM metodolojisiyle analiz eder
    ↓
AI: Yapılandırılmış JSON çıktısı üretir (kodlanmış alan isimleriyle)
    ↓
PDF Üretim Motoru: JSON'ı profesyonel PDF'e dönüştürür
    ↓
Kullanıcı: "PDF İndir" ile raporu indirir
```

### Faz 1: Dış Dosya ile Rapor Oluşturma

```
Kullanıcı "Yeni Şablon" → "Dosya Analizi" seçer
    ↓
Dosya yükler (PDF/Word/Excel/CSV)
    ↓
Backend: Dosya işlenir (metin + görseller çıkarılır)
    ↓
AI: Dosya içeriğini multimodal olarak analiz eder
    ↓
AI: Yapılandırılmış JSON çıktısı üretir
    ↓
PDF Üretim Motoru: JSON'ı profesyonel PDF'e dönüştürür
    ↓
Kullanıcı: "PDF İndir" ile raporu indirir
```

### Faz 2: Dashboard Görüntüleme

```
Kullanıcı: Tamamlanmış AI raporuna tıklar → "Raporu Gör"
    ↓
Tam ekran dashboard açılır
    ↓
Her bileşen, AI'ın ürettiği JSON'dan ilgili veriyi alır:
  • KPICardRow       ← SECTION_KPI_OVERVIEW
  • ExecutiveSummary  ← SECTION_EXEC_SUMMARY
  • ChannelBreakdown  ← SECTION_CHANNEL_BREAKDOWN
  • FunnelVis         ← SECTION_FUNNEL_ANALYSIS
  • ChangeImpact      ← SECTION_CHANGES_AND_IMPACT
  • SignalHealth      ← SECTION_SIGNAL_HEALTH
  • Recommendations   ← SECTION_RECOMMENDATIONS
  • ForwardPlanning   ← SECTION_FORWARD_PLANNING
    ↓
Dashboard canlı, animasyonlu ve etkileşimli şekilde gösterilir
    ↓
Alt kısımda "PDF İndir" | "Yeniden Analiz Et" | "Paylaş" butonları
```

---

## ✅ DOĞRULAMA PLANI

### Otomatik Testler
- Backend API endpoint'leri için unit test'ler
- AI prompt çıktı formatı doğrulama test'leri
- Dosya yükleme limitlerinin test edilmesi

### Manuel Doğrulama
1. **Faz 1 Test:** Rapor Merkezi'nden "Dosya Analizi" seçilerek bir PDF yüklenir, AI analiz tamamlanıp PDF indirilir ve içerik doğrulanır
2. **Faz 1 Test:** İç veri raporu oluşturulur, KPI değerleri veritabanıyla karşılaştırılır
3. **Faz 2 Test:** Dashboard'da tüm bileşenlerin veriyle dolduğu, responsive tasarımın çalıştığı kontrol edilir

---

## 📅 TAHMİNİ ZAMAN ÇİZELGESİ

| Faz | Kapsam | Tahmini Süre |
|-----|--------|-------------|
| **Faz 1.1** | Backend modeller + şemalar + yeni endpoint'ler | 1-2 saat |
| **Faz 1.2** | Dosya işleme servisi | 1 saat |
| **Faz 1.3** | AI prompt mimarisi + analiz motoru | 2 saat |
| **Faz 1.4** | PDF üretim motoru | 2 saat |
| **Faz 1.5** | Frontend – Form + İlerleme + Kart güncellemeleri | 2 saat |
| **Faz 1.6** | Store + Tip güncellemeleri + Entegrasyon | 1 saat |
| **Faz 2.1** | Dashboard bileşenleri kodlama | 3-4 saat |
| **Faz 2.2** | AI-Dashboard veri eşleştirme + Tasarım | 2 saat |
| **Faz 2.3** | Dashboard animasyonlar + polish | 1-2 saat |

---

## 🔑 BAĞIMLILIKLAR VE GEREKSİNİMLER

### Python Backend
- `python-docx` – Word dosyası okuma
- `openpyxl` – Excel dosyası okuma
- `pdfplumber` veya `PyMuPDF` – PDF metin + görsel çıkarma
- `reportlab` veya `weasyprint` – PDF oluşturma
- `pandas` – Tablo verisi işleme

### Frontend
- Mevcut Lucide iconlar yeterli (ek: `BrainCircuit`, `Upload`, `FileUp`)
- Dosya yükleme: HTML5 File API (ek kütüphane gerekmez)

---

> **⚠️ NOT:** Bu plan dokümanı onayınız alındıktan sonra kodlamaya geçilecektir. Herhangi bir değişiklik veya ekleme varsa lütfen belirtiniz.
