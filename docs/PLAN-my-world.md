# 🌍 My World — Kapsamlı Proje Geliştirme Planı

**Proje Adı:** My World — Kişisel Yapay Zeka Destekli Yaşam ve İş Yönetim Sistemi
**Tarih:** 11 Mart 2026
**Durum:** 📋 PLANLAMA (Geliştirmeye henüz başlanmadı)

---

## 📌 PROJE ÖZETİ

**My World**, Bekircan Sağanak'ın günlük yaşamını, iş süreçlerini, motivasyonunu ve kişisel gelişimini yönetmek için tamamen kişiselleştirilmiş, yapay zeka destekli kapsamlı bir yaşam orkestratörü uygulamasıdır.

**Temel Felsefe:** Sadece bir "yapılacaklar listesi" değil — kullanıcıyı tanıyan, davranışlarını analiz eden, onun adına düşünen, planlayan, motive eden ve takip eden akıllı bir yaşam arkadaşı.

**Nihai Hedef:** Önce kişisel kullanım için mükemmel hale getirmek, sonra genelleştirerek SaaS ürününe dönüştürmek.

---

## 🏗️ MİMARİ TASARIM

### Sistem Genel Bakış

```
┌─────────────────────────────────────────────────────────────┐
│                    KULLANICI KATMANI                        │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Web App  │  │ Mobil (PWA)  │  │ Telegram Bot          │ │
│  │ (Next.js)│  │ (Responsive) │  │ (python-telegram-bot) │ │
│  └────┬─────┘  └──────┬───────┘  └───────────┬───────────┘ │
│       │               │                      │             │
├───────┴───────────────┴──────────────────────┴─────────────┤
│                    API GATEWAY (CORS + Auth)                │
├────────────────────────────────────────────────────────────┤
│                    BACKEND KATMANI                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              FastAPI (Python)                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │  Auth    │ │  Tasks   │ │  Notes   │ │ Reports│  │  │
│  │  │  Service │ │  Service │ │  Service │ │ Service│  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐  │  │
│  │  │Scheduler │ │  Notif.  │ │  AI Engine (Gemini)  │  │  │
│  │  │ Service  │ │  Service │ │  Context + Memory    │  │  │
│  │  └──────────┘ └──────────┘ └──────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│                    VERİ KATMANI                             │
│  ┌────────────┐  ┌───────┐  ┌──────────────────────────┐  │
│  │ PostgreSQL │  │ Redis │  │ n8n (Otomasyon Motoru)   │  │
│  │ (Ana DB)   │  │ Cache │  │ (Mevcut sunucu)         │  │
│  └────────────┘  └───────┘  └──────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 🔧 TEKNOLOJİ YIĞINI (TECH STACK)

| Katman | Teknoloji | Versiyon | Gerekçe |
|--------|-----------|----------|---------|
| **Frontend** | Next.js (App Router) | 15+ | SSR + CSR hibrit, canlı dashboard desteği |
| **UI Kütüphanesi** | React + Radix UI | 19+ | Erişilebilir, temiz bileşenler |
| **Stil** | Tailwind CSS | 4+ | Hızlı, tutarlı tasarım sistemi |
| **Gerçek Zamanlı** | Socket.IO | 4+ | Dashboard canlılığı, bildirimler |
| **Backend** | Python FastAPI | 0.115+ | Yüksek performans, async, AI integration kolaylığı |
| **ORM** | SQLAlchemy + Alembic | 2+ | Tip güvenli veritabanı, migration yönetimi |
| **Veritabanı** | PostgreSQL | 16+ | Güçlü JSON desteği, full-text arama |
| **Önbellek** | Redis | 7+ | Oturum, anlık veriler, rate limiting |
| **AI Motoru** | Google Gemini 2.0 Flash | - | Hızlı, düşük maliyet, yüksek kalite |
| **Otomasyon** | n8n | Mevcut | Zamanlanmış görevler, webhook tetikleyiciler |
| **Bot** | python-telegram-bot | 21+ | Telegram entegrasyonu |
| **Kimlik Doğrulama** | JWT + API Key | - | Basit, yerel ortam için yeterli |
| **Görev Zamanlayıcı** | APScheduler / Celery | - | Cron benzeri tetikleyiciler |

---

## 📁 PROJE KLASÖR YAPISI

```
2-My-World/
├── README.md                        # Proje ana açıklaması
│
├── docs/                            # Aktif dokümanlar
│   ├── PLAN-my-world.md            # Bu plan dokümanı
│   └── 07-nihai-kisisel-analiz-raporu.md  # AI kişilik referansı
│
├── arsiv/                           # Tamamlanmış faz dokümanları
│   └── faz-0-kisisel-analiz/       # Faz 0 çıktıları (arşiv)
│       ├── 01-kisisel-analiz-ve-profil.md
│       ├── 02-uygulama-fikri-ve-teknik-vizyon.md
│       ├── 03-psikolojik-degerlendirme-soru-kilavuzu.md
│       ├── 04-proje-yol-haritasi.md
│       └── 05-soru-cevaplari.md
│
├── app/                             # Uygulama kaynak kodu
│   ├── frontend/                    # Next.js uygulaması
│   │   ├── src/
│   │   │   ├── app/                # App Router sayfaları
│   │   │   │   ├── (auth)/         # Giriş/kayıt sayfaları
│   │   │   │   ├── dashboard/      # Ana dashboard
│   │   │   │   ├── tasks/          # Görev yönetimi
│   │   │   │   ├── notes/          # Not sistemi
│   │   │   │   ├── reports/        # Raporlar
│   │   │   │   ├── settings/       # Ayarlar
│   │   │   │   ├── layout.tsx      # Ana layout
│   │   │   │   └── page.tsx        # Ana sayfa
│   │   │   ├── components/         # Yeniden kullanılabilir bileşenler
│   │   │   │   ├── ui/            # Temel UI bileşenleri
│   │   │   │   ├── dashboard/     # Dashboard widget'ları
│   │   │   │   ├── tasks/         # Görev bileşenleri
│   │   │   │   ├── chat/          # AI sohbet bileşenleri
│   │   │   │   ├── timer/         # Zamanlayıcı bileşenleri
│   │   │   │   └── layout/        # Layout bileşenleri
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   ├── lib/               # Yardımcı fonksiyonlar
│   │   │   │   ├── api.ts         # API client
│   │   │   │   ├── socket.ts      # WebSocket client
│   │   │   │   └── utils.ts       # Genel yardımcılar
│   │   │   ├── stores/            # Zustand state yönetimi
│   │   │   ├── types/             # TypeScript tipleri
│   │   │   └── styles/            # Global stiller
│   │   ├── public/                # Statik dosyalar
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── backend/                    # FastAPI uygulaması
│   │   ├── app/
│   │   │   ├── main.py            # FastAPI ana giriş noktası
│   │   │   ├── config.py          # Yapılandırma (env değişkenleri)
│   │   │   ├── database.py        # Veritabanı bağlantısı
│   │   │   ├── models/            # SQLAlchemy modelleri
│   │   │   │   ├── user.py
│   │   │   │   ├── task.py
│   │   │   │   ├── note.py
│   │   │   │   ├── project.py
│   │   │   │   ├── timer_session.py
│   │   │   │   ├── notification.py
│   │   │   │   └── report.py
│   │   │   ├── schemas/           # Pydantic şemaları (giriş/çıkış)
│   │   │   │   ├── task.py
│   │   │   │   ├── note.py
│   │   │   │   ├── project.py
│   │   │   │   └── report.py
│   │   │   ├── routers/           # API endpoint'leri
│   │   │   │   ├── auth.py
│   │   │   │   ├── tasks.py
│   │   │   │   ├── notes.py
│   │   │   │   ├── projects.py
│   │   │   │   ├── timer.py
│   │   │   │   ├── reports.py
│   │   │   │   ├── ai.py
│   │   │   │   └── notifications.py
│   │   │   ├── services/          # İş mantığı katmanı
│   │   │   │   ├── ai_engine.py   # Gemini AI entegrasyonu
│   │   │   │   ├── task_service.py
│   │   │   │   ├── note_service.py
│   │   │   │   ├── report_service.py
│   │   │   │   ├── notification_service.py
│   │   │   │   └── scheduler_service.py
│   │   │   ├── ai/                # Yapay zeka modülleri
│   │   │   │   ├── prompts.py     # Sistem prompt'ları
│   │   │   │   ├── context.py     # Bağlam yönetimi
│   │   │   │   ├── memory.py      # Uzun süreli hafıza
│   │   │   │   └── personality.py # AI kişilik tanımları
│   │   │   └── utils/             # Yardımcı araçlar
│   │   │       ├── security.py
│   │   │       └── helpers.py
│   │   ├── alembic/               # Veritabanı migration'ları
│   │   ├── tests/                 # Backend testleri
│   │   ├── alembic.ini
│   │   ├── requirements.txt
│   │   └── .env.example
│   │
│   └── bot/                       # Telegram Bot
│       ├── bot.py                 # Ana bot dosyası
│       ├── handlers/              # Komut ve mesaj handler'ları
│       │   ├── start.py
│       │   ├── tasks.py
│       │   ├── notes.py
│       │   └── reports.py
│       ├── keyboards/             # Telegram klavye düzenleri
│       ├── services/              # Bot servisleri
│       │   └── api_client.py      # Backend API client
│       ├── config.py
│       ├── requirements.txt
│       └── .env.example
│
├── design/                        # Tasarım dosyaları
│   ├── wireframes/               # Ekran taslakları
│   └── references/               # İlham kaynakları
│
├── data/                          # Veritabanı seed verileri
│   └── seed/
│       ├── projects.json         # Başlangıç projeleri (Venüs, Kazador vb.)
│       └── ai_personality.json   # AI kişilik yapılandırması
│
├── scripts/                       # Yardımcı scriptler
│   ├── setup.sh                  # Projeyi kurma scripti
│   ├── dev.sh                    # Geliştirme ortamı başlatma
│   └── seed.py                   # Veritabanı seed scripti
│
├── docker-compose.yml             # Yerel geliştirme için (PostgreSQL + Redis)
├── .gitignore
└── .env.example                   # Ortam değişkenleri şablonu
```

---

# 🚀 GELİŞTİRME FAZLARI

Her faz kendi içinde bölümlere ayrılmış görevler içerir. Her bölüm, sorumlu modül ve tahmini süreyi belirtir.

---

## FAZ 1: ALTYAPI VE TEMEL KURULUM
**Tahmini Süre:** 3-5 gün
**Hedef:** Geliştirme ortamını kurup tüm servislerin birbirleriyle iletişim kurabilmesini sağlamak.

### 1.1 — Geliştirme Ortamı Hazırlığı
| Görev | Modül | Detay |
|-------|-------|-------|
| Docker Compose dosyası oluşturma | DevOps | PostgreSQL 16 + Redis 7 konteynerları |
| `.env` dosyaları oluşturma | Config | Tüm API anahtarları, DB bağlantıları, gizli değerler |
| Git repository başlatma | DevOps | `.gitignore`, ilk commit |
| `setup.sh` scripti yazma | Scripts | Tek komutla her şeyi kuran script |

### 1.2 — Backend Temel Yapısı
| Görev | Modül | Detay |
|-------|-------|-------|
| FastAPI projesi başlatma | Backend | `main.py`, CORS, middleware yapılandırması |
| Veritabanı bağlantısı kurma | Backend | SQLAlchemy async engine, session yönetimi |
| Alembic migration sistemi | Backend | İlk migration, otomatik şema oluşturma |
| Temel model tanımları | Backend/Models | User, Project, Task, Note modelleri |
| Sağlık kontrolü endpoint'i | Backend/Router | `GET /api/health` — sistem durumu kontrolü |
| Hata yönetimi (Error Handler) | Backend | Global exception handler, standart hata formatı |
| Loglama sistemi | Backend | Yapılandırılmış loglama (structlog) |

### 1.3 — Frontend Temel Yapısı
| Görev | Modül | Detay |
|-------|-------|-------|
| Next.js projesi başlatma | Frontend | App Router, TypeScript, Tailwind CSS |
| Tasarım sistemi kurulumu | Frontend/UI | Renk paleti, tipografi, boşluklar, bileşen temeli |
| API Client oluşturma | Frontend/Lib | Axios/fetch sarmalayıcı, hata yönetimi, interceptor |
| Layout yapısı | Frontend/Layout | Sidebar, header, ana içerik alanı |
| Tema desteği (Karanlık Mod) | Frontend | CSS değişkenleri ile tema geçişi |

### 1.4 — Veritabanı Şeması (İlk Sürüm)
```sql
-- Kullanıcılar
users (id, email, name, avatar_url, settings JSONB, created_at)

-- Projeler / Firmalar
projects (id, user_id, name, color, icon, description, is_active, sort_order, created_at)

-- Görevler
tasks (id, user_id, project_id, title, description, priority, status,
       due_date, estimated_minutes, actual_minutes, ai_category,
       ai_suggested_priority, parent_task_id, sort_order, created_at, completed_at)

-- Alt Görevler (Self-referencing)
-- tasks tablosu parent_task_id ile kendi kendine referans verir

-- Notlar
notes (id, user_id, project_id, content, ai_category, ai_tags JSONB,
       source, created_at, updated_at)

-- Zamanlayıcı Oturumları
timer_sessions (id, user_id, task_id, start_time, end_time,
                duration_minutes, break_type, notes, created_at)

-- Bildirimler
notifications (id, user_id, type, title, message, is_read,
               action_url, scheduled_at, sent_at, created_at)

-- AI Hafıza
ai_memory (id, user_id, memory_type, content JSONB, summary,
           importance_score, created_at, expires_at)

-- Günlük Raporlar
daily_reports (id, user_id, report_date, tasks_completed, tasks_added,
              total_work_minutes, ai_summary, mood_score, created_at)

-- Haftalık Raporlar
weekly_reports (id, user_id, week_start, week_end, tasks_completed,
               total_work_hours, productivity_score, ai_analysis, created_at)
```

**🔑 Başarı Kriterleri (Faz 1):**
- [ ] `docker-compose up` ile PostgreSQL ve Redis ayağa kalkıyor
- [ ] Backend `http://localhost:8000/api/health` yanıt veriyor
- [ ] Frontend `http://localhost:3000` açılıyor
- [ ] Veritabanı migration'ları sorunsuz çalışıyor
- [ ] Frontend'den backend'e API çağrısı yapılabiliyor

---

## FAZ 2: GÖREV YÖNETİM SİSTEMİ (CORE)
**Tahmini Süre:** 5-7 gün
**Hedef:** Temel görev ekleme, düzenleme, tamamlama ve firma bazlı filtreleme.

### 2.1 — Backend: Görev API'leri
| Görev | Endpoint | Detay |
|-------|----------|-------|
| Proje CRUD | `POST/GET/PUT/DELETE /api/projects` | Firma/proje oluşturma ve yönetimi |
| Görev CRUD | `POST/GET/PUT/DELETE /api/tasks` | Tam CRUD operasyonları |
| Görev filtreleme | `GET /api/tasks?project=X&status=Y` | Firma, durum, tarih filtreleri |
| Görev durumu güncelleme | `PATCH /api/tasks/{id}/status` | Yapılacak → Devam → Tamamlandı |
| Alt görev yönetimi | `POST /api/tasks/{id}/subtasks` | Alt görev ekleme/listeleme |
| Görev sıralama | `PUT /api/tasks/reorder` | Sürükle-bırak sıralama |
| Toplu işlem | `POST /api/tasks/bulk` | Çoklu görev güncelleme |

### 2.2 — Frontend: Görev Arayüzü
| Görev | Bileşen | Detay |
|-------|---------|-------|
| Görev listesi sayfası | `TaskListPage` | Kanban veya liste görünümü |
| Görev kartı bileşeni | `TaskCard` | Renk kodlu, öncelikli, sürüklenebilir |
| Görev ekleme modalı | `TaskCreateModal` | Hızlı ekleme formu |
| Görev detay paneli | `TaskDetailPanel` | Sağdan açılan detay paneli |
| Proje/firma seçici | `ProjectSelector` | Firma bazlı filtreleme |
| Durum değiştirme | `StatusToggle` | Tek tıkla durum geçişi |
| Öncelik göstergesi | `PriorityBadge` | 🔴 Acil / 🟡 Normal / 🟢 Düşük |
| Boş durum ekranı | `EmptyState` | İlk kullanımda yönlendirme |

### 2.3 — Frontend: Proje/Firma Yönetimi
| Görev | Detay |
|-------|-------|
| Proje oluşturma sayfası | İsim, renk, ikon seçimi |
| Proje listesi (Sidebar) | Renkli etiketler, görev sayaçları |
| Proje düzenleme | İsim, renk, ikon güncelleme |
| Varsayılan projeler (Seed) | Venüs Ayakkabıları, Kazador, Genel |

**🔑 Başarı Kriterleri (Faz 2):**
- [ ] Yeni proje/firma oluşturuluyor
- [ ] Görev eklenip, düzenlenip, tamamlanıyor
- [ ] Firma bazlı filtreleme çalışıyor
- [ ] Görev durumları (Yapılacak → Devam → Tamamlandı) renk kodlu çalışıyor
- [ ] Sürükle-bırak sıralama çalışıyor

---

## FAZ 3: DASHBOARD (ANA EKRAN)
**Tahmini Süre:** 5-7 gün
**Hedef:** İkinci monitörde sürekli açık kalacak canlı, interaktif kontrol paneli.

### 3.1 — Dashboard Widget'ları

| Widget | Konum | Detay |
|--------|-------|-------|
| **Dijital Saat** | Sağ üst | Canlı, akan büyük dijital saat. Tarih bilgisi altında |
| **Mini Takvim** | Sağ üst (saat altı) | Renkli noktalarla görevli günler. Tek tıkla o güne git |
| **Bugünün Görevleri** | Sol/Orta | Firma bazlı veya tümü görünümünde. Tıkla → tamamla |
| **Çalışma Zamanlayıcısı** | Orta | Büyük Başlat/Durdur butonu. Geçen süre. Mola uyarısı |
| **Bildirim Paneli** | Üst/Sağ | Son 5 bildirim. Okunmamış sayacı |
| **Motivasyon Alanı** | Alt orta | Günün sözü. Tamamlanan görev sayacı. Mini kutlama animasyonu |
| **Hızlı Not Alanı** | Sol alt | Tıkla-yaz. Enter ile kaydet. Otomatik AI kategorizasyonu |
| **AI Asistan Köşesi** | Sağ alt | Sohbet baloncuğu. Duruma göre mesaj. Tıklanabilir |

### 3.2 — Dashboard Canlılığı (Gerçek Zamanlı)
| Görev | Detay |
|-------|-------|
| WebSocket bağlantısı | Socket.IO ile frontend-backend arası anlık iletişim |
| Saat güncellemesi | Her saniye DOM güncelleme (requestAnimationFrame) |
| Görev durumu senkronizasyonu | Başka cihazdan yapılan değişikliklerin anında yansıması |
| Bildirim akışı | Yeni bildirimler anlık olarak belirip kaybolma |
| Renk kodlu görev güncellemesi | Gecikmiş: 🔴 yanıp sönen, Bugün: 🟠, Tamamlanan: 🟢 |

### 3.3 — Dashboard Layout ve Tasarım
| Görev | Detay |
|-------|-------|
| Grid layout sistemi | CSS Grid ile esnek widget yerleşimi |
| Karanlık mod (varsayılan) | Dashboard için koyu tema — göz yormayan |
| Animasyonlar | Framer Motion ile yumuşak geçişler |
| Responsive tasarım | Tek ve çift monitör uyumluluğu |
| Tam ekran modu | F11 ile tam ekran dashboard |

**🔑 Başarı Kriterleri (Faz 3):**
- [ ] Dashboard ekranı ikinci monitörde sorunsuz çalışıyor
- [ ] Saat gerçek zamanlı akıyor
- [ ] Görevler anlık güncelleniyor
- [ ] Motivasyon alanı aktif
- [ ] Hızlı not eklenebiliyor

---

## FAZ 4: YAPAY ZEKA MOTORU (AI ENGINE)
**Tahmini Süre:** 7-10 gün
**Hedef:** Gemini AI ile akıllı görev kategorizasyonu, kişiselleştirilmiş iletişim ve proaktif öneriler.

### 4.1 — AI Çekirdek Sistemi
| Görev | Modül | Detay |
|-------|-------|-------|
| Gemini API entegrasyonu | `ai_engine.py` | google-genai SDK, streaming desteği |
| Kişilik profili yükleme | `personality.py` | Nihai rapordaki ton ve üslup kuralları |
| Bağlam yönetimi | `context.py` | Katmanlı bellek: kısa/orta/uzun vadeli |
| Token optimizasyonu | `memory.py` | Veri sıkıştırma, sentezleme, gereksiz veriyi eleme |
| Prompt şablonları | `prompts.py` | Görev analizi, motivasyon, rapor üretme prompt'ları |

### 4.2 — AI Yetenekleri
| Yetenek | Tetikleyici | Detay |
|---------|-------------|-------|
| **Görev kategorizasyonu** | Yeni görev ekleme | Firmayı, önceliği ve tahmini süreyi otomatik belirle |
| **Görev bölme** | İş tanımı yazılması | "Bu işi şu alt görevlere ayırabiliriz" önerisi |
| **Motivasyon mesajları** | Duruma göre | Sabah karşılama, iş tamamlama, durağanlık algılama |
| **Benzer iş tespiti** | Yeni görev ekleme | "Bu işi daha önce de yapmıştın, o zaman X saat sürmüştü" |
| **Tahmini süre** | Görev analizi | Geçmiş verilerden tahmini süre hesaplama |
| **Aciliyet analizi** | Zamanlanmış | Eski görevlere "Bu hâlâ gerekli mi?" sorusu |
| **Sohbet** | Kullanıcı mesajı | Doğal dil ile sohbet, yönlendirme, destek |

### 4.3 — AI Kişilik Yapılandırması (Nihai Rapordan)
```json
{
  "personality": {
    "name": "My World AI",
    "tone": "samimi, destekleyici, yapıcı",
    "language": "tr",
    "rules": [
      "Zorlama ile motive etme — kademeli, nazik yaklaşım",
      "Sabahları ağır iş önerme — hafif başla",
      "Kahve, yemek, tatlı fizyolojik motivasyon tetikleyicileri",
      "Küçük tebrikler ve motivasyon sözleri etkili",
      "İş teslimi en hassas konu — cesaretlendirici yaklaş",
      "Gece geç saatlerde koruyucu ol — uyku hatırlat"
    ],
    "communication_examples": {
      "morning": "Günaydın Bekir! ☀️ Bugün harika şeyler yapabilirsin.",
      "task_complete": "Helal sana! 🎉 Bunu bugün bitirdin, harika!",
      "break_time": "Güzel çalıştın, 30 dk dizi hak ettin. 🎬",
      "inactivity": "Hey, iyi misin? Küçük bir adımla başlayalım mı?",
      "late_night": "Saat 01:00 oldu. Yarın devam etsen?"
    }
  }
}
```

### 4.4 — AI Hafıza Sistemi
| Katman | Saklama Süresi | İçerik |
|--------|----------------|--------|
| **Kısa Vadeli** | Bugün | Bugünün görevleri, yapılanlar, sohbet bağlamı |
| **Orta Vadeli** | Bu hafta | Haftalık özet, performans trendi, çalışma kalıpları |
| **Uzun Vadeli** | Süresiz | Aylık trendler, kişilik profili, öğrenilmiş tercihler |

**Sentezleme Döngüsü:**
- Her gece: Günlük ham veriler → günlük özet
- Her pazar: Haftalık veriler → haftalık sentez
- Her ay sonu: Aylık veriler → aylık sentez
- Eski ham veriler sentezlendikten sonra optimize edilerek saklanır

**🔑 Başarı Kriterleri (Faz 4):**
- [ ] Gemini API'ye başarılı çağrı yapılıyor
- [ ] Görev eklediğinde AI firmayı ve önceliği doğru tahmin ediyor
- [ ] AI farklı durumlarda (sabah, gece, tamamlama) uygun tonla konuşuyor
- [ ] Bağlam yönetimi token limitini aşmıyor
- [ ] Sohbet arayüzü çalışıyor

---

## FAZ 5: ÇALIŞMA ZAMANLAYICISI VE MOLA SİSTEMİ
**Tahmini Süre:** 3-4 gün
**Hedef:** Çalışma süresini takip eden, molalarda ne yapacağını öneren akıllı zamanlayıcı.

### 5.1 — Zamanlayıcı Backend
| Görev | Detay |
|-------|-------|
| Oturum başlatma API'si | `POST /api/timer/start` — kronometreyi başlat |
| Oturum durdurma API'si | `POST /api/timer/stop` — süreyi kaydet |
| Mola tetikleme | 40 dk sonra mola bildirimi, 3 saat sonra uzun mola |
| Çalışma geçmişi | `GET /api/timer/history` — günlük/haftalık çalışma süreleri |
| Çalışma analizi | Ortalama çalışma süreleri, en üretken saatler |

### 5.2 — Zamanlayıcı Frontend
| Görev | Bileşen | Detay |
|-------|---------|-------|
| Büyük zamanlayıcı ekranı | `TimerWidget` | Başlat/Durdur, geçen süre, animasyonlu yüzük |
| Mola önerileri | `BreakSuggestion` | "Kalk biraz dolaş", "Su iç", "5 dk esne" |
| Uzun mola önerileri | `LongBreakModal` | "Bir dizi bölümü izleyebilirsin 🎬" |
| Günlük çalışma özeti | `DailyWorkSummary` | "Bugün 4s 23dk çalıştın" |
| Öğle yemeği hatırlatması | Bildirim | 12:30-13:30 arası yemek hatırlatması |

**🔑 Başarı Kriterleri (Faz 5):**
- [ ] "İşe Başladım" butonu kronometreyi başlatıyor
- [ ] 40 dk sonra mola bildirimi geliyor
- [ ] Çalışma süreleri kaydediliyor ve gösterilebiliyor
- [ ] Günlük toplam süre hesaplanıyor

---

## FAZ 6: AKILLI NOT SİSTEMİ
**Tahmini Süre:** 3-4 gün
**Hedef:** Yazılan notları otomatik kategorize eden AI destekli not defteri.

### 6.1 — Not Backend
| Görev | Detay |
|-------|-------|
| Not CRUD API | `POST/GET/PUT/DELETE /api/notes` |
| AI otomatik kategorizasyon | Not yazıldığında hangi firma/proje? Görev mi, fikir mi? |
| Etiket sistemi | AI tarafından otomatik etiketleme |
| Tam metin arama | PostgreSQL full-text search ile not arama |

### 6.2 — Not Frontend
| Görev | Detay |
|-------|-------|
| Hızlı not alanı | Dashboard'da tek satır — yaz, Enter, kaydet |
| Not listesi sayfası | Filtreli, aranabilir, kategorize edilmiş notlar |
| AI kategori göstergesi | Her notun yanında firma/proje etiketi |
| Çapraz referans | Bir notun birden fazla projeyle ilişkili olabilmesi |

**🔑 Başarı Kriterleri (Faz 6):**
- [ ] Not eklenip görüntülenebiliyor
- [ ] AI notun hangi firmaya ait olduğunu doğru tespit ediyor
- [ ] Notlar aranabiliyor
- [ ] Dashboard'daki hızlı not alanı çalışıyor

---

## FAZ 7: BİLDİRİM SİSTEMİ
**Tahmini Süre:** 3-4 gün
**Hedef:** Doğru zamanda doğru bilgiyi sunan bağlam duyarlı bildirim sistemi.

### 7.1 — Bildirim Tipleri
| Tip | Tetikleyici | Örnek |
|-----|------------|-------|
| **Acil görev** | Son gün yaklaşan | "⚠️ Bu görevin son günü yarın!" |
| **Eski görev** | 3+ gün bekleyen | "Bu görevin aciliyeti var mı?" |
| **Mola** | Zamanlayıcı | "40 dk oldu, mola ver ☕" |
| **Motivasyon** | Zamanlanmış | Öğle saati, akşam motivasyon sözleri |
| **Tebrik** | İş tamamlama | "Harika! Bu hafta 5 görev bitirdin 🏆" |
| **Sabah** | Zamanlanmış (09:00) | "Günaydın! Bugünün planı hazır ☀️" |
| **Gece** | Zamanlanmış (23:00) | "Gece oldu, yarın devam et 🌙" |

### 7.2 — Bildirim Dağıtım Kanalları
| Kanal | Teknoloji | Detay |
|-------|-----------|-------|
| Web Push | Service Worker + Web Push API | Tarayıcı bildirimleri |
| In-App | WebSocket & Toast | Dashboard üzerinde anlık bildirimler |
| Telegram | Bot API | Bilgisayar başında olmadığında |

**🔑 Başarı Kriterleri (Faz 7):**
- [ ] Bildirimlerin web push ve in-app olarak gösterilmesi
- [ ] Zamanlanmış bildirimlerin doğru saatte gelmesi
- [ ] Bağlam duyarlılık — yoğun çalışırken gereksiz bildirim yok

---

## FAZ 8: TELEGRAM BOT ENTEGRASYONU
**Tahmini Süre:** 4-5 gün
**Hedef:** Bilgisayar başında olmadan sisteme erişim sağlayan akıllı Telegram bot.

### 8.1 — Bot Komutları
| Komut | İşlev | Örnek |
|-------|-------|-------|
| `/start` | Bot'u başlat, tanıtım | "Merhaba Bekir! Ben senin kişisel asistanınım." |
| `/gorevler` | Bugünün görevlerini listele | "📋 Bugün 5 görevin var..." |
| `/ekle [metin]` | Yeni görev ekle | `/ekle Venüs için banner tasarla` |
| `/not [metin]` | Hızlı not al | `/not Müşteri fiyat revizesi istedi` |
| `/plan` | Günün planını göster | Saatlik çalışma planı |
| `/rapor` | Günlük özet | Bugün neler yapıldı |
| `/calisiyorum` | Timer'ı başlat | Kronometreli çalışma modu |
| `/mola` | Timer'ı durdur | Mola başlat |

### 8.2 — Doğal Dil İşleme
| Giriş | AI Analizi | Sonuç |
|-------|-----------|-------|
| "Venüs için yeni banner tasarla" | Firma: Venüs, Görev: Banner tasarım | Otomatik görev oluşturma |
| "Yarın bunu ekle" | Tarih: Yarın | Görev yarına atanır |
| "Bu hafta bunu yapmam lazım" | Tarih: Bu hafta | Görev bu haftaya atanır |
| WhatsApp mesajı yapıştırma | İş talebi analizi | Otomatik görev çıkarma |

### 8.3 — Bot → Kullanıcı Mesajları (Proaktif)
| Mesaj Tipi | Zamanlama | Örnek |
|-----------|-----------|-------|
| Sabah karşılama | Her gün 09:00 | "Günaydın! ☀️ Bugünün planını hazırladım..." |
| Haftalık rapor | Pazar 20:00 | "Bu haftanın özeti..." |
| Tebrik | İyi performans sonrası | "Bu hafta çok iyi çalıştın! 🎉" |
| Nazik dürtme | Durağan günlerde | "Hey, iyi misin? 🤔" |

**🔑 Başarı Kriterleri (Faz 8):**
- [ ] Telegram'dan görev ekleniyor
- [ ] Komutlar doğru çalışıyor
- [ ] Doğal dil ile görev ekleme başarılı
- [ ] Proaktif mesajlar zamanında gönderiliyor

---

## FAZ 9: RAPORLAMA SİSTEMİ
**Tahmini Süre:** 4-5 gün
**Hedef:** Günlük, haftalık ve aylık otomatik raporlama.

### 9.1 — Rapor Tipleri ve İçerikleri

| Rapor | Oluşturma Zamanı | İçerik |
|-------|------------------|--------|
| **Günlük** | Her gece 23:00 | Yapılanlar, kalan görevler, çalışma süresi, AI değerlendirme |
| **Haftalık** | Pazar 20:00 | Hafta özeti, üretken günler, trendler, plan önerisi |
| **Aylık** | Ay sonu | Genel performans, hedeflere yaklaşma, kişisel gelişim |

### 9.2 — Rapor Backend
| Görev | Detay |
|-------|-------|
| Günlük rapor oluşturucu | Cron job ile otomatik çalışma |
| Haftalık rapor oluşturucu | Performans metrikleri hesaplama |
| AI rapor sentezi | Gemini ile doğal dil rapor üretimi |
| Rapor saklama | Veritabanında tarihsel rapor arşivi |

### 9.3 — Rapor Frontend
| Görev | Detay |
|-------|-------|
| Rapor sayfası | Tarih seçici, rapor görüntüleyici |
| Performans grafikleri | Chart.js ile çalışma süresi ve trend grafikleri |
| Haftalık karşılaştırma | Bu hafta vs. geçen hafta |
| Gamification | Rozetler: "5 gün üst üste çalıştın 🏆" |

**🔑 Başarı Kriterleri (Faz 9):**
- [ ] Günlük rapor otomatik üretiliyor (AI analizi dahil)
- [ ] Haftalık rapor performans verisi ile oluşturuluyor
- [ ] Grafikler doğru veriyi gösteriyor
- [ ] Raporlar Telegram üzerinden de gönderilebiliyor

---

## FAZ 10: SABAH KARŞILAMA SİSTEMİ
**Tahmini Süre:** 2-3 gün
**Hedef:** Kullanıcıyı sabah Instagram yerine bu uygulamaya çekmek.

### 10.1 — Karşılama Akışı
```
Kullanıcı uygulamayı açar →
  ┌─ Günaydın mesajı + saat
  ├─ Günün aktivitesi önerisi (her gün farklı):
  │   "Bugün 15 dk kitap oku 📖"  veya  "10 dk yürüyüş yap 🚶"
  ├─ Aktiviteyi tamamla → Yumuşak geçiş
  └─ Günün planı + ilk görev önerisi
```

### 10.2 — Bileşenler
| Bileşen | Detay |
|---------|-------|
| `MorningScreen` | Tam ekran karşılama, animasyonlu günaydın |
| `ActivitySuggestion` | Her gün farklı aktivite, süre sınırlı |
| `DayPlanTransition` | Aktiviteden günlük plana yumuşak geçiş |
| Kademeli zorluk | İlk haftalar çok hafif, artan zorluk |

**🔑 Başarı Kriterleri (Faz 10):**
- [ ] Sabah uygulamayı açtığında karşılama ekranı görünüyor
- [ ] Her gün farklı bir aktivite öneriliyor
- [ ] Aktivite sonrası günün planına geçiş yapılıyor

---

## FAZ 11: YEREL GELİŞTİRME ORTAMI FİNALİZASYONU
**Tahmini Süre:** 2-3 gün
**Hedef:** Tüm servislerin tek komutla çalıştırılabilmesi.

### 11.1 — Geliştirme Scriptleri
| Script | İşlev |
|--------|-------|
| `dev.sh` | Tüm servisleri paralel başlat (frontend + backend + bot + db) |
| `setup.sh` | İlk kurulum: bağımlılıklar, veritabanı, migration, seed |
| `seed.py` | Başlangıç verileri: Projeler, AI kişilik, test görevleri |

### 11.2 — Docker Compose Yapılandırması
```yaml
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: myworld
      POSTGRES_USER: myworld
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  # Backend ve frontend yerel olarak çalışacak (hot-reload için)
```

**🔑 Başarı Kriterleri (Faz 11):**
- [ ] `./scripts/setup.sh` ile proje kurulabiliyor
- [ ] `./scripts/dev.sh` ile tüm servisler tek komutla başlıyor
- [ ] Tüm 10 fazın özellikleri entegre ve çalışır durumda

---

## FAZ 12: YAYINA ALMA (DEPLOYMENT)
**Tahmini Süre:** 5-7 gün
**Hedef:** Uygulamayı internet üzerinden erişilebilir hale getirmek.

### 12.1 — Altyapı Seçenekleri

| Bileşen | Platform | Maliyet | Gerekçe |
|---------|----------|---------|---------|
| **Frontend** | Vercel | Ücretsiz (Hobby) | Next.js'in resmi hosting'i, otomatik deploy |
| **Backend** | Railway / Render / VPS | ~$5-10/ay | FastAPI için container desteği |
| **Veritabanı** | Supabase / Neon | Ücretsiz (başlangıç) | Yönetilen PostgreSQL |
| **Redis** | Upstash | Ücretsiz (başlangıç) | Serverless Redis |
| **Telegram Bot** | Mevcut n8n sunucusu | $0 | Zaten çalışan altyapı |
| **Domain** | Cloudflare | ~$10/yıl | myworld.app veya benzeri |

### 12.2 — Deployment Adımları
| Adım | Detay |
|------|-------|
| 1. Domain alma | myworld.app veya benzeri |
| 2. Veritabanı kurulumu | Supabase/Neon'da PostgreSQL instance |
| 3. Redis kurulumu | Upstash'te Redis instance |
| 4. Backend deploy | Railway/Render'a Dockerfile ile deploy |
| 5. Frontend deploy | Vercel'e Next.js otomatik deploy |
| 6. Telegram Bot deploy | Mevcut n8n sunucusunda veya backend ile birlikte |
| 7. SSL/HTTPS | Cloudflare ile otomatik SSL |
| 8. CI/CD | GitHub Actions ile otomatik deploy pipeline |
| 9. Monitoring | Uptime Kuma ile servis izleme |
| 10. Yedekleme | Günlük otomatik veritabanı yedeklemesi |

### 12.3 — Güvenlik Kontrol Listesi
| Güvenlik Önlemi | Detay |
|-----------------|-------|
| HTTPS zorunlu | Tüm trafik şifreli |
| CORS yapılandırması | Sadece izin verilen domain'ler |
| Rate limiting | API aşırı kullanım koruması |
| SQL Injection koruması | SQLAlchemy ORM — otomatik |
| XSS koruması | Next.js varsayılan sanitizasyonu |
| Ortam değişkenleri | Gizli bilgiler `.env`'de, asla kodda değil |
| API Key rotasyonu | Düzenli key değiştirme |
| JWT güvenliği | Kısa ömürlü token + refresh token |

### 12.4 — n8n Entegrasyonu (Mevcut Sunucu)
| Workflow | İşlev |
|----------|-------|
| Sabah karşılama | Her gün 09:00'da → Telegram mesajı + Dashboard güncelleme |
| Gece raporu | Her gece 23:00'da → Günlük rapor oluşturma |
| Haftalık rapor | Pazar 20:00'da → Haftalık özet |
| Aylık rapor | Ayın son günü → Aylık analiz |
| Durağanlık algılama | Son 6 saatte aktivite yoksa → Nazik dürtme |

**🔑 Başarı Kriterleri (Faz 12):**
- [ ] Uygulama internet üzerinden erişilebilir (https://myworld.app veya benzeri)
- [ ] Tüm servisler stabil çalışıyor
- [ ] Telegram botu 7/24 aktif
- [ ] Günlük otomatik yedekleme çalışıyor
- [ ] SSL/HTTPS aktif

---

## 📊 TOPLAM TAHMİNİ SÜRE ÖZETİ

| Faz | Başlık | Süre |
|-----|--------|------|
| 1 | Altyapı ve Temel Kurulum | 3-5 gün |
| 2 | Görev Yönetim Sistemi | 5-7 gün |
| 3 | Dashboard | 5-7 gün |
| 4 | Yapay Zeka Motoru | 7-10 gün |
| 5 | Çalışma Zamanlayıcısı | 3-4 gün |
| 6 | Akıllı Not Sistemi | 3-4 gün |
| 7 | Bildirim Sistemi | 3-4 gün |
| 8 | Telegram Bot | 4-5 gün |
| 9 | Raporlama Sistemi | 4-5 gün |
| 10 | Sabah Karşılama | 2-3 gün |
| 11 | Yerel Ortam Finalizasyonu | 2-3 gün |
| 12 | Yayına Alma | 5-7 gün |
| **TOPLAM** | | **~46-64 gün** |

> **Not:** Her faz kendi başına çalışabilir ve test edilebilir. Fazlar sırayla ilerlenecek, her fazın sonunda çalışan bir ürün olacak.

---

## ⚠️ BİLİNEN RİSKLER VE ÖNLEMLERİ

| Risk | Olasılık | Etki | Önlem |
|------|----------|------|-------|
| Kapsam büyümesi (scope creep) | 🔴 Yüksek | 🔴 Yüksek | MVP'ye sıkı bağlılık, faz faz ilerleme |
| AI API maliyetleri | 🟡 Orta | 🟡 Orta | Token optimizasyonu, önbellekleme |
| Motivasyon kaybı | 🟡 Orta | 🔴 Yüksek | Küçük kazanımlar, 2-3 günlük sprint'ler |
| Teknik borç birikimi | 🟡 Orta | 🟡 Orta | Her faz sonunda refaktör zamanı |

---

## 🔍 DOĞRULAMA PLANI

Her fazın sonunda yapılacak doğrulama:

### Otomatik Testler
- **Backend:** pytest ile API endpoint testleri
- **Frontend:** tarayıcı üzerinden görsel doğrulama
- **AI:** Prompt test senaryoları (doğru kategorizasyon, uygun ton)

### Manuel Doğrulama (Her Faz Sonunda)
1. Uygulama `http://localhost:3000` adresinde sorunsuz açılıyor
2. Belirtilen tüm özellikler çalışıyor
3. API çağrıları başarılı (browser DevTools → Network tab kontrolü)
4. Mobil görünüm responsive tasarıma uygun
5. Karanlık mod düzgün görünüyor

---

*Bu plan dokümanı, projenin yaşayan bir belgesidir. Her faz sonunda güncellenecektir.*
