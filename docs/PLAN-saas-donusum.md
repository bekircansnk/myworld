# 🚀 PLAN: My World SaaS Dönüşümü

**Tarih:** 13 Mart 2026  
**Amaç:** Mevcut tek kullanıcılı "My World" uygulamasını, çok kullanıcılı bir SaaS uygulamasına dönüştürmek.  
**Hedef Kitle:** Kendi çevrenizdeki insanlar (sınırlı sayıda kullanıcı).

---

## 📋 ÖZET

Bu plan, aşağıdaki ana hedefleri kapsar:

1. **Basit Kullanıcı Giriş Sistemi** — Kullanıcı adı + şifre ile kayıt/giriş
2. **Kalıcı Oturum** — Tarayıcı açıkken otomatik giriş (Remember Me)
3. **Profil Yönetimi** — Kullanıcı adı, şifre ve profil resmi değiştirme
4. **Veri İzolasyonu** — Her kullanıcı sadece kendi verilerini görür
5. **AI Kişilik Genelleştirme** — Kişisel rapor yerine genel bir davranış rehberi
6. **API Anahtarı Gizleme** — Gemini API key sunucu tarafında kalır, kullanıcıya açılmaz
7. **Login Overlay** — Dashboard arka planda gözükür, önde giriş kutusu çıkar

---

## 🏗️ PHASE 1: Backend — Auth Sistemi (Temel)

### 1.1 User Modeli Güncelleme

**Dosya:** `app/backend/app/models/user.py`

Mevcut `users` tablosuna aşağıdaki değişiklikler:

```diff
- email = Column(String, unique=True, index=True, nullable=False)
+ username = Column(String(50), unique=True, index=True, nullable=False)
+ password_hash = Column(String(255), nullable=False)
+ avatar_url = Column(String, nullable=True, default=None)
```

- `email` alanı kaldırılıp `username` eklenir (benzersiz, zorunlu)
- `password_hash` alanı eklenir (bcrypt ile hashlenmiş şifre)
- `avatar_url` zaten var, profil resmi için kullanılır

### 1.2 Auth Schemas

**Dosya:** `app/backend/app/schemas/auth.py` [YENİ]

```python
class UserRegister(BaseModel):
    username: str  # min 3, max 50 karakter
    password: str  # min 4 karakter

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    avatar_url: str | None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProfileUpdate(BaseModel):
    username: str | None = None
    password: str | None = None
    name: str | None = None
    avatar_url: str | None = None
```

### 1.3 Auth Router

**Dosya:** `app/backend/app/routers/auth.py` [YENİ]

| Endpoint | Metot | Açıklama |
|----------|-------|----------|
| `/api/auth/register` | POST | Yeni kullanıcı kaydı (username + password) |
| `/api/auth/login` | POST | Giriş yap → JWT token döndür |
| `/api/auth/me` | GET | Token ile mevcut kullanıcı bilgisini getir |
| `/api/auth/profile` | PUT | Profil güncelle (username, password, avatar_url) |
| `/api/auth/upload-avatar` | POST | Profil resmi yükleme |

**Teknik Detaylar:**
- Şifre hashleme: `passlib[bcrypt]`
- Token: `python-jose[cryptography]` ile JWT
- Token süresi: 30 gün (uzun süreli oturum için)
- Token payload: `{"sub": user_id, "username": username, "exp": ...}`

### 1.4 Auth Dependency (get_current_user)

**Dosya:** `app/backend/app/dependencies/auth.py` [YENİ]

```python
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    # JWT token'ı decode et
    # user_id'yi al
    # DB'den kullanıcıyı çek
    # Kullanıcıyı döndür (veya 401 hatası)
```

Bu dependency tüm mevcut router'lardaki `MOCK_USER_ID = 1` satırlarının yerine geçecek.

### 1.5 Profil Resmi Depolama

- Profil resimleri `app/backend/uploads/avatars/` klasörüne kaydedilir
- Dosya adı: `{user_id}_{timestamp}.{ext}`
- FastAPI StaticFiles ile serve edilir: `/uploads/avatars/...`
- Varsayılan profil resmi: İlk harfle oluşturulan avatar (frontend tarafında)

---

## 🏗️ PHASE 2: Backend — MOCK_USER_ID Temizliği

### 2.1 Tüm Router'larda Değişiklik

Aşağıdaki dosyalardaki `MOCK_USER_ID = 1` satırları kaldırılacak ve `get_current_user` dependency'si eklenecek:

| Dosya | Mevcut Kullanım |
|-------|----------------|
| `routers/tasks.py` | ~15 yerde MOCK_USER_ID |
| `routers/projects.py` | ~5 yerde |
| `routers/notes.py` | ~6 yerde |
| `routers/timer.py` | ~4 yerde |
| `routers/reports.py` | ~3 yerde |
| `routers/telegram.py` | ~5 yerde |
| `routers/ai.py` | AI chat için user_id |
| `services/report_service.py` | ~3 yerde |
| `services/memory_service.py` | ~6 yerde |
| `services/proactive.py` | ~4 yerde |

**Değişiklik Paterni:**
```python
# ÖNCESİ:
MOCK_USER_ID = 1

@router.get("/tasks")
async def get_tasks(db: AsyncSession = Depends(get_db)):
    query = select(Task).where(Task.user_id == MOCK_USER_ID)

# SONRASI:
from app.dependencies.auth import get_current_user

@router.get("/tasks")
async def get_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Task).where(Task.user_id == current_user.id)
```

### 2.2 AI Context'te User Bilgisi

**Dosya:** `app/backend/app/ai/context.py`

AI'ya gönderilen bağlam artık `user_id` parametresi alacak:
```python
async def build_system_context(db: AsyncSession, user_id: int) -> str:
```

---

## 🏗️ PHASE 3: AI Kişilik Genelleştirme

### 3.1 Genel Değerlendirme Raporu

**Dosya:** `docs/genel-kullanici-rehberi.md` [YENİ]

Mevcut `07-nihai-kisisel-analiz-raporu.md` dosyasından **kişisel bilgiler çıkarılarak** genel bir versiyon oluşturulacak. Kişiye özel isim, tarih, müşteri bilgileri vs. kaldırılacak. Genel kullanıcı profili şöyle olacak:

**Hedef Kullanıcı Profili:**
- Dijital çağda yaşayan, birden fazla projeyi yönetmeye çalışan bireyler
- Odaklanma zorluğu yaşayan, yapı ve planlama desteğine ihtiyaç duyan kişiler
- Kendi işini kuran veya serbest çalışan profesyoneller/girişimciler
- Motivasyon ve üretkenlik konusunda destek arayan herkes

**Genelleştirilen Konular:**
- Prokrastinasyon döngüsü → Genel bilişsel kalıp olarak açıklanır
- Dopamin yönetimi → Herkes için geçerli dikkat ekonomisi
- Hiperfokus-çöküş döngüsü → Yaygın çalışma paterni
- Motivasyon formülü → Evrensel motivasyon ilkeleri
- Çevresel yapı ihtiyacı → Herkes için geçerli verimlilik prensibi

### 3.2 AI Personality Güncelleme

**Dosya:** `app/backend/app/ai/personality.py`

```python
def get_personality_instruction() -> str:
    # Artık kişisel rapor yerine genel rehberi oku
    # "Bekircan" yerine genel ifadeler kullan
    # Kullanıcı adını dinamik olarak system prompt'a ekle
```

**Dosya:** `data/seed/ai_personality.json`

```diff
- "morning": "Günaydın Bekir! ☀️ Bugün harika şeyler yapabilirsin."
+ "morning": "Günaydın! ☀️ Bugün harika şeyler yapabilirsin."
```

Tüm "Bekir" / "Bekircan" referansları kaldırılır, kullanıcı adı dinamik olarak eklenir.

### 3.3 Eski Kişisel Rapor

`docs/07-nihai-kisisel-analiz-raporu.md` dosyası **silinmez**, sadece AI artık bunu okumaz. Yerine genel versiyonu okur.

---

## 🏗️ PHASE 4: Frontend — Login/Register UI

### 4.1 Auth Store

**Dosya:** `app/frontend/src/stores/authStore.ts` [YENİ]

```typescript
interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    
    login: (username: string, password: string) => Promise<void>
    register: (username: string, password: string) => Promise<void>
    logout: () => void
    checkAuth: () => Promise<void>
    updateProfile: (data: ProfileUpdate) => Promise<void>
}
```

- Token `localStorage`'da saklanır → sayfa yenilense de giriş kalır
- `checkAuth()` → Sayfa açılışında token'la `/api/auth/me` çağrılır
- Otomatik giriş: Token geçerliyse direkt dashboard açılır

### 4.2 Login Overlay Bileşeni

**Dosya:** `app/frontend/src/components/auth/LoginOverlay.tsx` [YENİ]

**Tasarım:**
- Arka planda dashboard bulanık (blur) olarak gözükür
- Ortada glassmorphism login kutusu
- İki mod: **Giriş Yap** / **Kayıt Ol** (toggle)
- Giriş: username + password + "Giriş Yap" butonu
- Kayıt: username + password + "Hesap Oluştur" butonu
- Hata mesajları kutu içinde gösterilir
- Onay mekanizması YOK — doğrudan kayıt ve giriş

### 4.3 Profil Ayarları

**Dosya:** `app/frontend/src/components/auth/ProfileSettings.tsx` [YENİ]

TopNavbar'daki profil ikonuna tıklanınca açılan dropdown'da "Profil Ayarları" seçeneği:

- Kullanıcı adı değiştirme (input)
- Şifre değiştirme (input)
- Profil resmi değiştirme (dosya yükleme alanı)
- "Kaydet" butonu → Onay mekanizması yok, direkt kaydeder
- Varsayılan profil resmi: Kullanıcı adının ilk harfiyle renkli daire

### 4.4 Ana Sayfa Entegrasyonu

**Dosya:** `app/frontend/src/app/page.tsx`

```typescript
// Sayfa yüklendiğinde:
// 1. authStore.checkAuth() çağır
// 2. Eğer authenticated değilse → LoginOverlay göster
// 3. Eğer authenticated ise → Normal dashboard göster
```

### 4.5 API Interceptor Güncelleme

**Dosya:** `app/frontend/src/lib/api.ts`

Mevcut token interceptor zaten var, şu değişiklikler:
- 401 hatası gelirse → authStore.logout() çağır → Login overlay göster
- Token her request'e otomatik eklenir (bu zaten mevcut)

---

## 🏗️ PHASE 5: Veri İzolasyonu Doğrulaması

### 5.1 Zaten Mevcut Yapı

Veritabanı şeması zaten `user_id` FK ile tasarlanmış:
- `projects.user_id` → FK → users
- `tasks.user_id` → FK → users
- `notes.user_id` → FK → users
- `timer_sessions.user_id` → FK → users
- `ai_memory.user_id` → FK → users
- `daily_reports.user_id` → FK → users

Bu yapı sayesinde, MOCK_USER_ID yerine `current_user.id` kullanıldığında veri izolasyonu **otomatik olarak sağlanır.**

### 5.2 Calendar Events (localStorage)

Mevcut takvim etkinlikleri `localStorage`'da persist ediliyor (`calendarStore`). Bu SaaS'ta sorun yaratır çünkü farklı kullanıcılar aynı tarayıcıda farklı veriler görmeli.

**Çözüm:**
- CalendarStore'un persist key'ini `myworld-calendar-{userId}` olarak değiştir
- Login/logout sırasında store'u temizle/yükle

### 5.3 Chat Geçmişi

Mevcut chat geçmişi sayfa yenilenince kayboluyor. SaaS versiyonunda chat geçmişi de kullanıcıya özel DB'de saklanmalı.

> **NOT:** ARCHITECTURE.md'de `ChatMessage` modelinden bahsedilmiş ve `memory_service.py`'de `ChatMessage` kullanılıyor. Bu zaten kısmen mevcut — sadece `user_id` filtresiyle çalışması sağlanacak.

---

## 🏗️ PHASE 6: API Anahtarı Güvenliği

### 6.1 Mevcut Durum ✅

Gemini API key zaten `.env` dosyasında ve sadece backend tarafında kullanılıyor. Frontend'den API key'e erişim yok. Bu yapı SaaS için zaten uygun.

### 6.2 Ek Güvenlik

- `.env` dosyası production'da environment variable olarak set edilecek
- CORS ayarları production domain ile sınırlandırılacak
- Rate limiting eklenebilir (opsiyonel, ileride)

---

## 🏗️ PHASE 7: Veritabanı Migration

### 7.1 Alembic Migration

```sql
-- users tablosunu güncelle
ALTER TABLE users DROP COLUMN email;
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL;
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL;

-- Mevcut user kaydını güncelle (Bekircan)
UPDATE users SET username = 'bekir', password_hash = '<bcrypt_hash>' WHERE id = 1;
```

### 7.2 İlk Kullanıcı Seed

Mevcut `id=1` kullanıcısı (Bekircan) otomatik olarak `username: bekir` olarak güncellenir. Mevcut tüm veriler korunur.

---

## 📊 TOPLAM DEĞİŞİKLİK ÖZETİ

| Kategori | Yeni Dosya | Değişen Dosya |
|----------|-----------|--------------|
| Backend Models | — | `user.py` |
| Backend Schemas | `auth.py` | — |
| Backend Routers | `auth.py` | `tasks.py`, `projects.py`, `notes.py`, `timer.py`, `reports.py`, `telegram.py`, `ai.py` |
| Backend Dependencies | `auth.py` | — |
| Backend Services | — | `memory_service.py`, `report_service.py`, `proactive.py` |
| Backend AI | — | `personality.py`, `context.py` |
| Backend Config | — | `main.py`, `config.py` |
| Frontend Stores | `authStore.ts` | `calendarStore.ts` |
| Frontend Components | `LoginOverlay.tsx`, `ProfileSettings.tsx` | `page.tsx`, `TopNavbar.tsx` |
| Frontend Lib | — | `api.ts` |
| Docs | `genel-kullanici-rehberi.md` | — |
| Data | — | `ai_personality.json` |
| Migration | Alembic migration | — |
| Backend Deps | `requirements.txt` güncelleme | `passlib`, `python-jose`, `bcrypt` |

---

## 🔍 DOĞRULAMA PLANI

### Otomatik Testler

Projede mevcut test altyapısı yok. Aşağıdaki manuel testler yapılacak:

### Manuel Doğrulama Adımları

1. **Kayıt Testi:**
   - Tarayıcıda uygulamayı aç
   - Login overlay'in göründüğünü kontrol et
   - Yeni bir kullanıcı adı ve şifre ile kayıt ol
   - Başarılı kayıt sonrası dashboard'a yönlendirildiğini kontrol et

2. **Giriş Testi:**
   - Çıkış yap
   - Aynı kullanıcı adı ve şifreyle giriş yap
   - Dashboard'un açıldığını kontrol et

3. **Kalıcı Oturum Testi:**
   - Giriş yaptıktan sonra tarayıcıyı kapat
   - Tekrar aç → Otomatik giriş yapılmalı (login overlay gözükmemeli)

4. **Veri İzolasyonu Testi:**
   - Kullanıcı A ile giriş yap → Görev ekle
   - Çıkış yap → Kullanıcı B ile yeni hesap oluştur
   - Kullanıcı B'nin boş bir dashboard görmesini kontrol et (A'nın görevleri gözükmemeli)
   - Kullanıcı B bir görev ekle
   - Çıkış yap → Kullanıcı A ile giriş yap → Sadece A'nın görevlerinin göründüğünü kontrol et

5. **Profil Ayarları Testi:**
   - Sağ üst profil → Profil Ayarları
   - Kullanıcı adını değiştir → Kaydet → Yeni adla giriş yapılabildiğini kontrol et
   - Şifreyi değiştir → Kaydet → Yeni şifreyle giriş yapılabildiğini kontrol et
   - Profil resmi yükle → Navbar'da göründüğünü kontrol et

6. **AI Chat Testi:**
   - AI ile sohbet et → Kişisel isim yerine genel ifadeler kullanıldığını kontrol et
   - Görev oluştur → Doğru kullanıcıya atandığını kontrol et

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Admin paneli YOK** — İstek doğrultusunda admin paneli oluşturulmayacak
2. **Mail entegrasyonu YOK** — Şifre sıfırlama mail ile yapılamaz, profil ayarlarından değiştirilir
3. **Onay mekanizması YOK** — Kayıt, profil değişikliği vs. için onay istenmez
4. **API key gömülü** — Gemini API key sunucu tarafında kalır, kullanıcılara açılmaz
5. **Mevcut veriler korunur** — Bekircan'ın tüm görev/not/proje verileri `id=1` kullanıcısında kalır
6. **Eski kişisel rapor silinmez** — Sadece AI artık onu referans almaz

---

## 🎯 UYGULAMA SIRASI

```
Phase 1 → Phase 7 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
(Auth)   (Migration) (Temizlik) (AI)     (Frontend)  (Test)    (Güvenlik)
```

Önce backend auth altyapısı kurulur, migration yapılır, sonra tüm router'lar güncellenir, AI genelleştirilir, en son frontend login UI eklenir ve test edilir.

---

**[ONAY BEKLENİYOR]** Bu planı inceleyip onayladıktan sonra kodlamaya başlayabiliriz.
