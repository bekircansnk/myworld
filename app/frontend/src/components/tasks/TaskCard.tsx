"use client"

import * as React from "react"
import { Task } from "@/types"
import { useTaskStore } from "@/stores/taskStore"
import { Trash2, Calendar, MoreHorizontal, CheckSquare, Palette } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { format, isPast } from "date-fns"
import { tr } from "date-fns/locale"

interface TaskCardProps {
  task: Task
  subtaskCount?: number
  doneSubtaskCount?: number
  isProjectView?: boolean
}

// Generate a soft translucent card background from project color
// Mixes the project color with white at very low opacity for a "frosted glass" effect
function getCardStyle(color?: string): React.CSSProperties {
  if (!color) {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      borderColor: 'rgba(0, 0, 0, 0.04)',
    }
  }
  
  try {
    const c = color.replace('#', '')
    const r = parseInt(c.substring(0, 2), 16)
    const g = parseInt(c.substring(2, 4), 16)
    const b = parseInt(c.substring(4, 6), 16)
    
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.08)`,
      borderColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
    }
  } catch {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      borderColor: 'rgba(0, 0, 0, 0.04)',
    }
  }
}

function getCardStyleDark(color?: string): React.CSSProperties {
  if (!color) {
    return {
      backgroundColor: 'rgba(26, 30, 46, 0.90)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
    }
  }
  
  try {
    const c = color.replace('#', '')
    const r = parseInt(c.substring(0, 2), 16)
    const g = parseInt(c.substring(2, 4), 16)
    const b = parseInt(c.substring(4, 6), 16)
    
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
      borderColor: `rgba(${r}, ${g}, ${b}, 0.25)`,
    }
  } catch {
    return {
      backgroundColor: 'rgba(26, 30, 46, 0.90)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
    }
  }
}

// Get priority-based accent for dot indicator
function getPriorityDot(priority: string): { color: string; label: string } {
  switch (priority) {
    case 'urgent': return { color: '#ef4444', label: 'Acil' }
    case 'normal': return { color: '#3b82f6', label: 'Normal' }
    case 'low': return { color: '#10b981', label: 'Düşük' }
    default: return { color: '#94a3b8', label: '' }
  }
}

// User-selectable color options for project view
type SelectableColor = 'blue' | 'green' | 'red' | 'orange'
const COLOR_OPTIONS: { name: string; key: SelectableColor; color: string }[] = [
  { name: 'Mavi',    key: 'blue',   color: '#3b82f6' },
  { name: 'Yeşil',   key: 'green',  color: '#10b981' },
  { name: 'Kırmızı', key: 'red',    color: '#ef4444' },
  { name: 'Turuncu', key: 'orange', color: '#f59e0b' },
]

// Dot progress bar component — premium minimal style
function DotProgress({ percent, accentColor, isDark = false }: { percent: number; accentColor: string; isDark?: boolean }) {
  const totalDots = 10
  const filledDots = Math.round((percent / 100) * totalDots)

  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: totalDots }).map((_, i) => (
        <div
          key={i}
          className="h-[4px] rounded-full transition-all duration-500"
          style={{
            width: i < filledDots ? '14px' : '4px',
            backgroundColor: i < filledDots ? accentColor : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'),
            opacity: i < filledDots ? (0.5 + (i / totalDots) * 0.5) : 0.4,
          }}
        />
      ))}
    </div>
  )
}

export function TaskCard({ task, subtaskCount = 0, doneSubtaskCount = 0, isProjectView = false }: TaskCardProps) {
  const { openTaskDetail, deleteTask } = useTaskStore()

  const hasDescription = !!task.description && task.description.trim().length > 0
  const hasSubtasks = subtaskCount > 0
  const progressPercent = hasSubtasks ? Math.round((doneSubtaskCount / subtaskCount) * 100) : 0
  
  // Color selection for project view
  const [selectedColor, setSelectedColor] = React.useState<SelectableColor | null>(null)
  
  // Detect dark mode
  const [isDark, setIsDark] = React.useState(false)
  React.useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'))
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)

  // Resolve the effective project color
  let effectiveColor = task.project?.color
  if (isProjectView && selectedColor) {
    effectiveColor = COLOR_OPTIONS.find(o => o.key === selectedColor)?.color
  }

  // Card background style based on project color
  const cardStyle = isDark ? getCardStyleDark(effectiveColor) : getCardStyle(effectiveColor)

  // Progress bar accent color
  const accentColor = effectiveColor || '#f59e0b'
  const priorityInfo = getPriorityDot(task.priority)

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
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="rounded-lg p-4 cursor-pointer group transition-all duration-200 hover:shadow-md border backdrop-blur-sm"
          style={cardStyle}
          onClick={() => openTaskDetail(task)}
        >
          {/* Tags Row — Minimal dot labels */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex flex-wrap items-center gap-2">
              {task.project && (
                <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-200 flex items-center gap-1.5">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: effectiveColor || '#f59e0b' }} 
                  />
                  {task.project.name}
                </span>
              )}
              {task.priority === 'urgent' && (
                <span className="text-[10px] font-semibold text-red-500 dark:text-red-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
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
              <DropdownMenuContent align="end" className="w-44 text-sm" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => openTaskDetail(task)}>Düzenle</DropdownMenuItem>
                <DropdownMenuItem>Kopyala</DropdownMenuItem>
                <DropdownMenuItem>Arşivle</DropdownMenuItem>
                
                {isProjectView && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Kart Rengi</p>
                      <div className="flex gap-1.5">
                        {COLOR_OPTIONS.map(opt => (
                          <button
                            key={opt.key}
                            onClick={(e) => { e.stopPropagation(); setSelectedColor(opt.key) }}
                            className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
                              selectedColor === opt.key ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: opt.color }}
                            title={opt.name}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
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

          {/* Title */}
          <h4 className={`font-semibold text-gray-800 dark:text-white text-[13px] leading-snug mb-1.5 ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>
            {task.title}
          </h4>

          {/* Description */}
          {hasDescription && (
            <p className="text-[11px] text-gray-500 dark:text-gray-300 font-medium mb-3 line-clamp-2 leading-relaxed">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Not: </span>
              {task.description}
            </p>
          )}

          {/* Progress — Dot style */}
          {hasSubtasks && (
            <div className="mb-2.5">
              <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400 dark:text-gray-400 mb-1">
                <span>İlerleme</span>
                <span>{progressPercent}%</span>
              </div>
              <DotProgress percent={progressPercent} accentColor={accentColor} isDark={isDark} />
            </div>
          )}

          {/* Bottom Row — compact metadata */}
          {(task.due_date || hasSubtasks) && (
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
              <div />
              <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-400 dark:text-gray-400 font-medium">
                {task.due_date && (
                  <span className={`flex items-center gap-1 ${
                    isPast(new Date(task.due_date)) && task.status !== 'done' ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    <Calendar className="w-2.5 h-2.5" />
                    {format(new Date(task.due_date), "dd MMM", { locale: tr })}
                  </span>
                )}
                
                {hasSubtasks && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <CheckSquare className="w-2.5 h-2.5" />
                    {doneSubtaskCount}/{subtaskCount}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-48 text-sm">
        <ContextMenuItem onClick={() => openTaskDetail(task)}>Düzenle / Görüntüle</ContextMenuItem>
        <ContextMenuItem>Kopyala</ContextMenuItem>
        <ContextMenuItem>Arşivle</ContextMenuItem>
        {isProjectView && (
          <>
            <ContextMenuSeparator />
            {COLOR_OPTIONS.map(opt => (
              <ContextMenuItem key={opt.key} onClick={() => setSelectedColor(opt.key)}>
                <span className="w-3 h-3 rounded-full mr-2 inline-block" style={{ backgroundColor: opt.color }} />
                {opt.name}
              </ContextMenuItem>
            ))}
          </>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem 
          className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
          onClick={(e) => {
            e.stopPropagation();
            setIsDeleteConfirmOpen(true);
          }}
        >
          Sil
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
    </>
  )
}
