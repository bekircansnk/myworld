# 🚀 Venus Reklam Paneli — Adım Adım Kullanım Kılavuzu

Venus Reklam Paneli v2'ye hoş geldiniz! Bu rehber, sistemin nasıl çalıştırılacağından veri yüklemeye kadar her adımı en basit haliyle anlatmaktadır.

---

## 🛠 Adım 1: Sistemi Çalıştırma

Sistemin çalışması için hem **Backend (Arka Plan)** hem de **Frontend (Ön Yüz)** çalışıyor olmalıdır.

### 1. Backend'i Başlatma (Python)
1. Terminalde `app/backend` dizinine gidin.
2. Gerekli bağımlılıkları yükleyin: `pip install -r requirements.txt` (Daha önce yapıldıysa geçin).
3. Veritabanı ve API'yi başlatın: `python main.py` veya `uvicorn app.main:app --reload --port 8000`.
   * *API şu adreste çalışacaktır:* `http://localhost:8000`

### 2. Frontend'i Başlatma (React/Next.js)
1. Yeni bir terminal penceresi açın ve `app/web` dizinine gidin.
2. `npm run dev` komutunu çalıştırın.
   * *Panel şu adreste çalışacaktır:* `http://localhost:3000`

---

## 📊 Adım 2: Veri Yükleme (En Önemli Kısım)

Panelin boş görünmemesi ve grafiklerin dolması için reklam verilerinizi (Google veya Meta'dan aldığınız raporları) yüklemeniz gerekir.

1. Soldaki menüden **"Veri Yükleme" (Upload ikonu)** sayfasına gidin.
2. **Platform Seçin:** Yükleyeceğiniz dosya Google Ads'ten mi yoksa Meta Ads'ten mi? İlgili butona tıklayın.
3. **Örnek Dosya İndirin:** Eğer elinizde hazır bir dosya yoksa, platform butonlarının altındaki **"Örnek Dosya İndir"** butonlarını (Google veya Meta) kullanın. Bu dosyalar sistemin tam olarak hangi formatı beklediğini gösterir.
4. **Dosyayı Yükleyin:** Bilgisayarınızdaki CSV dosyasını sürükleyip orta alana bırakın.
5. **Kontrol Edin:** Alttaki "İçe Aktarma Geçmişi" tablosunda durumun **"Başarılı"** olduğunu ve kaç satır aktarıldığını görün.

---

## 📈 Adım 3: Performansı İzleme (Genel Bakış)

Veri yüklendikten sonra her şey canlanacaktır:

1. **"Genel Bakış"** sayfasına dönün.
2. Üstteki 4 adet **KPI Kartı** (Harcama, ROAS, CPA, Dönüşüm) otomatik olarak güncellenecektir.
3. Ortadaki **"Aktif Kampanyalar"** listesinde, yüklediğiniz dosyadaki kampanyaları göreceksiniz.
4. Sağdaki **AI Günlük Özet**, yüklediğiniz verilere göre size ilk yorumlarını yapmaya hazır olacaktır.

---

## 🎯 Adım 4: Marka ve Kampanya Yönetimi

1. **Kampanyalar Sayfası:** Buradan manuel olarak yeni bir kampanya planı oluşturabilirsiniz. "Yeni Kampanya" butonuna basın, bütçesini ve tarihini girin.
2. **Kreatif Lab:** Hazırladığınız reklam görsellerini buraya yükleyin. Hangi görselin hangi kampanyaya ait olduğunu seçerek düzenli bir kütüphane oluşturun.
3. **Test Merkezi:** İki farklı reklamı karşılaştırmak için "A/B Testi" tanımlayın. Örneğin; "İndirimli Görsel" vs "Ürün Odaklı Görsel".

---

## ✨ Adım 5: Yapay Zeka (AI) Analizi

Sistemi gerçekten akıllı yapan kısım burasıdır:

1. **"AI Analiz"** sayfasına gidin.
2. **"Yeni Analiz Başlat"** butonuna tıklayın.
3. Sistem, Gemini AI motorunu kullanarak tüm verilerinizi tarar ve size **KRİTİK, UYARI veya FIRSAT** başlıkları altında notlar çıkarır.
   * *Örnek:* "ROAS değeriniz geçen haftaya göre düştü, kreatiflerinizi yenilemeyi düşünebilirsiniz."
4. Okuduğunuz notları **"Gördüm"** diyerek arşivleyebilirsiniz.

---

## 📋 Özet Sıkça Sorulan Sorular

*   **S: Veriler neden güncellenmiyor?**  
    C: Veri Yükleme sayfasından yeni bir CSV yüklediğinizden ve platformu doğru seçtiğinizden emin olun.
*   **S: AI butonu çalışmıyor?**  
    C: Backend terminalini kontrol edin. İnternet bağlantınızın ve Gemini API anahtarının (varsa) tanımlı olduğundan emin olun.
*   **S: Örnek dosyadaki sütunları değiştirebilir miyim?**  
    C: Hayır. Örnek dosyadaki sütun isimleri (date, spend, clicks vb.) sistem tarafından otomatik tanınır. Bu isimleri değiştirmeyin.

---
*Hazırlayan: Antigravity AI — Sizin için her şeyi kurduk!*
