"use client"

import * as React from "react"
import { useProjectStore } from "@/stores/projectStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

export interface ProjectFormProps {
  customTrigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function ProjectForm({ customTrigger, open: controlledOpen, onOpenChange, hideTrigger }: ProjectFormProps) {
  const { addProject } = useProjectStore()
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [errorDialog, setErrorDialog] = React.useState<{isOpen: boolean; message: string}>({isOpen: false, message: ''})

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

  const [formData, setFormData] = React.useState({
    name: "",
    color: "#3b82f6"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      await addProject({
        name: formData.name,
        color: formData.color
      })
      const error = useProjectStore.getState().error
      if (error) {
        setErrorDialog({ isOpen: true, message: "Firma eklenemedi: " + error })
      } else {
        setFormData({ name: "", color: "#3b82f6" })
        handleOpenChange(false)
      }
    } catch (e: any) {
      setErrorDialog({ isOpen: true, message: "Firma eklenemedi: " + e.message })
    } finally {
      setLoading(false)
    }
    setFormData({ name: "", color: "#3b82f6" })
  }

  return (
    <>
      {!hideTrigger && (
        <div onClick={() => handleOpenChange(true)} className="w-full cursor-pointer">
          {customTrigger || (
            <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground">
              <Plus className="w-4 h-4 mr-2" /> Firma Ekle
            </Button>
          )}
        </div>
      )}
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Yeni Firma / Proje Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="p_name">Firma Adı</Label>
              <Input 
                id="p_name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Örn: Venüs Ayakkabıları" 
                autoFocus
                required 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="p_color">Renk</Label>
              <div className="flex gap-2 items-center">
                <Input 
                  id="p_color" 
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">Kart rengi olarak kullanılacak</span>
              </div>
            </div>
            
            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Ekleniyor..." : "Firmayı Ekle"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={errorDialog.isOpen}
        onOpenChange={(isOpen) => setErrorDialog(prev => ({ ...prev, isOpen }))}
        title="Hata Oluştu"
        description={errorDialog.message}
        onConfirm={() => setErrorDialog(prev => ({ ...prev, isOpen: false }))}
        confirmText="Tamam"
        cancelText="Kapat"
        variant="destructive"
      />
    </>
  )
}
