import React, { useState } from 'react';
import { usePhotoTrackingStore } from '@/stores/photoTrackingStore';
import { FileImage, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface RevisionCenterProps {
  projectId: number | null;
}

export function RevisionCenter({ projectId }: RevisionCenterProps) {
  const { models } = usePhotoTrackingStore();
  
  // Flatten all revisions
  const allRevisions = models.flatMap(m => 
    m.revisions.map(r => ({ ...r, model_name: m.model_name, sezon: m.sezon_kodu }))
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
             <FileImage className="w-6 h-6 text-brand-gray dark:text-gray-400" />
            Revize Merkezi
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Revize edilen fotoğrafları ve açıklamaları takip edin.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden flex-1 shrink-0 flex flex-col p-6">
        <h3 className="font-bold text-lg mb-6">Revize Geçmişi</h3>
        
        <div className="flex-1 overflow-y-auto pr-4">
           {allRevisions.length === 0 ? (
             <div className="text-center py-10 text-slate-500">
               Henüz kaydedilmiş bir revize bulunmuyor.
             </div>
           ) : (
             <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-8 pb-8">
                {allRevisions.map(rev => (
                  <div key={rev.id} className="relative pl-6">
                     <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-brand-yellow ring-4 ring-white dark:ring-slate-800" />
                     <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-brand-dark dark:text-white">{rev.model_name}</h4>
                        {rev.sezon && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">{rev.sezon}</span>}
                        <span className="text-xs text-slate-400 ml-auto">{format(new Date(rev.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}</span>
                     </div>
                     <p className="text-sm text-brand-gray dark:text-gray-300 mb-2">{rev.description}</p>
                     <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-900/50">
                        {rev.revised_count} Fotoğraf Revize Edildi
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
