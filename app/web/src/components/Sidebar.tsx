"use client"

import * as React from "react"
import { useProjectStore } from "@/stores/projectStore"
import { useWebSocketStore } from "@/stores/webSocketStore"
import { ProjectForm } from "@/components/projects/ProjectForm"
import { ProjectSettingsModal } from "@/components/projects/ProjectSettingsModal"
import { Button } from "@/components/ui/button"
import { Settings2, Sun, Moon, LayoutDashboard, ListTodo, NotebookPen, GripVertical, CalendarDays } from "lucide-react"
import { useTheme } from "next-themes"

export function Sidebar() {
  const { projects, fetchProjects, selectedProjectId, setSelectedProjectId, viewMode, setViewMode } = useProjectStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [projectToEdit, setProjectToEdit] = React.useState<any>(null)
  
  // Collapse state
  const [isExpanded, setIsExpanded] = React.useState(true)

  React.useEffect(() => {
    setMounted(true)
    fetchProjects()
    useWebSocketStore.getState().connect()
  }, [])

  return (
    <div className={`hidden lg:flex transition-all duration-300 ${isExpanded ? 'w-72' : 'w-20'} glass-sidebar flex-col shadow-2xl z-10 relative`}>
      {/* İçe/Dışa Kapatma Butonu */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm rounded-full p-1 z-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`}><path d="m15 18-6-6 6-6"/></svg>
      </button>

      {/* 3D Hareketli Logo Alanı */}
      <div className={`p-5 border-b border-slate-200/50 dark:border-white/5 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => setIsExpanded(true)}>
          <div className={`relative ${isExpanded ? 'w-14 h-14' : 'w-12 h-12'} flex items-center justify-center transform transition-all duration-500 hover:scale-105 shrink-0`}>
            {/* Yeni Premium Logo Entegrasyonu */}
            <img 
              src="/icons/icon-512x512.png" 
              alt="Planla Logo" 
              className="w-full h-full object-contain rounded-2xl shadow-lg border border-slate-200/50 dark:border-white/10 bg-white/5"
            />
          </div>
          {isExpanded && (
            <span className="font-extrabold text-2xl tracking-tight text-gradient drop-shadow-sm whitespace-nowrap">
              Planla
            </span>
          )}
        </div>
      </div>
      
      {/* Menü İçeriği */}
      <div className={`flex-1 overflow-y-auto py-6 space-y-8 scrollbar-hide ${isExpanded ? 'px-4' : 'px-2'}`}>
        {/* Ana Menü */}
        <div>
          {isExpanded && (
            <h4 className="mb-3 px-2 text-[11px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2">
              <span className="w-4 h-px bg-slate-300 dark:bg-slate-700"></span>
              Genel
            </h4>
          )}
          <nav className="grid gap-2 text-sm font-medium">
            <Button 
                variant="ghost" 
                title="Dashboard"
                className={`flex items-center transition-all duration-300 btn-3d rounded-xl ${isExpanded ? 'w-full justify-start h-12 gap-3 px-4 text-sm' : 'w-12 h-12 justify-center mx-auto'} ${viewMode === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm inner-shadow-box' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}
                onClick={() => setViewMode('dashboard')}
            >
                <LayoutDashboard className={`w-5 h-5 shrink-0 ${viewMode === 'dashboard' ? 'scale-110' : ''} transition-transform`} />
                {isExpanded && <span>Dashboard</span>}
            </Button>
            <Button 
                variant="ghost" 
                title="Tüm İşlerim"
                className={`flex items-center transition-all duration-300 btn-3d rounded-xl ${isExpanded ? 'w-full justify-start h-12 gap-3 px-4 text-sm' : 'w-12 h-12 justify-center mx-auto'} ${viewMode === 'all_tasks' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm inner-shadow-box' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}
                onClick={() => setViewMode('all_tasks')}
            >
                <ListTodo className={`w-5 h-5 shrink-0 ${viewMode === 'all_tasks' ? 'scale-110' : ''} transition-transform`} />
                {isExpanded && <span>Tüm İşlerim</span>}
            </Button>
            <Button 
                variant="ghost" 
                title="Takvim"
                className={`flex items-center transition-all duration-300 btn-3d rounded-xl ${isExpanded ? 'w-full justify-start h-12 gap-3 px-4 text-sm' : 'w-12 h-12 justify-center mx-auto'} ${viewMode === 'calendar' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm inner-shadow-box' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}
                onClick={() => setViewMode('calendar')}
            >
                <CalendarDays className={`w-5 h-5 shrink-0 ${viewMode === 'calendar' ? 'scale-110' : ''} transition-transform`} />
                {isExpanded && <span>Takvim</span>}
            </Button>
            <Button 
                variant="ghost" 
                title="Akıllı Notlarım"
                className={`flex items-center transition-all duration-300 btn-3d rounded-xl ${isExpanded ? 'w-full justify-start h-12 gap-3 px-4 text-sm' : 'w-12 h-12 justify-center mx-auto'} ${viewMode === 'notes' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm inner-shadow-box' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}
                onClick={() => setViewMode('notes')}
            >
                <NotebookPen className={`w-5 h-5 shrink-0 ${viewMode === 'notes' ? 'rotate-12 transform scale-110' : ''} transition-transform`} />
                {isExpanded && <span>Akıllı Notlarım</span>}
            </Button>
          </nav>
        </div>
        
        {/* Firmalar / Projeler */}
        <div>
           {isExpanded && (
             <div className="flex items-center justify-between mb-3 px-2">
               <h4 className="text-[11px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2">
                 <span className="w-4 h-px bg-slate-300 dark:bg-slate-700"></span>
                 Firmalarım
               </h4>
             </div>
           )}
           
           <div className="grid gap-2 mb-4" suppressHydrationWarning>
             {mounted && projects.map(proj => (
                <div key={proj.id} title={proj.name} className={`w-full flex items-center justify-between rounded-xl transition-all duration-300 group btn-3d ${isExpanded ? 'px-2 py-1 text-left text-sm' : 'justify-center p-2'} ${selectedProjectId === proj.id ? 'bg-white/80 dark:bg-slate-800/80 shadow-md inner-shadow-box ring-1 ring-slate-200 dark:ring-white/10' : 'hover:bg-white/50 dark:hover:bg-slate-800/40 border-transparent'}`}>
                  <button 
                    onClick={() => {
                        setSelectedProjectId(proj.id)
                        if(!isExpanded) setIsExpanded(true)
                    }}
                    className={`flex items-center truncate ${isExpanded ? 'flex-1 gap-3 py-2 px-2' : 'justify-center w-full h-8'}`}
                  >
                     <div className="relative w-3 h-3 flex items-center justify-center flex-shrink-0">
                       <div className="w-2.5 h-2.5 rounded-full shadow-sm z-10" style={{ backgroundColor: proj.color }}></div>
                     </div>
                     {isExpanded && <span className={`truncate font-medium transition-colors ${selectedProjectId === proj.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{proj.name}</span>}
                  </button>
                  {isExpanded && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setProjectToEdit(proj)
                        setIsSettingsOpen(true)
                      }}
                      className={`p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all ${selectedProjectId === proj.id ? 'opacity-100 3d-button' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
             ))}
             {mounted && projects.length === 0 && isExpanded && (
               <div className="text-xs text-slate-400 px-4 py-3 bg-slate-100/50 dark:bg-slate-800/30 rounded-xl italic border border-dashed border-slate-300 dark:border-slate-700">
                 Henüz firma yok.
               </div>
             )}
           </div>
           
           <div className={`mt-4 ${isExpanded ? 'px-1' : 'flex justify-center'}`}>
             {isExpanded ? <ProjectForm /> : <Button variant="ghost" size="icon" onClick={() => setIsExpanded(true)} className="h-10 w-10 shrink-0"><span className="text-lg">+</span></Button>}
           </div>
        </div>
      </div>

      {/* Tema Değiştirme ve Alt Bölüm */}
      <div className={`p-4 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/30 dark:bg-black/20 ${!isExpanded ? 'flex justify-center' : ''}`}>
        {isExpanded ? (
          <div className="flex items-center justify-between bg-white/70 dark:bg-slate-900/60 p-1.5 rounded-full border border-slate-200/50 dark:border-white/5 shadow-inner">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme('light')}
              className={`flex-1 rounded-full h-8 flex items-center justify-center gap-2 transition-all ${mounted && theme === 'light' ? 'bg-white shadow-md text-amber-500 font-bold scale-100' : 'text-slate-400 hover:text-slate-600 scale-95 opacity-70'}`}
            >
              <Sun className="w-4 h-4 shrink-0" />
              <span className="text-xs">Açık</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme('dark')}
              className={`flex-1 rounded-full h-8 flex items-center justify-center gap-2 transition-all ${mounted && theme === 'dark' ? 'bg-slate-800 shadow-md text-indigo-400 font-bold scale-100 ring-1 ring-white/10' : 'text-slate-400 hover:text-slate-300 scale-95 opacity-70'}`}
            >
              <Moon className="w-4 h-4 shrink-0" />
              <span className="text-xs">Koyu</span>
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full w-10 h-10 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </Button>
        )}
      </div>

      <ProjectSettingsModal 
        project={projectToEdit} 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  )
}
