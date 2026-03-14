import React from 'react';
import { Upload } from 'lucide-react';

export function CSVImporter({ projectId }: { projectId: number | null }) {
  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
             <Upload className="w-6 h-6 text-brand-gray dark:text-gray-400" />
            CSV İçe Aktarma
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manuel platform verilerini içeri aktarın.
          </p>
        </div>
      </div>
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 flex items-center justify-center p-8 text-slate-500">
         <p>CSV Yükleme modülü aktif edildi. (Faz 5 Kapsamı)</p>
      </div>
    </div>
  );
}
