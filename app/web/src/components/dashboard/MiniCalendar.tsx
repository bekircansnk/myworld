"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { tr } from "date-fns/locale"
import { useTaskStore } from "@/stores/taskStore"
import { useNoteStore } from "@/stores/noteStore"
import { useProjectStore } from "@/stores/projectStore"
import { isSameDay, format } from "date-fns"
import { Target, CalendarDays } from "lucide-react"
import { DailyAgendaModal } from "./DailyAgendaModal"

export function MiniCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [isAgendaOpen, setIsAgendaOpen] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const { tasks } = useTaskStore()
  const { notes } = useNoteStore()
  const { projects } = useProjectStore()

  React.useEffect(() => {
    setDate(new Date())
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="glass-card rounded-3xl flex flex-col h-full min-h-[300px]" />

  // Due date olan görevleri bul
  const tasksWithDueDate = tasks.filter(t => t.due_date && !t.parent_task_id)
  const taskDueDates = tasksWithDueDate.map(t => new Date(t.due_date!))

  // O gün oluşturulan notlar için bir modifier de eklenebilir
  const notesWithCreationDate = notes.filter(n => n.created_at)
  const allItemDates = [
    ...taskDueDates,
    ...notesWithCreationDate.map(n => new Date(n.created_at!))
  ]

  // Takvim günlerini custom render et — due date olan günlere nokta koy
  const modifiers = {
    hasItem: allItemDates,
  }

  const modifiersStyles = {
    hasItem: {
      position: 'relative' as const,
    },
  }

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      setIsAgendaOpen(true)
    }
  }

  return (
    <div className="glass-card flex flex-col rounded-3xl h-full relative overflow-hidden">
      {/* Yumuşak gradient arka plan */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-sky-400/10 rounded-full blur-3xl" />
      
      <div className="p-5 pb-2 relative z-10 border-b border-border/30">
        <h3 className="text-sm font-extrabold flex items-center justify-between text-slate-800 dark:text-slate-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            Takvim
          </div>
          {tasksWithDueDate.length > 0 && (
            <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-black tracking-widest shadow-inner">
              {tasksWithDueDate.length} HEDEF
            </span>
          )}
        </h3>
      </div>
      
      <div className="p-4 pt-1 flex flex-col gap-3 relative z-10 flex-1">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          className="rounded-2xl bg-white/50 dark:bg-slate-900/40 p-2 shadow-inner !w-full"
          locale={tr}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          modifiersClassNames={{
            hasItem: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-indigo-500 after:shadow-[0_0_8px_rgba(99,102,241,0.8)]"
          }}
        />
      </div>
      
      {date && (
        <DailyAgendaModal 
          date={date} 
          isOpen={isAgendaOpen} 
          onClose={() => setIsAgendaOpen(false)} 
        />
      )}
    </div>


  )
}
