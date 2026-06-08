"use client"

import * as React from "react"
import { Mail, Plus, Search, Eye, Send, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react"

interface CRMEmailsProps {
  projectId: number | null
}

interface Template {
  id: string
  name: string
  subject: string
  body: string
  category: "sales" | "onboarding" | "support"
  lastUsed: string
}

interface Campaign {
  id: string
  name: string
  subject: string
  sentCount: number
  openRate: string
  clickRate: string
  status: "draft" | "sending" | "sent"
}

export function CRMEmails({ projectId }: CRMEmailsProps) {
  const [templates, setTemplates] = React.useState<Template[]>([
    {
      id: "temp-1",
      name: "Welcome & Onboarding",
      subject: "Welcome to our platform! Let's get started.",
      body: "Hello [Lead_Name],\n\nFirst of all, thank you for reaching out to us. We have successfully received your project details...\n\nBest Regards,\nTeam",
      category: "onboarding",
      lastUsed: "Yesterday"
    },
    {
      id: "temp-2",
      name: "Pricing Proposal Follow-up",
      subject: "Updated Pricing Proposal for [Company_Name]",
      body: "Hello [Lead_Name],\n\nFollowing our call yesterday, please find our updated proposal details below...\n\nBest Regards,\nTeam",
      category: "sales",
      lastUsed: "20 May"
    },
    {
      id: "temp-3",
      name: "Special Quarter Discount",
      subject: "Exclusive 15% discount for this week only!",
      body: "Hello [Lead_Name],\n\nTo accelerate your operations this quarter, we are glad to offer a special discount...\n\nBest Regards,\nTeam",
      category: "sales",
      lastUsed: "15 May"
    }
  ])

  const [campaigns, setCampaigns] = React.useState<Campaign[]>([
    { id: "camp-1", name: "May Newsletter", subject: "Product updates and new features", sentCount: 1250, openRate: "42.8%", clickRate: "18.4%", status: "sent" },
    { id: "camp-2", name: "Warm Lead Nurturing", subject: "Let's work together. Quick sync?", sentCount: 85, openRate: "68.2%", clickRate: "35.1%", status: "sent" },
    { id: "camp-3", name: "Enterprise Plan Launch", subject: "Introducing our new enterprise grade features.", sentCount: 0, openRate: "0%", clickRate: "0%", status: "draft" }
  ])

  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0])
    }
  }, [templates, selectedTemplate])

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateTemplate = () => {
    const newTemp: Template = {
      id: `temp-${Date.now()}`,
      name: "New Draft Template",
      subject: "Email Subject",
      body: "Type your content here...",
      category: "sales",
      lastUsed: "Just now"
    }
    setTemplates([newTemp, ...templates])
    setSelectedTemplate(newTemp)
  }

  const handleUpdateTemplate = (id: string, field: keyof Template, val: string) => {
    setTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, [field]: val } : t))
    )
    if (selectedTemplate && selectedTemplate.id === id) {
      setSelectedTemplate(prev => prev ? { ...prev, [field]: val } : null)
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f8f9fa]">
      {/* Sol: E-posta Şablonları Listesi */}
      <div className="w-80 border-r border-[#e9ecef] bg-white flex flex-col shrink-0 h-full overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e9ecef] flex items-center justify-between shrink-0">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Email Templates</h3>
          <button
            onClick={handleCreateTemplate}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 border-b border-[#e9ecef] shrink-0 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-455" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-[#fafbfc] border border-[#e9ecef] focus:outline-none focus:border-slate-300 font-semibold"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#f1f3f5]">
          {filteredTemplates.map((temp) => {
            const isActive = selectedTemplate?.id === temp.id
            return (
              <button
                key={temp.id}
                onClick={() => setSelectedTemplate(temp)}
                className={`w-full text-left px-5 py-4 flex flex-col gap-1 transition-all ${
                  isActive ? "bg-slate-50 border-l-4 border-slate-950 pl-4" : "hover:bg-[#fafbfc]"
                }`}
              >
                <span className="text-xs font-black text-slate-900 leading-none">{temp.name}</span>
                <span className="text-[10px] text-slate-500 truncate mt-1.5 font-semibold">{temp.subject}</span>
                <span className="text-[9.5px] text-slate-400 font-black mt-2">Last Used: {temp.lastUsed}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Orta: Düzenleme ve Raporlama Alanı */}
      {selectedTemplate && (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6 bg-[#f8f9fa]">
          {/* Düzenleyici */}
          <div className="bg-white border border-[#e9ecef] p-6 rounded-xl shadow-sm flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Template Name</label>
              <input
                type="text"
                value={selectedTemplate.name}
                onChange={(e) => handleUpdateTemplate(selectedTemplate.id, "name", e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-lg text-xs bg-[#fafbfc] border border-[#e9ecef] focus:outline-none focus:border-slate-350 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Subject</label>
              <input
                type="text"
                value={selectedTemplate.subject}
                onChange={(e) => handleUpdateTemplate(selectedTemplate.id, "subject", e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-lg text-xs bg-[#fafbfc] border border-[#e9ecef] focus:outline-none focus:border-slate-355 transition-all font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Body</label>
              <textarea
                value={selectedTemplate.body}
                onChange={(e) => handleUpdateTemplate(selectedTemplate.id, "body", e.target.value)}
                rows={6}
                className="w-full mt-1.5 px-3 py-2.5 rounded-lg text-xs bg-[#fafbfc] border border-[#e9ecef] focus:outline-none focus:border-slate-355 transition-all font-medium text-slate-700 leading-relaxed resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button className="px-4 py-2 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-[#e9ecef] transition-colors">
                Preview
              </button>
              <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
                Save & Use Template
              </button>
            </div>
          </div>

          {/* Raporlar */}
          <div className="bg-white border border-[#e9ecef] p-6 rounded-xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-900" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Campaign Analytics</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-[#fafbfc] border border-[#e9ecef] p-4.5 rounded-xl flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11.5px] font-black text-slate-900 truncate">{camp.name}</span>
                    <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md ${
                      camp.status === "sent" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>
                      {camp.status === "sent" ? "Sent" : "Draft"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#f1f3f5] text-center">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400">Recipients</p>
                      <p className="text-[11px] font-black text-slate-900 mt-1">{camp.sentCount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400">Open Rate</p>
                      <p className="text-[11px] font-black text-emerald-600 mt-1">{camp.openRate}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400">Clicks</p>
                      <p className="text-[11px] font-black text-slate-950 mt-1">{camp.clickRate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
