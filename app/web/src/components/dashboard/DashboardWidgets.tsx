"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { useProjectStore } from "@/stores/projectStore"
import { useChatStore } from "@/stores/chatStore"
import { useCalendarStore } from "@/stores/calendarStore"
import {
  Play, Pause, RotateCcw, ArrowUpRight, TrendingUp,
  Sparkles, Send, StickyNote, ListPlus, FileText,
  Check, Clock, Target, CalendarDays, CheckCircle2, Circle, Trash2
} from "lucide-react"
import { format, isSameDay, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns"
import { tr } from "date-fns/locale"
import { api } from "@/lib/api"
import { EVENT_COLORS, CalendarEvent } from "@/types/calendar"
import { EventDetailDialog } from "@/components/calendar/CalendarPage"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"

// Firma ikonları — SVG mini logolar
const COMPANY_ICONS: Record<string, React.ReactNode> = {
  default: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 3v18M3 9h18" /></svg>
  ),
  icon1: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" /><line x1="12" y1="2" x2="12" y2="22" /></svg>
  ),
  icon2: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
  ),
  icon3: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
  ),
  icon4: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
  ),
  icon5: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  ),
}

function getCompanyIcon(projectId: number) {
  const icons = ['icon1', 'icon2', 'icon3', 'icon4', 'icon5']
  return COMPANY_ICONS[icons[projectId % icons.length]] || COMPANY_ICONS.default
}

export function DashboardWidgets() {
  // === STORES ===
  const { tasks, openTaskDetail, updateTaskStatus, fetchTasks } = useTaskStore()
  const { projects, setViewMode, setSelectedProjectId, selectedProjectId } = useProjectStore()
  const { user } = useAuthStore()

  // === CLOCK (dakika bazlı güncelleme — CPU tasarrufu) ===
  const [currentTime, setCurrentTime] = React.useState(new Date())
  React.useEffect(() => {
    // İlk güncelleme: bir sonraki dakikanın başına kadar bekle
    const now = new Date()
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
    const initialTimeout = setTimeout(() => {
      setCurrentTime(new Date())
      // Sonra dakikada bir güncelle
    }, msUntilNextMinute)
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => { clearTimeout(initialTimeout); clearInterval(timer) }
  }, [])

  const { events: calendarEvents, deleteEvent, updateEvent } = useCalendarStore()
  const [detailEvent, setDetailEvent] = React.useState<CalendarEvent | null>(null)
  const [isEventDetailOpen, setIsEventDetailOpen] = React.useState(false)

  // === ACTIVE CALENDAR EVENT (dakika bazlı) ===
  const currentMinuteKey = `${currentTime.getFullYear()}-${currentTime.getMonth()}-${currentTime.getDate()}-${currentTime.getHours()}-${currentTime.getMinutes()}`
  const activeCalendarEvent = React.useMemo(() => {
    const now = currentTime
    const todayStr = format(now, 'yyyy-MM-dd')
    const todayEvents = calendarEvents
      .filter(e => e.date === todayStr && e.startTime && e.endTime && !e.allDay)
      .sort((a, b) => a.startTime!.localeCompare(b.startTime!))

    const nowMinutes = now.getHours() * 60 + now.getMinutes()

    const current = todayEvents.find(e => {
      const [sh, sm] = e.startTime!.split(':').map(Number)
      const [eh, em] = e.endTime!.split(':').map(Number)
      const start = sh * 60 + sm
      const end = eh * 60 + em
      return nowMinutes >= start && nowMinutes < end
    })

    return current || null
  }, [calendarEvents, currentMinuteKey])

  const eventProgress = React.useMemo(() => {
    if (!activeCalendarEvent?.startTime || !activeCalendarEvent?.endTime) return null
    const now = currentTime
    const [sh, sm] = activeCalendarEvent.startTime.split(':').map(Number)
    const [eh, em] = activeCalendarEvent.endTime.split(':').map(Number)
    const startMin = sh * 60 + sm
    const endMin = eh * 60 + em
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const totalMin = endMin - startMin
    if (totalMin <= 0) return { elapsedMin: 0, totalMin: 0, percent: 100, isComplete: true }

    const elapsedMin = nowMin - startMin
    const percent = Math.min(Math.max((elapsedMin / totalMin) * 100, 0), 100)
    const isComplete = percent >= 100
    return { elapsedMin, totalMin, percent, isComplete }
  }, [activeCalendarEvent, currentMinuteKey])

  // === WORK TIMER ===
  const [isTimerRunning, setIsTimerRunning] = React.useState(false)
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  const startTimer = () => {
    if (isTimerRunning) return
    setIsTimerRunning(true)
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
    }, 1000)
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const resetTimer = () => {
    pauseTimer()
    setElapsedSeconds(0)
  }

  React.useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const timerProgress = Math.min((elapsedSeconds / 3600) * 283, 283)

  // Break reminder
  React.useEffect(() => {
    if (elapsedSeconds > 0 && elapsedSeconds % 3600 === 0 && isTimerRunning) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('☕ Mola Zamanı!', { body: `${Math.floor(elapsedSeconds / 3600)} saattir çalışıyorsun. Kısa bir mola ver!` })
      }
      try { new Audio('/notification.mp3').play() } catch { }
    }
    if (elapsedSeconds === 1800 && isTimerRunning) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('💪 Harika Gidiyorsun!', { body: '30 dakikadır odaklanıyorsun.' })
      }
    }
  }, [elapsedSeconds, isTimerRunning])

  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // === AI ASSISTANT (Connected to ChatStore) ===
  const { messages: aiMessages, sendMessage: sendAiMessageToStore, isLoading: isAiLoading, inputHint, setInputHint, clearHistory } = useChatStore()
  const [aiInput, setAiInput] = React.useState("")
  const chatEndRef = React.useRef<HTMLDivElement>(null)
  const [isClearing, setIsClearing] = React.useState(false)

  const [isClearHistoryConfirmOpen, setIsClearHistoryConfirmOpen] = React.useState(false)

  const handleClearHistory = async () => {
    setIsClearing(true);
    await clearHistory();
    setIsClearing(false);
  }

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages])

  React.useEffect(() => {
    if (inputHint) {
      let cancelled = false
      queueMicrotask(() => {
        if (cancelled) return
        setAiInput(prev => prev ? `${prev} ${inputHint}` : inputHint)
        setInputHint("")
      })
      return () => {
        cancelled = true
      }
    }
  }, [inputHint, setInputHint])

  const sendAiMessage = async () => {
    if (!aiInput.trim()) return
    const currentInput = aiInput.trim()
    setAiInput("")
    await sendAiMessageToStore(currentInput)
  }

  // === TASK STATS (LIVE) ===
  const mainTasks = tasks.filter(t => !t.parent_task_id)
  const todoTasks = mainTasks.filter(t => t.status === 'todo')
  const doneTasks = mainTasks.filter(t => t.status === 'done')
  const inProgressTasks = mainTasks.filter(t => t.status !== 'done' && t.status !== 'todo')
  const totalTasks = mainTasks.length
  const completionRate = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0

  // === Gelişim chart — Haftalık (Pzt - Paz) ===
  // Gün bazlı key — sadece gün değiştiğinde yeniden hesapla
  const dayKey = `${currentTime.getFullYear()}-${currentTime.getMonth()}-${currentTime.getDate()}`
  const weeklyProgressStats = React.useMemo(() => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    const now = currentTime
    const currentDayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - currentDayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)

    return days.map((dayName, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)
      const isToday = isSameDay(date, now)

      const assignedToDay = mainTasks.filter(t => {
        if (t.due_date && isSameDay(new Date(t.due_date), date)) return true
        if (t.status === 'done' && t.completed_at && isSameDay(new Date(t.completed_at), date)) return true
        return false
      })
      const doneOnDay = assignedToDay.filter(t => t.status === 'done')

      return {
        name: dayName,
        total: assignedToDay.length,
        done: doneOnDay.length,
        isToday
      }
    })
  }, [mainTasks, dayKey])

  const maxWeeklyTasks = Math.max(...weeklyProgressStats.map(s => s.total), 1)

  // === CALENDAR - tasks per day ===
  const calendarDays = React.useMemo(() => {
    const year = currentTime.getFullYear()
    const month = currentTime.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDayOfWeek = (firstDay.getDay() + 6) % 7

    const days: { day: number, isCurrentMonth: boolean, isToday: boolean, tasks: typeof mainTasks }[] = []

    for (let i = 0; i < 42; i++) {
      const d = i - startDayOfWeek + 1
      const isCurrentMonth = d > 0 && d <= lastDay.getDate()
      const isToday = isCurrentMonth && d === currentTime.getDate()

      let dayTasks: typeof mainTasks = []
      if (isCurrentMonth) {
        const dayDate = new Date(year, month, d)
        dayTasks = mainTasks.filter(t => {
          if (!t.due_date) return false
          try {
            const dueDate = new Date(t.due_date)
            return isSameDay(dueDate, dayDate)
          } catch { return false }
        })
      }

      days.push({ day: isCurrentMonth ? d : 0, isCurrentMonth, isToday, tasks: dayTasks })
    }
    return days
  }, [dayKey, mainTasks])

  // Orientation mode
  const [orientationMode, setOrientationMode] = React.useState<'weekly' | 'monthly'>('weekly')

  // Recent tasks
  const recentTasks = React.useMemo(() => {
    return [...mainTasks]
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 6)
  }, [mainTasks])


  // Handle task complete toggle
  const handleToggleTask = async (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    await updateTaskStatus(taskId, newStatus as any)
    await fetchTasks()
  }

  let greeting = "Merhaba"
  const hour = currentTime.getHours()
  greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi öğlenler" : "İyi akşamlar"

  return (
    <div className="flex flex-col w-full gap-3 md:gap-4 lg:h-full lg:overflow-hidden">
      <ConfirmDialog
        isOpen={isClearHistoryConfirmOpen}
        onOpenChange={setIsClearHistoryConfirmOpen}
        title="Sohbet Geçmişini Temizle"
        description="Tüm sohbet geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        onConfirm={handleClearHistory}
      />



      {/* === HEADER STATS === */}
      <div className="dashboard-overview flex flex-col xl:flex-row justify-between items-stretch xl:items-center w-full gap-3 md:gap-4 xl:gap-6 shrink-0 mb-1 md:mb-3">

        {/* SOL */}
        <div className="min-w-0 shrink-0 flex items-center mt-0">
          <h1 className="text-[1.55rem] sm:text-2xl md:text-3xl xl:text-[2.15rem] font-semibold leading-[1.08] text-brand-dark dark:text-white break-words">
            {greeting}{user?.username ? `, ${user.username}` : ''}
          </h1>
        </div>

        {/* ORTA */}
        <div className="grid w-full grid-cols-2 items-end gap-2 sm:grid-cols-[auto_auto_minmax(170px,1fr)] md:gap-3 xl:max-w-[560px] xl:flex-1">
          <div className="min-w-0">
            <p className="text-[11px] md:text-xs text-brand-gray dark:text-gray-400 mb-1 text-center leading-tight">Açık Görevler</p>
            <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-[11px] md:text-xs font-bold text-center leading-none min-w-16">{todoTasks.length + inProgressTasks.length}</div>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] md:text-xs text-brand-gray dark:text-gray-400 mb-1 text-center leading-tight">Tamamlanan</p>
            <div className="bg-brand-yellow text-brand-dark px-3 py-1.5 rounded-full text-[11px] md:text-xs font-bold text-center leading-none min-w-16">{doneTasks.length}</div>
          </div>
          <div className="col-span-2 min-w-0 sm:col-span-1">
            <div className="flex justify-between text-[11px] md:text-xs text-brand-gray dark:text-gray-400 mb-1 leading-tight">
              <span>İlerleme</span>
              <span>Verimlilik</span>
            </div>
            <div className="h-5 w-full bg-muted rounded-full flex overflow-hidden border border-border">
              <div className="bg-brand-yellow h-full flex items-center px-2 text-[11px] font-bold text-brand-dark transition-all leading-none" style={{ width: `${completionRate}%` }}>{completionRate}%</div>
              <div className="h-full flex-grow opacity-20" style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(0,0,0,0.5) 5px, rgba(0,0,0,0.5) 10px)" }}></div>
            </div>
          </div>
        </div>

        {/* SAĞ */}
        <div className="grid w-full grid-cols-4 gap-2 shrink-0 xl:w-auto xl:min-w-[420px] xl:gap-5">
          <div className="min-w-0 text-center xl:text-left">
            <div className="text-[1.7rem] sm:text-3xl lg:text-4xl font-light leading-none text-brand-dark dark:text-white tabular-nums">{todoTasks.length}</div>
            <div className="text-[11px] md:text-xs text-brand-gray dark:text-gray-300 mt-1 leading-tight whitespace-nowrap">Bekleyen</div>
          </div>
          <div className="min-w-0 text-center xl:text-left">
            <div className="text-[1.7rem] sm:text-3xl lg:text-4xl font-light leading-none text-brand-dark dark:text-white tabular-nums">{inProgressTasks.length}</div>
            <div className="text-[11px] md:text-xs text-brand-gray dark:text-gray-300 mt-1 leading-tight whitespace-nowrap">Devam Eden</div>
          </div>
          <div className="min-w-0 text-center xl:text-left">
            <div className="text-[1.7rem] sm:text-3xl lg:text-4xl font-light leading-none text-brand-dark dark:text-white tabular-nums">{doneTasks.length}</div>
            <div className="text-[11px] md:text-xs text-brand-gray dark:text-gray-300 mt-1 leading-tight whitespace-nowrap">Tamamlanan</div>
          </div>
          <div className="min-w-0 text-center xl:text-left">
            <div className="text-[1.7rem] sm:text-3xl lg:text-4xl font-light leading-none text-brand-dark dark:text-white tabular-nums">{projects.length}</div>
            <div className="text-[11px] md:text-xs text-brand-gray dark:text-gray-400 mt-1 leading-tight whitespace-nowrap">Proje</div>
          </div>
        </div>
      </div>

      {/* === MAIN GRID === */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:flex-1 lg:min-h-0 pb-10 lg:pb-0">

        {/* ========= SOL KOLON ========= */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 lg:min-h-0">

          {/* Dijital & Analog Saat */}
          <div className="floating-card rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-row items-center justify-between shrink-0 relative overflow-hidden group min-h-[124px] md:min-h-[140px]">
            <div className="relative z-10 flex flex-col items-start justify-center pl-1 md:pl-2 flex-1 gap-2 md:gap-4">
              <div className="text-[2.45rem] md:text-5xl font-light tracking-tighter text-brand-dark dark:text-white tabular-nums drop-shadow-sm leading-none">
                {format(currentTime, 'HH:mm')}
              </div>
              <div className="text-[10px] text-brand-gray dark:text-gray-400 uppercase tracking-[0.3em] font-bold leading-relaxed">
                {format(currentTime, 'dd MMMM', { locale: tr })}<br />
                {format(currentTime, 'EEEE', { locale: tr })}
              </div>
            </div>
          </div>

          {/* Akıllı Asistan — mobilde gizli, masaüstünde esnek yükseklikte */}
          <div className="hidden lg:flex floating-card rounded-3xl p-6 lg:flex-grow lg:min-h-0 flex-col gap-3 overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-brand-dark" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark dark:text-white text-sm">Akıllı Asistan</h3>
                  <p className="text-[10px] text-brand-gray dark:text-gray-500">Sana nasıl yardımcı olabilirim?</p>
                </div>
              </div>
              <button
                onClick={() => setIsClearHistoryConfirmOpen(true)}
                disabled={isClearing || aiMessages.length === 0}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 dark:bg-slate-900/50 dark:hover:bg-red-500/10 dark:text-slate-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                title="Sohbet Geçmişini Temizle"
              >
                {isClearing ? (
                  <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-red-500 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex-grow flex flex-col gap-2.5 overflow-y-auto scrollbar-hide min-h-0">
              {aiMessages.length === 0 ? (
                <div className="p-3 text-brand-gray/80 dark:text-gray-400 text-xs text-center mt-4">
                  Merhaba {user?.username}! Dijital beynin burada. Sana nasıl yardımcı olabilirim? 🚀
                </div>
              ) : (
                aiMessages.map((msg) => (
                  <div key={msg.id} className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'ai' || msg.role === 'system'
                    ? 'bg-brand-bg dark:bg-slate-900 text-brand-dark dark:text-white/80 border border-white/50 dark:border-white/5'
                    : 'bg-brand-dark dark:bg-indigo-600 text-white ml-6 rounded-br-md'
                    }`}>
                    {msg.role === 'system' ? (
                       <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block whitespace-pre-wrap">{msg.content}</span>
                    ) : (
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    )}
                  </div>
                ))
              )}
              {isAiLoading && (
                <div className="p-3 bg-brand-bg dark:bg-slate-900 rounded-2xl text-xs text-brand-gray flex items-center gap-2 border border-white/50 dark:border-white/5">
                  <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="mt-auto pt-1 shrink-0">
              <div className="relative">
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendAiMessage()}
                  className="w-full bg-brand-bg dark:bg-slate-900 border-none focus:ring-2 focus:ring-brand-yellow/50 rounded-2xl py-3 px-4 pr-12 text-sm placeholder:text-brand-gray/60 text-brand-dark dark:text-white"
                  placeholder="Hızlı Not / Komut..."
                />
                <button onClick={sendAiMessage} className="absolute right-2 top-1.5 w-8 h-8 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-80 transition">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2.5 pb-1">
                <button onClick={() => setAiInput('Not oluştur: ')} className="w-full justify-center whitespace-nowrap bg-card border border-border px-2 py-1.5 rounded-full text-[10px] font-semibold text-brand-gray dark:text-gray-300 hover:bg-brand-yellow/10 transition flex items-center gap-1.5">
                  <StickyNote className="w-3 h-3" /> Not oluştur
                </button>
                <button onClick={() => setAiInput('Görev ekle: ')} className="w-full justify-center whitespace-nowrap bg-card border border-border px-2 py-1.5 rounded-full text-[10px] font-semibold text-brand-gray dark:text-gray-300 hover:bg-brand-yellow/10 transition flex items-center gap-1.5">
                  <ListPlus className="w-3 h-3" /> Görev ekle
                </button>
                <button onClick={() => setAiInput('Günümü planla: ')} className="w-full justify-center whitespace-nowrap bg-card border border-border px-2 py-1.5 rounded-full text-[10px] font-semibold text-brand-gray dark:text-gray-300 hover:bg-brand-yellow/10 transition flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Günümü planla
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========= ORTA KOLON ========= */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4 lg:min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">

            {/* Gelişim Chart */}
            <div className="floating-card rounded-3xl p-5 flex flex-col relative overflow-hidden min-h-[220px]">
              <button className="absolute top-5 right-5 w-8 h-8 bg-brand-bg dark:bg-slate-900 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 transition shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 text-brand-gray dark:text-gray-400" />
              </button>
              <h3 className="text-base font-semibold mb-1 text-brand-dark dark:text-white shrink-0">Gelişim</h3>
              <div className="flex items-end space-x-2 mb-3 shrink-0">
                <span className="text-2xl font-light text-brand-dark dark:text-white">{doneTasks.length}</span>
                <span className="text-[10px] text-brand-gray dark:text-gray-400 leading-tight pb-0.5">Tamamlanan<br />Görev</span>
              </div>
              <div className="flex-1 flex items-end justify-between px-1 min-h-0">
                {weeklyProgressStats.map((ps, i) => {
                  const totalH = ps.total > 0 ? Math.max((ps.total / maxWeeklyTasks) * 100, 10) : 10
                  const doneH = ps.total > 0 ? (ps.done / ps.total) * totalH : 0
                  const isHighlighted = ps.done > 0 && ps.done === ps.total
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 group relative">
                      {ps.total > 0 && (
                        <div className={`absolute -top-4 text-[8px] font-bold px-1 py-0.5 rounded-full whitespace-nowrap z-10 ${isHighlighted ? 'bg-brand-yellow text-brand-dark' : 'bg-slate-100 dark:bg-slate-700 text-brand-gray dark:text-gray-400'}`}>
                          {ps.done}/{ps.total}
                        </div>
                      )}
                      <div className="w-2 rounded-full bg-slate-200 dark:bg-slate-700 relative" style={{ height: `${totalH}px` }}>
                        <div className={`absolute bottom-0 w-full rounded-full transition-all duration-500 ${isHighlighted ? 'bg-brand-yellow' : 'bg-primary'}`} style={{ height: `${doneH}px` }} />
                      </div>
                      <span className={`text-[8px] uppercase font-bold transition-colors ${ps.isToday ? 'bg-brand-yellow text-brand-dark px-1 py-0.5 rounded' : ps.total > 0 ? 'text-brand-dark dark:text-white' : 'text-brand-gray/40'}`}>
                        {ps.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Çalışma Sayacı & Aktif Etkinlik */}
            <div className="floating-card rounded-3xl p-5 flex flex-col 2xl:flex-row relative overflow-hidden gap-4 min-h-[220px]">
              <div className="w-full 2xl:w-[50%] flex flex-col items-center justify-between 2xl:border-r border-b 2xl:border-b-0 border-slate-100 dark:border-white/5 pb-4 2xl:pb-0 2xl:pr-4 relative gap-3">
                <h3 className="text-[10px] font-bold text-brand-dark dark:text-white self-start uppercase tracking-widest">Çalışma Sayacı</h3>
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeDasharray="2 4" strokeWidth="4" />
                    <circle className="transition-all duration-500 text-brand-yellow" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeDasharray="283" strokeDashoffset={283 - timerProgress} strokeWidth="8" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-base font-light text-brand-dark dark:text-white tabular-nums leading-none tracking-tight">{formatTimer(elapsedSeconds)}</span>
                    <span className="text-[8px] text-brand-gray dark:text-gray-400 uppercase tracking-wider font-bold mt-1">
                      {isTimerRunning ? 'Çalışıyor' : elapsedSeconds > 0 ? 'Durakladı' : 'Hazır'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!isTimerRunning ? (
                    <button onClick={startTimer} className="w-8 h-8 bg-emerald-500 shadow-sm rounded-full flex items-center justify-center hover:bg-emerald-600 transition shrink-0">
                      <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                    </button>
                  ) : (
                    <button onClick={pauseTimer} className="w-8 h-8 bg-amber-500 shadow-sm rounded-full flex items-center justify-center hover:bg-amber-600 transition shrink-0">
                      <Pause className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                  <button onClick={resetTimer} className="w-8 h-8 bg-card shadow-sm border border-border rounded-full flex items-center justify-center hover:bg-muted transition shrink-0">
                    <RotateCcw className="w-3.5 h-3.5 text-brand-dark dark:text-white" />
                  </button>
                </div>
                {elapsedSeconds >= 3600 && <div className="absolute top-0 right-3 text-[8px] font-bold text-amber-500">⚠️ {Math.floor(elapsedSeconds / 3600)}s!</div>}
              </div>
              <div className="w-full 2xl:w-[50%] flex flex-col 2xl:pl-4 justify-center relative min-w-0">
                {activeCalendarEvent && eventProgress ? (
                  <div className="flex flex-col flex-1 justify-center lg:min-h-0">
                    <div className="flex items-center gap-1.5 mb-2 shrink-0">
                      <CalendarDays className="w-3 h-3 text-brand-yellow shrink-0" />
                      <span className="text-[9px] font-bold text-brand-gray dark:text-gray-400 uppercase tracking-wider truncate">Şu Anki Etkinlik</span>
                    </div>
                    <div
                      onClick={() => { setDetailEvent(activeCalendarEvent); setIsEventDetailOpen(true); }}
                      className="p-2.5 rounded-xl border shadow-sm transition-all flex flex-col bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30 cursor-pointer hover:shadow-md group"
                    >
                      <h4 className="text-xs font-bold leading-snug line-clamp-2 text-brand-dark dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" title={activeCalendarEvent.title}>
                        {activeCalendarEvent.title}
                      </h4>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                        <span className="text-[9px] font-semibold whitespace-nowrap text-brand-gray/80 dark:text-gray-400">
                          <Clock className="w-2.5 h-2.5 inline mr-0.5 mb-0.5" />
                          {activeCalendarEvent.startTime} – {activeCalendarEvent.endTime}
                        </span>
                        {eventProgress.isComplete ? (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1 py-0.5 rounded flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Bitti
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-brand-gray/80 dark:text-gray-400">⏱ {Math.max(eventProgress.elapsedMin, 0)} dk</span>
                        )}
                      </div>
                      {!eventProgress.isComplete && (
                        <div className="flex gap-0.5 mt-2 w-full">
                          {Array(10).fill(0).map((_, i) => (
                            <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-1000 ${eventProgress.percent >= (i + 1) * 10 ? 'bg-amber-400 dark:bg-amber-600' : 'bg-black/10 dark:bg-white/10'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-60 px-2">
                    <CalendarDays className="w-6 h-6 text-brand-gray/50 dark:text-gray-600 mb-2 shrink-0" />
                    <p className="text-[10px] text-brand-gray dark:text-gray-400 font-medium">Şu an aktif etkinlik yok.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Takvim */}
          <div className="floating-card rounded-3xl p-5 flex flex-col relative overflow-hidden lg:flex-grow lg:min-h-0 min-h-[320px]">
            <div className="flex justify-between items-center mb-3 shrink-0">
              <h3 className="text-sm font-semibold text-brand-dark dark:text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand-yellow" />
                {format(currentTime, 'MMMM yyyy', { locale: tr })}
              </h3>
              <button onClick={() => setViewMode('calendar')} className="px-3 py-1 rounded-full text-[10px] font-bold text-brand-yellow bg-brand-yellow/10 hover:bg-brand-yellow/20 transition">
                Takvime Git →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1 shrink-0">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                <div key={d} className="text-center text-[9px] font-bold uppercase text-brand-gray dark:text-gray-500 pb-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 gap-1 flex-1 min-h-0">
              {calendarDays.map((cd, i) => {
                const hasTasks = cd.tasks.length > 0;
                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (hasTasks) {
                        openTaskDetail(cd.tasks[0]);
                      }
                    }}
                    className={`relative group rounded-lg p-1 text-center transition-all flex flex-col justify-between h-full min-h-[36px] cursor-pointer ${
                      cd.isToday
                        ? 'bg-brand-yellow/20 ring-1 ring-brand-yellow/50'
                        : cd.isCurrentMonth
                        ? 'hover:bg-slate-100 dark:hover:bg-slate-700/40 bg-slate-50/30 dark:bg-slate-800/10'
                        : 'opacity-40 pointer-events-none'
                    }`}
                  >
                    {/* Gün Numarası */}
                    <div className={`text-[10px] font-bold leading-none py-0.5 ${
                      cd.isToday
                        ? 'text-brand-yellow font-black'
                        : cd.isCurrentMonth
                        ? 'text-brand-dark dark:text-gray-300'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}>
                      {cd.isCurrentMonth ? cd.day : ''}
                    </div>

                    {/* Görev Göstergeleri (Renkli Noktalar) */}
                    {cd.isCurrentMonth && hasTasks && (
                      <div className="flex gap-0.5 justify-center items-center mt-auto pb-0.5">
                        {cd.tasks.slice(0, 3).map(task => {
                          const project = task.project || projects.find(p => p.id === task.project_id);
                          return (
                            <span
                              key={task.id}
                              className="w-1.5 h-1.5 rounded-full ring-[1px] ring-white dark:ring-slate-900 transition-transform group-hover:scale-125"
                              style={{ backgroundColor: project?.color || '#cbd5e1' }}
                              title={task.title}
                            />
                          );
                        })}
                        {cd.tasks.length > 3 && (
                          <span className="text-[6px] font-black text-brand-gray dark:text-gray-400 leading-none pl-0.5">
                            +{cd.tasks.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Popover / Tooltip (Hover durumunda açılır) */}
                    {cd.isCurrentMonth && hasTasks && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-popover/95 backdrop-blur-md border border-border rounded-2xl p-3 shadow-xl hidden group-hover:flex flex-col gap-2 z-50 pointer-events-auto text-left animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-gray-500 border-b border-slate-100 dark:border-slate-800/60 pb-1.5 mb-1 flex justify-between items-center">
                          <span>{cd.day} {format(currentTime, 'MMMM yyyy', { locale: tr })}</span>
                          <span className="bg-brand-yellow/10 text-brand-yellow px-1.5 py-0.5 rounded-full text-[8px] font-black">{cd.tasks.length} Görev</span>
                        </div>
                        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto scrollbar-hide">
                          {cd.tasks.map(task => {
                            const project = task.project || projects.find(p => p.id === task.project_id);
                            return (
                              <button
                                key={task.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openTaskDetail(task);
                                }}
                                className="w-full text-left p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl text-[10px] font-medium transition-colors flex items-start gap-2 group/item"
                              >
                                <span className="w-2 h-2 rounded-full mt-1 shrink-0 ring-[1px] ring-white dark:ring-slate-900" style={{ backgroundColor: project?.color || '#cbd5e1' }} />
                                <div className="flex-1 min-w-0">
                                  <span className={`block truncate ${task.status === 'done' ? 'line-through text-slate-400/70' : 'text-slate-700 dark:text-gray-200 group-hover/item:text-brand-yellow font-semibold'}`}>
                                    {task.title}
                                  </span>
                                  {project && (
                                    <span className="text-[8px] text-slate-400 dark:text-slate-500 block truncate font-medium">
                                      {project.name}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========= SAG KOLON ========= */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 lg:min-h-0">

          {/* Durum Paneli */}
          <div className="floating-card rounded-3xl p-6 shrink-0 flex flex-col relative overflow-hidden min-h-[260px]">
            <div className="flex justify-between items-center shrink-0 mb-4">
              <h3 className="text-base font-semibold text-brand-dark dark:text-white">Durum Paneli</h3>
              <div className="flex bg-muted p-1 rounded-full">
                <button onClick={() => setOrientationMode('weekly')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition ${orientationMode === 'weekly' ? 'bg-card shadow-sm text-foreground' : 'text-brand-gray'}`}>
                  Haftalık
                </button>
                <button onClick={() => setOrientationMode('monthly')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition ${orientationMode === 'monthly' ? 'bg-card shadow-sm text-foreground' : 'text-brand-gray'}`}>
                  Aylık
                </button>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between min-h-0">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs text-brand-gray dark:text-gray-400 font-medium">Genel İlerleme</span>
                  <span className="text-2xl font-light text-brand-dark dark:text-white leading-none">{completionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-brand-yellow h-full rounded-full transition-all duration-700" style={{ width: `${completionRate}%` }} />
                </div>
                <div className="flex gap-1">
                  {Array(8).fill(0).map((_, i) => (
                    <div key={i} className={`h-1 flex-grow rounded-full transition-colors ${i < Math.ceil(completionRate / 12.5) ? 'bg-primary' : 'bg-muted'}`} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 shrink-0">
                <div className="bg-muted rounded-2xl p-3 flex flex-col items-center justify-center">
                  <div className="text-xl font-light text-brand-dark dark:text-white leading-none mb-1">{todoTasks.length}</div>
                  <div className="text-[8px] font-bold text-brand-gray dark:text-gray-500 uppercase tracking-wider">Bekleyen</div>
                </div>
                <div className="bg-muted rounded-2xl p-3 flex flex-col items-center justify-center">
                  <div className="text-xl font-light text-brand-dark dark:text-white leading-none mb-1">{inProgressTasks.length}</div>
                  <div className="text-[8px] font-bold text-brand-gray dark:text-gray-500 uppercase tracking-wider">Aktif</div>
                </div>
                <div className="bg-muted rounded-2xl p-3 flex flex-col items-center justify-center">
                  <div className="text-xl font-light text-brand-dark dark:text-white leading-none mb-1">{doneTasks.length}</div>
                  <div className="text-[8px] font-bold text-brand-gray dark:text-gray-500 uppercase tracking-wider">Biten</div>
                </div>
              </div>
            </div>
          </div>

          {/* Görevler */}
          <div className="floating-card rounded-3xl p-6 flex flex-col relative overflow-hidden lg:flex-grow lg:min-h-0 min-h-[300px]">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-brand-yellow/5 dark:bg-white/5 blur-xl rounded-full" />
            <div className="flex justify-between items-center mb-4 relative z-10 shrink-0">
              <h3 className="text-sm font-semibold text-brand-dark dark:text-white">Görevler</h3>
              <span className="text-2xl font-light text-brand-dark dark:text-white leading-none">{doneTasks.length}<span className="text-sm text-brand-gray dark:text-gray-400 ml-1">/{totalTasks}</span></span>
            </div>
            <div className="space-y-2 relative z-10 lg:flex-grow overflow-y-auto scrollbar-hide pr-1 lg:min-h-0">
              {recentTasks.map((task) => {
                const project = task.project || projects.find(p => p.id === task.project_id)
                return (
                  <div key={task.id} className="flex items-center justify-between group cursor-pointer bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/60 p-2.5 rounded-2xl transition-colors">
                    <div className="flex items-center space-x-3 min-w-0 flex-1" onClick={() => openTaskDetail(task)}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 p-1.5 ${!project?.color && 'bg-slate-200 dark:bg-slate-600'}`}
                        style={project?.color ? { backgroundColor: `${project.color}20`, color: project.color } : {}}
                      >
                        {project ? getCompanyIcon(project.id) : <Circle className="w-4 h-4 text-brand-gray dark:text-gray-300" />}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-medium truncate ${task.status === 'done' ? 'text-brand-gray/50 dark:text-gray-400 line-through' : 'text-brand-dark dark:text-white group-hover:text-brand-yellow'} transition-colors`}>
                          {task.title}
                        </div>
                        <div className="text-[9px] font-semibold flex items-center gap-1.5 mt-0.5">
                          {project ? (
                            <span style={{ color: project.color || '#888' }}>{project.name}</span>
                          ) : (
                            <span className="text-brand-gray dark:text-gray-400">Genel</span>
                          )}
                          {task.due_date && (
                            <span className="text-brand-gray dark:text-gray-400">· {format(new Date(task.due_date), 'dd MMM', { locale: tr })}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleTask(task.id, task.status) }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-110 ml-2 ${task.status === 'done'
                        ? 'bg-brand-yellow border-brand-yellow'
                        : 'border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800 hover:border-brand-yellow hover:bg-brand-yellow/20'
                        }`}
                    >
                      {task.status === 'done' && <Check className="w-3 h-3 text-brand-dark" strokeWidth={3} />}
                    </button>
                  </div>
                )
              })}
              {recentTasks.length === 0 && (
                <p className="text-xs text-brand-gray dark:text-gray-400 text-center py-4">Henüz görev yok</p>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 shrink-0 relative z-10">
              <button onClick={() => setViewMode('all_tasks')} className="w-full py-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl text-xs font-semibold text-brand-dark dark:text-white hover:bg-brand-yellow hover:text-brand-dark transition-colors text-center">
                Tüm Görevleri Gör
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {isEventDetailOpen && (
        <EventDetailDialog
          event={detailEvent}
          open={isEventDetailOpen}
          onClose={() => { setIsEventDetailOpen(false); setDetailEvent(null); }}
          onDelete={(id) => { deleteEvent(id); setIsEventDetailOpen(false); setDetailEvent(null); }}
          onUpdate={(id, data) => { updateEvent(id, data); setDetailEvent(prev => prev ? { ...prev, ...data } : null); }}
        />
      )}
    </div>
  )
}
