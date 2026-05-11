Bu uygulama kuralları, `/Users/bekir/.gemini/GEMINI.md` adresindeki ANA SİSTEM KURALLARI'nı temel alır. Ajanlar önce ana kuralları okumalı, ardından bu dosyadaki projeye özel kuralları uygulamalıdır.

# 🌍 MY WORLD - PROJEYE ÖZEL KURALLAR (AGENTS.md)

## 🚀 HİPER HIZ VE OPERASYON
1. **Build Kontrolü:** Commit ve Push atmadan önce `npm run build` (frontend) ve backend kontrolleri yapılmalıdır. Hata varsa commit atılamaz.
2. **Otomatik Yayın:** Başarılı her görev sonunda `git commit` ve `git push` otomatik olarak yapılacaktır (Kullanıcıdan onay beklemeden).

## 💻 Teknoloji Yığını & Klasör Yapısı
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Zustand (`app/web/`)
- **Backend:** FastAPI, Python 3.14, SQLAlchemy, SQLite (`app/backend/`)
- **Mobil:** PWA Desteği, Capacitor Entegrasyonu (Planlanan/Hazırlık)

## 🚫 BROWSER DİALOG YASAĞI (CRITICAL)
- `confirm()`, `prompt()`, `alert()` gibi tarayıcı nativa dialog'ları KESİNLİKLE KULLANILAMAZ.
- Silme, düzenleme, ekleme gibi tüm kullanıcı etkileşimleri uygulamanın kendi temasına uygun **in-app modal/dialog** bileşenleri ile yapılmalıdır.
- Mevcut `ConfirmDialog` bileşeni (`@/components/ui/ConfirmDialog`) kullanılmalıdır.
- Metin girişi gereken yerlerde özel `InlineEditModal` veya benzeri in-app bileşenler oluşturulmalıdır.

## 🔐 YETKİLENDİRME MİMARİSİ
- Kullanıcı bazlı "Sistem Rolü" (viewer/editor/admin) yetkilendirmesi **KALDIRILMIŞTIR**.
- Tüm yetkilendirme **firma bazlı** yapılır: `Firmalar & İzinler` panelinden kullanıcıya firma atanır ve modül izinleri firma üzerinden verilir.
- Admin/editor kullanıcılar kendi firmalarını oluşturabilir ve oluşturdukları firmada tam yetkiye sahip olur.
- `UserDetailPanel` üzerinde sadece kişisel bilgiler ve şifre işlemleri bulunur, rol seçimi yoktur.

## 📱 Mobil Uyumluluk & UI Kuralları
- Uygulama %100 mobil uyumlu (Responsive) olmalıdır.
- **Kanban:** Mobil ekranlarda swipeable (kaydırılabilir) 3 sütun (Yapılacak, Devam Eden, Tamamlanan). "İncelemede" durumu kaldırılmıştır.
- **Bottom Nav:** Mobil cihazlarda ana navigasyon ekranın alt kısmındadır.
- **Takvim:** Dokunmatik sürükle-bırak (Drag & Drop) özellikleri sorunsuz çalışmalıdır.

## 🔄 Veri & Senkronizasyon
- **Excel Entegrasyonu:** `openpyxl` ile çift yönlü, veri kaybı olmadan senkronizasyon sağlanır.
- **Photo Tracking:** Model tamamlama, revize adetleri ve notları sağlam bir şema ile yönetilir.
