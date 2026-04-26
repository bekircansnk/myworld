import { create } from 'zustand';
import { CalendarEvent, CalendarViewMode } from '@/types/calendar';
import { api } from '@/lib/api';

interface CalendarState {
  events: CalendarEvent[];
  viewMode: CalendarViewMode;
  currentDate: string; // ISO string for the currently viewed month/week/day
  selectedDate: string | null;
  selectedEvent: CalendarEvent | null;
  activeFilters: string[]; // category filters
  isLoading: boolean;

  // Actions
  fetchEvents: () => Promise<void>;
  setViewMode: (mode: CalendarViewMode) => void;
  setCurrentDate: (date: string) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  deleteEvents: (ids: string[]) => void;
  toggleFilter: (category: string) => void;
  clearFilters: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  viewMode: 'month',
  currentDate: new Date().toISOString(),
  selectedDate: null,
  selectedEvent: null,
  activeFilters: [],
  isLoading: false,

  fetchEvents: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/api/calendar/events');
      set({ events: res.data, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },
      setViewMode: (mode) => set({ viewMode: mode }),
      setCurrentDate: (date) => set({ currentDate: date }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedEvent: (event) => set({ selectedEvent: event }),

  addEvent: async (event) => {
    try {
      const res = await api.post('/api/calendar/events', event);
      set((state) => ({ 
        events: [...state.events, res.data] 
      }));
    } catch(err) { console.error(err); }
  },

  updateEvent: async (id, data) => {
    try {
      const res = await api.put(`/api/calendar/events/${id}`, data);
      set((state) => ({
        events: state.events.map((e) => e.id === id ? { ...e, ...res.data } : e),
        selectedEvent: state.selectedEvent?.id === id 
          ? { ...state.selectedEvent, ...res.data } 
          : state.selectedEvent,
      }));
    } catch(err) { console.error(err); }
  },

  deleteEvent: async (id) => {
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
      selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
    }));
    try {
       await api.delete(`/api/calendar/events/${id}`);
    } catch(err) { 
       console.error(err); 
       get().fetchEvents();
    }
  },

  deleteEvents: async (ids) => {
    set((state) => ({
      events: state.events.filter((e) => !ids.includes(e.id.toString())),
      selectedEvent: state.selectedEvent && ids.includes(state.selectedEvent.id.toString()) ? null : state.selectedEvent,
    }));
    try {
       await Promise.all(ids.map(id => api.delete(`/api/calendar/events/${id}`)));
    } catch(err) {
       console.error(err);
       get().fetchEvents();
    }
  },

  toggleFilter: (category) => set((state) => ({
    activeFilters: state.activeFilters.includes(category)
      ? state.activeFilters.filter(f => f !== category)
      : [...state.activeFilters, category],
  })),

  clearFilters: () => set({ activeFilters: [] }),
}));
