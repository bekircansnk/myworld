"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { Sparkles, Loader2, ArrowRight } from "lucide-react"

export function AIAssistantWidget() {
  const { fetchTasks } = useTaskStore()
  
  const [aiPrompt, setAiPrompt] = React.useState("")
  const [isAiProcessing, setIsAiProcessing] = React.useState(false)

  const handleAiAction = async () => {
     if(!aiPrompt.trim()) return;
     setIsAiProcessing(true)
     try {
        const { api } = await import('@/lib/api')
        await api.post('/api/chat', { message: aiPrompt })
        await fetchTasks()
        setAiPrompt("")
     } catch(e) { console.error(e) } finally { setIsAiProcessing(false) }
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] p-6 h-full flex flex-col justify-between 
                    bg-gradient-to-br from-[#E8F0FE] to-[#F1EAFF] 
                    dark:from-[#1A1F35] dark:to-[#221B35] shadow-soft group border border-white/50 dark:border-white/5">
      
      {/* Dekoratif Baloncuklar */}
      <div className="absolute top-0 right-0 p-5 opacity-40">
         <div className="flex gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-slate-500/50"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-slate-500/50"></div>
         </div>
      </div>
      
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/40 dark:bg-white/5 rounded-full blur-[40px] group-hover:bg-white/60 transition-colors duration-700"></div>

      <div className="relative z-10 mb-8 mt-2">
        <div className="w-12 h-12 rounded-[1.25rem] bg-white/80 dark:bg-black/20 flex items-center justify-center mb-4 shadow-sm backdrop-blur-sm">
          <Sparkles className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-ti mb-2">
          AI Asistan
        </h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[85%]">
          Günün planını çıkaralım mı? Ya da görevleri optimize edelim?
        </p>
      </div>

      <div className="relative z-10 mt-auto">
        <div className="bg-white/70 dark:bg-black/30 backdrop-blur-xl rounded-2xl p-2 flex items-center gap-2 shadow-sm border border-white/60 dark:border-white/10">
          <input 
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAiAction()}
            placeholder="AI'dan bir şey iste..."
            className="flex-1 bg-transparent border-none px-3 py-2 text-[13px] font-medium focus:outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
          />
          <button 
            onClick={handleAiAction}
            disabled={isAiProcessing || !aiPrompt.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-[0.85rem] bg-indigo-500 text-white disabled:opacity-50 hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-500/20 active:scale-95"
          >
             {isAiProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
