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
- State yönetimini (6 Zustand store)
- Frontend bileşen detayları ve dosya boyutları
- Bilinen sorunları ve TODO'ları
- Kodlama kurallarını
- Oto-güncelleme kurallarını

**tek bir dokümanda** barındırır.

**Dosya dosya tarama yapılmaz.** `ARCHITECTURE.md` okuması zorunludur — token tasarrufu ve hız için.

---

## 📋 OTO-GÜNCELLEME KURALI (SABİT & KRİTİK)

> **Bu kural her geliştirme oturumunda geçerlidir. İstisna yoktur.**

Her büyük geliştirme oturumu sonrasında (yeni özellik, sayfa, store, API, bileşen değişikliği vb.) aşağıdaki dosyalar mutlaka güncellenmelidir:

### 1. ARCHITECTURE.md Güncelleme
- İlgili bölüm (dosya yapısı, API haritası, store tablosu, bileşen detayları, tamamlanan/TODO listesi) güncelle
- Yeni dosya eklendiyse dosya ağacına ekle
- Yeni store/state eklendiyse State tablosuna ekle
- API değişikliği varsa endpoint haritasını güncelle
- Tamamlanan özellik varsa "Tamamlanan" listesine ekle
- En üstteki "Son Güncelleme" tarihini güncelle

### 2. Ne Zaman Güncelle
- Yeni bir bileşen dosyası oluşturulduğunda
- Mevcut bir store'a yeni field/metod eklendiğinde
- Yeni bir API endpoint eklendiğinde veya değiştirildiğinde
- Yeni bir veritabanı kolonu veya model eklendiğinde
- Navigasyon yapısı değiştiğinde
- Büyük UI değişiklikleri yapıldığında

### 3. Neden
AI ajanlarının her seferinde tüm dosyaları analiz etmek zorunda kalmaması için. Bu doküman okunarak sistemin tam görüntüsü alınabilir. **Token tasarrufu ve hız kazanımı kritiktir.**

---

## Teknoloji Listesi (Kısa)
- Backend: FastAPI + SQLAlchemy 2.0 + asyncpg + PostgreSQL + Google Gemini
- Frontend: Next.js 15 + TypeScript + Zustand (6 store) + shadcn/ui + Tailwind CSS
- Altyapı: Docker Compose (PG+Redis), WebSocket, Telegram Bot (planlı)

## Çalıştırma
```bash
docker compose up -d
cd app/backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000
cd app/frontend && npm run dev
```
