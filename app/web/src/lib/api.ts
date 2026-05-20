import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://myworld-twqx.onrender.com',
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
    // SADECE Gerçek Ağ Hatası (Offline) veya Zaman Aşımı (408) → isOfflineError işaretle
    // 5xx hataları sunucu taraflı olduğu için çevrimdışı işlem olarak değerlendirilmemeli.
    if (!error.response || error.response.status === 408) {
      error.isOfflineError = true;
      return Promise.reject(error);
    }
    
    // 401 hatası → Geçersiz/süresi dolmuş token. Token'ı sil, uygulama kendi login ekranını gösterecek.
    if (error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        
        // Döngüsel bağımlılığı önlemek için authStore'u dinamik import ederek çıkış yapıyoruz
        import('@/store/authStore').then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
        }).catch(err => console.warn('AuthStore yüklenemedi:', err));

        // Sayfa zaten root'taysa yeniden yükleme yapma (sonsuz döngü engeli)
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
    
    return Promise.reject(error);
  }
);
