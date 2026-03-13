import { create } from 'zustand'

interface WebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  
  connect: () => {
    if (get().socket?.readyState === WebSocket.OPEN || typeof window === 'undefined') return;
    
    // Geliştirme ortamında sabit 8000, üretimde host dinamik olmalı
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${host}:8000/ws/`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      set({ isConnected: true, socket: ws });
      console.log("🟢 WebSocket Connected");
      ws.send(JSON.stringify({ type: "connect", message: "Client is ready" }));
    };
    
    ws.onmessage = (event) => {
      console.log("⚡ WebSocket Message:", event.data);
      // İleride gelen veri tipine göre state güncellemeleri veya bildirimler eklenebilir.
      // Örn: if (data.type === 'TASK_UPDATED') fetchTasks();
    };
    
    ws.onclose = () => {
      set({ isConnected: false, socket: null });
      console.log("🔴 WebSocket Disconnected. Reconnecting in 5s...");
      // Otomatik yeniden bağlanma
      setTimeout(() => get().connect(), 5000);
    };
    
    ws.onerror = (error) => {
      // console.error can crash Next.js dev server UI with an unhandled exception overlay, so we use warn.
      console.warn("🟠 WebSocket Error observed. Connection might be retrying...", error);
    };
    
    set({ socket: ws });
  },
  
  disconnect: () => {
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
