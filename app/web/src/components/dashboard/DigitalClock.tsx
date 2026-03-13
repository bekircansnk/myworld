"use client"

import * as React from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export function DigitalClock() {
  const [time, setTime] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!time) return null

  const hour = time.getHours()
  let greeting = "İyi Geceler"
  if (hour >= 6 && hour < 12) greeting = "Günaydın"
  else if (hour >= 12 && hour < 18) greeting = "Tünaydın"
  else if (hour >= 18 && hour < 24) greeting = "İyi Akşamlar"

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl group min-h-[140px] flex flex-col justify-center text-center">
      {/* Arka plan animasyonu */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent dark:from-indigo-600/30 dark:via-purple-600/20 blur-xl group-hover:opacity-80 transition-opacity opacity-50" />
      
      <div className="relative z-10 p-4 flex flex-col items-center justify-center h-full">
        <h2 className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 mb-1 uppercase tracking-widest">{greeting}, Bekir!</h2>
        
        {/* Neon Işıklı Saat Görüntüsü */}
        <div className="text-5xl font-black tabular-nums tracking-tighter mb-1 text-slate-800 dark:text-white drop-shadow-md relative">
          {format(time, "HH:mm")}
          <span className="absolute -top-1 -right-3 text-sm font-bold text-indigo-400 animate-pulse">{format(time, "ss")}</span>
        </div>
        
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
          {format(time, "d MMMM yyyy, EEEE", { locale: tr })}
        </p>
      </div>
    </div>
  )
}
