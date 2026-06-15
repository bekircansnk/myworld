"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

export function InstallAppBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    // Kapatıldıysa bu oturumda gösterme
    const dismissed = sessionStorage.getItem("apkBannerDismissed");
    if (dismissed === "true") {
      queueMicrotask(() => {
        if (!cancelled) setIsDismissed(true);
      });
      return () => {
        cancelled = true;
      };
    }

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);
    
    // Uygulama yüklü mü kontrolü (PWA/Standalone)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    
    // Capacitor (Native) içinden mi açılmış kontrolü
    const isNativeCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();

    // Eğer Android ise, ve PWA değilse, ve Capacitor Native değilse göster
    if (isAndroid && !isStandalone && !isNativeCapacitor) {
      queueMicrotask(() => {
        if (!cancelled) setIsVisible(true);
      });
      
      // 5 Dakika limiti
      const sessionStart = sessionStorage.getItem("apkBannerStartTime");
      const now = Date.now();
      const startTime = sessionStart ? parseInt(sessionStart, 10) : now;
      
      if (!sessionStart) {
         sessionStorage.setItem("apkBannerStartTime", startTime.toString());
      }
      
      const timeElapsed = now - startTime;
      const timeRemaining = (5 * 60 * 1000) - timeElapsed;
      
      if (timeRemaining <= 0) {
         queueMicrotask(() => {
           if (cancelled) return;
           setIsDismissed(true);
           sessionStorage.setItem("apkBannerDismissed", "true");
         });
      } else {
         timer = setTimeout(() => {
            if (!cancelled) {
              setIsDismissed(true);
              sessionStorage.setItem("apkBannerDismissed", "true");
            }
         }, timeRemaining);
      }
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
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
          <button
            onClick={async (e) => {
              e.preventDefault();
              try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://myworld-twqx.onrender.com";
                const res = await fetch(`${apiUrl}/api/app-version`, { cache: 'no-store' });
                if (res.ok) {
                  const data = await res.json();
                  const a = document.createElement("a");
                  a.href = data.download_url;
                  a.download = `Planla_v${data.version}.apk`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                } else {
                  window.open("https://myworld-twqx.onrender.com/static/Planla_v6.6.apk", "_blank");
                }
              } catch (err) {
                window.open("https://myworld-twqx.onrender.com/static/Planla_v6.6.apk", "_blank");
              }
              setTimeout(handleDismiss, 1000);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            İndir
          </button>
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
