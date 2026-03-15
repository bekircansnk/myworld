import React, { useState, useEffect } from 'react';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { useProjectStore } from '@/stores/projectStore';
import { Plus, Image as ImageIcon, Video, Layers, CheckSquare, Star, Edit, Trash2, MessageSquare, X, Target } from 'lucide-react';
import { CreativeForm } from './CreativeForm';
import { VenusCreative } from '@/types/venus-ads';

interface CreativeLibraryProps {
  projectId: number | null;
}

export function CreativeLibrary({ projectId }: CreativeLibraryProps) {
  const { creatives, isLoadingCreatives, fetchCreatives, deleteCreative, selectedEntityToView, setSelectedEntityToView } = useVenusAdsStore();
  const { projects } = useProjectStore();
  const currentProject = projects.find(p => p.id === projectId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCreative, setEditingCreative] = useState<VenusCreative | null>(null);
  const [viewingCreative, setViewingCreative] = useState<VenusCreative | null>(null);

  useEffect(() => {
    fetchCreatives(projectId || undefined);
  }, [projectId]);

  useEffect(() => {
    if (selectedEntityToView?.type === 'creatives') {
      const target = creatives.find(c => c.id === selectedEntityToView.id);
      if (target) {
        setEditingCreative(target);
        setIsFormOpen(true);
      }
      setSelectedEntityToView(null);
    }
  }, [selectedEntityToView, creatives]);

  const handleOpenNew = () => {
    setEditingCreative(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (creative: VenusCreative) => {
    setEditingCreative(creative);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bu kreatifi kütüphaneden silmek istediğinize emin misiniz?')) {
      await deleteCreative(id);
    }
  };

  const renderIcon = (type: string) => {
      switch(type) {
          case 'image': return <ImageIcon className="w-6 h-6 text-blue-500" />;
          case 'video': return <Video className="w-6 h-6 text-purple-500" />;
          case 'carousel': return <Layers className="w-6 h-6 text-amber-500" />;
          default: return <CheckSquare className="w-6 h-6 text-slate-500" />;
      }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
             <ImageIcon className="w-6 h-6 text-brand-gray dark:text-gray-400" />
            Kreatif Laboratuvarı ({creatives.length})
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {currentProject ? `${currentProject.name} markasının r` : 'R'}eklam görsellerini, videolarını ve tasarımlarının performansını arşivleyin.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-5 py-2.5 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Kreatif
        </button>
      </div>

     {/* Grid Matrix */}
     <div className="flex-1 relative">
         {isLoadingCreatives ? (
              <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-dark rounded-full animate-spin dark:border-slate-700 dark:border-t-white" />
              </div>
         ) : creatives.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
               <ImageIcon className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
               <p className="font-medium text-lg">Laboratuvar Boş</p>
               <p className="text-sm mt-1 mb-6">Buraya henüz herhangi bir reklam tasarımı eklenmedi.</p>
               <button
                  onClick={handleOpenNew}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
               >
                  Tasarım Yükle
               </button>
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {creatives.map(creative => (
                    <div key={creative.id} className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600">
                         {/* Thumbnail Area - Aspect ratio based on format logic (simplified representation) */}
                         <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-6 border-b border-slate-100 dark:border-white/5 overflow-hidden">
                              {(creative.url || creative.thumbnail_url) ? (
                                  <img src={creative.url || creative.thumbnail_url} alt={creative.creative_name} referrerPolicy="no-referrer" className="object-cover w-full h-full rounded-lg" />
                              ) : (
                                  <div className="flex flex-col items-center justify-center text-slate-400 opacity-50 transform scale-150">
                                      {renderIcon(creative.creative_type)}
                                  </div>
                              )}

                              {/* Action overlay */}
                              <div className="absolute inset-x-0 top-0 p-3 flex justify-between items-start">
                                  <span className="bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm shadow-sm capitalize border border-white/20">
                                      {creative.format || 'Bilinmiyor'}
                                  </span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => handleOpenEdit(creative)} className="p-1.5 bg-white text-slate-600 rounded-lg hover:text-brand-dark dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white shadow-sm border border-slate-200 dark:border-white/10"><Edit className="w-3.5 h-3.5" /></button>
                                       <button onClick={() => handleDelete(creative.id)} className="p-1.5 bg-white text-slate-600 rounded-lg hover:text-red-500 shadow-sm border border-slate-200 dark:border-white/10 dark:bg-slate-800"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                              </div>
                         </div>
                         
                         {/* Body */}
                         <div 
                            className="p-4 flex-1 flex flex-col cursor-pointer"
                            onClick={() => setViewingCreative(creative)}
                         >
                             <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-bold text-brand-dark dark:text-white text-sm leading-tight flex-1 line-clamp-2">
                                    {creative.creative_name}
                                </h3>
                             </div>

                             {/* Notes on Card */}
                             {creative.notes && (
                                <div className="mt-1 mb-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">
                                   <div className="flex items-start gap-1.5 text-slate-500 dark:text-slate-400">
                                      <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                      <p className="text-xs italic line-clamp-3 leading-relaxed">"{creative.notes}"</p>
                                   </div>
                                </div>
                             )}

                            {/* Performans Skoru */}
                            <div className="mt-auto pt-3 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Star className={`w-4 h-4 ${creative.performance_score && creative.performance_score > 7 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {creative.performance_score ? `${creative.performance_score}/10` : '-/10'}
                                    </span>
                                </div>
                                {creative.designer && (
                                    <span className="text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded">By {creative.designer}</span>
                                )}
                            </div>
                         </div>
                    </div>
                ))}
            </div>
         )}
     </div>

      {isFormOpen && (
        <CreativeForm 
          onClose={() => setIsFormOpen(false)} 
          projectId={projectId} 
          initialData={editingCreative} 
        />
      )}

      {/* Viewing Detail Modal */}
      {viewingCreative && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1c23] w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left side: Media */}
            <div className="w-full md:w-1/2 min-h-[300px] bg-slate-100 dark:bg-[#0f1117] relative flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 overflow-hidden">
               {(viewingCreative.url || viewingCreative.thumbnail_url) ? (
                 <img src={viewingCreative.url || viewingCreative.thumbnail_url} alt={viewingCreative.creative_name} referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain p-4" />
               ) : (
                 <div className="flex flex-col items-center justify-center text-slate-400 opacity-50 transform scale-150">
                    {renderIcon(viewingCreative.creative_type)}
                 </div>
               )}
               <div className="absolute top-4 left-4">
                  <span className="bg-white/90 dark:bg-black/90 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm uppercase tracking-wider border border-slate-200 dark:border-white/10">
                     {viewingCreative.format || 'Biçim Belirtilmemiş'}
                  </span>
               </div>
               
               {/* Mobile close button inside image area */}
               <button onClick={() => setViewingCreative(null)} className="md:hidden absolute top-4 right-4 p-2 bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-black rounded-full backdrop-blur-sm transition-colors text-slate-800 dark:text-white">
                 <X className="w-5 h-5" />
               </button>
            </div>

            {/* Right side: Info */}
            <div className="w-full md:w-1/2 flex flex-col p-6 overflow-y-auto">
               <div className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="text-2xl font-bold text-brand-dark dark:text-white leading-tight">
                       {viewingCreative.creative_name}
                    </h2>
                    <div className="flex items-center gap-3 mt-3">
                       <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                           <Star className="w-4 h-4 fill-current" />
                           <span className="font-bold">{viewingCreative.performance_score ? `${viewingCreative.performance_score}/10 Skor` : 'Skor Yok'}</span>
                       </div>
                       {viewingCreative.designer && (
                          <div className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center gap-1.5 border border-slate-200 dark:border-white/5">
                             Tasarımcı: {viewingCreative.designer}
                          </div>
                       )}
                    </div>
                 </div>
                 <button onClick={() => setViewingCreative(null)} className="hidden md:flex p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-600 dark:text-slate-400">
                   <X className="w-6 h-6" />
                 </button>
               </div>

               {/* Notes Section - Centered nicely as requested */}
               <div className="my-8 flex-1 flex flex-col justify-center">
                  <div className="bg-brand-slate/5 dark:bg-white/5 rounded-2xl p-8 text-center relative border border-slate-200 dark:border-white/10 shadow-sm">
                     <MessageSquare className="w-8 h-8 mx-auto text-brand-dark/20 dark:text-white/20 mb-4" />
                     {viewingCreative.notes ? (
                        <div>
                           <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Yorumlar / Notlar</h4>
                           <p className="text-lg md:text-xl text-slate-700 dark:text-slate-200 font-medium italic leading-relaxed">
                             "{viewingCreative.notes}"
                           </p>
                        </div>
                     ) : (
                        <p className="text-slate-400 dark:text-slate-500 italic">Bu kreatif için henüz not / yorum eklenmemiş.</p>
                     )}
                  </div>
               </div>

               <div className="mt-auto border-t border-slate-100 dark:border-white/5 pt-6 flex flex-col gap-4">
                  {/* Campaign/Experiment Details if available */}
                  {(viewingCreative.campaign_id || viewingCreative.experiment_id) ? (
                    <div className="grid grid-cols-2 gap-4">
                       {viewingCreative.campaign_id && (
                          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                             <div className="text-[10px] uppercase font-bold text-indigo-500 mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Bağlı Kampanya</div>
                             <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Kampanya ID: {viewingCreative.campaign_id}</div>
                          </div>
                       )}
                       {viewingCreative.experiment_id && (
                          <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-900/20">
                             <div className="text-[10px] uppercase font-bold text-purple-500 mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Bağlı Deney</div>
                             <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Deney ID: {viewingCreative.experiment_id}</div>
                          </div>
                       )}
                    </div>
                  ) : null}

                  <div className="flex gap-3 w-full">
                     <button 
                       onClick={() => {
                          setViewingCreative(null);
                          handleOpenEdit(viewingCreative);
                       }} 
                       className="flex-1 py-3 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
                     >
                       <Edit className="w-4 h-4" />
                       Düzenle
                     </button>
                  </div>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
