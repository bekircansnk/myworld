"use client"

import * as React from "react"
import { Task } from "@/types"
import { useTaskStore } from "@/stores/taskStore"
import { Trash2, Calendar, MoreHorizontal, CheckSquare, Edit2, Camera } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { showContextMenu } from "@/components/ui/ContextMenu"
import { format, isPast } from "date-fns"
import { tr } from "date-fns/locale"

interface TaskCardProps {
  task: Task
  subtaskCount?: number
  doneSubtaskCount?: number
  isProjectView?: boolean
}

// Kart arka plan rengi — proje rengine göre hafif tonlama
function getCardStyle(color?: string): React.CSSProperties {
  if (!color) {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      borderColor: 'rgba(0, 0, 0, 0.05)',
    }
  }
  try {
    const c = color.replace('#', '')
    const r = parseInt(c.substring(0, 2), 16)
    const g = parseInt(c.substring(2, 4), 16)
    const b = parseInt(c.substring(4, 6), 16)
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.06)`,
      borderColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
    }
  } catch {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      borderColor: 'rgba(0, 0, 0, 0.05)',
    }
  }
}

function getCardStyleDark(color?: string): React.CSSProperties {
  if (!color) {
    return {
      backgroundColor: 'rgba(30, 34, 50, 0.90)',
      borderColor: 'rgba(255, 255, 255, 0.06)',
    }
  }
  try {
    const c = color.replace('#', '')
    const r = parseInt(c.substring(0, 2), 16)
    const g = parseInt(c.substring(2, 4), 16)
    const b = parseInt(c.substring(4, 6), 16)
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
      borderColor: `rgba(${r}, ${g}, ${b}, 0.20)`,
    }
  } catch {
    return {
      backgroundColor: 'rgba(30, 34, 50, 0.90)',
      borderColor: 'rgba(255, 255, 255, 0.06)',
    }
  }
}

// İlerleme çubuğu — ince, minimal
function ProgressBar({ percent, accentColor }: { percent: number; accentColor: string }) {
  return (
    <div className="w-full h-1 bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: accentColor }}
      />
    </div>
  )
}

export function TaskCard({ task, subtaskCount = 0, doneSubtaskCount = 0, isProjectView = false }: TaskCardProps) {
  const { openTaskDetail, deleteTask } = useTaskStore()
  const [isOpening, setIsOpening] = React.useState(false)

  const handleOpen = React.useCallback(() => {
    if (isOpening) return
    setIsOpening(true)
    openTaskDetail(task)
    requestAnimationFrame(() => setIsOpening(false))
  }, [isOpening, openTaskDetail, task])

  const hasDescription = !!task.description && task.description.trim().length > 0
  const hasSubtasks = subtaskCount > 0
  const progressPercent = hasSubtasks ? Math.round((doneSubtaskCount / subtaskCount) * 100) : 0

  // Dark mode algılama
  const [isDark, setIsDark] = React.useState(false)
  React.useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'))
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)

  // Proje rengi
  const effectiveColor = task.project?.color
  const cardStyle = isDark ? getCardStyleDark(effectiveColor) : getCardStyle(effectiveColor)
  const accentColor = effectiveColor || '#f59e0b'

  const handleContextMenu = (e: React.MouseEvent) => {
    showContextMenu(e, [
      {
        label: 'Düzenle',
        icon: <Edit2 className="w-full h-full" />,
        onClick: handleOpen,
      },
      {
        label: 'Görevi Sil',
        icon: <Trash2 className="w-full h-full" />,
        onClick: () => setIsDeleteConfirmOpen(true),
        variant: 'destructive' as const,
        separator: true,
      }
    ])
  }

  // Metadata satırı — tarih, alt görevler, fotoğraflar
  const hasMetadata = task.due_date || hasSubtasks || (task.task_photos && task.task_photos.length > 0)

  return (
    <>
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Görevi Sil"
        description="Bu kartı silmek istediğine emin misin? Bu işlem geri alınamaz."
        confirmText="Sil"
        onConfirm={() => deleteTask(task.id)}
      />
      <div
        className="rounded-lg p-3 cursor-pointer group transition-all duration-150 hover:shadow-md border"
        style={cardStyle}
        onClick={handleOpen}
        onContextMenu={handleContextMenu}
      >
        {/* Etiketler — Proje adı ve öncelik */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {task.project && (
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-300 flex items-center gap-1 truncate max-w-[140px]">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: effectiveColor || '#f59e0b' }}
                />
                {task.project.name}
              </span>
            )}
            {task.priority === 'urgent' && (
              <span className="text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded-full">
                Acil
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-opacity opacity-0 group-hover:opacity-100 flex items-center justify-center border-0 focus:outline-none appearance-none bg-transparent"
              title="Seçenekler"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-sm" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={handleOpen}>Düzenle</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteConfirmOpen(true);
                }}
              >
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Başlık — Trello tarzı okunaklı */}
        <h4 className={`font-semibold text-gray-800 dark:text-white text-sm leading-snug mb-1 ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>
          {task.title}
        </h4>

        {/* Not / Açıklama — 2 satır, okunaklı */}
        {hasDescription && (
          <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-2">
            {task.description}
          </p>
        )}

        {/* İlerleme çubuğu */}
        {hasSubtasks && (
          <div className="mb-2">
            <ProgressBar percent={progressPercent} accentColor={accentColor} />
          </div>
        )}

        {/* Metadata satırı */}
        {hasMetadata && (
          <div className="flex items-center gap-2.5 text-[10px] text-gray-400 dark:text-gray-500 font-medium pt-1">
            {task.due_date && (
              <span className={`flex items-center gap-1 ${
                isPast(new Date(task.due_date)) && task.status !== 'done' ? 'text-red-500' : ''
              }`}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.due_date), "dd MMM", { locale: tr })}
              </span>
            )}

            {hasSubtasks && (
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                {doneSubtaskCount}/{subtaskCount}
              </span>
            )}

            {task.task_photos && task.task_photos.length > 0 && (
              <span className="flex items-center gap-1 text-indigo-400">
                <Camera className="w-3 h-3" />
                {task.task_photos.length}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  )
}
