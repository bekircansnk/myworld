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
  Send,
  Download,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  Layers,
  Shield,
  Zap,
  CheckSquare,
  FileCode,
  FileText,
  Activity,
  Maximize2,
  Minimize2,
  ChevronRight,
  Code2
} from "lucide-react"

interface ChecklistItem {
  completed: boolean
  title: string
  description: string
}

interface GithubProject {
  repo: string
  url: string
  headline: string
  details: string
}

interface ScoutBriefing {
  id: number
  title: string
  description: string
  date: string
  created_at: string
  project_id?: number
  content?: string
  html?: string
  parsed?: {
    raw_sections?: Record<string, string>
    telemetry_rows?: Array<Record<string, string>>
    github_projects?: GithubProject[]
    checklist_items?: ChecklistItem[]
    word_count?: number
    reading_time_min?: number
    metrics?: {
      total_workers?: number
      token_saving_pct?: number
      architecture_nodes?: number
      reading_time_min?: number
    }
  }
}

type TabMode = 'all' | 'summary' | 'github' | 'frontier' | 'architecture' | 'checklist' | 'telemetry' | 'raw'
type FontSize = 'sm' | 'base' | 'lg'

// -------------------------------------------------------------
// INLINE MARKDOWN PARSER (Bold, Italic, Code, Link)
// -------------------------------------------------------------
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null

  const parts: React.ReactNode[] = []
  const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|`.*?`|\*.*?\*)/g
  let lastIdx = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index))
    }
    const token = match[0]
    if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/)
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-0.5"
          >
            {linkMatch[1]}
            <ExternalLink className="w-2.5 h-2.5 inline opacity-70" />
          </a>
        )
      } else {
        parts.push(token)
      }
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-slate-900 dark:text-slate-100">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono text-[0.85em] border border-indigo-200/50 dark:border-indigo-800/40">
          {token.slice(1, -1)}
        </code>
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-700 dark:text-slate-300">
          {token.slice(1, -1)}
        </em>
      )
    } else {
      parts.push(token)
    }
    lastIdx = regex.lastIndex
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx))
  }

  return parts
}

// -------------------------------------------------------------
// RICH MARKDOWN BLOCK VIEWER
// -------------------------------------------------------------
function RichMarkdownViewer({
  content,
  fontSize = 'base',
  onToggleChecklist
}: {
  content: string
  fontSize: FontSize
  onToggleChecklist?: (index: number) => void
}) {
  const [copiedCodeId, setCopiedCodeId] = React.useState<string | null>(null)

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeId(id)
    setTimeout(() => setCopiedCodeId(null), 2000)
  }

  const fontClasses: Record<FontSize, string> = {
    sm: "text-xs leading-relaxed",
    base: "text-sm leading-relaxed",
    lg: "text-base leading-relaxed"
  }

  // Split markdown into semantic blocks
  const blocks = React.useMemo(() => {
    const rawBlocks: Array<{ type: string; data: any; raw: string }> = []
    const lines = content.split('\n')
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      // 1. Fenced Code Block / Architecture Diagram
      if (line.trim().startsWith('```')) {
        const lang = line.trim().replace(/^```/, '').trim()
        const codeLines: string[] = []
        i++
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i])
          i++
        }
        i++ // consume closing ```
        const codeContent = codeLines.join('\n')
        const isDiagram = codeContent.includes('+--') || codeContent.includes('|') || codeContent.includes('-->') || codeContent.includes('+==')
        rawBlocks.push({
          type: isDiagram ? 'diagram' : 'code',
          data: { lang, code: codeContent },
          raw: line
        })
        continue
      }

      // 2. Markdown Table
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = []
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim())
          i++
        }
        if (tableLines.length >= 2) {
          const headerRow = tableLines[0].split('|').slice(1, -1).map(c => c.trim())
          const bodyRows: string[][] = []
          for (let rowIdx = 1; rowIdx < tableLines.length; rowIdx++) {
            if (tableLines[rowIdx].includes('---')) continue
            const cols = tableLines[rowIdx].split('|').slice(1, -1).map(c => c.trim())
            if (cols.length > 0) bodyRows.push(cols)
          }
          rawBlocks.push({
            type: 'table',
            data: { headers: headerRow, rows: bodyRows },
            raw: tableLines.join('\n')
          })
          continue
        }
      }

      // 3. Headings
      if (line.startsWith('# ')) {
        rawBlocks.push({ type: 'h1', data: line.replace(/^#\s+/, ''), raw: line })
        i++
        continue
      }
      if (line.startsWith('## ')) {
        rawBlocks.push({ type: 'h2', data: line.replace(/^##\s+/, ''), raw: line })
        i++
        continue
      }
      if (line.startsWith('### ')) {
        rawBlocks.push({ type: 'h3', data: line.replace(/^###\s+/, ''), raw: line })
        i++
        continue
      }
      if (line.startsWith('#### ')) {
        rawBlocks.push({ type: 'h4', data: line.replace(/^####\s+/, ''), raw: line })
        i++
        continue
      }

      // 4. Horizontal Rule
      if (line.trim() === '---' || line.trim() === '***') {
        rawBlocks.push({ type: 'hr', data: null, raw: line })
        i++
        continue
      }

      // 5. Blockquote
      if (line.startsWith('> ')) {
        const quoteLines: string[] = []
        while (i < lines.length && lines[i].startsWith('>')) {
          quoteLines.push(lines[i].replace(/^>\s?/, ''))
          i++
        }
        rawBlocks.push({ type: 'blockquote', data: quoteLines.join(' '), raw: line })
        continue
      }

      // 6. Checklist item
      const checkMatch = line.match(/^-\s+\[([ xX])\]\s+(.*)/)
      if (checkMatch) {
        rawBlocks.push({
          type: 'checklist',
          data: { completed: checkMatch[1].toLowerCase() === 'x', text: checkMatch[2] },
          raw: line
        })
        i++
        continue
      }

      // 7. Bullet List Item
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const bulletText = line.trim().replace(/^[\*\-]\s+/, '')
        rawBlocks.push({ type: 'bullet', data: bulletText, raw: line })
        i++
        continue
      }

      // 8. Numbered List Item
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/)
      if (numMatch) {
        rawBlocks.push({ type: 'number', data: { num: numMatch[1], text: numMatch[2] }, raw: line })
        i++
        continue
      }

      // 9. Regular Paragraph
      if (line.trim().length > 0) {
        const pLines: string[] = []
        while (
          i < lines.length &&
          lines[i].trim().length > 0 &&
          !lines[i].startsWith('#') &&
          !lines[i].startsWith('```') &&
          !lines[i].startsWith('|') &&
          !lines[i].startsWith('>') &&
          !lines[i].trim().startsWith('* ') &&
          !lines[i].trim().startsWith('- ') &&
          !lines[i].match(/^-\s+\[([ xX])\]/) &&
          lines[i].trim() !== '---'
        ) {
          pLines.push(lines[i])
          i++
        }
        rawBlocks.push({ type: 'paragraph', data: pLines.join(' '), raw: pLines.join(' ') })
        continue
      }

      i++
    }

    return rawBlocks
  }, [content])

  return (
    <div className={`space-y-4 ${fontClasses[fontSize]}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <div key={idx} className="pt-2 pb-4 border-b border-slate-200 dark:border-white/10">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  {renderInlineMarkdown(block.data)}
                </h1>
              </div>
            )

          case 'h2': {
            const headingText = String(block.data)
            return (
              <div key={idx} className="pt-6 pb-2 border-b border-slate-200/80 dark:border-white/10">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  {renderInlineMarkdown(headingText)}
                </h2>
              </div>
            )
          }

          case 'h3':
            return (
              <h3 key={idx} className="text-base font-bold text-slate-800 dark:text-slate-200 pt-3">
                {renderInlineMarkdown(block.data)}
              </h3>
            )

          case 'h4':
            return (
              <h4 key={idx} className="text-sm font-semibold text-slate-700 dark:text-slate-300 pt-2">
                {renderInlineMarkdown(block.data)}
              </h4>
            )

          case 'hr':
            return <hr key={idx} className="my-6 border-slate-200 dark:border-white/10" />

          case 'blockquote':
            return (
              <blockquote
                key={idx}
                className="my-3 pl-4 py-2 border-l-4 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-r-2xl text-slate-700 dark:text-slate-300 italic"
              >
                {renderInlineMarkdown(block.data)}
              </blockquote>
            )

          case 'checklist':
            return (
              <div
                key={idx}
                onClick={() => onToggleChecklist && onToggleChecklist(idx)}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                  block.data.completed 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                }`}>
                  {block.data.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div className={`flex-1 text-slate-800 dark:text-slate-200 ${block.data.completed ? 'line-through opacity-60' : ''}`}>
                  {renderInlineMarkdown(block.data.text)}
                </div>
              </div>
            )

          case 'bullet':
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <div className="flex-1 text-slate-700 dark:text-slate-300">
                  {renderInlineMarkdown(block.data)}
                </div>
              </div>
            )

          case 'number':
            return (
              <div key={idx} className="flex items-start gap-3 pl-1">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {block.data.num}
                </span>
                <div className="flex-1 text-slate-700 dark:text-slate-300">
                  {renderInlineMarkdown(block.data.text)}
                </div>
              </div>
            )

          case 'diagram':
            return (
              <div key={idx} className="my-4 rounded-2xl border border-indigo-500/20 dark:border-indigo-500/30 bg-[#080d1a] shadow-xl overflow-hidden">
                <div className="px-4 py-2 bg-indigo-950/60 border-b border-indigo-500/20 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    📐 Mimari & Topoloji Şeması (ASCII FSM)
                  </span>
                  <button
                    onClick={() => handleCopyCode(block.data.code, `diag-${idx}`)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-[11px] font-medium text-indigo-200 transition-colors"
                  >
                    {copiedCodeId === `diag-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCodeId === `diag-${idx}` ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto font-mono text-[11px] md:text-xs text-cyan-300 leading-relaxed tracking-tight select-all">
                  {block.data.code}
                </pre>
              </div>
            )

          case 'code':
            return (
              <div key={idx} className="my-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-900 text-slate-100 shadow-md overflow-hidden">
                <div className="px-4 py-1.5 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
                    {block.data.lang || 'code'}
                  </span>
                  <button
                    onClick={() => handleCopyCode(block.data.code, `code-${idx}`)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 text-[11px] text-slate-300 transition-colors"
                  >
                    {copiedCodeId === `code-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCodeId === `code-${idx}` ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto font-mono text-xs text-sky-300 leading-relaxed">
                  {block.data.code}
                </pre>
              </div>
            )

          case 'table':
            return (
              <div key={idx} className="my-4 rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-x-auto shadow-sm bg-white/60 dark:bg-slate-900/40 backdrop-blur-md">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-800/60">
                      {block.data.headers.map((h: string, hIdx: number) => (
                        <th key={hIdx} className="px-4 py-2.5 font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[11px] tracking-wider">
                          {renderInlineMarkdown(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {block.data.rows.map((row: string[], rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors">
                        {row.map((cell: string, cIdx: number) => {
                          const isSuccess = cell.includes('✅') || cell.toLowerCase().includes('başarılı')
                          const isFail = cell.includes('❌') || cell.toLowerCase().includes('hata')
                          return (
                            <td key={cIdx} className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                              {isSuccess ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  {cell}
                                </span>
                              ) : isFail ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                  {cell}
                                </span>
                              ) : (
                                renderInlineMarkdown(cell)
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

          case 'paragraph':
          default:
            return (
              <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {renderInlineMarkdown(block.data)}
              </p>
            )
        }
      })}
    </div>
  )
}

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export function ScoutRadarPage() {
  const [briefings, setBriefings] = React.useState<ScoutBriefing[]>([])
  const [selectedBriefing, setSelectedBriefing] = React.useState<ScoutBriefing | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterCategory, setFilterCategory] = React.useState<string>("all")
  const [activeTab, setActiveTab] = React.useState<TabMode>('all')
  const [fontSize, setFontSize] = React.useState<FontSize>('base')
  const [isCopied, setIsCopied] = React.useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  // Chat & RAG state
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

  const handleCopyReport = () => {
    if (!selectedBriefing?.content) return
    navigator.clipboard.writeText(selectedBriefing.content)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDownload = (formatType: 'markdown' | 'html' | 'json') => {
    if (!selectedBriefing) return
    const dateStr = selectedBriefing.date || "rapor"
    let content = ""
    let mimeType = "text/plain"
    let ext = "txt"

    if (formatType === 'markdown') {
      content = selectedBriefing.content || selectedBriefing.description
      mimeType = "text/markdown"
      ext = "md"
    } else if (formatType === 'html') {
      content = selectedBriefing.html || `<!DOCTYPE html><html><body><pre>${selectedBriefing.content}</pre></body></html>`
      mimeType = "text/html"
      ext = "html"
    } else if (formatType === 'json') {
      content = JSON.stringify(selectedBriefing, null, 2)
      mimeType = "application/json"
      ext = "json"
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `AI_INTELLIGENCE_${dateStr}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleAskNotebookLM = async (customPrompt?: string) => {
    const q = customPrompt || question
    if (!q.trim()) return
    setIsAsking(true)
    setChatAnswer(null)
    try {
      const res = await api.post('/api/ai/chat', {
        message: `Kullanıcı Maestro 360-Scout İstihbarat Radarı üzerinden soruyor. Günlük araştırma raporu (${selectedBriefing?.date || 'Bugün'}) ve NotebookLM kaynaklarına dayanarak yanıt ver: ${q}`,
        system_prompt: "Sen Maestro 360-Scout Baş İstihbarat Uzmanısın. Kullanıcının araştırma, mimari ve teknoloji sorularını derin mühendislik perspektifiyle ve profesyonel Türkçe ile açıkla."
      })
      setChatAnswer(res.data?.reply || res.data?.message || "Yanıt alındı.")
    } catch (err: any) {
      setChatAnswer(`Hata oluştu: ${err?.response?.data?.detail || err.message}`)
    } finally {
      setIsAsking(false)
    }
  }

  // Filtered list
  const filteredBriefings = React.useMemo(() => {
    return briefings.filter(b => {
      const matchesSearch = 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.content && b.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        b.date.includes(searchQuery)

      if (!matchesSearch) return false

      if (filterCategory === 'today') {
        const todayStr = new Date().toISOString().split('T')[0]
        return b.date === todayStr
      }
      if (filterCategory === 'mcp') {
        return (b.content || b.description).toLowerCase().includes('mcp')
      }
      if (filterCategory === 'frontier') {
        return (b.content || b.description).toLowerCase().includes('frontier') || 
               (b.content || b.description).toLowerCase().includes('anthropic') ||
               (b.content || b.description).toLowerCase().includes('deepmind')
      }
      if (filterCategory === 'architecture') {
        return (b.content || b.description).toLowerCase().includes('mimari') || 
               (b.content || b.description).toLowerCase().includes('langgraph')
      }

      return true
    })
  }, [briefings, searchQuery, filterCategory])

  // Active section data helpers
  const rawSections = selectedBriefing?.parsed?.raw_sections || {}
  const telemetryRows = selectedBriefing?.parsed?.telemetry_rows || []
  const githubProjects = selectedBriefing?.parsed?.github_projects || []
  const checklistItems = selectedBriefing?.parsed?.checklist_items || []
  const metrics = selectedBriefing?.parsed?.metrics || {
    total_workers: 5,
    token_saving_pct: 99,
    architecture_nodes: 4,
    reading_time_min: 8
  }

  return (
    <div className={`flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#080b11] text-slate-900 dark:text-slate-100 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* ------------------------------------------------------------- */}
      {/* 1. ÜST KOKPİT & GÖZLEMEVİ BARI */}
      {/* ------------------------------------------------------------- */}
      <div className="px-6 py-3.5 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0e131f]/90 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
            <Compass className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0e131f]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Maestro 360-Scout AI İstihbarat Radarı
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Canlı Swarm
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contabo VPS, Mac Rezidansiyel Kazıyıcı ve Google NotebookLM RAG ile 24/7 senkronize teknoloji gözlemevi.
            </p>
          </div>
        </div>

        {/* Aksiyon Araçları */}
        <div className="flex items-center gap-2">
          {/* Yazı Boyutu Seçici */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-0.5 border border-slate-200/60 dark:border-white/10 text-xs font-semibold">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-1 rounded-lg transition-all ${fontSize === 'sm' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              title="Küçük Yazı"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-1 rounded-lg transition-all ${fontSize === 'base' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              title="Standart Yazı"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-1 rounded-lg transition-all ${fontSize === 'lg' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
              title="Büyük Yazı"
            >
              A+
            </button>
          </div>

          {/* Raporu Kopyala */}
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 transition-all"
            title="Markdown Metnini Panoya Kopyala"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Kopyalandı' : 'Kopyala'}</span>
          </button>

          {/* İndir Butonları */}
          <button
            onClick={() => handleDownload('html')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 transition-all"
            title="Kusursuz Formatlanmış HTML Raporu Olarak İndir"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">HTML İndir</span>
          </button>

          <button
            onClick={() => handleDownload('markdown')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 transition-all"
            title="Raw Markdown Olarak İndir"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">MD İndir</span>
          </button>

          {/* RAG Çekmecesi Aç/Kapa */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isDrawerOpen 
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' 
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-white/10'
            }`}
            title="NotebookLM Canlı Soru Çekmecesini Göster / Gizle"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">RAG Asistanı</span>
          </button>

          {/* Tam Ekran Modu */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
            title={isFullscreen ? "Tam Ekrandan Çık" : "Odaklanma / Tam Ekran Modu"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Yenile */}
          <button
            onClick={fetchBriefings}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Yenile</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. BENTO BENCHMARK & TELEMETRİ VİTRİNİ */}
      {/* ------------------------------------------------------------- */}
      <div className="px-6 py-3 border-b border-slate-200/60 dark:border-white/5 bg-slate-50/70 dark:bg-[#0c101a]/60 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#121623]/80 border border-slate-200/60 dark:border-white/5 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">5-Worker Swarm</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              90.71s <span className="text-[10px] font-bold text-emerald-500">Quorum 5/5</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#121623]/80 border border-slate-200/60 dark:border-white/5 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Token Tasarrufu</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              %99 İndirim <span className="text-[10px] font-bold text-indigo-500">AST MCP</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#121623]/80 border border-slate-200/60 dark:border-white/5 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Frontier Modeller</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              Mythos & Omni <span className="text-[10px] font-bold text-purple-500">Dual-Tier</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#121623]/80 border border-slate-200/60 dark:border-white/5 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Hafıza Hiyerarşisi</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              Karpathy 4-Tier <span className="text-[10px] font-bold text-amber-500">LangGraph</span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. ANA ALAN: SOL LİSTE + ORTA OKUYUCU + SAĞ/ALT RAG ÇEKMECESİ */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* SOL KOLON: TARİH & BRİFİNG LİSTESİ */}
        <div className="w-80 lg:w-96 border-r border-slate-200/80 dark:border-white/10 flex flex-col bg-white/60 dark:bg-[#0c101a]/50 shrink-0">
          {/* Arama Kutusu */}
          <div className="p-3 border-b border-slate-200/80 dark:border-white/10 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Raporlarda veya projelerde ara..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Kategori Hapları */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-semibold scrollbar-none">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'today', label: 'Bugün' },
                { id: 'mcp', label: 'MCP' },
                { id: 'frontier', label: 'Frontier AI' },
                { id: 'architecture', label: 'Mimari' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                    filterCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rapor Kartları Listesi */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mb-2 text-indigo-500" />
                <span className="text-xs font-medium">İstihbarat havuzu taranıyor...</span>
              </div>
            ) : filteredBriefings.length === 0 ? (
              <div className="text-center py-16 px-4 text-slate-400">
                <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold text-slate-500">Kriterlere uygun istihbarat raporu bulunamadı.</p>
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
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500/50 shadow-md -translate-y-0.5'
                        : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/70 dark:border-white/5 hover:border-indigo-300 dark:hover:border-white/10 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {briefing.date ? format(parseISO(briefing.date), 'dd MMMM yyyy', { locale: tr }) : 'Bugün'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                        #{briefing.id}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">
                      {briefing.title}
                    </h3>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                      {briefing.description}
                    </p>

                    {/* Metadata Etiketleri */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1.5 border-t border-slate-100 dark:border-white/5">
                      <span>{briefing.parsed?.reading_time_min || 8} dk okuma</span>
                      <span className="font-semibold text-indigo-500 dark:text-indigo-400 flex items-center gap-0.5">
                        İncele <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ORTA OKUMA & GÖZLEMEVİ ALANI */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#fbfcfd] dark:bg-[#090c13]">
          {selectedBriefing ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Perspektif & Sekme Seçici Bar */}
              <div className="px-6 py-2 border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0e1320]/70 backdrop-blur-md flex items-center justify-between gap-2 overflow-x-auto shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  {[
                    { id: 'all', label: '📑 Tam Rapor', desc: 'Bütün Bölümler' },
                    { id: 'summary', label: '⚡ 60s Özeti', desc: 'Yönetici Özeti' },
                    { id: 'github', label: '🚀 GitHub & MCP', desc: 'SOTA Projeler' },
                    { id: 'frontier', label: '🔬 Frontier AI', desc: 'Modeller & Lablar' },
                    { id: 'architecture', label: '🏗️ Mimari & FSM', desc: 'Şemalar & CQRS' },
                    { id: 'checklist', label: '🎯 Aksiyonlar', desc: 'Yapılacaklar' },
                    { id: 'telemetry', label: '📊 Telemetri', desc: 'Worker Süreleri' },
                    { id: 'raw', label: '📄 Ham / HTML', desc: 'Kaynak Kodu' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabMode)}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                        activeTab === tab.id
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                          : 'bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-medium text-slate-400 hidden xl:flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{selectedBriefing.parsed?.word_count || 2250} Kelime</span>
                  <span>•</span>
                  <span>{selectedBriefing.parsed?.reading_time_min || 8} Dakika Okuma</span>
                </div>
              </div>

              {/* Sekme İçerik Alanı */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-5xl mx-auto space-y-6">

                  {/* -------------------------------------------------- */}
                  {/* SEKME 1: TÜM RAPOR (FULL MAGAZINE OBSERVATORY) */}
                  {/* -------------------------------------------------- */}
                  {activeTab === 'all' && (
                    <div className="bg-white dark:bg-[#111522] rounded-3xl p-6 md:p-10 border border-slate-200/80 dark:border-white/10 shadow-xl space-y-6">
                      <div className="border-b border-slate-200 dark:border-white/10 pb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              Dahili Stratejik İstihbarat
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">
                              Döngü #{selectedBriefing.id * 4}
                            </span>
                          </div>
                          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {selectedBriefing.title}
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Hazırlayan: Baş İstihbarat ve Strateji Direktörü (Maestro 360 Swarm) • {selectedBriefing.date}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload('html')}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            İndir
                          </button>
                        </div>
                      </div>

                      {/* Zengin Markdown İçeriği */}
                      <RichMarkdownViewer
                        content={selectedBriefing.content || selectedBriefing.description}
                        fontSize={fontSize}
                      />
                    </div>
                  )}

                  {/* -------------------------------------------------- */}
                  {/* SEKME 2: 60 SANİYELİK YÖNETİCİ ÖZETİ */}
                  {/* -------------------------------------------------- */}
                  {activeTab === 'summary' && (
                    <div className="space-y-4">
                      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-[#121623] to-[#0c0f18] border border-indigo-500/30 shadow-xl">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-2">
                          <Zap className="w-4 h-4" />
                          60 Saniyelik Stratejik Yönetici Özeti
                        </div>
                        <h3 className="text-xl font-black text-white mb-4">
                          Günün 3 Kritik Teknolojik Kırılma Noktası
                        </h3>
                        <div className="prose dark:prose-invert max-w-none text-slate-200">
                          {rawSections["⚡ 60 Saniyelik Yönetici Özeti (Günün 3 Kritik Olayı)"] ? (
                            <RichMarkdownViewer
                              content={rawSections["⚡ 60 Saniyelik Yönetici Özeti (Günün 3 Kritik Olayı)"]}
                              fontSize={fontSize}
                            />
                          ) : (
                            <p className="text-slate-400">{selectedBriefing.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* -------------------------------------------------- */}
                  {/* SEKME 3: GITHUB & SOTA MCP PROJELERİ */}
                  {/* -------------------------------------------------- */}
                  {activeTab === 'github' && (
                    <div className="space-y-4">
                      <div className="p-6 rounded-3xl bg-white dark:bg-[#111522] border border-slate-200/80 dark:border-white/10 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                          <Code2 className="w-5 h-5 text-indigo-500" />
                          Radarımıza Giren En Sıcak GitHub & MCP Projeleri
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                          Milisaniye altı AST traversalı, embodied tooling ve sıfır şişkinlik (zero-bloat) mimarileri.
                        </p>

                        {rawSections["🚀 Radarımıza Giren En Sıcak GitHub & MCP Projeleri (Teknik Detaylar ve Linkler)"] ? (
                          <RichMarkdownViewer
                            content={rawSections["🚀 Radarımıza Giren En Sıcak GitHub & MCP Projeleri (Teknik Detaylar ve Linkler)"]}
                            fontSize={fontSize}
                          />
                        ) : (
                          <p className="text-slate-400 text-xs">Bu bölüm için detay bulunamadı.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* -------------------------------------------------- */}
                  {/* SEKME 4: FRONTIER LABS & MODEL ARAŞTIRMALARI */}
                  {/* -------------------------------------------------- */}
                  {activeTab === 'frontier' && (
                    <div className="space-y-4">
                      <div className="p-6 rounded-3xl bg-white dark:bg-[#111522] border border-slate-200/80 dark:border-white/10 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                          <Cpu className="w-5 h-5 text-purple-500" />
                          Frontier AI Bültenleri (DeepMind, Anthropic, OpenAI)
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                          Test-time compute, native omni-modalite ve provider pinning dinamikleri.
                        </p>

                        {rawSections["🔬 Frontier AI & Araştırma Bültenleri (DeepMind, Anthropic, OpenAI)"] ? (
                          <RichMarkdownViewer
                            content={rawSections["🔬 Frontier AI & Araştırma Bültenleri (DeepMind, Anthropic, OpenAI)"]}
                            fontSize={fontSize}
                          />
                        ) : (
                          <p className="text-slate-400 text-xs">Frontier laboratuvar verisi bulunamadı.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* -------------------------------------------------- */}
                  {/* SEKME 5: ÜRETİM MİMARİSİ & TOPOLOJİ */}
                  {/* -------------------------------------------------- */}
                  {activeTab === 'architecture' && (
                    <div className="space-y-4">
                      <div className="p-6 rounded-3xl bg-white dark:bg-[#111522] border border-slate-200/80 dark:border-white/10 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                          <Layers className="w-5 h-5 text-sky-500" />
                          Üretim Mimarisi ve Dayanıklı Ajan Tasarımı
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                          LangGraph PostgreSQL State Checkpoints, CQRS+SSE Event Bus ve vLLM/LiteLLM hibrit çıkarsama.
                        </p>

                        {rawSections["🏗️ Üretim Mimarisi ve Ajan Tasarımı İçin Kritik Dersler"] ? (
                          <RichMarkdownViewer
                            content={rawSections["🏗️ Üretim Mimarisi ve Ajan Tasarımı İçin Kritik Dersler"]}
                            fontSize={fontSize}
                          />
                        ) : (
                          <p className="text-slate-400 text-xs">Mimari analizi bulunamadı.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* -------------------------------------------------- */}
                  {/* SEKME 6: SOMUT AKSİYON LİSTESİ */}
                  {/* -------------------------------------------------- */}
                  {activeTab === 'checklist' && (
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#111522] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-emerald-500" />
                            Maestro 360 Somut Aksiyon Kontrol Listesi
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Sistem kararlılığı, token ekonomisi ve güvenlik için kademeli aksiyon planı.
                          </p>
                        </div>
                      </div>

                      {rawSections["🎯 Maestro 360 İçin Bugünkü Somut Aksiyon Listesi (Checklist)"] ? (
                        <RichMarkdownViewer
                          content={rawSections["🎯 Maestro 360 İçin Bugünkü Somut Aksiyon Listesi (Checklist)"]}
                          fontSize={fontSize}
                        />
                      ) : (
                        <p className="text-slate-400 text-xs">Kontrol listesi bulunamadı.</p>
                      )}
                    </div>
                  )}

                  {/* -------------------------------------------------- */}
                  {/* SEKME 7: TELEMETRİ & BENCHMARK */}
                  {/* -------------------------------------------------- */}
                  {activeTab === 'telemetry' && (
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#111522] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        Çoklu-Ajan Orkestrasyon & Dinamik Kota Rotasyon Telemetrisi
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Contabo VPS üzerinde yürütülen paralel Depth-1 worker süreleri ve Google hesabı rotasyon telemetrisi.
                      </p>

                      {rawSections["📊 Çoklu-Ajan Orkestrasyon & Kota Rotasyon Telemetrisi"] ? (
                        <RichMarkdownViewer
                          content={rawSections["📊 Çoklu-Ajan Orkestrasyon & Kota Rotasyon Telemetrisi"]}
                          fontSize={fontSize}
                        />
                      ) : (
                        <p className="text-slate-400 text-xs">Telemetri verisi bulunamadı.</p>
                      )}
                    </div>
                  )}

                  {/* -------------------------------------------------- */}
                  {/* SEKME 8: HAM MARKDOWN / HTML ÖNİZLEME */}
                  {/* -------------------------------------------------- */}
                  {activeTab === 'raw' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-indigo-500" />
                          Kaynak Kodu & Ham İçerik
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCopyReport}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {isCopied ? 'Kopyalandı' : 'Tümünü Kopyala'}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-950 p-4 overflow-x-auto shadow-inner">
                        <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed">
                          {selectedBriefing.content || selectedBriefing.description}
                        </pre>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <BookOpen className="w-12 h-12 mb-3 opacity-30 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
                İstihbarat Gözlemevi Hazır
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Sol panelden dilediğiniz bir tarihli raporu seçerek zengin bölümleri, mimari şemaları ve telemetriyi inceleyebilirsiniz.
              </p>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SAĞ ÇEKMECE: NOTEBOOKLM ZERO-TOKEN RAG CANLI SORU ALANI */}
        {/* ------------------------------------------------------------- */}
        {isDrawerOpen && (
          <div className="w-80 lg:w-96 border-l border-slate-200/80 dark:border-white/10 flex flex-col bg-white/70 dark:bg-[#0d111d]/70 backdrop-blur-xl shrink-0">
            <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>NotebookLM RAG Havuzu</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Zero-Token
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Google DeepMind yayınları, SOTA MCP kütüphaneleri ve mimari standartlar arasında anında akıllı semantik arama yapın.
              </p>

              {/* Hızlı Öneri Soruları */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Örnek Sorular:
                </span>
                {[
                  "DeusData MCP %99 token tasarrufunu nasıl sağlıyor?",
                  "Karpathy 4-katman bellek hiyerarşisi nedir?",
                  "Provider Pinning neden kritik ve nasıl yapılır?",
                  "LangGraph FSM ve Time-Travel ne kazandırır?"
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => {
                      setQuestion(preset)
                      handleAskNotebookLM(preset)
                    }}
                    className="w-full text-left p-2 rounded-xl text-[11px] bg-slate-100/70 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 border border-transparent hover:border-indigo-300 dark:hover:border-indigo-800/50 transition-all flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span className="line-clamp-1">{preset}</span>
                  </button>
                ))}
              </div>

              {/* Chat Yanıtı */}
              {chatAnswer && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 text-xs text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>İstihbarat Yanıtı:</span>
                  </div>
                  <div className="whitespace-pre-line text-[11px] leading-relaxed">
                    {chatAnswer}
                  </div>
                </div>
              )}
            </div>

            {/* Soru Giriş Formu */}
            <div className="p-3 border-t border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAskNotebookLM()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Rapora veya arşive soru sor..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 focus:border-indigo-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={isAsking || !question.trim()}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all"
                  title="Soruyu Gönder"
                >
                  {isAsking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
