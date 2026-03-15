import React, { useEffect } from 'react';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { useProjectStore } from '@/stores/projectStore';
import { Sparkles, AlertTriangle, TrendingUp, Lightbulb, Eye, Check, Clock, Shield } from 'lucide-react';
import { VenusAIObservation } from '@/types/venus-ads';

const SEVERITY_CONFIG: Record<string, { icon: typeof AlertTriangle; label: string; color: string; border: string; bg: string }> = {
  critical: {
    icon: AlertTriangle,
    label: 'Kritik',
    color: 'text-red-500',
    border: 'border-l-red-500',
    bg: 'bg-red-50/50 dark:bg-red-900/10',
  },
  warning: {
    icon: Eye,
    label: 'Uyarı',
    color: 'text-amber-500',
    border: 'border-l-amber-500',
    bg: 'bg-amber-50/50 dark:bg-amber-900/10',
  },
  opportunity: {
    icon: TrendingUp,
    label: 'Fırsat',
    color: 'text-emerald-500',
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
  },
  info: {
    icon: Lightbulb,
    label: 'Bilgi',
    color: 'text-blue-500',
    border: 'border-l-blue-500',
    bg: 'bg-blue-50/50 dark:bg-blue-900/10',
  },
};

const TYPE_LABELS: Record<string, string> = {
  anomaly: 'Anomali Tespiti',
  suggestion: 'Optimizasyon Önerisi',
  trend: 'Trend Analizi',
  creative: 'Kreatif İçgörü',
  budget: 'Bütçe Uyarısı',
};

  export function AIInsightsPanel({ projectId }: { projectId: number | null }) {
  const { observations, isLoadingObservations, isGeneratingAI, fetchObservations, generateDailySummary, acknowledgeObservation, deleteObservation } = useVenusAdsStore();
  const { projects } = useProjectStore();
  const currentProject = projects.find(p => p.id === projectId);

  useEffect(() => {
    fetchObservations(projectId || undefined);
  }, [projectId]);

  const unacknowledged = observations.filter(o => !o.is_acknowledged);
  const acknowledged = observations.filter(o => o.is_acknowledged);

  const handleGenerate = async () => {
    await generateDailySummary(projectId || undefined);
  };

  const renderCard = (obs: VenusAIObservation) => {
    const severity = SEVERITY_CONFIG[obs.severity] || SEVERITY_CONFIG.info;
    const Icon = severity.icon;
    return (
      <div key={obs.id}
        className={`rounded-xl border border-slate-200 dark:border-white/5 border-l-4 ${severity.border} ${severity.bg} overflow-hidden transition-all hover:shadow-sm`}>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${severity.color} shrink-0`} />
              <span className={`text-[10px] font-bold uppercase ${severity.color}`}>{severity.label}</span>
              {obs.observation_type && (
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                  {TYPE_LABELS[obs.observation_type] || obs.observation_type}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {!obs.is_acknowledged && (
                <button onClick={() => acknowledgeObservation(obs.id)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-1">
                  <Check className="w-3 h-3" /> Gördüm
                </button>
              )}
            </div>
          </div>
          <h3 className={`font-bold text-brand-dark dark:text-white text-sm mb-2 ${obs.is_acknowledged ? 'opacity-60' : ''}`}>
            {obs.title}
          </h3>
          <p className={`text-xs text-slate-600 dark:text-slate-400 leading-relaxed ${obs.is_acknowledged ? 'opacity-60' : ''}`}>
            {obs.content}
          </p>
          {obs.related_date_range && (
            <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3" />
              {obs.related_date_range}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            Yapay Zeka Yorum & Anomali
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {currentProject ? `${currentProject.name} markasının y` : 'Y'}apay zeka ile tespit edilen anormallikler ve fırsatlar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1 hidden sm:flex">
            <Shield className="w-3.5 h-3.5" />
            Gemini AI
          </span>
          <button
            onClick={handleGenerate}
            disabled={isGeneratingAI}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              isGeneratingAI
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                : 'bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-500/20'
            }`}
          >
            {isGeneratingAI ? (
              <><div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" /> Analiz Ediliyor...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Yeni Analiz Başlat</>
            )}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['critical', 'warning', 'opportunity', 'info'] as const).map(sev => {
          const config = SEVERITY_CONFIG[sev];
          const Icon = config.icon;
          const count = observations.filter(o => o.severity === sev && !o.is_acknowledged).length;
          return (
            <div key={sev} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/5 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div>
                <p className="text-xl font-black text-brand-dark dark:text-white">{count}</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">{config.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {isLoadingObservations ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : observations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-20">
          <Sparkles className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
          <p className="font-medium text-lg text-slate-500">AI analiz henüz başlamadı</p>
          <p className="text-sm text-slate-400 mt-1 mb-2 max-w-md text-center">
            Kampanya verileri yüklendiğinde, yapay zeka otomatik olarak anormallik ve fırsat tespiti yapacaktır.
          </p>
          <p className="text-xs text-slate-400">(Phase E'de Gemini AI entegrasyonu aktif edilecek)</p>
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          {/* Unacknowledged */}
          {unacknowledged.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Dikkat Bekleyenler ({unacknowledged.length})
              </h2>
              <div className="space-y-3">
                {unacknowledged.map(renderCard)}
              </div>
            </div>
          )}

          {/* Acknowledged */}
          {acknowledged.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                ✓ Görülenler ({acknowledged.length})
              </h2>
              <div className="space-y-3">
                {acknowledged.map(renderCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
