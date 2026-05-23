"use client"

import * as React from "react"
import { api } from "@/lib/api"
import { useProjectStore } from "@/stores/projectStore"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Activity, Plus, CheckCircle2, MessageSquare, ClipboardList, Trash2, Clock } from "lucide-react"

interface ActivityLog {
  id: number;
  project_id: number;
  user_id?: number;
  username?: string;
  activity_type?: string;
  description?: string;
  action?: string;
  details?: any;
  created_at: string;
  user?: {
    id: number;
    username: string;
    name: string;
    avatar_url?: string;
  };
}

export function ActivityFeedWidget() {
  const { selectedProjectId } = useProjectStore()
  const [activities, setActivities] = React.useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  // Aktiviteleri çek
  const fetchActivities = React.useCallback(async () => {
    if (!selectedProjectId) return
    setIsLoading(true)
    try {
      const response = await api.get(`/api/activities?project_id=${selectedProjectId}`)
      setActivities(response.data || [])
    } catch (error) {
      console.error("Aktivite akışı yüklenirken hata:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedProjectId])

  React.useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Canlı WS bildirimlerini dinle
  React.useEffect(() => {
    const handleNewActivity = (e: Event) => {
      const customEvent = e as CustomEvent<ActivityLog>
      const newAct = customEvent.detail
      
      if (newAct && newAct.project_id === selectedProjectId) {
        setActivities(prev => {
          // Mükerrerliği önle
          if (prev.some(a => a.id === newAct.id)) return prev
          return [newAct, ...prev].slice(0, 30) // En son 30 aktiviteyi tut
        })
      }
    }

    window.addEventListener("pikselis-new-activity", handleNewActivity)
    return () => {
      window.removeEventListener("pikselis-new-activity", handleNewActivity)
    }
  }, [selectedProjectId])

  // Aktivite tipine göre ikon ve renk belirle
  const getActivityMeta = (type: string) => {
    const normType = type?.toLowerCase() || ""
    if (normType.includes("created") || normType.includes("ekle")) {
      return {
        icon: <Plus className="w-4 h-4 text-emerald-500" />,
        bgColor: "bg-emerald-500/10 border-emerald-500/20"
      }
    } else if (normType.includes("status") || normType.includes("updated") || normType.includes("güncelle")) {
      return {
        icon: <CheckCircle2 className="w-4 h-4 text-brand-yellow" />,
        bgColor: "bg-brand-yellow/10 border-brand-yellow/20"
      }
    } else if (normType.includes("comment") || normType.includes("yorum")) {
      return {
        icon: <MessageSquare className="w-4 h-4 text-blue-500" />,
        bgColor: "bg-blue-500/10 border-blue-500/20"
      }
    } else if (normType.includes("deleted") || normType.includes("sil")) {
      return {
        icon: <Trash2 className="w-4 h-4 text-red-500" />,
        bgColor: "bg-red-500/10 border-red-500/20"
      }
    } else {
      return {
        icon: <ClipboardList className="w-4 h-4 text-zinc-500" />,
        bgColor: "bg-zinc-500/10 border-zinc-500/20"
      }
    }
  }

  // Dinamik açıklama helper'ı
  const getActivityDescription = (act: ActivityLog) => {
    if (act.description) return act.description

    const action = act.action || act.activity_type || ""
    const details = act.details || {}
    const detailStr = typeof details === "string" ? details : ""

    switch (action) {
      case "task_created":
        return `"${details.task_title || "Yeni görev"}" oluşturuldu.`
      case "task_status_updated":
      case "task_updated":
        return `"${details.task_title || "Görev"}" güncellendi. Yeni durum: ${details.new_status || "Güncel"}`
      case "comment_created":
        return `"${details.task_title || "Görev"}" altına yeni yorum yazıldı.`
      case "task_deleted":
        return `"${details.task_title || "Görev"}" silindi.`
      default:
        return detailStr || "Bir işlem gerçekleştirdi."
    }
  }

  // Türkçe Saat ve Süre Formatlama
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHrs = Math.floor(diffMins / 60)

      if (diffMins < 1) return "Şimdi"
      if (diffMins < 60) return `${diffMins} dk önce`
      if (diffHrs < 24) return `${diffHrs} sa önce`
      
      return date.toLocaleDateString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    } catch {
      return ""
    }
  }

  return (
    <Card className="h-full border border-white/10 dark:border-white/5 bg-background/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-lg rounded-xl overflow-hidden flex flex-col">
      <CardHeader className="p-4 border-b border-white/5 shrink-0 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-brand-yellow animate-pulse" />
          <CardTitle className="text-sm font-semibold">Canlı Aktivite Akışı</CardTitle>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">
          Canlı
        </span>
      </CardHeader>
      
      <CardContent className="p-3 flex-1 overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-white/5">
        {isLoading && activities.length === 0 ? (
          <div className="h-full flex items-center justify-center py-10 text-xs text-muted-foreground">
            Aktiviteler yükleniyor...
          </div>
        ) : activities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12 text-center text-zinc-500 space-y-2">
            <ClipboardList className="w-8 h-8 opacity-30" />
            <p className="text-xs">Henüz bir aktivite gerçekleşmedi.</p>
          </div>
        ) : (
          activities.map((act) => {
            const type = act.activity_type || act.action || "default"
            const username = act.username || act.user?.name || act.user?.username || "Sistem"
            const meta = getActivityMeta(type)
            const description = getActivityDescription(act)
            
            return (
              <div 
                key={act.id} 
                className="group flex gap-3 p-2.5 rounded-lg border border-white/5 bg-zinc-950/20 dark:bg-zinc-950/40 hover:bg-zinc-900/30 transition-all duration-300 animate-in fade-in-50 slide-in-from-top-1"
              >
                {/* Aktivite Simgesi */}
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${meta.bgColor}`}>
                  {meta.icon}
                </div>
                
                {/* Aktivite Metni */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {username}
                    </span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-0.5 whitespace-nowrap">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(act.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
