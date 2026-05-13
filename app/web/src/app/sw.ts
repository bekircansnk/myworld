// Service Worker — App Shell önbellekleme ve offline destek
// API istekleri ASLA önbelleklenmeyecek şekilde yapılandırıldı (mobilde veri görünmeme hatası fix)
import { Serwist, NetworkFirst, CacheFirst, StaleWhileRevalidate, NetworkOnly, ExpirationPlugin } from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  // Build sırasında enjekte edilen önbellek listesi (JS, CSS, HTML)
  precacheEntries: self.__SW_MANIFEST,
  // Yeni SW aktif olduğunda hemen devreye al
  skipWaiting: true,
  // Tüm açık sekmelerde hemen kontrol al
  clientsClaim: true,
  // Navigation preload ile hızlı ilk yükleme
  navigationPreload: true,
  // ÖZELLEŞTİRİLMİŞ CACHE KURALLARI
  runtimeCaching: [
    // ============================================================================
    // KRİTİK (1. ÖNCELIK): API istekleri ASLA önbelleklenmeyecek
    // Hem aynı origin (/api/*) hem Render.com farklı origin kapsanıyor
    // Bu kural EN BAŞTA olmalı — başka hiçbir kural API isteklerini yakalamasın
    // ============================================================================
    {
      matcher: ({ url }: { url: URL }) =>
        url.pathname.startsWith('/api/') ||
        url.href.includes('/api/') ||
        url.hostname.includes('onrender.com'),
      handler: new NetworkOnly(),
    },
    // Google Fonts (Web fontları) — 1 yıl önbellekle (statik dosya, değişmez)
    {
      matcher: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [new ExpirationPlugin({
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        })],
      }),
    },
    // Google Fonts (Stylesheet) — Stale-while-revalidate
    {
      matcher: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: new StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [new ExpirationPlugin({
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        })],
      }),
    },


    // Geri kalan her şey (statik dosyalar vs.) — ağ öncelikli
    {
      matcher: /.*/i,
      handler: new NetworkFirst({
        cacheName: "others",
        plugins: [new ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60,
        })],
        networkTimeoutSeconds: 10,
      }),
    },
  ],
});

serwist.addEventListeners();
