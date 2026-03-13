"use client"

import * as React from "react"
import { Calendar as CalendarIcon, MoreHorizontal } from "lucide-react"

export function CalendarSummaryWidget() {
  const [currentMonthName, setCurrentMonthName] = React.useState("")
  
  React.useEffect(() => {
    setCurrentMonthName(new Date().toLocaleString('tr-TR', { month: 'long' }))
  }, [])
  
  return (
    <div className="glass-card p-6 h-full flex flex-col border border-white/60 dark:border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[17px] font-black tracking-tight flex items-center gap-2 text-slate-800 dark:text-white">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
            <CalendarIcon className="w-4 h-4" />
          </div>
          Takvim
        </h3>
        <div className="flex items-center gap-2">
          <button className="text-slate-500 hover:text-indigo-500 font-bold text-[11px] uppercase tracking-wider px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">{currentMonthName || 'Ay'}</button>
          <button className="text-slate-400 hover:text-indigo-500 p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 text-center mb-3">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
          <span key={d} className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{d}</span>
        ))}
      </div>

      {/* Days Grid - Görsel mockup temsili */}
      <div className="grid grid-cols-7 gap-y-2 text-center text-[13px] font-semibold mb-6 flex-1">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
           const isToday = day === 15;
           const hasEvent1 = day === 12; 
           const hasEvent2 = day === 19;
           return (
             <div key={day} className="flex justify-center items-center h-8 relative">
               <span className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer
                  ${isToday ? 'bg-indigo-500 shadow-md text-white shadow-indigo-500/40 font-black' 
                  : (hasEvent1 || hasEvent2) ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                 {day}
               </span>
               {(hasEvent1 || hasEvent2) && !isToday && (
                 <span className="absolute bottom-0.5 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_4px_rgba(99,102,241,0.5)]" />
               )}
             </div>
           )
        })}
      </div>
      
      {/* Schedule Items */}
      <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-slate-100 dark:border-white/5">
         <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-transparent dark:from-indigo-900/10 border border-indigo-100/50 dark:border-indigo-500/10 group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
           <div className="w-1.5 h-10 rounded-full bg-indigo-500" />
           <div className="flex-1">
             <h4 className="text-[13px] font-bold text-slate-800 dark:text-white">Takım Toplantısı</h4>
             <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">10:00 - 11:30</p>
           </div>
         </div>
         <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-transparent dark:from-emerald-900/10 border border-emerald-100/50 dark:border-emerald-500/10 group cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-colors">
           <div className="w-1.5 h-10 rounded-full bg-emerald-500" />
           <div className="flex-1">
             <h4 className="text-[13px] font-bold text-slate-800 dark:text-white">Proje Planlama</h4>
             <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">14:00 - 15:00</p>
           </div>
         </div>
      </div>
    </div>
  )
}
