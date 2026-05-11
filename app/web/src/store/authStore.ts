import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';
import { idbStorage } from '@/lib/idb-storage';

export interface User {
  id: number;
  username: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,
      
      login: (token, user) => {
        // localStorage'a da yaz (api.ts interceptor uyumluluğu için)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ token, user, isAuthenticated: true, isLoading: false });
      },
      
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      },
      
      checkAuth: async () => {
        const { token } = get();
        // localStorage'dan da kontrol et (geriye uyumluluk)
        const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const activeToken = token || localToken;
        
        if (!activeToken) {
          set({ isAuthenticated: false, isLoading: false, user: null });
          return;
        }

        // Token varsa localStorage ile eşitle
        if (activeToken && typeof window !== 'undefined') {
          localStorage.setItem('token', activeToken);
        }

        try {
          const response = await api.get('/api/auth/me');
          set({ user: response.data, isAuthenticated: true, isLoading: false, token: activeToken });
        } catch (error) {
          // Çevrimdışıysa veya API ulaşılamazsa → çıkış YAPMA
          // Mevcut token + user bilgisiyle devam et
          const { user } = get();
          if (user && activeToken) {
            // Kayıtlı kullanıcı var → çevrimdışı modda devam
            set({ isAuthenticated: true, isLoading: false, token: activeToken });
          } else {
            // Hiç kullanıcı bilgisi yok → giriş ekranı göster
            set({ isAuthenticated: false, isLoading: false });
          }
        }
      },
      
      updateUser: (updatedUser) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        }));
      }
    }),
    {
      name: 'myworld-auth',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
          // Hydrate olduktan sonra kayıtlı token + user varsa anında authenticated yap
          if (state.token && state.user) {
            state.isAuthenticated = true;
            state.isLoading = false;
            // localStorage ile eşitle
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', state.token);
            }
          } else {
            state.isLoading = false;
          }
        }
      },
    }
  )
);
