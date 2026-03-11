# 🌍 MY WORLD — MİMARİ VE SİSTEM KURALLARI (ARCHITECTURE.md)
# Son Güncelleme: 2026-03-11T16:28+03:00

> **KRİTİK:** Bu dosya tüm sistemin TEK KAYNAĞI (Single Source of Truth) olarak tasarlanmıştır.
> Herhangi bir AI ajanı bu projeye ilk kez girdiğinde **sadece bu dosyayı** okumalıdır.
> Dosya dosya analiz yapmak yasaktır — token israfı olur.

---

## 1. PROJE KİMLİĞİ

| Bilgi              | Değer                                                     |
|---------------------|-----------------------------------------------------------|
| **Proje Adı**       | My World — Kişisel AI Destekli Yaşam ve İş Yönetim Sistemi |
| **Sahibi**          | Bekircan Simsek (user_id: 1, MOCK_USER_ID olarak hardcoded) |
| **Proje Kökü**      | `/Users/bekir/Uygulamalarım/2-My-World/`                   |
| **Durum**           | Development (Local) — Üretime çıkılmadı                   |
| **Dil**             | Kullanıcıyla Türkçe, kod ve değişken isimleri İngilizce    |

---

## 2. TEKNOLOJİ STACK'İ

### Backend
| Bileşen       | Teknoloji                | Versiyon/Detay              |
|---------------|--------------------------|-----------------------------|
| Framework     | **FastAPI**              | Async, Python 3.14          |
| ORM           | **SQLAlchemy 2.0**       | AsyncSession, DeclarativeBase |
| DB Driver     | **asyncpg**              | PostgreSQL async driver     |
| Veritabanı    | **PostgreSQL**           | Port 5432, DB: `myworld`    |
| Yapay Zeka    | **Google Gemini API**    | `google-genai` SDK          |
| Doğrulama     | **Pydantic v2**          | BaseModel, ConfigDict       |
| Ayarlar       | **pydantic-settings**    | .env otomatik yükleme       |
| Çalıştırma    | `uvicorn app.main:app`   | Port 8000                   |

### Frontend
| Bileşen       | Teknoloji                | Detay                       |
|---------------|--------------------------|-----------------------------|
| Framework     | **Next.js 15** (Turbopack) | App Router, `"use client"`  |
| Dil           | **TypeScript**           | Strict mode kapalı (bypass) |
| CSS           | **Tailwind CSS**         | Dark mode desteğiyle        |
| State         | **Zustand**              | 4 store                     |
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
│
├── app/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── main.py           # FastAPI app, middleware, router register
│   │   │   ├── config.py         # pydantic-settings, .env okuma
│   │   │   ├── database.py       # AsyncEngine, SessionLocal, get_db()
│   │   │   │
│   │   │   ├── models/           # SQLAlchemy ORM Modelleri
│   │   │   │   ├── base.py       # DeclarativeBase + created_at global
│   │   │   │   ├── user.py       # User (id, email, name, settings)
│   │   │   │   ├── project.py    # Project (name, color, icon, is_active)
│   │   │   │   ├── task.py       # Task (title, status, priority, parent_task_id, subtasks)
│   │   │   │   ├── note.py       # Note (content, ai_tags, source)
│   │   │   │   ├── timer_session.py  # TimerSession (start/end/duration)
│   │   │   │   ├── ai_memory.py  # AIMemory (short/mid/long term content)
│   │   │   │   ├── report.py     # DailyReport + WeeklyReport
│   │   │   │   └── notification.py   # Notification (type, title, message)
│   │   │   │
│   │   │   ├── schemas/          # Pydantic DTO'lar
│   │   │   │   ├── task.py       # TaskCreate/Update/Response/Reorder/BulkUpdate
│   │   │   │   ├── project.py    # ProjectCreate/Update/Response
│   │   │   │   ├── note.py       # NoteCreate/Update/Response
│   │   │   │   └── report.py     # DailyReportResponse, WeeklyReportResponse
│   │   │   │
│   │   │   ├── routers/          # API Endpoint'leri
│   │   │   │   ├── tasks.py      # /api/tasks — CRUD + reorder + bulk + subtask
│   │   │   │   ├── projects.py   # /api/projects — CRUD
│   │   │   │   ├── notes.py      # /api/notes — CRUD + /enhance (AI zenginleştirme)
│   │   │   │   ├── ai.py         # /api/chat, /api/breakdown/{id}, /api/motivation
│   │   │   │   ├── timer.py      # /api/timer/start, /stop, /history
│   │   │   │   ├── reports.py    # /api/reports/daily, /weekly, /generate/daily
│   │   │   │   ├── telegram.py   # /api/telegram — Webhook
│   │   │   │   └── websocket.py  # /ws/ — Bidirectional, broadcast manager
│   │   │   │
│   │   │   ├── services/         # İş Mantığı
│   │   │   │   ├── gemini.py     # Gemini API: chat, categorize, breakdown, motivation
│   │   │   │   ├── report_service.py  # Günlük rapor oluşturma
│   │   │   │   └── telegram.py   # Telegram mesaj gönderme
│   │   │   │
│   │   │   ├── ai/               # AI Modülleri
│   │   │   │   ├── personality.py    # Kişilik yükle + system prompt üretimi
│   │   │   │   ├── context.py        # DB'den proje/görev/not çekerek bağlam oluştur
│   │   │   │   ├── memory.py         # Token optimize (şimdilik truncate)
│   │   │   │   └── prompts.py        # LLM prompt şablonları (categorize, breakdown, motivation)
│   │   │   │
│   │   │   └── utils/
│   │   │       └── logger.py     # structlog tabanlı logger
│   │   │
│   │   └── alembic/              # DB Migration
│   │
│   └── frontend/
│       └── src/
│           ├── app/
│           │   ├── layout.tsx    # Root layout (ThemeProvider, Sidebar, ChatWidget)
│           │   └── page.tsx      # Ana sayfa: Dashboard | Tasks | Notes | Reports
│           │
│           ├── components/
│           │   ├── Sidebar.tsx           # Sol menü (Dashboard, İşler, Notlar, Raporlar, Firmalar)
│           │   ├── theme-provider.tsx    # next-themes dark/light
│           │   ├── ui/                   # shadcn/ui base components
│           │   ├── dashboard/
│           │   │   ├── DashboardWidgets.tsx  # Widget grid düzeni
│           │   │   ├── DigitalClock.tsx      # Canlı saat + selamlama
│   │   │   ├── MiniCalendar.tsx      # Takvim; due_date'li günler mor nokta; tıklayınca görev listesi
│   │   │   ├── TodayTasks.tsx        # Acil görevler listesi + AI Focus kartı (ilk 3 görev)
│   │   │   ├── PomodoroTimer.tsx     # 25/5 dk zamanlayıcı (API bağlantılı)
│   │   │   ├── QuickNote.tsx         # AI Destekli Hızlı Not (Cmd+Enter → enhance)
│           │   │   ├── Motivation.tsx        # AI motivasyon sözü
│           │   │   └── MorningScreen.tsx     # Sabah karşılama overlay
│           │   ├── tasks/
│           │   │   ├── KanbanBoard.tsx        # Trello benzeri 3 sütunlu Kanban board
│   │   │   ├── TaskCard.tsx           # Tarihli kart (gecikmiş=kırmızı, bugün=turuncu), ilerleme çubuğu
│   │   │   ├── TaskDetailPanel.tsx    # TAM EKRAN 4-BÖLME MODAL (glassmorphism, AI analiz)
│           │   │   └── TaskForm.tsx           # Yeni görev ekleme modal
│           │   ├── chat/
│           │   │   └── ChatWidget.tsx         # Sağ alt köşe floating chat
│           │   ├── notes/
│           │   │   └── NotesList.tsx          # Not listesi + CRUD
│           │   ├── projects/
│           │   │   ├── ProjectForm.tsx        # Yeni proje ekleme
│           │   │   └── ProjectSettingsModal.tsx # Proje düzenleme modal
│           │   └── reports/
│           │       └── ReportsPage.tsx        # Rapor ve analiz sayfası
│           │
│           ├── stores/               # Zustand State Management
│           │   ├── taskStore.ts       # tasks[], CRUD, openTaskDetail, addSubtask, isDetailPanelOpen
│           │   ├── projectStore.ts    # projects[], viewMode, selectedProjectId
│           │   ├── chatStore.ts       # messages[], sendMessage, action_log, debug; AI aksiyon sonrası fetchTasks() tetikler
│           │   └── webSocketStore.ts  # WS bağlantı yönetimi, auto-reconnect
│           │
│           ├── lib/
│           │   └── api.ts            # Axios instance (baseURL: localhost:8000)
│           │
│           └── types/
│               └── index.ts          # Project, Task TypeScript interfaces
│
├── docs/
│   └── 07-nihai-kisisel-analiz-raporu.md  # Bekircan kişisel analiz (AI personality data)
│
└── data/
    └── seed/
        └── ai_personality.json       # AI kişilik ayarları (name, tone, rules, examples)
```

---

## 4. API ENDPOINT HARİTASI

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
| POST    | `/api/notes`                     | Not ekle                            | notes.py             |
| POST    | `/api/notes/enhance`             | Notu AI ile zenginleştir + görev çıkar | notes.py          |
| PUT     | `/api/notes/{id}`                | Not güncelle                        | notes.py             |
| DELETE  | `/api/notes/{id}`                | Not sil                             | notes.py             |
| GET     | `/api/reports/daily`             | Günlük rapor geçmişi                | reports.py           |
| POST    | `/api/reports/generate/daily`    | Günlük rapor oluştur                | reports.py           |
| GET     | `/api/reports/weekly`            | Haftalık rapor geçmişi              | reports.py           |
| WS      | `/ws/`                           | WebSocket (ping/pong, broadcast)    | websocket.py         |

---

## 5. VERİTABANI ŞEMASI

### users
| Kolon      | Tip     | Not                     |
|------------|---------|-------------------------|
| id         | INT PK  | Auto-increment          |
| email      | VARCHAR | UNIQUE                  |
| name       | VARCHAR |                         |
| avatar_url | VARCHAR | nullable                |
| settings   | JSON    | default {}              |
| created_at | TIMESTAMP(tz) | Base'den gelir    |

### projects
| Kolon       | Tip      | Not                   |
|-------------|----------|-----------------------|
| id          | INT PK   |                       |
| user_id     | INT FK→users |                    |
| name        | VARCHAR  |                       |
| color       | VARCHAR  | default "#000000"     |
| icon        | VARCHAR  | nullable              |
| description | VARCHAR  | nullable              |
| is_active   | BOOL     | default true          |
| sort_order  | INT      | default 0             |
| created_at  | TIMESTAMP(tz) |                  |

### tasks
| Kolon                | Tip      | Not                               |
|----------------------|----------|------------------------------------|
| id                   | INT PK   |                                    |
| user_id              | INT FK→users |                                |
| project_id           | INT FK→projects | nullable                    |
| **parent_task_id**   | INT FK→tasks (self) | nullable, alt görev ilişkisi |
| title                | VARCHAR  |                                    |
| description          | VARCHAR  | nullable                          |
| priority             | VARCHAR  | "urgent" / "normal" / "low"       |
| status               | VARCHAR  | "todo" / "in_progress" / "done"   |
| due_date             | TIMESTAMP(tz) | nullable                     |
| estimated_minutes    | INT      | nullable (AI tahmin edebilir)     |
| actual_minutes       | INT      | default 0                         |
| ai_category          | VARCHAR  | nullable                          |
| ai_suggested_priority| VARCHAR  | nullable                          |
| sort_order           | INT      | default 0                         |
| completed_at         | TIMESTAMP(tz) | nullable, done olunca oto set |
| created_at           | TIMESTAMP(tz) |                               |
| **subtasks**         | RELATION | Task[] (self-referencing)         |

### notes
| Kolon       | Tip      | Not                   |
|-------------|----------|-----------------------|
| id          | INT PK   |                       |
| user_id     | INT FK   |                       |
| project_id  | INT FK   | nullable              |
| content     | VARCHAR  |                       |
| ai_category | VARCHAR  | nullable              |
| ai_tags     | JSON     | default []            |
| source      | VARCHAR  | "web"/"telegram"/"ai" |
| updated_at  | TIMESTAMP(tz) |                  |
| created_at  | TIMESTAMP(tz) |                  |

### timer_sessions
| Kolon            | Tip      | Not                           |
|------------------|----------|-------------------------------|
| id               | INT PK   |                               |
| user_id          | INT FK   |                               |
| task_id          | INT FK   | nullable                      |
| start_time       | TIMESTAMP(tz) | NOT NULL                 |
| end_time         | TIMESTAMP(tz) | nullable                 |
| duration_minutes | INT      | stop edilince hesaplanır      |
| break_type       | VARCHAR  | "work"/"short_break"/"long_break" |
| notes            | TEXT     | nullable                      |
| created_at       | TIMESTAMP(tz) |                          |

### ai_memory
| Kolon            | Tip      | Not                               |
|------------------|----------|------------------------------------|
| id               | INT PK   |                                    |
| user_id          | INT FK   |                                    |
| memory_type      | VARCHAR  | "short_term"/"mid_term"/"long_term"|
| content          | JSON     |                                    |
| summary          | VARCHAR  | nullable                          |
| importance_score | INT      | 1-10                               |
| expires_at       | TIMESTAMP(tz) | nullable                      |
| created_at       | TIMESTAMP(tz) |                               |

### daily_reports / weekly_reports
- Günlük: tasks_completed, tasks_added, total_work_minutes, ai_summary, mood_score
- Haftalık: week_start/end, tasks_completed, total_work_hours, productivity_score, ai_analysis

### notifications
- type: "urgent_task" / "break_time" / "motivation" / "morning_greeting"
- title, message, is_read, action_url, scheduled_at, sent_at

---

## 6. AI SİSTEMİ MİMARİSİ

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
```
1. build_system_context(db) → DB'den aktif projeler, görevler, tamamlananlar, not özetleri çekilir
2. optimize_context_tokens() → 15000 karaktere kırpılır
3. get_personality_instruction() → Kişilik + PLAN_START kuralları + kişisel analiz raporu yüklenir
4. classify_intent() → Model seçilir
5. generate_chat_response() → Mesaj + context + system_instruction ile Gemini'ye gönderilir
6. Oto-Komut Ayrıştırma:
   a) [PLAN_START]...[PLAN_END] → TEK ana görev + N alt görev oluşturur (tercih edilen)
   b) [ACTION:ADD_TASK|Proje|Başlık|Öncelik] → Geriye dönük uyumluluk için hâlâ desteklenir
7. Aksiyonlar çalıştırılır (görev + alt görevler oluşturulur), taskStore.fetchTasks() tetiklenir
8. Temiz metin döndürülür, action_log frontend'e iletilir
```

### PLAN Komutu (Ana Komut — TERCİH EDİLEN)
Kullanıcı bir iş verdiğinde AI **her zaman TEK bir PLAN bloğu** üretir:
```
[PLAN_START]
{
  "project": "CampAndMap",
  "title": "Web sitesini ayağa kaldır",
  "priority": "urgent",
  "due_date": "2026-03-16",       ← null da olabilir
  "description": "Motive edici açıklama...",
  "subtasks": [
    {"title": "1. Adım", "description": "Açıklama", "estimated_minutes": 30}
  ]
}
[PLAN_END]
```
- Backend `[PLAN_START]...[PLAN_END]` regex ile parse eder
- 1 ana `Task` + N alt `Task` (parent_task_id bağlantılı) oluşturur
- `due_date` ISO string ise DB'ye UTC timestamp olarak kaydedilir
- Kullanıcı tarih söylediğinde ("16 Mart'a kadar") AI bunu `due_date` alanına koyar, açıklamaya YAZMAz
- ChatStore başarılı plan sonrası `taskStore.fetchTasks()` çağırarak board'u yeniler

### Oto-Komut Sistemi (Geriye Uyumlu)
PLAN dışında basit görev ekleme için:
```
[ACTION:ADD_TASK|Proje Adı|Görev Başlığı|urgent/medium/low]
```
- Proje ismi ilike ile eşleştirilir, komutlar temizlenir

### AI Context Zenginliği (context.py)
AI her mesaja şu bağlamla gider:
- Toplam/aktif/tamamlanan görev metrikleri
- Proje bazlı kart sayıları
- Alt görev tamamlama yüzdeleri (task başına)
- Son 10 tamamlanan görev (tarih + süre)
- Son 5 not özeti

### AI'ın Kişilik Kaynağı
1. `data/seed/ai_personality.json` → İsim, ton, kurallar
2. `docs/07-nihai-kisisel-analiz-raporu.md` → Bekircan'ın tam kişilik analizi (ADHD, dopamin, motivasyon)
3. `personality.py` → ADHD uyumlu PLAN üretim kuralları, tahmini süre zorunluluğu, ilk adımı kolaylaştırma

### Görev Oto-Kategorizasyon (POST /api/tasks oluşturulurken)
Yeni görev eklendiğinde otomatik:
1. Mevcut projeler çekilir
2. `categorize_task()` → Gemini Lite ile project_id, priority, estimated_minutes tahmini
3. Sonuçlar görevle merge edilir

### AI ile Görev Bölme (POST /api/breakdown/{id})
`breakdown_task_with_ai()` → Ana görevin title + description'ı ile alt görevler listesi üretilir

### AI Not Zenginleştirme (POST /api/notes/enhance)
QuickNote widget'tan gelen ham metin:
1. Yazım hatalarını düzeltir, detaylandırır, formatlar
2. `tasks_found` → Nottan çıkan somut görevler listesi (otomatik task oluşturulur)
3. `ideas` → İlgili araştırma önerileri ve yaratıcı fikirler
Frontend sonucu renkli panellerde gösterir (altın / mavi / mor)

---

## 7. FRONTEND SAYFALAR VE BİLEŞENLER

### Ana Akış (page.tsx)
```
Sayfa yüklendiğinde:
  → fetchProjects() + fetchTasks() çağrılır
  → Sabah keşılama kontrolü (localStorage: myworld_last_greet)

viewMode State'e göre render:
  dashboard  → DashboardWidgets
  all_tasks  → KanbanBoard (3 sütunlu Trello board)
  project    → KanbanBoard (proje filtrelemeli)
  notes      → NotesList
  reports    → ReportsPage
```

### Kanban Board (Trello Benzeri)
| Sütun          | Status      | Renk     |
|----------------|-------------|----------|
| Bekleyenler    | todo        | Gri      |
| Devam Edenler  | in_progress | Mavi     |
| Tamamlananlar  | done        | Yeşil    |

- Her sütunun altında "Kart ekle" butonu → sütuna hızlı görev ekleme
- Kartlar kompakt: proje etiketi, başlık, **oluşturulma tarihi**, **due_date** (gecikmiş=kırmızı, bugün=turuncu), alt görev sayısı, ilerleme çubuğu
- Kart tıklanınca → TaskDetailPanel **tam ekran modal** açılır (overlay + blur)

### TaskDetailPanel (Tam Ekran 4-Bölme Glassmorphism Modal) 🆕
Ekranın ortasında büyük, saydam, 3D görünümlü bir modal. 4 bölme:

| Bölme | Konum | İçerik |
|-------|-------|---------|
| 📝 Açıklama | Sol Üst | Metin/link/resim URL düzenleme; resimler Lightbox ile büyütülür |
| 🤖 AI Analiz | Sağ Üst | AI motivasyonel değerlendirme, harcanan/tahmini süre istatistikleri |
| ✅ Alt Görevler | Sol Alt | Checklist, AI ile Böl butonu, süreli adımlar, hover delete |
| 📊 Aktivite | Sağ Alt | AI log (alt görev tamamlandıkça mesaj), ilerleme özeti, hızlı işlemler |

- **Header:** Gradient öncelik çizgisi, proje badge, status butonları, due_date picker, ilerleme çubuğu
- **Kapanış:** Overlay'e tıkla veya X butonu
- **Lightbox:** Açıklamadaki resim URL'lerini thumbnail gösterir, tıklanınca tam ekran

### Dashboard Widget'ları
| Widget       | İşlev                                                        | API Bağlantısı        |
|--------------|---------------------------------------------------------------|------------------------|
| DigitalClock | Canlı saat (1sn interval), günün saatine göre Türkçe selamlama | Yok                  |
| MiniCalendar | date-fns/tr takvim; due_date'li günlere **mor nokta** koyar, tıklayınca o günün görevleri listelenir | taskStore |
| TodayTasks   | Acil (max 4) görevler, tıkla→done; AI Focus kartı (üst 3 acil görev) | taskStore       |
| PomodoroTimer| 25dk focus / 5dk break, API session                          | /api/timer/*           |
| QuickNote    | AI Destekli Hızlı Not: yaz → "AI ile Gönder" (Cmd+Enter) → zenginleştir + görev çıkar + fikirler | /api/notes + /api/notes/enhance |
| Motivation   | AI motivasyon sözü                                            | /api/motivation        |

### PomodoroTimer Detayı (Dikkat: Canlılık Sorunu!)
- Timer `setInterval(1000ms)` ile çalışır, UI canlı güncellenir
- Başlat → `POST /api/timer/start` (session oluştur)
- Durdur → `POST /api/timer/stop` (süre hesapla)
- Süre bitiminde otomatik mod değişikliği (focus↔break)
- **BİLİNEN SORUN:** Backend'den timer hata dönebilir, frontend bağımsız sayar

### Chat Widget
- Sağ alt köşe floating buton
- Mesaj geçmişi local state'te (sayfa yenilenince kaybolur)
- `POST /api/chat` ile Gemini'ye gönderilir
- AI yanıtı ekranında gösterilir

### ChatWidget — Aksiyon Rozetleri ve Debug Paneli 🆕
- Sağ alt köşe floating buton
- AI aksiyonu gerçekleştiğinde yeşil badge gösterir (CREATE_PLAN, ADD_SUBTASKS)
- Debug modu: AI'ın arka planda yaptıklarını collapsible panel ile gösterir
- Başarılı plan sonrası `taskStore.fetchTasks()` otomatik çağrılır (board yenilenir)

---

## 8. STATE YÖNETİMİ (ZUSTAND STORES)

| Store          | Dosya             | Ana State         | Kritik Metodlar                                    |
|----------------|-------------------|--------------------|-----------------------------------------------------|
| taskStore      | taskStore.ts      | tasks[], selectedTask | fetchTasks, addTask, updateTask, updateTaskStatus, deleteTask, addSubtask, openTaskDetail |
| projectStore   | projectStore.ts   | projects[], viewMode  | fetchProjects, addProject, updateProject, deleteProject, setViewMode |
| chatStore      | chatStore.ts      | messages[]         | sendMessage(→/api/chat), toggleChat, clearHistory   |
| webSocketStore | webSocketStore.ts | socket, isConnected | connect (auto-reconnect 5sn), disconnect, sendMessage |

---

## 9. .ENV YAPISI

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

## 10. SİSTEMİ ÇALIŞTIRMA

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
```

---

## 11. BİLİNEN SORUNLAR VE TODO'LAR

### 🔴 Kritik
- **Auth yok:** Tüm endpoint'ler MOCK_USER_ID=1 kullanıyor (herkes erişebilir)
- **ESLint/TS hataları:** `next.config.ts` içinde `ignoreDuringBuilds: true` ile bypass ediliyor
- **Timer canlılık:** MorningScreen'den "Güne Başla" seçince timer otomatik başlamıyor
- **Chat geçmişi:** Sayfa yenilenince mesaj geçmişi kayboluyor (persistence yok)

### 🟡 Geliştirilecek
- Subtask sürükle-bırak sıralama
- Notification sistemi (push/in-app)
- Telegram bot tam entegrasyon
- RAG mimarisi (semantic search ile bağlam oluşturma)
- Chat mesaj geçmişi DB'ye kaydedilmeli (şimdi local state)
- Redis cache aktif kullanımı

### 🟢 Tamamlanan
- Görev CRUD + AI auto-categorize + AI breakdown
- Proje CRUD + sidebar navigasyon
- Not CRUD + **AI zenginleştirme** (`/api/notes/enhance`)
- Pomodoro Timer (API bağlantılı)
- Morning Screen (günde 1 kez)
- AI Chat + **PLAN_START/END** komutu (tek kart + alt görevler)
- AI den **due_date** algılama (natural language → ISO tarih)
- **Tam Ekran TaskDetailPanel** (4 bölmeli glassmorphism modal)
- **TaskCard tarih gösterimi** (oluşturulma + deadline, renkli uyarılar)
- **MiniCalendar deadline noktaları** (tıklayınca görev listesi)
- **QuickNote AI Destekli** (zenginleştir + görev çıkar + fikirler)
- ChatWidget aksiyon rozetleri + debug paneli
- Dashboard AI Focus kartı + Stats bar
- Motivasyon widget
- WebSocket altyapısı
- Rapor modeli
- `AxiosError: multiple values for 'source'` hatası düzeltildi
- Kanban board AI aksiyon sonrası otomatik refresh

---

## 12. KOD STİLİ KURALLARI

1. **Backend:** Async/await her yerde, `get_db()` dependency ile session, `select().where()` pattern
2. **Frontend:** `"use client"` her component dosyasında, `React.useState/useEffect` import stili
3. **API çağrıları:** Frontend→Backend arası `api.get/post/put/patch/delete` (Axios instance)
4. **Filtreler:** Backend'de SQLAlchemy query, Frontend'de array filter (basit filtreleme)
5. **Store pattern:** `set((state) => ({ ... }))` ile immutable update
6. **UI Pattern:** shadcn/ui bileşenleri, Lucide icon'ları, Tailwind utility class'ları

---

## 13. AI AJANLARI İÇİN HIZLI REFERANS

> Bu projeye gelen AI ajanı şunu bilmeli:

### Dosya değiştirmek istiyorsan:
- **Yeni API endpoint:** `app/backend/app/routers/` altına ekle, `main.py`'de register et
- **Yeni DB modeli:** `app/backend/app/models/` altına ekle, migration yap
- **Yeni schema:** `app/backend/app/schemas/` altına ekle
- **Frontend bileşeni:** `app/frontend/src/components/` altına ekle
- **State değişikliği:** `app/frontend/src/stores/` altındaki ilgili store'u güncelle
- **Tip tanımı:** `app/frontend/src/types/index.ts` güncelle
- **AI davranışı:** `app/backend/app/ai/` altındaki dosyaları düzenle

### Kesinlikle yapma:
- ❌ `rm` kullanma (dosyaları `.silinecekler_cop_kutusu`'na taşı)
- ❌ ESLint/TS hatalarını ignore etmeye devam etme—düzelt
- ❌ MOCK_USER_ID'yi değiştirme (auth olmadan 1 kalmalı)
- ❌ Kişisel analiz raporunu silme/değiştirme
- ❌ Her dosyayı teker teker okuma—bu dosya yeterli

---

**Bu doküman güncellendiğinde tarih bilgisini en üstte güncelle.**
