import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/lib/idb-storage';
import { TranscriptEntry } from '@/components/live-translate/types';

export interface SavedTranslateSession {
  id: string;
  projectId: number | null;
  title: string;
  myLanguage: string;
  targetLanguage: string;
  transcripts: TranscriptEntry[];
  createdAt: string;
}

export interface LiveTranslateState {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  errorMessage: string | null;
  
  myLanguage: string; // örn: 'tr-TR'
  targetLanguage: string; // örn: 'en-US'
  
  activeMode: 'none' | 'me' | 'other';
  transcripts: TranscriptEntry[];
  
  isAudioPlaying: boolean;
  logs: string[];

  // Geçmiş ve Seans Yönetimi
  currentSessionId: string | null;
  historySessions: SavedTranslateSession[];

  // Ses Aygıtları Ayarları
  audioInputDevice: string;
  audioOutputDeviceMe: string;   // Benim Duyacağım (Kulaklık)
  audioOutputDeviceOther: string; // Karşı Tarafın Duyacağı (Hoparlör)
  isAutomaticMode: boolean;       // Sürekli/Otomatik Dil Algılamalı Çeviri Modu
  
  setMyLanguage: (lang: string) => void;
  setTargetLanguage: (lang: string) => void;
  swapLanguages: () => void;
  setStatus: (status: 'idle' | 'connecting' | 'connected' | 'error') => void;
  setErrorMessage: (msg: string | null) => void;
  setActiveMode: (mode: 'none' | 'me' | 'other') => void;
  addTranscript: (entry: TranscriptEntry) => void;
  updateTranscript: (id: string, updates: Partial<TranscriptEntry>) => void;
  clearTranscripts: () => void;
  setIsAudioPlaying: (playing: boolean) => void;
  addLog: (log: string) => void;
  clearLogs: () => void;

  setAudioInputDevice: (id: string) => void;
  setAudioOutputDeviceMe: (id: string) => void;
  setAudioOutputDeviceOther: (id: string) => void;
  setIsAutomaticMode: (auto: boolean) => void;

  // Seans İşlemleri
  startNewSession: (projectId: number | null) => void;
  saveCurrentSession: (projectId: number | null) => void;
  loadHistorySession: (id: string) => void;
  deleteHistorySession: (id: string) => void;
}

export const useLiveTranslateStore = create<LiveTranslateState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      errorMessage: null,
      myLanguage: 'tr-TR',
      targetLanguage: 'en-US',
      activeMode: 'none',
      transcripts: [],
      isAudioPlaying: false,
      logs: [],

      currentSessionId: null,
      historySessions: [],

      // Ses Aygıtları Varsayılanları
      audioInputDevice: 'default',
      audioOutputDeviceMe: 'default',
      audioOutputDeviceOther: 'default',
      isAutomaticMode: false,

      setMyLanguage: (myLanguage) => set({ myLanguage }),
      setTargetLanguage: (targetLanguage) => set({ targetLanguage }),
      swapLanguages: () => set((state) => ({
        myLanguage: state.targetLanguage,
        targetLanguage: state.myLanguage
      })),
      setStatus: (status) => set({ status }),
      setErrorMessage: (errorMessage) => set({ errorMessage }),
      setActiveMode: (activeMode) => set({ activeMode }),
      addTranscript: (entry) => set((state) => {
        const exists = state.transcripts.some(t => t.id === entry.id);
        const updatedTranscripts = exists
          ? state.transcripts.map(t => t.id === entry.id ? entry : t)
          : [...state.transcripts, entry];
        
        return { transcripts: updatedTranscripts };
      }),
      updateTranscript: (id, updates) => set((state) => {
        const updatedTranscripts = state.transcripts.map(t => t.id === id ? { ...t, ...updates } : t);
        return { transcripts: updatedTranscripts };
      }),
      clearTranscripts: () => set({ transcripts: [] }),
      setIsAudioPlaying: (isAudioPlaying) => set({ isAudioPlaying }),
      addLog: (log) => set((state) => {
        const timestamp = new Date().toLocaleTimeString("tr-TR");
        const newLog = `[${timestamp}] ${log}`;
        console.log(`[LiveTranslateStore] ${newLog}`);
        return { logs: [newLog, ...state.logs].slice(0, 100) }; // Son 100 logu tut
      }),
      clearLogs: () => set({ logs: [] }),

      setAudioInputDevice: (audioInputDevice) => set({ audioInputDevice }),
      setAudioOutputDeviceMe: (audioOutputDeviceMe) => set({ audioOutputDeviceMe }),
      setAudioOutputDeviceOther: (audioOutputDeviceOther) => set({ audioOutputDeviceOther }),
      setIsAutomaticMode: (isAutomaticMode) => set({ isAutomaticMode }),

      startNewSession: (projectId) => {
        const currentTrans = get().transcripts;
        const currentSessionId = get().currentSessionId;
        
        // Eğer mevcut seansta konuşma varsa önce geçmişe kaydet
        if (currentTrans.length > 0) {
          get().saveCurrentSession(projectId);
        }

        set({
          currentSessionId: Math.random().toString(36).substring(7),
          transcripts: []
        });
      },

      saveCurrentSession: (projectId) => {
        const currentTrans = get().transcripts;
        if (currentTrans.length === 0) return;

        const sessionId = get().currentSessionId || Math.random().toString(36).substring(7);
        const myLang = get().myLanguage;
        const targetLang = get().targetLanguage;

        // Bulunabilir bir başlık oluştur
        const firstMessage = currentTrans.find(t => t.text)?.text || currentTrans[0].translatedText || "";
        const previewText = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? "..." : "");
        const formattedDate = new Date().toLocaleString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
        const title = previewText ? `"${previewText}" (${formattedDate})` : `Canlı Çeviri (${formattedDate})`;

        const newSavedSession: SavedTranslateSession = {
          id: sessionId,
          projectId,
          title,
          myLanguage: myLang,
          targetLanguage: targetLang,
          transcripts: currentTrans,
          createdAt: new Date().toISOString()
        };

        set((state) => {
          const filtered = state.historySessions.filter(s => s.id !== sessionId);
          return {
            historySessions: [newSavedSession, ...filtered]
          };
        });
      },

      loadHistorySession: (id) => {
        const session = get().historySessions.find(s => s.id === id);
        if (session) {
          set({
            currentSessionId: session.id,
            myLanguage: session.myLanguage,
            targetLanguage: session.targetLanguage,
            transcripts: session.transcripts
          });
        }
      },

      deleteHistorySession: (id) => {
        set((state) => ({
          historySessions: state.historySessions.filter(s => s.id !== id),
          currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
          transcripts: state.currentSessionId === id ? [] : state.transcripts
        }));
      }
    }),
    {
      name: 'planla-live-translate-settings-idb',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        myLanguage: state.myLanguage,
        targetLanguage: state.targetLanguage,
        audioInputDevice: state.audioInputDevice,
        audioOutputDeviceMe: state.audioOutputDeviceMe,
        audioOutputDeviceOther: state.audioOutputDeviceOther,
        isAutomaticMode: state.isAutomaticMode,
        currentSessionId: state.currentSessionId,
        historySessions: state.historySessions,
        transcripts: state.transcripts
      }),
    }
  )
);
