// Çevrimdışı işlem senkronizasyon kuyruğu
// İnternet yokken yapılan API isteklerini kaydeder, internet gelince sırayla gönderir
import { get, set } from 'idb-keyval';

const QUEUE_KEY = 'myworld-sync-queue';
const MAX_RETRIES = 5;

export interface QueuedAction {
  id: string;
  timestamp: number;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  payload?: any;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

// Basit UUID üretici (uuid paketi yerine)
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Kuyruğu oku
async function getQueue(): Promise<QueuedAction[]> {
  try {
    const queue = await get(QUEUE_KEY);
    return queue || [];
  } catch {
    return [];
  }
}

// Kuyruğu yaz
async function saveQueue(queue: QueuedAction[]): Promise<void> {
  await set(QUEUE_KEY, queue);
}

// Kuyruğa yeni işlem ekle
export async function enqueue(
  method: QueuedAction['method'],
  url: string,
  payload?: any
): Promise<void> {
  const queue = await getQueue();
  queue.push({
    id: generateId(),
    timestamp: Date.now(),
    method,
    url,
    payload,
    retryCount: 0,
    status: 'pending',
  });
  await saveQueue(queue);
}

// Kuyrukta bekleyen işlem sayısını döndür
export async function getPendingCount(): Promise<number> {
  const queue = await getQueue();
  return queue.filter(q => q.status === 'pending' || q.status === 'failed').length;
}

// Kuyruktaki tüm bekleyen işlemleri sırayla gönder
export async function processQueue(): Promise<{ success: number; failed: number }> {
  const queue = await getQueue();
  const pending = queue.filter(q => q.status === 'pending' || q.status === 'failed');
  
  if (pending.length === 0) return { success: 0, failed: 0 };
  
  let success = 0;
  let failed = 0;

  // Token'ı al
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  for (const action of pending) {
    try {
      action.status = 'syncing';
      
      const fetchOptions: RequestInit = {
        method: action.method,
        headers,
      };

      if (action.payload && action.method !== 'DELETE') {
        fetchOptions.body = JSON.stringify(action.payload);
      }

      const response = await fetch(`${baseURL}${action.url}`, fetchOptions);
      
      if (response.ok || response.status === 404) {
        // Başarılı veya zaten silinmiş → kuyruktan kaldır
        const idx = queue.findIndex(q => q.id === action.id);
        if (idx !== -1) queue.splice(idx, 1);
        success++;
      } else if (response.status === 401) {
        // Token geçersiz → kuyruğu beklet, yeniden giriş gerekebilir
        action.status = 'failed';
        action.retryCount++;
        failed++;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      action.status = 'failed';
      action.retryCount++;
      
      if (action.retryCount >= MAX_RETRIES) {
        // Maximum denemeye ulaştı → kuyruktan kaldır
        const idx = queue.findIndex(q => q.id === action.id);
        if (idx !== -1) queue.splice(idx, 1);
        console.warn(`Sync queue: ${action.method} ${action.url} — ${MAX_RETRIES} denemeden sonra başarısız, siliniyor`);
      }
      failed++;
    }
  }

  await saveQueue(queue);
  return { success, failed };
}

// Kuyruğu temizle
export async function clearQueue(): Promise<void> {
  await saveQueue([]);
}
