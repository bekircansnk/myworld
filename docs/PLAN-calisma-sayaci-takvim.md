# Çalışma Sayacı ↔ Takvim Entegrasyonu Planı

## Amaç
Dashboard'daki **Çalışma Sayacı** widget'ını ikiye bölerek:
- **Sol taraf:** Mevcut saat:dakika:saniye sayacı (biraz küçültülmüş)
- **Sağ taraf:** Takvimden o anki saate düşen etkinliği otomatik gösteren, ilerleme barı olan canlı bir alan

---

## 🔍 Mevcut Durum Analizi

### Çalışma Sayacı Widget'ı
- **Dosya:** `DashboardWidgets.tsx` satır 408-441
- **Yapı:** `bg-white rounded-2xl p-6` kartı, orta kolondaki 2-sütunlu grid'in sağ tarafı
- **Özellikler:** Dairesel SVG progress, HH:MM:SS sayaç, Play/Pause/Reset butonları
- **Grid:** `grid-cols-1 md:grid-cols-2 gap-4` (Gelişim Chart | Çalışma Sayacı)

### Takvim Store
- **Store:** `calendarStore.ts` — zustand + persist, `events: CalendarEvent[]`
- **CalendarEvent tipi:** `startTime?: string (HH:mm)`, `endTime?: string (HH:mm)`, `title`, `color`, `category`, `isCompleted`

---

## 📐 Tasarım Kararları

### Layout Mantığı
Mevcut Çalışma Sayacı kartının **iç yapısı** ikiye bölünecek:

```
┌──────────────────────────────────────────────┐
│ Çalışma Sayacı                               │
├────────────────────┬─────────────────────────┤
│                    │  📌 Proje Toplantısı    │
│     01:23:45       │  16:00 – 17:00          │
│    ● Çalışıyor     │  ⏱ 23. dakikadayız      │
│                    │  ●●●●●●○○○○             │
│  ▶  ↺              │                         │
└────────────────────┴─────────────────────────┘
```

### Sağ Taraf Kuralları
1. **Otomatik etkinlik tespiti:** Her dakika `currentTime` ile bugünün etkinlikleri arasından `startTime <= now < endTime` olan bulunur
2. **Gösterilecekler:**
   - Etkinlik balonu (renk + başlık)
   - Saat aralığı: `16:00 – 17:00`
   - Geçen süre: `23. dakikadayız`
   - Progress dots: Toplam süre üzerinden oran hesaplanır, tamamlanan kısım dolu, kalan boş
3. **Tamamlandığında:** Dots yeşile döner, "Tamamlandı ✓" yazısı çıkar
4. **Sonraki etkinlik:** Bir etkinlik bittiğinde sıradaki gösterilir; yoksa alan boş kalır
5. **Etkinlik yokken:** "Şu an aktif etkinlik yok" mesajı

---

## 🚀 Uygulama Planı

### Phase 1: Çalışma Sayacı Widget Yeniden Tasarımı (Frontend Only)

#### [MODIFY] [DashboardWidgets.tsx](file:///Users/bekir/Uygulamalarım/2-My-World/app/frontend/src/components/dashboard/DashboardWidgets.tsx)

**1. Import eklemeleri:**
- `useCalendarStore` eklenir
- `CalendarEvent`, `EVENT_COLORS` import edilir

**2. Yeni state ve hesaplamalar (satır 55-110 civarı):**
```
// Mevcut currentTime zaten 1 saniyede bir güncelleniyor (satır 49-53) ✅

// Bugünün takvim etkinliklerini al
const { events: calendarEvents } = useCalendarStore()

// Şu anki aktif etkinliği bul
const activeCalendarEvent = useMemo(() => {
  const now = currentTime
  const todayStr = format(now, 'yyyy-MM-dd')
  const todayEvents = calendarEvents
    .filter(e => e.date === todayStr && e.startTime && e.endTime && !e.allDay)
    .sort((a,b) => a.startTime!.localeCompare(b.startTime!))
  
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  
  // Şu an devam eden etkinlik
  const current = todayEvents.find(e => {
    const [sh, sm] = e.startTime!.split(':').map(Number)
    const [eh, em] = e.endTime!.split(':').map(Number)
    const start = sh * 60 + sm
    const end = eh * 60 + em
    return nowMinutes >= start && nowMinutes < end
  })
  
  return current || null
}, [calendarEvents, currentTime])

// Etkinlik progress hesabı
const eventProgress = useMemo(() => {
  if (!activeCalendarEvent?.startTime || !activeCalendarEvent?.endTime) return null
  const now = currentTime
  const [sh, sm] = activeCalendarEvent.startTime.split(':').map(Number)
  const [eh, em] = activeCalendarEvent.endTime.split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const totalMin = endMin - startMin
  const elapsedMin = nowMin - startMin
  const percent = Math.min(Math.max((elapsedMin / totalMin) * 100, 0), 100)
  const isComplete = percent >= 100
  return { elapsedMin, totalMin, percent, isComplete }
}, [activeCalendarEvent, currentTime])
```

**3. Widget HTML yapısı değişikliği (satır 408-441):**

Mevcut tek kolon yerine **iki kolon** (`flex flex-row`) yapılacak:

- **Sol kolon (~45%):** Mevcut sayaç mantığı korunur, dairesel SVG biraz küçültülür (`w-24 h-24` → eski `w-36 h-36`'dan), font boyutları bir kademe küçülür
- **Sağ kolon (~55%):** Aktif takvim etkinliği balonu:
  - Etkinlik rengiyle `EVENT_COLORS[event.color]` arka plan
  - Etkinlik başlığı (bold)
  - Saat aralığı: `HH:MM – HH:MM`
  - Geçen dakika: `{elapsedMin}. dakikadayız`
  - 10 adet progress dot (filled/empty oranla)
  - Tamamlandığında yeşil dot'lar + "Tamamlandı ✓"

**4. Buton düzeni:**
- Play/Pause/Reset butonları sol kolonun altında kalır (mevcut konum)

---

### Phase 2: Etkinlik Tamamlanma Otomasyonu

Sağ taraftaki etkinlik otomatik ilerler. `currentTime` her saniye güncelleniyor, bu `useMemo` bağımlılığıyla sağ panel de otomatik güncellenir. Ek bir interval gerekmiyor.

#### Tamamlanma Mantığı:
- Saat `endTime`'ı geçince → `percent = 100`, dot'lar yeşil, "Tamamlandı" rozeti
- Bir sonraki etkinlik varsa → otomatik olarak o gösterilir
- Yoksa → "Şu an aktif etkinlik yok" mesajı

---

## 📐 Değiştirilecek Dosyalar

| Dosya | Değişiklik | Zorluk |
|-------|-----------|--------|
| `DashboardWidgets.tsx` | Widget ikiye bölünür, calendar store import + aktif etkinlik mantığı + yeni JSX | Orta |

> **Toplam:** 1 dosya değişikliği. Backend'de değişiklik yok.

---

## ✅ Doğrulama Planı

### Manuel Doğrulama (Tarayıcı Üzerinden)

1. **Dev sunucuyu başlat:** `cd /Users/bekir/Uygulamalarım/2-My-World && npm run dev` (veya mevcut başlatma scripti)
2. **Dashboard'a git** ve Çalışma Sayacı widget'ını kontrol et:
   - Sol tarafta saat:dakika:saniye sayacı görünmeli
   - Sağ tarafta aktif takvim etkinliği gösterilmeli (varsa)
3. **Takvime test etkinliği ekle:** Şu anki saati kapsayan bir etkinlik oluştur (örn: 03:00-04:00 arası)
4. **Kontrol listesi:**
   - [x] Sayaç sol tarafta düzgün çalışıyor mu?
   - [x] Play/Pause/Reset butonları çalışıyor mu?
   - [x] Sağ tarafta etkinlik balonu görünüyor mu?
   - [x] Saat aralığı doğru gösteriliyor mu?
   - [x] "X. dakikadayız" doğru hesaplanıyor mu?
   - [x] Progress dot'lar orantılı doluyur mu?
   - [x] Etkinlik bitince dot'lar yeşile döndü mü?
   - [x] Bir sonraki etkinlik otomatik gösteriliyor mu?
   - [x] Etkinlik yokken "Şu an aktif etkinlik yok" mesajı görünüyor mu?
   - [x] Dark mode'da düzgün görünüyor mu?

### Tarayıcı Testi
- Dev sunucu açıkken browser tool ile dashboard sayfasına gidilir
- Çalışma sayacı widget'ının iki bölüme ayrıldığı görsel olarak doğrulanır
- Screenshot ile sonuç belgelenir

---

## 📋 Bağımlılıklar
- Mevcut `useCalendarStore` zaten zustand ile persist ediliyor ✅
- `CalendarEvent` tipinde `startTime` ve `endTime` alanları mevcut ✅
- `EVENT_COLORS` renk haritası mevcut ✅
- `currentTime` her saniye güncelleniyor ✅

**Yeni kütüphane veya paket gerekmiyor.**
