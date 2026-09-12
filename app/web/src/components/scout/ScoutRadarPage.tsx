"use client"

import * as React from "react"
import { api } from "@/lib/api"
import { format, parseISO } from "date-fns"
import { tr } from "date-fns/locale"
import { 
  Compass, 
  Search, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Database, 
  Send
} from "lucide-react"

interface ScoutBriefing {
  id: number
  title: string
  description: string
  date: string
  created_at: string
  project_id?: number
}

export function ScoutRadarPage() {
  const [briefings, setBriefings] = React.useState<ScoutBriefing[]>([])
  const [selectedBriefing, setSelectedBriefing] = React.useState<ScoutBriefing | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [question, setQuestion] = React.useState("")
  const [chatAnswer, setChatAnswer] = React.useState<string | null>(null)
  const [isAsking, setIsAsking] = React.useState(false)

  const fetchBriefings = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/api/reports/scout')
      setBriefings(res.data)
      if (res.data && res.data.length > 0) {
        setSelectedBriefing(res.data[0])
      }
    } catch (err) {
      console.error("Scout brifingleri çekilemedi:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchBriefings()
  }, [fetchBriefings])

  const handleAskNotebookLM = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    setIsAsking(true)
    setChatAnswer(null)
    try {
      const res = await api.post('/api/ai/chat', {
        message: `Kullanıcı Maestro 360-Scout İstihbarat Radarı üzerinden soruyor. NotebookLM ve teknik araştırma havuzundaki bilgilere dayanarak yanıt ver: ${question}`,
        system_prompt: "Sen Maestro 360-Scout Baş İstihbarat Uzmanısın. Kullanıcının araştırma ve teknoloji sorularını net, profesyonel Türkçe ile açıkla."
      })
      setChatAnswer(res.data?.reply || res.data?.message || "Yanıt alındı.")
    } catch (err: any) {
      setChatAnswer(`Hata oluştu: ${err?.response?.data?.detail || err.message}`)
    } finally {
      setIsAsking(false)
    }
  }

  const filteredBriefings = briefings.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.date.includes(searchQuery)
  )

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbf9f4] dark:bg-[#0b0d13] text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Üst Bar */}
      <div className="px-6 py-4 border-b border-slate-200/80 dark:border-white/5 bg-white/60 dark:bg-[#121622]/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Maestro 360-Scout AI Radarı
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Canlı Bağlantı
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contabo VPS, Mac konut kazıyıcısı ve Google NotebookLM RAG ile senkronize günlük teknoloji brifingi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBriefings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </div>

      {/* Ana Çift Bölmeli Alan */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sol Kolon: Tarih & Brifing Listesi */}
        <div className="w-80 md:w-96 border-r border-slate-200/80 dark:border-white/5 flex flex-col bg-white/40 dark:bg-[#10131d]/40">
          <div className="p-3 border-b border-slate-200/80 dark:border-white/5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Raporlarda veya tarihlerde ara..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mb-2" />
                <span className="text-xs">İstihbarat havuzu taranıyor...</span>
              </div>
            ) : filteredBriefings.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">Henüz kayıtlı istihbarat brifingi bulunamadı.</p>
              </div>
            ) : (
              filteredBriefings.map((briefing) => {
                const isSelected = selectedBriefing?.id === briefing.id
                return (
                  <div
                    key={briefing.id}
                    onClick={() => setSelectedBriefing(briefing)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60 shadow-sm'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200/60 dark:border-white/5 hover:border-indigo-300 dark:hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {briefing.date ? format(parseISO(briefing.date), 'dd MMMM yyyy', { locale: tr }) : 'Bugün'}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                        ID #{briefing.id}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 mb-1">
                      {briefing.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {briefing.description}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Sağ Kolon: Brifing Detayı ve NotebookLM Soru Sor Alanı */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
          {selectedBriefing ? (
            <div className="max-w-4xl mx-auto w-full space-y-6">
              {/* Başlık Kartı */}
              <div className="bg-white dark:bg-[#141824] rounded-3xl p-6 border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Günlük Yönetici Özeti
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                      {selectedBriefing.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                      <Database className="w-3.5 h-3.5" />
                      NotebookLM Defterine Kayıtlı
                    </span>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  {selectedBriefing.description}
                </div>
              </div>

              {/* NotebookLM Canlı Soru Sorma Kartı */}
              <div className="bg-white dark:bg-[#141824] rounded-3xl p-6 border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Araştırma Havuzuna Soru Sor (Zero-Token NotebookLM RAG)
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Google DeepMind dokümanları, GitHub Trending AI kütüphaneleri, X/Twitter ve Reddit bulguları arasında doğrudan arama yapın.
                </p>

                <form onSubmit={handleAskNotebookLM} className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Örn: Google DeepMind'ın yeni yayınladığı bilim ve ajan araçları neler?"
                    className="flex-1 px-4 py-2.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 focus:border-indigo-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isAsking}
                    className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isAsking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Sor
                  </button>
                </form>

                {chatAnswer && (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                    <strong className="block mb-1 text-indigo-600 dark:text-indigo-400 font-bold">🧠 İstihbarat Yanıtı:</strong>
                    {chatAnswer}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <BookOpen className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm font-medium">Görüntülemek için sol listeden bir tarih veya rapor seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
