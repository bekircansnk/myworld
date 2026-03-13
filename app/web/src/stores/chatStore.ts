import { create } from 'zustand';
import { api } from '@/lib/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  createdAt: Date;
  actions?: ActionLog[];
  debug?: Record<string, any>;
}

export interface ActionLog {
  action: string;
  details: string;
  success: boolean;
  payload?: any;
}

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  showDebug: boolean;
  toggleChat: () => void;
  toggleDebug: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadHistory: () => Promise<void>;
  inputHint: string;
  setInputHint: (text: string) => void;
  lastAiMessage: string | null;
  showBubble: boolean;
  dismissBubble: () => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  triggerProactiveMessage: (message: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  error: null,
  showDebug: true, // Test aşamasında varsayılan açık
  inputHint: "",
  lastAiMessage: null,
  showBubble: false,
  isSoundEnabled: true,

  toggleChat: () => set((state) => ({ 
    isOpen: !state.isOpen,
    // Hide bubble if we open the chat
    showBubble: state.isOpen ? state.showBubble : false 
  })),
  toggleDebug: () => set((state) => ({ showDebug: !state.showDebug })),
  dismissBubble: () => set({ showBubble: false }),
  toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
  
  triggerProactiveMessage: (message: string) => {
    // Only show bubble if chat is closed, else just add message?
    // Actually, since it's a proactive message from the agent, we just display the bubble and save the message.
    const { isOpen, isSoundEnabled, messages } = get();
    
    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'ai',
      content: message,
      createdAt: new Date(),
    };

    set({
      messages: [...messages, aiMessage],
      lastAiMessage: message,
      showBubble: !isOpen,
    });

    // Play sound if enabled and chat is closed (or even if open to notify)
    if (isSoundEnabled && !isOpen) {
      try {
        const audio = new Audio('/sounds/bring.mp3');
        // Volume adjustment can be made here
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Audio play failed:", e));
      } catch (err) {
        console.error("Audio play error", err);
      }
    }
  },
  
  clearHistory: async () => {
    try {
      await api.delete('/api/chat/history');
      set({ messages: [] });
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      // Even if backend fails, maybe clear locally depending on UX choice, but let's clear locally anyway
      set({ messages: [] });
    }
  },
  setInputHint: (text: string) => set({ inputHint: text }),

  loadHistory: async () => {
    try {
      const response = await api.get('/api/chat/history');
      const history = response.data;
      
      const formattedMessages: ChatMessage[] = history.map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.role as 'user' | 'ai' | 'system',
        content: msg.content,
        createdAt: new Date(msg.created_at),
        actions: msg.actions || [],
      }));

      set({ messages: formattedMessages });
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  },

  sendMessage: async (content: string) => {
    if (!content.trim()) return;
    set({ inputHint: "" }); // Mesaj gönderilince hint'i temizle

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date()
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null
    }));

    try {
      // API'ye gönderilecek basit history payload'u
      const payload = get().messages.map(msg => ({
        role: msg.role === 'system' ? 'ai' : msg.role,
        content: msg.content
      }));

      const response = await api.post('/api/chat', { messages: payload });
      const { reply, actions_executed, debug } = response.data;
      
      // AI yanıtı
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: reply,
        createdAt: new Date(),
        actions: actions_executed || [],
        debug: debug || {}
      };

      const newMessages: ChatMessage[] = [aiMessage];

      // Ekranı güncellemek için global storları tetikle
      const { useTaskStore } = await import('@/stores/taskStore');
      const { useProjectStore } = await import('@/stores/projectStore');
      const { useCalendarStore } = await import('@/stores/calendarStore');
      
      useTaskStore.getState().fetchTasks();
      useProjectStore.getState().fetchProjects();

      // Takvim eventlerini AI döndürdüyse lokale ekle
      if (actions_executed && Array.isArray(actions_executed)) {
        actions_executed.forEach((act) => {
          if (act.action === 'ADD_EVENT' && act.success && act.payload) {
            useCalendarStore.getState().addEvent(act.payload);
          }
        });
      }

      // Aksiyonlar varsa sistem mesajı ekle
      if (actions_executed && actions_executed.length > 0) {
        const actionSummary = actions_executed
          .map((a: ActionLog) => `${a.success ? '✅' : '❌'} ${a.action}: ${a.details}`)
          .join('\n');
        
        const systemMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'system',
          content: actionSummary,
          createdAt: new Date()
        };
        newMessages.push(systemMessage);

        // Herhangi bir aksiyon başarılıysa task/note listesini yenile
        const hasTaskActions = actions_executed.some(
          (a: ActionLog) => a.success
        );
        if (hasTaskActions) {
          // Dynamic import çatışmasını önlemek için doğrudan API çağrısı yapıyoruz
          // taskStore'dan fetchTasks otomatik çağrılacak
          try {
            const { useTaskStore } = await import('@/stores/taskStore');
            useTaskStore.getState().fetchTasks();
          } catch (e) {
            console.warn('Task refresh warning:', e);
          }
        }
      }

      set((state) => ({
        messages: [...state.messages, ...newMessages],
        lastAiMessage: reply,
        // Only show bubble if chat window is NOT open
        showBubble: !state.isOpen,
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.message || "AI servisine ulaşılamadı", 
        isLoading: false 
      });
    }
  }
}));
