import * as React from "react"
import { Shield, Edit2, Trash2, UserX, UserCheck } from "lucide-react"
import { showContextMenu } from "@/components/ui/ContextMenu"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useAdminStore } from "@/stores/adminStore"
import { useAuthStore } from "@/store/authStore"

export function UserCard({ user, onClick }: { user: any, onClick: () => void }) {
  const { deleteUser, updateUser } = useAdminStore()
  const { user: currentUser } = useAuthStore()
  const isSuperAdmin = currentUser?.role === 'super_admin'
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)

  const roleColors: any = {
    super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
    editor: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    viewer: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    const items: any[] = [
      {
        label: 'Düzenle',
        icon: <Edit2 className="w-full h-full" />,
        onClick: onClick,
      },
      {
        label: user.is_active ? 'Devre Dışı Bırak' : 'Aktif Et',
        icon: user.is_active
          ? <UserX className="w-full h-full" />
          : <UserCheck className="w-full h-full" />,
        onClick: () => updateUser(user.id, { is_active: !user.is_active }),
      },
    ]

    // Super admin ise silme seçeneği göster, kendi hesabını silemsein
    if (isSuperAdmin && user.id !== currentUser?.id) {
      items.push({
        label: 'Kullanıcıyı Sil',
        icon: <Trash2 className="w-full h-full" />,
        onClick: () => setIsDeleteConfirmOpen(true),
        variant: 'destructive' as const,
        separator: true,
      })
    }

    showContextMenu(e, items)
  }

  return (
    <>
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Kullanıcıyı Sil"
        description={`${user.name} (@${user.username}) kullanıcısını ve tüm verilerini kalıcı olarak silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz.`}
        onConfirm={() => deleteUser(user.id)}
        confirmText="Evet, Kalıcı Olarak Sil"
        variant="destructive"
      />

      <div
        onClick={onClick}
        onContextMenu={handleContextMenu}
        className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-xl transition-all cursor-pointer group hover:border-indigo-500/50 select-none"
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-inner">
                {user.avatar_url ? (
                  <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar_url}`} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>

            <div>
              <h3 className="font-bold text-brand-dark dark:text-white text-lg leading-tight group-hover:text-indigo-500 transition-colors">{user.name}</h3>
              <p className="text-xs text-slate-500 font-medium">@{user.username}</p>
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[200px]">
                {user.role === 'super_admin' ? (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                    SÜPER ADMİN (TÜM FİRMALAR)
                  </span>
                ) : user.company_accesses && user.company_accesses.length > 0 ? (
                  user.company_accesses.map((access: any) => (
                    <span key={access.project_id} className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 truncate max-w-[120px]" title={access.project_name}>
                      {access.project_name}
                    </span>
                  ))
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 dark:bg-slate-500/20 dark:text-slate-400">
                    Firma Yok
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors"
            title="Düzenle"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-medium text-slate-500">
          <div>Son Giriş: <span className="text-brand-dark dark:text-gray-300 font-bold">{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Hiç'}</span></div>
          <div className="flex items-center gap-2">
            {user.role === 'super_admin' && <Shield className="w-4 h-4 text-purple-500" />}
            <span className="text-[10px] text-slate-400 italic">Sağ tık → işlemler</span>
          </div>
        </div>
      </div>
    </>
  )
}
