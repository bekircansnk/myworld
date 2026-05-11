"use client"

import * as React from "react"
import { useAdminStore } from "@/stores/adminStore"
import { Users, Shield, Activity, BarChart, Search, Plus, Building2, Tag } from "lucide-react"
import { CreateUserModal } from "./CreateUserModal"
import { UserCard } from "./UserCard"
import { UserDetailPanel } from "./UserDetailPanel"
import { UserPermissionsPanel } from "./UserPermissionsPanel"
import { RoleManagementPanel } from "./RoleManagementPanel"
import { useAuthStore } from "@/store/authStore"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

export function AdminPanel() {
  const { 
    users, stats, activityLogs, roleTemplates, isLoading,
    fetchUsers, fetchStats, fetchActivityLogs, fetchRoleTemplates 
  } = useAdminStore()
  
  const [activeTab, setActiveTab] = React.useState<'dashboard'|'users'|'permissions'|'roles'|'logs'>('dashboard')
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<any>(null)
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role === 'super_admin'
  
  React.useEffect(() => {
    fetchUsers()
    fetchStats()
    fetchActivityLogs()
    fetchRoleTemplates()
  }, [])

  const tabs = [
    { id: 'dashboard', label: 'Özet', icon: BarChart },
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'permissions', label: 'Firmalar & İzinler', icon: Shield },
    { id: 'roles', label: 'Roller', icon: Tag },
    { id: 'logs', label: 'Loglar', icon: Activity },
  ]

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-dark dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-500" />
            Yönetim Paneli
          </h1>
          <p className="text-sm text-brand-gray dark:text-gray-400 mt-1">Sistem erişimlerini, kullanıcıları ve rolleri yönetin.</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-slate-200/60 dark:border-white/10 flex-wrap gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* İÇERİK */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-24 lg:pb-0">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm flex items-center justify-between">
                  <div>
                     <p className="text-sm font-semibold text-slate-500 mb-1">Toplam Kullanıcı</p>
                     <h3 className="text-3xl font-black text-brand-dark dark:text-white">{stats.total_users}</h3>
                     <div className="mt-2 flex items-center gap-3 text-xs font-medium">
                        <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">{stats.active_users} Aktif</span>
                        <span className="text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-lg">{stats.inactive_users} Pasif</span>
                     </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                     <Users className="w-8 h-8 text-indigo-500" />
                  </div>
               </div>
               
               <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm flex items-center justify-between">
                  <div>
                     <p className="text-sm font-semibold text-slate-500 mb-1">Rol Dağılımı</p>
                     <div className="space-y-2 mt-3">
                        {Object.entries(stats.role_distribution).map(([role, count]) => (
                           <div key={role} className="flex items-center justify-between gap-4 text-xs font-bold">
                              <span className="text-brand-dark dark:text-gray-300 capitalize flex items-center gap-1.5">
                                 <span className={`w-2 h-2 rounded-full ${role === 'super_admin' ? 'bg-purple-500' : role === 'admin' ? 'bg-indigo-500' : role === 'editor' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                 {role.replace('_', ' ')}
                              </span>
                              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{count}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
               
               <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm flex flex-col justify-center">
                  <p className="text-sm font-semibold text-slate-500 mb-4">Sistem Kullanımı</p>
                  <div className="flex justify-between items-end border-b border-slate-100 dark:border-white/10 pb-2 mb-2">
                     <span className="text-sm font-bold text-slate-600 dark:text-gray-300">Görevler</span>
                     <span className="text-lg font-black text-indigo-500">{stats.total_tasks}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-100 dark:border-white/10 pb-2 mb-2">
                     <span className="text-sm font-bold text-slate-600 dark:text-gray-300">Notlar</span>
                     <span className="text-lg font-black text-amber-500">{stats.total_notes}</span>
                  </div>
                  <div className="flex justify-between items-end">
                     <span className="text-sm font-bold text-slate-600 dark:text-gray-300">Etkinlikler</span>
                     <span className="text-lg font-black text-emerald-500">{stats.total_events}</span>
                  </div>
               </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm overflow-hidden p-6">
              <h3 className="text-lg font-bold mb-4">Son Aktiviteler</h3>
              <div className="space-y-3">
                 {activityLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                       <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <Activity className="w-5 h-5 text-indigo-500" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-brand-dark dark:text-white">
                             {log.username || 'Sistem'} <span className="font-normal text-slate-500">— {log.action}</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{log.module} modülü • {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm', { locale: tr })}</p>
                       </div>
                    </div>
                 ))}
                 {activityLogs.length === 0 && <p className="text-sm text-slate-500 italic">Henüz aktivite yok.</p>}
              </div>
            </div>
          </div>
        )}
        
        {/* USERS TAB */}
        {activeTab === 'users' && (
           <div className="space-y-6">
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm">
                 <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                       type="text" 
                       placeholder="Kullanıcı ara..." 
                       className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                 </div>
                 <button onClick={() => setIsCreateModalOpen(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Kullanıcı Ekle
                 </button>
              </div>
              
              {isLoading ? (
                 <div className="text-center py-12">Yükleniyor...</div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => (
                       <UserCard key={user.id} user={user} onClick={() => setSelectedUser(user)} />
                    ))}
                 </div>
              )}
           </div>
        )}
        
        {/* FIRMALAR & İZİNLER TAB (birleştirilmiş) */}
        {activeTab === 'permissions' && (
           <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm overflow-hidden p-6">
              <UserPermissionsPanel users={users} roleTemplates={roleTemplates} isSuperAdmin={isSuperAdmin} />
           </div>
        )}

        {/* ROLLER TAB */}
        {activeTab === 'roles' && (
           <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm overflow-hidden p-6">
              <RoleManagementPanel roleTemplates={roleTemplates} />
           </div>
        )}
        
        {/* LOGS TAB */}
        {activeTab === 'logs' && (
           <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-white/10">
                 <h3 className="text-lg font-bold">Sistem Aktiviteleri</h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500">
                       <tr>
                          <th className="px-6 py-3">Tarih</th>
                          <th className="px-6 py-3">Kullanıcı</th>
                          <th className="px-6 py-3">Aksiyon</th>
                          <th className="px-6 py-3">Modül</th>
                          <th className="px-6 py-3">IP Adresi</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                       {activityLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                             <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                                {format(new Date(log.created_at), 'dd MMM HH:mm', { locale: tr })}
                             </td>
                             <td className="px-6 py-4 font-bold text-brand-dark dark:text-white">
                                {log.username || 'Sistem'}
                             </td>
                             <td className="px-6 py-4">
                                <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md text-xs font-bold">
                                   {log.action}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-slate-500">{log.module}</td>
                             <td className="px-6 py-4 text-xs font-mono text-slate-400">{log.ip_address || '-'}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
        
      </div>
      
      {/* Modals & Panels */}
      <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} roleTemplates={roleTemplates} onCreate={(data: any) => useAdminStore.getState().createUser(data)} />
      <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} onUpdate={(id: number, data: any) => useAdminStore.getState().updateUser(id, data)} />
    </div>
  )
}
