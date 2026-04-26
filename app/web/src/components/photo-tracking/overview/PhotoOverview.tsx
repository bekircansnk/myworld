import React, { useEffect } from 'react';
import { usePhotoTrackingStore } from '@/stores/photoTrackingStore';
import { useProjectStore } from '@/stores/projectStore';
import { Camera, Image as ImageIcon, CheckCircle2, MessageSquare } from 'lucide-react';

interface PhotoOverviewProps {
  projectId: number | null;
}

export function PhotoOverview({ projectId }: PhotoOverviewProps) {
  const { overviewStats, fetchOverview, isLoadingOverview } = usePhotoTrackingStore();
  const { projects } = useProjectStore();
  const currentProject = projects.find(p => p.id === projectId);

  useEffect(() => {
    fetchOverview(projectId || undefined, new Date().getMonth() + 1, new Date().getFullYear());
  }, [projectId]);

  const metrics = overviewStats ? [
    { label: 'Toplam Model', value: overviewStats.total_models, icon: Camera },
    { label: 'Toplam Renk', value: overviewStats.total_colors, icon: ImageIcon },
    { label: 'Üretilen Fotoğraf', value: overviewStats.total_photos, icon: CheckCircle2 },
    { label: 'Revize Sayısı', value: overviewStats.total_revisions, icon: MessageSquare },
  ] : [
    { label: 'Toplam Model', value: '...', icon: Camera },
    { label: 'Toplam Renk', value: '...', icon: ImageIcon },
    { label: 'Üretilen Fotoğraf', value: '...', icon: CheckCircle2 },
    { label: 'Revize Sayısı', value: '...', icon: MessageSquare },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white">Genel Bakış</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {currentProject ? `${currentProject.name} markasının f` : 'Tüm markaların f'}otoğraf üretim performansı ve özet durumu.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-sm font-semibold text-brand-gray dark:text-gray-400">{metric.label}</span>
              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center shrink-0">
                <metric.icon className="w-4 h-4 text-brand-dark dark:text-white/70" />
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              <span className="text-2xl font-bold text-brand-dark dark:text-white">
                {isLoadingOverview ? '...' : metric.value}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/5 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
               <Camera className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
               <p className="text-sm text-brand-gray dark:text-gray-500">Üretim trend grafikleri yakında eklenecektir.</p>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/5 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
               <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
               <p className="text-sm text-brand-gray dark:text-gray-500">Platform dağılım grafiği</p>
            </div>
         </div>
      </div>
    </div>
  );
}
