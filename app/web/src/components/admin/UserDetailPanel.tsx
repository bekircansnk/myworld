import * as React from "react"
import { createPortal } from "react-dom"
import { X, Save, Key, UserCheck, UserX, Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useAdminStore } from "@/stores/adminStore"
import { useAuthStore } from "@/store/authStore"

export function UserDetailPanel({ user, onClose, onUpdate }: any) {
  const [formData, setFormData] = React.useState({
     name: '', username: '', email: '', is_active: true, password: ''
  })
  const [loading, setLoading] = React.useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const { deleteUser } = useAdminStore()
  const { user: currentUser } = useAuthStore()
  const isSuperAdmin = currentUser?.role === 'super_admin'

  React.useEffect(() => {
     if (user) {
        setFormData({
           name: user.name,
           username: user.username,
           email: user.email || '',
           is_active: user.is_active,
           password: ''
        })
     }
  }, [user])

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     setLoading(true)
     try {
        const updateData: any = { ...formData }
        if (!updateData.password) delete updateData.password
        
        await onUpdate(user.id, updateData)
        onClose()
     } catch(err) {
        console.error(err)
     } finally {
        setLoading(false)
     }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteUser(user.id)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const panelContent = (
    <>
       <div className="fixed inset-0 z-[99998] bg-black/20" onClick={onClose} />
       <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-[99999] border-l border-slate-200 dark:border-white/10 flex flex-col animate-in slide-in-from-right duration-300">
          
          <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
                   {user.avatar_url ? <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar_url}`} className="w-full h-full rounded-full object-cover"/> : user.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                   <h2 className="text-xl font-black text-brand-dark dark:text-white leading-tight">{user.name}</h2>
                   <p className="text-xs text-slate-500 font-medium">@{user.username}</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
             </button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
             <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Hesap Durumu */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                   <div>
                      <p className="text-sm font-bold text-brand-dark dark:text-white flex items-center gap-2">
                         {formData.is_active ? <UserCheck className="w-4 h-4 text-emerald-500"/> : <UserX className="w-4 h-4 text-rose-500"/>}
                         Hesap Durumu
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Devre dışı bırakılan kullanıcılar sisteme giriş yapamaz.</p>
                   </div>
                   <button 
                      type="button" 
                      onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                   >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                </div>
                
                <div className="space-y-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/10 pb-2">Kişisel Bilgiler</h3>
                   <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Ad Soyad</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Kullanıcı Adı</label>
                      <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">E-Posta</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                   </div>
                </div>
                
                <div className="space-y-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/10 pb-2 flex items-center gap-2">
                      <Key className="w-3 h-3" /> Şifre İşlemleri
                   </h3>
                   <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Yeni Şifre (Sıfırlamak için girin)</label>
                      <input type="password" placeholder="Değiştirmek istemiyorsanız boş bırakın" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                   </div>
                </div>
                
             </form>
          </div>
          
          <div className="p-6 border-t border-slate-100 dark:border-white/10 shrink-0 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col gap-3">
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                İptal
              </button>
              <button disabled={loading} form="edit-user-form" type="submit" className="flex-1 py-3 rounded-xl text-sm font-bold bg-brand-dark dark:bg-white text-white dark:text-brand-dark shadow-xl transition-all flex items-center justify-center gap-2">
                {loading ? <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : <Save className="w-4 h-4" />}
                Değişiklikleri Kaydet
              </button>
            </div>

            {isSuperAdmin && user.id !== currentUser?.id && (
              <button 
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="w-full py-3 rounded-xl text-sm font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Kullanıcıyı Tamamen Sil
              </button>
            )}
          </div>
          
          <ConfirmDialog 
            isOpen={isDeleteConfirmOpen}
            onOpenChange={setIsDeleteConfirmOpen}
            title="Kullanıcıyı Sil"
            description={`${user.name} (@${user.username}) isimli kullanıcıyı ve tüm verilerini (görevler, notlar, etkinlikler) kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
            onConfirm={handleDelete}
            confirmText="Evet, Kalıcı Olarak Sil"
            variant="destructive"
          />
       </div>
    </>
  )

  return createPortal(panelContent, document.body)
}
