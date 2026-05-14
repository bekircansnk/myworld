# My World - Sistem Değişiklik Günlüğü (System Changelog)

Bu dosya, My World projesinde yapılan tüm mimari, tasarım ve fonksiyonel değişiklikleri (Web, Backend, Genel UX) takip etmek için kullanılır.

## [2026-05-14] - Vercel SPA Yönlendirmeleri (404 Çözümü)

### Çözüldü
- **/login 404 Hatası:** Uygulamanın statik dışa aktarma (export) kullanması ve Next.js App Router yapısında `/login` dizini bulunmaması (login'in doğrudan ana sayfada `LoginOverlay` ile çalışması) nedeniyle `vercel.app/login` URL'si 404 sayfasına düşüyordu. `vercel.json` dosyası kök dizine eklenerek `/login` istekleri otomatik olarak ana sayfaya (`/`) yönlendirildi. Uygulamanın tam bir Single Page Application (SPA) olarak davranması güvence altına alındı.

## [2026-05-14] - Backend 5xx Çevrimdışı (Offline) Fallback ve Yetki Çözümleri

### Çözüldü
- **Backend Uyku Modu (Render):** Sunucu uyku moduna geçtiğinde veya Gateway Timeout (504, 502 vb.) hataları verdiğinde görev ekleme/güncelleme işlemlerinin ekranda kaybolması ve hata fırlatması sorunu giderildi.
- **Optimistic UI (Kayıpsız Veri):** `api.ts` içindeki interceptor güncellenerek 500 ve üzeri tüm hatalar `isOfflineError` olarak işaretlendi. Bu sayede hata anında görevler silinmeyerek IndexedDB sync kuyruğuna alınacak ve kullanıcı veriyi kaybetmemiş olacak.
- **Yetki Düşmesi (401 Interceptor Döngüsü):** `api.ts` içerisinde 401 hatası alındığında sadece `localStorage` temizleniyordu, ancak IndexedDB (`pikselis-auth`) temizlenmediği için UI hala giriş yapılmış zannedip sürekli yetkisiz istek atmaya devam ediyordu. Zustand `authStore.ts` dinamik olarak import edilerek çıkış (`logout`) işleminin IndexedDB düzeyinde güvenle temizlenmesi sağlandı.

## [2026-05-13] - Kanban Drag&Drop (Manuel Sıralama) ve v2.4
### Eklendi
- **Manuel Sıralama:** Kanban board üzerindeki görevlerin sürükle bırak mantığıyla manuel olarak sıralanabilmesi ve bu sıranın backend üzerinde (`sort_order`) kalıcı olarak saklanması sağlandı.
- **Optimistic UI Reordering:** Zustand `taskStore.ts` içerisine `reorderTasks` action'ı eklenerek, sıralama değişikliğinin arayüze anında yansıması ve ardından arka planda API isteği yapılması sağlandı.

### Çözüldü
- **Yeni Görevlerin Konumu:** Önceden yeni eklenen görevler `created_at` sırasına göre en üste gelebiliyordu. Artık `sort_order` birincil sıralama ölçütü oldu ve yeni görevler listenin en altına eklenecek şekilde iyileştirildi.

## [2026-05-13] - Android Titreme (Flicker) ve Sessiz Senkronizasyon Düzeltmeleri

### Çözüldü
- **Android Titreme (Flicker) Çözümü:** Android WebView (Capacitor) cihazlarda görev kartı açılırken yaşanan ekran titremesi; URL hash tabanlı navigasyonun (`#task-id`) kaldırılıp `history.state` yapısına geçilmesi ve GPU katman (translateZ) optimizasyonları ile tamamen giderildi.
- **Sessiz Senkronizasyon (Kesintisiz UX):** Arka planda veri çekilirken veya güncelleme kontrolü yapılırken kullanıcının ana sayfaya atılması/işinin bölünmesi sorunu çözüldü. Artık senkronizasyonlar kullanıcıyı rahatsız etmeden arka planda gerçekleşiyor.
- **Android Fotoğraf CORS Sorunu:** Android native uygulamada Google Drive fotoğraflarının görünmemesine neden olan referrer engeli, tüm fotoğraf bileşenlerine `referrerPolicy="no-referrer"` eklenerek aşıldı.

## [2026-05-13] - Mimari Refactoring ve Titreme (Flicker) Çözümleri

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
