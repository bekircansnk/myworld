import { LocalNotifications, PendingResult } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Task } from '@/types';
import { CalendarEvent } from '@/types/calendar';

// String ID'den pozitif Int32 üret
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit int
  }
  return Math.abs(hash);
}

export async function requestNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return false;
  
  const permStatus = await LocalNotifications.checkPermissions();
  if (permStatus.display === 'granted') return true;
  
  if (permStatus.display === 'prompt' || permStatus.display === 'prompt-with-rationale') {
    const requestStatus = await LocalNotifications.requestPermissions();
    return requestStatus.display === 'granted';
  }
  
  return false;
}

export async function syncLocalNotifications(
  tasks: Task[], 
  events: CalendarEvent[],
  enabled: boolean,
  offsetMinutes: number
) {
  if (!Capacitor.isNativePlatform()) return;

  if (!enabled) {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }
    return;
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const now = new Date();
  const notificationsToSchedule = [];

  // Görev Bildirimleri
  for (const task of tasks) {
    if (task.status === 'done' || !task.due_date) continue;
    
    const dueDate = new Date(task.due_date);
    // Saat yoksa sabah 09:00 varsay
    if (task.due_date.length <= 10) {
      dueDate.setHours(9, 0, 0, 0);
    }

    const notifyTime = new Date(dueDate.getTime() - offsetMinutes * 60000);
    
    if (notifyTime > now) {
      notificationsToSchedule.push({
        id: hashCode(`task_${task.id}`),
        title: 'Yaklaşan Görev',
        body: task.title,
        schedule: { at: notifyTime },
        smallIcon: 'ic_launcher_round',
        extra: { type: 'task', id: task.id }
      });
    }
  }

  // Takvim Bildirimleri
  for (const event of events) {
    if (!event.date || !event.startTime) continue;
    
    const eventTimeStr = `${event.date}T${event.startTime}:00`;
    const eventDate = new Date(eventTimeStr);
    const notifyTime = new Date(eventDate.getTime() - offsetMinutes * 60000);

    if (notifyTime > now && !isNaN(notifyTime.getTime())) {
      notificationsToSchedule.push({
        id: hashCode(`event_${event.id}`),
        title: 'Yaklaşan Etkinlik',
        body: event.title,
        schedule: { at: notifyTime },
        smallIcon: 'ic_launcher_round',
        extra: { type: 'event', id: event.id }
      });
    }
  }

  // Önce mevcutları iptal et, sonra yenilerini ekle (limitlere takılmamak ve orphan bırakmamak için)
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel(pending);
  }

  if (notificationsToSchedule.length > 0) {
    await LocalNotifications.schedule({
      notifications: notificationsToSchedule
    });
  }
}
