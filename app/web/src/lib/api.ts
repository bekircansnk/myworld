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
    // Ağ hatası (çevrimdışı) veya Sunucu Hatası (Backend Uykuya Geçmesi/5xx) → sessizce geç, mevcut cache kullanılsın
    if (!error.response || error.response.status >= 500 || error.response.status === 408) {
      error.isOfflineError = true;
      return Promise.reject(error);
    }
    
    // 401 hatası → Oturum süresi dolmuş veya geçersiz token. Token'ı sil ve login'e yönlendir.
    if (error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
