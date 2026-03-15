import React, { useState, useEffect, useCallback } from 'react';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { useProjectStore } from '@/stores/projectStore';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { VenusCSVImport } from '@/types/venus-ads';

const PLATFORMS = [
  { value: 'google_ads', label: 'Google Ads', color: 'bg-red-500' },
  { value: 'meta_ads', label: 'Meta Ads', color: 'bg-blue-500' },
  { value: 'tiktok_ads', label: 'TikTok Ads', color: 'bg-slate-800 dark:bg-white' },
  { value: 'custom', label: 'Özel Format', color: 'bg-purple-500' },
];

export function CSVImporter({ projectId }: { projectId: number | null }) {
  const { csvImports, isLoadingCSV, fetchCSVImports } = useVenusAdsStore();
  const { projects } = useProjectStore();
  const currentProject = projects.find(p => p.id === projectId);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('google_ads');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    fetchCSVImports(projectId || undefined);
  }, [projectId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleUpload(files[0]);
  }, [selectedPlatform]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      setUploadStatus('error');
      setUploadMessage('Sadece CSV ve XLSX dosyaları destekleniyor.');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage(`"${file.name}" yükleniyor ve işleniyor...`);

    try {
      // @ts-ignore
      await useVenusAdsStore.getState().uploadCSV(file, selectedPlatform, projectId || undefined);

      setUploadStatus('success');
      setUploadMessage(`"${file.name}" başarıyla içe aktarıldı ve veritabanına kaydedildi.`);
      await fetchCSVImports(projectId || undefined);
    } catch (e: any) {
      console.error(e);
      setUploadStatus('error');
      setUploadMessage(e.response?.data?.detail || e.message || 'Yükleme sırasında bir hata oluştu.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Başarılı</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"><XCircle className="w-3 h-3" /> Hatalı</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"><Clock className="w-3 h-3" /> İşleniyor</span>;
      default:
        return <span className="text-[10px] font-bold text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
            <Upload className="w-6 h-6 text-brand-gray dark:text-gray-400" />
            CSV İçe Aktarma
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {currentProject ? `${currentProject.name} markasının m` : 'M'}anuel platform verilerini içe aktarın.
          </p>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Platform Seçin:</span>
          {PLATFORMS.map(p => (
            <button key={p.value} onClick={() => setSelectedPlatform(p.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                selectedPlatform === p.value
                  ? 'border-brand-dark dark:border-white bg-slate-50 dark:bg-slate-700 text-brand-dark dark:text-white'
                  : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300'
              }`}>
              <span className={`w-2 h-2 rounded-full ${p.color}`} />
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
          <div className="flex-1">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1">Örnek Dosyanız Yok mu?</h4>
            <p className="text-[11px] text-indigo-700/70 dark:text-indigo-400/70">Sistemin tanıması için aşağıdaki örnek formatları indirip inceleyebilirsiniz.</p>
          </div>
          <div className="flex gap-2">
            <a 
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/static/samples/google_ads_sample.csv`} 
              download 
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-white/80 transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3 h-3" /> Google Örneği
            </a>
            <a 
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/static/samples/meta_ads_sample.csv`} 
              download 
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-white/80 transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3 h-3" /> Meta Örneği
            </a>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-400'
        }`}
        onClick={() => document.getElementById('csv-file-input')?.click()}
      >
        <input id="csv-file-input" type="file" accept=".csv,.xlsx" onChange={handleFileSelect} className="hidden" />
        <FileSpreadsheet className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-indigo-400' : 'text-slate-300 dark:text-slate-600'}`} />
        <p className="font-bold text-brand-dark dark:text-white text-lg mb-1">
          {isDragging ? 'Dosyayı bırakın!' : 'CSV dosyanızı sürükleyip bırakın'}
        </p>
        <p className="text-sm text-slate-400 mb-4">veya <span className="text-indigo-500 font-medium">dosya seçin</span></p>
        <p className="text-[10px] text-slate-400">Desteklenen: .csv, .xlsx • Maks: 10MB</p>
      </div>

      {/* Upload Status */}
      {uploadStatus !== 'idle' && (
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border ${
          uploadStatus === 'uploading' ? 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30' :
          uploadStatus === 'success' ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30' :
          'border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30'
        }`}>
          {uploadStatus === 'uploading' && <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />}
          {uploadStatus === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
          {uploadStatus === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />}
          <p className="text-sm text-slate-700 dark:text-slate-300">{uploadMessage}</p>
        </div>
      )}

      {/* Import History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden flex-1">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/20">
          <h2 className="font-bold text-brand-dark dark:text-white flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            İçe Aktarma Geçmişi
          </h2>
        </div>
        {isLoadingCSV ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-3 border-slate-200 border-t-brand-dark rounded-full animate-spin mx-auto" /></div>
        ) : csvImports.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Henüz hiç veri içe aktarılmadı.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-3">Dosya</th>
                <th className="px-6 py-3">Platform</th>
                <th className="px-6 py-3">Satır</th>
                <th className="px-6 py-3">Durum</th>
                <th className="px-6 py-3">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {csvImports.map(imp => (
                <tr key={imp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/80 transition-colors">
                  <td className="px-6 py-3 font-medium text-brand-dark dark:text-white">{imp.filename}</td>
                  <td className="px-6 py-3">
                    <span className="capitalize text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      {imp.platform_source.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{imp.rows_imported}</td>
                  <td className="px-6 py-3">{getStatusBadge(imp.status)}</td>
                  <td className="px-6 py-3 text-xs text-slate-400">
                    {new Date(imp.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
