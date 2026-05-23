"use client"

import * as React from "react"
import { useGamificationStore } from "@/stores/gamificationStore"
import { useProjectStore } from "@/stores/projectStore"
import { useTaskStore } from "@/stores/taskStore"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Trophy, Award, Sparkles, Flame, ShieldAlert } from "lucide-react"

export function GamificationWidget() {
  const { selectedProjectId } = useProjectStore()
  const { tasks } = useTaskStore()
  const { userXp, userLevel, badges, leaderboard, calculateGamification } = useGamificationStore()

  React.useEffect(() => {
    calculateGamification()
  }, [tasks, selectedProjectId, calculateGamification])

  // Seviye ilerleme barı yüzdesi
  const progressPercent = userXp % 100

  return (
    <Card className="h-full border border-white/10 dark:border-white/5 bg-background/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-lg rounded-xl overflow-hidden flex flex-col min-h-[240px]">
      <CardHeader className="p-4 border-b border-white/5 shrink-0 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4.5 h-4.5 text-brand-yellow animate-bounce-subtle" />
          <CardTitle className="text-sm font-semibold">Piksel Lig & Ekip XP</CardTitle>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-black">
          Seviye {userLevel}
        </span>
      </CardHeader>

      <CardContent className="p-3 flex-1 overflow-y-auto space-y-3 scrollbar-none">
        {/* Kullanıcının Kendi XP İlerlemesi */}
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/15">
          <div className="flex justify-between items-center text-[10px] font-black text-indigo-600 dark:text-indigo-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
              Mevcut Puanın: {userXp} XP
            </span>
            <span>Sonraki Seviye için: {100 - progressPercent} XP</span>
          </div>
          {/* İlerleme Çubuğu */}
          <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Rozetler */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {badges.map((b, i) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-lg bg-yellow-500/15 text-yellow-600 border border-yellow-500/20 font-bold flex items-center gap-0.5">
                  <Award className="w-2.5 h-2.5 shrink-0" />
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Liderlik Tablosu Listesi */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-1 mb-1">
            Firma Sıralaması
          </div>
          {leaderboard.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground italic">
              Henüz tamamlanan görev yok. Görev tamamlayıp XP kazanın! 🚀
            </div>
          ) : (
            leaderboard.slice(0, 5).map((u, i) => {
              // İlk 3 dereceye özel renk/ikon
              let rankStyle = "bg-slate-100 dark:bg-zinc-800 text-slate-500"
              if (u.rank === 1) rankStyle = "bg-yellow-500 text-white font-black scale-105"
              else if (u.rank === 2) rankStyle = "bg-slate-300 text-slate-800 font-bold"
              else if (u.rank === 3) rankStyle = "bg-amber-600 text-white font-bold"

              return (
                <div 
                  key={u.username} 
                  className={`flex items-center gap-2.5 p-2 rounded-xl border border-white/5 bg-zinc-950/20 dark:bg-zinc-950/40 hover:bg-zinc-900/30 transition-all duration-300 ${u.rank === 1 ? 'border-yellow-500/20 shadow-sm shadow-yellow-500/5' : ''}`}
                >
                  {/* Derece Numarası */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${rankStyle}`}>
                    {u.rank}
                  </div>

                  {/* Kullanıcı İsmi */}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate block capitalize">
                      {u.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      Seviye {u.level} • {u.completedCount} Görev
                    </span>
                  </div>

                  {/* XP Skoru */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-brand-dark dark:text-white flex items-center gap-0.5">
                      {u.xp}
                      <Sparkles className="w-3 h-3 text-brand-yellow shrink-0 animate-pulse" />
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
