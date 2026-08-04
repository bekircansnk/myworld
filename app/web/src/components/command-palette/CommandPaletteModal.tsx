"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Search, Command, CheckSquare, Calendar, NotebookPen, Sparkles, Moon, Sun, X, ArrowRight } from "lucide-react"
import { useProjectStore } from "@/stores/projectStore"
import { useTaskStore } from "@/stores/taskStore"
import { useTheme } from "next-themes"

export function CommandPaletteModal() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const { setViewMode, projects, selectedProjectId, setSelectedProjectId } = useProjectStore()
  const { tasks } = useTaskStore()
  const { theme, setTheme } = useTheme()

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setIsOpen(prev => !prev)
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  if (!isOpen) return null

  const filteredTasks = tasks
    .filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)

  const filteredProjects = projects
    .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3)

  const handleSelectView = (view: any) => {
    setViewMode(view)
    setIsOpen(false)
    setQuery("")
  }

  const handleSelectProject = (projectId: number) => {
    setSelectedProjectId(projectId)
    setIsOpen(false)
    setQuery("")
  }

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Search Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input 
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Arama yap veya bir komut çalıştır... (Cmd+K)"
            className="flex-1 bg-transparent border-none text-sm font-medium focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-4 text-xs">
          
          {/* Hızlı Rota Komutları */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Hızlı Geçişler
            </div>
            <div className="space-y-1 mt-1">
              <button 
                onClick={() => handleSelectView('dashboard')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted text-foreground transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Command className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold">Kontrol Paneli (Dashboard)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button 
                onClick={() => handleSelectView('all_tasks')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted text-foreground transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold">Görevler Panosu</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button 
                onClick={() => handleSelectView('calendar')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted text-foreground transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-sky-500" />
                  <span className="font-semibold">Takvim Etkinlikleri</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button 
                onClick={() => handleSelectView('notes')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted text-foreground transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <NotebookPen className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold">Notlar ve Fikirler</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button 
                onClick={() => handleSelectView('ai_chat')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted text-foreground transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="font-semibold">AI Sohbet & Asistan</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Filtrelenen Görevler */}
          {query.trim() && filteredTasks.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Görevler ({filteredTasks.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredTasks.map(task => (
                  <button 
                    key={task.id}
                    onClick={() => {
                      handleSelectView('all_tasks')
                      import('@/stores/taskStore').then(({ useTaskStore }) => {
                        useTaskStore.getState().openTaskDetail(task)
                      })
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted text-foreground transition-colors"
                  >
                    <span className="font-medium truncate">{task.title}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {task.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtrelenen Firmalar */}
          {query.trim() && filteredProjects.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Firmalar
              </div>
              <div className="space-y-1 mt-1">
                {filteredProjects.map(proj => (
                  <button 
                    key={proj.id}
                    onClick={() => handleSelectProject(proj.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted text-foreground transition-colors"
                  >
                    <span className="font-medium">{proj.name}</span>
                    <span className="text-[10px] text-muted-foreground">Firma Seç</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sistem Ayarları Komutları */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Ayarlar
            </div>
            <button 
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark')
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted text-foreground transition-colors mt-1"
            >
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                <span className="font-semibold">Temayı Değiştir ({theme === 'dark' ? 'Açık Mod' : 'Koyu Mod'})</span>
              </div>
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Aramak istediğin kelimeyi yaz</span>
          <kbd className="px-2 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">ESC Kapat</kbd>
        </div>
      </div>
    </div>
  )

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null
}
