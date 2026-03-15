import { create } from 'zustand';
import { api } from '@/lib/api';
import { VenusCampaign, VenusExperiment, VenusCreative, VenusAdsTask, VenusCompetitor, VenusOnboardingChecklist, VenusAIObservation, VenusCSVImport, VenusReportTemplate } from '@/types/venus-ads';

export type VenusViewMode = 'overview' | 'campaigns' | 'tests' | 'creatives' | 'tasks' | 'reports' | 'benchmark' | 'onboarding' | 'csv' | 'ai';
export type VenusSelectedEntity = { type: VenusViewMode, id: number };

interface VenusAdsState {
  viewMode: VenusViewMode;
  setViewMode: (mode: VenusViewMode) => void;
  selectedEntityToView: VenusSelectedEntity | null;
  setSelectedEntityToView: (entity: VenusSelectedEntity | null) => void;
  
  // Overview Data
  overviewData: any;
  isLoadingOverview: boolean;
  fetchOverview: (projectId?: number) => Promise<void>;
  
  // CSV Imports
  csvImports: VenusCSVImport[];
  isLoadingCSV: boolean;
  fetchCSVImports: (projectId?: number) => Promise<void>;
  createCSVImport: (data: Partial<VenusCSVImport>) => Promise<VenusCSVImport>;
  updateCSVImport: (id: number, data: Partial<VenusCSVImport>) => Promise<VenusCSVImport>;
  deleteCSVImport: (id: number) => Promise<void>;
  uploadCSV: (file: File, platform: string, projectId?: number) => Promise<VenusCSVImport>;

  // Campaigns
  campaigns: VenusCampaign[];
  isLoadingCampaigns: boolean;
  fetchCampaigns: (projectId?: number) => Promise<void>;
  createCampaign: (data: Partial<VenusCampaign>) => Promise<VenusCampaign>;
  updateCampaign: (id: number, data: Partial<VenusCampaign>) => Promise<VenusCampaign>;
  deleteCampaign: (id: number) => Promise<void>;

  // Experiments
  experiments: VenusExperiment[];
  isLoadingExperiments: boolean;
  fetchExperiments: (projectId?: number, campaignId?: number) => Promise<void>;
  createExperiment: (data: Partial<VenusExperiment>) => Promise<VenusExperiment>;
  updateExperiment: (id: number, data: Partial<VenusExperiment>) => Promise<VenusExperiment>;
  deleteExperiment: (id: number) => Promise<void>;
  getAICoaching: (experimentName: string, hypothesis: string) => Promise<string>;
  getAIReview: (id: number, experimentName: string, hypothesis: string, learnings: string, winner?: string) => Promise<string>;

  // Creatives
  creatives: VenusCreative[];
  isLoadingCreatives: boolean;
  fetchCreatives: (projectId?: number) => Promise<void>;
  createCreative: (data: Partial<VenusCreative>) => Promise<VenusCreative>;
  updateCreative: (id: number, data: Partial<VenusCreative>) => Promise<VenusCreative>;
  deleteCreative: (id: number) => Promise<void>;

  // Tasks
  adsTasks: VenusAdsTask[];
  isLoadingTasks: boolean;
  fetchTasks: (projectId?: number) => Promise<void>;
  createTask: (data: Partial<VenusAdsTask>) => Promise<VenusAdsTask>;
  updateTask: (id: number, data: Partial<VenusAdsTask>) => Promise<VenusAdsTask>;
  deleteTask: (id: number) => Promise<void>;
  getAITaskNotes: (title: string, description?: string, campaignName?: string, experimentName?: string, creativeName?: string) => Promise<string>;

  // Competitors
  competitors: VenusCompetitor[];
  isLoadingCompetitors: boolean;
  fetchCompetitors: (projectId?: number) => Promise<void>;
  createCompetitor: (data: Partial<VenusCompetitor>) => Promise<VenusCompetitor>;
  updateCompetitor: (id: number, data: Partial<VenusCompetitor>) => Promise<VenusCompetitor>;
  deleteCompetitor: (id: number) => Promise<void>;

  // Onboarding
  checklists: VenusOnboardingChecklist[];
  isLoadingChecklists: boolean;
  fetchChecklists: (projectId?: number) => Promise<void>;
  createChecklist: (data: Partial<VenusOnboardingChecklist>) => Promise<VenusOnboardingChecklist>;
  updateChecklist: (id: number, data: Partial<VenusOnboardingChecklist>) => Promise<VenusOnboardingChecklist>;
  deleteChecklist: (id: number) => Promise<void>;

  // AI Observations
  observations: VenusAIObservation[];
  isLoadingObservations: boolean;
  isGeneratingAI: boolean;
  fetchObservations: (projectId?: number) => Promise<void>;
  generateDailySummary: (projectId?: number) => Promise<void>;
  acknowledgeObservation: (id: number) => Promise<void>;
  deleteObservation: (id: number) => Promise<void>;

  // Reports
  reportTemplates: VenusReportTemplate[];
  isLoadingReports: boolean;
  fetchReportTemplates: (projectId?: number) => Promise<void>;
  createReportTemplate: (data: Partial<VenusReportTemplate>) => Promise<VenusReportTemplate>;
  deleteReportTemplate: (id: number) => Promise<void>;

}

// Helper to build CRUD actions for a given entity
function buildCrud<T extends { id: number }>(
  endpoint: string,
  stateKey: string,
  loadingKey: string,
) {
  return {
    [`fetch_${stateKey}`]: async (set: any, projectId?: number) => {
      set({ [loadingKey]: true });
      try {
        const url = projectId ? `${endpoint}?project_id=${projectId}` : endpoint;
        const res = await api.get(url);
        set({ [stateKey]: res.data, [loadingKey]: false });
      } catch (e) { console.error(`Failed to fetch ${stateKey}`, e); set({ [loadingKey]: false }); }
    },
  };
}

export const useVenusAdsStore = create<VenusAdsState>((set) => ({
  viewMode: 'overview',
  setViewMode: (mode) => set({ viewMode: mode }),
  selectedEntityToView: null,
  setSelectedEntityToView: (entity) => set({ selectedEntityToView: entity }),
  
  // ── OVERVIEW ──
  overviewData: null,
  isLoadingOverview: false,
  fetchOverview: async (projectId) => {
    set({ isLoadingOverview: true });
    try {
      const url = projectId ? `/api/venus/metrics/overview?project_id=${projectId}&days=7` : '/api/venus/metrics/overview?days=7';
      const res = await api.get(url);
      set({ overviewData: res.data, isLoadingOverview: false });
    } catch (e) {
      console.error("fetch overview", e);
      set({ isLoadingOverview: false });
    }
  },

  // ── CAMPAIGNS ──
  campaigns: [],
  isLoadingCampaigns: false,
  fetchCampaigns: async (projectId) => {
    set({ isLoadingCampaigns: true });
    try {
      const url = projectId ? `/api/venus/campaigns?project_id=${projectId}` : '/api/venus/campaigns';
      const res = await api.get(url);
      set({ campaigns: res.data, isLoadingCampaigns: false });
    } catch (e) { console.error("fetch campaigns", e); set({ isLoadingCampaigns: false }); }
  },
  createCampaign: async (data) => {
    const res = await api.post('/api/venus/campaigns', data);
    set((s) => ({ campaigns: [res.data, ...s.campaigns] }));
    return res.data;
  },
  updateCampaign: async (id, data) => {
    set((s) => ({ campaigns: s.campaigns.map(c => c.id === id ? { ...c, ...data } : c) }));
    try {
      const res = await api.put(`/api/venus/campaigns/${id}`, data);
      set((s) => ({ campaigns: s.campaigns.map(c => c.id === id ? res.data : c) }));
      return res.data;
    } catch (e) {
      // Optimizm rollback could be handled here or by re-fetching, simplest is full state updates anyway
      throw e;
    }
  },
  deleteCampaign: async (id) => {
    await api.delete(`/api/venus/campaigns/${id}`);
    set((s) => ({ campaigns: s.campaigns.filter(c => c.id !== id) }));
  },

  // ── EXPERIMENTS ──
  experiments: [],
  isLoadingExperiments: false,
  fetchExperiments: async (projectId, campaignId) => {
    set({ isLoadingExperiments: true });
    try {
      let url = '/api/venus/experiments?';
      if (projectId) url += `project_id=${projectId}&`;
      if (campaignId) url += `campaign_id=${campaignId}&`;
      const res = await api.get(url);
      set({ experiments: res.data, isLoadingExperiments: false });
    } catch (e) { console.error("fetch experiments", e); set({ isLoadingExperiments: false }); }
  },
  createExperiment: async (data) => {
    const res = await api.post('/api/venus/experiments', data);
    set((s) => ({ experiments: [res.data, ...s.experiments] }));
    return res.data;
  },
  updateExperiment: async (id, data) => {
    set((s) => ({ experiments: s.experiments.map(c => c.id === id ? { ...c, ...data } : c) }));
    const res = await api.put(`/api/venus/experiments/${id}`, data);
    set((s) => ({ experiments: s.experiments.map(c => c.id === id ? res.data : c) }));
    return res.data;
  },
  deleteExperiment: async (id) => {
    await api.delete(`/api/venus/experiments/${id}`);
    set((s) => ({ experiments: s.experiments.filter(c => c.id !== id) }));
  },
  getAICoaching: async (experimentName, hypothesis) => {
    const res = await api.post('/api/venus/experiments/0/ai-coach', { experiment_name: experimentName, hypothesis });
    return res.data.ai_comment;
  },
  getAIReview: async (id, experimentName, hypothesis, learnings, winner) => {
    const res = await api.post(`/api/venus/experiments/${id}/ai-review`, { experiment_name: experimentName, hypothesis, learnings, winner });
    set((s) => ({ experiments: s.experiments.map(c => c.id === id ? { ...c, ai_comment: res.data.ai_comment } : c) }));
    return res.data.ai_comment;
  },

  // ── CREATIVES ──
  creatives: [],
  isLoadingCreatives: false,
  fetchCreatives: async (projectId) => {
    set({ isLoadingCreatives: true });
    try {
      const url = projectId ? `/api/venus/creatives?project_id=${projectId}` : '/api/venus/creatives';
      const res = await api.get(url);
      set({ creatives: res.data, isLoadingCreatives: false });
    } catch (e) { console.error("fetch creatives", e); set({ isLoadingCreatives: false }); }
  },
  createCreative: async (data) => {
    const res = await api.post('/api/venus/creatives', data);
    set((s) => ({ creatives: [res.data, ...s.creatives] }));
    return res.data;
  },
  updateCreative: async (id, data) => {
    set((s) => ({ creatives: s.creatives.map(c => c.id === id ? { ...c, ...data } : c) }));
    const res = await api.put(`/api/venus/creatives/${id}`, data);
    set((s) => ({ creatives: s.creatives.map(c => c.id === id ? res.data : c) }));
    return res.data;
  },
  deleteCreative: async (id) => {
    await api.delete(`/api/venus/creatives/${id}`);
    set((s) => ({ creatives: s.creatives.filter(c => c.id !== id) }));
  },

  // ── ADS TASKS ──
  adsTasks: [],
  isLoadingTasks: false,
  fetchTasks: async (projectId) => {
    set({ isLoadingTasks: true });
    try {
      const url = projectId ? `/api/venus/tasks?project_id=${projectId}` : '/api/venus/tasks';
      const res = await api.get(url);
      set({ adsTasks: res.data, isLoadingTasks: false });
    } catch (e) { console.error("fetch tasks", e); set({ isLoadingTasks: false }); }
  },
  createTask: async (data) => {
    const res = await api.post('/api/venus/tasks', data);
    set((s) => ({ adsTasks: [res.data, ...s.adsTasks] }));
    return res.data;
  },
  updateTask: async (id, data) => {
    set((s) => ({ adsTasks: s.adsTasks.map(t => t.id === id ? { ...t, ...data } : t) }));
    const res = await api.put(`/api/venus/tasks/${id}`, data);
    set((s) => ({ adsTasks: s.adsTasks.map(t => t.id === id ? res.data : t) }));
    return res.data;
  },
  deleteTask: async (id) => {
    await api.delete(`/api/venus/tasks/${id}`);
    set((s) => ({ adsTasks: s.adsTasks.filter(t => t.id !== id) }));
  },
  getAITaskNotes: async (title, description, campaignName, experimentName, creativeName) => {
    const res = await api.post('/api/venus/tasks/ai-notes', { title, description, campaign_name: campaignName, experiment_name: experimentName, creative_name: creativeName });
    return res.data.ai_notes;
  },

  // ── COMPETITORS ──
  competitors: [],
  isLoadingCompetitors: false,
  fetchCompetitors: async (projectId) => {
    set({ isLoadingCompetitors: true });
    try {
      const url = projectId ? `/api/venus/competitors?project_id=${projectId}` : '/api/venus/competitors';
      const res = await api.get(url);
      set({ competitors: res.data, isLoadingCompetitors: false });
    } catch (e) { console.error("fetch competitors", e); set({ isLoadingCompetitors: false }); }
  },
  createCompetitor: async (data) => {
    const res = await api.post('/api/venus/competitors', data);
    set((s) => ({ competitors: [res.data, ...s.competitors] }));
    return res.data;
  },
  updateCompetitor: async (id, data) => {
    const res = await api.put(`/api/venus/competitors/${id}`, data);
    set((s) => ({ competitors: s.competitors.map(c => c.id === id ? res.data : c) }));
    return res.data;
  },
  deleteCompetitor: async (id) => {
    await api.delete(`/api/venus/competitors/${id}`);
    set((s) => ({ competitors: s.competitors.filter(c => c.id !== id) }));
  },

  // ── ONBOARDING CHECKLISTS ──
  checklists: [],
  isLoadingChecklists: false,
  fetchChecklists: async (projectId) => {
    set({ isLoadingChecklists: true });
    try {
      const url = projectId ? `/api/venus/onboarding?project_id=${projectId}` : '/api/venus/onboarding';
      const res = await api.get(url);
      set({ checklists: res.data, isLoadingChecklists: false });
    } catch (e) { console.error("fetch checklists", e); set({ isLoadingChecklists: false }); }
  },
  createChecklist: async (data) => {
    const res = await api.post('/api/venus/onboarding', data);
    set((s) => ({ checklists: [res.data, ...s.checklists] }));
    return res.data;
  },
  updateChecklist: async (id, data) => {
    set((s) => ({ checklists: s.checklists.map(c => c.id === id ? { ...c, ...data } : c) }));
    const res = await api.put(`/api/venus/onboarding/${id}`, data);
    set((s) => ({ checklists: s.checklists.map(c => c.id === id ? res.data : c) }));
    return res.data;
  },
  deleteChecklist: async (id) => {
    await api.delete(`/api/venus/onboarding/${id}`);
    set((s) => ({ checklists: s.checklists.filter(c => c.id !== id) }));
  },

  // ── AI OBSERVATIONS ──
  observations: [],
  isLoadingObservations: false,
  isGeneratingAI: false,
  fetchObservations: async (projectId) => {
    set({ isLoadingObservations: true });
    try {
      const url = projectId ? `/api/venus/ai-observations?project_id=${projectId}` : '/api/venus/ai-observations';
      const res = await api.get(url);
      set({ observations: res.data, isLoadingObservations: false });
    } catch (e) { console.error("fetch observations", e); set({ isLoadingObservations: false }); }
  },
  generateDailySummary: async (projectId) => {
    set({ isGeneratingAI: true });
    try {
      const url = projectId ? `/api/venus/ai-observations/generate-daily?project_id=${projectId}` : '/api/venus/ai-observations/generate-daily';
      await api.post(url);
      // Re-fetch after generation
      const fetchUrl = projectId ? `/api/venus/ai-observations?project_id=${projectId}` : '/api/venus/ai-observations';
      const res = await api.get(fetchUrl);
      set({ observations: res.data, isGeneratingAI: false });
    } catch (e) { console.error("generate daily ai", e); set({ isGeneratingAI: false }); }
  },
  acknowledgeObservation: async (id) => {
    const res = await api.put(`/api/venus/ai-observations/${id}`, { is_acknowledged: true });
    set((s) => ({ observations: s.observations.map(o => o.id === id ? res.data : o) }));
  },
  deleteObservation: async (id) => {
    await api.delete(`/api/venus/ai-observations/${id}`);
    set((s) => ({ observations: s.observations.filter(o => o.id !== id) }));
  },

  // ── REPORT TEMPLATES ──
  reportTemplates: [],
  isLoadingReports: false,
  fetchReportTemplates: async (projectId) => {
    set({ isLoadingReports: true });
    try {
      const url = projectId ? `/api/venus/reports?project_id=${projectId}` : '/api/venus/reports';
      const res = await api.get(url);
      set({ reportTemplates: res.data, isLoadingReports: false });
    } catch (e) { console.error("fetch reports", e); set({ isLoadingReports: false }); }
  },
  createReportTemplate: async (data) => {
    const res = await api.post('/api/venus/reports', data);
    set((s) => ({ reportTemplates: [res.data, ...s.reportTemplates] }));
    return res.data;
  },
  deleteReportTemplate: async (id) => {
    await api.delete(`/api/venus/reports/${id}`);
    set((s) => ({ reportTemplates: s.reportTemplates.filter(r => r.id !== id) }));
  },

  // ── CSV IMPORTS ──
  csvImports: [],
  isLoadingCSV: false,
  fetchCSVImports: async (projectId) => {
    set({ isLoadingCSV: true });
    try {
      const url = projectId ? `/api/venus/csv-imports?project_id=${projectId}` : '/api/venus/csv-imports';
      const res = await api.get(url);
      set({ csvImports: res.data, isLoadingCSV: false });
    } catch (e) { console.error("fetch csv imports", e); set({ isLoadingCSV: false }); }
  },
  createCSVImport: async (data) => {
    const res = await api.post('/api/venus/csv-imports', data);
    set((s) => ({ csvImports: [res.data, ...s.csvImports] }));
    return res.data;
  },
  updateCSVImport: async (id, data) => {
    const res = await api.put(`/api/venus/csv-imports/${id}`, data);
    set((s) => ({ csvImports: s.csvImports.map(c => c.id === id ? res.data : c) }));
    return res.data;
  },
  deleteCSVImport: async (id) => {
    await api.delete(`/api/venus/csv-imports/${id}`);
    set((s) => ({ csvImports: s.csvImports.filter(c => c.id !== id) }));
  },
  uploadCSV: async (file: File, platform: string, projectId?: number) => {
    set({ isLoadingCSV: true });
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('platform_source', platform);
      if (projectId) formData.append('project_id', String(projectId));

      const response = await api.post('/api/venus/csv-imports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = response.data;
      set(state => ({ csvImports: [data, ...state.csvImports], isLoadingCSV: false }));
      return data;
    } catch (error) {
      console.error("uploadCSV", error);
      set({ isLoadingCSV: false });
      throw error;
    }
  },
}));
