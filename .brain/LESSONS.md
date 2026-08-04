# 2-My-World — Geçmiş Kayıtlardan Derlenen Kalıcı Dersler ve Hatalar

> Bu dosya projedeki geçmiş log, changelog, debug ve README dosyalarından otonom derlenmiştir.

### 2026-06-15
**Kaynak Dosya:** `SYSTEM_CHANGELOG.md`
Sürüm 7.3 - Canlı Sesli Çeviri Model Hatası & Hızlı Yönlendirme Kontrolleri (v6.8 / Code 58)

---

### Çözüldü
**Kaynak Dosya:** `SYSTEM_CHANGELOG.md`
**WebSocket Canlı Çeviri Kopma Hatası:** Gemini Live API WebSocket bağlantısının setup aşamasında kapanmasına sebep olan geçersiz model adı (`gemini-2.0-flash-exp` modelinin Google AI Studio tarafından kaldırılması) giderildi. Yeni sürüm `gemini-2.5-flash-native-audio-latest` modeline geçildi.
- **API Key Doğrulamaları:** Sağlanan her iki API anahtarının da API ve WebSocket düzeyinde sorunsuz çalıştığı test edildi ve doğrulandı.
- **Android WebView Layout Düzeltmeleri:** Android WebView ortamında ekranın sağa kayması ve butonların taşması sorunu CSS flex-box ve viewport düzenlemeleriyle düzelt

---

### Yenilik
**Kaynak Dosya:** `SYSTEM_CHANGELOG.md`
**Hızlı Ses Yönlendirme Paneli (Hoparlör / Kulaklık Geçişi):** Kulağım (kulaklık) ve karşı taraf (hoparlör) çıkış aygıtı seçicileri doğrudan ana ekrana çıkarılarak kullanıcıların ses çıkış modları arasında tek tıkla geçiş yapabilmesi sağlandı.
- **Canlı Teşhis & Hata Ayıklama Konsolu:** Ekranın alt kısmına entegre edilen açılıp kapanabilir konsol ile anlık WebSocket durumları, key rotasyonları ve hata kodları canlı olarak hem web'de hem de telefonda görüntülenebilmektedir.
- **Sürüm Yükseltme & OTA Senkronizasyonu:** Android APK versiyon kodu `58`'e ve adı `6.8`'e yükseltildi. Güncellenmiş APK

---

### v6.8
**Kaynak Dosya:** `ANDROID_CHANGELOG.md`
**Tarih:** 15 Haziran 2026
**Değişiklikler:**
- **[Kritik Düzeltme - WebSocket Canlı Bağlantı Çökmesi]** Gemini Live API bağlantısındaki model adı uyuşmazlığı (`gemini-2.0-flash-exp` modelinin yayından kalkması) giderildi ve en yeni `gemini-2.5-flash-native-audio-latest` modeline geçildi. Artık bağlantı kopmaları yaşanmamaktadır.
- **[Yeni Özellik - Canlı Teşhis & Log Konsolu]** Ekranın en altına anlık WebSocket durumunu, gönderilen setup parametrelerini ve hata detaylarını basan canlı teşhis konsolu entegre edildi.
- **[UX - Hızlı Ses Çıkış Yönlendirmesi]** Ayarlar çarkının altına gizlenen ku

---

### v6.7
**Kaynak Dosya:** `ANDROID_CHANGELOG.md`
**Tarih:** 15 Haziran 2026
**Değişiklikler:**
- **[Arayüz Düzeltmesi - Mobil Uyum & Kayma Çözümü]** Mobil cihazlardaki dikey taşma ve ekran kayması sorunları giderildi. Buton boyutları kompaktlaştırıldı.
- **[Yeni Arayüz - Transkript Görünümü]** Transkript paneli desktopta iki sütunlu yana alındı, mobilde ise dikey alanı tıkamaması için yüzen bir baloncuk butonuyla açılan tam ekran modal haline getirildi.
- **[Dil Desteği]** Listelenen diller 20'den 75'e çıkarıldı.
- **[WebSocket Kararlılığı]** Bağlantı kopmaları ve geçersiz API key durumlarındaki sonsuz reconnect döngüsü kırıldı. Hata nedenle

---

### v6.5
**Kaynak Dosya:** `ANDROID_CHANGELOG.md`
**Tarih:** 15 Haziran 2026
**Değişiklikler:**
- **[Yeni Özellik - Canlı Sesli Çeviri (Live Translate)]** Gemini Live API WebSocket bağlantısıyla çalışan, dilleri anında karşılıklı sesli/yazılı olarak çeviren yeni bir modül eklendi.
- **[API Rotasyonu]** Limitlere takılmamak için otomatik API anahtarı dönüşüm (key rotation) havuz mekanizması kuruldu.
- **[Android İzinleri]** Çevirinin APK üzerinde çalışabilmesi için `RECORD_AUDIO` ve `MODIFY_AUDIO_SETTINGS` izinleri eklendi.
- **[Sürüm Yükseltme]** `versionCode 55` ve `versionName "6.5"` debug APK derlemesi yapıldı.

---

---

### v6.4
**Kaynak Dosya:** `ANDROID_CHANGELOG.md`
**Tarih:** 8 Haziran 2026
**Değişiklikler:**
- **[Kritik Düzeltme - Üst Bar Uygulama Simgesi Kalıntısı Kesin Çözüm]** `Theme.SplashScreen` temasının `installSplashScreen()` API çağrısı olmadan kullanılması, splash bittikten sonra Activity'de uygulama simgesini ve "Pl..." başlığını kalıntı olarak bırakıyordu. `MainActivity.java`'ya `SplashScreen.installSplashScreen(this)` çağrısı eklenerek splash ekranının düzgün kapanması ve temiz geçiş yapması sağlandı.
- **[Tema Birleştirmesi]** `AppTheme` ve `AppTheme.NoActionBar` temaları tek bir `NoActionBar` tabanlı tema altında birleştirildi. `windowAct

---

### v6.2
**Kaynak Dosya:** `ANDROID_CHANGELOG.md`
**Tarih:** 8 Haziran 2026
**Değişiklikler:**
- **[Kritik Görsel - Android ActionBar Kaldırıldı]** Android tarafında splash screen bittikten sonra sol üstte "Pl..." şeklinde gereksiz bir uygulama simgesi ve başlığı gösteren Android default ActionBar'ı tema üzerinden tamamen kaldırıldı. `AppTheme` parent'ı `NoActionBar` olarak güncellendi.
- **[Sürüm Yükseltme]** `versionCode 52` ve `versionName "6.2"` debug APK derlemesi yapıldı.

---

---

### v6.0
**Kaynak Dosya:** `ANDROID_CHANGELOG.md`
**Tarih:** 8 Haziran 2026
**Değişiklikler:**
- **[Responsive Dashboard Üst Alanı]** Karşılama başlığı, görev özetleri, ilerleme barı ve metrik sayıları küçük telefon, mobil tarayıcı, Android APK, tablet ve desktop için kontrollü ölçeklere alındı.
- **[Mobil Topbar Oran Düzeltmesi]** Android/PWA üst çubuğundaki sabit ekstra safe-area boşluğu kaldırıldı; Planla logosu, firma seçici ve aksiyon ikonları ortalı ve daha dengeli yüksekliğe taşındı.
- **[Sürüm Yükseltme]** `versionCode 50` ve `versionName "6.0"` olarak yeni debug APK derlemesi yapıldı.

---

---

### 4. İmzalı Android APK'da Üst Navbar'ın Status Bar Arkasına Taşması
**Kaynak Dosya:** `DEBUG_PROTOCOL.md`
**Sorun:** Mobil tarayıcı görünümü düzgünken imzalı Android APK'da üst alan yukarı kayıyor, logo/firma/ikon butonları status bar arkasında kalıyor ve dokunulamaz hale geliyordu.
**Neden:** Capacitor native WebView, bazı Android/targetSdk kombinasyonlarında status bar alanının arkasına çizilebiliyor. Sadece CSS safe-area kullanmak Android WebView'de yeterli değildir; native status bar overlay davranışı da kapatılmalıdır.
**Çözüm:**
- `CapacitorNativeProvider` içinde `StatusBar.setOverlaysWebView({ overlay: false })` çağrılır.
- `MainActivity` içinde `WindowCompat.setDecorFitsSystemWindows(getWi

---

### 3. Dashboard Üst Alanının Mobilde Sıkışması, Desktop'ta Aşırı Büyümesi
**Kaynak Dosya:** `DEBUG_PROTOCOL.md`
**Sorun:** Android APK ve mobil tarayıcıda üst navbar/karşılama alanı dar ve sıkışık görünürken, desktop tarayıcıda başlık ve metrikler gereğinden büyük görünüyordu.
**Neden:** Dashboard üst özet alanı `sm:flex-row` ve büyük `lg:text-5xl` ölçekleriyle çok erken yatay düzene geçiyordu. TopNavbar'da Android tespiti yapılan her ortamda `env(safe-area-inset-top)+34px` sabit üst boşluk verildiği için Android Chrome/PWA'da üst çubuk gereksiz uzuyordu.
**Çözüm:**
- Dashboard üst özet alanı `xl` öncesinde dikey, kontrollü grid düzeninde akar; h1 ve metrik fontları küçültülüp `leading` değerleri sabitl

---

### 2. Görev Board'unda Dikey Kaydırma Çalışırken Yatay Kaydırmanın Kilitlenmesi
**Kaynak Dosya:** `DEBUG_PROTOCOL.md`
**Sorun:** Android/PWA üzerinde görev kartları dikey kaydırılabiliyor fakat kart veya sütun üzerinden sağ-sol kaydırma başlatılamıyordu.
**Neden:** Sütun içi droppable alana verilen `touch-pan-y`, dokunuşun başladığı hedef zincirinde yatay pan hareketini tarayıcı seviyesinde engelliyordu. `touch-action` üst board'da iki eksenli olsa bile çocuk hedefteki daha dar kural yatay kaydırmayı keser.
**Çözüm:**
- Kanban board, sütun scroll alanı ve draggable kart wrapper seviyelerinde `touch-action: pan-x pan-y` aynı standarda çekildi.
- Sütun içi `touch-pan-y` sınıfı kaldırıldı; dikey kaydırma `overfl

---

### 1. Dashboard ve Görev Ekranında Dikey Kaydırmanın Çalışmaması
**Kaynak Dosya:** `DEBUG_PROTOCOL.md`
**Sorun:** Android/PWA dokunmatik kullanımda ana dashboard ve görev ekranında aşağı-yukarı kaydırma çalışmıyor; görev board'unda yatay kaydırma çalışırken dikey hareket kilitleniyordu.
**Neden:** Kanban board container'ında kullanılan `touch-pan-x`, tarayıcıya sadece yatay pan davranışına izin verip dikey pan hareketini engelliyordu. Buna ek olarak mobil app shell `min-height + overflow-hidden` yapısında kaldığı için bazı WebView kombinasyonlarında nested scroll alanlarının yüksekliği kesinleşmiyor ve dashboard scroll'u dokunmatikte kaybolabiliyordu.
**Çözüm:**
- Board container'ından `touch-p

---

### 1. Matruşka APK Sorunu (Build Bloat)
**Kaynak Dosya:** `DEBUG_PROTOCOL.md`
**Sorun:** Yeni APK derlendiğinde dosya boyutunun devasa (40MB+) artması veya APK'nın içinde eski APK'ların bulunması.
**Neden:** `public/` klasöründe unutulan eski `.apk` dosyaları, Capacitor senkronizasyonu sırasında `android/app/src/main/assets/public/` klasörüne kopyalanır ve yeni APK'nın içine gömülür.
**Çözüm:** 
- APK derlemeden önce `public/` içindeki tüm `.apk` dosyalarını MUTLAKA projeden çıkarın (`.silinecekler_cop_kutusu`'na taşıyın).
- `npx cap sync android` komutunu ancak temizlikten sonra çalıştırın.

---

### 2. Lightbox Alt Panelde Sıkışması (Fixed Positioning)
**Kaynak Dosya:** `DEBUG_PROTOCOL.md`
**Sorun:** Mobilde fotoğrafa tıklandığında lightbox tam ekran açılmıyor, sadece alt panelin küçük alanında görünüyor.
**Neden:** CSS `fixed inset-0` positioning'i, parent element'te `transform`, `filter` veya `will-change` property'si varsa o element'in "containing block"'u olur ve `fixed` artık viewport'a değil, parent'a göre konumlanır. Alt panel `backdrop-blur` kullandığı için bu tetiklenir.
**Çözüm:** 
- Lightbox'u `createPortal(JSX, document.body)` ile `document.body`'ye taşıyın. Böylece hiçbir parent kısıtlaması uygulanmaz.
- z-index'i `z-[9999]` gibi yüksek tutun.

---


## Önceki Kayıtlar
# My-World Sosyal & Kişisel Dijital Yaşam — Öğrenilen Dersler

> Bu dosya My-World Sosyal & Kişisel Dijital Yaşam projesinde öğrenilen dersleri ve çözülen hataları kaydeder.

_Henüz ders kaydı eklenmemiştir._
