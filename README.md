# 🌍 Pikseliş

**Yapay Zeka Destekli Kişisel Yaşam, İş ve Fotoğraf Takip Yönetim Sistemi**

Pikseliş; sadece sıradan bir "yapılacaklar listesi" veya görev yöneticisi değildir. Kullanıcıyı tanıyan, yönlendiren, motive eden ve iş akışlarını tek bir merkezden yöneten akıllı bir yaşam orkestratörüdür. Masaüstünden Android mobil uygulamasına kadar (Capacitor & PWA) her platformda eş zamanlı ve %100 uyumlu çalışan modern bir ekosistem sunar.

---

## 📸 Uygulama Arayüzü & Özellikleri

### 1️⃣ İşini Tek Ekrandan Yönet
FastAPI backend ve Next.js frontend mimarisi sayesinde görevlerinizden takviminize, notlarınızdan CRM modüllerine kadar tüm iş süreçlerinizi tek bir platform üzerinden eşzamanlı olarak yönetebilirsiniz.

<p align="center">
  <img src="image/showcase_01.png" alt="Pikseliş - İşini Tek Ekrandan Yönet" width="100%">
</p>

---

### 2️⃣ AI ile Planla, Hızla Aksiyona Geç
Google Gemini AI entegrasyonlu Akıllı Asistanınızla doğal dilde sohbet ederek günlük planınızı oluşturabilir, saniyeler içinde görev ekleyebilir ve kalıcı hafıza desteği sayesinde asistanınızın sizi her zaman hatırlamasını sağlayabilirsiniz.

<p align="center">
  <img src="image/showcase_02.png" alt="Pikseliş - AI ile Planla" width="100%">
</p>

---

### 3️⃣ Takvim ve Görevlerini Düzenle
Dokunmatik uyumlu sürükle-bırak destekli aylık takvim, bekleyen görevler listesi ve detaylı planlama araçlarıyla etkinliklerinizi ve zamanınızı kolayca kontrol altında tutun.

<p align="center">
  <img src="image/showcase_03.png" alt="Pikseliş - Takvim ve Görev Yönetimi" width="100%">
</p>

---

### 4️⃣ İlerlemeni Anlık Olarak Gör
Gelişmiş kontrol paneli üzerinden aktif işleri, tamamlanma durumlarını, çalışma sayacı (timer) ile çalışma sürelerinizi ve günlük odağınızı tek bakışta izleyin.

<p align="center">
  <img src="image/showcase_04.png" alt="Pikseliş - İlerleme Paneli" width="100%">
</p>

---

## 📱 Mobil & Masaüstü Evrensel Entegrasyon

Pikseliş, **Evrensel Kapsam** ilkesine göre tasarlanmıştır. Web platformunda çalışan her özellik, Android (Capacitor) uygulaması ve PWA sürümlerinde de eşzamanlı olarak hatasız çalışır:
- **Çevrimdışı Çalışma (Offline-First):** Serwist Service Worker entegrasyonu ve IndexedDB tabanlı kuyruklama sistemi sayesinde internet kesildiğinde verileri saklar, internet geldiğinde arka planda otomatik senkronize eder.
- **Uygulama İçi Güncelleme Kontrolü (OTA):** Uygulama her açıldığında veya ön plana geldiğinde yeni APK sürümünü kontrol eder ve kullanıcıyı esnek bir bildirimle uyarır (Zorunlu engelleme olmaksızın).
- **Native Mobil Hissiyatı:** iOS/Android cihazlarda tarayıcı rubber-banding (sayfa sekmesi) etkileri kaldırılmış, ekrana uzun basınca çıkan web bağlam menüleri devre dışı bırakılmış ve mobil alt navigasyon (Bottom Nav) eklenmiştir.

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
├── image/                 # Tanıtıcı görseller ve Android değişiklik günlüğü resimleri
└── iyzads/                # Ekran görüntüleri ve test resimleri (Git dışı / Yerel)
```
> [!NOTE]
> Proje içindeki `docs/` ve `iyzads/` klasörleri ile `AGENTS.md` gibi dosyalar yerel ortamınızda geliştirme süreçlerini takip etmeniz amacıyla durmakta olup, `.gitignore` dosyası aracılığıyla GitHub (Git) reposu dışında tutulmaktadır. Tanıtım görselleri içeren `/image/` klasörü ise GitHub üzerinde görsellerin sergilenebilmesi için Git takibine alınmıştır (ancak içerisindeki `image/ANDROID_CHANGELOG/` alt klasörü yoksayılmaya devam etmektedir).

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
