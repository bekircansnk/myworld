"use client"

import * as React from "react"
import { Lightbulb, Loader2, Quote } from "lucide-react"
import { api } from "@/lib/api"

export function Motivation() {
  const [quote, setQuote] = React.useState({ text: "Sistem yükleniyor...", author: "My World AI" })
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchMotivation() {
      try {
        setIsLoading(true)
        const res = await api.get('/api/motivation')
        if (res.data && res.data.message) {
          setQuote({ text: res.data.message, author: "My World AI" })
        }
      } catch (err) {
        setQuote({ text: "Bugün kendi dünyanı yaratabileceğin harika bir gün. 🌍", author: "My World AI" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchMotivation()
  }, [])

  return (
    <div className="glass-card flex flex-col rounded-2xl h-full relative overflow-hidden group min-h-[140px]">
      {/* Yumuşak Altın Arka Plan & Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-200/40 via-yellow-100/10 to-transparent dark:from-amber-600/20 dark:via-yellow-600/5 group-hover:opacity-70 transition-opacity" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/20 rounded-full blur-[40px] mix-blend-multiply dark:mix-blend-screen" />
      
      {isLoading && (
         <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-20">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 drop-shadow-md" />
         </div>
      )}
      
      <div className={`p-4 flex-1 flex flex-col justify-center items-center text-center transition-all duration-700 relative z-10 ${isLoading ? 'blur-sm opacity-50' : 'opacity-100'}`}>
        <div className="relative mb-2 group-hover:-translate-y-0.5 transition-transform">
          <div className="absolute inset-0 bg-amber-400 blur-xl opacity-30 rounded-full animate-pulse" />
          <div className="bg-white/50 dark:bg-black/30 w-8 h-8 rounded-full flex items-center justify-center border border-amber-200/50 dark:border-amber-700/50 backdrop-blur-md relative z-10">
            <Lightbulb className="w-4 h-4 text-amber-500 drop-shadow-sm" />
          </div>
        </div>
        
        <div className="relative">
           <Quote className="w-6 h-6 text-amber-300/30 dark:text-amber-700/30 absolute -top-3 -left-3 -z-10 rotate-180" />
           <p className="font-serif text-[13px] leading-relaxed italic text-slate-800 dark:text-amber-100 font-medium drop-shadow-sm">
             "{quote.text}"
           </p>
           <Quote className="w-6 h-6 text-amber-300/30 dark:text-amber-700/30 absolute -bottom-3 -right-3 -z-10" />
        </div>
      </div>
    </div>
  )
}
