# PLAN: Venüs Reklam Operasyon Paneli
## My World Dashboard'a Güvenli Entegrasyon

> **Tarih:** 2026-03-15
> **Durum:** PLAN AŞAMASI — Kod yazılmayacak, sadece yol haritası
> **Hedef:** Mevcut My World projesini ASLA bozmadan, dashboard'un içine yeni sayfalar olarak Venüs Reklam Paneli'ni entegre etmek

---

## 🎯 PROJE ÖZETİ

"Venüs Reklam Operasyon Paneli" — ajans içi bir reklam yönetim merkezi. İlk sürümde entegrasyonsuz (Google/Meta bağlantısı olmadan) çalışan modüllerle değer üretilecek. Panele dashboarddan tek tıkla erişilecek. **Mevcut hiçbir dosya bozulmayacak.**

### Entegrasyon Stratejisi (SIFIR RİSK)

Mevcut My World projesi şu yapıda çalışıyor:

```
projectStore.ts → ViewMode = 'dashboard' | 'all_tasks' | 'project' | 'notes' | 'calendar' | 'ai_chat'
TopNavbar.tsx   → navItems[] dizisi ile menü oluşturuluyor
page.tsx        → viewMode'a göre ilgili bileşen render ediliyor
```

**Yapacağımız değişiklikler:**

1. `ViewMode` tipine `'venus_ads'` eklenmesi (1 satır)
2. `TopNavbar.tsx`'deki `navItems[]` dizisine yeni menü eklenmesi (1 satır)
3. `page.tsx`'de viewMode kontrolüne yeni koşul eklenmesi (3 satır)
4. Tüm yeni kod `components/venus-ads/` klasörüne yazılacak — mevcut dosyalara dokunulmayacak
5. Backend'de yeni router'lar `routers/venus/` altına — mevcut router'lara dokunulmayacak

> **Risk Değerlendirmesi:** Mevcut dosyalardaki değişiklik yalnızca 3 satırlık ekleme. Hiçbir mevcut kod silinmeyecek veya değiştirilmeyecek.

---

## 📐 MİMARİ PLAN

### Frontend Dosya Yapısı (Yeni)

```
app/web/src/
├── components/
│   └── venus-ads/                          # ⭐ TÜM YENİ KODLAR BURADA
│       ├── VenusAdsLayout.tsx              # Ana container + iç navigasyon (tab sistemi)
│       ├── VenusAdsSidebar.tsx             # Sol panel: iç sayfa menüsü
│       │
│       ├── overview/                       # ANA KONTROL PANELİ
│       │   └── VenusOverview.tsx           # KPI şeridi + özet kartları + AI insight
│       │
│       ├── campaigns/                      # KAMPANYA ANALİZ
│       │   ├── CampaignExplorer.tsx        # Kampanya listesi + filtreler + sıralama
│       │   ├── CampaignCard.tsx            # Kampanya özet kartı
│       │   └── CampaignDetailPanel.tsx     # Kampanya detay (glassmorphism panel)
│       │
│       ├── tests/                          # TEST MERKEZİ
│       │   ├── TestCenter.tsx              # A/B test listesi + yeni test ekleme
│       │   ├── TestCard.tsx                # Test kartı (hipotez, durum, sonuç)
│       │   └── TestTemplateLibrary.tsx     # Ön tanımlı test şablonları
│       │
│       ├── creatives/                      # KREATİF LABORATUVARI
│       │   ├── CreativeLibrary.tsx         # Reklam görseli/video arşivi
│       │   ├── CreativeCard.tsx            # Kreatif kartı (performans badge'leri)
│       │   └── CreativeBriefGenerator.tsx  # AI brief üretici
│       │
│       ├── reports/                        # RAPOR MERKEZİ
│       │   ├── AdsReportCenter.tsx         # Rapor oluşturucu + geçmiş raporlar
│       │   ├── ReportTemplate.tsx          # Şablon seçici
│       │   └── ExportableReport.tsx        # Müşteriye paylaşılacak rapor
│       │
│       ├── tasks/                          # OPERASYON & GÖREV
│       │   ├── AdsTaskBoard.tsx            # Reklam operasyonlarına özel kanban
│       │   └── AdsActionCard.tsx           # Aksiyon kartı (AI öneriden→görev)
│       │
│       ├── benchmark/                      # BENCHMARK & RAKİP
│       │   ├── BenchmarkDashboard.tsx      # Rakip araştırma + sektör karşılaştırma
│       │   └── CompetitorCard.tsx          # Rakip marka kartı
│       │
│       ├── onboarding/                     # DEVRALMA (ONBOARDING)
│       │   ├── OnboardingChecklist.tsx     # Yeni müşteri devralma checklist'i
│       │   └── ChecklistItem.tsx           # Checklist maddesi
│       │
│       ├── ai-insights/                    # AI YORUM & OTOMASYON
│       │   ├── AIInsightsPanel.tsx         # AI özet ve öneriler paneli
│       │   └── AnomalyAlertCard.tsx        # Anomali uyarı kartı
│       │
│       ├── csv-import/                     # VERİ İÇE AKTARMA
│       │   └── CSVImporter.tsx             # Manuel CSV yükleme + mapping
│       │
│       └── shared/                         # ORTAK BİLEŞENLER
│           ├── VenusKPIBar.tsx             # KPI şeridi (harcama, gelir, ROAS, CPA)
│           ├── MetricCard.tsx              # Tek metrik kartı
│           ├── PlatformBadge.tsx           # Google/Meta/GA4 platform rozeti
│           ├── DateRangeSelector.tsx        # Tarih aralığı seçici
│           ├── AICommentBox.tsx            # AI yorum kutusu (sağ panel)
│           └── StatusBadge.tsx             # Durum rozeti (aktif/durdurulmuş/test)
│
├── stores/
│   └── venusAdsStore.ts                    # ⭐ YENİ ZUSTAND STORE
│
└── types/
    └── venus-ads.ts                        # ⭐ YENİ TYPESCRIPT TİPLERİ
```

### Backend Dosya Yapısı (Yeni)

```
app/backend/app/
├── models/
│   └── venus/                              # ⭐ YENİ MODELLER
│       ├── __init__.py
│       ├── ad_account.py                   # Reklam hesabı
│       ├── campaign.py                     # Kampanya
│       ├── daily_metric.py                 # Günlük metrikler
│       ├── creative.py                     # Kreatif arşivi
│       ├── experiment.py                   # A/B test (deney)
│       ├── ads_task.py                     # Reklam operasyon görevi
│       ├── competitor.py                   # Rakip marka
│       ├── onboarding_checklist.py         # Devralma checklist
│       ├── csv_import.py                   # CSV import kaydı
│       ├── ai_observation.py              # AI gözlem/yorum
│       └── report_template.py             # Rapor şablonu
│
├── schemas/
│   └── venus/                              # ⭐ YENİ SCHEMA'LAR
│       ├── __init__.py
│       ├── campaign.py
│       ├── creative.py
│       ├── experiment.py
│       ├── metric.py
│       ├── report.py
│       └── onboarding.py
│
├── routers/
│   └── venus/                              # ⭐ YENİ ROUTER'LAR
│       ├── __init__.py
│       ├── campaigns.py                    # /api/venus/campaigns
│       ├── creatives.py                    # /api/venus/creatives
│       ├── experiments.py                  # /api/venus/experiments
│       ├── metrics.py                      # /api/venus/metrics
│       ├── reports.py                      # /api/venus/reports
│       ├── tasks.py                        # /api/venus/tasks
│       ├── benchmark.py                    # /api/venus/benchmark
│       ├── onboarding.py                   # /api/venus/onboarding
│       ├── csv_import.py                   # /api/venus/csv-import
│       └── ai_insights.py                  # /api/venus/ai-insights
│
└── services/
    └── venus/                              # ⭐ YENİ SERVİSLER
        ├── __init__.py
        ├── metric_calculator.py            # Metrik hesaplama (ROAS, CPA, CTR)
        ├── ai_analyzer.py                  # AI analiz motoru
        ├── csv_parser.py                   # CSV ayrıştırma
        └── report_builder.py              # Rapor oluşturucu
```

---

## 🗄️ VERİTABANI ŞEMASI (YENİ TABLOLAR)

> Mevcut tablolara ASLA dokunulmaz. Tüm tablolar `venus_` prefix'i ile oluşturulacak.

### venus_ad_accounts
| Kolon | Tip | Not |
|-------|-----|-----|
| id | INT PK | |
| user_id | INT FK→users | |
| platform | VARCHAR | "google_ads" / "meta" / "ga4" |
| account_name | VARCHAR | |
| account_id_external | VARCHAR | Nullable (entegrasyon sonrası) |
| status | VARCHAR | "active" / "paused" / "disconnected" |
| notes | TEXT | |
| created_at | TIMESTAMP(tz) | |

### venus_campaigns
| Kolon | Tip | Not |
|-------|-----|-----|
| id | INT PK | |
| user_id | INT FK→users | |
| ad_account_id | INT FK→venus_ad_accounts | Nullable |
| platform | VARCHAR | "google_ads" / "meta" / "manual" |
| campaign_name | VARCHAR | |
| campaign_type | VARCHAR | "search" / "pmax" / "shopping" / "awareness" / "conversion" / "remarketing" |
| status | VARCHAR | "active" / "paused" / "ended" / "draft" |
| objective | TEXT | Kampanya amacı |
| budget_daily | DECIMAL | Nullable |
| budget_total | DECIMAL | Nullable |
| start_date | DATE | |
| end_date | DATE | Nullable |
| target_audience | TEXT | Nullable |
| notes | TEXT | |
| ai_analysis | TEXT | AI yorumu |
| tags | JSON | default [] |
| created_at | TIMESTAMP(tz) | |

### venus_daily_metrics
| Kolon | Tip | Not |
|-------|-----|-----|
| id | INT PK | |
| user_id | INT FK→users | |
| campaign_id | INT FK→venus_campaigns | |
| date | DATE | |
| platform | VARCHAR | |
| spend | DECIMAL | Harcama |
| impressions | INT | Gösterim |
| clicks | INT | Tıklama |
| ctr | DECIMAL | Tıklama oranı |
| cpc | DECIMAL | Tıklama başı maliyet |
| conversions | INT | Dönüşüm |
| conversion_value | DECIMAL | Dönüşüm değeri |
| purchases | INT | Satın alma |
| purchase_value | DECIMAL | Satın alma değeri |
| roas | DECIMAL | Reklam harcama getirisi |
| cpa | DECIMAL | Edinim başı maliyet |
| frequency | DECIMAL | Frekans (Meta) |
| source | VARCHAR | "api" / "csv" / "manual" |
| created_at | TIMESTAMP(tz) | |

### venus_creatives
| Kolon | Tip | Not |
|-------|-----|-----|
| id | INT PK | |
| user_id | INT FK→users | |
| campaign_id | INT FK→venus_campaigns | Nullable |
| title | VARCHAR | |
| creative_type | VARCHAR | "image" / "video" / "carousel" / "text" / "story" |
| asset_url | VARCHAR | Nullable (dosya yolu veya URL) |
| thumbnail_url | VARCHAR | Nullable |
| headline | VARCHAR | Reklam başlığı |
| description | TEXT | Reklam açıklaması |
| hook_text | TEXT | Hook metni |
| angle_type | VARCHAR | "lifestyle" / "product" / "ugc" / "testimonial" / "offer" |
| performance_score | INT | 1-10 puan |
| status | VARCHAR | "active" / "fatigued" / "retired" / "draft" |
| tags | JSON | default [] |
| ai_analysis | TEXT | |
| notes | TEXT | |
| created_at | TIMESTAMP(tz) | |

### venus_experiments
| Kolon | Tip | Not |
|-------|-----|-----|
| id | INT PK | |
| user_id | INT FK→users | |
| campaign_id | INT FK→venus_campaigns | Nullable |
| title | VARCHAR | Test adı |
| hypothesis | TEXT | Hipotez |
| variable_tested | VARCHAR | Test edilen değişken |
| variant_a | TEXT | A varyantı |
| variant_b | TEXT | B varyantı |
| status | VARCHAR | "planned" / "running" / "completed" / "cancelled" |
| start_date | DATE | |
| end_date | DATE | Nullable |
| result_summary | TEXT | Nullable |
| winner | VARCHAR | Nullable ("a" / "b" / "inconclusive") |
| next_action | TEXT | Sonraki aksiyon |
| ai_suggestion | TEXT | AI önerisi |
| tags | JSON | default [] |
| created_at | TIMESTAMP(tz) | |

### venus_ads_tasks
| Kolon | Tip | Not |
|-------|-----|-----|
| id | INT PK | |
| user_id | INT FK→users | |
| campaign_id | INT FK→venus_campaigns | Nullable |
| title | VARCHAR | |
| description | TEXT | |
| category | VARCHAR | "daily_check" / "weekly_review" / "monthly_report" / "creative" / "optimization" / "testing" / "client" |
| priority | VARCHAR | "urgent" / "normal" / "low" |
| status | VARCHAR | "todo" / "in_progress" / "done" |
| due_date | DATE | Nullable |
| source | VARCHAR | "manual" / "ai_suggestion" / "anomaly" / "routine" |
| ai_notes | TEXT | Nullable |
| completed_at | TIMESTAMP(tz) | Nullable |
| created_at | TIMESTAMP(tz) | |

### venus_competitors
| Kolon | Tip | Not |
|-------|-----|-----|
| id | INT PK | |
| user_id | INT FK→users | |
| brand_name | VARCHAR | |
| website_url | VARCHAR | Nullable |
| ad_library_url | VARCHAR | Nullable |
| category | VARCHAR | |
| notes | TEXT | |
| strengths | TEXT | Güçlü yönleri |
| weaknesses | TEXT | Zayıf yönleri |
| creative_style | TEXT | Kreatif tarzı |
| tags | JSON | default [] |
| created_at | TIMESTAMP(tz) | |

### venus_onboarding_checklists
| Kolon | Tip | Not |
|-------|-----|-----|
| id | INT PK | |
| user_id | INT FK→users | |
| client_name | VARCHAR | Müşteri adı |
| status | VARCHAR | "in_progress" / "completed" |
| items | JSON | Checklist maddeleri [{title, done, notes}] |
| notes | TEXT | |
| created_at | TIMESTAMP(tz) | |

### venus_csv_imports
| Kolon | Tip | Not |
|-------|-----|-----|
| id | INT PK | |
| user_id | INT FK→users | |
| filename | VARCHAR | |
| platform_source | VARCHAR | "google_ads" / "meta" / "ga4" / "other" |
| rows_imported | INT | |
| status | VARCHAR | "success" / "failed" / "partial" |
| error_log | TEXT | Nullable |
| created_at | TIMESTAMP(tz) | |

### venus_ai_observations
| Kolon | Tip | Not |
|-------|-----|-----|
| id | INT PK | |
| user_id | INT FK→users | |
| campaign_id | INT FK→venus_campaigns | Nullable |
| observation_type | VARCHAR | "summary" / "anomaly" / "recommendation" / "test_idea" / "creative_feedback" |
| title | VARCHAR | |
| content | TEXT | |
| severity | VARCHAR | "info" / "warning" / "critical" |
| is_acknowledged | BOOL | default false |
| related_date_range | VARCHAR | "yesterday" / "last_7_days" / "last_30_days" |
| created_at | TIMESTAMP(tz) | |

### venus_report_templates
| Kolon | Tip | Not |
|-------|-----|-----|
| id | INT PK | |
| user_id | INT FK→users | |
| title | VARCHAR | |
| template_type | VARCHAR | "daily" / "weekly" / "monthly" / "client" |
| sections | JSON | Rapor bölümleri |
| is_default | BOOL | |
| created_at | TIMESTAMP(tz) | |

---

## 📡 API ENDPOINT HARİTASI (YENİ)

> Tüm endpoint'ler `/api/venus/` prefix'i ile — mevcut endpoint'lere DOKUNULMAZ.

### Kampanya Yönetimi
| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/api/venus/campaigns` | Kampanya listesi (filtre: platform, status, tarih) |
| POST | `/api/venus/campaigns` | Yeni kampanya |
| GET | `/api/venus/campaigns/{id}` | Kampanya detay |
| PUT | `/api/venus/campaigns/{id}` | Kampanya güncelle |
| DELETE | `/api/venus/campaigns/{id}` | Kampanya sil |

### Metrikler
| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/api/venus/metrics/overview` | Genel KPI özeti (toplam harcama, ROAS, CPA) |
| GET | `/api/venus/metrics/daily?campaign_id=&start=&end=` | Günlük metrikler |
| POST | `/api/venus/metrics/daily` | Manuel metrik girişi |
| GET | `/api/venus/metrics/trends` | Trend analizi (haftalık/aylık karşılaştırma) |

### Kreatifler
| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/api/venus/creatives` | Kreatif listesi |
| POST | `/api/venus/creatives` | Yeni kreatif |
| PUT | `/api/venus/creatives/{id}` | Kreatif güncelle |
| DELETE | `/api/venus/creatives/{id}` | Kreatif sil |

### Test Merkezi
| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/api/venus/experiments` | Test listesi |
| POST | `/api/venus/experiments` | Yeni test |
| PUT | `/api/venus/experiments/{id}` | Test güncelle |
| GET | `/api/venus/experiments/templates` | Hazır test şablonları |

### Operasyon Görevleri
| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/api/venus/tasks` | Reklam görev listesi |
| POST | `/api/venus/tasks` | Yeni görev |
| PUT | `/api/venus/tasks/{id}` | Görev güncelle |
| PATCH | `/api/venus/tasks/{id}/status` | Durum değiştir |

### Benchmark & Rakip
| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/api/venus/competitors` | Rakip listesi |
| POST | `/api/venus/competitors` | Yeni rakip |
| PUT | `/api/venus/competitors/{id}` | Rakip güncelle |

### Onboarding (Devralma)
| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/api/venus/onboarding` | Checklist listesi |
| POST | `/api/venus/onboarding` | Yeni checklist |
| PUT | `/api/venus/onboarding/{id}` | Checklist güncelle |

### CSV İçe Aktarma
| Metot | Yol | Açıklama |
|-------|-----|----------|
| POST | `/api/venus/csv-import/upload` | CSV yükle + parse et |
| GET | `/api/venus/csv-import/history` | Import geçmişi |

### AI Analizleri
| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/api/venus/ai/overview-summary` | AI genel durum özeti |
| POST | `/api/venus/ai/analyze-campaign/{id}` | Kampanya AI analizi |
| POST | `/api/venus/ai/generate-test-ideas` | AI test önerisi üret |
| POST | `/api/venus/ai/creative-brief` | AI kreatif brifi üret |
| GET | `/api/venus/ai/anomalies` | Anomali tespitleri |

### Raporlar
| Metot | Yol | Açıklama |
|-------|-----|----------|
| GET | `/api/venus/reports` | Rapor listesi |
| POST | `/api/venus/reports/generate` | Rapor oluştur (AI destekli) |
| GET | `/api/venus/reports/{id}/export` | Rapor dışa aktar |
| GET | `/api/venus/reports/templates` | Rapor şablonları |

---

## 🖥️ EKRAN MİMARİSİ (UI)

### 1. Venüs Ana Layout (VenusAdsLayout.tsx)
Venüs Reklam'a geçildiğinde render edilen ana container. Kendi iç navigasyonuna sahip.

```
┌──────────────────────────────────────────────────────────┐
│ [My World Üst NavBar — mevcut, değişmez]                │
├────────┬─────────────────────────────────────────────────┤
│        │  [Venüs Üst Başlık + Tarih Filtresi]           │
│  SOL   │─────────────────────────────────────────────────│
│  MENÜ  │                                                 │
│        │  [AKTİF EKRANIN İÇERİĞİ]                      │
│  📊 Genel│                                               │
│  📈 Kampanya│                                            │
│  🧪 Testler │                                            │
│  🎨 Kreatif│                                             │
│  📋 Görevler│                                            │
│  📑 Raporlar│                                            │
│  📥 Veri İçe│                                            │
│  🎯 Rakipler│                                            │
│  📝 Devralma│                                            │
│  🤖 AI Panel│                                            │
│        │                                                 │
├────────┴─────────────────────────────────────────────────┤
```

### 2. Genel Bakış Ekranı (VenusOverview.tsx)
```
┌──────────────────────────────────────────────────────────┐
│ 💰 Toplam     📊 Toplam     📈 ROAS      💲 CPA         │
│ Harcama       Dönüşüm       Ortalaması   Ortalaması     │
│ ₺45,230       127           3.42         ₺356           │
├──────────────────────────┬───────────────────────────────┤
│ 📊 Harcama Trendi        │  🤖 AI Günlük Özet            │
│ [Çubuk/Çizgi Grafik]     │  "Son 7 günde ROAS %12 düştü, │
│ Son 30 gün               │   PMax kampanyası bütçe..."   │
├──────────────────────────┼───────────────────────────────┤
│ ⚡ Bugünkü 5 Kritik İş    │  🔴 Anomali Uyarıları        │
│ 1. Budget reset kontrol  │  • CPA anormal yükseldi       │
│ 2. Search term temizle   │  • Frekans 4.2'ye çıktı       │
│ 3. Yeni kreatif test     │  • Dönüşüm %30 düştü          │
│ 4. Haftalık rapor üret   │                               │
│ 5. Müşteri toplantı notu │                               │
├──────────────────────────┴───────────────────────────────┤
│ 📋 Kampanya Performans Özet Tablosu                      │
│ [Platform | Kampanya | Harcama | ROAS | CPA | Durum]     │
└──────────────────────────────────────────────────────────┘
```

### 3. Kampanya Explorer (CampaignExplorer.tsx)
```
┌──────────────────────────────────────────────────────────┐
│ [Platform: Tümü ▼] [Durum: Tümü ▼] [Tarih: Son 30 gün]  │
├──────────────────────────────────────────────────────────┤
│ ┌────────────────────┐ ┌────────────────────┐            │
│ │ 🟢 PMax - Ayakkabı  │ │ 🟡 Search - Marka   │          │
│ │ Google Ads          │ │ Google Ads           │          │
│ │ ₺1,200/gün         │ │ ₺500/gün             │          │
│ │ ROAS: 4.2 ✅       │ │ ROAS: 2.1 ⚠️        │          │
│ │ CPA: ₺85           │ │ CPA: ₺320            │          │
│ └────────────────────┘ └────────────────────┘            │
│ ┌────────────────────┐ ┌────────────────────┐            │
│ │ 🔵 Conversion       │ │ 🟣 Katalog Satış     │          │
│ │ Meta Ads            │ │ Meta Ads              │          │
│ │ ₺800/gün           │ │ ₺600/gün              │          │
│ │ ROAS: 3.0 ✅       │ │ ROAS: 1.8 ⚠️        │          │
│ └────────────────────┘ └────────────────────┘            │
├──────────────────────────────────────────────────────────┤
│ [Kampanya tıklanınca → CampaignDetailPanel açılır]       │
│ Sol: Performans grafikleri  |  Sağ: AI Analiz & Öneriler │
└──────────────────────────────────────────────────────────┘
```

### 4. Test Merkezi (TestCenter.tsx)
```
┌──────────────────────────────────────────────────────────┐
│ [+ Yeni Test] [Şablonlar] [Durum: Tümü ▼]               │
├──────────────────────────────────────────────────────────┤
│ PLANLANMIŞ          │ DEVAM EDİYOR        │ TAMAMLANAN   │
│ ┌─────────────────┐ │ ┌─────────────────┐ │ ┌──────────┐│
│ │ Lifestyle vs     │ │ │ Fiyat vs Kalite  │ │ │ Broad vs ││
│ │ Product görsel   │ │ │ mesajı           │ │ │ Lookalike││
│ │ Hipotez: ...     │ │ │ Başlangıç: 10/3  │ │ │ Kazanan: ││
│ │ Değişken: görsel │ │ │ Değişken: başlık │ │ │ Broad ✅ ││
│ └─────────────────┘ │ └─────────────────┘ │ └──────────┘│
└──────────────────────────────────────────────────────────┘
```

### 5. Kreatif Laboratuvarı (CreativeLibrary.tsx)
```
┌──────────────────────────────────────────────────────────┐
│ [+ Kreatif Ekle] [AI Brief Üret] [Tür: Tümü ▼]         │
├──────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ 🖼️       │ │ 🎬       │ │ 🖼️       │ │ 📝       │     │
│ │ Thumbnail│ │ Video Th.│ │ Carousel │ │ Text Ad  │     │
│ │──────────│ │──────────│ │──────────│ │──────────│     │
│ │ ⭐ 8/10  │ │ ⭐ 6/10  │ │ ⭐ 9/10  │ │ ⭐ 5/10  │     │
│ │ Lifestyle│ │ UGC      │ │ Product  │ │ Offer    │     │
│ │ 🟢 Aktif │ │ 🔴 Bitmiş│ │ 🟢 Aktif │ │ 🟡 Taslak│     │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                           │
│ AI Kreatif Yorum: "Lifestyle görseller %40 daha iyi CTR" │
└──────────────────────────────────────────────────────────┘
```

### 6. Rapor Merkezi (AdsReportCenter.tsx)
```
┌──────────────────────────────────────────────────────────┐
│ [+ Rapor Oluştur]  [Şablonlar]  [Tür: Tümü ▼]          │
├──────────────────────┬───────────────────────────────────┤
│ 📄 Rapor Geçmişi     │  📊 Rapor Önizleme               │
│                      │                                   │
│ • Mart 2026 Aylık    │  [Seçili raporun detayı]          │
│ • Hafta 10 Özet      │  KPI tablosu, grafik, AI yorum    │
│ • Günlük 13/03       │                                   │
│ • Müşteri Sunum 02   │  [Dışa Aktar: PDF / CSV / Link]   │
└──────────────────────┴───────────────────────────────────┘
```

---

## 🚀 FAZLI GELİŞTİRME PLANI

### Phase 1 — Temel Altyapı & Genel Bakış (Gün 1-2)
> **Hedef:** Venüs panelinin iskeletini kurup, My World'e güvenle bağlamak

**Yapılacaklar:**
1. `ViewMode` tipine `'venus_ads'` eklenmesi
2. `TopNavbar.tsx`'e "Venüs Reklam" menü butonu eklenmesi
3. `page.tsx`'e viewMode koşulu eklenmesi
4. `VenusAdsLayout.tsx` — ana container + iç navigasyon
5. `VenusAdsSidebar.tsx` — sol menü
6. `VenusOverview.tsx` — KPI şeridi + özet kartlar
7. `VenusKPIBar.tsx`, `MetricCard.tsx` — ortak bileşenler
8. `venusAdsStore.ts` — Zustand store
9. `venus-ads.ts` — TypeScript tipleri
10. Backend: `venus_campaigns` ve `venus_daily_metrics` modelleri + migration
11. Backend: Kampanya ve metrik CRUD router'ları
12. Backend: `main.py`'de venus router register

**Dokunulan mevcut dosyalar (sadece ekleme):**
- `projectStore.ts` → ViewMode'a `'venus_ads'` ekleme (1 satır)
- `TopNavbar.tsx` → navItems'a 1 adet menü ekleme (1 satır)
- `page.tsx` → viewMode koşuluna `'venus_ads'` ekleme (3-4 satır)
- `main.py` → venus router register (2 satır)
- `models/__init__.py` → venus modeli import (1 satır)

### Phase 2 — Kampanya Explorer & Detay (Gün 3-4)
> **Hedef:** Kampanyaları listeleyip detay panelinde analiz edebilmek

**Yapılacaklar:**
1. `CampaignExplorer.tsx` — Grid/liste görünüm + filtreler
2. `CampaignCard.tsx` — Kampanya özet kartı
3. `CampaignDetailPanel.tsx` — Glassmorphism detay paneli
4. `DateRangeSelector.tsx` — Tarih filtresi
5. `PlatformBadge.tsx` — Google/Meta platform rozeti
6. `StatusBadge.tsx` — Durum rozeti
7. Backend: Kampanya detay + filtreleme endpoint'leri
8. Manuel metrik girişi endpoint'i

### Phase 3 — Test Merkezi & Kreatif Lab (Gün 5-6)
> **Hedef:** A/B test takibi ve kreatif arşiv yönetimi

**Yapılacaklar:**
1. `TestCenter.tsx` — Kanban benzeri test board
2. `TestCard.tsx` — Test kartı
3. `TestTemplateLibrary.tsx` — Hazır şablonlar
4. `CreativeLibrary.tsx` — Kreatif grid/galeri
5. `CreativeCard.tsx` — Kreatif kartı
6. `CreativeBriefGenerator.tsx` — AI brief üretici
7. Backend: `venus_experiments` modeli + CRUD
8. Backend: `venus_creatives` modeli + CRUD
9. Backend: AI test önerisi ve brief üretimi servisleri

### Phase 4 — Operasyon Görevleri & Rapor Merkezi (Gün 7-8)
> **Hedef:** Reklam operasyon görevlerini ve rapor üretimini yönetmek

**Yapılacaklar:**
1. `AdsTaskBoard.tsx` — Reklam operasyonuna özel kanban
2. `AdsActionCard.tsx` — Aksiyon kartı
3. `AdsReportCenter.tsx` — Rapor merkezi
4. `ReportTemplate.tsx` — Şablon seçici
5. `ExportableReport.tsx` — Dışa aktarılabilir rapor
6. Backend: `venus_ads_tasks` + `venus_report_templates` + CRUD
7. Backend: AI rapor oluşturucu servis

### Phase 5 — Benchmark, Devralma & CSV (Gün 9-10)
> **Hedef:** Rakip araştırma, müşteri devralma ve veri içe aktarma

**Yapılacaklar:**
1. `BenchmarkDashboard.tsx` — Rakip paneli
2. `CompetitorCard.tsx` — Rakip kartı
3. `OnboardingChecklist.tsx` — Devralma checklist'i
4. `ChecklistItem.tsx` — Checklist maddesi
5. `CSVImporter.tsx` — CSV yükle + kolon eşleştir + içe aktar
6. Backend: `venus_competitors` + `venus_onboarding_checklists` + `venus_csv_imports` + CRUD
7. Backend: CSV parse servisi

### Phase 6 — AI Merkezi & Anomali Sistemi (Gün 11-12)
> **Hedef:** AI destekli analiz, yorum ve anomali uyarı sistemi

**Yapılacaklar:**
1. `AIInsightsPanel.tsx` — AI yorum merkezi
2. `AnomalyAlertCard.tsx` — Anomali kartı
3. `AICommentBox.tsx` — Yan panel AI yorum kutusu (paylaşılan bileşen)
4. Backend: `venus_ai_observations` modeli + CRUD
5. Backend: AI analiz servisleri (özet, anomali, test önerisi, kreatif yorum)
6. Backend: Gemini entegrasyonu ile kampanya analizi

### Phase 7 — Cilalama & Optimizasyon (Gün 13-14)
> **Hedef:** Tüm ekranların son halini vermek, animasyonlar, responsive düzenleme

**Yapılacaklar:**
1. Tüm ekranlar dark/light mode uyumu
2. Micro-animasyonlar ve geçiş efektleri
3. Responsive kontrol (masaüstü öncelikli ama tablet uyumu)
4. KPI kartlarında sayı animasyonu (count-up)
5. Boş durum (empty state) ekranları
6. Hata yönetimi ve loading skeleton'ları
7. Uçtan uca test

---

## 🎨 TASARIM SİSTEMİ

### Renk Paleti (Venüs Özel)
```
Birincil:        #6C5CE7 (Mor — marka rengi)
İkincil:         #00B894 (Yeşil — pozitif metrik)
Uyarı:           #FDCB6E (Sarı — dikkat)
Tehlike:         #FF7675 (Kırmızı — düşüş, anomali)
Google:          #4285F4 (Google Ads rengi)
Meta:            #1877F2 (Meta Ads rengi)
GA4:             #FF6D01 (GA4 rengi)
```

### UI İlkeleri
- Mevcut My World tasarım dilini takip et (glassmorphism, yumuşak gölgeler, yuvarlatılmış köşeler)
- shadcn/ui bileşenlerini kullan
- Tailwind CSS ile stil
- Lucide ikonları
- Dark/light mode tam uyumlu
- KPI şeridi her ekranın üstünde sabit
- Sağ tarafta "AI Yorum" drawer (açılır/kapanır)

---

## 🔐 GÜVENLİK & KURALLAR

1. **Mevcut projeye zarar verme:** Tüm yeni kodlar izole klasörlerde
2. **user_id izolasyonu:** Tüm sorgular kullanıcıya özel
3. **venus_ prefix:** Tüm yeni tablolar bu prefix ile
4. **Mevcut endpoint'lere dokunma:** `/api/venus/` altında
5. **Mevcut store'lara dokunma:** Yeni `venusAdsStore.ts`
6. **Mevcut tiplere dokunma:** Yeni `venus-ads.ts`

---

## ✅ DOĞRULAMA PLANI

### Phase 1 Sonrası Kontrol
- [ ] My World dashboard'ı hâlâ çalışıyor mu? (görevler, notlar, takvim)
- [ ] Venüs Reklam menüsüne tıklayınca yeni ekran açılıyor mu?
- [ ] İç navigasyon (sol menü) çalışıyor mu?
- [ ] KPI kartları veritabanından veri çekiyor mu?
- [ ] Dark/light mode uyumlu mu?

### Her Phase Sonrası Kontrol
- [ ] Mevcut hiçbir ekran bozulmuş mu? (dashboard, görevler, notlar, takvim, AI chat)
- [ ] Yeni ekran doğru render ediliyor mu?
- [ ] CRUD operasyonları çalışıyor mu?
- [ ] Hata durumları doğru yönetiliyor mu?

### Son Kontrol
- [ ] Tüm 10 alt ekran çalışıyor ve navigasyon sorunsuz mu?
- [ ] Backend health check geçiyor mu?
- [ ] Veri izolasyonu sağlanıyor mu (user_id)?
- [ ] Production ortamda build alınabiliyor mu?

---

## 📝 MEVCUT DOSYALARDA YAPILACAK MİNİMAL DEĞİŞİKLİKLER

### 1. `projectStore.ts` (1 satır ekleme)
```diff
- export type ViewMode = 'dashboard' | 'all_tasks' | 'project' | 'notes' | 'calendar' | 'ai_chat';
+ export type ViewMode = 'dashboard' | 'all_tasks' | 'project' | 'notes' | 'calendar' | 'ai_chat' | 'venus_ads';
```

### 2. `TopNavbar.tsx` (1 satır ekleme — navItems dizisine)
```diff
  const navItems = [
    { id: 'dashboard', label: 'Kontrol Paneli', icon: LayoutDashboard },
    { id: 'all_tasks', label: 'Görevler', icon: ListTodo },
    { id: 'calendar', label: 'Takvim', icon: CalendarDays },
    { id: 'notes', label: 'Notlar', icon: NotebookPen },
    { id: 'ai_chat', label: 'AI Sohbet', icon: Bot },
+   { id: 'venus_ads', label: 'Venüs Reklam', icon: Megaphone },
  ]
```

### 3. `page.tsx` (4 satır ekleme — render bloğuna)
```diff
+ import { VenusAdsLayout } from "@/components/venus-ads/VenusAdsLayout"

  const isDashboard = viewMode === 'dashboard'
  const isCalendar = viewMode === 'calendar'
  const isAIChat = viewMode === 'ai_chat'
+ const isVenusAds = viewMode === 'venus_ads'

  ...

  {isCalendar ? (
    <CalendarPage />
  ) : isAIChat ? (
    ...
+ ) : isVenusAds ? (
+   <VenusAdsLayout />
  ) : (
    ...
```

### 4. `main.py` (2 satır ekleme)
```diff
+ from app.routers.venus import campaigns as venus_campaigns, ...
+ app.include_router(venus_campaigns.router)
```

### 5. `models/__init__.py` (venus model import'ları)
```diff
+ from app.models.venus import *
```

---

> **Not:** Bu plan sadece planlamak içindir. Hiçbir kod yazılmamıştır. Kullanıcı onayı alındıktan sonra kodlamaya başlanacaktır.
