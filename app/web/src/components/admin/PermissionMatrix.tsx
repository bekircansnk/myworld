import * as React from "react"
import { Check, X, ShieldAlert } from "lucide-react"

const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'tasks', label: 'Görevler' },
  { key: 'calendar', label: 'Takvim' },
  { key: 'notes', label: 'Notlar' },
  { key: 'ai_chat', label: 'AI Sohbet' },
  { key: 'ads', label: 'Reklam' },
  { key: 'photo_tracking', label: 'Foto. Takip' },
]

export function PermissionMatrix({ users, onUpdateUser }: { users: any[], onUpdateUser: (id: number, perms: any) => void }) {
  
  const handleToggle = (userId: number, moduleKey: string, action: 'view'|'edit') => {
     const user = users.find(u => u.id === userId)
     if (!user || user.role === 'super_admin') return
     
     const currentPerms = user.permissions || {}
     const modulePerms = currentPerms[moduleKey] || { view: false, edit: false }
     
     const newPerms = {
        ...currentPerms,
        [moduleKey]: {
           ...modulePerms,
           [action]: !modulePerms[action]
        }
     }
     
     // Eğer view kapatılırsa edit de kapansın
     if (action === 'view' && modulePerms.view) {
        newPerms[moduleKey].edit = false
     }
     
     // Eğer edit açılırsa view da açılsın
     if (action === 'edit' && !modulePerms.edit) {
        newPerms[moduleKey].view = true
     }
     
     onUpdateUser(userId, newPerms)
  }

  return (
    <div className="crm-table-wrap">
       <table className="crm-table text-sm whitespace-nowrap">
          <thead>
             <tr>
                <th className="crm-table-sticky p-4 border-r min-w-[200px]">
                   <span className="font-bold text-slate-500 dark:text-slate-400">Kullanıcılar</span>
                </th>
                {MODULES.map(mod => (
                   <th key={mod.key} className="p-4 text-center">
                      <span className="font-bold text-brand-dark dark:text-white">{mod.label}</span>
                      <div className="flex justify-center gap-4 mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                         <span>Gör</span>
                         <span>Yaz</span>
                      </div>
                   </th>
                ))}
             </tr>
          </thead>
          <tbody>
             {users.map(user => {
                const isSuper = user.role === 'super_admin'
                
                return (
                   <tr key={user.id} className="group">
                      <td className="crm-table-sticky p-4 border-r">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                               {user.avatar_url ? <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar_url}`} className="w-full h-full rounded-full object-cover"/> : user.name.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                               <p className="font-bold text-brand-dark dark:text-white">{user.name}</p>
                               <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.role}</p>
                            </div>
                         </div>
                      </td>
                      
                      {MODULES.map(mod => {
                         const hasView = isSuper || (user.permissions?.[mod.key]?.view ?? false)
                         const hasEdit = isSuper || (user.permissions?.[mod.key]?.edit ?? false)
                         
                         return (
                            <td key={mod.key} className="p-4 text-center">
                               {isSuper ? (
                                  <div className="flex justify-center items-center h-full">
                                     <ShieldAlert className="w-4 h-4 text-purple-500/50" />
                                  </div>
                               ) : (
                                  <div className="flex justify-center gap-5">
                                     <button 
                                        onClick={() => handleToggle(user.id, mod.key, 'view')}
                                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${hasView ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                                     >
                                        <Check className="w-3 h-3" />
                                     </button>
                                     <button 
                                        onClick={() => handleToggle(user.id, mod.key, 'edit')}
                                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${hasEdit ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                                     >
                                        <Check className="w-3 h-3" />
                                     </button>
                                  </div>
                               )}
                            </td>
                         )
                      })}
                   </tr>
                )
             })}
          </tbody>
       </table>
    </div>
  )
}
