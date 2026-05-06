// Service Worker — App Shell önbellekleme ve offline destek
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";
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
  // API istekleri için stale-while-revalidate stratejisi
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
