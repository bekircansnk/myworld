export interface Language {
  code: string; // örn: 'tr-TR', 'en-US'
  name: string;
  flag: string;
}

export interface TranscriptEntry {
  id: string;
  speaker: 'me' | 'other';
  text: string;
  translatedText?: string;
  timestamp: string; // ISO String veya Date formatı
  isFinal: boolean;
  savedToBackend?: boolean;
}

