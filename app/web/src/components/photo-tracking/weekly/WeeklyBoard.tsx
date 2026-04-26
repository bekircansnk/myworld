import React, { useState, useEffect } from 'react';
import { usePhotoTrackingStore } from '@/stores/photoTrackingStore';
import { PhotoModel, PhotoModelColor } from '@/types/photo-tracking';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Image as ImageIcon, MessageSquare, Plus, Minus, CheckSquare, Edit2, Trash2, ChevronLeft, ChevronRight, Upload, FileDown, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useContextMenuStore } from '@/stores/contextMenuStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ModelCardProps {
  model: PhotoModel;
  onUpdateColor: (id: number, data: any) => Promise<void>;
  onModelStatusChange: (model: PhotoModel) => Promise<void>;
}

function ColorRow({ color, onUpdateColor }: { color: PhotoModelColor, onUpdateColor: (id: number, data: any) => Promise<any> }) {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editName, setEditName] = React.useState(color.color_name);
  const openMenu = useContextMenuStore(s => s.openMenu);
  const deleteColor = usePhotoTrackingStore(s => s.deleteColor);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdate = (data: any) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onUpdateColor(color.id, data);
    }, 500);
  };

  const adjustPhotoCount = (type: 'ig' | 'banner', delta: number) => {
    if (type === 'ig') {
      debouncedUpdate({ ig_photo_count: Math.max(0, color.ig_photo_count + delta) });
    } else {
      debouncedUpdate({ banner_photo_count: Math.max(0, color.banner_photo_count + delta) });
    }
  };

  const handleInputChange = (type: 'ig' | 'banner', value: string) => {
    const newCount = Math.max(0, parseInt(value) || 0);
    if (type === 'ig') {
      debouncedUpdate({ ig_photo_count: newCount });
    } else {
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

  const saveName = async () => {
    if (editName.trim() && editName !== color.color_name) {
       await onUpdateColor(color.id, { color_name: editName.trim() });
    } else {
       setEditName(color.color_name);
    }
    setIsEditingName(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openMenu(e.clientX, e.clientY, [
      {
        label: 'Yeniden Adlandır',
        icon: <Edit2 className="w-4 h-4" />,
        onClick: () => setIsEditingName(true)
      },
      {
        label: color.ig_required ? 'Instagram Kapat' : 'Instagram Aç',
        icon: <Circle className="w-4 h-4" />,
        onClick: async () => onUpdateColor(color.id, { ig_required: !color.ig_required })
      },
      {
        label: color.banner_required ? 'Banner Kapat' : 'Banner Aç',
        icon: <Circle className="w-4 h-4" />,
        onClick: async () => onUpdateColor(color.id, { banner_required: !color.banner_required })
      },
      {
        label: 'Rengi Sil',
        icon: <Trash2 className="w-4 h-4" />,
        destructive: true,
        onClick: () => setDeleteConfirmOpen(true)
      }
    ]);
  };

  return (
    <>
    <div onContextMenu={handleContextMenu} className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:border-brand-dark/20 cursor-default">
      <div className="font-semibold text-sm text-brand-dark dark:text-white min-w-[120px]">
        {isEditingName ? (
           <input 
              type="text" 
              value={editName} 
              onChange={e => setEditName(e.target.value)} 
              onBlur={saveName} 
              onKeyDown={e => { if(e.key === 'Enter') saveName(); else if(e.key === 'Escape') { setEditName(color.color_name); setIsEditingName(false); } }}
              autoFocus 
              className="bg-transparent border-b border-brand-dark focus:outline-none w-full max-w-[100px] text-brand-dark dark:text-white"
           />
        ) : color.color_name}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 xl:gap-8 flex-1">
        {/* IG Section */}
        {color.ig_required && (
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
                value={color.ig_photo_count}
                onChange={(e) => handleInputChange('ig', e.target.value)}
                className="w-10 text-center text-xs font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button onClick={() => adjustPhotoCount('ig', 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
        )}
        
        {/* Banner Section */}
        {color.banner_required && (
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
                value={color.banner_photo_count}
                onChange={(e) => handleInputChange('banner', e.target.value)}
                className="w-10 text-center text-xs font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button onClick={() => adjustPhotoCount('banner', 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
    <ConfirmDialog 
      isOpen={deleteConfirmOpen}
      onOpenChange={setDeleteConfirmOpen}
      title="Rengi Sil"
      description={`"${color.color_name}" rengini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
      onConfirm={async () => {
        try { await deleteColor(color.model_id, color.id); } catch(e) {}
      }}
    />
    </>
  );
}

function ModelCard({ model, onUpdateColor, onModelStatusChange }: ModelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(model.model_name);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  const { deleteModel, createColor, updateModel } = usePhotoTrackingStore();
  const openMenu = useContextMenuStore(s => s.openMenu);
  
  const allColorsDone = model.colors.length > 0 && model.colors.every(c => 
    (!c.ig_required || c.ig_completed) && (!c.banner_required || c.banner_completed)
  );

  const saveName = async () => {
    if (editName.trim() && editName !== model.model_name) {
       await updateModel(model.id, { model_name: editName.trim() });
    } else {
       setEditName(model.model_name);
    }
    setIsEditingName(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openMenu(e.clientX, e.clientY, [
      {
        label: 'Yeniden Adlandır',
        icon: <Edit2 className="w-4 h-4" />,
        onClick: () => setIsEditingName(true)
      },
      {
        label: 'Modeli Sil',
        icon: <Trash2 className="w-4 h-4" />,
        destructive: true,
        onClick: () => setDeleteConfirmOpen(true)
      }
    ]);
  };

  const handleAddColor = async () => {
    if(!newColorName.trim()) return;
    const colorName = newColorName.trim();
    setNewColorName('');
    setIsAddingColor(false);
    
    const tempId = Date.now();
    // Optimistic Update directly in store state
    try {
        await createColor(model.id, {
            color_name: colorName,
            ig_required: true,
            banner_required: true
        }, {
            id: tempId, model_id: model.id, color_name: colorName,
            ig_required: true, banner_required: true,
            ig_completed: false, ig_completed_at: undefined, ig_photo_count: 0,
            banner_completed: false, banner_completed_at: undefined, banner_photo_count: 0,
            created_at: new Date().toISOString()
        });
    } catch(e) {
        console.error(e);
    }
  };

  return (
    <>
    <div onContextMenu={handleContextMenu} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border transition-colors hover:border-brand-dark/30 ${allColorsDone || model.status === 'completed' ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-slate-200 dark:border-white/5'}`}>
      <div 
        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${model.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
             <ImageIcon className="w-5 h-5" />
          </div>
          <div onClick={(e) => isEditingName && e.stopPropagation()}>
             <div className="flex items-center gap-2">
                {isEditingName ? (
                   <input 
                      type="text" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)} 
                      onBlur={saveName} 
                      onKeyDown={e => { if(e.key === 'Enter') saveName(); else if(e.key === 'Escape') { setEditName(model.model_name); setIsEditingName(false); } }}
                      autoFocus 
                      className="font-bold bg-transparent border-b border-brand-dark focus:outline-none text-brand-dark dark:text-white"
                   />
                ) : (
                   <h4 className="font-bold text-brand-dark dark:text-white">{model.model_name}</h4>
                )}
                {model.sezon_kodu && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">{model.sezon_kodu}</span>}
             </div>
              <p className="text-xs text-slate-500 mt-0.5">
               {model.colors.length} Renk • {model.total_photos} Fotoğraf • {model.revisions.length} Revize
             </p>
          </div>
        </div>
        
        {model.notes && (
          <div className="hidden lg:flex flex-1 px-4 py-2 mx-4 max-w-lg bg-brand-yellow/5 dark:bg-brand-yellow/10 border border-brand-yellow/20 dark:border-brand-yellow/20 rounded-xl text-xs text-brand-dark/70 dark:text-brand-yellow/70 italic relative overflow-hidden">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-yellow/50"></div>
             <span className="line-clamp-2">"{model.notes}"</span>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-sm font-medium shrink-0">
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
              {model.status === 'completed' ? <><CheckCircle2 className="w-3.5 h-3.5" /> Bitti</> : <><CheckCircle2 className="w-3.5 h-3.5" /> İşaretle</>}
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
    <ConfirmDialog 
      isOpen={deleteConfirmOpen}
      onOpenChange={setDeleteConfirmOpen}
      title="Modeli Sil"
      description={`"${model.model_name}" modelini silmek istediğinize emin misiniz? Altındaki tüm renkler de silinecektir.`}
      onConfirm={async () => {
        try { await deleteModel(model.id); } catch(e) {}
      }}
    />
    </>
  );
}

export function WeeklyBoard({ projectId }: { projectId: number | null }) {
  const { models, isLoadingModels, updateColor, updateModel, createModel, fetchModels, importExcel, exportExcel, isExporting, isLoadingImport } = usePhotoTrackingStore();
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const importingWeekRef = React.useRef<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  
  const [importResult, setImportResult] = useState<{
    isOpen: boolean;
    status: 'loading' | 'success' | 'error';
    message: string;
    details?: { models_imported: number; colors_imported: number };
  }>({ isOpen: false, status: 'loading', message: '' });
  
  const getCurrentWeekNumber = () => {
    const day = new Date().getDate();
    const week = Math.ceil(day / 7);
    return week > 4 ? 4 : week;
  };
  
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([getCurrentWeekNumber()]); 
  
  const [newModel, setNewModel] = useState({ 
    model_name: '', 
    sezon_kodu: '', 
    notes: '',
    color_name: '',
    ig_required: true,
    banner_required: true
  });
  
  useEffect(() => {
    fetchModels(projectId || undefined, currentMonth, currentYear);
  }, [projectId, currentMonth, currentYear, fetchModels]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };
  
  const toggleWeek = (week: number) => {
    setExpandedWeeks(prev => prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]);
  };
  
  const handleModelStatusChange = async (model: PhotoModel) => {
    const isCompleted = model.status === 'completed';
    
    await updateModel(model.id, { 
      status: isCompleted ? 'active' : 'completed',
      delivery_date: isCompleted ? null : new Date().toISOString()
    });
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const week = importingWeekRef.current;
    if (file && week) {
      try {
        setImportResult({ isOpen: true, status: 'loading', message: 'Excel dosyası işleniyor, lütfen bekleyin...' });
        const res = await importExcel(file, projectId || undefined, week, currentMonth, currentYear);
        setImportResult({ 
           isOpen: true, 
           status: 'success', 
           message: 'Excel başarıyla içe aktarıldı!',
           details: { models_imported: res.models_imported, colors_imported: res.colors_imported }
        });
      } catch (err: any) {
        setImportResult({ 
           isOpen: true, 
           status: 'error', 
           message: err.response?.data?.detail || 'Excel yüklenirken bir hata oluştu. Lütfen dosya formatını kontrol edin.' 
        });
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    importingWeekRef.current = null;
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.model_name.trim()) return;
    
    const tempId = Date.now();
    const optimisticModel: PhotoModel = {
      id: tempId,
      user_id: 0,
      project_id: projectId || undefined,
      model_name: newModel.model_name.trim(),
      sezon_kodu: newModel.sezon_kodu.trim() || undefined,
      week_number: selectedWeek,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      status: 'active',
      delivery_date: undefined,
      notes: newModel.notes.trim() || undefined,
      total_photos: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      colors: [],
      revisions: []
    };

    if (newModel.color_name.trim()) {
      optimisticModel.colors.push({
        id: tempId + 1,
        model_id: tempId,
        color_name: newModel.color_name.trim(),
        ig_required: newModel.ig_required,
        banner_required: newModel.banner_required,
        ig_completed: false,
        ig_completed_at: undefined,
        ig_photo_count: 0,
        banner_completed: false,
        banner_completed_at: undefined,
        banner_photo_count: 0,
        created_at: new Date().toISOString()
      });
    }

    usePhotoTrackingStore.setState(state => ({
      models: [optimisticModel, ...state.models]
    }));

    setIsModalOpen(false);
    setNewModel({ model_name: '', sezon_kodu: '', notes: '', color_name: '', ig_required: true, banner_required: true });

    try {
      const createdModel = await createModel({
        project_id: projectId || null,
        model_name: optimisticModel.model_name,
        sezon_kodu: optimisticModel.sezon_kodu || undefined,
        notes: optimisticModel.notes || undefined,
        week_number: selectedWeek,
        month: optimisticModel.month,
        year: optimisticModel.year,
      });
      
      if (newModel.color_name.trim()) {
        const newColor = await usePhotoTrackingStore.getState().createColor(createdModel.id, {
            color_name: optimisticModel.colors[0].color_name,
            ig_required: optimisticModel.colors[0].ig_required,
            banner_required: optimisticModel.colors[0].banner_required
        });
        
        // Remove temp model, we let the actual creation populate it
        usePhotoTrackingStore.setState(state => ({
           models: state.models.filter(m => m.id !== tempId)
        }));
      } else {
        usePhotoTrackingStore.setState(state => ({
           models: state.models.filter(m => m.id !== tempId)
        }));
      }
    } catch (err) {
      console.error(err);
      // Revert optimism
      usePhotoTrackingStore.setState(state => ({
         models: state.models.filter(m => m.id !== tempId)
      }));
    }
  };

  const weeks = [1, 2, 3, 4];
  const monthName = format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy', { locale: tr });

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
             <CheckSquare className="w-6 h-6 text-brand-gray dark:text-gray-400" />
            Aylık Takvim
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Modelleri haftalara göre takvimlendirin, renk varyantlarını tamamlayın.
          </p>
        </div>
        
        {/* Month Picker and Export */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div className="font-bold text-brand-dark dark:text-white min-w-[120px] text-center capitalize">
              {monthName}
            </div>
            <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          <button 
             onClick={() => exportExcel(projectId || undefined, currentMonth, currentYear)}
             disabled={isExporting}
             className="flex items-center gap-2 px-4 py-2 bg-brand-dark hover:bg-brand-dark/90 text-white rounded-xl shadow-sm transition-colors text-sm font-semibold disabled:opacity-50"
          >
             <FileDown className="w-4 h-4" />
             {isExporting ? 'Dışa Aktarılıyor...' : "Excel'e Aktar"}
          </button>
        </div>
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
                  <div 
                    className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 cursor-pointer group"
                    onClick={() => toggleWeek(weekNum)}
                  >
                     <h3 className="font-bold text-lg text-brand-dark dark:text-white flex items-center gap-2 group-hover:opacity-80 transition-opacity">
                        <span className="w-6 h-6 rounded-md bg-brand-yellow/20 text-brand-yellow flex items-center justify-center text-sm">{weekNum}</span>
                        {weekNum}. Hafta
                        {expandedWeeks.includes(weekNum) ? <ChevronUp className="w-4 h-4 ml-2 text-slate-400" /> : <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />}
                     </h3>
                     <div className="flex items-center gap-2 sm:gap-4">
                       <span className="text-xs sm:text-sm font-medium text-slate-500 hidden sm:inline-block">
                          {completedCount} / {weekModels.length} Tamamlandı
                       </span>
                       <button 
                         onClick={(e) => { e.stopPropagation(); importingWeekRef.current = weekNum; fileInputRef.current?.click(); }}
                         className="text-xs flex items-center gap-1 font-bold text-brand-dark dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-1.5 rounded-lg"
                         title="Bu Haftaya Excel İçeri Aktar"
                       >
                          <Upload className="w-3.5 h-3.5" /> <span className="hidden sm:inline-block">Excel Aktar</span>
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setSelectedWeek(weekNum); setIsModalOpen(true); }}
                         className="text-xs flex items-center gap-1 font-bold text-brand-dark dark:text-white hover:text-brand-yellow dark:hover:text-brand-yellow transition-colors bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-1.5 rounded-lg"
                       >
                          <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline-block">Model Ekle</span>
                       </button>
                     </div>
                  </div>
                  
                  {expandedWeeks.includes(weekNum) && (
                    <>
                      {weekModels.length === 0 ? (
                        <div className="py-6 text-center text-sm text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                          Bu hafta için atanmış model yok.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
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
                    </>
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
                     disabled={!newModel.model_name.trim()}
                     className="px-5 py-2.5 text-sm font-bold bg-brand-dark text-white dark:bg-white dark:text-brand-dark hover:opacity-90 rounded-xl transition-opacity disabled:opacity-50"
                   >
                     Modeli Ekle
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
      
      {/* Import Result Modal */}
      {importResult.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center flex flex-col items-center">
              {importResult.status === 'loading' && (
                 <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand-dark animate-spin mb-4" />
              )}
              {importResult.status === 'success' && (
                 <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                 </div>
              )}
              {importResult.status === 'error' && (
                 <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                    <XCircle className="w-6 h-6" />
                 </div>
              )}
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                 {importResult.status === 'loading' ? 'İşleniyor...' : importResult.status === 'success' ? 'Başarılı!' : 'Hata!'}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                 {importResult.message}
                 {importResult.status === 'success' && importResult.details && (
                    <span className="block mt-2 font-medium text-slate-700 dark:text-slate-300">
                       {importResult.details.models_imported} Model, {importResult.details.colors_imported} Renk güncellendi.
                    </span>
                 )}
              </p>
              
              {importResult.status !== 'loading' && (
                 <button 
                   onClick={() => setImportResult(prev => ({ ...prev, isOpen: false }))}
                   className="w-full py-2.5 rounded-xl font-bold text-white bg-brand-dark hover:opacity-90 transition-opacity"
                 >
                   Tamam
                 </button>
              )}
           </div>
        </div>
      )}

      {/* Hidden file input for Excel */}
      <input 
        type="file" 
        accept=".xlsx" 
        ref={fileInputRef} 
        onChange={handleExcelImport} 
        className="hidden" 
      />
    </div>
  );
}
