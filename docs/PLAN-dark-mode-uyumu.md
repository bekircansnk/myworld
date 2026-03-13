# Karanlık Tema (Dark Mode) Renk Uyumu Planı

> **Amaç:** Dark mode'da tüm sayfalardaki renk tonlarını birbirleriyle uyumlu, okunabilir ve premium hale getirmek. AI Sohbet ekranındaki başarılı renk paletini referans olarak kullanmak.

---

## 📸 Mevcut Durum Analizi (Ekran Görüntüleri)

### ✅ AI Sohbet (REFERANS — Doğru Çalışıyor)
- Navy/koyu arka plan + altın sarısı (`#ffcc5c`) vurgular
- Beyaz metin, yeterli kontrast
- Soft kenarlıklar (`border-white/5`)
- Kartlar `rgba(26,30,46,0.85)` — mükemmel

### ❌ Görevler Sayfası (Kanban) — Sorunlar
1. **Kart arka planı çok koyu mor/pembe** — proje rengiyle belirleniyor ama dark mode'da opaklık çok düşük (`0.12`), metin okunmuyor
2. **"Not:" etiketi** sarı renk koyu arka planda okunabilir ama kart arka planı uyumsuz
3. **"PikselAI" ve "Acil" etiketleri** çok küçük font + düşük kontrast = okunamıyor
4. **"İlerleme" metni** `text-gray-500` dark modda görünmüyor
5. **DotProgress** noktaların unfilled hali `rgba(0,0,0,0.06)` — dark modda tamamen kaybolur

### ❌ Takvim Sayfası — Sorunlar
1. **Gün numaraları** `text-gray-600 dark:text-gray-400` — kontrast yetersiz
2. **Hafta başlıkları** (PZT, SAL...) çok soluk: `text-gray-400 dark:text-gray-500`
3. **Ana takvim alanı** `bg-white/80` dark modda → beyaz ton ile koyu ton arası uyumsuz
4. **Sol panel** border çizgileri (`border-gray-100`) dark mode'da görünmüyor veya anlamsız
5. **Aylık Özet kartı** indigo/purple gradient dark modda çok koyu, metin okunamıyor

### ❌ Dashboard — Sorunlar
1. **Takvim widget** gün numaraları soluk
2. **"Tamamlanan Görev" metni** düşük kontrast
3. **Gelişim chart** bar göstergeleri ve etiketler dark modda okunması zor
4. **İlerleme çubuğu** (header) `bg-white/50 dark:bg-black/20` — çok koyu

---

## 🎯 Referans Renk Paleti (AI Sohbet Bazlı)

| Öğe | Renk (Dark Mode) | Örnek |
|-----|-------------------|-------|
| **Body Gradient** | `#0f1117 → #151926` | ✅ Zaten doğru |
| **Floating Card BG** | `rgba(26, 30, 46, 0.85)` | Tüm kartlara uygulanacak |
| **Primary Text** | `#f0f0f0` / `text-white` | Başlıklar |
| **Secondary Text** | `#9ca3af` / `text-gray-400` | Alt metinler |
| **Tertiary Text** | `#6b7280` / `text-gray-500` | En düşük öncelik metin |
| **Accent (Gold)** | `#ffcc5c` | CTA, aktif göstergeler |
| **Border** | `rgba(255,255,255,0.08)` | Kart/panel kenarları |
| **Soft Surface** | `rgba(255,255,255,0.05)` | İç kutu/input arka planları |
| **Divider** | `rgba(255,255,255,0.06)` | Ayırıcı çizgiler |

---

## Proposed Changes

### Phase 1: Global Dark Mode Temeli

#### [MODIFY] globals.css
- `.dark .floating-card` arka plan opaklığını artır: `0.85 → 0.90`
- Dark mode divider renkleri: `rgba(255,255,255,0.08)`
- DotProgress unfilled renk dark mode fix: `rgba(255,255,255,0.1)`

---

### Phase 2: Görev Kartları (TaskCard.tsx)

#### [MODIFY] TaskCard.tsx
1. `getCardStyleDark()` → arka plan opaklığı artır (`0.12 → 0.18`) ve temel rengi daha açık yap
2. Default dark kart → `rgba(26, 30, 46, 0.90)` (floating-card ile uyumlu)
3. `DotProgress` unfilled dot → dark modda `rgba(255,255,255,0.1)` kullan
4. Proje adı metin rengi: `dark:text-gray-300 → dark:text-gray-200`
5. Alt metin (Not) okunabilirliği: `dark:text-gray-400 → dark:text-gray-300`

#### [MODIFY] KanbanBoard.tsx
1. Kolon başlıkları: `dark:text-gray-400` → `dark:text-gray-300`
2. Görev sayısı: `dark:text-gray-600` → `dark:text-gray-500`

---

### Phase 3: Takvim Sayfası (CalendarPage.tsx)

#### [MODIFY] CalendarPage.tsx
1. **Ana takvim alanı** arka plan: `bg-white/80 dark:bg-[#151926]/80` → `dark:bg-[#151926]/90`
2. **Sol panel** arka plan: `dark:bg-[#151926]/60` → `dark:bg-[#151926]/80`
3. **Gün numaraları** kontrast artır: `dark:text-gray-400` → `dark:text-gray-300`
4. **Hafta başlıkları**: `dark:text-gray-500` → `dark:text-gray-400`
5. **Border renkleri**: `border-gray-100 dark:border-white/5` → `dark:border-white/8`
6. **Aylık özet kartı** dark mode gradient: daha açık tonlar
7. **Bugün gösterim**: `dark:bg-indigo-900/10` → `dark:bg-amber-900/15` (sarı vurguya geç, AI Sohbet ile uyum)
8. **Header butonları**: kontrast iyileştir
9. **"Bekleyen Görevler" listesi** kart arka planı: `dark:bg-slate-800` → floating uyumlu

---

### Phase 4: Dashboard Widget'ları (DashboardWidgets.tsx)

#### [MODIFY] DashboardWidgets.tsx
1. **Takvim widget** gün numaraları: `dark:text-white` → kontrast artır
2. **Gelişim chart** bar etiketleri: `dark:text-white` metin kontrastı
3. **İlerleme çubuğu** (header stats): `dark:bg-black/20` → `dark:bg-white/5`
4. **Görev listesi** metin: hover rengi `dark:text-brand-yellow` tutarlılık

---

### Phase 5: Notlar ve Raporlar

#### [MODIFY] NotesList.tsx + ReportsPage.tsx
- Dark mode arka plan uyumu kontrol et
- Floating-card efekti uygula
- Border ve metin renk tutarlılığı

---

## Verification Plan

### Build Doğrulaması
1. `npm run dev` hatasız çalıştığını doğrula

### Görsel Doğrulama (Tarayıcı)
1. Dark mode'a geç
2. Tüm sayfalarda gezin: Dashboard → Görevler → Takvim → AI Sohbet → Notlar → Raporlar
3. Her ekranda metin okunabilirliğini kontrol et
4. Renk tonlarının birbiriyle uyumlu olduğunu doğrula
5. AI Sohbet ile diğer sayfalar arasında renk tutarlılığı kontrol et
