import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';
import { idbStorage } from '@/lib/idb-storage';
import { enqueue } from '@/lib/syncQueue';
import { Task, TaskComment } from '@/types';

interface TaskState {
  tasks: Task[];
  comments: TaskComment[];
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  fetchTasks: (projectId?: number, status?: string) => Promise<void>;
  addTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: number, data: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: number, status: string) => Promise<void>;
  reorderTasks: (items: { id: number; sort_order: number }[]) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  selectedTask: Task | null;
  isDetailPanelOpen: boolean;
  openTaskDetail: (task: Task) => void;
  closeTaskDetail: () => void;
  addSubtask: (parentId: number, taskData: Partial<Task>) => Promise<void>;
  fetchComments: (taskId: number) => Promise<void>;
  addComment: (taskId: number, content: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  reset: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      comments: [],
      isLoading: false,
      error: null,
      selectedTask: null,
      isDetailPanelOpen: false,
      _hasHydrated: false,

      openTaskDetail: (task) => set({ selectedTask: task, isDetailPanelOpen: true }),
      closeTaskDetail: () => set({ selectedTask: null, isDetailPanelOpen: false }),

      fetchTasks: async (projectId, status) => {
        // Soft loading: Eğer zaten görev varsa isLoading'i true yapma (titremeyi ve kaybolmayı önle)
        const hasExistingTasks = get().tasks.length > 0;
        if (!hasExistingTasks) {
          set({ isLoading: true });
        }
        
        set({ error: null });
        try {
          let url = '/api/tasks';
          const params = new URLSearchParams();
          
          // Eğer projectId gönderilmediyse, projectStore'dan seçili firma ID'sini al
          let targetProjectId = projectId;
          if (targetProjectId === undefined) {
            try {
              const { useProjectStore } = await import('./projectStore');
              targetProjectId = useProjectStore.getState().selectedProjectId || undefined;
            } catch (e) {
              console.error("projectStore yüklenemedi veya selectedProjectId okunamadı:", e);
            }
          }

          if (targetProjectId) params.append('project_id', targetProjectId.toString());
          if (status) params.append('status', status);
          
          if (params.toString()) {
            url += `?${params.toString()}`;
          }
          
          const response = await api.get(url);
          const newTasks = response.data;
          
          set((state) => {
            const { selectedTask } = state;
            const updatedSelected = selectedTask
              ? newTasks.find((t: Task) => t.id === selectedTask.id) || selectedTask
              : null;

            // Veri değişmediyse render'ı tetikleme
            if (JSON.stringify(state.tasks) === JSON.stringify(newTasks)) {
              return { isLoading: false, selectedTask: updatedSelected };
            }
            
            return { tasks: newTasks, isLoading: false, selectedTask: updatedSelected };
          });
        } catch (error: any) {
          // Hata durumunda (offline dahil) mevcut veriyi asla SİLME
          set({ error: error.message, isLoading: false });
        }
      },

      addTask: async (data) => {
        const tempId = Date.now();
        const tempTask = { ...data, id: tempId, status: data.status || 'todo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Task;
        set((state) => ({
          tasks: [...state.tasks, tempTask],
        }));
        try {
          // project_id'yi hem URL query param hem body'de gönder - backend izin kontrolü için
          let url = '/api/tasks';
          if (data.project_id) {
            url += `?project_id=${data.project_id}`;
          }
          const response = await api.post(url, data);
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === tempId ? response.data : t)),
          }));
        } catch (error: any) {
          if (error.isOfflineError || (typeof navigator !== 'undefined' && !navigator.onLine)) {
            enqueue('POST', '/api/tasks', data);
          } else {
            // Hata durumunda geçici görevi kaldır, asla ekranda kalmamasın
            set((state) => ({
              tasks: state.tasks.filter((t) => t.id !== tempId),
              error: error.response?.data?.detail || error.message
            }));
            // Güncel veriyi yenile
            get().fetchTasks(data.project_id as number | undefined);
            throw error;
          }
        }
      },

      updateTask: async (id, data) => {
        const previousTasks = get().tasks;
        const previousSelected = get().selectedTask;
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
          selectedTask: state.selectedTask?.id === id ? { ...state.selectedTask, ...data } : state.selectedTask,
        }));
        try {
          let url = `/api/tasks/${id}`;
          if (data.project_id) {
            url += `?project_id=${data.project_id}`;
          }
          const response = await api.put(url, data);
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? response.data : t)),
            selectedTask: state.selectedTask?.id === id ? response.data : state.selectedTask,
          }));
        } catch (error: any) {
          if (error.isOfflineError || (typeof navigator !== 'undefined' && !navigator.onLine)) {
            if (id.toString().startsWith('temp_') || id > 1000000000000) {
              // Geçiçi ID ise backend'e doğrudan PUT gitmez ama biz syncQueue'da halledeceğiz veya backend tarafında çözülebilir.
              // Şimdilik sadece kuyruğa ekle
            }
            enqueue('PUT', `/api/tasks/${id}`, data);
          } else {
            set({ tasks: previousTasks, selectedTask: previousSelected, error: error.message });
            throw error;
          }
        }
      },

      updateTaskStatus: async (id: number, status: string) => {
        const previousTasks = get().tasks;
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
          selectedTask: state.selectedTask?.id === id ? { ...state.selectedTask, status } : state.selectedTask,
        }));
        
        try {
          const { tasks } = get();
          const task = tasks.find(t => t.id === id);
          let url = `/api/tasks/${id}/status?status=${status}`;
          if (task?.project_id) {
            url += `&project_id=${task.project_id}`;
          }
          const response = await api.patch(url);
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? response.data : t)),
            selectedTask: state.selectedTask?.id === id ? response.data : state.selectedTask,
          }));
        } catch (error: any) {
          if (error.isOfflineError || (typeof navigator !== 'undefined' && !navigator.onLine)) {
            enqueue('PATCH', `/api/tasks/${id}/status?status=${status}`);
          } else {
            set({ tasks: previousTasks, error: error.message });
            throw error;
          }
        }
      },

      reorderTasks: async (items) => {
        const previousTasks = get().tasks;
        // Optimistic update: sort_order değerlerini güncelle
        const updatedTasks = previousTasks.map((t) => {
          const reorderItem = items.find((i) => i.id === t.id);
          if (reorderItem) {
            return { ...t, sort_order: reorderItem.sort_order };
          }
          return t;
        });

        set({ tasks: updatedTasks });

        try {
          // Görevlerden ilkini bulup project_id'sini al (firma yetki kontrolü için)
          const firstTask = updatedTasks.find(t => items.length > 0 && t.id === items[0].id);
          let url = '/api/tasks/reorder';
          if (firstTask && firstTask.project_id) {
            url += `?project_id=${firstTask.project_id}`;
          }
          await api.post(url, { items });
        } catch (error: any) {
          if (error.isOfflineError || (typeof navigator !== 'undefined' && !navigator.onLine)) {
            const firstTask = updatedTasks.find(t => items.length > 0 && t.id === items[0].id);
            let url = '/api/tasks/reorder';
            if (firstTask && firstTask.project_id) {
              url += `?project_id=${firstTask.project_id}`;
            }
            enqueue('POST', url, { items });
          } else {
            // Hata durumunda geri al
            set({ tasks: previousTasks, error: error.message });
            throw error;
          }
        }
      },

      deleteTask: async (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
          isDetailPanelOpen: state.selectedTask?.id === id ? false : state.isDetailPanelOpen,
        }));
        try {
          const { tasks } = get();
          const task = tasks.find(t => t.id === id);
          let url = `/api/tasks/${id}`;
          if (task?.project_id) {
            url += `?project_id=${task.project_id}`;
          }
          await api.delete(url);
        } catch (error: any) {
          if (error.isOfflineError || (typeof navigator !== 'undefined' && !navigator.onLine)) {
            enqueue('DELETE', `/api/tasks/${id}`);
          } else {
            set({ error: error.message });
            get().fetchTasks();
            throw error;
          }
        }
      },

      addSubtask: async (parentId, taskData) => {
        // Alt görevin firmasını parent task'tan veya seçili firmadan miras al
        const parentTask = get().tasks.find((t) => t.id === parentId);
        const resolvedProjectId = taskData.project_id || parentTask?.project_id || undefined;
        const finalTaskData = { ...taskData, project_id: resolvedProjectId };

        const tempId = Date.now();
        const tempSubtask = { ...finalTaskData, id: tempId, parent_task_id: parentId, status: finalTaskData.status || 'todo', created_at: new Date().toISOString() } as Task;
        set((state) => ({
          tasks: [...state.tasks, tempSubtask],
        }));
        try {
          let url = `/api/tasks/${parentId}/subtasks`;
          if (resolvedProjectId) {
            url += `?project_id=${resolvedProjectId}`;
          }
          const response = await api.post(url, finalTaskData);
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === tempId ? response.data : t)),
          }));
        } catch (error: any) {
          if (error.isOfflineError || (typeof navigator !== 'undefined' && !navigator.onLine)) {
            enqueue('POST', `/api/tasks/${parentId}/subtasks`, finalTaskData);
          } else {
            set((state) => ({
              tasks: state.tasks.filter((t) => t.id !== tempId),
              error: error.message
            }));
            throw error;
          }
        }
      },
      fetchComments: async (taskId) => {
        try {
          const response = await api.get(`/api/tasks/${taskId}/comments`);
          set({ comments: response.data });
        } catch (error: any) {
          console.error("Yorumlar yüklenirken hata oluştu:", error);
          set({ error: error.message });
        }
      },
      addComment: async (taskId, content) => {
        try {
          const response = await api.post(`/api/tasks/${taskId}/comments`, { content });
          set((state) => ({
            comments: [...state.comments, response.data]
          }));
        } catch (error: any) {
          console.error("Yorum eklenirken hata oluştu:", error);
          set({ error: error.message });
          throw error;
        }
      },
      deleteComment: async (commentId) => {
        try {
          await api.delete(`/api/tasks/comments/${commentId}`);
          set((state) => ({
            comments: state.comments.filter((c) => c.id !== commentId)
          }));
        } catch (error: any) {
          console.error("Yorum silinirken hata oluştu:", error);
          set({ error: error.message });
          throw error;
        }
      },
      reset: () => set({ tasks: [], comments: [], selectedTask: null, isDetailPanelOpen: false, error: null })
    }),
    {
      name: 'pikselis-tasks',
      storage: createJSONStorage(() => idbStorage),
      // Sadece veri alanlarını kalıcı yap (fonksiyonlar ve UI state hariç)
      partialize: (state) => ({
        tasks: state.tasks,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);
