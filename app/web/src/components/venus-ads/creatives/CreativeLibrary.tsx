import React, { useState, useEffect } from 'react';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { useProjectStore } from '@/stores/projectStore';
import { Plus, Image as ImageIcon, Video, Layers, CheckSquare, Star, Edit, Trash2 } from 'lucide-react';
import { CreativeForm } from './CreativeForm';
import { VenusCreative } from '@/types/venus-ads';

interface CreativeLibraryProps {
  projectId: number | null;
}

export function CreativeLibrary({ projectId }: CreativeLibraryProps) {
  const { creatives, isLoadingCreatives, fetchCreatives, deleteCreative } = useVenusAdsStore();
  const { projects } = useProjectStore();
  const currentProject = projects.find(p => p.id === projectId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCreative, setEditingCreative] = useState<VenusCreative | null>(null);

  useEffect(() => {
    fetchCreatives(projectId || undefined);
  }, [projectId]);

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
                              {creative.thumbnail_url ? (
                                  <img src={creative.thumbnail_url} alt={creative.creative_name} className="object-cover w-full h-full rounded-lg" />
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
                         <div className="p-4 flex-1 flex flex-col">
                             <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-bold text-brand-dark dark:text-white text-sm leading-tight flex-1 line-clamp-2">
                                    {creative.creative_name}
                                </h3>
                             </div>

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
    </div>
  );
}
