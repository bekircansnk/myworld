# 🌍 My World — PikselAI Dashboard

**Yapay Zeka Destekli Kişisel Yaşam ve İş Yönetim Sistemi**

> Sadece bir "yapılacaklar listesi" değil — seni tanıyan, yönlendiren ve motive eden akıllı bir yaşam orkestratörü. Çoklu kullanıcı (SaaS) desteği ile her yerden erişilebilir.

---

## 🔗 Canlı Uygulama

**➜ [https://pikselai-dashboard.vercel.app](https://pikselai-dashboard.vercel.app)**

---

## ✨ Özellikler

- **🔐 Güvenli Erişim** — JWT tabanlı üyelik, profil ve avatar yönetimi
- **🛡️ Veri İzolasyonu** — Her kullanıcı için tamamen izole proje, görev ve notlar
- **📋 Kanban Görev Yönetimi** — AI destekli alt görev oluşturma ve durum takibi
- **📅 Takvim** — Bulut senkronizasyonlu, sürükle-bırak ve görev entegrasyonlu
- **📝 Akıllı Notlar** — AI ile otomatik başlık ve kategori atama
- **📈 Venus Ads v2** — Reklam KPI takibi, CSV veri yükleme ve **Optimistic UI (Işık Hızında Güncelleme)**
- **🔗 Akıllı Bağlantılar** — Kampanyalar, Testler ve Kreatifler arası tek tıkla navigasyon
- **🤖 Proaktif AI Asistan** — Sabah/öğle/akşam zamanlamalı bildirimler ve koçluk
- **⏱️ Pomodoro Timer** — Odaklanma sürelerini kaydeden zamanlayıcı
- **📊 Performans Analizi** — AI tarafından hazırlanan günlük ve haftalık raporlar
- **🌓 Dark / Light Mode** — Glassmorphism tasarım dili

---

## 🏗️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | Next.js 15 (App Router) · TypeScript · Zustand · shadcn/ui |
| **Backend** | FastAPI · SQLAlchemy 2.0 Async · Pydantic v2 · JWT |
| **Veritabanı** | PostgreSQL (Neon — serverless) |
| **AI** | Google Gemini Flash Lite |
| **Deploy** | Vercel (frontend) · Render (backend) |

---

## 📁 Klasör Yapısı

```
2-My-World/
├── ARCHITECTURE.md     # Sistem mimarisi ve karar kaydı
├── app/
│   ├── web/            # Next.js 15 frontend
│   └── backend/        # FastAPI REST API & WebSocket
├── data/
│   └── seed/           # AI kişilik ve koçluk çerçevesi
└── docs/               # Proje analizleri ve planlar
```

---

## ✅ Mevcut Durum

| Bileşen | Durum |
|---------|-------|
| SaaS Auth & Veri İzolasyonu | ✅ Canlıda |
| Kanban Board + AI Breakdown | ✅ Canlıda |
| Takvim Gezgini | ✅ Canlıda |
| Not Sistemi | ✅ Canlıda |
| Proaktif AI Asistan | ✅ Canlıda |
| Avatar (Base64 / DB) | ✅ Canlıda |
| Rapor & Analiz | ✅ Canlıda |
| Telegram Bot | 🔄 Geliştirmede |

---

© 2026 My World Project. Tüm hakları saklıdır.
