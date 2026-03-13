"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Save, Loader2, Search, Plus, MoreVertical, Copy, Code, Sparkles, Tag, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { api } from "@/lib/api"
import { useNoteStore } from "@/stores/noteStore"
import { NoteDetailPanel } from "./NoteDetailPanel"
import { Note } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CATEGORIES = ["Tüm Notlar", "Genel Notlar", "Yaratıcı Fikirler", "Yazılım"]

export function NotesList() {
  const { openNoteDetail, notes, fetchNotes, addNoteAction, addExplicitNoteAction, deleteNoteAction, updateNoteInList } = useNoteStore()
  const [isLoading, setIsLoading] = React.useState(true)
  const [newNoteContent, setNewNoteContent] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)

  const [activeTab, setActiveTab] = React.useState("Tüm Notlar")
  const [searchQuery, setSearchQuery] = React.useState("")
  
  // Custom Add State
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [addTitle, setAddTitle] = React.useState("")
  const [addContent, setAddContent] = React.useState("")
  const [addCategory, setAddCategory] = React.useState("Genel Notlar")
  
  // Context Menu State
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; note: Note } | null>(null)
  const [copiedId, setCopiedId] = React.useState<number | null>(null)

  const loadNotes = async () => {
    try {
      setIsLoading(true)
      await fetchNotes()
    } catch (error) {
      console.error("Notlar getirilemedi:", error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadNotes()
  }, [])

  // Close context menu on outside click
  React.useEffect(() => {
    const handleOutsideClick = () => setContextMenu(null)
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [])

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return
    setIsSaving(true)
    try {
      await addNoteAction(newNoteContent, 'notes_page')
      setNewNoteContent("")
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  const openAddModal = () => {
    setAddCategory(activeTab === "Tüm Notlar" ? "Genel Notlar" : activeTab)
    setAddTitle("")
    setAddContent("")
    setIsAddModalOpen(true)
  }

  const handleAddExplicit = async () => {
    if (!addContent.trim()) return
    setIsSaving(true)
    try {
      await addExplicitNoteAction({
        title: addTitle.trim() || undefined,
        content: addContent,
        ai_category: addCategory,
        source: 'notes_page_modal'
      })
      setIsAddModalOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    try {
      if (contextMenu) setContextMenu(null)
      await deleteNoteAction(id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleRightClick = (e: React.MouseEvent, note: Note) => {
    e.preventDefault()
    e.stopPropagation() // Ensure openNoteDetail doesn't trigger
    setContextMenu({ x: e.clientX, y: e.clientY, note })
  }

  const handleChangeCategory = async (e: React.MouseEvent, category: string) => {
    e.stopPropagation()
    if (!contextMenu) return
    const { note } = contextMenu
    try {
      const res = await api.put(`/api/notes/${note.id}`, { ai_category: category })
      updateNoteInList(res.data)
      setContextMenu(null)
    } catch (err) {
      console.error("Kategori güncellenemedi", err)
    }
  }

  const handleCopy = (e: React.MouseEvent, content: string, id: number) => {
    e.stopPropagation()
    // Ayni zamanda markdown icerdiginde temiz kopyala
    const cleanContent = content.replace(/```[a-z]*\n?/g, '').replace(/```/g, '')
    navigator.clipboard.writeText(cleanContent)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filter Logic
  const filteredNotes = notes.filter(n => {
    const matchesSearch = (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (n.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    
    if (activeTab === "Tüm Notlar") return true
    
    const cat = n.ai_category || ""
    if (activeTab === "Yaratıcı Fikirler") return cat.toLowerCase().includes("yaratıcı") || cat.toLowerCase().includes("fikir")
    if (activeTab === "Genel Notlar") return cat.toLowerCase().includes("genel") || !cat
    if (activeTab === "Yazılım") return cat.toLowerCase().includes("yazılım") || cat.toLowerCase().includes("kod")
    return true
  })

  // Utility to determine card theme based on category
  const getCardTheme = (ai_category?: string) => {
    const cat = (ai_category || "").toLowerCase()
    if (cat.includes("yazılım") || cat.includes("kod")) {
      return { 
        bg: 'bg-[#E6E6FA]/40 dark:bg-slate-800/40',
        badge: 'bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200',
        border: 'border-transparent hover:border-[#E6E6FA] dark:hover:border-indigo-500/30'
      }
    }
    if (cat.includes("yaratıcı") || cat.includes("fikir")) {
      return { 
        bg: 'bg-white dark:bg-slate-800 relative z-0 border-[#E0F2F1] dark:border-emerald-500/30 border-2',
        badge: 'bg-[#E0F2F1] text-emerald-900 border-none',
        glow: 'bg-[#E0F2F1]/50' // MINT
      }
    }
    if (cat.includes("kitap") || cat.includes("alıntı")) {
      return {
        bg: 'bg-[#E0F2F1]/40 dark:bg-slate-800/40',
        badge: 'bg-white/50 dark:bg-slate-900/50 text-emerald-800 dark:text-emerald-200',
        border: 'border-transparent hover:border-[#E0F2F1] dark:hover:border-emerald-500/30'
      }
    }
    // Default Soft Blue for General Notes
    return {
      bg: 'bg-[#E3F2FD]/40 dark:bg-slate-800/40',
      badge: 'bg-white/50 dark:bg-slate-900/50 text-blue-800 dark:text-blue-200',
      border: 'border-transparent hover:border-[#E3F2FD] dark:hover:border-blue-500/30'
    }
  }

  // Heuristic to detect code content
  const isCodeNote = (content: string) => {
    const hasCodeBlock = content.includes('```');
    const lines = content.split('\n');
    const codeKeywords = ['const ', 'let ', 'var ', 'function ', 'import ', 'export ', 'class ', 'def ', 'return ', 'console.log', 'import {', '<div>', '<App'];
    let codeLineCount = 0;
    lines.forEach(line => {
        if (codeKeywords.some(kw => line.includes(kw)) || line.trim().startsWith('//') || line.includes(';')) {
           codeLineCount++;
        }
    });
    return hasCodeBlock || (lines.length > 1 && codeLineCount / lines.length > 0.4);
  }

  return (
    <div className="flex flex-col h-full bg-[#FDFBF4] dark:bg-[#15181d] rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* Top Header & Tabs */}
      <header className="h-[88px] flex items-center justify-between px-6 md:px-10 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md shrink-0">
        <nav className="flex gap-4 md:gap-8 overflow-x-auto hide-scrollbar mr-4">
          {CATEGORIES.map(cat => (
             <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`relative py-4 text-sm whitespace-nowrap transition-colors font-bold ${
                  activeTab === cat 
                    ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
             >
                {cat}
             </button>
          ))}
        </nav>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative hidden md:block">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm w-48 lg:w-64 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 outline-none" 
               placeholder="Notlarda ara..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
          <div className="flex items-center gap-2 shrink-0">
             <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1">
               <input 
                 value={newNoteContent}
                 onChange={e => setNewNoteContent(e.target.value)}
                 placeholder="Hızlı Not Ekle..."
                 className="bg-transparent border-none text-sm px-3 focus:outline-none w-32 md:w-48 text-slate-800 dark:text-slate-200"
                 onKeyDown={e => e.key === 'Enter' && handleCreateNote()}
               />
               <Button 
                  onClick={handleCreateNote} 
                  disabled={isSaving || !newNoteContent.trim()} 
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-200 dark:hover:bg-white text-white dark:text-slate-900 rounded-[14px] px-3 h-8 text-xs font-semibold"
               >
                  {isSaving && newNoteContent.trim() ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               </Button>
             </div>
             
             <Button
                onClick={openAddModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-10 px-4 flex items-center gap-2 shadow-sm whitespace-nowrap"
             >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Yeni Not</span>
             </Button>
          </div>
        </div>
      </header>

      {/* Grid Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        {isLoading ? (
           <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
        ) : filteredNotes.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
             <Code className="w-12 h-12 mb-4 opacity-20" />
             <p className="font-semibold text-lg">Bu kategoride not bulunamadı.</p>
             <p className="text-sm">Yukarıdaki alandan yeni bir not oluşturabilirsiniz.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredNotes.map(note => {
               const theme = getCardTheme(note.ai_category)
               const isCode = isCodeNote(note.content || '')
               
               return (
                  <div
                     key={note.id}
                     className={`rounded-3xl p-6 flex flex-col gap-4 group cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg ${theme.bg} ${theme.border || ''}`}
                     onClick={() => openNoteDetail(note)}
                     onContextMenu={(e) => handleRightClick(e, note)}
                  >
                     {theme.glow && <div className={`absolute -top-4 -right-4 w-24 h-24 ${theme.glow} rounded-full blur-2xl z-[-1] pointer-events-none transition-transform group-hover:scale-150`}></div>}
                     
                     <div className="flex justify-between items-start relative z-10">
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm max-w-[150px] truncate ${theme.badge}`}>
                           {note.ai_category || 'Genel Not'}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                              onClick={(e) => handleDelete(e, note.id)}
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                           <button 
                              className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                              onClick={(e) => handleRightClick(e, note)}
                           >
                              <MoreVertical className="w-4 h-4" />
                           </button>
                        </div>
                     </div>

                     <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white leading-tight">
                           {note.title || (isCode ? 'Kod Parçacığı' : 'Hızlı Not')}
                        </h3>
                        {!isCode && (
                           <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                              {note.content}
                           </p>
                        )}
                     </div>

                     {isCode && (
                        <div className="bg-slate-900 rounded-2xl p-4 relative overflow-hidden group/code mt-2 border border-slate-700/50 shadow-inner">
                           <code className="text-xs text-[#E6E6FA] font-mono block whitespace-pre-wrap max-h-[120px] overflow-hidden mask-bottom pointer-events-none">
                              {note.content.replace(/```[a-z]*\n?/g, '').replace(/```/g, '')}
                           </code>
                           <button 
                             onClick={(e) => handleCopy(e, note.content, note.id)}
                             className="absolute right-2 top-2 p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
                             title="Kopyala"
                           >
                              {copiedId === note.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                           </button>
                        </div>
                     )}

                     {!isCode && theme.glow && (
                        // Decorative abstract visualization for creative notes
                        <div className="h-20 w-full rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 opacity-80 mt-2 border border-emerald-200/50 dark:border-emerald-800/50 flex flex-col justify-end p-3">
                           <div className="flex gap-1.5 items-end">
                              <div className="w-1.5 h-6 bg-emerald-400/60 rounded-full animate-pulse"></div>
                              <div className="w-1.5 h-10 bg-emerald-500/60 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
                              <div className="w-1.5 h-4 bg-emerald-300/60 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                           </div>
                        </div>
                     )}

                     <div className="mt-auto pt-4 flex justify-between items-center relative z-10 border-t border-black/5 dark:border-white/5">
                        <span className="text-[11px] font-medium text-slate-500">
                           {note.created_at ? format(new Date(note.created_at), 'HH:mm • dd MMM', { locale: tr }) : 'Tarih yok'}
                        </span>
                        
                        <button 
                          onClick={(e) => handleCopy(e, note.content, note.id)}
                          className="flex items-center gap-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-bold px-3 py-1.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg disabled:opacity-80"
                        >
                           {copiedId === note.id ? "Kopyalandı!" : "Hızlı Kopyala"}
                        </button>
                     </div>
                  </div>
               )
            })}
          </div>
        )}
      </div>

      {/* Right Click Context Menu */}
      {contextMenu && (
        <div 
          className="fixed bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 py-3 w-56 z-[100] animate-in zoom-in-95 duration-150 backdrop-blur-xl supports-[backdrop-filter]:bg-white/95 supports-[backdrop-filter]:dark:bg-slate-800/95"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
             <Tag className="w-3.5 h-3.5" /> Kategori Değiştir
          </div>
          
          <button 
             onClick={(e) => handleChangeCategory(e, "Yaratıcı Fikirler")}
             className="w-full px-5 py-2.5 text-left text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors"
          >
             <span className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span> Yaratıcı Fikirler
          </button>
          
          <button 
             onClick={(e) => handleChangeCategory(e, "Genel Notlar")}
             className="w-full px-5 py-2.5 text-left text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors"
          >
             <span className="w-2 h-2 rounded-full bg-[#60a5fa] shadow-[0_0_8px_rgba(96,165,250,0.6)]"></span> Genel Notlar
          </button>
          
          <button 
             onClick={(e) => handleChangeCategory(e, "Yazılım")}
             className="w-full px-5 py-2.5 text-left text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors"
          >
             <span className="w-2 h-2 rounded-full bg-[#a78bfa] shadow-[0_0_8px_rgba(167,139,250,0.6)]"></span> Yazılım & Kod
          </button>
          
          <hr className="my-2 border-slate-100 dark:border-slate-700/50" />
          
          <button 
             onClick={(e) => handleDelete(e, contextMenu.note.id)}
             className="w-full px-5 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 transition-colors"
          >
             <Trash2 className="w-4 h-4" /> Sil
          </button>
        </div>
      )}

      {/* Detay Paneli */}
      <NoteDetailPanel />

      {/* Yeni Not Ekleme Modali */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" />
              Yeni Not Oluştur
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Başlık (Opsiyonel)</Label>
              <Input
                id="title"
                value={addTitle}
                onChange={e => setAddTitle(e.target.value)}
                placeholder="Örn: Yeni Mobil Uygulama Fikri..."
                className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</Label>
              <Select value={addCategory} onValueChange={(val) => val && setAddCategory(val)}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 h-11">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Genel Notlar">Genel Notlar</SelectItem>
                  <SelectItem value="Yaratıcı Fikirler">Yaratıcı Fikirler</SelectItem>
                  <SelectItem value="Yazılım">Yazılım</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-xs font-bold text-slate-500 uppercase tracking-wider">İçerik</Label>
              <Textarea
                id="content"
                value={addContent}
                onChange={e => setAddContent(e.target.value)}
                placeholder="Notunuzu buraya yazın..."
                className="min-h-[160px] resize-none bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 rounded-xl leading-relaxed"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-xl px-6">
                İptal
              </Button>
              <Button onClick={handleAddExplicit} disabled={!addContent.trim() || isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 shadow-sm">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Notu Kaydet"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Global Style additions for hiding scrollbars etc. */}
      <style dangerouslySetInnerHTML={{__html: `
         .hide-scrollbar::-webkit-scrollbar { display: none; }
         .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
         .mask-bottom { mask-image: linear-gradient(to top, transparent 0%, black 30%); -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%); }
      `}} />
    </div>
  )
}

