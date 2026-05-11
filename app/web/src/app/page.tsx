"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { useProjectStore } from "@/stores/projectStore"
import { useWebSocketStore } from "@/stores/webSocketStore"
import { useCalendarStore } from "@/stores/calendarStore"
import { useNoteStore } from "@/stores/noteStore"
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
import { useAuthStore, canViewCompany, canEditCompany, isAdmin } from "@/store/authStore"
import { LoginOverlay } from "@/components/auth/LoginOverlay"
import { AdsLayout } from "@/components/ads-panel/AdsLayout"
import { PhotoTrackingLayout } from "@/components/photo-tracking/PhotoTrackingLayout"
import { OfflineBanner } from "@/components/ui/OfflineBanner"
import { AdminPanel } from "@/components/admin/AdminPanel"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, checkAuth, _hasHydrated: authHydrated } = useAuthStore()
  const { tasks, fetchTasks } = useTaskStore()
  const { projects, fetchProjects, selectedProjectId, viewMode } = useProjectStore()
  const { fetchEvents } = useCalendarStore()
  const { fetchNotes } = useNoteStore()

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

  // İlk yüklemede firmaları çek
  React.useEffect(() => {
    if (isAuthenticated) {
      fetchProjects()
      useWebSocketStore.getState().connect()
    }
  }, [isAuthenticated])

  // Firma değiştiğinde tüm modül verilerini yeniden çek
  React.useEffect(() => {
    if (isAuthenticated && selectedProjectId) {
      fetchTasks(selectedProjectId)
      fetchEvents(selectedProjectId)
      fetchNotes(selectedProjectId)
    }
  }, [isAuthenticated, selectedProjectId])

  const handleMorningDismiss = () => {
    localStorage.setItem("myworld_last_greet", new Date().toDateString())
    setShowMorning(false)
  }

  // Hydrate olmadan önce kısa bir splash göster
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

  // Firma bazlı izin kontrolleri
  const canViewModule = (module: string) => canViewCompany(user, module, selectedProjectId);
  const canEditModule = (module: string) => canEditCompany(user, module, selectedProjectId);

  let pageTitle = "Tüm İşler"
  let pageDescription = "İşlerini ve hedeflerini buradan yönetebilirsin."

  if (viewMode === 'notes') {
    pageTitle = currentProject ? `${currentProject.name} — Notlar` : "Notlar"
    pageDescription = "Bu firmaya ait notları yönetin."
  } else if (viewMode === 'calendar') {
    pageTitle = currentProject ? `${currentProject.name} — Takvim` : "Takvim"
    pageDescription = "Bu firmaya ait takvim etkinliklerini yönetin."
  } else if (viewMode === 'ai_chat') {
    pageTitle = "AI Sohbet"
    pageDescription = "Akıllı asistanınızla konuşun, görev ve plan oluşturun."
  } else if (viewMode === 'ads') {
    pageTitle = currentProject ? `${currentProject.name} — Reklam Paneli` : "Reklam Paneli"
    pageDescription = "Reklam operasyonlarını ve analizlerini yönetin."
  } else if (viewMode === 'project' && currentProject) {
    pageTitle = currentProject.name
    pageDescription = "Bu firmaya ait görevleri aşağıdaki panolarda yönetin."
  } else if (viewMode === 'all_tasks') {
    pageTitle = currentProject ? `${currentProject.name} — Görevler` : "Görevler"
    pageDescription = "Bu firmaya ait görevleri yönetin."
  } else if (viewMode === 'photo_tracking') {
    pageTitle = currentProject ? `${currentProject.name} — Fotoğraf Takip` : "Fotoğraf Takip"
    pageDescription = "Fotoğraf üretim operasyonlarını yönetin ve raporlayın."
  } else if (viewMode === 'admin') {
    pageTitle = "Yönetim Paneli"
    pageDescription = "Kullanıcılar, yetkiler ve sistem yönetimi."
  } else if (viewMode === 'dashboard') {
    pageTitle = currentProject ? `${currentProject.name} — Kontrol Paneli` : "Kontrol Paneli"
    pageDescription = "Firmanın genel durumunu görüntüleyin."
  }

  const isDashboard = viewMode === 'dashboard'
  const isCalendar = viewMode === 'calendar'
  const isAIChat = viewMode === 'ai_chat'
  const isReklamAds = viewMode === 'ads'
  const isPhotoTracking = viewMode === 'photo_tracking'
  const isAdminPanel = viewMode === 'admin'
  
  // İzinsiz sayfaya geçiş engelleme (Fallback)
  if (isReklamAds && !canViewModule('ads')) return <div className="p-8 text-center text-red-500">Bu modüle erişim yetkiniz yok.</div>
  if (isCalendar && !canViewModule('calendar')) return <div className="p-8 text-center text-red-500">Bu modüle erişim yetkiniz yok.</div>
  if (isAIChat && !canViewModule('ai_chat')) return <div className="p-8 text-center text-red-500">Bu modüle erişim yetkiniz yok.</div>
  if (isPhotoTracking && !canViewModule('photo_tracking')) return <div className="p-8 text-center text-red-500">Bu modüle erişim yetkiniz yok.</div>
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
      ) : isReklamAds ? (
        <AdsLayout projectId={selectedProjectId} />
      ) : isPhotoTracking ? (
        <PhotoTrackingLayout projectId={selectedProjectId} />
      ) : (
        <div className={`flex-1 flex flex-col mobile-content-area ${isDashboard ? 'overflow-y-auto lg:overflow-hidden p-3 md:p-5 lg:p-8' : 'overflow-y-auto overflow-x-hidden p-3 md:p-5 lg:p-8'}`}>

          {/* Dashboard */}
          {isDashboard && canViewModule('dashboard') ? (
            <DashboardWidgets />
          ) : !canViewModule('dashboard') && isDashboard ? (
             <div className="flex-1 flex items-center justify-center text-slate-400">Dashboard erişiminiz kapalı. Menüden yetkili olduğunuz bir modülü seçin.</div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold tracking-tight">{pageTitle}</h1>
                  <p className="text-muted-foreground text-sm mt-0.5">{pageDescription}</p>
                </div>
                {(viewMode === 'all_tasks' || viewMode === 'project') && canEditModule('tasks') && <TaskForm />}
              </div>
              {viewMode === 'notes' ? (
                 canViewModule('notes') ? <NotesList /> : <div className="text-red-500">Notlar modülüne erişiminiz yok.</div>
              ) : (
                 canViewModule('tasks') ? <KanbanBoard projectId={selectedProjectId} /> : <div className="text-red-500">Görevler modülüne erişiminiz yok.</div>
              )}
            </>
          )}
        </div>
      )}

      {/* Görev Detay Paneli */}
      <TaskDetailPanel />
      <NoteDetailPanel />

      {/* Mobil Alt Navigasyon */}
      <MobileBottomNav />
    </div>
  )
}
