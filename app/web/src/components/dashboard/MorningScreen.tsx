"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { 
  Sun, Moon, Sunrise, Sunset, Sparkles, 
  CheckCircle2, Clock, Calendar, AlertCircle, 
  ArrowRight, BrainCircuit, RefreshCw 
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useTaskStore } from "@/stores/taskStore"
import { useCalendarStore } from "@/stores/calendarStore"
import { useProjectStore } from "@/stores/projectStore"
import { api } from "@/lib/api"
import { Task } from "@/types"
import { CalendarEvent } from "@/types/calendar"

interface MorningScreenProps {
  onDismiss: () => void;
}

export function MorningScreen({ onDismiss }: MorningScreenProps) {
  const { user } = useAuthStore()
  const { tasks, fetchTasks } = useTaskStore()
  const { events, fetchEvents } = useCalendarStore()
  const { selectedProjectId } = useProjectStore()

  // Durum Yönetimi (State Management)
  const [mounted, setMounted] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const [motivation, setMotivation] = React.useState<string>("")
  const [isAiLoading, setIsAiLoading] = React.useState(false)

  // Saate Göre Karşılama ve Tema Belirleme
  const greetingInfo = React.useMemo(() => {
    if (!mounted) return { text: "Günaydın", icon: <Sunrise className="w-8 h-8 text-amber-500 animate-pulse" />, gradient: "from-amber-500/20 via-orange-500/10 to-transparent" }
    
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      return {
        text: "Günaydın",
        icon: <Sunrise className="w-8 h-8 text-amber-500 animate-pulse" />,
        gradient: "from-amber-500/20 via-orange-500/10 to-transparent"
      }
    } else if (hour >= 12 && hour < 17) {
      return {
        text: "Tünaydın",
        icon: <Sun className="w-8 h-8 text-yellow-500 animate-spin-slow" />,
        gradient: "from-yellow-500/20 via-amber-500/10 to-transparent"
      }
    } else if (hour >= 17 && hour < 22) {
      return {
        text: "İyi Akşamlar",
        icon: <Sunset className="w-8 h-8 text-rose-500" />,
        gradient: "from-rose-500/20 via-purple-500/10 to-transparent"
      }
    } else {
      return {
        text: "İyi Geceler",
        icon: <Moon className="w-8 h-8 text-indigo-400" />,
        gradient: "from-indigo-500/25 via-slate-900/40 to-transparent"
      }
    }
  }, [mounted])

  // AI Motivasyon Mesajını Çek
  const fetchAiMotivation = async () => {
    setIsAiLoading(true)
    try {
      const res = await api.get("/api/ai/motivation")
      if (res.data && res.data.message) {
        setMotivation(res.data.message)
      } else {
        setMotivation("Bugün harika şeyler yapabileceğini biliyorum. Adım adım hedeflerine odaklan!")
      }
    } catch (err) {
      console.error("AI motivasyon mesajı çekilemedi:", err)
      setMotivation("Harika bir gün olsun! Bugün tüm görevlerini başarıyla tamamlaman için sabırsızlanıyorum.")
    } finally {
      setIsAiLoading(false)
    }
  }

  // İlk Yükleme ve Veri Senkronizasyonu
  React.useEffect(() => {
    setMounted(true)
    setIsVisible(true)
    
    // Eğer Zustand store'lar boşsa verileri tetikle
    if (selectedProjectId) {
      fetchTasks(selectedProjectId)
      fetchEvents(selectedProjectId)
    }
    
    fetchAiMotivation()
  }, [selectedProjectId])

  // Kapatma Animasyonu Yönetimi
  const handleStart = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(), 400) // Pürüzsüz geçiş için animasyon süresi
  }

  // Veri Analizi ve Filtreleme (Sadece Client-side'da çalışır, Hydration hatasını önler)
  const stats = React.useMemo(() => {
    if (!mounted) return { todayTasks: [], pendingTasks: [], todayEvents: [], completedYesterday: 0, waitingTasks: [], completedTotal: 0 }

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0] // YYYY-MM-DD
    
    // Dünün Tarihini Hesapla
    const yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // 1. Bugünün Görevleri (due_date bugün olan ve tamamlanmamış)
    const todayTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'done' || t.is_deleted) return false
      const taskDate = t.due_date.split('T')[0]
      return taskDate === todayStr
    })

    // 2. Günden Kalanlar (Tamamlanmamış ve son tarihi geçmiş olan görevler)
    const pendingTasks = tasks.filter(t => {
      if (t.status === 'done' || t.is_deleted) return false
      if (!t.due_date) return false
      const taskDate = t.due_date.split('T')[0]
      return taskDate < todayStr // Tarihi bugünden küçük olanlar
    }).slice(0, 3) // En fazla 3 tanesini göster, ekranı yorma

    // 3. Bugünün Takvim Etkinlikleri
    const todayEvents = events.filter(e => {
      if (e.isCompleted) return false
      return e.date === todayStr
    })

    // 4. Dün Tamamlanan Görevler
    const completedYesterday = tasks.filter(t => {
      if (t.status !== 'done' || t.is_deleted || !t.completed_at) return false
      const compDate = t.completed_at.split('T')[0]
      return compDate === yesterdayStr
    }).length

    // 5. Bekleyen İşler (Gelecek tarihli veya son tarihi olmayan tamamlanmamış aktif görevler)
    const waitingTasks = tasks.filter(t => {
      if (t.status === 'done' || t.is_deleted || t.parent_task_id) return false
      if (!t.due_date) return true // Son tarihi yoksa bekleyen genel iştir
      const taskDate = t.due_date.split('T')[0]
      return taskDate > todayStr // Gelecek tarihli
    })

    // 6. Toplam Tamamlanan Görev Sayısı (Ana görevler)
    const completedTotal = tasks.filter(t => t.status === 'done' && !t.parent_task_id && !t.is_deleted).length

    return { todayTasks, pendingTasks, todayEvents, completedYesterday, waitingTasks, completedTotal }
  }, [mounted, tasks, events])

  // Hydration öncesi Next.js'in tutarsız HTML üretmesini engelle
  if (!mounted) {
    return null
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md transition-all duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Arka Plandaki Estetik Gradyan Halka */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr ${greetingInfo.gradient} blur-[120px] opacity-75 pointer-events-none transition-all duration-700`} />
      
      <div className={`relative max-w-5xl w-full mx-4 p-5 md:p-10 max-h-[92dvh] md:max-h-[85dvh] bg-card/40 border border-border/60 backdrop-blur-xl rounded-[24px] md:rounded-[32px] shadow-2xl flex flex-col transform transition-all duration-700 ease-out overflow-hidden ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}`}>
        
        {/* Üst Karşılama Bölümü */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 pb-4 md:pb-6 border-b border-border/50 shrink-0">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 mb-2 md:mb-3">
              <div className="p-2 bg-primary/10 rounded-xl md:rounded-2xl">
                {greetingInfo.icon}
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">{greetingInfo.text}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Tekrar Hoş Geldin, <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">{user?.username}</span>!
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2 max-w-xl hidden sm:block">
              İşte yeni bir gün ve yeni fırsatlar. Bugünün odağını belirlemeden önce senin için hazırladığım özete bir göz at.
            </p>
          </div>
 
          {/* Dün Neler Yaptık & Genel İlerleme Kartları */}
          <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 w-full md:w-auto shrink-0">
            {/* Tamamlanan Görev Sayısı & Unvan (Sade Motivasyon) */}
            <div className="bg-slate-500/5 dark:bg-white/[0.02] border border-border/60 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-3 w-full sm:w-auto min-w-[200px]">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-base">
                📊
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Genel Durum</h4>
                <p className="text-xs font-bold text-foreground mt-1">{stats.completedTotal} Görev Bitti</p>
                <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                  {
                    stats.completedTotal === 0 ? "Piksel Çırağı 🚀" :
                    stats.completedTotal < 5 ? "Geliştirici 💻" :
                    stats.completedTotal < 10 ? "Piksel Ustası 🛠️" : "Piksel Şampiyonu 🏆"
                  }
                </p>
              </div>
            </div>
 
            {stats.completedYesterday > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-3 w-full sm:w-auto min-w-[180px] animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/25 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider leading-none">Dünün Başarısı</h4>
                  <p className="text-xs font-bold text-foreground mt-1">{stats.completedYesterday} Görev Bitti!</p>
                </div>
              </div>
            )}
          </div>
        </div>
 
        {/* Orta Bölüm: AI Analiz & Görev Özet Gridi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 my-4 lg:my-8 overflow-y-auto flex-1 min-h-0 pr-1.5 custom-scrollbar">
          
          {/* Sol Kolon (6/12): AI Motivasyon & Bekleyen İşler */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-indigo-500/10 via-primary/5 to-transparent border border-primary/20 rounded-[24px] p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit className="w-24 h-24 text-primary" />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
                  <BrainCircuit className="w-5 h-5" />
                  Yapay Zeka Günlük Raporu
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={fetchAiMotivation}
                  disabled={isAiLoading}
                  className="h-8 w-8 rounded-full hover:bg-primary/10 text-muted-foreground"
                >
                  <RefreshCw className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {isAiLoading ? (
                <div className="space-y-3 py-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-5/6"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                </div>
              ) : (
                <p className="text-foreground/90 leading-relaxed font-medium text-[15px] italic">
                  "{motivation || "Bugün odaklanman gereken tüm hedefler hazır. Harika işler çıkaracağına eminim!"}"
                </p>
              )}

              {/* Akıllı Durum Tavsiyesi */}
              <div className="mt-6 pt-5 border-t border-border/50 flex gap-3 text-xs text-muted-foreground">
                <div className="p-1 bg-amber-500/10 text-amber-500 rounded-lg h-fit">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">Asistan İpucu:</span>
                  {stats.pendingTasks.length > 0 ? (
                    <p className="mt-0.5">Geçmişten sarkan {stats.pendingTasks.length} adet işin bulunuyor. Güne bunları planlayarak başlamak harika bir adım olabilir.</p>
                  ) : stats.todayTasks.length > 0 ? (
                    <p className="mt-0.5">Bugün için öncelikli {stats.todayTasks.length} görevin var. Zamanını verimli yönetmeye odaklan.</p>
                  ) : (
                    <p className="mt-0.5">Bugün listende acil bir görev görünmüyor! Takvim etkinliklerini inceleyip yeni hedefler belirleyebilirsin.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bekleyen İşler (Yatay Kaydırılabilir) */}
            <div className="bg-card/60 border border-border/50 rounded-[24px] p-6 hover:border-indigo-500/20 transition-colors">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-foreground uppercase">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  Bekleyen İşler ({stats.waitingTasks.length})
                </div>
              </div>

              {stats.waitingTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">Aktif bekleyen bir işiniz bulunmuyor.</p>
              ) : (
                <div className="flex gap-3.5 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-indigo-500/25">
                  {stats.waitingTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="min-w-[210px] max-w-[210px] p-4 bg-background/50 border border-border/40 rounded-2xl hover:border-indigo-500/30 transition-all flex flex-col gap-2 shrink-0 snap-start shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' : task.priority === 'low' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {task.priority === 'urgent' ? 'Acil' : task.priority === 'low' ? 'Düşük' : 'Orta'}
                        </span>
                        {task.project && (
                          <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-semibold truncate max-w-[100px]">
                            {task.project.name}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-foreground line-clamp-2 h-8 leading-tight flex-1" title={task.title}>
                        {task.title}
                      </h4>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sağ Kolon (6/12): Bugünün Görevleri, Takvimi ve Günden Kalanlar */}
          <div className="lg:col-span-6 grid grid-cols-1 gap-6">
            
            {/* Bugün Yapılacaklar (Due Today) */}
            <div className="bg-card/60 border border-border/50 rounded-2xl p-5 hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-foreground uppercase">
                  <Clock className="w-4 h-4 text-primary" />
                  Bugün Yapılacaklar ({stats.todayTasks.length})
                </div>
              </div>

              {stats.todayTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">Bugün için son tarihi olan bir görev görünmüyor.</p>
              ) : (
                <div className="space-y-2.5 max-h-40 overflow-y-auto custom-scrollbar">
                  {stats.todayTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2.5 p-2 bg-background/50 border border-border/30 rounded-xl hover:bg-background/80 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'low' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                      <span className="text-xs font-semibold text-foreground line-clamp-1 flex-1">{task.title}</span>
                      {task.project && (
                        <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                          {task.project.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bugünün Takvimi */}
            <div className="bg-card/60 border border-border/50 rounded-2xl p-5 hover:border-indigo-500/20 transition-colors">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-foreground uppercase">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Takvim Etkinlikleri ({stats.todayEvents.length})
                </div>
              </div>

              {stats.todayEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">Bugün için planlanmış bir etkinlik bulunmuyor.</p>
              ) : (
                <div className="space-y-2.5 max-h-40 overflow-y-auto custom-scrollbar">
                  {stats.todayEvents.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-2 bg-background/50 border border-border/30 rounded-xl hover:bg-background/80 transition-colors">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">{event.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-semibold bg-muted px-2 py-0.5 rounded-full shrink-0">
                        <Clock className="w-3 h-3" />
                        {event.startTime || "Tüm Gün"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Günden Sarkanlar (Geçmiş İşler) */}
            {stats.pendingTasks.length > 0 && (
              <div className="bg-card/60 border border-border/50 rounded-2xl p-5 hover:border-rose-500/20 transition-colors">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2 font-bold text-sm tracking-wide text-foreground uppercase">
                    <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                    Geçmişten Kalanlar ({stats.pendingTasks.length})
                  </div>
                </div>

                <div className="space-y-2.5 max-h-40 overflow-y-auto custom-scrollbar">
                  {stats.pendingTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2.5 p-2 bg-background/50 border border-border/30 rounded-xl hover:bg-rose-500/5 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="text-xs font-semibold text-foreground line-clamp-1 flex-1">{task.title}</span>
                      <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full shrink-0">
                        Gecikti
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Alt Aksiyon Buton Paneli */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50 mt-auto">
          <div className="text-xs text-muted-foreground font-medium text-center sm:text-left">
            💡 <span className="font-semibold text-foreground">İpucu:</span> Yapay zeka ile gününü anında planlamak için ana sayfadaki AI Sohbet asistanını kullanabilirsin.
          </div>

          <Button 
            onClick={handleStart}
            size="lg" 
            className="w-full sm:w-auto text-sm h-12 px-8 rounded-full shadow-lg hover:shadow-xl transition-all font-bold gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white"
          >
            <Sparkles className="w-4 h-4" />
            Hazırım, Günü Başlat
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

      </div>
    </div>
  )
}
