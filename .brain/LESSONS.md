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

---

## 📌 BÖLÜM 2 — SÜREKLİ BEYİN EVRİMİ PROTOKOLÜ (P0++)

1. **Ajan Öz-Doğrulama ve Öğrenme Yasağı:** Ajan her kullanıcı uyarısı, hata teşhisi veya mimari karardan sonra beyin yapısını (`.brain/LESSONS.md` ve `/Users/bekir/.gemini/maestro/brain/`) **ANINDA GÜNCELLEMEK ZORUNDADIR**.
2. **Kalıcı Hafıza Teminatı:** Yeni bir sohbet başlasa dahi tüm ajanlar bu beyin kayıtlarını okur ve aynı hatayı iki kez tekrarlamaz.
