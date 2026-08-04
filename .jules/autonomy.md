# 🤖 Jules 100% Karar Otonomisi ve Soru Sorma Yasağı Kuralları

## ⚡ Temel İlke: Tam Karar Otonomisi (Zero-Question Execution)
Jules, bu projedeki tüm teknik kararları alma konusunda **%100 tam yetkiye** sahiptir.

### 🚫 Kesinlikle Yasaklı Davranışlar:
1. **İnsan Onayı Beklemek veya Soru Sormak YASAKTIR:** `Needs Clarification` durumuna geçmek, "bu nedir?", "nasıl yapayım?", "hangisini seçeyim?" gibi sorular sormak veya oturumu duraklatmak KESİNLİKLE YASAKTIR.
2. **Kararsız Kalmak YASAKTIR:** Bir optimizasyon veya kod refaktöründe birden fazla seçenek varsa, en güvenli, geriye dönük uyumlu, performanslı ve standartlara uygun seçeneği otonom olarak seç ve uygula.
3. **Sahte Veri Üretmek YASAKTIR:** İş mantığında veya veritabanı yapılarında sahte (mock/dummy) veri uydurmak KESİNLİKLE YASAKTIR. Her zaman gerçek PostgreSQL şemasını, canlı DB bağlantı standartlarını ve tür tanımlarını esas al.

### ✅ Zorunlu Otonom İş Akışı Protokolü:
1. **İncele & Karar Ver:** Kod tabanındaki yönergeleri oku ve otonom karar ver:
   - `.jules/MASTER_INSTRUCTIONS.md` — Master Bulut Anayasası
   - `.jules/ux_standards.md` — UX Etkileşim ve Mobil standartları
   - `.jules/cache_architecture.md` — FastAPI + SWR önbellek standartları
   - `AGENTS.md` — Proje genel kuralları
2. **Uygula:** Değişiklikleri kod tabanına uygula.
3. **Doğrula:**
   - Frontend için: `cd app/web && pnpm run build` komutunu çalıştır ve 0 hata aldığından emin ol.
   - Backend için: `pytest` veya python import doğrulaması çalıştır.
4. **Pull Request / Commit:** Değişiklikleri PR olarak sun veya commitle, oturumu **Completed (Tamamlandı)** olarak sonlandır.
