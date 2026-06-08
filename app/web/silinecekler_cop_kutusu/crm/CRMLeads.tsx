"use client"

import * as React from "react"
import { useProjectStore } from "@/stores/projectStore"
import { useTaskStore } from "@/stores/taskStore"
import { Search, Mail, Phone, Calendar, Star, Building, CheckCircle2, User, Clock, ChevronRight, Plus } from "lucide-react"

interface CRMLeadsProps {
  projectId: number | null
}

interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: "new" | "contacted" | "qualified" | "lost" | "won"
  value: number
  source: string
  avatarColor: string
  createdAt: string
}

export function CRMLeads({ projectId }: CRMLeadsProps) {
  const { projects } = useProjectStore()
  const { tasks } = useTaskStore()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)

  // Aday listesi
  const leads: Lead[] = React.useMemo(() => {
    const currentProject = projects.find(p => p.id === projectId)
    const projectTasks = tasks.filter(t => t.project_id === projectId)
    
    const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"]

    if (projectTasks.length === 0) {
      return [
        {
          id: "lead-1",
          name: "Ahmet Yılmaz",
          company: currentProject?.name || "Örnek Teknoloji A.Ş.",
          email: "ahmet@ornekteknoloji.com",
          phone: "+90 532 111 2233",
          status: "new",
          value: 75000,
          source: "Web Sitesi",
          avatarColor: colors[0],
          createdAt: "2026-05-23T10:00:00Z"
        },
        {
          id: "lead-2",
          name: "Ayşe Kaya",
          company: currentProject?.name || "Kaya Mimarlık Ltd.",
          email: "ayse@kayamimarlik.com",
          phone: "+90 544 222 3344",
          status: "contacted",
          value: 120000,
          source: "Tavsiye",
          avatarColor: colors[1],
          createdAt: "2026-05-22T14:30:00Z"
        },
        {
          id: "lead-3",
          name: "Mehmet Demir",
          company: currentProject?.name || "Demir Lojistik",
          email: "mehmet@demirlojistik.com",
          phone: "+90 555 333 4455",
          status: "qualified",
          value: 45000,
          source: "Facebook Form",
          avatarColor: colors[2],
          createdAt: "2026-05-20T09:15:00Z"
        }
      ]
    }

    const demoNames = ["Can Yılmaz", "Elif Demir", "Ahmet Kaya", "Selin Arslan", "Mehmet Çelik", "Gözde Aksoy", "Kamil Mert", "Ayşe Şahin", "Burak Öztürk", "Merve Kılıç"]

    return projectTasks.slice(0, 10).map((task, index) => {
      const valueMultiplier = (task.id % 5) + 1
      const sources = ["Web Sitesi", "Tavsiye", "Facebook Reklamı", "Google Search", "LinkedIn Outreach"]
      const statuses: Lead["status"][] = ["new", "contacted", "qualified", "won", "lost"]
      
      const assigneeName = demoNames[task.id % demoNames.length]
      const emailUsername = assigneeName.toLowerCase().replace(/\s+/g, "")

      return {
        id: `lead-task-${task.id}`,
        name: assigneeName,
        company: currentProject?.name || "Pikseliş İstemcisi",
        email: `${emailUsername}@sirketmail.com`,
        phone: `+90 5${(task.id * 17) % 90 + 10} ${(task.id * 31) % 900 + 100} ${(task.id * 53) % 90 + 10}${(task.id * 79) % 90 + 10}`,
        status: statuses[task.id % statuses.length],
        value: valueMultiplier * 15000,
        source: sources[task.id % sources.length],
        avatarColor: colors[index % colors.length],
        createdAt: task.created_at || new Date().toISOString()
      }
    })
  }, [projects, tasks, projectId])

  const filteredLeads = leads.filter(
    lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  React.useEffect(() => {
    if (filteredLeads.length > 0 && !selectedLead) {
      setSelectedLead(filteredLeads[0])
    }
  }, [filteredLeads, selectedLead])

  const statusMap = {
    new: { label: "New", bg: "bg-blue-50 text-blue-600 border border-blue-100" },
    contacted: { label: "Contacted", bg: "bg-amber-50 text-amber-600 border border-amber-100" },
    qualified: { label: "Qualified", bg: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
    won: { label: "Won", bg: "bg-purple-50 text-purple-600 border border-purple-100" },
    lost: { label: "Lost", bg: "bg-rose-50 text-rose-600 border border-rose-100" },
  }

  const mockActivities = [
    { type: "email", title: "Campaign Email Sent", desc: "Newsletter introducing new features.", date: "Today, 14:02", icon: Mail },
    { type: "call", title: "Call Logged", desc: "Spoke for 4 minutes regarding pricing terms.", date: "Yesterday, 11:30", icon: Phone },
    { type: "meeting", title: "Demo Meeting Held", desc: "Presented the project timeline via Zoom.", date: "22 May 2026", icon: Calendar },
    { type: "task", title: "Task Completed", desc: "Pricing proposal document prepared and sent.", date: "20 May 2026", icon: CheckCircle2 }
  ]

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f8f9fa]">
      {/* Sol Aday Listesi */}
      <div className="flex-1 flex flex-col h-full bg-white border-r border-[#e9ecef] overflow-hidden">
        {/* Breadcrumb & Create */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#e9ecef] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">Leads</span>
            <span className="text-slate-400">/</span>
            <button className="text-sm font-black text-slate-900 flex items-center gap-1">
              List
              <ChevronRight className="w-3.5 h-3.5 transform rotate-90 text-slate-400" />
            </button>
          </div>
          
          <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            Create
          </button>
        </div>

        {/* Arama Barı */}
        <div className="px-6 py-3.5 border-b border-[#e9ecef] flex gap-3 shrink-0 bg-white">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-xs bg-[#fafbfc] border border-[#e9ecef] focus:outline-none focus:border-slate-300 transition-all font-semibold text-slate-600"
            />
          </div>
        </div>

        {/* Aday Listesi */}
        <div className="flex-1 overflow-y-auto">
          {filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <User className="w-12 h-12 mb-3 text-slate-200" />
              <p className="text-xs font-semibold">No leads found.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f3f5]">
              {filteredLeads.map((lead) => {
                const isActive = selectedLead?.id === lead.id
                return (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`w-full text-left px-6 py-4 flex items-start gap-4 transition-all ${
                      isActive ? "bg-slate-50 border-l-4 border-slate-950 pl-5" : "hover:bg-[#fafbfc]"
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0"
                      style={{ backgroundColor: lead.avatarColor }}
                    >
                      {lead.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-black text-slate-900 truncate">{lead.name}</h4>
                        <span className="text-[10px] font-black text-slate-400 shrink-0">
                          {new Date(lead.createdAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                        <Building className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 truncate">{lead.company}</span>
                      </div>

                      <div className="flex items-center justify-between mt-3.5">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${statusMap[lead.status].bg}`}>
                          {statusMap[lead.status].label}
                        </span>
                        <span className="text-xs font-black text-slate-900">
                          {lead.value.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sağ Detay / Zaman Akışı (Timeline) */}
      {selectedLead && (
        <div className="hidden lg:flex w-[480px] bg-[#fafbfc] border-l border-[#e9ecef] flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-[#e9ecef] bg-white shrink-0">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm"
                style={{ backgroundColor: selectedLead.avatarColor }}
              >
                {selectedLead.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-slate-900 leading-none">{selectedLead.name}</h3>
                <p className="text-[11px] text-slate-400 font-bold mt-2">{selectedLead.company}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[#f1f3f5]">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                <Mail className="w-4 h-4 text-slate-350" />
                <span className="truncate">{selectedLead.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                <Phone className="w-4 h-4 text-slate-350" />
                <span>{selectedLead.phone}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Activity Timeline</h4>
            
            <div className="relative border-l border-[#e9ecef] ml-3 flex flex-col gap-6">
              {mockActivities.map((act, index) => {
                const ActIcon = act.icon
                return (
                  <div key={index} className="relative pl-7 group">
                    <div className="absolute -left-3 top-0.5 w-6 h-6 rounded-lg bg-white border border-[#e9ecef] flex items-center justify-center text-slate-400 transition-colors shadow-sm">
                      <ActIcon className="w-3 h-3" />
                    </div>

                    <div className="bg-white border border-[#e9ecef] p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-250">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-black text-slate-900 leading-none">{act.title}</span>
                        <div className="flex items-center gap-1 text-[9.5px] text-slate-450 font-bold">
                          <Clock className="w-3 h-3" />
                          <span>{act.date}</span>
                        </div>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed mt-2.5">{act.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
