"use client"

import * as React from "react"
import { useMeetingStore } from "@/stores/meetingStore"
import { useProjectStore } from "@/stores/projectStore"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Minimize2, Maximize2, PhoneOff, Clock, Power } from "lucide-react"

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

  const isHost = activeMeeting.started_by === user?.username
  
  const handleStopMeeting = async () => {
    if (selectedProjectId) {
      // confirm() yerine in-app onay mekanizması
      const confirmed = window.confirm("Bu görüntülü görüşmeyi tüm katılımcılar için sonlandırmak istediğinize emin misiniz?")
      if (confirmed) {
        await stopMeeting(selectedProjectId)
      }
    }
  }

  return (
    <Card 
      className={`fixed z-50 shadow-2xl transition-all duration-300 border border-white/10 dark:border-white/5 
        bg-background/80 dark:bg-zinc-950/80 backdrop-blur-xl rounded-xl overflow-hidden
        ${isMinimized 
          ? "bottom-20 right-4 w-[280px] h-[60px] md:bottom-6 md:right-6" 
          : "bottom-0 right-0 w-full h-[80vh] md:bottom-6 md:right-6 md:w-[480px] md:h-[380px] lg:w-[600px] lg:h-[450px] max-h-[90vh] rounded-b-none md:rounded-b-xl"
        }`}
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
          <div className="flex items-center gap-1 bg-white/10 dark:bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
            <Clock className="w-3 h-3 text-red-400" />
            {duration}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Küçültme / Büyütme Butonu */}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 hover:bg-white/10 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-200"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Genişlet" : "Küçült"}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </Button>

          {/* Aramadan Ayrıl (Sadece kendi çıkışı) */}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
            onClick={leaveMeeting}
            title="Aramadan Ayrıl"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </Button>

          {/* Toplantıyı Sonlandır (Tüm oda için kapatma, host ise aktif) */}
          {isHost && (
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-red-500 hover:text-red-400 hover:bg-red-500/10"
              onClick={handleStopMeeting}
              title="Görüşmeyi Herkes İçin Sonlandır"
            >
              <Power className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Arama Ekranı (Iframe) */}
      {!isMinimized && (
        <CardContent className="p-0 flex-1 h-[calc(100%-52px)] bg-zinc-950/40 relative">
          <iframe
            src={activeMeeting.url}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full border-0"
            title="Pikselis Görüntülü Görüşme"
          />
        </CardContent>
      )}

      {/* Küçültülmüş Modda Tıklama ile Genişletme Barı */}
      {isMinimized && (
        <div 
          onClick={() => setIsMinimized(false)}
          className="absolute inset-0 bg-transparent cursor-pointer flex items-center justify-center pt-8 text-[10px] font-medium text-muted-foreground hover:text-foreground"
        >
          Görüşmeye dönmek için tıklayın
        </div>
      )}
    </Card>
  )
}
