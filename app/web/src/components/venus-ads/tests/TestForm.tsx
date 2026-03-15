import React, { useState, useEffect } from 'react';
import { VenusExperiment } from '@/types/venus-ads';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { X, Save, AlertCircle, Bot } from 'lucide-react';

interface TestFormProps {
  onClose: () => void;
  projectId: number | null;
  initialData?: VenusExperiment | null;
}

export function TestForm({ onClose, projectId, initialData }: TestFormProps) {
  const { createExperiment, updateExperiment, campaigns, fetchCampaigns, getAICoaching } = useVenusAdsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiCoachComment, setAiCoachComment] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetchCampaigns(projectId || undefined);
  }, [projectId]);

  const [formData, setFormData] = useState<Partial<VenusExperiment>>(
    initialData || {
      experiment_name: '',
      hypothesis: '',
      status: 'running',
      project_id: projectId || undefined,
      campaign_id: undefined,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.name === 'campaign_id' ? Number(e.target.value) || undefined : e.target.value
    }));
  };

  const handleAiCoach = async () => {
    if (!formData.experiment_name || !formData.hypothesis) return;
    setIsAiLoading(true);
    try {
      const comment = await getAICoaching(formData.experiment_name, formData.hypothesis);
      setAiCoachComment(comment);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleHypothesisBlur = () => {
    if (formData.hypothesis && formData.hypothesis.length >= 20 && !aiCoachComment && !isAiLoading) {
      handleAiCoach();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (initialData?.id) {
        await updateExperiment(initialData.id, formData);
      } else {
        await createExperiment(formData);
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
            {initialData ? 'Testi Düzenle' : 'Yeni A/B Testi Ekle'}
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
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Test / Deney Adı *</label>
            <input
              type="text"
              name="experiment_name"
              required
              value={formData.experiment_name || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 dark:focus:ring-white/20"
              placeholder="Örn: Kırmızı Buton vs Yeşil Buton Denemesi"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                <span>Hipotez</span>
                {!aiCoachComment && formData.hypothesis && formData.experiment_name && (
                   <button type="button" onClick={handleAiCoach} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5" />
                      {isAiLoading ? 'Düşünüyor...' : "AI'dan Öneri Al"}
                   </button>
                )}
             </label>
             <textarea
                name="hypothesis"
                rows={3}
                value={formData.hypothesis || ''}
                onChange={handleChange}
                onBlur={handleHypothesisBlur}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 dark:focus:ring-white/20 resize-none"
                placeholder="Bu testte neyi kanıtlamaya çalışıyoruz?"
             />
             {aiCoachComment && (
               <div className="mt-3 p-3.5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-3">
                 <Bot className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                 <div className="text-sm text-brand-dark dark:text-slate-300 space-y-1.5">
                   <p className="font-bold text-indigo-700 dark:text-indigo-400">AI Test Koçu:</p>
                   <div className="whitespace-pre-wrap">{aiCoachComment}</div>
                 </div>
               </div>
             )}
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
               📎 Bağlı Kampanya
             </label>
             <select
                name="campaign_id"
                value={formData.campaign_id || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white"
             >
                <option value="">-- Kampanya Seçin (Opsiyonel) --</option>
                {campaigns.map(c => (
                   <option key={c.id} value={c.id}>{c.campaign_name}</option>
                ))}
             </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Durum</label>
              <select
                name="status"
                value={formData.status || 'running'}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white"
              >
                <option value="running">Aktif (Koşuyor)</option>
                <option value="drafted">Taslak</option>
                <option value="completed">Tamamlandı</option>
                <option value="stopped">Durduruldu (Erken)</option>
              </select>
            </div>
            {formData.status === 'completed' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Kazanan</label>
                <input
                  type="text"
                  name="winner"
                  value={formData.winner || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                  placeholder="Kırmızı Buton"
                />
              </div>
            )}
          </div>

          {(formData.status === 'completed' || formData.status === 'stopped') && (
            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Öğrenim & Çıkarım</label>
               <textarea
                  name="learnings"
                  rows={2}
                  value={formData.learnings || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white resize-none"
                  placeholder="Bu testten ne öğrendik?"
               />
            </div>
          )}

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
