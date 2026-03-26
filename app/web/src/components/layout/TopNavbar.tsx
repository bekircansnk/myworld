"use client"

import * as React from "react"
import { useProjectStore } from "@/stores/projectStore"
import { useTaskStore } from "@/stores/taskStore"
import { useTheme } from "next-themes"
import { Bell, Sun, Moon, User, ChevronDown, Plus, LayoutDashboard, ListTodo, CalendarDays, NotebookPen, X, Clock, AlertTriangle, Check, Bot, Megaphone } from "lucide-react"
import { format, isToday, isTomorrow, isBefore, addDays } from "date-fns"
import { tr } from "date-fns/locale"
import { api } from "@/lib/api"
import { ProjectForm } from "@/components/projects/ProjectForm"
import { Pencil, Trash2, LogOut } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useAuthStore } from "@/store/authStore"
import { ProfileSettings } from "@/components/auth/ProfileSettings"
import { ProjectSettingsModal } from "@/components/projects/ProjectSettingsModal"

export interface ApiCostData {
  input_tokens: number
  output_tokens: number
  total_usd: number
}

// === NOTIFICATION STORE (local) ===
export interface AppNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'ai' | 'task'
  timestamp: Date
  read: boolean
}

export function TopNavbar() {
  const { projects, fetchProjects, selectedProjectId, setSelectedProjectId, viewMode, setViewMode } = useProjectStore()
  const { tasks } = useTaskStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Panels
  const [showProjectMenu, setShowProjectMenu] = React.useState(false)
  const [showUserPanel, setShowUserPanel] = React.useState(false)
  const [showNotifPanel, setShowNotifPanel] = React.useState(false)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)

  // Auth
  const { user, logout } = useAuthStore()

  // Refs
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const notifRef = React.useRef<HTMLDivElement>(null)
  const userRef = React.useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Notifications
  const [notifications, setNotifications] = React.useState<AppNotification[]>([])
  const [apiCost, setApiCost] = React.useState<ApiCostData | null>(null)

  // Context Menu and Edit States
  const [contextMenuState, setContextMenuState] = React.useState<{ show: boolean, x: number, y: number, projectId: number | null }>({ show: false, x: 0, y: 0, projectId: null })
  const [settingsProject, setSettingsProject] = React.useState<any>(null)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isProjectFormOpen, setIsProjectFormOpen] = React.useState(false)

  React.useEffect(() => {
    if (showUserPanel) {
      api.get('/api/cost').then(res => setApiCost(res.data)).catch(console.error)
    }
  }, [showUserPanel])

  React.useEffect(() => {
    setMounted(true)
    fetchProjects()
  }, [])

  // Handle Context Menu (Right Click)
  const handleContextMenu = (e: React.MouseEvent, projectId: number) => {
    e.preventDefault()
    setContextMenuState({
      show: true,
      x: e.clientX,
      y: e.clientY,
      projectId
    })
  }

  const closeContextMenu = () => {
    setContextMenuState(prev => ({ ...prev, show: false }))
  }

  React.useEffect(() => {
    const handleGlobalClick = () => closeContextMenu()
    if (contextMenuState.show) {
      document.addEventListener("click", handleGlobalClick)
      document.addEventListener("contextmenu", handleGlobalClick)
    }
    return () => {
      document.removeEventListener("click", handleGlobalClick)
      document.removeEventListener("contextmenu", handleGlobalClick)
    }
  }, [contextMenuState.show])

  const { deleteProject } = useProjectStore()

  const handleEditClick = (projectId: number) => {
    const p = projects.find(x => x.id === projectId)
    if (p) {
      setSettingsProject(p)
      setIsSettingsOpen(true)
      setShowProjectMenu(false)
      closeContextMenu()
    }
  }

  const [projectToDelete, setProjectToDelete] = React.useState<number | null>(null)

  const handleDeleteClick = (projectId: number) => {
    setProjectToDelete(projectId)
  }

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return
    await deleteProject(projectToDelete)
    if (selectedProjectId === projectToDelete) {
      setSelectedProjectId(null)
    }
    closeContextMenu()
    setProjectToDelete(null)
  }

  // Generate notifications from upcoming tasks
  React.useEffect(() => {
    const mainTasks = tasks.filter(t => !t.parent_task_id)
    const upcoming: AppNotification[] = []

    mainTasks.forEach(task => {
      if (task.due_date && task.status !== 'done') {
        const dueDate = new Date(task.due_date)
        if (isToday(dueDate)) {
          upcoming.push({
            id: `task-today-${task.id}`,
            title: '📅 Bugün Bitirilmeli',
            message: task.title,
            type: 'task',
            timestamp: dueDate,
            read: false,
          })
        } else if (isTomorrow(dueDate)) {
          upcoming.push({
            id: `task-tomorrow-${task.id}`,
            title: '⏰ Yarın Son Gün',
            message: task.title,
            type: 'warning',
            timestamp: dueDate,
            read: false,
          })
        } else if (isBefore(dueDate, addDays(new Date(), 3)) && !isBefore(dueDate, new Date())) {
          upcoming.push({
            id: `task-soon-${task.id}`,
            title: '📋 Yaklaşan Görev',
            message: `${task.title} — ${format(dueDate, 'dd MMM', { locale: tr })}`,
            type: 'info',
            timestamp: dueDate,
            read: false,
          })
        }
      }
    })

    setNotifications(prev => {
      // Keep persistent (AI/system) notifications + add upcoming task notifications
      const persistent = prev.filter(n => n.type === 'ai')
      const taskIds = new Set(upcoming.map(n => n.id))
      return [...persistent, ...upcoming].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    })
  }, [tasks])

  const unreadCount = notifications.filter(n => !n.read).length

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  // Close panels on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowProjectMenu(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifPanel(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserPanel(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const currentProject = projects.find(p => p.id === selectedProjectId)

  const navItems = [
    { id: 'dashboard', label: 'Kontrol Paneli', icon: LayoutDashboard },
    { id: 'all_tasks', label: 'Görevler', icon: ListTodo },
    { id: 'calendar', label: 'Takvim', icon: CalendarDays },
    { id: 'notes', label: 'Notlar', icon: NotebookPen },
    { id: 'ai_chat', label: 'AI Sohbet', icon: Bot },
    { id: 'venus_ads', label: 'Venüs Reklam', icon: Megaphone },
  ]

  const notifTypeIcon: Record<string, React.ReactNode> = {
    info: <Clock className="w-4 h-4 text-blue-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    ai: <span className="text-sm">🤖</span>,
    task: <Check className="w-4 h-4 text-emerald-500" />,
  }

  return (
    <header className="w-full bg-[#f5f2e8]/80 dark:bg-[#0f1117]/80 backdrop-blur-xl border-b border-[#e8e4d8]/40 dark:border-white/5 px-4 lg:px-8 py-3 shrink-0 z-30 print:hidden">
      <div className="flex items-center justify-between gap-4">
        {/* Sol: Navigation */}
        <nav className="flex items-center gap-1 overflow-visible">
          {navItems.map(item => {
            const isActive = viewMode === item.id
            return (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark shadow-sm'
                    : 'text-brand-gray dark:text-gray-400 hover:text-brand-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            )
          })}

          {/* Firmalar — Hover ile açılır */}
          <div
            className="relative ml-1"
            ref={dropdownRef}
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
              setShowProjectMenu(true)
            }}
            onMouseLeave={() => {
              hoverTimeoutRef.current = setTimeout(() => setShowProjectMenu(false), 300)
            }}
          >
            <button
              onClick={() => setShowProjectMenu(prev => !prev)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                viewMode === 'project'
                  ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark shadow-sm'
                  : 'text-brand-gray dark:text-gray-400 hover:text-brand-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {currentProject && (
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: currentProject.color || '#6366f1' }} />
              )}
              <span className="hidden md:inline">{currentProject?.name || 'Firmalar'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showProjectMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProjectMenu && (
              <div
                className="absolute top-full left-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 py-2 z-[100]"
                style={{ animation: 'fadeSlideDown 0.15s ease-out' }}
              >
                <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Firmalar</div>
                <div className="max-h-[300px] overflow-y-auto">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProjectId(p.id)
                        setViewMode('project')
                        setShowProjectMenu(false)
                      }}
                      onContextMenu={(e) => handleContextMenu(e, p.id)}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium ${
                        selectedProjectId === p.id ? 'bg-slate-50 dark:bg-slate-700' : ''
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm border border-white/30" style={{ backgroundColor: p.color || '#6366f1' }} />
                      <span className="text-brand-dark dark:text-white truncate flex-1">{p.name}</span>
                      {selectedProjectId === p.id && <span className="text-[10px] font-bold text-brand-yellow">●</span>}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 dark:border-white/10 mt-1 pt-1">
                  <button 
                    onClick={() => {
                      setShowProjectMenu(false)
                      setIsProjectFormOpen(true)
                    }}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-semibold text-brand-yellow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Firma Ekle
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Sağ: Aksiyonlar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Bildirim Paneli */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifPanel(!showNotifPanel); setShowUserPanel(false); }}
              className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative"
            >
              <Bell className="w-4 h-4 text-brand-gray dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifPanel && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-brand-dark dark:text-white">Bildirimler</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] font-semibold text-brand-yellow hover:underline">
                      Tümünü okundu işaretle
                    </button>
                  )}
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <Bell className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                      <p className="text-xs text-brand-gray dark:text-gray-500">Bildirim yok</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.read ? 'bg-brand-yellow/5' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                          {notifTypeIcon[n.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-brand-dark dark:text-white">{n.title}</p>
                          <p className="text-[11px] text-brand-gray dark:text-gray-400 truncate mt-0.5">{n.message}</p>
                        </div>
                        <button onClick={() => dismissNotification(n.id)} className="text-slate-300 hover:text-slate-500 transition p-1 shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Light/Dark Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-brand-yellow" /> : <Moon className="w-4 h-4 text-brand-dark" />}
            </button>
          )}

          {/* User Panel */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => { setShowUserPanel(!showUserPanel); setShowNotifPanel(false); }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors overflow-hidden border-2 ${showUserPanel ? 'border-brand-yellow' : 'border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
                {user?.avatar_url ? (
                  <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-brand-gray dark:text-gray-400" />
              )}
            </button>

            {showUserPanel && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar_url}`} alt="A" className="w-full h-full object-cover" />
                      ) : (
                         user?.username?.substring(0,2).toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-dark dark:text-white capitalize truncate max-w-[120px]">{user?.username || 'Kullanıcı'}</p>
                      <p className="text-[10px] text-brand-gray dark:text-gray-500">My World Üyesi</p>
                    </div>
                  </div>
                </div>
                <div className="py-2 px-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-500">API Maliyeti</span>
                    <span className="text-xs font-black text-brand-dark dark:text-white">
                      ${apiCost?.total_usd?.toFixed(4) || "0.0000"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Giriş: {apiCost?.input_tokens?.toLocaleString('tr-TR') || 0}</span>
                    <span>Çıkış: {apiCost?.output_tokens?.toLocaleString('tr-TR') || 0}</span>
                  </div>
                </div>
                <div className="py-1">
                  <button 
                    onClick={() => { setIsProfileOpen(true); setShowUserPanel(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-brand-gray dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium flex items-center gap-2"
                  >
                    Profil Ayarları
                  </button>
                  <button 
                    onClick={() => { logout(); setShowUserPanel(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Çıkış Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu for Projects */}
      {contextMenuState.show && (
        <div 
          className="fixed animate-in fade-in zoom-in-95 duration-100 z-[9999] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 py-1.5 min-w-[140px]"
          style={{ top: contextMenuState.y, left: contextMenuState.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => handleEditClick(contextMenuState.projectId!)}
            className="w-full text-left px-4 py-2 text-sm text-brand-dark dark:text-white font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Düzenle
          </button>
          <button 
            onClick={() => handleDeleteClick(contextMenuState.projectId!)}
            className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Sil
          </button>
        </div>
      )}

      {/* Project Settings Modal */}
      {settingsProject && (
        <ProjectSettingsModal 
          project={settingsProject} 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      {/* Add Project Modal standalone */}
      <ProjectForm 
        open={isProjectFormOpen} 
        onOpenChange={setIsProjectFormOpen} 
        hideTrigger={true} 
      />

      <ConfirmDialog 
        isOpen={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        title="Projeyi Sil"
        description="Bu projeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        onConfirm={confirmDeleteProject}
      />

      <ProfileSettings isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </header>
  )
}
