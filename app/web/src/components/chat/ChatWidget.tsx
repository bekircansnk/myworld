"use client"

import * as React from "react"
import { useChatStore, ChatMessage } from "@/stores/chatStore"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Trash2, Bug, ChevronDown, ChevronUp, StickyNote, ListPlus, FileText, CalendarDays, Sparkles, Volume2, VolumeX } from "lucide-react"
import { MiniRobot } from "./MiniRobot"
import { SpeechBubbles } from "./SpeechBubbles"

function MessageBubble({ msg, showDebug }: { msg: ChatMessage; showDebug: boolean }) {
  const [debugExpanded, setDebugExpanded] = React.useState(false)

  // Sistem mesajı (aksiyon log)
  if (msg.role === 'system') {
    return (
      <div className="flex w-full justify-center my-1">
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 text-xs max-w-[90%]">
          <span className="font-semibold text-emerald-700 dark:text-emerald-300 block mb-1">🤖 Sistem Aksiyonları:</span>
          <pre className="whitespace-pre-wrap text-emerald-600 dark:text-emerald-400 font-mono">{msg.content}</pre>
        </div>
      </div>
    )
  }

  const isUser = msg.role === 'user'

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[85%] space-y-1">
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted text-foreground rounded-tl-sm'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
        </div>

        {/* Aksiyonlar (AI mesajında) */}
        {!isUser && msg.actions && msg.actions.length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {msg.actions.map((action, i) => (
              <span
                key={i}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  action.success
                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                }`}
              >
                {action.success ? '✅' : '❌'} {action.action}
              </span>
            ))}
          </div>
        )}

        {/* Debug bilgisi (test aşamasında) */}
        {!isUser && showDebug && msg.debug && Object.keys(msg.debug).length > 0 && (
          <div className="px-1">
            <button
              onClick={() => setDebugExpanded(!debugExpanded)}
              className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground flex items-center gap-0.5 transition-colors"
            >
              <Bug className="w-3 h-3" />
              Debug
              {debugExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {debugExpanded && (
              <pre className="text-[10px] text-muted-foreground/40 bg-muted/30 rounded p-2 mt-1 font-mono overflow-x-auto">
                {JSON.stringify(msg.debug, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ChatWidget() {
  const { isOpen, toggleChat, messages, sendMessage, isLoading, clearHistory, showDebug, toggleDebug, loadHistory, isSoundEnabled, toggleSound } = useChatStore()
  const [inputValue, setInputValue] = React.useState("")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const { isAuthenticated, user } = useAuthStore()

  React.useEffect(() => {
    if (isAuthenticated && messages.length === 0) {
      loadHistory();
    }
  }, [isAuthenticated, messages.length, loadHistory]);

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  // Proaktif AI (arka planda çalışıp ara sıra sesli mesaj çıkaran sistem)
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleNextMessage = async () => {
      // Rastgele olarak 30 dakika ile 120 dakika (2 saat) arası bir süre seç
      const minInterval = 30 * 60 * 1000; // 30 Dakika
      const maxInterval = 120 * 60 * 1000; // 2 Saat
      const nextDelay = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
      
      timeoutId = setTimeout(async () => {
        // Aktif görevleri kontrol et (dinamik import ile state'i okuyalım, SSR vs uyumluluk için)
        const { useTaskStore } = await import('@/stores/taskStore');
        // useTaskStore zaten fetch edilip cache'lenmiş olacağı için getState ile alabiliriz
        const tasks = useTaskStore.getState().tasks || [];
        const activeTasks = tasks.filter((t: any) => t.status === 'in_progress' || t.status === 'todo');

        let selectedMessage = "";

        if (activeTasks.length > 0) {
          const taskMessages = [
            "İşler nasıl gidiyor? Harika ilerlediğine eminim, yardıma ihtiyacın var mı?",
            "Şu an üzerinde çalıştığın görevlerde durum nedir? Zorlandığın bir yer varsa birlikte çözebiliriz.",
            "Çalışmaya devam! Eğer yorulduysan kısa bir mola vermek iyi gelebilir. ☕",
            "Görevlerini harika yönetiyorsun! Bana sormak istediğin bir soru veya danışmak istediğin bir fikir var mı?"
          ];
          selectedMessage = taskMessages[Math.floor(Math.random() * taskMessages.length)];
        } else {
          const idleMessages = [
            "Bugün yoğun bir iş yok gibi! Yaratıcı işler yapabiliriz, ne dersin?",
            "Bugün için bir planın var mıydı? İstersen gününü birlikte planlayabiliriz.",
            "Şu an üzerinde çalıştığın bir iş yok gibi görünüyor. Yeni fikirler üretmek veya beyin fırtınası yapmak ister misin?",
            "Ben buradayım! Bir fikre veya asistanlığa ihtiyacın olduğunda bana tıklayabilirsin."
          ];
          selectedMessage = idleMessages[Math.floor(Math.random() * idleMessages.length)];
        }

        const { triggerProactiveMessage } = useChatStore.getState();
        triggerProactiveMessage(selectedMessage);

        // Bir sonraki mesajı planla
        scheduleNextMessage();
      }, nextDelay);
    };

    // İlk mesajı planlayarak başlat
    scheduleNextMessage();

    return () => clearTimeout(timeoutId);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    const currentInput = inputValue
    setInputValue("")
    await sendMessage(currentInput)
  }

  return (
    <>
      {/* Floating Button / Robot Indicator */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 pointer-events-none">
          {/* Obal bubbles will take care of their own pointer events and positioning natively */}
          <SpeechBubbles />
          
          <div className="pointer-events-auto">
            <MiniRobot onClick={toggleChat} className="w-16 h-16" />
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[380px] sm:w-[420px] h-[600px] max-h-[85vh] shadow-2xl z-50 flex flex-col border border-border animate-in slide-in-from-bottom-5">
          <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <CardTitle className="text-sm font-semibold">Gemini Asistan</CardTitle>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 font-medium">Aktif</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 text-muted-foreground`}
                onClick={toggleSound}
                title={isSoundEnabled ? "Sesi Kapat" : "Sesi Aç"}
              >
                {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 ${showDebug ? 'text-amber-500' : 'text-muted-foreground'}`}
                onClick={toggleDebug}
                title="Debug modunu aç/kapat"
              >
                <Bug className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={clearHistory}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={toggleChat}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-3 flex-1 overflow-y-auto space-y-3 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-3 opacity-60">
                <MessageCircle className="w-10 h-10" />
                <p className="text-sm text-center px-4">
                  Merhaba {user?.username}! Ben senin dijital ortağınım. Görev ver, fikir sor, not tut — hepsini hallederim. 🚀
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} showDebug={showDebug} />
              ))
            )}
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="max-w-[80%] bg-muted rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="p-3 border-t shrink-0 flex-col gap-2">
            <div className="grid grid-cols-3 gap-2 w-full pb-1">
              <button type="button" onClick={() => setInputValue('Not oluştur: ')} className="w-full justify-center whitespace-nowrap bg-muted hover:bg-muted/80 border border-border px-2 py-1.5 rounded-full text-[10px] font-semibold text-foreground transition flex items-center gap-1">
                <StickyNote className="w-3 h-3" /> Not
              </button>
              <button type="button" onClick={() => setInputValue('Görev ekle: ')} className="w-full justify-center whitespace-nowrap bg-muted hover:bg-muted/80 border border-border px-2 py-1.5 rounded-full text-[10px] font-semibold text-foreground transition flex items-center gap-1">
                <ListPlus className="w-3 h-3" /> Görev
              </button>
              <button type="button" onClick={() => setInputValue('Günümü planla: ')} className="w-full justify-center whitespace-nowrap bg-brand-yellow/10 text-brand-dark dark:text-brand-yellow hover:bg-brand-yellow/20 border border-brand-yellow/20 px-2 py-1.5 rounded-full text-[10px] font-semibold transition flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Planla
              </button>
            </div>
            <form onSubmit={handleSend} className="flex w-full items-center space-x-2">
              <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Görev ver, fikir sor, not tut..."
                className="flex-1 focus-visible:ring-1 text-sm h-9 bg-background"
                disabled={isLoading}
                autoFocus
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading} className="shrink-0 h-9 w-9">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
