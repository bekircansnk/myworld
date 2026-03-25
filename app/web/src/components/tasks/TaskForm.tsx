"use client"

import * as React from "react"
import { useTaskStore } from "@/stores/taskStore"
import { useProjectStore } from "@/stores/projectStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Flame, Target, Coffee, Sparkles, Loader2 } from "lucide-react"

export function TaskForm() {
  const { addTask } = useTaskStore()
  const { projects, selectedProjectId } = useProjectStore()
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
    
    // AI Enhancement Placeholder logic if desc is empty
    let finalDesc = formData.description;
    if (!finalDesc.trim()) {
      // Will be processed backend side but we can mark it
      finalDesc = "[AI_AUTO_GENERATE]"; 
    }

    await addTask({
      title: formData.title,
      description: finalDesc === "[AI_AUTO_GENERATE]" ? "" : finalDesc,
      priority: formData.priority as "urgent" | "normal" | "low",
      project_id: formData.project_id === "none" ? undefined : parseInt(formData.project_id)
    })
    setLoading(false)
    setOpen(false)
    setFormData({ title: "", description: "", priority: "normal", project_id: "none" })
  }

  const handleAiEnhance = async () => {
    if (!formData.title) return;
    setAiLoading(true);
    // Simulate AI generation for now until a real endpoint is available
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        description: `Yapay Zeka Analizi: "${prev.title}" görevi detaylı olarak incelendi. \n\nAlt Adımlar:\n1. Kaynak Taraması\n2. İhtiyaç Analizi\n3. Uygulama`
      }))
      setAiLoading(false);
    }, 1500)
  }

  const selectedProject = projects.find(p => p.id.toString() === formData.project_id)

  return (
    <>
      <Button 
        className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg px-4 h-9 font-semibold text-[13px] transition-all hover:shadow-md" 
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4 mr-1.5" /> Yeni Görev
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl [&>button]:hidden">
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />
          
          <button 
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 p-6 pt-8">
             <DialogHeader className="mb-6">
               <DialogTitle className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <Plus className="w-6 h-6" />
                 </div>
                 Yeni Görev Planla
               </DialogTitle>
             </DialogHeader>
             
             <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh]">
               <div className="grid gap-5 overflow-y-auto custom-scrollbar pr-2 pb-2">
               <div className="grid gap-2 outline-none">
                 <Label htmlFor="title" className="font-bold text-slate-700 dark:text-slate-300">Görev Adı</Label>
                 <Input 
                   id="title" 
                   value={formData.title}
                   onChange={(e) => setFormData({...formData, title: e.target.value})}
                   placeholder="Bugün neyi başarmak istiyorsun?" 
                   autoFocus
                   required 
                   className="h-12 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-xl font-medium text-base shadow-inner"
                 />
               </div>
               
               <div className="grid gap-2 relative">
                 <div className="flex justify-between items-center">
                   <Label htmlFor="desc" className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                     Açıklama (Opsiyonel)
                   </Label>
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
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                   placeholder="Görevle ilgili önemli detaylar (Eğer boş bırakırsanız yapay zeka otomatik analiz ederek dolduracaktır)..." 
                   className="min-h-[100px] border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20 focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-xl resize-none shadow-inner text-sm"
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                   <Label className="font-bold text-slate-700 dark:text-slate-300">Firma / Proje</Label>
                   <Select 
                     value={formData.project_id || "none"} 
                     onValueChange={(val) => setFormData({...formData, project_id: val || "none"})}
                   >
                     <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-slate-800 font-medium overflow-hidden">
                       <SelectValue>
                         {formData.project_id && formData.project_id !== "none" ? selectedProject?.name : "Genel (Projesiz)"}
                       </SelectValue>
                     </SelectTrigger>
                     <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                       <SelectItem value="none" className="font-medium rounded-lg focus:bg-indigo-50 dark:focus:bg-indigo-500/10">Genel (Projesiz)</SelectItem>
                       {projects.map(p => (
                         <SelectItem key={p.id} value={p.id.toString()} className="font-medium rounded-lg focus:bg-indigo-50 dark:focus:bg-indigo-500/10">
                           {p.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

                 <div className="grid gap-2">
                   <Label className="font-bold text-slate-700 dark:text-slate-300">Öncelik</Label>
                   <Select 
                     value={formData.priority || "normal"} 
                     onValueChange={(val) => setFormData({...formData, priority: val || "normal"})}
                   >
                     <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-slate-800 font-medium">
                       <SelectValue placeholder="Öncelik Seç" />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                       <SelectItem value="urgent" className="font-medium text-rose-600 rounded-lg focus:bg-rose-50 dark:focus:bg-rose-500/10 flex items-center">
                         <div className="flex items-center gap-2 max-w-full">
                           <Flame className="w-4 h-4 shrink-0" />
                           <span className="truncate">Yüksek / Acil</span>
                         </div>
                       </SelectItem>
                       <SelectItem value="normal" className="font-medium text-amber-600 rounded-lg focus:bg-amber-50 dark:focus:bg-amber-500/10 flex items-center">
                         <div className="flex items-center gap-2 max-w-full">
                           <Target className="w-4 h-4 shrink-0" />
                           <span className="truncate">Normal</span>
                         </div>
                       </SelectItem>
                       <SelectItem value="low" className="font-medium text-emerald-600 rounded-lg focus:bg-emerald-50 dark:focus:bg-emerald-500/10 flex items-center">
                         <div className="flex items-center gap-2 max-w-full">
                           <Coffee className="w-4 h-4 shrink-0" />
                           <span className="truncate">Düşük / Bekleyebilir</span>
                         </div>
                       </SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </div>
               </div>
               
               <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                 <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold px-6">
                   Vazgeç
                 </Button>
                 <Button type="submit" disabled={loading} className="btn-3d rounded-xl font-bold px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 shadow-lg flex items-center gap-2">
                   {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                   {loading ? "Odaklanılıyor..." : "Hedefi Başlat"}
                 </Button>
               </div>
             </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
