"use client"

import * as React from "react"
import { useProjectStore } from "@/stores/projectStore"
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  NotebookPen,
  Bot,
  MoreHorizontal,
  Megaphone,
  Camera,
  X,
  ShieldAlert
} from "lucide-react"

import { useAuthStore, canViewCompany, isAdmin, canAccessAdminPanel } from "@/store/authStore"

export function MobileBottomNav() {
  const { viewMode, setViewMode, selectedProjectId } = useProjectStore()
  const { user } = useAuthStore()
  const [showMore, setShowMore] = React.useState(false)

  // Ana 5 sekme — mobilde her zaman görünür (İzne göre filtrele)
  const allMainTabs = [
    ...(canViewCompany(user, 'dashboard', selectedProjectId) ? [{ id: 'dashboard', label: 'Panel', icon: LayoutDashboard }] : []),
    ...(canViewCompany(user, 'tasks', selectedProjectId) ? [{ id: 'all_tasks', label: 'Görevler', icon: ListTodo }] : []),
    ...(canViewCompany(user, 'calendar', selectedProjectId) ? [{ id: 'calendar', label: 'Takvim', icon: CalendarDays }] : []),
    ...(canViewCompany(user, 'notes', selectedProjectId) ? [{ id: 'notes', label: 'Notlar', icon: NotebookPen }] : []),
    ...(canViewCompany(user, 'ai_chat', selectedProjectId) ? [{ id: 'ai_chat', label: 'AI', icon: Bot }] : []),
  ]
  
  // En fazla ilk 5'i ana ekranda
  const mainTabs = allMainTabs.slice(0, 5)

  // Kalanlar ve ekstra modüller "Daha Fazla" menüsünde
  const moreTabs = [
    ...allMainTabs.slice(5),
    ...(canViewCompany(user, 'ads', selectedProjectId) ? [{ id: 'ads', label: 'Reklam', icon: Megaphone }] : []),
    ...(canViewCompany(user, 'photo_tracking', selectedProjectId) ? [{ id: 'photo_tracking', label: 'Fotoğraf', icon: Camera }] : []),
    ...(canAccessAdminPanel(user) ? [{ id: 'admin', label: 'Yönetim', icon: ShieldAlert }] : [])
  ]

  // "Daha Fazla" menüsündeki bir sekme aktifse, o ikonu göster
  const activeMore = moreTabs.find(t => t.id === viewMode)
  const isMoreActive = !!activeMore

  return (
    <>
      {/* Overlay — "Daha Fazla" açıkken */}
      {showMore && (
        <div
          className="fixed inset-0 z-[39] bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* "Daha Fazla" menü sheet */}
      {showMore && (
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-[41] md:hidden bottom-sheet-enter">
          <div className="mx-3 mb-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Diğer Modüller</span>
              <button onClick={() => setShowMore(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            {moreTabs.map(tab => {
              const isActive = viewMode === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setViewMode(tab.id as any)
                    setShowMore(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-sm font-semibold">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Ana bottom navigation bar */}
      <nav className="mobile-bottom-nav md:hidden bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-white/10">
        <div className="flex items-center justify-around px-1 h-16">
          {mainTabs.map(tab => {
            const isActive = viewMode === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setViewMode(tab.id as any)
                  setShowMore(false)
                }}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-gray-500'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-100/80 dark:bg-indigo-500/15' : ''}`}>
                  <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                </div>
                <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}

          {/* "Daha Fazla" butonu */}
          <button
            onClick={() => setShowMore(prev => !prev)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all ${
              isMoreActive || showMore
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 dark:text-gray-500'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isMoreActive || showMore ? 'bg-indigo-100/80 dark:bg-indigo-500/15' : ''}`}>
              {activeMore ? (
                <activeMore.icon className="w-5 h-5 stroke-[2.5px]" />
              ) : (
                <MoreHorizontal className={`w-5 h-5 ${showMore ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              )}
            </div>
            <span className={`text-[10px] leading-tight ${isMoreActive ? 'font-bold' : 'font-medium'}`}>
              {activeMore ? activeMore.label : 'Daha'}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
