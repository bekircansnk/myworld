import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — çevrimdışı modda token silme YAPMA
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ağ hatası (çevrimdışı) → sessizce geç, mevcut cache kullanılsın
    if (!error.response) {
      return Promise.reject(error);
    }
    
    // 401 hatası → token'ı silme, sadece logla
    // Çevrimdışıyken 401 alınabilir, token hala geçerli olabilir
    if (error.response.status === 401) {
      console.warn('401 Unauthorized — oturum kontrolü gerekebilir');
    }
    
    return Promise.reject(error);
  }
);
