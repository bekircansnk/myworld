# My World — Proje Bazlı AI Konfigürasyonu

> **BU DOSYA PROJE BAZLI KURALLAR İÇERİR.**
> Merkezi kurallar `/Users/bekir/.gemini/GEMINI.md` dosyasındadır.

---

## ⚡ TEK KURAL: ÖNCE ARCHITECTURE.md OKU

Bu projeye adım atan bir AI ajanı **kesinlikle** yapması gereken ilk şey:

```
/Users/bekir/Uygulamalarım/2-My-World/ARCHITECTURE.md
```

dosyasını okumaktır. Bu dosya:
- Tüm tech stack'i
- Dosya yapısını ve sorumlulukları
- API endpoint haritasını
- Veritabanı şemasını
- AI sistemi mimarisini
- State yönetimini
- Bilinen sorunları ve TODO'ları
- Kodlama kurallarını

**tek bir dokümanda** barındırır.

**Dosya dosya tarama yapılmaz.** `ARCHITECTURE.md` okuması zorunludur — token tasarrufu ve hız için.

---

## Teknoloji Listesi (Kısa)
- Backend: FastAPI + SQLAlchemy + asyncpg + PostgreSQL + Google Gemini
- Frontend: Next.js 15 + TypeScript + Zustand + shadcn/ui + Tailwind CSS
- Altyapı: Docker Compose (PG+Redis), WebSocket, Telegram Bot

## Çalıştırma
```bash
docker compose up -d
cd app/backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000
cd app/frontend && npm run dev
```
