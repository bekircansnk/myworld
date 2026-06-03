# My World - Sistem Değişiklik Günlüğü (System Changelog)

Bu dosya, My World projesinde yapılan tüm mimari, tasarım ve fonksiyonel değişiklikleri (Web, Backend, Genel UX) takip etmek için kullanılır.

## [2026-06-03] - Sürüm 6.2 - Mobil Sürüm URL Fallback Düzeltmeleri ve Çevrimdışı/WebSocket Bağlantı Kararlılığı (v5.4)

### Eklendi / Çözüldü
- **Mobil API ve WebSocket URL Çakışması Giderildi:** Mobil (Capacitor) platformda `window.location.hostname` değeri `localhost` olduğu için çevrimdışı işlem senkronizasyon kuyruğu (`syncQueue`) ve WebSocket API bağlantılarının yerel `http://localhost:8000` sunucusuna bağlanmaya çalışması ve dolayısıyla mobil cihazın sunucuya hiçbir veriyi yansıtamaması sorunu giderildi. Mobil native tespiti ile varsayılan olarak `https://myworld-twqx.onrender.com` ve `https://planla.pikselai.com` üretim sunucularına bağlanması garanti altına alındı.
- **Çevrimdışı Verileri Otomatik Eritme:** İstemcilerde (hem bilgisayar hem mobil tarayıcıda) internet varken bekleyen işlem (`pendingCount > 0`) bulunması durumunda `OfflineBanner.tsx` artık kullanıcının butona tıklamasını beklemeden senkronizasyonu anında ve **tam otomatik** olarak başlatır. Böylece bilgisayarda veya telefonda bekleyen hiçbir verinin kaybolması riski kalmaz.
- **Kanban Sütun Veri Koruma Mantığı:** Mobil cihazın ilk açılışta yerel `localStorage`'da kalan varsayılan veya eski sütun şemasını veritabanına geri yazıp sunucudaki güncel sütun konfigürasyonlarını (örneğin bilgisayarda oluşturulmuş olan `• E-TİCARET 5` sütununu) ezmesi engellendi. Veritabanındaki veri öncelikli hale getirildi ve taze veri yüklenene kadar veritabanının ezilmesi önlendi.
- **WebSocket Görev Yayınları Eklendi:** `tasks.py` router'ındaki `create_task`, `update_task` ve `update_task_status` endpoint'lerine `new_task` ve `task_update` WebSocket yayınları entegre edildi. Herhangi bir cihazda görev kartı oluşturulduğunda, düzenlendiğinde veya durum değişikliği (sürükle-bırak) yapıldığında diğer tüm açık cihazlar ve tarayıcı sekmeleri sıfır saniye gecikmeyle anında güncellenmektedir (ışıklanmaktadır).
- **`projectStore` syncQueue Entegrasyonu:** `projectStore.ts` içindeki `addProject`, `updateProject` ve `deleteProject` (sütun ekleme/düzenleme vb.) mutasyonları çevrimdışı işlem kuyruğuna (`syncQueue`) entegre edildi. Telefon veya bilgisayar çevrimdışıyken veya API geciktiğinde eklenen yeni sütunların optimistic update sonrasında hata verip ekrandan kaybolması (geri yüklenme) sorunu kökten çözüldü.
- **APK Fallback İndirme Linkleri Güncellemesi:** `TopNavbar.tsx` ve `InstallAppBanner.tsx` içerisindeki eski `Pikselis_v5.3.apk` indirme linkleri `Pikselis_v5.4.apk` olarak güncellendi.
- **APK Boyut Kontrolü:** Yeni sürüm (v5.4, Code 44) APK boyutu, Next.js build statik export `out/` dizinindeki ve Capacitor assets dizinindeki eski APK kalıntıları temizlenerek, **matruşka hatası önlenerek tam 17 MB'a (ideal boyut)** düşürüldü.

---

## [2026-06-03] - Sürüm 6.1 - Tüm Sistemde Real-Time WebSocket Eşleşmesi (Işıklama) & APK/Web Eşleme Çözümü

### Eklendi / Çözüldü
- **Sütun ve Proje Tanımlarında Canlı Eşleşme:** Sütun tanım alanı (`columns_config`) bulut veritabanına taşınmasının ardından, `projects.py` router'ına WebSocket broadcast (`project_update`) entegre edildi. Bir sütun eklendiğinde, silindiğinde veya adı güncellendiğinde tüm aktif telefon/web istemcileri anında tetiklenip veriyi güncelliyor.
- **Canlı Takvim Eşleşmesi (Calendar Sync):** Takvim etkinlik oluşturma, güncelleme ve silme endpoint'lerine (`calendar.py` router'ı) WebSocket yayını (`calendar_update`) entegre edildi. `webSocketStore.ts` üzerinden anlık yakalanan bu sinyal ile takvim verileri tüm cihazlarda sıfır saniye gecikmeyle yenilenmektedir.
- **Canlı Not Eşleşmesi (Notes Sync):** Not oluşturma, güncelleme, silme, AI analizi ve ses yükleme endpoint'lerine (`notes.py` router'ı) WebSocket yayını (`note_update`) eklendi. Tüm istemcilerde not arayüzü anlık güncellenecek şekilde uyarlandı.
- **Canlı Fotoğraf Takip Eşleşmesi (Photo Tracking Sync):** Model, renk ve revizyon işlemlerinin yapıldığı tüm endpoint'lere (`photo_tracking.py` router'ı) WebSocket yayını (`photo_tracking_update`) eklendi.
- **Geriye Dönük Uyumluluk:** Eski tarayıcı `localStorage` sütun ayarları, sistemin ilk açılışında veritabanı boşsa otomatik DB'ye göç ettirilerek veri kaybı olmadan senkronize edildi.

---

## [2026-06-03] - Sürüm 6.0 - Android OTA Güncelleme Tetikleme ve Responsive Arayüz Düzeltmeleri (v5.3)

### Eklendi
- **Dirençli OTA Güncelleme Sistemi:** Render.com soğuk başlama (cold start) uykusundan uyanırken oluşan gecikmelere karşı sürüm kontrolünde 30 saniye timeout ve exponential backoff ile 3 kez retry mekanizması eklendi. Bağlantı kesintilerinde veya yavaş ağlarda sürüm kontrolünün kesinlikle çalışması sağlandı.
- **Android Safe Area Padding Desteği:** Android cihazlarda durum çubuğunun (status bar) webview'ın üzerine binerek üst menüyü tıklanamaz hale getirmesi, `Capacitor` platform kontrolüyle Android cihazlarda üst padding (padding-top) dinamik olarak artırılarak (`pt-10` veya `calc(safe-area+34px)`) tamamen çözüldü.

### Çözüldü
- **Responsive Sıkışma Hataları:** Üst navigasyon barındaki (TopNavbar) butonlar (Firmalar, Bildirim, Tema, Profil) mobil cihazlarda yan yana sığmayıp responsive kayma yapıyordu. Mobilde aralarındaki gap azaltıldı, ikon boyutları ve paddingler `w-8 h-8` olarak optimize edildi. Firmalar butonundaki uzun isimlerin truncate sınırı mobilde `max-w-[60px]` seviyesine çekilerek taşmalar tamamen engellendi.

---

## [2026-06-02] - Sürüm 5.8 - Realtime WebSocket Görev Senkronizasyonu & Hızlı Çift Yönlü Güncelleme

### Eklendi
- **Çift Yönlü Realtime Görev Eşleşmesi:** Backend üzerindeki tüm görev oluşturma, güncelleme, durum değiştirme, silme, sıralama ve alt görev ekleme endpoint'lerine WebSocket `task_update` event yayını entegre edildi.
- **Frontend Anlık Re-fetch:** `webSocketStore.ts` güncellenerek `task_update` yayını alındığında, eğer güncellenen görev kullanıcının seçili şirketindeyse anında `fetchTasks()` tetiklenmesi sağlandı. Böylece bilgisayar ile mobil telefon arasında sıfır saniye gecikmeli (anında) çift yönlü senkronizasyon kuruldu.

---

## [2026-06-02] - Sürüm 5.7 - Görev Açıklama Taslak Koruma & Silinme Sorunu Çözümü

### Çözüldü
- **Görev Açıklaması Silinme Sorunu:** Görev detay panelinde açıklama düzenleme alanında, periyodik poll (veri yenileme) veya WebSocket realtime güncellemeleri nedeniyle `selectedTask` güncellendiğinde, kullanıcının yazmakta olduğu taslak metninin (`descriptionDraft`) eski veritabanı açıklamasıyla ezilerek silinmesi hatası, `isEditingDesc` durumunun `false`'tan `true`'ya ilk geçiş anını useRef ile takip eden ve sadece düzenleme moduna girildiğinde veriyi dolduran bir yapı (`prevIsEditingDesc`) kurularak tamamen çözüldü.

---

## [2026-06-03] - Sürüm 5.9 - Mobil Arayüz Taşma Düzeltmesi & Safe Area Desteği (v5.2)

### Düzeltildi
- **Sol Üst Logo & Taşma Problemi:** Mobil/Android görünümde sol üstteki büyük logo kaldırıldı. Başlık alanı (`text-sm font-extrabold`) daraltılarak sağdaki butonların ekran daraldığında (360px - 400px arası) sığmayarak alt satıra veya yukarıya kayması sorunu giderildi.
- **Safe Area Padding Entegrasyonu:** Üst navigasyon barı (`header`) için `safe-area-inset-top` padding'i entegre edilerek, Android cihazlarda durum çubuğunun (saat ve pil göstergeleri olan en üst bant) butonların üstüne binerek tıklamaları engellemesi sorunu tamamen çözüldü.
- **APK Sürüm Güncellemesi:** Sürüm v5.2, Code 42 olarak güncellendi ve OTA güncelleme paketi olarak dağıtıldı.

---

## [2026-06-02] - Sürüm 5.8 - Yeni Premium Görev Odaklı Logo Entegrasyonu

### Eklendi
- **Yeni Premium Logo Entegrasyonu:** Kullanıcının seçtiği görev ve Kanban odaklı yeni premium logo tüm sistem genelinde devreye alındı.
- **Capacitor Android Launcher ve Splash Entegrasyonu:** `capacitor-assets` aracı çalıştırılarak Android platformu için 87 adet launcher ikonu (`ic_launcher.png`, `ic_launcher_round.png`) ve splash screen görseli yeni logomuzla yüksek çözünürlüklü olarak otomatik üretildi.
- **PWA İkonları ve Favicon:** PWA manifestosunda yer alan tüm `.webp` / `.png` ikonları ve favicon.ico, sips ve asset generator araçlarıyla güncellendi.

### Güncellendi
- **Sidebar Logosunun Büyütülmesi (`Sidebar.tsx`):** Masaüstü sol menüsündeki eski SVG animasyon kaldırıldı, yerine yeni premium logomuzun `512x512` görseli `w-14 h-14` boyutunda şık ve büyük olarak yerleştirildi.
- **TopNavbar Mobil Logosunun Büyütülmesi (`TopNavbar.tsx`):** Mobil üst barda yer alan eski "MW" kutusu kaldırıldı, yerine yeni logomuz `w-11 h-11` boyutunda şık ve büyük olarak yerleştirildi.

---

## [2026-06-02] - Sürüm 5.7 - Görev & Kanban Odaklı Logo Promptları Tasarımı

---

## [2026-06-02] - Sürüm 5.6 - Arayüz Renk Uyumlu Logo Promptları Revizyonu

### Güncellendi
- **Arayüz Uyumlu Logo Promptları:** planla.pikselai.com ekran görüntülerindeki güncel arayüz renklerine (Kraliyet Mavisi, Zümrüt Yeşili, Amber Turuncu ve Grafit/Slate) tam uyumlu, aydınlık mod odaklı 50 adet premium logo promptu `/logo_prompt_kutuphanesi.md` dosyası üzerinde yeniden düzenlendi.

---

## [2026-06-02] - Sürüm 5.5 - Premium Logo Prompt Kütüphanesi Entegrasyonu

### Eklendi
- **Premium Logo Prompt Kütüphanesi:** Pikseliş ve My World uygulamaları için Midjourney v6 ve DALL-E 3 uyumlu, aydınlık ve karanlık varyasyonlu, 10'arlı 5 grupta toplanmış 50 adet premium logo promptu içeren `/logo_prompt_kutuphanesi.md` dosyası ana dizine eklendi.

---

## [2026-06-01] - Sürüm 5.4 - Aydınlık & Estetik 3D Cam Logo Tasarımı (v5.0)

### Eklendi
- **Aydınlık & Estetik 3D Cam Logo (v5.0):** Platformun (Web, PWA, Android) tüm simgeleri ve logoları, harf içermeyen, Trello/Kanban esintili ultra-modern ve aydınlık renklerdeki (teal, coral, gold) 3D cam tasarımıyla tamamen baştan oluşturulup entegre edildi.
- **Kapsamlı Entegrasyon:** Tüm faviconlar, PWA manifestoları, Android launcher ve splash ekranları yenilendi. Vercel logosuna ait tüm kalıntılar temizlendi.

### Güncellendi
- **Android APK Sürüm Yükseltme (v5.0):** Sürüm kurallarına uygun olarak `versionCode` 40'a ve `versionName "5.0"`'a yükseltildi, `ANDROID_CHANGELOG.md` dosyası güncellendi.

---

## [2026-06-01] - Sürüm 5.3 - Özgün Logo & Premium İkon Tasarımı (v4.9)

### Eklendi
- **Özgün İkon & Logo Tasarımı (Pikseliş):** Vercel varsayılan ikonlarını temizlemek amacıyla Pikseliş'e özgü, ultra-modern ve premium bir "P" harfli app icon ve splash screen tasarımı oluşturularak tüm platformlarda (Web, PWA ve Android) devreye alındı.
- **PWA İkonları & Favicon Güncellemesi:** `sips` aracı ile yeni ikon 192x192, 512x512 ve favicon.ico formatlarında yeniden ölçeklendirildi.

### Güncellendi
- **Next.js Metadata Favicon Ayarı:** Sekme başlıklarında (tab header) Vercel logosunun görünmesini engellemek için `layout.tsx` metadata config'ine explicit favicon tanımı eklendi.
- **Android APK Sürüm Yükseltme (v4.9):** Sürüm kurallarına uygun olarak `versionCode` 39'a ve `versionName "4.9"`'a yükseltildi, `ANDROID_CHANGELOG.md` dosyası güncellendi.

---

## [2026-06-01] - Sürüm 5.2 - planla.pikselai.com Alan Adı Geçişi

### Çözüldü
- **Görev Oluşturma Hata Çakışması:** `app/backend/app/routers/tasks.py` içindeki `create_task` fonksiyonunda, `except` bloğu içerisindeki mükerrer `ActivityLog` importunun local scope'ta çakışmaya yol açarak `UnboundLocalError: cannot access local variable 'ActivityLog' where it is not associated with a value` hatası fırlatması ve tüm görev oluşturma/senkronizasyon süreçlerini kilitlemesi sorunu, mükerrer import satırı kaldırılarak tamamen çözüldü.

### Güncellendi
- **Frontend Yönlendirme:** `.env` ve `.env.example` dosyalarındaki `FRONTEND_URL` adresi yeni alan adı `https://planla.pikselai.com` olarak güncellendi.
- **Backend CORS İzinleri:** `app/backend/app/main.py` içerisindeki CORS ve global exception handler origin listeleri yeni alan adı `https://planla.pikselai.com` ile güncellendi.
- **Mobil APK Sürüm İndirme:** `/api/app-version` endpoint'indeki mobil APK indirme linki (`download_url`) yeni alan adını (`https://planla.pikselai.com/Pikselis_v4.8.apk`) kullanacak şekilde güncellendi.
- **Alan Adı Güncelleme Betiği:** `scripts/update_domain.py` betiğindeki `REPLACEMENTS` listesi yeni alan adı planla.pikselai.com ile güncellendi ve kendi kendini bozmasını önlemek için dinamik parçalama yapıldı.
- **Derleme Doğrulaması:** Tüm frontend Next.js yapısı başarıyla derlendi (`npm run build`).

## [2026-05-30] - Sürüm 5.1 - Android APK Sürüm Senkronizasyonu & Güncelleme Altyapısı (v4.7)

### Eklendi
- **Android v4.7 APK Derlemesi:** Sürüm 1.9'dan sonra 2.0 vb. iki haneli sürüm standartlarına uygun olarak `versionCode 37` ve `versionName "4.7"` ile yepyeni bir temiz Android Debug APK derlendi.
- **Güvenli Temizlik (No-Bloat):** Capacitor senkronizasyonu öncesinde `app/web/public/` klasöründeki eski `Pikselis_v4.6.apk` dosyası `.silinecekler_cop_kutusu` dizinine taşınarak Capacitor WebView'ın matruşka gibi şişmesi/boyutunun katlanması engellendi. APK boyutu ideal seviyede korundu.

### Güncellendi
- **Backend Sürüm Denetimi (`main.py`):** `@app.get("/api/app-version")` endpoint'i güncellenerek son sürüm v4.7, versionCode 37 ve indirme URL'si `https://planla.pikselai.com/Pikselis_v4.7.apk` olarak sisteme işlendi.
- **Frontend Fallback Linkleri:** `TopNavbar.tsx` ve `InstallAppBanner.tsx` içerisindeki hardcoded fallback indirme linkleri yeni v4.7 APK dosyasıyla senkronize edildi.
- **Dağıtım & Canlıya Geçiş:** Tüm değişiklikler Next.js statik derlemesi (`npm run build`) ve Capacitor senkronizasyonu (`npx cap sync android`) ile doğrulanıp git deposuna commit edilerek GitHub'a gönderildi.

## [2026-05-30] - Sürüm 5.0 - Canlı Ortam MSSQL Bağlantı Yapılandırması & API Güvenlik Güncellemesi

### Eklendi
- **MSSQL Bağlantı Desteği (Venus):** Venus entegrasyonu ve sunucu servisleri için gereken `MSSQL_USER` ve `MSSQL_PASSWORD` değişkenleri, canlı ortama (`.env` ve `.env.example`) güvenli bir şekilde entegre edildi.
- **FastAPI Yapılandırma Entegrasyonu (`config.py`):** Pydantic Settings yapısına `mssql_user` and `mssql_password` alanları eklenerek, backend'in bu parametreleri otomatik olarak ve hatasız bir şekilde yüklemesi sağlandı.

### Güncellendi
- **Kod Doğrulaması & Build:** Next.js frontend tarafındaki tüm TypeScript ve optimizasyon süreçleri (`npm run build`) ile FastAPI backend config yükleme doğrulama testleri başarıyla gerçekleştirildi ve repo GitHub'a otomatik olarak push edildi.

## [2026-05-25] - Sürüm 4.9 - Android APK Yükleyici Çökme Hatası Giderimi & İzin Yönlendirmesi

### Çözüldü
- **Android APK Yükleyici Çökmesi (AppUpdateChecker.tsx / ApkInstallerPlugin.java):** Android 10+ harici depolama ve Scoped Storage kısıtlamaları nedeniyle yaşanan APK indirme ve yazma hatası, indirme dizini Directory.Cache (dahili cache) olarak değiştirilerek tamamen çözüldü.
- **Bilinmeyen Kaynaklar İzni Yönlendirmesi:** Yükleme izni kapalıysa uygulamanın çökmesi engellendi; kullanıcı otomatik olarak Android İzin Ayarları ekranına yönlendirilecek ve izin verip geri döndüğünde güncellemeye devam edebilecek şekilde optimize edildi.

## [2026-05-24] - Sürüm 4.8 - Görüntülü Görüşme Temizliği & Yerel Motivasyon Havuzu Entegrasyonu

### Kaldırıldı
- **Görüntülü Görüşme Özelliği**: Toplantı başlatma ve lobi/katılım altyapısı, `TopNavbar.tsx`, `DashboardWidgets.tsx`, `page.tsx` ve `webSocketStore.ts` dosyalarındaki görüntülü görüşme butonları, bildirim banner'ları, import'lar ve dinleyiciler tamamen temizlendi.
- **Toplantı Dosyaları**: `InAppCallWindow.tsx` bileşeni ve `meetingStore.ts` durum yönetim dosyası `.silinecekler_cop_kutusu/` dizinine taşınarak projeden arındırıldı.

### Güncellendi
- **Yerel Motivasyon Havuzu (MorningScreen.tsx)**: Karşılama ekranındaki Gemini AI tabanlı motivasyon mesajı üretimi yavaşlık ve API yükü nedeniyle kaldırıldı. Bunun yerine dosya içerisinde statik olarak tanımlanan 100+ premium iş dünyası, verimlilik ve planlama motivasyon sözünden anlık rastgele seçim yapan yerel bir havuz mimarisine geçildi. Karşılama ekranının bekleme süresi sıfıra indirildi.

## [2026-05-23] - Sürüm 4.7 - Görev Detay Mobil Alt Bar & Sekme İyileştirmeleri

### Güncellendi
- **Görev Detay Mobil Alt Bar (TaskDetailPanel.tsx)**: Mobil görünümde Fotoğraflar sekmesi ilk sıraya taşındı ve varsayılan aktif sekme yapıldı.
- **Bütünleşik Yorumlar & Geçmiş**: "Yorumlar" ve "Geçmiş" sekmeleri tek bir sekme ("Yorum & Geçmiş") olarak birleştirildi ve ayrı bir "Geçmiş" sekmesi kaldırıldı.
- **Mobil Sekme Karışma Sorunları**: Sekmeler arası geçişlerde "Etkinlik ve Yorumlar" (Unified Timeline) alanının her zaman altta sabit kalarak diğer sekmelerle üst üste binme hatası, mobil görünürlük koşul kontrolü eklenerek tamamen çözüldü.

## [2026-05-23] - Sürüm 4.6 - Karşılaşma Ekranı Mobil Fix & Görüntülü Görüşme İyileştirmeleri

### Güncellendi
- **Karşılaşma Ekranı (MorningScreen.tsx) Mobil Uyumluluğu**: Dikey ekran yüksekliği kısıtlı olan mobil cihazlarda (Android Capacitor / PWA) kartın dikeyde taşarak "Hazırım, Günü Başlat" butonunu ekran dışına kırpması engellendi. Kart `max-h-[92dvh]` ile sınırlandırıldı, grid alanı `flex-1 min-h-0` olarak ayarlanarak dikey daralmalarda scroll edilebilir kılındı.
- **Toplantı Altyapısı (meeting.py)**: Jitsi Meet sunucusu `meet.jit.si` adresinden, lobisiz ve moderatörsüz çalışan tamamen açık kaynaklı `meet.ffmuc.net` sunucusuna taşındı. Böylece "Toplantı sahibiyim / Giriş Yap" engeli tamamen aşılmış oldu.
- **Sessiz Oda Girişi**: İlgili toplantıya katılım sağlandığında kameranın ve mikrofonun varsayılan olarak kapalı (muted) açılması sağlandı. İsteyen katılımcılar görüşme sırasında bunları el ile aktif edebilecek.

## [2026-05-23] - Sürüm 4.5 - Takvim Görev Gösterim Modernizasyonu & Detay Popover Altyapısı

### Eklendi
- **Dinamik Görev Detay Popover'ı (Hover-Popover)**: Takvim günlerinin üzerine fareyle gelindiğinde veya dokunulduğunda açılan, o güne ait görevlerin başlığını, durumunu ve proje ismini içeren premium glassmorphic popover arayüzü eklendi. Popover içerisindeki görevlere tıklanarak doğrudan detayları açılabiliyor.

### Güncellendi
- **Takvim Hücresi Görev Tasarımı**: Takvim günlerindeki sığmayan, taşan ve görsel yapıyı bozan butonlar tamamen kaldırıldı. Bunun yerine projenin rengiyle uyumlu, yan yana dizilmiş, minimalist renkli noktalar (dots) entegre edildi. Bu sayede takvim hem son derece temiz bir görünüme kavuştu hem de hangi günde görev olduğu kolayca ayırt edilebilir hale geldi.

## [2026-05-23] - Sürüm 4.4 - Kontrol Paneli Dikey Hizalama & Kompakt Takvim UX İyileştirmeleri

### Güncellendi
- **Akıllı Asistan Esnek Yüksekliği**: Kontrol panelinin sol kolonunda bulunan "Akıllı Asistan" kartının yüksekliği `h-[370px] shrink-0` gibi sabit bir değer yerine `lg:flex-grow lg:min-h-0` olarak ayarlanarak sol kolonun alt kısmındaki boşluk giderildi ve sağ/orta kolonlarla alt çizgisi eşitlendi.
- **Kompakt Takvim Tasarımı**: Takvim kartındaki günlerin listelendiği grid yapısı `grid-rows-6` ve `h-full`/`justify-between` ile dikeyde esnetildi. Bu sayede takvim kartının altında orantısız boş alanların kalması engellenerek takvim daha kompakt ve estetik bir görünüme kavuşturuldu.

### Çözüldü
- **Çoklu Platform Uyum Problemi**: Sol, orta ve sağ kolonların dikeyde hizasız durması ve mobil WebView / Android Capacitor gibi ekranlarda dikey oranlerin bozulması sorunu, CSS flexbox esneklik tanımlamalarıyla tamamen çözüldü.

## [2026-05-23] - Sürüm 4.3 - İzole Tam Ekran Frappe CRM Deneyim Dünyası

### Eklendi
- **Tam Ekran Frappe CRM Dünyası (`crm-app-root`)**:
  - `page.tsx` return yapısı güncellenerek, CRM butonuna tıklandığında normal sayfa üst/alt navigasyonları ve diğer Pikseliş modülleri tamamen gizlenecek (bypass edilecek) şekilde izole edildi. Ekran bütünüyle Frappe CRM resmi portalına dönüşüyor.
  - Sol sidebar'ın en altına, kullanıcının tek tıkla kendi Pikseliş / My World paneline geri dönebilmesini sağlayan zengin tasarımlı **"My World'e Dön"** butonu yerleştirildi.
- **Birebir Frappe CRM Sidebar & Kanban Tasarımı**:
  - **Pembe Logo & Profil Kırılımı**: Sol sidebar'da resmi logoya uygun pembe kutuda `F` simgesi ve altında kullanıcı detayları.
  - **Sol Sidebar Linkleri**: Leads, Deals, Contacts, Organizations, Notes, Tasks, Call Logs (Omnichannel Inbox), Email Templates.
  - **Alt Gruplar**: `Public views` (My Leads, My Deals, Timeless Only) ve `Pinned views` (Linkedin Deals, Facebook Deals) ve Collapse seçeneği.
  - **Filtre Paneli**: `CRMPipelines.tsx` (Deals) tablosunun üzerine `ID`, `Organization`, `Territory`, `Status` filtre kutuları ve sağda Refresh, Filter, Kanban Settings butonları yerleştirildi.
  - **Kanban Sütun Noktaları**: Görseldeki Qualification (turuncu), Proposal/Quotation (mavi), Negotiation (yeşil), Ready to Close (kırmızı) ve Closed (pembe) sütun başlığı noktaları eklendi.
  - **Marka Avatarları & İkon Barları**: Kartlarda Spotify, Netflix, Tesla, Adobe logoları, fiyat etiketleri, e-posta, telefon ve alt ikon çubuğu (`@`, dosya, check, yorum) birebir kopyalandı.

### Çözüldü
- **Gamification & Kanban Tip Hataları**: Kullanıcının yaptığı son gamification ve bildirim geliştirmelerinden kalan `assignee_name` ve `useGamificationStore` eksik importları, ayrıca `selectedTask.priority === 'high'` uyuşmazlığı as any tip dönüşümleri yapılarak Next.js derleme sürecinde tamamen çözüldü.

## [2026-05-23] - Sürüm 4.2 - Frappe CRM POC Entegrasyonu & Müşteri İlişkileri Deneyim Modu

### Eklendi
- **Frappe CRM POC Arayüzü & Alt Modülleri**:
  - **`CRMLayout.tsx`**: Sol tarafta HSL renkleriyle tasarlanmış zengin bir alt navigasyon (Adaylar, Satış Kanalları, Omnichannel Inbox, E-posta Kampanyaları) ve sağ tarafta dinamik alt sayfa yükleyicisi.
  - **`CRMLeads.tsx`**: Şirketin mevcut firmalarını ve görevlerini "müşteri adayları" (Leads) olarak listeleyen şık bir tablo ve sağdan kayarak açılan Frappe CRM Timeline (Zaman Tüneli) aktivite geçmişi.
  - **`CRMPipelines.tsx`**: Fırsatları (Deals) 5 farklı satış aşamasında (Aday, Görüşüldü, Teklif, Sözleşme, Kazanıldı) listeleyen, interaktif aşama taşıma butonları içeren lüks bir Kanban tahtası.
  - **`CRMOmnichannel.tsx`**: WhatsApp, Facebook ve Instagram kanallarından gelen mesajları tek bir gelen kutusunda simüle eden zengin sohbet arayüzü ve kullanıcının mesajlarına gerçek zamanlı akıllı demo yanıtları veren AI chat bot simülatörü.
  - **`CRMEmails.tsx`**: E-posta şablonları hazırlama, düzenleme ve toplu kampanya gönderim arayüzü ile kampanya performans analiz raporları (açılma/tıklama oranları).
- **Zustand State & Navigasyon Entegrasyonu**:
  - `projectStore.ts` içerisindeki `ViewMode` tipine `'crm'` eklenerek global state'e bağlandı.
  - `TopNavbar.tsx` navigasyon barına şık bir **CRM** butonu ve ikonu (`Briefcase`) eklendi, böylece kullanıcının tek tıkla tüm ekranı CRM moduna dönüştürmesi sağlandı.
  - `src/app/page.tsx` render koşullarına `isCRM` kontrolü eklenerek, mod aktif olduğunda tüm ekranın CRM arayüzüne geçişi sağlandı.

### Çözüldü
- **TypeScript `assignee_name` Derleme Hatası**: `Task` modelinde `assignee_name` alanının bulunmaması sebebiyle `npm run build` sırasında fırlatılan derleme hatası, görev ID'sine göre eşleşen akıllı `demoNames` dizisi oluşturularak tamamen çözüldü ve Next.js optimizasyon süreci %100 başarıyla tamamlandı.

## [2026-05-23] - Sürüm 4.1 - Görüntülü Arama & Profil Menüsü UX İyileştirmeleri

### Eklendi
- **Görüşmeyi Hızlı Sonlandır ve Kapat (X) Butonu**: `InAppCallWindow` başlık çubuğuna net bir kapatma (X) butonu eklendi. Bu butona basıldığında `stopMeeting` tetiklenerek hem görüşme penceresi gizlenir hem de veritabanından aktif toplantı durumu temizlenir. Bu sayede üst navbardaki kırmızı arama butonu anında söner.
- **Dinamik ve Null-Safe Aktivite Eşleme**: `ActivityFeedWidget` veri modeli güncellenerek frontend ve backend veri modellerinin her ikisini de esnek bir şekilde destekleyen, boş veya gri kutuları engelleyen, dinamik açıklama oluşturan bir eşleme katmanı yazıldı.

### Güncellendi
- **PWA & Android İndirme Metinleri**: Profil menüsündeki APK indirme butonundaki fontlar kalınlaştırıldı ve "Android Uygulamasını Yükle" olarak güncellendi. PWA indirme butonu ise "Bilgisayara / Telefona Yükle (Tarayıcı Uygulaması)" şeklinde daha anlaşılır bir metinle premium hale getirildi.
- **InAppCallWindow Küçültme Konumu**: Küçültülmüş görüntülü arama penceresi (Picture-in-Picture), AI asistan robotuyla çakışmaması için sağ alttan sol alt köşeye (`bottom-6 left-6`) taşındı.
- **Profil Menüsü Tasarımı**: API Maliyeti bölümü tamamen kaldırıldı. Avatar ve şirket başlığı daha belirginleştirilerek ultra-premium, modern ve temiz bir görünüm kazandırıldı.

### Çözüldü
- **Kapatma Tuşu & Kırmızı Buton Sorunu**: Toplantıyı kapatma/ayrılma butonuna basıldığında üst navbardaki kırmızı yanıp sönen butonun sönmemesi sorunu, pencerenin doğrudan `stopMeeting` tetiklemesiyle çözüldü.
- **TaskDetailPanel Derleme Hatası**: Önceki tab kaldırma/timeline birleştirme işlemlerinden kalan kod kırıntıları ve eksik JSX etiketleri giderilerek Next.js derleme hatası tamamen çözüldü.

## [2026-05-23] - Sürüm 4.0 - Daily.co Görüntülü Arama & Canlı Aktivite Akışı (WebSocket Sync)

### Eklendi
- **Daily.co Yerleşik Görüntülü Arama Penceresi (InAppCallWindow)**: Sağ alt köşede yüzen, glassmorphic ve mobil uyumlu görüntülü görüşme penceresi eklendi. İframe (`allow="camera; microphone; fullscreen; display-capture; autoplay"`) üzerinden Daily.co odasına doğrudan bağlanır, küçültme/büyütme (minimize/expand) ve host ise herkes için sonlandırma özelliklerine sahiptir.
- **Toplantı Süresi Sayacı (Meeting Timer)**: Arama başladığından itibaren geçen süreyi gösteren canlı ve hassas bir sayaç eklendi.
- **Aktif Toplantı Duyuru Banner'ı (ActiveMeetingBanner)**: Şirkette aktif bir görüntülü görüşme başladığında tüm ekip üyelerinin ekranında parlayan bir banner gösterilir ve tek tıkla görüşmeye katılmaları sağlanır.
- **Canlı Aktivite Akışı Widget'ı (ActivityFeedWidget)**: Dashboard'a yerleştirilen, WebSocket tabanlı canlı olay günlüğü widget'ı. Bir görev açıldığında, güncellendiğinde veya yorum yazıldığında tüm sisteme WebSocket üzerinden yayınlanan olaylar anında bu akışa prepend edilir ve fade-in mikro animasyonlarıyla lüks bir deneyim sunar.

### Güncellendi
- **Dashboard Grid Entegrasyonu**: Sağ panelde yer alan son görevlerin hemen altına Canlı Aktivite Akışı entegre edilerek kontrol paneli zenginleştirildi.
- **Global Arama Desteği**: `app/page.tsx` içerisine `InAppCallWindow` global olarak render edilerek, kullanıcının sayfa değiştirmesi durumunda dahi görüntülü aramanın kesintisiz ve floating olarak sürmesi sağlandı.

## [2026-05-23] - Sürüm 3.9 - Yerleşik Görev Yorumlaşma (Piksel-Sohbet) & Discord/Slack Webhook Entegrasyonu

### Eklendi
- **Yerleşik Görev Yorumlaşma (task_comments) Altyapısı**: Üçüncü partilere bağımlı kalmadan, tamamen Pikseliş veritabanı (PostgreSQL/Neon) tabanlı bir görev içi konuşma ve yorumlaşma sistemi entegre edildi.
- **WebSocket ile Anlık Mesajlaşma (Real-time Comments)**: `webSocketStore.ts` ve FastAPI WebSocket sunucusu genişletilerek, bir göreve yeni bir yorum yazıldığında veya silindiğinde, detay paneli açık olan tüm ekip üyelerinin ekranında yorumlar anlık ve sıfır gecikmeyle güncellenmektedir.
- **Discord & Slack Webhook Entegrasyonu**: Proje/Firma detay ayarlarına zengin tasarımlı Discord ve Slack Webhook URL girişleri eklenerek, görev oluşturulduğunda, görev durumları güncellendiğinde (todo ➡️ done vb.) veya göreve yeni bir yorum eklendiğinde otomatik ve asenkron (`BackgroundTasks`) olarak ilgili kanallara anlık rich bildirim kartları gitmesi sağlandı.
- **Masaüstü & Mobil Sekmeli Tasarım (UX Overhaul)**: Görev detay panelindeki (sağ panel) "İşlem Geçmişi" alanı, son derece premium bir **"Yorumlar"** ve **"Geçmiş"** sekmeli (Tabs) paneline dönüştürüldü.
- **Mobil PWA & Capacitor Desteği**: Mobil kullanıcılar için detay paneli alt tab barına şık bir **"💬 Yorumlar"** sekmesi eklenerek, telefondan da anlık iş birliği yapılması sağlandı.
- **ConfirmDialog Yorum Silme Entegrasyonu**: Yorum silme onaylarında tarayıcı native dialog diyalogları yerine, projenin özgün in-app `ConfirmDialog` bileşeni kullanıldı.

## [2026-05-23] - Sürüm 3.8 - Tamamlanan Görevlerin Takvimden Kaldırılması & Detay Paneli Buton Revizyonu

### Çözüldü
- **Tamamlanan Görevlerin Takvimde Görünmesi Sorunu:** Durumu 'done' (Tamamlandı) olan görevlerin takvim sayfasında hala gecikmiş (kırmızı) olarak listelenmesi sorunu, `CalendarPage.tsx` üzerindeki `taskEvents` hesaplama filtresine `status !== 'done'` kontrolü eklenerek tamamen çözüldü. Artık tamamlanan işler takvimden otomatik olarak temizleniyor.
- **Detay Paneli Kapatma Butonu Konumu (Yanlış Silme Riski):** Görev detay panelinin (sağ panel) sağ üst köşesinde yer alan butonların sıralaması (Kapat butonu en sağda, Sil butonu ortada olacak şekilde) soldan sağa Paylaş, Sil, Kapat olarak güncellendi. Kapatma butonu belirgin bir border ve koyu renk vurgusu ile en sağ köşeye çekildi, böylece kapatmak isterken yanlışlıkla görev silme riski ortadan kaldırıldı.

### Eklendi
- **Görev Detayına Minimal "Durum Tamamla" Butonu:** Görev detay panelinin (sağ panel) Hedef Tarih ve Öncelik alanlarının hemen altına, minimal, şık ve abartısız bir "Görev Tamamla" / "Tamamlandı" toggle butonu eklendi. Kullanıcılar takvimden tıkladıkları görevleri artık doğrudan bu butona basarak tamamlandı olarak işaretleyebiliyor.

## [2026-05-23] - Sürüm 3.7 - Boşta Kalma Tasarruf Modu & Bekleyen İşler Kaydırıcı Kartları

### Eklendi
- **Boşta Kalma (Idle Detection) & Ekran Tasarrufu Modu:** Kullanıcı 10 dakika boyunca fare/klavye/dokunmatik eylemi gerçekleştirmezse uygulama otomatik olarak karşılama ekranına (Tasarruf Modu) geçer.
- **Poll Duraklatma (İşlemci & RAM Sakinliği):** Karşılama ekranı açıkken veya boşta kalmışken arka plandaki backend veri sorgulamaları (poll interval) geçici olarak tamamen durdurularak ağ ve işlemci yükü sıfıra indirilir.
- **Her Yeni Sekme Karşılaması:** Karşılama ekranı artık günde 1 kez değil, sessionStorage kullanılarak her yeni sekmeye veya sayfa yenilenmesine anında açılacak şekilde uyarlandı.
- **Yatay Kaydırılabilir "Bekleyen İşler" Kartları:** Sol kolondaki AI motivasyon kartının altına, son tarihi gelecek veya son tarihi atanmamış tüm tamamlanmamış görevlerin listelendiği, yatayda kaydırılabilir snap-aligned premium kart listesi eklendi.

## [2026-05-23] - Akıllı Karşılama ve Yapay Zeka Destekli Gün Özeti Ekranı

### Eklendi
- **Yapay Zeka Destekli Sabah Karşılama Paneli (MorningScreen.tsx):** Mevcut statik sabah ekranı tamamen yenilenerek glassmorphic, dinamik ve saate duyarlı bir günün başlangıcı paneline dönüştürüldü.
- **Dinamik Karşılama Mimarisi:** Saate göre otomatik "Günaydın", "Tünaydın", "İyi Akşamlar", "İyi Geceler" tebrikleri ve buna eşlik eden canlı renk auraları/degradeleri.
- **Bugünün Görevleri & Takvim:** `taskStore` ve `calendarStore` entegrasyonu ile son tarihi bugün olan görevler ve bugünün takvim etkinlikleri anında listeleniyor.
- **Geçmişten Kalanlar (Gecikmiş İşler):** Geçmiş günlerde planlanmış ancak tamamlanmamış en kritik 3 görevi gösteren "Günden Kalanlar" bölümü.
- **Dünün Başarıları:** Dün başarıyla tamamlanan görevlerin sayısını gösteren motivasyon kartı.
- **Gemini AI Entegrasyonu:** `/api/ai/motivation` üzerinden çekilen asistan tavsiyeleri ve o güne özel asistan ipucu metinleri.
- **Hydration Koruma Filtresi:** Next.js client-side/server-side render tutarsızlıklarını ve hydration hatalarını önleyen `mounted` ve client-side tabanlı tarih eşleştirme mantığı.

### Güncellendi
- **Arayüz Tasarımı:** Premium glassmorphism paneller, pürüzsüz hover mikro-animasyonları, lüks tasarım standartlarına uygun arayüz elemanları ve "Hazırım, Günü Başlat!" geçiş butonu eklendi.

## [2026-05-22] - Görev Kartlarının Kaybolması ve Alt Görev Ekleme Hatalarının Çözümü

### Çözüldü
- **Görevlerin Geçici Kaybolması (Kanban Filtre Hatası):** Görev detay paneli kapatıldığında veya bir görev güncellendiğinde parametresiz tetiklenen `fetchTasks()` çağrısı, `/api/tasks` endpoint'ine `project_id` göndermiyordu. Bu durum backend'in kullanıcıya ait sadece 2 kişisel görevi döndürmesine ve diğer görevlerin geçici olarak kaybolmasına yol açıyordu. `taskStore.ts` güncellenerek parametre boş olduğunda `projectStore`'daki aktif `selectedProjectId` değeri otomatik olarak bağlam olarak atandı ve sorun tamamen çözüldü.
- **Alt Görevlerin 2 Saniye Sonra Kaybolması (TypeError Çakışması):** Alt görev oluşturma endpoint'inde (`POST /api/tasks/{task_id}/subtasks`) `TaskCreate` şeması içindeki `parent_task_id` alanı ile endpoint fonksiyonunda el ile geçilen `parent_task_id=task_id` parametresi çakışıyor ve Python'da `multiple values for keyword argument` TypeError (500 hatası) fırlatıyordu. Hata alındığında frontend optimistic update ile eklediği geçici kartı silerek alt görevin 2 saniye sonra kaybolmasına sebep oluyordu. `tasks.py` güncellenerek `parent_task_id` doğrudan `db_task_data` sözlüğü içine atanarak bu Python çakışması çözüldü.
- **Alt Görev Proje Bağlamı Kaybı:** Alt görevler eklenirken `project_id` aktarılmadığı için veritabanına `null` olarak kaydediliyor ve daha sonra proje bazlı görev listelemelerinde listeye dahil edilmiyordu. Hem frontend (`addSubtask` ve `TaskDetailPanel.tsx`'teki `handleAddSubtask`) hem de backend (`create_subtask`'ta `parent_task`'tan miras alma) düzeyinde güvenli proje ID aktarımı sağlanarak alt görevlerin kalıcılığı güvence altına alındı.

## [2026-05-22] - PWA 404 Bypass, APK İndirme Çözümü ve Sürüm 3.5

### Çözüldü
- **Serwist SW 404 Hatası:** PWA Service Worker'ın (`sw.ts`) 20MB'lık APK dosyalarını cache'lemeye çalışarak 10 saniyelik ağ aşımı sınırına takılması ve indirmelerin başarısız olması (404 / Ağ hatası) sorunu, APK dosyaları için `NetworkOnly` kuralı tanımlanarak tamamen çözüldü.
- **Vercel Static Router Sınırı:** Vercel static routing limitlerinin ve yavaşlıklarının APK indirme aracını kesintiye uğratması sorunu, indirme kaynağının doğrudan FastAPI (`/static/Pikselis_v3.5.apk`) sunucusuna yönlendirilmesiyle çözüldü.
- **Sürüm Güncelleme Bildirimi:** Android Capacitor tarafında `versionCode` 26'ya ve `versionName` "3.5"'e yükseltilerek backend `/api/app-version` ile tam eşitleme sağlandı. Bu sayede telefona sürüm güncelleme uyarısı anında düşmeye başladı.

### Güncellendi
- **Android APK Derlemesi:** Capacitor matruşka iç içe paketlenme hatasını önlemek için eski APK'lar derleme öncesinde `.silinecekler_cop_kutusu`'na taşındı. Temiz bir build ile 19.9MB APK üretilerek `public/` ve `backend/static/` dizinlerine kopyalandı.
- **Frontend Fallback Linkleri:** `TopNavbar.tsx` ve `InstallAppBanner.tsx` içindeki indirme linkleri yeni API statik yollarına (`https://myworld-twqx.onrender.com/static/Pikselis_v3.5.apk`) güncellendi.

## [2026-05-20] - Mobil Bildirim Sadeleştirmesi ve Kararlılık Paketi (v3.4)

### Çözüldü
- **SQLAlchemy Nesne Kararlılığı:** Profil ayarlarını kaydederken JSON kolonunun SQLAlchemy mutable yapısından ötürü veri tabanına yazılmaması ve geriye sıfırlanması hatası `flag_modified` eklenerek çözüldü.
- **Kritik Bağlantı Hatası (Capacitor):** Mobil cihazlarda derleme sırasındaki `.env` eksiklikleri nedeniyle API URL'sinin varsayılan olarak `localhost:8000`'e kalması ve güncelleme uyarısı dahil hiçbir ağ isteğinin çalışmaması sorunu, fallback adresleri doğrudan Render Production URL'ine (`https://myworld-twqx.onrender.com`) yönlendirilerek çözüldü.

### Güncellendi
- **Bildirim Mimarisi Ayrıştırıldı:** Mobil (Capacitor local) bildirimler, kullanıcı ayarlarından tamamen çıkarıldı ve arka planda **her zaman açık ve 2 saat (120 dakika) önce** çalışacak şekilde sabitlendi.
- **Profil Ayarları Arayüzü:** Gereksiz yer kaplayan ve kafa karıştıran mobil bildirim kontrolleri gizlendi. Sadece değiştirilebilir e-posta ayarları bırakıldı.
- **Varsayılan E-posta Süresi:** E-posta hatırlatıcı varsayılan süresi 1 gün öncesi (1440 dakika) olarak güncellendi.
- **Boyut Azaltma (Double-packaging):** Eski `v3.3` sürüm APK dosyaları `.silinecekler_cop_kutusu`'na taşınarak Capacitor derlemesinin matruşka gibi büyümesi önlendi; yeni `v3.4` APK boyutu 39MB'den 19.9MB'ye düşürüldü.

## [2026-05-20] - Dinamik E-posta Bildirimleri, Görev Hatırlatıcıları ve Günlük Plan Özeti

### Eklendi
- **Profil Ayarları E-posta Kontrolleri:** Kullanıcılara e-posta bildirimlerini açıp kapatma ("email_notifications_enabled") ve e-posta hatırlatma sürelerini (15 dakikadan 2 güne kadar) seçebilme özelliği eklendi.
- **Yarının Günlük Plan Özeti:** Kullanıcılara yarınki planlarını (etkinlik ve görevler) içeren, yerel saat dilimlerine göre uyarlanmış, şık ve profesyonel bir HTML e-posta özeti ("daily_summary_enabled") alma seçeneği sunuldu. Her akşam saat 20:00'de otomatik olarak çalışmak üzere APScheduler'a eklendi.
- **Dinamik Saatlik Hatırlatıcılar:** APScheduler üzerinden her 15 dakikada bir çalışarak, yaklaşan görevleri kullanıcının ayarladığı offset sürelerine göre (tolerans aralığı ile) e-posta olarak gönderen mekanizma kuruldu.

### Güncellendi
- **Veri Mimarisi ve Uyumlu Kayıt:** Veritabanında yeni bir tablo/kolon ekleme ihtiyacını ortadan kaldırmak için, kullanıcı e-posta bildirim ayarları `User.settings` JSON alanında (Zustand ve FastAPI üzerinden) geriye dönük uyumlu olarak saklandı.
- **Frontend & Backend Entegrasyonu:** Next.js `ProfileSettings.tsx` bileşeni e-posta ayarlarını içerecek şekilde zenginleştirildi, `authStore.ts` güncellendi. Backend tarafında `schemas/auth.py` ve `routers/auth.py` profili kaydederken ve sorgularken ayarları koruyacak şekilde güncellendi.
- **Tıkanıklık ve Boş E-posta Önleme:** Yarın için herhangi bir görev veya takvim etkinliği planlanmamışsa e-posta gönderimi pas geçilerek spam önlendi.

## [2026-05-15] - Kanban Sürükle-Bırak Deneyimi ve Boş Sütun Optimizasyonu

### Çözüldü
- **Boş Sütunlara Bırakma Sorunu:** Daha önce hiç kart olmayan (boş) sütunlara kart taşırken yaşanan algılama sorunu ve kartın "havada kalıp geri dönmesi" problemi giderildi.
- **Dinamik Yükseklik:** Sütunların (kanban-column) her zaman tam dikey yüksekliği kaplaması sağlandı (`height: 100%`).
- **Droppable Alan Genişletme:** Kart bırakma alanına (`Droppable`) minimum 200px yükseklik eklenerek boş sütunların her zaman geçerli bir hedef olması sağlandı.

### Güncellendi
- **Görsel Geri Bildirim:** Bir kart bir sütun üzerine getirildiğinde sütun artık daha belirgin bir şekilde parlıyor ve hafifçe ölçeklenerek kullanıcıya kartı nereye bırakabileceğini net bir şekilde gösteriyor.
- **Aesthetic Refinement:** Sütun kenarları daha yumuşak (`rounded-xl`) hale getirildi ve sürükleme sırasında gölge (shadow) efektleri eklendi.

## [2026-05-15] - Terminal Problemleri ve Build Optimizasyonu

### Çözüldü
- **Next.js Navigasyon Hataları:** `reset-password` ve `verify-email` sayfalarındaki `<a>` etiketleri Next.js standartlarına uygun olarak `<Link>` bileşeni ile değiştirildi. Bu sayede SEO ve navigasyon performansı artırıldı.
- **Forbidden require() Kullanımı:** `ProfileSettings`, `CalendarPage` ve `ClientOnly` bileşenlerindeki asenkron `require()` çağrıları, TypeScript ve ESLint standartlarına uygun olarak üst seviye import'lara dönüştürüldü.
- **TypeScript Tip Güvenliği:** `CalendarPage` ve `CSVImporter` bileşenlerindeki tip uyumsuzlukları ve gereksiz `@ts-ignore` komutları temizlenerek build süreci tamamen hatasız hale getirildi.
- **Linter Hataları:** `InstallAppBanner` bileşenindeki sabit değişkenlerin `let` yerine `const` olarak tanımlanması sağlandı.

### Güncellendi
- **Temiz Build:** `npm run build` komutu artık herhangi bir hata veya engelleyici uyarı olmadan başarıyla tamamlanıyor.

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
