"use client"

import * as React from "react"
import { Users, Trello, MessageSquare, Mail, ChevronRight } from "lucide-react"
import { CRMLeads } from "./CRMLeads"
import { CRMPipelines } from "./CRMPipelines"
import { CRMOmnichannel } from "./CRMOmnichannel"
import { CRMEmails } from "./CRMEmails"

interface CRMLayoutProps {
  projectId: number | null
}

export function CRMLayout({ projectId }: CRMLayoutProps) {
  const [activeTab, setActiveTab] = React.useState<"leads" | "pipeline" | "inbox" | "emails">("leads")

  const menuItems = [
    { id: "leads", label: "Müşteri Adayları", icon: Users, description: "Adaylar ve iletişim geçmişi" },
    { id: "pipeline", label: "Satış Kanalları", icon: Trello, description: "Sürükle-bırak satış aşamaları" },
    { id: "inbox", label: "Omnichannel Inbox", icon: MessageSquare, description: "WhatsApp & Facebook Canlı Simülatör" },
    { id: "emails", label: "E-posta Kampanyaları", icon: Mail, description: "Toplu e-posta şablon motoru" },
  ] as const

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
      {/* Sol Kenar Çubuğu (CRM Alt Menüsü) */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex flex-col shrink-0">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-yellow to-amber-500 flex items-center justify-center text-white font-bold shadow-md">
              🎯
            </div>
            <div>
              <h2 className="text-sm font-black text-brand-dark dark:text-white uppercase tracking-wider">Frappe CRM</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">POC Deneyim Modu</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 md:p-4 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto print:hidden">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id
            const Icon = item.icon

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 lg:flex-none flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 group shrink-0 ${
                  isActive
                    ? "bg-indigo-600 dark:bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                    : "text-slate-600 dark:text-slate-400 hover:text-brand-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:text-brand-dark dark:group-hover:text-white"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="hidden lg:block flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{item.label}</p>
                  <p
                    className={`text-[9px] truncate mt-0.5 ${
                      isActive ? "text-white/70" : "text-slate-400 dark:text-gray-500"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
                <ChevronRight
                  className={`hidden lg:block w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ${
                    isActive ? "text-white/40 group-hover:translate-x-0.5" : "text-slate-400 group-hover:translate-x-0.5"
                  }`}
                />
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Sağ Ana İçerik Alanı */}
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {activeTab === "leads" && <CRMLeads projectId={projectId} />}
        {activeTab === "pipeline" && <CRMPipelines projectId={projectId} />}
        {activeTab === "inbox" && <CRMOmnichannel projectId={projectId} />}
        {activeTab === "emails" && <CRMEmails projectId={projectId} />}
      </main>
    </div>
  )
}
