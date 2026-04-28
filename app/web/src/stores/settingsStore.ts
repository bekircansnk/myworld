import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  notificationsEnabled: boolean;
  reminderOffsetMinutes: number; // Kaç dakika önce hatırlatılsın
  setNotificationsEnabled: (enabled: boolean) => void;
  setReminderOffset: (minutes: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      reminderOffsetMinutes: 60, // Default 1 hour
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setReminderOffset: (minutes) => set({ reminderOffsetMinutes: minutes }),
    }),
    {
      name: 'myworld-settings',
    }
  )
);
