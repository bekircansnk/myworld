"use client"

import * as React from "react"
import { useProjectStore } from "@/stores/projectStore"
import { Project } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

export function ProjectSettingsModal({ 
  project, 
  isOpen, 
  onClose 
}: { 
  project: Project | null, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const { updateProject, deleteProject, setSelectedProjectId, selectedProjectId } = useProjectStore()
  
  const [name, setName] = React.useState("")
  const [color, setColor] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  React.useEffect(() => {
    if (project) {
      setName(project.name)
      setColor(project.color)
      setDescription(project.description || "")
    }
  }, [project, isOpen])

  const handleUpdate = async () => {
    if (!project || !name.trim()) return
    setIsLoading(true)
    await updateProject(project.id, { name, color, description })
    setIsLoading(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!project) return
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!project) return
    setIsLoading(true)
    await deleteProject(project.id)
    if (selectedProjectId === project.id) {
      setSelectedProjectId(null)
    }
    setIsLoading(false)
    onClose()
  }

  if (!project) return null

  return (
    <>
      <ConfirmDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Projeyi Sil"
        description={`'${project.name}' projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`}
        confirmText="Projeyi Sil"
        onConfirm={confirmDelete}
      />
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Projeyi Düzenle</DialogTitle>
          <DialogDescription>
            {project.name} projesi için ayarları buradan değiştirebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">İsim</Label>
            <Input 
              id="edit-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="col-span-3" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-color" className="text-right">Renk</Label>
            <div className="col-span-3 flex gap-2">
              <Input 
                id="edit-color" 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                className="w-12 h-10 p-1 cursor-pointer" 
              />
              <Input 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                className="flex-1" 
                placeholder="#000000"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-desc" className="text-right pt-2">Açıklama</Label>
            <Textarea 
              id="edit-desc" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="col-span-3 min-h-[80px]" 
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between w-full">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            Projeyi Sil
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>İptal</Button>
            <Button onClick={handleUpdate} disabled={isLoading || !name.trim()}>Kaydet</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
