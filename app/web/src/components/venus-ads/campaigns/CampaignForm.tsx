import React, { useState } from 'react';
import { VenusCampaign } from '@/types/venus-ads';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { useProjectStore } from '@/stores/projectStore';
import { X, Save, AlertCircle, Beaker, Image as ImageIcon, CheckSquare } from 'lucide-react';

interface CampaignFormProps {
  onClose: () => void;
  projectId: number | null;
  initialData?: VenusCampaign | null;
}

export function CampaignForm({ onClose, projectId, initialData }: CampaignFormProps) {
  const { createCampaign, updateCampaign, experiments, creatives, adsTasks, fetchExperiments, fetchCreatives, fetchTasks, setViewMode, setSelectedEntityToView } = useVenusAdsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialData?.id) {
      fetchExperiments(projectId || undefined, initialData.id);
      fetchCreatives(projectId || undefined);
      fetchTasks(projectId || undefined);
    }
  }, [initialData?.id, projectId]);


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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`bg-white dark:bg-[#1a1c23] ${initialData ? 'w-full max-w-4xl' : 'w-full max-w-xl'} rounded-2xl shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-dark dark:text-white">
            {initialData ? 'Kampanya Detayı ve Düzenleme' : 'Yeni Kampanya Ekle'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          <form onSubmit={handleSubmit} className={`p-6 space-y-5 ${initialData ? 'md:w-1/2 border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5' : 'w-full'}`}>
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">Genel Bilgiler</h3>
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

            {initialData && (
              <div className="md:w-1/2 p-6 flex flex-col gap-6 bg-slate-50/30 dark:bg-slate-900/10">
                <h3 className="font-bold text-slate-800 dark:text-white">Bağlı Sistemler (Entegrasyon)</h3>
                
                {/* Experiments */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                    <Beaker className="w-4 h-4 text-purple-500" />
                    Test & Deneyler
                  </h4>
                  <div className="space-y-2">
                    {experiments.filter(e => e.campaign_id === initialData.id).length === 0 && (
                      <p className="text-sm text-slate-400 pb-2">Bağlı test bulunamadı.</p>
                    )}
                    {experiments.filter(e => e.campaign_id === initialData.id).map(exp => (
                      <button key={exp.id} onClick={() => { onClose(); setSelectedEntityToView({ type: 'tests', id: exp.id }); setViewMode('tests'); }} className="w-full text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-3 hover:border-purple-300 transition-colors flex justify-between items-center group">
                        <div>
                          <p className="text-sm font-bold text-brand-dark dark:text-white line-clamp-1">{exp.experiment_name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{exp.hypothesis}</p>
                        </div>
                        <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded-full group-hover:bg-purple-100 transition-colors shrink-0">GİT</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Creatives */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    Kreatif Laboratuvarı
                  </h4>
                  <div className="space-y-2">
                    {creatives.filter(c => c.campaign_id === initialData.id).length === 0 && (
                      <p className="text-sm text-slate-400 pb-2">Bağlı kreatif bulunamadı.</p>
                    )}
                    {creatives.filter(c => c.campaign_id === initialData.id).map(crt => (
                      <button key={crt.id} onClick={() => { onClose(); setSelectedEntityToView({ type: 'creatives', id: crt.id }); setViewMode('creatives'); }} className="w-full text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-3 hover:border-emerald-300 transition-colors flex justify-between items-center group">
                        <div>
                          <p className="text-sm font-bold text-brand-dark dark:text-white line-clamp-1">{crt.creative_name}</p>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full group-hover:bg-emerald-100 transition-colors shrink-0">GİT</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tasks */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                    <CheckSquare className="w-4 h-4 text-blue-500" />
                    Operasyon Görevleri
                  </h4>
                  <div className="space-y-2">
                    {adsTasks.filter(t => t.campaign_id === initialData.id).length === 0 && (
                      <p className="text-sm text-slate-400 pb-2">Bağlı görev bulunamadı.</p>
                    )}
                    {adsTasks.filter(t => t.campaign_id === initialData.id).map(task => (
                      <button key={task.id} onClick={() => { onClose(); setSelectedEntityToView({ type: 'tasks', id: task.id }); setViewMode('tasks'); }} className="w-full text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-3 hover:border-blue-300 transition-colors flex justify-between items-center group">
                        <div>
                          <p className="text-sm font-bold text-brand-dark dark:text-white line-clamp-1">{task.title}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${task.status === 'done' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'} shrink-0`}>
                          {task.status === 'done' ? 'TAMAMLANDI' : 'GİT'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
        </div>
      </div>
    </div>
  );
}
