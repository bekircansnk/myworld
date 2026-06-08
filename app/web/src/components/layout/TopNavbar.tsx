"use client"

import * as React from "react"
import { useProjectStore } from "@/stores/projectStore"
import { useTaskStore } from "@/stores/taskStore"
import { useTheme } from "next-themes"
import { LayoutDashboard, ListTodo, CalendarDays, NotebookPen, Bot, Megaphone, Camera, Menu, Bell, Search, Plus, Loader2, PlayCircle, Clock, CheckCircle2, MoreVertical, X, Shield, Sun, Moon, User, ChevronDown, AlertTriangle, Check, Smartphone, Briefcase, ClipboardList, MessageSquare } from "lucide-react"
import { format, isToday, isTomorrow, isBefore, addDays } from "date-fns"
import { tr } from "date-fns/locale"
import { api } from "@/lib/api"
import { ProjectForm } from "@/components/projects/ProjectForm"
import { Pencil, Trash2, LogOut } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useAuthStore, canViewCompany, isAdmin, isSuperAdmin, canAccessAdminPanel } from "@/store/authStore"
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
  const { projects, fetchProjects, selectedProjectId, setSelectedProjectId, viewMode, setViewMode, switchCompany } = useProjectStore()
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

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  const [showInstallBtn, setShowInstallBtn] = React.useState(true)
  const [isAndroid, setIsAndroid] = React.useState(false)

  React.useEffect(() => {
    // Android tespiti
    if (typeof window !== 'undefined') {
      const isCapacitorAndroid = typeof window !== 'undefined' && (window as any).Capacitor?.getPlatform() === 'android';
      const isAgentAndroid = /android/i.test(navigator.userAgent);
      setIsAndroid(isCapacitorAndroid || isAgentAndroid);
    }

    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    
    // 5 dakika sonra navbar'daki butonu gizle (profile taşınacak)
    const hideTimer = setTimeout(() => setShowInstallBtn(false), 5 * 60 * 1000)
    
    return () => { 
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(hideTimer)
    }
  }, [])

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowInstallBtn(false)
      }
    }
  }

  // Context Menu and Edit States
  const [contextMenuState, setContextMenuState] = React.useState<{ show: boolean, x: number, y: number, projectId: number | null }>({ show: false, x: 0, y: 0, projectId: null })
  const [settingsProject, setSettingsProject] = React.useState<any>(null)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isProjectFormOpen, setIsProjectFormOpen] = React.useState(false)

  // Sağ taraftaki aksiyonlar kısmında PWA butonu gösterimi (Android değilse ve süre dolmadıysa)
  const renderPwaInstallBtn = () => {
    if (!deferredPrompt || !showInstallBtn || isAndroid) return null
    
    return (
      <>
        <button
          onClick={handleInstallApp}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all animate-pulse hover:animate-none mr-1"
        >
          Uygulamayı Yükle
        </button>
        <button
          onClick={handleInstallApp}
          className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all animate-pulse hover:animate-none"
          title="Uygulamayı Yükle"
        >
          +
        </button>
      </>
    )
  }

  React.useEffect(() => {
    if (showUserPanel) {
      api.get('/api/cost').then(res => setApiCost(res.data)).catch(console.error)
    }
  }, [showUserPanel])

  React.useEffect(() => {
    setMounted(true)
    fetchProjects()
  }, [])

  const [activities, setActivities] = React.useState<any[]>([])

  // Canlı WS bildirimlerini dinle
  React.useEffect(() => {
    if (!selectedProjectId) return
    
    // İlk yükleme
    api.get(`/api/activities?project_id=${selectedProjectId}`)
      .then(res => setActivities(res.data || []))
      .catch(console.error)

    const handleNewActivity = (e: Event) => {
      const customEvent = e as CustomEvent<any>
      const newAct = customEvent.detail
      
      if (newAct && newAct.project_id === selectedProjectId) {
        setActivities(prev => {
          if (prev.some(a => a.id === newAct.id)) return prev
          return [newAct, ...prev].slice(0, 30)
        })
      }
    }

    window.addEventListener("pikselis-new-activity", handleNewActivity)
    return () => {
      window.removeEventListener("pikselis-new-activity", handleNewActivity)
    }
  }, [selectedProjectId, showNotifPanel])

  const handleActivityClick = async (act: any) => {
    const taskId = act.details?.task_id || act.details?.id || act.details?.task?.id
    if (!taskId) return

    try {
      // 1. Görevi API'den çekip güncel durumunu al
      const response = await api.get(`/api/tasks/${taskId}`)
      const task = response.data
      
      if (task) {
        // 2. Eğer projesi farklıysa projeyi değiştir
        if (task.project_id && task.project_id !== selectedProjectId) {
          switchCompany(task.project_id)
          // Proje değiştikten sonra o projenin görevlerini fetch et
          setTimeout(async () => {
            await useTaskStore.getState().fetchTasks(task.project_id)
            useTaskStore.getState().openTaskDetail(task)
          }, 300)
        } else {
          useTaskStore.getState().openTaskDetail(task)
        }
        setShowNotifPanel(false)
        // Eğer CRM veya başka görünümdeyse Görevler görünümüne geç
        if (viewMode !== 'all_tasks' && viewMode !== 'dashboard') {
          setViewMode('all_tasks')
        }
      }
    } catch (err) {
      console.error("Görev detayına gidilirken hata:", err)
    }
  }

  const handleNotifClick = async (n: AppNotification) => {
    const taskIdStr = n.id.split('-').pop()
    if (!taskIdStr) return
    const taskId = parseInt(taskIdStr)
    if (isNaN(taskId)) return

    try {
      const response = await api.get(`/api/tasks/${taskId}`)
      const task = response.data
      
      if (task) {
        if (task.project_id && task.project_id !== selectedProjectId) {
          switchCompany(task.project_id)
          setTimeout(async () => {
            await useTaskStore.getState().fetchTasks(task.project_id)
            useTaskStore.getState().openTaskDetail(task)
          }, 300)
        } else {
          useTaskStore.getState().openTaskDetail(task)
        }
        setShowNotifPanel(false)
        if (viewMode !== 'all_tasks' && viewMode !== 'dashboard') {
          setViewMode('all_tasks')
        }
      }
    } catch (err) {
      console.error("Bildirim görevine gidilirken hata:", err)
    }
  }

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

  // Sadece izni olan modülleri göster
  const navItems = [
    ...(canViewCompany(user, 'dashboard', selectedProjectId) ? [{ id: 'dashboard', label: 'Kontrol Paneli', icon: LayoutDashboard }] : []),
    ...(canViewCompany(user, 'tasks', selectedProjectId) ? [{ id: 'all_tasks', label: 'Görevler', icon: ListTodo }] : []),
    ...(canViewCompany(user, 'calendar', selectedProjectId) ? [{ id: 'calendar', label: 'Takvim', icon: CalendarDays }] : []),
    ...(canViewCompany(user, 'notes', selectedProjectId) ? [{ id: 'notes', label: 'Notlar', icon: NotebookPen }] : []),
    ...(canViewCompany(user, 'ai_chat', selectedProjectId) ? [{ id: 'ai_chat', label: 'AI Sohbet', icon: Bot }] : []),
    ...(canViewCompany(user, 'ads', selectedProjectId) ? [{ id: 'ads', label: 'Reklam', icon: Megaphone }] : []),
    ...(canViewCompany(user, 'photo_tracking', selectedProjectId) ? [{ id: 'photo_tracking', label: 'Fotoğraf Takip', icon: Camera }] : []),
    ...(canAccessAdminPanel(user) ? [{ id: 'admin', label: 'Yönetim', icon: Shield }] : []),
  ]

  const notifTypeIcon: Record<string, React.ReactNode> = {
    info: <Clock className="w-4 h-4 text-blue-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    ai: <span className="text-sm">🤖</span>,
    task: <Check className="w-4 h-4 text-emerald-500" />,
  }

  return (
    <header className={`w-full bg-[#f5f2e8]/80 dark:bg-[#0f1117]/80 backdrop-blur-xl border-b border-[#e8e4d8]/40 dark:border-white/5 px-3 md:px-4 lg:px-8 pb-2 md:py-3 shrink-0 z-30 print:hidden ${
      isAndroid ? 'pt-[calc(env(safe-area-inset-top,0px)+34px)]' : 'pt-[calc(env(safe-area-inset-top,0px)+8px)]'
    }`}>
      <div className="flex items-center justify-between gap-2 md:gap-4">
        {/* Sol: Mobilde logoyu kaldırdık, sadece küçük başlık */}
        <div className="flex items-center gap-1.5 md:hidden shrink-0">
          <span className="text-sm font-extrabold text-brand-dark dark:text-white">Planla</span>
        </div>
        <nav className="hidden md:flex items-center gap-1 overflow-visible">
          {navItems.map(item => {
            const isActive = viewMode === item.id
            return (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${isActive
                    ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark shadow-sm'
                    : 'text-brand-gray dark:text-gray-400 hover:text-brand-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            )
          })}

        </nav>

        {/* Sağ: Aksiyonlar */}
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 shrink-0">

          {/* Firmalar — Click/Hover ile açılır */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => {
              if (window.innerWidth >= 768) {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                setShowProjectMenu(true)
              }
            }}
            onMouseLeave={() => {
              if (window.innerWidth >= 768) {
                hoverTimeoutRef.current = setTimeout(() => setShowProjectMenu(false), 300)
              }
            }}
          >
            <button
              onClick={() => setShowProjectMenu(prev => !prev)}
              className="flex items-center gap-1 md:gap-2 px-1.5 sm:px-2.5 md:px-4 py-1.5 md:py-2.5 rounded-xl md:rounded-full text-[10px] sm:text-[11px] md:text-sm font-bold whitespace-nowrap transition-all border md:border-none border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shadow-sm"
            >
              {currentProject && (
                <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0" style={{ backgroundColor: currentProject.color || '#6366f1' }} />
              )}
              <span className="truncate max-w-[60px] xs:max-w-[80px] md:max-w-[150px]">{currentProject?.name || 'Firma Seçin'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showProjectMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProjectMenu && (
              <div
                className="absolute top-full right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 py-2 z-[100] max-h-[70vh] overflow-y-auto"
                style={{ animation: 'fadeSlideDown 0.15s ease-out' }}
              >
                <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Firmalar</div>
                <div className="max-h-[300px] overflow-y-auto">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchCompany(p.id)
                        setShowProjectMenu(false)
                      }}
                      onContextMenu={(e) => handleContextMenu(e, p.id)}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium ${selectedProjectId === p.id ? 'bg-indigo-50 dark:bg-indigo-500/20' : ''
                        }`}
                    >
                      <span className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm border border-white/30" style={{ backgroundColor: p.color || '#6366f1' }} />
                      <span className="text-brand-dark dark:text-white truncate flex-1">{p.name}</span>
                      {selectedProjectId === p.id && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
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
          {/* Bildirim Paneli */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifPanel(!showNotifPanel); setShowUserPanel(false); }}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gray dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifPanel && (
              <div className="absolute top-full -right-20 sm:right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden flex flex-col max-h-[500px]">
                <div className="px-4 py-3.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-black text-brand-dark dark:text-white">Ekip & Bildirim Paneli</h3>
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] font-black text-indigo-500 hover:underline uppercase tracking-wider">
                      Okundu Yap
                    </button>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                  {/* KISIM 1: YAKLAŞAN GÖREVLER (BİLDİRİMLER) */}
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Yaklaşan İşler ({notifications.length})</div>
                    {notifications.length === 0 ? (
                      <p className="text-[11px] text-slate-400 dark:text-white/30 text-center py-4 italic">Kritik yaklaşan görev yok.</p>
                    ) : (
                      <div className="space-y-1">
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => handleNotifClick(n)}
                            className={`px-3 py-2 flex items-start gap-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group relative ${!n.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}`}
                          >
                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                              {notifTypeIcon[n.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-brand-dark dark:text-white group-hover:text-indigo-500 transition-colors">{n.title}</p>
                              <p className="text-[11px] text-brand-gray dark:text-gray-400 truncate mt-0.5 leading-snug">{n.message}</p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }} 
                              className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-500 transition p-1 shrink-0 absolute right-1 top-2"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* KISIM 2: CANLI AKTİVİTE AKIŞI (EKİP NE YAPTI?) */}
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Canlı Hareket Akışı ({activities.length})</div>
                    {activities.length === 0 ? (
                      <p className="text-[11px] text-slate-400 dark:text-white/30 text-center py-4 italic">Henüz aktivite yok.</p>
                    ) : (
                      <div className="space-y-1">
                        {activities.slice(0, 10).map(act => {
                          const username = act.username || act.user?.name || act.user?.username || "Sistem"
                          const type = act.activity_type || act.action || "default"
                          
                          // Dinamik ikon
                          let icon = <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
                          if (type.includes("created") || type.includes("ekle")) icon = <Plus className="w-3.5 h-3.5 text-emerald-500" />
                          else if (type.includes("status") || type.includes("updated") || type.includes("güncelle")) icon = <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                          else if (type.includes("comment") || type.includes("yorum")) icon = <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                          else if (type.includes("deleted") || type.includes("sil")) icon = <Trash2 className="w-3.5 h-3.5 text-red-500" />

                          // Dinamik açıklama helper'ı
                          let description = act.description || ""
                          if (!description) {
                            const details = act.details || {}
                            switch (act.action || act.activity_type) {
                              case "task_created":
                                description = `"${details.task_title || "Yeni görev"}" oluşturuldu.`
                                break
                              case "task_status_updated":
                              case "task_updated":
                                description = `"${details.task_title || "Görev"}" güncellendi.`
                                break
                              case "comment_created":
                                description = `"${details.task_title || "Görev"}" altına yorum yazdı.`
                                break
                              case "task_deleted":
                                description = `"${details.task_title || "Görev"}" silindi.`
                                break
                              default:
                                description = typeof details === "string" ? details : "İşlem yaptı."
                            }
                          }

                          // Zaman
                          let timeStr = ""
                          try {
                            const diff = Date.now() - new Date(act.created_at).getTime()
                            const mins = Math.floor(diff / 60000)
                            timeStr = mins < 1 ? "Şimdi" : `${mins} dk önce`
                            if (mins >= 60) {
                              const hrs = Math.floor(mins / 60)
                              timeStr = hrs < 24 ? `${hrs} sa önce` : new Date(act.created_at).toLocaleDateString("tr-TR")
                            }
                          } catch {}

                          return (
                            <div 
                              key={act.id} 
                              onClick={() => handleActivityClick(act)}
                              className="px-3 py-2 flex items-start gap-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group"
                            >
                              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                                {icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-[11px] font-black text-brand-dark dark:text-white group-hover:text-indigo-500 transition-colors">{username}</span>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{timeStr}</span>
                                </div>
                                <p className="text-[11px] text-brand-gray dark:text-gray-400 truncate mt-0.5 leading-snug">{description}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Light/Dark Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-yellow" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-dark" />}
            </button>
          )}

          {/* User Panel */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => { setShowUserPanel(!showUserPanel); setShowNotifPanel(false); }}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors overflow-hidden border-2 ${showUserPanel ? 'border-brand-yellow' : 'border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gray dark:text-gray-400" />
              )}
            </button>

            {showUserPanel && (
              <div className="absolute top-full -right-4 sm:right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] sm:w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden p-2">
                <div className="p-3 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-base shadow-md border-2 border-white dark:border-slate-800">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar_url}`} alt="A" className="w-full h-full object-cover" />
                      ) : (
                        user?.username?.substring(0, 2).toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-brand-dark dark:text-white capitalize truncate">{user?.name || user?.username || 'Kullanıcı'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{currentProject?.name || 'Kişisel Hesap'}</p>
                    </div>
                  </div>
                </div>

                <div className="py-1.5 flex flex-col gap-1">
                  {/* Android APK Yükle Butonu (Büyük, Kalın Font, Net Telefon İkonu) */}
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://myworld-twqx.onrender.com";
                        const res = await fetch(`${apiUrl}/api/app-version`, { cache: 'no-store' });
                        if (res.ok) {
                          const data = await res.json();
                          const a = document.createElement("a");
                          a.href = data.download_url;
                          a.download = `Planla_v${data.version}.apk`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        } else {
                          window.open("https://myworld-twqx.onrender.com/static/Planla_v5.7.apk", "_blank"); // Fallback
                        }
                      } catch (err) {
                        window.open("https://myworld-twqx.onrender.com/static/Planla_v5.7.apk", "_blank"); // Fallback
                      }
                    }}
                    className="w-full text-left px-4 py-3.5 text-xs text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 transition-all font-black flex items-center gap-3 shadow-md rounded-2xl"
                  >
                    <Smartphone className="w-5 h-5 shrink-0" />
                    <span className="text-[12px] tracking-wide font-extrabold">Android Uygulamasını Yükle</span>
                  </button>

                  {/* PWA / Tarayıcı Uygulaması Yükle Butonu */}
                  {deferredPrompt && (
                    <button
                      onClick={() => { handleInstallApp(); setShowUserPanel(false); }}
                      className="w-full text-left px-4 py-3 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-2xl transition-all font-black flex items-center gap-3 border border-indigo-100 dark:border-indigo-950"
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-extrabold">Bilgisayara / Telefona Yükle (Tarayıcı Uygulaması)</span>
                    </button>
                  )}

                  <button
                    onClick={() => { setIsProfileOpen(true); setShowUserPanel(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors font-bold flex items-center gap-2.5"
                  >
                    <User className="w-4 h-4 shrink-0 text-slate-400" />
                    Profil Ayarları
                  </button>

                  <button
                    onClick={() => { logout(); setShowUserPanel(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors font-bold flex items-center gap-2.5 mt-1"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Çıkış Yap
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
