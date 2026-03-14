Venüs Reklam Operasyon Paneli
Ön Araştırma ve Kurulum Rehberi
Google Ads + Meta Ads + GA4 + Yapay Zekâ destekli ajans içi kontrol paneli için teknik ve operasyonel plan
Bu doküman, tek kullanıcı odaklı bir ajans panelinin neyi çözmesi gerektiğini baştan aşağı tanımlar.
Amaç yalnızca rapor göstermek değil; reklam hesaplarını bağlamak, geçmiş kampanyaları analiz etmek, test fikirleri üretmek, aksiyon önermek ve işleri tek merkezden yönetmektir.
Yapı önce “hesap bağlamadan da çalışan” modüllerle başlayacak, ardından Google ve Meta entegrasyonları eklenecektir.

Bu panelin ana faydası
•	Tek ekrandan reklam performansını, testleri, yapılacak işleri ve notları yönetmek.
•	Geçmiş kampanyaları otomatik inceleyip “ne işe yaramış / ne boşa bütçe yemiş” sonucunu çıkarmak.
•	Google ve Meta verisini tek yapıda birleştirmek.
•	Yapay zekâ ile kreatif fikir, test önerisi, rapor özeti ve aksiyon listesi üretmek.
•	Ajansın tekrar eden işlerini yarı otomatik veya tam otomatik hâle getirmek.
 
1. Ürün vizyonu
Bu yazılımın çekirdeği
Bu sistem klasik bir dashboard değil. Asıl değer, veriyi topladıktan sonra yorum yapan ve iş öneren bir “operasyon asistanı” olmasıdır. Kullanıcı panele girdiğinde sadece sayı görmemeli; kritik bozulmalar, fırsatlar, test önerileri ve yapılacaklar da görünmelidir.
Kullanıcı tipi
İlk sürüm tek kullanıcı: sensin. Bu yüzden rol-yetki sistemi minimum tutulabilir. Ama ileride ekip eklenecekse müşteri, yönetici, medya satın almacı, kreatif sorumlusu gibi roller için zemin bırakılmalı.
Başarı ölçütü
Paneli açtığında 5 dakika içinde şu soruların cevabını bulabilmelisin: Bu hafta ne kötü gidiyor? Neyi kapatmalıyım? Neyi büyütmeliyim? Hangi kreatif eskidi? Hangi test sırada?
 
2. En doğru başlangıç: entegrasyonsuz MVP
Neden önce entegrasyonsuz?
Çünkü OAuth, token yenileme, izinler, rate limit, veri modeli ve mapping işleri vakit alır. İlk sürümde bunları beklemeden değer üretmek mantıklıdır.
Entegrasyonsuz yapılabilecek modüller
Manuel CSV yükleme, aylık rapor kaydı, kampanya notları, test takibi, kreatif arşivi, görev takibi, AI yorum üretimi, benchmark ekranı, müşteri toplantı notları, önceki ajans devralma checklist’i, teklif/aksiyon planı.
Kazanım
Bu yaklaşım sayesinde uygulama daha ilk haftada kullanılmaya başlar. Sonra gerçek hesap bağlantıları sırayla eklenir.
 
3. Hesap bağlandıktan sonra eklenecek ana modüller
Google Ads veri katmanı
Kampanya, reklam grubu, arama terimi, asset group, bütçe, maliyet, tıklama, gösterim, dönüşüm, dönüşüm değeri, cihaz, tarih, saat, lokasyon, ürün grubu ve PMax kanal görünümü gibi alanlar çekilmelidir.
Meta veri katmanı
Kampanya, ad set, reklam, creative, harcama, gösterim, frekans, tıklama, CTR, CPC, satın alma, purchase value, placement, age-gender, country/region, catalog item, breakdown verileri çekilmelidir.
GA4 veri katmanı
Oturum, source/medium, campaign, landing page, ürün görüntüleme, sepete ekleme, checkout, purchase, revenue, funnel kırılımı, cihaz ve şehir bazlı veriler çekilmelidir.
Birleşik veri katmanı
Platformlardan gelen isimler farklı olacağı için ortak bir şema tasarlanmalıdır. Amaç aynı tarihte aynı markanın Google, Meta ve site verisini aynı tabloda yorumlayabilmektir.
 
4. Ekran mimarisi
Ana kontrol ekranı
En üstte toplam harcama, gelir, ROAS, CPA, en iyi kanal, en riskli kampanya ve bugün yapılacak 5 kritik iş görünmeli.
Kampanya analiz ekranı
Google ve Meta için ayrı sekmeler; üstte filtreler, altta kampanya listesi, sağ panelde AI yorum ve öneri alanı.
Geçmiş reklam arşivi
Hesap bağlandığında geçmiş kampanyalar tarih sırasıyla çekilmeli. Her kampanya için amaç, bütçe, kreatif türü, sonuç, not, başarısızlık nedeni ve çıkarım kartı tutulmalı.
Test merkezi
A/B test fikirleri, durum, başlangıç-bitiş tarihi, test edilen değişken, hipotez, sonuç ve sonraki aksiyon görünmeli.
Kreatif laboratuvarı
Reklam görselleri, videolar, başlıklar, açıklamalar, hook metinleri, açı (angle) türleri ve geçmiş performans bir arada tutulmalı.
Rapor merkezi
Günlük, haftalık ve aylık özet; müşteriyle paylaşılacak sade rapor ve ajans içi detay rapor ayrı görünmelidir.
Görev ve operasyon ekranı
Senin mevcut iş takibi uygulamanla aynı veritabanında veya entegre şekilde çalışmalı. Reklam panelinde çıkan aksiyonlar görev kartına düşebilmelidir.
 
5. AI destekli otomasyon fikirleri
AI özetleyici
Dün/son 7 gün/son 30 gün verisini doğal dille özetler: ne düştü, ne yükseldi, neden olabilir, ne denenmeli.
AI test üretici
Düşük CTR, yüksek CPC, artan frekans, düşen ROAS gibi sinyallere göre yeni test önerileri çıkarır.
AI kreatif yorumlayıcı
En iyi ve en kötü reklamlardaki ortak desenleri bulur: örneğin lifestyle görsel daha iyi, fiyat odaklı başlık daha zayıf gibi.
AI anomali dedektörü
Bir kampanya harcaması normalin üstüne çıkarsa veya conversion aniden düşerse uyarı üretir.
AI toplantı yardımcısı
Müşteri görüşmesi için otomatik toplantı özeti, soru listesi ve konuşma notu üretir.
AI devralma danışmanı
Yeni alınan bir hesabın geçmiş verisine bakarak ilk 10 aksiyonu listeler.
 
6. Ajansın otomatikleştirilebilecek tekrar eden işleri
Günlük kontrol
Bütçe taşması, kampanya kapanması, feed hatası, conversion düşüşü, yüksek frekans, hatalı link, onaylanmayan reklam, öğrenme aşaması uzaması.
Haftalık kontrol
Kazanan/kaybeden kampanya listesi, kreatif yorgunluğu, arama terimi temizliği, bütçe yeniden dağıtımı, remarketing hacmi, kategori performansı.
Aylık kontrol
Kanal bazlı rapor, kategori bazlı özet, kreatif başarı analizi, test sonuçları, gelecek ay bütçe önerisi.
Tek tuş akışları
Haftalık rapor üret, toplantı notu oluştur, kötü kampanyaları işaretle, test önerisi üret, yeni kreatif brifi yaz.
 
7. Entegrasyon ve kimlik doğrulama mimarisi
Google tarafı
Google API’leri OAuth 2.0 kullanır. Google Ads API çağrıları için ayrıca developer token gerekir. Rapor verisi çoğunlukla Google Ads API ve GA4 Data API üzerinden çekilir.
Meta tarafı
Meta Marketing API ve Insights uçları için OAuth tabanlı erişim ve uygun app izinleri gerekir. Uzun ömürlü token yönetimi ve yenileme akışı planlanmalıdır.
Token yönetimi
Access token, refresh token, müşteri hesabı kimlikleri, izin kapsamları ve son senkron zamanı güvenli şekilde saklanmalıdır. Şifreli saklama zorunludur.
Arka plan senkronu
Veriler gerçek zamanlı değil, kademeli senkronla toplanmalıdır: saatlik özet, günlük detay, geçmiş backfill, hata yeniden deneme kuyruğu.
Rate limit ve quota
API sınırları nedeniyle her ekran açılışında canlı çağrı yapmak yerine veri ambarına yazıp oradan okumak daha güvenlidir.
 
8. Önerilen teknik mimari
Uygulama katmanı
Next.js / React ön yüz, API katmanı için Node.js veya Python FastAPI uygun olur. Senin mevcut uygulamana gömülü sayfa olarak eklenebilir.
Veri katmanı
PostgreSQL ana operasyon verisi için uygundur. Zaman serisi ve rapor sorguları artarsa ayrı analytics şeması veya BigQuery / ClickHouse düşünülebilir.
ETL / veri taşıma
İlk aşamada doğrudan API istemcileri yazılabilir. Hız için Airbyte gibi hazır connector yaklaşımı da kullanılabilir.
Queue ve cron
Arka plan senkron, retry ve rapor üretimi için BullMQ, Temporal veya basit cron işleri kullanılabilir.
AI katmanı
LLM çağrıları için loglama, prompt versiyonlama ve maliyet takibi eklenmelidir. Kritik önerilerde açıklanabilirlik notu saklamak faydalıdır.
Gözlemlenebilirlik
Hata logları, API başarısızlıkları, senkron süreleri ve veri tazelik metriği görünmelidir.
 
9. Kullanılabilecek hazır araçlar ve açık kaynak seçenekleri
Looker Studio
Hızlı prototip ve ücretsiz temel raporlama için iyidir. Ancak GA4 connector’ü Data API kotalarına tabidir; bu yüzden yoğun kullanımda sınır çıkabilir.
Metabase
Kendi veritabanın üstünden dashboard kurmak için güçlü ve kolaydır. İç paneli hızlı ayağa kaldırmak için çok uygundur.
Apache Superset
Daha analitik ve kurumsal dashboard ihtiyacı varsa güçlü seçenektir; fakat bakım yükü Metabase’ten yüksektir.
Airbyte
Google Ads ve Facebook Marketing source connector’leri ile veri çekmeyi hızlandırabilir. Kendi pipeline’ını yazmak istemediğin yerlerde başlangıç avantajı sağlar.
Google Marketing Analytics Jumpstart
Google Cloud üzerinde uçtan uca pazarlama analitiği kurmak için referans mimari ve örnek altyapı sunar.
GrowthBook
A/B test planlama ve deney mantığı için referans alınabilecek açık kaynak üründür.
PostHog
Ürün içi event takibi için faydalıdır; reklam sonrası kullanıcı davranışını kendi ürün verinle birleştirmek istersen işe yarar.
RudderStack / benzeri CDP
İleride çoklu veri akışını standartlaştırmak için düşünülebilir; ama ilk sürümde şart değildir.
 
10. Veri modeli önerisi
Temel tablolar
workspaces, ad_accounts, connectors, sync_jobs, campaigns, ad_sets, ads, creatives, daily_metrics, funnels, products, experiments, tasks, notes, alerts, ai_summaries.
Ortak metrik şeması
date, platform, account_id, campaign_id, entity_level, spend, impressions, clicks, ctr, cpc, conversions, conversion_value, purchases, purchase_value, roas, cpa.
Yorum tabloları
ai_observations, ai_recommendations, anomaly_events, experiment_hypotheses, creative_tags gibi yardımcı yapılar kurulmalı.
Versiyonlama
Rapor özeti ve AI önerileri yeniden üretilebilir olsa da hangi gün hangi önerinin verildiğini saklamak gerekir.
 
11. Google ve Meta için özel analiz ekran fikirleri
Google özel ekranları
Search terms temizleme, PMax asset-group incelemesi, kanal bazlı PMax raporu, brand vs generic ayrımı, lokasyon/saat/d cihaz kırılımı, landing page analizi.
Meta özel ekranları
Creative fatigue, frequency alarmı, placement analizi, audience overlap notları, catalog item performansı, yaş/cinsiyet/placement breakdown.
Ortak ekran
Bir kampanya Google’da ilgi çekip Meta’da destekleniyor mu, GA4’te landing page zayıf mı, ürün bazında hangi kanal daha verimli gibi birleşik yorumlar.
 
12. Hesap bağlamadan önce bile geliştirilebilecek kritik sayfalar
Devralma checklist ekranı
Mevcut ajans teslimi için erişimler, pixel, CAPI, GA4, Merchant Center, katalog, domain verification, conversion event, naming convention, eski raporlar gibi maddeler.
Test kütüphanesi
Ayakkabı markaları için ön tanımlı test şablonları: ürün görseli vs lifestyle, indirim vs kalite mesajı, broad vs lookalike, kategori sayfası vs ürün sayfası.
Kreatif brief üretici
Seçilen ürün ve kitleye göre çekim brief’i, AI görsel prompt’u, video angle listesi üretir.
Benchmark ve rakip ekranı
Rakip marka reklam kütüphanesi, notlar, kreatif sınıflandırma, çıkarım alanı.
Rapor şablonları
Müşteriye giden sunum taslağı ve aylık rapor iskeleti otomatik doldurulabilir.
 
13. Güvenlik ve operasyon riskleri
Hassas veri
Access token, refresh token, account id, müşteri bilgileri ve harcama verisi şifreli saklanmalı; yetkisiz loglara düşmemeli.
API kırılmaları
Google Ads API ve Meta Marketing API sürüm değişiklikleri düzenli takip edilmeli.
Veri tutarsızlığı
Google, Meta ve GA4 aynı sayıyı vermeyebilir; panelde veri kaynağı ve gecikme notu açıkça görünmelidir.
Aşırı otomasyon riski
AI önerileri doğrudan kampanya değişikliği yapmamalı; önce öneri, sonra insan onayı daha güvenli olur.
Bağımlılık riski
Tek bir connector veya tek bir üçüncü partiye aşırı bağlı kalma; mümkünse çekirdek veri akışları senin kontrolünde olmalı.
 
14. 3 aşamalı yol haritası
Aşama 1 – 7 gün
Entegrasyonsuz panel: görev, test, kreatif, rapor şablonu, devralma checklist’i, manuel CSV yükleme, AI özet modülü.
Aşama 2 – 14 gün
Google Ads + GA4 bağlantısı, temel kampanya ve günlük metrik sync’i, ana kontrol ekranı, ilk otomatik uyarılar.
Aşama 3 – 30 gün
Meta bağlantısı, geçmiş reklam arşivi, birleşik rapor ekranı, anomaly detection, test merkezi, müşteri toplantı özeti.
Sonraki faz
Yarı otomatik kreatif üretim, AI operatör, iş akışı otomasyonları, müşteri bazlı çoklu hesap desteği.
 
15. White coding / vibe coding aracına verilecek net kapsam
Ürün tanımı
Tek kullanıcılı reklam operasyon paneli; Google Ads, Meta Ads ve GA4 verisini bağlayıp analiz eder; test, görev ve kreatif akışlarını tek panelde toplar.
Zorunlu modüller
Dashboard, campaign explorer, test center, creative library, task board, reports, connector settings, alerts, AI summaries.
Zorunlu iş akışları
connect account, refresh token, sync history, compute daily metrics, generate AI summary, open task from insight, export monthly report.
İlk sürüm sınırı
Önce yazma değil okuma odaklı olsun: veri çek, analiz et, öneri ver. Kampanya değiştirme aksiyonları ikinci fazda gelir.
UI yaklaşımı
Kurumsal, sakin, yoğun veri taşıyan ama boğmayan; üstte KPI şeridi, solda filtre, ortada tablo, sağda AI insight drawer; mobil değil masaüstü öncelikli.
 
16. Bu projede seni diğer ajanslardan ayıracak fark
Veri + üretim birlikte
Sadece reklam paneli kullanan ajans değil; veriyi okuyup aynı gün yeni kreatif ve test fikri üreten yapı.
AI destekli karar desteği
Raporu insan okuyacak ama ilk analizi AI hızlandıracak. Böylece daha kısa sürede daha çok varyasyon denenebilir.
Kendi panelin
Müşteri bağımsız, ajans içi bilgi birikimi olan bir sistem kurmuş olursun. Bu uzun vadede büyük operasyon avantajı sağlar.
Devralma kolaylığı
Yeni müşteri geldiğinde aynı checklist, aynı dashboard, aynı test kütüphanesi ile çok daha hızlı onboarding yaparsın.
 
Ek: Hızlı modül tablosu
Modül	İlk sürüm	Bağlantı gerekir mi?	Değer	Öncelik
Ana dashboard	Evet	Hayır	Tüm işlerin merkezi görünümü	Yüksek
Görev ve aksiyon kartları	Evet	Hayır	Operasyonu yönetir	Yüksek
Test merkezi	Evet	Hayır	Deney disiplinini kurar	Yüksek
Manuel CSV içe aktarma	Evet	Hayır	Entegrasyon beklemeden veri sağlar	Yüksek
Google Ads sync	Sonra	Evet	Canlı kampanya analizi	Yüksek
GA4 sync	Sonra	Evet	Site davranışı ve funnel	Yüksek
Meta sync	Sonra	Evet	Creative ve satış analizi	Yüksek
AI özet ve öneri	Evet	Hayır	Zaman kazandırır	Yüksek
Geçmiş reklam arşivi	Sonra	Evet	Devralma ve öğrenme	Orta
Kreatif laboratuvarı	Evet	Hayır	Üretim ve test hızı	Orta
Rakip reklam araştırması	Evet	Kısmen	Stratejik fikir üretimi	Orta
Otomatik anomaly alert	Sonra	Evet	Erken uyarı	Orta
Müşteri export raporu	Evet	Hayır	Sunum kolaylığı	Orta

Ek: Resmî ve faydalı bağlantılar
•	Google Ads API reporting overview: https://developers.google.com/google-ads/api/docs/reporting/overview
•	Performance Max reporting: https://developers.google.com/google-ads/api/performance-max/reporting
•	Google Ads developer token: https://developers.google.com/google-ads/api/docs/api-policy/developer-token
•	Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2
•	GA4 Data API overview: https://developers.google.com/analytics/devguides/reporting/data/v1
•	Google Analytics developer docs: https://developers.google.com/analytics/devguides/collection/ga4
•	Meta Marketing API Insights: https://developers.facebook.com/docs/marketing-api/insights/
•	Meta Business SDK: https://developers.facebook.com/docs/business-sdk/
•	Meta Business SDK getting started: https://developers.facebook.com/docs/business-sdk/getting-started/
•	Looker Studio GA4 connector notes: https://docs.cloud.google.com/looker/docs/studio/connect-to-google-analytics
•	Airbyte Google Ads connector: https://docs.airbyte.com/integrations/sources/google-ads
•	Airbyte Facebook Marketing connector: https://docs.airbyte.com/integrations/sources/facebook-marketing
•	Metabase: https://www.metabase.com/
•	Apache Superset: https://superset.apache.org/
•	GrowthBook: https://growthbook.io/
•	PostHog: https://posthog.com/
•	Google Marketing Analytics Jumpstart: https://github.com/GoogleCloudPlatform/marketing-analytics-jumpstart
•	facebook-python-business-sdk: https://github.com/facebook/facebook-python-business-sdk
