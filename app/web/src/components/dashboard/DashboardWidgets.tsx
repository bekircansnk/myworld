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
  const { projects, setViewMode, setSelectedProjectId } = useProjectStore()
  const { user } = useAuthStore()

  // === CLOCK ===
  const [currentTime, setCurrentTime] = React.useState(new Date())
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const { events: calendarEvents, deleteEvent, updateEvent } = useCalendarStore()
  const [detailEvent, setDetailEvent] = React.useState<CalendarEvent | null>(null)
  const [isEventDetailOpen, setIsEventDetailOpen] = React.useState(false)

  // === ACTIVE CALENDAR EVENT ===
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
  }, [calendarEvents, currentTime])

  const eventProgress = React.useMemo(() => {
    if (!activeCalendarEvent?.startTime || !activeCalendarEvent?.endTime) return null
    const now = currentTime
    const [sh, sm] = activeCalendarEvent.startTime.split(':').map(Number)
    const [eh, em] = activeCalendarEvent.endTime.split(':').map(Number)
    const startMin = sh * 60 + sm
    const endMin = eh * 60 + em
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const totalMin = endMin - startMin
    // Handle edge case where totalMin could be 0
    if (totalMin <= 0) return { elapsedMin: 0, totalMin: 0, percent: 100, isComplete: true }
    
    const elapsedMin = nowMin - startMin
    const percent = Math.min(Math.max((elapsedMin / totalMin) * 100, 0), 100)
    const isComplete = percent >= 100
    return { elapsedMin, totalMin, percent, isComplete }
  }, [activeCalendarEvent, currentTime])

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
      setAiInput(prev => prev ? `${prev} ${inputHint}` : inputHint)
      setInputHint("")
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
  const inProgressTasks = mainTasks.filter(t => t.status === 'in_progress')
  const doneTasks = mainTasks.filter(t => t.status === 'done')
  const totalTasks = mainTasks.length
  const completionRate = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0

  // === Gelişim chart — Haftalık (Pzt - Paz) ===
  const weeklyProgressStats = React.useMemo(() => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    const now = currentTime
    const currentDayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // 0 for Monday, 6 for Sunday
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
  }, [mainTasks, currentTime])

  const maxWeeklyTasks = Math.max(...weeklyProgressStats.map(s => s.total), 1)

  // === CALENDAR - tasks per day ===
  const calendarDays = React.useMemo(() => {
    const year = currentTime.getFullYear()
    const month = currentTime.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDayOfWeek = (firstDay.getDay() + 6) % 7 // Monday=0

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
  }, [currentTime, mainTasks])

  // Orientation mode
  const [orientationMode, setOrientationMode] = React.useState<'weekly' | 'monthly'>('weekly')

  // Recent tasks
  const recentTasks = React.useMemo(() => {
    return [...mainTasks]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden gap-4">
      <ConfirmDialog 
        isOpen={isClearHistoryConfirmOpen} 
        onOpenChange={setIsClearHistoryConfirmOpen}
        title="Sohbet Geçmişini Temizle"
        description="Tüm sohbet geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        onConfirm={handleClearHistory}
      />

      {/* === HEADER STATS === */}
      <div className="flex flex-col xl:flex-row justify-between items-center w-full gap-6 shrink-0 mb-4">
        
        {/* SOL */}
        <div className="shrink-0 flex items-center mt-2 xl:mt-0">
          <h1 className="text-4xl md:text-5xl font-semibold text-brand-dark dark:text-white">{greeting}{user?.username ? `, ${user.username}` : ''}</h1>
        </div>

        {/* ORTA */}
        <div className="flex flex-wrap gap-4 items-end flex-1 xl:justify-center">
          <div>
            <p className="text-sm text-brand-gray dark:text-gray-400 mb-1 text-center">Açık Görevler</p>
            <div className="bg-brand-dark dark:bg-white text-white dark:text-brand-dark px-4 py-1.5 rounded-full text-xs font-bold text-center">{todoTasks.length + inProgressTasks.length}</div>
          </div>
          <div>
            <p className="text-sm text-brand-gray dark:text-gray-400 mb-1 text-center">Tamamlanan</p>
            <div className="bg-brand-yellow text-brand-dark px-4 py-1.5 rounded-full text-xs font-bold text-center">{doneTasks.length}</div>
          </div>
          <div className="flex-grow min-w-[200px] max-w-[300px]">
            <div className="flex justify-between text-sm text-brand-gray dark:text-gray-400 mb-1">
              <span>İlerleme</span>
              <span>Verimlilik</span>
            </div>
            <div className="h-6 w-full bg-white/50 dark:bg-white/5 rounded-full flex overflow-hidden border border-white dark:border-white/8">
              <div className="bg-brand-yellow h-full flex items-center px-3 text-xs font-bold text-brand-dark transition-all" style={{ width: `${completionRate}%` }}>{completionRate}%</div>
              <div className="h-full flex-grow opacity-20" style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(0,0,0,0.5) 5px, rgba(0,0,0,0.5) 10px)" }}></div>
            </div>
          </div>
        </div>

        {/* SAĞ */}
        <div className="flex gap-6 lg:gap-8 shrink-0">
          <div>
            <div className="text-4xl md:text-5xl font-light leading-none text-brand-dark dark:text-white">{todoTasks.length}</div>
            <div className="text-sm text-brand-gray dark:text-gray-300 mt-1">Bekleyen</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-light leading-none text-brand-dark dark:text-white">{inProgressTasks.length}</div>
            <div className="text-sm text-brand-gray dark:text-gray-300 mt-1">Devam Eden</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-light leading-none text-brand-dark dark:text-white">{doneTasks.length}</div>
            <div className="text-sm text-brand-gray dark:text-gray-300 mt-1">Tamamlanan</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-light leading-none text-brand-dark dark:text-white">{projects.length}</div>
            <div className="text-sm text-brand-gray dark:text-gray-400 mt-1">Proje</div>
          </div>
        </div>
      </div>

      {/* === MAIN GRID === */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">

        {/* ========= SOL KOLON ========= */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0">
          {/* Dijital Saat */}
          <div className="floating-card rounded-2xl p-8 flex flex-col items-center justify-center h-44 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Clock className="w-16 h-16" />
            </div>
            <div className="text-5xl font-light tracking-tight text-brand-dark dark:text-white mb-1 tabular-nums">
              {format(currentTime, 'HH:mm')}
            </div>
            <div className="text-sm text-brand-gray dark:text-gray-400 uppercase tracking-[0.2em] font-medium">
              {format(currentTime, 'dd MMMM EEEE', { locale: tr })}
            </div>
          </div>

          {/* Akıllı Asistan */}
          <div className="floating-card rounded-2xl p-6 flex-grow flex flex-col gap-3 overflow-hidden min-h-[300px]">
            <div className="flex items-center justify-between">
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
                <button onClick={sendAiMessage} className="absolute right-2 top-1.5 w-8 h-8 bg-brand-dark dark:bg-white text-white dark:text-brand-dark rounded-xl flex items-center justify-center hover:opacity-80 transition">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2.5 pb-1">
                <button onClick={() => setAiInput('Not oluştur: ')} className="w-full justify-center whitespace-nowrap bg-white dark:bg-slate-700 border border-gray-100 dark:border-white/10 px-2 py-1.5 rounded-full text-[10px] font-semibold text-brand-gray dark:text-gray-300 hover:bg-brand-yellow/10 transition flex items-center gap-1.5">
                  <StickyNote className="w-3 h-3" /> Not oluştur
                </button>
                <button onClick={() => setAiInput('Görev ekle: ')} className="w-full justify-center whitespace-nowrap bg-white dark:bg-slate-700 border border-gray-100 dark:border-white/10 px-2 py-1.5 rounded-full text-[10px] font-semibold text-brand-gray dark:text-gray-300 hover:bg-brand-yellow/10 transition flex items-center gap-1.5">
                  <ListPlus className="w-3 h-3" /> Görev ekle
                </button>
                <button onClick={() => setAiInput('Günümü planla: ')} className="w-full justify-center whitespace-nowrap bg-white dark:bg-slate-700 border border-gray-100 dark:border-white/10 px-2 py-1.5 rounded-full text-[10px] font-semibold text-brand-gray dark:text-gray-300 hover:bg-brand-yellow/10 transition flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Günümü planla
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========= ORTA KOLON ========= */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0" style={{ maxHeight: '45%' }}>

            {/* Gelişim Chart — SABİT, proje bazlı */}
            <div className="floating-card rounded-2xl p-6 relative">
              <button className="absolute top-6 right-6 w-8 h-8 bg-brand-bg dark:bg-slate-900 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                <ArrowUpRight className="w-3.5 h-3.5 text-brand-gray dark:text-gray-400" />
              </button>
              <h3 className="text-xl font-semibold mb-1 text-brand-dark dark:text-white">Gelişim</h3>
              <div className="flex items-end space-x-2 mb-6">
                <span className="text-3xl font-light text-brand-dark dark:text-white">{doneTasks.length}</span>
                <span className="text-[11px] text-brand-gray dark:text-gray-400 leading-tight pb-1">Tamamlanan<br />Görev</span>
              </div>
              <div className="flex justify-between items-end h-24 px-1">
                {weeklyProgressStats.map((ps, i) => {
                  const totalH = ps.total > 0 ? Math.max((ps.total / maxWeeklyTasks) * 80, 8) : 8
                  const doneH = ps.total > 0 ? (ps.done / ps.total) * totalH : 0
                  const isHighlighted = ps.done > 0 && ps.done === ps.total
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5 group relative">
                      {ps.total > 0 && (
                        <div className={`absolute -top-5 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap z-10 transition-opacity ${isHighlighted ? 'bg-brand-yellow text-brand-dark' : 'bg-slate-100 dark:bg-slate-700 text-brand-gray dark:text-gray-400'}`}>
                          {ps.done}/{ps.total}
                        </div>
                      )}
                      <div className="w-2 rounded-full bg-slate-200 dark:bg-slate-700 relative" style={{ height: `${totalH}px` }}>
                        <div className={`absolute bottom-0 w-full rounded-full transition-all duration-500 ${isHighlighted ? 'bg-brand-yellow' : 'bg-brand-dark dark:bg-white'}`} style={{ height: `${doneH}px` }} />
                      </div>
                      <span className={`text-[9px] uppercase font-bold transition-colors ${ps.isToday ? 'bg-brand-yellow text-brand-dark px-1.5 py-0.5 rounded-md' : ps.total > 0 ? 'text-brand-dark dark:text-white' : 'text-brand-gray/40'}`}>
                        {ps.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Çalışma Sayacı & Aktif Etkinlik */}
            <div className="floating-card rounded-2xl p-5 relative flex flex-row h-[230px]">
              
              {/* Sol Taraf: Çalışma Sayacı */}
              <div className="w-[50%] flex flex-col items-center justify-between border-r border-slate-100 dark:border-white/5 pr-4 relative">
                 <h3 className="text-sm font-semibold text-brand-dark dark:text-white self-start w-full whitespace-nowrap overflow-hidden text-ellipsis mb-2">Çalışma Sayacı</h3>
                 <div className="relative w-28 h-28 flex items-center justify-center my-auto">
                   <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeDasharray="2 4" strokeWidth="4" />
                     <circle className="transition-all duration-500 text-brand-yellow" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeDasharray="283" strokeDashoffset={283 - timerProgress} strokeWidth="8" strokeLinecap="round" />
                   </svg>
                   <div className="absolute flex flex-col items-center mt-1">
                     <span className="text-xl font-light text-brand-dark dark:text-white tabular-nums leading-none tracking-tight">{formatTimer(elapsedSeconds)}</span>
                     <span className="text-[9px] text-brand-gray dark:text-gray-400 uppercase tracking-wider font-bold mt-1.5">
                       {isTimerRunning ? 'Çalışıyor' : elapsedSeconds > 0 ? 'Durakladı' : 'Hazır'}
                     </span>
                   </div>
                 </div>
                 
                 <div className="flex space-x-2 mt-2">
                   {!isTimerRunning ? (
                     <button onClick={startTimer} className="w-9 h-9 bg-emerald-500 shadow-sm rounded-full flex items-center justify-center hover:bg-emerald-600 transition group shrink-0">
                       <Play className="w-4 h-4 text-white ml-0.5" />
                     </button>
                   ) : (
                     <button onClick={pauseTimer} className="w-9 h-9 bg-amber-500 shadow-sm rounded-full flex items-center justify-center hover:bg-amber-600 transition shrink-0">
                       <Pause className="w-4 h-4 text-white" />
                     </button>
                   )}
                   <button onClick={resetTimer} className="w-9 h-9 bg-white dark:bg-slate-700 shadow-sm border border-gray-100 dark:border-white/10 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-600 transition shrink-0">
                     <RotateCcw className="w-4 h-4 text-brand-dark dark:text-white" />
                   </button>
                 </div>
                 {elapsedSeconds >= 3600 && <div className="absolute top-0 right-4 text-[9px] font-bold text-amber-500">⚠️ {Math.floor(elapsedSeconds / 3600)}s!</div>}
              </div>

              {/* Sağ Taraf: Takvim Etkinliği */}
              <div className="w-[50%] flex flex-col pl-4 justify-center relative min-w-0">
                 {activeCalendarEvent && eventProgress ? (
                   <div className="flex flex-col flex-1 justify-center min-h-0">
                     <div className="flex items-center gap-1.5 mb-2 shrink-0">
                       <CalendarDays className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                       <span className="text-[10px] font-bold text-brand-gray dark:text-gray-400 uppercase tracking-wider truncate">Şu Anki Etkinlik</span>
                     </div>
                     <div 
                        onClick={() => { setDetailEvent(activeCalendarEvent); setIsEventDetailOpen(true); }}
                        className="p-3 rounded-xl border relative shadow-sm transition-all flex flex-col min-h-0 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30 cursor-pointer hover:shadow-md hover:border-amber-200 dark:hover:border-amber-700/50 group"
                     >
                       
                       <h4 className="text-xs font-bold leading-snug line-clamp-2 text-brand-dark dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" title={activeCalendarEvent.title}>
                          {activeCalendarEvent.title}
                       </h4>
                       
                       <div className="flex items-center justify-between mt-3 shrink-0 pt-2 border-t border-black/5 dark:border-white/5">
                         <span className="text-[10px] font-semibold whitespace-nowrap text-brand-gray/80 dark:text-gray-400">
                           <Clock className="w-3 h-3 inline mr-1 mb-0.5" />
                           {activeCalendarEvent.startTime} – {activeCalendarEvent.endTime}
                         </span>
                         {eventProgress.isComplete ? (
                           <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded flex items-center gap-1 whitespace-nowrap">
                             <CheckCircle2 className="w-3 h-3" /> Bitti
                           </span>
                         ) : (
                           <span className="text-[10px] font-bold whitespace-nowrap text-brand-gray/80 dark:text-gray-400">
                             ⏱ {Math.max(eventProgress.elapsedMin, 0)} dk
                           </span>
                         )}
                       </div>
                       
                       {/* Progress Dots */}
                       {!eventProgress.isComplete && (
                         <div className="flex gap-1 mt-2.5 w-full justify-between items-center bg-white/50 dark:bg-black/20 p-1.5 rounded-lg border border-black/5 dark:border-white/5 shrink-0">
                           {Array(10).fill(0).map((_, i) => {
                             const threshold = (i + 1) * 10;
                             const isFilled = eventProgress.percent >= threshold;
                             
                             return (
                               <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-1000 ${isFilled ? 'bg-amber-400 dark:bg-amber-600' : 'bg-black/10 dark:bg-white/10'}`} />
                             )
                           })}
                         </div>
                       )}

                     </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full text-center opacity-60 px-2 min-h-0">
                     <CalendarDays className="w-7 h-7 text-brand-gray/50 dark:text-gray-600 mb-2 shrink-0" />
                     <p className="text-[11px] text-brand-gray dark:text-gray-400 font-medium line-clamp-2">Şu an aktif etkinlik yok.</p>
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Takvim — Görevler gösterimli */}
          <div className="floating-card rounded-2xl p-6 flex-grow relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-brand-dark dark:text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-brand-yellow" />
                {format(currentTime, 'MMMM yyyy', { locale: tr })}
              </h3>
              <button onClick={() => setViewMode('calendar')} className="px-4 py-1.5 rounded-full text-xs font-bold text-brand-yellow bg-brand-yellow/10 hover:bg-brand-yellow/20 transition">
                Takvime Git →
              </button>
            </div>

            {/* Gün isimleri */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold uppercase text-brand-gray dark:text-gray-500 pb-1">{d}</div>
              ))}
            </div>

            {/* Takvim grid — görev detaylı */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cd, i) => (
                <div
                  key={i}
                  className={`min-h-[60px] rounded-xl p-1 text-center transition-colors ${cd.isToday ? 'bg-brand-yellow/20 ring-2 ring-brand-yellow/50' :
                    cd.isCurrentMonth ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50' : ''
                    }`}
                >
                  <div className={`text-xs font-medium mb-0.5 ${cd.isToday ? 'text-brand-dark dark:text-white font-bold' :
                    cd.isCurrentMonth ? 'text-brand-dark dark:text-white' :
                      'text-slate-300 dark:text-slate-600'
                    }`}>
                    {cd.isCurrentMonth ? cd.day : ''}
                  </div>
                  {/* Görevler */}
                  {cd.tasks.slice(0, 2).map(task => (
                    <button
                      key={task.id}
                      onClick={(e) => { e.stopPropagation(); openTaskDetail(task); }}
                      className="w-full text-left px-1 py-0.5 rounded text-[8px] font-semibold leading-tight truncate block hover:opacity-80 transition"
                      style={{
                        backgroundColor: task.project?.color ? `${task.project.color}25` : '#f0f0f0',
                        color: task.project?.color || '#333',
                      }}
                      title={task.title}
                    >
                      {task.title.length > 10 ? task.title.substring(0, 10) + '…' : task.title}
                    </button>
                  ))}
                  {cd.tasks.length > 2 && (
                    <div className="text-[8px] font-bold text-brand-gray dark:text-gray-500 mt-0.5">
                      +{cd.tasks.length - 2}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========= SAĞ KOLON ========= */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0">

          {/* Durum Paneli (eski Oryantasyon) */}
          <div className="floating-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-brand-dark dark:text-white">Durum Paneli</h3>
              <div className="flex bg-brand-bg dark:bg-slate-900 p-1 rounded-full">
                <button onClick={() => setOrientationMode('weekly')} className={`px-4 py-1 rounded-full text-[10px] font-bold transition ${orientationMode === 'weekly' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-dark dark:text-white' : 'text-brand-gray'}`}>
                  Haftalık
                </button>
                <button onClick={() => setOrientationMode('monthly')} className={`px-4 py-1 rounded-full text-[10px] font-bold transition ${orientationMode === 'monthly' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-dark dark:text-white' : 'text-brand-gray'}`}>
                  Aylık
                </button>
              </div>
            </div>
            <div className="flex justify-between items-end mb-4">
              <span className="text-sm text-brand-gray dark:text-gray-400">Genel İlerleme</span>
              <span className="text-2xl font-light text-brand-dark dark:text-white">{completionRate}%</span>
            </div>
            <div className="w-full bg-brand-bg dark:bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-yellow h-full rounded-full transition-all duration-700" style={{ width: `${completionRate}%` }} />
            </div>
            <div className="flex gap-1.5 mt-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className={`h-1 flex-grow rounded-full ${i < Math.ceil(completionRate / 12.5) ? 'bg-brand-dark dark:bg-white' : 'bg-gray-200 dark:bg-slate-700'}`} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div className="bg-brand-bg dark:bg-slate-900 rounded-xl p-2">
                <div className="text-lg font-bold text-brand-dark dark:text-white">{todoTasks.length}</div>
                <div className="text-[9px] font-bold text-brand-gray dark:text-gray-500 uppercase">Bekleyen</div>
              </div>
              <div className="bg-brand-bg dark:bg-slate-900 rounded-xl p-2">
                <div className="text-lg font-bold text-brand-dark dark:text-white">{inProgressTasks.length}</div>
                <div className="text-[9px] font-bold text-brand-gray dark:text-gray-500 uppercase">Aktif</div>
              </div>
              <div className="bg-brand-bg dark:bg-slate-900 rounded-xl p-2">
                <div className="text-lg font-bold text-brand-dark dark:text-white">{doneTasks.length}</div>
                <div className="text-[9px] font-bold text-brand-gray dark:text-gray-500 uppercase">Biten</div>
              </div>
            </div>
          </div>

          {/* Görevler — canlı, tıklanabilir */}
          <div className="floating-card rounded-2xl p-6 flex-grow relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-brand-yellow/5 dark:bg-white/5 blur-xl rounded-full" />

            <div className="flex justify-between items-end mb-4 relative z-10 mt-1">
              <h3 className="text-lg font-semibold text-brand-dark dark:text-white">Görevler</h3>
              <span className="text-3xl font-light text-brand-dark dark:text-white">{doneTasks.length}<span className="text-base text-brand-gray dark:text-gray-400 ml-1">/{totalTasks}</span></span>
            </div>

            <div className="space-y-2.5 relative z-10 flex-grow overflow-y-auto scrollbar-hide pr-1">
              {recentTasks.map((task) => {
                const project = task.project || projects.find(p => p.id === task.project_id)
                return (
                  <div key={task.id} className="flex items-center justify-between group cursor-pointer bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/60 p-2.5 rounded-2xl transition-colors">
                    <div
                      className="flex items-center space-x-3 min-w-0 flex-1"
                      onClick={() => openTaskDetail(task)}
                    >
                      {/* Firma ikonu */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 p-2 ${!project?.color && 'bg-slate-200 dark:bg-slate-600'}`}
                        style={project?.color ? {
                          backgroundColor: `${project.color}20`,
                          color: project.color,
                        } : {}}
                      >
                        {project ? getCompanyIcon(project.id) : <Circle className="w-4 h-4 text-brand-gray dark:text-gray-300" />}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-sm font-medium truncate ${task.status === 'done' ? 'text-brand-gray/50 dark:text-gray-400 line-through' : 'text-brand-dark dark:text-white group-hover:text-brand-yellow'} transition-colors`}>
                          {task.title}
                        </div>
                        <div className="text-[10px] font-semibold flex items-center gap-1.5 mt-0.5">
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
                    {/* Tamamla butonu */}
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
                <p className="text-sm text-brand-gray dark:text-gray-400 text-center py-4">Henüz görev yok</p>
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
