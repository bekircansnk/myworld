# 📖 BAĞIMSIZ WORKSPACE VE AJAN REHBERİ (P0++ - EN ÜST ÖNCELİK)

Bu proje, ana monorepodan tamamen ayrıştırılmış ve **kendi başına bağımsız bir pnpm workspace** olarak yapılandırılmıştır. Tüm yapay zeka ajanları geliştirme yaparken bu rehberi mutlak kural olarak uygulamak zorundadır.

---

## 🏗️ 1. Proje Çalışma Yapısı
- Proje Workspace Dizin Kökeni: `/Users/bekir/Uygulamalarım/2-My-World/`
- Bu proje kendi bağımsız `pnpm-workspace.yaml` ve `pnpm-lock.yaml` dosyalarına sahiptir.
- Bağımlılık kurulumu (`pnpm install`) ve derleme (`pnpm build`) işlemleri **SADECE** bu dizin içerisinde çalıştırılmalıdır. Ana `/Users/bekir` dizininde herhangi bir kurulum çalıştırılamaz.

## ⚙️ 2. Geliştirme ve Kurulum Protokolü
1. **Bağımlılık Yükleme:**
   ```bash
   cd "/Users/bekir/Uygulamalarım/2-My-World"
   pnpm install
   ```
2. **Post-install ve Build İzinleri (pnpm v11+):**
   - pnpm v11+ sürümü gereği, güvenlik amacıyla üçüncü parti derleme scriptleri varsayılan olarak engellenmiştir.
   - Bu projenin kendi dizinindeki `pnpm-workspace.yaml` dosyası, `allowBuilds` haritası ile gerekli izinleri (esbuild, sharp vb.) yerel olarak tanımlamaktadır. Başka bir yere izin eklemeyiniz.

## 📦 3. Yardımcı ve Ortak Kod Paylaşımı
- `@shared/ortak-yapi` (monorepo symlink) bağımlılığı **tamamen kaldırılmıştır** ve kullanılması yasaktır.
- Ortak kod veya yardımcı araçlar (Örn: Excel, PDF dışa aktarma vb.) gerekirse doğrudan bu projenin kendi yerel dizinine (`src/utils/` veya muadili) kopyalanarak yerel import ile kullanılmalıdır.

## 🚨 4. Temizlik ve Kalıntı Kuralları (P0)
- Proje altında oluşan yerel `node_modules` ve `.next` klasörleri normaldir ve silinmemelidir.
- **Silme Yasağı:** Proje içerisindeki gereksiz/atıl dosyalar silinmez, doğrudan ortak çöp kutusu dizini olan `/Users/bekir/silinecekler_cop_kutusu/2-My-World/` altına taşınır.

## 🔗 5. Canlı Veritabanı ve Entegrasyonlar
- Tüm canlı veritabanı şifreleri, API bağlantıları ve gizli anahtarlar doğrudan [global-connections.md](file:///Users/bekir/.gemini/maestro/rules/global-connections.md) dosyasından okunmalıdır. Kod içerisine hardcoded yazılması kesinlikle yasaktır.

## 🤖 6. Google Jules Bulut Hesabı Zorunlu Kuralı (P0++ - KESİN KURAL)
- **Zorunlu Hesap:** Bu proje (`2-My-World` / `bekircansnk/myworld`) için çalıştırılacak TÜM Google Jules otomasyonları, zamanlanmış görevleri ve seansları **İSTİSNASIZ OLARAK SADECE `bekirsnk@gmail.com` / `bekirsnk34@gmail.com` (PRO Hesap 2)** hesabı üzerinden yürütülmek zorundadır.
- Başka bir Jules hesabı (örneğin CRM hesabı `sagnakbekircan@gmail.com`) bu projede KESİNLİKLE KULLANILAMAZ. Tüm betikler (`trigger_jules.py`, `archive_completed_jules.py`, `jules_batch_executor.py`) ve ajanlar bu anahtarı dinamik olarak `global-connections.md` Bölüm K'daki ikinci hesaptan okumakla yükümlüdür.

