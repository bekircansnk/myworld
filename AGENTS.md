Bu uygulama kuralları, `/Users/bekir/.gemini/GEMINI.md` adresindeki ANA SİSTEM KURALLARI'nı temel alır. Ajanlar önce ana kuralları okumalı, ardından bu dosyadaki projeye özel kuralları uygulamalıdır.

# 🌍 MY WORLD - PROJEYE ÖZEL KURALLAR (AGENTS.md)

## 🚀 HİPER HIZ VE OPERASYON
1. **Build Kontrolü:** Commit ve Push atmadan önce `npm run build` (frontend) ve backend kontrolleri yapılmalıdır. Hata varsa commit atılamaz.
2. **Otomatik Yayın:** Başarılı her görev sonunda `git commit` ve `git push` otomatik olarak yapılacaktır (Kullanıcıdan onay beklemeden).

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
1. **ESKİ APK'YI TAŞI:** `mv public/Pikselis.apk ../../.silinecekler_cop_kutusu/` komutuyla eski APK'yı mutlaka projeden çıkar. Aksi takdirde iç içe paketlenir ve boyut katlanarak artar.
2. **WEB BUILD:** `npm run build` komutu ile Next.js tarafını temiz bir şekilde derle.
3. **CAPACITOR SYNC:** `npx cap sync android` komutunu çalıştır (eski APK silinmiş olduğu için sadece temiz dosyalar senkronize edilecek).
4. **APK OLUŞTUR:** `cd android && ./gradlew assembleDebug` komutuyla yeni APK'yı derle. (Not: `build.gradle` içindeki `splits` bloğu kapatılmış veya `universalApk true` yapılmış olmalıdır).
5. **YENİ APK'YI TAŞI:** `cp app/build/outputs/apk/debug/app-debug.apk ../public/Pikselis.apk` komutu ile yeni üretilen temiz APK'yı indirme klasörüne yerleştir.
6. **COMMIT:** Bu işlemleri tamamladıktan sonra `git commit` atarak repoyu güncelle.

## 📱 MOBİL UYUMLULUK VE TEST ZORUNLULUĞU (CRITICAL)
- **Evrensel Kapsam:** Web tarafına yapılan her yeni özellik, geliştirme (örn: fotoğraf yükleme, sürükle-bırak, dosya indirme), görsel veya fonksiyonel yenilik **KESİNLİKLE** mobil sürümde (mobil web ve Android/Capacitor uygulaması) de eksiksiz ve hatasız çalışacak şekilde kodlanmalıdır.
- **Hata Toleransı:** Masaüstünde çalışan ama mobilde ekranı bozan, verileri gizleyen veya React Hydration hatalarına sebep olan eksik kodlamalar KABUL EDİLEMEZ.
- **Raporlama:** Bir görev tamamlandığında, değişikliklerin hem Web (Masaüstü) hem de Mobil (Responsive/Capacitor) platformlarda nasıl uyumlu hale getirildiği ve test edildiği kullanıcıya açıkça raporlanmalıdır.
