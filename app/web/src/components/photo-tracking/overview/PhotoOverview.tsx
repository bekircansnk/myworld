import React, { useEffect } from 'react';
import { usePhotoTrackingStore } from '@/stores/photoTrackingStore';
import { useProjectStore } from '@/stores/projectStore';
import { Camera, Image as ImageIcon, CheckCircle2, MessageSquare, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';

interface PhotoOverviewProps {
  projectId: number | null;
}

export function PhotoOverview({ projectId }: PhotoOverviewProps) {
  const { overviewStats, fetchOverview, isLoadingOverview } = usePhotoTrackingStore();
  const { projects } = useProjectStore();
  const currentProject = projects.find(p => p.id === projectId);

  const [dateRange, setDateRange] = React.useState<'1M' | '3M' | '6M' | '9M' | '1Y' | 'CUSTOM'>('1M');
  const [startMonth, setStartMonth] = React.useState(new Date().getMonth() + 1);
  const [startYear, setStartYear] = React.useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = React.useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = React.useState(new Date().getFullYear());

  useEffect(() => {
    // If we have a custom backend endpoint for range we could pass these.
    // For now, if it's 1M, we just pass the current month/year to existing fetchOverview.
    // If it's more, we would need a new endpoint or pass undefined to fetch all and filter client side.
    // Since backend isn't fully updated for range yet, we'll fetch all if not 1M and let backend handle it or just pass undefined to get all data.
    if (dateRange === '1M') {
      fetchOverview(projectId || undefined, endMonth, endYear);
    } else {
      // For testing, fetch all if > 1M (or we can update backend to support range)
      fetchOverview(projectId || undefined); 
    }
  }, [projectId, dateRange, startMonth, startYear, endMonth, endYear]);

  const handleRangeSelect = (range: '1M' | '3M' | '6M' | '9M' | '1Y') => {
    setDateRange(range);
    const end = new Date();
    setEndMonth(end.getMonth() + 1);
    setEndYear(end.getFullYear());
    
    let monthsToSub = 0;
    if (range === '1M') monthsToSub = 0;
    if (range === '3M') monthsToSub = 2;
    if (range === '6M') monthsToSub = 5;
    if (range === '9M') monthsToSub = 8;
    if (range === '1Y') monthsToSub = 11;
    
    const start = subMonths(end, monthsToSub);
    setStartMonth(start.getMonth() + 1);
    setStartYear(start.getFullYear());
  };

  const monthsList = Array.from({length: 12}, (_, i) => ({
    value: i + 1, label: format(new Date(2024, i, 1), 'MMMM', { locale: tr })
  }));
  const yearsList = [2024, 2025, 2026, 2027];

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

      {/* Date Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5">
         <div className="flex flex-wrap items-center gap-2">
            {[
              { id: '1M', label: '1 Aylık' },
              { id: '3M', label: '3 Aylık' },
              { id: '6M', label: '6 Aylık' },
              { id: '9M', label: '9 Aylık' },
              { id: '1Y', label: '1 Yıllık' }
            ].map(range => (
              <button
                key={range.id}
                onClick={() => handleRangeSelect(range.id as any)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${dateRange === range.id ? 'bg-brand-dark text-white dark:bg-white dark:text-brand-dark' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
              >
                {range.label}
              </button>
            ))}
         </div>
         
         <div className="hidden xl:block w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2"></div>
         
         <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 flex-1 xl:flex-none">
               <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2 min-w-[140px]">
                  <select 
                    value={startMonth} 
                    onChange={e => { setStartMonth(Number(e.target.value)); setDateRange('CUSTOM'); }}
                    className="bg-transparent border-none text-sm font-medium focus:outline-none focus:ring-0 text-brand-dark dark:text-white capitalize cursor-pointer w-full"
                  >
                     {monthsList.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
               </div>
               <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2">
                  <select 
                    value={startYear} 
                    onChange={e => { setStartYear(Number(e.target.value)); setDateRange('CUSTOM'); }}
                    className="bg-transparent border-none text-sm font-medium focus:outline-none focus:ring-0 text-brand-dark dark:text-white cursor-pointer"
                  >
                     {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
               </div>
            </div>
            
            <span className="text-slate-400 font-bold">-</span>
            
            <div className="flex items-center gap-2 flex-1 xl:flex-none">
               <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2 min-w-[140px]">
                  <select 
                    value={endMonth} 
                    onChange={e => { setEndMonth(Number(e.target.value)); setDateRange('CUSTOM'); }}
                    className="bg-transparent border-none text-sm font-medium focus:outline-none focus:ring-0 text-brand-dark dark:text-white capitalize cursor-pointer w-full"
                  >
                     {monthsList.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
               </div>
               <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2">
                  <select 
                    value={endYear} 
                    onChange={e => { setEndYear(Number(e.target.value)); setDateRange('CUSTOM'); }}
                    className="bg-transparent border-none text-sm font-medium focus:outline-none focus:ring-0 text-brand-dark dark:text-white cursor-pointer"
                  >
                     {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
               </div>
            </div>
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
