"use client"

import * as React from "react"
import { useAIChatStore, ChatSession, SessionMessage, CategoryFilter } from "@/stores/aiChatStore"
import {
  MessageCircle, Send, Plus, Sparkles, StickyNote, ListPlus,
  CalendarDays, Clock, ChevronRight, Search, Bot, User,
  CheckCircle2, ArrowUpRight, FileText, Layers, Brain, Trash2
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { MiniRobot } from "@/components/chat/MiniRobot"
import { useAuthStore } from "@/store/authStore"

// ============ CATEGORY CONFIG ============

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string; darkBg: string; darkText: string }> = {
  gorev: {
    label: 'Görev',
    icon: <CheckCircle2 className="w-3 h-3" />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    darkBg: 'dark:bg-amber-950/50',
    darkText: 'dark:text-amber-300',
  },
  takvim: {
    label: 'Takvim',
    icon: <CalendarDays className="w-3 h-3" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    darkBg: 'dark:bg-blue-950/50',
    darkText: 'dark:text-blue-300',
  },
  not: {
    label: 'Not',
    icon: <FileText className="w-3 h-3" />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    darkBg: 'dark:bg-emerald-950/50',
    darkText: 'dark:text-emerald-300',
  },
  genel: {
    label: 'Genel',
    icon: <MessageCircle className="w-3 h-3" />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    darkBg: 'dark:bg-slate-800',
    darkText: 'dark:text-slate-400',
  },
}

const CATEGORY_TABS: { key: CategoryFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'Tüm Sohbetler', icon: <Layers className="w-4 h-4" /> },
  { key: 'gorev', label: 'Görev Planlama', icon: <CheckCircle2 className="w-4 h-4" /> },
  { key: 'takvim', label: 'Takvim Planlama', icon: <CalendarDays className="w-4 h-4" /> },
  { key: 'not', label: 'Not Defteri', icon: <FileText className="w-4 h-4" /> },
]

// ============ MESSAGE BUBBLE ============

function MessageBubble({ msg }: { msg: SessionMessage }) {
  if (msg.role === 'system') {
    return (
      <div className="flex w-full justify-center my-2 animate-in fade-in duration-300">
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2.5 text-xs max-w-[90%]">
          <span className="font-semibold text-emerald-700 dark:text-emerald-300 block mb-1">🤖 Sistem Aksiyonları:</span>
          <pre className="whitespace-pre-wrap text-emerald-600 dark:text-emerald-400 font-mono">{msg.content}</pre>
        </div>
      </div>
    )
  }

  const isUser = msg.role === 'user'

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
      <div className="flex items-end gap-2 max-w-[80%]">
        {/* AI Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center shrink-0 shadow-sm mb-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-dark" />
          </div>
        )}

        <div className="space-y-1">
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              isUser
                ? 'bg-brand-dark dark:bg-indigo-600 text-white rounded-tr-md shadow-sm'
                : 'bg-white dark:bg-slate-700/60 text-brand-dark dark:text-white/90 rounded-tl-md shadow-sm border border-slate-100 dark:border-white/5'
            }`}
          >
            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
          </div>

          {/* Action badges */}
          {!isUser && msg.actions && msg.actions.length > 0 && (
            <div className="flex flex-wrap gap-1 px-1">
              {msg.actions.map((action: any, i: number) => (
                <span
                  key={i}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                    action.success
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                  }`}
                >
                  {action.success ? '✅' : '❌'} {action.action}
                </span>
              ))}
            </div>
          )}

          <span className="text-[10px] text-brand-gray dark:text-gray-500 px-1">
            {format(new Date(msg.created_at), 'HH:mm', { locale: tr })}
          </span>
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-brand-dark dark:bg-white/10 flex items-center justify-center shrink-0 shadow-sm mb-1">
            <User className="w-3.5 h-3.5 text-white dark:text-white/80" />
          </div>
        )}
      </div>
    </div>
  )
}

// ============ SESSION CARD ============

function SessionCard({ session, isActive, onClick, onContextMenu }: {
  session: ChatSession;
  isActive: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}) {
  const categories = Array.isArray(session.ai_categories) && session.ai_categories.length > 0 
    ? session.ai_categories 
    : ['genel'];
  const timeAgo = formatDistanceToNow(new Date(session.updated_at), { locale: tr, addSuffix: true })

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`w-full text-left p-4 rounded-2xl transition-all duration-200 group border ${
        isActive
          ? 'bg-brand-yellow/10 border-brand-yellow/40 dark:bg-brand-yellow/5 dark:border-brand-yellow/20 shadow-sm'
          : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-700/40 hover:border-brand-yellow/20 hover:shadow-sm'
      }`}
    >
      {/* Category badges + time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap gap-1">
          {categories.map((catKey) => {
            const cat = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG.genel;
            return (
              <span key={catKey} className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${cat.bgColor} ${cat.color} ${cat.darkBg} ${cat.darkText}`}>
                {cat.icon} {cat.label}
              </span>
            );
          })}
        </div>
        <span className="text-[10px] text-brand-gray dark:text-gray-500 font-medium whitespace-nowrap ml-2">{timeAgo}</span>
      </div>

      {/* User's last message */}
      {session.last_user_message && (
        <div className="flex items-start gap-2 mb-2">
          <User className="w-3.5 h-3.5 text-brand-gray dark:text-gray-500 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-brand-dark dark:text-white truncate leading-snug">
            {session.last_user_message}
          </p>
        </div>
      )}

      {/* AI preview */}
      {session.last_message_preview && (
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-yellow mt-0.5 shrink-0" />
          <p className="text-xs text-brand-gray dark:text-gray-400 line-clamp-2 leading-relaxed">
            {session.last_message_preview}
          </p>
        </div>
      )}

      {/* Title fallback */}
      {!session.last_user_message && session.title && (
        <p className="text-sm font-medium text-brand-dark dark:text-white truncate">
          {session.title}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-50 dark:border-white/5">
        <span className="text-[10px] text-brand-gray dark:text-gray-500 font-bold">
          {session.message_count || 0} mesaj
        </span>
        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-brand-yellow translate-x-0.5' : 'text-brand-gray dark:text-gray-500 group-hover:translate-x-0.5'}`} />
      </div>
    </button>
  )
}

// ============ MAIN DASHBOARD ============

export function AIChatDashboard() {
  const {
    sessions, isSessionsLoading, sessionsTotal,
    activeSessionId, activeMessages, isMessagesLoading,
    isSending, selectedCategory,
    fetchSessions, createSession, selectSession, sendMessage, setCategory, clearActiveSession,
    deleteSession, deleteAllSessions // Added delete actions
  } = useAIChatStore()

  const { user } = useAuthStore()

  const [inputValue, setInputValue] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  // Context Menu and Dialogue State
  const [contextMenuState, setContextMenuState] = React.useState<{ show: boolean, x: number, y: number, sessionId: number | null }>({ show: false, x: 0, y: 0, sessionId: null })
  const [sessionToDelete, setSessionToDelete] = React.useState<number | null>(null)
  const [isDeleteAllOpen, setIsDeleteAllOpen] = React.useState(false)

  // Handle right click on session cards
  const handleContextMenu = (e: React.MouseEvent, sessionId: number) => {
    e.preventDefault()
    setContextMenuState({ show: true, x: e.clientX, y: e.clientY, sessionId })
  }
  
  const closeContextMenu = () => {
    setContextMenuState(prev => ({ ...prev, show: false }))
  }

  React.useEffect(() => {
    const handleGlobalClick = () => closeContextMenu()
    if (contextMenuState.show) {
      document.addEventListener("click", handleGlobalClick)
      document.addEventListener("contextmenu", handleGlobalClick)
    }
    return () => {
      document.removeEventListener("click", handleGlobalClick)
      document.removeEventListener("contextmenu", handleGlobalClick)
    }
  }, [contextMenuState.show])

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return
    await deleteSession(sessionToDelete)
    setSessionToDelete(null)
  }

  const confirmDeleteAll = async () => {
    await deleteAllSessions()
    setIsDeleteAllOpen(false)
  }

  // Initial load
  React.useEffect(() => {
    fetchSessions()
  }, [])

  // Auto scroll
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages])

  // Focus input when session selected
  React.useEffect(() => {
    if (activeSessionId) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [activeSessionId])

  const handleSend = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault()
    if (!inputValue.trim() || isSending) return
    const msg = inputValue.trim()
    setInputValue("")
    if (inputRef.current) inputRef.current.style.height = 'auto'
    await sendMessage(msg)
  }

  const handleNewChat = async () => {
    clearActiveSession()
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Category -> input prefix mapping
  const CATEGORY_PREFIX: Record<string, string> = {
    gorev: 'Görev ekle: ',
    takvim: 'Etkinlik ekle: ',
    not: 'Not oluştur: ',
    all: '',
  }

  const handleQuickAction = (template: string, category?: string) => {
    if (category && category !== selectedCategory) {
      setCategory(category as any)
    }
    setInputValue(template)
    inputRef.current?.focus()
  }

  // When category tab changes, auto-fill prefix in input
  const handleCategoryChange = (cat: CategoryFilter) => {
    setCategory(cat)
    const prefix = CATEGORY_PREFIX[cat] || ''
    setInputValue(prefix)
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(prefix.length, prefix.length)
      }
    }, 50)
  }

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden gap-4">

      <ConfirmDialog 
        isOpen={!!sessionToDelete}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
        title="Sohbeti Sil"
        description="Bu sohbeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        onConfirm={confirmDeleteSession}
      />

      <ConfirmDialog 
        isOpen={isDeleteAllOpen}
        onOpenChange={setIsDeleteAllOpen}
        title="Tüm Sohbetleri Sil"
        description="Tüm geçmiş sohbetlerinizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmText="Tümünü Sil"
        onConfirm={confirmDeleteAll}
      />

      {/* Context Menu Dropdown */}
      {contextMenuState.show && contextMenuState.sessionId && (
        <div 
          className="fixed animate-in fade-in zoom-in-95 duration-100 z-[9999] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 py-1.5 min-w-[140px]"
          style={{ top: contextMenuState.y, left: contextMenuState.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => {
              setSessionToDelete(contextMenuState.sessionId)
              closeContextMenu()
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Sil
          </button>
        </div>
      )}

      {/* === TOP: CATEGORY SWITCHER === */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        {/* Kategori Tabs */}
        <div className="flex items-center bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-sm border border-slate-100 dark:border-white/5 gap-1">
                  {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleCategoryChange(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
                selectedCategory === tab.key
                  ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark shadow-sm'
                  : 'text-brand-gray dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right side: stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-brand-gray dark:text-gray-400">
            <Brain className="w-4 h-4 text-brand-yellow" />
            <span className="font-bold text-brand-dark dark:text-white">{sessionsTotal}</span>
            <span>sohbet</span>
          </div>
          <button 
            onClick={() => setIsDeleteAllOpen(true)}
            disabled={sessionsTotal === 0}
            className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hidden sm:flex shrink-0"
            title="Tüm Sohbetleri Sil"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden md:inline">Tümünü Sil</span>
          </button>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-yellow text-brand-dark rounded-full text-xs font-bold hover:bg-brand-yellow/90 transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Yeni Sohbet
          </button>
        </div>
      </div>

      {/* === MAIN CONTENT: TWO PANELS === */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">

        {/* ========= LEFT PANEL: AI CHAT ========= */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col floating-card rounded-2xl overflow-hidden relative">
          
          {/* Decorative top gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-yellow via-amber-400 to-brand-yellow rounded-t-2xl" />

          {/* Chat Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-brand-dark" />
              </div>
              <div>
                <h3 className="font-bold text-brand-dark dark:text-white text-sm">Akıllı Asistan</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Aktif</span>
                </div>
              </div>
            </div>
            {activeSessionId && (
              <span className="text-[10px] text-brand-gray dark:text-gray-500 font-medium bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full">
                Oturum #{activeSessionId}
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide min-h-0">
            {activeMessages.length === 0 && !isMessagesLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <MiniRobot className="scale-150 origin-center" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-1">
                    Merhaba {user?.username || ''}! 👋
                  </h3>
                  <p className="text-sm text-brand-gray dark:text-gray-400 max-w-sm leading-relaxed">
                    Görev planla, takvimini düzenle, not al — her şeyi birlikte yapalım.
                    Tüm konuşmalar kalıcı olarak saklanır.
                  </p>
                </div>
                
                {/* Quick Start Cards */}
                <div className="grid grid-cols-2 gap-3 mt-4 max-w-md">
                  <button
                    onClick={() => handleQuickAction('Günümü planla: ', 'takvim')}
                    className="flex items-center gap-3 p-4 bg-brand-yellow/5 dark:bg-brand-yellow/5 border border-brand-yellow/20 rounded-2xl text-left hover:bg-brand-yellow/10 transition-all group"
                  >
                    <Sparkles className="w-5 h-5 text-brand-yellow shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-brand-dark dark:text-white">Günümü Planla</p>
                      <p className="text-[10px] text-brand-gray dark:text-gray-500">AI ile günlük plan</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleQuickAction('Görev ekle: ', 'gorev')}
                    className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-white/5 rounded-2xl text-left hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all group"
                  >
                    <ListPlus className="w-5 h-5 text-brand-dark dark:text-white shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-brand-dark dark:text-white">Görev Ekle</p>
                      <p className="text-[10px] text-brand-gray dark:text-gray-500">Hızlı görev oluştur</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleQuickAction('Etkinlik ekle: ', 'takvim')}
                    className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-white/5 rounded-2xl text-left hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all group"
                  >
                    <CalendarDays className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-brand-dark dark:text-white">Etkinlik Ekle</p>
                      <p className="text-[10px] text-brand-gray dark:text-gray-500">Takvime ekle</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleQuickAction('Not oluştur: ', 'not')}
                    className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-white/5 rounded-2xl text-left hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all group"
                  >
                    <StickyNote className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-brand-dark dark:text-white">Not Oluştur</p>
                      <p className="text-[10px] text-brand-gray dark:text-gray-500">Hızlı not al</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isMessagesLoading && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-2 text-brand-gray dark:text-gray-500 text-sm">
                      <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="ml-2">Mesajlar yükleniyor...</span>
                    </div>
                  </div>
                )}
                {activeMessages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
              </>
            )}

            {/* Sending indicator */}
            {isSending && (
              <div className="flex w-full justify-start animate-in slide-in-from-bottom-2">
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-brand-dark" />
                  </div>
                  <div className="bg-white dark:bg-slate-700/60 rounded-2xl rounded-tl-md px-5 py-3.5 shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 shrink-0 bg-white dark:bg-slate-800">
            {/* Quick action pills removed */}

            {/* Input */}
            <form onSubmit={handleSend} className="flex items-end gap-3">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  rows={1}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 250)}px`
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend(e)
                    }
                  }}
                  placeholder={
                    selectedCategory === 'gorev' ? 'Görev ekle: ne yapmak istiyorsun?' :
                    selectedCategory === 'takvim' ? 'Etkinlik ekle: ne zaman, ne için?' :
                    selectedCategory === 'not' ? 'Not oluştur: ne yazmak istiyorsun?' :
                    'Mesajını yaz... (görev ver, plan yap, not al)'
                  }
                  className="w-full block bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-brand-yellow/40 focus:border-brand-yellow/40 rounded-2xl py-3.5 px-5 pr-12 text-sm placeholder:text-brand-gray/50 text-brand-dark dark:text-white outline-none transition-all resize-none min-h-[48px] max-h-[250px] overflow-y-auto overflow-x-hidden leading-relaxed"
                  disabled={isSending}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isSending}
                className="w-12 h-12 mb-0.5 shrink-0 bg-brand-dark dark:bg-white text-white dark:text-brand-dark rounded-2xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 shadow-sm hover:shadow-md hover:scale-[1.02]"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* ========= RIGHT PANEL: PERSISTENT MEMORY ========= */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col floating-card rounded-2xl overflow-hidden">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-white/5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-dark dark:bg-white/10 flex items-center justify-center shadow-sm">
                  <Brain className="w-5 h-5 text-white dark:text-white/80" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark dark:text-white text-sm">Kalıcı Hafıza</h3>
                  <p className="text-[10px] text-brand-gray dark:text-gray-500">Tüm konuşmalar burada</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-brand-gray dark:text-gray-500 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full">
                {sessionsTotal} sohbet
              </span>
            </div>
          </div>

          {/* Sessions list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide min-h-0">
            {isSessionsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <p className="text-xs text-brand-gray dark:text-gray-500">Yükleniyor...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-brand-gray/40 dark:text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-dark dark:text-white mb-1">Henüz sohbet yok</p>
                  <p className="text-[10px] text-brand-gray dark:text-gray-500 max-w-[200px]">
                    Sol panelden mesaj göndererek yeni bir sohbet başlatın.
                  </p>
                </div>
              </div>
            ) : (
              sessions.map((session) => (
                <ContextMenu key={session.id}>
                  <ContextMenuTrigger>
                    <div className="w-full">
                      <SessionCard
                        session={session}
                        isActive={session.id === activeSessionId}
                        onClick={() => selectSession(session.id)}
                        onContextMenu={(e) => handleContextMenu(e, session.id)}
                      />
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem 
                      className="text-red-500 focus:bg-red-50 dark:focus:bg-red-950/50"
                      onClick={() => setSessionToDelete(session.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Sil
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
