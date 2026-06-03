"use client";

import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '@/lib/networkStatus';
import { processQueue, getPendingCount } from '@/lib/syncQueue';
import { useTaskStore } from '@/stores/taskStore';
import { useCalendarStore } from '@/stores/calendarStore';
import { useProjectStore } from '@/stores/projectStore';
import { Wifi, WifiOff, RefreshCw, Check } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export function OfflineBanner() {
  const toast = useToast();
  const { isOnline } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // Bekleyen işlem sayısını takip et (30 saniye aralıkla)
  useEffect(() => {
    const checkPending = async () => {
      const count = await getPendingCount();
      setPendingCount(count);
    };
    checkPending();
    const interval = setInterval(checkPending, 30000);
    return () => clearInterval(interval);
  }, []);

  // Çevrimdışı durumunu takip et
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    }
  }, [isOnline]);

  // İnternet geldiğinde veya internet varken bekleyen işlem olduğunda otomatik senkronize et
  useEffect(() => {
    if (isOnline && (wasOffline || pendingCount > 0) && !isSyncing) {
      syncData();
    }
  }, [isOnline, wasOffline, pendingCount, isSyncing]);

  const syncData = async () => {
    setIsSyncing(true);
    try {
      // Kuyruktaki işlemleri gönder
      const result = await processQueue();
      
      // Taze veriyi API'den çek (Bulunulan proje context'ini koru)
      const currentProjectId = useProjectStore.getState().selectedProjectId;
      await Promise.allSettled([
        useTaskStore.getState().fetchTasks(currentProjectId || undefined),
        useCalendarStore.getState().fetchEvents(),
        useProjectStore.getState().fetchProjects(),
      ]);

      const count = await getPendingCount();
      setPendingCount(count);

      if (result.success > 0 || wasOffline) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setWasOffline(false);
        }, 3000);
      } else {
        setWasOffline(false);
      }
    } catch (error) {
      console.error('Senkronizasyon hatası:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Çevrimiçi ve normal durum → banner gösterme
  if (isOnline && !showSuccess && !isSyncing && pendingCount === 0) {
    return null;
  }

  return (
    <div className={`shrink-0 flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium transition-all duration-500 ${
      !isOnline
        ? 'bg-amber-500/90 text-white'
        : isSyncing
          ? 'bg-blue-500/90 text-white'
          : showSuccess
            ? 'bg-emerald-500/90 text-white'
            : pendingCount > 0
              ? 'bg-amber-500/80 text-white'
              : 'bg-emerald-500/90 text-white'
    }`}>
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span>Çevrimdışı — Son kaydedilen veriler gösteriliyor</span>
          {pendingCount > 0 && (
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
              {pendingCount} bekleyen işlem
            </span>
          )}
        </>
      ) : isSyncing ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Senkronize ediliyor...</span>
        </>
      ) : showSuccess ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>Bağlantı sağlandı — Veriler güncellendi</span>
        </>
      ) : pendingCount > 0 ? (
        <>
          <Wifi className="w-3.5 h-3.5" />
          <span>{pendingCount} bekleyen işlem</span>
          <button
            onClick={syncData}
            className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full text-[10px] transition-colors"
          >
            Şimdi Senkronize Et
          </button>
          <button
            onClick={async () => {
              const { clearQueue } = await import('@/lib/syncQueue');
              await clearQueue();
              setPendingCount(0);
              toast.success("Bekleyen işlemler temizlendi");
            }}
            className="bg-white/10 hover:bg-red-500/30 px-2 py-0.5 rounded-full text-[10px] transition-colors ml-1"
            title="Eğer senkronizasyon takılırsa buraya basarak kuyruğu boşaltabilirsiniz."
          >
            Temizle
          </button>
        </>
      ) : null}
    </div>
  );
}
