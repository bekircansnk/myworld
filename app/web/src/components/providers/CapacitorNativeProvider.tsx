"use client";

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';

export function CapacitorNativeProvider() {
  const backPressTimeRef = useRef(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // 1. Status Bar Ayarları
    const initNative = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0F1423' }); 
      } catch (e) { console.warn('StatusBar error:', e); }
      
      try {
        await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
      } catch (e) { console.warn('Keyboard error:', e); }
    };
    initNative();
    
    // 2. Android Geri Tuşu Davranışı
    const backButtonListener = App.addListener('backButton', () => {
      // 2.1. Görev Detay Paneli var mı kontrol et (Global Store)
      const isTaskDetailOpen = useTaskStore.getState().isDetailPanelOpen;
      if (isTaskDetailOpen) {
        useTaskStore.getState().closeTaskDetail();
        return;
      }

      // 2.2. Modal var mı kontrol et (shadcn dialog veya drawer)
      const openModal = document.querySelector('[role="dialog"]') || 
                        document.querySelector('[data-state="open"]');
                        
      if (openModal) {
        // Modalın kapatma butonunu veya escape tuşunu tetikle.
        const event = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true });
        document.dispatchEvent(event);
        return;
      }

      // 2.2. ViewMode kontrolü
      const currentViewMode = useProjectStore.getState().viewMode;
      if (currentViewMode !== 'dashboard') {
        useProjectStore.getState().setViewMode('dashboard');
        return;
      }

      // 2.3. Çıkış kontrolü
      const now = Date.now();
      if (now - backPressTimeRef.current < 2000) {
        App.exitApp();
      } else {
        backPressTimeRef.current = now;
        showExitToast();
      }
    });

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, []);

  const showExitToast = () => {
    const existing = document.getElementById('exit-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'exit-toast';
    toast.textContent = 'Çıkmak için tekrar basın';
    toast.style.position = 'fixed';
    toast.style.bottom = '100px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '99px';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '14px';
    toast.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.pointerEvents = 'none';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  return null;
}
