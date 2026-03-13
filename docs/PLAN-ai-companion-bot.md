# AI Companion Floating Bot — Proje Planı

> **Amaç:** Mevcut sağ alt köşedeki basit `ChatWidget` butonunu, `ai-companion` projesindeki animasyonlu robot karakteri ile değiştirmek. Bu robot tüm sayfalarda sabit kalacak, küçük boyutlu animasyonlu bir AI asistan simgesi olarak çalışacak. Tıklandığında mevcut chat penceresi açılacak; ek olarak AI konuştuğunda yukarı doğru kayan baloncuklarla mesajlar görüntülenecek.

---

## 📋 Kapsam Özeti

| Özellik | Açıklama |
|---------|----------|
| **Animasyonlu Robot Simgesi** | `ai-companion/App.tsx`'deki Robot bileşeni küçültülüp (~64×64px) floating button olarak kullanılacak |
| **Tüm Sayfalarda Görünürlük** | `layout.tsx`'de zaten global; sadece buton tasarımı değişecek |
| **Konuşma Baloncukları** | AI mesaj gönderdiğinde robotun üstünde 1–3 baloncuk belirip kayan yazıyla mesaj gösterecek |
| **Motion Kütüphanesi** | Ana projeye `motion` (Framer Motion) kurulacak |
| **Mevcut Chat Penceresi** | Aynen kalacak, sadece tetikleyici buton değişecek |

---

## Phase 1 — Altyapı Hazırlığı

### 1.1 `motion` Kütüphanesini Kur
- `npm install motion` → `/Users/bekir/Uygulamalarım/2-My-World/app/frontend/`
- Bu kütüphane `ai-companion` projesinde zaten kullanılıyor (animate, transition vb.)

---

## Phase 2 — MiniRobot Bileşeni Oluştur

### 2.1 `[YENİ]` MiniRobot.tsx
**Konum:** `src/components/chat/MiniRobot.tsx`

Robot bileşeninin küçültülmüş versiyonu:
- **Boyut:** ~64×64px (w-16 h-16)
- **Animasyonlar:**
  - Hafif yukarı-aşağı süzülme (floating, `y: [0, -6, 0]`, 3s loop)
  - Göz kırpma (scaleY blink, 4s loop)
  - Halka animasyonları (küçük, subtle)
  - Hover'da hafif büyüme (scale 1.1)
- **Ambient glow:** Sarı/altın tonunda hafif parıltı
- **Tıklama:** `onClick` prop'u alacak → chat toggle

---

## Phase 3 — Konuşma Baloncukları Sistemi

### 3.1 `[YENİ]` SpeechBubbles.tsx
**Konum:** `src/components/chat/SpeechBubbles.tsx`

AI mesaj gönderdiğinde robotun üst tarafında beliren baloncuklar:
- **Tetikleme:** `chatStore`'daki son AI mesajı değiştiğinde
- **Görünüm:** 
  - 1–3 küçük yuvarlak baloncuk (düşünme noktaları gibi) → ardından ana baloncuk
  - Ana baloncukta mesaj metni kayan yazı (typewriter efekti)
  - 5–8 saniye sonra otomatik kaybolma (fadeOut)
- **Konum:** Robotun hemen üstünde, sağdan hafif sola offset
- **Stil:** Cam efektli (glassmorphism), yarı saydam arka plan
- **Max genişlik:** 250px, max 2 satır text → fazlası "..." ile kesilir

---

## Phase 4 — ChatWidget Entegrasyonu

### 4.1 `[GÜNCELLE]` ChatWidget.tsx
**Konum:** `src/components/chat/ChatWidget.tsx`

Değişiklikler:
- Mevcut `<Button>` (satır 113–120) → `<MiniRobot>` + `<SpeechBubbles>` ile değiştirilecek
- `fixed bottom-6 right-6` konumu korunacak
- `z-50` korunacak
- Chat penceresi açıkken robot gizlenecek (mevcut davranış aynen)

### 4.2 `[GÜNCELLE]` chatStore.ts
**Konum:** `src/stores/chatStore.ts`

Yeni state alanları:
- `lastAiMessage: string | null` — Son AI mesajını takip etmek için
- `showBubble: boolean` — Baloncuk görünürlüğü
- `dismissBubble()` — Baloncuğu kapatma

---

## Phase 5 — Proaktif AI Mesajları (Gelecek — Bu Fazda Sadece Altyapı)

> **Not:** Kullanıcı gelecekte AI'ın saat ilerledikçe otomatik mesaj göndermesini istiyor. Bu fazda sadece baloncuk sisteminin "dışarıdan tetiklenebilir" olması sağlanacak, tam proaktif sistem sonraki iterasyonda yapılacak.

### 5.1 chatStore'a proaktif mesaj altyapısı
- `triggerBubbleMessage(text: string)` fonksiyonu eklenmesi
- Bu fonksiyon chat'e mesaj eklemeden, sadece baloncukta gösterme imkanı sunacak

---

## 🔍 Doğrulama Planı

### Tarayıcı Testi
1. `npm run dev` ile projeyi başlat
2. Tarayıcıda `localhost:3000` aç
3. **Kontrol 1:** Sağ altta animasyonlu robot simgesi görünüyor mu?
4. **Kontrol 2:** Robot hafif yukarı-aşağı hareket ediyor mu? Gözleri kırpıyor mu?
5. **Kontrol 3:** Robot'a tıklayınca chat penceresi açılıyor mu?
6. **Kontrol 4:** Chat'te mesaj gönderince, chat kapatıldıktan sonra robotun üstünde baloncuk beliriyor mu?
7. **Kontrol 5:** Farklı sayfalara (Görevler, Takvim, Notlar) geçince robot hala görünüyor mu?
8. **Kontrol 6:** Hover'da robot hafif büyüyor mu?

### Build Testi
```bash
cd /Users/bekir/Uygulamalarım/2-My-World/app/frontend && npm run build
```
- TypeScript hataları olmadan build tamamlanmalı.

---

## 📁 Etkilenen Dosyalar

| Dosya | İşlem | Açıklama |
|-------|-------|----------|
| `package.json` | GÜNCELLE | `motion` bağımlılığı ekle |
| `src/components/chat/MiniRobot.tsx` | YENİ | Küçük animasyonlu robot bileşeni |
| `src/components/chat/SpeechBubbles.tsx` | YENİ | AI konuşma baloncukları |
| `src/components/chat/ChatWidget.tsx` | GÜNCELLE | Buton → MiniRobot + Baloncuk |
| `src/stores/chatStore.ts` | GÜNCELLE | lastAiMessage, showBubble state |
