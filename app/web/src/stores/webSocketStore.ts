import { create } from 'zustand'
import { Capacitor } from '@capacitor/core'

interface WebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
}

let _reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
let _reconnectTimeout: NodeJS.Timeout | null = null;

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  
  connect: async () => {
    if (get().socket?.readyState === WebSocket.OPEN || typeof window === 'undefined') return;
    
    // AuthStore'dan token al
    let token = "";
    try {
      const { useAuthStore } = await import('@/store/authStore');
      token = useAuthStore.getState().token || localStorage.getItem('token') || "";
    } catch (e) {
      console.warn("AuthStore import error in WS", e);
    }

    if (!token) {
        console.warn("WS connect aborted: No token found");
        return;
    }

    // API URL'den WebSocket URL türet
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://myworld-twqx.onrender.com';
    if (window.location.hostname === 'localhost' && !process.env.NEXT_PUBLIC_API_URL && !Capacitor.isNativePlatform()) {
      apiUrl = 'http://localhost:8000';
    }
    const defaultWsBase = apiUrl.replace(/^http/, 'ws') + '/ws/';
    
    // URL'e token ekle (Backend /{token} bekliyor)
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL 
        ? `${process.env.NEXT_PUBLIC_WS_URL}${token}`
        : `${defaultWsBase}${token}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        set({ isConnected: true, socket: ws });
        _reconnectAttempts = 0;
        console.log("WebSocket Connected");
      };
      
      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'auth_update') {
             // Yetki veya firma değişikliği sinyali
             const { useAuthStore } = await import('@/store/authStore');
             const { useProjectStore } = await import('@/stores/projectStore');
             
             await useAuthStore.getState().checkAuth();
             await useProjectStore.getState().fetchProjects();
          }

          if (data.type === 'new_task' || data.type === 'task_update') {
             const { useTaskStore } = await import('@/stores/taskStore');
             const { useProjectStore } = await import('@/stores/projectStore');
             const currentProjId = useProjectStore.getState().selectedProjectId;
             
             if (!data.project_id || data.project_id === currentProjId) {
                await useTaskStore.getState().fetchTasks();
             }
          }

          if (data.type === 'project_update') {
             const { useProjectStore } = await import('@/stores/projectStore');
             await useProjectStore.getState().fetchProjects();
          }

          if (data.type === 'calendar_update') {
             const { useCalendarStore } = await import('@/stores/calendarStore');
             const { useProjectStore } = await import('@/stores/projectStore');
             const currentProjId = useProjectStore.getState().selectedProjectId;
             
             if (!data.project_id || data.project_id === currentProjId) {
                await useCalendarStore.getState().fetchEvents(currentProjId);
             }
          }

          if (data.type === 'note_update') {
             const { useNoteStore } = await import('@/stores/noteStore');
             const { useProjectStore } = await import('@/stores/projectStore');
             const currentProjId = useProjectStore.getState().selectedProjectId;
             
             if (!data.project_id || data.project_id === currentProjId) {
                await useNoteStore.getState().fetchNotes(currentProjId);
             }
          }

          if (data.type === 'photo_tracking_update') {
             const { usePhotoTrackingStore } = await import('@/stores/photoTrackingStore');
             const { useProjectStore } = await import('@/stores/projectStore');
             const currentProjId = useProjectStore.getState().selectedProjectId;
             
             if (!data.project_id || data.project_id === currentProjId) {
                const store = usePhotoTrackingStore.getState();
                if (currentProjId) {
                   await store.fetchModels(currentProjId);
                   await store.fetchOverview(currentProjId);
                }
             }
          }

          if (data.type === 'NEW_COMMENT') {
             const { useTaskStore } = await import('@/stores/taskStore');
             const selectedTask = useTaskStore.getState().selectedTask;
             if (selectedTask && selectedTask.id === data.data.task_id) {
               // Çift ekleme hatasını önlemek için kontrol et
               const comments = useTaskStore.getState().comments;
               if (!comments.some(c => c.id === data.data.id)) {
                 useTaskStore.setState((state) => ({
                   comments: [...state.comments, data.data]
                 }));
               }
             }
          }

          if (data.type === 'DELETE_COMMENT') {
             const { useTaskStore } = await import('@/stores/taskStore');
             const selectedTask = useTaskStore.getState().selectedTask;
             if (selectedTask && selectedTask.id === data.data.task_id) {
               useTaskStore.setState((state) => ({
                 comments: state.comments.filter(c => c.id !== data.data.id)
               }));
             }
          }



          if (data.type === 'NEW_ACTIVITY') {
             if (typeof window !== 'undefined') {
               const event = new CustomEvent('pikselis-new-activity', { detail: data.data });
               window.dispatchEvent(event);
             }
          }

        } catch (e) {
          console.error("WS message error", e);
        }
      };
      
      ws.onclose = () => {
        set({ isConnected: false, socket: null });
        if (_reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(5000 * Math.pow(2, _reconnectAttempts), 60000);
          _reconnectAttempts++;
          _reconnectTimeout = setTimeout(() => get().connect(), delay);
        }
      };
      
      ws.onerror = () => {
         // Error handles via onclose
      };
      
      set({ socket: ws });
    } catch (e) {
      console.error("WS Connection error", e);
    }
  },
  
  disconnect: () => {
    if (_reconnectTimeout) {
      clearTimeout(_reconnectTimeout);
      _reconnectTimeout = null;
    }
    _reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Reconnect engelle
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },
  
  sendMessage: (message: string) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.send(message);
    }
  }
}));
