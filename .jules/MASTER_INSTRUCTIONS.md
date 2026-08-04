# 🏛️ PLANLA (2-MY-WORLD) — GOOGLE JULES MASTER BULUT ANAYASASI VE YETENEK KÜTÜPHANESİ

> **BU DOSYA GOOGLE JULES BULUT AJANI İÇİN EN ÜST DÜZEY MERKEZİ REHBERDİR.**
> Jules bulutta bir seans veya zamanlanmış görev başlattığında doğrudan bu dosyayı okur ve tüm anayasal kuralları, 6 Master Bundle talimatını ve 24 mikro-görevi %100 otonom uygular.
> **Jules Hesabı:** `bekirsnk@gmail.com` / `bekirsnk34@gmail.com` (PRO Hesap 2)

---

## 🚀 BÖLÜM 1: 100% KARAR OTONOMİSİ VE ÇALIŞMA İLKELERİ

1. **[CRITICAL DIRECTIVE - 100% DECISION AUTONOMY]**: Jules insansız oturumlarda soru sormaz (`Needs clarification` durumuna düşmez). Tüm mimari kararları bu anayasaya göre kendisi otonom alır.
2. **[ZERO MOCK DATA RULE]**: Jules asla sahte/mock veri üretmez. Her zaman canlı Neon PostgreSQL / FastAPI yapısıyla tam uyumlu çalışır.
3. **[VERIFICATION GATE & CHANGELOG]**: Jules yaptığı her kod değişikliğinden sonra `cd app/web && pnpm run build` (0 Hata) ve `pytest` koşturur; ardından [docs/jules/JULES_CHANGELOG.md](file:///Users/bekir/Uygulamalarim/2-My-World/docs/jules/JULES_CHANGELOG.md) dosyasına standart Türkçe şablonla kayıt düşer.
4. **[ZERO EMOJI RULE]**: Koddalarda, commit mesajlarında, changelog kayıtlarında me unicode emoji KULLANILAMAZ. Yalnızca Lucide-react simgeleri veya SVG kullanılır.
5. **[HYBRID GEMINI KEY FALLBACK RULE]**: `app/web/src/lib/geminiKeys.ts` dosyasında `process.env` (ör. `NEXT_PUBLIC_GEMINI_KEYS`) önceliklidir; ancak Canlı Sesli Çeviri (WebSocket Live Audio) modülünün çökmeksizin çalışması ve 429 Rate Limit durumunda otomatik rotasyon yapabilmesi için hibrit base64 fallback yapısı ve `rotateGeminiApiKey()` fonksiyonu KORUNMALIDIR.


---

## 🏛️ BÖLÜM 2: MAESTRO SİSTEM ANAYASASI (KURAL 0 - KURAL 14)

### KURAL 0 — ORTAK BİLEŞEN HARİTASI (P0++)
Yeni UI bileşeni uydurmak yasaktır. Projedeki mevcut ortak bileşenler kullanılmalıdır.

### KURAL 1 — TARİH VE SAAT STANDART FORMATI (P0++)
- Arayüzlerde ISO formatı (`YYYY-MM-DD`) KESİNLİKLE yasaktır.
- Tüm tarihler `DD.MM.YYYY` veya `DD.MM.YYYY HH:mm:ss` formatında olmalıdır.

### KURAL 2 — REACT PORTAL VE OVERFLOW KORUMASI (P0++)
- Tüm dropdown, modal ve popover'lar `createPortal(content, document.body)` ile gövdeye asılmalıdır.
- Parent container `overflow: hidden` nedeniyle menü kesilmelerine izin verilemez.

---

## 📦 BÖLÜM 3: 6 MASTER PROMPT BUNDLE KATALOĞU

| Bundle Slug | Kapsam | İlgili Mikro-Görevler |
| :--- | :--- | :--- |
| **`master-security`** | Güvenlik, Secret Scanner, Auth Flow | P1 (Secret), P2 (Vuln), P3 (Auth), P4 (CORS) |
| **`master-performance`** | Bundle Boyutu, Async Rotalar, SWR Cache | P5 (Bundle), P6 (Response), P7 (Query), P8 (SWR) |
| **`master-quality`** | Temizlik, Strict Types, God Components | P9 (Dead Code), P10 (Strict TS), P11 (God Component), P12 (ESLint) |
| **`master-health`** | API Health Test, Build Gate, Offline Sync | P13 (API Health), P14 (Build Gate), P15 (E2E), P16 (Offline Sync) |
| **`master-mobile`** | Touch Targets (44px), PWA SW, Capacitor | P17 (Touch Area), P18 (Service Worker), P19 (Capacitor NoActionBar), P20 (Rubber-band) |
| **`master-docs`** | OpenAPI Sync, README, DB Migration | P21 (OpenAPI Sync), P22 (README), P23 (Alembic DB), P24 (Changelog) |

---

*Planla (2-My-World) — Jules Master Bulut Anayasası v2.0.0*
