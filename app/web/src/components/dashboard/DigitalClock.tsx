"use client"

import * as React from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useAuthStore } from "@/store/authStore"

export function DigitalClock() {
  const user = useAuthStore(state => state.user)
  const [time, setTime] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setTime(new Date())
    // Dakika bazlı güncelleme — CPU tasarrufu
    const now = new Date()
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
    const initialTimeout = setTimeout(() => {
      setTime(new Date())
    }, msUntilNextMinute)
    const timer = setInterval(() => setTime(new Date()), 60000)
    return () => { clearTimeout(initialTimeout); clearInterval(timer) }
  }, [])

  if (!time) return null

  const hour = time.getHours()
  let greeting = "İyi Geceler"
  if (hour >= 6 && hour < 12) greeting = "Günaydın"
  else if (hour >= 12 && hour < 18) greeting = "Tünaydın"
  else if (hour >= 18 && hour < 24) greeting = "İyi Akşamlar"

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl group min-h-[140px] flex flex-col justify-center text-center">
      <div className="relative z-10 p-4 flex flex-col items-center justify-center h-full">
        <h2 className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 mb-1 uppercase tracking-widest">{greeting}{user?.username ? `, ${user.username}` : ""}!</h2>
        
        <div className="text-5xl font-black tabular-nums tracking-tighter mb-1 text-slate-800 dark:text-white drop-shadow-md relative">
          {format(time, "HH:mm")}
        </div>
        
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
          {format(time, "d MMMM yyyy, EEEE", { locale: tr })}
        </p>
      </div>
    </div>
  )
}

