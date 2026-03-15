import React, { useState, useEffect } from 'react';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { useProjectStore } from '@/stores/projectStore';
import { Plus, FileText, Clock, Download, Trash2, X, BarChart3, Calendar, TrendingUp, Eye } from 'lucide-react';
import { VenusReportTemplate } from '@/types/venus-ads';

const TEMPLATE_TYPES = [
  { value: 'weekly', label: 'Haftalık Rapor', icon: Calendar },
  { value: 'monthly', label: 'Aylık Rapor', icon: BarChart3 },
  { value: 'campaign', label: 'Kampanya Raporu', icon: TrendingUp },
  { value: 'custom', label: 'Özel Rapor', icon: FileText },
];

interface ReportFormProps {
  onClose: () => void;
  projectId: number | null;
}

function ReportForm({ onClose, projectId }: ReportFormProps) {
  const { createReportTemplate, fetchReportTemplates } = useVenusAdsStore();
  const [title, setTitle] = useState('');
  const [templateType, setTemplateType] = useState('weekly');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createReportTemplate({
        title,
        template_type: templateType,
        project_id: projectId || undefined,
        is_default: false,
        sections: {
          overview: true,
          campaign_performance: true,
          top_creatives: templateType !== 'custom',
          recommendations: true,
        },
      });
      onClose();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-lg font-bold text-brand-dark dark:text-white">Yeni Rapor Şablonu</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Rapor Adı *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ör: Venüs Mart 2026 Haftalık Rapor"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Şablon Türü</label>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATE_TYPES.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.value} onClick={() => setTemplateType(t.value)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                      templateType === t.value
                        ? 'border-brand-dark dark:border-white bg-slate-50 dark:bg-slate-700'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300'
                    }`}>
                    <Icon className={`w-5 h-5 ${templateType === t.value ? 'text-brand-dark dark:text-white' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium ${templateType === t.value ? 'text-brand-dark dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">İptal</button>
          <button onClick={handleSubmit} disabled={loading || !title.trim()}
            className="px-5 py-2.5 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-medium disabled:opacity-50">
            {loading ? 'Oluşturuluyor...' : 'Şablon Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdsReportCenter({ projectId }: { projectId: number | null }) {
  const { reportTemplates, isLoadingReports, fetchReportTemplates, deleteReportTemplate } = useVenusAdsStore();
  const { projects } = useProjectStore();
  const currentProject = projects.find(p => p.id === projectId);

  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchReportTemplates(projectId || undefined);
  }, [projectId]);

  const handleDelete = async (id: number) => {
    if (confirm('Bu şablonu silmek istediğinize emin misiniz?')) {
      await deleteReportTemplate(id);
    }
  };

  const getTypeInfo = (t: string) => TEMPLATE_TYPES.find(tp => tp.value === t) || TEMPLATE_TYPES[3];

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
            <FileText className="w-6 h-6 text-brand-gray dark:text-gray-400" />
            Rapor Merkezi
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {currentProject ? `${currentProject.name} markasının p` : 'P'}erformans raporlarını oluşturun ve yönetin.
          </p>
        </div>
        <button onClick={() => setIsFormOpen(true)}
          className="px-5 py-2.5 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-medium transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Yeni Şablon
        </button>
      </div>

      {/* Report Templates Grid */}
      {isLoadingReports ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-dark rounded-full animate-spin dark:border-slate-700 dark:border-t-white" />
        </div>
      ) : reportTemplates.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-20">
          <FileText className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
          <p className="font-medium text-lg text-slate-500">Henüz rapor şablonu yok</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">İlk şablonunuzu oluşturarak raporlamaya başlayın.</p>
          <button onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
            İlk Şablonu Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTemplates.map(report => {
            const typeInfo = getTypeInfo(report.template_type);
            const Icon = typeInfo.icon;
            return (
              <div key={report.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden group hover:shadow-md transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-indigo-500" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase">
                      {typeInfo.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-brand-dark dark:text-white text-base mb-2 line-clamp-2">{report.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(report.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="px-6 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
                  <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                    <Eye className="w-3.5 h-3.5" />
                    Önizle
                  </button>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white" title="İndir">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(report.id)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-slate-400 hover:text-red-500" title="Sil">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isFormOpen && <ReportForm onClose={() => setIsFormOpen(false)} projectId={projectId} />}
    </div>
  );
}
