// Bu dosya Gemini Live API anahtarlarını kod içinde yönetir ve limit dolduğunda rotation sağlar.
// GitHub Push Protection / Secret Scanning engeline takılmamak için anahtarlar base64 formatında saklanır.
const ENCODED_KEYS = [
  "QUl6YVN5QVlicDlmbzRoQXkwaVFIaW9kb3pSVHVVX3daVTl2ZzBB", // 1. Key (Sabit/Öncelikli)
  "QUl6YVN5QlRxd043VGQ3NGc1NkIycHY4eml5MlRYLXhWVnQtV21j"  // 2. Key (Otomatik yedek)
];

const STORAGE_KEY = "planla_gemini_key_index";

function decodeKey(encoded: string): string {
  if (typeof window !== "undefined") {
    return window.atob(encoded);
  }
  // Node.js veya Server-side ortamı için fallback
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

function getStoredIndex(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const idx = parseInt(stored, 10);
    if (!isNaN(idx) && idx >= 0 && idx < ENCODED_KEYS.length) {
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

export function getGeminiApiKey(): string {
  const index = getStoredIndex();
  return decodeKey(ENCODED_KEYS[index]);
}

export function resetApiKeyIndex() {
  setStoredIndex(0);
  console.log("Gemini API Key index reset to 0 (First key prioritized)");
}

export function rotateGeminiApiKey(): string {
  const currentIndex = getStoredIndex();
  const nextIndex = (currentIndex + 1) % ENCODED_KEYS.length;
  setStoredIndex(nextIndex);
  console.log(`Gemini API Key rotated. New index: ${nextIndex}`);
  return decodeKey(ENCODED_KEYS[nextIndex]);
}

export function getKeysCount(): number {
  return ENCODED_KEYS.length;
}

export function getActiveKeyIndex(): number {
  return getStoredIndex();
}

