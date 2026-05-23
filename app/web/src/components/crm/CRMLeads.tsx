"use client"

import * as React from "react"
import { useProjectStore } from "@/stores/projectStore"
import { useTaskStore } from "@/stores/taskStore"
import { Search, Mail, Phone, Calendar, Star, Building, CheckCircle2, User, Clock } from "lucide-react"

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

  // Gerçek verilerimizden CRM Adayları (Leads) üretelim
  const leads: Lead[] = React.useMemo(() => {
    const currentProject = projects.find(p => p.id === projectId)
    const projectTasks = tasks.filter(t => t.project_id === projectId)
    
    const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"]

    if (projectTasks.length === 0) {
      // Fallback demo veriler (eğer görev yoksa)
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

    // Görev sahiplerini veya görev başlıklarını adaylara dönüştür
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

  // Arama filtresi
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
    new: { label: "Yeni Aday", bg: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
    contacted: { label: "Görüşüldü", bg: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
    qualified: { label: "Uygundur", bg: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400" },
    won: { label: "Kazanıldı", bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
    lost: { label: "Kaybedildi", bg: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400" },
  }

  // Simüle edilmiş zaman akışı olayları
  const mockActivities = [
    { type: "email", title: "Kampanya E-postası Gönderildi", desc: "Yeni özellikler tanıtım bülteni.", date: "Bugün, 14:02", icon: Mail },
    { type: "call", title: "Telefon Görüşmesi Yapıldı", desc: "Teklif detayları hakkında 4 dakika görüşüldü.", date: "Dün, 11:30", icon: Phone },
    { type: "meeting", title: "Tanıtım Toplantısı", desc: "Zoom üzerinden proje demosu sunumu.", date: "22 May 2026", icon: Calendar },
    { type: "task", title: "Görev Tamamlandı", desc: "Fiyat teklif dosyası hazırlandı ve iletildi.", date: "20 May 2026", icon: CheckCircle2 }
  ]

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Aday Listesi Sol Bölüm */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 overflow-hidden">
        {/* Arama Barı */}
        <div className="p-4 border-b border-slate-200 dark:border-white/5 flex gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Adaylarda arayın (isim, firma, e-posta)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Tablo / Liste */}
        <div className="flex-1 overflow-y-auto">
          {filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <User className="w-12 h-12 mb-3 text-slate-200 dark:text-slate-700" />
              <p className="text-xs font-semibold">Müşteri adayı bulunamadı.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredLeads.map((lead) => {
                const isActive = selectedLead?.id === lead.id
                return (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`w-full text-left p-4.5 flex items-start gap-4 transition-all duration-200 ${
                      isActive ? "bg-indigo-50/50 dark:bg-indigo-500/5 border-l-4 border-indigo-600 pl-3.5" : "hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-inner shrink-0"
                      style={{ backgroundColor: lead.avatarColor }}
                    >
                      {lead.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-black text-brand-dark dark:text-white truncate">{lead.name}</h4>
                        <span className="text-[10px] font-black text-slate-400 shrink-0">
                          {new Date(lead.createdAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-1">
                        <Building className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="text-[10px] truncate">{lead.company}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2.5">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${statusMap[lead.status].bg}`}>
                          {statusMap[lead.status].label}
                        </span>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
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

      {/* Aday Zaman Tüneli Sağ Bölüm */}
      {selectedLead && (
        <div className="hidden md:flex w-[420px] lg:w-[480px] bg-slate-50/30 dark:bg-slate-900/10 flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shrink-0">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-3xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0"
                style={{ backgroundColor: selectedLead.avatarColor }}
              >
                {selectedLead.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-brand-dark dark:text-white leading-none">{selectedLead.name}</h3>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-1.5">{selectedLead.company}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{selectedLead.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{selectedLead.phone}</span>
              </div>
            </div>
          </div>

          {/* Frappe CRM Timeline */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2">Aktivite Zaman Akışı</h4>
            
            <div className="relative border-l border-slate-200 dark:border-white/5 ml-3 flex flex-col gap-6">
              {mockActivities.map((act, index) => {
                const ActIcon = act.icon
                return (
                  <div key={index} className="relative pl-7 group">
                    {/* Timeline Node */}
                    <div className="absolute -left-3.5 top-0.5 w-7 h-7 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all shadow-sm">
                      <ActIcon className="w-3.5 h-3.5" />
                    </div>

                    <div className="bg-white dark:bg-slate-900/60 p-4.5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[11px] font-black text-brand-dark dark:text-white leading-none">{act.title}</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{act.date}</span>
                        </div>
                      </div>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">{act.desc}</p>
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
