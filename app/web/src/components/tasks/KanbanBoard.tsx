"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { Task } from "@/types"
import { TaskCard } from "./TaskCard"
import { TaskForm } from "./TaskForm"
import { Plus, MoreVertical, Check, Zap, ClipboardList, Pencil, Trash2, CheckSquare2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useToast } from "@/components/ui/toast"

// Sütun yapılandırması tipi
interface ColumnConfig {
  id: string
  label: string
  statusKey: 'todo' | 'in_progress' | 'done'
  dotColor: string
}

// Varsayılan sütunlar
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'col_todo', label: 'Yapılacaklar', statusKey: 'todo', dotColor: '#f59e0b' },
  { id: 'col_in_progress', label: 'Devam Edenler', statusKey: 'in_progress', dotColor: '#3b82f6' },
  { id: 'col_done', label: 'Tamamlandı', statusKey: 'done', dotColor: '#10b981' },
]

// Kullanılabilir renk paleti
const DOT_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4', '#84cc16']

// localStorage key'i
const COLUMNS_STORAGE_KEY = 'pikselis_kanban_columns'

// localStorage'dan sütun yapılandırmasını yükle
function loadColumns(projectId?: number | null): ColumnConfig[] {
  if (typeof window === 'undefined') return DEFAULT_COLUMNS
  try {
    const key = projectId ? `${COLUMNS_STORAGE_KEY}_${projectId}` : COLUMNS_STORAGE_KEY
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return DEFAULT_COLUMNS
}

// localStorage'a sütun yapılandırmasını kaydet
function saveColumns(columns: ColumnConfig[], projectId?: number | null) {
  if (typeof window === 'undefined') return
  const key = projectId ? `${COLUMNS_STORAGE_KEY}_${projectId}` : COLUMNS_STORAGE_KEY
  localStorage.setItem(key, JSON.stringify(columns))
}

interface KanbanBoardProps {
  projectId?: number | null
  canEdit?: boolean
}

export function KanbanBoard({ projectId, canEdit = true }: KanbanBoardProps) {
  const toast = useToast()
  const isProjectView = projectId !== null && projectId !== undefined
  const { tasks, addTask, updateTaskStatus } = useTaskStore()

  // Sütun yapılandırması
  const [columns, setColumns] = React.useState<ColumnConfig[]>(() => loadColumns(projectId))
  const [addingToColumn, setAddingToColumn] = React.useState<string | null>(null)
  const [newCardTitle, setNewCardTitle] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const boardRef = React.useRef<HTMLDivElement>(null)

  // Silme onay dialog state
  const [deleteAllColumn, setDeleteAllColumn] = React.useState<string | null>(null)

  // Sütun ismi düzenleme state
  const [editingColumnId, setEditingColumnId] = React.useState<string | null>(null)
  const [editingColumnLabel, setEditingColumnLabel] = React.useState("")
  const editInputRef = React.useRef<HTMLInputElement>(null)

  // Yeni sütun ekleme state
  const [isAddingColumn, setIsAddingColumn] = React.useState(false)
  const [newColumnLabel, setNewColumnLabel] = React.useState("")
  const [newColumnStatus, setNewColumnStatus] = React.useState<'todo' | 'in_progress' | 'done'>('todo')
  const newColInputRef = React.useRef<HTMLInputElement>(null)

  // Sütun değişikliklerini localStorage'a kaydet
  React.useEffect(() => {
    saveColumns(columns, projectId)
  }, [columns, projectId])

  // Ana görevleri filtrele
  const mainTasks = React.useMemo(() => {
    return tasks.filter(t => {
      const isMainTask = !t.parent_task_id
      const matchesProject = projectId === null || projectId === undefined || t.project_id === projectId
      return isMainTask && matchesProject
    })
  }, [tasks, projectId])

  // Belirli bir sütundaki görevleri getir
  const getColumnTasks = React.useCallback((column: ColumnConfig): Task[] => {
    return mainTasks
      .filter(t => t.status === column.statusKey)
      .sort((a, b) => {
        // Öncelik: Manuel sort_order
        if ((a.sort_order ?? 0) !== (b.sort_order ?? 0)) {
          return (a.sort_order ?? 0) - (b.sort_order ?? 0)
        }
        // İkinci öncelik: Oluşturulma tarihi
        const dateA = new Date(a.created_at ?? 0).getTime()
        const dateB = new Date(b.created_at ?? 0).getTime()
        return dateA - dateB
      })
  }, [mainTasks])

  // Aynı statusKey'e sahip birden fazla sütun olduğunda görevleri ayırt etmek için
  // Şimdilik aynı statusKey'li sütunlar aynı görevleri gösterir
  // İleride backend desteğiyle custom status eklenebilir

  // Alt görev sayısını hesapla
  const getSubtaskCount = (taskId: number) => {
    return tasks.filter(t => t.parent_task_id === taskId).length
  }
  const getDoneSubtaskCount = (taskId: number) => {
    return tasks.filter(t => t.parent_task_id === taskId && t.status === 'done').length
  }

  // Hızlı görev ekleme
  const handleQuickAdd = async (column: ColumnConfig) => {
    if (!newCardTitle.trim()) {
      setAddingToColumn(null)
      return
    }
    try {
      await addTask({
        title: newCardTitle,
        status: column.statusKey,
        project_id: projectId || undefined,
      })
      toast.success("Görev eklendi")
      setNewCardTitle("")
      setAddingToColumn(null)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Görev eklenirken hata oluştu")
    }
  }

  React.useEffect(() => {
    if (addingToColumn && inputRef.current) {
      inputRef.current.focus()
    }
  }, [addingToColumn])

  React.useEffect(() => {
    if (editingColumnId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingColumnId])

  React.useEffect(() => {
    if (isAddingColumn && newColInputRef.current) {
      newColInputRef.current.focus()
    }
  }, [isAddingColumn])

  // Sütun ismi düzenleme
  const handleRenameColumn = (colId: string) => {
    if (!editingColumnLabel.trim()) {
      setEditingColumnId(null)
      return
    }
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, label: editingColumnLabel.trim() } : c))
    setEditingColumnId(null)
    toast.success("Sütun ismi güncellendi")
  }

  // Yeni sütun ekleme
  const handleAddColumn = () => {
    if (!newColumnLabel.trim()) {
      setIsAddingColumn(false)
      return
    }
    const newCol: ColumnConfig = {
      id: `col_${Date.now()}`,
      label: newColumnLabel.trim(),
      statusKey: newColumnStatus,
      dotColor: DOT_COLORS[columns.length % DOT_COLORS.length],
    }
    setColumns(prev => [...prev, newCol])
    setNewColumnLabel("")
    setIsAddingColumn(false)
    toast.success("Yeni sütun eklendi")

    // Yeni sütuna scroll et
    setTimeout(() => {
      if (boardRef.current) {
        boardRef.current.scrollTo({ left: boardRef.current.scrollWidth, behavior: 'smooth' })
      }
    }, 100)
  }

  // Sütun silme
  const handleDeleteColumn = (colId: string) => {
    // Varsayılan 3 sütun silinemesin
    const isDefault = DEFAULT_COLUMNS.some(d => d.id === colId)
    if (isDefault) {
      toast.error("Varsayılan sütunlar silinemez")
      return
    }
    setColumns(prev => prev.filter(c => c.id !== colId))
    toast.success("Sütun kaldırıldı")
  }

  // Tüm görevleri sil
  const handleDeleteAllTasks = async () => {
    if (!deleteAllColumn) return
    const column = columns.find(c => c.id === deleteAllColumn)
    if (!column) return
    const tasksToDelete = getColumnTasks(column)
    const { deleteTask } = useTaskStore.getState()

    for (const task of tasksToDelete) {
      await deleteTask(task.id)
    }
    setDeleteAllColumn(null)
    toast.success("Tüm görevler silindi")
  }

  // Drag & Drop
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const taskId = parseInt(draggableId)
    const destColumn = columns.find(c => c.id === destination.droppableId)
    if (!destColumn) return

    const newStatus = destColumn.statusKey
    const { updateTaskStatus, reorderTasks } = useTaskStore.getState()

    if (source.droppableId === destination.droppableId) {
      // Aynı sütun içinde sıralama
      const column = columns.find(c => c.id === source.droppableId)
      if (!column) return
      const currentTasks = getColumnTasks(column)
      const items = Array.from(currentTasks)
      const [reorderedItem] = items.splice(source.index, 1)
      items.splice(destination.index, 0, reorderedItem)

      const reorderData = items.map((t, index) => ({ id: t.id, sort_order: index }))
      reorderTasks(reorderData)
    } else {
      // Farklı sütuna taşıma
      updateTaskStatus(taskId, newStatus)

      setTimeout(() => {
        const destTasks = getColumnTasks(destColumn)
        const items = Array.from(destTasks)
        const taskIndex = items.findIndex(t => t.id === taskId)
        if (taskIndex !== -1) {
          const [movedItem] = items.splice(taskIndex, 1)
          items.splice(destination.index, 0, movedItem)
          const reorderData = items.map((t, index) => ({ id: t.id, sort_order: index }))
          reorderTasks(reorderData)
        }
      }, 10)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Silme onay dialogu */}
      <ConfirmDialog
        isOpen={!!deleteAllColumn}
        onOpenChange={(open) => !open && setDeleteAllColumn(null)}
        title="Tüm Görevleri Sil"
        description="Bu sütundaki tüm görevleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Tümünü Sil"
        onConfirm={handleDeleteAllTasks}
      />

      {/* Minimal Toolbar */}
      <div className="flex items-center justify-between px-3 md:px-5 py-2 shrink-0">
        <div />
        {canEdit && <TaskForm />}
      </div>

      {/* Kanban Board — Tam Ekran */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          ref={boardRef}
          className="flex-1 flex flex-row gap-3 md:gap-4 overflow-x-auto overflow-y-hidden px-3 md:px-5 pb-3 kanban-board-scroll"
        >
          {columns.map(column => {
            const columnTasks = getColumnTasks(column)
            const isDefaultCol = DEFAULT_COLUMNS.some(d => d.id === column.id)

            return (
              <div
                key={column.id}
                className="flex flex-col shrink-0 kanban-column"
              >
                {/* Sütun Başlığı */}
                <div className="flex items-center justify-between mb-2 px-1 shrink-0">
                  {editingColumnId === column.id ? (
                    <input
                      ref={editInputRef}
                      value={editingColumnLabel}
                      onChange={e => setEditingColumnLabel(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRenameColumn(column.id)
                        if (e.key === 'Escape') setEditingColumnId(null)
                      }}
                      onBlur={() => handleRenameColumn(column.id)}
                      className="text-[13px] font-bold bg-transparent border-b-2 border-blue-400 outline-none text-gray-700 dark:text-gray-200 w-full mr-2 py-0.5"
                    />
                  ) : (
                    <h3 className="font-bold text-[13px] text-gray-600 dark:text-gray-300 flex items-center gap-2 select-none tracking-wide uppercase">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: column.dotColor }}
                      />
                      <span className="truncate max-w-[140px]">{column.label}</span>
                      <span className="text-[11px] font-normal text-gray-400 dark:text-gray-500 tabular-nums">
                        {columnTasks.length}
                      </span>
                    </h3>
                  )}

                  <div className="flex items-center gap-0.5 shrink-0">
                    {canEdit && (
                      <button
                        onClick={() => { setAddingToColumn(column.id); setNewCardTitle("") }}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title="Kart Ekle"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border-0 focus:outline-none focus:ring-0 appearance-none">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 text-sm">
                        <DropdownMenuItem onClick={() => {
                          setEditingColumnId(column.id)
                          setEditingColumnLabel(column.label)
                        }}>
                          <Pencil className="w-3.5 h-3.5 mr-2" />
                          İsmini Değiştir
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500 hover:text-red-600 focus:text-red-600"
                          onClick={() => setDeleteAllColumn(column.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Tümünü Sil
                        </DropdownMenuItem>
                        {!isDefaultCol && (
                          <DropdownMenuItem
                            className="text-red-500 hover:text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteColumn(column.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Sütunu Kaldır
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Sütun Kartları — Bağımsız Scroll */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto kanban-column-scroll flex flex-col gap-2 rounded-lg p-1.5 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50/40 dark:bg-blue-500/5' : 'bg-gray-50/50 dark:bg-white/[0.02]'
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={snapshot.isDragging ? 'rotate-1 scale-[1.02] shadow-lg transition-all duration-200 cursor-grabbing' : 'cursor-grab'}
                              style={provided.draggableProps.style}
                            >
                              <TaskCard
                                task={task}
                                subtaskCount={getSubtaskCount(task.id)}
                                doneSubtaskCount={getDoneSubtaskCount(task.id)}
                                isProjectView={isProjectView}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Hızlı Kart Ekleme Formu */}
                      {addingToColumn === column.id && (
                        <div className="bg-white dark:bg-white/5 rounded-lg p-2.5 space-y-2 animate-in fade-in slide-in-from-top-2 border border-gray-100 dark:border-white/8">
                          <Input
                            ref={inputRef}
                            value={newCardTitle}
                            onChange={e => setNewCardTitle(e.target.value)}
                            placeholder="Görev adı girin..."
                            className="text-[13px] border-0 shadow-none bg-gray-50 dark:bg-white/5 focus-visible:ring-1 focus-visible:ring-gray-300 rounded h-8"
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleQuickAdd(column)
                              if (e.key === 'Escape') { setAddingToColumn(null); setNewCardTitle("") }
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="h-7 text-[11px] font-semibold px-3 rounded bg-gray-800 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
                              onClick={() => handleQuickAdd(column)}
                            >
                              Kaydet
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] font-semibold px-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                              onClick={() => { setAddingToColumn(null); setNewCardTitle("") }}
                            >
                              İptal
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Kart Ekle linki (Trello tarzı) */}
                      {canEdit && addingToColumn !== column.id && (
                        <button
                          onClick={() => { setAddingToColumn(column.id); setNewCardTitle("") }}
                          className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-1.5 px-2 rounded-md hover:bg-gray-100/60 dark:hover:bg-white/5 transition-colors w-full mt-0.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Kart ekle
                        </button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}

          {/* Yeni Sütun Ekle */}
          {canEdit && (
            <div className="shrink-0 kanban-column-add">
              {isAddingColumn ? (
                <div className="bg-white/80 dark:bg-white/5 rounded-xl p-3 space-y-3 border border-gray-200 dark:border-white/10 w-full">
                  <input
                    ref={newColInputRef}
                    value={newColumnLabel}
                    onChange={e => setNewColumnLabel(e.target.value)}
                    placeholder="Sütun adı..."
                    className="w-full text-[13px] font-semibold bg-transparent border-b-2 border-blue-400 outline-none text-gray-700 dark:text-gray-200 py-1"
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddColumn()
                      if (e.key === 'Escape') { setIsAddingColumn(false); setNewColumnLabel("") }
                    }}
                  />
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-gray-400">Durum Eşleştirmesi</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(['todo', 'in_progress', 'done'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setNewColumnStatus(s)}
                          className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                            newColumnStatus === s
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15'
                          }`}
                        >
                          {s === 'todo' ? 'Yapılacak' : s === 'in_progress' ? 'Devam Eden' : 'Tamamlandı'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-7 text-[11px] font-semibold px-3 rounded bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleAddColumn}
                    >
                      Ekle
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px] font-semibold px-2 rounded"
                      onClick={() => { setIsAddingColumn(false); setNewColumnLabel("") }}
                    >
                      İptal
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="flex items-center gap-2 text-[13px] font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100/60 dark:bg-white/5 hover:bg-gray-200/60 dark:hover:bg-white/10 rounded-xl px-4 py-3 transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Sütun Ekle
                </button>
              )}
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  )
}
