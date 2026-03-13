# My World — Tasarım Sistemi (Design System)

> **Bu dosya, uygulamanın standart renk paletini, kart stillerini ve tasarım kurallarını tanımlar.**
> Yeni bir ekran, sayfa veya widget geliştirirken bu dosyaya referans verin.

---

## 🎨 Ana Renk Paleti (5 Renk)

### Light Mode

| # | Renk Adı | HEX / Değer | CSS Değişkeni | Kullanım Alanı |
|---|----------|-------------|---------------|----------------|
| 1 | **Warm Cream BG** | `linear-gradient(135deg, #f0ede1 0%, #fdfbf7 100%)` | `--app-bg` | Ana sayfa arka planı (sabit, tüm sayfalarda aynı) |
| 2 | **Golden Accent** | `#ffcc5c` | `--color-brand-yellow` | Vurgu, CTA butonları, aktif göstergeler |
| 3 | **Deep Charcoal** | `#333333` | `--color-brand-dark` | Ana metin, koyu butonlar, başlıklar |
| 4 | **Soft Gray** | `#666666` | `--color-brand-gray` | İkincil metin, açıklamalar |
| 5 | **Pure White** | `#ffffff` | `--color-brand-card` | Kartlar, paneller, widget'lar |

### Dark Mode

| # | Renk Adı | HEX / Değer | Kullanım Alanı |
|---|----------|-------------|----------------|
| 1 | **Dark Navy BG** | `linear-gradient(135deg, #0f1117 0%, #151926 100%)` | Ana sayfa arka planı |
| 2 | **Golden Accent** | `#ffcc5c` | Aynı kalır |
| 3 | **Light Text** | `#f0f0f0` | Ana metin |
| 4 | **Muted Gray** | `#9ca3af` | İkincil metin |
| 5 | **Dark Card** | `#1a1e2e` | Kart arka planları |

---

## 🏗️ Tasarım Prensipleri

### 1. Sabit Arka Plan
- Tüm sayfalar **aynı gradient arka planı** kullanır.
- Sayfalar arası geçişlerde arka plan DEĞİŞMEZ.
- Bu, "tek uygulama" hissiyatını korur.

### 2. Floating Kartlar (3D Efekt)
- Kartlar warm cream arka plan üzerinde **havada duruyor** gibi görünür.
- `box-shadow` + hafif `translateY` ile derinlik kazanır.
- Hover'da gölge artar ve kart hafifçe yukarı kalkar.

### 3. Kenar Çizgisi Yok
- Sayfa kenarlarında sert çizgi veya sınır OLMAMALI.
- Kartlar `border-white/50` gibi çok yumuşak kenarlıklar kullanır.

### 4. Dark Mode Kontrast Kuralları
- **Ana metin:** `dark:text-white` veya `dark:text-gray-100` (asla gray-400'den açık olmayan renk)
- **İkincil metin:** `dark:text-gray-300` (asla gray-500 kullanma — okunamaz)
- **Etiketler/Üçüncü seviye:** `dark:text-gray-400` (minimum bu)
- **Border'lar:** `dark:border-white/8` (5'ten az olma — görünmez olur)
- **Arka plan yüzeyler:** `dark:bg-white/5` (slate-800 yerine — daha tutarlı)
- **Floating card:** `rgba(26, 30, 46, 0.92)` — yarı-saydam, backdrop-blur ile
- **Bugünün vurgusu:** `dark:bg-amber-900/10` — altın sarısı tonuyla uyumlu (indigo DEĞİL)
- **Referans ekran:** AI Sohbet — tüm dark mode kararları bu ekranla uyumlu olmalı

---

## 📐 CSS Utility Sınıfları

```css
/* Sabit uygulama arka planı */
.app-bg {
  background: linear-gradient(135deg, #f0ede1 0%, #fdfbf7 100%);
  /* dark: linear-gradient(135deg, #0f1117 0%, #151926 100%) */
}

/* Havada uçan kart efekti */
.floating-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.floating-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
}
```

---

## 🔤 Tipografi

- **Font:** Inter (Google Fonts)
- **Başlıklar:** `font-semibold` veya `font-bold`, `text-brand-dark`
- **Metin:** `text-sm`, `text-brand-gray`
- **Etiketler:** `text-[10px]`, `font-bold`, `uppercase tracking-widest`

---

## 📏 Spacing & Radius

- **Kart radius:** `rounded-2xl` (1.5rem) veya `rounded-3xl` (2rem)
- **İç padding:** `p-5` veya `p-6`
- **Kart arası boşluk:** `gap-4`
- **Sayfa kenar padding:** `p-4 lg:p-6`
