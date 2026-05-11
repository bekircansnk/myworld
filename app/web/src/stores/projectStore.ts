import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';
import { idbStorage } from '@/lib/idb-storage';
import { Project } from '@/types';

export type ViewMode = 'dashboard' | 'all_tasks' | 'project' | 'calendar' | 'notes' | 'ai_chat' | 'ads' | 'photo_tracking' | 'admin';

interface ProjectState {
  projects: Project[];
  selectedProjectId: number | null;
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  setSelectedProjectId: (id: number | null) => void;
  setViewMode: (mode: ViewMode) => void;
  switchCompany: (id: number) => void;
  fetchProjects: () => Promise<void>;
  addProject: (data: Partial<Project>) => Promise<void>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      selectedProjectId: null,
      viewMode: 'dashboard',
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setSelectedProjectId: (id) => set({ selectedProjectId: id }),

      // ViewMode değiştiğinde firma seçimini KORUYORUZ - artık null yapmıyoruz
      setViewMode: (mode) => set({ viewMode: mode }),

      // Firma değişikliği — firma seçilir, mevcut view korunur
      switchCompany: (id) => {
        set({ selectedProjectId: id });
      },

      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/api/projects');
          const projects = response.data;
          const currentId = get().selectedProjectId;
          
          // Eğer hiç firma seçilmemişse veya seçili firma artık yoksa → ilk firmayı otomatik seç
          const hasValidSelection = currentId && projects.some((p: Project) => p.id === currentId);
          const autoSelectId = hasValidSelection ? currentId : (projects.length > 0 ? projects[0].id : null);
          
          set({ projects, isLoading: false, selectedProjectId: autoSelectId });
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
            // Yeni firma oluşturulduğunda otomatik seç
            selectedProjectId: response.data.id,
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
        const { projects, selectedProjectId } = get();
        const filtered = projects.filter((p) => p.id !== id);
        const newSelectedId = selectedProjectId === id 
          ? (filtered.length > 0 ? filtered[0].id : null)
          : selectedProjectId;
        
        set({
          projects: filtered,
          selectedProjectId: newSelectedId,
          viewMode: selectedProjectId === id ? 'dashboard' : get().viewMode
        });
        try {
          await api.delete(`/api/projects/${id}`);
        } catch (error: any) {
          set({ error: error.message });
          get().fetchProjects();
        }
      },
    }),
    {
      name: 'myworld-projects',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        projects: state.projects,
        viewMode: state.viewMode,
        selectedProjectId: state.selectedProjectId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);
