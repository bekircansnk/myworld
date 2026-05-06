import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Note } from '@/types'
import { api } from '@/lib/api'
import { idbStorage } from '@/lib/idb-storage'

interface NoteStore {
  notes: Note[];
  selectedNote: Note | null;
  isDetailPanelOpen: boolean;
  _hasHydrated: boolean;
  
  fetchNotes: () => Promise<void>;
  addNoteAction: (content: string, source?: string) => Promise<void>;
  addExplicitNoteAction: (data: Partial<Note>) => Promise<void>;
  deleteNoteAction: (id: number) => Promise<void>;
  updateNoteInList: (note: Note) => void;
  openNoteDetail: (note: Note) => void;
  closeNoteDetail: () => void;
  setSelectedNote: (note: Note | null) => void;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      notes: [],
      selectedNote: null,
      isDetailPanelOpen: false,
      _hasHydrated: false,

      fetchNotes: async () => {
        try {
          const res = await api.get('/api/notes')
          set({ notes: res.data })
        } catch(e) { console.error('Notlar alinamadi', e) }
      },

      addNoteAction: async (content, source='notes_page') => {
        try {
           const res = await api.post('/api/notes', { content, source })
           set(state => ({ notes: [res.data, ...state.notes] }))
        } catch(e){ console.error(e) }
      },

      addExplicitNoteAction: async (data: Partial<Note>) => {
        try {
           const res = await api.post('/api/notes', data)
           set(state => ({ notes: [res.data, ...state.notes] }))
        } catch(e){ console.error(e) }
      },

      deleteNoteAction: async(id) => {
        set(state => ({ 
          notes: state.notes.filter(n => n.id !== id),
          selectedNote: state.selectedNote?.id === id ? null : state.selectedNote,
          isDetailPanelOpen: state.selectedNote?.id === id ? false : state.isDetailPanelOpen
        }))
        try {
          await api.delete(`/api/notes/${id}`)
        } catch(e) {
          console.error(e)
          get().fetchNotes()
        }
      },

      updateNoteInList: (updatedNote) => set(state => ({
        notes: state.notes.map(n => n.id === updatedNote.id ? updatedNote : n)
      })),

      openNoteDetail: (note) => set({ selectedNote: note, isDetailPanelOpen: true }),
      
      closeNoteDetail: () => set({ selectedNote: null, isDetailPanelOpen: false }),

      setSelectedNote: (note) => set((state) => {
        if (note) {
          const updatedNotes = state.notes.map(n => n.id === note.id ? note : n)
          return { selectedNote: note, notes: updatedNotes }
        }
        return { selectedNote: note }
      }),
    }),
    {
      name: 'myworld-notes',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        notes: state.notes,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
)
