# 📸 Fotoğraf Üretim Takip Paneli — Proje Planı

> **Konum:** Üst navbar'da `Venüs Reklam` ile `Firmalar` arasına yerleşecek  
> **Mimari:** Venüs Reklam paneli ile aynı pattern (sol iç menü + sağ içerik)  
> **Veritabanı:** PostgreSQL (async SQLAlchemy, mevcut altyapı)

---

## 🗺️ Panel Yapısı — Sol Menü Bölümleri

| # | Menü Adı | Açıklama |
|---|----------|----------|
| 1 | **Genel Bakış** | Aylık/3 aylık/6 aylık/yıllık özet dashboard. KPI kartları + grafikler |
| 2 | **Aylık Takvim** | Ay bazlı takvim görünümü. Aktif ay otomatik açılır, geçmiş aylara geri gidilebilir |
| 3 | **Haftalık İşler** | 4 haftalık bölünmüş model kartları. Her model açılır → renkler, fotoğraf durumları |
| 4 | **Model Yönetimi** | Tüm modellerin listesi, detayları, revize geçmişi |
| 5 | **Excel İçe/Dışa Aktar** | Excel dosyası yükleme ile toplu model+renk ekleme, dışa aktarma |
| 6 | **Revize Merkezi** | Revize istekleri, açıklamalar, revize fotoğraf sayıları |

---

## 📊 Genel Bakış Sayfası Detay

### Zaman Filtresi Seçenekleri
- **Aylık Özet** (varsayılan - aktif ay)
- **3 Aylık Özet**
- **6 Aylık Özet**
- **Yıllık Özet**

### KPI Kartları (4'lü grid)
| KPI | Açıklama |
|-----|----------|
| Toplam Model | Seçilen dönemde girilen model sayısı |
| Toplam Renk | Tüm modellerin toplam renk varyantı |
| Üretilen Fotoğraf | Instagram + Banner toplam fotoğraf |
| Revize Sayısı | Toplam revize edilen fotoğraf adedi |

### Alt Bölüm (2 sütun)
- **Sol:** Instagram vs Banner dağılım grafiği (bar/donut chart)
- **Sağ:** Haftalık üretim trendi (line chart), son tamamlanan modeller listesi

---

## 📅 Aylık Takvim Sayfası

- Sayfa açıldığında **aktif ay** otomatik gösterilir
- Takvim hücresinde o güne ait tamamlanan fotoğraf sayısı ve model isimleri mini badge olarak gözükür
- `<` `>` ok butonlarıyla geçmiş/gelecek aylara geçiş
- Ay/Yıl seçici dropdown
- Güne tıklandığında o günkü tüm işlemlerin detay modalı açılır

---

## 📦 Haftalık İşler Sayfası

### Yapı
- Ay 4 haftaya bölünür (1-7, 8-14, 15-21, 22-son gün)
- Her hafta bir accordion/tab olarak gösterilir
- Hafta başlığında: toplam model sayısı, tamamlanma yüzdesi

### Model Kartı Tasarımı
```
┌─────────────────────────────────────────────────────┐
│ 👕 Model Adı: "ABC-2024"          Durum: ✅ Bitti   │
│ Renkler: 3    Fotoğraf: 12    Revize: 2            │
│ Teslim: 25.04.2026                                 │
├─────────────────────────────────────────────────────┤
│ ▸ Kırmızı  │ IG: ✅ 25.04 │ Banner: ✅ 25.04       │
│ ▸ Mavi     │ IG: ✅ 25.04 │ Banner: ⬜ —           │
│ ▸ Siyah    │ IG: ⬜ —     │ Banner: ⬜ —           │
└─────────────────────────────────────────────────────┘
```

- Kart tıklanınca genişler, alt renkler ve detaylar görünür
- Her renk satırında: Instagram checkbox + tarih, Banner checkbox + tarih
- Checkbox işaretlendiğinde tarih **otomatik** olarak o anın tarihi yazılır
- Tüm renkler tamamlandığında "Bitti" olarak işaretlenebilir → teslim tarihi otomatik atanır

---

## 🔧 Model Yönetimi Sayfası

- Tablo görünümü (CampaignExplorer benzeri)
- Sütunlar: Model Adı | Renk Sayısı | IG Durumu | Banner Durumu | Toplam Fotoğraf | Revize | Durum | Teslim Tarihi
- Filtreleme: Durum (Aktif/Bitti/Revize Bekliyor), Hafta, Tarih aralığı
- Model satırına tıklayınca detay paneli (slide-over veya genişleme)
- Manuel model ekleme butonu

### Model Detay İçeriği
- Model bilgileri (ad, hafta, oluşturulma tarihi)
- Renk listesi + her renk için IG/Banner durumu
- Revize geçmişi timeline
- Toplam üretilen fotoğraf sayısı

---

## 📥 Excel İçe/Dışa Aktar Sayfası

### İçe Aktarma
- Excel dosyası sürükle-bırak veya dosya seçici
- Excel formatı (kullanıcıdan gelecek) parse edilir
- Otomatik olarak: modeller oluşturulur, renkleri eklenir, IG/Banner gereksinimleri set edilir
- İçe aktarma önizleme tablosu (onay öncesi)
- Hata varsa satır bazlı hata gösterimi

### Dışa Aktarma
- Mevcut verileri Excel formatında indir
- Filtre seçenekleri: tarih aralığı, hafta, durum
- `.xlsx` formatında export

---

## 🔄 Revize Merkezi Sayfası

- Revize bekleyen modellerin listesi
- Her revize kaydı:
  - Model adı + renk
  - Revize açıklaması (manuel metin girişi)
  - Revize edilen fotoğraf sayısı (input)
  - Revize tarihi (enter'a basınca otomatik)
- Revize timeline görünümü (en son → en eski)

---

## 🏗️ Teknik Mimari

### Veritabanı Modelleri (SQLAlchemy)

#### `PhotoModel` (ana model tablosu)
```python
class PhotoModel(Base):
    __tablename__ = "photo_models"
    
    id              = Column(Integer, PK)
    user_id         = Column(Integer, FK → users.id)
    project_id      = Column(Integer, FK → projects.id, nullable)
    model_name      = Column(String, not null)
    week_number     = Column(Integer)           # 1-4
    month           = Column(Integer)            # 1-12
    year            = Column(Integer)
    status          = Column(String)             # active, completed, revision_pending
    delivery_date   = Column(DateTime, nullable)
    total_photos    = Column(Integer, default=0)
    notes           = Column(Text, nullable)
    created_at      = Column(DateTime, default=now)
    updated_at      = Column(DateTime, onupdate=now)
```

#### `PhotoModelColor` (renk varyantları)
```python
class PhotoModelColor(Base):
    __tablename__ = "photo_model_colors"
    
    id                  = Column(Integer, PK)
    model_id            = Column(Integer, FK → photo_models.id)
    color_name          = Column(String, not null)
    ig_required         = Column(Boolean, default=False)
    ig_completed        = Column(Boolean, default=False)
    ig_completed_at     = Column(DateTime, nullable)
    ig_photo_count      = Column(Integer, default=0)
    banner_required     = Column(Boolean, default=False)
    banner_completed    = Column(Boolean, default=False)
    banner_completed_at = Column(DateTime, nullable)
    banner_photo_count  = Column(Integer, default=0)
    created_at          = Column(DateTime, default=now)
```

#### `PhotoRevision` (revize kayıtları)
```python
class PhotoRevision(Base):
    __tablename__ = "photo_revisions"
    
    id            = Column(Integer, PK)
    model_id      = Column(Integer, FK → photo_models.id)
    color_id      = Column(Integer, FK → photo_model_colors.id, nullable)
    description   = Column(Text, not null)
    revised_count = Column(Integer, default=0)
    revised_at    = Column(DateTime, default=now)
    created_at    = Column(DateTime, default=now)
```

#### `PhotoExcelImport` (içe aktarma logları)
```python
class PhotoExcelImport(Base):
    __tablename__ = "photo_excel_imports"
    
    id              = Column(Integer, PK)
    user_id         = Column(Integer, FK → users.id)
    file_name       = Column(String)
    models_imported = Column(Integer, default=0)
    colors_imported = Column(Integer, default=0)
    status          = Column(String)   # success, partial, failed
    error_log       = Column(JSON, nullable)
    imported_at     = Column(DateTime, default=now)
```

### Backend API Endpoint'leri

```
GET    /api/photo-tracking/models                      # Modelleri listele
POST   /api/photo-tracking/models                      # Model ekle
GET    /api/photo-tracking/models/{id}                 # Model detay
PUT    /api/photo-tracking/models/{id}                 # Model güncelle
DELETE /api/photo-tracking/models/{id}                 # Model sil

POST   /api/photo-tracking/models/{id}/colors          # Renk ekle
PUT    /api/photo-tracking/colors/{id}                 # Renk güncelle
PUT    /api/photo-tracking/colors/{id}/complete-ig      # IG tamamla
PUT    /api/photo-tracking/colors/{id}/complete-banner  # Banner tamamla

POST   /api/photo-tracking/models/{id}/revisions       # Revize ekle
GET    /api/photo-tracking/revisions                   # Tüm revizeler

GET    /api/photo-tracking/overview                    # Dashboard KPI
GET    /api/photo-tracking/calendar/{year}/{month}     # Aylık takvim

POST   /api/photo-tracking/import-excel                # Excel içe aktar
GET    /api/photo-tracking/export-excel                # Excel dışa aktar
```

### Frontend Dosya Yapısı

```
src/components/photo-tracking/
├── PhotoTrackingLayout.tsx          # Ana layout (sol menü + içerik)
├── overview/PhotoOverview.tsx       # Genel bakış + KPI + grafikler
├── calendar/PhotoCalendar.tsx       # Aylık takvim
├── weekly/
│   ├── WeeklyBoard.tsx              # Haftalık accordion
│   ├── ModelCard.tsx                # Model kartı
│   └── ColorRow.tsx                 # Renk satırı
├── models/
│   ├── ModelExplorer.tsx            # Tablo görünümü
│   ├── ModelDetailPanel.tsx         # Detay slide-over
│   └── ModelForm.tsx                # Model ekleme formu
├── excel/
│   ├── ExcelImporter.tsx            # İçe aktarma
│   └── ExcelExporter.tsx            # Dışa aktarma
└── revisions/
    ├── RevisionCenter.tsx           # Revize listesi + form
    └── RevisionTimeline.tsx         # Timeline

src/stores/photoTrackingStore.ts     # Zustand store
src/types/photo-tracking.ts          # TypeScript tipleri
```

---

## 🔗 Navigasyon Entegrasyonu

| Dosya | Değişiklik |
|-------|-----------|
| `projectStore.ts` | `ViewMode` → `'photo_tracking'` eklenir |
| `TopNavbar.tsx` | `navItems`'a Venüs Reklam sonrasına `{ id: 'photo_tracking', label: 'Fotoğraf Takip', icon: Camera }` eklenir |
| `page.tsx` | `isPhotoTracking` koşulu + `<PhotoTrackingLayout>` render |

---

## 🎨 Tasarım İlkeleri

- Mevcut paneldeki renk paleti korunacak (`brand-dark`, `brand-gray`, `brand-yellow`)
- Kartlar: `bg-white dark:bg-slate-800 rounded-2xl shadow-sm border`
- Sol menü: `VenusAdsLayout.tsx` ile aynı pattern
- Checkbox tamamlanınca yeşil animasyon + tarih badge
- Responsive: mobilde sol menü icon-only

---

## 📋 Uygulama Fazları

### Faz 1 — Temel Altyapı
- [ ] Backend modelleri (4 tablo) + Alembic migration
- [ ] FastAPI router + CRUD endpoint'leri + Pydantic schema'lar

### Faz 2 — Frontend Çatı
- [ ] `photoTrackingStore.ts` + TypeScript tipleri
- [ ] `PhotoTrackingLayout.tsx` (sol menü + routing)
- [ ] Navigasyon entegrasyonu (3 dosya değişikliği)

### Faz 3 — Genel Bakış + Takvim
- [ ] `PhotoOverview.tsx` — KPI kartları + zaman filtresi
- [ ] `PhotoCalendar.tsx` — Aylık takvim + gün detay

### Faz 4 — Haftalık İşler + Model Kartları
- [ ] `WeeklyBoard.tsx` — 4 haftalık accordion
- [ ] `ModelCard.tsx` + `ColorRow.tsx` — IG/Banner checkbox + otomatik tarih

### Faz 5 — Model Yönetimi + Revize
- [ ] `ModelExplorer.tsx` — Tablo + filtre
- [ ] `RevisionCenter.tsx` — Revize ekleme + timeline

### Faz 6 — Excel Entegrasyonu
- [ ] `ExcelImporter.tsx` + `ExcelExporter.tsx`
- [ ] Backend Excel parse/generate (`openpyxl`)

---

## ⚠️ Açık Sorular (Kullanıcıdan Beklenen)

1. **Excel Formatı:** Excel dosyasının sütun yapısı henüz belirlenmedi — kullanıcı örnek gönderecek
2. **Panel İsmi:** "Fotoğraf Takip" mi yoksa farklı bir isim mi?
3. **Hafta Tanımı:** Sabit bölünme (1-7, 8-14...) mı yoksa pazartesi-pazar mı?
4. **Proje/Firma İlişkisi:** Tüm firmalar için mi yoksa belirli firma bazlı mı?
5. **Fotoğraf Sayıları:** Her renk için kaç fotoğraf üretildiği elle mi girilecek?
