"use client"
import * as React from 'react'
import { X, Camera } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useProjectStore } from '@/stores/projectStore'
import { createPortal } from 'react-dom'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export function ProfileSettings({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, updateUser } = useAuthStore()
  const [username, setUsername] = React.useState(user?.username || '')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<{type: 'success'|'error', text: string} | null>(null)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { notificationsEnabled, setNotificationsEnabled, reminderOffsetMinutes, setReminderOffset } = useSettingsStore()

  // E-posta bildirim ayarları states
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = React.useState(true)
  const [emailReminderOffsetMinutes, setEmailReminderOffsetMinutes] = React.useState(60)
  const [dailySummaryEnabled, setDailySummaryEnabled] = React.useState(true)

  const [mounted, setMounted] = React.useState(false)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    if (user?.username) setUsername(user.username)
    if (user?.settings) {
      setEmailNotificationsEnabled(user.settings.email_notifications_enabled !== false)
      setEmailReminderOffsetMinutes(user.settings.email_reminder_offset_minutes ?? 60)
      setDailySummaryEnabled(user.settings.daily_summary_enabled !== false)
    }
  }, [user])

  if (!isOpen || !mounted) return null

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      const p = password ? password : undefined;
      const res = await api.put('/api/auth/profile', { 
        username, 
        password: p,
        settings: {
          ...user?.settings,
          email_notifications_enabled: emailNotificationsEnabled,
          email_reminder_offset_minutes: emailReminderOffsetMinutes,
          daily_summary_enabled: dailySummaryEnabled
        }
      });
      updateUser({ 
        username: res.data.username,
        settings: res.data.settings
      });
      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi.' });
      setPassword('');
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

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const avatarUrl = user?.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${backendUrl}${user.avatar_url}`) : null;

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
            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-2">Şifre Yönetimi</label>
            <button
               type="button"
               onClick={async () => {
                  try {
                     await api.post('/api/auth/forgot-password', { email: user?.email });
                     setMessage({ type: 'success', text: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
                  } catch (err) {
                     setMessage({ type: 'error', text: 'Sıfırlama bağlantısı gönderilemedi. Lütfen sistem yöneticinize başvurun.' });
                  }
               }}
               className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-brand-dark dark:text-white font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
               ✉️ Şifremi E-posta ile Sıfırla
            </button>
            <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
               Şifre değişikliği güvenliğiniz için yalnızca e-posta onayı ile yapılmaktadır.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/10 mt-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-3">Mobil Bildirimler</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">Bildirimlere İzin Ver</span>
              <button 
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${notificationsEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            
            {notificationsEnabled && (
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-1">Varsayılan Hatırlatma (Görev/Etkinlik öncesi)</label>
                <select
                  value={reminderOffsetMinutes}
                  onChange={(e) => setReminderOffset(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium appearance-none"
                >
                  <option value={15} className="dark:bg-slate-800 text-black dark:text-white">15 Dakika Önce</option>
                  <option value={30} className="dark:bg-slate-800 text-black dark:text-white">30 Dakika Önce</option>
                  <option value={60} className="dark:bg-slate-800 text-black dark:text-white">1 Saat Önce</option>
                  <option value={1440} className="dark:bg-slate-800 text-black dark:text-white">1 Gün Önce</option>
                </select>
              </div>
            )}
          </div>

          {/* E-posta Bildirim Ayarları */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/10 mt-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-3">E-posta Bildirimleri</h3>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">Hatırlatıcı E-postaları Al</span>
              <button 
                type="button"
                onClick={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${emailNotificationsEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${emailNotificationsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            
            {emailNotificationsEnabled && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-1">E-posta Hatırlatma Süresi</label>
                <select
                  value={emailReminderOffsetMinutes}
                  onChange={(e) => setEmailReminderOffsetMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium appearance-none"
                >
                  <option value={15} className="dark:bg-slate-800 text-black dark:text-white">15 Dakika Önce</option>
                  <option value={30} className="dark:bg-slate-800 text-black dark:text-white">30 Dakika Önce</option>
                  <option value={60} className="dark:bg-slate-800 text-black dark:text-white">1 Saat Önce</option>
                  <option value={120} className="dark:bg-slate-800 text-black dark:text-white">2 Saat Önce</option>
                  <option value={180} className="dark:bg-slate-800 text-black dark:text-white">3 Saat Önce</option>
                  <option value={360} className="dark:bg-slate-800 text-black dark:text-white">6 Saat Önce</option>
                  <option value={720} className="dark:bg-slate-800 text-black dark:text-white">12 Saat Önce</option>
                  <option value={1440} className="dark:bg-slate-800 text-black dark:text-white">1 Gün Önce</option>
                  <option value={2880} className="dark:bg-slate-800 text-black dark:text-white">2 Gün Önce</option>
                </select>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">Yarının Plan Özetini E-posta Al</span>
              <button 
                type="button"
                onClick={() => setDailySummaryEnabled(!dailySummaryEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${dailySummaryEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${dailySummaryEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/10 mt-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-3">Sistem & Önbellek</h3>
            <button
               type="button"
               onClick={() => setIsResetConfirmOpen(true)}
               className="w-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors py-3 rounded-xl flex items-center justify-center gap-2"
            >
               🔄 Tüm Sistemi ve Önbelleği Temizle
            </button>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Eğer mobil cihazınızda veriler güncellenmiyorsa veya boş ekran hatası alıyorsanız bu butonu kullanın.
            </p>
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
          
          {user?.role === 'super_admin' && (
            <div className="pt-4 border-t border-slate-100 dark:border-white/10 mt-6">
              <button 
                 type="button" 
                 onClick={() => {
                    onClose();
                    // viewMode'u admin olarak değiştir
                    useProjectStore.getState().setViewMode('admin');
                 }}
                 className="w-full py-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 font-bold text-sm hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors flex justify-center items-center gap-2"
              >
                 🛡️ Sistem Yönetim Paneline Git
              </button>
            </div>
          )}
        </form>
      </div>
      
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        title="Sistemi ve Önbelleği Temizle"
        description="Bu işlem cihazınızdaki tüm uygulama önbelleğini (Önceki sürümler, çevrimdışı veriler) silecek ve sistemi yeniden başlatacaktır. Kullanıcı bilgileriniz silinmeyecek. Onaylıyor musunuz?"
        onConfirm={async () => {
          localStorage.clear();
          sessionStorage.clear();
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
          }
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map(r => r.unregister()));
          }
          window.location.reload();
        }}
      />
    </div>
  )

  return createPortal(modalContent, document.body)
}
