"use client"

import * as React from "react"
import { useProjectStore } from "@/stores/projectStore"
import { useTaskStore } from "@/stores/taskStore"
import { 
  Building, 
  Plus, 
  RefreshCw, 
  SlidersHorizontal, 
  Settings, 
  Mail, 
  Phone,
  MessageSquare,
  CheckSquare,
  Paperclip,
  AtSign,
  ChevronDown
} from "lucide-react"

interface CRMPipelinesProps {
  projectId: number | null
}

interface DealCard {
  id: string
  name: string
  company: string
  value: string
  stage: "qualification" | "proposal" | "negotiation" | "ready_to_close" | "closed"
  phone: string
  email: string
  avatarType: "spotify" | "netflix" | "tesla" | "adobe" | "google" | "apple"
  assignee: string
  assigneeAvatar: string
  timeAgo: string
}

export function CRMPipelines({ projectId }: CRMPipelinesProps) {
  const { projects } = useProjectStore()
  const { tasks } = useTaskStore()
  
  const [deals, setDeals] = React.useState<DealCard[]>([])

  // Fırsat verilerini hazır marka ikonları ve görsele uygun değerlerle simüle edelim
  React.useEffect(() => {
    const currentProject = projects.find(p => p.id === projectId)
    
    // Görsele en yakın mockup veriler
    setDeals([
      { 
        id: "deal-1", 
        name: "Garry Steels", 
        company: "Shriram Finance Ltd.", 
        value: "₹65,33,99,000", 
        stage: "qualification", 
        phone: "+1 (229) 555-2233", 
        email: "garryv@frappecrm.com", 
        avatarType: "google",
        assignee: "Asif Mulani",
        assigneeAvatar: "AM",
        timeAgo: "3 months ago"
      },
      { 
        id: "deal-2", 
        name: "Angela Bower", 
        company: "Spotify A.Ş.", 
        value: "₺120.000", 
        stage: "proposal", 
        phone: "+1 (229) 555-2233", 
        email: "angelabower@spotify.com", 
        avatarType: "spotify",
        assignee: "Asif Mulani",
        assigneeAvatar: "AM",
        timeAgo: "9 months ago"
      },
      { 
        id: "deal-3", 
        name: "Jenny Wilson", 
        company: "Louis Vuitton", 
        value: "₺435.000", 
        stage: "negotiation", 
        phone: "+1 (270) 555-0117", 
        email: "jennywilson@louisv.com", 
        avatarType: "tesla", // Tesla logosu/avatariyla simule
        assignee: "Shariq Ansari",
        assigneeAvatar: "SA",
        timeAgo: "9 months ago"
      },
      { 
        id: "deal-4", 
        name: "Cody Fisher", 
        company: "Adobe Inc.", 
        value: "₺350.000", 
        stage: "ready_to_close", 
        phone: "+1 (405) 555-0128", 
        email: "codyfisher@adobe.com", 
        avatarType: "adobe",
        assignee: "Ankush Menat",
        assigneeAvatar: "AM",
        timeAgo: "9 months ago"
      },
      { 
        id: "deal-5", 
        name: "Hussain Nagaria", 
        company: "Netflix Inc.", 
        value: "₺280.000", 
        stage: "proposal", 
        phone: "+1 (480) 555-0103", 
        email: "ronaldrichards@netflix.com", 
        avatarType: "netflix",
        assignee: "Hussain Nagaria",
        assigneeAvatar: "HN",
        timeAgo: "9 months ago"
      },
      { 
        id: "deal-6", 
        name: "Brooklyn Simmons", 
        company: "Timeless", 
        value: "₺95.000", 
        stage: "ready_to_close", 
        phone: "+1 (229) 555-0109", 
        email: "brooklynsimmons@twitter.com", 
        avatarType: "apple",
        assignee: "Shariq Ansari",
        assigneeAvatar: "SA",
        timeAgo: "9 months ago"
      }
    ])
  }, [projectId, projects])

  const stagesList = [
    { id: "qualification", label: "Qualification", dotColor: "bg-amber-500", borderTop: "border-t-amber-500" },
    { id: "proposal", label: "Proposal/Quotation", dotColor: "bg-blue-500", borderTop: "border-t-blue-500" },
    { id: "negotiation", label: "Negotiation", dotColor: "bg-emerald-500", borderTop: "border-t-emerald-500" },
    { id: "ready_to_close", label: "Ready to Close", dotColor: "bg-red-500", borderTop: "border-t-red-500" },
    { id: "closed", label: "Closed", dotColor: "bg-pink-500", borderTop: "border-t-pink-500" }
  ] as const

  // Sürükleme simülasyonu
  const handleMoveDeal = (dealId: string, direction: "next" | "prev") => {
    const stagesOrder: DealCard["stage"][] = ["qualification", "proposal", "negotiation", "ready_to_close", "closed"]
    setDeals(prevDeals =>
      prevDeals.map(d => {
        if (d.id === dealId) {
          const currentIndex = stagesOrder.indexOf(d.stage)
          let nextIndex = currentIndex + (direction === "next" ? 1 : -1)
          if (nextIndex >= 0 && nextIndex < stagesOrder.length) {
            return { ...d, stage: stagesOrder[nextIndex] }
          }
        }
        return d
      })
    )
  }

  // Marka logoları render edici
  const renderBrandLogo = (type: DealCard["avatarType"]) => {
    switch (type) {
      case "spotify":
        return <div className="w-8 h-8 rounded-lg bg-[#1db954] flex items-center justify-center text-white text-xs font-black shrink-0">S</div>
      case "netflix":
        return <div className="w-8 h-8 rounded-lg bg-[#e50914] flex items-center justify-center text-white text-xs font-black shrink-0">N</div>
      case "tesla":
        return <div className="w-8 h-8 rounded-lg bg-[#cc0000] flex items-center justify-center text-white text-xs font-black shrink-0">T</div>
      case "adobe":
        return <div className="w-8 h-8 rounded-lg bg-[#fa0f00] flex items-center justify-center text-white text-xs font-black shrink-0">A</div>
      case "google":
        return <div className="w-8 h-8 rounded-lg bg-[#4285f4] flex items-center justify-center text-white text-xs font-black shrink-0">G</div>
      case "apple":
        return <div className="w-8 h-8 rounded-lg bg-[#000000] flex items-center justify-center text-white text-xs font-black shrink-0">A</div>
      default:
        return <div className="w-8 h-8 rounded-lg bg-[#6c757d] flex items-center justify-center text-white text-xs font-black shrink-0">C</div>
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f5f6]">
      {/* 🚀 ÜST BREADCRUMB & AKSİYON BAR */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-[#e9ecef] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500">Deals</span>
          <span className="text-slate-400">/</span>
          <button className="flex items-center gap-1 text-sm font-black text-slate-900">
            Kanban
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        
        <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          Create
        </button>
      </div>

      {/* 🔍 FİLTRE BAR (Görseldeki gibi Birebir) */}
      <div className="px-6 py-3.5 bg-white border-b border-[#e9ecef] flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
        <div className="flex flex-wrap items-center gap-2">
          <input 
            type="text" 
            placeholder="ID"
            className="w-24 px-3 py-1.5 rounded-lg border border-[#e9ecef] bg-[#fafbfc] text-xs font-semibold text-slate-600 focus:outline-none focus:border-slate-300"
          />
          <input 
            type="text" 
            placeholder="Organization"
            className="w-36 px-3 py-1.5 rounded-lg border border-[#e9ecef] bg-[#fafbfc] text-xs font-semibold text-slate-600 focus:outline-none focus:border-slate-300"
          />
          <input 
            type="text" 
            placeholder="Territory"
            className="w-32 px-3 py-1.5 rounded-lg border border-[#e9ecef] bg-[#fafbfc] text-xs font-semibold text-slate-600 focus:outline-none focus:border-slate-300"
          />
          <input 
            type="text" 
            placeholder="Status"
            className="w-28 px-3 py-1.5 rounded-lg border border-[#e9ecef] bg-[#fafbfc] text-xs font-semibold text-slate-600 focus:outline-none focus:border-slate-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button className="px-3.5 py-1.5 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-[#e9ecef] flex items-center gap-1.5 transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter
          </button>
          <button className="px-3.5 py-1.5 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-[#e9ecef] flex items-center gap-1.5 transition-colors">
            Kanban Settings
          </button>
        </div>
      </div>

      {/* 📊 KANBAN SÜTUN ALANI */}
      <div className="flex-1 overflow-x-auto p-6 flex gap-4 items-start select-none">
        {stagesList.map((stage) => {
          const stageDeals = deals.filter(d => d.stage === stage.id)

          return (
            <div
              key={stage.id}
              className="w-72 shrink-0 bg-transparent flex flex-col max-h-full"
            >
              {/* Sütun Başlığı */}
              <div className="flex items-center justify-between pb-3 px-1.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.dotColor}`}></span>
                  <span className="text-xs font-bold text-slate-900 leading-none">{stage.label}</span>
                </div>
                <button className="p-1 hover:bg-slate-200/60 rounded-md text-slate-400 hover:text-slate-600 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Fırsat Kartları Listesi */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3.5 min-h-[150px] pr-1">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-white border border-[#e9ecef] p-4.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group relative flex flex-col gap-3"
                  >
                    {/* Üst Logo ve Sürükleme Butonları */}
                    <div className="flex items-start justify-between">
                      {renderBrandLogo(deal.avatarType)}
                      
                      {/* Aşama Taşıyıcılar */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#f1f3f5] p-0.5 rounded-md">
                        {stage.id !== "qualification" && (
                          <button
                            onClick={() => handleMoveDeal(deal.id, "prev")}
                            className="w-4 h-4 text-xs font-black text-slate-600 hover:bg-white rounded flex items-center justify-center"
                          >
                            ‹
                          </button>
                        )}
                        {stage.id !== "closed" && (
                          <button
                            onClick={() => handleMoveDeal(deal.id, "next")}
                            className="w-4 h-4 text-xs font-black text-slate-600 hover:bg-white rounded flex items-center justify-center"
                          >
                            ›
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Müşteri İsmi */}
                    <div>
                      <h4 className="text-[12.5px] font-black text-slate-900 leading-tight">{deal.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">{deal.company}</p>
                    </div>

                    {/* Para Değeri */}
                    <div className="text-[13.5px] font-black text-slate-900 leading-none">
                      {deal.value}
                    </div>

                    {/* E-posta ve Telefon */}
                    <div className="flex flex-col gap-1 mt-1 text-[10.5px] text-slate-400 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        <span>{deal.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-300" />
                        <span>{deal.phone}</span>
                      </div>
                    </div>

                    {/* Atanan Kişi & Süre */}
                    <div className="flex items-center justify-between border-t border-[#f1f3f5] pt-3 mt-1 shrink-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5.5 h-5.5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-600 shrink-0">
                          {deal.assigneeAvatar}
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold truncate">{deal.assignee}</span>
                      </div>
                      <span className="text-[9.5px] text-slate-400 font-black whitespace-nowrap shrink-0">{deal.timeAgo}</span>
                    </div>

                    {/* Alt İkon Barı (Aynen Görseldeki İkonlar) */}
                    <div className="flex items-center gap-3 border-t border-[#f1f3f5] pt-2.5 mt-0.5 text-slate-400 shrink-0">
                      <AtSign className="w-3.5 h-3.5 hover:text-slate-600 cursor-pointer transition-colors" />
                      <Paperclip className="w-3.5 h-3.5 hover:text-slate-600 cursor-pointer transition-colors" />
                      <CheckSquare className="w-3.5 h-3.5 hover:text-slate-600 cursor-pointer transition-colors" />
                      <MessageSquare className="w-3.5 h-3.5 hover:text-slate-600 cursor-pointer transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
