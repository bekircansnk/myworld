# 📱 Jules Mobil & PWA UX Standartları

## 📌 Mobil & PWA Standartları

1. **Minimum 44x44px Touch Target:**
   - Mobil ve dokunmatik ekranlarda tüm tıklanabilir buton ve ikon alanları en az 44x44px olmalıdır.

2. **NoActionBar Android Teması:**
   - Android tarafında Capacitor splash screen sonrası header barda beyaz başlık alanı kalmamalıdır (`Theme.AppCompat.Light.NoActionBar`).

3. **Rubber-Band Scroll Kilitleri:**
   - iOS Safari / Android WebView aşırı kaydırmalarında body scroll kilitleri (`overscroll-behavior-y: none`) uygulanmalıdır.

4. **Zero Unicode Emoji:**
   - Arayüz elemanlarında unicode emoji kullanılamaz. Tüm ikonlar `lucide-react` veya SVG bileşenleri olmalıdır.
