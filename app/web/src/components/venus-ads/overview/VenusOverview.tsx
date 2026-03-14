import React from 'react';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { useProjectStore } from '@/stores/projectStore';
import { DollarSign, BarChart3, TrendingUp, HandCoins, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface VenusOverviewProps {
  projectId: number | null;
}

export function VenusOverview({ projectId }: VenusOverviewProps) {
  const { campaigns, isLoadingCampaigns } = useVenusAdsStore();
  const { projects } = useProjectStore();
  const currentProject = projects.find(p => p.id === projectId);

  // Mock metrics until backend fully integrated
  const metrics = [
    { label: 'Toplam Harcama', value: '₺0.00', icon: DollarSign, trend: '+0%', positive: true },
    { label: 'Dönüşümler', value: '0', icon: CheckCircle2, trend: '+0%', positive: true },
    { label: 'Ortalama ROAS', value: '0.00', icon: TrendingUp, trend: '-0%', positive: false },
    { label: 'Ortalama CPA', value: '₺0.00', icon: HandCoins, trend: '+0%', positive: false },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white">Genel Bakış</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {currentProject ? `${currentProject.name} markasının r` : 'Tüm markaların r'}eklam performansı ve özet durumu.
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
              <span className="text-2xl font-bold text-brand-dark dark:text-white">{metric.value}</span>
              <span className={`text-xs font-bold leading-6 ${metric.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                {metric.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Sütun (Trend) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/5 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-brand-gray dark:text-gray-500">Trend grafiği yakında eklenecek...</p>
            </div>
          </div>
          
          {/* Active Campaigns Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-brand-dark dark:text-white">Aktif Kampanyalar</h3>
            </div>
            <div className="p-0">
              {isLoadingCampaigns ? (
                <div className="p-8 text-center text-sm text-brand-gray dark:text-gray-500">Yükleniyor...</div>
              ) : campaigns.length === 0 ? (
                <div className="p-8 text-center text-sm text-brand-gray dark:text-gray-500">Henüz kampanya bulunmuyor.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-brand-gray dark:text-gray-400 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-6 py-3">Kampanya</th>
                        <th className="px-6 py-3">Platform</th>
                        <th className="px-6 py-3 text-right">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {campaigns.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-brand-dark dark:text-white">{c.campaign_name}</td>
                          <td className="px-6 py-4 capitalize">{c.platform.replace('_', ' ')}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Sütun (AI Insight & Anomalies) */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-800 rounded-2xl p-6 shadow-sm border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🤖</span>
              <h3 className="font-bold text-brand-dark dark:text-white">AI Günlük Özet</h3>
            </div>
            <p className="text-sm text-brand-gray dark:text-gray-400 leading-relaxed">
              Yapay zeka özet sistemi henüz yetkili API'lerden veri çekmediği için beklemede. Entegrasyonlar tamamlandığında burada performans analizi görünecek.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/5">
             <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-bold text-brand-dark dark:text-white">Anomali Uyarıları</h3>
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-center py-6">
              <p className="text-sm text-brand-gray dark:text-gray-500">Şu an tespit edilen bir anomali yok.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
