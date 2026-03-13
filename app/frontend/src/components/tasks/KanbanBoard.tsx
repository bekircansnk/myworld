"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { Task } from "@/types"
import { TaskCard } from "./TaskCard"
import { Plus, MoreVertical, Check, Zap, ClipboardList, Eye, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"

interface KanbanColumn {
  id: 'todo' | 'in_progress' | 'in_review' | 'done'
  title: string
  icon: React.ReactNode
  dotColor: string
}

const COLUMNS: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'Yapılacaklar',
    icon: <ClipboardList className="w-3.5 h-3.5" />,
    dotColor: 'bg-amber-400',
  },
  {
    id: 'in_progress',
    title: 'Devam Edenler',
    icon: <Zap className="w-3.5 h-3.5" />,
    dotColor: 'bg-blue-400',
  },
  {
    id: 'in_review',
    title: 'İncelemede',
    icon: <Eye className="w-3.5 h-3.5" />,
    dotColor: 'bg-purple-400',
  },
  {
    id: 'done',
    title: 'Tamamlandı',
    icon: <Check className="w-3.5 h-3.5" />,
    dotColor: 'bg-emerald-400',
  },
]

interface KanbanBoardProps {
  projectId?: number | null
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const isProjectView = projectId !== null && projectId !== undefined
  const { tasks, addTask, updateTaskStatus } = useTaskStore()
  const [addingToColumn, setAddingToColumn] = React.useState<string | null>(null)
  const [newCardTitle, setNewCardTitle] = React.useState("")
  const [collapsedColumns, setCollapsedColumns] = React.useState<Record<string, boolean>>({})
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Sadece ana görevleri göster (alt görevler buraya gelmez)
  const mainTasks = React.useMemo(() => {
    return tasks.filter(t => {
      const isMainTask = !t.parent_task_id
      const matchesProject = projectId === null || projectId === undefined || t.project_id === projectId
      return isMainTask && matchesProject
    })
  }, [tasks, projectId])

  const getColumnTasks = (status: string): Task[] => {
    return mainTasks
      .filter(t => t.status === status)
      .sort((a, b) => {
        // Yeni görevler en üstte: created_at'e göre ters sıralama
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA
      })
  }

  const handleQuickAdd = async (columnStatus: string) => {
    if (!newCardTitle.trim()) {
      setAddingToColumn(null)
      return
    }
    await addTask({
      title: newCardTitle,
      status: columnStatus as any,
      project_id: projectId || undefined,
    })
    setNewCardTitle("")
    setAddingToColumn(null)
  }

  React.useEffect(() => {
    if (addingToColumn && inputRef.current) {
      inputRef.current.focus()
    }
  }, [addingToColumn])

  // Alt görev sayısını hesapla
  const getSubtaskCount = (taskId: number) => {
    return tasks.filter(t => t.parent_task_id === taskId).length
  }
  const getDoneSubtaskCount = (taskId: number) => {
    return tasks.filter(t => t.parent_task_id === taskId && t.status === 'done').length
  }

  const toggleColumn = (colId: string) => {
    setCollapsedColumns(prev => ({ ...prev, [colId]: !prev[colId] }))
  }

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    
    // Dropped outside a list
    if (!destination) return
    
    // Dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const taskId = parseInt(draggableId)
    const newStatus = destination.droppableId as any

    if (source.droppableId !== destination.droppableId) {
       // Update status in store immediately for optimistic UI
       updateTaskStatus(taskId, newStatus)
    }
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 kanban-scroll-area">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-6 h-full min-w-[960px]">
          {COLUMNS.map(column => {
            const columnTasks = getColumnTasks(column.id)
            const isCollapsed = collapsedColumns[column.id]

            return (
              <div
                key={column.id}
                className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'h-auto' : 'h-[calc(100vh-140px)]'}`}
              >
                {/* Column Header — minimal, flush with background */}
                <div className="flex items-center justify-between mb-3">
                  <h3 
                    className="font-semibold text-[13px] text-gray-500 dark:text-gray-300 flex items-center gap-2 cursor-pointer select-none group"
                    onClick={() => toggleColumn(column.id)}
                  >
                    <span className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                    {column.title}
                    <span className="text-[11px] font-normal text-gray-300 dark:text-gray-500">
                      {columnTasks.length}
                    </span>
                  </h3>
                  
                  <div className="flex items-center gap-1 text-gray-300 dark:text-gray-500">
                    <button 
                      onClick={() => { setAddingToColumn(column.id); setNewCardTitle(""); if (isCollapsed) toggleColumn(column.id) }}
                      className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors hover:text-gray-500 dark:hover:text-gray-300"
                      title="Yeni Görev Ekle"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors hover:text-gray-500 dark:hover:text-gray-300 border-0 focus:outline-none focus:ring-0 appearance-none">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 text-sm">
                        <DropdownMenuItem>Düzenle</DropdownMenuItem>
                        <DropdownMenuItem>Tümünü Seç</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Tümünü Arşivle</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 hover:text-red-600 focus:text-red-600">Tümünü Sil</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Column Cards Container wrapped in Droppable */}
                {!isCollapsed && (
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 pb-2 transition-colors rounded-lg ${snapshot.isDraggingOver ? 'bg-amber-50/30 dark:bg-slate-800/20' : ''}`}
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={snapshot.isDragging ? 'rotate-1 scale-[1.02] shadow-lg transition-all duration-200 cursor-grabbing' : 'cursor-grab'}
                                style={{
                                  ...provided.draggableProps.style,
                                }}
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

                        {/* Quick Add Form */}
                        {addingToColumn === column.id && (
                          <div className="bg-white dark:bg-white/5 rounded-lg p-3 space-y-2.5 animate-in fade-in slide-in-from-top-2 border border-gray-100 dark:border-white/8">
                            <Input
                              ref={inputRef}
                              value={newCardTitle}
                              onChange={e => setNewCardTitle(e.target.value)}
                              placeholder="Görev adı..."
                              className="text-[13px] border-0 shadow-none bg-gray-50 dark:bg-white/5 focus-visible:ring-1 focus-visible:ring-gray-300 rounded h-8"
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleQuickAdd(column.id)
                                if (e.key === 'Escape') { setAddingToColumn(null); setNewCardTitle("") }
                              }}
                            />
                            <div className="flex items-center gap-2">
                               <Button
                                 size="sm"
                                 className="h-7 text-[11px] font-semibold px-3 rounded bg-gray-800 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
                                 onClick={() => handleQuickAdd(column.id)}
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
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
