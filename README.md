# 🌍 My World — PikselAI Dashboard

**Yapay Zeka Destekli Kişisel Yaşam, İş ve Fotoğraf Takip Yönetim Sistemi**

> Sadece bir "yapılacaklar listesi" değil — seni tanıyan, yönlendiren ve motive eden akıllı bir yaşam orkestratörü. Çoklu kullanıcı (SaaS) desteği ve tam mobil uyumluluk ile her yerden erişilebilir.

---

## ✨ Öne Çıkan Özellikler & Yenilikler

- **📱 Tam Mobil Uyumluluk (Responsive & PWA)** — Tüm uygulama (Dashboard, Kanban, Takvim, Notlar, Chat, Venus Ads, Photo Tracking) mobil ekranlara özel optimize edildi. Alt navigasyon (Bottom Nav) eklendi.
- **📋 Mobil Uyumlu Kanban** — 3 Sütunlu (Yapılacak, Devam Eden, Tamamlanan) swipeable (kaydırılabilir) görev yönetimi. "İncelemede" durumu kaldırılarak akış sadeleştirildi.
- **📅 Gelişmiş Takvim** — Dokunmatik ekranlarda veri kaybı yaşatmayan akıllı sürükle-bırak desteği.
- **📊 Photo Tracking & Model Yönetimi** — Fotoğraf modellerinin durumları, renk şemaları, revizeleri ve tamamlanma süreçlerinin takibi.
- **📈 Venus Ads v2 & AI Rapor Merkezi** — Reklam KPI takibi, CSV/XLSX veri yükleme, Optimistic UI ve YapaySK destekli otomatik PDF rapor üretimi.
- **🔄 Çift Yönlü Excel Senkronizasyonu** — Veri kaybı olmadan Excel import/export işlemleri.
- **🤖 Proaktif AI Asistan** — Sabah/öğle/akşam zamanlamalı bildirimler ve koçluk.

---

## 🏗️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | Next.js 15 (App Router) · TypeScript · Zustand · shadcn/ui · Tailwind CSS |
| **Backend** | FastAPI · SQLAlchemy 2.0 · Python 3.14 · PostgreSQL (Neon Serverless) |
| **Email & Auth**| Resend API (OTP & Doğrulama) · JWT Tabanlı Kimlik Doğrulama |
| **AI** | Google Gemini API (Flash Lite) |
| **Excel** | openpyxl (Çift yönlü senkronizasyon) |

---

## 📁 Klasör Yapısı

```
2-My-World/
├── ARCHITECTURE.md     # Sistem mimarisi ve karar kaydı
├── AGENTS.md           # Projeye özel AI kuralları (GEMINI.md tabanlı)
├── app/
│   ├── web/            # Next.js 15 frontend
│   └── backend/        # FastAPI backend & SQLite DB
├── docs/               # Proje analizleri ve planlar
```

---

## 📜 Versiyon & Güncelleme Geçmişi

### v2.6.0 - Çevrimdışı PWA & Kurumsal Yetkilendirme
- **Çevrimdışı Çalışma (Offline-First):** PWA Serwist entegrasyonu, IndexedDB kuyruklama sistemi ile internet koptuğunda veriyi saklama ve bağlantı geldiğinde eşitleme.
- **Kurumsal Yetkilendirme (Firma Bazlı):** Bireysel "viewer/editor" rol sistemi tamamen kaldırılarak, izole "Firma (Proje)" tabanlı modern yetkilendirme altyapısına geçildi.
- **E-posta Altyapısı:** SMTP sorunları aşılarak Resend API'ye geçildi.
- **Body Caching Middleware:** FastAPI'de body tüketiminden kaynaklı 422 hatalarını kökten çözen ASGI ara katmanı eklendi.

### v2.5.0 - Mobil ve Stabilizasyon Çağı
- **Mobil Kanban Dönüşümü:** "İncelemede" durumu kaldırıldı, 3 sütunlu kaydırılabilir yapıya geçildi.
- **Mobil Arayüz Fixleri:** Dashboard widget çakışmaları giderildi, robot simgesi sağa gizlendi.
- **PWA & Bottom Nav:** Mobil kullanıcılar için uygulama deneyimi artırıldı.
- **Takvim Fixleri:** Dokunmatik ekranlarda veri kaybına yol açan drop event sorunları çözüldü.

### v2.0.0 - Excel & Veri Güvenliği
- **Çift Yönlü Excel:** Openpyxl ile veri kaybı yaşanmayan import/export altyapısı.
- **Veri Şeması Güçlendirme:** NULL boolean değerlerin handle edilmesi, model tamamlama sistemi.
- **Sosyal Medya & Revizeler:** Checkbox gecikmeleri giderildi, mükerrer renk ekleme sorunları çözüldü.

---

## ✅ Sistem Durumu

| Bileşen | Durum |
|---------|-------|
| Kurumsal (Firma) İzolasyon | ✅ Yayında |
| Çevrimdışı PWA & IndexedDB | ✅ Yayında |
| Resend Email Sistemi       | ✅ Yayında |
| Mobil Uyumlu Kanban        | ✅ Yayında |
| Dokunmatik Takvim | ✅ Yayında |
| PWA & Mobil Navigasyon| ✅ Yayında |
| AI Rapor Merkezi | ✅ Yayında |
| Photo Tracking | ✅ Yayında |

---
© 2026 My World Project.
