# Pikseliş Android Uygulaması Sürüm Geçmişi

Bu dosya, Pikseliş mobil uygulamasının (APK) sürümlerini ve her sürümde yapılan değişiklikleri takip etmek içindir.

## Sürüm Kuralları
- Sürüm numaraları her zaman **2 haneli** olacaktır (Örn: 1.0, 1.1).
- Alt sürüm 9'a ulaştığında (Örn: 1.9), bir sonraki sürüm tam sayı artar (Örn: 2.0).
- `versionCode` her yeni sürümde +1 olarak artırılır.

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
