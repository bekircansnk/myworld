import React, { useState, useEffect } from 'react';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { useProjectStore } from '@/stores/projectStore';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Target, ExternalLink } from 'lucide-react';
import { CampaignForm } from './CampaignForm';
import { VenusCampaign } from '@/types/venus-ads';

interface CampaignExplorerProps {
  projectId: number | null;
}

export function CampaignExplorer({ projectId }: CampaignExplorerProps) {
  const { campaigns, isLoadingCampaigns, deleteCampaign, selectedEntityToView, setSelectedEntityToView } = useVenusAdsStore();
  const { projects } = useProjectStore();
  const currentProject = projects.find(p => p.id === projectId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<VenusCampaign | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (selectedEntityToView?.type === 'campaigns') {
      const target = campaigns.find(c => c.id === selectedEntityToView.id);
      if (target) {
        setEditingCampaign(target);
        setIsFormOpen(true);
      }
      setSelectedEntityToView(null);
    }
  }, [selectedEntityToView, campaigns]);

  const handleOpenNewCampaign = () => {
    setEditingCampaign(null);
    setIsFormOpen(true);
  };

  const handleOpenEditCampaign = (campaign: VenusCampaign) => {
    setEditingCampaign(campaign);
    setIsFormOpen(true);
  };

  const handleDeleteCampaign = async (id: number) => {
    if (confirm('Bu kampanyayı silmek istediğinize emin misiniz? Günlük harcama metrikleri varsa onlar da silinebilir.')) {
      await deleteCampaign(id);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.campaign_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || c.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
             <Target className="w-6 h-6 text-brand-gray dark:text-gray-400" />
            Kampanya Yönetimi
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {currentProject ? `${currentProject.name} markasının t` : 'T'}üm kampanyalarını yönetin.
          </p>
        </div>
        <button
          onClick={handleOpenNewCampaign}
          className="px-5 py-2.5 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Kampanya
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Kampanya ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
             <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white appearance-none h-full outline-none"
              >
                <option value="all">Tüm Platformlar</option>
                <option value="meta">Meta</option>
                <option value="google_ads">Google Ads</option>
                <option value="manual">Manuel</option>
            </select>
            <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
             <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white appearance-none h-full outline-none"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="paused">Durduruldu</option>
                <option value="draft">Taslak</option>
                <option value="ended">Bitti</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden flex-1 shrink-0 flex flex-col">
        {isLoadingCampaigns ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-dark rounded-full animate-spin dark:border-slate-700 dark:border-t-white" />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
             <Target className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
             <p className="font-medium text-lg">Kampanya Bulunamadı</p>
             <p className="text-sm mt-1 mb-6">Aramanıza uyan veya mevcut bir kampanya yok.</p>
             <button
                onClick={handleOpenNewCampaign}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
             >
                İlk Kampanyayı Oluştur
             </button>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-brand-gray dark:text-gray-400 uppercase text-[10px] font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl whitespace-nowrap">Platform</th>
                  <th className="px-6 py-4 min-w-[200px]">Kampanya Adı</th>
                  <th className="px-6 py-4 whitespace-nowrap">Durum</th>
                  <th className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">Türü / Hedef</th>
                  <th className="px-6 py-4 whitespace-nowrap hidden md:table-cell">Günlük Bütçe</th>
                  <th className="px-6 py-4 text-right rounded-tr-xl">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredCampaigns.map(c => (
                  <tr key={c.id} onClick={() => handleOpenEditCampaign(c)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="font-medium capitalize text-slate-600 dark:text-gray-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded inline-flex items-center gap-1.5 text-xs">
                          {c.platform === 'meta' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          {c.platform === 'google_ads' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                          {c.platform.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-brand-dark dark:text-white line-clamp-2">
                        {c.campaign_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block border ${
                         c.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/50' :
                         c.status === 'paused' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50' :
                         'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                      }`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell text-slate-500 dark:text-slate-400 text-xs">
                      {c.campaign_type || '-'} <br/>
                      <span className="opacity-70">{c.objective || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell font-medium text-slate-700 dark:text-slate-300">
                      {c.budget_daily ? `₺${c.budget_daily}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => handleOpenEditCampaign(c)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-brand-dark dark:hover:text-white rounded-lg transition-colors"
                            title="Düzenle"
                         >
                           <Edit className="w-4 h-4" />
                         </button>
                         <button 
                            onClick={() => handleDeleteCampaign(c.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-500 rounded-lg transition-colors"
                            title="Sil"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                      <button className="xl:hidden p-1.5 text-slate-400 group-hover:hidden">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <CampaignForm 
          onClose={() => setIsFormOpen(false)} 
          projectId={projectId} 
          initialData={editingCampaign} 
        />
      )}
    </div>
  );
}
