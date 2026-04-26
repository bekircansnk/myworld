import React, { useState } from 'react';
import { usePhotoTrackingStore } from '@/stores/photoTrackingStore';
import { Layers, Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ModelExplorerProps {
  projectId: number | null;
}

export function ModelExplorer({ projectId }: ModelExplorerProps) {
  const { models, isLoadingModels, deleteModel } = usePhotoTrackingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredModels = models.filter(m => {
    const matchesSearch = m.model_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.sezon_kodu && m.sezon_kodu.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
             <Layers className="w-6 h-6 text-brand-gray dark:text-gray-400" />
            Model Yönetimi
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Tüm modelleri listeleyin, detaylarını ve geçmişini görün.
          </p>
        </div>
        <button
          className="px-5 py-2.5 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Manuel Model Ekle
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Model adı veya sezon kodu ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
             <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white appearance-none h-full outline-none"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="completed">Tamamlandı</option>
                <option value="revision_pending">Revize Bekliyor</option>
            </select>
            <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden flex-1 shrink-0 flex flex-col">
        {isLoadingModels ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-dark rounded-full animate-spin dark:border-slate-700 dark:border-t-white" />
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
             <Layers className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
             <p className="font-medium text-lg">Model Bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-brand-gray dark:text-gray-400 uppercase text-[10px] font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Sezon Kodu</th>
                  <th className="px-6 py-4">Model Adı</th>
                  <th className="px-6 py-4">Hafta</th>
                  <th className="px-6 py-4">Renk / Foto</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredModels.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-500">{m.sezon_kodu || '-'}</td>
                    <td className="px-6 py-4 font-bold text-brand-dark dark:text-white">{m.model_name}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold">{m.week_number}. Hafta</span></td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{m.colors.length} Renk / {m.total_photos} Foto</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block border ${
                         m.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/50' :
                         'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/50'
                      }`}>
                        {m.status === 'completed' ? 'TAMAMLANDI' : 'AKTİF'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                             onClick={() => deleteModel(m.id)}
                             className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-500 rounded-lg transition-colors"
                             title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
