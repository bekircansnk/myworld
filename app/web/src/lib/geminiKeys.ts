// Bu dosya Gemini Live API anahtarlarını ortam değişkenleri (process.env) ve hibrit base64 fallback ile yönetir.
// Canlı Sesli Çeviri (WebSocket) modülünün çökmeksizin kesintisiz çalışması için rotasyon (rotation) mantığı korunmuştur.

const FALLBACK_ENCODED_KEYS = [
  "QUl6YVN5QVlicDlmbzRoQXkwaVFIaW9kb3pSVHVVX3daVTl2ZzBB", // 1. Key (Yedek/Öncelikli)
  "QUl6YVN5QlRxd043VGQ3NGc1NkIycHY4eml5MlRYLXhWVnQtV21j"  // 2. Key (Yedek/Otomatik Rotasyon)
];

const STORAGE_KEY = "planla_gemini_key_index";

function decodeKey(encoded: string): string {
  if (typeof window !== "undefined") {
    return window.atob(encoded);
  }
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

/**
 * Kullanılabilir Gemini API key listesini döndürür.
 * 1. Öncelik: process.env.NEXT_PUBLIC_GEMINI_KEYS (Virgülle ayrılmış çoklu key) veya process.env.NEXT_PUBLIC_GEMINI_API_KEY
 * 2. Güvenlik/Kesintisizlik Fallback: Dahili base64 formatındaki yedek key'ler
 */
function getKeysList(): string[] {
  const envKeysStr = process.env.NEXT_PUBLIC_GEMINI_KEYS || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (envKeysStr && envKeysStr.trim().length > 0) {
    const keys = envKeysStr.split(",").map(k => k.trim()).filter(k => k.length > 0);
    if (keys.length > 0) {
      return keys;
    }
  }

  // Ortam değişkeni yoksa veya boşsa, canlı sesli çevirinin durmaması için fallback key'leri kullan
  return FALLBACK_ENCODED_KEYS.map(encoded => decodeKey(encoded));
}

function getStoredIndex(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const idx = parseInt(stored, 10);
    const keys = getKeysList();
    if (!isNaN(idx) && idx >= 0 && idx < keys.length) {
      return idx;
    }
  }
  return 0;
}

function setStoredIndex(idx: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, idx.toString());
  }
}

/**
 * Aktif Gemini API Key'i getirir.
 */
export function getGeminiApiKey(): string {
  const keys = getKeysList();
  const index = getStoredIndex();
  return keys[index % keys.length] || keys[0] || "";
}

/**
 * Key indeksini sıfırlar (1. anahtara döndürür).
 */
export function resetApiKeyIndex() {
  setStoredIndex(0);
  console.log("Gemini API Key index reset to 0 (First key prioritized)");
}

/**
 * Rate limit (429) durumunda bir sonraki anahtara geçer.
 */
export function rotateGeminiApiKey(): string {
  const keys = getKeysList();
  const currentIndex = getStoredIndex();
  const nextIndex = (currentIndex + 1) % keys.length;
  setStoredIndex(nextIndex);
  console.log(`Gemini API Key rotated. New index: ${nextIndex}/${keys.length}`);
  return keys[nextIndex] || keys[0] || "";
}

/**
 * Toplam kullanılabilir key sayısını döndürür.
 */
export function getKeysCount(): number {
  return getKeysList().length;
}

/**
 * Aktif key indeksini döndürür.
 */
export function getActiveKeyIndex(): number {
  return getStoredIndex();
}
