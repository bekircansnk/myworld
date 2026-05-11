"use client"

import * as React from "react"
import { api } from "@/lib/api"
import { Building2, Users, ListTodo, Plus, Trash2, ChevronRight, Eye, Shield, Check, X, ChevronDown } from "lucide-react"
import { useProjectStore } from "@/stores/projectStore"

interface CompanyOverview {
  id: number
  name: string
  task_count: number
  user_count: number
}

interface UserCompanyAccess {
  project_id: number
  project_name: string
  permissions: Record<string, { view?: boolean; edit?: boolean; delete?: boolean }>
  is_owner: boolean
}

// Modül tanımları — backend role_templates ile eşleşiyor
const MODULES = [
  { key: 'dashboard', label: 'Kontrol Paneli', actions: ['view'] },
  { key: 'tasks', label: 'Görevler', actions: ['view', 'edit', 'delete'] },
  { key: 'calendar', label: 'Takvim', actions: ['view', 'edit'] },
  { key: 'notes', label: 'Notlar', actions: ['view', 'edit'] },
  { key: 'ai_chat', label: 'AI Sohbet', actions: ['view'] },
  { key: 'ads', label: 'Reklam', actions: ['view', 'edit'] },
  { key: 'photo_tracking', label: 'Fotoğraf Takip', actions: ['view', 'edit'] },
]

const ACTION_LABELS: Record<string, string> = {
  view: 'Görüntüle',
  edit: 'Düzenle', 
  delete: 'Sil'
}

export function CompanyManagementPanel({ 
  users, 
  isSuperAdmin 
}: { 
  users: any[]
  isSuperAdmin: boolean 
}) {
  const [companies, setCompanies] = React.useState<CompanyOverview[]>([])
  const [selectedCompany, setSelectedCompany] = React.useState<CompanyOverview | null>(null)
  const [companyUsers, setCompanyUsers] = React.useState<any[]>([])
  const [userPermissions, setUserPermissions] = React.useState<Record<number, Record<string, any>>>({})
  const [expandedUser, setExpandedUser] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [savingUser, setSavingUser] = React.useState<number | null>(null)
  const { switchCompany, setViewMode } = useProjectStore()

  React.useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/api/admin/companies/overview')
      setCompanies(response.data)
    } catch (e) { console.error(e) }
  }

  const fetchCompanyUsers = async (companyId: number) => {
    setLoading(true)
    try {
      // Her kullanıcının bu firmaya erişimi var mı kontrol et
      const allUsers = users.filter(u => u.role !== 'super_admin')
      const accessMap: any[] = []
      const permMap: Record<number, Record<string, any>> = {}
      
      for (const u of allUsers) {
        const resp = await api.get(`/api/admin/users/${u.id}/companies`)
        const companyAccess = resp.data.find((c: any) => c.project_id === companyId)
        if (companyAccess) {
          accessMap.push(u)
          permMap[u.id] = companyAccess.permissions || {}
        }
      }
      setCompanyUsers(accessMap)
      setUserPermissions(permMap)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const grantAccess = async (userId: number, projectId: number) => {
    try {
      // Varsayılan olarak sadece görüntüleme izni ver
      const defaultPerms: Record<string, any> = {}
      MODULES.forEach(m => {
        defaultPerms[m.key] = { view: true, edit: false }
        if (m.actions.includes('delete')) defaultPerms[m.key].delete = false
      })
      
      await api.post(`/api/admin/users/${userId}/companies/${projectId}`, { permissions: defaultPerms })
      fetchCompanyUsers(projectId)
      fetchCompanies()
    } catch (e) { console.error(e) }
  }

  const revokeAccess = async (userId: number, projectId: number) => {
    try {
      await api.delete(`/api/admin/users/${userId}/companies/${projectId}`)
      setExpandedUser(null)
      fetchCompanyUsers(projectId)
      fetchCompanies()
    } catch (e) { console.error(e) }
  }

  // İzin toggle
  const togglePermission = (userId: number, moduleKey: string, action: string) => {
    setUserPermissions(prev => {
      const userPerms = { ...(prev[userId] || {}) }
      const modulePerm = { ...(userPerms[moduleKey] || {}) }
      modulePerm[action] = !modulePerm[action]
      
      // Edit/delete açılıyorsa view da açılmalı
      if ((action === 'edit' || action === 'delete') && modulePerm[action]) {
        modulePerm.view = true
      }
      // View kapatılıyorsa edit ve delete de kapanmalı
      if (action === 'view' && !modulePerm[action]) {
        modulePerm.edit = false
        modulePerm.delete = false
      }
      
      userPerms[moduleKey] = modulePerm
      return { ...prev, [userId]: userPerms }
    })
  }

  // İzinleri kaydet
  const savePermissions = async (userId: number) => {
    if (!selectedCompany) return
    setSavingUser(userId)
    try {
      await api.put(`/api/admin/users/${userId}/companies/${selectedCompany.id}/permissions`, {
        permissions: userPermissions[userId] || {}
      })
    } catch (e) { console.error(e) }
    setSavingUser(null)
  }

  const switchToCompany = (companyId: number) => {
    switchCompany(companyId)
    setViewMode('dashboard')
  }

  const nonAdminUsers = users.filter(u => u.role !== 'super_admin')

  return (
    <div className="flex gap-6 h-full min-h-[500px]">
      {/* Sol — Firma Listesi */}
      <div className="w-80 shrink-0 space-y-3 overflow-y-auto max-h-[70vh]">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">
          {isSuperAdmin ? `Tüm Firmalar (${companies.length})` : `Firmalarım (${companies.length})`}
        </h3>
        
        {companies.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            Henüz firma yok.
          </div>
        )}

        {companies.map(company => (
          <button
            key={company.id}
            onClick={() => {
              setSelectedCompany(company)
              setExpandedUser(null)
              fetchCompanyUsers(company.id)
            }}
            className={`w-full p-4 rounded-2xl border text-left transition-all ${
              selectedCompany?.id === company.id
                ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-brand-dark dark:text-white truncate">{company.name}</span>
              <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${selectedCompany?.id === company.id ? 'text-indigo-500' : 'text-slate-400'}`} />
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1"><ListTodo className="w-3 h-3" />{company.task_count} Görev</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{company.user_count} Kullanıcı</span>
            </div>
          </button>
        ))}
      </div>

      {/* Sağ — Firma Detayı ve İzin Yönetimi */}
      {selectedCompany ? (
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-white/10 p-6 shadow-sm overflow-y-auto max-h-[70vh]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-brand-dark dark:text-white flex items-center gap-3">
                <Building2 className="w-6 h-6 text-indigo-500" />
                {selectedCompany.name}
              </h2>
              <p className="text-sm text-slate-500 mt-1">{selectedCompany.task_count} görev • {companyUsers.length} atanmış kullanıcı</p>
            </div>
            <button
              onClick={() => switchToCompany(selectedCompany.id)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> Firmaya Geç
            </button>
          </div>

          {/* Kullanıcı Erişim ve İzin Yönetimi */}
          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-white/10 pb-3">
              Kullanıcı Erişim ve İzin Yönetimi
            </h3>
            
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">Yükleniyor...</div>
            ) : (
              <div className="space-y-3">
                {nonAdminUsers.map(user => {
                  const hasAccess = companyUsers.some(cu => cu.id === user.id)
                  const isExpanded = expandedUser === user.id
                  const perms = userPermissions[user.id] || {}
                  
                  return (
                    <div key={user.id} className={`rounded-2xl border transition-all ${
                      hasAccess 
                        ? 'bg-white dark:bg-slate-900/50 border-indigo-200 dark:border-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-white/5'
                    }`}>
                      {/* Kullanıcı Satırı */}
                      <div className="flex items-center justify-between p-3">
                        <button 
                          onClick={() => hasAccess && setExpandedUser(isExpanded ? null : user.id)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-black shrink-0">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-brand-dark dark:text-white">{user.name}</p>
                            <p className="text-[10px] text-slate-500">@{user.username} • {user.role}</p>
                          </div>
                          {hasAccess && (
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                        
                        <button
                          onClick={() => hasAccess 
                            ? revokeAccess(user.id, selectedCompany.id)
                            : grantAccess(user.id, selectedCompany.id)
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-3 shrink-0 ${
                            hasAccess
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400'
                          }`}
                        >
                          {hasAccess ? <><Trash2 className="w-3 h-3" /> Erişimi Kaldır</> : <><Plus className="w-3 h-3" /> Erişim Ver</>}
                        </button>
                      </div>

                      {/* Firma Bazlı İzin Matrisi */}
                      {hasAccess && isExpanded && (
                        <div className="px-3 pb-4 border-t border-slate-100 dark:border-white/5 mt-1 pt-3">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5" />
                              Bu firmadaki modül izinleri
                            </h4>
                            <button
                              onClick={() => savePermissions(user.id)}
                              disabled={savingUser === user.id}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-all disabled:opacity-50"
                            >
                              {savingUser === user.id ? 'Kaydediliyor...' : 'İzinleri Kaydet'}
                            </button>
                          </div>
                          
                          <div className="grid gap-2">
                            {MODULES.map(mod => {
                              const modulePerm = perms[mod.key] || {}
                              return (
                                <div key={mod.key} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-28 shrink-0">{mod.label}</span>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {mod.actions.map(action => {
                                      const isOn = modulePerm[action] ?? false
                                      return (
                                        <button
                                          key={action}
                                          onClick={() => togglePermission(user.id, mod.key, action)}
                                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                                            isOn
                                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                              : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                                          }`}
                                        >
                                          {isOn ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                          {ACTION_LABELS[action]}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                
                {nonAdminUsers.length === 0 && (
                  <p className="text-sm text-slate-400 italic text-center py-6">Henüz admin olmayan kullanıcı yok.</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">Detay görmek için soldan bir firma seçin</p>
          </div>
        </div>
      )}
    </div>
  )
}
