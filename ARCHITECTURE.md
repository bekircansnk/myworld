# Son Güncelleme: 2026-03-15T17:55+03:00

> **KRİTİK:** Bu dosya tüm sistemin TEK KAYNAĞI (Single Source of Truth) olarak tasarlanmıştır.
> Herhangi bir AI ajanı bu projeye ilk kez girdiğinde **sadece bu dosyayı** okumalıdır.
> Dosya dosya analiz yapmak yasaktır — token israfı olur.

> 🔴 **ÇOK BÜYÜK KRİTİK (PRODUCTION RULES) 🔴:** 
> 1. BU SİSTEM ARTIK YERELDE (LOCALHOST) ÇALIŞMIYOR. Tamamen GERÇEK CANLI DÜNYADA yayına alınmıştır (Frontend: Vercel, Backend: Render, DB: Neon).
> 2. Kod yazarken, API linklerinde veya resim yollarında ASLA "localhost:3000" veya "localhost:8000" gibi geliştirme yollarına geri dönmeyiniz (Örneğin `process.env.NEXT_PUBLIC_API_URL` kullanılmalıdır).
> 3. Yayında olan (Production) çalışan sistemin ayarlarını BOZMAYIN.
> 4. Sistemin güncellendiğini kullanıcının görebilmesi için YAPILAN TÜM KOD DEĞİŞİKLİKLERİ İŞ BİTİMİNDE `git add . && git commit -m "..." && git push` komutlarıyla otomatik olarak GitHub'a YÜKLENMELİDİR. Kullanıcının müdahalesini beklemeyin!

---

## 1. PROJE KİMLİĞİ

| Bilgi              | Değer                                                     |
|---------------------|-----------------------------------------------------------|
| **Proje Adı**       | My World — Kişisel AI Destekli Yaşam ve İş Yönetim Sistemi |
| **Sahibi**          | Çoklu Kullanıcı (SaaS) — Herkesin verisi izole.            |
| **Proje Kökü**      | `/Users/bekir/Uygulamalarım/2-My-World/`                   |
| **Durum**           | SaaS Integrated (Local) — Auth & İzolasyon Tamamlandı      |
| **Dil**             | Kullanıcıyla Türkçe, kod ve değişken isimleri İngilizce    |

---

## 2. TEKNOLOJİ STACK'İ

### Backend 
| Bileşen       | Teknoloji                | Versiyon/Detay              |
|---------------|--------------------------|------------------------------|
| Framework     | **FastAPI**              | Async, Python 3.14          |
| ORM           | **SQLAlchemy 2.0**       | AsyncSession, DeclarativeBase |
| DB Driver     | **asyncpg**              | PostgreSQL async driver     |
| Veritabanı    | **PostgreSQL**           | Port 5432, DB: `myworld`    |
| Yapay Zeka    | **Google Gemini API**    | `google-genai` SDK          |
| Doğrulama     | **Pydantic v2**          | BaseModel, ConfigDict       |
| Ayarlar       | **pydantic-settings**    | .env otomatik yükleme       |
| Güvenlik      | **Passlib / Jose**       | Şifre Hashing / JWT Auth    |
| Çalıştırma    | `uvicorn app.main:app`   | Port 8000                   |

### Frontend
| Bileşen       | Teknoloji                | Detay                       |
|---------------|--------------------------|------------------------------|
| Framework     | **Next.js 15** (Turbopack) | App Router, `"use client"`  |
| Dil           | **TypeScript**           | Strict mode kapalı (bypass) |
| CSS           | **Tailwind CSS**         | Dark mode desteğiyle        |
| State         | **Zustand**              | 6 store (aşağıda detay)     |
| UI Kit        | **shadcn/ui**            | Radix primitives            |
| HTTP Client   | **Axios**                | BaseURL: localhost:8000     |
| Tarih İşleme  | **date-fns** + tr locale | Türkçe format               |
| Çalıştırma    | `npm run dev`            | Port 3000                   |

### Altyapı
| Bileşen        | Teknoloji        | Not                        |
|----------------|------------------|----------------------------|
| Container      | Docker Compose   | PG + Redis tanımlı         |
| Cache (planlı) | Redis            | Bağlantı var, henüz kullanılmıyor |
| WS             | FastAPI WebSocket | `/ws/` endpoint            |
| Bot (planlı)   | Telegram Bot     | Token tanımlı, basic router var |

---

## 3. DOSYA YAPISI VE SORUMLULUKLAR

```
2-My-World/
├── .env                          # Tüm secret'lar (DB, Gemini API key, Telegram)
├── ARCHITECTURE.md               # ← BU DOSYA (Kuralların kaynağı)
├── docker-compose.yml            # PG + Redis servisleri
├── 🚀 Sistemi Başlat.command     # Tek tıkla Docker+Backend+Frontend başlat
├── 🛑 Sistemi Durdur.command     # Tek tıkla her şeyi durdur
│
├── app/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── main.py           # FastAPI app, CORS, router register
│   │   │   ├── config.py         # pydantic-settings, .env okuma
│   │   │   ├── database.py       # AsyncEngine, SessionLocal, get_db()
│   │   │   │
│   │   │   ├── models/           # SQLAlchemy ORM Modelleri
│   │   │   │   ├── base.py       # DeclarativeBase + created_at global
│   │   │   │   ├── user.py       # User (id, email, name, settings)
│   │   │   │   ├── project.py    # Project (name, color, icon, is_active)
│   │   │   │   ├── task.py       # Task (title, status, priority, parent_task_id, subtasks)
│   │   │   │   ├── note.py       # Note (content, title, ai_category, ai_tags, ai_analysis)
│   │   │   │   ├── timer_session.py  # TimerSession (start/end/duration)
│   │   │   │   ├── ai_memory.py  # AIMemory (short/mid/long term content)
│   │   │   │   ├── report.py     # DailyReport + WeeklyReport
│   │   │   │   ├── notification.py   # Notification (type, title, message)
│   │   │   │   └── venus/            # Venus Ads Modelleri
│   │   │   │       ├── ai_analysis_report.py # YapaySK Rapor Modeli
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── schemas/          # Pydantic DTO'lar
│   │   │   │   ├── task.py       # TaskCreate/Update/Response/Reorder/BulkUpdate
│   │   │   │   ├── project.py    # ProjectCreate/Update/Response
│   │   │   │   ├── note.py       # NoteCreate/Update/Response
│   │   │   │   ├── report.py     # DailyReportResponse, WeeklyReportResponse
│   │   │   │   └── venus/
│   │   │   │       └── ai_analysis_report.py # AI Rapor şemaları
│   │   │   │
│   │   │   ├── routers/          # API Endpoint'leri
│   │   │   │   ├── tasks.py      # /api/tasks — CRUD + reorder + bulk + subtask
│   │   │   │   ├── projects.py   # /api/projects — CRUD
│   │   │   │   ├── notes.py      # /api/notes — CRUD + AI başlık/kategori + analiz
│   │   │   │   ├── ai.py         # /api/chat, /api/breakdown/{id}, /api/motivation
│   │   │   │   ├── timer.py      # /api/timer/start, /stop, /history
│   │   │   │   ├── reports.py    # /api/reports/daily, /weekly, /generate/daily
│   │   │   │   ├── telegram.py   # /api/telegram — Webhook
│   │   │   │   ├── websocket.py  # /ws/ — Bidirectional, broadcast manager
│   │   │   │   └── venus/
│   │   │   │       └── reports.py    # /api/venus/reports/ai-analysis — AI Rapor API
│   │   │   │
│   │   │   ├── services/         # İş Mantığı
│   │   │   │   ├── gemini.py     # Gemini API: chat, categorize, breakdown, motivation
│   │   │   │   ├── report_service.py  # Günlük rapor oluşturma
│   │   │   │   ├── telegram.py   # Telegram mesaj gönderme
│   │   │   │   └── venus/
│   │   │   │       ├── ai_report_analyst.py # YapaySK Rapor Analiz Servisi
│   │   │   │       ├── file_processor.py    # Harici dosya işleme
│   │   │   │       └── pdf_generator.py     # AI Rapor PDF üretici
│   │   │   │
│   │   │   ├── ai/               # AI Modülleri
│   │   │   │   ├── personality.py    # Kişilik yükle + system prompt üretimi
│   │   │   │   ├── context.py        # DB'den proje/görev/not çekerek bağlam oluştur
│   │   │   │   ├── memory.py         # Token optimize (şimdilik truncate)
│   │   │   │   └── prompts.py        # LLM prompt şablonları
│   │   │   │
│   │   │   ├── dependencies/     # Enjeksiyonlar
│   │   │   │   └── auth.py           # JWT doğrulama ve current_user
│   │   │   │
│   │   │   └── utils/
│   │   │       └── logger.py     # structlog tabanlı logger
│   │   │
│   │   └── alembic/              # DB Migration
│   │
│   └── frontend/
│       └── src/
│           ├── app/
│           │   ├── layout.tsx    # Root layout (ThemeProvider, ChatWidget)
│           │   └── page.tsx      # Ana sayfa: TopNavbar + viewMode routing
│           │
│           ├── components/
│           │   ├── layout/
│           │   │   └── TopNavbar.tsx       # Üst yatay nav (Dashboard, Görevler, Takvim, Notlar, Raporlar, Firmalar)
│           │   ├── theme-provider.tsx      # next-themes dark/light
│           │   ├── ui/                     # shadcn/ui base components (button, dialog, input, select...)
│           │   │
│           │   ├── dashboard/              # KONTROL PANELİ (Dashboard)
│           │   │   ├── DashboardWidgets.tsx    # Ana dashboard grid (tüm widget'ları barındırır)
│           │   │   ├── AIDashboard.tsx         # AI Rapor Dashboard (v1)
│           │   │   ├── DashboardHeader.tsx     # Dashboard üst başlık & AI özet
│           │   │   ├── DigitalClock.tsx        # Canlı saat + Türkçe selamlama
│           │   │   ├── MiniCalendar.tsx        # Takvim; due_date'li günler mor nokta
│           │   │   ├── TodayTasks.tsx          # Bugünkü acil görevler + AI Focus kartı
│           │   │   ├── PomodoroTimer.tsx       # 25/5dk Pomodoro zamanlayıcı (API bağlantılı)
│           │   │   ├── QuickNote.tsx           # AI Destekli Hızlı Not (zenginleştir+görev çıkar)
│           │   │   ├── Motivation.tsx          # AI motivasyon sözü
│           │   │   ├── MorningScreen.tsx       # Sabah karşılama overlay
│           │   │   ├── DailyAgendaModal.tsx    # Günlük ajanda modal
│           │   │   └── widgets/               # Ek widget bileşenleri
│           │   │
│           │   ├── tasks/                  # GÖREV YÖNETİMİ
│           │   │   ├── KanbanBoard.tsx        # 3 sütunlu Trello benzeri Kanban board
│           │   │   ├── TaskCard.tsx           # Görev kartı (tarih, öncelik, ilerleme çubuğu)
│           │   │   ├── TaskDetailPanel.tsx    # TAM EKRAN 4-BÖLME MODAL (glassmorphism, AI analiz)
│           │   │   └── TaskForm.tsx           # Yeni görev ekleme modalı
│           │   │
│           │   ├── calendar/               # TAKVİM
│           │   │   └── CalendarPage.tsx       # Aylık/Haftalık/Günlük takvim + etkinlik yönetimi + sağ tık menü
│           │   │
│           │   ├── notes/                  # NOTLAR
│           │   │   ├── NotesList.tsx          # Not listesi + kategoriler + arama + hızlı/detaylı not ekleme
│           │   │   └── NoteDetailPanel.tsx    # Not detay paneli (tam ekran düzenleme)
│           │   │
│           │   ├── chat/
│           │   │   └── ChatWidget.tsx         # Sağ alt köşe floating AI chat
│           │   │
│           │   ├── projects/
│           │   │   ├── ProjectForm.tsx        # Yeni proje (firma) ekleme
│           │   │   └── ProjectSettingsModal.tsx # Proje düzenleme modal
│           │   │
│           │   ├── reports/
│           │   │   ├── AdsReportCenter.tsx    # Rapor merkezi (Sekmeli: Normal/AI)
│           │   │   └── AIAnalysisForm.tsx     # AI Rapor oluşturma modalı
│           │   │
│           │   └── providers/              # Provider bileşenleri
│           │
│           ├── stores/               # Zustand State Management (6 STORE)
│           │   ├── taskStore.ts       # tasks[], CRUD, openTaskDetail, addSubtask
│           │   ├── projectStore.ts    # projects[], viewMode, selectedProjectId
│           │   ├── chatStore.ts       # messages[], sendMessage, AI aksiyon parse
│           │   ├── noteStore.ts       # notes[], CRUD, openNoteDetail
│           │   ├── calendarStore.ts   # events[], viewMode, CRUD (persist: localStorage)
│           │   └── webSocketStore.ts  # WS bağlantı, auto-reconnect
│           │
│           ├── lib/
│           │   └── api.ts            # Axios instance (baseURL: localhost:8000)
│           │
│           └── types/
│               ├── index.ts          # Project, Task, Note TypeScript interfaces
│               └── calendar.ts       # CalendarEvent, CalendarViewMode, EVENT_COLORS, CATEGORY_LABELS
│
├── docs/
│   └── 07-nihai-kisisel-analiz-raporu.md  # Bekircan kişisel analiz (AI personality data)
│
└── data/
    └── seed/
        └── ai_personality.json       # AI kişilik ayarları (name, tone, rules, examples)
```

---

## 4. NAVIGASYON VE SAYFA YAPISI

### Üst Navigasyon Çubuğu (TopNavbar.tsx)
Eski sol sidebar kaldırılmış, yerine **yatay üst navbar** gelmiştir.

| Menü Öğesi       | viewMode      | Bileşen                |
|------------------|---------------|------------------------|
| Kontrol Paneli   | `dashboard`   | `DashboardWidgets`     |
| Görevler         | `all_tasks`   | `KanbanBoard`          |
| Takvim           | `calendar`    | `CalendarPage`         |
| Notlar           | `notes`       | `NotesList`            |
| Rapor & Analiz   | `reports`     | `ReportsPage`          |
| Firmalar (hover) | `project`     | `KanbanBoard` (filtrelemeli) |

Sağ tarafta: **Bildirim paneli** (yaklaşan görevlerden otomatik oluşur), **Dark/Light toggle**, **Kullanıcı profili**.

### Sayfa Yönlendirme Akışı (page.tsx)
```
page.tsx yüklendiğinde:
  → fetchProjects() + fetchTasks() + WebSocket.connect()
  → Sabah karşılama kontrolü (localStorage: myworld_last_greet)

viewMode State'e göre render:
  dashboard  → DashboardWidgets (overflow-hidden, full-height grid)
  all_tasks  → KanbanBoard (tüm projeler)
  project    → KanbanBoard (seçili proje filtrelemeli)
  calendar   → CalendarPage (tam ekran, kendi layout'u var)
  notes      → NotesList
  reports    → ReportsPage

TaskDetailPanel her zaman render edilir (global overlay — isDetailPanelOpen ile kontrol)
```

---

## 5. API ENDPOINT HARİTASI

| Metot   | Yol                              | Açıklama                            | Router Dosyası      |
|---------|----------------------------------|--------------------------------------|----------------------|
| GET     | `/api/health`                    | Sağlık kontrolü                     | main.py              |
| GET     | `/api/projects`                  | Proje listesi                       | projects.py          |
| POST    | `/api/projects`                  | Yeni proje                          | projects.py          |
| PUT     | `/api/projects/{id}`             | Proje güncelle                      | projects.py          |
| DELETE  | `/api/projects/{id}`             | Proje sil                           | projects.py          |
| GET     | `/api/tasks?project_id=&status=` | Görev listesi (filtrelemeli)        | tasks.py             |
| POST    | `/api/tasks`                     | Yeni görev (AI auto-categorize)     | tasks.py             |
| PUT     | `/api/tasks/{id}`                | Görev güncelle                      | tasks.py             |
| PATCH   | `/api/tasks/{id}/status?status=` | Durum değiştir (todo/in_progress/done) | tasks.py          |
| DELETE  | `/api/tasks/{id}`                | Görev sil                           | tasks.py             |
| POST    | `/api/tasks/{id}/subtasks`       | Alt görev ekle                      | tasks.py             |
| PUT     | `/api/tasks/reorder`             | Sıra değiştir                       | tasks.py             |
| POST    | `/api/tasks/bulk`                | Toplu güncelle                      | tasks.py             |
| POST    | `/api/chat`                      | AI ile sohbet (aksiyon komutları dahil) | ai.py             |
| POST    | `/api/breakdown/{task_id}`       | Görevi AI ile alt görevlere böl     | ai.py                |
| GET     | `/api/motivation`                | AI motivasyon sözü                  | ai.py                |
| POST    | `/api/timer/start`               | Timer başlat                        | timer.py             |
| POST    | `/api/timer/stop`                | Timer durdur (süre hesapla)         | timer.py             |
| GET     | `/api/timer/history`             | Timer geçmişi                       | timer.py             |
| GET     | `/api/notes`                     | Not listesi                         | notes.py             |
| POST    | `/api/notes`                     | Not ekle (AI başlık+kategori oto atanır) | notes.py        |
| POST    | `/api/notes/enhance`             | Notu AI ile zenginleştir + görev çıkar | notes.py          |
| PUT     | `/api/notes/{id}`                | Not güncelle                        | notes.py             |
| DELETE  | `/api/notes/{id}`                | Not sil                             | notes.py             |
| GET     | `/api/reports/daily`             | Günlük rapor geçmişi                | reports.py           |
| POST    | `/api/reports/generate/daily`    | Günlük rapor oluştur                | reports.py           |
| GET     | `/api/reports/weekly`            | Haftalık rapor geçmişi              | reports.py           |
| GET     | `/api/venus/metrics/overview`    | Venus KPI özeti                     | venus/metrics.py     |
| GET     | `/api/venus/campaigns`           | Venus Kampanya listesi              | venus/campaigns.py   |
| POST    | `/api/venus/csv-imports/upload`  | Venus CSV/XLSX veri yükleme         | venus/csv_imports.py |
| POST    | `/api/venus/ai-observations/generate-daily` | Venus AI günlük analiz üret | venus/ai_obs.py |
| GET     | `/api/calendar/events`           | Takvim etkinliklerini listele       | calendar.py          |
| POST    | `/api/calendar/events`           | Yeni takvim etkinliği               | calendar.py          |
| PUT     | `/api/calendar/events/{id}`      | Etkinlik güncelle                   | calendar.py          |
| DELETE  | `/api/calendar/events/{id}`      | Etkinlik sil                        | calendar.py          |
| POST    | `/api/auth/register`             | Yeni kullanıcı kaydı                | auth.py              |
| POST    | `/api/auth/login`                | Giriş ve JWT Token al               | auth.py              |
| GET     | `/api/auth/me`                   | Mevcut kullanıcı bilgisi            | auth.py              |
| PUT     | `/api/auth/profile`              | Profil güncelle (username/şifre)    | auth.py              |
| POST    | `/api/auth/avatar`               | Avatar yükle (multipart/form-data)  | auth.py              |
| POST    | `/api/venus/reports/ai-analysis` | Yeni AI Raporu oluştur (PDF/Veri) | venus/reports.py |
| GET     | `/api/venus/reports/ai-analysis` | AI Rapor listesi | venus/reports.py |
| GET     | `/api/venus/reports/download/{id}` | AI Rapor PDF'ini indir | venus/reports.py |
| WS      | `/ws/`                           | WebSocket (ping/pong, broadcast)    | websocket.py         |

---

## 6. VERİTABANI ŞEMASI

### users
| Kolon           | Tip           | Not                        |
|-----------------|---------------|----------------------------|
| id              | INT PK        | Auto-increment             |
| username        | VARCHAR       | UNIQUE, Giriş için kullanılır|
| password_hash   | VARCHAR       | Argon2/Bcrypt hashli şifre  |
| name            | VARCHAR       | Görünen ad                 |
| avatar_url      | VARCHAR       | Profil resmi yolu          |
| settings        | JSON          | default {}                 |
| created_at      | TIMESTAMP(tz) | Base'den gelir             |

### projects
| Kolon       | Tip           | Not                   |
|-------------|---------------|-----------------------|
| id          | INT PK        |                       |
| user_id     | INT FK→users  |                       |
| name        | VARCHAR       |                       |
| color       | VARCHAR       | default "#000000"     |
| icon        | VARCHAR       | nullable              |
| description | VARCHAR       | nullable              |
| is_active   | BOOL          | default true          |
| sort_order  | INT           | default 0             |
| created_at  | TIMESTAMP(tz) |                       |

### tasks
| Kolon                | Tip           | Not                               |
|----------------------|---------------|------------------------------------|
| id                   | INT PK        |                                    |
| user_id              | INT FK→users  |                                    |
| project_id           | INT FK→projects | nullable                         |
| **parent_task_id**   | INT FK→tasks (self) | nullable, alt görev ilişkisi  |
| title                | VARCHAR       |                                    |
| description          | VARCHAR       | nullable                          |
| priority             | VARCHAR       | "urgent" / "normal" / "low"       |
| status               | VARCHAR       | "todo" / "in_progress" / "in_review" / "done" |
| due_date             | TIMESTAMP(tz) | nullable                          |
| estimated_minutes    | INT           | nullable (AI tahmin eder)         |
| actual_minutes       | INT           | default 0                         |
| ai_category          | VARCHAR       | nullable                          |
| ai_suggested_priority| VARCHAR       | nullable                          |
| ai_analysis          | TEXT          | nullable (AI motivasyonel analiz)  |
| ai_analysis_history  | JSON          | default [] (AI analiz geçmişi)     |
| sort_order           | INT           | default 0                         |
| completed_at         | TIMESTAMP(tz) | nullable, done olunca oto set      |
| created_at           | TIMESTAMP(tz) |                                    |
| **subtasks**         | RELATION      | Task[] (self-referencing)          |

### notes
| Kolon              | Tip           | Not                   |
|---------------------|---------------|-----------------------|
| id                  | INT PK        |                       |
| user_id             | INT FK        |                       |
| project_id          | INT FK        | nullable              |
| content             | TEXT          |                       |
| title               | VARCHAR       | nullable (AI oto atar)|
| ai_category         | VARCHAR       | nullable (AI oto atar: "Yaratıcı Fikirler"/"Genel Notlar"/"Yazılım") |
| ai_tags             | JSON          | default []            |
| ai_analysis         | TEXT          | nullable              |
| ai_analysis_history | JSON          | default []            |
| source              | VARCHAR       | "web"/"telegram"/"ai"/"notes_page" |
| updated_at          | TIMESTAMP(tz) |                       |
| created_at          | TIMESTAMP(tz) |                       |

### timer_sessions
| Kolon            | Tip           | Not                           |
|------------------|---------------|-------------------------------|
| id               | INT PK        |                               |
| user_id          | INT FK        |                               |
| task_id          | INT FK        | nullable                      |
| start_time       | TIMESTAMP(tz) | NOT NULL                      |
| end_time         | TIMESTAMP(tz) | nullable                      |
| duration_minutes | INT           | stop edilince hesaplanır      |
| break_type       | VARCHAR       | "work"/"short_break"/"long_break" |
| notes            | TEXT          | nullable                      |
| created_at       | TIMESTAMP(tz) |                               |

### ai_memory
| Kolon            | Tip           | Not                               |
|------------------|---------------|------------------------------------|
| id               | INT PK        |                                    |
| user_id          | INT FK        |                                    |
| memory_type      | VARCHAR       | "short_term"/"mid_term"/"long_term"|
| content          | JSON          |                                    |
| summary          | VARCHAR       | nullable                          |
| importance_score | INT           | 1-10                               |
| expires_at       | TIMESTAMP(tz) | nullable                          |
| created_at       | TIMESTAMP(tz) |                                    |

### daily_reports / weekly_reports
- Günlük: tasks_completed, tasks_added, total_work_minutes, ai_summary, mood_score
- Haftalık: week_start/end, tasks_completed, total_work_hours, productivity_score, ai_analysis

### venus (Module)
- **AdAccount**: Reklam hesabı (Google, Meta vb.)
- **Campaign**: Bütçe, tarih ve platform bazlı reklam grubu
- **DailyMetric**: Günlük harcama, tıklama, dönüşüm verileri
- **Creative**: Görsel/Metin varlıkları
- **Experiment**: A/B test senaryoları ve başarı metrikleri
- **CSVImport**: Yükleme geçmişi ve dosya durumu
- **AIObservation**: Gemini tarafından üretilen içgörüler

### notifications
- type: "urgent_task" / "break_time" / "motivation" / "morning_greeting"
- title, message, is_read, action_url, scheduled_at, sent_at

### calendar_events
| Kolon           | Tip           | Not                               |
|-----------------|---------------|-----------------------------------|
| id              | INT PK        |                                   |
| user_id         | INT FK        | Veri izolasyonu için              |
| title           | VARCHAR       | Etkinlik başlığı                  |
| description     | TEXT          | Detaylar                          |
| start_time      | TIMESTAMP(tz) | Başlangıç                         |
| end_time        | TIMESTAMP(tz) | Bitiş                             |
| is_all_day      | BOOL          | Tüm gün mü?                       |
| event_type      | VARCHAR       | "task", "routine", "meeting" vb.  |
| task_id         | INT FK        | İlişkili görev (varsa)            |
| note_id         | INT FK        | İlişkili not (varsa)              |
| is_completed    | BOOL          | Tamamlandı mı?                    |
| created_at      | TIMESTAMP(tz) |                                   |

### chat_sessions / chat_messages
- Her mesaj `user_id` ve `session_id` ile bağlıdır.
- Mesajlar AI'nın geçmişi hatırlaması için `(user_id, session_id)` bazlı sorgulanır.
- `actions` kolonu AI'nın o mesajda yaptığı görev ekleme vb. detayları saklar.

---

## 7. AI SİSTEMİ MİMARİSİ

### Model Seçim Mekanizması (Akıllı Router)
```
Kullanıcı Mesajı
    ↓
classify_intent() → MODEL_LITE ile niyet tespiti
    ↓
┌─STANDARD_CHAT → gemini-3.1-flash-lite-preview (Hızlı, düşük maliyet)
├─DEEP_ANALYSIS → gemini-3.1-pro-preview (Detaylı analiz)
└─IMAGE_GENERATION → imagen-3.0-generate-002 (Görsel üretim)
```

### AI Chat Akışı (POST /api/chat)
1. build_system_context(db, user_id) → Kullanıcıya özel aktif projeler, görevler ve notlar çekilir.
2. optimize_context_tokens() → Token sınırına göre kırpma yapılır.
3. get_personality_instruction(user_name) → Kullanıcının adıyla özelleştirilmiş sistem promptu üretilir.
4. classify_intent() → Model seçilir (Lite/Pro).
5. generate_chat_response() → Mesaj + kişiselleştirilmiş context + system_instruction ile Gemini'ye gönderilir.
6. Oto-Komut Ayrıştırma:
   a) [PLAN_START]...[PLAN_END] → TEK ana görev + N alt görev oluşturur (tercih edilen)
   b) [ACTION:ADD_TASK|Proje|Başlık|Öncelik] → Geriye dönük uyumluluk
7. Aksiyonlar çalıştırılır (görev + alt görevler oluşturulur), taskStore.fetchTasks() tetiklenir
8. Temiz metin döndürülür, action_log frontend'e iletilir
```

### PLAN Komutu (Ana Komut — TERCİH EDİLEN)
```json
[PLAN_START]
{
  "project": "CampAndMap",
  "title": "Web sitesini ayağa kaldır",
  "priority": "urgent",
  "due_date": "2026-03-16",
  "description": "Motive edici açıklama...",
  "subtasks": [
    {"title": "1. Adım", "description": "Açıklama", "estimated_minutes": 30}
  ]
}
[PLAN_END]
```
- Backend regex ile parse eder → 1 ana Task + N alt Task (parent_task_id bağlantılı)
- `due_date` ISO string ise UTC timestamp olarak kaydedilir
- ChatStore başarılı plan sonrası `taskStore.fetchTasks()` çağırarak board'u yeniler

### AI Not İşleme (POST /api/notes)
Not oluşturulurken:
1. Başlık yoksa → AI otomatik başlık atar
2. ai_category yoksa → AI otomatik kategori atar ("Yaratıcı Fikirler" / "Genel Notlar" / "Yazılım")
3. BackgroundTasks ile async çalışır (not oluşturma hızını etkilemez)

### AI Not Zenginleştirme (POST /api/notes/enhance)
QuickNote widget'tan gelen ham metin:
1. Yazım hatalarını düzeltir, detaylandırır, formatlar
2. `tasks_found` → Nottan çıkan somut görevler listesi (otomatik task oluşturulur)
3. `ideas` → Araştırma önerileri ve yaratıcı fikirler

### AI Context Zenginliği (context.py)
Her sohbet mesajıyla AI'ya şu bağlam iletilir:
- Toplam/aktif/tamamlanan görev metrikleri
- Proje bazlı kart sayıları
- Alt görev tamamlama yüzdeleri
- Son 10 tamamlanan görev (tarih + süre)
- Son 5 not özeti

### AI'ın Kişilik Kaynağı
1. `data/seed/ai_personality.json` → Temel isim, ton ve kurallar.
2. `personality.py` → Dinamik prompt üretici; `user_name` parametresiyle kullanıcıya özel hitap sağlar.
3. Sistem, kullanıcıyı bir "Dijital Kurucu Ortak" veya "Ürün Yöneticisi" gibi destekler; pasif dinlemez, proaktif aksiyon alır.

### 🤖 Proaktif AI Mesaj Sistemi (Background Tasks)
Sistem, `scheduler.py` üzerinden belirli zamanlarda (`09:00`, `14:00`, `21:00` vb.) otomatik tetiklenir:
1. **Sabah Selamlaması**: Günün ilk ışıklarında kullanıcıya bekleyen acil işlerini hatırlatır.
2. **Durum Kontrolü**: Gün içinde takılan veya uzun süredir bekleyen görevleri motive ederek hatırlatır.
3. **Akşam Özeti**: Günün performansını değerlendirir ve dinlenme tavsiyesi verir.
Metinler Gemini (`MODEL_LITE`) tarafından o anki DB bağlamına göre üretilir ve **WebSocket** (`PROACTIVE_AI_MESSAGE`) üzerinden anlık olarak UI'a basılır. UI'da bu mesajlar AI botun konuşma baloncuğunda belirir.

### 🧠 Yapay Zeka Ne Biliyor? (Context Scope)
Her mesajda veya proaktif işlemde AI aşağıdaki verilere (sadece ilgili kullanıcıya ait) erişebilir:
1. **Profil Bilgisi**: Kullanıcının adı, bio'su ve özel ayarları.
2. **Aktif Görevler**: Tüm "todo" ve "in_progress" görevlerin başlıkları, öncelikleri ve varsa deadline'ları.
3. **Projeler**: Mevcut projelerin listesi ve hangi görevlerin hangi projeye ait olduğu.
4. **Notlar**: Son eklenen 5-10 notun içeriği ve kategorileri.
5. **Takvim**: Yaklaşan 24-48 saat içindeki etkinlikler.
6. **AI Belleği**: Chat geçmişindeki son 10-15 mesaj (veya token limitine göre).
7. **Zaman**: Şu anki tarih ve saat (görev gecikmelerini hesaplamak için).

AI bu verileri ham JSON olarak değil, `context.py` tarafından üretilen anlamlı bir metin özeti olarak alır. Bu sayede "Benim geciken işim var mı?" dediğinde veritabanındaki `due_date < now` olanları süzüp size söyleyebilir.

---

## 8. FRONTEND BİLEŞEN DETAYLARI

### Kanban Board (Trello Benzeri — KanbanBoard.tsx)
| Sütun          | Status        | Renk     |
|----------------|---------------|----------|
| Bekleyenler    | todo          | Gri      |
| Devam Edenler  | in_progress   | Mavi     |
| İncelemede     | in_review     | Turuncu  |
| Tamamlananlar  | done          | Yeşil    |

- Her sütunun altında "Kart ekle" butonu
- Kartlar: proje etiketi, başlık, oluşturulma tarihi, due_date (gecikmiş=kırmızı, bugün=turuncu), alt görev sayısı, ilerleme çubuğu
- Kart tıklanınca → TaskDetailPanel açılır

### TaskDetailPanel (Tam Ekran 4-Bölme Modal — TaskDetailPanel.tsx)
4 bölmeli büyük glassmorphism modal:

| Bölme | Konum | İçerik |
|-------|-------|---------| 
| 📝 Açıklama | Sol Üst | Metin/link/resim URL düzenleme; resimlerin Lightbox ile büyütülür |
| 🤖 AI Analiz | Sağ Üst | İLERLEME ÖZETİ (harcanan/tahmini dakika), AI motivasyonel değerlendirme |
| ✅ Alt Görevler | Sol Alt | Checklist + AI ile Böl butonu, predicted dakikalar, hover delete |
| 📊 İşlem Geçmişi | Sağ Alt | AI log (durum değişiklikleri, alt görev tamamlama), ilerleme özeti |

- Header: Gradient öncelik çizgisi, proje badge, status butonları (Bekliyor/Devam Ediyor/İncelemede/Tamamlandı), due_date picker, ilerleme çubuğu (%)
- Overlay'e tıklayarak veya X butonuyla kapanır

### Takvim Sayfası (CalendarPage.tsx — 883 satır)
Ana yapı: Sol panel (takvim grid) + Sağ sidebar (günün programı + etkinliklerim + bekleyen görevler)

**Özellikler:**
- **3 Görünüm Modu:** Aylık / Haftalık / Günlük
- **Etkinlik Yönetimi:** Ekleme (AddEventDialog), detay görüntüleme (EventDetailDialog), silme
- **Sağ Tık Bağlam Menüsü:** Takvim üzerindeki etkinliklere/görevlere sağ tıklayınca "Kaldır" ve "Düzenle" seçenekleri
- **Sürükle-Bırak (Drag & Drop):**
  - Görevleri bekleyen görevler listesinden takvime sürükleyerek tarih atama
  - Etkinlikleri ve görevleri takvim içinde günler arası taşıma
  - Hem aylık hem haftalık görünümde çalışır
- **Görev Entegrasyonu:** due_date'i olan görevler otomatik takvimde görünür (taskEvents)
- **Bekleyen Görevler Paneli:**
  - Tarihsiz görevler varsa sadece onları gösterir (tüm görevlere tarih atama amacıyla)
  - Tüm görevlere tarih atandığında tam listeyi gösterir
- **Etkinliklerim Paneli:** Tüm etkinliklerin kronolojik listesi
- **Bugünün Programı:** O gün için planlanmış etkinlikler
- **Takvim İçi AI Chat:** Günü planlama, özetleme için AI sohbet

**Takvim Types (calendar.ts):**
- `CalendarEvent`: id, title, description, date, startTime, endTime, allDay, color, category, taskId
- `CalendarViewMode`: 'month' | 'week' | 'day'
- `EVENT_COLORS`: 8 renk (blue, purple, orange, green, rose, amber, teal, indigo)
- `CATEGORY_LABELS`: task, personal, routine, meeting, health, social, learning

### Notlar Sayfası (NotesList.tsx + NoteDetailPanel.tsx)
**NotesList Özellikleri:**
- **4 Kategori Sekmesi:** Tüm Notlar → Genel Notlar → Yaratıcı Fikirler → Yazılım
- **Hızlı Not Ekleme:** Üstte text area, "Not Ekle" butonuyla (AI otomatik başlık + kategori atar)
- **Detaylı Not Ekleme Modalı:** Artı (+) butonuyla açılır, başlık/kategori/içerik doldurulabilir
- **Arama:** Notlar arasında metin araması
- **Sağ Tık Menüsü:** Kopyalama, silme gibi hızlı işlemler
- **Kod Blokları:** İçerikte kod snippetleri algılanır, syntax-highlighted ve kopyalanabilir gösterilir
- **Not Detay Paneli:** Not kartına tıklayınca tam ekran düzenleme açılır

### Dashboard Widget'ları (DashboardWidgets.tsx)
| Widget       | İşlev                                                        |
|--------------|---------------------------------------------------------------|
| DigitalClock | Canlı saat (1sn interval), günün saatine göre Türkçe selamlama |
| MiniCalendar | Takvim; due_date'li günlere mor nokta, tıklayınca göiev listesi |
| TodayTasks   | Acil görevler, AI Focus kartı (üst 3 acil görev)              |
| PomodoroTimer| 25dk focus / 5dk break, API session kaydı                     |
| QuickNote    | AI Destekli Hızlı Not: yaz → zenginleştir + görev çıkar       |
| Motivation   | AI motivasyon sözü                                             |
| DailyAgenda  | Günlük ajanda modal (MiniCalendar'dan tıkla)                  |

---

## 9. STATE YÖNETİMİ (ZUSTAND — 6 STORE)

| Store          | Dosya             | Ana State              | Kritik Metodlar                                    |
|----------------|-------------------|-----------------------|-----------------------------------------------------|
| taskStore      | taskStore.ts      | tasks[], selectedTask, isDetailPanelOpen | fetchTasks, addTask, updateTask, updateTaskStatus, deleteTask, addSubtask, openTaskDetail, closeTaskDetail |
| projectStore   | projectStore.ts   | projects[], viewMode, selectedProjectId  | fetchProjects, addProject, updateProject, deleteProject, setViewMode, setSelectedProjectId |
| chatStore      | chatStore.ts      | messages[]            | sendMessage(→/api/chat), toggleChat, clearHistory; AI aksiyon sonrası fetchTasks() tetikler |
| noteStore      | noteStore.ts      | notes[], selectedNote, isDetailPanelOpen | fetchNotes, addNoteAction, addExplicitNoteAction, deleteNoteAction, updateNoteInList, openNoteDetail, closeNoteDetail |
| calendarStore  | calendarStore.ts  | events[], viewMode, currentDate, selectedEvent | addEvent, updateEvent, deleteEvent, setViewMode, setCurrentDate; **persist: localStorage** |
| webSocketStore | webSocketStore.ts | socket, isConnected   | connect (auto-reconnect 5sn), disconnect, sendMessage |
| venusAdsStore  | venusAdsStore.ts  | campaigns[], overviewData, observations[] | fetchOverview, fetchCampaigns, uploadCSV, generateDailySummary |

### ViewMode Tanımı (projectStore.ts)
```typescript
type ViewMode = 'dashboard' | 'all_tasks' | 'project' | 'notes' | 'reports' | 'calendar' | 'venus_ads'
```

### TypeScript Interfaces (types/index.ts)
```typescript
interface Project { id, user_id, name, color, icon?, description?, is_active, sort_order, created_at }
interface Task { id, user_id, project_id?, parent_task_id?, title, description?, priority, status, due_date?, estimated_minutes?, actual_minutes, ai_category?, ai_suggested_priority?, ai_analysis?, ai_analysis_history?, sort_order, created_at, completed_at?, project? }
interface Note { id, user_id, project_id?, content, title?, ai_category?, ai_tags?, ai_analysis?, ai_analysis_history?, source, created_at?, updated_at? }
```

---

## 10. .ENV YAPISI

```env
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
DB_USER=myworld
DB_PASSWORD=myworld_secret
DB_NAME=myworld
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=dev_secret_key_change_me_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=AIzaSy...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ADMIN_ID=509313712
```

---

## 11. SİSTEMİ ÇALIŞTIRMA

```bash
# 1. Altyapıyı kaldır
cd /Users/bekir/Uygulamalarım/2-My-World
docker compose up -d   # PostgreSQL + Redis

# 2. Backend başlat
cd app/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 3. Frontend başlat
cd app/frontend
npm run dev   # localhost:3000

# VEYA tek tıkla:
# 🚀 Sistemi Başlat.command dosyasını çift tıkla
```

---

## 12. BİLİNEN SORUNLAR VE TODO'LAR

### 🔴 Kritik
- **Auth yok:** Tüm endpoint'ler MOCK_USER_ID=1 kullanıyor
- **ESLint/TS hataları:** `next.config.ts` içinde `ignoreDuringBuilds: true` ile bypass ediliyor
- **Chat geçmişi:** Sayfa yenilenince mesaj geçmişi kayboluyor (persistence yok)

### 🟡 Geliştirilecek
- Subtask sürükle-bırak sıralama
- Notification sistemi (push/in-app — şu an sadece local NavBar bildirimleri var)
- Telegram bot tam entegrasyon
- Redis cache aktif kullanımı
- Chat mesaj geçmişi DB'ye kaydedilmeli

### 🟢 Tamamlanan
- ✅ **SaaS Dönüşümü**: Çoklu kullanıcı desteği ve veri izolasyonu.
- ✅ **JWT Kimlik Doğrulama**: Kayıt ol/Giriş yap ve güvenli oturum yönetimi.
- ✅ **Profil & Avatar**: Kullanıcı profil düzenleme ve sunucuya avatar yükleme.
- ✅ **Takvim DB Senkronizasyonu**: Takvimin localStorage'dan PostgreSQL'e taşınması.
- ✅ Görev CRUD + AI auto-categorize + AI breakdown
- ✅ Proje CRUD + yatay navbar navigasyon
- ✅ Not CRUD + AI başlık/kategori otomatik atama + AI zenginleştirme
- ✅ Detaylı not ekleme modalı (kategori seçimi ile)
- ✅ Notlarda kod bloğu algılama ve syntax-highlighted gösterim
- ✅ Pomodoro Timer (API bağlantılı)
- ✅ Morning Screen (günde 1 kez)
- ✅ AI Chat + PLAN_START/END komutu
- ✅ AI'den due_date algılama
- ✅ Tam Ekran TaskDetailPanel (4 bölmeli glassmorphism)
- ✅ TaskCard tarih gösterimi (gecikmiş=kırmızı, bugün=turuncu)
- ✅ MiniCalendar deadline noktaları
- ✅ QuickNote AI Destekli (zenginleştir + görev çıkar)
- ✅ ChatWidget aksiyon rozetleri + debug paneli
- ✅ Dashboard AI Focus kartı + Stats bar
- ✅ Üst NavBar + bildirim paneli (yaklaşan görevlerden otomatik)
- ✅ Takvim Sayfası (aylık/haftalık/günlük + etkinlik yönetimi)
- ✅ Takvim sürükle-bırak (görev↔gün, takvim içi taşıma)
- ✅ Takvim sağ tık bağlam menüsü (kaldır/düzenle)
- ✅ WebSocket altyapısı & Proaktif AI Mesajları
- ✅ Rapor modeli
- ✅ Kanban board AI aksiyon sonrası otomatik refresh
- ✅ **Venus Ads Panel (v2)**: Reklam performans takip sistemi, CSV veri yükleme, KPI hesaplama (ROAS/CPA) ve Gemini AI içgörü entegrasyonu tamamlandı. Örnek dosyalar ve kullanıcı rehberi eklendi.
- ✅ **Yedekleme Sistemi**: Python tabanlı JSON yedekleme, manuel `.command` başlatıcı ve MacOS LaunchAgent ile günlük (22:11) otomatik yedekleme.
- ✅ **Optimistic UI & Performans**: Tüm Venus Ads panellerinde (Kampanyalar, Görevler, Testler, Checklistler) asenkron güncelleme altyapısına geçildi. Kullanıcı tıkladığı anda görsel veri değişir, sayfa yenileme beklemesi (5sn blokajı) kaldırıldı.
- ✅ **Venus Ads Varlık Bağlantıları (Cross-Linking)**: Kampanya, Test, Kreatif ve Görevler arasında "Tıklanabilir Çip" bağlantıları kuruldu. Bir kampanya içinden ilgili göreve tıklandığında otomatik olarak o modüle geçiş yapılır ve ilgili varlığın detay/düzenleme penceresi açılır.
- ✅ **Kreatif Laboratuvarı Geliştirmeleri**: Google Drive ve harici URL'lerden gelen resimlerin "no-referrer" politikasıyla sorunsuz görüntülenmesi sağlandı.
- ✅ **Akıllı Görev Notları & AI Review**: Operasyon görevlerinde AI aksiyon önerileri daraltılabilir (collapsible) hale getirildi. Testler tamamlandığında AI'nın otomatik "Learning & Review" (Öğrenim ve Değerlendirme) üretmesi sağlandı.
- ✅ **Müşteri Devralma (Checklist) UI**: Yatayda uzayan hantal yapı daraltıldı (compact). Silme butonu metnin yanına çekildi ve yeni madde ekleme formu minimalize edildi.
- ✅ **Ayarlar & Profil**: Profil Ayarları (Kullanıcı adı, şifre, avatar) ve Proje Ayarları (Renk, ikon, isim) modalları tamamlandı.
- ✅ **AI Rapor Merkezi (Faz 1 & 2)**: YapaySK destekli veri/dosya analizi, otomatik PDF rapor üretimi ve interaktif Dashboard ekranı (VenusAds tasarımıyla uyumlu) geliştirildi.


---

## 13. KOD STİLİ KURALLARI

1. **Backend:** Async/await her yerde, `get_db()` dependency ile session, `select().where()` pattern
2. **Frontend:** `"use client"` her component dosyasında, `React.useState/useEffect` import stili
3. **API çağrıları:** Frontend→Backend arası `api.get/post/put/patch/delete` (Axios instance)
4. **Filtreler:** Backend'de SQLAlchemy query, Frontend'de array filter
5. **Store pattern:** `set((state) => ({ ... }))` ile immutable update
6. **UI Pattern:** shadcn/ui bileşenleri, Lucide icon'ları, Tailwind utility class'ları
7. **Dialog/Modal:** shadcn/ui `Dialog` + `DialogContent` kullanımı, `onOpenChange` ile ESC/overlay kapatma
8. **Panel açma/kapama:** Store'da `isDetailPanelOpen` + `openXDetail()` / `closeXDetail()` pattern

---

## 14. AI AJANLARI İÇİN HIZLI REFERANS

> Bu projeye gelen AI ajanı şunu bilmeli:

### Dosya değiştirmek istiyorsan:
- **Yeni API endpoint:** `app/backend/app/routers/` altına ekle, `main.py`'de register et
- **Yeni DB modeli:** `app/backend/app/models/` altına ekle, `__init__.py`'de import, migration yap
- **Yeni schema:** `app/backend/app/schemas/` altına ekle
- **Frontend bileşeni:** `app/frontend/src/components/` altına ekle
- **State değişikliği:** `app/frontend/src/stores/` altındaki ilgili store'u güncelle
- **Tip tanımı:** `app/frontend/src/types/index.ts` veya `calendar.ts` güncelle
- **AI davranışı:** `app/backend/app/ai/` altındaki dosyaları düzenle
- **Yeni sayfa/view:** `projectStore.ts`'de `ViewMode` tipine ekle, `page.tsx`'de route et

### Büyük dosya boyutları (dikkat):
- `CalendarPage.tsx` — ~883 satır (tüm takvim tek dosyada)
- `TaskDetailPanel.tsx` — ~38K byte (4 bölmeli büyük modal)
- `DashboardWidgets.tsx` — ~33K byte (tüm dashboard widget'ları)
- `NotesList.tsx` — ~23K byte (not listesi + modallar)
- `TopNavbar.tsx` — ~15K byte (navigasyon + bildirim paneli)

### Kesinlikle yapma:
- ❌ `rm` kullanma (dosyaları `.silinecekler_cop_kutusu`'na taşı)
- ❌ MOCK_USER_ID'yi değiştirme (auth olmadan 1 kalmalı)
- ❌ Kişisel analiz raporunu silme/değiştirme
- ❌ Her dosyayı teker teker okuma—bu dosya yeterli
- ❌ Dosya içeriğini tahmin etme—ARCHITECTURE.md'i oku, sonra gerekirse ilgili dosyayı aç

---

## 15. OTO-GÜNCELLEME KURALI

> **Bu bölüm kalıcı sistem kuralıdır.**

Her büyük geliştirme oturumu sonrasında (yeni özellik, sayfa değişikliği, store değişikliği, API ekleme, bileşen yapısı değişikliği vb.) bu ARCHITECTURE.md dosyası **mutlaka güncellenmelidir**:

1. İlgili bölüm (dosya yapısı, API haritası, store tablosu, tamamlanan/TODO listesi vb.) güncelle
2. En üstteki "Son Güncelleme" tarihini güncelle
3. Yeni bileşen veya dosya eklendiyse dosya ağacına ekle
4. Yeni store veya state eklenirse State tablosuna ekle
5. API değişikliği varsa API haritasını güncelle

Bu kural, AI ajanlarının her seferinde tüm sistemi yeniden analiz etmek zorunda kalmamasını sağlar. Token tasarrufu ve hız kazanımı açısından kritiktir.

---

**Bu doküman güncellendiğinde tarih bilgisini en üstte güncelle.**
