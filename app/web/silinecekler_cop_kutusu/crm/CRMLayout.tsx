"use client"

import * as React from "react"
import { 
  Users, 
  Briefcase, 
  Contact, 
  Building2, 
  Notebook, 
  CheckSquare, 
  PhoneCall, 
  Mail, 
  ChevronDown, 
  ChevronRight, 
  LogOut, 
  Bell, 
  Search,
  MessageSquare,
  Sparkles,
  ArrowLeftRight
} from "lucide-react"
import { CRMLeads } from "./CRMLeads"
import { CRMPipelines } from "./CRMPipelines"
import { CRMOmnichannel } from "./CRMOmnichannel"
import { CRMEmails } from "./CRMEmails"
import { useProjectStore } from "@/stores/projectStore"
import { useAuthStore } from "@/store/authStore"

interface CRMLayoutProps {
  projectId: number | null
}

export type CRMTab = 
  | "leads" 
  | "deals" 
  | "contacts" 
  | "organizations" 
  | "notes" 
  | "tasks" 
  | "call_logs" 
  | "emails"

export function CRMLayout({ projectId }: CRMLayoutProps) {
  const { setViewMode } = useProjectStore()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = React.useState<CRMTab>("deals") // Görseldeki gibi varsayılan Deals (Kanban)
  const [collapsed, setCollapsed] = React.useState(false)

  const mainMenuItems = [
    { id: "leads", label: "Leads", icon: Users },
    { id: "deals", label: "Deals", icon: Briefcase },
    { id: "contacts", label: "Contacts", icon: Contact },
    { id: "organizations", label: "Organizations", icon: Building2 },
    { id: "notes", label: "Notes", icon: Notebook },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "call_logs", label: "Call Logs", icon: PhoneCall },
    { id: "emails", label: "Email Templates", icon: Mail },
  ] as const

  const publicViews = [
    { id: "my_leads", label: "My Leads", tab: "leads" as const },
    { id: "my_deals", label: "My Deals", tab: "deals" as const },
    { id: "timeless", label: "Timeless Only", tab: "deals" as const },
  ]

  const pinnedViews = [
    { id: "linkedin", label: "Linkedin Deals", tab: "deals" as const },
    { id: "facebook", label: "Facebook Deals", tab: "deals" as const },
  ]

  const handleTabChange = (tabId: CRMTab) => {
    setActiveTab(tabId)
  }

  return (
    <div className="flex-1 flex h-screen w-screen overflow-hidden bg-[#f4f5f6] text-slate-800 font-sans">
      
      {/* 🏛️ SOL SIDEBAR (Frappe CRM Birebir Arayüzü) */}
      <aside 
        className={`h-full border-r border-[#e9ecef] bg-[#fafbfc] flex flex-col justify-between shrink-0 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Üst Logo ve Profil Kartı */}
        <div className="flex flex-col shrink-0">
          <div className="p-4 flex items-center justify-between border-b border-[#f1f3f5]">
            <div className="flex items-center gap-3 min-w-0">
              {/* Pembe Kare Logo */}
              <div className="w-8 h-8 rounded-lg bg-[#db2777] flex items-center justify-center text-white font-extrabold shrink-0 shadow-sm shadow-pink-500/10">
                F
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <h2 className="text-xs font-black text-slate-900 leading-none">CRM</h2>
                  <p className="text-[10px] text-slate-500 font-bold truncate mt-1">
                    {user?.name || user?.username || "Shariq Ansari"}
                  </p>
                </div>
              )}
            </div>
            
            {/* Bildirimler Butonu */}
            {!collapsed && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-600">
                <Bell className="w-3 h-3 text-slate-500" />
                <span>4</span>
              </div>
            )}
          </div>
        </div>

        {/* Orta Linkler Menüsü */}
        <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
          {/* Ana Menü */}
          <div className="flex flex-col gap-0.5">
            {mainMenuItems.map((item) => {
              const isActive = activeTab === item.id
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-xs font-semibold ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-[#f1f3f5]"
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              )
            })}
          </div>

          {/* Public Views */}
          {!collapsed && (
            <div className="flex flex-col gap-1">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Public views</span>
              <div className="flex flex-col gap-0.5 mt-1.5">
                {publicViews.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => handleTabChange(view.tab)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-[#f1f3f5]"
                  >
                    <span>{view.label}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pinned Views */}
          {!collapsed && (
            <div className="flex flex-col gap-1">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pinned views</span>
              <div className="flex flex-col gap-0.5 mt-1.5">
                {pinnedViews.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => handleTabChange(view.tab)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-[#f1f3f5]"
                  >
                    <span>{view.label}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 🚪 Alt Butonlar (Collapse & My World'e Işınlanma Kapısı) */}
        <div className="p-3 border-t border-[#e9ecef] bg-[#fafbfc] shrink-0 flex flex-col gap-2">
          {/* My World'e Dönüş Butonu */}
          <button
            onClick={() => setViewMode("dashboard")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white font-extrabold text-[11px] shadow-md hover:shadow-lg transition-all"
            title="My World Paneline Geri Dön"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            {!collapsed && <span>My World'e Dön</span>}
          </button>

          {/* Collapse Menü Butonu */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs font-bold text-slate-400 hover:text-slate-900 hover:bg-[#f1f3f5]"
          >
            <span className="transform rotate-180">➔</span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* 🖥️ SAĞ İÇERİK BÖLÜMÜ (Frappe CRM Birebir Görünüm) */}
      <main className="flex-1 overflow-hidden flex flex-col min-w-0 bg-[#f8f9fa]">
        {activeTab === "leads" && <CRMLeads projectId={projectId} />}
        {activeTab === "deals" && <CRMPipelines projectId={projectId} />}
        {activeTab === "contacts" && <CRMLeads projectId={projectId} />}
        {activeTab === "organizations" && <CRMLeads projectId={projectId} />}
        
        {/* Call Logs yerine Omnichannel Simülatörünü koyuyoruz */}
        {activeTab === "call_logs" && <CRMOmnichannel projectId={projectId} />}
        
        {activeTab === "emails" && <CRMEmails projectId={projectId} />}
        
        {/* Basit Notlar sekmesi */}
        {activeTab === "notes" && (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-semibold p-8">
            Notes tab under construction. Feel free to use leads or deals.
          </div>
        )}
        
        {/* Basit Görevler sekmesi */}
        {activeTab === "tasks" && (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-semibold p-8">
            Tasks list is sync with My World. Switch to Deals to manage pipelines.
          </div>
        )}
      </main>
    </div>
  )
}
