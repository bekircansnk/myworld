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

function ColorRow({ color, onUpdateColor }: { color: PhotoModelColor, onUpdateColor: (id: number, data: any) => Promise<any> }) {
  const [localIgCount, setLocalIgCount] = React.useState(color.ig_photo_count);
  const [localBannerCount, setLocalBannerCount] = React.useState(color.banner_photo_count);

  React.useEffect(() => {
    setLocalIgCount(color.ig_photo_count);
  }, [color.ig_photo_count]);

  React.useEffect(() => {
    setLocalBannerCount(color.banner_photo_count);
  }, [color.banner_photo_count]);

  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const debouncedUpdate = (data: any) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onUpdateColor(color.id, data);
    }, 500);
  };

  const adjustPhotoCount = (type: 'ig' | 'banner', delta: number) => {
    if (type === 'ig') {
      const newCount = Math.max(0, localIgCount + delta);
      setLocalIgCount(newCount);
      debouncedUpdate({ ig_photo_count: newCount });
    } else {
      const newCount = Math.max(0, localBannerCount + delta);
      setLocalBannerCount(newCount);
      debouncedUpdate({ banner_photo_count: newCount });
    }
  };

  const handleInputChange = (type: 'ig' | 'banner', value: string) => {
    const newCount = Math.max(0, parseInt(value) || 0);
    if (type === 'ig') {
      setLocalIgCount(newCount);
      debouncedUpdate({ ig_photo_count: newCount });
    } else {
      setLocalBannerCount(newCount);
      debouncedUpdate({ banner_photo_count: newCount });
    }
  };

  const toggleStatus = (type: 'ig' | 'banner') => {
    if (type === 'ig') {
      onUpdateColor(color.id, { ig_completed: !color.ig_completed });
    } else {
      onUpdateColor(color.id, { banner_completed: !color.banner_completed });
    }
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="font-semibold text-sm text-brand-dark dark:text-white min-w-[120px]">
        {color.color_name}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 xl:gap-8 flex-1">
        {/* IG Section */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toggleStatus('ig')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${color.ig_completed ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {color.ig_completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            Instagram
          </button>
          {color.ig_completed_at && (
            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{format(new Date(color.ig_completed_at), 'dd.MM')}</span>
          )}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden group">
            <button onClick={() => adjustPhotoCount('ig', -1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity"><Minus className="w-3 h-3" /></button>
            <input 
              type="number"
              value={localIgCount}
              onChange={(e) => handleInputChange('ig', e.target.value)}
              className="w-10 text-center text-xs font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button onClick={() => adjustPhotoCount('ig', 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity"><Plus className="w-3 h-3" /></button>
          </div>
        </div>
        
        {/* Banner Section */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toggleStatus('banner')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${color.banner_completed ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {color.banner_completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            Banner (16:9)
          </button>
          {color.banner_completed_at && (
            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{format(new Date(color.banner_completed_at), 'dd.MM')}</span>
          )}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden group">
            <button onClick={() => adjustPhotoCount('banner', -1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity"><Minus className="w-3 h-3" /></button>
            <input 
              type="number"
              value={localBannerCount}
              onChange={(e) => handleInputChange('banner', e.target.value)}
              className="w-10 text-center text-xs font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button onClick={() => adjustPhotoCount('banner', 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity"><Plus className="w-3 h-3" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelCard({ model, onUpdateColor, onModelStatusChange }: ModelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const createColor = usePhotoTrackingStore(s => s.createColor);
  
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

  const handleAddColor = async () => {
    if(!newColorName.trim()) return;
    try {
        await createColor(model.id, {
            color_name: newColorName.trim(),
            ig_required: true,
            banner_required: true
        });
        setNewColorName('');
        setIsAddingColor(false);
    } catch(e) {
        console.error(e);
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
               <ColorRow key={color.id} color={color} onUpdateColor={onUpdateColor} />
             ))}
             
             {isAddingColor ? (
               <div className="flex items-center gap-3 mt-3 p-2 bg-white dark:bg-slate-800 rounded-lg border border-brand-dark/20 shadow-sm">
                 <input 
                   type="text" 
                   value={newColorName} 
                   onChange={e => setNewColorName(e.target.value)} 
                   placeholder="Renk Adı..." 
                   className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0"
                   autoFocus
                   onKeyDown={e => e.key === 'Enter' && handleAddColor()}
                 />
                 <button onClick={handleAddColor} disabled={!newColorName.trim()} className="px-3 py-1.5 text-xs font-bold bg-brand-dark text-white rounded-md disabled:opacity-50">Ekle</button>
                 <button onClick={() => setIsAddingColor(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">İptal</button>
               </div>
             ) : (
               <button 
                 onClick={() => setIsAddingColor(true)} 
                 className="flex items-center gap-1.5 mt-3 text-xs font-bold text-brand-dark dark:text-brand-yellow hover:opacity-80 transition-opacity px-2"
               >
                 <Plus className="w-3.5 h-3.5" /> Renk Ekle
               </button>
             )}
           </div>
        </div>
      )}
    </div>
  );
}

export function WeeklyBoard({ projectId }: { projectId: number | null }) {
  const { models, isLoadingModels, updateColor, updateModel, createModel } = usePhotoTrackingStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [newModel, setNewModel] = useState({ 
    model_name: '', 
    sezon_kodu: '', 
    notes: '',
    color_name: '',
    ig_required: true,
    banner_required: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleModelStatusChange = async (model: PhotoModel) => {
    const isCompleted = model.status === 'completed';
    await updateModel(model.id, { 
      status: isCompleted ? 'active' : 'completed',
      delivery_date: isCompleted ? null : new Date().toISOString()
    });
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.model_name.trim()) return;
    setIsSubmitting(true);
    try {
      const createdModel = await createModel({
        project_id: projectId || null,
        model_name: newModel.model_name.trim(),
        sezon_kodu: newModel.sezon_kodu.trim() || undefined,
        notes: newModel.notes.trim() || undefined,
        week_number: selectedWeek,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
      
      if (newModel.color_name.trim()) {
        await usePhotoTrackingStore.getState().createColor(createdModel.id, {
            color_name: newModel.color_name.trim(),
            ig_required: newModel.ig_required,
            banner_required: newModel.banner_required
        });
      }
      
      setIsModalOpen(false);
      setNewModel({ model_name: '', sezon_kodu: '', notes: '', color_name: '', ig_required: true, banner_required: true });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const weeks = [1, 2, 3, 4];

  return (
    <div className="flex flex-col h-full gap-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
           <CheckSquare className="w-6 h-6 text-brand-gray dark:text-gray-400" />
          Aylık Takvim
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Modelleri haftalara göre takvimlendirin, renk varyantlarını tamamlayın.
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
                     <div className="flex items-center gap-4">
                       <span className="text-sm font-medium text-slate-500">
                          {completedCount} / {weekModels.length} Tamamlandı
                       </span>
                       <button 
                         onClick={() => { setSelectedWeek(weekNum); setIsModalOpen(true); }}
                         className="text-xs flex items-center gap-1 font-bold text-brand-dark dark:text-white hover:text-brand-yellow dark:hover:text-brand-yellow transition-colors bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg"
                       >
                          <Plus className="w-3.5 h-3.5" /> Model Ekle
                       </button>
                     </div>
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

      {/* Model Ekleme Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden">
             <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-lg text-brand-dark dark:text-white">{selectedWeek}. Hafta İçin Model Ekle</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <Minus className="w-5 h-5 rotate-45" /> {/* Close icon as Plus rotated */}
                </button>
             </div>
             
             <form onSubmit={handleCreateModel} className="p-5 flex flex-col gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Model Adı / Madde Açıklaması *</label>
                   <input 
                     type="text" 
                     required 
                     value={newModel.model_name}
                     onChange={e => setNewModel({ ...newModel, model_name: e.target.value })}
                     className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 text-sm"
                     placeholder="Örn: 2010728Y AYAKKABI"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Sezon Kodu</label>
                   <input 
                     type="text" 
                     value={newModel.sezon_kodu}
                     onChange={e => setNewModel({ ...newModel, sezon_kodu: e.target.value })}
                     className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 text-sm"
                     placeholder="Örn: SS26"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Notlar (Opsiyonel)</label>
                   <textarea 
                     rows={3}
                     value={newModel.notes}
                     onChange={e => setNewModel({ ...newModel, notes: e.target.value })}
                     className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 text-sm resize-none"
                     placeholder="Ek bilgiler..."
                   />
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700">
                   <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Renk Bilgisi (Opsiyonel)</label>
                   <div className="flex flex-col gap-3">
                       <input 
                         type="text" 
                         value={newModel.color_name}
                         onChange={e => setNewModel({ ...newModel, color_name: e.target.value })}
                         className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 text-sm"
                         placeholder="Örn: Siyah"
                       />
                       
                       <div className="flex items-center gap-4 px-1">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                             <input 
                               type="checkbox" 
                               checked={newModel.ig_required}
                               onChange={e => setNewModel({ ...newModel, ig_required: e.target.checked })}
                               className="rounded border-slate-300 text-brand-dark focus:ring-brand-dark"
                             />
                             <span className="text-slate-600 dark:text-slate-300 font-medium">Instagram</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                             <input 
                               type="checkbox" 
                               checked={newModel.banner_required}
                               onChange={e => setNewModel({ ...newModel, banner_required: e.target.checked })}
                               className="rounded border-slate-300 text-brand-dark focus:ring-brand-dark"
                             />
                             <span className="text-slate-600 dark:text-slate-300 font-medium">Banner (16:9)</span>
                          </label>
                       </div>
                   </div>
                </div>
                
                <div className="mt-4 flex items-center justify-end gap-3">
                   <button 
                     type="button" 
                     onClick={() => setIsModalOpen(false)}
                     className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
                   >
                     İptal
                   </button>
                   <button 
                     type="submit"
                     disabled={isSubmitting || !newModel.model_name.trim()}
                     className="px-5 py-2.5 text-sm font-bold bg-brand-dark text-white dark:bg-white dark:text-brand-dark hover:opacity-90 rounded-xl transition-opacity disabled:opacity-50"
                   >
                     {isSubmitting ? 'Ekleniyor...' : 'Modeli Ekle'}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
