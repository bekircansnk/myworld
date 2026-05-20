import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';
import { idbStorage } from '@/lib/idb-storage';

// Firma erişim bilgisi
export interface CompanyAccess {
  project_id: number;
  project_name: string;
  color?: string;
  permissions: Record<string, { view?: boolean; edit?: boolean; delete?: boolean }>;
  is_owner: boolean;
}

export interface User {
  id: number;
  username: string;
  avatar_url?: string;
  name?: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  permissions: Record<string, { view?: boolean; edit?: boolean; delete?: boolean }>;
  email?: string;
  email_verified?: boolean;
  company_accesses?: CompanyAccess[];
  settings?: Record<string, any>;
}

// Firma bazlı izin kontrolü - belirli bir firma için modül izni var mı?
export const canViewCompany = (user: User | null, module: string, projectId?: number | null): boolean => {
  if (!user) return false;
  
  // Dashboard HER ZAMAN AÇIKTIR.
  if (module === 'dashboard') return true;
  
  // Super admin ve admin her şeye erişir
  if (user.role === 'super_admin' || user.role === 'admin') return true;
  
  // Firma seçilmişse firma bazlı kontrol
  if (projectId && user.company_accesses && user.company_accesses.length > 0) {
    const access = user.company_accesses.find(a => a.project_id === projectId);
    if (!access) return false;
    
    if (access.permissions && access.permissions[module] !== undefined) {
      return access.permissions[module]?.view ?? false;
    }
    
    if (access.is_owner) return true;
    return false;
  }
  
  return user.permissions?.[module]?.view ?? false;
};

export const canEditCompany = (user: User | null, module: string, projectId?: number | null): boolean => {
  if (!user) return false;
  // Super admin ve admin her şeye erişir
  if (user.role === 'super_admin' || user.role === 'admin') return true;
  
  // Firma seçilmişse firma bazlı kontrol
  if (projectId && user.company_accesses && user.company_accesses.length > 0) {
    const access = user.company_accesses.find(a => a.project_id === projectId);
    if (!access) return false;
    
    if (access.permissions && access.permissions[module] !== undefined) {
      return access.permissions[module]?.edit ?? false;
    }
    
    if (access.is_owner) return true;
    return false;
  }
  
  return user.permissions?.[module]?.edit ?? false;
};

// Eski uyumlu fonksiyonlar
export const canView = (user: User | null, module: string): boolean => {
  return canViewCompany(user, module);
};

export const canEdit = (user: User | null, module: string): boolean => {
  return canEditCompany(user, module);
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'super_admin' || user?.role === 'admin';
};

export const isSuperAdmin = (user: User | null): boolean => {
  return user?.role === 'super_admin';
};

export const canAccessAdminPanel = (user: User | null): boolean => {
  return user?.username?.toLowerCase() === 'bekir';
};

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
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ token, user, isAuthenticated: true, isLoading: false });
      },
      
      logout: async () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        
        // Diğer tüm store'ları temizle (Dynamic Import ile circular dependency önlenir)
        try {
          const [{ useTaskStore }, { useProjectStore }, { useNoteStore }, { useCalendarStore }, { useChatStore }] = await Promise.all([
            import('@/stores/taskStore'),
            import('@/stores/projectStore'),
            import('@/stores/noteStore'),
            import('@/stores/calendarStore'),
            import('@/stores/chatStore')
          ]);
          
          useTaskStore.getState().reset();
          useProjectStore.getState().reset();
          useNoteStore.getState().reset();
          useCalendarStore.getState().reset();
          useChatStore.getState().reset();
        } catch (e) {
          console.warn('Store cleanup error:', e);
        }

        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      },
      
      checkAuth: async () => {
        const { token, user: oldUser } = get();
        const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const activeToken = token || localToken;
        
        if (!activeToken) {
          if (oldUser) {
            // Token yok ama eski user varsa temizle
            const [{ useTaskStore }, { useProjectStore }, { useNoteStore }, { useCalendarStore }, { useChatStore }] = await Promise.all([
              import('@/stores/taskStore'),
              import('@/stores/projectStore'),
              import('@/stores/noteStore'),
              import('@/stores/calendarStore'),
              import('@/stores/chatStore')
            ]);
            useTaskStore.getState().reset();
            useProjectStore.getState().reset();
            useNoteStore.getState().reset();
            useCalendarStore.getState().reset();
            useChatStore.getState().reset();
          }
          set({ isAuthenticated: false, isLoading: false, user: null });
          return;
        }

        if (activeToken && typeof window !== 'undefined') {
          localStorage.setItem('token', activeToken);
        }

        try {
          const response = await api.get('/api/auth/me');
          const newUser = response.data;

          // Eğer kullanıcı değişmişse (ID bazlı), tüm store'ları resetle
          if (oldUser && oldUser.id !== newUser.id) {
             const [{ useTaskStore }, { useProjectStore }, { useNoteStore }, { useCalendarStore }, { useChatStore }] = await Promise.all([
              import('@/stores/taskStore'),
              import('@/stores/projectStore'),
              import('@/stores/noteStore'),
              import('@/stores/calendarStore'),
              import('@/stores/chatStore')
            ]);
            useTaskStore.getState().reset();
            useProjectStore.getState().reset();
            useNoteStore.getState().reset();
            useCalendarStore.getState().reset();
            useChatStore.getState().reset();
          }

          set({ user: newUser, isAuthenticated: true, isLoading: false, token: activeToken });
        } catch (error) {
          const { user } = get();
          if (user && activeToken) {
            // Çevrimdışı — kayıtlı verilerle devam
            set({ isAuthenticated: true, isLoading: false, token: activeToken });
          } else {
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
      name: 'pikselis-auth',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
          if (state.token && state.user) {
            state.isAuthenticated = true;
            state.isLoading = false;
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
