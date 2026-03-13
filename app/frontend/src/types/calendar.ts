export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  allDay?: boolean;
  color: string; // tailwind color key like 'blue', 'purple', 'orange', 'green', 'rose', 'amber'
  category: 'task' | 'personal' | 'routine' | 'meeting' | 'health' | 'social' | 'learning';
  taskId?: number; // linked task ID if it comes from task store
  noteId?: number; // linked note ID
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  isCompleted?: boolean;
}

export type CalendarViewMode = 'month' | 'week' | 'day';

export const EVENT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500' },
  green: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-800 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800', dot: 'bg-teal-500' },
  indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800', dot: 'bg-indigo-500' },
};

export const CATEGORY_LABELS: Record<CalendarEvent['category'], string> = {
  task: 'Görev',
  personal: 'Kişisel',
  routine: 'Rutin',
  meeting: 'Toplantı',
  health: 'Sağlık',
  social: 'Sosyal',
  learning: 'Öğrenme',
};
