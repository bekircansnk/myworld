# My World - Sistem Değişiklik Günlüğü (System Changelog)

Bu dosya, My World projesinde yapılan tüm mimari, tasarım ve fonksiyonel değişiklikleri (Web, Backend, Genel UX) takip etmek için kullanılır.

## [2026-05-13] - Mimari Refactoring ve Titreme (Flicker) Çözümleri

### Çözüldü
- **Ekran Titremesi (Flickering):** Next.js App Router yapısındaki ekran geçişlerinde (Görevler, Takvim, Dashboard vb.) yaşanan "ani sayfa yenilenmesi ve beyaz ekran titremesi" sorunu `animate-in fade-in duration-300` Tailwind animasyonları ile sarılarak yumuşak (smooth) geçişli hale getirildi.
- **Web History (Geri Tuşu) Tutarsızlığı:** Web / PWA ortamında geri tuşuna (popstate) basıldığında görev detay panelinin komple kapanmasını engellemek için, `TaskDetailPanel` içerisindeki history mantığı güçlendirildi. Artık "Açıklama Düzenle" gibi modlar açıkken web tarayıcısında geri gidildiğinde panel açık kalır, sadece edit modu kapatılır.

---

## [2026-05-13] - Navigasyon (Geri Tuşu) ve Klavye Optimizasyonları

### Çözüldü
- **Donanım Geri Tuşu Hataları:** Android fiziksel geri tuşuna basıldığında tüm görev detay panelinin bir anda kapanması sorunu çözüldü. Artık düzenleme modundaysa (örn. açıklama) veya takvimde gün modundaysa önce ilgili mod/ay görünümüne dönülecek şekilde geri alma davranışları hiyerarşik hale getirildi.
- **Klavye Görüntüleme Sorunu:** Mobil cihazlarda klavye açıldığında input ve textarea elementlerinin klavyenin altında kalması (ekranın kaymaması) problemi global `focus` listener kullanılarak çözüldü. Odaklanan elementler artık otomatik olarak ekranın ortasına (scrollIntoView) kaydırılacak.

---

## [2026-05-13] - Büyük Görev Detayı Revizyonu (UX/UI Overhaul)

### Eklendi
- **Görev Detay Tab-Bar (Mobil):** Mobil cihazlarda görev detaylarını daha akıcı yönetmek için alt navigasyon barı eklendi.
- **Glassmorphism:** Alt bar ve içerik pencerelerine Apple stili saydam/bulanık (glass) efekti eklendi.
- **Dinamik Arka Plan Kaydırma:** Alt panel açıkken bile sol tarafın kaydırılabilmesini sağlayan dinamik padding yapısı kuruldu.
- **Lightbox Silme Desteği:** Tam ekran fotoğraf görüntüleyicide (lightbox) direkt silme ve indirme butonları eklendi.

### Güncellendi
- **Trello Stil Tasarım:** Görev başlığı, açıklama ve alt görevler daha sade, geniş ve Trello benzeri bir yapıya kavuşturuldu.
- **Fotoğraf Galerisi (Mobil):** Fotoğraflar mobilde ekranı çok fazla kaplamaması için 4'lü küçük grid'lere dönüştürüldü.
- **Aksiyon Butonları:** Paylaş, Sil ve Kapat butonları modalın sağ üstüne sabitlendi ve meta bilgilerle çakışmaması için padding ayarları yapıldı.

### Çözüldü
- **Üst Üste Binme Sorunu:** Masaüstü görünümünde sağ paneldeki verilerin aksiyon butonlarının altında kalması sorunu giderildi.
- **Yanlış Tıklamalar:** Mobilde fotoğraflar üzerindeki hover butonlar kaldırıldı (tıklamalar sadece lightbox açar).
- **Z-Index Karmaşası:** Alt bar ve lightbox katmanları arasındaki geçişler düzeltildi.

---

## [2026-05-12] - Otomatik Güncelleme ve Senkronizasyon

### Eklendi
- **OTA (Over-the-Air) Güncelleme:** Android uygulaması için uygulama içi yeni sürüm kontrolü ve tek tıkla yükleme sistemi.
- **LinkBreeze SEO:** Açıklama kısmına eklenen linklerin otomatik olarak SEO başlıklarını çeken sistem (Link Preview).

### Çözüldü
- **IndexedDB Çakışmaları:** Mobil veri yüklemelerinde yaşanan senkronizasyon ve veri kaybı sorunları giderildi.
