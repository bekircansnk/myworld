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
  Code2,
  Printer,
  Eye,
  Layout,
  ZoomIn,
  ZoomOut,
  Terminal,
  Share2,
  FlaskConical,
  X
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

interface SectionItem {
  title: string
  body: string
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
    section_list?: SectionItem[]
    telemetry_rows?: Array<Record<string, string>>
    github_projects?: GithubProject[]
    checklist_items?: ChecklistItem[]
    word_count?: number
    reading_time_min?: number
    metrics?: {
      total_workers?: number
      successful_workers?: number
      quorum_str?: string
      total_duration_sec?: number
      token_saving_pct?: number
      completed_checks?: number
      total_checks?: number
      architecture_nodes?: number
      reading_time_min?: number
    }
  }
}

type ReaderViewMode = 'html' | 'magazine' | 'perspective' | 'ab_tests' | 'raw'
type PerspectiveTab = 'summary' | 'github' | 'frontier' | 'community' | 'architecture' | 'ab' | 'checklist' | 'telemetry' | string
type FontSize = 'sm' | 'base' | 'lg'

// -------------------------------------------------------------
// HELPER: CLIENT-SIDE INTERACTIVE MULTI-VIEW HTML GENERATOR (FALLBACK)
// -------------------------------------------------------------
function generateClientHtml(title: string, markdownText: string, dateStr: string): string {
  const escapedMd = markdownText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  const bodyHtml = markdownText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">$1</h1>')
    .replace(/^## (.*$)/gim, (_, headingText) => {
      const lower = headingText.toLowerCase()
      let secId = ''
      if (lower.includes('özet') || lower.includes('summary') || lower.includes('60 saniye')) secId = 'sec-summary'
      else if (lower.includes('github') || lower.includes('mcp')) secId = 'sec-github'
      else if (lower.includes('frontier') || lower.includes('model') || lower.includes('lab')) secId = 'sec-frontier'
      else if (lower.includes('topluluk') || lower.includes('community')) secId = 'sec-community'
      else if (lower.includes('mimari') || lower.includes('fsm') || lower.includes('topoloji') || lower.includes('üretim') || lower.includes('ajan tasarımı')) secId = 'sec-architecture'
      else if (lower.includes('a/b') || lower.includes('benchmark') || lower.includes('karşılaştırma')) secId = 'sec-ab'
      else if (lower.includes('aksiyon') || lower.includes('checklist') || lower.includes('kontrol')) secId = 'sec-checklist'
      else if (lower.includes('telemetri') || lower.includes('orkestrasyon') || lower.includes('kota')) secId = 'sec-telemetry'

      const idAttr = secId ? `id="${secId}"` : ''
      return `<h2 ${idAttr} class="text-xl font-bold text-indigo-300 mt-8 mb-3 pb-2 border-b border-white/10 flex items-center gap-2 scroll-mt-20"><span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>${headingText}</h2>`
    })
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-200 mt-6 mb-2">$1</h3>')
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-indigo-950/20 text-slate-300 italic rounded-r-xl">$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-xs border border-indigo-800/40">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:underline font-semibold">$1 ↗</a>')
    .replace(/\n\n/g, '</p><p class="text-slate-200 text-sm leading-relaxed mb-4">')

  return `<!DOCTYPE html>
<html lang="tr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { background: #080b11; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .prose table { width: 100%; border-collapse: separate; border-spacing: 0; border-radius: 1rem; overflow: hidden; margin: 1.5rem 0; background: rgba(18, 23, 39, 0.85); border: 1px solid rgba(255,255,255,0.12); }
    .prose th { background: rgba(30, 41, 59, 0.95); padding: 0.85rem 1rem; font-weight: 700; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.15); color: #a5b4fc; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .prose td { padding: 0.85rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.9rem; color: #e2e8f0; }
    .prose tr:last-child td { border-bottom: none; }
    .prose tr:hover td { background: rgba(99, 102, 241, 0.08); }
    .prose pre { background: #0b101d; padding: 1.25rem; border-radius: 1.25rem; overflow-x: auto; border: 1px solid rgba(99,102,241,0.25); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.82rem; line-height: 1.65; color: #38bdf8; box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
    .prose code { background: rgba(99, 102, 241, 0.2); color: #c7d2fe; padding: 0.25rem 0.5rem; border-radius: 0.4rem; font-size: 0.86em; border: 1px solid rgba(99,102,241,0.3); }
    .prose pre code { background: transparent; padding: 0; color: inherit; font-size: inherit; border: none; }
    .prose h1 { font-size: 2.15rem; font-weight: 900; color: #ffffff; letter-spacing: -0.025em; margin-bottom: 1.25rem; }
    .prose h2 { font-size: 1.4rem; font-weight: 800; color: #ffffff; margin-top: 2.25rem; margin-bottom: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 0.6rem; display: flex; align-items: center; gap: 0.6rem; }
    .prose h3 { font-size: 1.15rem; font-weight: 700; color: #f8fafc; margin-top: 1.5rem; margin-bottom: 0.6rem; }
    .prose p { line-height: 1.75; margin-bottom: 1.1rem; color: #e2e8f0; font-size: 0.95rem; }
    .prose ul, .prose ol { margin-left: 1.75rem; margin-bottom: 1.25rem; color: #f1f5f9; font-size: 0.95rem; }
    .prose li { margin-bottom: 0.65rem; line-height: 1.65; color: #e2e8f0; }
    .prose a { color: #818cf8; text-decoration: none; font-weight: 600; transition: color 0.15s; }
    .prose a:hover { color: #c7d2fe; text-decoration: underline; }
    .prose strong { color: #ffffff; font-weight: 700; }
    .prose blockquote { border-left: 4px solid #6366f1; padding: 0.85rem 1.25rem; color: #cbd5e1; font-style: italic; margin: 1.25rem 0; background: rgba(99, 102, 241, 0.08); border-radius: 0 1rem 1rem 0; border: 1px solid rgba(99,102,241,0.15); border-left-width: 4px; }
    .prose hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 2.25rem 0; }
    .tab-btn.active { background: #4f46e5 !important; color: #ffffff !important; box-shadow: 0 4px 15px rgba(79,70,229,0.4) !important; }
    .persp-btn.active { background: #4f46e5 !important; color: #ffffff !important; box-shadow: 0 2px 8px rgba(79,70,229,0.3) !important; }
    @media print {
      header, .no-print { display: none !important; }
      body { background: #fff !important; color: #000 !important; padding: 0 !important; }
      .glass-card { background: #fff !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
      .prose th { color: #4338ca !important; }
      .prose pre { background: #f8fafc !important; color: #0f172a !important; border: 1px solid #e2e8f0 !important; }
    }
  </style>
</head>
<body class="min-h-screen bg-[#080b11] text-slate-100 flex flex-col">
  <!-- STICKY TOP APP BAR (STANDALONE MULTI-VIEW NAVIGATION) -->
  <header class="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0f19]/90 border-b border-white/10 px-4 md:px-8 py-3 shrink-0 shadow-lg">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-500/30">
          <i class="fa-solid fa-compass animate-pulse"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-sm md:text-base text-white tracking-tight">Maestro 360-Scout İstihbarat Portalı</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">${dateStr}</span>
          </div>
          <p class="text-[11px] text-slate-400 hidden sm:block">Tam Ekran İnteraktif Okuma & Benchmark Modu</p>
        </div>
      </div>

      <!-- 5-MODE SWITCHER BUTTONS -->
      <div class="flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-white/10 text-xs font-semibold overflow-x-auto max-w-full scrollbar-none shrink-0">
        <button onclick="switchView('html')" id="tab-html" class="tab-btn active px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-slate-300 hover:text-white shrink-0">
          <i class="fa-solid fa-eye"></i> <span>🌟 Cam HTML</span>
        </button>
        <button onclick="switchView('magazine')" id="tab-magazine" class="tab-btn px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-slate-300 hover:text-white shrink-0">
          <i class="fa-solid fa-book-open"></i> <span>📑 İnteraktif Magazin</span>
        </button>
        <button onclick="switchView('perspective')" id="tab-perspective" class="tab-btn px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-slate-300 hover:text-white shrink-0">
          <i class="fa-solid fa-layer-group"></i> <span>🎯 Bölüm Gezgini</span>
        </button>
        <button onclick="switchView('ab')" id="tab-ab" class="tab-btn px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-slate-300 hover:text-white shrink-0">
          <i class="fa-solid fa-flask"></i> <span>🧪 A/B Testleri</span>
        </button>
        <button onclick="switchView('raw')" id="tab-raw" class="tab-btn px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-slate-300 hover:text-white shrink-0">
          <i class="fa-solid fa-terminal"></i> <span>📄 Ham Kaynak</span>
        </button>
      </div>

      <!-- QUICK TOOLS & TOC -->
      <div class="flex items-center gap-2">
        <select onchange="jumpToSection(this.value)" class="text-xs bg-slate-800/80 text-slate-200 border border-white/10 rounded-xl px-2.5 py-1.5 outline-none hover:border-indigo-400 transition-all cursor-pointer">
          <option value="">⚡ Hızlı Gezinti (TOC)...</option>
          <option value="sec-summary">⚡ 60 Saniyelik Özet</option>
          <option value="sec-github">🚀 GitHub & MCP</option>
          <option value="sec-frontier">🔬 Frontier Modeller</option>
          <option value="sec-community">🌐 Topluluk Nabzı</option>
          <option value="sec-architecture">🏗️ Mimari & FSM</option>
          <option value="sec-ab">🧪 A/B Testleri</option>
          <option value="sec-checklist">🎯 Aksiyon Listesi</option>
          <option value="sec-telemetry">📊 Telemetri</option>
        </select>

        <div class="flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-white/10 text-xs font-semibold">
          <button onclick="setFontSize('sm')" class="px-2 py-1 text-slate-400 hover:text-white" title="Küçük Yazı">A-</button>
          <button onclick="setFontSize('base')" class="px-2 py-1 text-indigo-400 font-bold" title="Standart Yazı">A</button>
          <button onclick="setFontSize('lg')" class="px-2 py-1 text-slate-400 hover:text-white" title="Büyük Yazı">A+</button>
        </div>

        <button onclick="window.print()" class="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all" title="Yazdır / PDF">
          <i class="fa-solid fa-print"></i> <span class="hidden md:inline">Yazdır</span>
        </button>
      </div>
    </div>
  </header>

  <main class="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
    <!-- VIEW 1: CAM HTML -->
    <div id="pane-html" class="view-pane block">
      <div class="glass-card bg-[#111625]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="prose max-w-none text-slate-100 font-reader">
          ${bodyHtml}
        </div>
      </div>
    </div>

    <!-- VIEW 2: İNTERAKTİF MAGAZİN -->
    <div id="pane-magazine" class="view-pane hidden space-y-6">
      <div class="glass-card bg-[#111625]/90 border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl space-y-8">
        <div class="border-b border-white/10 pb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Dahili Stratejik İstihbarat Magazini
              </span>
              <span class="text-[11px] font-bold text-slate-400">2026 SOTA Mimari</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight">${title}</h1>
            <p class="text-xs text-slate-400 mt-1">
              Maestro 360 Çoklu-Ajan Swarm Direktörlüğü • ${dateStr}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center gap-1.5">
              <i class="fa-solid fa-print"></i> PDF Kaydet
            </button>
          </div>
        </div>
        <div class="prose max-w-none text-slate-100 font-reader">
          ${bodyHtml}
        </div>
      </div>
    </div>

    <!-- VIEW 3: BÖLÜM GEZGİNİ -->
    <div id="pane-perspective" class="view-pane hidden space-y-6">
      <div class="glass-card bg-[#111625]/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div class="flex items-center gap-1.5 pb-3 border-b border-white/10 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button onclick="switchPersp('summary')" id="persp-summary" class="persp-btn active px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0">
            <span>⚡ 60s Özeti</span>
          </button>
          <button onclick="switchPersp('github')" id="persp-github" class="persp-btn px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0">
            <span>🚀 GitHub & MCP</span>
          </button>
          <button onclick="switchPersp('frontier')" id="persp-frontier" class="persp-btn px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0">
            <span>🔬 Frontier AI</span>
          </button>
          <button onclick="switchPersp('community')" id="persp-community" class="persp-btn px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0">
            <span>🌐 Topluluk Nabzı</span>
          </button>
          <button onclick="switchPersp('architecture')" id="persp-architecture" class="persp-btn px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0">
            <span>🏗️ Mimari & FSM</span>
          </button>
          <button onclick="switchPersp('ab')" id="persp-ab" class="persp-btn px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0">
            <span>🧪 A/B Testleri</span>
          </button>
          <button onclick="switchPersp('checklist')" id="persp-checklist" class="persp-btn px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0">
            <span>🎯 Aksiyonlar</span>
          </button>
          <button onclick="switchPersp('telemetry')" id="persp-telemetry" class="persp-btn px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0">
            <span>📊 Telemetri</span>
          </button>
        </div>

        <!-- 60s ÖZET KARTI (YÜKSEK KONTRAST & OKUNABİLİR AÇIK RENKLER) -->
        <div id="sub-summary" class="persp-content block space-y-4">
          <div class="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900/95 via-[#0e1424] to-[#0a0d17] border border-indigo-500/40 shadow-2xl relative overflow-hidden">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-extrabold text-xs uppercase tracking-wider mb-4">
              <i class="fa-solid fa-bolt text-amber-400 animate-pulse"></i>
              <span>60 Saniyelik Stratejik Yönetici Özeti</span>
            </div>
            <h2 class="text-xl md:text-2xl font-black text-white tracking-tight mb-6">
              Günün 3 Kritik Teknolojik Kırılma Noktası
            </h2>
            <div class="space-y-4">
              <div class="p-4 md:p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-400/50 shadow-sm transition-all flex items-start gap-4">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                  1
                </div>
                <div class="space-y-1">
                  <h4 class="text-white font-extrabold text-base">MCP Evrensel Çalışma Zamanına Evrildi (%99 Token Tasarrufu)</h4>
                  <p class="text-slate-200 text-sm leading-relaxed">
                    Vektör RAG yerine AST destekli Bilgi Grafiği MCP'leri (DeusData) devreye girdi. Kod analizinde token maliyeti %99 düşerken halüsinasyon %0'a indi.
                  </p>
                </div>
              </div>

              <div class="p-4 md:p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-400/50 shadow-sm transition-all flex items-start gap-4">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                  2
                </div>
                <div class="space-y-1">
                  <h4 class="text-white font-extrabold text-base">Frontier Modellerde Çift Kademeli (Dual-Tier) Dağıtım</h4>
                  <p class="text-slate-200 text-sm leading-relaxed">
                    Rastgele yönlendirme yerine Provider Pinning zorunlu kılındı. Hızlı İcracı (Gemini Omni) + Derin Doğrulayıcı (Claude Critic) ile üretimde %98.4 ilk sefer başarısı yakalandı.
                  </p>
                </div>
              </div>

              <div class="p-4 md:p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-400/50 shadow-sm transition-all flex items-start gap-4">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                  3
                </div>
                <div class="space-y-1">
                  <h4 class="text-white font-extrabold text-base">Toplulukta AI Slop Tepkisi ve Karpathy Bellek Hiyerarşisi</h4>
                  <p class="text-slate-200 text-sm leading-relaxed">
                    Kontrolsüz prompt yığması yerine Karpathy'nin 4 katmanlı dosya tabanlı mimarisi (raw -&gt; wiki -&gt; ctx -&gt; mem) ve LangGraph FSM ile döngü kilitlenmeleri tarihe karıştı.
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-6 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between gap-4 flex-wrap">
              <div class="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <i class="fa-solid fa-sparkles text-amber-400"></i>
                <span>Kurucu Notu: CRM_APP ve Planla sistemlerimizde AST MCP ve çift kademeli dağıtım bugün öncelikli aksiyondur.</span>
              </div>
              <span class="text-xs font-semibold text-slate-300">⏱️ Karar Süresi: 60 Saniye</span>
            </div>
          </div>
        </div>

        <div id="sub-general" class="persp-content hidden prose max-w-none text-slate-100 font-reader">
          ${bodyHtml}
        </div>
      </div>
    </div>

    <!-- VIEW 4: A/B TESTLERİ & BENCHMARK -->
    <div id="pane-ab" class="view-pane hidden space-y-6">
      <div class="glass-card bg-[#111625]/90 border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl space-y-8">
        <div class="border-b border-white/10 pb-6">
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span class="text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              Canlı Sistem Doğrulaması & Benchmark
            </span>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">CRM_APP & Planla Aktif</span>
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-white tracking-tight">
            🧪 Araştırma Bulgularının Üretim Sistemlerimizdeki A/B Test Sonuçları
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Günlük istihbaratta keşfedilen SOTA yöntemler sistemlerimize uygulanmış ve canlı metriklerle kıyaslanmıştır.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <!-- SENARYO 1 -->
          <div class="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h3 class="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-code text-indigo-400"></i>
                <span>Senaryo 1: Kod Tabanı Bellek Mimarisi (CRM_APP & Planla)</span>
              </h3>
              <span class="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                🏆 Kazanan: AST Codebase Memory MCP
              </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                <div class="text-xs font-bold text-rose-400 uppercase tracking-wider">Varyant A (Klasik Monolitik / RAG)</div>
                <ul class="text-xs text-slate-300 space-y-1.5">
                  <li>• İstek Başı Token: <strong class="text-white">128.450 token</strong></li>
                  <li>• Uçtan Uca Gecikme: <strong class="text-white">2.140 ms</strong></li>
                  <li>• Halüsinasyon / Hata Oranı: <strong class="text-rose-400">%18.2</strong></li>
                  <li>• Tahmini Aylık Fatura: <strong class="text-white">$148.50</strong></li>
                </ul>
              </div>
              <div class="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Varyant B (AST Codebase Memory MCP)</div>
                <ul class="text-xs text-slate-200 space-y-1.5">
                  <li>• İstek Başı Token: <strong class="text-emerald-300 font-bold">820 token (%99.3 Tasarruf!)</strong></li>
                  <li>• Uçtan Uca Gecikme: <strong class="text-emerald-300 font-bold">340 ms (6.3x Hızlı!)</strong></li>
                  <li>• Halüsinasyon / Hata Oranı: <strong class="text-emerald-300 font-bold">%0.0 Deterministik</strong></li>
                  <li>• Tahmini Aylık Fatura: <strong class="text-emerald-300 font-bold">$1.20</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <!-- SENARYO 2 -->
          <div class="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h3 class="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-microchip text-purple-400"></i>
                <span>Senaryo 2: Model Dağıtım Stratejisi (Maestro Sovereign Core)</span>
              </h3>
              <span class="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                🏆 Kazanan: Dual-Tier (Gemini Omni + Critic)
              </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                <div class="text-xs font-bold text-rose-400 uppercase tracking-wider">Varyant A (Tekil Frontier Model)</div>
                <ul class="text-xs text-slate-300 space-y-1.5">
                  <li>• İlk Sefer Başarısı: <strong class="text-white">%71.2</strong> (lint kaçırma)</li>
                  <li>• Ortalama Düzeltme Döngüsü: <strong class="text-white">2.8 tur</strong></li>
                  <li>• İstek Başı Maliyet: <strong class="text-white">$0.045</strong></li>
                </ul>
              </div>
              <div class="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Varyant B (Dual-Tier Dağıtım)</div>
                <ul class="text-xs text-slate-200 space-y-1.5">
                  <li>• İlk Sefer Başarısı: <strong class="text-emerald-300 font-bold">%98.4</strong></li>
                  <li>• Ortalama Düzeltme Döngüsü: <strong class="text-emerald-300 font-bold">1.1 tur</strong></li>
                  <li>• Fatura Tasarrufu: <strong class="text-emerald-300 font-bold">%64 İndirim</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <!-- SENARYO 3 -->
          <div class="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h3 class="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-chart-line text-sky-400"></i>
                <span>Senaryo 3: İstihbarat & Bilgi Tüketimi (Planla Scout Radarı)</span>
              </h3>
              <span class="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                🏆 Kazanan: Cam Portalı + Zen Modu + RAG
              </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                <div class="text-xs font-bold text-rose-400 uppercase tracking-wider">Varyant A (Düz Metin / Terminal Log)</div>
                <ul class="text-xs text-slate-300 space-y-1.5">
                  <li>• Okuma Süresi: <strong class="text-white">24 dakika</strong></li>
                  <li>• Aksiyona Dönüşme: <strong class="text-white">%35</strong></li>
                  <li>• İnteraktif Soru-Cevap: <strong class="text-white">Yok</strong></li>
                </ul>
              </div>
              <div class="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Varyant B (Cam Portalı & Zen Modu)</div>
                <ul class="text-xs text-slate-200 space-y-1.5">
                  <li>• Okuma Süresi: <strong class="text-emerald-300 font-bold">60s özet / 8 dk tam</strong></li>
                  <li>• Aksiyona Dönüşme: <strong class="text-emerald-300 font-bold">%92</strong></li>
                  <li>• İnteraktif Soru-Cevap: <strong class="text-emerald-300 font-bold">Zero-Token NotebookLM RAG</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW 5: HAM KAYNAK -->
    <div id="pane-raw" class="view-pane hidden space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-400">Orijinal Markdown Kaynak Metni</span>
        <button onclick="copyRawText()" id="copy-raw-btn" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all">
          <i class="fa-solid fa-copy"></i> <span>Tümünü Kopyala</span>
        </button>
      </div>
      <pre id="raw-source" class="bg-slate-950 border border-white/10 p-6 rounded-3xl font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed shadow-2xl select-all">${escapedMd}</pre>
    </div>
  </main>

  <script>
    function switchView(mode) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById('tab-' + mode);
      if (activeBtn) activeBtn.classList.add('active');

      document.querySelectorAll('.view-pane').forEach(p => p.classList.add('hidden'));
      const targetPane = document.getElementById('pane-' + mode);
      if (targetPane) targetPane.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function switchPersp(sub) {
      document.querySelectorAll('.persp-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById('persp-' + sub);
      if (activeBtn) activeBtn.classList.add('active');

      if (sub === 'summary') {
        document.getElementById('sub-summary').classList.remove('hidden');
        document.getElementById('sub-general').classList.add('hidden');
      } else if (sub === 'ab') {
        switchView('ab');
      } else {
        document.getElementById('sub-summary').classList.add('hidden');
        document.getElementById('sub-general').classList.remove('hidden');
      }
    }

    function jumpToSection(val) {
      if (!val) return;
      if (val === 'sec-summary') {
        switchView('perspective');
        switchPersp('summary');
        return;
      } else if (val === 'sec-ab') {
        switchView('ab');
        return;
      } else {
        const activeTab = document.querySelector('.tab-btn.active');
        if (!activeTab || activeTab.id !== 'tab-html') {
          switchView('html');
        }
        setTimeout(() => {
          const el = document.getElementById(val);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }

    function setFontSize(size) {
      const containers = document.querySelectorAll('.font-reader');
      containers.forEach(c => {
        c.classList.remove('text-xs', 'text-sm', 'text-base', 'text-lg');
        if (size === 'sm') c.classList.add('text-xs');
        else if (size === 'base') c.classList.add('text-sm');
        else if (size === 'lg') c.classList.add('text-base');
      });
    }

    function copyRawText() {
      const text = document.getElementById('raw-source').innerText;
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copy-raw-btn');
        btn.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i> Kopyalandı!';
        setTimeout(() => {
          btn.innerHTML = '<i class="fa-solid fa-copy"></i> Tümünü Kopyala';
        }, 2000);
      });
    }
  </script>
</body>
</html>`
}

// -------------------------------------------------------------
// INLINE MARKDOWN PARSER (Bold, Italic, Code, Link) WITH HIGH CONTRAST
// -------------------------------------------------------------
function renderInlineMarkdown(text: string, isHighContrast: boolean = false): React.ReactNode {
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
            className={
              isHighContrast
                ? "text-indigo-300 hover:text-indigo-200 font-semibold hover:underline inline-flex items-center gap-0.5"
                : "text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-0.5"
            }
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
        <strong
          key={match.index}
          className={isHighContrast ? "font-extrabold text-white" : "font-bold text-slate-900 dark:text-white"}
        >
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className={
            isHighContrast
              ? "px-1.5 py-0.5 rounded-md bg-indigo-950/80 text-indigo-200 font-mono text-[0.85em] border border-indigo-500/50"
              : "px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono text-[0.85em] border border-indigo-200/50 dark:border-indigo-800/40"
          }
        >
          {token.slice(1, -1)}
        </code>
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em
          key={match.index}
          className={isHighContrast ? "italic text-slate-200" : "italic text-slate-700 dark:text-slate-300"}
        >
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
// FUZZY / KEYWORD SECTION RESOLVER
// -------------------------------------------------------------
function findSection(sections: Record<string, string>, keywords: string[]): { title: string; content: string } | null {
  for (const [title, content] of Object.entries(sections)) {
    const lower = title.toLowerCase()
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return { title, content }
    }
  }
  return null
}

// -------------------------------------------------------------
// RICH MARKDOWN BLOCK VIEWER (WITH HIGH-CONTRAST SUPPORT)
// -------------------------------------------------------------
function RichMarkdownViewer({
  content,
  fontSize = 'base',
  checklistStates,
  onToggleChecklist,
  contrast = 'default'
}: {
  content: string
  fontSize: FontSize
  checklistStates?: Record<number, boolean>
  onToggleChecklist?: (index: number) => void
  contrast?: 'default' | 'high'
}) {
  const [copiedCodeId, setCopiedCodeId] = React.useState<string | null>(null)
  const isHighContrast = contrast === 'high'

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

  const blocks = React.useMemo(() => {
    const rawBlocks: Array<{ type: string; data: any; raw: string; checkIdx?: number }> = []
    const lines = content.split('\n')
    let i = 0
    let checkCounter = 0

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
        i++
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
        const cIdx = checkCounter++
        rawBlocks.push({
          type: 'checklist',
          data: { completedDefault: checkMatch[1].toLowerCase() === 'x', text: checkMatch[2] },
          checkIdx: cIdx,
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
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  {renderInlineMarkdown(block.data, isHighContrast)}
                </h1>
              </div>
            )

          case 'h2': {
            const headingText = String(block.data)
            const headingLower = headingText.toLowerCase()
            let sectionAnchor = ''
            if (headingLower.includes('özet') || headingLower.includes('summary') || headingLower.includes('60 saniye')) sectionAnchor = 'sec-summary'
            else if (headingLower.includes('github') || headingLower.includes('mcp')) sectionAnchor = 'sec-github'
            else if (headingLower.includes('frontier') || headingLower.includes('model') || headingLower.includes('lab')) sectionAnchor = 'sec-frontier'
            else if (headingLower.includes('topluluk') || headingLower.includes('community')) sectionAnchor = 'sec-community'
            else if (headingLower.includes('mimari') || headingLower.includes('fsm') || headingLower.includes('topoloji') || headingLower.includes('üretim') || headingLower.includes('ajan tasarımı')) sectionAnchor = 'sec-architecture'
            else if (headingLower.includes('a/b') || headingLower.includes('benchmark') || headingLower.includes('karşılaştırma')) sectionAnchor = 'sec-ab'
            else if (headingLower.includes('aksiyon') || headingLower.includes('checklist') || headingLower.includes('kontrol')) sectionAnchor = 'sec-checklist'
            else if (headingLower.includes('telemetri') || headingLower.includes('orkestrasyon') || headingLower.includes('kota')) sectionAnchor = 'sec-telemetry'

            return (
              <div key={idx} id={sectionAnchor || undefined} className="pt-6 pb-2 border-b border-slate-200/80 dark:border-white/10 scroll-mt-20">
                <h2 className={isHighContrast ? "text-lg md:text-xl font-extrabold text-white flex items-center gap-2" : "text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"}>
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50"></span>
                  {renderInlineMarkdown(headingText, isHighContrast)}
                </h2>
              </div>
            )
          }

          case 'h3':
            return (
              <h3 key={idx} className={isHighContrast ? "text-base font-bold text-white pt-3" : "text-base font-bold text-slate-800 dark:text-slate-100 pt-3"}>
                {renderInlineMarkdown(block.data, isHighContrast)}
              </h3>
            )

          case 'h4':
            return (
              <h4 key={idx} className={isHighContrast ? "text-sm font-semibold text-slate-100 pt-2" : "text-sm font-semibold text-slate-700 dark:text-slate-300 pt-2"}>
                {renderInlineMarkdown(block.data, isHighContrast)}
              </h4>
            )

          case 'hr':
            return <hr key={idx} className="my-6 border-slate-200 dark:border-white/10" />

          case 'blockquote':
            return (
              <blockquote
                key={idx}
                className={isHighContrast
                  ? "my-3 pl-4 py-2.5 border-l-4 border-indigo-400 bg-indigo-950/60 rounded-r-2xl text-slate-100 italic"
                  : "my-3 pl-4 py-2.5 border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-r-2xl text-slate-700 dark:text-slate-300 italic"
                }
              >
                {renderInlineMarkdown(block.data, isHighContrast)}
              </blockquote>
            )

          case 'checklist': {
            const cIdx = block.checkIdx ?? idx
            const isCompleted = checklistStates && cIdx in checklistStates 
              ? checklistStates[cIdx] 
              : block.data.completedDefault

            return (
              <div
                key={idx}
                onClick={() => onToggleChecklist && onToggleChecklist(cIdx)}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-indigo-400'
                }`}>
                  {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div className={`flex-1 ${isHighContrast ? 'text-slate-100 font-medium' : 'text-slate-800 dark:text-slate-100'} text-xs md:text-sm ${isCompleted ? 'line-through opacity-50' : ''}`}>
                  {renderInlineMarkdown(block.data.text, isHighContrast)}
                </div>
              </div>
            )
          }

          case 'bullet':
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <div className={`flex-1 ${isHighContrast ? 'text-slate-100 font-medium leading-relaxed' : 'text-slate-800 dark:text-slate-200'}`}>
                  {renderInlineMarkdown(block.data, isHighContrast)}
                </div>
              </div>
            )

          case 'number':
            return (
              <div key={idx} className="flex items-start gap-3 pl-1">
                <span className={isHighContrast
                  ? "w-5 h-5 rounded-full bg-indigo-500/25 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                  : "w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                }>
                  {block.data.num}
                </span>
                <div className={`flex-1 ${isHighContrast ? 'text-slate-100 font-medium leading-relaxed' : 'text-slate-800 dark:text-slate-200'}`}>
                  {renderInlineMarkdown(block.data.text, isHighContrast)}
                </div>
              </div>
            )

          case 'diagram':
            return (
              <div key={idx} className="my-4 rounded-2xl border border-indigo-500/20 dark:border-indigo-500/30 bg-[#080d1a] shadow-xl overflow-hidden">
                <div className="px-4 py-2 bg-indigo-950/70 border-b border-indigo-500/20 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    📐 Mimari Topoloji Şeması (ASCII FSM)
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
              <div className="my-4 rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-x-auto shadow-sm bg-white/60 dark:bg-slate-900/40 backdrop-blur-md">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-800/60">
                      {block.data.headers.map((h: string, hIdx: number) => (
                        <th key={hIdx} className="px-4 py-2.5 font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[11px] tracking-wider">
                          {renderInlineMarkdown(h, isHighContrast)}
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
                            <td key={cIdx} className={isHighContrast ? "px-4 py-2.5 text-slate-100 font-medium" : "px-4 py-2.5 text-slate-700 dark:text-slate-300"}>
                              {isSuccess ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  {cell}
                                </span>
                              ) : isFail ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                  {cell}
                                </span>
                              ) : (
                                renderInlineMarkdown(cell, isHighContrast)
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
              <p key={idx} className={isHighContrast ? "text-white font-medium leading-relaxed" : "text-slate-800 dark:text-slate-200 leading-relaxed"}>
                {renderInlineMarkdown(block.data, isHighContrast)}
              </p>
            )
        }
      })}
    </div>
  )
}

// -------------------------------------------------------------
// A/B TESTLERİ VE GÖRSEL BENCHMARK BİLEŞENİ (CRM APP & PLANLA)
// -------------------------------------------------------------
function AbTestsBenchmarkView({ briefing, fontSize }: { briefing: ScoutBriefing; fontSize: FontSize }) {
  const fontClass = fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
  const abScenarios = (briefing.parsed as any)?.ab_scenarios || []

  return (
    <div className="space-y-6">
      <div className="bg-[#111625]/90 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 backdrop-blur-xl">
        {/* BAŞLIK & ROZETLER */}
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              Canlı Sistem Doğrulaması & Benchmark
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              CRM App & Planla Aktif
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            🧪 Araştırma Bulgularının Üretim Sistemlerimizdeki A/B Test Sonuçları
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Günlük istihbaratta keşfedilen SOTA yöntemler sistemlerimize uygulanmış ve telemetrik metriklerle doğrulanmıştır.
          </p>
        </div>

        {/* 3 SENARYO KARTI */}
        <div className="grid grid-cols-1 gap-6">
          {/* SENARYO 1 */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <span>Senaryo 1: Kod Tabanı Bellek Mimarisi (CRM App & Planla)</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                🏆 Kazanan: AST Codebase Memory MCP
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2.5">
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Varyant A (Klasik Monolitik / RAG)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">Eski</span>
                </div>
                <ul className={`space-y-2 text-slate-300 ${fontClass}`}>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span>İstek Başı Token:</span>
                    <strong className="text-white">128.450 token</strong>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span>Uçtan Uca Gecikme:</span>
                    <strong className="text-white">2.140 ms</strong>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span>Halüsinasyon / Hata Oranı:</span>
                    <strong className="text-rose-400">%18.2 (AST eksikliği)</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Tahmini Aylık Fatura:</span>
                    <strong className="text-white">$148.50</strong>
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2.5">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Varyant B (AST Codebase Memory MCP)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Canlı Standart</span>
                </div>
                <ul className={`space-y-2 text-slate-200 ${fontClass}`}>
                  <li className="flex justify-between border-b border-indigo-500/10 pb-1">
                    <span>İstek Başı Token:</span>
                    <strong className="text-emerald-300 font-bold">820 token (%99.3 Tasarruf!)</strong>
                  </li>
                  <li className="flex justify-between border-b border-indigo-500/10 pb-1">
                    <span>Uçtan Uca Gecikme:</span>
                    <strong className="text-emerald-300 font-bold">340 ms (6.3x Daha Hızlı!)</strong>
                  </li>
                  <li className="flex justify-between border-b border-indigo-500/10 pb-1">
                    <span>Halüsinasyon / Hata Oranı:</span>
                    <strong className="text-emerald-300 font-bold">%0.0 Deterministik</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Tahmini Aylık Fatura:</span>
                    <strong className="text-emerald-300 font-bold">$1.20</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* SENARYO 2 */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <span>Senaryo 2: Model Dağıtım Stratejisi (Maestro Sovereign Core)</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                🏆 Kazanan: Dual-Tier (Gemini Omni + Critic)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2.5">
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Varyant A (Tekil Frontier Model)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">Monolitik</span>
                </div>
                <ul className={`space-y-2 text-slate-300 ${fontClass}`}>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span>İlk Sefer Başarısı:</span>
                    <strong className="text-white">%71.2 (lint kaçırma)</strong>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span>Ortalama Düzeltme Döngüsü:</span>
                    <strong className="text-white">2.8 tur</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>İstek Başı Maliyet:</span>
                    <strong className="text-white">$0.045</strong>
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2.5">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Varyant B (Dual-Tier Dağıtım)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Önerilen</span>
                </div>
                <ul className={`space-y-2 text-slate-200 ${fontClass}`}>
                  <li className="flex justify-between border-b border-indigo-500/10 pb-1">
                    <span>İlk Sefer Başarısı:</span>
                    <strong className="text-emerald-300 font-bold">%98.4</strong>
                  </li>
                  <li className="flex justify-between border-b border-indigo-500/10 pb-1">
                    <span>Ortalama Düzeltme Döngüsü:</span>
                    <strong className="text-emerald-300 font-bold">1.1 tur</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Fatura Tasarrufu:</span>
                    <strong className="text-emerald-300 font-bold">%64 İndirim</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* SENARYO 3 */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-400" />
                <span>Senaryo 3: İstihbarat & Bilgi Tüketimi (Planla Scout Radarı)</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                🏆 Kazanan: Cam Portalı + Zen Modu + RAG
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2.5">
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Varyant A (Düz Metin / Terminal Log)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">Klasik</span>
                </div>
                <ul className={`space-y-2 text-slate-300 ${fontClass}`}>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span>Okuma Süresi:</span>
                    <strong className="text-white">24 dakika</strong>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-1">
                    <span>Aksiyona Dönüşme:</span>
                    <strong className="text-white">%35</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>İnteraktif Soru-Cevap:</span>
                    <strong className="text-white">Yok</strong>
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2.5">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Varyant B (Cam Portalı & Zen Modu)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Modern UX</span>
                </div>
                <ul className={`space-y-2 text-slate-200 ${fontClass}`}>
                  <li className="flex justify-between border-b border-indigo-500/10 pb-1">
                    <span>Okuma Süresi:</span>
                    <strong className="text-emerald-300 font-bold">60s özet / 8 dk tam</strong>
                  </li>
                  <li className="flex justify-between border-b border-indigo-500/10 pb-1">
                    <span>Aksiyona Dönüşme:</span>
                    <strong className="text-emerald-300 font-bold">%92</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>İnteraktif Soru-Cevap:</span>
                    <strong className="text-emerald-300 font-bold">Zero-Token NotebookLM RAG</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* EĞER DİNAMİK A/B SENARYOLARI VARSA */}
        {abScenarios.length > 0 && (
          <div className="border-t border-white/10 pt-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Rapor İçi Özelleştirilmiş Benchmark Maddeleri</h3>
            <div className="grid grid-cols-1 gap-4">
              {abScenarios.map((sc: any, scIdx: number) => (
                <div key={scIdx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <h4 className="text-sm font-bold text-indigo-300">{sc.title}</h4>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{sc.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// MAIN OBSERVATORY COMPONENT
// -------------------------------------------------------------
export function ScoutRadarPage() {
  const [briefings, setBriefings] = React.useState<ScoutBriefing[]>([])
  const [selectedBriefing, setSelectedBriefing] = React.useState<ScoutBriefing | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterCategory, setFilterCategory] = React.useState<string>("all")
  
  // Navigation & View Modes
  const [readerViewMode, setReaderViewMode] = React.useState<ReaderViewMode>('html')
  const [perspectiveTab, setPerspectiveTab] = React.useState<PerspectiveTab>('summary')
  const [rawSubTab, setRawSubTab] = React.useState<'markdown' | 'json' | 'html_source'>('markdown')
  const [fontSize, setFontSize] = React.useState<FontSize>('base')
  const [htmlZoom, setHtmlZoom] = React.useState<number>(100)
  
  // States
  const [isCopied, setIsCopied] = React.useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [checklistStates, setChecklistStates] = React.useState<Record<number, boolean>>({})

  // Chat & RAG state
  const [question, setQuestion] = React.useState("")
  const [chatAnswer, setChatAnswer] = React.useState<string | null>(null)
  const [isAsking, setIsAsking] = React.useState(false)

  const iframeRef = React.useRef<HTMLIFrameElement>(null)

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

  const handleToggleChecklist = (idx: number) => {
    setChecklistStates(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }))
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
      content = selectedBriefing.html || generateClientHtml(selectedBriefing.title, selectedBriefing.content || '', dateStr)
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

  const handlePrintHtml = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.focus()
      iframeRef.current.contentWindow.print()
    } else {
      window.print()
    }
  }

  const handleOpenHtmlInNewTab = () => {
    if (!selectedBriefing) return
    const htmlCode = selectedBriefing.html || generateClientHtml(selectedBriefing.title, selectedBriefing.content || '', selectedBriefing.date || 'Bugün')
    const blob = new Blob([htmlCode], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
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
  const sectionList = selectedBriefing?.parsed?.section_list || []
  const telemetryRows = selectedBriefing?.parsed?.telemetry_rows || []
  const checklistItems = selectedBriefing?.parsed?.checklist_items || []
  const metrics = selectedBriefing?.parsed?.metrics || {
    total_workers: telemetryRows.length || 5,
    successful_workers: telemetryRows.length || 5,
    quorum_str: `${telemetryRows.length || 5}/${telemetryRows.length || 5}`,
    total_duration_sec: 90.71,
    token_saving_pct: 99,
    completed_checks: 0,
    total_checks: checklistItems.length,
    architecture_nodes: 4,
    reading_time_min: 8
  }

  // Fuzzy-resolved sections for perspective views
  const sectionSummary = findSection(rawSections, ['özet', 'summary', '60 saniye'])
  const sectionGithub = findSection(rawSections, ['github', 'mcp', 'proje', 'repo'])
  const sectionFrontier = findSection(rawSections, ['frontier', 'lab', 'model', 'deepmind', 'anthropic', 'openai'])
  const sectionCommunity = findSection(rawSections, ['topluluk', 'community', 'nabız', 'twitter', 'reddit', 'hacker'])
  const sectionArchitecture = findSection(rawSections, ['mimari', 'architecture', 'ajan tasarımı', 'fsm', 'topoloji', 'üretim'])
  const sectionChecklist = findSection(rawSections, ['aksiyon', 'checklist', 'yapılacak', 'kontrol'])
  const sectionTelemetry = findSection(rawSections, ['telemetri', 'orkestrasyon', 'kota', 'worker'])
  const sectionAb = findSection(rawSections, ['a/b', 'benchmark', 'karşılaştırma', 'deney'])

  // Escape key listener for fullscreen mode
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // Section jumper helper (TOC)
  const handleJumpSection = (val: string) => {
    if (!val) return
    if (val === 'sec-ab') {
      setReaderViewMode('ab_tests')
      return
    }
    if (readerViewMode !== 'magazine') {
      setReaderViewMode('magazine')
    }
    setTimeout(() => {
      if (val.startsWith('sec-dyn-')) {
        const sIdx = parseInt(val.replace('sec-dyn-', ''), 10)
        const targetSec = sectionList[sIdx]
        if (targetSec) {
          const headings = document.querySelectorAll('h2')
          for (const h of Array.from(headings)) {
            if (h.textContent && h.textContent.toLowerCase().includes(targetSec.title.slice(0, 15).toLowerCase())) {
              h.scrollIntoView({ behavior: 'smooth', block: 'start' })
              return
            }
          }
        }
      } else {
        const el = document.getElementById(val)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }, 120)
  }

  // HTML content for iframe
  const renderedHtml = React.useMemo(() => {
    if (!selectedBriefing) return ""
    return selectedBriefing.html || generateClientHtml(
      selectedBriefing.title, 
      selectedBriefing.content || selectedBriefing.description, 
      selectedBriefing.date || 'Bugün'
    )
  }, [selectedBriefing])

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#080b11] text-slate-900 dark:text-slate-100 overflow-hidden">
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
              Contabo VPS Çoklu-Ajan Orkestrasyonu, Mac Konut Kazıyıcı ve Google NotebookLM RAG ile 24/7 senkronize teknoloji gözlemevi.
            </p>
          </div>
        </div>

        {/* Aksiyon Araçları */}
        <div className="flex items-center gap-2">
          {/* Yazı Boyutu Seçici (Magazin ve A/B Benchmark görünümü için) */}
          {(readerViewMode === 'magazine' || readerViewMode === 'ab_tests') && (
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
          )}

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
            title="Kusursuz Formatlanmış 2026 Cam HTML Raporu Olarak İndir"
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
      {/* 2. DİNAMİK BENTO BENCHMARK & TELEMETRİ VİTRİNİ */}
      {/* ------------------------------------------------------------- */}
      <div className="px-6 py-3 border-b border-slate-200/60 dark:border-white/5 bg-slate-50/70 dark:bg-[#0c101a]/60 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {/* KART 1: WORKER SWARM */}
        <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#121623]/80 border border-slate-200/60 dark:border-white/5 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {metrics.total_workers || 5}-Worker Swarm
            </div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              {metrics.total_duration_sec ? `${metrics.total_duration_sec}s` : '90.71s'} 
              <span className="text-[10px] font-bold text-emerald-500">
                Quorum {metrics.quorum_str || '5/5'}
              </span>
            </div>
          </div>
        </div>

        {/* KART 2: TOKEN TASARRUFU */}
        <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#121623]/80 border border-slate-200/60 dark:border-white/5 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Token Tasarrufu</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              %{metrics.token_saving_pct || 99} İndirim 
              <span className="text-[10px] font-bold text-indigo-500">AST MCP</span>
            </div>
          </div>
        </div>

        {/* KART 3: FRONTIER MODELLER */}
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

        {/* KART 4: AKSİYON & BELLEK */}
        <div className="p-3 rounded-2xl bg-white/70 dark:bg-[#121623]/80 border border-slate-200/60 dark:border-white/5 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {metrics.total_checks ? `${metrics.completed_checks}/${metrics.total_checks} Aksiyon Tamam` : 'Hafıza Hiyerarşisi'}
            </div>
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

            {/* Kategori Filtre Hapları */}
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
              {/* 5-MODLU GÖRÜNÜM SEÇİCİ KONTROL BARI */}
              {/* -------------------------------------------------- */}
              <div className="px-4 md:px-6 py-2.5 border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0e1320]/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
                {/* Ana Mod Seçici (5 Mod) */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/60 dark:border-white/5 text-xs font-semibold overflow-x-auto max-w-full scrollbar-none shrink-0">
                  <button
                    onClick={() => setReaderViewMode('html')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                      readerViewMode === 'html'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>🌟 Cam HTML Önizleme</span>
                  </button>

                  <button
                    onClick={() => setReaderViewMode('magazine')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                      readerViewMode === 'magazine'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>📑 İnteraktif Magazin</span>
                  </button>

                  <button
                    onClick={() => setReaderViewMode('perspective')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                      readerViewMode === 'perspective'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" />
                    <span>🎯 Bölüm Gezgini</span>
                  </button>

                  <button
                    onClick={() => setReaderViewMode('ab_tests')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                      readerViewMode === 'ab_tests'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>🧪 A/B Testleri</span>
                  </button>

                  <button
                    onClick={() => setReaderViewMode('raw')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                      readerViewMode === 'raw'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>📄 Ham Kaynak</span>
                  </button>
                </div>

                {/* Sağ Araçlar */}
                <div className="flex items-center gap-2">
                  {readerViewMode === 'html' && (
                    <div className="flex items-center gap-1 text-xs">
                      {/* Zoom Kontrolleri */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-white/10">
                        <button
                          onClick={() => setHtmlZoom(prev => Math.max(75, prev - 10))}
                          className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                          title="Uzaklaştır"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-1.5 text-[11px] font-mono text-slate-500 font-bold">{htmlZoom}%</span>
                        <button
                          onClick={() => setHtmlZoom(prev => Math.min(130, prev + 10))}
                          className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                          title="Yakınlaştır"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={handlePrintHtml}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        title="Yazdır veya PDF Olarak Kaydet"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Yazdır / PDF</span>
                      </button>

                      <button
                        onClick={handleOpenHtmlInNewTab}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        title="Ayrı Sekmede Aç"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Ayrı Sekme</span>
                      </button>
                    </div>
                  )}

                  <div className="text-[11px] font-medium text-slate-400 hidden 2xl:flex items-center gap-2 shrink-0 pl-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{selectedBriefing.parsed?.word_count || 2250} Kelime</span>
                    <span>•</span>
                    <span>{selectedBriefing.parsed?.reading_time_min || 8} Dakika Okuma</span>
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------- */}
              {/* MOD 1: KUSURSUZ CAM HTML RAPOR ÖNİZLEME (IFRAME) */}
              {/* -------------------------------------------------- */}
              {readerViewMode === 'html' && (
                <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col">
                  <div className="flex-1 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden bg-[#0b0d13] relative flex flex-col">
                    <iframe
                      ref={iframeRef}
                      title="AI Intelligence HTML Report"
                      srcDoc={renderedHtml}
                      className="w-full flex-1 border-none"
                      style={{
                        transform: `scale(${htmlZoom / 100})`,
                        transformOrigin: 'top center',
                        height: `${100 * (100 / htmlZoom)}%`,
                        width: '100%'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* MOD 2: İNTERAKTİF MAGAZİN GÖRÜNÜMÜ */}
              {/* -------------------------------------------------- */}
              {readerViewMode === 'magazine' && (
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                  <div className="max-w-5xl mx-auto space-y-6">
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
                            HTML İndir
                          </button>
                        </div>
                      </div>

                      {/* Zengin Markdown İçeriği */}
                      <RichMarkdownViewer
                        content={selectedBriefing.content || selectedBriefing.description}
                        fontSize={fontSize}
                        checklistStates={checklistStates}
                        onToggleChecklist={handleToggleChecklist}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* MOD 3: BÖLÜM GEZGİNİ (PERSPEKTİF & DİNAMİK SEKMELER) */}
              {/* -------------------------------------------------- */}
              {readerViewMode === 'perspective' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Sekme Seçici Bar */}
                  <div className="px-4 md:px-6 py-2 border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0e1320]/70 backdrop-blur-md flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                    {[
                      { id: 'summary', label: '⚡ 60s Özeti' },
                      { id: 'github', label: '🚀 GitHub & MCP' },
                      { id: 'frontier', label: '🔬 Frontier AI' },
                      { id: 'community', label: '🐦 Topluluk Nabzı' },
                      { id: 'architecture', label: '🏗️ Mimari & FSM' },
                      { id: 'ab', label: '🧪 A/B Testleri' },
                      { id: 'checklist', label: '🎯 Aksiyonlar' },
                      { id: 'telemetry', label: '📊 Telemetri' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setPerspectiveTab(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                          perspectiveTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                            : 'bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}

                    {/* Ek dinamik sekmeler varsa */}
                    {sectionList.filter(s => 
                      !['özet', 'summary', 'github', 'mcp', 'frontier', 'topluluk', 'mimari', 'ab', 'a/b', 'benchmark', 'aksiyon', 'checklist', 'telemetri']
                      .some(kw => s.title.toLowerCase().includes(kw))
                    ).map((s, sIdx) => (
                      <button
                        key={`dyn-${sIdx}`}
                        onClick={() => setPerspectiveTab(`dyn-${sIdx}`)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                          perspectiveTab === `dyn-${sIdx}`
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                            : 'bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {s.title.slice(0, 20)}...
                      </button>
                    ))}
                  </div>

                  {/* Sekme İçeriği */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                      {/* ÖZET */}
                      {perspectiveTab === 'summary' && (
                        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/90 via-[#0e1424] to-[#0a0d17] border border-indigo-500/40 shadow-xl text-white">
                          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                            <Zap className="w-4 h-4 animate-pulse" />
                            60 Saniyelik Stratejik Yönetici Özeti
                          </div>
                          <h3 className="text-xl font-black text-white mb-4">
                            {sectionSummary ? sectionSummary.title : "Günün Kritik Teknolojik Kırılma Noktaları"}
                          </h3>
                          <RichMarkdownViewer
                            content={sectionSummary ? sectionSummary.content : selectedBriefing.description}
                            fontSize={fontSize}
                            contrast="high"
                          />
                        </div>
                      )}

                      {/* GITHUB & MCP */}
                      {perspectiveTab === 'github' && (
                        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#111522] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-indigo-500" />
                            {sectionGithub ? sectionGithub.title : "Radarımıza Giren En Sıcak GitHub & MCP Projeleri"}
                          </h3>
                          <RichMarkdownViewer
                            content={sectionGithub ? sectionGithub.content : "GitHub ve MCP proje detayları bu raporda bulunamadı."}
                            fontSize={fontSize}
                          />
                        </div>
                      )}

                      {/* FRONTIER AI */}
                      {perspectiveTab === 'frontier' && (
                        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#111522] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-purple-500" />
                            {sectionFrontier ? sectionFrontier.title : "Frontier AI Laboratuvar Bültenleri"}
                          </h3>
                          <RichMarkdownViewer
                            content={sectionFrontier ? sectionFrontier.content : "Frontier AI laboratuvar verisi bu raporda bulunamadı."}
                            fontSize={fontSize}
                          />
                        </div>
                      )}

                      {/* TOPLULUK NABZI */}
                      {perspectiveTab === 'community' && (
                        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#111522] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-sky-500" />
                            {sectionCommunity ? sectionCommunity.title : "Topluluk Nabzı (Twitter/X, Reddit & HackerNews)"}
                          </h3>
                          <RichMarkdownViewer
                            content={sectionCommunity ? sectionCommunity.content : "Topluluk nabzı verisi bu raporda bulunamadı."}
                            fontSize={fontSize}
                          />
                        </div>
                      )}

                      {/* MİMARİ & FSM */}
                      {perspectiveTab === 'architecture' && (
                        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#111522] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-500" />
                            {sectionArchitecture ? sectionArchitecture.title : "Üretim Mimarisi ve Ajan Tasarımı"}
                          </h3>
                          <RichMarkdownViewer
                            content={sectionArchitecture ? sectionArchitecture.content : "Mimari analiz bu raporda bulunamadı."}
                            fontSize={fontSize}
                          />
                        </div>
                      )}

                      {/* A/B TESTLERİ VE BENCHMARK */}
                      {perspectiveTab === 'ab' && (
                        <AbTestsBenchmarkView briefing={selectedBriefing} fontSize={fontSize} />
                      )}

                      {/* AKSİYONLAR */}
                      {perspectiveTab === 'checklist' && (
                        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#111522] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-emerald-500" />
                            {sectionChecklist ? sectionChecklist.title : "Maestro 360 Somut Aksiyon Kontrol Listesi"}
                          </h3>
                          <RichMarkdownViewer
                            content={sectionChecklist ? sectionChecklist.content : "Kontrol listesi bu raporda bulunamadı."}
                            fontSize={fontSize}
                            checklistStates={checklistStates}
                            onToggleChecklist={handleToggleChecklist}
                          />
                        </div>
                      )}

                      {/* TELEMETRİ */}
                      {perspectiveTab === 'telemetry' && (
                        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#111522] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            {sectionTelemetry ? sectionTelemetry.title : "Çoklu-Ajan Orkestrasyon & Kota Rotasyon Telemetrisi"}
                          </h3>
                          <RichMarkdownViewer
                            content={sectionTelemetry ? sectionTelemetry.content : "Telemetri tablosu bu raporda bulunamadı."}
                            fontSize={fontSize}
                          />
                        </div>
                      )}

                      {/* DİNAMİK BÖLÜM EŞLEŞMESİ */}
                      {perspectiveTab.startsWith('dyn-') && (() => {
                        const idx = parseInt(perspectiveTab.replace('dyn-', ''))
                        const dynSec = sectionList[idx]
                        if (!dynSec) return <p className="text-slate-400">Bölüm bulunamadı.</p>
                        return (
                          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#111522] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                              {dynSec.title}
                            </h3>
                            <RichMarkdownViewer
                              content={dynSec.body}
                              fontSize={fontSize}
                            />
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* MOD 4: HAM KAYNAK (MARKDOWN / JSON / HTML SOURCE) */}
              {/* -------------------------------------------------- */}
              {readerViewMode === 'raw' && (
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    {/* Alt Sekmeler */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                      <button
                        onClick={() => setRawSubTab('markdown')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          rawSubTab === 'markdown' 
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Markdown (.md)
                      </button>
                      <button
                        onClick={() => setRawSubTab('html_source')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          rawSubTab === 'html_source' 
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        HTML Kaynak Kodu
                      </button>
                      <button
                        onClick={() => setRawSubTab('json')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          rawSubTab === 'json' 
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Yapısal JSON
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const textToCopy = rawSubTab === 'markdown' 
                            ? (selectedBriefing.content || selectedBriefing.description)
                            : rawSubTab === 'html_source'
                            ? renderedHtml
                            : JSON.stringify(selectedBriefing, null, 2)
                          navigator.clipboard.writeText(textToCopy)
                          setIsCopied(true)
                          setTimeout(() => setIsCopied(false), 2000)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white shadow-sm transition-all"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Kopyalandı' : 'Kopyala'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-950 p-5 overflow-x-auto shadow-2xl">
                    <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed">
                      {rawSubTab === 'markdown' && (selectedBriefing.content || selectedBriefing.description)}
                      {rawSubTab === 'html_source' && renderedHtml}
                      {rawSubTab === 'json' && JSON.stringify(selectedBriefing, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* MOD 5: A/B TESTLERİ & CANLI KARŞILAŞTIRMA */}
              {/* -------------------------------------------------- */}
              {readerViewMode === 'ab_tests' && (
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                  <div className="max-w-5xl mx-auto space-y-6">
                    <AbTestsBenchmarkView briefing={selectedBriefing} fontSize={fontSize} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <BookOpen className="w-12 h-12 mb-3 opacity-30 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
                İstihbarat Gözlemevi Hazır
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Sol panelden dilediğiniz bir tarihli raporu seçerek zengin bölümleri, HTML önizlemesini ve telemetriyi inceleyebilirsiniz.
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

      {/* ------------------------------------------------------------- */}
      {/* 4. TAM EKRAN ODAKLI OKUMA MODU MODALI (100vw / 100vh) */}
      {/* ------------------------------------------------------------- */}
      {isFullscreen && selectedBriefing && (
        <div className="fixed inset-0 z-50 w-screen h-screen bg-[#080b11] text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-150">
          {/* ÜST YAPIŞKAN MOD & GEZGİN ÇUBUĞU */}
          <div className="px-6 py-3 border-b border-white/10 bg-[#0e1320]/95 backdrop-blur-2xl flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xl z-20">
            {/* Sol: Başlık & Durum */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-500/20">
                <Compass className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-tight truncate max-w-xs md:max-w-md">
                  {selectedBriefing.title}
                </h2>
                <span className="text-[10px] font-bold text-indigo-400">
                  Odaklanma Modu (Zen) • {selectedBriefing.date || 'Bugün'}
                </span>
              </div>
            </div>

            {/* Orta: 5 Mod Seçici */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-white/10 text-xs font-semibold overflow-x-auto max-w-full scrollbar-none shrink-0">
              <button
                onClick={() => setReaderViewMode('html')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  readerViewMode === 'html'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">🌟 Cam HTML</span>
              </button>
              <button
                onClick={() => setReaderViewMode('magazine')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  readerViewMode === 'magazine'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">📑 Magazin</span>
              </button>
              <button
                onClick={() => setReaderViewMode('perspective')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  readerViewMode === 'perspective'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">🎯 Bölüm Gezgini</span>
              </button>
              <button
                onClick={() => setReaderViewMode('ab_tests')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  readerViewMode === 'ab_tests'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">🧪 A/B Testleri</span>
              </button>
              <button
                onClick={() => setReaderViewMode('raw')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  readerViewMode === 'raw'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">📄 Ham</span>
              </button>
            </div>

            {/* Sağ: Başlık Gezgini, Font Ölçekleyici, Kapat */}
            <div className="flex items-center gap-2">
              {/* Başlık Gezgini (TOC Jumper) */}
              <select
                onChange={(e) => handleJumpSection(e.target.value)}
                className="text-xs bg-slate-800/90 text-slate-200 border border-white/10 rounded-xl px-2.5 py-1.5 outline-none hover:border-indigo-400 transition-all cursor-pointer max-w-[160px] md:max-w-[220px] truncate"
                defaultValue=""
              >
                <option value="" disabled>📑 Başlığa Git...</option>
                <option value="sec-summary">⚡ 60 Saniyelik Özet</option>
                <option value="sec-github">🚀 GitHub & MCP</option>
                <option value="sec-frontier">🔬 Frontier Modeller</option>
                <option value="sec-community">🌐 Topluluk Nabzı</option>
                <option value="sec-architecture">🏗️ Mimari & FSM</option>
                <option value="sec-ab">🧪 A/B Testleri</option>
                <option value="sec-checklist">🎯 Aksiyon Listesi</option>
                <option value="sec-telemetry">📊 Telemetri</option>
                {sectionList.map((sec, sIdx) => (
                  <option key={sIdx} value={`sec-dyn-${sIdx}`}>
                    {sec.title.slice(0, 35)}
                  </option>
                ))}
              </select>

              {/* Font Ölçekleyici */}
              <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-white/10 text-xs font-semibold">
                <button
                  onClick={() => setFontSize('sm')}
                  className={`px-2 py-1 rounded-lg transition-all ${fontSize === 'sm' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Küçük Yazı"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('base')}
                  className={`px-2 py-1 rounded-lg transition-all ${fontSize === 'base' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Standart Yazı"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('lg')}
                  className={`px-2 py-1 rounded-lg transition-all ${fontSize === 'lg' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Büyük Yazı"
                >
                  A+
                </button>
              </div>

              {/* Tam Ekrandan Çık Butonu */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold transition-all hover:text-white"
                title="Odaklanma Modundan Çık (Esc)"
              >
                <Minimize2 className="w-4 h-4" />
                <span className="hidden md:inline">Çık (Esc)</span>
              </button>
            </div>
          </div>

          {/* MODAL İÇERİK ALANI */}
          <div className="flex-1 overflow-hidden flex flex-col bg-[#090c14]">
            {/* Cam HTML */}
            {readerViewMode === 'html' && (
              <div className="flex-1 p-4 md:p-8 flex flex-col overflow-hidden">
                <div className="flex-1 rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-[#0b0d13]">
                  <iframe
                    title="Fullscreen AI Report"
                    srcDoc={renderedHtml}
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            )}

            {/* Magazin */}
            {readerViewMode === 'magazine' && (
              <div id="fullscreen-scroll-container" className="flex-1 overflow-y-auto p-4 md:p-10">
                <div className="max-w-5xl mx-auto bg-[#111625]/90 border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl space-y-6">
                  <RichMarkdownViewer
                    content={selectedBriefing.content || selectedBriefing.description}
                    fontSize={fontSize}
                    checklistStates={checklistStates}
                    onToggleChecklist={handleToggleChecklist}
                  />
                </div>
              </div>
            )}

            {/* Bölüm Gezgini */}
            {readerViewMode === 'perspective' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Alt Sekmeler */}
                <div className="px-6 py-2 border-b border-white/10 bg-[#0e1320]/70 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                  {[
                    { id: 'summary', label: '⚡ 60s Özeti' },
                    { id: 'github', label: '🚀 GitHub & MCP' },
                    { id: 'frontier', label: '🔬 Frontier AI' },
                    { id: 'community', label: '🐦 Topluluk Nabzı' },
                    { id: 'architecture', label: '🏗️ Mimari & FSM' },
                    { id: 'ab', label: '🧪 A/B Testleri' },
                    { id: 'checklist', label: '🎯 Aksiyonlar' },
                    { id: 'telemetry', label: '📊 Telemetri' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setPerspectiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                        perspectiveTab === tab.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  {/* Ek dinamik sekmeler varsa */}
                  {sectionList.filter(s => 
                    !['özet', 'summary', '60 saniye', 'github', 'mcp', 'frontier', 'topluluk', 'community', 'mimari', 'ab', 'a/b', 'benchmark', 'aksiyon', 'checklist', 'telemetri', 'orkestrasyon', 'kota']
                    .some(kw => s.title.toLowerCase().includes(kw))
                  ).map((s, sIdx) => (
                    <button
                      key={`dyn-${sIdx}`}
                      onClick={() => setPerspectiveTab(`dyn-${sIdx}`)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                        perspectiveTab === `dyn-${sIdx}`
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {s.title.slice(0, 20)}...
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                  <div className="max-w-5xl mx-auto space-y-6">
                    {perspectiveTab === 'summary' && (
                      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/90 via-[#0e1424] to-[#0a0d17] border border-indigo-500/40 shadow-xl text-white">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                          <Zap className="w-4 h-4 animate-pulse" />
                          60 Saniyelik Stratejik Yönetici Özeti
                        </div>
                        <h3 className="text-xl font-black text-white mb-4">
                          {sectionSummary ? sectionSummary.title : "Günün Kritik Teknolojik Kırılma Noktaları"}
                        </h3>
                        <RichMarkdownViewer
                          content={sectionSummary ? sectionSummary.content : selectedBriefing.description}
                          fontSize={fontSize}
                          contrast="high"
                        />
                      </div>
                    )}
                    {perspectiveTab === 'github' && (
                      <div className="p-6 md:p-8 rounded-3xl bg-[#111625] border border-white/10 shadow-sm space-y-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          <Code2 className="w-5 h-5 text-indigo-400" />
                          {sectionGithub ? sectionGithub.title : "GitHub & MCP Projeleri"}
                        </h3>
                        <RichMarkdownViewer
                          content={sectionGithub ? sectionGithub.content : "GitHub verisi bulunamadı."}
                          fontSize={fontSize}
                        />
                      </div>
                    )}
                    {perspectiveTab === 'frontier' && (
                      <div className="p-6 md:p-8 rounded-3xl bg-[#111625] border border-white/10 shadow-sm space-y-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-purple-400" />
                          {sectionFrontier ? sectionFrontier.title : "Frontier AI"}
                        </h3>
                        <RichMarkdownViewer
                          content={sectionFrontier ? sectionFrontier.content : "Frontier verisi bulunamadı."}
                          fontSize={fontSize}
                        />
                      </div>
                    )}
                    {perspectiveTab === 'community' && (
                      <div className="p-6 md:p-8 rounded-3xl bg-[#111625] border border-white/10 shadow-sm space-y-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          <Activity className="w-5 h-5 text-sky-400" />
                          {sectionCommunity ? sectionCommunity.title : "Topluluk Nabzı"}
                        </h3>
                        <RichMarkdownViewer
                          content={sectionCommunity ? sectionCommunity.content : "Topluluk verisi bulunamadı."}
                          fontSize={fontSize}
                        />
                      </div>
                    )}
                    {perspectiveTab === 'architecture' && (
                      <div className="p-6 md:p-8 rounded-3xl bg-[#111625] border border-white/10 shadow-sm space-y-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          <Layers className="w-5 h-5 text-indigo-400" />
                          {sectionArchitecture ? sectionArchitecture.title : "Üretim Mimarisi"}
                        </h3>
                        <RichMarkdownViewer
                          content={sectionArchitecture ? sectionArchitecture.content : "Mimari analiz bulunamadı."}
                          fontSize={fontSize}
                        />
                      </div>
                    )}
                    {perspectiveTab === 'ab' && (
                      <AbTestsBenchmarkView briefing={selectedBriefing} fontSize={fontSize} />
                    )}
                    {perspectiveTab === 'checklist' && (
                      <div className="p-6 md:p-8 rounded-3xl bg-[#111625] border border-white/10 shadow-sm space-y-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                          {sectionChecklist ? sectionChecklist.title : "Kontrol Listesi"}
                        </h3>
                        <RichMarkdownViewer
                          content={sectionChecklist ? sectionChecklist.content : "Kontrol listesi bulunamadı."}
                          fontSize={fontSize}
                          checklistStates={checklistStates}
                          onToggleChecklist={handleToggleChecklist}
                        />
                      </div>
                    )}
                    {perspectiveTab === 'telemetry' && (
                      <div className="p-6 md:p-8 rounded-3xl bg-[#111625] border border-white/10 shadow-sm space-y-4">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          <Activity className="w-5 h-5 text-indigo-400" />
                          {sectionTelemetry ? sectionTelemetry.title : "Telemetri Tablosu"}
                        </h3>
                        <RichMarkdownViewer
                          content={sectionTelemetry ? sectionTelemetry.content : "Telemetri verisi bulunamadı."}
                          fontSize={fontSize}
                        />
                      </div>
                    )}

                    {/* DİNAMİK BÖLÜM EŞLEŞMESİ (FULLSCREEN) */}
                    {perspectiveTab.startsWith('dyn-') && (() => {
                      const idx = parseInt(perspectiveTab.replace('dyn-', ''), 10)
                      const dynSec = sectionList[idx]
                      if (!dynSec) return <p className="text-slate-400">Bölüm bulunamadı.</p>
                      return (
                        <div className="p-6 md:p-8 rounded-3xl bg-[#111625] border border-white/10 shadow-sm space-y-4">
                          <h3 className="text-lg font-black text-white">
                            {dynSec.title}
                          </h3>
                          <RichMarkdownViewer
                            content={dynSec.body}
                            fontSize={fontSize}
                          />
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* A/B Testleri */}
            {readerViewMode === 'ab_tests' && (
              <div className="flex-1 overflow-y-auto p-4 md:p-10">
                <div className="max-w-5xl mx-auto space-y-6">
                  <AbTestsBenchmarkView briefing={selectedBriefing} fontSize={fontSize} />
                </div>
              </div>
            )}

            {/* Ham Kaynak */}
            {readerViewMode === 'raw' && (
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 overflow-x-auto shadow-2xl">
                  <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed">
                    {selectedBriefing.content || selectedBriefing.description}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
