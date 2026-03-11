# 🚀 Doküman 2: Uygulama Fikri & Teknik Vizyon Dokümanı

---

## 🤖 PROMPT — Uygulama Araştırma ve Geliştirme İçin Yapay Zeka Yönergesi

> **Bu prompt'u yapay zeka araçlarına vererek uygulama mimarisi, özellik önerileri, teknik yığın seçimi ve UX tasarım araştırması yaptırabilirsin.**

```
Sen bir ürün yöneticisi, UX tasarımcı ve yazılım mimarısın. Aşağıda sana yapay zeka destekli, kişisel yaşam ve iş yönetim uygulaması için kapsamlı bir vizyon dokümanı verilmiştir. Bu uygulama bir bireyin günlük yaşamını, iş akışlarını, mental sağlığını ve üretkenliğini yönetmek için tasarlanmaktadır.

Görevin şudur:

1. **Ürün Analizi:** Bu uygulama fikrini pazar araştırması perspektifinden değerlendir. Benzerleri var mı? (Notion, Todoist, Motion, Reclaim.ai, Goblin.tools, Finch, Fabulous vb.) Bu uygulamanın farkı ne olacak? Rekabet avantajı nedir?

2. **Özellik Önceliklendirme:** Aşağıdaki özellikleri MVP (Minimum Viable Product), V1, V2 ve V3 olarak kategorize et. Hangi özellikler ilk sürümde olmalı, hangileri sonraya bırakılmalı?

3. **Teknik Mimari Önerisi:** Bu uygulamanın tam teknik yığınını (tech stack) öner:
   - Frontend (web + mobil)
   - Backend / API
   - Veritabanı
   - Yapay Zeka Entegrasyonu (hangi modeller, API'ler, fine-tuning stratejileri)
   - Otomasyon Katmanı (n8n, cron jobs, event-driven tetikleyiciler)
   - Mesajlaşma Entegrasyonu (Telegram Bot API)
   - Depolama (Google Drive API, yerel dosya sistemi)
   - Bildirim Sistemi (push notifications, in-app, Telegram)

4. **UX/UI Tasarım Önerileri:** Dashboard ekranının wireframe düzeyinde bir taslağını oluştur. Aşağıdaki bileşenleri içermeli:
   - Dijital saat ve takvim
   - Yapılacaklar listesi (firma bazlı ve genel)
   - Yapay zeka asistan avatarı (animasyonlu, interaktif)
   - Bildirim paneli
   - Çalışma zamanlayıcısı
   - Motivasyon alanı
   - Not defteri
   - Hızlı iş ekleme alanı

5. **Yapay Zeka Davranış Tasarımı:** Uygulamadaki yapay zekanın "kişilik özellikleri"ni tanımla. Nasıl konuşmalı? Hangi tonlarda? Ne zaman ciddi, ne zaman rahat olmalı? Bekircan'ın kişiliğine uygun bir iletişim stili tasarla.

6. **Veri Yönetimi Stratejisi:** Token optimizasyonu, veri sentezleme, uzun süreli hafıza yönetimi ve bağlam sıkıştırma stratejilerini öner.

7. **Monetizasyon ve Genelleştirme:** Bu uygulama ileride genel kullanıma açılırsa, hangi iş modeli uygulanabilir? Freemium, abonelik, tek seferlik ödeme?

Araştırmanda güncel (2025-2026) yapay zeka trendlerini, kişisel üretkenlik araçlarını ve davranış değişikliği uygulamalarını referans al. Önerilerini somut, uygulanabilir ve önceliklendirilmiş şekilde sun.

--- İŞTE UYGULAMA VİZYON DOKÜMANI ---

[Aşağıdaki tüm bölümleri buraya yapıştır]
```

---

## 📱 UYGULAMA VİZYONU

### Genel Konsept

**"Kişisel Yapay Zeka Destekli Yaşam ve İş Yönetim Sistemi"** — Tamamen kullanıcıya özel, yapay zeka ile sürekli öğrenen, arka planda çalışan, motive eden, organize eden ve yönlendiren kapsamlı bir kişisel asistan uygulaması.

### Temel Felsefe

Bu uygulama yalnızca bir "yapılacaklar listesi" veya "proje yönetim aracı" değildir. Bu bir **kişisel yaşam orkestratörüdür.** Kullanıcıyı tanır, davranışlarını analiz eder, onun adına düşünür, planlar yapar, motive eder ve takip eder. Kullanıcının bilgisayarında ve telefonunda her zaman yanında olan **akıllı bir arkadaş** gibi çalışır.

### Hedef Kullanıcı (Şu An)

Bekircan Sağanak — Kendi işini kuran, yapay zeka ile çalışan, evden çalışan, prokrastinasyon ve dikkat dağınıklığı ile mücadele eden, yüksek potansiyelli bir girişimci.

### Uzun Vadeli Hedef

Bu uygulamayı önce kendine mükemmel şekilde uyarlayıp, sonra genel kullanıma sunulabilecek bir ürüne dönüştürmek.

---

## 🛠️ ÖZELLİK LİSTESİ (DETAYLI)

### 1. 🌅 Sabah Karşılama Sistemi

**Açıklama:** Kullanıcı sabah telefonunu eline aldığında uygulama otomatik olarak onu karşılar. Instagram veya TikTok yerine bu uygulamaya girmeye yönlendirir.

**Detaylar:**
- "Günaydın Bekircan! ☀️" karşılama ekranı.
- Günün aktivitesi önerisi (her gün farklı): kitap okuma, dizi izleme, spor, meditasyon vb.
- Aktivite için süre sınırı (örn: "30 dakika dizi izleyebilirsin").
- Aktiviteyi tamamladıktan sonra yumuşak bir geçişle günün planına yönlendirme.
- Zorlama yok — ilk haftalar çok hafif, kademeli olarak artan bir zorluk seviyesi.
- Sabah erken saatlerde ağır iş yükü göstermek yerine, "hafif ve davetkar" bir başlangıç sunma.

### 2. 📋 Akıllı Görev Yönetim Sistemi

**Açıklama:** Trello benzeri ama yapay zeka destekli, otomatik kategorize eden, önceliklendiren ve takip eden bir görev yöneticisi.

**Detaylar:**
- **Firma bazlı paneller:** Her müşteri/proje için ayrı bir çalışma alanı (Venüs Ayakkabıları, Kazador vb.).
- **Genel haftalık panel:** Tüm firmalar/projelerdeki görevlerin birleşik görünümü.
- **Görev kartları:** Her görevin içine girip alt görevler, notlar, dosyalar eklenebilir.
- **Durum takibi:** Yapılacak → Devam Ediyor → Tamamlandı renk kodlaması.
- **Yapay zeka otomatik kategorizasyonu:** Yeni bir görev yazıldığında hangi firmaya/projeye ait olduğunu otomatik tespit etme.
- **Aciliyet ve öncelik analizi:** Yapay zeka eskiden kalan görevlerin aciliyetini sorgulama ("Bu görevin aciliyeti var mı?").
- **Otomatik task oluşturma:** Bir iş tanımı yazıldığında yapay zekanın bunu alt görevlere bölmesi, tahmini süre vermesi.
- **Benzer iş tespiti:** "Bu işi daha önce de yapmıştın, o zaman şöyle yapmıştın" uyarıları.

### 3. 💬 Yapay Zeka Asistan (Ana Beyin)

**Açıklama:** Uygulamanın kalbi. Sürekli arka planda çalışan, kullanıcıyı tanıyan, yönlendiren bir yapay zeka motoru.

**Detaylar:**

#### Kişilik ve İletişim Stili
- Samimi, destekleyici, yapıcı bir ton.
- Motivasyon verici ama gerçekçi — boş vaatler değil, somut destek.
- "Sen yaparsın koçum!", "Bu kolay, hemen yap!", "Kafandan at, bitir!" gibi ifadeler kullanır.
- Kullanıcının kişilik analizine göre kalibrasyon yapılır.
- Ciddi durumları (geciken işler) farklı, hafif durumları (tamamlanan işler) farklı ton ile ele alır.

#### Çalışma Şekli
- **Tetikleyici bazlı çalışma:** Kullanıcı bir mesaj yazdığında, bir görev eklediğinde, belirli zamanlarda veya belirli olaylar gerçekleştiğinde tetiklenir.
- **Model:** Google Gemini 2.0 Flash (hızlı, düşük maliyet, yüksek performans).
- **Bağlam yönetimi:** Kullanıcının tüm geçmiş verilerini sentezlenmiş ve sıkıştırılmış halde tutar.
- **Doküman tabanlı çalışma:** İç dökümanlara bakarak karar verir — kişisel analiz raporu, görev geçmişi, kullanıcı tercihleri vb.

#### Yetenekler
- Gelen bir iş tanımını analiz edip görevlere bölme.
- İşin hangi firmaya ait olduğunu tespit etme.
- Tahmini süre ve zorluk derecesi belirleme.
- Benzer geçmiş işlerle karşılaştırma yapma.
- Otomatik takvim planlaması önerme.
- Motivasyon mesajları gönderme.
- Kullanıcının çalışma kalıplarını analiz edip önerilerde bulunma.
- Haftalık/aylık rapor oluşturma.

### 4. 🖥️ Dashboard (Ana Ekran)

**Açıklama:** İkinci monitörde sürekli açık kalacak, canlı, interaktif ve bilgilendirici bir kontrol paneli.

**Detaylar:**

#### Ekran Bileşenleri

| Bileşen | Konum | Açıklama |
|---------|-------|----------|
| **Dijital Saat** | Sağ üst | Canlı, akan dijital saat |
| **Takvim** | Sağ üst (saat altı) | Yapılacak işlerin renkli noktalarla gösterildiği mini takvim |
| **Yapay Zeka Asistan Avatarı** | Sağ alt | Animasyonlu, tıklanabilir, interaktif karakter |
| **Bugünün Görevleri** | Sol / Orta | Firma bazlı veya genel görünümde günün görev listesi |
| **Bildirim Paneli** | Üst / Sağ | Hatırlatmalar, uyarılar, yapay zeka mesajları |
| **Çalışma Zamanlayıcısı** | Orta | Başlat/Durdur butonu, geçen süre, mola uyarısı |
| **Motivasyon Alanı** | Alt orta | Motivasyon sözleri, tamamlanan iş sayısı, küçük kutlamalar |
| **Hızlı Not Alanı** | Sol alt | Tıkla-yaz not defteri, yazılan notlar otomatik kategorize edilir |
| **Fikirler Köşesi** | Sol orta | Aklına gelen fikirler, proje önerileri |

#### Canlılık ve Etkileşim

- Dashboard sürekli canlı olacak — statik bir ekran değil.
- Saat gerçek zamanlı akacak.
- Bildirimler otomatik belirip kaybolacak.
- Asistan avatar bekleme pozisyonunda küçük animasyonlar yapacak.
- Görevlerin renk kodları (kırmızı: gecikmiş, turuncu: bugün son gün, yeşil: tamamlanmış) canlı güncellenecek.
- Yanıp sönen acil görev uyarıları (kırmızı, hafif soluk yanıp-sönme).

### 5. ⏱️ Çalışma Zamanlayıcısı ve Mola Sistemi

**Açıklama:** Kullanıcının çalışma süresini takip eden, molalarda ne yapacağını öneren akıllı zamanlayıcı.

**Detaylar:**
- "İşe Başladım" butonu — tıklandığında kronometreyi başlatır.
- 40 dakika (veya ayarlanabilir süre) sonra mola uyarısı.
- Mola önerileri: "Kalk biraz dolaş", "Su iç", "5 dakika esne".
- 3 saat aralıksız çalışma sonrasında uzun mola önerisi: "Bir dizi bölümü izleyebilirsin", "Yeni bölüm çıkmış, izlemek ister misin?", "Bir şarkı aç, enerjini yerine getir."
- Çalışma sürelerinin kaydedilmesi ve analizi — "Bugün 4 saat 23 dakika çalıştın."
- Çalışma ortamı tespiti (ev/dışarı) ve buna göre öneriler: "Çok fazla evden çalışıyorsun, biraz kafede çalışmayı dene."
- Öğle yemeği saati hatırlatması: "Yemek zamanı, bir mola ver!"

### 6. 📝 Akıllı Not Sistemi

**Açıklama:** Yazılan notları otomatik analiz eden, kategorize eden ve ilgili yerlere dağıtan yapay zeka destekli not defteri.

**Detaylar:**
- Herhangi bir yere hızlıca not yazabilme imkânı.
- Yazılan not otomatik analiz edilir:
  - Hangi firma/proje ile ilgili?
  - Bir görev mi, fikir mi, hatırlatma mı?
  - Hangi kategoriye ait?
- Not, ilgili tüm alanlara otomatik yerleştirilir (firma paneli + genel panel + not defteri).
- Sürükle-bırak yerine **yapay zeka otomatik kategorizasyonu** — kullanıcı elle düzenleme yapmak zorunda kalmaz.
- Bir not birden fazla kategoriye ait olabilir — çapraz referanslama.

### 7. 📱 Telegram Entegrasyonu

**Açıklama:** Bilgisayar başında olmadığında bile sisteme erişim sağlayan Telegram bot entegrasyonu.

**Detaylar:**

#### Kullanıcıdan Sisteme
- Telegram'a mesaj yazarak görev ekleme: "Venüs için yeni banner tasarla"
- Telegram'a WhatsApp'tan kopyaladığı iş taleplerini yapıştırma — sistem otomatik analiz eder.
- "Bugün hangi işler var?" sorusu — sistem günün planını gönderir.
- "Yarın bunu ekle", "Bunu şu tarihe ata", "Bu hafta bunu yapmam lazım" gibi doğal dil komutları.

#### Sistemden Kullanıcıya
- **Sabah karşılama mesajı:** "Günaydın Bekircan! ☀️ Bugünün planını hazırladım..."
- **Haftalık rapor:** Pazartesi sabahı haftalık özet gönderme.
- **Aylık rapor:** Ay sonunda genel performans değerlendirmesi.
- **Tebrik mesajları:** "Bu hafta çok iyi çalıştın! 🎉" — iyi performans sonrası otomatik.
- **Uyarı mesajları:** "Bugün hiç çalışmadın, iyi misin? 🤔" — durağan günlerde hafif dürtme.
- **Spontan mesajlar:** Yapay zekanın kendiliğinden gönderdiği motivasyon mesajları veya hatırlatmalar.

### 8. 🔔 Akıllı Bildirim Sistemi

**Açıklama:** Kullanıcıyı rahatsız etmeden, doğru zamanda doğru bilgiyi sunan bağlam duyarlı bildirim sistemi.

**Detaylar:**
- **Acil görev uyarıları:** Geciken veya son günü yaklaşan görevler için belirgin bildirim.
- **Geçmişten kalan görev hatırlatmaları:** "Bu görevin aciliyeti var mı?" sorusu — kullanıcı cevaplar, sistem buna göre planı günceller.
- **Akıllı erteleme:** Kullanıcı "İki hafta sonra hatırlat" dediğinde, küçük bir bildirimle tekrar getirir.
- **Mola uyarıları:** Çalışma zamanlayıcısı ile entegre.
- **Motivasyon bildirimleri:** Uygun zamanlarda (öğle saati, akşam vb.) kısa motivasyon mesajları.
- **Bağlam duyarlılık:** Yoğun çalışırken gereksiz bildirim göndermeme, durağan zamanlarda hatırlatma.

### 9. 📊 Otomatik Raporlama Sistemi

**Açıklama:** Kullanıcının çalışma verilerini analiz edip düzenli raporlar üreten sistem.

**Detaylar:**

#### Günlük Rapor (Gece otomatik hazırlanır)
- Bugün neler yapıldı?
- Hangi görevler tamamlandı, hangileri kaldı?
- Toplam çalışma süresi.
- Performans değerlendirmesi.

#### Haftalık Rapor (Pazar veya Pazartesi sabahı)
- Haftanın genel değerlendirmesi.
- Hangi günler daha üretken olundu?
- Tamamlanan vs. kaçırılan görevler.
- Performans trendi (%70 arttı, %20 düştü vb.).
- Gelecek hafta için plan önerisi.

#### Aylık Rapor (Ay sonunda)
- Ayın genel performans analizi.
- En üretken günler ve saatler.
- Tamamlanan proje/görev sayısı.
- Hedeflere yaklaşma durumu.
- Kişisel gelişim önerileri.

### 10. 🧠 Yapay Zeka Arka Plan Motoru

**Açıklama:** Tüm sistemin arkasında çalışan, sürekli öğrenen ve optimize eden yapay zeka katmanı.

**Detaylar:**

#### Veri Toplama ve Sentezleme
- Kullanıcının tüm etkileşimlerini kaydetme (görev ekleme, not yazma, çalışma süreleri, mola süreleri).
- Verileri düzenli aralıklarla sentezleme — ham veri biriktirmek yerine anlamlı özet çıkarma.
- Tekrar eden verileri birleştirme ve sıkıştırma.
- Token optimizasyonu — yapay zeka API çağrılarında maliyeti minimize eden veri yönetimi.

#### Öğrenme ve Adaptasyon
- Kullanıcının çalışma kalıplarını analiz etme (hangi günler iyi çalışıyor, hangi saatlerde daha üretken).
- Motivasyon mesajlarının etkinliğini ölçme — hangi tip mesajlar daha çok işe yarıyor?
- Görev tamamlama süresi tahminlerini iyileştirme.
- Kullanıcının tercihlerini öğrenme (hangi mola aktivitelerini seviyor, ne zaman bildirim istiyor).

#### Proaktif Düşünme
- Kullanıcı çalışmadığında bile arka planda verileri analiz etme.
- Hafta sonu planları hazırlama.
- Birbirine bağlı görevleri tespit etme ve önerme.
- Risk tespiti: "Bu görev çok uzun süredir bekliyor, müşteri sorun çıkarabilir."

### 11. 📁 Dosya ve Entegrasyon Sistemi

**Açıklama:** Dış servislerle entegrasyon ve dosya yönetimi.

**Detaylar:**
- **Google Drive entegrasyonu:** Dosyaların otomatik yedeklenmesi, görevlere dosya ekleme.
- **WhatsApp iş akışı:** Kopyala-yapıştır ile gelen iş taleplerini sisteme aktarma.
- **n8n entegrasyonu:** Mevcut n8n sunucusu ile otomasyon akışları oluşturma.
- **Takvim entegrasyonu:** Google Calendar ile senkronizasyon.

### 12. 📲 Mobil Uygulama

**Açıklama:** Dashboard'un mobil versiyonu — telefondan tam erişim.

**Detaylar:**
- Masaüstü dashboard ile senkronize çalışan mobil arayüz.
- Hızlı not ve görev ekleme.
- Sesli asistan: tuşa basıp konuşarak görev ekleme, not alma.
- Konum bazlı öneriler (evde/dışarıda farklı öneriler).
- Telefonun ekranında sürekli açık tutulabilir (dashboard modu).
- Bildirim merkezi — tüm yapay zeka mesajları burada.

---

## 🏗️ TEKNİK ALTYAPI VİZYONU

### Önerilen Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Frontend (Web)** | Next.js / React | Canlı, interaktif dashboard |
| **Frontend (Mobil)** | React Native / PWA | Çapraz platform mobil uygulama |
| **Backend** | Node.js / Python (FastAPI) | API ve iş mantığı |
| **Veritabanı** | PostgreSQL + Redis | Kalıcı veri + önbellekleme |
| **Yapay Zeka** | Google Gemini 2.0 Flash API | Ana beyin motoru |
| **Otomasyon** | n8n (mevcut sunucu) | Zamanlanmış görevler, tetikleyiciler |
| **Mesajlaşma** | Telegram Bot API | Bot entegrasyonu |
| **Dosya Depolama** | Google Drive API | Dosya yedekleme ve yönetimi |
| **Bildirimler** | Web Push API + Telegram | Çok kanallı bildirim |
| **Barındırma** | Mevcut n8n sunucusu | 7/24 çalışan altyapı |

### Yapay Zeka Tetikleme Mekanizmaları

Yapay zeka kendi kendine çalışmaz — onu tetikleyen mekanizmalar gerekir:

1. **Kullanıcı Tetikleyicileri:**
   - Mesaj yazma (dashboard veya Telegram)
   - Görev ekleme/güncelleme
   - Not yazma
   - "İşe Başladım" / "Molaya Çıktım" butonları

2. **Zamanlanmış Tetikleyiciler (Cron Jobs):**
   - Sabah karşılama mesajı (her gün 08:00)
   - Gece günlük rapor oluşturma (her gece 23:00)
   - Haftalık rapor (Pazar 20:00)
   - Aylık rapor (her ayın son günü)
   - Çalışma hatırlatması (öğleye kadar işe başlamadıysa)

3. **Olay Bazlı Tetikleyiciler:**
   - 40 dakika çalışma tamamlandığında → mola önerisi
   - 3 saat aralıksız çalışma → uzun mola zorunluluğu
   - Bir görev tamamlandığında → kutlama + sonraki görev önerisi
   - Telegram'dan mesaj geldiğinde → analiz ve yanıt

### Veri Yönetimi ve Optimizasyon

- **Sentezleme:** Haftalık ham verileri özetleyerek sıkıştırma.
- **Katmanlı bellek:** Kısa vadeli (bugünün verileri) + orta vadeli (bu haftanın özeti) + uzun vadeli (aylık trendler).
- **Token ekonomisi:** Yapay zeka çağrılarında gönderilen bağlam miktarını akıllıca yönetme.
- **Yerel önişleme:** Python scriptleri ile verileri yapay zekaya göndermeden önce düzenleme ve filtreleme.

---

## 💡 EK ÖZELLİK FİKİRLERİ

### Kullanıcıdan Gelen Fikirler

1. **Kişiselleştirilmiş çalışma ortamı önerileri:** "Bugün kafede çalışmayı dene" veya "Evdeysen şu müziği aç."
2. **Dizi/film takibi:** Kullanıcının izlediği dizilerin yeni bölümünü mola zamanında hatırlatma.
3. **Yemek hatırlatması:** Öğle yemeği saati geldiğinde mola vermeyi önerme.
4. **Kan dolaşımı hatırlatması:** Uzun süreli oturuş sonrası "kalk, biraz dolaş" uyarısı.
5. **Otomatik performans analizi:** "Dünden bugüne %70 performans artışı — tebrikler!" gibi mikro ödüller.
6. **İş öncesi kısa aktivite:** Her sabah farklı bir şey — kitap okuma, kısa yürüyüş, meditasyon (kademeli, zorlama olmadan).
7. **Çalışma modu:** "İşe Başladım" butonuna tıklayınca sistem aktif takibe geçer, dikkat dağıtıcıları engeller.
8. **Sürükle-bırak dashboard özelleştirme:** Widget'ları ekrana ekleyip çıkarabilme.
9. **Fikirler kılavuzu:** Aklına gelen iş fikirlerini kaydedip, daha sonra detaylı analiz edilebilmesini sağlayan bir alan.

### Sistem Tarafından Önerilen Ek Fikirler

1. **Haftalık tema günleri:** "Pazartesi = Müşteri günü, Salı = Geliştirme günü" gibi yapılandırılmış hafta.
2. **Enerji seviyesi takibi:** Kullanıcının ruh halini günde 1-2 kez sorarak uygun görev önerme (düşük enerji → basit görevler).
3. **Başarı rozetleri:** "5 gün üst üste çalıştın 🏆", "Bu ay 20 görev tamamladın 🌟" gibi gamification elementleri.
4. **Odak müziği entegrasyonu:** Spotify/YouTube ile çalışma müziği önerisi ve otomatik başlatma.
5. **Haftalık retrospektif:** Cuma günü "Bu hafta neleri iyi yaptın, neleri geliştirebilirsin?" öz değerlendirme.
6. **Acil durum modu:** Kritik teslim tarihi yaklaşırken dashboard'un "acil mod"a geçmesi — sadece o görevi gösterme.
7. **İş-yaşam dengesi skoru:** Çalışma ve dinlenme süreleri arasındaki dengeyi gösteren bir skor.

---

*Bu doküman, uygulamanın başlangıç vizyonudur. Geliştirme sürecinde önceliklendirme, faz planlaması ve teknik detaylandırma yapılacaktır.*
