import { create } from 'zustand';
import { api } from '@/lib/api';
import { PhotoModel, PhotoTrackingViewMode, PhotoOverviewStats, PhotoExcelImportLog } from '@/types/photo-tracking';

interface PhotoTrackingState {
  viewMode: PhotoTrackingViewMode;
  setViewMode: (mode: PhotoTrackingViewMode) => void;
  
  models: PhotoModel[];
  isLoadingModels: boolean;
  fetchModels: (projectId?: number, month?: number, year?: number) => Promise<void>;
  createModel: (data: any) => Promise<PhotoModel>;
  updateModel: (id: number, data: any) => Promise<PhotoModel>;
  deleteModel: (id: number) => Promise<void>;
  
  createColor: (modelId: number, data: any) => Promise<any>;
  updateColor: (id: number, data: any) => Promise<any>;
  deleteColor: (modelId: number, colorId: number) => Promise<void>;
  addRevision: (modelId: number, data: any) => Promise<any>;
  
  overviewStats: PhotoOverviewStats | null;
  isLoadingOverview: boolean;
  fetchOverview: (projectId?: number, month?: number, year?: number) => Promise<void>;
  
  importLogs: PhotoExcelImportLog[];
  isLoadingImport: boolean;
  importExcel: (file: File, projectId?: number) => Promise<PhotoExcelImportLog>;
  
  isExporting: boolean;
  exportExcel: (projectId?: number, month?: number, year?: number) => Promise<void>;
}

export const usePhotoTrackingStore = create<PhotoTrackingState>((set, get) => ({
  viewMode: 'overview',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  models: [],
  isLoadingModels: false,
  fetchModels: async (projectId, month, year) => {
    set({ isLoadingModels: true });
    try {
      const params = new URLSearchParams();
      if (projectId) params.append('project_id', projectId.toString());
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      
      const res = await api.get(`/api/venus/photo-tracking/models?${params.toString()}`);
      set({ models: res.data, isLoadingModels: false });
    } catch (e) {
      console.error(e);
      set({ isLoadingModels: false });
    }
  },
  
  createModel: async (data) => {
    const res = await api.post('/api/venus/photo-tracking/models', data);
    set(state => ({ models: [res.data, ...state.models] }));
    return res.data;
  },
  
  updateModel: async (id, data) => {
    const res = await api.put(`/api/venus/photo-tracking/models/${id}`, data);
    set(state => ({
      models: state.models.map(m => m.id === id ? res.data : m)
    }));
    return res.data;
  },
  
  deleteModel: async (id) => {
    await api.delete(`/api/venus/photo-tracking/models/${id}`);
    set(state => ({
      models: state.models.filter(m => m.id !== id)
    }));
  },
  
  createColor: async (modelId, data) => {
    const res = await api.post(`/api/venus/photo-tracking/models/${modelId}/colors`, data);
    const newColor = res.data;
    set(state => ({
      models: state.models.map(m => {
        if (m.id === modelId) {
          return { ...m, colors: [...m.colors, newColor] };
        }
        return m;
      })
    }));
    return newColor;
  },
  
  updateColor: async (id, data) => {
    const res = await api.put(`/api/venus/photo-tracking/colors/${id}`, data);
    // update in models array
    const color = res.data;
    set(state => ({
      models: state.models.map(m => {
        if (m.id === color.model_id) {
          const newColors = m.colors.map(c => c.id === color.id ? color : c);
          const newTotal = newColors.reduce((acc, c) => acc + c.ig_photo_count + c.banner_photo_count, 0);
          return { ...m, colors: newColors, total_photos: newTotal };
        }
        return m;
      })
    }));
    return color;
  },
  
  deleteColor: async (modelId, colorId) => {
    await api.delete(`/api/venus/photo-tracking/colors/${colorId}`);
    set(state => ({
      models: state.models.map(m => {
        if (m.id === modelId) {
          const newColors = m.colors.filter(c => c.id !== colorId);
          const newTotal = newColors.reduce((acc, c) => acc + c.ig_photo_count + c.banner_photo_count, 0);
          return { ...m, colors: newColors, total_photos: newTotal };
        }
        return m;
      })
    }));
  },
  
  addRevision: async (modelId, data) => {
    const res = await api.post(`/api/venus/photo-tracking/models/${modelId}/revisions`, data);
    const revision = res.data;
    set(state => ({
      models: state.models.map(m => {
        if (m.id === modelId) {
          return { ...m, revisions: [revision, ...m.revisions] };
        }
        return m;
      })
    }));
    return revision;
  },
  
  overviewStats: null,
  isLoadingOverview: false,
  fetchOverview: async (projectId, month, year) => {
    set({ isLoadingOverview: true });
    try {
      const params = new URLSearchParams();
      if (projectId) params.append('project_id', projectId.toString());
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      
      const res = await api.get(`/api/venus/photo-tracking/overview?${params.toString()}`);
      set({ overviewStats: res.data, isLoadingOverview: false });
    } catch (e) {
      console.error(e);
      set({ isLoadingOverview: false });
    }
  },
  
  importLogs: [],
  isLoadingImport: false,
  importExcel: async (file, projectId) => {
    set({ isLoadingImport: true });
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (projectId) formData.append('project_id', projectId.toString());
      
      const res = await api.post('/api/venus/photo-tracking/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set(state => ({ 
        importLogs: [res.data, ...state.importLogs],
        isLoadingImport: false
      }));
      // re-fetch models after import
      get().fetchModels(projectId, new Date().getMonth() + 1, new Date().getFullYear());
      return res.data;
    } catch (e) {
      console.error(e);
      set({ isLoadingImport: false });
      throw e;
    }
  },
  
  isExporting: false,
  exportExcel: async (projectId, month, year) => {
    set({ isExporting: true });
    try {
      const params = new URLSearchParams();
      if (projectId) params.append('project_id', projectId.toString());
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      
      const response = await api.get(`/api/venus/photo-tracking/export-excel?${params.toString()}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fotograf_takip.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      set({ isExporting: false });
    } catch (e) {
      console.error(e);
      set({ isExporting: false });
    }
  }
}));
