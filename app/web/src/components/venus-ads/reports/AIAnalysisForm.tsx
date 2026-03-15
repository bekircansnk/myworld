import React, { useState } from 'react';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { X, UploadCloud, FileText, Loader2 } from 'lucide-react';

interface AIAnalysisFormProps {
  onClose: () => void;
  projectId: number | null;
}

export function AIAnalysisForm({ onClose, projectId }: AIAnalysisFormProps) {
  const { createAIAnalysis } = useVenusAdsStore();
  const [title, setTitle] = useState('');
  const [reportSource, setReportSource] = useState('internal');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (reportSource !== 'internal' && !file) {
      setError("Lütfen analiz edilecek bir dosya seçin.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('report_source', reportSource);
      if (projectId) {
        formData.append('project_id', String(projectId));
      }
      if (file) {
        formData.append('file', file);
      }

      await createAIAnalysis(formData);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Rapor oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-indigo-500" />
            </div>
            <h2 className="text-lg font-bold text-brand-dark dark:text-white">Yapay Zeka Analiz Raporu</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Analiz Başlığı *
            </label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Ör: Q1 Performans Analizi"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20" 
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Veri Kaynağı
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => { setReportSource('internal'); setFile(null); }}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  reportSource === 'internal' 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                }`}
              >
                Sistem Verileri
              </button>
              <button 
                type="button"
                onClick={() => setReportSource('external')}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  reportSource === 'external' 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                }`}
              >
                Dosya Yükle
              </button>
            </div>
          </div>

          {reportSource === 'external' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Analiz Edilecek Dosya (PDF, DOCX, CSV)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors">
                <div className="space-y-1 text-center">
                  <FileText className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-500 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                      <span>{file ? file.name : "Dosya Yükle"}</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx,.doc,.csv,.xlsx" />
                    </label>
                    {!file && <p className="pl-1">veya sürükleyip bırakın</p>}
                  </div>
                  <p className="text-xs text-slate-500">25MB'a kadar PDF, DOC, CSV, Excel</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >
              İptal
            </button>
            <button 
              type="submit" 
              disabled={loading || !title.trim() || (reportSource !== 'internal' && !file)}
              className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Analiz Ediliyor...' : 'Analizi Başlat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
