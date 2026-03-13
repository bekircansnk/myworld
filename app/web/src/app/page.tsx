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
import { useAuthStore } from "@/store/authStore"
import { LoginOverlay } from "@/components/auth/LoginOverlay"

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading, checkAuth } = useAuthStore()
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTaskStore()
  const { projects, fetchProjects, selectedProjectId, viewMode, isLoading: projLoading } = useProjectStore()
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

  if (authLoading) {
    return <div className="flex-1 flex flex-col items-center justify-center p-8 h-full">Yükleniyor...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen w-full relative">
         <LoginOverlay />
      </div>
    )
  }

  if (tasksLoading && tasks.length === 0) {
    return <div className="p-8 flex items-center justify-center h-full">Görevler Yükleniyor...</div>
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
  } else if (viewMode === 'project' && currentProject) {
    pageTitle = currentProject.name
    pageDescription = "Bu firmaya ait görevleri aşağıdaki panolarda yönetin."
  }

  const isDashboard = viewMode === 'dashboard'
  const isCalendar = viewMode === 'calendar'
  const isAIChat = viewMode === 'ai_chat'

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* ÜST NAVBAR — Yatay, tüm ekranlarda */}
      <TopNavbar />

      {showMorning && <MorningScreen onDismiss={handleMorningDismiss} />}

      {/* ANA İÇERİK */}
      {isCalendar ? (
        <CalendarPage />
      ) : isAIChat ? (
        <div className="flex-1 overflow-hidden p-5 lg:p-8">
          <AIChatDashboard />
        </div>
      ) : (
        <div className={`flex-1 flex flex-col ${isDashboard ? 'overflow-hidden p-5 lg:p-8' : 'overflow-y-auto overflow-x-hidden p-5 lg:p-8'}`}>

          {/* Dashboard — Header DashboardWidgets içinde */}
          {isDashboard ? (
            <DashboardWidgets />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold tracking-tight">{pageTitle}</h1>
                  <p className="text-muted-foreground text-sm mt-0.5">{pageDescription}</p>
                </div>
                {(viewMode === 'all_tasks' || viewMode === 'project') && <TaskForm />}
              </div>
              {viewMode === 'notes' ? (
                <NotesList />
              ) : (
                <KanbanBoard projectId={selectedProjectId} />
              )}
            </>
          )}
        </div>
      )}

      {/* Görev Detay Paneli (Her yerde açılabilir) */}
      <TaskDetailPanel />
      <NoteDetailPanel />
    </div>
  )
}
