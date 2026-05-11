"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { useProjectStore } from "@/stores/projectStore"
import { useWebSocketStore } from "@/stores/webSocketStore"
import { useCalendarStore } from "@/stores/calendarStore"
import { KanbanBoard } from "@/components/tasks/KanbanBoard"
import { TaskForm } from "@/components/tasks/TaskForm"
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel"
import { NoteDetailPanel } from "@/components/notes/NoteDetailPanel"
import { DashboardWidgets } from "@/components/dashboard/DashboardWidgets"
import { NotesList } from "@/components/notes/NotesList"
import { MorningScreen } from "@/components/dashboard/MorningScreen"
import { CalendarPage } from "@/components/calendar/CalendarPage"
import { AIChatDashboard } from "@/components/ai-chat/AIChatDashboard"
import { TopNavbar } from "@/components/layout/TopNavbar"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { useAuthStore } from "@/store/authStore"
import { LoginOverlay } from "@/components/auth/LoginOverlay"
import { VenusAdsLayout } from "@/components/venus-ads/VenusAdsLayout"
import { PhotoTrackingLayout } from "@/components/photo-tracking/PhotoTrackingLayout"
import { OfflineBanner } from "@/components/ui/OfflineBanner"
import { AdminPanel } from "@/components/admin/AdminPanel"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, checkAuth, _hasHydrated: authHydrated } = useAuthStore()
  const { tasks, fetchTasks } = useTaskStore()
  const { projects, fetchProjects, selectedProjectId, viewMode } = useProjectStore()
  const { fetchEvents } = useCalendarStore()

  const [showMorning, setShowMorning] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    checkAuth()
    
    // Sabah Karşılama Kontrolü
    const todayStr = new Date().toDateString()
    const lastGreet = localStorage.getItem("myworld_last_greet")
    if (lastGreet !== todayStr) {
      setShowMorning(true)
    }
  }, [])

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchProjects()
      fetchTasks()
      fetchEvents()
      useWebSocketStore.getState().connect()
    }
  }, [isAuthenticated])

  const handleMorningDismiss = () => {
    localStorage.setItem("myworld_last_greet", new Date().toDateString())
    setShowMorning(false)
  }

  // Hydrate olmadan önce kısa bir splash göster (tipik 20-50ms)
  if (!authHydrated || (!isAuthenticated && authLoading)) {
    return <div className="flex-1 flex flex-col items-center justify-center p-8 h-full">Yükleniyor...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen w-full relative">
         <LoginOverlay />
      </div>
    )
  }

  const currentProject = projects.find(p => p.id === selectedProjectId)

  let pageTitle = "Tüm İşler"
  let pageDescription = "İşlerini ve hedeflerini buradan yönetebilirsin."

  if (viewMode === 'notes') {
    pageTitle = "Akıllı Notlarım"
    pageDescription = "Tüm fikirlerinizi ve kayıtlarınızı yönetin."
  } else if (viewMode === 'calendar') {
    pageTitle = "Takvim"
    pageDescription = "Günlük, haftalık ve aylık programınızı yönetin."
  } else if (viewMode === 'ai_chat') {
    pageTitle = "AI Sohbet"
    pageDescription = "Akıllı asistanınızla konuşun, görev ve plan oluşturun."
  } else if (viewMode === 'venus_ads') {
    pageTitle = currentProject ? `${currentProject.name} Reklam Paneli` : "Reklam Paneli"
    pageDescription = "Reklam operasyonlarını ve analizlerini yönetin."
  } else if (viewMode === 'project' && currentProject) {
    pageTitle = currentProject.name
    pageDescription = "Bu firmaya ait görevleri aşağıdaki panolarda yönetin."
  } else if (viewMode === 'photo_tracking') {
    pageTitle = currentProject ? `${currentProject.name} Fotoğraf Takip` : "Fotoğraf Takip"
    pageDescription = "Fotoğraf üretim operasyonlarını yönetin ve raporlayın."
  } else if (viewMode === 'admin') {
    pageTitle = "Yönetim Paneli"
    pageDescription = "Kullanıcılar, yetkiler ve sistem yönetimi."
  }

  const isDashboard = viewMode === 'dashboard'
  const isCalendar = viewMode === 'calendar'
  const isAIChat = viewMode === 'ai_chat'
  const isVenusAds = viewMode === 'venus_ads'
  const isPhotoTracking = viewMode === 'photo_tracking'
  const isAdminPanel = viewMode === 'admin'
  
  // İzin kontrolleri
  const { canView, isAdmin } = require("@/store/authStore")
  
  // İzinsiz sayfaya geçiş engelleme (Fallback)
  if (isVenusAds && !canView(user, 'venus_ads')) return <div className="p-8 text-center text-red-500">Bu modüle erişim yetkiniz yok.</div>
  if (isCalendar && !canView(user, 'calendar')) return <div className="p-8 text-center text-red-500">Bu modüle erişim yetkiniz yok.</div>
  if (isAIChat && !canView(user, 'ai_chat')) return <div className="p-8 text-center text-red-500">Bu modüle erişim yetkiniz yok.</div>
  if (isPhotoTracking && !canView(user, 'photo_tracking')) return <div className="p-8 text-center text-red-500">Bu modüle erişim yetkiniz yok.</div>
  if (isAdminPanel && !isAdmin(user)) return <div className="p-8 text-center text-red-500">Yönetici yetkiniz yok.</div>

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden" id="app-root">
      {/* ÜST NAVBAR — Yatay, tüm ekranlarda */}
      <TopNavbar />

      {/* Çevrimdışı/Senkronizasyon Banner */}
      <OfflineBanner />

      {showMorning && <MorningScreen onDismiss={handleMorningDismiss} />}

      {/* ANA İÇERİK */}
      {isAdminPanel ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-900/50">
           <AdminPanel />
        </div>
      ) : isCalendar ? (
        <CalendarPage />
      ) : isAIChat ? (
        <div className="flex-1 overflow-hidden p-3 md:p-5 lg:p-8 mobile-content-area">
          <AIChatDashboard />
        </div>
      ) : isVenusAds ? (
        <VenusAdsLayout projectId={selectedProjectId} />
      ) : isPhotoTracking ? (
        <PhotoTrackingLayout projectId={selectedProjectId} />
      ) : (
        <div className={`flex-1 flex flex-col mobile-content-area ${isDashboard ? 'overflow-y-auto lg:overflow-hidden p-3 md:p-5 lg:p-8' : 'overflow-y-auto overflow-x-hidden p-3 md:p-5 lg:p-8'}`}>

          {/* Dashboard — Header DashboardWidgets içinde */}
          {isDashboard && canView(user, 'dashboard') ? (
            <DashboardWidgets />
          ) : !canView(user, 'dashboard') && isDashboard ? (
             <div className="flex-1 flex items-center justify-center text-slate-400">Dashboard erişiminiz kapalı. Yandaki menüden yetkili olduğunuz bir modülü seçin.</div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold tracking-tight">{pageTitle}</h1>
                  <p className="text-muted-foreground text-sm mt-0.5">{pageDescription}</p>
                </div>
                {(viewMode === 'all_tasks' || viewMode === 'project') && canView(user, 'tasks') && <TaskForm />}
              </div>
              {viewMode === 'notes' ? (
                 canView(user, 'notes') ? <NotesList /> : <div className="text-red-500">Notlar modülüne erişiminiz yok.</div>
              ) : (
                 canView(user, 'tasks') ? <KanbanBoard projectId={selectedProjectId} /> : <div className="text-red-500">Görevler modülüne erişiminiz yok.</div>
              )}
            </>
          )}
        </div>
      )}

      {/* Görev Detay Paneli (Her yerde açılabilir) */}
      <TaskDetailPanel />
      <NoteDetailPanel />

      {/* Mobil Alt Navigasyon */}
      <MobileBottomNav />
    </div>
  )
}
