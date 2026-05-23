# Pikseliş Android Uygulaması Sürüm Geçmişi

Bu dosya, Pikseliş mobil uygulamasının (APK) sürümlerini ve her sürümde yapılan değişiklikleri takip etmek içindir.

## Sürüm Kuralları
- Sürüm numaraları her zaman **2 haneli** olacaktır (Örn: 1.0, 1.1).
- Alt sürüm 9'a ulaştığında (Örn: 1.9), bir sonraki sürüm tam sayı artar (Örn: 2.0).
- `versionCode` her yeni sürümde +1 olarak artırılır.

---

### v4.1
**Tarih:** 23 Mayıs 2026
**Değişiklikler:**
- **[Kritik Arayüz - Dikey Hizalama & Kompakt Takvim Oranı]** Kontrol paneli sol kolonunda yer alan Akıllı Asistan kartının yüksekliği esnek (`lg:flex-grow lg:min-h-0`) hale getirilerek tüm ekranlarda alt çizgiler ve hizalar eşitlendi.
- **[Kritik UX - Takvim Günleri Dağılımı]** Takvim günleri tablosu `grid-rows-6` ve `h-full`/`justify-between` ile dikeyde eşit yayılarak takvim kartının orantısız boşluklar içermesi engellendi ve kompakt bir görünüm sağlandı.
- **[Sürüm Entegrasyonu - v4.1]** `versionCode` 31'e ve `versionName` "4.1"'e yükseltildi. Web static derleme, Capacitor senkronizasyonu ve debug APK üretilerek frontend fallback ve backend api endpoint'leri üzerinden yayına alındı.

---

### v4.0
**Tarih:** 23 Mayıs 2026
**Değişiklikler:**
- **[Yeni Özellik - Daily.co Yerleşik Görüntülü Arama]** Android uygulaması içerisine doğrudan entegre edilmiş, floating ve glassmorphic görüntülü görüşme modalı (`InAppCallWindow.tsx`) eklendi. Kullanıcılar başka bir uygulamaya geçmeden, telefonlarından anlık olarak toplantılara katılabiliyor.
- **[Yeni Özellik - Canlı Aktivite Akışı]** Kontrol paneline eklenen WebSocket tabanlı canlı aktivite akışı widget'ı sayesinde, ekip üyelerinin yaptığı işler mobil ekranda da fade-in mikro animasyonlarıyla anlık izlenebilir hale getirildi.
- **[Yeni Özellik - Toplantı Bildirim Banner'ı]** Firmada aktif bir görüntülü görüşme başladığında mobil ekranın en üstünde glowing bir banner belirmesi ve tek tıkla görüşmeye katılmayı sağlayan mekanizma kuruldu.
- **[Evrensel Kapsam Uyum Kontrolü]** Tüm arayüz ve özellikler Android mobil tarayıcılar, tabletler ve Capacitor WebView standartlarına göre 100% dokunmatik uyumlu ve yüksek performanslı (sıfır titreme) olarak optimize edildi.

---

### v3.8
**Tarih:** 23 Mayıs 2026
**Değişiklikler:**
- **[Kritik Çözüm - Tamamlanan Görevlerin Takvimden Temizlenmesi]** Takvim sayfasında, durumu 'done' (Tamamlandı) olan görevlerin hala gecikmiş/kırmızı olarak görünmesi sorunu giderildi. Artık tamamlanan görevler takvim görünümünden otomatik olarak kaldırılıyor.
- **[Kritik UX - Kapatma Butonu Konumu ve Vurgusu]** Görev detay panelinin (sağ panel) sağ üst köşesindeki butonların sıralaması (Kapat butonu en sağda, Sil butonu ortada olacak şekilde) soldan sağa Paylaş, Sil, Kapat olarak güncellendi. Kapatma butonu belirgin bir border ve koyu renk vurgusu ile en sağ köşeye yerleştirildi. Böylece kapatmak isterken yanlışlıkla silme butonuna tıklama riski sıfıra indirildi.
- **[Yeni Özellik - Görev Detayında Hızlı Durum Tamamlama]** Görev detay paneline (sağ panel) küçük, şık ve abartısız bir "Görev Tamamla" / "Tamamlandı" toggle butonu entegre edildi. Kullanıcıların takvimden veya listeden tıkladıkları görevleri panelden ayrılmadan tek tıkla tamamlayabilmesi sağlandı.

---

### v3.7
**Tarih:** 23 Mayıs 2026
**Değişiklikler:**
- **[Yeni Özellik - Boşta Kalma (Idle) ve Ekran Tasarrufu Modu]** Cihazda veya bilgisayarda 10 dakika boyunca hiçbir işlem yapılmadığında, uygulama otomatik olarak karşılama/tasarruf ekranına geçer. Bu moddayken arka plandaki backend veri çekme/poll işlemleri tamamen duraklatılarak yüksek RAM ve CPU tasarrufu (işlemci sakinliği) sağlanır.
- **[Yeni Özellik - Sekme Bazlı Karşılama]** Her yeni sekmeden girildiğinde veya sayfa yenilendiğinde akıllı karşılama ekranı anında tetiklenir (sessionStorage entegrasyonu).
- **[Yeni Özellik - Bekleyen İşler Kaydırıcı Kartları]** Sol kolondaki AI motivasyon kartının altına yatayda pürüzsüz kaydırılabilir, SNAP destekli modern "Bekleyen İşler" kart listesi eklendi. Aktif genel görevler öncelik ve firma etiketleriyle birlikte anlık izlenebilir hale getirildi.

---

### v3.6
**Tarih:** 23 Mayıs 2026
**Değişiklikler:**
- **[Yeni Özellik - Akıllı Karşılama & Yapay Zeka Destekli Gün Özeti]** Sabah karşılama ekranı (MorningScreen.tsx) tamamen yenilendi. Artık saate göre dinamik renk auraları ("Günaydın", "Tünaydın", "İyi Akşamlar", "İyi Geceler") ile karşılıyor.
- **[Zustand & Canlı Entegrasyon]** Bugün son tarihi olan görevler, bugünün takvim etkinlikleri ve geçmişten sarkan tamamlanmamış görevler anlık olarak karşılama ekranında özetleniyor.
- **[Gemini AI Motivasyonu]** `/api/ai/motivation` üzerinden çekilen yapay zeka analizleri ve asistan tavsiyeleri doğrudan karşılama ekranına entegre edilerek tek tıkla yenilenebilir hale getirildi.
- **[Çoklu Platform & Canlıda Çalışma Uyum Yeteneği]** Mobil WebView, Android Capacitor uygulaması, tabletler ve masaüstü bilgisayarlarda %100 responsive, dokunmatik uyumlu ve akıcı çalışacak şekilde optimize edildi. Hydration hataları engellendi.

---

### v3.5
**Tarih:** 22 Mayıs 2026
**Değişiklikler:**
- **[Kritik İndirme Çözümü - 404 Bypass]** Büyük APK dosyasının (20MB+) PWA Serwist Service Worker'ın 10 saniyelik `networkTimeout` limitine takılarak 404/Ağ hatası vermesi engellendi. `.apk` uzantılı dosyalar için Service Worker önbellekleme kuralları `NetworkOnly` olarak bypass edilerek doğrudan indirilmesi sağlandı.
- **[Sunucu Optimizasyonu]** APK indirme linki, Vercel statik dosya limitlerinden etkilenmemesi amacıyla doğrudan Render.com üzerinde çalışan kesintisiz FastAPI statik sunucusuna (`/static/Pikselis_v3.5.apk`) yönlendirildi.
- **[Sürüm Güncelleme Tetikleyicisi]** Android projesinde `versionCode 26` ve `versionName "3.5"` tanımlanarak, backend API ve frontend fallback linkleriyle eş zamanlı hale getirildi. Mobil uygulamaya anında sürüm güncelleme bildirimi gelmesi sağlandı.
- **[Matruşka Engeli & Boyut Optimizasyonu]** Önceki sürüm APK'lar Capacitor senkronizasyonu öncesinde temizlenerek projenin katlanarak büyümesi engellendi; APK boyutu 19.9MB bandında korundu.

---

### v3.4
**Tarih:** 20 Mayıs 2026
**Değişiklikler:**
- **[Kritik Bağlantı Çözümü]** Mobil Android Capacitor uygulamalarında, çevre değişkenlerinin derleme sırasındaki eksikliğinden dolayı backend API'sine (`localhost:8000`) bağlanamama ve dolayısıyla güncelleme uyarısı görememe/senkronize olamama sorunu giderildi. API fallback URL'si doğrudan production Render URL'ine (`https://myworld-twqx.onrender.com`) yönlendirildi.
- **[Kritik Kararlılık ve Kayıt]** Profil ayarları kaydedildiğinde JSON kolonlarındaki SQLAlchemy mutable nesne uyuşmazlığından dolayı verilerin kaydedilememesi ve geriye sıfırlanması sorunu `flag_modified` entegrasyonuyla kesin olarak çözüldü.
- **[UX Sadeleştirmesi]** Arayüzdeki karmaşık ve gereksiz "Mobil Bildirimler" ayarları tamamen gizlendi. Mobil (Capacitor local) bildirimlerin varsayılan olarak her zaman **2 saat önce (120 dakika)** standart ve açık olması sağlandı, böylece kullanıcı karmaşadan kurtuldu.
- **[E-posta Optimizasyonu]** E-posta hatırlatıcı varsayılan süresi 1 gün öncesi (1440 dakika) olarak optimize edildi.

---

### v3.3
**Tarih:** 20 Mayıs 2026
**Değişiklikler:**
- **[Yeni Özellik - E-posta Bildirim Kontrolü]** Mobil ve tablet kullanıcıları dahil olmak üzere tüm platformlarda profil ayarları altından e-posta bildirim tercihlerinin özelleştirilebilmesi sağlandı. E-posta hatırlatıcıları açılıp kapatılabilir hale getirildi.
- **[Yeni Özellik - Plan Özeti]** Her akşam saat 20:00'de yarınki takvim etkinliklerini ve görevleri şık bir HTML formatında gönderen "Yarının Günlük Plan Özeti" alma seçeneği ve bunu açıp kapatma düğmesi profil ayarlarına entegre edildi.
- **[Yeni Özellik - Hatırlatma Süresi Seçici]** 15 dakikadan 2 güne kadar esnek e-posta hatırlatma zamanlayıcı seçimi eklenerek kullanıcı konforu artırıldı.
- **[Mobil & Tablet Tasarım Uyumluluğu]** Yeni e-posta bildirim ayarları arayüzü responsive (esnek) ve touch-friendly olarak tasarlanarak mobil WebView, PWA ve tablet ekranlarında kusursuz çalışacak şekilde entegre edildi.

---

### v3.2
**Tarih:** 19 Mayıs 2026
**Değişiklikler:**
- **[Kritik UX - Sağ Tık]** Android (Capacitor) cihazlarda ekrana uzun basıldığında çıkan "İleri, Geri, Yenile" şeklindeki gereksiz tarayıcı/web bağlam menüsü (context menu) kaldırıldı. Native uygulama hissiyatı korundu. (Not: Görev kartı üzerindeki Düzenle/Sil gibi özel aksiyonlar çalışmaya devam etmektedir.)
- **[Kritik Düzeltme - Sürükle Bırak]** Görev kartlarına uzun basıp sürüklemeye başlandığında kartın aniden büyümesi (scale) veya parmağın altından kayıp başka yere zıplaması sorunu kökten çözüldü. Bu sorun, sürükleme anında eklenen "transition-all" ve "scale" efektlerinin sürükleme kütüphanesinin (react-beautiful-dnd) koordinat hesaplamasını bozmasından kaynaklanıyordu; ilgili efektler kaldırılıp sadece gölge (shadow) efekti bırakılarak tamamen stabil bir sürükleme deneyimi sağlandı.

---
### v3.1
**Tarih:** 19 Mayıs 2026
**Değişiklikler:**
- **[Kritik Düzeltme]** Kanban tahtasında (ve görev listesinde) çok fazla kart biriktiğinde kartların üst üste binme (overlap) ve sıkışma sorunu (shrink-0 class'ı ile) kökten çözüldü. Artık görevler her zaman kendi standart boyutunda ve sırayla görünecek.
- **[UX İyileştirme]** Boş kanban sütunlarına görev taşıma işlemi sırasında yaşanan "hedefi bulamama" ve kartın "geri dönmesi" hataları giderildi. Boş alanlar artık tam yükseklik ve min 200px ile geniş bir hedef alanı sunuyor.
- **[Görsel]** Sürükle-bırak sırasında hedef sütunların parlama animasyonu iyileştirilerek mobil etkileşim kalitesi artırıldı.

---
### v3.0
**Tarih:** 15 Mayıs 2026
**Değişiklikler:**
- **[Kritik Senkronizasyon]** Çevrimdışı (offline) ve zayıf internet durumlarında yaşanan veri senkronizasyon hataları kökten çözüldü. Artık internet varken "bekleyen işlem" uyarıları sadece gerçek ağ hatalarında çıkar.
- **[Veri Kararlılığı]** "Geri yükleme" ve "Senkronizasyon" sırasında görevlerin anlık olarak ekrandan kaybolması sorunu "Soft Loading" (Yumuşak Yükleme) teknolojisi ile giderildi. Veriler arka planda güncellenirken mevcut kartlar ekranda kalmaya devam eder.
- **[Hata Yönetimi]** Hatalı veya malformed (400, 422) işlemlerin kuyrukta takılıp sürekli "senkronize ediliyor" döngüsüne girmesi engellendi; bu tip hatalar artık akıllıca temizleniyor.
- **[Kullanıcı Kontrolü]** Offline banner'a "Temizle" butonu eklendi. Eğer bir işlem takılırsa kullanıcı manuel olarak kuyruğu boşaltabilir.
- **[Stabilite]** Sunucu taraflı 500 hatalarının yanlışlıkla "çevrimdışı işlem" olarak kaydedilmesi engellenerek, senkronizasyon kuyruğunun temiz kalması sağlandı.

---

### v2.4
**Tarih:** 13 Mayıs 2026
**Değişiklikler:**
- **[Yeni Özellik]** Kanban (Görevler) ekranına manuel sürükle-bırak (Drag & Drop) ile tam serbest sıralama yeteneği eklendi. Artık görevleri istediğiniz sıraya göre dizebilirsiniz.
- **[İyileştirme]** Yeni eklenen görevler artık varsayılan olarak listenin en sonuna (en alta) düşecek şekilde optimize edildi, böylece listenin üst kısımlarındaki sıralamanız bozulmuyor.
- **[Senkronizasyon]** Manuel sıralama değişiklikleri anında arka planda buluta senkronize edilir.

### v2.3
**Tarih:** 13 Mayıs 2026
**Değişiklikler:**
- **[Performans/Kritik]** Android WebView (Capacitor) üzerindeki tüm titreme (flickering) sorunları, GPU katmanları ve animasyon optimizasyonları ile kökten çözüldü. Artık görev kartları ve paneller takılmadan/titremeden açılıyor.
- **[Sessiz Senkronizasyon]** Arka planda veri senkronizasyonu veya güncelleme kontrolü yapılırken kullanıcının ana sayfaya atılması veya işinin bölünmesi engellendi. Uygulama artık çok daha kararlı ve sessiz çalışıyor.
- **[Görsel Düzeltme]** Android native uygulamada fotoğrafların görünmemesine neden olan CORS/Referrer engeli `no-referrer` politikası ile aşıldı; fotoğraflar artık anında yükleniyor.

### v2.2

### v2.1
**Tarih:** 13 Mayıs 2026
**Değişiklikler:**
- **[UX/Navigasyon]** Donanımsal geri tuşuna basıldığında tüm görev detayının aniden kapanması sorunu düzeltildi. Artık görev içindeki düzenleme alanları açıkken geri tuşu sadece o alanları kapatır, takvimde gün/hafta görünümündeyken ise ay görünümüne döner.
- **[UX/Klavye]** Tüm ekranlarda bir giriş alanına (açıklama, görev başlığı vb.) tıklandığında klavyenin açılıp metin alanını örtmesi sorunu düzeltildi. Aktif giriş alanları artık otomatik olarak ekranın ortasına kaydırılır (scrollIntoView).

### v2.0
**Tarih:** 13 Mayıs 2026
**Değişiklikler:**
- **[Kritik Düzeltme]** Fotoğraf lightbox'ı artık TAM EKRAN açılıyor — alt panelde sıkışan küçük görüntü sorunu `createPortal` ile kökten çözüldü.
- **[Tasarım]** Alt menü paneli gerçek saydam (Apple Glass / macOS 26 stili) efektiyle yenilendi — arkasındaki yazılar artık tamamen okunabiliyor.
- **[İyileştirme]** Otomatik güncelleme sistemi güçlendirildi: 24 saat bekleme 1 saate düşürüldü, `appStateChange` dinleyicisi ile her ön plana gelişte kontrol yapılıyor, `cache: "no-store"` ile her zaman güncel veri çekiliyor.
- **[UX]** Mobilde fotoğraf üzerindeki hover butonları kaldırılarak yanlışlıkla silme/indirme tıklamaları engellendi; bu işlevler lightbox'a taşındı.
- **[İyileştirme]** Alt panel açıkken sol taraftaki içerik kaydırma miktarı dengelenerek aşırı padding sorunu giderildi.

### v1.9
**Tarih:** 13 Mayıs 2026
**Değişiklikler:**
- **[İyileştirme]** Görev detayındaki alt menü tasarımı daha saydam (Apple Glass stili) ve kompakt hale getirildi.
- **[Yeni Özellik]** Alt menüler açıkken ekrana tekrar basıldığında otomatik gizlenme özelliği eklendi.
- **[UX]** Mobilde fotoğraf hover butonları kaldırıldı, silme ve indirme işlemleri tam ekran lightbox'a taşındı.
- **[İyileştirme]** Sol panel, alt menü açıkken bile ekranı kaydırarak tamamen görülebilir hale getirildi (dinamik padding eklendi).

### v1.8
**Tarih:** 13 Mayıs 2026
**Değişiklikler:**
- **[Tasarım]** Görev detayındaki alt menü (Tab Bar) tasarımı Apple stili cam efektiyle (Glassmorphism) yenilendi.
- **[UX]** Alt menülere tekrar tıklandığında ekranın tam görünmesi için menülerin otomatik gizlenmesi sağlandı.
- **[Tasarım]** Mobil görünümdeki fotoğraf galerisi, ekranı daha az kaplaması için 4'lü küçük grid'lere bölündü.
- **[Düzeltme]** Başlık ile paylaş butonlarının üst üste geçme hatası düzeltildi.

### v1.7
**Tarih:** 13 Mayıs 2026
**Değişiklikler:**
- **[Tasarım]** Görev detay arayüzü mobil için tab-bar'lı yapıya dönüştürülerek modernize edildi.
- **[Tasarım]** Fotoğraf yükleme ve görüntüleme tasarımı tamamen yenilendi (Sade ve büyük kareli).
- **[UX]** Açıklama alanı ve alt görevler Trello stili daha temiz, sola dayalı ve kompakt bir görünüme kavuştu.
- **[Düzeltme]** Görev detayında yer alan buton taşma hataları düzeltildi.

### v1.6
**Tarih:** 13 Mayıs 2026
**Değişiklikler:**
- **[Düzeltme]** Görev detayındaki fotoğraftan çıkarken geri tuşunun tüm görevi kapatması sorunu tamamen çözüldü.
- **[Performans]** Android cihazlarda ekran titremesine (flickering) neden olan arkaplan bulanıklık efektleri optimize edildi.

### v1.5
**Tarih:** 13 Mayıs 2026
**Değişiklikler:**
- **[Yeni Özellik]** Uygulama içi otomatik güncelleme sistemi (OTA) eklendi. Artık uygulama açıldığında yeni bir sürüm varsa otomatik olarak tespit edilecek ve tek tıkla yükleme yapılabilecek.

### v1.4
**Tarih:** 13 Mayıs 2026
**Değişiklikler:**
- **[Yeni Özellik/Güvenli Yedek]** "WhatsApp ile Paylaş" seçeneği tıklandığı an, görev metni otomatik olarak arka planda cihazın panosuna (Clipboard) kopyalanıyor ve "Görev metni otomatik olarak panoya kopyalandı!" toast bildirimi çıkıyor. Böylece WhatsApp'ın açılmadığı veya desteklenmediği eski/kısıtlı cihazlarda dahi veriler güvenceye alınmış oluyor; kullanıcı dilediği sohbet ekranına girip doğrudan yapıştırarak (Paste) paylaşım yapabiliyor.

### v1.3
**Tarih:** 13 Mayıs 2026
**Değişiklikler:**
- **[Düzeltme]** Masaüstü ortamında asenkron popup engelleme sorunu çözüldü; tıkladığınız an WhatsApp anında açılarak fotoğraf indirme işlemleri arka planda devam edecek şekilde uyarlandı.
- **[Düzeltme]** Kopyalama (Clipboard) özelliği geri getirildi ve Web/Masaüstü panoya kopyalama işlemine "Google Drive Görüntüleme Linkleri" eklendi.
- **[Kural İhlali Giderimi]** APK çıktısı artık manuel kurallara tam uyumlu olarak sürüm ismini barındıracak şekilde (Örn: Pikselis_v1.3.apk) yapılandırıldı ve AGENTS.md uyumluluğu kontrol edildi.

### v1.2
**Tarih:** 13 Mayıs 2026
**Değişiklikler:**
- **[Yeni Özellik]** Görev detayları WhatsApp üzerinden paylaşılırken fotoğraflar artık doğrudan dosya (image) formatında mesaja eklenerek (Native Share ile) iletiliyor.
- **[İyileştirme]** Web ve Mobil uyumluluğu artırıldı; native uygulamada doğrudan cihaz önbelleğine kaydedilip paylaşılıyor, web'de ise bilgisayara indirilip WhatsApp Desktop entegrasyonu sağlanıyor.

---

### v1.1
**Tarih:** 13 Mayıs 2026
**Değişiklikler:**
- **[Yeni Özellik]** Fotoğrafların çevrimdışı (internetsiz) incelenebilmesi için görev açılışında arka plan önbellekleme (cache) sistemi eklendi.
- **[Düzeltme]** Tam ekran fotoğraflara (Lightbox) bakarken cihazın Geri (Back) tuşuna basıldığında tüm uygulamanın veya görevin kapanması engellendi. Artık sadece fotoğraf kapanıyor.
- **[Düzeltme]** Mobil taraftan yüklenen yeni fotoğrafların, anlık backend (IndexedDB) senkronizasyon çakışması yüzünden kaybolması sorunu (optimistic update overwrite) giderildi.
- **[İyileştirme]** WhatsApp üzerinden paylaşım özelliği native paylaşıma uygun hale getirildi. Mobilde cihazın nativ paylaşım kutusu açılıyor.

### v1.0
**Tarih:** İlk Yayın
**Değişiklikler:**
- Pikseliş PWA, Capacitor ile Android platformuna entegre edildi.
- Görevler, takvim ve proje modülleri WebView içerisine gömüldü.

## v2.9 (15 Mayıs 2026)
- **[Kritik Düzeltme]** Uygulama içi güncelleme (OTA) sırasında yaşanan çökme (crash) sorunu giderildi. İndirme ve yükleme süreçleri daha güvenli hale getirildi.
- **[Yeni Özellik]** Güncellemeler artık "Esnek" hale getirildi. Kullanıcılar güncellemeyi kapatıp uygulamaya devam edebilir, ancak her girişte hatırlatılmaya devam eder.
- **[Düzeltme]** Dosya yazma ve okuma süreçlerinde yaşanabilecek null reference hataları için ekstra korumalar eklendi.

## v2.8 (15 Mayıs 2026)
- **[Kritik UX]** iPhone ve Android cihazlarda ekranın yukarı/aşağı sekmesi (rubber-banding/bounce) sorunu kökten çözüldü. Artık ekran boşluğa kaymıyor.
- **[Yeni Özellik]** Kanban tahtasında kart sürüklerken ekranın otomatik olarak sağa/sola kayması (Auto-scroll) eklendi. Artık mobilde kartları sütunlar arasında taşımak çok daha kolay.
- **[İyileştirme]** Mobil cihazlar için tam ekran viewport (`100dvh`) optimizasyonu yapıldı, adres çubuğu çakışmaları giderildi.

## v2.7 (14 Mayıs 2026)
- **[Düzeltme]** Kanban board üzerinde görevlerin anlık olarak kaybolup geri gelmesi (flickering) sorunu, veri tutarlılığı optimizasyonu ile giderildi.
- **[İyileştirme]** Görev detay panelinde açıklama kısmı daha okunaklı ve büyük hale getirildi.
- **[İyileştirme]** Dinamik sütun isimlerinin uzun olması durumunda kesilmesi engellendi, tam isim gösterimi sağlandı.

## v2.6 (14 Mayıs 2026)
- Kanban görev kartlarında tam Trello tarzı yeniden tasarım yapıldı.
- Kullanıcıların kendi sınırsız ve bağımsız sütunlarını ekleme özelliği getirildi.
- Görev hızlı ekleme sırasındaki kapanma sorunu çözüldü.
