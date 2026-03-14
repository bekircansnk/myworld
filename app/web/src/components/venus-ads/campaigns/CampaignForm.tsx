import React, { useState } from 'react';
import { VenusCampaign } from '@/types/venus-ads';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { useProjectStore } from '@/stores/projectStore';
import { X, Save, AlertCircle } from 'lucide-react';

interface CampaignFormProps {
  onClose: () => void;
  projectId: number | null;
  initialData?: VenusCampaign | null;
}

export function CampaignForm({ onClose, projectId, initialData }: CampaignFormProps) {
  const { createCampaign, updateCampaign } = useVenusAdsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<VenusCampaign>>(
    initialData || {
      campaign_name: '',
      platform: 'meta',
      status: 'active',
      campaign_type: '',
      objective: '',
      project_id: projectId || undefined,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (initialData?.id) {
        await updateCampaign(initialData.id, formData);
      } else {
        await createCampaign(formData);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1c23] w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-dark dark:text-white">
            {initialData ? 'Kampanyayı Düzenle' : 'Yeni Kampanya Ekle'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm flex items-start gap-2 border border-red-100 dark:border-red-900/30">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Kampanya Adı *</label>
            <input
              type="text"
              name="campaign_name"
              required
              value={formData.campaign_name || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 dark:focus:ring-white/20"
              placeholder="Örn: Black Friday - Ayakkabı"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Platform *</label>
              <select
                name="platform"
                required
                value={formData.platform || 'meta'}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white"
              >
                <option value="meta">Meta (Facebook/IG)</option>
                <option value="google_ads">Google Ads</option>
                <option value="manual">Diğer / Manuel</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Durum</label>
              <select
                name="status"
                value={formData.status || 'active'}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white"
              >
                <option value="active">Aktif</option>
                <option value="paused">Durduruldu</option>
                <option value="draft">Taslak</option>
                <option value="ended">Bitti</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Kampanya Türü</label>
              <input
                type="text"
                name="campaign_type"
                value={formData.campaign_type || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white"
                placeholder="Örn: Search, PMax, ASC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Hedef</label>
              <input
                type="text"
                name="objective"
                value={formData.objective || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white"
                placeholder="Örn: Satış, Lead, Trafik"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Günlük Bütçe (₺)</label>
              <input
                type="number"
                name="budget_daily"
                value={formData.budget_daily || ''}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white"
                placeholder="Örn: 500"
              />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-medium bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {initialData ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
