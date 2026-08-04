# 🏛️ 360° MASTER EXCELLENCE & ARCHITECTURE REFACTORING PLAN

> **Proje:** Planla (2-My-World)  
> **Kapsam:** `/360-tasarim-uzmani`, `/360-hata-uzmani`, `/360-yeni-modul`, `/360-mobil-uzmani`, `/360-refaktor-uzmani`, `/360-arastirma-uzmani`  
> **Tarih:** 04.08.2026  

---

## 🎯 1. Genel Bakış ve Amaç

Bu plan, **Planla (`2-My-World`)** uygulamasını 2026 modern web standartlarına, **Maestro Ana Beyin Anayasası v2.0.0** ilkelerine ve **5 Uzmanlık Master Bundle'ına** (`Tasarım`, `Hata`, `Yeni Modül`, `Mobil`, `Refaktör`) tam uyumlu hale getirmek için hazırlanmıştır.

---

## 📋 4-Aşamalı İcra Haritası (Execution Roadmap)

### FAZ 1: Mimari & Modüler Refaktör (`/360-refaktor-uzmani`)
- `app/web/src/app/page.tsx` dosyasını 50 satır altına düşür. Logic'i `MainViewShell.tsx` bileşenine ayır.
- Dev `DashboardWidgets.tsx` (~1200 satır) dosyasını `widgets/` altındaki modüler kartlara böl.
- Dev `TopNavbar.tsx` (~1000 satır) dosyasını `TopNavbarHeader.tsx` ve `UserMenuPopover.tsx` bileşenlerine ayır.
- TypeScript `any` tiplerini kaldır, strict interface yapısına bağla.

### FAZ 2: UI/UX & Mobil Uyum (`/360-tasarim-uzmani` & `/360-mobil-uzmani`)
- Unicode emojileri `lucide-react` simgeleriyle değiştir.
- Tüm tarih gösterimlerini strict `DD.MM.YYYY` veya `DD.MM.YYYY HH:mm:ss` formatına eşitle.
- Tıklanabilir buton ve ikon alanlarını minimum **44x44px** seviyesine getir.
- Kanban ve sürüklenebilir listelerde `touch-action: pan-x pan-y` ve `overscroll-behavior-y: contain` uygula.
- Modal ve popover'ları `createPortal(content, document.body)` üzerine as.

### FAZ 3: Yeni Modüller & WOW-Factor Özellikler (`/360-yeni-modul`)
- **Command Palette (`Cmd+K` / `Ctrl+K`):** Görev, proje ve takvim içinde anında arama ve hızlı aksiyon paleti.
- **Bento Grid KPI Kartları:** Tamamlanan görev oranları ve performans için modern cam estetiği (Glassmorphism) Bento Grid.
- **Akıllı NLP Hızlı Görev Girişi:** "Yarın 15:00 Ali ile toplantı" metninden tarihi ve başlığı otonom ayrıştıran hızlı görev kutusu.

### FAZ 4: Hata Taraması & 0-Error Build Gate (`/360-hata-uzmani`)
- `cd app/web && pnpm run build` ile 0 TypeScript hatasını kanıtla.
- Canlı backend (`/api/app-version`) ve frontend rotalarını test et.
