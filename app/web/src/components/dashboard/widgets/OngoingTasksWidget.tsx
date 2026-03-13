"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { useProjectStore } from "@/stores/projectStore"
import { Circle, CheckCircle2, Zap, MoreHorizontal } from "lucide-react"

export function OngoingTasksWidget() {
  const { tasks, openTaskDetail } = useTaskStore()
  const { projects } = useProjectStore()

  // En acil bekleyen görevleri bul
  const urgentTasks = React.useMemo(() => {
    return tasks
      .filter(t => !t.parent_task_id && t.status !== 'done')
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { urgent: 0, medium: 1, normal: 1, low: 2 }
        return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
      })
      .slice(0, 3)
  }, [tasks])

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[17px] font-black tracking-tight flex items-center gap-2 text-slate-800 dark:text-white">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
            <Zap className="w-4 h-4" />
          </div>
          Devam Eden İşler
        </h3>
        <button className="text-slate-400 hover:text-indigo-500 transition-colors p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {urgentTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl inner-shadow-box">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tüm acil hedefler tamam!</p>
          </div>
        ) : (
          urgentTasks.map((task, idx) => {
            const subtasks = tasks.filter(t => t.parent_task_id === task.id)
            const doneSubs = subtasks.filter(t => t.status === 'done').length
            const progress = subtasks.length > 0 ? Math.round((doneSubs / subtasks.length) * 100) : 0
            const project = projects.find(p => p.id === task.project_id)
            const isFirst = idx === 0
            
            return (
              <div 
                key={task.id} 
                onClick={() => openTaskDetail(task)}
                className={`relative overflow-hidden p-4 rounded-2xl cursor-pointer transition-all duration-300 group
                  ${isFirst 
                    ? 'bg-gradient-to-r from-[#DFF5E8] to-[#EFFFF5] dark:from-[#132A1F] dark:to-[#193A2A] border border-[#cbeadd]/50 dark:border-[#132A1F]/50 shadow-sm'
                    : 'bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-white/5 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-white dark:hover:bg-[#1a1e2e]'
                  }
                `}
              >
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-xl shrink-0 ${isFirst ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-[#1a1e2e] shadow-sm text-slate-400'}`}>
                      <Circle className={`w-4 h-4 ${isFirst ? 'fill-emerald-500/20' : ''}`} />
                    </div>
                    <div>
                      {project && (
                        <p className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${isFirst ? 'text-emerald-700/60 dark:text-emerald-400/60' : 'text-slate-400'}`}>
                          {project.name}
                        </p>
                      )}
                      <h4 className={`text-[13px] font-bold line-clamp-1 leading-tight ${isFirst ? 'text-emerald-900 dark:text-emerald-50' : 'text-slate-700 dark:text-slate-200'}`}>
                        {task.title}
                      </h4>
                    </div>
                  </div>
                  <span className={`text-[11px] font-black ${isFirst ? 'text-emerald-600 dark:text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-lg' : 'text-slate-400'}`}>
                    {progress}%
                  </span>
                </div>

                <div className="relative z-10 w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isFirst ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
