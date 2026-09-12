# 🎨 Planla & CRM Panel — 2026 Modern Minimalist Cam Tasarım Sistemi (Design DNA)

> Bu döküman, `/Users/bekir/Uygulamalarim/6-Crm Panel` ve `/Users/bekir/Uygulamalarim/2-My-World` sistemlerinin ortak görsel tasarım dili, tema tokenları, tipografi hiyerarşisi, çift modlu (Dual-Theme: Aydınlık Kağıt / Gece Camı) okuma deneyimi ve `360-tasarim-uzmani` anayasal ilkelerini belgeler.

---

## 💎 1. TASARIM FELSEFESİ & ANAYASAL İLKELER

1. **2026 Modern Minimalist Cam & El Yapımı UX:**
   - Ağır monolitik gölgeler ve kaba AI şablonları yasaktır.
   - El işçiliği Bento grid düzeni, kademeli kaydırma (`useDragToScroll`), cam yüzey katmanları (`backdrop-blur-xl`) ve yüksek kontrastlı okuma tipografisi esastır.
2. **Gerçek Çift-Mod (True Dual-Theme Architecture):**
   - **Aydınlık Tema (Editorial Paper):** Göz yormayan, zarif kağıt hissi veren açık zemin (`oklch(97.02% 0.0015 253.83)` / `#f8fafc`), saf beyaz kartlar (`rgba(255, 255, 255, 0.95)`), koyu ve net arduvaz tipografi (`#09090b` / `#0f172a`), pastel vurgu zeminleri.
   - **Karanlık Tema (Midnight Glass):** Derin mineral gece tuvali (`#080b11` / `#09090b`), yarı saydam koyu cam yüzeyler (`rgba(18, 23, 39, 0.85)` / `#111625`), parıldayan lüminesan sınırlar (`border-white/10`) ve neon vurgular.
3. **Aydınlık İçinde Siyah Kutu Yasağı (Sıfır Kontrast Hatası):**
   - Aydınlık temada kullanıcıya aniden zifiri karanlık kutular veya okunaksız açık gri yazılar gösterilemez. Tüm arayüz seçilen temaya kusursuz uyum sağlar.
4. **Tek Vurgu Rengi (OKLCH Accent Rule):**
   - Sayfa genelinde karmaşık renk cümbüşü yerine tek bir baskın vurgu rengi kullanılır:
     `--accent-primary: oklch(0.65 0.22 260)` (Elektrik İndigo / Mavi).
5. **5-Durumlu Etkileşim (5-State Interaction):**
   - Tüm interaktif öğeler 5 duruma (`default`, `hover`, `active`, `focus-visible`, `disabled`) eksiksiz sahip olmalıdır.
6. **Dokunma ve Mobil Ergonomi (44px Rule):**
   - Masaüstü ve mobilde tüm buton ve tıklanabilir hedefler en az 44x44px dokunma alanına (`--touch-target-min: 44px`) sahiptir.

---

## 🌈 2. TEMA VE CSS DEĞİŞKENLERİ (TOKEN SÖZLÜĞÜ)

CRM Panel (`6-Crm Panel/frontend/src/app/globals.css`) ve Planla (`2-My-World/app/web`) ortak token hiyerarşisi:

### 2.1. Aydınlık Mod Tokenları (`:root`, `.light`, `[data-theme="light"]`)
```css
:root, .light {
  /* Tuval ve Zemin */
  --bg-canvas: oklch(97.02% 0.0015 253.83); /* Soğuk Editoryal Gri #f8fafc */
  --card-bg: rgba(255, 255, 255, 0.95);
  --card-border: rgba(0, 0, 0, 0.08);
  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  --border-hover: rgba(0, 0, 0, 0.14);

  /* Cam & Yüzeyler */
  --surface-solid: #ffffff;
  --surface-glass: rgba(255, 255, 255, 0.85);
  --surface-header: rgba(255, 255, 255, 0.85);
  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-glass: rgba(255, 255, 255, 0.6);

  /* Tipografi */
  --text-primary: #09090b;   /* Derin Arduvaz / Slate 950 */
  --text-secondary: #334155; /* Slate 700 */
  --text-muted: #64748b;     /* Slate 500 */

  /* Fonksiyonel & Vurgu */
  --brand-primary: #4f46e5;  /* Canlı İndigo */
  --brand-glow: rgba(79, 70, 229, 0.20);
  --color-success: #10b981;
  --color-success-bg: rgba(16, 185, 129, 0.08);
  --color-warning: #f59e0b;
  --color-warning-bg: rgba(245, 158, 11, 0.08);
  --color-danger: #ef4444;
  --color-danger-bg: rgba(239, 68, 68, 0.08);

  /* Tablolar */
  --table-bg: #ffffff;
  --table-header-bg: #f1f5f9;
  --table-header-text: #4338ca;
  --table-row-hover: rgba(79, 70, 229, 0.04);
  --table-border: #e2e8f0;
}
```

### 2.2. Karanlık Mod Tokenları (`.dark`, `[data-theme="dark"]`)
```css
.dark {
  /* Tuval ve Zemin */
  --bg-canvas: #080b11;     /* Derin Mineral Siyahı #09090b */
  --card-bg: rgba(18, 23, 39, 0.85);
  --card-border: rgba(255, 255, 255, 0.08);
  --card-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  --border-hover: rgba(255, 255, 255, 0.18);

  /* Cam & Yüzeyler */
  --surface-solid: #111625;
  --surface-glass: rgba(14, 19, 32, 0.80);
  --surface-header: rgba(14, 19, 32, 0.85);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-glass: rgba(255, 255, 255, 0.10);

  /* Tipografi */
  --text-primary: #f8fafc;   /* Slate 50 / Saf Beyaz */
  --text-secondary: #cbd5e1; /* Slate 300 */
  --text-muted: #94a3b8;     /* Slate 400 */

  /* Fonksiyonel & Vurgu */
  --brand-primary: #6366f1;  /* Parlak İndigo */
  --brand-glow: rgba(99, 102, 241, 0.35);
  --color-success: #34d399;
  --color-success-bg: rgba(52, 211, 153, 0.12);
  --color-warning: #fbbf24;
  --color-warning-bg: rgba(251, 191, 36, 0.12);
  --color-danger: #f87171;
  --color-danger-bg: rgba(248, 113, 113, 0.12);

  /* Tablolar */
  --table-bg: rgba(18, 23, 39, 0.85);
  --table-header-bg: rgba(30, 41, 59, 0.95);
  --table-header-text: #a5b4fc;
  --table-row-hover: rgba(99, 102, 241, 0.08);
  --table-border: rgba(255, 255, 255, 0.08);
}
```

---

## 🔤 3. TİPOGRAFİ VE DEFORMASYONSUZ FONT ÖLÇEKLENDİRME

Kullanıcı yazı boyutunu değiştirdiğinde (A- / A / A+), sayfa düzeni veya tablo genişlikleri bozulamaz. Orantılı rem ölçeklendirmesi ve `line-height` standardı:

| Kademe | Gövde Fontu | H1 Boyutu | H2 Boyutu | H3 Boyutu | Satır Aralığı | Kullanım Senaryosu |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A- (Küçük)** | `0.875rem` (14px) | `1.5rem` (24px) | `1.25rem` (20px) | `1.05rem` (17px) | `leading-relaxed` (1.6) | Veri yoğun analizler |
| **A (Standart)**| `1.000rem` (16px) | `1.875rem` (30px)| `1.40rem` (22px) | `1.15rem` (18px) | `leading-relaxed` (1.75) | Genel okuma ve bülten |
| **A+ (Büyük)** | `1.125rem` (18px) | `2.25rem` (36px) | `1.65rem` (26px) | `1.30rem` (21px) | `leading-loose` (1.85) | Odaklanmış Zen okuma |

---

## 🧭 4. SCOUT RADAR & BRİFİNG OKUMA BİLEŞENLERİ

1. **Toolbar ve Tema Değiştirici (Sun / Moon):**
   - Hem standart görünümde, hem tam ekran Zen modunda hem de bağımsız HTML çıktısında tek tıkla anında aydınlık/karanlık mod geçişi sunulur.
2. **Bölüm Gezgini (Perspective Navigator):**
   - Alt sekmeler (`60s Özeti`, `GitHub & MCP`, `Frontier AI`, `Topluluk Nabzı`, `Mimari & FSM`, `A/B Testleri`, `Aksiyonlar`, `Telemetri`) birbirini ezmez; her sekme tıklandığında yalnızca o konunun rafine kartı görüntülenir.
3. **A/B Testleri ve Derin Vaka Analizi:**
   - Salt sayısal token tablosu yerine 5 ayaklı yönetici analizi sunulur:
     1. 🔍 **Ne Karşılaştırıldı?**
     2. 🧪 **Test Metodolojisi ve Bulgular (CRM App :8000 ve Planla :3000)**
     3. 🏆 **Kazanan ve Neden Kazandı?**
     4. ⚙️ **Sistemimize Entegrasyon (Maestro Sovereign Core & Niyet Algılama)**
     5. 💡 **Geliştirici & İş Kazancı (ROI)**
4. **Kod ve Mimari ASCII Şemaları:**
   - ASCII diyagramlar ve kod blokları temadan bağımsız olarak koyu mineral tabanda (`#0b101d`), yüksek kontrastlı cyan/emerald metinle ve tek tıkla kopyalama butonuyla sunulur.
