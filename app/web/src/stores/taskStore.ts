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
    const tempId = Date.now();
    const tempTask = { ...data, id: tempId, status: data.status || 'todo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Task;
    set((state) => ({
      tasks: [tempTask, ...state.tasks],
    }));
    try {
      const response = await api.post('/api/tasks', data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === tempId ? response.data : t)),
      }));
    } catch (error: any) {
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== tempId),
        error: error.message
      }));
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
      const response = await api.put(`/api/tasks/${id}`, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? response.data : t)),
        selectedTask: state.selectedTask?.id === id ? response.data : state.selectedTask,
      }));
    } catch (error: any) {
      set({ tasks: previousTasks, selectedTask: previousSelected, error: error.message });
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
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
      isDetailPanelOpen: state.selectedTask?.id === id ? false : state.isDetailPanelOpen,
    }));
    try {
      await api.delete(`/api/tasks/${id}`);
    } catch (error: any) {
      set({ error: error.message });
      get().fetchTasks();
    }
  },

  addSubtask: async (parentId, taskData) => {
    const tempId = Date.now();
    const tempSubtask = { ...taskData, id: tempId, parent_task_id: parentId, status: taskData.status || 'todo', created_at: new Date().toISOString() } as Task;
    set((state) => ({
      tasks: [...state.tasks, tempSubtask],
    }));
    try {
      const response = await api.post(`/api/tasks/${parentId}/subtasks`, taskData);
      set((state) => ({
        tasks: state.tasks.map(t => t.id === tempId ? response.data : t),
      }));
    } catch (error: any) {
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== tempId),
        error: error.message
      }));
    }
  }
}));
