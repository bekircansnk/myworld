import React, { useRef, useState, useEffect } from 'react';
import { usePhotoTrackingStore } from '@/stores/photoTrackingStore';
import { useProjectStore } from '@/stores/projectStore';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ExcelCenterProps {
  projectId: number | null;
}

export function ExcelCenter({ projectId }: ExcelCenterProps) {
  const { importExcel, isLoadingImport, importLogs, fetchModels, exportExcel, isExporting } = usePhotoTrackingStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);
    setSuccessMsg(null);
    if (!file.name.endsWith('.xlsx')) {
      setError('Lütfen geçerli bir Excel dosyası yükleyin (.xlsx).');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setError(null);
    try {
      const res = await importExcel(selectedFile, projectId || undefined);
      setSuccessMsg(`${res.models_imported} Model ve ${res.colors_imported} Renk başarıyla içe aktarıldı.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Excel içe aktarılırken bir hata oluştu.');
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
           <FileSpreadsheet className="w-6 h-6 text-brand-gray dark:text-gray-400" />
          Excel İçe/Dışa Aktar
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Modelleri ve renk varyantlarını Excel'den topluca içeri aktarın.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol: İçe Aktarma Kutusu */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6 flex flex-col h-[400px]">
          <h3 className="font-bold text-brand-dark dark:text-white mb-4">Excel Yükle</h3>
          
          <div 
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors ${dragActive ? 'border-brand-dark bg-brand-dark/5 dark:border-brand-yellow dark:bg-brand-yellow/10' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="font-bold text-brand-dark dark:text-white mb-1">{selectedFile.name}</p>
                <p className="text-sm text-brand-gray dark:text-gray-500 mb-6">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <div className="flex items-center gap-3 justify-center">
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    İptal
                  </button>
                  <button 
                    onClick={handleImport}
                    disabled={isLoadingImport}
                    className="px-6 py-2 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoadingImport ? 'İçe Aktarılıyor...' : 'İçe Aktarmayı Başlat'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-brand-gray dark:text-gray-400" />
                </div>
                <p className="font-bold text-brand-dark dark:text-white mb-1">Dosyayı sürükleyip bırakın</p>
                <p className="text-sm text-brand-gray dark:text-gray-500 mb-6">veya bilgisayarınızdan seçin (sadece .xlsx)</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 rounded-xl font-medium transition-colors inline-block"
                >
                  Dosya Seç
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".xlsx"
                  className="hidden" 
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-sm rounded-lg flex items-start gap-2 border border-red-100 dark:border-red-900/50">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {successMsg && (
            <div className="mt-4 p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 text-sm rounded-lg flex items-start gap-2 border border-emerald-100 dark:border-emerald-900/50">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Sağ: İçe Aktarma Geçmişi ve Dışa Aktarma */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-brand-dark dark:text-white">Son İçe Aktarmalar</h3>
             <button 
                onClick={() => exportExcel(projectId || undefined, new Date().getMonth() + 1, new Date().getFullYear())}
                disabled={isExporting}
                className="px-4 py-1.5 bg-brand-yellow/20 text-brand-yellow hover:bg-brand-yellow hover:text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
             >
                {isExporting ? 'Aktarılıyor...' : 'Mevcut Durumu Dışa Aktar'}
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {importLogs.length === 0 ? (
               <div className="h-full flex items-center justify-center text-sm text-brand-gray dark:text-gray-500">
                  Henüz içe aktarma geçmişi yok.
               </div>
            ) : (
              <div className="space-y-3">
                 {importLogs.map(log => (
                    <div key={log.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                       <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm truncate pr-4">{log.file_name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                             {log.status.toUpperCase()}
                          </span>
                       </div>
                       <div className="text-xs text-slate-500 flex justify-between">
                          <span>{log.models_imported} Model, {log.colors_imported} Renk</span>
                          <span>{format(new Date(log.imported_at), 'dd MMM HH:mm', { locale: tr })}</span>
                       </div>
                    </div>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
