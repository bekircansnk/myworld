# 🎯 KAPSAMLI PLAN: Modül Bağlantı Sistemi + Görsel Gösterimi + Test Merkezi AI + Kanban Sürükle-Bırak + Devralma Geliştirmeleri

> **Tarih:** 2026-03-15  
> **Durum:** SADECE PLANLAMA — Kod yazılmayacak  
> **Kapsam:** 6 ana geliştirme fazı, birbiriyle entegre

---

## 📌 GENEL ÖZET

| Faz | Konu | Öncelik |
|-----|------|---------|
| 1 | Kampanya merkezli çapraz bağlantı sistemi (tüm modüller) | 🔴 P0 |
| 2 | Kampanya tıklanabilir detay & bağlantı baloncukları | 🔴 P0 |
| 3 | Kreatif Lab — Görsel URL gösterimi düzeltmesi | 🟡 P1 |
| 4 | Test Merkezi — Detay modal + line-through kaldır | 🟡 P1 |
| 5 | Test Merkezi + Kreatif — Yapay zeka entegrasyonu | 🟡 P1 |
| 6 | Operasyon Kanban sürükle-bırak + Devralma madde ekleme/silme | 🟢 P2 |

---

## 🔗 FAZ 1: KAMPANYA MERKEZLİ ÇAPRAZ BAĞLANTI SİSTEMİ

### Mevcut Durum Analizi

Backend modellerde `campaign_id` foreign key zaten tanımlı:

| Model | `campaign_id` FK | `experiment_id` FK | `creative_id` FK |
|-------|:----------------:|:------------------:|:----------------:|
| `VenusExperiment` | ✅ var | — | ❌ yok |
| `VenusCreative` | ❌ yok | ❌ yok | — |
| `VenusAdsTask` | ✅ var | ❌ yok | ❌ yok |

**Sorun:** Frontend tarafında hiçbir bileşende `campaign_id` seçimi yapılmıyor. Yani bağlantı altyapısı var ama kullanılmıyor.

### Backend Değişiklikleri

#### 1. `VenusCreative` modeline FK'lar ekle

```python
# models/venus/creative.py — EKLENECEK alanlar
campaign_id = Column(Integer, ForeignKey("venus_campaigns.id"), nullable=True)
experiment_id = Column(Integer, ForeignKey("venus_experiments.id"), nullable=True)
```

#### 2. `VenusAdsTask` modeline FK'lar ekle

```python
# models/venus/ads_task.py — EKLENECEK alanlar
experiment_id = Column(Integer, ForeignKey("venus_experiments.id"), nullable=True)
creative_id = Column(Integer, ForeignKey("venus_creatives.id"), nullable=True)
```

#### 3. `VenusExperiment` modeline FK ekle

```python
# models/venus/experiment.py — EKLENECEK alan
creative_id = Column(Integer, ForeignKey("venus_creatives.id"), nullable=True)
```

#### 4. Schema'lara alanları ekle

| Schema Dosyası | Eklenecek Alanlar |
|----------------|-------------------|
| `schemas/venus/creative.py` | `campaign_id?: int`, `experiment_id?: int` |
| `schemas/venus/ads_task.py` | `experiment_id?: int`, `creative_id?: int` |
| `schemas/venus/experiment.py` | `creative_id?: int` |

#### 5. Frontend Type tanımlarına ekle (`types/venus-ads.ts`)

```typescript
// VenusCreative → ekle
campaign_id?: number;
experiment_id?: number;

// VenusAdsTask → ekle
experiment_id?: number;
creative_id?: number;

// VenusExperiment → ekle
creative_id?: number;
```

### Frontend Form Değişiklikleri

#### A. `CampaignForm.tsx` — Değişiklik yok (zaten kampanya formu)

#### B. `TestForm.tsx` — Kampanya seçici ekle

```
┌─ Yeni A/B Testi Ekle ──────────────┐
│  [Deney Adı]                        │
│  [Hipotez]                          │
│  ┌────────────────────────────────┐  │
│  │ 📎 Bağlı Kampanya: [Dropdown] │  │  ← YENİ
│  └────────────────────────────────┘  │
│  [Durum] [Kazanan]                  │
│  [Kaydet] [İptal]                   │
└─────────────────────────────────────┘
```

- Dropdown: `campaigns` listesinden doldurulacak
- Seçilen kampanyanın `id`'si → `formData.campaign_id` olarak kaydedilecek

#### C. `CreativeForm.tsx` — Kampanya + Test seçici ekle

```
┌─ Yeni Kreatif Ekle ────────────────┐
│  [Kreatif Adı]                      │
│  [Tür] [Format]                     │
│  ┌────────────────────────────────┐  │
│  │ 📎 Kampanya: [Dropdown]       │  │  ← YENİ
│  │ 🧪 Test: [Dropdown]           │  │  ← YENİ (kampanya seçildikten sonra)
│  └────────────────────────────────┘  │
│  [URL] [Skor] [Tasarımcı]           │
│  [Kaydet]                           │
└─────────────────────────────────────┘
```

- Kampanya seçildikten sonra, o kampanyaya bağlı testler filtrelenerek Test dropdown'ı doldurulacak

#### D. `TaskForm` (AdsTaskBoard.tsx içinde) — Kampanya + Test + Kreatif seçici ekle

```
┌─ Yeni Görev ───────────────────────┐
│  [Başlık]                           │
│  [Açıklama]                         │
│  ┌────────────────────────────────┐  │
│  │ 📎 Kampanya: [Dropdown]       │  │  ← YENİ
│  │ 🧪 Test: [Dropdown]           │  │  ← YENİ
│  │ 🎨 Kreatif: [Dropdown]        │  │  ← YENİ
│  └────────────────────────────────┘  │
│  [Kategori] [Öncelik]               │
│  [Bitiş Tarihi]                     │
│  [Oluştur]                          │
└─────────────────────────────────────┘
```

---

## 🏷️ FAZ 2: KAMPANYA DETAY & BAĞLANTI BALONCUKLARI

### Kampanya Tablosunda Tıklanabilir Satırlar

**Mevcut:** `CampaignExplorer.tsx`'de kampanya satırına tıklamak hiçbir şey yapmıyor.
**Olması Gereken:** Satıra tıklandığında kampanya detay modal'ı açılacak.

### [YENİ] `CampaignDetailModal.tsx`

Kampanyaya tıklandığında açılan modal:

```
┌─ 🎯 Ayakkabı Kampanyası ───────────────────┐
│  Platform: Google Ads  │ Durum: AKTİF      │
│  Günlük Bütçe: ₺500   │ Hedef: Dönüşüm    │
│─────────────────────────────────────────────│
│  📎 Bağlı Modüller:                         │
│                                              │
│  🧪 Testler (2):                             │
│  ┌──────────┐ ┌──────────────┐               │
│  │ Video vs │ │ Kırmızı vs   │               │  ← Tıklanınca TestDetailModal açılır
│  │ Resim    │ │ Yeşil Buton  │               │
│  └──────────┘ └──────────────┘               │
│                                              │
│  🎨 Kreatifler (3):                          │
│  ┌────────┐ ┌─────────┐ ┌────────┐          │  ← Tıklanınca Kreatif detay/edit modal
│  │ Yaz.1  │ │ Yaz.2   │ │ Kış.1  │          │
│  └────────┘ └─────────┘ └────────┘          │
│                                              │
│  📋 Operasyon Görevleri (4):                 │
│  ┌──────────────┐ ┌────────────┐             │  ← Tıklanınca görev düzenleme
│  │ Bütçe kontrol│ │ CPC izle   │             │
│  └──────────────┘ └────────────┘             │
└──────────────────────────────────────────────┘
```

**Baloncuk tasarımı:** Her bağlı öğe küçük bir chip/tag olarak gösterilecek:
- Tema renkli (testler: mavi, kreatifler: mor, görevler: yeşil)
- Tıklanabilir → ilgili detay modal'ı açar
- Hover'da gölge büyür

### Diğer Modüllerde de Baloncuklar Göster

#### `TestCenter.tsx` — Her testte bağlı kampanya & kreatif baloncuğu

```
┌─ Video ve resim arasındaki farklar ─────┐
│  Hipotez: Genel anlamda en çok ...      │
│  ┌─────────────────┐ ┌───────────────┐  │
│  │ 📎 Ayakkabı KMP │ │ 🎨 Yaz.1      │  │  ← Baloncuklar
│  └─────────────────┘ └───────────────┘  │
│  [Sonucu Belirle →]                     │
└─────────────────────────────────────────┘
```

#### `CreativeLibrary.tsx` — Her kreatif kartında bağlı kampanya & test baloncuğu

```
┌───────────── Kreatif Kartı ──────────────┐
│  [Görsel]                                 │
│  Yaz. 1                                  │
│  ⭐ 8/10                                  │
│  ┌─────────────────┐ ┌────────────────┐   │
│  │ 📎 Ayakkabı KMP │ │ 🧪 Video testi │   │  ← Baloncuklar
│  └─────────────────┘ └────────────────┘   │
└───────────────────────────────────────────┘
```

#### `AdsTaskBoard.tsx` — Her görev kartında bağlı bileşen baloncukları

```
┌─ Günlük bütçe kontrolü ─────────┐
│  ┌─────────────┐ ┌──────────┐   │
│  │ 📎 Ayak. KMP│ │ 🧪 Video │   │  ← Baloncuklar
│  └─────────────┘ └──────────┘   │
│  🔴 Yüksek  │ Bütçe Kontrolü   │
└──────────────────────────────────┘
```

### Baloncuk Bileşeni: `LinkedItemChip.tsx` (Yeniden Kullanılabilir)

```tsx
// Kullanım:
<LinkedItemChip
  type="campaign"     // "campaign" | "experiment" | "creative" | "task"
  label="Ayakkabı"
  onClick={() => openModal(...)}
/>
```

---

## 🖼️ FAZ 3: KREATİF LAB — GÖRSEL URL GÖSTERİMİ

### Sorun A: `url` → `thumbnail_url` senkronizasyonu

- `CreativeForm.tsx` satır 147-157: `url` alanı dolduruluyor
- `CreativeLibrary.tsx` satır 95: `creative.thumbnail_url` kontrol ediliyor
- **Çözüm:** Form submit'te `thumbnail_url = url` otomatik atanacak, ayrıca `CreativeLibrary.tsx`'de `thumbnail_url || url` fallback zinciri kullanılacak

### Sorun B: Google Drive URL uyumu

- `<img>` etiketine `referrerPolicy="no-referrer"` eklenmeli
- `onError` handler ile fallback placeholder gösterilmeli

### Sorun C: URL önizlemesi

- `CreativeForm.tsx`'de URL girildikten sonra küçük bir thumbnail önizlemesi gösterilecek

---

## 🧪 FAZ 4: TEST MERKEZİ — DETAY MODAL + GÖRÜNÜM İYİLEŞTİRME

### A. Line-through kaldır

`TestCenter.tsx` satır 125:
```diff
-  className="font-bold text-slate-700 dark:text-slate-300 line-through decoration-slate-300 dark:decoration-slate-600 opacity-60 text-sm"
+  className="font-bold text-slate-700 dark:text-slate-300 text-sm"
```

### B. [YENİ] `TestDetailModal.tsx`

Tamamlanan teste tıklandığında açılacak modal:

```
┌─ 📝 Video ve resim arasındaki farklar ──┐
│  Durum: COMPLETED  │  Kazanan: Resim    │
│  ┌──────────────────┐ ┌─────────────┐   │
│  │ 📎 Ayakkabı KMP  │ │ 🎨 Yaz.1    │   │  ← Bağlantı baloncukları
│  └──────────────────┘ └─────────────┘   │
│─────────────────────────────────────────│
│  💡 Hipotez:                            │
│  "Genel anlamda en çok etkileşimi       │
│   hangisi getiriyor?"                   │
│─────────────────────────────────────────│
│  📚 Öğrenim:                            │
│  "Yapılan testlerde ikisinin de         │
│   orantılı bir şekilde etki ettiği      │
│   görüldü."                             │
│─────────────────────────────────────────│
│  🤖 Yapay Zeka Yorumu:                  │
│  [AI tarafından üretilen yorum]         │
│  - Değerlendirme                        │
│  - Alternatif yaklaşım önerisi          │
│  - Sonraki adım tavsiyesi               │
└─────────────────────────────────────────┘
```

---

## 🤖 FAZ 5: YAPAY ZEKA ENTEGRASYONU (2 NOKTA)

### AI Noktası #1: Test Oluşturulduğunda (Form içinde)

- Hipotez alanı blur olduğunda veya buton ile tetiklenir
- AI, hipotez + deney adı alır → "Nelere dikkat etmelisin? Hangi metrikleri izle?" önerisi verir
- Yanıt, form'un alt kısmında gösterilir (form KAPANMAZ)

```
┌─ Yeni A/B Testi ───────────────────────┐
│  [Deney Adı]                            │
│  [Hipotez]                              │
│  📎 Kampanya: [Dropdown]                │
│  [Kaydet] [İptal]                       │
│─────────────────────────────────────────│
│  🤖 AI Test Koçu                        │
│  ┌───────────────────────────────────┐  │
│  │ "Bu hipotezi test ederken şu      │  │
│  │  metriklere odaklan: CTR, CPC..." │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### AI Noktası #2: Test Tamamlandığında (Detay Modal)

- Modal açıldığında, `ai_comment` boşsa otomatik oluşturulur
- Hipotez + Öğrenim + Kazanan → AI yorumu → DB'ye `ai_comment` olarak kaydedilir

### Backend Değişiklikleri

| Değişiklik | Dosya |
|-----------|-------|
| `ai_comment = Column(Text)` ekle | `models/venus/experiment.py` |
| Schema'ya `ai_comment: Optional[str]` | `schemas/venus/experiment.py` |
| `POST /{id}/ai-coach` endpoint | `routers/venus/experiments.py` |
| `POST /{id}/ai-review` endpoint | `routers/venus/experiments.py` |
| Store'a `getAICoaching`, `getAIReview` | `venusAdsStore.ts` |

---

## 🔄 FAZ 6: OPERASYON SÜRÜKLE-BIRAK + DEVRALMA MADDE EKLEME/SİLME

### A. Kanban Sürükle-Bırak (`AdsTaskBoard.tsx`)

**Mevcut:** Sadece `ChevronRight` (ok) butonu ile ilerletme yapılabiliyor.
**İstenen:** Görevler sürüklenip farklı sütunlara bırakılabilmeli (Yapılacak ↔ Yapılıyor ↔ Tamamlandı arası).

**Yaklaşım:** HTML5 Drag & Drop API kullanılacak (ek kütüphane gerektirmez):

```tsx
// Her görev kartına:
draggable={true}
onDragStart={(e) => e.dataTransfer.setData('taskId', task.id.toString())}

// Her sütuna:
onDragOver={(e) => e.preventDefault()}
onDrop={(e) => {
  const taskId = e.dataTransfer.getData('taskId');
  handleMoveTask(taskId, col.key);
}}
```

- Sürükleme sırasında hedef sütunda `border-dashed border-indigo-400` highlight efekti
- Ok butonu da korunur (hızlı tek adım ilerletme)
- **ÖNEMLİ:** Tamamlandı → Yapılacak yönünde de sürükleme desteklenecek

### B. Devralma Madde Ekleme & Silme (`OnboardingChecklist.tsx`)

**Mevcut:** Sabit 8 madde otomatik oluşturuluyor, ekleme/silme yok.
**İstenen:** 
1. Artı (+) butonu ile yeni madde eklenebilmeli
2. Her maddenin yanında çöp kutusu ikonu ile madde silinebilmeli

**UI Tasarımı:**

```
┌─ Müşteri Devralma: Venüs Moda ─────────┐
│  %62  │ 5/8 tamamlandı                  │
│─────────────────────────────────────────│
│  ✅ Reklam hesabı erişimi alındı    🗑  │  ← Çöp kutusu hover'da
│  ✅ Mevcut kampanyalar incelendi     🗑  │
│  ⭕ Pixel/Tag kurulumu kontrol       🗑  │
│  ⭕ Hedef kitle analizi yapıldı      🗑  │
│  ...                                     │
│  ┌─────────────────────────────────────┐ │
│  │ ➕ Yeni madde ekle...              │ │  ← Artı butonu
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Mantık:**
- `+ Yeni madde ekle` tıklandığında: Küçük input alanı açılır, madde yazılıp Enter ile eklenir
- Eklenen madde `items` JSON dizisine `{ title: "...", done: false }` olarak eklenir
- Çöp kutusu tıklandığında `confirm()` ile onay alınır ve `items` dizisinden çıkarılır
- Her değişiklikte `updateChecklist` ile DB güncellenir

---

## 🗺️ DEĞİŞTİRİLECEK DOSYALAR TOPLAM LİSTESİ

### Backend (Model + Schema + Router)

| # | Dosya | Değişiklik | Faz |
|---|-------|-----------|-----|
| 1 | `models/venus/creative.py` | `campaign_id`, `experiment_id` FK ekle | 1 |
| 2 | `models/venus/ads_task.py` | `experiment_id`, `creative_id` FK ekle | 1 |
| 3 | `models/venus/experiment.py` | `creative_id`, `ai_comment` ekle | 1, 5 |
| 4 | `schemas/venus/creative.py` | Yeni alanlar | 1 |
| 5 | `schemas/venus/ads_task.py` | Yeni alanlar | 1 |
| 6 | `schemas/venus/experiment.py` | Yeni alanlar | 1, 5 |
| 7 | `routers/venus/experiments.py` | AI coach + review endpoint | 5 |

### Frontend (Bileşenler)

| # | Dosya | Değişiklik | Faz |
|---|-------|-----------|-----|
| 8 | `types/venus-ads.ts` | Tüm yeni FK alanları + ai_comment | 1, 5 |
| 9 | `stores/venusAdsStore.ts` | `getAICoaching`, `getAIReview` | 5 |
| 10 | `campaigns/CampaignExplorer.tsx` | Satır tıklanabilir, detay modal tetikle | 2 |
| 11 | `campaigns/CampaignDetailModal.tsx` | **YENİ** — Kampanya detay + bağlantı baloncukları | 2 |
| 12 | `components/LinkedItemChip.tsx` | **YENİ** — Yeniden kullanılabilir baloncuk bileşeni | 2 |
| 13 | `creatives/CreativeForm.tsx` | Kampanya/Test dropdown, URL önizleme, thumbnail_url sync | 1, 3 |
| 14 | `creatives/CreativeLibrary.tsx` | Görsel URL fallback, referrerPolicy, bağlantı baloncukları | 2, 3 |
| 15 | `tests/TestCenter.tsx` | Line-through kaldır, detay modal + baloncuklar | 2, 4 |
| 16 | `tests/TestForm.tsx` | Kampanya dropdown, AI koçluk alanı | 1, 5 |
| 17 | `tests/TestDetailModal.tsx` | **YENİ** — Detay + AI yorum | 4, 5 |
| 18 | `tasks/AdsTaskBoard.tsx` | Sürükle-bırak + kampanya/test/kreatif dropdown + baloncuklar | 1, 2, 6 |
| 19 | `onboarding/OnboardingChecklist.tsx` | Madde ekleme (+) ve silme (🗑️) | 6 |

**Toplam: 19 dosya (3 yeni, 16 düzenleme)**

---

## ✅ DOĞRULAMA PLANI

### Faz 1 — Çapraz Bağlantı
- [ ] Kampanya oluşturduktan sonra Test formunda o kampanya seçilebiliyor
- [ ] Kreatif formunda hem kampanya hem test seçilebiliyor
- [ ] Görev formunda kampanya + test + kreatif seçilebiliyor
- [ ] Seçilen bağlantılar DB'de doğru FK ile kaydediliyor

### Faz 2 — Baloncuklar
- [ ] Kampanya satırına tıklayınca detay modal açılıyor
- [ ] Modal'da bağlı testler, kreatifler, görevler baloncuk olarak görünüyor
- [ ] Baloncuğa tıklayınca ilgili detay açılıyor
- [ ] Test kartlarında bağlı kampanya baloncuğu görünüyor
- [ ] Kreatif kartlarında bağlı kampanya + test baloncuğu görünüyor
- [ ] Görev kartlarında bağlı kampanya + test baloncuğu görünüyor

### Faz 3 — Görsel URL
- [ ] Google Drive URL ile görsel eklenince kart üzerinde görünüyor
- [ ] Hatalı URL'de fallback icon gösteriliyor

### Faz 4 — Test Detay Modal
- [ ] Tamamlanan teste tıklayınca detay modal açılıyor
- [ ] Hipotez, öğrenim, kazanan net ve okunaklı gösteriliyor (üzeri çizilmiyor)

### Faz 5 — AI Entegrasyonu
- [ ] Test oluştururken AI koçluk önerisi form'un altında görünüyor
- [ ] Tamamlanan test modal'ında AI yorumu oluşturulup gösteriliyor

### Faz 6 — Kanban + Devralma
- [ ] Görev kartları sürüklenip farklı sütuna bırakılabiliyor
- [ ] Tamamlandı → Yapılacak yönünde sürükleme de çalışıyor
- [ ] Devralma listesine yeni madde eklenebiliyor (+)
- [ ] Maddeler çöp kutusu ile silinebiliyor

### Genel
- [ ] GitHub push sonrası Render deploy sorunsuz
