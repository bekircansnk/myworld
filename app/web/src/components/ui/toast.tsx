"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react"

export type ToastType = 'success' | 'error' | 'info' | 'loading'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  show: (message: string, type?: ToastType, duration?: number) => string
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const show = React.useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type, duration }])

    if (type !== 'loading') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }

    return id
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = (message: string, duration?: number) => { show(message, 'success', duration) }
  const error = (message: string, duration?: number) => { show(message, 'error', duration) }

  return (
    <ToastContext.Provider value={{ show, success, error, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} remove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within a ToastProvider")
  return context
}

function ToastContainer({ toasts, remove }: { toasts: Toast[], remove: (id: string) => void }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[100000] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border 
            animate-in slide-in-from-right-full duration-300 min-w-[280px] max-w-md
            ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : ''}
            ${toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' : ''}
            ${toast.type === 'info' ? 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400' : ''}
            ${toast.type === 'loading' ? 'bg-white border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-white/10 dark:text-white' : ''}
          `}
        >
          <div className="shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5" />}
            {toast.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
          </div>
          <p className="text-sm font-bold flex-1">{toast.message}</p>
          <button onClick={() => remove(toast.id)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-4 h-4 opacity-50" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  )
}
