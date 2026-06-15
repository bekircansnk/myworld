"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { useProjectStore } from "@/stores/projectStore"
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

interface ColumnConfig {
  id: string
  label: string
  statusKey: string
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
const COLUMNS_STORAGE_KEY = 'planla_kanban_columns'

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
  const { projects, updateProjectColumns } = useProjectStore()

  // Sütun yapılandırması
  const [columns, setColumns] = React.useState<ColumnConfig[]>(DEFAULT_COLUMNS)
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
  const newColInputRef = React.useRef<HTMLInputElement>(null)

  // Çoklu tıklama / duplicate koruması için loading durumları
  const [savingColumn, setSavingColumn] = React.useState(false)
  const [savingQuickTaskColumnId, setSavingQuickTaskColumnId] = React.useState<string | null>(null)
  const [deletingColumnId, setDeletingColumnId] = React.useState<string | null>(null)
  const [renamingColumnId, setRenamingColumnId] = React.useState<string | null>(null)
  
  // Auto-scroll logic for drag
  const scrollIntervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const pointerXRef = React.useRef<number>(0) // Global pointer position tracking

  // Sütunları database ve localStorage ile senkronize et
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    let nextColumns: ColumnConfig[] | null = null;
    let shouldSaveProjectColumns = false;

    if (projectId) {
      const currentProject = projects.find(p => p.id === projectId);
      if (currentProject) {
        if (currentProject.columns_config && currentProject.columns_config.length > 0) {
          nextColumns = currentProject.columns_config as ColumnConfig[];
          shouldSaveProjectColumns = true;
        } else {
          // Sunucudan sütun yapılandırması gelmediyse -> daima varsayılan sütunları göster, localStorage'daki eski veriyi sunucuya taşımamak için
          nextColumns = DEFAULT_COLUMNS;
        }
      }
    } else {
      nextColumns = loadColumns(null);
    }

    if (!nextColumns) return;

    let cancelled = false;
    const resolvedColumns = nextColumns;
    queueMicrotask(() => {
      if (cancelled) return;
      setColumns(resolvedColumns);
      if (shouldSaveProjectColumns && projectId) {
        saveColumns(resolvedColumns, projectId);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [projectId, projects]);

  const saveAndSyncColumns = React.useCallback(async (newCols: ColumnConfig[]) => {
    const previousCols = [...columns];
    setColumns(newCols);
    saveColumns(newCols, projectId);
    if (projectId) {
      try {
        const res = await updateProjectColumns(projectId, newCols);
        return res;
      } catch (err: any) {
        // Rollback state & cache
        setColumns(previousCols);
        saveColumns(previousCols, projectId);
        toast.error("Sütunlar senkronize edilemedi: " + (err.response?.data?.detail || err.message));
        throw err;
      }
    }
    return { queued: false };
  }, [projectId, columns, updateProjectColumns, toast]);

  // Ana görevleri filtrele
  const mainTasks = React.useMemo(() => {
    return tasks.filter(t => {
      const isMainTask = !t.parent_task_id
      const matchesProject = projectId === null || projectId === undefined || t.project_id === projectId
      return isMainTask && matchesProject
    })
  }, [tasks, projectId])

  // Config dışındaki durumları kapsayan hesaplanmış sütunlar
  const computedColumns = React.useMemo(() => {
    let list = [...columns];
    if (list.length === 0) {
      list = [...DEFAULT_COLUMNS];
    }
    
    // Görevler içindeki benzersiz statusKey'leri bulalım
    const taskStatuses = Array.from(new Set(mainTasks.map(t => t.status).filter(Boolean)));
    
    // columns içinde olmayan statusKey'leri tespit edelim
    const missingStatuses = taskStatuses.filter(status => !list.some(col => col.statusKey === status));
    
    // Her eksik status için geçici fallback sütunu ekleyelim
    missingStatuses.forEach(status => {
      list.push({
        id: `fallback_${status}`,
        label: `${status.charAt(0).toUpperCase() + status.slice(1)} (Sütunsuz)`,
        statusKey: status,
        dotColor: '#6b7280', // gri renk
      });
    });
    
    return list;
  }, [columns, mainTasks]);

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
  const handleQuickAdd = (column: ColumnConfig) => {
    if (savingQuickTaskColumnId === column.id) return
    if (!newCardTitle.trim()) {
      setAddingToColumn(null)
      return
    }
    const titleToSave = newCardTitle.trim();
    setNewCardTitle(""); // Anında temizle ki arka planda kaydederken kullanıcı yazmaya devam edebilsin
    setSavingQuickTaskColumnId(column.id)
    
    // API isteğini arkaya atıyoruz
    addTask({
      title: titleToSave,
      status: column.statusKey,
      project_id: projectId || undefined,
    }).then(() => {
      toast.success("Görev eklendi")
      setAddingToColumn(null)
    }).catch((err: any) => {
      toast.error(err.response?.data?.detail || "Görev eklenirken hata oluştu")
    }).finally(() => {
      setSavingQuickTaskColumnId(null)
    });
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
  const handleRenameColumn = async (colId: string) => {
    if (renamingColumnId === colId) return
    if (!editingColumnLabel.trim()) {
      setEditingColumnId(null)
      return
    }
    setRenamingColumnId(colId)
    const newCols = columns.map(c => c.id === colId ? { ...c, label: editingColumnLabel.trim() } : c)
    try {
      const res = await saveAndSyncColumns(newCols)
      setEditingColumnId(null)
      if (res?.queued) {
        toast.show("Değişiklikler çevrimdışı kaydedildi, senkron bekliyor", "info")
      } else {
        toast.success("Sütun ismi güncellendi")
      }
    } catch (err) {
      setEditingColumnId(null)
    } finally {
      setRenamingColumnId(null)
    }
  }

  // Yeni sütun ekleme
  const handleAddColumn = async () => {
    if (savingColumn) return
    if (!newColumnLabel.trim()) {
      setIsAddingColumn(false)
      return
    }
    setSavingColumn(true)
    const newId = `col_${Date.now()}`
    const newCol: ColumnConfig = {
      id: newId,
      label: newColumnLabel.trim(),
      statusKey: newId, // Tamamen bağımsız olması için yeni sütunun id'sini status olarak atıyoruz
      dotColor: DOT_COLORS[columns.length % DOT_COLORS.length],
    }
    const newCols = [...columns, newCol]
    try {
      const res = await saveAndSyncColumns(newCols)
      setNewColumnLabel("")
      setIsAddingColumn(false)
      if (res?.queued) {
        toast.show("Sütun çevrimdışı kaydedildi, senkron bekliyor", "info")
      } else {
        toast.success("Yeni sütun eklendi")
      }

      // Yeni sütuna scroll et
      setTimeout(() => {
        if (boardRef.current) {
          boardRef.current.scrollTo({ left: boardRef.current.scrollWidth, behavior: 'smooth' })
        }
      }, 100)
    } catch (err) {
      // Hata zaten saveAndSyncColumns'ta yönetiliyor, burada bir şey yapmıyoruz
    } finally {
      setSavingColumn(false)
    }
  }

  // Sütun silme
  const handleDeleteColumn = async (colId: string) => {
    if (deletingColumnId === colId) return
    // Varsayılan 3 sütun silinemesin
    const isDefault = DEFAULT_COLUMNS.some(d => d.id === colId)
    if (isDefault) {
      toast.error("Varsayılan sütunlar silinemez")
      return
    }
    setDeletingColumnId(colId)
    const newCols = columns.filter(c => c.id !== colId)
    try {
      const res = await saveAndSyncColumns(newCols)
      if (res?.queued) {
        toast.show("Sütun çevrimdışı silindi, senkron bekliyor", "info")
      } else {
        toast.success("Sütun kaldırıldı")
      }
    } catch (err) {}
    finally {
      setDeletingColumnId(null)
    }
  }

  // Tüm görevleri sil
  const handleDeleteAllTasks = async () => {
    if (!deleteAllColumn || deletingColumnId === deleteAllColumn) return
    const column = columns.find(c => c.id === deleteAllColumn)
    if (!column) return
    setDeletingColumnId(deleteAllColumn)
    const tasksToDelete = getColumnTasks(column)
    const { deleteTask } = useTaskStore.getState()

    try {
      for (const task of tasksToDelete) {
        await deleteTask(task.id)
      }
      setDeleteAllColumn(null)
      toast.success("Tüm görevler silindi")
    } catch (err) {
      toast.error("Görevler silinirken hata oluştu")
    } finally {
      setDeletingColumnId(null)
    }
  }

  // Auto-scroll handler (DragUpdate'ten görünür koordinat oku)
  const handleDragUpdate = (update: any) => {
    // clientOffset sadece desktop'ta güvenilir, mobilde pointerXRef kullanıyoruz
    const x = update.clientOffset?.x ?? pointerXRef.current;
    if (!boardRef.current || !x) return;
    
    const threshold = 80;
    const speed = 12;
    const windowWidth = window.innerWidth;

    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    if (x < threshold) {
      scrollIntervalRef.current = setInterval(() => {
        if (boardRef.current) boardRef.current.scrollLeft -= speed;
      }, 16);
    } else if (x > windowWidth - threshold) {
      scrollIntervalRef.current = setInterval(() => {
        if (boardRef.current) boardRef.current.scrollLeft += speed;
      }, 16);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
    // Pointer/touch olaylarından X pozisyonunu yakala (mobil için)
    const onPointerMove = (e: PointerEvent | TouchEvent) => {
      if (e instanceof TouchEvent) {
        pointerXRef.current = e.touches[0]?.clientX ?? 0;
      } else {
        pointerXRef.current = e.clientX;
      }
    };
    window.addEventListener('pointermove', onPointerMove as EventListener);
    window.addEventListener('touchmove', onPointerMove as EventListener, { passive: true });
    // handleDragEnd'de temizle
    (window as any)._kanbanCleanup = () => {
      window.removeEventListener('pointermove', onPointerMove as EventListener);
      window.removeEventListener('touchmove', onPointerMove as EventListener);
    };
  };

  // Drag & Drop
  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);
    // Pointer event listener'ları temizle
    if ((window as any)._kanbanCleanup) {
      (window as any)._kanbanCleanup();
      delete (window as any)._kanbanCleanup;
    }
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const taskId = parseInt(draggableId)
    const destColumn = computedColumns.find(c => c.id === destination.droppableId)
    if (!destColumn) return

    const newStatus = destColumn.statusKey
    const { reorderTasks, moveTaskToColumnAndReorder } = useTaskStore.getState()

    if (source.droppableId === destination.droppableId) {
      // Aynı sütun içinde sıralama
      const column = computedColumns.find(c => c.id === source.droppableId)
      if (!column) return
      const currentTasks = getColumnTasks(column)
      const items = Array.from(currentTasks)
      const [reorderedItem] = items.splice(source.index, 1)
      items.splice(destination.index, 0, reorderedItem)

      const reorderData = items.map((t, index) => ({ id: t.id, sort_order: index }))
      reorderTasks(reorderData)
    } else {
      // Farklı sütuna taşıma

      // Eğer tamamlandı sütununa atıldıysa Konfeti tetikle
      if (newStatus === 'done') {
        import("@/lib/confetti").then(({ triggerConfetti }) => triggerConfetti()).catch(console.error)
      }

      // Hedef sütundaki mevcut görevleri al
      const destTasks = getColumnTasks(destColumn)
      const items = Array.from(destTasks)

      // Sürüklenen görevi ana görevler listesinden bul
      const movedItem = mainTasks.find(t => t.id === taskId)
      if (!movedItem) return

      // Tamamlandı sütununda daima en üste (0), diğerlerinde nerede bırakıldıysa oraya yerleştirilsin
      const targetIndex = newStatus === 'done' ? 0 : destination.index

      // Taşınan görevin status'ünü güncelleyip hedef index'e yerleştiriyoruz
      const updatedMovedItem = { ...movedItem, status: newStatus }
      items.splice(targetIndex, 0, updatedMovedItem)

      // Yeni sort_order dizisini çıkarıyoruz
      const reorderData = items.map((t, index) => ({ id: t.id, sort_order: index }))

      // Tek bir atomik operasyonla hem durum güncellemesi hem sıralama API'sini sequential çağırıyoruz
      moveTaskToColumnAndReorder(taskId, newStatus, reorderData)
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
      <DragDropContext 
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdate}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={boardRef}
          className={`flex-1 flex flex-row gap-3 md:gap-4 overflow-x-auto px-3 md:px-5 pb-3 kanban-board-scroll overscroll-x-contain ${isDragging ? 'cursor-grabbing is-dragging' : ''}`}
          style={{ 
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {computedColumns.map(column => {
            const columnTasks = getColumnTasks(column)
            const isDefaultCol = DEFAULT_COLUMNS.some(d => d.id === column.id) || column.id.startsWith('fallback_')

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
                      className="text-[13px] font-bold bg-transparent border-b-2 border-blue-400 outline-none text-foreground w-full mr-2 py-0.5"
                    />
                  ) : (
                    <h3 className="font-bold text-[13px] text-gray-600 dark:text-gray-300 flex items-center gap-2 select-none tracking-wide uppercase">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: column.dotColor }}
                      />
                      <span className="flex-1 min-w-0 font-bold" title={column.label}>{column.label}</span>
                      <span className="text-[11px] font-normal text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
                        {columnTasks.length}
                      </span>
                    </h3>
                  )}

                  <div className="flex items-center gap-0.5 shrink-0">
                    {canEdit && !column.id.startsWith('fallback_') && (
                      <button
                        onClick={() => { setAddingToColumn(column.id); setNewCardTitle("") }}
                        className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="Kart Ekle"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!column.id.startsWith('fallback_') && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground border-0 focus:outline-none focus:ring-0 appearance-none">
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
                    )}
                  </div>
                </div>

                {/* Sütun Kartları — Bağımsız Scroll */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto kanban-column-scroll overscroll-y-contain flex flex-col gap-2 rounded-xl p-2 min-h-[200px] border-2 border-transparent ${
                        snapshot.isDraggingOver 
                          ? 'bg-primary/10 border-primary/20 shadow-inner' 
                          : 'bg-muted/20'
                      }`}
                      style={{
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'pan-x pan-y'
                      }}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`shrink-0 ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500/50 cursor-grabbing opacity-90' : 'cursor-grab hover:shadow-md'}`}
                              style={{
                                ...provided.draggableProps.style,
                                touchAction: 'pan-x pan-y'
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

                      {/* Hızlı Kart Ekleme Formu */}
                      {addingToColumn === column.id && (
                        <div className="bg-card rounded-lg p-2.5 space-y-2 animate-in fade-in slide-in-from-top-2 border border-border">
                          <Input
                            ref={inputRef}
                            value={newCardTitle}
                            onChange={e => setNewCardTitle(e.target.value)}
                            disabled={savingQuickTaskColumnId === column.id}
                            placeholder="Görev adı girin..."
                            className="text-[13px] border-0 shadow-none bg-muted focus-visible:ring-1 focus-visible:ring-gray-300 rounded h-8"
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleQuickAdd(column)
                              if (e.key === 'Escape') { setAddingToColumn(null); setNewCardTitle("") }
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="h-7 text-[11px] font-semibold px-3 rounded bg-primary hover:opacity-95 text-primary-foreground flex items-center gap-1.5"
                              onClick={() => handleQuickAdd(column)}
                              disabled={savingQuickTaskColumnId === column.id}
                            >
                              {savingQuickTaskColumnId === column.id ? (
                                <>
                                  <span className="w-3 h-3 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
                                  Kaydediliyor...
                                </>
                              ) : (
                                "Kaydet"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] font-semibold px-2 rounded hover:bg-muted"
                              onClick={() => { setAddingToColumn(null); setNewCardTitle("") }}
                              disabled={savingQuickTaskColumnId === column.id}
                            >
                              İptal
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Kart Ekle linki (Trello tarzı) */}
                      {canEdit && !column.id.startsWith('fallback_') && addingToColumn !== column.id && (
                        <button
                          onClick={() => { setAddingToColumn(column.id); setNewCardTitle("") }}
                          className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground py-1.5 px-2 rounded-md hover:bg-muted transition-colors w-full mt-0.5"
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
                <div className="bg-card rounded-xl p-3 space-y-3 border border-border w-full">
                  <input
                    ref={newColInputRef}
                    value={newColumnLabel}
                    disabled={savingColumn}
                    onChange={e => setNewColumnLabel(e.target.value)}
                    placeholder="Sütun adı..."
                    className="w-full text-[13px] font-semibold bg-transparent border-b-2 border-blue-400 outline-none text-gray-700 dark:text-gray-200 py-1"
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddColumn()
                      if (e.key === 'Escape') { setIsAddingColumn(false); setNewColumnLabel("") }
                    }}
                  />
                  {/* Durum eşleştirmesi kaldırıldı (bağımsız sütunlar oluşturulduğu için) */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-7 text-[11px] font-semibold px-3 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                      onClick={handleAddColumn}
                      disabled={savingColumn}
                    >
                      {savingColumn ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Ekleniyor...
                        </>
                      ) : (
                        "Ekle"
                      )}
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
                  className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/85 rounded-xl px-4 py-3 transition-colors w-full justify-center"
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
