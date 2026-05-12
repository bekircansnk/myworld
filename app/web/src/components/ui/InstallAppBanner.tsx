"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

export function InstallAppBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;

    const dismissed = sessionStorage.getItem("apkBannerDismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      return;
    }

    const isAndroid = /android/i.test(navigator.userAgent);
    
    // Uygulama yüklüyse (PWA/Standalone) veya WebView içindeyse gizle (Native app)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isWebView = /(wv|Version\/\d+.\d+.*Chrome\/\d+.\d+.\d+.\d+.*Mobile)/i.test(navigator.userAgent) || !!(window as any).Capacitor;

    if (isAndroid && !isStandalone && !isWebView) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("apkBannerDismissed", "true");
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-full duration-500 print:hidden">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-500/20 p-4 flex items-center justify-between gap-4 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-dark dark:text-white">Android Uygulaması</h4>
            <p className="text-xs text-slate-500 mt-0.5">Daha iyi deneyim için hemen indirin.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/MyWorld.apk"
            download="MyWorld.apk"
            onClick={() => setTimeout(handleDismiss, 1000)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            İndir
          </a>
          <button 
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
