Bu uygulama kuralları, `/Users/bekir/.gemini/GEMINI.md` adresindeki ANA SİSTEM KURALLARI'nı temel alır. Ajanlar önce ana kuralları okumalı, ardından bu dosyadaki projeye özel kuralları uygulamalıdır.

# 🌍 MY WORLD - PROJEYE ÖZEL KURALLAR (AGENTS.md)

## 🚀 HİPER HIZ VE OPERASYON
1. **Canlıda (Production) Çalışma İlkesi:** Kullanıcı her zaman canlı ortamda çalışmaktadır ve asla lokal bilgisayarında test yapmamaktadır. Yapılan her değişiklik otomatik olarak `git commit` ve `git push` ile canlıya (Vercel & Render.com) yansımaktadır. Bu nedenle, kod kalitesi, veri güvenliği ve derleme (build) kontrolü canlıya çıkmadan önce `npm run build` ile %100 güvence altına alınmalıdır.
2. **Çoklu Platform ve Evrensel Uyumluluk:** Yapılan her yenilik, görsel veya fonksiyonel geliştirme; Android uygulaması (Capacitor), Mobil tarayıcılar (telefon/tablet) ve Masaüstü bilgisayarlar dahil tüm platformlarda eşit, eşzamanlı ve hatasız çalışacak şekilde tasarlanmalı ve kodlanmalıdır. "Sadece web'de çalışıyor" yaklaşımı kesinlikle kabul edilemez.
3. **Build Kontrolü:** Commit ve Push atmadan önce `npm run build` (frontend) ve backend kontrolleri yapılmalıdır. Hata varsa commit atılamaz.
4. **Otomatik Yayın:** Başarılı her görev sonunda `git commit` ve `git push` otomatik olarak yapılacaktır (Kullanıcıdan onay beklemeden).


## 📊 Kayıt, Günlük ve Hata Yönetimi (ZORUNLU)
1. **ANDROID_CHANGELOG.md:** Her APK güncellemesinde sürüm notları buraya eklenmelidir.
2. **SYSTEM_CHANGELOG.md:** Her önemli mimari, UX veya fonksiyonel değişiklik (Web/Backend) buraya kaydedilmelidir.
3. **DEBUG_PROTOCOL.md:** Çözülen karmaşık veya kronik sorunlar, bir daha yaşanmaması için buraya çözüm yöntemiyle not edilmelidir.
4. **Kural:** Herhangi bir geliştirme bittiğinde AI, "Hangi günlükleri güncellemeliyim?" diye kontrol etmeli ve kullanıcı hatırlatmadan bu dosyaları güncellemelidir.

## 💻 Teknoloji Yığını & Klasör Yapısı
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Zustand (`app/web/`)
- **Backend:** FastAPI, Python 3.14, SQLAlchemy, SQLite (`app/backend/`)
- **Mobil:** PWA Desteği, Capacitor Entegrasyonu (Planlanan/Hazırlık)

## 🚫 BROWSER DİALOG YASAĞI (CRITICAL)
- `confirm()`, `prompt()`, `alert()` gibi tarayıcı nativa dialog'ları KESİNLİKLE KULLANILAMAZ.
- Silme, düzenleme, ekleme gibi tüm kullanıcı etkileşimleri uygulamanın kendi temasına uygun **in-app modal/dialog** bileşenleri ile yapılmalıdır.
- Mevcut `ConfirmDialog` bileşeni (`@/components/ui/ConfirmDialog`) kullanılmalıdır.
- Metin girişi gereken yerlerde özel `InlineEditModal` veya benzeri in-app bileşenler oluşturulmalıdır.

## 🔐 YETKİLENDİRME MİMARİSİ
- Kullanıcı bazlı "Sistem Rolü" (viewer/editor/admin) yetkilendirmesi **KALDIRILMIŞTIR**.
- Tüm yetkilendirme **firma bazlı** yapılır: `Firmalar & İzinler` panelinden kullanıcıya firma atanır ve modül izinleri firma üzerinden verilir.
- Admin/editor kullanıcılar kendi firmalarını oluşturabilir ve oluşturdukları firmada tam yetkiye sahip olur.
- `UserDetailPanel` üzerinde sadece kişisel bilgiler ve şifre işlemleri bulunur, rol seçimi yoktur.

## 📱 Mobil Uyumluluk & UI Kuralları
- Uygulama %100 mobil uyumlu (Responsive) olmalıdır.
- **Kanban:** Mobil ekranlarda swipeable (kaydırılabilir) 3 sütun (Yapılacak, Devam Eden, Tamamlanan). "İncelemede" durumu kaldırılmıştır.
- **Bottom Nav:** Mobil cihazlarda ana navigasyon ekranın alt kısmındadır.
- **Takvim:** Dokunmatik sürükle-bırak (Drag & Drop) özellikleri sorunsuz çalışmalıdır.

## 🔄 Veri & Senkronizasyon
- **Excel Entegrasyonu:** `openpyxl` ile çift yönlü, veri kaybı olmadan senkronizasyon sağlanır.
- **Photo Tracking:** Model tamamlama, revize adetleri ve notları sağlam bir şema ile yönetilir.

## 🛠️ ANDROID APK DERLEME KURALLARI (CRITICAL - İÇ İÇE MATRUŞKA HATASI ÖNLEMİ)
Geçmişte `Pikselis.apk` dosyası `public/` klasöründe bırakıldığı için Capacitor sekronizasyonu sırasında yeni APK'nın içine eski APK'nın da dahil edilmesi (40MB+ şişme) hatası yapılmıştır. **Bir daha asla bu hata yapılmamalıdır.**

Kullanıcı "APK'yı derle" veya "Android uygulamasını güncelle" dediğinde **KESİNLİKLE AŞAĞIDAKİ ADIMLAR SIRASIYLA UYGULANACAKTIR:**
1. **SÜRÜMÜ GÜNCELLE:** `app/web/android/app/build.gradle` içindeki `versionCode` (örn: 2) ve `versionName` (örn: "1.1") değerlerini artır. (Sürüm 1.9'dan sonra 2.0 olur, 2.9'dan sonra 3.0 olur vb. 2 haneli kural). Ardından yapılan değişiklikleri mutlaka `/ANDROID_CHANGELOG.md` dosyasına kaydet.
2. **ESKİ APK'YI TAŞI:** `mv public/*.apk ../../.silinecekler_cop_kutusu/` komutuyla (eğer varsa) tüm eski APK'ları mutlaka projeden çıkar. Aksi takdirde iç içe paketlenir ve boyut katlanarak artar.
3. **WEB BUILD:** `npm run build` komutu ile Next.js tarafını temiz bir şekilde derle.
4. **CAPACITOR SYNC:** `npx cap sync android` komutunu çalıştır (eski APK silinmiş olduğu için sadece temiz dosyalar senkronize edilecek).
5. **APK OLUŞTUR:** `cd android && ./gradlew assembleDebug` komutuyla yeni APK'yı derle. (Not: `build.gradle` içindeki `splits` bloğu kapatılmış veya `universalApk true` yapılmış olmalıdır).
6. **YENİ APK'YI TAŞI:** `cp app/build/outputs/apk/debug/app-debug.apk ../public/Pikselis_v[SÜRÜM].apk` komutu ile yeni üretilen temiz APK'yı indirme klasörüne yerleştir (Örn: `Pikselis_v1.1.apk`).
7. **BACKEND SÜRÜM GÜNCELLE:** `app/backend/app/main.py` içindeki `@app.get("/api/app-version")` endpoint'indeki sürüm bilgilerini (version, version_code, download_url) yeni APK'ya göre güncelle.
8. **FRONTEND LİNKLERİNİ GÜNCELLE:** `TopNavbar.tsx` ve `InstallAppBanner.tsx` gibi frontend dosyalarındaki hardcoded `href="/Pikselis_vX.X.apk"` ve `download="..."` linklerini mutlaka yeni sürümle değiştir.
9. **COMMIT:** Bu işlemleri tamamladıktan sonra `git commit` atarak repoyu güncelle.


## 📱 MOBİL UYUMLULUK VE TEST ZORUNLULUĞU (CRITICAL)
- **Evrensel Kapsam:** Web tarafına yapılan her yeni özellik, geliştirme (örn: fotoğraf yükleme, sürükle-bırak, dosya indirme), görsel veya fonksiyonel yenilik **KESİNLİKLE** mobil sürümde (mobil web ve Android/Capacitor uygulaması) de eksiksiz ve hatasız çalışacak şekilde kodlanmalıdır.
- **Hata Toleransı:** Masaüstünde çalışan ama mobilde ekranı bozan, verileri gizleyen veya React Hydration hatalarına sebep olan eksik kodlamalar KABUL EDİLEMEZ.
- **Raporlama:** Bir görev tamamlandığında, değişikliklerin hem Web (Masaüstü) hem de Mobil (Responsive/Capacitor) platformlarda nasıl uyumlu hale getirildiği ve test edildiği kullanıcıya açıkça raporlanmalıdır.

## 🕵️ HATA AYIKLAMA (DEBUGGING) VE SORUN ÇÖZME PROTOKOLÜ (P0++ - CRITICAL)
Saatlerce süren hata arayışlarını engellemek ve "Bilgisayarda çalışıyor, telefonda çalışmıyor" (ya da "Yeni cihazda görevler 0 gözüküyor") gibi kronik veri yüklenmeme sorunlarını anında çözmek için aşağıdaki protokol **TAVİZ VERİLMEDEN** uygulanacaktır:

1. **FRONTEND YANILTMASINA KANMA:** Bir cihazda veriler tam görünürken yeni cihazda (veya incognito modda) veri 0 görünüyorsa, çalışan cihazdaki veriler **IndexedDB/Zustand Cache** üzerinden geliyordur. Sorun kesinlikle frontend değil, backend'in `500 Internal Server Error` döndürmesidir.
2. **DOĞRUDAN PRODUCTION API TESTİ:** Hata ayıklarken tarayıcı konsolu veya Vercel loglarıyla zaman kaybetme! Hemen `.env` dosyasındaki production `SECRET_KEY`'i kullanarak bir JWT token üret ve doğrudan Render (veya aktif backend) URL'sine terminalden `curl` isteği at. Dönüş yapan ham JSON hatasını (`details`) oku.
3. **VERİTABANI MİMARİSİ FARKI (SQLite vs PostgreSQL):** Local ortamda SQLite, Production'da PostgreSQL kullanıldığı için; sonradan eklenen `JSON`, `JSONB` veya `Datetime` kolonları PostgreSQL'den Pydantic'e **TEXT (String)** olarak gelebilir. Bu durum `Input should be a valid list` gibi Pydantic validation hatalarına yol açar.
4. **PYDANTIC & FRONTEND NULL-SAFE KURALI:** Backend şemalarında (`schemas/`) liste beklenen alanlara DAİMA `@field_validator` ekleyerek string'ten JSON parse işlemini güvenceye al. Frontend tarafında ise `.sort()` veya `.filter()` işlemlerinde tarihler ve objeler için mutlaka null-safe (`created_at ?? 0`) operatörlerini kullan.
