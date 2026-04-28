"use client"

import * as React from "react"
import { useNoteStore } from "@/stores/noteStore"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import {
  X, Sparkles, Loader2, Bot, Calendar, Pencil, Save, Clock, AlignLeft, Briefcase, CalendarClock
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { TTSPlayer } from "@/components/tts-module"

export function NoteDetailPanel() {
  const {
    selectedNote, isDetailPanelOpen, closeNoteDetail, setSelectedNote
  } = useNoteStore()

  const [isEditingContent, setIsEditingContent] = React.useState(false)
  const [contentDraft, setContentDraft] = React.useState("")
  const [titleDraft, setTitleDraft] = React.useState("")
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [isEnhancing, setIsEnhancing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const hasFetchedAI = React.useRef(false)
  const [linkedTask, setLinkedTask] = React.useState<any>(null)
  const [linkedEvents, setLinkedEvents] = React.useState<any[]>([])

  React.useEffect(() => {
    if (selectedNote && isDetailPanelOpen) {
      // Find linked task
      if (selectedNote.task_id) {
        import('@/stores/taskStore').then(({ useTaskStore }) => {
          const task = useTaskStore.getState().tasks.find((t: any) => t.id === selectedNote.task_id)
          setLinkedTask(task || null)
        }).catch(() => {})
      } else {
        setLinkedTask(null)
      }
      // Find calendar events linked to this note
      import('@/stores/calendarStore').then(({ useCalendarStore }) => {
        const events = useCalendarStore.getState().events
        const noteEvents = events.filter((e: any) => e.noteId === selectedNote.id)
        setLinkedEvents(noteEvents)
      }).catch(() => {})
    }
    return () => { setLinkedTask(null); setLinkedEvents([]) }
  }, [selectedNote?.id, isDetailPanelOpen])

  React.useEffect(() => {
    if (selectedNote && isDetailPanelOpen) {
      if (!selectedNote.ai_analysis && !hasFetchedAI.current) {
        hasFetchedAI.current = true
        fetchAIAnalysis()
      }
      setContentDraft(selectedNote.content || "")
      setTitleDraft(selectedNote.title || "")
    }
    return () => {
      setIsEditingContent(false)
      hasFetchedAI.current = false
    }
  }, [selectedNote?.id, isDetailPanelOpen])

  // ESC key to close panel
  React.useEffect(() => {
    if (!isDetailPanelOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditingContent) return // Don't close while editing
        closeNoteDetail()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDetailPanelOpen, isEditingContent, closeNoteDetail])

  if (!selectedNote || !isDetailPanelOpen) return null

  async function fetchAIAnalysis() {
    if (!selectedNote) return
    setIsAnalyzing(true)
    try {
      const res = await api.post(`/api/notes/${selectedNote.id}/ai-analysis`)
      setSelectedNote(res.data)
    } catch (e) {
      console.error("AI analiz yüklenemedi:", e)
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleEnhanceNote() {
    if (!selectedNote) return
    setIsEnhancing(true)
    try {
      const res = await api.post('/api/notes/enhance', { content: contentDraft || selectedNote.content })
      if (res.data && res.data.enhanced_content) {
         setContentDraft(res.data.enhanced_content)
         setIsEditingContent(true) 
      }
    } catch (e) {
      console.error("Not geliştirilemedi:", e)
    } finally {
      setIsEnhancing(false)
    }
  }

  async function handleSaveNote() {
    if (!selectedNote) return
    setIsSaving(true)
    try {
      const res = await api.put(`/api/notes/${selectedNote.id}`, {
        content: contentDraft,
        title: titleDraft
      })
      setSelectedNote(res.data)
      setIsEditingContent(false)
    } catch (e) {
      console.error("Not güncellenemedi:", e)
    } finally {
      setIsSaving(false)
    }
  }

  const elapsedTime = selectedNote.created_at 
    ? formatDistanceToNow(new Date(selectedNote.created_at), { locale: tr, addSuffix: true })
    : ""

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
        onClick={closeNoteDetail}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 lg:p-8 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-full md:max-w-[1100px] max-h-full md:max-h-[90vh] rounded-none md:rounded-[2rem] overflow-hidden animate-in zoom-in-95 fade-in duration-300 border-0 md:border border-slate-200/60 dark:border-white/10 shadow-2xl shadow-emerald-500/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-opacity-80 flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="relative px-4 md:px-8 pt-4 md:pt-6 pb-3 md:pb-5 border-b border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 shrink-0">
             <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
             
             <div className="flex items-start justify-between gap-4">
               <div className="flex-1 min-w-0">
                 {selectedNote.ai_category ? (
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white shadow-sm bg-emerald-500 mb-3">
                      {selectedNote.ai_category}
                    </span>
                 ) : (
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white shadow-sm bg-slate-400 mb-3">
                      Not
                    </span>
                 )}

                 {isEditingContent ? (
                    <Input 
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      placeholder="Not Başlığı (İsteğe Bağlı)"
                      className="text-2xl font-black bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 h-12 mb-2 w-full max-w-md"
                    />
                  ) : (
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white/95 leading-tight mb-2">
                      {selectedNote.title || "İsimsiz Not"}
                    </h2>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-white/40">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Oluşturulma: {selectedNote.created_at ? format(new Date(selectedNote.created_at), "dd MMM yyyy HH:mm", { locale: tr }) : "—"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {elapsedTime}
                    </span>
                  </div>
                  {/* Cross-reference badges */}
                  {(linkedTask || linkedEvents.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {linkedTask && (
                        <button
                          onClick={async () => {
                            const { useTaskStore } = await import('@/stores/taskStore')
                            useTaskStore.getState().openTaskDetail(linkedTask)
                            closeNoteDetail()
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-700/50 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all"
                        >
                          <Briefcase className="w-3 h-3" />
                          {linkedTask.title}
                        </button>
                      )}
                      {linkedEvents.map((ev: any) => (
                        <span
                          key={ev.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-200 dark:border-blue-700/50"
                        >
                          <CalendarClock className="w-3 h-3" />
                          {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
               </div>

                <div className="flex items-start gap-2">
                  {!isEditingContent && (
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsEditingContent(true)}
                      className="mt-1 h-9 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10"
                    >
                      <Pencil className="w-4 h-4 mr-2" /> Düzenle
                    </Button>
                  )}
                  <button
                    onClick={closeNoteDetail}
                    className="mt-1 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/40 dark:hover:text-white transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
             </div>
          </div>

          <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-full max-h-[85vh]">
            
            <div className="flex-1 border-r border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-transparent flex flex-col overflow-hidden max-h-[100%]">
               <div className="p-4 px-6 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/5">
                 <h3 className="text-sm font-bold text-slate-700 dark:text-white/80 flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    İçerik
                 </h3>
                 <Button
                    onClick={handleEnhanceNote}
                    disabled={isEnhancing}
                    size="sm"
                    className="h-8 text-xs font-bold rounded-xl btn-3d bg-indigo-500 hover:bg-indigo-600 text-white px-4"
                  >
                    {isEnhancing ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-2" />}
                    Yapay Zeka ile Düzenle
                 </Button>
               </div>

               <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative">
                 {isEditingContent ? (
                  <div className="flex flex-col h-full min-h-[300px]">
                    <Textarea
                      value={contentDraft}
                      onChange={(e) => setContentDraft(e.target.value)}
                      className="flex-1 min-h-[300px] text-[14px] leading-relaxed bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 focus-visible:ring-emerald-500/50 rounded-2xl shadow-inner p-5 resize-none"
                    />
                  </div>
                 ) : (
                  <div className="flex flex-col gap-6">
                    <div 
                      className="prose prose-slate dark:prose-invert max-w-none text-[14px] leading-relaxed text-slate-700 dark:text-white/80 whitespace-pre-wrap rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6 shadow-sm min-h-[300px] hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-text"
                      onClick={() => setIsEditingContent(true)}
                    >
                      {selectedNote.content}
                    </div>
                  </div>
                 )}
               </div>
               {/* Ses çalar — her zaman sabit (sticky) alt bölgede görünür */}
               {!isEditingContent && (
                 <div className="shrink-0 border-t border-slate-200/50 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6 py-3" onClick={(e) => e.stopPropagation()}>
                   <TTSPlayer 
                     text={selectedNote.content || ""} 
                     noteId={selectedNote.id}
                     savedAudioUrl={selectedNote.tts_audio_url}
                     savedAudioText={selectedNote.tts_text}
                     currentText={selectedNote.content || ""}
                   />
                 </div>
               )}
               {isEditingContent && (
                 <div className="p-4 px-6 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-end gap-2 shrink-0 z-10">
                    <Button variant="ghost" onClick={() => { setIsEditingContent(false); setContentDraft(selectedNote.content || "") }} disabled={isSaving} className="rounded-xl">İptal</Button>
                    <Button onClick={handleSaveNote} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2 font-bold px-6 btn-3d">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Kaydet
                    </Button>
                 </div>
               )}
            </div>

            <div className="w-full md:w-[400px] shrink-0 bg-slate-50/30 dark:bg-black/20 flex flex-col overflow-hidden max-h-[100%]">
               <div className="p-4 px-6 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between shrink-0">
                 <h3 className="text-sm font-bold text-slate-700 dark:text-white/80 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    Not Analizi
                 </h3>
                 <button
                    onClick={fetchAIAnalysis}
                    disabled={isAnalyzing}
                    className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 dark:text-emerald-400/70 dark:hover:text-emerald-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Yenile
                  </button>
               </div>

               <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                 <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-100 dark:border-emerald-500/20 p-5 shadow-sm relative overflow-hidden mb-6">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 blur-3xl rounded-full" />
                    
                    {isAnalyzing ? (
                      <div className="flex items-center gap-3 text-sm font-medium text-emerald-600/70 dark:text-emerald-300/60">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                        Not inceleniyor...
                      </div>
                    ) : selectedNote.ai_analysis ? (
                      <p className="text-[13px] font-medium text-slate-700 dark:text-white/80 leading-relaxed whitespace-pre-wrap relative z-10">{selectedNote.ai_analysis}</p>
                    ) : (
                      <p className="text-[13px] font-medium text-slate-400 dark:text-white/30 italic relative z-10">AI analizi bulunmuyor. Oluşturmak için Yenile'ye tıklayın.</p>
                    )}
                 </div>

                 {selectedNote.ai_tags && selectedNote.ai_tags.length > 0 && (
                   <div className="mb-6">
                     <h4 className="text-xs font-bold text-slate-500 dark:text-white/50 mb-3">Etiketler</h4>
                     <div className="flex flex-wrap gap-2">
                       {selectedNote.ai_tags.map(tag => (
                         <span key={tag} className="px-2.5 py-1 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 text-[11px] font-bold shadow-sm">
                           #{tag}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}

                 {selectedNote.ai_analysis_history && selectedNote.ai_analysis_history.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-white/50 border-b border-slate-200 dark:border-white/10 pb-2">Geçmiş İncelemeler</h4>
                    {selectedNote.ai_analysis_history.map((hist: any, index: number) => (
                      <div key={index} className="rounded-xl bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/10 p-3 shadow-sm">
                        <p className="text-[10px] text-slate-400 dark:text-white/40 mb-1.5 font-bold uppercase tracking-wide">
                          {format(new Date(hist.created_at), "dd MMM yyyy HH:mm", { locale: tr })}
                        </p>
                        <p className="text-xs font-medium text-slate-600 dark:text-white/60 line-clamp-3 hover:line-clamp-none transition-all">{hist.text}</p>
                      </div>
                    ))}
                  </div>
                 )}
               </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
