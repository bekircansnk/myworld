"use client";

import { useState, useEffect, useCallback } from 'react';

// Web ve Capacitor ortamı için birleşik bağlantı durumu izleyici
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // İlk durumu kontrol et
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capacitor Network plugin desteği (native ortamda)
    let capacitorCleanup: (() => void) | null = null;
    
    (async () => {
      try {
        const { Network } = await import('@capacitor/network');
        const status = await Network.getStatus();
        setIsOnline(status.connected);
        
        const listener = await Network.addListener('networkStatusChange', (status) => {
          setIsOnline(status.connected);
        });
        capacitorCleanup = () => listener.remove();
      } catch {
        // Capacitor mevcut değilse web eventlarını kullan (zaten dinleniyor)
      }
    })();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (capacitorCleanup) capacitorCleanup();
    };
  }, []);

  return { isOnline };
}

// Global erişim için basit singleton
let _isOnline = true;

if (typeof window !== 'undefined') {
  _isOnline = navigator.onLine;
  window.addEventListener('online', () => { _isOnline = true; });
  window.addEventListener('offline', () => { _isOnline = false; });
}

export function getNetworkStatus(): boolean {
  return _isOnline;
}
