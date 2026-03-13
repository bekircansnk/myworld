"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Bell, Search, Sun, Moon } from "lucide-react"

export function DashboardHeader() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  let greeting = "Merhaba"
  if (mounted) {
    const hour = new Date().getHours()
    greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi öğlenler" : "İyi akşamlar"
  }

  return (
    <div className="flex flex-col gap-6 mb-2">
      {/* Top Navigation Row (Adapted) */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-lightGray/50 dark:border-white/5 pb-4">
        <nav className="flex items-center space-x-1 md:space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          <button className="bg-brand-dark dark:bg-white text-white dark:text-brand-dark px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap">Dashboard</button>
          <button className="text-brand-gray dark:text-gray-400 hover:text-brand-dark dark:hover:text-white px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors" onClick={() => window.location.hash = 'tasks'}>Görevler</button>
          <button className="text-brand-gray dark:text-gray-400 hover:text-brand-dark dark:hover:text-white px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors" onClick={() => window.location.hash = 'calendar'}>Ajanda</button>
          <button className="text-brand-gray dark:text-gray-400 hover:text-brand-dark dark:hover:text-white px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors">Notlar</button>
          <button className="text-brand-gray dark:text-gray-400 hover:text-brand-dark dark:hover:text-white px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors">Raporlar</button>
        </nav>
        <div className="flex items-center space-x-3">
          <div className="relative w-full lg:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray dark:text-gray-400" />
            <input 
              type="text" 
              placeholder="Görev, proje veya not ara..." 
              className="w-full h-10 pl-10 pr-4 rounded-full bg-white dark:bg-[#1a1e2e] border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 shadow-ultra-soft text-sm transition-all"
            />
          </div>
          <button className="w-10 h-10 bg-white dark:bg-[#1a1e2e] rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors relative">
            <Bell className="w-4 h-4 text-brand-gray dark:text-gray-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-yellow rounded-full"></span>
          </button>
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 bg-white dark:bg-[#1a1e2e] rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            {mounted && theme === "dark" ? <Sun className="w-4 h-4 text-brand-yellow" /> : <Moon className="w-4 h-4 text-brand-dark" />}
          </button>
        </div>
      </header>

      {/* Header Stats Row */}
      <div className="col-span-12 flex flex-col lg:flex-row justify-between items-start lg:items-end mb-2 gap-6">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-4xl md:text-5xl font-semibold mb-6 text-brand-dark dark:text-white">{greeting}, Bekir</h1>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <p className="text-sm text-brand-gray dark:text-gray-400 mb-1">Verimlilik</p>
              <div className="bg-brand-dark dark:bg-white text-white dark:text-brand-dark px-4 py-1.5 rounded-full text-xs font-medium">+15%</div>
            </div>
            <div>
              <p className="text-sm text-brand-gray dark:text-gray-400 mb-1">Tamamlanan</p>
              <div className="bg-brand-yellow text-brand-dark px-4 py-1.5 rounded-full text-xs font-medium">85%</div>
            </div>
            <div className="flex-grow min-w-[200px]">
              <div className="flex justify-between text-sm text-brand-gray dark:text-gray-400 mb-1">
                <span>Odak Süresi</span>
                <span>Proje Süresi</span>
              </div>
              <div className="h-6 w-full bg-white/50 dark:bg-black/20 rounded-full flex overflow-hidden border border-white dark:border-white/5">
                <div className="bg-brand-yellow h-full flex items-center px-3 text-xs font-medium text-brand-dark" style={{width: "60%"}}>60%</div>
                <div className="h-full flex-grow opacity-20" style={{backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(0,0,0,0.5) 5px, rgba(0,0,0,0.5) 10px)"}}></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-brand-gray dark:text-gray-400 mb-1">Çıktı</p>
              <div className="bg-transparent border border-brand-gray/30 dark:border-white/20 text-brand-dark dark:text-white px-4 py-1.5 rounded-full text-xs font-medium">+10%</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-8">
          <div className="flex items-end space-x-3">
             <div>
                <div className="text-4xl md:text-5xl font-light leading-none text-brand-dark dark:text-white">78</div>
                <div className="text-sm text-brand-gray dark:text-gray-400 mt-1">Görev</div>
             </div>
          </div>
          <div className="flex items-end space-x-3">
             <div>
                <div className="text-4xl md:text-5xl font-light leading-none text-brand-dark dark:text-white">56</div>
                <div className="text-sm text-brand-gray dark:text-gray-400 mt-1">Notlar</div>
             </div>
          </div>
          <div className="flex items-end space-x-3">
             <div>
                <div className="text-4xl md:text-5xl font-light leading-none text-brand-dark dark:text-white">12</div>
                <div className="text-sm text-brand-gray dark:text-gray-400 mt-1">Projeler</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
