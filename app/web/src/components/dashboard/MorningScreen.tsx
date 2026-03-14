"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Sun, Coffee, BookOpen, Dumbbell, Sparkles } from "lucide-react"

interface MorningScreenProps {
  onDismiss: () => void;
}

const ACTIVITIES = [
  { icon: <BookOpen className="w-5 h-5" />, text: "15 dk kitap oku" },
  { icon: <Coffee className="w-5 h-5" />, text: "Günün kahvesini demlerken esne" },
  { icon: <Dumbbell className="w-5 h-5" />, text: "10 dk sabah egzersizi yap" },
]

export function MorningScreen({ onDismiss }: MorningScreenProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const currentActivity = React.useMemo(() => ACTIVITIES[new Date().getDay() % ACTIVITIES.length], [])

  React.useEffect(() => {
    // Component unmount olurken bile animasyonu hissetmek için kısa bir timeout ile render ediliyor
    setIsVisible(true)
  }, [])

  const handleStart = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(), 300) // Animasyon süresi
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`relative max-w-lg w-full p-8 md:p-12 text-center flex flex-col items-center justify-center transform transition-all duration-500 delay-100 ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
         
         <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500 mb-6 flex items-center justify-center shadow-inner relative">
           <Sun className="w-10 h-10" />
           <div className="absolute inset-0 rounded-full animate-ping bg-yellow-400/20 duration-1000"></div>
         </div>

         <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
           Günaydın {user?.username}!
         </h1>
         <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-sm">
           Bugün harika şeyler yapabileceğini biliyorum. Ama işe koyulmadan önce, kendine biraz vakit ayır...
         </p>

         <div className="bg-card border border-border/50 rounded-2xl p-6 w-full mb-10 shadow-sm flex items-center gap-4 text-left">
           <div className="min-w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
             {currentActivity.icon}
           </div>
           <div>
             <h3 className="font-semibold text-foreground uppercase tracking-wider text-xs mb-1">Günün Küçük Rutini</h3>
             <p className="text-foreground/90 font-medium">{currentActivity.text}</p>
           </div>
         </div>

         <Button 
            onClick={handleStart}
            size="lg" 
            className="w-full sm:w-auto text-base h-14 px-10 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold gap-2"
         >
            <Sparkles className="w-5 h-5" />
            Hazırım, Günü Başlat
         </Button>
      </div>
    </div>
  )
}
