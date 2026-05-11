import * as React from "react"
import { createPortal } from "react-dom"
import { X, Check } from "lucide-react"

export function CreateUserModal({ isOpen, onClose, roleTemplates, onCreate }: any) {
  const [formData, setFormData] = React.useState({
     username: '', password: '', name: '', email: '', role: 'viewer', permissions: {}
  })
  
  const [selectedTemplate, setSelectedTemplate] = React.useState('viewer_only')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
     if (roleTemplates && roleTemplates[selectedTemplate]) {
        const tpl = roleTemplates[selectedTemplate]
        setFormData(prev => ({
           ...prev,
           role: tpl.role,
           permissions: tpl.permissions
        }))
     }
  }, [selectedTemplate, roleTemplates])

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
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200/50 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
         <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="text-xl font-black text-brand-dark dark:text-white">Yeni Kullanıcı Ekle</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
               <X className="w-5 h-5 text-slate-500" />
            </button>
         </div>
         
         <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {error && <div className="p-3 mb-6 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl text-sm font-bold">{error}</div>}
            
            <form id="create-user-form" onSubmit={handleSubmit} className="space-y-5">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Ad Soyad</label>
                     <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Kullanıcı Adı</label>
                     <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Şifre</label>
                     <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">E-Posta (Opsiyonel)</label>
                     <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
               </div>
               
               <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Hızlı Yetki Şablonu Seçin</label>
                  <div className="grid grid-cols-2 gap-3">
                     {Object.entries(roleTemplates).map(([key, tpl]: [string, any]) => (
                        <button
                           key={key} type="button"
                           onClick={() => setSelectedTemplate(key)}
                           className={`p-3 rounded-xl border text-left transition-all ${selectedTemplate === key ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-500/20 dark:border-indigo-500' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-white/10 hover:border-slate-300'}`}
                        >
                           <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-bold ${selectedTemplate === key ? 'text-indigo-600 dark:text-indigo-400' : 'text-brand-dark dark:text-white'}`}>{tpl.label}</span>
                              {selectedTemplate === key && <Check className="w-4 h-4 text-indigo-500" />}
                           </div>
                           <p className="text-[10px] text-slate-500 leading-tight">{tpl.description}</p>
                        </button>
                     ))}
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 font-medium flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                     Not: Spesifik izinleri kullanıcı oluşturulduktan sonra İzinler sekmesinden ayarlayabilirsiniz.
                  </p>
               </div>
            </form>
         </div>
         
         <div className="p-6 border-t border-slate-100 dark:border-white/10 shrink-0 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
               İptal
            </button>
            <button disabled={loading} form="create-user-form" type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
               {loading ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Check className="w-4 h-4" />}
               Kullanıcı Oluştur
            </button>
         </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
