# My World - Hata Ayıklama ve Çözüm Protokolü (Troubleshooting & Debug Protocol)

Bu dosya, sistemde karşılaşılan karmaşık sorunları ve bunların kesin çözümlerini dökümante eder. Bir sorunla karşılaşıldığında önce buraya bakılmalıdır.

## 📱 Android & Capacitor Sorunları

### 1. Matruşka APK Sorunu (Build Bloat)
**Sorun:** Yeni APK derlendiğinde dosya boyutunun devasa (40MB+) artması veya APK'nın içinde eski APK'ların bulunması.
**Neden:** `public/` klasöründe unutulan eski `.apk` dosyaları, Capacitor senkronizasyonu sırasında `android/app/src/main/assets/public/` klasörüne kopyalanır ve yeni APK'nın içine gömülür.
**Çözüm:** 
- APK derlemeden önce `public/` içindeki tüm `.apk` dosyalarını MUTLAKA projeden çıkarın (`.silinecekler_cop_kutusu`'na taşıyın).
- `npx cap sync android` komutunu ancak temizlikten sonra çalıştırın.

### 2. Lightbox Alt Panelde Sıkışması (Fixed Positioning)
**Sorun:** Mobilde fotoğrafa tıklandığında lightbox tam ekran açılmıyor, sadece alt panelin küçük alanında görünüyor.
**Neden:** CSS `fixed inset-0` positioning'i, parent element'te `transform`, `filter` veya `will-change` property'si varsa o element'in "containing block"'u olur ve `fixed` artık viewport'a değil, parent'a göre konumlanır. Alt panel `backdrop-blur` kullandığı için bu tetiklenir.
**Çözüm:** 
- Lightbox'u `createPortal(JSX, document.body)` ile `document.body`'ye taşıyın. Böylece hiçbir parent kısıtlaması uygulanmaz.
- z-index'i `z-[9999]` gibi yüksek tutun.

### 3. OTA Güncelleme Tetiklenmemesi
**Sorun:** Yeni APK derlenip yayınlandığı halde kullanıcıya güncelleme bildirimi gelmiyor.
**Neden:** `localStorage`'daki `updateSkipUntil` (daha önce 24 saat) süresi dolmamış olabilir. Ayrıca fetch cache'i eski veriyi dönebilir.
**Çözüm:**
- Skip süresini 1 saate düşürün.
- `fetch()` çağrısına `cache: "no-store"` ekleyin.
- `App.addListener("appStateChange")` ile uygulama her ön plana geldiğinde tekrar kontrol yapın.

### 2. Android Geri Tuşu (Back Button) Sorunu
**Sorun:** Geri tuşuna basınca uygulamanın tamamen kapanması veya beklenmedik sayfaya dönmesi.
**Çözüm:** 
- Modal veya Lightbox açıkken `window.history.pushState({ modal: true }, '')` kullanın.
- `popstate` event dinleyicisi ile sadece o anki arayüz elemanını kapatın.

### 3. Ekran Titremesi (Flickering)
**Sorun:** Özellikle Android WebView üzerinde ağır CSS efektleri (blur, ağır gradyanlar) kullanılırken sayfanın titremesi.
**Çözüm:**
- `backdrop-blur` gibi ağır CSS filtrelerini mobilde düşük opaklıklı düz arkaplanlar (`bg-white/80`) ile değiştirin veya optimize edin.

## 💾 Veri & Senkronizasyon Sorunları

### 1. Boş Liste Sorunu (Data Not Loading)
**Sorun:** Localde çalışan kodun Production'da (veya yeni cihazda) verileri 0 göstermesi.
**Çözüm:** 
- Bu durum %90 backend'in `500` hatası vermesidir (Frontend IndexedDB'den eski veriyi gösterdiği için yanıltır).
- Hemen `.env`'deki `SECRET_KEY` ile bir token üretip Render/Production URL'sine manuel `curl` isteği atın ve hata mesajını okuyun.

### 2. Pydantic Validation Hataları (JSONB)
**Sorun:** PostgreSQL'den gelen JSON verilerinin Pydantic tarafında `Input should be a valid list` hatası vermesi.
**Neden:** SQLite ve PostgreSQL arasındaki veri tipi farkları.
**Çözüm:**
- Backend şemalarında (`schemas/`) JSON alanları için `@field_validator` ekleyerek string gelmesi durumunda `json.loads` yapmasını sağlayın.

### 3. Sonsuz Senkronizasyon Döngüsü (Sync Queue Loop)
**Sorun:** İnternet varken bile "bekleyen işlem" yazması ve senkronizasyonun bitmemesi.
**Neden:** Backend'den gelen 500 (Sunucu Hatası) veya 422 (Validation Hatası) gibi hataların yanlışlıkla "offline hatası" olarak işaretlenip kuyruğa eklenmesi.
**Çözüm:**
- `api.ts` içinde sadece `!error.response` (gerçek ağ kopması) durumunu `isOfflineError` yapın.
- `syncQueue.ts` içinde 4xx (non-retryable) hataları algılayıp kuyruktan otomatik silin.
- Kullanıcıya manuel "Temizle" butonu sunun.

### 4. Verilerin Anlık Kaybolması (Soft Loading)
**Sorun:** Sayfa yenilenirken veya senkronizasyon sonrası `fetchTasks` çalışırken kartların bir anlığına kaybolup geri gelmesi.
**Neden:** `isLoading` flag'inin her `fetch` başlangıcında `true` yapılması ve UI'ın bu sırada listeyi gizlemesi.
**Çözüm:**
- `fetchTasks` içinde eğer zaten veri varsa `isLoading`'i tetiklemeyin (Soft Refresh).
- Veriyi sadece istek BAŞARIYLA tamamlandığında güncelleyin.
- `JSON.stringify` ile derin karşılaştırma yaparak gereksiz re-render'ları engelleyin.

### 5. Alt Görevlerin 2 Saniye Sonra Kaybolması (Python ** unpacking TypeError)
**Sorun:** Alt görev eklendiğinde, frontend'de eklenen kartın 2 saniye sonra arayüzden sessizce yok olması.
**Neden:** Backend'de `create_subtask` endpoint'inde `Task(**subtask.model_dump(), parent_task_id=task_id)` yapısı kullanılıyordu. `TaskCreate` şeması içindeki `parent_task_id` alanı default olarak `None` geliyordu. `**` ile model_dump açıldığında Python constructor'a hem `parent_task_id=None` hem de el yapımı `parent_task_id=task_id` gönderiliyor ve bu durum `multiple values for keyword argument 'parent_task_id'` TypeError hatasına (Sunucu Hatası 500) yol açıyordu. Hata sonucunda frontend optimistic update ile eklediği geçici kartı silerek alt görevin kaybolmasına neden oluyordu.
**Çözüm:**
- `parent_task_id` değeri constructor argümanı olarak değil, model_dump sözlüğünün içerisine atanarak (`db_task_data["parent_task_id"] = task_id`) constructor'a tek seferde (`Task(**db_task_data)`) beslenmelidir.

---

## 🛠 Genel Geliştirme Kuralları
1. **İngilizce Kod, Türkçe Yorum:** Kod dili İngilizce, açıklama ve kullanıcı iletişimi Türkçe olacaktır.
2. **Kritik Güncelleme Protokolü:** APK güncellendiğinde `ANDROID_CHANGELOG.md`, `SYSTEM_CHANGELOG.md` ve backend `main.py` versiyonu aynı anda güncellenmelidir.

---

## 🛠 Sürüm 4.1 Ek Hata Çözümleri

### 1. Daily.co Arama Kapatıldığında Üst Navbar Kırmızı Butonunun Sönmemesi
**Sorun:** Görüntülü aramayı kapatınca, üst bardaki kırmızı yanıp sönen buton sönmüyor, backend'de toplantı aktif kalmaya devam ediyordu.
**Neden:** `leaveMeeting` metodu sadece local state'i `isCallWindowOpen: false` yapıyordu ancak backend'deki aktif toplantı kaydını temizlemiyordu.
**Çözüm:** `InAppCallWindow` başlığına entegre edilen kapatma butonu tıklandığında doğrudan `stopMeeting(selectedProjectId)` çağrısı tetiklendi. Bu sayede backend'deki toplantı kaydı sonlandırılıp tüm katılımcılar için durum eşitlendi ve üst bar butonu anında söndü.

### 2. Küçültülmüş Arama Penceresinin Gemini Robotu Altında Kalması
**Sorun:** Görüşme penceresi küçültüldüğünde (Picture-in-Picture) sağ alttaki AI asistan robotunun altında kalıyor ve tıklanamaz hale geliyordu.
**Çözüm:** Küçültme CSS koordinatları `bottom-20 right-4` değerinden `bottom-6 left-6` (sol alt köşe) konumuna taşındı.

### 3. Canlı Aktivite Akışında Gri/Boş Kutular Görünmesi
**Sorun:** Canlı aktivite akışı widget'ı (ActivityFeedWidget) verileri çekerken gri ve içi boş kutular gösteriyordu.
**Neden:** Frontend kodlarında `act.username`, `act.activity_type` ve `act.description` alanları aranırken, backend API response yapısında bu bilgilerin `act.user.name` (veya `act.user.username`), `act.action` ve `act.details` olarak gelmesi.
**Çözüm:** `ActivityFeedWidget` veri modeli güncellendi ve her iki veri yapısını da destekleyen, null-safe bir dinamik veri eşleme helper fonksiyonu yazıldı.
