"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTaskStore } from "@/stores/taskStore"
import { useNoteStore } from "@/stores/noteStore"
import { useProjectStore } from "@/stores/projectStore"
import { format, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"
import { Target, NotebookPen, CalendarDays } from "lucide-react"

interface DailyAgendaModalProps {
  date: Date
  isOpen: boolean
  onClose: () => void
}

export function DailyAgendaModal({ date, isOpen, onClose }: DailyAgendaModalProps) {
  const { tasks, openTaskDetail } = useTaskStore()
  const { notes, openNoteDetail } = useNoteStore()
  const { projects } = useProjectStore()

  // Due date olan görevleri bul
  const selectedDayTasks = tasks.filter(t => t.due_date && !t.parent_task_id && isSameDay(new Date(t.due_date), date))
  // O gün oluşturulan notları bul
  const selectedDayNotes = notes.filter(n => n.created_at && isSameDay(new Date(n.created_at), date))

  const handleTaskClick = (task: any) => {
    openTaskDetail(task)
    onClose()
  }

  const handleNoteClick = (note: any) => {
    openNoteDetail(note)
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border border-white/20 dark:border-white/10 sm:max-w-[600px] md:max-w-[700px] shadow-2xl p-0 overflow-hidden !rounded-3xl">
        <div className="p-6 border-b border-border/10 bg-gradient-to-r from-sky-500/10 to-transparent">
          <DialogTitle className="text-xl font-extrabold flex items-center gap-3 text-slate-800 dark:text-slate-100">
            <div className="p-2 rounded-xl bg-white shadow-sm dark:bg-slate-800">
              <CalendarDays className="w-5 h-5 text-sky-500" />
            </div>
            {format(date, "d MMMM yyyy, EEEE", { locale: tr })}
          </DialogTitle>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            O gün planlanmış görevleriniz ve aldığınız notlar.
          </p>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
          {selectedDayTasks.length === 0 && selectedDayNotes.length === 0 && (
            <div className="text-center py-10 text-slate-500">
               <p className="font-semibold text-lg">Bu gün için herhangi bir kayıt yok.</p>
               <p className="text-sm">Görev veya not eklendiğinde burada görünecektir.</p>
            </div>
          )}

          {selectedDayTasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <span className="w-4 h-px bg-slate-200 dark:bg-slate-700"></span>
                Görevler ({selectedDayTasks.length})
              </h4>
              <div className="grid gap-2">
                {selectedDayTasks.map(t => {
                  const project = projects.find(p => p.id === t.project_id)
                  return (
                    <button 
                      key={t.id} 
                      onClick={() => handleTaskClick(t)}
                      className="flex items-start gap-3 py-3 px-4 w-full text-left rounded-xl bg-white/60 dark:bg-slate-800/60 shadow-sm border border-slate-100 dark:border-white/5 hover:translate-x-1 transition-transform group"
                    >
                      <Target className={`w-4 h-4 mt-0.5 flex-shrink-0 ${t.status === 'done' ? 'text-green-500' : 'text-orange-400'} group-hover:scale-110 transition-transform`} />
                      <div className="flex-1 min-w-0 pr-2">
                        <span className={`text-[14px] leading-relaxed font-semibold whitespace-normal break-words ${t.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {t.title}
                        </span>
                      </div>
                      {project && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white ml-auto flex-shrink-0 shadow-sm mt-0.5"
                          style={{ backgroundColor: project.color || '#6366f1' }}>
                          {project.name}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {selectedDayNotes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <span className="w-4 h-px bg-slate-200 dark:bg-slate-700"></span>
                Notlar ({selectedDayNotes.length})
              </h4>
              <div className="grid gap-2">
                {selectedDayNotes.map(n => {
                  const project = projects.find(p => p.id === n.project_id)
                  return (
                    <button 
                      key={n.id} 
                      onClick={() => handleNoteClick(n)}
                      className="flex items-start gap-3 py-3 px-4 w-full text-left rounded-xl bg-amber-50/60 dark:bg-amber-950/20 shadow-sm border border-amber-100/50 dark:border-amber-900/30 hover:translate-x-1 transition-transform group"
                    >
                      <NotebookPen className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500 group-hover:rotate-12 transition-transform" />
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="text-[14px] leading-relaxed font-semibold whitespace-normal break-words text-slate-700 dark:text-slate-200">
                          {n.title || n.content.substring(0, 100) + (n.content.length > 100 ? '...' : '')}
                        </span>
                      </div>
                      {project && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white ml-auto flex-shrink-0 shadow-sm mt-0.5"
                          style={{ backgroundColor: project.color || '#f59e0b' }}>
                          {project.name}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
