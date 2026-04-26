import { create } from 'zustand'
import { Note } from '@/types'
import { api } from '@/lib/api'

interface NoteStore {
  notes: Note[];
  selectedNote: Note | null;
  isDetailPanelOpen: boolean;
  
  fetchNotes: () => Promise<void>;
  addNoteAction: (content: string, source?: string) => Promise<void>;
  addExplicitNoteAction: (data: Partial<Note>) => Promise<void>;
  deleteNoteAction: (id: number) => Promise<void>;
  updateNoteInList: (note: Note) => void;
  openNoteDetail: (note: Note) => void;
  closeNoteDetail: () => void;
  setSelectedNote: (note: Note | null) => void;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  selectedNote: null,
  isDetailPanelOpen: false,

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
}))
