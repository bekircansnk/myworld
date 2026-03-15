import React, { useState, useEffect } from 'react';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { useProjectStore } from '@/stores/projectStore';
import { Plus, LineChart, Globe, Trash2, X, Edit, ExternalLink, ThumbsUp, ThumbsDown, Palette, TrendingUp } from 'lucide-react';
import { VenusCompetitor } from '@/types/venus-ads';

interface CompetitorFormProps {
  onClose: () => void;
  projectId: number | null;
  initial?: VenusCompetitor | null;
}

function CompetitorForm({ onClose, projectId, initial }: CompetitorFormProps) {
  const { createCompetitor, updateCompetitor, fetchCompetitors } = useVenusAdsStore();
  const [brandName, setBrandName] = useState(initial?.brand_name || '');
  const [websiteUrl, setWebsiteUrl] = useState(initial?.website_url || '');
  const [adLibraryUrl, setAdLibraryUrl] = useState(initial?.ad_library_url || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [strengths, setStrengths] = useState(initial?.strengths || '');
  const [weaknesses, setWeaknesses] = useState(initial?.weaknesses || '');
  const [creativeStyle, setCreativeStyle] = useState(initial?.creative_style || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!brandName.trim()) return;
    setLoading(true);
    try {
      const payload: Partial<VenusCompetitor> = {
        brand_name: brandName,
        website_url: websiteUrl || undefined,
        ad_library_url: adLibraryUrl || undefined,
        category: category || undefined,
        strengths: strengths || undefined,
        weaknesses: weaknesses || undefined,
        creative_style: creativeStyle || undefined,
        notes: notes || undefined,
        project_id: projectId || undefined,
      };
      if (initial) {
        await updateCompetitor(initial.id, payload);
      } else {
        await createCompetitor(payload);
      }
      onClose();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-lg font-bold text-brand-dark dark:text-white">{initial ? 'Rakibi Düzenle' : 'Yeni Rakip Ekle'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Marka Adı *</label>
            <input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Ör: Zara"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Website</label>
              <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Kategori</label>
              <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Moda, Teknoloji..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Ad Library Linki</label>
            <input value={adLibraryUrl} onChange={e => setAdLibraryUrl(e.target.value)} placeholder="Meta Ad Library linki..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <ThumbsUp className="w-3 h-3 text-emerald-500" /> Güçlü Yönleri
            </label>
            <textarea value={strengths} onChange={e => setStrengths(e.target.value)} rows={2} placeholder="İyi yaptıkları şeyler..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <ThumbsDown className="w-3 h-3 text-red-500" /> Zayıf Yönleri
            </label>
            <textarea value={weaknesses} onChange={e => setWeaknesses(e.target.value)} rows={2} placeholder="Geliştirmeye açık alanlar..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Palette className="w-3 h-3 text-purple-500" /> Kreatif Tarzı
            </label>
            <input value={creativeStyle} onChange={e => setCreativeStyle(e.target.value)} placeholder="Minimalist, cesur renkler..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Notlar</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Genel gözlemler..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 resize-none" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-800">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">İptal</button>
          <button onClick={handleSubmit} disabled={loading || !brandName.trim()}
            className="px-5 py-2.5 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-medium disabled:opacity-50">
            {loading ? 'Kaydediliyor...' : initial ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BenchmarkDashboard({ projectId }: { projectId: number | null }) {
  const { competitors, isLoadingCompetitors, fetchCompetitors, deleteCompetitor } = useVenusAdsStore();
  const { projects } = useProjectStore();
  const currentProject = projects.find(p => p.id === projectId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<VenusCompetitor | null>(null);

  useEffect(() => {
    fetchCompetitors(projectId || undefined);
  }, [projectId]);

  const handleDelete = async (id: number) => {
    if (confirm('Bu rakibi silmek istediğinize emin misiniz?')) {
      await deleteCompetitor(id);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
            <LineChart className="w-6 h-6 text-brand-gray dark:text-gray-400" />
            Rakip Analizi & Benchmark
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {currentProject ? `${currentProject.name} markasının r` : 'R'}akiplerini izleyin ve stratejik avantaj elde edin.
          </p>
        </div>
        <button onClick={() => { setEditingCompetitor(null); setIsFormOpen(true); }}
          className="px-5 py-2.5 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-medium transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Yeni Rakip
        </button>
      </div>

      {isLoadingCompetitors ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-dark rounded-full animate-spin dark:border-slate-700 dark:border-t-white" />
        </div>
      ) : competitors.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-20">
          <TrendingUp className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
          <p className="font-medium text-lg text-slate-500">Henüz rakip eklenmedi</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">Rakiplerinizi ekleyerek stratejik avantaj elde edin.</p>
          <button onClick={() => { setEditingCompetitor(null); setIsFormOpen(true); }}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
            İlk Rakibi Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {competitors.map(comp => (
            <div key={comp.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden group hover:shadow-md transition-all">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/10">
                      <span className="text-lg font-black text-slate-600 dark:text-slate-300">{comp.brand_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-dark dark:text-white text-base">{comp.brand_name}</h3>
                      {comp.category && <span className="text-[10px] font-bold text-slate-400 uppercase">{comp.category}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingCompetitor(comp); setIsFormOpen(true); }}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-dark dark:hover:text-white rounded-lg">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(comp.id)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {comp.strengths && (
                  <div className="mb-3">
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> Güçlü Yönler
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-900/10 p-2.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/20 line-clamp-3">
                      {comp.strengths}
                    </p>
                  </div>
                )}
                {comp.weaknesses && (
                  <div className="mb-3">
                    <div className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase mb-1 flex items-center gap-1">
                      <ThumbsDown className="w-3 h-3" /> Zayıf Yönler
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-red-50/50 dark:bg-red-900/10 p-2.5 rounded-lg border border-red-100/50 dark:border-red-900/20 line-clamp-3">
                      {comp.weaknesses}
                    </p>
                  </div>
                )}
                {comp.creative_style && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Palette className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{comp.creative_style}</span>
                  </div>
                )}
              </div>

              <div className="px-6 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-3">
                {comp.website_url && (
                  <a href={comp.website_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                    <Globe className="w-3 h-3" /> Website
                  </a>
                )}
                {comp.ad_library_url && (
                  <a href={comp.ad_library_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                    <ExternalLink className="w-3 h-3" /> Ad Library
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && <CompetitorForm onClose={() => setIsFormOpen(false)} projectId={projectId} initial={editingCompetitor} />}
    </div>
  );
}
