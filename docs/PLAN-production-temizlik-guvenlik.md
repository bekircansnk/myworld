# 🔒 PLAN: Production Temizlik, Güvenlik & Kod Kalitesi Denetimi

> **Tarih:** 14 Mart 2026  
> **Durum:** Uygulama Canlı (Vercel + Render + Neon)  
> **Amaç:** Yayına alınmış My World uygulamasını güvenli, temiz ve SaaS-uyumlu hale getirmek.

---

## Faz 1: 🧹 Hardcoded "Bekir" İsimlerini Kaldır (SaaS Uyumu)

**Sorun:** Sistem eski "tek kullanıcı" döneminden kalan 17 yerde hala doğrudan "Bekir" veya "Bekircan" adını kullanıyor. Yeni kayıt olan başka bir kullanıcı da "Merhaba Bekir!" görecek.

| # | Dosya | Satır | Ne Yazıyor | Ne Olmalı |
|---|-------|-------|------------|-----------|
| 1 | `app/web/src/components/dashboard/DigitalClock.tsx` | 30 | `{greeting}, Bekir!` | `{greeting}, {user.username}!` |
| 2 | `app/web/src/components/ai-chat/AIChatDashboard.tsx` | 444 | `Merhaba Bekir! 👋` | `Merhaba {user?.username}! 👋` |
| 3 | `app/web/src/components/dashboard/DashboardHeader.tsx` | 57 | `{greeting}, Bekir` | `{greeting}, {user?.username}` |
| 4 | `app/web/src/components/dashboard/MorningScreen.tsx` | 41 | `Günaydın Bekir!` | `Günaydın {user?.username}!` |
| 5 | `app/web/src/components/dashboard/DashboardWidgets.tsx` | 300 | `{greeting}, Bekir` | `{greeting}, {user?.username}` |
| 6 | `app/web/src/components/dashboard/DashboardWidgets.tsx` | 392 | `Merhaba Bekir!` | `Merhaba {user?.username}!` |
| 7 | `app/web/src/components/chat/ChatWidget.tsx` | 222 | `Merhaba Bekir!` | `Merhaba {user?.username}!` |
| 8 | `app/web/src/components/calendar/CalendarPage.tsx` | 388 | `Merhaba Bekir! 👋` | `Merhaba {user?.username}! 👋` |
| 9 | `app/web/src/components/auth/LoginOverlay.tsx` | 86 | `placeholder="Örn: bekir"` | `placeholder="Kullanıcı adınız"` |
| 10 | `app/backend/app/ai/prompts.py` | 41 | `kullanıcıya (Bekircan)` | `kullanıcıya` |
| 11 | `app/backend/app/ai/prompts.py` | 47 | `Kullanıcı (Bekircan)` | `Kullanıcı` |
| 12 | `app/backend/app/routers/notes.py` | 197, 205 | `Bekircan sana...` | `Kullanıcı sana...` |
| 13 | `app/backend/app/services/proactive.py` | 33 | `Bekircan'a uygun` | `kullanıcıya uygun` |
| 14 | `app/backend/app/services/proactive.py` | 42 | `Günaydın Bekir!` | `Günaydın! Bugün harika...` |
| 15 | `app/backend/app/services/scheduler.py` | 14 | `Bekircan'ın uyanma` | Genel yorum |
| 16 | `data/seed/ai_personality.json` | 15 | `Günaydın Bekir!` | `Günaydın {user_name}!` |
| 17 | `app/backend/test_register.py` | 12 | `username="Bekircan"` | Dosya silinecek |

**Çözüm Stratejisi:**
- Frontend: Her bileşen zaten `useAuthStore` ile kullanıcı bilgisine erişebiliyor → `user?.username` kullan
- Backend AI Prompts: `personality.py` zaten `user_name` parametresi alıyor → `prompts.py` ve `notes.py`'deki sabit isimleri kaldır
- `proactive.py` ve `scheduler.py`: Kullanıcı adını DB'den dinamik çek

---

## Faz 2: 🔐 Güvenlik Denetimi & Sertleştirme

### 2.1 — KRİTİK (Hemen Yapılmalı)

| # | Sorun | Risk Seviyesi | Çözüm |
|---|-------|---------------|-------|
| 1 | **SECRET_KEY = `dev_secret_key_change_me_in_production`** | 🔴 YÜKSEK | Render Environment'a gerçek, rastgele, 64 karakterlik bir key gir. `.env`'deki değer sadece fallback. |
| 2 | **CORS: `allow_origins=["*"]`** | 🔴 YÜKSEK | Wildcard (*) kullanmak KESİN GÜVENLİK AÇIĞI. Sadece `settings.frontend_url` ve `http://localhost:3000` (dev) kalmalı. |
| 3 | **JWT Token 30 gün süreli** | 🟡 ORTA | Token `dependencies/auth.py` satır 29'da `timedelta(days=30)` olarak ayarlı. Bu çok uzun. 7 gün veya `.env`'deki 1440dk (1 gün) değeri kullanılmalı. |
| 4 | **Avatar dosyaları sunucu diskinde** | 🟡 ORTA | Render sunucusu her uyku-uyanma (spin-down) döngüsünde diske yazılan dosyaları siler. Avatar'lar kaybolur. Çözüm: Avatar'ı Base64 olarak DB'ye yaz veya harici depolama (Cloudinary/S3) kullan. |

### 2.2 — İYİLEŞTİRME (Planlanan)

| # | Sorun | Açıklama |
|---|-------|----------|
| 1 | **Rate Limiting yok** | Birisi `/api/chat` endpoint'ine saniyede 1000 istek atarak Gemini API kotanı eritebilir. `slowapi` paketi ile dakikada max 20 istek sınırı koy. |
| 2 | **Input Validation eksik** | Kullanıcı adı, not içeriği vb. için max uzunluk sınırı yok. SQL Injection riski düşük (SQLAlchemy korur) ama XSS riski var. |
| 3 | **API Key (.env'de açık)** | `.env` Git'e yüklenmiyor (.gitignore) ama Render/Vercel panellerindeki key'lerin düzenli rotasyonu planlanmalı. |

### 2.3 — Kullanıcı Verisi İzolasyonu (Zaten Yapılmış ✅)

| Kontrol | Durum |
|---------|-------|
| Her endpoint `current_user.id` filtreliyor | ✅ Güvenli |
| Şifreler bcrypt ile hash'leniyor | ✅ Güvenli |
| JWT token doğrulama her istekte çalışıyor | ✅ Güvenli |
| Veritabanı Neon SSL ile şifreli bağlantı | ✅ Güvenli |
| Bir kullanıcı başkasının verisine erişemiyor | ✅ Güvenli |

> **Sonuç:** Kullanıcı verileri temel düzeyde güvende. Kimse bir başkasının görevlerini, notlarını veya sohbetlerini göremiyor. Şifreler düz metin olarak saklanmıyor, bcrypt ile hash'leniyor.

---

## Faz 3: 🗑️ Yerel Geliştirme Artıklarını Temizle

Artık yerelde çalıştırmayacağın için bu dosya/klasörler gereksiz yük:

| # | Hedef | Eylem | Açıklama |
|---|-------|-------|----------|
| 1 | `app/backend/venv/` | `.silinecekler_cop_kutusu`'na taşı | ~200MB Python sanal ortamı. Render kendi bağımlılıklarını kuruyor, bu gereksiz. |
| 2 | `app/backend/test_register.py` | Sil (çöp kutusuna) | Test betiği, "Bekircan" hardcoded |
| 3 | `docker-compose.yml` | Sil (çöp kutusuna) | Yerel PostgreSQL/Redis konteyneri. Artık Neon kullanıyoruz. |
| 4 | `🚀 Sistemi Başlat.command` | Sil (çöp kutusuna) | Yerel başlatma betiği. Artık cloud'da. |
| 5 | `🛑 Sistemi Durdur.command` | Sil (çöp kutusuna) | Yerel durdurma betiği. |
| 6 | `scripts/` | İncele → gereksizse sil | Yerel yardımcı betikler |
| 7 | `data/seed/projects.json` | İncele → gereksizse sil | Seed data (initial projects) — yerel kurulum içindi |
| 8 | `arsiv/` | `.silinecekler_cop_kutusu`'na taşı | Eski faz-0 analiz dosyaları |
| 9 | `tema/` | İncele → gereksizse sil | Tema dosyaları (eğer kullanılmıyorsa) |
| 10 | `test_register.py` (kök) | Sil (çöp kutusuna) | Kök dizindeki test dosyası |
| 11 | `CleanShot 2026-03-13...jpg` | Sil (çöp kutusuna) | Ekran görüntüsü, gereksiz |
| 12 | `netlify.toml` | Sil (çöp kutusuna) | Artık Netlify kullanmıyoruz, Vercel'deyiz |
| 13 | `app/backend/uploads/` | İncele, gerekirse sil | Yerel avatar yüklemeleri |

> ⚠️ **KURAL:** Hiçbir dosya `rm` ile kalıcı silinmez. Hepsi `.silinecekler_cop_kutusu/` altına taşınır.

---

## Faz 4: 🔄 CalendarStore Frontend-Backend Uyumsuzluğu

**Sorun:** Frontend `CalendarEvent` tipi (`date`, `startTime`, `endTime`, `color`) ile Backend şeması (`start_time`, `end_time`, `event_type`) birbirine uymuyor. Bu yüzden hem manuel hem AI takvim etkinlik ekleme çalışmıyor.

> ⚠️ **NOT:** Daha önceki tamirimi kullanıcı yanlışlıkla editörden geri aldı (Auto-Save). Bu düzeltmenin tekrar yapılması gerekiyor.

**Çözüm:** Backend'de bir `convert_to_response()` adaptör fonksiyonu yazarak DB modelini Frontend formatına çevir. Frontend'e hiç dokunmadan backend tarafında çözülür.

---

## Faz 5: 📋 .gitignore & Git Temizliği

| # | Eklenecek Kural | Neden |
|---|----------------|-------|
| 1 | `app/backend/uploads/*` `!app/backend/uploads/.gitkeep` | Avatar dosyaları Git'e yüklenmemeli |
| 2 | `*.db` `*.sqlite3` | Yerel veritabanı dosyaları |
| 3 | `.env.production` | Production secret'lar asla Git'e gitmemeli |
| 4 | `*.command` | macOS betikleri |

---

## Checklist — İş Sırası

### 🔴 Kritik (Bugün)
- [ ] Faz 2.1: SECRET_KEY'i Render env'de güçlü bir key ile değiştir
- [ ] Faz 2.1: CORS wildcard'ı kaldır, sadece Vercel URL'ini izin ver
- [ ] Faz 1: 17 adet "Bekir/Bekircan" referansını kaldır, dinamik kullanıcı adıyla değiştir
- [ ] Faz 4: Calendar Backend-Frontend uyumunu tekrar yap

### 🟡 Önemli (Bu Hafta)
- [ ] Faz 2.1: JWT token süresini makul bir değere düşür
- [ ] Faz 2.2: Rate limiting ekle (slowapi)
- [ ] Faz 2.1: Avatar depolama stratejisini değiştir (Base64 DB veya Cloudinary)
- [ ] Faz 3: Yerel geliştirme artıklarını temizle (venv, docker, scripts, arsiv)

### 🟢 İyileştirme (Gelecek Hafta)
- [ ] Faz 5: .gitignore güncellemesi
- [ ] Faz 2.2: Input validation & sanitization
- [ ] Genel kod kalitesi taraması

---

## Doğrulama Planı

### Otomatik Testler
- `grep -rn "Bekir\|Bekircan" app/` komutuyla 0 sonuç döndüğünü doğrula
- `grep -rn "localhost" app/web/src/ app/backend/app/` çıktısında sadece fallback (||) kalıpları olmalı

### Manuel Doğrulama
- Yeni bir kullanıcıyla kayıt ol → Dashboard'da kendi adının göründüğünü doğrula
- AI Chat'te "Merhaba" yaz → Kendi adınla hitap ettiğini doğrula
- Takvime etkinlik ekle → Doğru görüntülendiğini doğrula
- Profil fotoğrafı yükle → Bozuk görünmediğini doğrula
