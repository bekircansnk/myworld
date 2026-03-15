import { create } from 'zustand';
import { api } from '@/lib/api';

// ============ TYPES ============

export interface ChatSession {
  id: number;
  user_id: number;
  title: string | null;
  ai_categories: string[];
  last_message_preview: string | null;
  last_user_message: string | null;
  message_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionMessage {
  id: number;
  role: 'user' | 'ai' | 'system';
  content: string;
  actions?: any[];
  created_at: string;
}

export type CategoryFilter = 'all' | 'gorev' | 'takvim' | 'not' | 'genel';

// ============ STORE ============

interface AIChatState {
  // Sessions
  sessions: ChatSession[];
  sessionsTotal: number;
  isSessionsLoading: boolean;

  // Active session
  activeSessionId: number | null;
  activeMessages: SessionMessage[];
  isMessagesLoading: boolean;

  // Chat
  isSending: boolean;
  selectedCategory: CategoryFilter;

  // Actions
  fetchSessions: (category?: CategoryFilter) => Promise<void>;
  createSession: () => Promise<number | null>;
  selectSession: (sessionId: number) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  setCategory: (category: CategoryFilter) => void;
  clearActiveSession: () => void;
  deleteSession: (sessionId: number) => Promise<void>;
  deleteAllSessions: () => Promise<void>;
}

export const useAIChatStore = create<AIChatState>((set, get) => ({
  sessions: [],
  sessionsTotal: 0,
  isSessionsLoading: false,

  activeSessionId: null,
  activeMessages: [],
  isMessagesLoading: false,

  isSending: false,
  selectedCategory: 'all',

  fetchSessions: async (category?: CategoryFilter) => {
    const cat = category || get().selectedCategory;
    set({ isSessionsLoading: true });
    try {
      const params: any = { limit: 50 };
      if (cat && cat !== 'all') params.category = cat;
      
      const response = await api.get('/api/chat/sessions', { params });
      set({
        sessions: response.data.sessions || [],
        sessionsTotal: response.data.total || 0,
        isSessionsLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      set({ isSessionsLoading: false });
    }
  },

  createSession: async () => {
    try {
      const response = await api.post('/api/chat/sessions');
      const newSession: ChatSession = response.data;
      
      set((state) => ({
        sessions: [newSession, ...state.sessions],
        activeSessionId: newSession.id,
        activeMessages: [],
      }));
      
      return newSession.id;
    } catch (error) {
      console.error('Failed to create session:', error);
      return null;
    }
  },

  selectSession: async (sessionId: number) => {
    set({ activeSessionId: sessionId, isMessagesLoading: true, activeMessages: [] });
    try {
      const response = await api.get(`/api/chat/sessions/${sessionId}/messages`);
      set({
        activeMessages: response.data || [],
        isMessagesLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch session messages:', error);
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (content: string) => {
    if (!content.trim() || get().isSending) return;

    let sessionId = get().activeSessionId;
    
    // Create session if none active
    if (!sessionId) {
      sessionId = await get().createSession();
      if (!sessionId) return;
    }

    // Add user message instantly (optimistic)
    const userMsg: SessionMessage = {
      id: Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      activeMessages: [...state.activeMessages, userMsg],
      isSending: true,
    }));

    try {
      // Build chat history for API
      const messages = get().activeMessages.map((msg) => ({
        role: msg.role === 'system' ? 'ai' : msg.role,
        content: msg.content,
      }));

      const response = await api.post('/api/chat', {
        messages,
        session_id: sessionId,
      });

      const { reply, actions_executed, session_id: returnedSessionId } = response.data;

      // AI message
      const aiMsg: SessionMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: reply,
        actions: actions_executed || [],
        created_at: new Date().toISOString(),
      };

      const newMessages: SessionMessage[] = [aiMsg];

      // System action message
      if (actions_executed && actions_executed.length > 0) {
        const actionSummary = actions_executed
          .map((a: any) => `${a.success ? '✅' : '❌'} ${a.action}: ${a.details}`)
          .join('\n');

        newMessages.push({
          id: Date.now() + 2,
          role: 'system',
          content: actionSummary,
          created_at: new Date().toISOString(),
        });

        // Refresh task/project/note stores
        try {
          const { useTaskStore } = await import('@/stores/taskStore');
          const { useProjectStore } = await import('@/stores/projectStore');
          const { useNoteStore } = await import('@/stores/noteStore');
          useTaskStore.getState().fetchTasks();
          useProjectStore.getState().fetchProjects();
          useNoteStore.getState().fetchNotes();
        } catch {}

        // Refresh calendar events
        if (actions_executed.some((a: any) => ['ADD_EVENT', 'EDIT_EVENT', 'DELETE_EVENT'].includes(a.action) && a.success)) {
          try {
            const { useCalendarStore } = await import('@/stores/calendarStore');
            useCalendarStore.getState().fetchEvents();
          } catch {}
        }
      }

      set((state) => ({
        activeMessages: [...state.activeMessages, ...newMessages],
        isSending: false,
        activeSessionId: returnedSessionId || sessionId,
      }));

      // Refresh sessions list to update preview/category
      get().fetchSessions();

    } catch (error: any) {
      console.error('AI chat error:', error);
      set({ isSending: false });
    }
  },

  setCategory: (category: CategoryFilter) => {
    set({ selectedCategory: category });
    get().fetchSessions(category);
  },

  clearActiveSession: () => {
    set({ activeSessionId: null, activeMessages: [] });
  },

  deleteSession: async (sessionId: number) => {
    try {
      await api.delete(`/api/chat/sessions/${sessionId}`);
      set((state) => {
        const remainingSessions = state.sessions.filter((s) => s.id !== sessionId);
        const newTotal = Math.max(0, state.sessionsTotal - 1);
        const newActiveId = state.activeSessionId === sessionId ? null : state.activeSessionId;
        const newActiveMessages = state.activeSessionId === sessionId ? [] : state.activeMessages;

        return {
          sessions: remainingSessions,
          sessionsTotal: newTotal,
          activeSessionId: newActiveId,
          activeMessages: newActiveMessages,
        };
      });
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  },

  deleteAllSessions: async () => {
    try {
      await api.delete('/api/chat/sessions');
      set({
        sessions: [],
        sessionsTotal: 0,
        activeSessionId: null,
        activeMessages: [],
      });
    } catch (error) {
      console.error('Failed to delete all sessions:', error);
    }
  },
}));
