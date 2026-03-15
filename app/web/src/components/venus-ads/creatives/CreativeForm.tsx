import React, { useState, useEffect } from 'react';
import { VenusCreative } from '@/types/venus-ads';
import { useVenusAdsStore } from '@/stores/venusAdsStore';
import { X, Save, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface CreativeFormProps {
  onClose: () => void;
  projectId: number | null;
  initialData?: VenusCreative | null;
}

export function CreativeForm({ onClose, projectId, initialData }: CreativeFormProps) {
  const { createCreative, updateCreative, campaigns, experiments, fetchCampaigns, fetchExperiments } = useVenusAdsStore();
  
  useEffect(() => {
    fetchCampaigns(projectId || undefined);
    fetchExperiments(projectId || undefined);
  }, [projectId]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<VenusCreative>>(
    initialData || {
      creative_name: '',
      creative_type: 'image',
      format: '1x1',
      status: 'active',
      project_id: projectId || undefined,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (initialData?.id) {
        await updateCreative(initialData.id, formData);
      } else {
        await createCreative(formData);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Dosya boyutu 10 MB'dan küçük olmalıdır.");
      return;
    }
    
    setError(null);
    setIsCompressing(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 1600;
          if (width > MAX_SIZE || height > MAX_SIZE) {
             const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
             width = Math.round(width * ratio);
             height = Math.round(height * ratio);
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
             setFormData(prev => ({ ...prev, url: compressedDataUrl }));
          }
          setIsCompressing(false);
        };
        img.onerror = () => {
          setError("Görsel okunurken bir hata oluştu.");
          setIsCompressing(false);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        setError("Dosya okunurken bir hata oluştu.");
        setIsCompressing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Görsel işlenirken bir hata oluştu.");
      setIsCompressing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1c23] w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-dark dark:text-white">
            {initialData ? 'Kreatifi Düzenle' : 'Yeni Kreatif Ekle'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm flex items-start gap-2 border border-red-100 dark:border-red-900/30">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Kreatif Adı *</label>
            <input
              type="text"
              name="creative_name"
              required
              value={formData.creative_name || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 dark:focus:ring-white/20"
              placeholder="Örn: 2024 Yaz İndirimi Afişi"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Kreatif Türü *</label>
              <select
                name="creative_type"
                required
                value={formData.creative_type || 'image'}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white"
              >
                <option value="image">Görsel (Image)</option>
                <option value="video">Görüntü (Video)</option>
                <option value="carousel">Kaydırmalı (Carousel)</option>
                <option value="text">Metin Sadece</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Format</label>
              <select
                name="format"
                value={formData.format || '1x1'}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white"
              >
                <option value="1x1">Kare (1:1 / 1080x1080)</option>
                <option value="9x16">Story/Reels (9:16 / 1080x1920)</option>
                <option value="16x9">Yatay (16:9 / 1920x1080)</option>
                <option value="4x5">Dikey Gönderi (4:5 / 1080x1350)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Tasarımcı (Opsiyonel)</label>
              <input
                type="text"
                name="designer"
                value={formData.designer || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white"
                placeholder="Örn: Ali V."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Performans Skoru (1-10)</label>
              <input
                type="number"
                name="performance_score"
                value={formData.performance_score || ''}
                onChange={handleChange}
                min="1"
                max="10"
                step="0.1"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white"
                placeholder="Örn: 8.5"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5 border-l-2 border-indigo-500 pl-2">Bağlı Kampanya</label>
                <select 
                  name="campaign_id" 
                  value={formData.campaign_id || ''} 
                  onChange={(e) => setFormData(p => ({ ...p, campaign_id: Number(e.target.value) || undefined }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white"
                >
                  <option value="">- Bağımsız Kreatif -</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.campaign_name}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5 border-l-2 border-purple-500 pl-2">Bağlı Test / Deney</label>
                <select 
                  name="experiment_id" 
                  value={formData.experiment_id || ''} 
                  onChange={(e) => setFormData(p => ({ ...p, experiment_id: Number(e.target.value) || undefined }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white"
                >
                  <option value="">- Bağımsız Kreatif -</option>
                  {experiments.map(c => <option key={c.id} value={c.id}>{c.experiment_name}</option>)}
                </select>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">Görsel/Video URL veya Dosya Yükle</label>
              
             <div className="flex flex-col gap-3">
               <input
                 type="url"
                 name="url"
                 value={(formData.url && formData.url.startsWith('data:image')) ? '' : formData.url || ''}
                 onChange={handleChange}
                 className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1117] text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 dark:focus:ring-white/20"
                 placeholder="https://... URL yapıştırabilir veya alttan dosya seçebilirsiniz"
               />
               
               <div className="relative border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl px-4 py-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-[#0f1117]/50 hover:bg-slate-100 dark:hover:bg-[#0f1117]/80 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    title=""
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-700 dark:text-gray-300">
                     Bilgisayardan Fotoğraf Yükle
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                     Maks. 10MB (Sunucu için otomatik dönüştürülüp sıkıştırılır)
                  </p>
               </div>
             </div>

             {formData.url && formData.url.startsWith('data:image') && (
               <div className="mt-4 relative w-full h-48 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-[#0f1117] flex justify-center items-center">
                 <img src={formData.url} alt="Önizleme" className="max-w-full max-h-full object-contain" />
                 <button 
                   type="button" 
                   onClick={() => setFormData(p => ({...p, url: ''}))} 
                   className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black rounded-lg text-slate-700 dark:text-gray-200 shadow-sm backdrop-blur-sm"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>
             )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="px-5 py-2.5 rounded-xl font-medium bg-brand-dark text-white hover:bg-black dark:bg-white dark:text-brand-dark dark:hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {(isSubmitting || isCompressing) ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {initialData ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
