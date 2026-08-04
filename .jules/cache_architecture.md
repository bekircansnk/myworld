# 🗄️ Jules Önbellekleme ve Performans Denetim Kuralları

## 📌 Mimari İlke: SWR (Stale-While-Revalidate) + FastAPI Caching

Planla (2-My-World) uygulamasında kullanıcıyı bekletmek veya mükerrer HTTP istekleriyle sunucuya yük bindirmek KESİNLİKLE YASAKTIR.

### 🏗️ Önbellek Katmanları:
1. **İstemci Katmanı (Frontend Client SWR):**
   - Hızlı sekme geçişlerinde ve mükerrer tıklamalarda istemci belleğinden anında yanıt verir (~0ms).
   - `dedupingInterval: 30000` (30 saniye deduplication).
2. **Backend RAM / Response Cache:**
   - FastAPI tarafında ağır sorgular ve static veriler RAM önbelleğinde saklanır.

### ⚠️ Denetim Kuralları:
- Her API çağrısında SWR veya `cachedFetch` mantığı gözetilmeli.
- Async FastAPI handler'larında kilitlenme olmamalı.
- Fallback UI (skeleton loader veya boş durum) her zaman sunulmalı.
