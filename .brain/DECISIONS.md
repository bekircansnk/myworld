# 2-My-World — Geçmiş Kayıtlardan Derlenen Mimari Kararlar

> Bu dosya projedeki geçmiş mimari ve geliştirme kayıtlarından derlenmiştir.

### 🎨 Arayüz Renk Kodları & Estetik Standartlar:
**Kaynak Dosya:** `logo_prompt_kutuphanesi.md`
**Kraliyet Mavisi (Royal Blue):** Devam Eden İşler / Süreç (`#3b82f6`)
- **Zümrüt Yeşili (Emerald Green):** Tamamlanan Görev / Check (`#10b981`)
- **Canlı Amber/Turuncu (Vibrant Amber/Orange):** Yapılacak Görev / Odak (`#f97316`)
- **Koyu Grafit (Deep Slate):** Kart Sınırları, Yazılar ve Yapı (`#1f2937`)
- **Arka Plan:** Tamamen temiz, parazitsiz ve saf beyaz arka plan (*pure solid white background*).
- **Format:** Düz vektör mobil uygulama ikonu (*flat vector app icon*), belirgin geometrik şekiller, yumuşak gölgeler (*soft shadows*) ve sıfır mockup.

---

---

### 2. Tamamlanan Görev Geçişi (Görev Kaydırma - Swipe to Done)
**Kaynak Dosya:** `logo_prompt_kutuphanesi.md`
> *Bir görev kartının soldan sağa kayarak tamamlanma (done) durumuna geçiş anını simgeleyen dinamik, iki tonlu (mavi ve yeşil) şık bir tasarım.*
> `A sleek flat vector logo depicting a task card dynamically sliding from left to right, transitioning from royal blue to emerald green. A clean minimalist checkmark appears on the green side. Pure white background, modern workflow sync, premium app icon --v 6.0`

---

### 8. Tamamlanmış Görev Yıldızı (Success Star)
**Kaynak Dosya:** `logo_prompt_kutuphanesi.md`
> *Dört adet minimalist görev kartının ortada birleşerek negatif alanda bir başarı/tamamlama yıldızı oluşturduğu son derece akıllıca bir tasarım.*
> `A smart negative space vector logo featuring four task cards forming a success star in the center negative space. Royal blue, vibrant amber, and emerald green accents. Pure solid white background, flat icon design, highly creative --v 6.0`

---

### Çözüldü
**Kaynak Dosya:** `SYSTEM_CHANGELOG.md`
**Android Default ActionBar Görünmesi:** Rebranding güncellemesi sonrası Android APK'da splash screen kapandıktan sonra sol üstte "Pl..." şeklinde gereksiz bir uygulama simgesi/başlığı çıkıyordu. Android `styles.xml` içindeki `AppTheme` base parent'ı `Theme.AppCompat.Light.DarkActionBar` yerine `Theme.AppCompat.Light.NoActionBar` yapılarak bu görsel bozukluk giderildi.

---

---

### 2️⃣ Akıllı Yapay Zeka Asistanı
**Kaynak Dosya:** `README.md`
Doğal dilde konuşarak günlük planlar yapın, hızlıca görev oluşturun ve asistanınızın kalıcı hafızasıyla kararlarınızı destekleyin.

<p align="center">
  <img src="image/showcase_02.png" alt="Pikseliş - Yapay Zeka Asistanı" width="100%">
</p>

---

---

### 1. ARCHITECTURE.md Güncelleme
**Kaynak Dosya:** `GEMINI.md`
İlgili bölüm (dosya yapısı, API haritası, store tablosu, bileşen detayları, tamamlanan/TODO listesi) güncelle
- Yeni dosya eklendiyse dosya ağacına ekle
- Yeni store/state eklendiyse State tablosuna ekle
- API değişikliği varsa endpoint haritasını güncelle
- Tamamlanan özellik varsa "Tamamlanan" listesine ekle
- En üstteki "Son Güncelleme" tarihini güncelle

---

### 2. Ne Zaman Güncelle
**Kaynak Dosya:** `GEMINI.md`
Yeni bir bileşen dosyası oluşturulduğunda
- Mevcut bir store'a yeni field/metod eklendiğinde
- Yeni bir API endpoint eklendiğinde veya değiştirildiğinde
- Yeni bir veritabanı kolonu veya model eklendiğinde
- Navigasyon yapısı değiştiğinde
- Büyük UI değişiklikleri yapıldığında

---

### Teknoloji Listesi (Kısa)
**Kaynak Dosya:** `GEMINI.md`
Backend: FastAPI + SQLAlchemy 2.0 + asyncpg + PostgreSQL + Google Gemini
- Frontend: Next.js 15 + TypeScript + Zustand (6 store) + shadcn/ui + Tailwind CSS
- Altyapı: Docker Compose (PG+Redis), WebSocket, Telegram Bot (planlı)

---

### Keyboard accessible (2.1)
**Kaynak Dosya:** `SKILL.md`
**All functionality must be keyboard accessible:**
```javascript
// ❌ Only handles click
element.addEventListener('click', handleAction);

// ✅ Handles both click and keyboard
element.addEventListener('click', handleAction);
element.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleAction();
  }
});
```

**No keyboard traps.** Users must be able to Tab into and out of every component. Use the [modal focus trap pattern](references/A11Y-PATTERNS.md#modal-focus-trap) for dialogs—the native `<dialog>` element handles this automatical

---

### Jules Değişikliklerini Kontrol Etme & Doğrulama
**Kaynak Dosya:** `JULES_PRO_GUIDE.md`
Jules bir görevi tamamlayıp yerel koda uyguladıktan sonra yapılması gereken **kontrol ve test adımları**:

---

