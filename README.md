# 🌍 Pikseliş

**Yapay Zeka Destekli Kişisel Yaşam, İş ve Fotoğraf Takip Yönetim Sistemi**

Pikseliş; sadece sıradan bir "yapılacaklar listesi" veya görev yöneticisi değildir. Kullanıcıyı tanıyan, yönlendiren, motive eden ve iş akışlarını tek bir merkezden yöneten akıllı bir yaşam orkestratörüdür. Masaüstünden Android mobil uygulamasına kadar (Capacitor & PWA) her platformda eş zamanlı ve %100 uyumlu çalışan modern bir ekosistem sunar.

---

## 📱 Mobil & Masaüstü Evrensel Entegrasyon

Pikseliş, **Evrensel Kapsam** ilkesine göre tasarlanmıştır. Web platformunda çalışan her özellik, Android (Capacitor) uygulaması ve PWA sürümlerinde de eşzamanlı olarak hatasız çalışır:
- **Çevrimdışı Çalışma (Offline-First):** Serwist Service Worker entegrasyonu ve IndexedDB tabanlı kuyruklama sistemi sayesinde internet kesildiğinde verileri saklar, internet geldiğinde arka planda otomatik senkronize eder.
- **Uygulama İçi Güncelleme Kontrolü (OTA):** Uygulama her açıldığında veya ön plana geldiğinde yeni APK sürümünü kontrol eder ve kullanıcıyı esnek bir bildirimle uyarır (Zorunlu engelleme olmaksızın).
- **Native Mobil Hissiyatı:** iOS/Android cihazlarda tarayıcı rubber-banding (sayfa sekmesi) etkileri kaldırılmış, ekrana uzun basınca çıkan web bağlam menüleri devre dışı bırakılmış ve mobil alt navigasyon (Bottom Nav) eklenmiştir.

---

## ✨ Öne Çıkan Özellikler & Yenilikler

### 🤖 Akıllı Karşılama & Yerel Motivasyon (Morning Screen)
- Uygulama ilk açıldığında veya yeni bir sekme başlatıldığında sizi saate göre dinamik renk auraları ("Günaydın", "Tünaydın", "İyi Akşamlar", "İyi Geceler") ile karşılar.
- Bugünün takvim etkinliklerini, teslim tarihi gelen görevleri ve geçmişten sarkan işleri özetler.
- **Yerel Motivasyon Havuzu (v4.5):** Yavaş API istekleri yerine, 100+ premium motivasyon sözü içeren hızlı yerel havuzdan rastgele çekim yaparak ekranın anında açılmasını sağlar.

### 📋 Serbest Sıralamalı Mobil Uyumlu Kanban
- **3 Sütunlu Sade Akış:** "Yapılacak", "Devam Eden" ve "Tamamlanan" sütunlarıyla sadeleştirilmiş görev takibi.
- **Swipeable & Auto-scroll:** Mobil ekranlarda kaydırılabilir sütun geçişleri ve kartı taşırken sütunun otomatik sağa/sola kayması.
- **Serbest Sıralama:** Drag & Drop kütüphanesi (titreme etkilerinden arındırılmış) ile görev kartlarını tahta üzerinde serbestçe sıralayabilirsiniz.

### 📅 Gelişmiş Kompakt Takvim (Touch-Friendly)
- Takvim günleri içindeki eski, sığmayan ve taşan kaba görev butonları kaldırılmıştır.
- Yerlerine minimal, modern ve projenin rengini taşıyan renkli noktalar (dots) eklenmiştir.
- Hücrenin üzerine gelindiğinde veya dokunulduğunda o güne ait görevleri, durumlarını ve firma etiketlerini listeyen yarı-saydam (glassmorphic) bir detay popover'ı açılır.
- Dokunmatik ekranlarda veri kaybı yaşatmayan akıllı sürükle-bırak desteği sunar.

### 📊 Fotoğraf Takip (Photo Tracking) & Model Yönetimi
- Görevler için yüklenen fotoğrafların durumları, revizyon adetleri, renk şemaları ve notları sağlam bir şema ile yönetilir.
- **Tam Ekran Lightbox:** Fotoğraflar `createPortal` ile alt panellerde sıkışmadan tam ekran açılır; indirme ve silme işlemleri bu ekrandan güvenle yapılır.

### 📈 Reklam Takibi & AI Rapor Merkezi
- Reklam KPI'larının takibi, CSV/XLSX veri yükleme desteği ve Optimistic UI güncellemeleri.
- Google Gemini AI destekli otomatik PDF rapor üretimi ile reklam performans verilerini analiz eder.

### 🔄 Çift Yönlü Excel Senkronizasyonu
- `openpyxl` tabanlı, çift yönlü veri aktarımı. Veri kaybı veya format bozulması yaşamadan Excel dosyasından içe (import) ve dışa (export) aktarım yapabilmektedir.

### 💤 Boşta Kalma (Idle) & Ekran Tasarrufu Modu
- Cihazda veya bilgisayarda 10 dakika boyunca işlem yapılmadığında uygulama otomatik olarak karşılama/tasarruf ekranına geçer.
- Bu moddayken arka plandaki tüm polling/veri çekme işlemleri duraklatılarak RAM ve CPU tasarrufu sağlanır.

---

## 🏗️ Teknoloji Yığını

| Katman | Teknolojiler |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router) · TypeScript · Zustand · shadcn/ui · Tailwind CSS |
| **Backend** | FastAPI · SQLAlchemy 2.0 · Python 3.14 · SQLite (Lokal) / PostgreSQL (Neon - Production) |
| **Mobil / PWA**| Capacitor 6 · Serwist (PWA) · IndexedDB (Local cache) |
| **Kimlik Doğrulama**| JWT Tabanlı Yetkilendirme · Resend API (OTP & Doğrulama E-postaları) |
| **Yapay Zeka** | Google Gemini API (Flash Lite) |
| **Dosya / Excel**| openpyxl (Excel senkronizasyonu) |

---

## 📁 Klasör Yapısı

```
2-My-World/
├── app/
│   ├── web/               # Next.js 15 Frontend & Capacitor Mobil Projesi
│   │   ├── android/       # Android Studio / Gradle Projesi
│   │   ├── src/           # React Bileşenleri, Zustand Store'lar, Sayfalar
│   │   └── public/        # Statik dosyalar, ikonlar, APK indirme klasörü
│   └── backend/           # FastAPI Backend Uygulaması
│       ├── app/           # API Endpoint'leri, Modeller, Şemalar
│       └── alembic/       # Veritabanı Migrasyon Dosyaları
├── docs/                  # Proje planları, analiz raporları (Git dışı / Yerel)
├── image/                 # Android değişiklik günlüğü görselleri (Git dışı / Yerel)
└── iyzads/                # Ekran görüntüleri ve test resimleri (Git dışı / Yerel)
```
> [!NOTE]
> Proje içindeki `docs/`, `image/` ve `iyzads/` klasörleri ile `AGENTS.md` gibi dosyalar yerel ortamınızda geliştirme süreçlerini takip etmeniz amacıyla durmakta olup, `.gitignore` dosyası aracılığıyla GitHub (Git) reposu dışında tutulmaktadır.

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Backend Kurulumu
```bash
# Backend dizinine geçin
cd app/backend

# Sanal ortam oluşturun ve aktif edin
python3 -m venv venv
source venv/bin/activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Çevre değişkenlerini (.env) ayarlayın
cp .env.example .env

# Backend sunucusunu başlatın
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Kurulumu
```bash
# Frontend dizinine geçin
cd app/web

# Bağımlılıkları yükleyin
npm install

# Çevre değişkenlerini (.env.local) ayarlayın
cp .env.example .env.local

# Geliştirme sunucusunu başlatın
npm run dev
```

### 📱 Android APK Derleme ve Güncelleme Adımları (Kritik Protokol)
Android platformuna yeni bir APK derleyip sunucuya yüklerken hata yapmamak adına aşağıdaki adımlar sırasıyla uygulanmalıdır:

1. **Sürümü Güncelleyin:** `app/web/android/app/build.gradle` dosyasındaki `versionCode` ve `versionName` değerlerini artırın (Örn: `versionCode 35` ve `versionName "4.5"`). Yapılan değişiklikleri `/ANDROID_CHANGELOG.md` veya `ANDROID_CHANGELOG.md` dosyasına kaydedin.
2. **Eski APK'yı Temizleyin:** Projenin boyutunun şişmesini engellemek için `app/web/public/` klasöründeki eski `.apk` dosyalarını `.silinecekler_cop_kutusu/` dizinine taşıyarak çıkarın.
3. **Web Projesini Derleyin:** `app/web/` dizininde `npm run build` komutunu çalıştırarak Next.js tarafını temizce derleyin.
4. **Capacitor Eşitleme:** `npx cap sync android` komutu ile frontend dosyalarını Android projesine aktarın.
5. **APK Oluşturun:** `cd android && ./gradlew assembleDebug` komutuyla yeni debug APK dosyasını derleyin.
6. **Yeni APK'yı Yerleştirin:** Üretilen APK'yı `app/web/public/Pikselis_v[SÜRÜM].apk` konumuna kopyalayın.
7. **Backend Versiyon Güncelleme:** `app/backend/app/main.py` dosyasındaki `/api/app-version` endpoint'ini yeni sürüm kodu ve indirme URL'si ile güncelleyin.
8. **Frontend Linklerini Güncelleyin:** `TopNavbar.tsx` ve `InstallAppBanner.tsx` dosyalarındaki APK indirme linklerini yeni sürüme göre güncelleyin.

---

## 📜 Son Sürüm Geçmişi (Changelog)

### v4.5 (24 Mayıs 2026) - Temizlik & Hız
- **Görüntülü Görüşme Altyapısının Kaldırılması:** Görüntülü görüşme özelliği tamamen kaldırıldı; ilgili tüm kodlar, InAppCallWindow bileşeni, meetingStore ve butonlar temizlendi.
- **Yerel Motivasyon Havuzu:** Karşılama ekranındaki yavaş API istekleri yerine 100+ motivasyon sözü içeren hızlı yerel havuz entegre edildi.
- **Sürüm Entegrasyonu:** `versionCode 35` ve `versionName "4.5"` ile stabil APK derlendi ve dağıtıldı.

### v4.4 (23 Mayıs 2026) - Sekme & Detay Optimizasyonları
- **Görev Detay Mobil Alt Bar Düzeltmeleri:** `TaskDetailPanel.tsx` mobil sekmeleri revize edilerek "Fotoğraflar" en başa alındı.
- **Yorumlar & Geçmiş Birleştirme:** "Yorumlar" ve "Geçmiş" tek bir kronolojik "Yorum & Geçmiş" sekmesinde birleştirildi.
- **Sekme Karışma Çözümü:** Mobil sekmeler arası geçişte içeriklerin üst üste binme hatası çözüldü.

### v4.3 (23 Mayıs 2026) - Viewport & Jitsi Sunucusu
- **Morning Screen Mobil Sığma Çözümü:** Karşılama ekranının küçük ekranlarda taşarak "Günü Başlat" butonunu gizlemesi engellendi (`max-h-[92dvh]`).
- **Jitsi Freifunk Geçişi:** Jitsi Meet'in resmi sunucularındaki moderatör zorunluluğu, lobisiz çalışan alternatif `meet.ffmuc.net` sunucusuna geçilerek aşıldı.

### v4.2 (23 Mayıs 2026) - Minimal Takvim
- **Takvim Hücresi Modernizasyonu:** Takvimdeki sığmayan kaba butonlar yerine minimal renkli noktalar (dots) yerleştirildi.
- **Hızlı Görev Detay Popover'ı:** Hücreye hover olunca açılan, o güne ait görevleri listeleyen glassmorphic popover eklendi.

*(Tüm sürüm detayları ve geçmiş sürümler için yerel `ANDROID_CHANGELOG.md` dosyasını inceleyebilirsiniz.)*

---
© 2026 Pikseliş Project.
