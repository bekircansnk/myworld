# 💡 Keşif ve İlham Raporu — 2-My-World Jules Bundle ve Otonom Mimari

> **Proje:** Planla (2-My-World)  
> **Tarih:** 04.08.2026  
> **Kapsam:** /360-arastirma-uzmani Çok Ajanlı Derin Araştırma & WOW-Factor Fikirler

---

## 1. İncelenen Kaynaklar & Açık Kaynak Çözümler

| Kaynak / Platform | Bağlantı / Referans | Öne Çıkan Özellik / İlham |
| :--- | :--- | :--- |
| **`6-Crm Panel` Jules Infrastructure** | Local Codebase (`/6-Crm Panel/.jules`) | Vercel Ignore Command (`vercel_ignore.sh`), `%100 Karar Otonomisi`, `batch-merge` CLI |
| **Google Jules & Agentic AI Best Practices 2026** | `github.com/google-gemini/cookbook` | `AGENTS.md` context engineering, defining "done" criteria, task-driven async PR workflow |
| **Vercel Deployment Protection Docs** | `vercel.com/docs/deployments/configure-a-build` | `git.deploymentEnabled` branch filters and custom shell script build cancellation |
| **Autonomous Verification Gates (DPEV)** | Industry AI Agent Engineering Standards | Stopping hooks, deterministic test evidence, verifier agent separation |
| **Monorepo Agent Governance** | pnpm Workspaces & Turborepo Guidelines | Path-based CI triggering, lockfile frozen verification, affected package builds |

---

## 2. Dünyada İnsanlar Neler Yapıyormuş (WOW-Factor Fikirler)

1. **Vercel Build Shield (Vercel Kota Kalkanı):**
   - *Açıklama:* AI ajanları gece boyunca onlarca PR veya commit ürettiğinde Vercel dakikaları ve build kotaları 10 dakikada tükenebilir. `vercel_ignore.sh` ile `jules-*` branşlarında derlemeyi anında iptal edip (`exit 0`), sadece `main` branşı birleştirmelerinde Vercel yayını tetiklenir.
   - *Kaynak:* Vercel Official Build Ignore Docs & `6-Crm Panel` Mimarisi.

2. **Self-Enforcing Verification Gate Proofs (Kanıt Tabanlı Bitiriş):**
   - *Açıklama:* Ajanın "bence sorun yok, yaptım" demesine güvenmek yerine; ajandan `cd app/web && pnpm run build` komutunu çalıştırıp derleme çıktısındaki "0 errors" ve log hash'ini PR açıklamasında veya changelog'da *kanıt* olarak sunması istenir.
   - *Kaynak:* Autonomous Agent Verification Standards (2026).

3. **Stacked Micro-PR Batching (PR Harmanlama Engine):**
   - *Açıklama:* Ajanların açtığı 5 ayrı PR'ı tek tek insan gözüyle inceleyip Vercel'e göndermek yerine; `jules_batch_executor.py batch-merge` aracı tüm Jules PR'larını sırayla `squash merge` yapar, tek bir yerel derleme kapısından geçirip tek bir commit olarak `main`'e aktarır.
   - *Kaynak:* `6-Crm Panel/scripts/jules_batch_executor.py`.

4. **Zero-Emoji Governance & Professional Logs:**
   - *Açıklama:* AI modellerinin varsayılan olarak ürettiği emoji gürültüsü (`🚀`, `✨`, `🔥`) logları ve git geçmişini aşırı kirletir. `MASTER_INSTRUCTIONS.md` içerisine eklenen `Zero-Emoji Directive` ile temiz, kurumsal ve erişilebilir Markdown çıktısı garanti edilir.
   - *Kaynak:* Global Ana Beyin `MASTER_ANTIPATTERNS.md` (AP-F03).

5. **100% Karar Otonomisi & Soru Sorma Yasağı (Zero-Question Execution):**
   - *Açıklama:* Gece otomasyonlarında ajanın "Needs clarification" durumuna düşüp soru sorarak duraklaması iş akışını kilitler. `.jules/autonomy.md` rehberi ajana mimari kararları otonom alma ve en güvenli/performanslı seçeneği uygulayıp oturumu tamamlama yetkisi verir.
   - *Kaynak:* `6-Crm Panel/.jules/autonomy.md`.

---

## 3. Eklenebilecek AI & Otomasyon Fırsatları

- **Dinamik PRO2 Hesap Anahtarı Çekimi:** `scripts/trigger_jules.py` ve `scripts/auto_trigger_queue.py` scriptlerinin API key'i koda hardcoded yazmak yerine `/Users/bekir/.gemini/maestro/rules/global-connections.md` Vault veya `JULES_API_KEY` ortam değişkeninden dynamically okuması (GitHub Secret Protection %100 Uyum).
- **Zamanlanmış Gece Gezintisi (Night Suite):** Gece 02:00 - 05:00 UTC arasında sırasıyla Security Audit, Build Health, Dead Code Cleanup ve Docs Sync görevlerinin otonom olarak tetiklenmesi.

---

## 4. Modern UI/UX & PWA İpuçları (2-My-World Özelinde)

- **44x44px Touch Targets:** PWA & Mobil ekranlarda tüm buton ve tıklanabilir alanların dokunmatik ekran standartlarına (minimum 44x44px) uygun tutulması.
- **Rubber-Band Scroll Kilitleri:** Mobil Safari/Android tarayıcılarda sayfa başı/sonu kaydırmalarındaki aşırı elastik kaymaları önlemek için CSS safe-area ve viewport kilitleri.
- **NoActionBar Android Teması:** Android tarafında Capacitor splash screen sonrası istenmeyen beyaz header bar'ın görünmesini engelleyen `Theme.AppCompat.Light.NoActionBar` stili.

---

## 5. Anayasal Uyum Kontrolü

- **`MASTER_ANTIPATTERNS.md` Kuralları:**
  - AP-02 (Hardcoded Secret Yasağı): Kodlarda raw API Key saklanamaz.
  - AP-04 (Build Yokken Push Yasağı): Her PR harmanlaması öncesi `pnpm run build` şart.
  - AP-F03 (Unicode Emoji Yasağı): Arayüz ve changelog çıktılarında emoji kullanılmaz.
  - AP-F04 (ISO Tarih Yasağı): Tüm tarihler `DD.MM.YYYY` formatındadır.
- **`MASTER_PATTERNS.md` Kalıpları:**
  - PAT-O01 (Build Gate → Commit Zinciri): Derleme testi geçmeden commit yapılmaz.
  - PAT-M01 (Capacitor NoActionBar): Android stili NoActionBar olarak ayarlanır.
