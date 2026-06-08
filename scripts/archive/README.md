# Arşivlenen Yardımcı Betikler

Bu dizinde projede kullanılan yardımcı, geçici veya otomasyon amaçlı geliştirilen betikler saklanmaktadır.

## Betik Listesi

### 1. `generate_web_icons.js`
- **Amaç:** `assets/icon.png` (en güncel premium 3D kart simgesi) kaynak resmini kullanarak web projesindeki favicon.ico, PWA WebP ikonları ve public icons klasöründeki PNG ikonlarını sharp kütüphanesiyle otomatik olarak yeniden üretir.
- **Kullanım Talimatı:**
  `app/web` dizini altından `pnpm run generate-icons` komutu çalıştırılarak tetiklenir (veya monorepo altından node ile çalıştırılır).
