"use client"

import * as React from "react"
import { useProjectStore } from "@/stores/projectStore"
import { useTaskStore } from "@/stores/taskStore"
import { Building, Phone, Mail, KanbanSquare, CheckSquare2 } from "lucide-react"

interface CRMPipelinesProps {
  projectId: number | null
}

interface DealCard {
  id: string
  name: string
  company: string
  value: number
  stage: "lead" | "contacted" | "proposal" | "negotiation" | "won"
  phone: string
  email: string
  avatarColor: string
}

export function CRMPipelines({ projectId }: CRMPipelinesProps) {
  const { projects } = useProjectStore()
  const { tasks } = useTaskStore()

  const [deals, setDeals] = React.useState<DealCard[]>([])

  // Mevcut projelerden/görevlerden Satış Fırsatları (Deals) oluşturma simülasyonu
  React.useEffect(() => {
    const currentProject = projects.find(p => p.id === projectId)
    const projectTasks = tasks.filter(t => t.project_id === projectId)
    const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"]

    if (projectTasks.length === 0) {
      setDeals([
        { id: "deal-1", name: "Kamil Mert", company: currentProject?.name || "Mert Holding", value: 85000, stage: "lead", phone: "+90 533 999 8877", email: "kamil@mertholding.com", avatarColor: colors[0] },
        { id: "deal-2", name: "Elif Çelik", company: currentProject?.name || "Çelik Sanayi", value: 140000, stage: "contacted", phone: "+90 541 888 7766", email: "elif@celiksanayi.com", avatarColor: colors[1] },
        { id: "deal-3", name: "Selin Bakır", company: currentProject?.name || "Bakır Medya", value: 62000, stage: "proposal", phone: "+90 552 777 6655", email: "selin@bakirmedya.com", avatarColor: colors[2] },
        { id: "deal-4", name: "Caner Arslan", company: currentProject?.name || "Arslan Enerji", value: 250000, stage: "negotiation", phone: "+90 530 666 5544", email: "caner@arslanenerji.com", avatarColor: colors[3] },
        { id: "deal-5", name: "Gözde Aksoy", company: currentProject?.name || "Aksoy Lojistik", value: 95000, stage: "won", phone: "+90 535 555 4433", email: "gozde@aksoylojistik.com", avatarColor: colors[4] }
      ])
      return
    }

    const stages: DealCard["stage"][] = ["lead", "contacted", "proposal", "negotiation", "won"]
    const demoNames = ["Can Yılmaz", "Elif Demir", "Ahmet Kaya", "Selin Arslan", "Mehmet Çelik", "Gözde Aksoy", "Kamil Mert", "Ayşe Şahin", "Burak Öztürk", "Merve Kılıç"]

    const simulatedDeals = projectTasks.slice(0, 10).map((task, index) => {
      const assigneeName = demoNames[task.id % demoNames.length]
      const emailUsername = assigneeName.toLowerCase().replace(/\s+/g, "")
      return {
        id: `deal-task-${task.id}`,
        name: assigneeName,
        company: currentProject?.name || "Pikseliş İstemcisi",
        value: ((task.id % 5) + 1) * 20000,
        stage: stages[task.id % stages.length],
        phone: `+90 5${(task.id * 17) % 90 + 10} ${(task.id * 31) % 900 + 100} ${(task.id * 53) % 90 + 10}${(task.id * 79) % 90 + 10}`,
        email: `${emailUsername}@sirketmail.com`,
        avatarColor: colors[index % colors.length]
      }
    })
    setDeals(simulatedDeals)
  }, [projects, tasks, projectId])

  const stagesList = [
    { id: "lead", label: "Adaylar (Leads)", color: "border-t-blue-500 text-blue-500" },
    { id: "contacted", label: "İletişim Kuruldu", color: "border-t-amber-500 text-amber-500" },
    { id: "proposal", label: "Teklif Verildi", color: "border-t-purple-500 text-purple-500" },
    { id: "negotiation", label: "Sözleşme Aşaması", color: "border-t-indigo-500 text-indigo-500" },
    { id: "won", label: "Kazanıldı (Deal Won)", color: "border-t-emerald-500 text-emerald-500" }
  ] as const

  // Sürükle-bırak simülasyonu tetikleyicisi
  const handleMoveDeal = (dealId: string, direction: "next" | "prev") => {
    const stagesOrder: DealCard["stage"][] = ["lead", "contacted", "proposal", "negotiation", "won"]
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/20 dark:bg-slate-900/10">
      {/* Sütunlar Container */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6 flex gap-4 items-start select-none">
        {stagesList.map((stage) => {
          const stageDeals = deals.filter(d => d.stage === stage.id)
          const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0)

          return (
            <div
              key={stage.id}
              className="w-72 lg:w-80 shrink-0 bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 rounded-3xl p-4 flex flex-col max-h-full shadow-sm backdrop-blur-xl"
            >
              {/* Sütun Başlığı */}
              <div className={`border-t-4 ${stage.color} pt-3 pb-4 px-1 shrink-0`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-brand-dark dark:text-white leading-none">{stage.label}</span>
                  <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                  <span>Toplam Değer:</span>
                  <span>
                    {totalValue.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Fırsat Kartları Listesi */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 min-h-[100px] mt-2 pr-1">
                {stageDeals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
                    <KanbanSquare className="w-8 h-8 mb-2 text-slate-200 dark:text-slate-800" />
                    <p className="text-[10px] font-bold">Fırsat bulunmuyor</p>
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 hover:border-indigo-500/50 dark:hover:border-indigo-500/40 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-sm shrink-0"
                            style={{ backgroundColor: deal.avatarColor }}
                          >
                            {deal.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-brand-dark dark:text-white leading-none">{deal.name}</h4>
                            <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 leading-none">
                              <Building className="w-3 h-3 shrink-0" />
                              <span>{deal.company}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                          {deal.value.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })}
                        </span>
                        
                        {/* Simüle Edilmiş Sürükleme Butonları (Mobil ve Hızlı Test Uyumluluğu İçin) */}
                        <div className="flex items-center gap-1">
                          {stage.id !== "lead" && (
                            <button
                              onClick={() => handleMoveDeal(deal.id, "prev")}
                              className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-xs transition-colors"
                              title="Önceki Aşamaya Taşı"
                            >
                              ‹
                            </button>
                          )}
                          {stage.id !== "won" && (
                            <button
                              onClick={() => handleMoveDeal(deal.id, "next")}
                              className="w-5 h-5 rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs transition-colors"
                              title="Sonraki Aşamaya Taşı"
                            >
                              ›
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
