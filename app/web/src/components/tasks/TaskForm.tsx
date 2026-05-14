"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { useProjectStore } from "@/stores/projectStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Flame, Target, Coffee, Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/toast"

// Öncelik tanımları
const PRIORITIES = [
  {
    value: "urgent",
    label: "Acil",
    icon: Flame,
    activeClass: "bg-rose-500 text-white border-rose-500 shadow-rose-500/30",
    hoverClass: "hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400",
    dotColor: "#f43f5e",
  },
  {
    value: "normal",
    label: "Normal",
    icon: Target,
    activeClass: "bg-indigo-500 text-white border-indigo-500 shadow-indigo-500/30",
    hoverClass: "hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400",
    dotColor: "#6366f1",
  },
  {
    value: "low",
    label: "Bekleyen",
    icon: Coffee,
    activeClass: "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/30",
    hoverClass: "hover:border-emerald-300 hover:text-emerald-600 dark:hover:text-emerald-400",
    dotColor: "#10b981",
  },
]

export function TaskForm() {
  const toast = useToast()
  const { addTask } = useTaskStore()
  const { selectedProjectId } = useProjectStore()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [aiLoading, setAiLoading] = React.useState(false)

  const [formData, setFormData] = React.useState<{
    title: string;
    description: string;
    priority: string;
    project_id: string;
  }>({
    title: "",
    description: "",
    priority: "normal",
    project_id: "none"
  })

  // Form açıldığında aktif projeyi otomatik ata
  React.useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        project_id: selectedProjectId ? selectedProjectId.toString() : "none"
      }))
    }
  }, [open, selectedProjectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setLoading(true)

    try {
      // Optimistic UI — arka planda çalıştır
      addTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority as "urgent" | "normal" | "low",
        project_id: formData.project_id === "none" ? undefined : parseInt(formData.project_id)
      }).catch((err: any) => {
        toast.error(err.response?.data?.detail || "Görev oluşturulamadı.")
      })

      toast.success("Görev eklendi")
      setOpen(false)
      setFormData({ title: "", description: "", priority: "normal", project_id: "none" })
    } finally {
      setLoading(false)
    }
  }

  const handleAiEnhance = async () => {
    if (!formData.title) return;
    setAiLoading(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        description: `"${prev.title}" görevi için AI analizi:\n\n1. Kaynakları topla\n2. Gereksinimleri belirle\n3. Uygula ve test et`
      }))
      setAiLoading(false);
    }, 1500)
  }

  return (
    <>
      <Button
        className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg px-4 h-9 font-semibold text-[13px] transition-all hover:shadow-md"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4 mr-1.5" /> Yeni Görev
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl [&>button]:hidden">
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-br from-indigo-500/15 via-purple-500/8 to-transparent pointer-events-none" />

          {/* Kapatma Butonu */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 p-6 pt-7">
            <DialogHeader className="mb-5">
              <DialogTitle className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                Yeni Görev
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Görev Adı */}
              <div className="grid gap-1.5">
                <Label htmlFor="title" className="font-bold text-slate-700 dark:text-slate-300 text-sm">Görev Adı</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Bugün neyi başarmak istiyorsun?"
                  autoFocus
                  required
                  className="h-11 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-xl font-medium text-base shadow-inner"
                />
              </div>

              {/* Açıklama */}
              <div className="grid gap-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="desc" className="font-bold text-slate-700 dark:text-slate-300 text-sm">Açıklama</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAiEnhance}
                    disabled={!formData.title || aiLoading}
                    className="h-6 px-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-full transition-all"
                  >
                    {aiLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    AI ile Geliştir
                  </Button>
                </div>
                <Textarea
                  id="desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Görev detayları... (boş bırakılırsa AI doldurur)"
                  className="min-h-[80px] border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-xl resize-none shadow-inner text-sm"
                />
              </div>

              {/* Öncelik — İcon Butonlar */}
              <div className="grid gap-1.5">
                <Label className="font-bold text-slate-700 dark:text-slate-300 text-sm">Öncelik</Label>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => {
                    const Icon = p.icon
                    const isActive = formData.priority === p.value
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: p.value })}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border-2 font-bold text-sm transition-all shadow-sm
                          ${isActive
                            ? `${p.activeClass} shadow-lg`
                            : `border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-black/10 ${p.hoverClass}`
                          }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs">{p.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex justify-end gap-3 pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold px-5">
                  Vazgeç
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl font-bold px-7 bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 shadow-lg flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Ekleniyor..." : "Görevi Ekle"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
