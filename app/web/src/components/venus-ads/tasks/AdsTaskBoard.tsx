import React, { useState, useEffect } from 'react';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { useProjectStore } from '@/stores/projectStore';
import { Plus, Target, Clock, CheckCircle2, AlertCircle, ChevronRight, X, Calendar, Flag, Bot, Wand2 } from 'lucide-react';
import { VenusAdsTask } from '@/types/venus-ads';
import { LinkedItemChip } from '../LinkedItemChip';

const CATEGORIES = [
  { value: 'budget', label: 'Bütçe Kontrolü', color: 'bg-emerald-500' },
  { value: 'optimization', label: 'Optimizasyon', color: 'bg-blue-500' },
  { value: 'creative', label: 'Kreatif', color: 'bg-purple-500' },
  { value: 'targeting', label: 'Hedefleme', color: 'bg-amber-500' },
  { value: 'reporting', label: 'Raporlama', color: 'bg-indigo-500' },
  { value: 'other', label: 'Diğer', color: 'bg-slate-500' },
];

const PRIORITIES = [
  { value: 'high', label: 'Yüksek', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  { value: 'medium', label: 'Orta', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { value: 'low', label: 'Düşük', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
];

const COLUMNS = [
  { key: 'todo', label: 'Yapılacak', icon: Clock, color: 'border-slate-300 dark:border-slate-600' },
  { key: 'in_progress', label: 'Yapılıyor', icon: ChevronRight, color: 'border-blue-400 dark:border-blue-600' },
  { key: 'done', label: 'Tamamlandı', icon: CheckCircle2, color: 'border-emerald-400 dark:border-emerald-600' },
];

interface TaskFormProps {
  onClose: () => void;
  projectId: number | null;
  initial?: VenusAdsTask | null;
}

function TaskForm({ onClose, projectId, initial }: TaskFormProps) {
  const { createTask, updateTask, fetchTasks, campaigns, experiments, creatives, fetchCampaigns, fetchExperiments, fetchCreatives, getAITaskNotes } = useVenusAdsStore();
  
  useEffect(() => {
    fetchCampaigns(projectId || undefined);
    fetchExperiments(projectId || undefined);
    fetchCreatives(projectId || undefined);
  }, [projectId]);

  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState(initial?.category || 'optimization');
  const [priority, setPriority] = useState(initial?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initial?.due_date?.split('T')[0] || '');
  const [campaignId, setCampaignId] = useState<number | ''>(initial?.campaign_id || '');
  const [experimentId, setExperimentId] = useState<number | ''>(initial?.experiment_id || '');
  const [creativeId, setCreativeId] = useState<number | ''>(initial?.creative_id || '');
  const [aiNotes, setAiNotes] = useState<string>(initial?.ai_notes || '');
  const [loading, setLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleGenerateAI = async () => {
    if (!title.trim()) return;
    setIsAiLoading(true);
    try {
      const campName = campaigns.find(c => c.id === campaignId)?.campaign_name;
      const expName = experiments.find(e => e.id === experimentId)?.experiment_name;
      const crName = creatives.find(c => c.id === creativeId)?.creative_name;
      const note = await getAITaskNotes(title, description, campName, expName, crName);
      setAiNotes(note);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const payload: Partial<VenusAdsTask> = {
        title,
        description: description || undefined,
        category,
        priority,
        status: initial?.status || 'todo',
        due_date: dueDate || undefined,
        source: 'manual',
        project_id: projectId || undefined,
        campaign_id: campaignId || undefined,
        experiment_id: experimentId || undefined,
        creative_id: creativeId || undefined,
        ai_notes: aiNotes || undefined,
      };
      if (initial) {
        await updateTask(initial.id, payload);
      } else {
        await createTask(payload);
      }
      await fetchTasks(projectId || undefined);
      onClose();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-lg font-bold text-brand-dark dark:text-white">{initial ? 'Görevi Düzenle' : 'Yeni Görev'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Başlık *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ör: Günlük bütçe kontrolü"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Açıklama</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Detaylar..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Öncelik</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white">
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Bitiş Tarihi</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white" />
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Kampanya</label>
                <select value={campaignId} onChange={e => setCampaignId(Number(e.target.value) || '')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white">
                  <option value="">- Seçiniz -</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.campaign_name}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Test / Deney</label>
                <select value={experimentId} onChange={e => setExperimentId(Number(e.target.value) || '')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white">
                  <option value="">- Seçiniz -</option>
                  {experiments.map(c => <option key={c.id} value={c.id}>{c.experiment_name}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Kreatif</label>
                <select value={creativeId} onChange={e => setCreativeId(Number(e.target.value) || '')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white">
                  <option value="">- Seçiniz -</option>
                  {creatives.map(c => <option key={c.id} value={c.id}>{c.creative_name}</option>)}
                 </select>
              </div>
           </div>

           {(aiNotes || isAiLoading) && (
              <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 group">
                 <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                    <Bot className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider flex-1">AI Görev Notu</span>
                    {!isAiLoading && <span className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">Daraltmak/Açmak için fareyle üzerine gelin</span>}
                 </div>
                 {isAiLoading ? (
                    <div className="text-sm text-indigo-500 animate-pulse">AI detayları analiz ediyor...</div>
                 ) : (
                    <p className="text-sm text-brand-dark dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-16 overflow-hidden group-hover:max-h-[500px] transition-all duration-300">{aiNotes}</p>
                 )}
              </div>
           )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <button 
            onClick={handleGenerateAI} 
            disabled={isAiLoading || !title.trim()} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
          >
            <Wand2 className="w-4 h-4" />
            AI'dan Aksiyon Önerisi Al
          </button>
          
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">İptal</button>
            <button onClick={handleSubmit} disabled={loading || !title.trim()}
              className="px-5 py-2.5 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-medium disabled:opacity-50">
              {loading ? 'Kaydediliyor...' : initial ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdsTaskBoard({ projectId }: { projectId: number | null }) {
  const { adsTasks, isLoadingTasks, fetchTasks, updateTask, deleteTask, setViewMode, setSelectedEntityToView, selectedEntityToView } = useVenusAdsStore();
  const { projects } = useProjectStore();
  const currentProject = projects.find(p => p.id === projectId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<VenusAdsTask | null>(null);

  useEffect(() => {
    fetchTasks(projectId || undefined);
  }, [projectId]);

  useEffect(() => {
    if (selectedEntityToView?.type === 'tasks') {
      const target = adsTasks.find(t => t.id === selectedEntityToView.id);
      if (target) {
        setEditingTask(target);
        setIsFormOpen(true);
      }
      setSelectedEntityToView(null);
    }
  }, [selectedEntityToView, adsTasks]);

  const handleMoveTask = async (task: VenusAdsTask, newStatus: string) => {
    await updateTask(task.id, { status: newStatus });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
      await deleteTask(id);
    }
  };

  const getPriorityInfo = (p: string) => PRIORITIES.find(pr => pr.value === p) || PRIORITIES[1];
  const getCategoryInfo = (c: string) => CATEGORIES.find(cat => cat.value === c) || CATEGORIES[5];
  
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('taskId', taskId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'), 10);
    if (!isNaN(taskId)) {
       const task = adsTasks.find(t => t.id === taskId);
       if (task && task.status !== status) {
          await handleMoveTask(task, status);
       }
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
            <Target className="w-6 h-6 text-indigo-500" />
            Operasyon Görevleri
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {currentProject ? `${currentProject.name} markasının g` : 'G'}ünlük, haftalık optimizasyon görevleri.
          </p>
        </div>
        <button onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
          className="px-5 py-2.5 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-medium transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Yeni Görev
        </button>
      </div>

      {/* Kanban Board */}
      {isLoadingTasks ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-dark rounded-full animate-spin dark:border-slate-700 dark:border-t-white" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
          {COLUMNS.map(col => {
            const tasks = adsTasks.filter(t => t.status === col.key);
            const Icon = col.icon;
            return (
              <div key={col.key} 
                className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 ${col.color} overflow-hidden flex flex-col`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                  <h2 className="font-bold text-brand-dark dark:text-white flex items-center gap-2 text-sm">
                    <Icon className="w-4 h-4" />
                    {col.label}
                  </h2>
                  <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                    {tasks.length}
                  </span>
                </div>
                <div className="p-3 space-y-3 flex-1 min-h-[200px]">
                  {tasks.length === 0 ? (
                    <div className="text-center text-sm text-slate-400 py-8">Henüz görev yok</div>
                  ) : (
                    tasks.map(task => {
                      const pri = getPriorityInfo(task.priority);
                      const cat = getCategoryInfo(task.category);
                      const { campaigns, experiments, creatives } = useVenusAdsStore.getState();
                      const lc = campaigns.find(c => c.id === task.campaign_id);
                      const le = experiments.find(x => x.id === task.experiment_id);
                      const lr = creatives.find(c => c.id === task.creative_id);

                      return (
                        <div key={task.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-white/5 p-4 hover:shadow-md transition-all group cursor-move"
                          onClick={() => { setEditingTask(task); setIsFormOpen(true); }}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-sm font-bold text-brand-dark dark:text-white leading-tight line-clamp-2">{task.title}</h3>
                            <div className="flex items-center gap-1 shrink-0">
                              {col.key !== 'done' && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleMoveTask(task, col.key === 'todo' ? 'in_progress' : 'done'); }}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-emerald-500" title="İlerlet">
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button onClick={e => { e.stopPropagation(); handleDelete(task.id); }}
                                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Sil">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          {task.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{task.description}</p>
                          )}
                          
                          {(lc || le || lr) && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {lc && <LinkedItemChip type="campaign" label={lc.campaign_name} onClick={() => { setSelectedEntityToView({ type: 'campaigns', id: lc.id }); setViewMode('campaigns'); }} />}
                              {le && <LinkedItemChip type="experiment" label={le.experiment_name} onClick={() => { setSelectedEntityToView({ type: 'tests', id: le.id }); setViewMode('tests'); }} />}
                              {lr && <LinkedItemChip type="creative" label={lr.creative_name} onClick={() => { setSelectedEntityToView({ type: 'creatives', id: lr.id }); setViewMode('creatives'); }} />}
                            </div>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${pri.bg} ${pri.color}`}>
                              <Flag className="w-2.5 h-2.5" />
                              {pri.label}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
                              {cat.label}
                            </span>
                            {task.due_date && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
                                <Calendar className="w-2.5 h-2.5" />
                                {new Date(task.due_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isFormOpen && <TaskForm onClose={() => setIsFormOpen(false)} projectId={projectId} initial={editingTask} />}
    </div>
  );
}
