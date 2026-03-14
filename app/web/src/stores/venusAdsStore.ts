import { create } from 'zustand';
import { api } from '@/lib/api';
import { VenusCampaign, VenusExperiment, VenusCreative } from '@/types/venus-ads';

export type VenusViewMode = 'overview' | 'campaigns' | 'tests' | 'creatives' | 'tasks' | 'reports' | 'benchmark' | 'onboarding' | 'csv' | 'ai';

interface VenusAdsState {
  viewMode: VenusViewMode;
  setViewMode: (mode: VenusViewMode) => void;
  
  campaigns: VenusCampaign[];
  isLoadingCampaigns: boolean;
  fetchCampaigns: (projectId?: number) => Promise<void>;
  createCampaign: (data: Partial<VenusCampaign>) => Promise<VenusCampaign>;
  updateCampaign: (id: number, data: Partial<VenusCampaign>) => Promise<VenusCampaign>;
  deleteCampaign: (id: number) => Promise<void>;

  experiments: VenusExperiment[];
  isLoadingExperiments: boolean;
  fetchExperiments: (projectId?: number, campaignId?: number) => Promise<void>;
  createExperiment: (data: Partial<VenusExperiment>) => Promise<VenusExperiment>;
  updateExperiment: (id: number, data: Partial<VenusExperiment>) => Promise<VenusExperiment>;
  deleteExperiment: (id: number) => Promise<void>;

  creatives: VenusCreative[];
  isLoadingCreatives: boolean;
  fetchCreatives: (projectId?: number) => Promise<void>;
  createCreative: (data: Partial<VenusCreative>) => Promise<VenusCreative>;
  updateCreative: (id: number, data: Partial<VenusCreative>) => Promise<VenusCreative>;
  deleteCreative: (id: number) => Promise<void>;
}

export const useVenusAdsStore = create<VenusAdsState>((set) => ({
  viewMode: 'overview',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  campaigns: [],
  isLoadingCampaigns: false,
  
  fetchCampaigns: async (projectId) => {
    set({ isLoadingCampaigns: true });
    try {
      const url = projectId ? `/api/venus/campaigns?project_id=${projectId}` : '/api/venus/campaigns';
      const response = await api.get(url);
      set({ campaigns: response.data, isLoadingCampaigns: false });
    } catch (error) {
      console.error("Failed to fetch campaigns", error);
      set({ isLoadingCampaigns: false });
    }
  },
  
  createCampaign: async (data) => {
    try {
      const response = await api.post('/api/venus/campaigns', data);
      set((state) => ({ campaigns: [response.data, ...state.campaigns] }));
      return response.data;
    } catch (error) {
      console.error("Failed to create campaign", error);
      throw error;
    }
  },

  updateCampaign: async (id, data) => {
    try {
      const response = await api.put(`/api/venus/campaigns/${id}`, data);
      set((state) => ({
        campaigns: state.campaigns.map(c => c.id === id ? response.data : c)
      }));
      return response.data;
    } catch (error) {
      console.error("Failed to update campaign", error);
      throw error;
    }
  },

  deleteCampaign: async (id) => {
    try {
      await api.delete(`/api/venus/campaigns/${id}`);
      set((state) => ({
        campaigns: state.campaigns.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error("Failed to delete campaign", error);
      throw error;
    }
  },

  // EXPERIMENTS
  experiments: [],
  isLoadingExperiments: false,
  fetchExperiments: async (projectId, campaignId) => {
    set({ isLoadingExperiments: true });
    try {
      let url = '/api/venus/experiments?';
      if (projectId) url += `project_id=${projectId}&`;
      if (campaignId) url += `campaign_id=${campaignId}&`;
      const response = await api.get(url);
      set({ experiments: response.data, isLoadingExperiments: false });
    } catch (error) {
      console.error("Failed to fetch experiments", error);
      set({ isLoadingExperiments: false });
    }
  },
  createExperiment: async (data) => {
    try {
      const response = await api.post('/api/venus/experiments', data);
      set((state) => ({ experiments: [response.data, ...state.experiments] }));
      return response.data;
    } catch (error) {
      console.error("Failed to create exp", error);
      throw error;
    }
  },
  updateExperiment: async (id, data) => {
    try {
      const response = await api.put(`/api/venus/experiments/${id}`, data);
      set((state) => ({
        experiments: state.experiments.map(c => c.id === id ? response.data : c)
      }));
      return response.data;
    } catch (error) {
      console.error("Failed to update exp", error);
      throw error;
    }
  },
  deleteExperiment: async (id) => {
    try {
      await api.delete(`/api/venus/experiments/${id}`);
      set((state) => ({
        experiments: state.experiments.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error("Failed to delete exp", error);
      throw error;
    }
  },

  // CREATIVES
  creatives: [],
  isLoadingCreatives: false,
  fetchCreatives: async (projectId) => {
    set({ isLoadingCreatives: true });
    try {
      const url = projectId ? `/api/venus/creatives?project_id=${projectId}` : '/api/venus/creatives';
      const response = await api.get(url);
      set({ creatives: response.data, isLoadingCreatives: false });
    } catch (error) {
      console.error("Failed to fetch creatives", error);
      set({ isLoadingCreatives: false });
    }
  },
  createCreative: async (data) => {
    try {
      const response = await api.post('/api/venus/creatives', data);
      set((state) => ({ creatives: [response.data, ...state.creatives] }));
      return response.data;
    } catch (error) {
      console.error("Failed to create creative", error);
      throw error;
    }
  },
  updateCreative: async (id, data) => {
    try {
      const response = await api.put(`/api/venus/creatives/${id}`, data);
      set((state) => ({
        creatives: state.creatives.map(c => c.id === id ? response.data : c)
      }));
      return response.data;
    } catch (error) {
      console.error("Failed to update creative", error);
      throw error;
    }
  },
  deleteCreative: async (id) => {
    try {
      await api.delete(`/api/venus/creatives/${id}`);
      set((state) => ({
        creatives: state.creatives.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error("Failed to delete creative", error);
      throw error;
    }
  }

}));
