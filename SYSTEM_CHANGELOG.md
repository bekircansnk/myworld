# My World - Sistem Değişiklik Günlüğü (System Changelog)

Bu dosya, My World projesinde yapılan tüm mimari, tasarım ve fonksiyonel değişiklikleri (Web, Backend, Genel UX) takip etmek için kullanılır.

## [2026-05-15] - Senkronizasyon ve Veri Kararlılığı Devrimi (v3.0)

### Çözüldü
- **Senkronizasyon Döngüsü ve Yanlış Uyarılar:** İnternet varken sürekli çıkan "bekleyen işlem" uyarıları ve senkronizasyonun takılması sorunu çözüldü. `api.ts` interceptor'ı revize edilerek sunucu hataları (500) ile ağ hataları (offline) birbirinden ayrıldı.
- **Veri Kaybolma (Flickering) Sorunu:** Görevlerin senkronizasyon sırasında bir anda kaybolup geri gelmesi "Soft Loading" mimarisi ile engellendi. `isLoading` flag'i artık sadece ilk yüklemede tetikleniyor, arka plan güncellemelerinde mevcut veriler korunuyor.
- **Malformed Request Temizliği:** Kuyrukta bekleyen ama backend tarafından reddedilen (400, 422) hatalı işlemlerin sonsuza dek retrying yapması engellendi; bu tip işlemler artık akıllıca kuyruktan temizleniyor.

### Eklendi
- **Manuel Kuyruk Yönetimi:** Çevrimdışı işlem banner'ına "Temizle" butonu eklenerek kullanıcının takılan işlemleri manuel olarak boşaltabilmesi sağlandı.
- **Context-Aware Refresh:** Senkronizasyon sonrası veri yenileme işlemi artık bulunulan projenin (`project_id`) bağlamını koruyarak yapılıyor, böylece view resetlenmesi yaşanmıyor.

### Güncellendi
- **Android v3.0 Yayını:** v3.0 (versionCode 21) sürümü tüm veri kararlılığı optimizasyonları ile derlendi.

## [2026-05-15] - Güncelleme Sistemi ve Kararlılık Paketi (v2.9)

### Düzeltildi
- **Android Güncelleme Çökme Sorunu:** `AppUpdateChecker` bileşeninde `FileReader` ve dosya yazma süreçlerindeki potansiyel null reference hataları giderildi. APK indirme ve native yükleyiciyi tetikleme süreçleri daha güvenli (safe-check) hale getirildi.
- **Zorunlu Güncelleme Esnetildi:** Kullanıcı talebi üzerine, güncellemeler artık "Esnek" (optional) hale getirildi. Kullanıcı dilerse güncellemeyi kapatıp uygulamayı kullanmaya devam edebilir (ancak her girişte tekrar hatırlatılır).

### Güncellendi
- **Global Anayasa (GEMINI.md) Güncellemesi:** "Zorunlu Güncelleme" kuralı, "Esnek ve Sürekli Güncelleme" olarak değiştirildi.
- **Android v2.9 Yayını:** v2.9 (versionCode 20) sürümü tüm kararlılık fixleri ile derlendi.

## [2026-05-15] - Mobil Deneyim (Mobile UX) Devrimi (v2.8)

### Düzeltildi
- **iOS/Android Bounce (Rubber-band) Sorunu:** iPhone ve Android tarayıcılarında ekranın aşağı/yukarı boşluğa doğru sekmesi sorunu `overscroll-behavior: none` ve `overflow: hidden` optimizasyonları ile çözüldü. Artık uygulama gerçek bir native app gibi sabit duruyor.
- **Kanban Auto-scroll (Otomatik Kaydırma):** Mobilde bir görev kartını sürüklerken ekranın kenarına gelindiğinde tahtanın otomatik olarak sağa veya sola kayması sağlandı. Bu sayede küçük ekranlarda kartları farklı sütunlara taşımak artık zahmetsiz.

### Güncellendi
- **Viewport Optimizasyonu:** `h-screen` yerine `h-full` ve `100dvh` kullanılarak mobil adres çubuğu çakışmaları ve ekranın alt kısmındaki kaymalar giderildi.
- **Android v2.8 Yayını:** v2.8 (versionCode 19) sürümü tüm iyileştirmelerle birlikte derlendi ve yayına hazır hale getirildi.

## [2026-05-15] - Kanban Stabilizasyon ve Detay Paneli UX İyileştirmeleri (v2.7)

### Düzeltildi
- **Kanban Veri Flickering Sorunu:** `taskStore` üzerindeki `fetchTasks` fonksiyonunda `JSON.stringify` ile derin karşılaştırma (deep comparison) yapılarak, veri değişmediği sürece state reference'ının korunması sağlandı. Bu sayede `react-beautiful-dnd` kartlarının anlık kaybolup gelmesi sorunu tamamen giderildi.
- **Sütun İsimleri Gösterimi:** Uzun sütun isimlerinin (`Günlük Görevlerim` vb.) 3 nokta ile kesilmesi engellendi, "+" butonuna kadar tam genişlikte gösterilmesi sağlandı.

### Güncellendi
- **Görev Detay Paneli Açıklama Alanı:** Görev kartına girildiğinde açıklama (description) alanı daha büyük, net ve okunaklı hale getirildi. Font boyutu ve satır aralığı artırıldı.
- **Android v2.7 Yayını:** Sürüm 2.7 (versionCode 18) olarak tüm APK boru hattı güncellendi ve OTA (Over-the-Air) güncelleme backend'e entegre edildi.

## [2026-05-15] - Kanban Board Trello Tarzı Tam Yeniden Tasarım

### Eklendi
- **Dinamik Sütun Sistemi:** Kullanıcılar artık sütun isimlerini düzenleyebilir ve yeni sütunlar ekleyebilir. Sütun yapılandırması `localStorage`'da proje bazlı saklanır.
- **Bağımsız Sütun Scroll:** Her sütun kendi içinde bağımsız dikey scroll yapar, sayfa seviyesinde scroll tamamen kaldırıldı.
- **Yatay Kaydırma:** Sütunlar arası yatay kaydırma ile Trello tarzı navigasyon. Mobilde snap-scroll desteği.
- **Trello Tarzı "Kart Ekle":** Her sütunun altında Trello benzeri `+ Kart ekle` linki.
- **Sütun Menüsü:** Üç nokta menüsünden "İsmini Değiştir", "Tümünü Sil", "Sütunu Kaldır" seçenekleri.

### Güncellendi
- **TaskCard Kompakt Tasarım:** Başlıklar `text-sm font-semibold` ile daha okunaklı, not alanı `text-[12px]` ile 2 satır `line-clamp`. İlerleme çubuğu dot-style'dan ince bar'a dönüştürüldü.
- **Sayfa Layout:** Görevler ekranındaki büyük başlık + açıklama alanı kaldırıldı, minimal toolbar ile yer tasarrufu sağlandı.

### Kaldırıldı
- **Mükerrer Başlıklar:** Üstteki büyük tab bar ve alttaki sütun başlıkları tekrarı giderildi.
- **Arşivle Seçeneği:** Arşiv sistemi olmadığından kart ve sütun menülerinden "Arşivle" kaldırıldı.
- **Renk Seçici:** Kart bazlı renk seçici gereksiz karmaşıklık olarak değerlendirilip kaldırıldı.


## [2026-05-14] - Vercel SPA Yönlendirmeleri (404 Çözümü)

### Çözüldü
- **/login 404 Hatası:** Uygulamanın statik dışa aktarma (export) kullanması ve Next.js App Router yapısında `/login` dizini bulunmaması (login'in doğrudan ana sayfada `LoginOverlay` ile çalışması) nedeniyle `vercel.app/login` URL'si 404 sayfasına düşüyordu. `vercel.json` dosyası kök dizine eklenerek `/login` istekleri otomatik olarak ana sayfaya (`/`) yönlendirildi. Uygulamanın tam bir Single Page Application (SPA) olarak davranması güvence altına alındı.

## [2026-05-14] - Backend 5xx Çevrimdışı (Offline) Fallback ve Yetki Çözümleri

### Çözüldü
- **Backend Uyku Modu (Render):** Sunucu uyku moduna geçtiğinde veya Gateway Timeout (504, 502 vb.) hataları verdiğinde görev ekleme/güncelleme işlemlerinin ekranda kaybolması ve hata fırlatması sorunu giderildi.
- **Optimistic UI (Kayıpsız Veri):** `api.ts` içindeki interceptor güncellenerek 500 ve üzeri tüm hatalar `isOfflineError` olarak işaretlendi. Bu sayede hata anında görevler silinmeyerek IndexedDB sync kuyruğuna alınacak ve kullanıcı veriyi kaybetmemiş olacak.
- **Yetki Düşmesi (401 Interceptor Döngüsü):** `api.ts` içerisinde 401 hatası alındığında sadece `localStorage` temizleniyordu, ancak IndexedDB (`pikselis-auth`) temizlenmediği için UI hala giriş yapılmış zannedip sürekli yetkisiz istek atmaya devam ediyordu. Zustand `authStore.ts` dinamik olarak import edilerek çıkış (`logout`) işleminin IndexedDB düzeyinde güvenle temizlenmesi sağlandı.

## [2026-05-14] - Kanban Sıralama Kalıcılık Hatası Çözümü

### Çözüldü
- **Sıralamaların Geri Dönmesi:** Sürükle bırak ile yapılan görev sıralamalarının (Drag & Drop) sayfa yenilendiğinde eski haline dönmesi sorunu çözüldü. Arayüzde `reorderTasks` çalışırken backend'e `project_id` parametresi gönderilmediği için firma yetki kontrolünde (permissions) işlem reddediliyor veya bulunamıyordu. API isteğine `?project_id=...` eklenerek sıralama değişikliklerinin kalıcı olarak veritabanına işlenmesi sağlandı.

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
