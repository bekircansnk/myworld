# 🌍 My World

**Kişisel Yapay Zeka Destekli Yaşam ve İş Yönetim Sistemi (SaaS Sürümü)**

> Sadece bir "yapılacaklar listesi" değil — seni tanıyan, yönlendiren ve motive eden akıllı bir yaşam orkestratörü. Artık çoklu kullanıcı desteği ile her yerde yanınızda.

---

## 🎯 Proje Hakkında

My World, günlük yaşamını, iş süreçlerini, motivasyonunu ve kişisel gelişimini yönetmek için tamamen kişiselleştirilmiş bir SaaS uygulamasıdır. Yapay zeka motoru kullanıcıları tanır, alışkanlıklarını öğrenir ve WebSocket üzerinden proaktif bildirimlerle destek sağlar.

## ✨ Temel Özellikler

- **🔐 Güvenli Erişim** — JWT tabanlı üyelik, profil yönetimi ve avatar yükleme desteği.
- **🛡️ Veri İzolasyonu** — Her kullanıcı için tamamen izole edilmiş projeler, görevler ve notlar.
- **📋 Kanban Görev Yönetimi** — Sürükle-bırak pano (Bekleyen, Devam Eden, İncelemede, Tamamlanan).
- **📅 Veritabanı Senkronize Takvim** — Etkinlikler artık bulutta; sürükle-bırak ve görev entegrasyonu ile.
- **📝 Akıllı Notlar** — AI destekli otomatik başlık/kategori atama ve zenginleştirme.
- **🤖 Proaktif AI Asistan** — Zamanlanmış görevlerle (Sabah/Öğle/Akşam) otomatik motivasyon ve hatırlatma mesajları.
- **⏱️ Pomodoro Timer** — Odaklanma sürelerini veritabanına kaydeden akıllı zamanlayıcı.
- **📊 Performans Analizi** — AI tarafından hazırlanan günlük ve haftalık raporlar.
- **🌓 Modern Arayüz** — Tam Dark/Light Mode desteği ve Glassmorphism tasarım dili.

## 🏗️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript + Zustand + shadcn/ui |
| Backend | FastAPI + SQLAlchemy 2.0 (Async) + Pydantic v2 + JWT / Passlib |
| Veritabanı | PostgreSQL (asyncpg) |
| AI Motoru | Google Gemini API (Flash Lite + Pro + Imagen) |
| Altyapı | Docker Compose + APScheduler + WebSocket |

## 📁 Klasör Yapısı

```
2-My-World/
├── ARCHITECTURE.md   # 📐 Tek Kaynak Doküman (Sistem Mimarisi)
├── app/
│   ├── frontend/     # Next.js 15 UI (Port 3000)
│   └── backend/      # FastAPI REST API & WebSocket (Port 8000)
├── docs/             # Sistem planları ve analizler
└── data/             # AI kişilik ve seed verileri
```

## 🚀 Hızlı Başlangıç

```bash
# 1. Altyapıyı ve Veritabanını Başlat
docker compose up -d

# 2. Backend (Virtualenv aktifken)
cd app/backend && uvicorn app.main:app --reload

# 3. Frontend
cd app/frontend && npm run dev
```

## 📋 Mevcut Durum

- ✅ SaaS Altyapısı (Auth & Veri İzolasyonu)
- ✅ Kanban Board (AI Breakdown & Status Tracking)
- ✅ Takvim Gezgini (DB Senkronizasyonu & Event Management)
- ✅ Not Sistemi (AI Categorization & Task Extraction)
- ✅ Proaktif AI WebSocket Mesajları
- ✅ Profil ve Avatar Yönetimi
- ✅ Rapor & Analiz Sistemi
- 🔄 Telegram Bot (Geliştirme aşamasında)

---
© 2026 My World Project. Tüm hakları saklıdır.
