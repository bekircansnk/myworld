import { create } from 'zustand';
import { api } from '@/lib/api';
import { Project } from '@/types';

export type ViewMode = 'dashboard' | 'all_tasks' | 'project' | 'notes' | 'calendar' | 'ai_chat';

interface ProjectState {
  projects: Project[];
  selectedProjectId: number | null;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
  setSelectedProjectId: (id: number | null) => void;
  setViewMode: (mode: ViewMode) => void;
  fetchProjects: () => Promise<void>;
  addProject: (data: Partial<Project>) => Promise<void>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProjectId: null,
  viewMode: 'dashboard',
  isLoading: false,
  error: null,

  setSelectedProjectId: (id) => set({ selectedProjectId: id, viewMode: id ? 'project' : 'dashboard' }),
  setViewMode: (mode) => set({ viewMode: mode, selectedProjectId: mode === 'project' ? get().selectedProjectId : null }),

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/projects');
      set({ projects: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/projects', data);
      set((state) => ({
        projects: [...state.projects, response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateProject: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/projects/${id}`, data);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? response.data : p)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/projects/${id}`);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
