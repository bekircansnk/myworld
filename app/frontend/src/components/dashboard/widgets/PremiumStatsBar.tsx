"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { useProjectStore } from "@/stores/projectStore"
import { CheckCircle2, Circle, Clock, FolderKanban } from "lucide-react"

export function PremiumStatsBar() {
  const { tasks } = useTaskStore()
  const { projects } = useProjectStore()
  
  const { active, done, inProgress } = React.useMemo(() => {
    const mainTasks = tasks.filter(t => !t.parent_task_id)
    return {
      active: mainTasks.filter(t => t.status !== 'done').length,
      done: mainTasks.filter(t => t.status === 'done').length,
      inProgress: mainTasks.filter(t => t.status === 'in_progress').length
    }
  }, [tasks])
  
  const statCards = [
    { label: "Bekleyen Görevler", value: active, icon: Circle, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "" },
    { label: "Devam Eden", value: inProgress, icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", border: "" },
    { label: "Tamamlanan", value: done, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "" },
    { label: "Aktif Firmalar", value: projects.length, icon: FolderKanban, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10", border: "" },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, i) => (
        <div key={i} className="glass-card p-5 flex items-center gap-4 group cursor-pointer hover:-translate-y-1">
          <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-500 flex-shrink-0`}>
             <stat.icon className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none md:mb-1">{stat.value}</p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 truncate uppercase tracking-wider">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
