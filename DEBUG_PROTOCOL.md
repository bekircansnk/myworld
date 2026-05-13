# My World - Hata Ayıklama ve Çözüm Protokolü (Troubleshooting & Debug Protocol)

Bu dosya, sistemde karşılaşılan karmaşık sorunları ve bunların kesin çözümlerini dökümante eder. Bir sorunla karşılaşıldığında önce buraya bakılmalıdır.

## 📱 Android & Capacitor Sorunları

### 1. Matruşka APK Sorunu (Build Bloat)
**Sorun:** Yeni APK derlendiğinde dosya boyutunun devasa (40MB+) artması veya APK'nın içinde eski APK'ların bulunması.
**Neden:** `public/` klasöründe unutulan eski `.apk` dosyaları, Capacitor senkronizasyonu sırasında `android/app/src/main/assets/public/` klasörüne kopyalanır ve yeni APK'nın içine gömülür.
**Çözüm:** 
- APK derlemeden önce `public/` içindeki tüm `.apk` dosyalarını MUTLAKA projeden çıkarın (`.silinecekler_cop_kutusu`'na taşıyın).
- `npx cap sync android` komutunu ancak temizlikten sonra çalıştırın.

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

---

## 🛠 Genel Geliştirme Kuralları
1. **İngilizce Kod, Türkçe Yorum:** Kod dili İngilizce, açıklama ve kullanıcı iletişimi Türkçe olacaktır.
2. **Kritik Güncelleme Protokolü:** APK güncellendiğinde `ANDROID_CHANGELOG.md`, `SYSTEM_CHANGELOG.md` ve backend `main.py` versiyonu aynı anda güncellenmelidir.
