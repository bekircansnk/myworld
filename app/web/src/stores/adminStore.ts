import { create } from 'zustand';
import { api } from '@/lib/api';
import { User } from '@/store/authStore';

export interface AdminStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_tasks: number;
  total_notes: number;
  total_events: number;
}

export interface ActivityLog {
  id: number;
  user_id: number | null;
  username: string | null;
  action: string;
  module: string;
  details: any;
  ip_address: string | null;
  project_name: string | null;
  created_at: string;
}

interface AdminState {
  users: User[];
  stats: AdminStats | null;
  activityLogs: ActivityLog[];
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchActivityLogs: (limit?: number) => Promise<void>;
  createUser: (data: any) => Promise<void>;
  updateUser: (id: number, data: any) => Promise<void>;
  updatePermissions: (id: number, permissions: any) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  clearLogs: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  stats: null,
  activityLogs: [],
  isLoading: false,

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/api/admin/users');
      set({ users: response.data, isLoading: false });
    } catch (error) {
      console.error('Kullanıcılar alınamadı', error);
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const response = await api.get('/api/admin/stats');
      set({ stats: response.data });
    } catch (error) {
      console.error('İstatistikler alınamadı', error);
    }
  },
  
  fetchActivityLogs: async (limit = 50) => {
    try {
      const response = await api.get(`/api/admin/activity-logs?limit=${limit}`);
      set({ activityLogs: response.data });
    } catch (error) {
      console.error('Aktivite logları alınamadı', error);
    }
  },

  createUser: async (data) => {
    const response = await api.post('/api/admin/users', data);
    const { users } = get();
    set({ users: [...users, response.data] });
    get().fetchStats();
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/api/admin/users/${id}`, data);
    const { users } = get();
    set({
      users: users.map(u => (u.id === id ? response.data : u)),
    });
    get().fetchStats();
  },

  updatePermissions: async (id, permissions) => {
    const response = await api.put(`/api/admin/users/${id}/permissions`, { permissions });
    const { users } = get();
    set({
      users: users.map(u => (u.id === id ? { ...u, permissions: response.data.permissions } : u)),
    });
  },
  
  deleteUser: async (id) => {
    try {
      await api.delete(`/api/admin/users/${id}`);
      const { users } = get();
      set({ users: users.filter(u => u.id !== id) });
      get().fetchStats();
    } catch (error) {
      console.error('Kullanıcı silinemedi', error);
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      await api.delete(`/api/admin/projects/${id}`);
      get().fetchStats();
    } catch (error) {
      console.error('Firma silinemedi', error);
      throw error;
    }
  },

  clearLogs: async () => {
    try {
      await api.post('/api/admin/clear-logs');
      set({ activityLogs: [] });
    } catch (error) {
      console.error('Loglar temizlenemedi', error);
      throw error;
    }
  }
}));
