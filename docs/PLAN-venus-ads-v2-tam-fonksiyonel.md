# PLAN: Venüs Reklam Paneli v2 — Tam Fonksiyonel Sistem

> **Tarih:** 2026-03-15
> **Durum:** PLAN AŞAMASI — Onay bekleniyor
> **Hedef:** Mevcut iskelet yapıyı, gerçek veri işleyen, AI destekli, tam fonksiyonel bir reklam yönetim paneline dönüştürmek

---

## 🔍 MEVCUT DURUM ANALİZİ (RÖNTGEN)

### ✅ Çalışan Bileşenler (4/10 Ekran)

| Ekran | Durum | Açıklama |
|-------|-------|----------|
| **Genel Bakış** | ✅ Kısmen | KPI kartları var, mock data gösteriyor. Trend grafiği yok |
| **Kampanyalar** | ✅ Çalışıyor | Liste, filtre, arama, ekleme/düzenleme/silme formları tam |
| **Test Merkezi** | ✅ Çalışıyor | Koşan/tamamlanan ayrımı, form ile CRUD tam |
| **Kreatif Lab** | ✅ Çalışıyor | Galeri grid, form ile CRUD, performans skoru gösterimi. "Not Found" hatası var |

### ❌ Placeholder Bileşenler (6/10 Ekran — Sadece Başlık + Boş Kutu)

| Ekran | Satır Sayısı | Gerçek İşlev |
|-------|-------------|--------------|
| **Operasyon Görevleri** | 24 satır | Sıfır — sadece "Faz 4 Kapsamı" yazısı |
| **Rapor Merkezi** | 24 satır | Sıfır — sadece "Faz 4 Kapsamı" yazısı |
| **Rakip Analizi** | 24 satır | Sıfır — sadece "Faz 5 Kapsamı" yazısı |
| **Müşteri Devralma** | 24 satır | Sıfır — sadece "Faz 5 Kapsamı" yazısı |
| **CSV İçe Aktarma** | 24 satır | Sıfır — sadece "Faz 5 Kapsamı" yazısı |
| **AI Yorum & Anomali** | 24 satır | Sıfır — sadece "Faz 6 Kapsamı" yazısı |

### ⚠️ Backend Durumu

| Katman | Durum | Sorun |
|--------|-------|-------|
| **DB Modelleri** | ✅ 11 model oluşturuldu | Sorun yok |
| **Schemas (Pydantic)** | ✅ Tüm fazlar için var | Sorun yok |
| **Routers (API)** | ✅ 11 router, `main.py`'de kayıtlı | Sorun yok |
| **Services** | ❌ `services/venus/` klasörü BOŞ | Hiç servis yazılmadı |
| **Zustand Store** | ⚠️ Sadece Campaign/Experiment/Creative | Tasks, Reports, vb. için aksiyon yok |
| **TypeScript Tipleri** | ⚠️ Sadece 4 tip tanımlı | Tasks, Competitor, vb. tipleri eksik |

### 🔑 Kritik Eksik: Platform Entegrasyonu

Referans uygulama (iyzads) incelendiğinde görülen yapı:
- **Meta Ads** → OAuth ile hesap bağlama → API üzerinden kampanya/reklam verisi çekme
- **Google Ads** → OAuth ile hesap bağlama → API üzerinden veri çekme  
- **Google Analytics** → Raporlama entegrasyonu
- **TikTok Ads** → "Yakında" olarak işaretli

> **KARAR GEREKLİ:** Bizim sistemimiz bu entegrasyonları yapacak mı, yoksa **manuel veri girişi + CSV import + AI analizi** ile çalışan bir "akıllı reklam yönetim paneli" mi olacak?

---

## 🎯 ÖNERİLEN STRATEJİ: "AKILLI AJANS PANELİ"

> [!IMPORTANT]
> Meta/Google API entegrasyonları karmaşık OAuth süreçleri, Developer Console onayları ve aylık API kotaları gerektirir. Bu, ayrı büyük bir projedir. **Önerim:** Şu an sistemin **manuel veri girişi + CSV import + Gemini AI analizi** ile tam fonksiyonel çalışmasını sağlayalım. API entegrasyonları ileride ek modül olarak eklenebilir.

### Sistem Nasıl Çalışacak?

```
┌──────────────────────────────────────────────────────┐
│                  VERİ GİRİŞ KAYNAKLARI                │
├──────────────┬──────────────┬─────────────────────────┤
│ 📋 Manuel    │ 📄 CSV       │ 🔮 İLERİDE: API        │
│ Form ile     │ Google/Meta  │ Meta, Google OAuth      │
│ kampanya ve  │ export'ları  │ ile otomatik            │
│ metrik gir   │ yükle+parse  │ veri çekme              │
├──────────────┴──────────────┴─────────────────────────┤
│                 ⬇️ BACKEND İŞLEME                      │
│  metric_calculator → ROAS, CPA, CTR hesapla           │
│  csv_parser → CSV kolon eşleştir + venus_daily'ye yaz │
│  ai_analyzer → Gemini ile kampanya/kreatif analizi yap│
│  report_builder → Şablondan rapor oluştur             │
├───────────────────────────────────────────────────────┤
│                 ⬆️ FRONTEND GÖRÜNTÜLEME               │
│  📊 KPI Dashboard (gerçek veriden hesaplı)            │
│  📈 Kampanya Detay (metrik grafikleri)                │
│  ✅ Görev Kanban (AI'dan otomatik görev üretimi)      │
│  📑 Rapor PDF (şablonlu, dışa aktarılabilir)         │
│  🤖 AI Panel (anomali + öneri + test fikri)           │
└───────────────────────────────────────────────────────┘
```

---

## 📐 FAZLI GELİŞTİRME PLANI (v2)

### Phase A — Placeholder'ları Fonksiyonel Yapma + Store/Type Tamamlama

> **Hedef:** 6 boş ekranın hepsine gerçek CRUD UI ve API bağlantısı eklemek

**Yapılacaklar:**

#### Frontend — Yeni TypeScript Tipleri
- `venus-ads.ts` içine şu tiplerin eklenmesi:
  - `VenusAdsTask` (title, description, category, priority, status, due_date, source, ai_notes)
  - `VenusReportTemplate` (title, template_type, sections, is_default)
  - `VenusCompetitor` (brand_name, website_url, category, strengths, weaknesses, creative_style)
  - `VenusOnboardingChecklist` (client_name, status, items, notes)
  - `VenusCSVImport` (filename, platform_source, rows_imported, status, error_log)
  - `VenusAIObservation` (observation_type, title, content, severity, is_acknowledged)

#### Frontend — Zustand Store Genişletme
- `venusAdsStore.ts` içine Tasks, Competitors, Onboarding, AI Observations için CRUD aksiyonları

#### Frontend — 6 Ekranın Tam Fonksiyonel Yapılması

| Bileşen | Ne Yapılacak |
|---------|-------------|
| **AdsTaskBoard.tsx** | Kanban (Todo/Doing/Done) + Görev ekleme formu + filtre (kategori/öncelik) |
| **AdsReportCenter.tsx** | Rapor şablonu listesi + yeni şablon oluşturma + rapor önizleme |
| **BenchmarkDashboard.tsx** | Rakip kartları grid + rakip ekleme formu + güçlü/zayıf yön notları |
| **OnboardingChecklist.tsx** | Checklist oluşturma + madde ekleme/işaretleme + ilerleme çubuğu |
| **CSVImporter.tsx** | Dosya sürükle-bırak + platform seçimi + kolon eşleştirme + import geçmişi |
| **AIInsightsPanel.tsx** | AI gözlem listesi + önem seviyesi badge + onaylama butonu |

---

### Phase B — Backend Servisleri (Akıl Katmanı)

> **Hedef:** Verileri anlamlı hale getiren backend motorlarını yazmak

#### [NEW] `services/venus/metric_calculator.py`
- `calculate_kpi_summary(user_id, date_range)` → Toplam harcama, ROAS, CPA, CTR hesaplama
- `calculate_campaign_trend(campaign_id, days)` → Günlük trend verisi
- `detect_anomalies(user_id)` → Ani CPA artışı, ROAS düşüşü vb. tespit

#### [NEW] `services/venus/csv_parser.py`
- `parse_google_ads_csv(file)` → Google Ads export formatını okuma
- `parse_meta_ads_csv(file)` → Meta Business Suite export formatını okuma
- `map_columns_to_metrics(headers)` → Kolon eşleştirme önerisi
- `import_rows_to_db(mapped_data, user_id)` → Günlük metrik olarak kaydetme

#### [NEW] `services/venus/ai_analyzer.py`
- `generate_campaign_analysis(campaign_data)` → Gemini ile kampanya AI yorumu
- `generate_daily_summary(user_id)` → Günlük AI genel özet
- `suggest_test_ideas(campaign_data)` → A/B test önerisi üretme
- `generate_creative_brief(product_info)` → AI kreatif brief

#### [NEW] `services/venus/report_builder.py`
- `generate_report(template_id, date_range, user_id)` → Şablona göre rapor üretme
- `format_report_html(report_data)` → HTML çıktı (PDF'e dönüştürülebilir)

---

### Phase C — Genel Bakış Ekranının Gerçek Veriye Bağlanması

> **Hedef:** Overview ekranının mock yerine database'den gerçek veri göstermesi

**Yapılacaklar:**
1. Backend: `/api/venus/metrics/overview` endpoint'ine gerçek hesaplama (metric_calculator kullanarak)
2. Frontend: VenusOverview.tsx'i API'den gelen gerçek KPI verileriyle güncelleme
3. Bugünkü Kritik Görevler listesini AI'dan çekme (en yakın due_date'li görevler)
4. Anomali uyarılarını AI observation'lardan çekme

---

### Phase D — CSV İçe Aktarma Motoru (Gerçek Çalışan)

> **Hedef:** Kullanıcının Google Ads / Meta CSV export dosyalarını yükleyerek sisteme veri aktarması

**Akış:**
1. Frontend: Dosya drop zone → platform seçimi → yükleme
2. Backend: CSV ayrıştırma → kolon tanıma → venus_daily_metrics'e kaydetme
3. Frontend: Import geçmişi tablosu (başarılı/hatalı/satır sayısı)

---

### Phase E — AI Entegrasyonu (Gemini ile)

> **Hedef:** Mevcut Gemini API'sini kullanarak kampanya analizi, anomali tespiti ve öneriler üretme

**Yapılacaklar:**
1. Backend: `ai_analyzer.py` → Mevcut `services/gemini.py` üzerine inşa
2. `/api/venus/ai/analyze-campaign/{id}` → Kampanya verilerini Gemini'ye gönder, AI yorumu al, kaydet
3. `/api/venus/ai/daily-summary` → Tüm metriklerin özetini Gemini'ye gönder, anomali + öneri al
4. Frontend: AI Insights panelinde gözlem kartları, kampanya detayında AI yorum kutusu

---

### Phase F — Cilalama & Hata Düzeltme

> **Hedef:** Mevcut hataları giderme ve UX iyileştirmeleri

**Bilinen Hatalar:**
1. ❌ Kreatif ekleme formunda "Not Found" hatası (API endpoint problemi olabilir)
2. ⚠️ `VenusOverview` import uyarısı (lint)
3. ⚠️ Backend pydantic import uyarıları (IDE ortam sorunu)

**UX İyileştirmeleri:**
- Loading skeleton'ları
- Boş durum (empty state) illüstrasyonları
- KPI kartlarında sayı animasyonu
- Dark/Light mode son kontrol

---

## 🔮 İLERİDE EKLENEBİLECEK MODÜLLER (Bu Plan Kapsamı DIŞI)

| Modül | Gereksinim | Zorluk |
|-------|-----------|--------|
| **Meta Ads OAuth** | Facebook Developer App + Business Manager | ⭐⭐⭐⭐ |
| **Google Ads OAuth** | Google Cloud Console + Google Ads API erişimi | ⭐⭐⭐⭐⭐ |
| **Google Analytics 4** | GA4 Data API + OAuth2 | ⭐⭐⭐ |
| **Otomatik Rapor PDF** | Puppeteer/wkhtmltopdf | ⭐⭐ |
| **Hedef Kitle Oluşturma** | Meta Marketing API | ⭐⭐⭐⭐ |
| **SEO Analizi** | Lighthouse API / PageSpeed | ⭐⭐ |

---

## ✅ DOĞRULAMA PLANI

### Otomatik Testler
- Backend: `npm run build` (Next.js frontend build kontrolü)
- Backend: API endpoint testleri: Her `/api/venus/*` endpointi curl ile GET/POST kontrol

### Manuel Doğrulama (Kullanıcı)
1. **Kampanya Oluşturma:** Yeni bir Meta kampanyası ekle → listede gör → düzenle → sil
2. **CSV Yükleme:** Google Ads CSV indir → sisteme yükle → metriklerin kayıt olduğunu kontrol et
3. **Görev Oluşturma:** Operasyon panelinden "Budget kontrol" görevi ekle → Kanban'da sürükle
4. **Rakip Ekleme:** Benchmark'tan yeni rakip ekle → güçlü/zayıf yönleri gir
5. **AI Analiz:** Bir kampanyayı analiz et → AI yorumunu gör
6. **Rapor Üretme:** Haftalık şablon seç → rapor oluştur → önizle
7. **Genel Bakış:** KPI kartlarında gerçek verilerin göründüğünü doğrula
8. **Dark Mode:** Tüm ekranları dark mode'da kontrol et

---

## 📝 SONUÇ

Mevcut sistemde **mimari iskelet %100 hazır** (DB + Routers + Navigasyon). Eksik olan **fonksiyonel derinlik**:
- 6 boş ekranın gerçek UI ile doldurulması
- Backend servis motorlarının yazılması  
- AI entegrasyonunun aktifleştirilmesi
- CSV import mekanizmasının çalışması
- Genel bakışın gerçek veriye bağlanması

Bu plan ile sistem, **API entegrasyonu olmadan bile** tam fonksiyonel bir reklam yönetim paneli olarak çalışacaktır.
