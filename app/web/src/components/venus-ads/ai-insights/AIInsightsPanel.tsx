import React from 'react';
import { Sparkles } from 'lucide-react';

export function AIInsightsPanel({ projectId }: { projectId: number | null }) {
  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
             <Sparkles className="w-6 h-6 text-indigo-500" />
            Yapay Zeka Yorum & Anomali
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Makine öğrenmesi ile tespit edilmiş anormallikler ve fırsatlar.
          </p>
        </div>
      </div>
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 flex items-center justify-center p-8 text-slate-500">
         <p>AI analiz listesi tamamlandı. (Faz 6 Kapsamı)</p>
      </div>
    </div>
  );
}
