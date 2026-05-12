"use client"

import * as React from "react"
import { DrivePhoto } from "@/types"
import { uploadPhotoToDrive, deletePhotoFromDrive, getPhotoThumbnailUrl, getPhotoViewUrl } from "@/services/drivePhotoService"
import { ImagePlus, X, Loader2, Trash2, Download, ZoomIn, Camera } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

interface TaskPhotoUploaderProps {
  taskId: number
  photos: DrivePhoto[]
  onPhotosChange: (photos: DrivePhoto[]) => void
}

interface UploadingFile {
  id: string
  name: string
  progress: number
  status: 'compressing' | 'uploading' | 'done' | 'error'
  errorMessage?: string
}

export function TaskPhotoUploader({ taskId, photos, onPhotosChange }: TaskPhotoUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploading, setUploading] = React.useState<UploadingFile[]>([])
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<DrivePhoto | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const dropZoneRef = React.useRef<HTMLDivElement>(null)

  const photosRef = React.useRef(photos)
  React.useEffect(() => {
    photosRef.current = photos
  }, [photos])

  // Global Drag & Drop & Paste event handlers
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      
      const files: File[] = []
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) files.push(file)
        }
      }
      
      if (files.length > 0) {
        e.preventDefault()
        processFiles(files)
      }
    }

    const handleDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault()
        setIsDragging(true)
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      // Sadece pencereden dışarı çıkıldıysa iptal et
      if (e.clientX === 0 || e.clientY === 0) {
        setIsDragging(false)
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      
      const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'))
      if (files.length > 0) {
        processFiles(files)
      }
    }

    window.addEventListener('paste', handlePaste)
    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('paste', handlePaste)
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('drop', handleDrop)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) {
      processFiles(files)
    }
    // Input'u sıfırla (aynı dosyayı tekrar seçebilmek için)
    e.target.value = ''
  }

  // Dosyaları sırayla yükle
  const processFiles = async (files: File[]) => {
    const uploadEntries: UploadingFile[] = files.map(f => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: f.name,
      progress: 0,
      status: 'compressing' as const,
    }))

    setUploading(prev => [...prev, ...uploadEntries])

    // State kapanımını (closure) aşmak için ref'ten o anki listeyi alıyoruz
    let currentPhotos = [...photosRef.current]

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const entryId = uploadEntries[i].id

      try {
        // Sıkıştırma aşaması
        setUploading(prev => prev.map(u => u.id === entryId ? { ...u, status: 'compressing', progress: 20 } : u))

        // Yükleme aşaması
        setUploading(prev => prev.map(u => u.id === entryId ? { ...u, status: 'uploading', progress: 50 } : u))

        const drivePhoto = await uploadPhotoToDrive(file)

        setUploading(prev => prev.map(u => u.id === entryId ? { ...u, status: 'done', progress: 100 } : u))

        // Listeyi güncelle ve yansıt
        currentPhotos = [...currentPhotos, drivePhoto]
        onPhotosChange(currentPhotos)

        // Tamamlanan girişi kısa süre sonra kaldır
        setTimeout(() => {
          setUploading(prev => prev.filter(u => u.id !== entryId))
        }, 1500)

      } catch (err: any) {
        setUploading(prev => prev.map(u => u.id === entryId
          ? { ...u, status: 'error', errorMessage: err.message || 'Yükleme hatası' }
          : u
        ))
        // Hatalıyı 5 sn sonra kaldır
        setTimeout(() => {
          setUploading(prev => prev.filter(u => u.id !== entryId))
        }, 5000)
      }
    }
  }

  // Fotoğraf silme
  const handleDeletePhoto = async () => {
    if (!deleteTarget) return

    // Önce listeden kaldır
    const updated = photos.filter(p => p.drive_id !== deleteTarget.drive_id)
    onPhotosChange(updated)

    // Sonra Drive'dan sil (arka planda)
    deletePhotoFromDrive(deleteTarget.drive_id)
    setDeleteTarget(null)
  }

  // İndirme
  const handleDownload = (photo: DrivePhoto) => {
    const url = getPhotoViewUrl(photo.drive_id)
    window.open(url, '_blank')
  }

  const hasPhotos = photos.length > 0 || uploading.length > 0

  return (
    <>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Fotoğrafı Sil"
        description={`"${deleteTarget?.name}" fotoğrafını silmek istediğinize emin misiniz?`}
        confirmText="Sil"
        onConfirm={handleDeletePhoto}
      />

      {/* Global Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[100] bg-indigo-500/20 backdrop-blur-sm flex items-center justify-center border-[6px] border-indigo-500 border-dashed m-4 rounded-3xl animate-in fade-in duration-200 pointer-events-none">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-bounce">
            <ImagePlus className="w-16 h-16 text-indigo-500" />
            <span className="text-xl font-bold text-slate-800 dark:text-white text-center">Fotoğrafı Buraya Bırakın</span>
            <span className="text-sm text-slate-500 font-medium text-center">Göreve otomatik olarak yüklenecektir</span>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setPreviewUrl(null)}
        >
          <img
            src={previewUrl}
            alt="Önizleme"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/20 animate-in zoom-in-95 duration-300"
          />
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 p-3 rounded-2xl bg-white/10 text-white hover:bg-white/25 transition-colors backdrop-blur-md"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="space-y-3">
        {/* Başlık + Ekle Butonu */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 dark:text-white/90 flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-500" />
            Fotoğraflar
            {photos.length > 0 && (
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-black">
                {photos.length}
              </span>
            )}
          </h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            Fotoğraf Ekle
          </button>
        </div>

        {/* Gizli file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Standart Yükleme Alanı (Drag over eventleri silindi, global çalışıyor) */}
        <div
          ref={dropZoneRef}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
            isDragging
              ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 dark:border-indigo-500/50 scale-[1.01]'
              : hasPhotos
                ? 'border-slate-200/50 dark:border-white/10 bg-transparent'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/30 dark:bg-white/5'
          }`}
        >
          {/* Boş durum */}
          {!hasPhotos && !isDragging && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 flex flex-col items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center">
                <ImagePlus className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600 dark:text-white/70">
                  Fotoğraf eklemek için tıklayın, yapıştırın veya sürükleyin
                </p>
                <p className="text-[11px] text-slate-400 dark:text-white/30 mt-1">
                  (Cmd+V) PNG, JPG, WEBP • Otomatik 1MB altına sıkıştırılır
                </p>
              </div>
            </button>
          )}

          {/* Fotoğraf Galerisi */}
          {hasPhotos && (
            <div className="p-3">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {/* Mevcut fotoğraflar */}
                {photos.map((photo) => (
                  <div
                    key={photo.drive_id}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => setPreviewUrl(getPhotoViewUrl(photo.drive_id))}
                  >
                    <img
                      src={getPhotoThumbnailUrl(photo.drive_id, 400)}
                      alt={photo.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        // Eğer lh3 URL'si çalışmazsa uc URL'sine fallback yap
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('drive.google.com/uc')) {
                          target.src = `https://drive.google.com/uc?export=view&id=${photo.drive_id}`;
                        }
                      }}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-2">
                      <span className="text-[9px] font-semibold text-white/80 truncate max-w-[60%]">
                        {photo.name}
                      </span>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(photo) }}
                          className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                          title="İndir"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(photo) }}
                          className="w-7 h-7 rounded-lg bg-red-500/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/50 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Yükleme göstergeleri */}
                {uploading.map((up) => (
                  <div
                    key={up.id}
                    className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex flex-col items-center justify-center gap-2 p-2"
                  >
                    {up.status === 'error' ? (
                      <>
                        <X className="w-6 h-6 text-red-400" />
                        <span className="text-[9px] font-semibold text-red-500 text-center leading-tight">
                          {up.errorMessage}
                        </span>
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        <span className="text-[9px] font-semibold text-slate-500 dark:text-white/50 text-center truncate w-full">
                          {up.status === 'compressing' ? 'Sıkıştırılıyor...' : 'Yükleniyor...'}
                        </span>
                        {/* Progress bar */}
                        <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${up.progress}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Yeni ekleme butonu (fotoğraf varsa küçük + kutusu) */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-1.5 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/10 transition-all cursor-pointer"
                >
                  <ImagePlus className="w-5 h-5 text-slate-300 dark:text-white/20" />
                  <span className="text-[9px] font-bold text-slate-300 dark:text-white/20">Ekle</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
