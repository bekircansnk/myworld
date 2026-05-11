import * as React from "react"
import { createPortal } from "react-dom"
import { X, Check, UserPlus } from "lucide-react"

export function CreateUserModal({ isOpen, onClose, onCreate }: any) {
  const [formData, setFormData] = React.useState({
     username: '', password: '', name: '', email: '', role: 'viewer', permissions: {}
  })
  
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     setLoading(true)
     setError('')
     try {
        await onCreate(formData)
        onClose()
        setFormData({ username: '', password: '', name: '', email: '', role: 'viewer', permissions: {} })
     } catch(err: any) {
        setError(err.response?.data?.detail || 'Kullanıcı oluşturulurken bir hata oluştu.')
     } finally {
        setLoading(false)
     }
  }

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200/50 dark:border-white/10 overflow-hidden flex flex-col">
         <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-indigo-500" />
               </div>
               <h2 className="text-xl font-black text-brand-dark dark:text-white">Yeni Kullanıcı Ekle</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
               <X className="w-5 h-5 text-slate-500" />
            </button>
         </div>
         
         <div className="p-6">
            {error && <div className="p-3 mb-6 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl text-sm font-bold border border-rose-100 dark:border-rose-500/20">{error}</div>}
            
            <form id="create-user-form" onSubmit={handleSubmit} className="space-y-5">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Ad Soyad</label>
                     <input required placeholder="Örn: Ahmet Yılmaz" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Kullanıcı Adı</label>
                     <input required placeholder="Örn: ahmetyilmaz" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Şifre</label>
                     <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">E-Posta (Zorunlu)</label>
                     <input required type="email" placeholder="ahmet@firma.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
               </div>

               <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center gap-2 mb-1">
                     <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                     Erişim Notu
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400/80 leading-relaxed">
                     Yeni kullanıcılar varsayılan olarak "Normal" hesap olarak oluşturulur. Firma ve modül yetkilerini kullanıcı oluşturulduktan sonra <strong className="font-black">Firmalar & İzinler</strong> sekmesinden yönetebilirsiniz.
                  </p>
               </div>
            </form>
         </div>
         
         <div className="p-6 border-t border-slate-100 dark:border-white/10 shrink-0 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-brand-dark dark:hover:text-white transition-colors">
               İptal
            </button>
            <button disabled={loading} form="create-user-form" type="submit" className="px-8 py-2.5 rounded-xl text-sm font-bold bg-brand-dark dark:bg-white text-white dark:text-brand-dark shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
               {loading ? <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : <Check className="w-4 h-4" />}
               Kullanıcıyı Kaydet
            </button>
         </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
