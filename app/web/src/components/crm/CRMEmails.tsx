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
      name: "Hoş Geldiniz & Tanıtım",
      subject: "Pikseliş'e Hoş Geldiniz! Harika bir başlangıç yapalım.",
      body: "Merhaba [Aday_İsmi],\n\nÖncelikle bizimle iletişime geçtiğiniz için çok teşekkür ederiz. Projenizle ilgili detayları heyecanla inceledik...\n\nSaygılarımızla,\nEkibiniz",
      category: "onboarding",
      lastUsed: "Dün"
    },
    {
      id: "temp-2",
      name: "Teklif & Fiyatlandırma Takip",
      subject: "[Firma_İsmi] İçin Hazırladığımız Özel Fiyat Teklifi",
      body: "Merhaba [Aday_İsmi],\n\nGeçtiğimiz günlerde görüştüğümüz proje için hazırladığımız güncel teklif dosyasını ekte bilgilerinize sunarım...\n\nSaygılarımızla,\nEkibiniz",
      category: "sales",
      lastUsed: "20 May"
    },
    {
      id: "temp-3",
      name: "Özel İndirim & Fırsat Kampanyası",
      subject: "Yalnızca Bu Hafta Geçerli %15 Yatırım İndirimi!",
      body: "Merhaba [Aday_İsmi],\n\nYeni çeyreğe başlarken işlerinizi hızlandırmak amacıyla tüm paketlerimizde geçerli özel bir fırsat sunuyoruz...\n\nSaygılarımızla,\nEkibiniz",
      category: "sales",
      lastUsed: "15 May"
    }
  ])

  const [campaigns, setCampaigns] = React.useState<Campaign[]>([
    { id: "camp-1", name: "Mayıs Ayı Bülteni", subject: "Sistem güncellemeleri ve yeni tasarım trendleri", sentCount: 1250, openRate: "42.8%", clickRate: "18.4%", status: "sent" },
    { id: "camp-2", name: "Potansiyel Aday Takibi", subject: "Birlikte neler yapabiliriz? Fikirlerinizi duymak isteriz.", sentCount: 85, openRate: "68.2%", clickRate: "35.1%", status: "sent" },
    { id: "camp-3", name: "Yeni Paket Tanıtımı", subject: "Özel kurumsal paketi duyurmaktan mutluluk duyarız.", sentCount: 0, openRate: "0%", clickRate: "0%", status: "draft" }
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
      name: "Yeni Taslak Şablon",
      subject: "E-posta Konusu",
      body: "E-posta içeriğinizi buraya yazın...",
      category: "sales",
      lastUsed: "Şimdi"
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
    <div className="flex-1 flex overflow-hidden">
      {/* Sol: Şablon Listesi */}
      <div className="w-80 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-full overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between shrink-0">
          <h3 className="text-xs font-black text-brand-dark dark:text-white uppercase tracking-wider">E-Posta Şablonları</h3>
          <button
            onClick={handleCreateTemplate}
            className="w-8 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 border-b border-slate-200 dark:border-white/5 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Şablonlarda ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
          {filteredTemplates.map((temp) => {
            const isActive = selectedTemplate?.id === temp.id
            return (
              <button
                key={temp.id}
                onClick={() => setSelectedTemplate(temp)}
                className={`w-full text-left p-4 flex flex-col gap-1 transition-all duration-150 ${
                  isActive ? "bg-indigo-50/50 dark:bg-indigo-500/5 border-l-4 border-indigo-600 pl-3" : "hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <span className="text-xs font-black text-brand-dark dark:text-white leading-none">{temp.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1">{temp.subject}</span>
                <span className="text-[9px] text-slate-400 dark:text-gray-500 font-bold mt-2">Son Kullanım: {temp.lastUsed}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Orta: Düzenleme Alanı */}
      {selectedTemplate && (
        <div className="flex-1 flex flex-col bg-slate-50/40 dark:bg-slate-900/10 h-full overflow-hidden p-6 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Şablon İsmi</label>
              <input
                type="text"
                value={selectedTemplate.name}
                onChange={(e) => handleUpdateTemplate(selectedTemplate.id, "name", e.target.value)}
                className="w-full mt-2 px-4 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Konu (Subject)</label>
              <input
                type="text"
                value={selectedTemplate.subject}
                onChange={(e) => handleUpdateTemplate(selectedTemplate.id, "subject", e.target.value)}
                className="w-full mt-2 px-4 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">İçerik (Body)</label>
              <textarea
                value={selectedTemplate.body}
                onChange={(e) => handleUpdateTemplate(selectedTemplate.id, "body", e.target.value)}
                rows={8}
                className="w-full mt-2 px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700 dark:text-slate-300 leading-relaxed resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 mt-2">
              <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 transition-colors">
                <Eye className="w-4 h-4" /> Önizle
              </button>
              <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/10">
                <Send className="w-4 h-4" /> Kampanyayı Başlat (Send)
              </button>
            </div>
          </div>

          {/* Kampanya İstatistikleri */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black text-brand-dark dark:text-white uppercase tracking-wider">E-Posta Kampanya Raporları</h4>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/5 p-4.5 rounded-2xl flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-brand-dark dark:text-white truncate">{camp.name}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      camp.status === "sent" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      {camp.status === "sent" ? "Gönderildi" : "Taslak"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-white/5 text-center">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400">Alıcı</p>
                      <p className="text-[11px] font-black text-brand-dark dark:text-white mt-1">{camp.sentCount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400">Açılma</p>
                      <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-1">{camp.openRate}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400">Tıklama</p>
                      <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 mt-1">{camp.clickRate}</p>
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
