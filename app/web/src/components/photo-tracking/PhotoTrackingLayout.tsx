import React, { useEffect } from 'react';
import { usePhotoTrackingStore } from '@/stores/photoTrackingStore';
import { useProjectStore } from '@/stores/projectStore';
import { LayoutDashboard, Calendar, FileImage, Upload, CheckSquare, Layers } from 'lucide-react';
import { PhotoOverview } from './overview/PhotoOverview';
import { PhotoCalendar } from './calendar/PhotoCalendar';
import { WeeklyBoard } from './weekly/WeeklyBoard';
import { ModelExplorer } from './models/ModelExplorer';
import { ExcelCenter } from './excel/ExcelCenter';
import { RevisionCenter } from './revisions/RevisionCenter';
import { PhotoTrackingViewMode } from '@/types/photo-tracking';

interface PhotoTrackingLayoutProps {
  projectId: number | null;
}

export function PhotoTrackingLayout({ projectId }: PhotoTrackingLayoutProps) {
  const { viewMode, setViewMode, fetchModels } = usePhotoTrackingStore();
  const { projects } = useProjectStore();
  
  useEffect(() => {
    fetchModels(projectId || undefined, new Date().getMonth() + 1, new Date().getFullYear());
  }, [projectId]);

  const currentProject = projects.find(p => p.id === projectId);

  const menuItems: { id: PhotoTrackingViewMode; label: string; icon: React.FC<any> }[] = [
    { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'weekly', label: 'Aylık Takvim', icon: Calendar },
    { id: 'models', label: 'Model Yönetimi', icon: Layers },
    { id: 'excel', label: 'İçe/Dışa Aktar', icon: Upload },
    { id: 'revisions', label: 'Revize Merkezi', icon: FileImage },
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sol İç Menü (Sidebar) */}
      <div className="w-16 lg:w-48 xl:w-56 bg-white/50 dark:bg-[#0f1117]/50 border-r border-[#e8e4d8]/40 dark:border-white/5 shrink-0 flex flex-col py-6 overflow-y-auto">
        <div className="px-4 mb-6 hidden lg:block shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
            {currentProject ? currentProject.name : 'Tüm Firmalar'}
          </p>
          <h2 className="text-xl font-bold tracking-tight text-brand-dark dark:text-white mt-1">Fotoğraf Takip</h2>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1 px-2 lg:px-4">
          {menuItems.map((item) => {
            const isActive = viewMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group shrink-0 ${
                  isActive 
                    ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark shadow-sm' 
                    : 'text-brand-gray dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-brand-dark dark:hover:text-white'
                }`}
                title={item.label}
              >
                <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                <span className="text-sm font-semibold hidden lg:inline whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-5 lg:p-8 bg-slate-50/50 dark:bg-[#0f1117]/30">
        {viewMode === 'overview' && <PhotoOverview projectId={projectId} />}
        {viewMode === 'weekly' && <WeeklyBoard projectId={projectId} />}
        {viewMode === 'models' && <ModelExplorer projectId={projectId} />}
        {viewMode === 'excel' && <ExcelCenter projectId={projectId} />}
        {viewMode === 'revisions' && <RevisionCenter projectId={projectId} />}
      </div>
    </div>
  );
}
