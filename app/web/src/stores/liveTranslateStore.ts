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
    }),
    {
      name: 'planla-live-translate-settings',
      partialize: (state) => ({
        myLanguage: state.myLanguage,
        targetLanguage: state.targetLanguage,
      }),
    }
  )
);
