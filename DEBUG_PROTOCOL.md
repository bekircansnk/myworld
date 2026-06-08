# My World - Hata Ayıklama ve Çözüm Protokolü (Troubleshooting & Debug Protocol)

Bu dosya, sistemde karşılaşılan karmaşık sorunları ve bunların kesin çözümlerini dökümante eder. Bir sorunla karşılaşıldığında önce buraya bakılmalıdır.

## 📱 Mobil Dokunmatik Scroll Sorunları

### 1. Dashboard ve Görev Ekranında Dikey Kaydırmanın Çalışmaması
**Sorun:** Android/PWA dokunmatik kullanımda ana dashboard ve görev ekranında aşağı-yukarı kaydırma çalışmıyor; görev board'unda yatay kaydırma çalışırken dikey hareket kilitleniyordu.
**Neden:** Kanban board container'ında kullanılan `touch-pan-x`, tarayıcıya sadece yatay pan davranışına izin verip dikey pan hareketini engelliyordu. Buna ek olarak mobil app shell `min-height + overflow-hidden` yapısında kaldığı için bazı WebView kombinasyonlarında nested scroll alanlarının yüksekliği kesinleşmiyor ve dashboard scroll'u dokunmatikte kaybolabiliyordu.
**Çözüm:**
- Board container'ından `touch-pan-x` kaldırıldı ve inline `touchAction: 'pan-x pan-y'` ile iki eksenli doğal pan davranışı açıldı.
- Sütun içi scroll alanlarına `touch-pan-y overscroll-y-contain` eklendi.
- `.app-shell` mobilde de kesin `100svh/100dvh` yüksekliğe ve `overflow: hidden` davranışına alındı; `.mobile-content-area` için momentum scroll ve dikey overscroll davranışı sabitlendi.
- Benzer sorunlarda önce `touch-action`, nested `overflow-hidden` parent'lar ve flex child `min-height: 0` zinciri kontrol edilmelidir.

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
### 6. Görev Açıklama Taslak Metinlerinin Silinmesi (Periyodik Yenileme / WebSocket Overwrite)
**Sorun:** Görev detay panelinde açıklama (Description) düzenlenirken, kullanıcının yazmakta olduğu taslak metnin (`descriptionDraft`) bir anda kaybolması veya eski haline geri dönmesi.
**Neden:** `TaskDetailPanel.tsx` içerisinde bulunan `useEffect` kancasının `[isEditingDesc, selectedTask]` bağımlılıklarına sahip olması. Arka planda 60 saniyede bir çalışan poll interval (`fetchTasks`) veya anlık WebSocket sinyalleri (`new_task`) `selectedTask` referansını güncellediğinde, kullanıcı düzenleme modundayken bile bu useEffect tetikleniyor ve taslak state'i veritabanındaki eski veriyle (`selectedTask.description`) eziyordu.
**Çözüm:**
- `isEditingDesc` durumunun `false`'tan `true`'ya ilk geçiş anını (düzenleme butonuna ilk tıklanış) `useRef` ile takip eden bir referans kancası (`prevIsEditingDesc`) oluşturuldu.
- `useEffect` içindeki veri yükleme koşulu `isEditingDesc && !prevIsEditingDesc.current` olarak güncellendi.
- Bu sayede, kullanıcı düzenleme moduna ilk girdiğinde veri taslağa doldurulur; kullanıcı düzenleme yapmaya devam ederken gelen asenkron `selectedTask` güncellemeleri taslak veriyi asla ezemez.

### 7. Çift Yönlü Realtime Cihaz Senkronizasyonu (WebSocket Görev Güncellemeleri)
**Sorun:** Mobil telefon ile bilgisayar tarayıcısından aynı anda çalışıldığında, bir cihazda yapılan görev değişikliklerinin (durum, ad, öncelik, silme vb.) diğer cihazda anında yenilenmemesi ve gecikmeler yaşanması.
**Neden:** Backend üzerinde görev oluşturan (`create_task`), güncelleyen (`update_task`, `update_task_status`), silen (`delete_task`), alt görev ekleyen (`create_subtask`) veya sıralayan (`reorder_tasks`, `bulk_update_tasks`) endpoint'lerde veri güncellense bile, bağlı olan diğer istemci cihazlara görev güncellemesine dair herhangi bir WebSocket bildirimi yayını (broadcast) atılmıyordu.
**Çözüm:**
- Backend tarafındaki tüm görev güncelleme, oluşturma ve silme endpoint'lerine `background_tasks: BackgroundTasks` parametresi eklenerek, veritabanı işlemlerinin hemen ardından `background_tasks.add_task(manager.broadcast, {"type": "task_update", "project_id": project_id, "task_id": task_id})` yayını entegre edildi.
- Frontend tarafındaki `webSocketStore.ts` kütüphanesinde `task_update` event'i yakalandığında, eğer güncelleme alan görev kullanıcının o an seçtiği firmaya/projeye aitse anında `useTaskStore.getState().fetchTasks()` action'ı tetiklendi.
- Bu iki katmanlı yapı sayesinde, bilgisayar ve telefon gibi farklı cihazlarda yapılan tüm güncellemeler **sıfır saniye gecikmeyle (realtime) anında eşleştirildi.**

---

## 🛠 Sürüm 6.3 Ek Hata Çözümleri

### 1. Kanban Cihazlar Arası Sütun Senkronizasyon Kaybı ve Otomatik Ezme Problemi
**Sorun:** KanbanBoard üzerinde eklenen sütunlar ve sütuna eklenen görevler, başka bir cihazda oturum açıldığında veya sayfa yenilendiğinde görünmüyordu. Kısmen localStorage ve kısmen `projects.columns_config` entegrasyonu nedeniyle veri tutarsızlığı oluyordu; sunucunun boş döndüğü durumlarda yerel veriler otomatik sunucuya push edilerek veritabanı eziliyordu.
**Çözüm:**
- Kanban sütunları için **server-first** mimari kuruldu. `projects.columns_config` tek kalıcı veri kaynağı yapıldı. LocalStorage yalnızca read-only fallback/cache olarak kullanıldı ve sunucu boş geldiğinde otomatik DB'ye yazma davranışı engellendi.
- Sütun güncelleme API'si owner-only `PUT /projects/{id}` endpoint'inden ayrıldı ve `PUT /projects/{id}/columns` adında bağımsız yeni bir endpoint'e taşındı. Yetki kontrolü görev düzenleme yetkisi (`require_company_permission("tasks", "edit")`) olan tüm kullanıcılara esnetildi, yetkisizler için ise net 403 engeli getirildi.

### 2. Sütun Config Validasyonu
**Sorun:** Hatalı, eksik veya mükerrer sütun konfigürasyonlarının veritabanına yazılabilmesi ve bunun arayüzü bozabilmesi riski.
**Çözüm:**
- Backend tarafındaki `PUT /projects/{project_id}/columns` endpoint'ine sıkı validasyon eklendi: varsayılan sütunlar (`todo`, `in_progress`, `done`) silinmiş olamaz, mükerrer `statusKey` bulunamaz ve her sütun için `id`, `statusKey`, `label`, `dotColor` alanlarının dolu ve string olması zorunlu tutuldu.

### 3. Optimistic UI Rollback ve Toast Yönetimi
**Sorun:** Sütun eklerken, silerken veya ismini değiştirirken API çağrısı başarısız olsa dahi (örn: yetki yoksa) arayüzde başarı toast'ı gösterilmesi ve optimistic state'in öylece kalması.
**Çözüm:**
- `projectStore.ts`'te `updateProjectColumns` metoduna asenkron hata durumunda optimistic state'i ve localStorage cache'ini anında geri saran bir **rollback** mekanizması kuruldu.
- KanbanBoard arayüzündeki sütun manipülasyon fonksiyonları asenkron sonucun başarısını bekleyecek şekilde güncellendi; API hata verdiğinde başarı toast'ı tetiklenmemesi sağlandı.

### 4. Config Dışı Durum (Custom Status) Kaybolma Sorunu
**Sorun:** Bir projenin sütun yapılandırmasından (`columns_config`) silinmiş veya config içinde yer almayan bir custom status değerine sahip görevlerin KanbanBoard'da tamamen görünmez hale gelmesi.
**Çözüm:**
- `KanbanBoard.tsx` bileşeninde `computedColumns` adında bir `useMemo` normalizer'ı yazıldı. Görev listesinde bulunan ama sütun config'inde yer almayan her durum (`status`) için listenin sonuna dinamik olarak geçici bir "Sütunsuz (Fallback)" sütunu eklenmesi sağlandı. Böylece hiçbir görev kaybolmamakta ve kullanıcı kartı başka bir sütuna taşıyarak durumu düzeltebilmektedir.

### 5. Durum Çözümleme ve Dashboard Entegrasyonu
**Sorun:** Custom status etiketlerinin görev detay panelinde ve dashboard widgets istatistiklerinde düzgün çözümlenememesi veya aktif görev sayılmaması.
**Çözüm:**
- `TaskDetailPanel.tsx` içindeki `statusConfig` nesnesi dinamikleştirilerek; görevin ait olduğu projenin columns_config verisine göre custom durum isimlerini ve renklerini çözümlemesi sağlandı.
- `DashboardWidgets.tsx` üzerinde `done` ve `todo` dışındaki tüm custom status durumlarına sahip görevler aktif görev (`inProgressTasks`) kabul edildi.


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
**Neden:** Frontend kodlarında `act.username`, `act.activity_type` ve `act.description` alanları aranırken, backend API response yapısında bu bilgilerin `act.user.name` (veya `act.user.username`), `act.action` ve `act.details` as data format gelmesi.
**Çözüm:** `ActivityFeedWidget` veri modeli güncellendi ve her iki veri yapısını da destekleyen, null-safe bir dinamik veri eşleme helper fonksiyonu yazıldı.

### 4. Kontrol Paneli Dikey Hizalanma ve Takvim Oran Kayması (Sürüm 4.4)
**Sorun:** GamificationWidget (XP/Seviye kartı) sol panelden tamamen kaldırıldıktan sonra, sol paneldeki tek kart olan "Akıllı Asistan" kartının yüksekliği sabit kaldığı için sol kolonun altında büyük boşluklar oluşması ve buna bağlı olarak orta kolondaki Takvim kartının orantısız şekilde dikeyde uzayıp alt kısmında gereksiz boşluklar barındırması.
**Çözüm:** 
- Akıllı Asistan kartının `h-[370px] shrink-0` sabit sınıfları kaldırılıp yerine `lg:flex-grow lg:min-h-0` eklenerek yüksekliği sol kolonun alt çizgisine kadar esnetildi.
- Takvim kartı içerisindeki günleri listeleyen grid yapısı `grid-cols-7 gap-0.5 flex-1 auto-rows-fr lg:min-h-0` yerine `grid-cols-7 grid-rows-6 gap-1 flex-1 min-h-0` yapısına dönüştürüldü. Günleri render eden div'lere `flex flex-col justify-between h-full` ve `min-h-[32px]` sınıfları eklenerek günlerin kart yüksekliğine göre eşit, kompakt ve dengeli dağılması sağlandı.

### 5. Takvim Hücresi Görev Taşmaları ve Kötü Görünüm (Sürüm 4.5)
**Sorun:** Kontrol panelindeki takvimde, günlerin altında sığdırılmaya çalışılan metinli butonların ve "+X" etiketlerinin kutulardan dışarı taşması, dikeyde çakışması ve okunaksız/kötü bir arayüz oluşturması.
**Çözüm:**
- Hücrelerin içerisindeki butonlar tamamen kaldırıldı.
- Görev durumlarını göstermek üzere, projenin rengiyle uyumlu yan yana dizilen minimal renkli noktalar (dots) yerleştirildi (maksimum 3 nokta, fazlası için +X sayısı).
- Hücrenin üzerine gelindiğinde (hover) veya tıklandığında açılan, o güne ait görevlerin tam başlığını, tamamlanıp tamamlanmadığını (üstü çizili/normal) ve firma etiketlerini listeyen yarı-saydam (glassmorphic), z-index'i yüksek (`z-50`) bir detay popover'ı entegre edildi.

### 6. Karşılaşma Ekranı Mobil Kilitlenme ve Toplantı Moderatör Engeli (Sürüm 4.6)
**Sorun 1:** Mobil WebView veya Android Capacitor üzerinde, dikey ekran alanı kısıtlı olduğundan karşılama ekranı (MorningScreen) tüm dikey yüksekliği kaplıyor ve kartın en altındaki "Hazırım, Günü Başlat" butonu ekranın tamamen dışına taşarak tıklanamaz/görünmez hale geliyor, kullanıcı arayüzde kilitleniyor.
**Çözüm 1:** Kart `max-h-[92dvh]` ile sınırlandırıldı. İçindeki grid container `flex-1 min-h-0` yapısına taşındı. Mobildeki padding ve gap değerleri küçültülerek butonun tüm mobil ekranlarda her zaman görünür ve tıklanabilir olması sağlandı.

**Sorun 2:** Jitsi Meet resmi sunucusu (`meet.jit.si`) iframe içinde açıldığında güvenlik politikalarından ötürü ilk katılan kullanıcıyı "Toplantı sahibi bekleniyor / Moderatör Giriş Yap" ekranına atıp Firebase (Google/GitHub) kimlik doğrulaması zorunlu kılıyor.
**Çözüm 2:** Fallback Jitsi sunucusu, lobi ve şifre/onay/moderasyon zorunluluğu olmayan tamamen ücretsiz Freifunk sunucusuna (`meet.ffmuc.net`) taşındı. Iframe URL'sine `#config.prejoinPageEnabled=false&config.lobby.enabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true` parametreleri eklenerek onaysız, Google girişi istemeyen ve ses/video kapalı (sessiz) şekilde toplantıya anında katılım sağlandı.

### 7. Görev Detay Mobil Alt Bar Sekme Karışması (Sürüm 4.7)
**Sorun:** Görev detay panelindeki (`TaskDetailPanel.tsx`) mobil alt bar (tab bar) sekmeleri arasında gezinirken, "Etkinlik ve Yorumlar" (Unified Timeline) alanının hangi sekme seçilirse seçilsin ekranın altında sabit kalması ve diğer sekmelerle üst üste binip arayüzü kullanılmaz hale getirmesi.
**Neden:** `TaskDetailPanel.tsx` dosyasında, "BÜTÜNLEŞİK YORUMLAR & HAREKET AKIŞI (Unified Timeline)" elementini saran ebeveyn div'de `activeMobileTab === 'comments'` kontrolünün eksik olması. Bu sebeple CSS `block` olarak her koşulda görünür kalıyordu.
**Çözüm:**
- `activeMobileTab` state tanımının varsayılan değeri `'photos'` (Fotoğraflar) olarak güncellendi ve listeden `'history'` seçeneği kaldırıldı.
- "BÜTÜNLEŞİK YORUMLAR & HAREKET AKIŞI" sarmalayıcı div'ine `${activeMobileTab === 'comments' ? 'block' : 'hidden md:flex'}` sınıfı entegre edildi. Bu sayede mobilde sadece Yorumlar sekmesi seçildiğinde görünüyor, diğer sekmeler seçildiğinde gizleniyor; masaüstünde ise her zaman görünür kalıyor.
- Alt bar butonlarındaki "Yorumlar" butonu "Yorum & Geçmiş" olarak adlandırıldı ve ayrı bir "Geçmiş" butonu kaldırıldı. Fotoğraflar en başa alındı.

### 8. Görüntülü Arama Özelliğinin Kaldırılması & Yerel Motivasyon Havuzu Geçişi (Sürüm 4.8)
**Sorun 1:** Görüntülü arama / toplantı özelliğinin artık şirkette kullanılmak istenmemesi ve gereksiz butonların kaldırılması talebi.
**Çözüm 1:**
- `InAppCallWindow.tsx` ve `meetingStore.ts` dosyaları `.silinecekler_cop_kutusu/` dizinine taşındı.
- `TopNavbar.tsx`, `DashboardWidgets.tsx`, `page.tsx` ve `webSocketStore.ts` dosyalarındaki görüntülü görüşme butonları, bildirim banner'ları, import'lar, dinleyiciler ve state'ler tamamen temizlendi.

**Sorun 2:** Karşılama ekranındaki (MorningScreen.tsx) yapay zeka motivasyon özetlerinin yavaş/verimsiz çalışması ve API maliyeti oluşturması.
**Neden:** Anlık olarak backend üzerinden Gemini API'sine istek atılması ve API yanıt sürelerinin WebView/Capacitor uygulamasının açılışını geciktirmesi.
**Çözüm 2:**
- `MorningScreen.tsx` dosyası içerisine 100 adet premium iş dünyası, verimlilik ve planlama odaklı motivasyon yazısı içeren statik `MOTIVATIONAL_QUOTES` dizisi entegre edildi.
- `fetchAiMotivation` fonksiyonu, backend'e HTTP isteği atmak yerine bu statik diziden `Math.random()` ile rastgele bir seçim yaparak sonucu anında ve gecikmesiz olarak ekrana yansıtacak şekilde optimize edildi.

### 9. Kanban Sütun Yapılandırması ve Mobil Veri Eşitlemesi (Sürüm 5.4 / 6.2)
**Sorun 1:** Bilgisayarda eklenen yeni kanban sütunları ve kartları (örn: `• E-TİCARET 5`) mobil cihazda görünmüyordu; mobil cihazda yapılan değişiklikler de webde görünmüyordu.
**Neden:** 
1. Mobil cihaz (Capacitor) native olarak derlendiğinde `window.location.hostname` `localhost` (veya `capacitor://localhost`) değerini döndürür. İletişim kütüphanelerinde (`syncQueue.ts`, `webSocketStore.ts    - Sunucudan gelen veri taze ve tamamen boşsa (`columns_config` yoksa) ve telefonun local verisi varsayılan (`DEFAULT_COLUMNS`) şemadan farklı (özelleştirilmiş) ise, sadece projeler yükleme durumu `isLoading === false` iken sunucuya migration yapıldı. Bu sayede sunucu verilerinin yerel default verilerle ezilmesi sorunu kökten çözüldü.
3. **`projectStore.ts` `syncQueue` Entegrasyonu:** Proje ekleme (`addProject`), silme (`deleteProject`) ve güncelleme (`updateProject`) işlemleri `syncQueue` (çevrimdışı işlem kuyruğu) ile entegre edildi. Telefon çevrimdışıyken veya API yavaşken optimistic update ile arayüze eklenen yeni kanban sütunlarının, API hatası sonrası catch bloğunda yerel veriyi eski haline (yeni sütunun olmadığı previousProjects listesine) geri yükleyip "ekrandan kendi kendine kaybolması" sorunu tamamen çözüldü.
4. **Backend Görev WebSocket Yayın Eksikliği:** `tasks.py` endpoint'lerindeki WebSocket eksikliği giderildi: `create_task`, `update_task` ve `update_task_status` fonksiyonlarına `new_task` ve `task_update` broadcast tetikleyicileri entegre edildi. Görev kartı eklendiğinde, sürüklendiğinde veya güncellendiğinde diğer tüm bağlı cihazlarda (bilgisayar, telefon) listenin anında ve eş zamanlı yenilenmesi (ışıklanması) sağlandı.

---

## 🛠 Sürüm 6.4 Ek Hata Çözümleri

### 1. Görev Kartı Detay Paneli React Hook Order Çökmesi
**Sorun:** Görev kartlarına tıklandığında detay paneli açılırken React Hook Order hatası (conditional hooks rendering) nedeniyle istemci tarafında uygulama donuyor veya çöküyordu.
**Neden:** `TaskDetailPanel.tsx` dosyasında, `statusConfig` memo kancası gibi kritik React kancaları, en tepedeki `if (!selectedTask || !isDetailPanelOpen) return null` early return ifadesinden sonra tanımlanıyordu. Bu durum kancaların bazı render'larda çağrılıp bazılarında çağrılmamasına sebep oluyordu.
**Çözüm:** `TaskDetailPanel.tsx` iki bileşene ayrıldı:
- Dış wrapper olan `TaskDetailPanel` sadece props ve store kontrolü yaparak early-return yönetir.
- `TaskDetailPanelContent` asıl içerik bileşeni olup tüm iç hook, state ve memo mantığını barındırır. Bu sayede hook order'ın değişmezliği garanti altına alınmıştır.

### 2. Kanban Sütun ve Görev Eylemlerinde Çoklu Tıklama (Duplicate Submit) Hataları
**Sorun:** Mobilde/Android'de kullanıcının "Sütun Ekle", "Ekle", "Görevi Kaydet" veya kartın kendisine hızlıca birkaç kez basması sonucunda mükerrer kayıtlar veya birden fazla detay paneli açılma anomalileri yaşanıyordu.
**Çözüm:**
- `KanbanBoard.tsx` butonlarına `savingColumn`, `savingQuickTaskColumnId`, `deletingColumnId` ve `renamingColumnId` loading state korumaları eklenerek istek sürerken butonlar disabled yapıldı ve spinner yerleştirildi.
- `TaskForm.tsx` form submit işlemindeki `addTask` çağrısı asenkron olarak `await` edilerek submit süresince form submit butonu korumaya alındı.
- `TaskCard.tsx` detay panel tetikleyicisine `isOpening` kilidi eklenerek detay panelinin çift tetiklenmesi önlendi.
- `taskStore.ts` üzerindeki geçici ID üretimi `Date.now() + Math.random()` ile milisaniyelik çakışmalara karşı güçlendirildi.
