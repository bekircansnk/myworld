import { create } from 'zustand'

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
  
  connect: () => {
    if (get().socket?.readyState === WebSocket.OPEN || typeof window === 'undefined') return;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${host}:8000/ws/`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        set({ isConnected: true, socket: ws });
        _reconnectAttempts = 0; // Başarılı bağlantıda sıfırla
      };
      
      ws.onmessage = () => {
        // Gelen veri tipine göre state güncellemeleri
      };
      
      ws.onclose = () => {
        set({ isConnected: false, socket: null });
        // Maksimum deneme sınırı ile exponential backoff
        if (_reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(5000 * Math.pow(2, _reconnectAttempts), 60000);
          _reconnectAttempts++;
          _reconnectTimeout = setTimeout(() => get().connect(), delay);
        }
      };
      
      ws.onerror = () => {
        // Sessiz geç — onclose zaten tetiklenecek
      };
      
      set({ socket: ws });
    } catch {
      // WebSocket oluşturulamadı — sessizce geç
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
