"use client"

import * as React from "react"
import { useCalendarStore } from "@/stores/calendarStore"
import { useTaskStore } from "@/stores/taskStore"
import { CalendarEvent, EVENT_COLORS, CATEGORY_LABELS } from "@/types/calendar"
import { 
  ChevronLeft, ChevronRight, ChevronDown, Plus, Filter, Calendar as CalendarIcon, 
  Clock, X, Check, Trash2, Sun, Coffee, Briefcase, Book, 
  Heart, Users, Dumbbell, Sparkles, Send, Bot, Loader2, 
  ListTodo, BarChart3, MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, 
  isSameDay, addMonths, subMonths, isToday, eachDayOfInterval, addWeeks, subWeeks } from "date-fns"
import { tr } from "date-fns/locale"
import { useAuthStore } from "@/store/authStore"

// ============================
// HELPERS
// ============================
function generateId() {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function getMonthDays(date: Date) {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  task: <Briefcase className="w-3.5 h-3.5" />,
  personal: <Sun className="w-3.5 h-3.5" />,
  routine: <Coffee className="w-3.5 h-3.5" />,
  meeting: <Users className="w-3.5 h-3.5" />,
  health: <Dumbbell className="w-3.5 h-3.5" />,
  social: <Heart className="w-3.5 h-3.5" />,
  learning: <Book className="w-3.5 h-3.5" />,
}

const COLOR_OPTIONS = ['blue', 'purple', 'orange', 'green', 'rose', 'amber', 'teal', 'indigo']

// ============================
// AI CHAT MESSAGE TYPE
// ============================
interface AIChatMessage {
  id: string
  role: 'user' | 'ai'
  text: string
  time: string
}

// ============================
// MAIN COMPONENT
// ============================
export function CalendarPage() {
  const { events, viewMode, currentDate, selectedDate, addEvent, deleteEvent, updateEvent,
    setViewMode, setCurrentDate, setSelectedDate, activeFilters, toggleFilter, clearFilters } = useCalendarStore()
  const { tasks, updateTask } = useTaskStore()
  const [contextMenuState, setContextMenuState] = React.useState<{ show: boolean, x: number, y: number, event: CalendarEvent | null }>({ show: false, x: 0, y: 0, event: null })
  
  const [isSelectionMode, setIsSelectionMode] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  
  const [isAddEventOpen, setIsAddEventOpen] = React.useState(false)
  const [isEventDetailOpen, setIsEventDetailOpen] = React.useState(false)
  const [detailEvent, setDetailEvent] = React.useState<CalendarEvent | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [showFilters, setShowFilters] = React.useState(false)

  // Collapse/Expand state for left sidebar
  const [isAylikOzetOpen, setIsAylikOzetOpen] = React.useState(true)
  const [isBugunProgramiOpen, setIsBugunProgramiOpen] = React.useState(true)
  const [isBekleyenGorevlerOpen, setIsBekleyenGorevlerOpen] = React.useState(true)
  const [isTumEtkinliklerimOpen, setIsTumEtkinliklerimOpen] = React.useState(true)

  const current = React.useMemo(() => new Date(currentDate), [currentDate])

  const closeContextMenu = () => {
    setContextMenuState(prev => ({ ...prev, show: false }))
  }

  React.useEffect(() => {
    const handleGlobalClick = () => closeContextMenu()
    if (contextMenuState.show) {
      document.addEventListener("click", handleGlobalClick)
      document.addEventListener("contextmenu", handleGlobalClick)
    }
    return () => {
      document.removeEventListener("click", handleGlobalClick)
      document.removeEventListener("contextmenu", handleGlobalClick)
    }
  }, [contextMenuState.show])

  const handleHardDeleteEvent = (eventOrId: CalendarEvent | string) => {
    let evt: CalendarEvent | undefined;
    if (typeof eventOrId === 'string') {
       evt = allEvents.find(e => e.id === eventOrId)
    } else {
       evt = eventOrId
    }
    
    if (!evt) return;

    if (evt.taskId || evt.id.toString().startsWith('task_')) {
      const taskId = evt.taskId || parseInt(evt.id.toString().substring(5))
      updateTask(taskId, { due_date: null as unknown as string })
      if (!evt.id.toString().startsWith('task_')) {
         deleteEvent(evt.id)
      }
    } else {
      deleteEvent(evt.id)
    }
    
    setIsEventDetailOpen(false)
    setDetailEvent(null)
    closeContextMenu()
  }

  React.useEffect(() => { setMounted(true) }, [])

  // Merge tasks with due_date into calendar events
  const taskEvents: CalendarEvent[] = React.useMemo(() => {
    return tasks
      .filter(t => t.due_date && !t.parent_task_id)
      .map(t => ({
        id: `task_${t.id}`,
        title: t.title,
        description: t.description || '',
        date: format(new Date(t.due_date!), 'yyyy-MM-dd'),
        allDay: true,
        color: t.priority === 'urgent' ? 'rose' : t.priority === 'low' ? 'teal' : 'blue',
        category: 'task' as const,
        taskId: t.id,
      }))
  }, [tasks])

  const allEvents = React.useMemo(() => {
    return [...events, ...taskEvents]
  }, [events, taskEvents])

  const getEventsForDate = React.useCallback((date: Date): CalendarEvent[] => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return allEvents.filter(e => e.date === dateStr)
  }, [allEvents])

  // Navigation
  const goNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(current, 1).toISOString())
    else if (viewMode === 'week') setCurrentDate(addWeeks(current, 1).toISOString())
    else setCurrentDate(addDays(current, 1).toISOString())
  }
  const goPrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(current, 1).toISOString())
    else if (viewMode === 'week') setCurrentDate(subWeeks(current, 1).toISOString())
    else setCurrentDate(addDays(current, -1).toISOString())
  }
  const goToday = () => setCurrentDate(new Date().toISOString())

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    if (event.category === 'task' && event.taskId) {
       const task = tasks.find(t => t.id === event.taskId)
       if (task) {
          useTaskStore.getState().openTaskDetail(task)
          return
       }
    }
    setDetailEvent(event)
    setIsEventDetailOpen(true)
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'))
    setCurrentDate(date.toISOString())
    setViewMode('day')
  }

  const handleContextMenu = (e: React.MouseEvent, event: CalendarEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenuState({ show: true, x: e.clientX, y: e.clientY, event })
  }

  const handleDropItem = (sourceType: string, id: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (sourceType === 'task') {
      const taskId = parseInt(id)
      if (!isNaN(taskId)) {
        useTaskStore.getState().updateTask(taskId, { due_date: dateStr })
      }
    } else if (sourceType === 'event') {
      const ev = events.find(e => e.id.toString() === id)
      if (ev) {
        useCalendarStore.getState().updateEvent(ev.id, { date: dateStr })
      }
    }
  }

  if (!mounted) return null

  // Stats for AI sidebar
  const todayTasks = tasks.filter(t => !t.parent_task_id && t.status !== 'done')
  const pendingTasksNoDate = todayTasks.filter(t => !t.due_date)
  const pendingTasksToShow = pendingTasksNoDate.length > 0 ? pendingTasksNoDate : todayTasks

  const todayEvents = getEventsForDate(new Date())
  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const monthEvents = allEvents.filter(e => {
    const d = new Date(e.date)
    return d >= monthStart && d <= monthEnd
  })

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Context Menu Dropdown */}
      {contextMenuState.show && contextMenuState.event && (
        <div 
          className="fixed animate-in fade-in zoom-in-95 duration-100 z-[9999] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 py-1.5 min-w-[140px]"
          style={{ top: contextMenuState.y, left: contextMenuState.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => handleHardDeleteEvent(contextMenuState.event!)}
            className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Sil
          </button>
        </div>
      )}

      {/* ======================= LEFT AI PANEL ======================= */}
      <div className="w-[320px] shrink-0 border-r border-[#e8e4d8]/30 dark:border-white/8 bg-white/60 dark:bg-[#151926]/85 backdrop-blur-sm flex flex-col overflow-hidden">
        {/* Aylık Özet */}
        <div className="p-5 border-b border-gray-100 dark:border-white/8">
          <button 
            onClick={() => setIsAylikOzetOpen(!isAylikOzetOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer mb-3"
          >
            <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3" />
              Aylık Özet
            </h2>
            {isAylikOzetOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
          
          {isAylikOzetOpen && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-700/30">
              <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                {format(current, 'MMMM', { locale: tr })} ayında toplam <span className="font-bold text-gray-900 dark:text-white">{monthEvents.length} etkinlik</span> planlandı.
                {todayTasks.length > 0 && <> Şu anda <span className="font-bold text-indigo-600 dark:text-indigo-400">{todayTasks.length} aktif görev</span> bulunuyor.</>}
              </p>
              <div className="flex gap-3 mt-3">
                <div className="flex-1 bg-white/80 dark:bg-slate-800/60 rounded-lg p-2 text-center">
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{monthEvents.length}</p>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">Etkinlik</p>
                </div>
                <div className="flex-1 bg-white/80 dark:bg-slate-800/60 rounded-lg p-2 text-center">
                  <p className="text-lg font-black text-purple-600 dark:text-purple-400">{todayTasks.length}</p>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">Görev</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Günlük Özet */}
        <div className="p-5 border-b border-gray-100 dark:border-white/8">
          <button 
            onClick={() => setIsBugunProgramiOpen(!isBugunProgramiOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer mb-3"
          >
            <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3" />
              Bugünün Programı
            </h2>
            {isBugunProgramiOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
          
          {isBugunProgramiOpen && (
            <>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3 font-medium">
                {format(new Date(), 'dd MMMM yyyy, EEEE', { locale: tr })}
              </p>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {todayEvents.length === 0 ? (
                  <div className="text-center py-4">
                    <Sparkles className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-[11px] text-gray-400 font-medium">Bugün için plan yok</p>
                  </div>
                ) : (
                  todayEvents.sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00')).map(event => {
                    const colors = EVENT_COLORS[event.color] || EVENT_COLORS.blue
                    return (
                      <button
                        key={event.id}
                        onClick={(e) => handleEventClick(event, e)}
                        className={`w-full text-left p-2.5 rounded-lg ${colors.bg} border ${colors.border} hover:shadow-md transition-all`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-1 min-h-[24px] rounded-full ${colors.dot} shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-[11px] font-bold ${colors.text} truncate`}>{event.title}</p>
                            {event.startTime && (
                              <p className={`text-[10px] ${colors.text} opacity-70 flex items-center gap-1`}>
                                <Clock className="w-2.5 h-2.5" />
                                {event.startTime}{event.endTime && ` - ${event.endTime}`}
                              </p>
                            )}
                            {event.allDay && <p className={`text-[10px] ${colors.text} opacity-70`}>Tüm gün</p>}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Bekleyen Görevler */}
        <div className={`p-5 border-b border-gray-100 dark:border-white/8 flex flex-col ${isBekleyenGorevlerOpen ? 'flex-1 min-h-0' : 'shrink-0'}`}>
          <button 
            onClick={() => setIsBekleyenGorevlerOpen(!isBekleyenGorevlerOpen)}
            className={`w-full flex items-center justify-between text-left cursor-pointer shrink-0 ${isBekleyenGorevlerOpen ? 'mb-3' : ''}`}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <ListTodo className="w-3 h-3" />
                Bekleyen Görevler
              </h2>
              <span className="text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {pendingTasksToShow.length}
              </span>
            </div>
            {isBekleyenGorevlerOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
          
          {isBekleyenGorevlerOpen && (
            <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {pendingTasksToShow
                .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(t => (
                <div key={t.id} 
                  draggable
                  onDragStart={(e) => { 
                    e.dataTransfer.setData('sourceType', 'task'); 
                    e.dataTransfer.setData('id', t.id.toString()); 
                    e.dataTransfer.effectAllowed = 'move'; 
                  }}
                  onClick={() => useTaskStore.getState().openTaskDetail(t)}
                  className="flex items-center gap-2.5 p-2 bg-white dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/8 group hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors cursor-pointer active:cursor-grabbing hover:shadow-sm"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${t.priority === 'urgent' ? 'bg-rose-500' : t.priority === 'low' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[11px] text-gray-700 dark:text-gray-200 font-medium truncate flex-1">{t.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tüm Etkinliklerim */}
        <div 
          className={`p-5 flex flex-col shrink-0 border-t border-gray-100 dark:border-white/8 ${isTumEtkinliklerimOpen ? 'h-[220px]' : ''}`}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsSelectionMode(true);
          }}
        >
           <div className={`flex items-center justify-between shrink-0 ${isTumEtkinliklerimOpen ? 'mb-3' : ''}`}>
            <button 
              onClick={() => setIsTumEtkinliklerimOpen(!isTumEtkinliklerimOpen)}
              className="flex items-center justify-between flex-1 text-left cursor-pointer"
            >
              <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <CalendarIcon className="w-3 h-3" />
                Tüm Etkinliklerim
              </h2>
              <div className="flex items-center gap-2">
                {isTumEtkinliklerimOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
              </div>
            </button>
            <div className="flex gap-1 ml-3 shrink-0">
              {isSelectionMode ? (
                 <>
                   <button onClick={() => { setIsSelectionMode(false); setSelectedIds([]) }} className="text-[10px] text-gray-500 font-semibold hover:bg-gray-100 px-2 py-1 rounded-md">İptal</button>
                   {selectedIds.length > 0 && (
                     <button onClick={() => { useCalendarStore.getState().deleteEvents(selectedIds); setIsSelectionMode(false); setSelectedIds([]); }} className="text-[10px] text-red-500 font-semibold hover:bg-red-50 px-2 py-1 rounded-md flex items-center gap-1"><Trash2 className="w-3 h-3"/> Sil</button>
                   )}
                 </>
              ) : (
                 <button 
                   onClick={(e) => { e.stopPropagation(); setSelectedDate(format(new Date(), 'yyyy-MM-dd')); setIsAddEventOpen(true) }}
                   className="text-[10px] text-indigo-500 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Ekle
                </button>
              )}
            </div>
          </div>
          
          {isTumEtkinliklerimOpen && (
            <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
               {events.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => {
                  const colors = EVENT_COLORS[e.color] || EVENT_COLORS.blue;
                  return (
                   <button 
                    key={e.id}
                    draggable={!isSelectionMode}
                    onDragStart={(evt) => {
                      if (isSelectionMode) return;
                      evt.dataTransfer.setData('sourceType', 'event');
                      evt.dataTransfer.setData('id', e.id.toString());
                      evt.dataTransfer.effectAllowed = 'move';
                    }}
                    onClick={(evt) => {
                       if (isSelectionMode) {
                          evt.stopPropagation();
                          setSelectedIds(prev => prev.includes(e.id.toString()) ? prev.filter(id => id !== e.id.toString()) : [...prev, e.id.toString()]);
                       } else {
                          setCurrentDate(new Date(e.date).toISOString());
                          setSelectedDate(e.date);
                          setViewMode('day');
                       }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 hover:shadow-sm transition-all ${!isSelectionMode ? 'cursor-grab active:cursor-grabbing' : ''} ${colors.bg} ${selectedIds.includes(e.id.toString()) ? 'ring-2 ring-indigo-500' : ''}`}
                   >
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <p className={`text-[12px] font-bold ${colors.text} truncate`}>{e.title}</p>
                          <p className={`text-[10px] ${colors.text} opacity-70 mt-1`}>{format(new Date(e.date), 'dd MMMM yyyy, EEEE', { locale: tr })}</p>
                        </div>
                        {isSelectionMode && (
                          <div className={`w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center ${selectedIds.includes(e.id.toString()) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}>
                             {selectedIds.includes(e.id.toString()) && <Check className="w-3 h-3 text-white" />}
                          </div>
                        )}
                      </div>
                   </button>
                  )
               })}
               {events.length === 0 && <p className="text-[11px] text-gray-400 text-center mt-4 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-xl p-4">Henüz etkinlik yok.</p>}
            </div>
          )}
        </div>
      </div>

      {/* ======================= MAIN CALENDAR AREA ======================= */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white/80 dark:bg-[#151926]/90 backdrop-blur-sm">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-gray-100 dark:border-white/8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                {viewMode === 'month' && format(current, 'MMMM yyyy', { locale: tr })}
                {viewMode === 'week' && `${format(startOfWeek(current, { weekStartsOn: 1 }), 'dd MMM', { locale: tr })} - ${format(endOfWeek(current, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: tr })}`}
                {viewMode === 'day' && format(current, 'dd MMMM yyyy, EEEE', { locale: tr })}
              </h1>
              <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 rounded-lg p-0.5">
                <button onClick={goPrev} className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button onClick={goToday} className="px-3 py-1 text-[11px] font-bold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors">
                  Bugün
                </button>
                <button onClick={goNext} className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Switcher */}
              <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-full p-0.5 text-xs font-medium">
                {(['month', 'week', 'day'] as const).map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`px-3.5 py-1.5 rounded-full transition-all ${viewMode === mode ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    {mode === 'month' ? 'Ay' : mode === 'week' ? 'Hafta' : 'Gün'}
                  </button>
                ))}
              </div>

              <button onClick={() => setIsAddEventOpen(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 dark:bg-indigo-600 px-4 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Etkinlik Ekle
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Views */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'month' && <MonthView current={current} events={allEvents} onDayClick={handleDayClick} onEventClick={handleEventClick} onDropItem={handleDropItem} onContextMenu={handleContextMenu} />}
          {viewMode === 'week' && <WeekView current={current} events={allEvents} onEventClick={handleEventClick} onDropItem={handleDropItem} onContextMenu={handleContextMenu} />}
          {viewMode === 'day' && <DayView current={current} events={allEvents} onEventClick={handleEventClick} onAddEvent={() => { setSelectedDate(format(current, 'yyyy-MM-dd')); setIsAddEventOpen(true) }} onContextMenu={handleContextMenu} />}
        </div>
      </div>

      {/* Dialogs */}
      <AddEventDialog open={isAddEventOpen} onClose={() => setIsAddEventOpen(false)} defaultDate={selectedDate || format(new Date(), 'yyyy-MM-dd')} onSave={(event) => { addEvent(event); setIsAddEventOpen(false) }} />
      <EventDetailDialog event={detailEvent} open={isEventDetailOpen} onClose={() => { setIsEventDetailOpen(false); setDetailEvent(null) }} onDelete={(id) => handleHardDeleteEvent(id)} onUpdate={(id, data) => { updateEvent(id, data); setDetailEvent(prev => prev ? { ...prev, ...data } : null) }} />
    </div>
  )
}

// ============================
// AI CHAT PANEL
// ============================
function AIChatPanel({ tasks, events, currentDate }: { tasks: any[], events: CalendarEvent[], currentDate: Date }) {
  const { user } = useAuthStore()
  const [messages, setMessages] = React.useState<AIChatMessage[]>([
    {
      id: '1',
      role: 'ai',
      text: `Merhaba {user?.username || ''}! 👋 Ben takvim asistanın. Bugünkü planlarını yapmana, görevlerini organize etmene yardımcı olabilirim. Bana "Günümü planla" veya "Bu hafta ne yapmalıyım?" gibi sorular sorabilirsin.`,
      time: format(new Date(), 'HH:mm')
    }
  ])
  const [input, setInput] = React.useState('')
  const [isTyping, setIsTyping] = React.useState(false)
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: AIChatMessage = {
      id: generateId(),
      role: 'user',
      text: input.trim(),
      time: format(new Date(), 'HH:mm')
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response based on context
    setTimeout(() => {
      const activeTasks = tasks.filter(t => !t.parent_task_id && t.status !== 'done')
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const todayEvents = events.filter(e => e.date === todayStr)
      
      let aiText = ''
      const lowerInput = input.toLowerCase()

      if (lowerInput.includes('planla') || lowerInput.includes('plan')) {
        aiText = `📋 Bugün için planın:\n\n`
        if (todayEvents.length > 0) {
          todayEvents.forEach((e, i) => {
            aiText += `${i + 1}. ${e.title}${e.startTime ? ` (${e.startTime})` : ' (Tüm gün)'}\n`
          })
        }
        if (activeTasks.length > 0) {
          aiText += `\n🎯 Odaklanman gereken görevler:\n`
          activeTasks.slice(0, 3).forEach((t, i) => {
            aiText += `${i + 1}. ${t.title} (${t.priority === 'urgent' ? '🔴 Acil' : t.priority === 'low' ? '🟢 Düşük' : '🟡 Normal'})\n`
          })
        }
        if (todayEvents.length === 0 && activeTasks.length === 0) {
          aiText = '✨ Bugün için planlanmış bir etkinlik veya görev yok. Yeni bir plan oluşturmak ister misin?'
        }
      } else if (lowerInput.includes('özet') || lowerInput.includes('özetle')) {
        aiText = `📊 ${format(currentDate, 'MMMM', { locale: tr })} Ayı Özeti:\n\n`
        aiText += `• ${events.length} etkinlik planlandı\n`
        aiText += `• ${activeTasks.length} aktif görev var\n`
        const urgentCount = activeTasks.filter(t => t.priority === 'urgent').length
        if (urgentCount > 0) aiText += `• ⚠️ ${urgentCount} acil görev dikkatini bekliyor\n`
        aiText += `\nEn önemli 3 görev: ${activeTasks.slice(0, 3).map(t => t.title).join(', ')}`
      } else if (lowerInput.includes('görev') || lowerInput.includes('task')) {
        aiText = `📌 Aktif Görevlerin (${activeTasks.length}):\n\n`
        activeTasks.slice(0, 5).forEach((t, i) => {
          aiText += `${i + 1}. ${t.title} → ${t.status === 'in_progress' ? '🔄 Devam Ediyor' : t.status === 'in_review' ? '👀 İncelemede' : '📝 Yapılacak'}\n`
        })
        if (activeTasks.length > 5) aiText += `\n...ve ${activeTasks.length - 5} görev daha.`
      } else {
        aiText = `Anladım! Seninle ilgili bilgiler:\n\n📅 Bugün ${todayEvents.length} etkinlik var\n📋 ${activeTasks.length} aktif görev bekliyor\n\nBana daha spesifik bir soru sorabilirsin. Örneğin:\n• "Günümü planla"\n• "Bu ayı özetle"\n• "Aktif görevlerimi göster"`
      }

      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'ai',
        text: aiText,
        time: format(new Date(), 'HH:mm')
      }])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-gray-900 dark:text-white">AI Asistan</h3>
            <p className="text-[10px] text-gray-500">Günlük planlama & özet</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col gap-0.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-2xl text-[11px] leading-relaxed whitespace-pre-line ${
              msg.role === 'user' 
                ? 'bg-gray-900 dark:bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
            <span className="text-[9px] text-gray-400 px-1">{msg.time}</span>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-gray-50/80 dark:bg-slate-900/80 border-t border-gray-100 dark:border-white/5 shrink-0">
        <div className="flex gap-2">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Günümü planla, özetle..." 
            className="flex-1 text-xs h-9 rounded-xl border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-visible:ring-1 focus-visible:ring-indigo-400"
            onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
          />
          <button onClick={handleSend} disabled={!input.trim()} className="w-9 h-9 rounded-xl bg-gray-900 dark:bg-indigo-600 text-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:scale-100 shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-1.5 mt-2">
          <button onClick={() => { setInput('Günümü planla'); }} className="text-[9px] font-semibold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full hover:bg-indigo-100 transition-colors">
            📋 Günümü planla
          </button>
          <button onClick={() => { setInput('Bu ayı özetle'); }} className="text-[9px] font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full hover:bg-purple-100 transition-colors">
            📊 Aylık özet
          </button>
          <button onClick={() => { setInput('Aktif görevlerimi göster'); }} className="text-[9px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full hover:bg-emerald-100 transition-colors">
            🎯 Görevler
          </button>
        </div>
      </div>
    </div>
  )
}


// ============================
// MONTH VIEW
// ============================
function MonthView({ current, events, onDayClick, onEventClick, onDropItem, onContextMenu }: {
  current: Date; events: CalendarEvent[]; onDayClick: (date: Date) => void; onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void; onDropItem: (sourceType: string, id: string, date: Date) => void; onContextMenu: (e: React.MouseEvent, event: CalendarEvent) => void
}) {
  const days = getMonthDays(current)
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-white/8 shrink-0">
        {weekDays.map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest">{day}</div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
        {days.map((day, idx) => {
          const dayEvents = events.filter(e => e.date === format(day, 'yyyy-MM-dd'))
          const isCurrentMonth = isSameMonth(day, current)
          const today = isToday(day)

          return (
            <div key={idx} onClick={() => onDayClick(day)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                 e.preventDefault();
                 const sourceType = e.dataTransfer.getData('sourceType');
                 const id = e.dataTransfer.getData('id');
                 if(sourceType && id) onDropItem(sourceType, id, day);
              }}
              className={`border-r border-b border-gray-100 dark:border-white/6 p-2 min-h-[110px] cursor-pointer transition-colors hover:bg-gray-50/50 dark:hover:bg-white/3 flex flex-col ${!isCurrentMonth ? 'bg-gray-50/30 dark:bg-black/10' : ''} ${today ? 'bg-indigo-50/40 dark:bg-amber-900/10 ring-1 ring-inset ring-indigo-200/50 dark:ring-amber-700/30' : ''}`}
            >
              <span className={`text-xs font-semibold leading-none shrink-0 ${today ? 'w-6 h-6 flex items-center justify-center bg-amber-500 text-white rounded-full text-[10px] font-black' : isCurrentMonth ? 'text-gray-600 dark:text-gray-300 pl-1' : 'text-gray-300 dark:text-gray-600 pl-1'}`}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-1 overflow-y-auto flex-1 custom-scrollbar pr-1">
                {dayEvents.map(event => {
                  const colors = EVENT_COLORS[event.color] || EVENT_COLORS.blue
                  return (
                    <button key={event.id} onClick={(e) => onEventClick(event, e)} onContextMenu={(e) => onContextMenu(e, event)}
                      draggable
                      onDragStart={(evt) => {
                         evt.stopPropagation();
                         evt.dataTransfer.setData('sourceType', event.category === 'task' ? 'task' : 'event');
                         const dragId = event.category === 'task' ? event.taskId!.toString() : event.id.toString();
                         evt.dataTransfer.setData('id', dragId);
                         evt.dataTransfer.effectAllowed = 'move';
                      }}
                      className={`w-full text-left ${event.isCompleted ? 'opacity-60 bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 line-through' : `${colors.bg} ${colors.text} border-${colors.dot.replace('bg-', '')} border-opacity-30`} rounded px-1.5 py-1 text-[10px] font-semibold leading-tight hover:shadow-sm transition-shadow block cursor-grab active:cursor-grabbing border relative`}
                    >
                      <div className="flex items-center gap-1">
                        {event.isCompleted ? <Check className="w-3 h-3 shrink-0 text-emerald-500" /> : null}
                        <span className="truncate w-full block">{event.title}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================
// WEEK VIEW
// ============================
function WeekView({ current, events, onEventClick, onDropItem, onContextMenu }: {
  current: Date; events: CalendarEvent[]; onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void; onDropItem: (sourceType: string, id: string, date: Date) => void; onContextMenu: (e: React.MouseEvent, event: CalendarEvent) => void
}) {
  const days = getWeekDays(current)

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <div className="grid grid-cols-8 border-b border-gray-200 dark:border-white/8 shrink-0">
        <div className="py-3 w-16 border-r border-gray-100 dark:border-white/6" />
        {days.map((day, idx) => (
          <div key={idx} 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                 e.preventDefault();
                 const sourceType = e.dataTransfer.getData('sourceType');
                 const id = e.dataTransfer.getData('id');
                 if(sourceType && id) onDropItem(sourceType, id, day);
              }}
              className={`py-2 text-center border-r border-gray-100 dark:border-white/6 ${isToday(day) ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase">{format(day, 'EEE', { locale: tr })}</p>
            <p className={`text-base font-black mt-0.5 ${isToday(day) ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'}`}>{format(day, 'd')}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {HOURS.map(hour => (
          <div key={hour} className="grid grid-cols-8 min-h-[56px] border-b border-gray-50 dark:border-white/4">
            <div className="w-16 text-right pr-3 py-1 text-[10px] font-medium text-gray-400 dark:text-gray-500 border-r border-gray-100 dark:border-white/6 shrink-0">{hour.toString().padStart(2, '0')}:00</div>
            {days.map((day, dayIdx) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const hourEvents = events.filter(e => {
                if (e.date !== dateStr) return false
                if (e.allDay) return hour === 0
                if (!e.startTime) return false
                return parseInt(e.startTime.split(':')[0]) === hour
              })
              return (
                <div key={dayIdx} 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                     e.preventDefault();
                     const sourceType = e.dataTransfer.getData('sourceType');
                     const id = e.dataTransfer.getData('id');
                     if(sourceType && id) onDropItem(sourceType, id, day);
                  }}
                  className={`border-r border-gray-50 dark:border-white/4 p-0.5 ${isToday(day) ? 'bg-amber-50/20 dark:bg-amber-900/5' : ''}`}>
                  {hourEvents.map(event => {
                    const colors = EVENT_COLORS[event.color] || EVENT_COLORS.blue
                    const duration = event.startTime && event.endTime ? (parseInt(event.endTime.split(':')[0]) - parseInt(event.startTime.split(':')[0])) : 1
                    return (
                      <button key={event.id} onClick={(e) => onEventClick(event, e)} onContextMenu={(e) => onContextMenu(e, event)}
                        draggable
                        onDragStart={(evt) => {
                           evt.stopPropagation();
                           evt.dataTransfer.setData('sourceType', event.category === 'task' ? 'task' : 'event');
                           const dragId = event.category === 'task' ? event.taskId!.toString() : event.id.toString();
                           evt.dataTransfer.setData('id', dragId);
                           evt.dataTransfer.effectAllowed = 'move';
                        }}
                        className={`w-full text-left ${colors.bg} ${colors.text} rounded-md p-1.5 text-[10px] font-semibold truncate border-l-2 ${colors.dot.replace('bg-', 'border-')} hover:shadow-md transition-shadow block cursor-grab active:cursor-grabbing mb-0.5`}
                        style={{ minHeight: `${Math.max(duration, 1) * 52}px` }}
                      >
                        <p className="truncate">{event.title}</p>
                        {event.startTime && <p className="opacity-60 text-[9px]">{event.startTime}{event.endTime && ` - ${event.endTime}`}</p>}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================
// DAY VIEW
// ============================
function DayView({ current, events, onEventClick, onAddEvent, onContextMenu }: {
  current: Date; events: CalendarEvent[]; onEventClick: (event: CalendarEvent, e: React.MouseEvent) => void; onAddEvent: () => void; onContextMenu: (e: React.MouseEvent, event: CalendarEvent) => void
}) {
  const dateStr = format(current, 'yyyy-MM-dd')
  const dayEvents = events.filter(e => e.date === dateStr)
  const allDayEvents = dayEvents.filter(e => e.allDay)
  const timedEvents = dayEvents.filter(e => !e.allDay && e.startTime)

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {allDayEvents.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100 dark:border-white/6 bg-gray-50/50 dark:bg-white/3 flex gap-2 flex-wrap shrink-0">
          <span className="text-[10px] font-black text-gray-400 uppercase self-center mr-2">Tüm Gün</span>
          {allDayEvents.map(event => {
            const colors = EVENT_COLORS[event.color] || EVENT_COLORS.blue
            return (
              <button key={event.id} onClick={(e) => onEventClick(event, e)} onContextMenu={(e) => onContextMenu(e, event)}
                className={`${colors.bg} ${colors.text} rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm hover:shadow-md transition-shadow`}
              >
                {event.title}
              </button>
            )
          })}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {HOURS.map(hour => {
          const hourEvents = timedEvents.filter(e => e.startTime && parseInt(e.startTime.split(':')[0]) === hour)
          return (
            <div key={hour} className="flex min-h-[64px] border-b border-gray-50 dark:border-white/4 group">
              <div className="w-20 text-right pr-4 py-2 text-[11px] font-medium text-gray-400 dark:text-gray-500 shrink-0 border-r border-gray-100 dark:border-white/6">{hour.toString().padStart(2, '0')}:00</div>
              <div className="flex-1 p-1 relative">
                {hourEvents.length === 0 && (
                  <button onClick={onAddEvent} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-gray-300 dark:text-gray-600 font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Ekle</span>
                  </button>
                )}
                {hourEvents.map(event => {
                  const colors = EVENT_COLORS[event.color] || EVENT_COLORS.blue
                  const duration = event.startTime && event.endTime ? (parseInt(event.endTime.split(':')[0]) - parseInt(event.startTime.split(':')[0])) : 1
                  return (
                    <button key={event.id} onClick={(e) => onEventClick(event, e)} onContextMenu={(e) => onContextMenu(e, event)}
                      className={`w-full text-left ${colors.bg} ${colors.text} rounded-xl p-3 border-l-4 ${colors.dot.replace('bg-', 'border-')} hover:shadow-md transition-all`}
                      style={{ minHeight: `${Math.max(duration, 1) * 60}px` }}
                    >
                      <p className="text-sm font-bold">{event.title}</p>
                      {event.startTime && <p className="text-[11px] opacity-70 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{event.startTime}{event.endTime && ` - ${event.endTime}`}</p>}
                      {event.description && <p className="text-[11px] opacity-60 mt-1 line-clamp-2">{event.description}</p>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================
// ADD EVENT DIALOG
// ============================
function AddEventDialog({ open, onClose, defaultDate, onSave }: {
  open: boolean; onClose: () => void; defaultDate: string; onSave: (event: CalendarEvent) => void
}) {
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [date, setDate] = React.useState(defaultDate)
  const [startTime, setStartTime] = React.useState('')
  const [endTime, setEndTime] = React.useState('')
  const [color, setColor] = React.useState('blue')
  const [category, setCategory] = React.useState<CalendarEvent['category']>('personal')
  const [allDay, setAllDay] = React.useState(false)

  React.useEffect(() => {
    if (open) { setDate(defaultDate); setTitle(''); setDescription(''); setStartTime(''); setEndTime(''); setColor('blue'); setCategory('personal'); setAllDay(false) }
  }, [open, defaultDate])

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ id: generateId(), title: title.trim(), description: description.trim() || undefined, date, startTime: allDay ? undefined : startTime || undefined, endTime: allDay ? undefined : endTime || undefined, allDay, color, category })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl [&>button]:hidden">
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent pointer-events-none" />
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        <div className="relative z-10 p-6 pt-8">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30"><CalendarIcon className="w-5 h-5" /></div>
              Yeni Etkinlik
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold text-gray-600 dark:text-gray-400">Başlık</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Etkinlik adı..." className="mt-1 h-10 rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-black/20 text-sm font-medium" autoFocus />
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-600 dark:text-gray-400">Açıklama</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detaylar..." className="mt-1 min-h-[60px] rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-black/20 text-sm resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold text-gray-600 dark:text-gray-400">Tarih</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 h-10 rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-black/20 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-bold text-gray-600 dark:text-gray-400">Kategori</Label>
                <Select value={category} onValueChange={v => setCategory(v as CalendarEvent['category'])}>
                  <SelectTrigger className="mt-1 h-10 rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-black/20 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="rounded-lg text-sm"><div className="flex items-center gap-2">{CATEGORY_ICONS[key]} {label}</div></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-400" />
              Tüm gün
            </label>
            {!allDay && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs font-bold text-gray-600 dark:text-gray-400">Başlangıç</Label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 h-10 rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-black/20 text-sm" /></div>
                <div><Label className="text-xs font-bold text-gray-600 dark:text-gray-400">Bitiş</Label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1 h-10 rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-black/20 text-sm" /></div>
              </div>
            )}
            <div>
              <Label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block">Renk</Label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full ${EVENT_COLORS[c]?.dot || 'bg-gray-400'} transition-all ${color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-110 opacity-70'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold px-5">Vazgeç</Button>
              <Button onClick={handleSave} className="rounded-xl font-bold px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">Kaydet</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================
// EVENT DETAIL DIALOG
// ============================
export function EventDetailDialog({ event, open, onClose, onDelete, onUpdate }: {
  event: CalendarEvent | null; open: boolean; onClose: () => void; onDelete: (id: string) => void; onUpdate: (id: string, data: Partial<CalendarEvent>) => void
}) {
  const { updateTask, tasks } = useTaskStore()

  // Find linked note (lazy import to avoid circular deps)
  const [linkedNote, setLinkedNote] = React.useState<any>(null)
  
  React.useEffect(() => {
    if (event?.noteId && open) {
      import('@/stores/noteStore').then(({ useNoteStore }) => {
        const note = useNoteStore.getState().notes.find((n: any) => n.id === event.noteId)
        setLinkedNote(note || null)
      })
    } else {
      setLinkedNote(null)
    }
  }, [event?.noteId, open])

  // Determine real completion status based on time
  const isTimePassed = React.useMemo(() => {
    if (!event || !event.endTime || event.allDay) return false
    const now = new Date()
    const eventDate = new Date(event.date)
    const [eh, em] = event.endTime.split(':').map(Number)
    eventDate.setHours(eh, em, 0, 0)
    return now > eventDate
  }, [event?.date, event?.endTime, event?.allDay])

  if (!event) return null

  const colors = EVENT_COLORS[event.color] || EVENT_COLORS.blue
  const isTaskEvent = event.taskId !== undefined || event.id.startsWith('task_')

  // Find linked task
  const linkedTask = event.taskId ? tasks.find(t => t.id === event.taskId) : null

  const handleComplete = async () => {
    let addedMinutes = 60;
    if (event.startTime && event.endTime && !event.allDay) {
      const [sh, sm] = event.startTime.split(':').map(Number);
      const [eh, em] = event.endTime.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff < 0) diff += 24 * 60;
      if (diff > 0) addedMinutes = diff;
    } else if (event.allDay) {
      addedMinutes = 8 * 60;
    }

    if (event.taskId) {
      const parentTask = tasks.find(t => t.id === event.taskId);
      if (parentTask) {
        const currentActual = parentTask.actual_minutes || 0;
        await updateTask(parentTask.id, { actual_minutes: currentActual + addedMinutes });
      }
    }

    onUpdate(event.id, { isCompleted: true });
    onClose();
  }

  const handleOpenTask = () => {
    if (linkedTask) {
      onClose()
      // Dialog kapandıktan sonra TaskDetailPanel aç
      setTimeout(() => {
        useTaskStore.getState().openTaskDetail(linkedTask)
      }, 100)
    }
  }

  const handleOpenNote = async () => {
    if (linkedNote) {
      onClose()
      // Dialog kapandıktan sonra NoteDetailPanel aç
      setTimeout(async () => {
        const { useNoteStore } = await import('@/stores/noteStore')
        useNoteStore.getState().openNoteDetail(linkedNote)
      }, 100)
    }
  }

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    todo: { label: 'Bekliyor', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    in_progress: { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    done: { label: 'Tamamlandı', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    in_review: { label: 'İncelemede', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl [&>button]:hidden">
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        <div className={`h-2 ${colors.dot}`} />
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>{CATEGORY_ICONS[event.category] || <CalendarIcon className="w-4 h-4" />}</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{event.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{CATEGORY_LABELS[event.category]} · {format(new Date(event.date), 'dd MMMM yyyy', { locale: tr })}</p>
            </div>
          </div>

          {/* Time Block */}
          {(event.startTime || event.allDay) && (
            <div className={`${colors.bg} rounded-xl p-3 mb-3 flex items-center gap-2`}>
              <Clock className={`w-4 h-4 ${colors.text}`} />
              <span className={`text-sm font-medium ${colors.text}`}>{event.allDay ? 'Tüm gün' : `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`}</span>
            </div>
          )}

          {/* Description */}
          {event.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{event.description}</p>}

          {/* Linked Task Card */}
          {linkedTask && (
            <button
              onClick={handleOpenTask}
              className="w-full text-left bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 mb-3 hover:bg-amber-100 dark:hover:bg-amber-900/25 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 truncate group-hover:underline">{linkedTask.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_LABELS[linkedTask.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[linkedTask.status]?.label || linkedTask.status}
                    </span>
                    <span className="text-[10px] text-gray-400">Göreve git →</span>
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Linked Note Card */}
          {linkedNote && (
            <button
              onClick={handleOpenNote}
              className="w-full text-left bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 mb-3 hover:bg-emerald-100 dark:hover:bg-emerald-900/25 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-800/30 flex items-center justify-center shrink-0">
                  <Book className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate group-hover:underline">{linkedNote.title || linkedNote.content?.slice(0, 60)}</p>
                  <span className="text-[10px] text-gray-400">Notu aç →</span>
                </div>
              </div>
            </button>
          )}

          {/* Task event without loaded task data — sadece gerçekten taskId varsa göster */}
          {event.taskId && !linkedTask && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-3">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />Bir göreve bağlı (Görev yüklenemedi)</p>
            </div>
          )}

          {/* Completion Status */}
          {event.isCompleted && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 mb-3">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" />Tamamlandı ✓</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            {!event.isCompleted && (
              <Button size="sm" onClick={handleComplete} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold"><Check className="w-4 h-4 mr-1" /> Tamamla</Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onDelete(event.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold"><Trash2 className="w-4 h-4 mr-1" /> Sil</Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl font-bold">Kapat</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
