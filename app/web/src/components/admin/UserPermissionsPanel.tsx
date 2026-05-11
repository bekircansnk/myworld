"use client"

import * as React from "react"
import { api } from "@/lib/api"
import { Building2, Users, Plus, Trash2, ChevronDown, Shield, Check, X, EyeOff, Eye, Pencil, Tag, Loader2 } from "lucide-react"
import { useProjectStore } from "@/stores/projectStore"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

const MODULES = [
  { key: 'dashboard', label: 'Kontrol Paneli', actions: ['view'] },
  { key: 'tasks', label: 'Görevler', actions: ['view', 'edit', 'delete'] },
  { key: 'calendar', label: 'Takvim', actions: ['view', 'edit'] },
  { key: 'notes', label: 'Notlar', actions: ['view', 'edit'] },
  { key: 'ai_chat', label: 'AI Sohbet', actions: ['view'] },
  { key: 'ads', label: 'Reklam', actions: ['view', 'edit'] },
  { key: 'photo_tracking', label: 'Fotoğraf Takip', actions: ['view', 'edit'] },
]

type PermState = 'disabled' | 'view' | 'edit'

function getPermState(perm: any): PermState {
  if (!perm || perm.view === false) return 'disabled'
  if (perm.edit === true) return 'edit'
  return 'view'
}

function permStateToObj(state: PermState, hasDelete?: boolean): any {
  switch (state) {
    case 'disabled': return { view: false, edit: false, ...(hasDelete ? { delete: false } : {}) }
    case 'view': return { view: true, edit: false, ...(hasDelete ? { delete: false } : {}) }
    case 'edit': return { view: true, edit: true, ...(hasDelete ? { delete: true } : {}) }
  }
}

const PERM_BUTTON_STYLES: Record<PermState, string> = {
  disabled: 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700',
  view: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
  edit: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
}

const PERM_LABELS: Record<PermState, { icon: any; text: string }> = {
  disabled: { icon: EyeOff, text: 'Devre Dışı' },
  view: { icon: Eye, text: 'Görüntüle' },
  edit: { icon: Pencil, text: 'Düzenle' },
}

interface CompanyAccess {
  project_id: number
  project_name: string
  permissions: Record<string, any>
  is_owner: boolean
}

// In-app düzenleme modalı (prompt yerine)
function InlineEditModal({ isOpen, onClose, title, defaultValue, onSave }: {
  isOpen: boolean; onClose: () => void; title: string; defaultValue: string; onSave: (val: string) => void
}) {
  const [value, setValue] = React.useState(defaultValue)
  React.useEffect(() => { if (isOpen) setValue(defaultValue) }, [isOpen, defaultValue])
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[99998] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-brand-dark dark:text-white">{title}</h3>
        <input autoFocus value={value} onChange={e => setValue(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">İptal</button>
          <button onClick={() => { onSave(value); onClose() }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all">Kaydet</button>
        </div>
      </div>
    </div>
  )
}

// Firma düzenleme modalı (ad + renk)
function CompanyEditModal({ isOpen, onClose, project, onSave }: {
  isOpen: boolean; onClose: () => void; project: any; onSave: (name: string, color: string) => void
}) {
  const [name, setName] = React.useState('')
  const [color, setColor] = React.useState('#6366f1')
  React.useEffect(() => { if (isOpen && project) { setName(project.name); setColor(project.color || '#6366f1') } }, [isOpen, project])
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[99998] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-brand-dark dark:text-white">Firmayı Düzenle</h3>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Firma Adı</label>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Renk</label>
          <div className="flex items-center gap-3">
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
            <input value={color} onChange={e => setColor(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">İptal</button>
          <button onClick={() => { onSave(name, color); onClose() }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all">Kaydet</button>
        </div>
      </div>
    </div>
  )
}

export function UserPermissionsPanel({ 
  users,
  isSuperAdmin 
}: { 
  users: any[]
  isSuperAdmin: boolean 
}) {
  const [expandedUser, setExpandedUser] = React.useState<number | null>(null)
  const [userCompanies, setUserCompanies] = React.useState<Record<number, CompanyAccess[]>>({})
  const [editingPerms, setEditingPerms] = React.useState<Record<string, Record<string, any>>>({})
  const [loading, setLoading] = React.useState<number | null>(null)
  const [saving, setSaving] = React.useState<string | null>(null)
  const [addingCompany, setAddingCompany] = React.useState<number | null>(null)
  const [allProjects, setAllProjects] = React.useState<any[]>([])
  const { projects } = useProjectStore()

  // Firma yönetimi modal state'leri
  const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = React.useState(false)
  const [editingProject, setEditingProject] = React.useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [deleteProjectId, setDeleteProjectId] = React.useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const deleteProjectName = allProjects.find(p => p.id === deleteProjectId)?.name || ''

  React.useEffect(() => {
    setAllProjects(projects)
  }, [projects])

  const fetchUserCompanies = async (userId: number) => {
    setLoading(userId)
    try {
      const resp = await api.get(`/api/admin/users/${userId}/companies`)
      setUserCompanies(prev => ({ ...prev, [userId]: resp.data }))
      const permMap: Record<string, Record<string, any>> = {}
      for (const access of resp.data) {
        permMap[`${userId}-${access.project_id}`] = access.permissions || {}
      }
      setEditingPerms(prev => ({ ...prev, ...permMap }))
    } catch (e) { console.error(e) }
    setLoading(null)
  }

  const toggleUser = (userId: number) => {
    if (expandedUser === userId) {
      setExpandedUser(null)
    } else {
      setExpandedUser(userId)
      fetchUserCompanies(userId)
    }
  }

  const grantAccess = async (userId: number, projectId: number) => {
    try {
      const defaultPerms: Record<string, any> = {}
      MODULES.forEach(m => {
        defaultPerms[m.key] = { view: true, edit: false }
        if (m.actions.includes('delete')) defaultPerms[m.key].delete = false
      })
      await api.post(`/api/admin/users/${userId}/companies/${projectId}`, { permissions: defaultPerms })
      setAddingCompany(null)
      fetchUserCompanies(userId)
    } catch (e) { console.error(e) }
  }

  const revokeAccess = async (userId: number, projectId: number) => {
    try {
      await api.delete(`/api/admin/users/${userId}/companies/${projectId}`)
      fetchUserCompanies(userId)
    } catch (e) { console.error(e) }
  }

  const cyclePermission = (userId: number, projectId: number, moduleKey: string) => {
    const key = `${userId}-${projectId}`
    const current = editingPerms[key] || {}
    const modulePerm = current[moduleKey] || {}
    const state = getPermState(modulePerm)
    const mod = MODULES.find(m => m.key === moduleKey)
    const hasDelete = mod?.actions.includes('delete')
    
    let nextState: PermState
    if (state === 'disabled') nextState = 'view'
    else if (state === 'view') nextState = mod?.actions.includes('edit') ? 'edit' : 'disabled'
    else nextState = 'disabled'
    
    setEditingPerms(prev => ({
      ...prev,
      [key]: { ...current, [moduleKey]: permStateToObj(nextState, hasDelete) }
    }))
  }

  const savePermissions = async (userId: number, projectId: number) => {
    const key = `${userId}-${projectId}`
    setSaving(key)
    try {
      await api.put(`/api/admin/users/${userId}/companies/${projectId}/permissions`, {
        permissions: editingPerms[key] || {}
      })
      fetchUserCompanies(userId)
    } catch (e) { console.error(e) }
    setSaving(null)
  }

  const nonSuperUsers = users.filter(u => u.role !== 'super_admin')

  return (
    <div className="space-y-4">
      {/* In-app Modaller */}
      <InlineEditModal
        isOpen={isNewCompanyModalOpen}
        onClose={() => setIsNewCompanyModalOpen(false)}
        title="Yeni Firma Ekle"
        defaultValue=""
        onSave={async (name) => {
          if (name.trim()) await useProjectStore.getState().addProject({ name, color: "#6366f1" })
        }}
      />
      <CompanyEditModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingProject(null) }}
        project={editingProject}
        onSave={async (name, color) => {
          if (editingProject) {
            await useProjectStore.getState().updateProject(editingProject.id, { name, color })
          }
        }}
      />
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Firmayı Sil"
        description={`"${deleteProjectName}" firmasını silmek istediğinize emin misiniz?\nBu işlem geri alınamaz.`}
        confirmText="Sil"
        onConfirm={async () => {
          if (deleteProjectId) await useProjectStore.getState().deleteProject(deleteProjectId)
          setDeleteProjectId(null)
        }}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-brand-dark dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            Firmalar & İzin Yönetimi
          </h3>
          <p className="text-xs text-slate-500 mt-1">Kullanıcıya tıklayarak firma erişimlerini ve modül izinlerini yönetin.</p>
        </div>
      </div>

      {nonSuperUsers.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Henüz yönetilecek kullanıcı yok.</p>
        </div>
      )}

      {nonSuperUsers.map(user => {
        const isExpanded = expandedUser === user.id
        const companies = userCompanies[user.id] || user.company_accesses || []
        const isLoading = loading === user.id
        const isAddingCompany = addingCompany === user.id
        const unassignedProjects = allProjects.filter(
          p => !companies.some(c => c.project_id === p.id)
        )

        return (
          <div key={user.id} className={`rounded-2xl border transition-all overflow-hidden ${
            isExpanded 
              ? 'border-indigo-300 dark:border-indigo-500/30 shadow-lg shadow-indigo-500/5'
              : 'border-slate-200 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/20'
          }`}>
            <button
              onClick={() => toggleUser(user.id)}
              className={`w-full flex items-center justify-between p-4 transition-all ${
                isExpanded ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-black shrink-0">
                  {user.name?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-brand-dark dark:text-white">{user.name}</p>
                  <p className="text-[10px] text-slate-500">@{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                  {companies.length} firma
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-800/50">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Yükleniyor...</span>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {companies.length === 0 && !isAddingCompany && (
                      <div className="text-center py-6 text-slate-400 text-sm">
                        Bu kullanıcının hiçbir firmaya erişimi yok.
                      </div>
                    )}

                    {companies.map(company => {
                      const key = `${user.id}-${company.project_id}`
                      const perms = editingPerms[key] || company.permissions || {}
                      const isSaving = saving === key

                      return (
                        <div key={company.project_id} className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800/80 border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-indigo-500" />
                              <span className="text-sm font-bold text-brand-dark dark:text-white">{company.project_name}</span>
                              {company.is_owner && (
                                <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md">SAHİP</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => savePermissions(user.id, company.project_id)}
                                disabled={isSaving}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                              >
                                {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Kaydet
                              </button>
                              
                              {!company.is_owner && (
                                <button
                                  onClick={() => revokeAccess(user.id, company.project_id)}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" /> Kaldır
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="px-4 py-3">
                            <div className="grid gap-2">
                              {MODULES.map(mod => {
                                const modulePerm = perms[mod.key] || {}
                                const state = getPermState(modulePerm)
                                const StateIcon = PERM_LABELS[state].icon
                                
                                return (
                                  <div key={mod.key} className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-28 shrink-0">{mod.label}</span>
                                    <button
                                      onClick={() => cyclePermission(user.id, company.project_id, mod.key)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 border min-w-[110px] justify-center ${PERM_BUTTON_STYLES[state]}`}
                                    >
                                      <StateIcon className="w-3 h-3" />
                                      {PERM_LABELS[state].text}
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {isAddingCompany ? (
                      <div className="rounded-xl border border-dashed border-indigo-300 dark:border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-500/5 p-4">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3">Firma Ekle</p>
                        {unassignedProjects.length === 0 ? (
                          <p className="text-xs text-slate-400">Atanacak firma kalmadı.</p>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {unassignedProjects.map(p => (
                              <button
                                key={p.id}
                                onClick={() => grantAccess(user.id, p.id)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all text-left group"
                              >
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color || '#6366f1' }} />
                                <span className="text-xs font-semibold text-brand-dark dark:text-white truncate group-hover:text-indigo-600">{p.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <button onClick={() => setAddingCompany(null)} className="mt-3 text-[10px] font-bold text-slate-400 hover:text-slate-600">İptal</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingCompany(user.id)}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 text-sm font-bold text-slate-400 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Firma Ekle
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* TÜM FİRMALARIN YÖNETİMİ ALANI */}
      {isSuperAdmin && (
        <div className="mt-12 space-y-4 border-t-2 border-slate-100 dark:border-white/5 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-brand-dark dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                Firma Yönetimi
              </h3>
              <p className="text-xs text-slate-500 mt-1">Sistemdeki tüm firmaları görüntüleyin, düzenleyin ve silin.</p>
            </div>
            <button
              onClick={() => setIsNewCompanyModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Yeni Firma
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allProjects.map(project => (
              <div key={project.id} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-4 transition-all hover:border-indigo-200 dark:hover:border-indigo-500/30 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: project.color || '#6366f1' }} />
                  <div>
                    <h4 className="text-sm font-bold text-brand-dark dark:text-white">{project.name}</h4>
                    <p className="text-[10px] text-slate-400">ID: {project.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingProject(project); setIsEditModalOpen(true) }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-slate-400" />
                  </button>
                  <button 
                    onClick={() => { setDeleteProjectId(project.id); setIsDeleteDialogOpen(true) }}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>
            ))}
            {allProjects.length === 0 && (
              <div className="col-span-full text-center py-6 text-slate-400 text-sm">
                Sistemde hiç firma bulunmuyor.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
