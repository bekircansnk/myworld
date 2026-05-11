/**
 * useCompanySwitch — Firma değiştiğinde tüm store'ları yenileyen merkezi hook
 * 
 * Kullanım: const { switchCompany } = useCompanySwitch()
 *           switchCompany(projectId)
 */
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import { useCalendarStore } from '@/stores/calendarStore'
import { useNoteStore } from '@/stores/noteStore'

export function useCompanySwitch() {
  const { setSelectedProjectId, setViewMode } = useProjectStore()
  const { fetchTasks } = useTaskStore()
  const { fetchEvents } = useCalendarStore()
  
  const switchCompany = async (projectId: number | null) => {
    // 1. Seçili firmayı güncelle
    setSelectedProjectId(projectId)
    
    // 2. Tüm ilgili store'ları yeni firmaya göre refetch et
    // Görevler zaten project_id filtresiyle çalışıyor
    fetchTasks()
    
    // Takvim — project_id'yi aktif olarak kullanmaya başlayacak
    fetchEvents()
    
    // Notlar store varsa — TODO: store eklenince burada da fetchNotes(projectId)
    
    // AI Chat session listesi — component mount'unda project_id ile çekecek
    // (chat sessions store ayrı bir refetch hook'u gerektiriyor)
  }

  return { switchCompany }
}
