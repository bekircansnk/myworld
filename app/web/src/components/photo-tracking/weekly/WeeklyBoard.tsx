import React, { useState } from 'react';
import { usePhotoTrackingStore } from '@/stores/photoTrackingStore';
import { PhotoModel, PhotoModelColor } from '@/types/photo-tracking';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Image as ImageIcon, MessageSquare, Plus, Minus, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ModelCardProps {
  model: PhotoModel;
  onUpdateColor: (id: number, data: any) => Promise<void>;
  onModelStatusChange: (model: PhotoModel) => Promise<void>;
}

function ModelCard({ model, onUpdateColor, onModelStatusChange }: ModelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const allColorsDone = model.colors.length > 0 && model.colors.every(c => 
    (!c.ig_required || c.ig_completed) && (!c.banner_required || c.banner_completed)
  );

  const toggleColorStatus = async (color: PhotoModelColor, type: 'ig' | 'banner') => {
    if (type === 'ig') {
      await onUpdateColor(color.id, { ig_completed: !color.ig_completed });
    } else {
      await onUpdateColor(color.id, { banner_completed: !color.banner_completed });
    }
  };

  const adjustPhotoCount = async (color: PhotoModelColor, type: 'ig' | 'banner', delta: number) => {
    if (type === 'ig') {
      const newCount = Math.max(0, color.ig_photo_count + delta);
      await onUpdateColor(color.id, { ig_photo_count: newCount });
    } else {
      const newCount = Math.max(0, color.banner_photo_count + delta);
      await onUpdateColor(color.id, { banner_photo_count: newCount });
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border transition-colors ${allColorsDone || model.status === 'completed' ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-slate-200 dark:border-white/5'}`}>
      <div 
        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${model.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
             <ImageIcon className="w-5 h-5" />
          </div>
          <div>
             <div className="flex items-center gap-2">
                <h4 className="font-bold text-brand-dark dark:text-white">{model.model_name}</h4>
                {model.sezon_kodu && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">{model.sezon_kodu}</span>}
             </div>
             <p className="text-xs text-slate-500 mt-0.5">
               {model.colors.length} Renk • {model.total_photos} Fotoğraf • {model.revisions.length} Revize
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium">
           {model.delivery_date && (
             <span className="text-emerald-600 text-xs hidden sm:inline-block">Teslim: {format(new Date(model.delivery_date), 'dd MMM yyyy', { locale: tr })}</span>
           )}
           <button 
             onClick={(e) => {
               e.stopPropagation();
               onModelStatusChange(model);
             }}
             className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${model.status === 'completed' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'}`}
           >
              {model.status === 'completed' ? <><CheckCircle2 className="w-3.5 h-3.5" /> Bitti</> : <><Circle className="w-3.5 h-3.5" /> İşaretle</>}
           </button>
           {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-white/5 p-4 bg-slate-50/50 dark:bg-slate-900/20">
           <div className="space-y-2">
             {model.colors.map(color => (
               <div key={color.id} className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="font-semibold text-sm text-brand-dark dark:text-white min-w-[120px]">
                     {color.color_name}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 xl:gap-8 flex-1">
                     {/* IG Section */}
                     <div className="flex items-center gap-3">
                       <button 
                         onClick={() => toggleColorStatus(color, 'ig')}
                         className={`flex items-center gap-2 text-sm font-medium transition-colors ${color.ig_completed ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                       >
                         {color.ig_completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                         Instagram
                       </button>
                       {color.ig_completed_at && (
                         <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{format(new Date(color.ig_completed_at), 'dd.MM')}</span>
                       )}
                       <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden">
                         <button onClick={() => adjustPhotoCount(color, 'ig', -1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600"><Minus className="w-3 h-3" /></button>
                         <input 
                           type="number"
                           value={color.ig_photo_count}
                           onChange={(e) => onUpdateColor(color.id, { ig_photo_count: Math.max(0, parseInt(e.target.value) || 0) })}
                           className="w-10 text-center text-xs font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                         />
                         <button onClick={() => adjustPhotoCount(color, 'ig', 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600"><Plus className="w-3 h-3" /></button>
                       </div>
                     </div>
                     
                     {/* Banner Section */}
                     <div className="flex items-center gap-3">
                       <button 
                         onClick={() => toggleColorStatus(color, 'banner')}
                         className={`flex items-center gap-2 text-sm font-medium transition-colors ${color.banner_completed ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                       >
                         {color.banner_completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                         Banner (16:9)
                       </button>
                       {color.banner_completed_at && (
                         <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{format(new Date(color.banner_completed_at), 'dd.MM')}</span>
                       )}
                       <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden">
                         <button onClick={() => adjustPhotoCount(color, 'banner', -1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600"><Minus className="w-3 h-3" /></button>
                         <input 
                           type="number"
                           value={color.banner_photo_count}
                           onChange={(e) => onUpdateColor(color.id, { banner_photo_count: Math.max(0, parseInt(e.target.value) || 0) })}
                           className="w-10 text-center text-xs font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                         />
                         <button onClick={() => adjustPhotoCount(color, 'banner', 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600"><Plus className="w-3 h-3" /></button>
                       </div>
                     </div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}

export function WeeklyBoard({ projectId }: { projectId: number | null }) {
  const { models, isLoadingModels, updateColor, updateModel } = usePhotoTrackingStore();
  
  const handleModelStatusChange = async (model: PhotoModel) => {
    const isCompleted = model.status === 'completed';
    await updateModel(model.id, { 
      status: isCompleted ? 'active' : 'completed',
      delivery_date: isCompleted ? null : new Date().toISOString()
    });
  };

  const weeks = [1, 2, 3, 4];

  return (
    <div className="flex flex-col h-full gap-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
           <CheckSquare className="w-6 h-6 text-brand-gray dark:text-gray-400" />
          Haftalık İşler
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Modelleri haftalara göre takip edin, renk varyantlarını tamamlayın.
        </p>
      </div>

      {isLoadingModels ? (
         <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-dark rounded-full animate-spin dark:border-slate-700 dark:border-t-white" />
         </div>
      ) : (
        <div className="flex flex-col gap-6">
           {weeks.map(weekNum => {
             const weekModels = models.filter(m => m.week_number === weekNum);
             const completedCount = weekModels.filter(m => m.status === 'completed').length;
             
             return (
               <div key={weekNum} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                     <h3 className="font-bold text-lg text-brand-dark dark:text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-brand-yellow/20 text-brand-yellow flex items-center justify-center text-sm">{weekNum}</span>
                        {weekNum}. Hafta
                     </h3>
                     <span className="text-sm font-medium text-slate-500">
                        {completedCount} / {weekModels.length} Tamamlandı
                     </span>
                  </div>
                  
                  {weekModels.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                      Bu hafta için atanmış model yok.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {weekModels.map(m => (
                        <ModelCard 
                          key={m.id} 
                          model={m} 
                          onUpdateColor={updateColor} 
                          onModelStatusChange={handleModelStatusChange} 
                        />
                      ))}
                    </div>
                  )}
               </div>
             )
           })}
        </div>
      )}
    </div>
  );
}
