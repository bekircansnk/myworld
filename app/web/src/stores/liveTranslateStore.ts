import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TranscriptEntry } from '@/components/live-translate/types';

export interface LiveTranslateState {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  errorMessage: string | null;
  
  myLanguage: string; // örn: 'tr-TR'
  targetLanguage: string; // örn: 'en-US'
  
  activeMode: 'none' | 'me' | 'other';
  transcripts: TranscriptEntry[];
  
  isAudioPlaying: boolean;

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

  setAudioInputDevice: (id: string) => void;
  setAudioOutputDeviceMe: (id: string) => void;
  setAudioOutputDeviceOther: (id: string) => void;
  setIsAutomaticMode: (auto: boolean) => void;
}

export const useLiveTranslateStore = create<LiveTranslateState>()(
  persist(
    (set) => ({
      status: 'idle',
      errorMessage: null,
      myLanguage: 'tr-TR',
      targetLanguage: 'en-US',
      activeMode: 'none',
      transcripts: [],
      isAudioPlaying: false,

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
        if (exists) {
          return {
            transcripts: state.transcripts.map(t => t.id === entry.id ? entry : t)
          };
        }
        return { transcripts: [...state.transcripts, entry] };
      }),
      updateTranscript: (id, updates) => set((state) => ({
        transcripts: state.transcripts.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      clearTranscripts: () => set({ transcripts: [] }),
      setIsAudioPlaying: (isAudioPlaying) => set({ isAudioPlaying }),

      setAudioInputDevice: (audioInputDevice) => set({ audioInputDevice }),
      setAudioOutputDeviceMe: (audioOutputDeviceMe) => set({ audioOutputDeviceMe }),
      setAudioOutputDeviceOther: (audioOutputDeviceOther) => set({ audioOutputDeviceOther }),
      setIsAutomaticMode: (isAutomaticMode) => set({ isAutomaticMode }),
    }),
    {
      name: 'planla-live-translate-settings-v2',
      partialize: (state) => ({
        myLanguage: state.myLanguage,
        targetLanguage: state.targetLanguage,
        audioInputDevice: state.audioInputDevice,
        audioOutputDeviceMe: state.audioOutputDeviceMe,
        audioOutputDeviceOther: state.audioOutputDeviceOther,
        isAutomaticMode: state.isAutomaticMode,
      }),
    }
  )
);
