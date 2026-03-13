# 🌍 My World

**Kişisel Yapay Zeka Destekli Yaşam ve İş Yönetim Sistemi**

> Sadece bir "yapılacaklar listesi" değil — seni tanıyan, yönlendiren ve motive eden akıllı bir yaşam orkestratörü.

---

## 🎯 Proje Hakkında

My World, günlük yaşamını, iş süreçlerini, motivasyonunu ve kişisel gelişimini yönetmek için tamamen kişiselleştirilmiş bir uygulama. Yapay zeka motoru seni tanır, alışkanlıklarını öğrenir ve doğru zamanda doğru desteği verir.

## ✨ Temel Özellikler

- **📋 Kanban Görev Yönetimi** — Trello benzeri sürükle-bırak pano (4 sütun: Bekleyen, Devam Eden, İncelemede, Tamamlanan)
- **📅 Akıllı Takvim** — Aylık/Haftalık/Günlük görünüm, etkinlik yönetimi, sürükle-bırak, sağ tık menüsü
- **📝 Yaratıcı Notlar** — AI destekli başlık ve kategori atama, kod bloğu desteği, zenginleştirme
- **🤖 AI Asistan** — Gemini destekli sohbet, görev planlama, motivasyon, not analizi
- **⏱️ Pomodoro Timer** — 25/5 dk zamanlayıcı, API ile süre kaydı
- **📊 Rapor & Analiz** — Günlük/haftalık performans raporları
- **🔔 Akıllı Bildirimler** — Yaklaşan görevlerden otomatik oluşan uyarılar
- **🌓 Dark/Light Mode** — Tam tema desteği

## 🏗️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS + Zustand + shadcn/ui |
| Backend | Python FastAPI + SQLAlchemy 2.0 (Async) + Pydantic v2 |
| Veritabanı | PostgreSQL (asyncpg) + Redis (planlı) |
| AI Motoru | Google Gemini API (Flash Lite + Pro + Imagen) |
| Altyapı | Docker Compose + WebSocket |
| Bot (planlı) | Telegram (python-telegram-bot) |

## 📁 Klasör Yapısı

```
2-My-World/
├── ARCHITECTURE.md   # 📐 Tek Kaynak Doküman (Tüm sistem bilgisi)
├── .env              # Gizli anahtarlar
├── docker-compose.yml
├── app/
│   ├── frontend/     # Next.js 15 uygulaması (Port 3000)
│   └── backend/      # FastAPI backend (Port 8000)
├── docs/             # Kişisel analiz ve planlar
├── data/             # Seed verileri (AI kişilik)
└── scripts/          # Yardımcı scriptler
```

## 🚀 Hızlı Başlangıç

```bash
# 1. Altyapıyı başlat
docker compose up -d

# 2. Backend
cd app/backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# 3. Frontend
cd app/frontend && npm run dev
```

Veya proje kökündeki **🚀 Sistemi Başlat.command** dosyasını çift tıklayın.

## 📖 Dokümanlar

- [ARCHITECTURE.md](ARCHITECTURE.md) — **Tam sistem mimarisi ve kuralları** (AI ajanları için tek kaynak)
- [Nihai Kişisel Analiz](docs/07-nihai-kisisel-analiz-raporu.md) — AI kişilik referansı

## 📋 Durum

- ✅ Dashboard (canlı saat, takvim, görevler, pomodoro, notlar, motivasyon)
- ✅ Kanban Görev Panosu (4 sütun, AI görev bölme, detay panel)
- ✅ Takvim Sayfası (3 görünüm, sürükle-bırak, etkinlik yönetimi)
- ✅ Notlar Sayfası (AI başlık/kategori, kod desteği, kategoriler)
- ✅ AI Chat Asistan (görev planlama, not analizi)
- ✅ Üst Navigasyon + Bildirim Sistemi
- 🔄 Telegram Bot Entegrasyonu
- 🔄 Rapor & Analiz geliştirmeleri
