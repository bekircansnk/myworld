"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { useProjectStore } from "@/stores/projectStore"
import { useWebSocketStore } from "@/stores/webSocketStore"
import { useCalendarStore } from "@/stores/calendarStore"
import { useNoteStore } from "@/stores/noteStore"
import { KanbanBoard } from "@/components/tasks/KanbanBoard"
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel"
import { NoteDetailPanel } from "@/components/notes/NoteDetailPanel"
import { DashboardWidgets } from "@/components/dashboard/DashboardWidgets"
import { NotesList } from "@/components/notes/NotesList"
import { MorningScreen } from "@/components/dashboard/MorningScreen"
import { CalendarPage } from "@/components/calendar/CalendarPage"
import { AIChatDashboard } from "@/components/ai-chat/AIChatDashboard"
import { TopNavbar } from "@/components/layout/TopNavbar"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { useAuthStore, canViewCompany, canEditCompany, isAdmin, canAccessAdminPanel } from "@/store/authStore"
import { LoginOverlay } from "@/components/auth/LoginOverlay"
import { AdsLayout } from "@/components/ads-panel/AdsLayout"
import { PhotoTrackingLayout } from "@/components/photo-tracking/PhotoTrackingLayout"
import { OfflineBanner } from "@/components/ui/OfflineBanner"
import { AdminPanel } from "@/components/admin/AdminPanel"
import { CRMLayout } from "@/components/crm/CRMLayout"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, checkAuth, _hasHydrated: authHydrated } = useAuthStore()
  const { tasks, fetchTasks } = useTaskStore()
  const { projects, fetchProjects, selectedProjectId, viewMode, _hasHydrated: projectHydrated } = useProjectStore()
  const { fetchEvents } = useCalendarStore()
  const { fetchNotes } = useNoteStore()

  const [showMorning, setShowMorning] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    checkAuth()
    
    // Her yeni sekme açılışında veya yenilemede karşılama ekranını göster (Session Storage)
    const sessionGreet = sessionStorage.getItem("pikselis_session_greet")
    if (sessionGreet !== "true") {
      setShowMorning(true)
    }

    // --- BOŞTA KALMA (IDLE DETECTION) VE EKRAN TASARRUFU ---
    let idleTimer: NodeJS.Timeout
    const idleTimeoutVal = 10 * 60 * 1000 // 10 Dakika boşta kalma süresi

    const resetIdleTimer = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        // Kullanıcı 10 dakika boyunca aktif değilse tasarruf moduna (Karşılama Ekranı) al
        setShowMorning(true)
        sessionStorage.removeItem("pikselis_session_greet") // Tekrar oturum selamlamasını sıfırla
      }, idleTimeoutVal)
    }

    // Aktiflik dinleyicileri
    const activityEvents = ["mousemove", "mousedown", "keypress", "touchstart", "scroll"]
    activityEvents.forEach(event => {
      window.addEventListener(event, resetIdleTimer)
    })

    resetIdleTimer() // Zamanlayıcıyı başlat

    return () => {
      clearTimeout(idleTimer)
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetIdleTimer)
      })
    }
  }, [])

  // İlk yüklemede firmaları çek
  React.useEffect(() => {
    if (isAuthenticated) {
      fetchProjects()
      useWebSocketStore.getState().connect()
      
      // Backend'i uyandır (Render.com cold start önlemi)
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/health`).catch(() => {});
      
      const authPoll = setInterval(() => {
        if (document.hidden) return
        const currentProjects = useProjectStore.getState().projects
        if (currentProjects.length === 0) {
           useAuthStore.getState().checkAuth();
           fetchProjects();
        }
      }, 30000);
      
      return () => clearInterval(authPoll);
    }
  }, [isAuthenticated])

  // Firma veya viewMode veya karşılama ekranı durumu değiştiğinde tüm modül verilerini yeniden çek
  React.useEffect(() => {
    if (!isAuthenticated || !selectedProjectId || !projectHydrated) return

    const refreshData = (isInitial = false) => {
      // Eğer sekme arka plandaysa veya Karşılama Ekranı (Tasarruf Modu) açık ise poll işlemlerini pas geç (İşlemci & RAM tasarrufu)
      if (!isInitial && (document.hidden || showMorning)) return
      
      if (viewMode === 'all_tasks' || viewMode === 'project' || viewMode === 'dashboard') {
        fetchTasks(selectedProjectId)
      }
      if (viewMode === 'calendar' || viewMode === 'dashboard') {
        fetchEvents(selectedProjectId)
      }
      if (viewMode === 'notes' || viewMode === 'dashboard') {
        fetchNotes(selectedProjectId)
      }
    }

    refreshData(true)

    const pollInterval = setInterval(() => refreshData(false), 60000)

    return () => clearInterval(pollInterval)
  }, [isAuthenticated, selectedProjectId, viewMode, projectHydrated, showMorning])

  const handleMorningDismiss = () => {
    sessionStorage.setItem("pikselis_session_greet", "true")
    setShowMorning(false)
  }

  // Hydrate olmadan önce kısa bir splash göster
  // Auth henüz hazır değilse bekle
  if (!authHydrated || (!isAuthenticated && authLoading)) {
    return <div className="flex-1 flex flex-col items-center justify-center p-8 h-full">Yükleniyor...</div>
  }

  // Giriş yapılmamışsa direkt login — project hydration bekleme
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen w-full relative">
         <LoginOverlay />
      </div>
    )
  }

  // Giriş yapılmış ama project store henüz hydrate olmamışsa kısa bekle
  if (!projectHydrated) {
    return <div className="flex-1 flex flex-col items-center justify-center p-8 h-full">Yükleniyor...</div>
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
  } else if (viewMode === 'crm') {
    pageTitle = currentProject ? `${currentProject.name} — CRM Paneli` : "CRM Paneli"
    pageDescription = "Satış kanalları, adaylar ve çoklu kanal iletişimlerini yönetin."
  }

  const isDashboard = viewMode === 'dashboard'
  const isCalendar = viewMode === 'calendar'
  const isAIChat = viewMode === 'ai_chat'
  const isReklamAds = viewMode === 'ads'
  const isPhotoTracking = viewMode === 'photo_tracking'
  const isAdminPanel = viewMode === 'admin'
  const isCRM = viewMode === 'crm'
  
  const renderErrorState = (message: string) => (
    <div className="flex flex-col h-full w-full overflow-hidden" id="app-root">
      <TopNavbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{message}</h2>
        <p className="text-slate-500 text-sm mb-6 text-center max-w-md">Erişmek istediğiniz bölüme yetkiniz bulunmuyor veya sistem tarafından kısıtlanmış durumda.</p>
        <button 
          onClick={() => {
            useProjectStore.getState().setViewMode('dashboard');
          }}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors"
        >
          Ana Sayfaya Dön
        </button>
      </div>
      <MobileBottomNav />
    </div>
  );

  // İzinsiz sayfaya geçiş engelleme (Fallback)
  if (isReklamAds && !canViewModule('ads')) return renderErrorState("Bu modüle erişim yetkiniz yok.");
  if (isCalendar && !canViewModule('calendar')) return renderErrorState("Bu modüle erişim yetkiniz yok.");
  if (isAIChat && !canViewModule('ai_chat')) return renderErrorState("Bu modüle erişim yetkiniz yok.");
  if (isPhotoTracking && !canViewModule('photo_tracking')) return renderErrorState("Bu modüle erişim yetkiniz yok.");
  if (isAdminPanel && !canAccessAdminPanel(user)) return renderErrorState("Yönetim paneline erişim yetkiniz yok.");

  return isCRM ? (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-slate-900" id="crm-app-root">
      <OfflineBanner />
      <CRMLayout projectId={selectedProjectId} />
    </div>
  ) : (
    <div className="flex flex-col h-full w-full overflow-hidden" id="app-root">
      {/* ÜST NAVBAR — Yatay, tüm ekranlarda */}
      <TopNavbar />

      {/* Çevrimdışı/Senkronizasyon Banner */}
      <OfflineBanner />

      {showMorning && <MorningScreen onDismiss={handleMorningDismiss} />}

      {/* ANA İÇERİK */}
      <div key={viewMode} className="flex-1 overflow-hidden flex flex-col animate-in fade-in duration-300 ease-out">
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
          <div className={`flex-1 flex flex-col mobile-content-area ${isDashboard ? 'overflow-y-auto lg:overflow-hidden p-3 md:p-5 lg:p-8' : (viewMode === 'notes' ? 'overflow-y-auto overflow-x-hidden p-3 md:p-5 lg:p-8' : 'overflow-hidden')}`}>

            {/* Dashboard */}
            {isDashboard && canViewModule('dashboard') ? (
              <DashboardWidgets />
            ) : !canViewModule('dashboard') && isDashboard ? (
               <div className="flex-1 flex items-center justify-center text-slate-400">Dashboard erişiminiz kapalı. Menüden yetkili olduğunuz bir modülü seçin.</div>
            ) : (
              <>
                {viewMode === 'notes' ? (
                  <>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h1 className="text-xl lg:text-2xl font-bold tracking-tight">{pageTitle}</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">{pageDescription}</p>
                      </div>
                    </div>
                    {canViewModule('notes') ? <NotesList /> : <div className="text-red-500">Notlar modülüne erişiminiz yok.</div>}
                  </>
                ) : (
                   canViewModule('tasks') ? <KanbanBoard projectId={selectedProjectId} canEdit={canEditModule('tasks')} /> : <div className="text-red-500 p-8">Görevler modülüne erişiminiz yok.</div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Görev Detay Paneli */}
      <TaskDetailPanel />
      <NoteDetailPanel />

      {/* Mobil Alt Navigasyon */}
      <MobileBottomNav />
    </div>
  )
}
