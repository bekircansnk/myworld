"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { useProjectStore } from "@/stores/projectStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Task } from "@/types"
import { api } from "@/lib/api"
import {
  Calendar, Sparkles, Loader2, CheckCircle2, Circle,
  AlignLeft, ListChecks, Plus, X, Clock, Pencil, Save, Trash2,
  Bot, Activity, CalendarClock, Timer, Target, TrendingUp,
  ChevronRight, ChevronDown, FileText, Paperclip, History, Flag
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

// =================== LINKED ITEMS BADGES ===================
function LinkedItemsBadges({ taskId }: { taskId: number }) {
  const [linkedNote, setLinkedNote] = React.useState<any>(null)
  const [linkedEvents, setLinkedEvents] = React.useState<any[]>([])

  React.useEffect(() => {
    // Find notes linked to this task
    import('@/stores/noteStore').then(({ useNoteStore }) => {
      const notes = useNoteStore.getState().notes
      const note = notes.find((n: any) => n.task_id === taskId)
      setLinkedNote(note || null)
    }).catch(() => {})

    // Find calendar events linked to this task
    import('@/stores/calendarStore').then(({ useCalendarStore }) => {
      const events = useCalendarStore.getState().events
      const taskEvents = events.filter((e: any) => e.taskId === taskId)
      setLinkedEvents(taskEvents)
    }).catch(() => {})
  }, [taskId])

  const handleOpenNote = async () => {
    if (linkedNote) {
      const { useNoteStore } = await import('@/stores/noteStore')
      useNoteStore.getState().openNoteDetail(linkedNote)
    }
  }

  if (!linkedNote && linkedEvents.length === 0) return null

  return (
    <>
      {linkedNote && (
        <button
          onClick={handleOpenNote}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-700/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all"
        >
          <FileText className="w-3 h-3" />
          {linkedNote.title || linkedNote.content?.slice(0, 30) || 'Not'}
        </button>
      )}
      {linkedEvents.map((ev: any) => (
        <span
          key={ev.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-200 dark:border-blue-700/50"
        >
          <Calendar className="w-3 h-3" />
          {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}
        </span>
      ))}
    </>
  )
}

// =================== ACTIVITY EVENT TYPE ===================
interface ActivityEvent {
  id: string
  type: 'status_change' | 'ai_analysis' | 'subtask_done' | 'created' | 'description_edit' | 'date_change'
  text: string
  timestamp: Date
  icon?: React.ReactNode
  color?: string
}

// =================== MAIN COMPONENT ===================
export function TaskDetailPanel() {
  const {
    selectedTask, isDetailPanelOpen, closeTaskDetail,
    updateTaskStatus, updateTask, tasks, fetchTasks,
    addSubtask, deleteTask
  } = useTaskStore()
  const { projects } = useProjectStore()

  // Local States
  const [isEditingDesc, setIsEditingDesc] = React.useState(false)
  const [descriptionDraft, setDescriptionDraft] = React.useState("")
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [titleDraft, setTitleDraft] = React.useState("")
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState("")
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [editingDueDate, setEditingDueDate] = React.useState(false)
  const [dueDateDraft, setDueDateDraft] = React.useState("")
  const [editingSubtaskId, setEditingSubtaskId] = React.useState<number | null>(null)
  const [subtaskEditTitle, setSubtaskEditTitle] = React.useState("")
  const [subtaskEditDesc, setSubtaskEditDesc] = React.useState("")
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [activityLog, setActivityLog] = React.useState<ActivityEvent[]>([])
  const [showPriorityMenu, setShowPriorityMenu] = React.useState(false)
  const subtaskInputRef = React.useRef<HTMLInputElement>(null)
  const priorityMenuRef = React.useRef<HTMLDivElement>(null)
  const hasFetchedAI = React.useRef(false)

  // Derived data
  const subtasks = React.useMemo(() => {
    if (!selectedTask) return []
    return tasks
      .filter(t => t.parent_task_id === selectedTask.id)
      .sort((a, b) => a.sort_order - b.sort_order)
  }, [tasks, selectedTask])

  const doneSubtasks = subtasks.filter(t => t.status === 'done')
  const progress = subtasks.length > 0 ? Math.round((doneSubtasks.length / subtasks.length) * 100) : 0
  const project = selectedTask ? projects.find(p => p.id === selectedTask.project_id) : null

  const descImages = React.useMemo(() => {
    if (!selectedTask?.description) return []
    const imgRegex = /(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp|svg))/gi
    return selectedTask.description.match(imgRegex) || []
  }, [selectedTask?.description])

  const elapsedTime = React.useMemo(() => {
    if (!selectedTask?.created_at) return ""
    return formatDistanceToNow(new Date(selectedTask.created_at), { locale: tr, addSuffix: true })
  }, [selectedTask?.created_at])

  // Effects
  React.useEffect(() => {
    if (isEditingDesc && selectedTask) {
      setDescriptionDraft(selectedTask.description || "")
    }
  }, [isEditingDesc, selectedTask])

  React.useEffect(() => {
    if (isAddingSubtask && subtaskInputRef.current) {
      subtaskInputRef.current.focus()
    }
  }, [isAddingSubtask])

  React.useEffect(() => {
    if (selectedTask && isDetailPanelOpen) {
      if (!selectedTask.ai_analysis && !hasFetchedAI.current) {
        hasFetchedAI.current = true
        fetchAIAnalysis()
      }
      setDueDateDraft(selectedTask.due_date ? selectedTask.due_date.split('T')[0] : "")
      setTitleDraft(selectedTask.title || "")
      
      // Initialize activity log with creation event
      const initLogs: ActivityEvent[] = [{
        id: 'created',
        type: 'created',
        text: 'Görev oluşturuldu',
        timestamp: new Date(selectedTask.created_at),
        color: 'blue'
      }]
      if (selectedTask.ai_analysis) {
        initLogs.push({
          id: 'ai_init',
          type: 'ai_analysis',
          text: 'AI analizi oluşturuldu',
          timestamp: new Date(selectedTask.created_at),
          color: 'purple'
        })
      }
      setActivityLog(initLogs.reverse())
    }
    return () => {
      setIsEditingDesc(false)
      setIsAddingSubtask(false)
      setImagePreview(null)
      setActivityLog([])
      hasFetchedAI.current = false
      setEditingSubtaskId(null)
    }
  }, [selectedTask?.id, isDetailPanelOpen])

  // ESC key to close panel or lightbox
  React.useEffect(() => {
    if (!isDetailPanelOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Priority: close lightbox first
        if (imagePreview) { setImagePreview(null); return }
        if (editingSubtaskId) { setEditingSubtaskId(null); return }
        // Don't close panel if user is editing
        if (isEditingDesc || isAddingSubtask || editingDueDate) return
        closeTaskDetail()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDetailPanelOpen, isEditingDesc, isAddingSubtask, editingDueDate, imagePreview, editingSubtaskId, closeTaskDetail])

  // Close priority menu on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (priorityMenuRef.current && !priorityMenuRef.current.contains(e.target as Node)) {
        setShowPriorityMenu(false)
      }
    }
    if (showPriorityMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPriorityMenu])

  if (!selectedTask || !isDetailPanelOpen) return null

  // ---- AI ----
  async function fetchAIAnalysis() {
    if (!selectedTask) return
    setIsAnalyzing(true)
    try {
      await api.post(`/api/tasks/${selectedTask.id}/ai-analysis`)
      await fetchTasks()
      addActivityEvent('ai_analysis', 'AI analizi yenilendi', 'purple')
    } catch (e) {
      console.error("AI analiz yüklenemedi:", e)
    } finally {
      setIsAnalyzing(false)
    }
  }

  function addActivityEvent(type: ActivityEvent['type'], text: string, color: string) {
    setActivityLog(prev => [{
      id: `${Date.now()}_${Math.random()}`,
      type,
      text,
      timestamp: new Date(),
      color
    }, ...prev])
  }

  // ---- Handlers ----
  const saveTitle = async () => {
    if (!titleDraft.trim() || titleDraft === selectedTask.title) {
      setIsEditingTitle(false)
      return
    }
    const newTitle = titleDraft
    setIsEditingTitle(false)
    try {
      await updateTask(selectedTask.id, { title: newTitle } as any)
      await fetchTasks()
      addActivityEvent('description_edit', 'Başlık güncellendi', 'blue')
    } catch (e) { console.error(e) }
  }

  const saveDescription = async () => {
    const draft = descriptionDraft
    setIsEditingDesc(false)
    try {
      await updateTask(selectedTask.id, { description: draft })
      await fetchTasks()
      addActivityEvent('description_edit', 'Açıklama güncellendi', 'blue')
    } catch (e) { console.error(e) }
  }

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return
    const title = newSubtaskTitle
    setNewSubtaskTitle("")
    try {
      await addSubtask(selectedTask.id, { title, status: 'todo' })
      addActivityEvent('subtask_done', `"${title}" alt görevi eklendi`, 'teal')
    } catch (e) { console.error(e) }
  }

  const openSubtaskEdit = (st: Task) => {
    setEditingSubtaskId(st.id)
    setSubtaskEditTitle(st.title)
    setSubtaskEditDesc(st.description || "")
  }

  const saveSubtaskEdit = async () => {
    if (!editingSubtaskId || !subtaskEditTitle.trim()) return
    const idToUpdate = editingSubtaskId
    const newTitle = subtaskEditTitle
    const newDesc = subtaskEditDesc
    setEditingSubtaskId(null)
    try {
      await updateTask(idToUpdate, { title: newTitle, description: newDesc } as any)
      await fetchTasks()
      addActivityEvent('description_edit', `"${newTitle}" alt görevi güncellendi`, 'blue')
    } catch (e) { console.error(e) }
  }

  const cancelSubtaskEdit = () => {
    setEditingSubtaskId(null)
  }

  const handleSubtaskToggle = async (st: Task) => {
    const newStatus = st.status === 'done' ? 'todo' : 'done'
    await updateTaskStatus(st.id, newStatus)
    if (newStatus === 'done') {
      const remaining = subtasks.filter(s => s.id !== st.id && s.status !== 'done').length
      addActivityEvent('subtask_done', `"${st.title}" tamamlandı${remaining === 0 ? ' — Tüm alt görevler bitti! 🎉' : ''}`, 'emerald')
    }
  }

  const saveDueDate = async () => {
    const dueDate = dueDateDraft ? new Date(dueDateDraft).toISOString() : null
    const draftText = dueDateDraft
    setEditingDueDate(false)
    try {
      await updateTask(selectedTask.id, { due_date: dueDate } as any)
      await fetchTasks()
      addActivityEvent('date_change', `Hedef tarih ${draftText ? format(new Date(draftText), 'dd MMM yyyy', { locale: tr }) : 'kaldırıldı'}`, 'amber')
    } catch (e) { console.error(e) }
  }

  const handleDeleteSubtask = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteTask(id)
  }

  const handleStatusChange = (status: 'todo' | 'in_progress' | 'in_review' | 'done') => {
    updateTaskStatus(selectedTask.id, status)
    const label = statusConfig[status]?.label || status
    addActivityEvent('status_change', `Durum "${label}" olarak değiştirildi`, 'indigo')
  }

  const handlePriorityChange = async (priority: string) => {
    await updateTask(selectedTask.id, { priority } as any)
    await fetchTasks()
    setShowPriorityMenu(false)
    const pLabel = priorityConfig[priority]?.label || priority
    addActivityEvent('status_change', `Öncelik "${pLabel}" olarak değiştirildi`, 'amber')
  }


  // ---- Config ----
  const priorityConfig: Record<string, { label: string; gradient: string; flagColor: string }> = {
    urgent: { label: 'Acil', gradient: 'from-rose-400 to-orange-400', flagColor: 'text-rose-500' },
    high: { label: 'Yüksek', gradient: 'from-orange-400 to-amber-400', flagColor: 'text-orange-500' },
    normal: { label: 'Normal', gradient: 'from-amber-300 to-yellow-400', flagColor: 'text-amber-500' },
    medium: { label: 'Orta', gradient: 'from-amber-300 to-yellow-400', flagColor: 'text-amber-500' },
    low: { label: 'Düşük', gradient: 'from-emerald-300 to-teal-400', flagColor: 'text-emerald-500' },
  }

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    todo: { label: 'Bekliyor', color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-400' },
    in_progress: { label: 'Devam Ediyor', color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500' },
    in_review: { label: 'İncelemede', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500' },
    done: { label: 'Tamamlandı', color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500' },
  }

  const pConfig = priorityConfig[selectedTask.priority] || priorityConfig['medium']
  const sConfig = statusConfig[selectedTask.status] || statusConfig['todo']

  // Activity icon resolver
  const getActivityIcon = (event: ActivityEvent) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    }
    const iconMap: Record<string, React.ReactNode> = {
      status_change: <Activity className="w-3 h-3" />,
      ai_analysis: <Bot className="w-3 h-3" />,
      subtask_done: <CheckCircle2 className="w-3 h-3" />,
      created: <Plus className="w-3 h-3" />,
      description_edit: <Pencil className="w-3 h-3" />,
      date_change: <Calendar className="w-3 h-3" />,
    }
    return (
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[event.color || 'blue']}`}>
        {iconMap[event.type] || <Activity className="w-3 h-3" />}
      </div>
    )
  }

  const totalEstimated = selectedTask.estimated_minutes || subtasks.reduce((acc, st) => acc + (st.estimated_minutes || 0), 0);
  const totalActual = selectedTask.actual_minutes || subtasks.reduce((acc, st) => acc + (st.actual_minutes || 0), 0);

  const calculateTotalDuration = () => {
    if (selectedTask.status !== 'done' || !selectedTask.completed_at) return "—";
    const start = new Date(selectedTask.created_at).getTime();
    const end = new Date(selectedTask.completed_at).getTime();
    const diffMins = Math.max(0, Math.round((end - start) / 60000));
    
    if (diffMins < 60) return `${diffMins}dk`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours < 24) return `${hours}s ${mins}dk`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}g ${remainingHours}s`;
  };

  return (
    <>
      {/* Fullscreen Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
        onClick={closeTaskDetail}
      />

      {/* Modal Container — BÜYÜTÜLMÜŞ */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-5 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-full md:max-w-[1280px] h-full md:h-[92vh] rounded-none md:rounded-3xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 border-0 md:border border-slate-200/60 dark:border-white/10 shadow-2xl shadow-indigo-500/10 bg-white dark:bg-slate-900 flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* ============ HEADER ============ */}
          <div className="relative px-4 md:px-8 pt-4 md:pt-6 pb-3 md:pb-5 border-b border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 shrink-0">
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${pConfig.gradient}`} />

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {project && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white shadow-sm"
                      style={{ backgroundColor: project.color || '#6366f1' }}>
                      {project.name}
                    </span>
                  )}
                  <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${sConfig.color}`}>
                    <span className={`w-2 h-2 rounded-full ${sConfig.bg} shadow-sm`} />
                    {sConfig.label}
                  </span>
                  {/* Tıklanabilir Öncelik Badge */}
                  <div className="relative" ref={priorityMenuRef}>
                    <button
                      onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${pConfig.gradient} text-white shadow-sm flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer`}
                    >
                      <Flag className="w-3 h-3" />
                      {pConfig.label}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showPriorityMenu && (
                      <div className="absolute top-full left-0 mt-1 z-20 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        {Object.entries(priorityConfig).filter(([k]) => k !== 'normal').map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => handlePriorityChange(key)}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                              selectedTask.priority === key ? 'bg-slate-50 dark:bg-slate-700' : ''
                            }`}
                          >
                            <Flag className={`w-3 h-3 ${cfg.flagColor}`} />
                            {cfg.label}
                            {selectedTask.priority === key && <CheckCircle2 className="w-3 h-3 text-indigo-500 ml-auto" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <Input value={titleDraft} onChange={e => setTitleDraft(e.target.value)}
                           className="text-xl md:text-2xl font-black text-slate-800 dark:text-white/95 h-12 bg-white dark:bg-black/20"
                           autoFocus
                           onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setIsEditingTitle(false); setTitleDraft(selectedTask.title); } }} />
                    <Button onClick={saveTitle} size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white shrink-0">Kaydet</Button>
                    <button onClick={() => { setIsEditingTitle(false); setTitleDraft(selectedTask.title); }} className="p-2 text-slate-400 hover:text-slate-600 shrink-0"><X className="w-5 h-5"/></button>
                  </div>
                ) : (
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white/95 leading-tight group flex items-center gap-2 cursor-pointer transition-colors hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setIsEditingTitle(true)}>
                    {selectedTask.title}
                    <Pencil className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h2>
                )}

                {/* Meta Row */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-semibold text-slate-500 dark:text-white/40">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Oluşturulma: {selectedTask.created_at ? format(new Date(selectedTask.created_at), "dd MMM yyyy HH:mm", { locale: tr }) : "—"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {elapsedTime}
                  </span>
                  {selectedTask.due_date && (
                    <span className="flex items-center gap-1.5 text-orange-500 dark:text-orange-400">
                      <Target className="w-3.5 h-3.5" />
                      Hedef: {format(new Date(selectedTask.due_date), "dd MMM yyyy", { locale: tr })}
                    </span>
                  )}
                </div>
              </div>

              <button onClick={closeTaskDetail}
                className="mt-1 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/40 dark:hover:text-white transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status + Due Date */}
            <div className="flex items-center gap-2 mt-4">
              {(['todo', 'in_progress', 'in_review', 'done'] as const).map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
                    selectedTask.status === s
                      ? 'bg-indigo-600 text-white shadow-indigo-500/30'
                      : 'bg-white dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
                  }`}
                >
                  {statusConfig[s].label}
                </button>
              ))}
              <div className="flex-1" />
              {editingDueDate ? (
                <div className="flex items-center gap-2">
                  <input type="date" value={dueDateDraft} onChange={e => setDueDateDraft(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/20 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner" />
                  <Button size="sm" className="h-8 text-xs font-bold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white px-4" onClick={saveDueDate}>Kaydet</Button>
                  <button onClick={() => setEditingDueDate(false)} className="text-slate-400 hover:text-slate-600 dark:text-white/30"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <button onClick={() => setEditingDueDate(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-white/5 text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10 shadow-sm"
                >
                  <CalendarClock className="w-4 h-4 opacity-70" />
                  {selectedTask.due_date ? 'Tarihi Düzenle' : 'Hedef Tarih Ekle'}
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {subtasks.length > 0 && (
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full transition-all duration-700 ease-out ${progress === 100 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                    style={{ width: `${progress}%` }} />
                </div>
                <span className={`text-sm font-black min-w-[36px] ${progress === 100 ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                  {progress}%
                </span>
              </div>
            )}
          </div>

          {/* ============ BODY — SOL / SAĞ LAYOUT ============ */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            
            {/* ===== SOL PANEL — BÜYÜK ===== */}
            <div className="flex-1 flex flex-col overflow-y-auto md:border-r border-slate-200/50 dark:border-white/5">
              
              {/* AÇIKLAMA */}
              <div className="p-4 md:p-7 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white/90">Görev Açıklaması</h3>
                  {!isEditingDesc && (
                    <button onClick={() => setIsEditingDesc(true)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-white/40 dark:hover:text-white/80 flex items-center gap-1.5 transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Düzenle
                    </button>
                  )}
                </div>

                {isEditingDesc ? (
                  <div className="space-y-3">
                    <Textarea value={descriptionDraft} onChange={e => setDescriptionDraft(e.target.value)}
                      placeholder="Açıklama, linkler, notlar ekleyin..."
                      className="min-h-[160px] text-sm bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 resize-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl shadow-inner font-medium"
                      autoFocus />
                    <div className="flex items-center justify-end gap-2 sticky bottom-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 py-4 border-t border-slate-100 dark:border-white/5 -mx-7 px-7 mt-2">
                       <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-white/50 rounded-xl px-4" onClick={() => setIsEditingDesc(false)}>
                         İptal
                       </Button>
                       <Button size="sm" className="h-8 text-xs font-bold gap-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white px-5" onClick={saveDescription}>
                         <Save className="w-3.5 h-3.5" /> Kaydet
                       </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 p-5 cursor-text hover:bg-slate-100/50 dark:hover:bg-white/10 transition-all min-h-[100px] shadow-sm"
                    onClick={() => setIsEditingDesc(true)}>
                    {selectedTask.description ? (
                      <div className="text-sm font-medium text-slate-600 dark:text-white/70 whitespace-pre-wrap break-words leading-relaxed">
                        {selectedTask.description}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-slate-400 dark:text-white/30 italic">Açıklama eklemek için tıklayın...</p>
                    )}
                  </div>
                )}

                {/* Durum + Tarih Info + Cross-reference badges */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold text-slate-500 dark:text-white/50">
                  <span>Durum: <span className={`${sConfig.color} font-bold`}>{sConfig.label}</span></span>
                  {selectedTask.due_date && (
                    <span>Tarih: <span className="text-slate-700 dark:text-white/70 font-bold">{format(new Date(selectedTask.due_date), 'dd MMM yyyy', { locale: tr })}</span></span>
                  )}
                  <span>Öncelik: <span className="font-bold text-slate-700 dark:text-white/70">{pConfig.label}</span></span>
                  <LinkedItemsBadges taskId={selectedTask.id} />
                </div>

                {/* Gömülü Resimler */}
                {descImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-white/50 flex items-center gap-1.5 mb-2">
                      <Paperclip className="w-3 h-3" /> Eklentiler ({descImages.length})
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {descImages.map((url, i) => (
                        <img key={i} src={url} alt={`Ek ${i + 1}`}
                          className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-white/10 shadow-sm cursor-zoom-in hover:scale-105 transition-transform duration-300"
                          onClick={() => setImagePreview(url)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* TÜM GÖREVLER (Alt Görevler) — Referans: "Tüm Görevler" */}
              <div className="p-7 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white/90 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-blue-500" />
                    Alt Görevler
                    {subtasks.length > 0 && (
                      <span className="text-[10px] bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/60 px-2.5 py-0.5 rounded-full font-black ml-1">
                        {doneSubtasks.length}/{subtasks.length}
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={async () => {
                      setIsAnalyzing(true)
                      try { await api.post(`/api/breakdown/${selectedTask.id}`); await fetchTasks() } catch (e) { console.error(e) }
                      finally { setIsAnalyzing(false) }
                    }}
                    disabled={isAnalyzing}
                    className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400/70 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    AI ile Böl
                  </button>
                </div>

                {/* Subtask List — referans tarzı: her satır ayrı, sağda tarih */}
                <div className="space-y-1">
                  {subtasks.map((st) => (
                    editingSubtaskId === st.id ? (
                      <div key={st.id} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-indigo-200 dark:border-indigo-500/30 shadow-sm animate-in fade-in">
                        <Input value={subtaskEditTitle} onChange={e => setSubtaskEditTitle(e.target.value)} placeholder="Alt görev adı" className="h-8 text-sm font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" autoFocus />
                        <Textarea value={subtaskEditDesc} onChange={e => setSubtaskEditDesc(e.target.value)} placeholder="Açıklama (opsiyonel)" className="min-h-[60px] text-xs resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                        <div className="flex justify-end gap-2 mt-1">
                           <Button size="sm" variant="ghost" onClick={cancelSubtaskEdit} className="h-7 text-[11px] px-3">İptal</Button>
                           <Button size="sm" onClick={saveSubtaskEdit} className="h-7 text-[11px] px-4 bg-indigo-500 hover:bg-indigo-600 text-white">Kaydet</Button>
                        </div>
                      </div>
                    ) : (
                    <div key={st.id} className="group flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200/50 dark:hover:border-white/10 cursor-pointer" onClick={() => openSubtaskEdit(st)}>
                      <button onClick={(e) => { e.stopPropagation(); handleSubtaskToggle(st); }} className="flex-shrink-0">
                        {st.status === 'done'
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          : <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-500 dark:text-white/20 dark:hover:text-indigo-400 transition-colors" />
                        }
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {st.description && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-white/30 flex-shrink-0" />}
                          <span className={`text-sm font-medium ${st.status === 'done' ? 'line-through text-slate-400 dark:text-white/40' : 'text-slate-700 dark:text-white/90'}`}>
                            {st.title}
                          </span>
                        </div>
                        {st.description && (
                          <p className="text-[11px] text-slate-500 dark:text-white/40 mt-0.5 ml-5 leading-snug">{st.description}</p>
                        )}
                      </div>
                      {st.estimated_minutes && (
                        <span className="text-[10px] font-bold text-slate-400 dark:text-white/30 px-2 py-0.5 bg-slate-100 dark:bg-black/20 rounded-md">
                          {st.estimated_minutes}dk
                        </span>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); openSubtaskEdit(st); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600 p-1 rounded-lg">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => handleDeleteSubtask(st.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 p-1 rounded-lg">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    )
                  ))}
                </div>

                {/* Add subtask */}
                {isAddingSubtask ? (
                  <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <Input ref={subtaskInputRef} value={newSubtaskTitle} onChange={e => setNewSubtaskTitle(e.target.value)}
                      placeholder="Detaylı bir adım..."
                      className="text-sm h-9 flex-1 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-xl"
                      onKeyDown={e => { if (e.key === 'Enter') handleAddSubtask(); if (e.key === 'Escape') { setIsAddingSubtask(false); setNewSubtaskTitle("") } }} />
                    <Button size="sm" className="h-9 text-xs font-bold px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white" onClick={handleAddSubtask}>Ekle</Button>
                    <button onClick={() => { setIsAddingSubtask(false); setNewSubtaskTitle("") }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button onClick={() => setIsAddingSubtask(true)}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all border border-dashed border-slate-300 dark:border-white/10 hover:border-indigo-500/50">
                    <Plus className="w-4 h-4" /> Yeni Alt Görev Ekle
                  </button>
                )}

                {subtasks.length === 0 && !isAddingSubtask && (
                  <p className="text-xs font-medium text-slate-500 dark:text-white/30 text-center py-6">
                    Burayı küçük adımlara bölmek işi kolaylaştırır. <br/><span className="text-indigo-500 font-bold">AI ile Böl</span> butonunu deneyin.
                  </p>
                )}
              </div>
            </div>

            {/* ===== SAĞ PANEL — YENİDEN DÜZENLENDİ ===== */}
            <div className="w-full md:w-[400px] shrink-0 flex flex-col overflow-hidden bg-slate-50/30 dark:bg-black/10">
              
              {/* ÜST: İLERLEME ÖZETİ + SÜRE */}
              <div className="p-5 border-b border-slate-100 dark:border-white/5 shrink-0">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-500/10 dark:to-teal-500/5 border border-emerald-100 dark:border-emerald-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400/80">İlerleme Özeti</span>
                  </div>
                  <p className="text-[11px] font-medium text-emerald-800/80 dark:text-emerald-100/60 leading-relaxed">
                    {subtasks.length > 0
                      ? `${subtasks.length} alt görevden ${doneSubtasks.length} tanesi tamamlandı (${progress}%). ${
                          progress === 100 ? 'Harika, görev tamamlanmaya hazır! 🎉' :
                          progress >= 50 ? 'Yarıdan fazlası bitti, devam et! 💪' :
                          'Henüz başlangıç aşamasında, ilk adıma odaklan.'
                        }`
                      : 'Alt görev eklendikçe ilerleme burada özetlenecek.'
                    }
                  </p>
                  <div className="flex gap-2 mt-3 w-2/3 mx-auto">
                    <div className="flex-1 bg-white/80 dark:bg-slate-800/60 rounded-lg p-1.5 text-center flex flex-col justify-center">
                      <p className="text-sm font-black text-slate-800 dark:text-white/90">
                        {totalActual}<span className="text-[10px] font-bold text-slate-400 ml-0.5">dk</span>
                      </p>
                      <p className="text-[9px] font-bold uppercase text-slate-500 dark:text-white/50">Harcanan</p>
                    </div>
                    <div className="flex-1 bg-white/80 dark:bg-slate-800/60 rounded-lg p-1.5 text-center flex flex-col justify-center">
                      <p className="text-sm font-black text-slate-800 dark:text-white/90">
                        {totalEstimated || '—'}<span className="text-[10px] font-bold text-slate-400 ml-0.5">{totalEstimated ? 'dk' : ''}</span>
                      </p>
                      <p className="text-[9px] font-bold uppercase text-slate-500 dark:text-white/50">Tahmini</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ORTA: YAPAY ZEKA — Daraltılmış, hover'da genişler */}
              <div className="border-b border-slate-100 dark:border-white/5 shrink-0 group/ai">
                <div className="p-4 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-white/80 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-500" />
                      Yapay Zeka Asistanı
                    </h3>
                    <button onClick={fetchAIAnalysis} disabled={isAnalyzing}
                      className="text-[10px] font-semibold text-purple-500 hover:text-purple-600 flex items-center gap-1 transition-colors disabled:opacity-50">
                      {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Yenile
                    </button>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-purple-100/80 to-indigo-100/60 dark:from-purple-500/15 dark:to-indigo-500/10 border border-purple-200/50 dark:border-purple-500/20 p-3 shadow-sm relative overflow-hidden transition-all duration-300 max-h-[70px] group-hover/ai:max-h-[400px] group-hover/ai:p-4">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-400/20 blur-3xl rounded-full" />
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2 text-xs font-medium text-purple-600/70 dark:text-purple-300/60">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
                        Büyük zeka düşünüyor...
                      </div>
                    ) : selectedTask.ai_analysis ? (
                      <p className="text-[12px] font-medium text-slate-700 dark:text-white/80 leading-relaxed whitespace-pre-wrap relative z-10 line-clamp-3 group-hover/ai:line-clamp-none transition-all duration-300">{selectedTask.ai_analysis}</p>
                    ) : (
                      <p className="text-[12px] font-medium text-slate-400 dark:text-white/30 italic relative z-10">AI analizi yok. Yenile'ye tıklayın.</p>
                    )}
                    {/* Hover ipucu — sadece collapsed iken */}
                    {selectedTask.ai_analysis && (
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-purple-100/90 dark:from-purple-900/40 to-transparent pointer-events-none group-hover/ai:opacity-0 transition-opacity" />
                    )}
                  </div>

                  {/* Geçmiş Analizler — hover'da görünür */}
                  {selectedTask.ai_analysis_history && selectedTask.ai_analysis_history.length > 0 && (
                    <div className="mt-2 space-y-1.5 max-h-0 overflow-hidden group-hover/ai:max-h-[200px] transition-all duration-300">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40">Geçmiş Analizler</h4>
                      {selectedTask.ai_analysis_history.slice(0, 3).map((hist: any, i: number) => (
                        <div key={i} className="rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-2">
                          <p className="text-[9px] text-slate-400 dark:text-white/40 mb-0.5 font-semibold">{format(new Date(hist.created_at), "dd MMM yyyy HH:mm", { locale: tr })}</p>
                          <p className="text-[11px] font-medium text-slate-600 dark:text-white/60 line-clamp-1">{hist.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ALT: İŞLEM GEÇMİŞİ — TAM GENIŞLIK */}
              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="px-5 pt-5 pb-2 shrink-0">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-white/80 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-500" />
                    İşlem Geçmişi
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-5 min-h-0">
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[13px] top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10" />

                    <div className="space-y-4 pt-1">
                      {activityLog.map(event => (
                        <div key={event.id} className="flex items-start gap-3 relative">
                          {getActivityIcon(event)}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-[12px] font-medium text-slate-700 dark:text-white/80 leading-snug">{event.text}</p>
                            <p className="text-[10px] text-slate-400 dark:text-white/40 mt-0.5 font-semibold">
                              {format(event.timestamp, "dd MMM yyyy, HH:mm", { locale: tr })}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {activityLog.length === 0 && (
                        <div className="text-center py-8">
                          <Activity className="w-8 h-8 text-slate-200 dark:text-white/10 mx-auto mb-3" />
                          <p className="text-xs text-slate-400 dark:text-white/30 font-medium">Henüz işlem geçmişi yok</p>
                          <p className="text-[10px] text-slate-300 dark:text-white/20 mt-1">Görevde değişiklik yapıldığında burada görünecek</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ IMAGE PREVIEW LIGHTBOX ============ */}
      {imagePreview && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-200"
          onClick={() => setImagePreview(null)}>
          <img src={imagePreview} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/20 animate-in zoom-in-95 duration-300" />
          <button onClick={() => setImagePreview(null)} className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 text-white hover:bg-white/25 transition-colors backdrop-blur-md">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  )
}
