# Pikseliş Android Uygulaması Sürüm Geçmişi

Bu dosya, Pikseliş mobil uygulamasının (APK) sürümlerini ve her sürümde yapılan değişiklikleri takip etmek içindir.

## Sürüm Kuralları
- Sürüm numaraları her zaman **2 haneli** olacaktır (Örn: 1.0, 1.1).
- Alt sürüm 9'a ulaştığında (Örn: 1.9), bir sonraki sürüm tam sayı artar (Örn: 2.0).
- `versionCode` her yeni sürümde +1 olarak artırılır.

---

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
