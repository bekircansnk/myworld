"use client"

import * as React from "react"
import { useMeetingStore } from "@/stores/meetingStore"
import { useProjectStore } from "@/stores/projectStore"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Minimize2, Maximize2, Clock, X, Video } from "lucide-react"

export function InAppCallWindow() {
  const { activeMeeting, isCallWindowOpen, leaveMeeting, stopMeeting } = useMeetingStore()
  const { selectedProjectId } = useProjectStore()
  const { user } = useAuthStore()
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [duration, setDuration] = React.useState("00:00")

  // Görüşme süresi sayacı (Timer)
  React.useEffect(() => {
    if (!activeMeeting || !isCallWindowOpen) return

    const startedTime = new Date(activeMeeting.started_at).getTime()
    
    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = Math.max(0, now - startedTime)
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      
      const pad = (num: number) => String(num).padStart(2, '0')
      setDuration(`${pad(minutes)}:${pad(seconds)}`)
    }

    updateTimer()
    const timerId = setInterval(updateTimer, 1000)

    return () => clearInterval(timerId)
  }, [activeMeeting, isCallWindowOpen])

  if (!isCallWindowOpen || !activeMeeting) return null

  const handleCloseCall = async () => {
    if (selectedProjectId) {
      await stopMeeting(selectedProjectId)
    } else {
      leaveMeeting()
    }
  }

  // Küçültülmüş Mod Arayüzü (Lüks Yüzen Hap)
  if (isMinimized) {
    return (
      <div 
        className="fixed z-50 bottom-20 left-4 right-auto md:bottom-6 md:left-6 flex items-center gap-3 p-3 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-indigo-500/20 shadow-2xl rounded-2xl animate-bounce-subtle hover:scale-102 transition-transform duration-300 cursor-pointer"
        onClick={() => setIsMinimized(false)}
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-pulse">
          <Video className="w-4 h-4 text-emerald-500" />
        </div>
        
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-[11px] font-black text-brand-dark dark:text-white leading-none">Canlı Görüşme</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-red-400 shrink-0" />
            {duration}
          </span>
        </div>

        <div className="flex items-center gap-1 border-l border-slate-200/50 dark:border-white/5 pl-2" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500"
            onClick={() => setIsMinimized(false)}
            title="Büyüt"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-red-500 hover:text-red-400 hover:bg-red-500/10"
            onClick={handleCloseCall}
            title="Sonlandır"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card 
      className="fixed z-50 shadow-2xl transition-all duration-300 border border-white/10 dark:border-white/5 
        bg-background/95 dark:bg-zinc-950/95 backdrop-blur-xl rounded-xl overflow-hidden
        bottom-0 right-0 w-full h-[80vh] md:bottom-6 md:right-6 md:w-[480px] md:h-[380px] lg:w-[600px] lg:h-[450px] max-h-[90vh] rounded-b-none md:rounded-b-xl"
    >
      {/* Başlık Çubuğu */}
      <CardHeader className="p-3 bg-zinc-900/10 dark:bg-white/5 border-b border-white/5 flex flex-row items-center justify-between space-y-0 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </div>
          <CardTitle className="text-xs font-semibold truncate max-w-[120px] md:max-w-[200px]">
            Canlı Toplantı
          </CardTitle>
          <div className="flex items-center gap-1 bg-white/20 dark:bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
            <Clock className="w-3 h-3 text-red-400" />
            {duration}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Küçültme / Büyütme Butonu */}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 hover:bg-white/10 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-200"
            onClick={() => setIsMinimized(true)}
            title="Küçült"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </Button>

          {/* Kapat / Görüşmeyi Herkes İçin Sonlandır */}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-red-500 hover:text-red-400 hover:bg-red-500/10"
            onClick={handleCloseCall}
            title="Görüşmeyi Sonlandır ve Kapat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Arama Ekranı (Iframe) */}
      <CardContent className="p-0 flex-1 h-[calc(100%-52px)] bg-zinc-950/40 relative">
        <iframe
          src={activeMeeting.url}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="w-full h-full border-0"
          title="Pikselis Görüntülü Görüşme"
        />
      </CardContent>
    </Card>
  )
}
