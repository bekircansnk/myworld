"use client";

import { useState, useEffect } from 'react';

// Web ortamı için bağlantı durumu izleyici (Capacitor kaldırıldı)
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

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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
