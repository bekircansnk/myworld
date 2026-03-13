import { create } from 'zustand';
import { api } from '@/lib/api';
import { Task } from '@/types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: (projectId?: number, status?: string) => Promise<void>;
  addTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: number, data: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: number, status: 'todo' | 'in_progress' | 'in_review' | 'done') => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  selectedTask: Task | null;
  isDetailPanelOpen: boolean;
  openTaskDetail: (task: Task) => void;
  closeTaskDetail: () => void;
  addSubtask: (parentId: number, taskData: Partial<Task>) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  selectedTask: null,
  isDetailPanelOpen: false,

  openTaskDetail: (task) => set({ selectedTask: task, isDetailPanelOpen: true }),
  closeTaskDetail: () => set({ selectedTask: null, isDetailPanelOpen: false }),

  fetchTasks: async (projectId, status) => {
    set({ isLoading: true, error: null });
    try {
      let url = '/api/tasks';
      const params = new URLSearchParams();
      if (projectId) params.append('project_id', projectId.toString());
      if (status) params.append('status', status);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      const tasks = response.data;
      // Açık olan paneldeki selectedTask'ı da güncelle
      const { selectedTask } = get();
      const updatedSelected = selectedTask
        ? tasks.find((t: Task) => t.id === selectedTask.id) || selectedTask
        : null;

      set({ tasks, isLoading: false, selectedTask: updatedSelected });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addTask: async (data) => {
    try {
      const response = await api.post('/api/tasks', data);
      set((state) => ({
        tasks: [response.data, ...state.tasks],
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateTask: async (id, data) => {
    try {
      const response = await api.put(`/api/tasks/${id}`, data);
      const updatedTask = response.data;
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        // Açık paneldeki görev güncellendiyse onu da güncelle
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateTaskStatus: async (id: number, status: 'todo' | 'in_progress' | 'in_review' | 'done') => {
    const previousTasks = get().tasks;
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
      selectedTask: state.selectedTask?.id === id ? { ...state.selectedTask, status } : state.selectedTask,
    }));
    
    try {
      const response = await api.patch(`/api/tasks/${id}/status?status=${status}`);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? response.data : t)),
        selectedTask: state.selectedTask?.id === id ? response.data : state.selectedTask,
      }));
    } catch (error: any) {
      set({ tasks: previousTasks, error: error.message });
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        // Silinen görev açık paneldeki görevse paneli kapat
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        isDetailPanelOpen: state.selectedTask?.id === id ? false : state.isDetailPanelOpen,
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addSubtask: async (parentId, taskData) => {
    try {
      const response = await api.post(`/api/tasks/${parentId}/subtasks`, taskData);
      set((state) => ({
        tasks: [...state.tasks, response.data],
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  }
}));
