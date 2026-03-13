"use client"
import * as React from 'react'
import { X, Camera } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { createPortal } from 'react-dom'

export function ProfileSettings({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, updateUser } = useAuthStore()
  const [username, setUsername] = React.useState(user?.username || '')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<{type: 'success'|'error', text: string} | null>(null)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    if (user?.username) setUsername(user.username)
  }, [user])

  if (!isOpen || !mounted) return null

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      const p = password ? password : undefined;
      const res = await api.put('/api/auth/profile', { username, password: p });
      updateUser({ username: res.data.username });
      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi.' });
      setPassword('');
      
      // Update local storage if username changed? No need, token handles auth.
    } catch(err: any) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Güncelleme başarısız.' });
    } finally {
      setLoading(false)
    }
  }
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
       const res = await api.post('/api/auth/upload-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
       });
       updateUser({ avatar_url: res.data.avatar_url });
       setMessage({ type: 'success', text: 'Profil fotoğrafı güncellendi.' });
    } catch(err: any) {
       setMessage({ type: 'error', text: 'Fotoğraf yüklenemedi.' });
    }
  }

  const avatarUrl = user?.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8000${user.avatar_url}`) : null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="w-full max-w-md p-6 bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-6 text-brand-dark dark:text-white">Profil Ayarları</h2>
        
        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col items-center mb-6">
          <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {avatarUrl ? (
               <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
               <span className="text-3xl font-bold text-slate-400">{user?.username?.substring(0,2).toUpperCase() || 'U'}</span>
            )}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
            >
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Değiştir</span>
            </div>
            <input type="file" className="hidden" ref={fileInputRef} accept="image/png, image/jpeg, image/webp" onChange={handleAvatarUpload} />
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-1">Kullanıcı Adı</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-1">Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors">
               İptal
             </button>
             <button disabled={loading} type="submit" className="px-6 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-colors flex items-center gap-2">
               {loading && <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>}
               {loading ? 'Kaydediliyor...' : 'Kaydet'}
             </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
