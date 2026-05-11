"use client"

import * as React from "react"
import { api } from "@/lib/api"
import { Building2, Users, ListTodo, Plus, Trash2, ChevronRight, Eye } from "lucide-react"
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
  const [userCompanies, setUserCompanies] = React.useState<Record<number, UserCompanyAccess[]>>({})
  const [loading, setLoading] = React.useState(false)
  const { setSelectedProjectId, setViewMode } = useProjectStore()

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
      // Firmaya atanan kullanıcıları bul
      const allUsers = users.filter(u => u.role !== 'super_admin')
      const accesses: any[] = []
      for (const u of allUsers) {
        const resp = await api.get(`/api/admin/users/${u.id}/companies`)
        if (resp.data.some((c: any) => c.project_id === companyId)) {
          accesses.push(u)
        }
      }
      setCompanyUsers(accesses)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const grantAccess = async (userId: number, projectId: number) => {
    try {
      await api.post(`/api/admin/users/${userId}/companies/${projectId}`)
      fetchCompanyUsers(projectId)
      fetchCompanies()
    } catch (e) { console.error(e) }
  }

  const revokeAccess = async (userId: number, projectId: number) => {
    try {
      await api.delete(`/api/admin/users/${userId}/companies/${projectId}`)
      fetchCompanyUsers(projectId)
      fetchCompanies()
    } catch (e) { console.error(e) }
  }

  const switchToCompany = (companyId: number) => {
    setSelectedProjectId(companyId)
    setViewMode('dashboard')
  }

  const nonAdminUsers = users.filter(u => u.role !== 'super_admin')

  return (
    <div className="flex gap-6 h-full">
      {/* Sol — Firma Listesi */}
      <div className="w-80 shrink-0 space-y-3">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">
          {isSuperAdmin ? `Tüm Firmalar (${companies.length})` : `Firmalarım (${companies.length})`}
        </h3>
        
        {companies.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            Henüz firma yok. Firmalar menüsünden yeni firma ekleyin.
          </div>
        )}

        {companies.map(company => (
          <button
            key={company.id}
            onClick={() => {
              setSelectedCompany(company)
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

      {/* Sağ — Firma Detayı */}
      {selectedCompany ? (
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-white/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-brand-dark dark:text-white flex items-center gap-3">
                <Building2 className="w-6 h-6 text-indigo-500" />
                {selectedCompany.name}
              </h2>
              <p className="text-sm text-slate-500 mt-1">{selectedCompany.task_count} görev • {selectedCompany.user_count} atanmış kullanıcı</p>
            </div>
            <button
              onClick={() => switchToCompany(selectedCompany.id)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> Firmaya Geç
            </button>
          </div>

          {/* Erişim Yönetimi */}
          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-white/10 pb-3">
              Kullanıcı Erişim Yönetimi
            </h3>
            
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">Yükleniyor...</div>
            ) : (
              <div className="space-y-3">
                {nonAdminUsers.map(user => {
                  const hasAccess = companyUsers.some(cu => cu.id === user.id)
                  return (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-black">
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-dark dark:text-white">{user.name}</p>
                          <p className="text-[10px] text-slate-500">@{user.username} • {user.role}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => hasAccess 
                          ? revokeAccess(user.id, selectedCompany.id)
                          : grantAccess(user.id, selectedCompany.id)
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          hasAccess
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400'
                        }`}
                      >
                        {hasAccess ? <><Trash2 className="w-3 h-3" /> Erişimi Kaldır</> : <><Plus className="w-3 h-3" /> Erişim Ver</>}
                      </button>
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
