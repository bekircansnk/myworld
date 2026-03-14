import React, { useState, useEffect } from 'react';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { useProjectStore } from '@/stores/projectStore';
import { Plus, ListChecks, CheckCircle2, Circle, Trash2, X, ChevronDown, ChevronUp, ClipboardCheck } from 'lucide-react';
import { VenusOnboardingChecklist } from '@/types/venus-ads';

const DEFAULT_ITEMS = [
  { title: 'Reklam hesabı erişimi alındı', done: false },
  { title: 'Mevcut kampanyalar incelendi', done: false },
  { title: 'Pixel/Tag kurulumu kontrol edildi', done: false },
  { title: 'Hedef kitle analizi yapıldı', done: false },
  { title: 'Marka kimliği ve kreatifler alındı', done: false },
  { title: 'İlk kampanya planı hazırlandı', done: false },
  { title: 'Müşteriyle kickoff toplantısı yapıldı', done: false },
  { title: 'KPI hedefleri belirlendi', done: false },
];

interface ChecklistFormProps {
  onClose: () => void;
  projectId: number | null;
}

function ChecklistForm({ onClose, projectId }: ChecklistFormProps) {
  const { createChecklist, fetchChecklists } = useVenusAdsStore();
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!clientName.trim()) return;
    setLoading(true);
    try {
      await createChecklist({
        client_name: clientName,
        status: 'in_progress',
        items: DEFAULT_ITEMS,
        notes: notes || undefined,
        project_id: projectId || undefined,
      });
      await fetchChecklists(projectId || undefined);
      onClose();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-lg font-bold text-brand-dark dark:text-white">Yeni Müşteri Devralma</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Müşteri / Marka Adı *</label>
            <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ör: Venüs Moda"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Notlar</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Genel bilgiler, özel durumlar..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 resize-none" />
          </div>
          <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Oluşturulduğunda varsayılan {DEFAULT_ITEMS.length} maddelik devralma kontrol listesi otomatik eklenecektir.</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">İptal</button>
          <button onClick={handleSubmit} disabled={loading || !clientName.trim()}
            className="px-5 py-2.5 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-medium disabled:opacity-50">
            {loading ? 'Oluşturuluyor...' : 'Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function OnboardingChecklist({ projectId }: { projectId: number | null }) {
  const { checklists, isLoadingChecklists, fetchChecklists, updateChecklist, deleteChecklist } = useVenusAdsStore();
  const { projects } = useProjectStore();
  const currentProject = projects.find(p => p.id === projectId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchChecklists(projectId || undefined);
  }, [projectId]);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleItem = async (checklist: VenusOnboardingChecklist, index: number) => {
    const newItems = [...(checklist.items || [])];
    newItems[index] = { ...newItems[index], done: !newItems[index].done };
    const allDone = newItems.every(i => i.done);
    await updateChecklist(checklist.id, { items: newItems, status: allDone ? 'completed' : 'in_progress' });
    await fetchChecklists(projectId || undefined);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bu checklist\'i silmek istediğinize emin misiniz?')) {
      await deleteChecklist(id);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
            <ListChecks className="w-6 h-6 text-brand-gray dark:text-gray-400" />
            Müşteri Devralma (Onboarding)
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {currentProject ? `${currentProject.name} markasının y` : 'Y'}eni reklam hesabı devralma kontrol listeleri.
          </p>
        </div>
        <button onClick={() => setIsFormOpen(true)}
          className="px-5 py-2.5 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-medium transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Yeni Devralma
        </button>
      </div>

      {isLoadingChecklists ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-dark rounded-full animate-spin dark:border-slate-700 dark:border-t-white" />
        </div>
      ) : checklists.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-20">
          <ClipboardCheck className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
          <p className="font-medium text-lg text-slate-500">Henüz devralma listesi yok</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">Yeni bir müşteri devralırken yapılacaklar listesi oluşturun.</p>
          <button onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
            İlk Devralma
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {checklists.map(cl => {
            const items = cl.items || [];
            const doneCount = items.filter(i => i.done).length;
            const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;
            const isExpanded = expandedIds.has(cl.id);
            return (
              <div key={cl.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/80 transition-colors"
                  onClick={() => toggleExpand(cl.id)}>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-10 h-10 shrink-0">
                      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                          stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-700" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                          stroke="currentColor" strokeWidth="3" strokeDasharray={`${progress}, 100`}
                          className={progress === 100 ? 'text-emerald-500' : 'text-indigo-500'} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-600 dark:text-slate-300">
                        {progress}%
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-brand-dark dark:text-white truncate">{cl.client_name}</h3>
                      <p className="text-xs text-slate-400">{doneCount}/{items.length} tamamlandı</p>
                    </div>
                    <span className={`ml-auto mr-4 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      cl.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                    }`}>
                      {cl.status === 'completed' ? 'TAMAMLANDI' : 'DEVAM EDİYOR'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); handleDelete(cl.id); }}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-6 pb-5 border-t border-slate-100 dark:border-white/5">
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 my-4">
                      <div className={`h-1.5 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${progress}%` }} />
                    </div>
                    <div className="space-y-1">
                      {items.map((item, idx) => (
                        <button key={idx} onClick={() => toggleItem(cl, idx)}
                          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                          {item.done
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            : <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-indigo-400" />}
                          <span className={`text-sm ${item.done ? 'line-through text-slate-400' : 'text-brand-dark dark:text-white'}`}>
                            {item.title}
                          </span>
                        </button>
                      ))}
                    </div>
                    {cl.notes && (
                      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs text-slate-500 dark:text-slate-400">
                        <strong>Not:</strong> {cl.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isFormOpen && <ChecklistForm onClose={() => setIsFormOpen(false)} projectId={projectId} />}
    </div>
  );
}
