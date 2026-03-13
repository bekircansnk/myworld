"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"

export function TodayTasks() {
  const { tasks, updateTaskStatus } = useTaskStore()

  // Bugün gelen, yapılacak ve devam eden öncelikli 3 taskı çekelim (veya acil olanları)
  const todayTasks = React.useMemo(() => {
    return tasks
      .filter(t => t.status !== 'done')
      .sort((a, b) => {
        // Acil olanları ve tarihi eski/bugün olanları üste çıkar
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        return 0;
      })
      .slice(0, 4)
  }, [tasks])

  return (
    <Card className="h-full flex flex-col shadow-sm border border-border/50">
      <CardHeader className="p-4 pb-2 border-b">
        <CardTitle className="text-sm font-medium">✨ Odaklanılacak Görevler</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {todayTasks.length === 0 ? (
           <div className="p-4 text-center text-sm text-muted-foreground mt-4">
             Harika! Şimdilik acil veya bekleyen bir işiniz yok.
           </div>
        ) : (
          <ul className="divide-y">
            {todayTasks.map(task => (
              <li key={task.id} className="p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors">
                <button 
                  onClick={() => updateTaskStatus(task.id, 'done')}
                  className="mt-0.5 text-muted-foreground hover:text-green-500 transition-colors"
                >
                  <Circle className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">{task.title}</p>
                  {task.project && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                       {task.project.name}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
