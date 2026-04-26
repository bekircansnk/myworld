import { create } from 'zustand';
import { api } from '@/lib/api';
import { Project } from '@/types';

export type ViewMode = 'dashboard' | 'all_tasks' | 'project' | 'notes' | 'calendar' | 'ai_chat' | 'venus_ads';

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
    const tempId = Date.now();
    const tempProject = { ...data, id: tempId, is_active: data.is_active ?? true, created_at: new Date().toISOString() } as Project;
    set((state) => ({
      projects: [...state.projects, tempProject],
    }));
    try {
      const response = await api.post('/api/projects', data);
      set((state) => ({
        projects: state.projects.map(p => p.id === tempId ? response.data : p),
      }));
    } catch (error: any) {
      set((state) => ({
        projects: state.projects.filter(p => p.id !== tempId),
        error: error.message
      }));
    }
  },

  updateProject: async (id, data) => {
    const previousProjects = get().projects;
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
    try {
      const response = await api.put(`/api/projects/${id}`, data);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? response.data : p)),
      }));
    } catch (error: any) {
      set({ projects: previousProjects, error: error.message });
    }
  },

  deleteProject: async (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
      viewMode: state.selectedProjectId === id ? 'dashboard' : state.viewMode
    }));
    try {
      await api.delete(`/api/projects/${id}`);
    } catch (error: any) {
      set({ error: error.message });
      get().fetchProjects();
    }
  },
}));
