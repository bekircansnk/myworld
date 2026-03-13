"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Coffee, BrainCircuit, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = React.useState(25 * 60)
  const [isActive, setIsActive] = React.useState(false)
  const [mode, setMode] = React.useState<'focus' | 'break'>('focus')
  const [sessionId, setSessionId] = React.useState<number | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const stopSessionApi = async (id: number) => {
    try {
      await api.post('/api/timer/stop', { session_id: id })
    } catch(e) { console.error("Session stop error", e) }
  }

  React.useEffect(() => {
    let interval: any = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      if (sessionId) {
         stopSessionApi(sessionId)
         setSessionId(null)
      }

      if (mode === 'focus') {
        setMode('break')
        setTimeLeft(5 * 60)
      } else {
        setMode('focus')
        setTimeLeft(25 * 60)
      }
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode, sessionId])

  const toggleTimer = async () => {
    if (isActive) {
       setIsActive(false)
       if (sessionId) {
          await stopSessionApi(sessionId)
          setSessionId(null)
       }
    } else {
       setIsLoading(true)
       try {
         const res = await api.post('/api/timer/start', { break_type: mode === 'focus' ? 'work' : 'short_break' })
         if (res.data && res.data.id) {
            setSessionId(res.data.id)
         }
         setIsActive(true)
       } catch (e) {
         console.error(e)
       } finally {
         setIsLoading(false)
       }
    }
  }
  
  const resetTimer = async () => {
    setIsActive(false)
    if (sessionId) {
       await stopSessionApi(sessionId)
       setSessionId(null)
    }
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60)
  }

  const switchMode = async (newMode: 'focus' | 'break') => {
    if (isActive && sessionId) {
       await stopSessionApi(sessionId)
       setSessionId(null)
    }
    setIsActive(false)
    setMode(newMode)
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Calculate circular progress
  const totalDuration = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;
  const strokeDashoffset = 220 - (220 * progressPercent) / 100;

  return (
    <div className="glass-card flex flex-col rounded-2xl h-full relative overflow-hidden group">
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 opacity-20 ${mode === 'focus' ? 'from-orange-500 to-rose-500' : 'from-green-500 to-emerald-500'}`} />
      
      <div className="p-4 pb-0 flex flex-row items-center justify-between relative z-10 w-full mb-1">
        <h3 className="text-xs font-extrabold flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
          {mode === 'focus' ? <BrainCircuit className="w-4 h-4 text-orange-500" /> : <Coffee className="w-4 h-4 text-emerald-500" />}
          {mode === 'focus' ? 'Odak' : 'Mola'}
        </h3>
        <div className="flex bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-lg p-0.5 border border-white/20 dark:border-white/5 shadow-inner">
          <button 
            onClick={() => switchMode('focus')}
            className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all duration-300 ${mode === 'focus' ? 'bg-white dark:bg-slate-800 shadow-sm text-orange-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            25m
          </button>
          <button 
             onClick={() => switchMode('break')}
             className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all duration-300 ${mode === 'break' ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            5m
          </button>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col items-center justify-center relative z-10">
        
        {/* Glowy Circular Timer */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-3">
          {isActive && (
             <div className={`absolute inset-0 rounded-full blur-xl animate-pulse opacity-30 ${mode === 'focus' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
          )}
          
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle cx="72" cy="72" r="35" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-200/50 dark:text-slate-800/50" />
            <circle 
              cx="72" cy="72" r="35" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="6" 
              strokeDasharray="220"
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ease-linear ${mode === 'focus' ? 'text-orange-500' : 'text-emerald-500'}`} 
              strokeLinecap="round"
            />
          </svg>
          
          <div className="text-4xl font-black tabular-nums tracking-tighter text-slate-800 dark:text-white drop-shadow-md z-10 relative">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full justify-center">
          <Button 
            onClick={toggleTimer} 
            variant="default" 
            size="default" 
            className={`w-[100px] rounded-xl btn-3d font-bold text-xs ${isActive ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700' : (mode === 'focus' ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white')}`} 
            disabled={isLoading}
          >
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 
             isActive ? <><Pause className="w-4 h-4 mr-1.5" /> Duraklat</> : <><Play className="w-4 h-4 mr-1.5" /> Başlat</>}
          </Button>
          <Button onClick={resetTimer} variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white/30 dark:bg-black/20 hover:bg-white/50 border border-white/20 text-slate-600 dark:text-slate-300 btn-3d" disabled={isLoading}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
