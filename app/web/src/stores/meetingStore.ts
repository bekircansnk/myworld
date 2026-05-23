import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Meeting {
  project_id: number;
  url: string;
  started_by: string;
  started_at: string;
}

interface MeetingState {
  activeMeeting: Meeting | null;
  isCallWindowOpen: boolean;
  isLoading: boolean;
  error: string | null;
  
  fetchActiveMeeting: (projectId: number) => Promise<void>;
  startMeeting: (projectId: number) => Promise<void>;
  stopMeeting: (projectId: number) => Promise<void>;
  joinMeeting: () => void;
  leaveMeeting: () => void;
  setActiveMeeting: (meeting: Meeting | null) => void;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  activeMeeting: null,
  isCallWindowOpen: false,
  isLoading: false,
  error: null,

  fetchActiveMeeting: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/meetings/active?project_id=${projectId}`);
      if (response.data?.active) {
        set({ activeMeeting: response.data.meeting });
      } else {
        set({ activeMeeting: null });
      }
    } catch (error: any) {
      console.error("Aktif toplantı alınırken hata:", error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  startMeeting: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/api/meetings/start?project_id=${projectId}`);
      set({ activeMeeting: response.data, isCallWindowOpen: true });
    } catch (error: any) {
      console.error("Toplantı başlatılırken hata:", error);
      set({ error: error.response?.data?.detail || error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  stopMeeting: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/api/meetings/stop?project_id=${projectId}`);
      set({ activeMeeting: null, isCallWindowOpen: false });
    } catch (error: any) {
      console.error("Toplantı sonlandırılırken hata:", error);
      set({ error: error.response?.data?.detail || error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  joinMeeting: () => {
    if (get().activeMeeting) {
      set({ isCallWindowOpen: true });
    }
  },

  leaveMeeting: () => {
    set({ isCallWindowOpen: false });
  },

  setActiveMeeting: (meeting) => {
    set({ activeMeeting: meeting });
    // Eğer toplantı bittiyse pencereyi de otomatik kapat
    if (!meeting) {
      set({ isCallWindowOpen: false });
    }
  }
}));
