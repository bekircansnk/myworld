import React, { useEffect } from 'react';
import { useVenusAdsStore, VenusViewMode } from '@/stores/venusAdsStore';
import { LayoutDashboard, Target, Beaker, FileImage, CheckSquare, FileText, LineChart, ListChecks, Upload, Sparkles } from 'lucide-react';
import { VenusOverview } from './overview/VenusOverview';
import { CampaignExplorer } from './campaigns/CampaignExplorer';
import { TestCenter } from './tests/TestCenter';
import { CreativeLibrary } from './creatives/CreativeLibrary';
import { AdsTaskBoard } from './tasks/AdsTaskBoard';
import { AdsReportCenter } from './reports/AdsReportCenter';
import { BenchmarkDashboard } from './benchmark/BenchmarkDashboard';
import { OnboardingChecklist } from './onboarding/OnboardingChecklist';
import { CSVImporter } from './csv-import/CSVImporter';
import { AIInsightsPanel } from './ai-insights/AIInsightsPanel';
import { useProjectStore } from '@/stores/projectStore';

interface VenusAdsLayoutProps {
  projectId: number | null;
}

export function VenusAdsLayout({ projectId }: VenusAdsLayoutProps) {
  const { viewMode, setViewMode, fetchCampaigns } = useVenusAdsStore();
  const { projects } = useProjectStore();
  
  useEffect(() => {
    fetchCampaigns(projectId || undefined);
  }, [projectId]);

  const currentProject = projects.find(p => p.id === projectId);

  const menuItems: { id: VenusViewMode; label: string; icon: React.FC<any> }[] = [
    { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Kampanyalar', icon: Target },
    { id: 'tests', label: 'Test Merkezi', icon: Beaker },
    { id: 'creatives', label: 'Kreatif Lab', icon: FileImage },
    { id: 'tasks', label: 'Operasyon', icon: CheckSquare },
    { id: 'reports', label: 'Raporlar', icon: FileText },
    { id: 'benchmark', label: 'Rakip', icon: LineChart },
    { id: 'onboarding', label: 'Devralma', icon: ListChecks },
    { id: 'csv', label: 'Veri Yükleme', icon: Upload },
    { id: 'ai', label: 'AI Analiz', icon: Sparkles },
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sol İç Menü (Sidebar) */}
      <div className="w-16 lg:w-48 xl:w-56 bg-white/50 dark:bg-[#0f1117]/50 border-r border-[#e8e4d8]/40 dark:border-white/5 shrink-0 flex flex-col py-6 overflow-y-auto">
        <div className="px-4 mb-6 hidden lg:block shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
            {currentProject ? currentProject.name : 'Tüm Markalar'}
          </p>
          <h2 className="text-xl font-bold tracking-tight text-brand-dark dark:text-white mt-1">Reklam Paneli</h2>
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
        {viewMode === 'overview' && <VenusOverview projectId={projectId} />}
        {viewMode === 'campaigns' && <CampaignExplorer projectId={projectId} />}
        {viewMode === 'tests' && <TestCenter projectId={projectId} />}
        {viewMode === 'creatives' && <CreativeLibrary projectId={projectId} />}
        {viewMode === 'tasks' && <AdsTaskBoard projectId={projectId} />}
        {viewMode === 'reports' && <AdsReportCenter projectId={projectId} />}
        {viewMode === 'benchmark' && <BenchmarkDashboard projectId={projectId} />}
        {viewMode === 'onboarding' && <OnboardingChecklist projectId={projectId} />}
        {viewMode === 'csv' && <CSVImporter projectId={projectId} />}
        {viewMode === 'ai' && <AIInsightsPanel projectId={projectId} />}
      </div>
    </div>
  );
}
