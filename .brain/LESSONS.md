# 🧠 PLANLA (2-MY-WORLD) — PROJE BEYNİ VE ÖĞRENİLEN DERSLER (.brain/LESSONS.md)

> Bu dosya Planla projesinde yaşanan sorunlar, teşhis edilen kök nedenler ve geliştirilen kalıcı çözümler için canlı hafıza dokümanıdır.

---

## 📌 BÖLÜM 1 — BEYİN VE ANAYASAL DERSLER

### L-01 — Hibrit API Key Rotasyonu ve Canlı Sesli Çeviri Fallback Mimarisi (04.08.2026)
- **Sorun:** Güvenlik ve secret taramalarında `app/web/src/lib/geminiKeys.ts` içerisindeki Base64 key'lerin silinip sadece tek bir `process.env.API_KEY` konulması fikri.
- **Teşhis:** Canlı Sesli Çeviri (Gemini Live WebSocket) modülü HTTP 429 Rate Limit durumunda `rotateGeminiApiKey()` çalıştırır. Fallback dizisi silindiğinde modül çöker ve rotasyon yeteneği kaybolur.
- **Çözüm:** Hibrit Kademeli Mimari (`process.env` 1. Öncelik, Base64 Fallback 2. Öncelik). `geminiKeys.ts` içerisinde her iki katman da korunmuştur.
- **Anayasal Kural:** `.jules/MASTER_INSTRUCTIONS.md` Kural 5 ve `MASTER_ANTIPATTERNS.md` AP-33 olarak beyne eklenmiştir.

### L-02 — Vercel Otomatik Önizleme Derleme İptali (Build Shield)
- **Sorun:** Jules tarafından açılan her mikro-branşın Vercel üzerinde 100/günlük kotayı tüketmesi.
- **Çözüm:** `vercel.json` ve `scripts/vercel_ignore.sh` ile `jules-*` dallarındaki derlemeler `exit 0` ile anında iptal edilir. `jules_batch_executor.py batch-merge` ile tek commit olarak canlıya alınır.

### L-03 — Sayfa Kabuğu Modüler Ayrıştırma (`page.tsx` Shell Architecture) (04.08.2026)
- **Sorun:** `app/web/src/app/page.tsx` 300+ satırlık dev monolit haline gelerek routing, state ve boştakayma zamanlayıcılarını karmaşıklaştırıyordu.
- **Çözüm:** `page.tsx` 6 satırlık ultra hafif bir sayfa kabuğuna (`<MainViewShell />`) düşürüldü. Mantık `src/components/dashboard/MainViewShell.tsx` modülüne aktarıldı. `page.tsx` dosyasının 50 satırı geçmesi anayasal kural olarak engellendi.

### L-04 — React Portal Mimarisi ve Dynamic SSR Hydration (`createPortal`) (04.08.2026)
- **Sorun:** Detay panelleri ve komut paletleri (`CommandPaletteModal`) üst kapsayıcıların `overflow: hidden` kuralı nedeniyle mobilde taşamıyordu.
- **Çözüm:** Tüm popover, modal ve komut paletleri `createPortal(content, document.body)` ile doğrudan `document.body` üzerine asıldı. Next.js SSR için `typeof document !== "undefined"` şartı uygulandı.

### L-05 — Android WebView Touch Performance ve Glassmorphism Override (04.08.2026)
- **Sorun:** Mobilde `.glass-card` ve `.floating-card` bileşenlerindeki ağır `backdrop-filter: blur(...)` GPU kasılmasına ve kaydırma lag'ine yol açıyordu.
- **Çözüm:** `globals.css` içerisindeki dokunmatik cihaz backdrop-blur override kuralına `.glass-card, .floating-card, .glass-panel, .glass-sidebar` sınıfları dahil edildi.

### L-06 — Strict `DD.MM.YYYY` Tarih Standartlaştırması ve Zero-Emoji Anayasası (04.08.2026)
- **Sorun:** Koddaki ham unicode emojiler (`📌`, `📅`, `⚡`, `📝`, `✅`, `💬`, `🎉`) ve değişken tarih formatları (`14 Eki 2024`) görsel tutarsızlık yaratıyordu.
- **Çözüm:** Emojiler `lucide-react` ikonlarıyla değiştirildi. Tüm tarihler strict `DD.MM.YYYY` / `DD.MM.YYYY HH:mm` biçimine çekildi.

### L-07 — Vercel Otomatik Yan Dal Derleme Engeli (`scripts/vercel_ignore.sh`) (04.08.2026)
- **Sorun:** Jules veya harici otomasyonların açtığı `palette-*`, `jules-*` gibi yan dalların Vercel tarafından otomatik Preview Build olarak tetiklenip derleme kotasını tüketmesi.
- **Teşhis:** Vercel projesinde varsayılan olarak tüm git dallarına otomatik preview build açıktır. `vercel.json` içerisinde `ignoreCommand` tanımlanmadığı için her commit Vercel'e girmekteydi.
- **Çözüm:** `scripts/vercel_ignore.sh` oluşturuldu. `app/web/vercel.json` ve kök `vercel.json` dosyalarına `"ignoreCommand": "bash scripts/vercel_ignore.sh"` eklendi. `jules-*`, `palette-*` ve non-main dallarda betik `exit 0` (build cancel) verir. Sadece `main` dalındaki commit'lerde `exit 1` (build proceed) vererek kota tüketimini kalıcı olarak sıfırlar.

---

## 📌 BÖLÜM 2 — SÜREKLİ BEYİN EVRİMİ PROTOKOLÜ (P0++)

1. **Ajan Öz-Doğrulama ve Öğrenme Yasağı:** Ajan her kullanıcı uyarısı, hata teşhisi veya mimari karardan sonra beyin yapısını (`.brain/LESSONS.md` ve `/Users/bekir/.gemini/maestro/brain/`) **ANINDA GÜNCELLEMEK ZORUNDADIR**.
2. **Kalıcı Hafıza Teminatı:** Yeni bir sohbet başlasa dahi tüm ajanlar bu beyin kayıtlarını okur ve aynı hatayı iki kez tekrarlamaz.

### [MUHURLENMIS POSTFLIGHT] 2026-09-12T16:56:46.272225 | Token: a589ac1896dc908f
- **Proje**: 2-My-World
- **Delta Derleme**: Baseline 0 -> Mevcut 0 (Delta: +0)
- **Sig-Is Denetimi**: 0 Ihlal (KURAL 11, Sifir Emoji, Veri Dokunulmazligi kanitlandi)
- **LIFO Kalinti**: 0 Sahipsiz Gecici Dosya
- **Sonuc**: POSTFLIGHT GATE GECTI VE MUHURLENDI
