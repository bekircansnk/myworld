import React, { useState, useEffect } from 'react';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { useProjectStore } from '@/stores/projectStore';
import { Plus, Beaker, CheckCircle2, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { VenusExperiment } from '@/types/venus-ads';
import { TestForm } from './TestForm';
import { LinkedItemChip } from '../LinkedItemChip';
import { TestDetailModal } from './TestDetailModal';

interface TestCenterProps {
  projectId: number | null;
}

export function TestCenter({ projectId }: TestCenterProps) {
  const { experiments, isLoadingExperiments, fetchExperiments, deleteCampaign: deleteExperiment } = useVenusAdsStore();
  const { projects } = useProjectStore();
  const currentProject = projects.find(p => p.id === projectId);
  const { campaigns, creatives } = useVenusAdsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<VenusExperiment | null>(null);
  const [detailTest, setDetailTest] = useState<VenusExperiment | null>(null);

  useEffect(() => {
    fetchExperiments(projectId || undefined);
  }, [projectId]);

  const handleOpenNew = () => {
    setEditingTest(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (test: VenusExperiment) => {
    setEditingTest(test);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bu testi silmek istediğinize emin misiniz?')) {
      const { deleteExperiment } = useVenusAdsStore.getState();
      await deleteExperiment(id);
    }
  };

  const runningTests = experiments.filter(e => e.status === 'running');
  const pastTests = experiments.filter(e => e.status !== 'running');

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
             <Beaker className="w-6 h-6 text-brand-gray dark:text-gray-400" />
            Test Merkezi
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {currentProject ? `${currentProject.name} markasının d` : 'D'}ijital deneylerini planlayın ve kazananları belirleyin.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-5 py-2.5 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Test
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Aktif Testler */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/20">
                 <h2 className="font-bold flex items-center gap-2 text-brand-dark dark:text-white">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     Koşan Testler ({runningTests.length})
                 </h2>
             </div>
             <div className="p-0">
                {isLoadingExperiments ? (
                  <div className="p-8 text-center text-sm text-slate-500">Yükleniyor...</div>
                ) : runningTests.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">Aktif bir A/B testi bulunmuyor.</div>
                ) : (
                  <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/5">
                      {runningTests.map(test => {
                          const lc = campaigns.find(c => c.id === test.campaign_id);
                          const kr = creatives.find(c => c.id === test.creative_id);
                          return (
                          <div key={test.id} onClick={() => setDetailTest(test)} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer relative">
                               <div className="flex justify-between items-start mb-2">
                                   <h3 className="font-bold text-brand-dark dark:text-white text-base pr-8">{test.experiment_name}</h3>
                                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(test); }} className="p-1.5 text-slate-400 hover:text-brand-dark dark:hover:text-white bg-white dark:bg-slate-800 shadow-sm rounded-lg"><Edit className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(test.id); }} className="p-1.5 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 shadow-sm rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                   </div>
                               </div>
                               {test.hypothesis && (
                                   <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                                       <strong>Hipotez:</strong> {test.hypothesis}
                                   </p>
                               )}
                               
                               {(lc || kr) && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                     {lc && <LinkedItemChip type="campaign" label={lc.campaign_name} />}
                                     {kr && <LinkedItemChip type="creative" label={kr.creative_name} />}
                                  </div>
                               )}

                               <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(test); }} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                                    Sonucu Belirle <ChevronRight className="w-3 h-3" />
                               </button>
                          </div>
                          );
                      })}
                  </div>
                )}
             </div>
        </div>

        {/* Geçmiş / Tamamlanmış Testler */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
                 <h2 className="font-bold flex items-center gap-2 text-brand-dark dark:text-white">
                     <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     Test Arşivi & Öğrenimler
                 </h2>
             </div>
             <div className="p-0">
               {isLoadingExperiments ? (
                  <div className="p-8 text-center text-sm text-slate-500">Yükleniyor...</div>
                ) : pastTests.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">Henüz tamamlanmış bir test yok.</div>
                ) : (
                  <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/5">
                      {pastTests.map(test => {
                          const lc = campaigns.find(c => c.id === test.campaign_id);
                          const kr = creatives.find(c => c.id === test.creative_id);
                          return (
                          <div key={test.id} onClick={() => setDetailTest(test)} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer relative">
                               <div className="flex justify-between items-start mb-2">
                                   <div className="pr-8">
                                     <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                         {test.experiment_name}
                                     </h3>
                                     <div className="mt-1 flex items-center gap-2">
                                         <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 uppercase">
                                             {test.status}
                                         </span>
                                         {test.winner && (
                                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1">
                                                 Kazanan: {test.winner}
                                             </span>
                                         )}
                                     </div>
                                   </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(test.id); }} className="p-1.5 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 shadow-sm rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                   </div>
                               </div>
                               
                               {(lc || kr) && (
                                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                     {lc && <LinkedItemChip type="campaign" label={lc.campaign_name} />}
                                     {kr && <LinkedItemChip type="creative" label={kr.creative_name} />}
                                  </div>
                               )}
                               {test.learnings && (
                                   <div className="text-sm text-slate-600 dark:text-slate-400 mt-2 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100/50 dark:border-emerald-900/20 line-clamp-2">
                                       <strong>Öğrenim:</strong> {test.learnings}
                                   </div>
                               )}
                          </div>
                      )})}
                  </div>
                )}
             </div>
        </div>

      </div>

      {isFormOpen && (
        <TestForm 
          onClose={() => setIsFormOpen(false)} 
          projectId={projectId} 
          initialData={editingTest} 
        />
      )}
      
      {detailTest && (
        <TestDetailModal
          test={detailTest}
          onClose={() => setDetailTest(null)}
        />
      )}
    </div>
  );
}
