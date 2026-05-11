"use client"

import * as React from "react"
import { api } from "@/lib/api"
import { Tag, Plus, Pencil, Trash2, Check, X, EyeOff, Eye, Save, Loader2 } from "lucide-react"

// Modül tanımları
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

const PERM_STYLES: Record<PermState, string> = {
  disabled: 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700',
  view: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
  edit: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
}

const PERM_LABELS: Record<PermState, { icon: any; text: string }> = {
  disabled: { icon: EyeOff, text: 'Devre Dışı' },
  view: { icon: Eye, text: 'Görüntüle' },
  edit: { icon: Pencil, text: 'Düzenle' },
}

interface RoleTemplate {
  key: string
  label: string
  description: string
  permissions: Record<string, any>
}

export function RoleManagementPanel({ roleTemplates }: { roleTemplates: Record<string, any> }) {
  const [roles, setRoles] = React.useState<RoleTemplate[]>([])
  const [editingRole, setEditingRole] = React.useState<RoleTemplate | null>(null)
  const [isCreating, setIsCreating] = React.useState(false)
  const [newLabel, setNewLabel] = React.useState("")
  const [newDescription, setNewDescription] = React.useState("")
  const [newPerms, setNewPerms] = React.useState<Record<string, any>>({})
  const [saving, setSaving] = React.useState(false)

  // Rol şablonlarını state'e yükle
  React.useEffect(() => {
    const roleList: RoleTemplate[] = Object.entries(roleTemplates).map(([key, tmpl]: [string, any]) => ({
      key,
      label: tmpl.label,
      description: tmpl.description || '',
      permissions: tmpl.permissions || {}
    }))
    setRoles(roleList)
  }, [roleTemplates])

  const startCreateRole = () => {
    setIsCreating(true)
    setNewLabel("")
    setNewDescription("")
    // Varsayılan: tüm modüller sadece görüntüleme
    const defaultPerms: Record<string, any> = {}
    MODULES.forEach(m => {
      defaultPerms[m.key] = { view: true, edit: false }
      if (m.actions.includes('delete')) defaultPerms[m.key].delete = false
    })
    setNewPerms(defaultPerms)
  }

  const startEditRole = (role: RoleTemplate) => {
    setEditingRole(role)
    setNewLabel(role.label)
    setNewDescription(role.description)
    setNewPerms({ ...role.permissions })
  }

  const cyclePermission = (moduleKey: string) => {
    const modulePerm = newPerms[moduleKey] || {}
    const state = getPermState(modulePerm)
    const mod = MODULES.find(m => m.key === moduleKey)
    const hasDelete = mod?.actions.includes('delete')
    
    let nextState: PermState
    if (state === 'disabled') nextState = 'view'
    else if (state === 'view') nextState = mod?.actions.includes('edit') ? 'edit' : 'disabled'
    else nextState = 'disabled'
    
    setNewPerms(prev => ({
      ...prev,
      [moduleKey]: permStateToObj(nextState, hasDelete)
    }))
  }

  const saveRole = async () => {
    if (!newLabel.trim()) return
    setSaving(true)
    try {
      const roleData = {
        label: newLabel,
        description: newDescription,
        permissions: newPerms
      }
      
      if (editingRole) {
        // Güncelle
        await api.put(`/api/admin/role-templates/${editingRole.key}`, roleData)
        setRoles(prev => prev.map(r => r.key === editingRole.key ? { ...r, ...roleData } : r))
      } else {
        // Yeni oluştur
        const key = newLabel.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        await api.post('/api/admin/role-templates', { ...roleData, key })
        setRoles(prev => [...prev, { key, ...roleData }])
      }
    } catch (e) { console.error(e) }
    setSaving(false)
    setIsCreating(false)
    setEditingRole(null)
  }

  const deleteRole = async (key: string) => {
    try {
      await api.delete(`/api/admin/role-templates/${key}`)
      setRoles(prev => prev.filter(r => r.key !== key))
    } catch (e) { console.error(e) }
  }

  const isEditing = isCreating || editingRole !== null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-brand-dark dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" />
            Rol Şablonları
          </h3>
          <p className="text-xs text-slate-500 mt-1">Önceden tanımlı roller oluşturun ve firma izin atamalarında hızlıca kullanın.</p>
        </div>
        {!isEditing && (
          <button
            onClick={startCreateRole}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Yeni Rol
          </button>
        )}
      </div>

      {/* Rol Düzenleme/Oluşturma Formu */}
      {isEditing && (
        <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-500/30 bg-amber-50/30 dark:bg-amber-500/5 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Rol Adı</label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Örn: E-Ticaret Yöneticisi"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Açıklama</label>
              <input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Kısa açıklama"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">Modül İzinleri</label>
            <div className="grid gap-2">
              {MODULES.map(mod => {
                const modulePerm = newPerms[mod.key] || {}
                const state = getPermState(modulePerm)
                const StateIcon = PERM_LABELS[state].icon
                
                return (
                  <div key={mod.key} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-28 shrink-0">{mod.label}</span>
                    <button
                      onClick={() => cyclePermission(mod.key)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 border min-w-[110px] justify-center ${PERM_STYLES[state]}`}
                    >
                      <StateIcon className="w-3 h-3" />
                      {PERM_LABELS[state].text}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveRole}
              disabled={saving || !newLabel.trim()}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingRole ? 'Güncelle' : 'Kaydet'}
            </button>
            <button
              onClick={() => { setIsCreating(false); setEditingRole(null) }}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Mevcut Roller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map(role => (
          <div key={role.key} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-5 transition-all hover:shadow-md hover:border-amber-200 dark:hover:border-amber-500/20 group">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-black text-brand-dark dark:text-white">{role.label}</h4>
                {role.description && <p className="text-[10px] text-slate-500 mt-0.5">{role.description}</p>}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEditRole(role)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button onClick={() => deleteRole(role.key)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {MODULES.map(mod => {
                const perm = role.permissions?.[mod.key]
                const state = getPermState(perm)
                const colors = state === 'disabled' ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' 
                  : state === 'view' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'
                
                return (
                  <span key={mod.key} className={`text-[9px] font-bold px-2 py-1 rounded-md ${colors}`}>
                    {state === 'disabled' ? <X className="w-2.5 h-2.5 inline mr-0.5" /> : state === 'view' ? <Eye className="w-2.5 h-2.5 inline mr-0.5" /> : <Pencil className="w-2.5 h-2.5 inline mr-0.5" />}
                    {mod.label}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
