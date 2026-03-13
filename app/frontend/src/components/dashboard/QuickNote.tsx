"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, Send, X, CheckCircle2, Lightbulb, ListChecks, Zap } from "lucide-react"
import { api } from "@/lib/api"

interface EnhanceResult {
  enhanced_content: string
  tasks_found: string[]
  ideas: string[]
}

export function QuickNote() {
  const [note, setNote] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [result, setResult] = React.useState<EnhanceResult | null>(null)
  const [saved, setSaved] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSendToAI = async () => {
    if (!note.trim()) return
    
    setIsProcessing(true)
    setResult(null)
    
    try {
      // 1. Notu kaydet
      await api.post('/api/notes', { content: note, source: 'quick_note' })
      
      // 2. AI ile zenginleştir
      const res = await api.post('/api/notes/enhance', { content: note })
      const data: EnhanceResult = res.data

      setResult(data)
      
      // 3. Zenginleştirilmiş notu da kaydet
      if (data.enhanced_content && data.enhanced_content !== note) {
        await api.post('/api/notes', {
          content: `✨ AI Zenginleştirme:\n${data.enhanced_content}`,
          source: 'ai_enhanced'
        })
      }
      
      // 4. Görevler bulunduysa taskStore'a ekle
      if (data.tasks_found && data.tasks_found.length > 0) {
        for (const taskTitle of data.tasks_found) {
          if (taskTitle.trim()) {
            try {
              await api.post('/api/tasks/', {
                title: taskTitle,
                priority: 'medium',
                status: 'todo'
              })
            } catch (e) {
              console.warn('Task oluşturma hatası:', e)
            }
          }
        }
        // Task listesini yenile
        try {
          const { useTaskStore } = await import('@/stores/taskStore')
          useTaskStore.getState().fetchTasks()
        } catch (e) { /* silent */ }
      }
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      console.error("Not zenginleştirme hatası:", e)
      // Hata olsa bile düz notu kaydetmeyi dene
      try {
        await api.post('/api/notes', { content: note, source: 'quick_note' })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch (e2) {
        console.error("Not kaydetme hatası:", e2)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const clearResult = () => {
    setResult(null)
    setNote("")
  }

  return (
    <div className="glass-panel flex flex-col rounded-2xl h-full relative overflow-hidden transition-all duration-500 min-h-[90px]">
      
      {/* Şık Başlık */}
      <div className="p-4 pb-2 relative z-10 border-b border-border/30 flex items-center justify-between bg-gradient-to-r from-amber-500/5 to-transparent">
        <h3 className="text-xs font-extrabold flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <div className="p-1 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
             <Zap className="w-3.5 h-3.5 fill-white" />
          </div>
          Hızlı Not & AI
        </h3>
        {saved && (
          <span className="text-[9px] text-green-600 dark:text-green-400 font-bold flex items-center gap-1 bg-green-100 dark:bg-green-500/10 px-2 py-0.5 rounded-full animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-3 h-3" /> Kaydedildi
          </span>
        )}
      </div>

      <div className="p-4 pt-3 flex-1 flex flex-col justify-center gap-3 relative z-10">
        {/* Not giriş alanı */}
        {!result ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full h-full">
            <div className="relative flex-1 min-h-[50px]">
               <Textarea
                 ref={textareaRef}
                 value={note}
                 onChange={(e) => setNote(e.target.value)}
                 placeholder="Aklına gelen fikri veya görevi yaz... AI senin için detaylandırsın ✨"
                 className="absolute inset-0 resize-none border-0 shadow-inner rounded-xl text-sm bg-slate-50/50 dark:bg-black/20 focus-visible:ring-2 focus-visible:ring-amber-500/30 p-3 transition-all min-h-[50px] leading-tight"
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                     handleSendToAI()
                   }
                 }}
               />
            </div>
            
            <div className="flex shrink-0">
              <Button
                onClick={handleSendToAI}
                size="sm"
                className="h-full rounded-xl text-xs gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold btn-3d shadow-amber-500/20 shadow-sm px-4"
                disabled={!note.trim() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Büyü Yapılıyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Yapay Zekaya Gönder
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* AI Sonuç Görünümü */
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 snap-y custom-scrollbar">
            {/* Zenginleştirilmiş not */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/10 border border-amber-200/50 dark:border-amber-800/30 p-4 shadow-sm snap-start">
              <h4 className="text-[11px] font-black tracking-widest text-amber-600 dark:text-amber-400 mb-2 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Gelişmiş Not
              </h4>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{result.enhanced_content}</p>
            </div>

            {/* Bulunan görevler */}
            {result.tasks_found.length > 0 && (
              <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50/50 dark:from-indigo-950/30 dark:to-blue-950/10 border border-indigo-200/50 dark:border-indigo-800/30 p-4 shadow-sm snap-start">
                <h4 className="text-[11px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 mb-2 uppercase flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5" /> Listeye Eklendi
                </h4>
                <div className="space-y-1.5">
                   {result.tasks_found.map((t, i) => (
                     <div key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2 py-1 px-2 rounded-lg bg-white/50 dark:bg-black/20">
                       <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" /> 
                       <span>{t}</span>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* Fikirler */}
            {result.ideas.length > 0 && (
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50/50 dark:from-purple-950/30 dark:to-fuchsia-950/10 border border-purple-200/50 dark:border-purple-800/30 p-4 shadow-sm snap-start">
                <h4 className="text-[11px] font-black tracking-widest text-purple-600 dark:text-purple-400 mb-2 uppercase flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Yeni Fikirler
                </h4>
                <div className="space-y-1.5">
                   {result.ideas.map((idea, i) => (
                     <div key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2 py-1 px-2 rounded-lg bg-white/50 dark:bg-black/20">
                        <span className="text-purple-500 shrink-0 mt-0.5">💡</span>
                        <span>{idea}</span>
                     </div>
                   ))}
                </div>
              </div>
            )}

            <Button
              onClick={clearResult}
              size="lg"
              variant="outline"
              className="w-full text-sm font-bold rounded-xl mt-4 border-slate-200 dark:border-slate-700 btn-3d snap-end"
            >
              Yenisini Yaz
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
