import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { chunkText, base64ToUint8Array, createWavBlob } from './utils';
import { api } from '@/lib/api';

export const VOICES = [
  { id: 'Puck', name: 'Yumuşak' },
  { id: 'Charon', name: 'Derin' },
  { id: 'Kore', name: 'Net' },
  { id: 'Fenrir', name: 'Güçlü' },
  { id: 'Zephyr', name: 'Hafif' },
];

interface UseTTSProps {
  apiKey?: string;
  noteId?: number;
  savedAudioUrl?: string | null;
  savedAudioText?: string | null;
  currentText?: string;
}

export function useTTS({ apiKey, noteId, savedAudioUrl, savedAudioText, currentText }: UseTTSProps = {}) {
  const [voice, setVoice] = useState('Fenrir');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  
  const [fullAudioUrl, setFullAudioUrl] = useState<string | null>(null);
  // Saved url ile local blob url ayrımı yapmak lazım (revoke için)
  const isBlobUrlRef = useRef(false);
  // Kayıtlı ses var mı? (not düzenlenmemiş ise)
  const [hasSavedAudio, setHasSavedAudio] = useState(false);

  // Playback tracking
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize AI client (API anahtarı güvenli şekilde env'den alınır)
  const geminiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  const ai = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

  // Audio element'ini başlat (sadece 1 kere)
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setPlaybackTime(0);
    });
    audio.addEventListener('error', (e) => {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
    });
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('timeupdate', () => {
      if (audio && Number.isFinite(audio.currentTime)) {
        setPlaybackTime(audio.currentTime);
      }
    });
    audio.addEventListener('loadedmetadata', () => {
      if (audio && Number.isFinite(audio.duration)) {
        setPlaybackDuration(audio.duration);
      }
    });
    audio.addEventListener('canplaythrough', () => {
      if (audio && Number.isFinite(audio.duration)) {
        setPlaybackDuration(audio.duration);
      }
    });
    
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  // Kayıtlı ses URL'si varsa yükle (not açıldığında veya props değiştiğinde)
  useEffect(() => {
    if (savedAudioUrl) {
      let url = savedAudioUrl;
      // Eski /static/audio/... veya benzeri API sunucusu linkiyse URL'i tamamla
      if (!savedAudioUrl.startsWith('data:')) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        url = savedAudioUrl.startsWith('/') ? `${baseUrl}${savedAudioUrl}` : `${baseUrl}/${savedAudioUrl}`;
      }
      
      setFullAudioUrl(url);
      setHasSavedAudio(true);
      isBlobUrlRef.current = false;
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    }
  }, [savedAudioUrl]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const previewVoice = async (selectedVoice: string = voice) => {
    if (isPreviewing || !ai) {
      if (!ai) setError('API anahtarı bulunamadı. Lütfen ayarları kontrol edin.');
      return;
    }
    
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    
    setIsPreviewing(true);
    try {
      const prompt = "Merhaba, benim sesim bu şekilde duyuluyor. Umarım beğenirsiniz.";
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const pcm = base64ToUint8Array(base64Audio);
        const wavBlob = createWavBlob(pcm, 24000);
        const url = URL.createObjectURL(wavBlob);
        const audio = new Audio(url);
        previewAudioRef.current = audio;
        
        audio.onended = () => {
          setIsPreviewing(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setIsPreviewing(false);
          URL.revokeObjectURL(url);
        };
        await audio.play();
      } else {
        setIsPreviewing(false);
      }
    } catch (error) {
      console.error("Preview error:", error);
      setIsPreviewing(false);
    }
  };

  const generateAndPlay = async (text: string) => {
    if (!text.trim()) return;
    if (!ai) {
      setError('API anahtarı bulunamadı. Lütfen ayarları kontrol edin.');
      return;
    }
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setIsGenerating(true);
    setError(null);
    setIsPlaying(false);
    setPlaybackTime(0);
    setPlaybackDuration(0);
    
    // Eski blob URL'sini temizle
    if (fullAudioUrl && isBlobUrlRef.current) {
      URL.revokeObjectURL(fullAudioUrl);
    }
    setFullAudioUrl(null);
    isBlobUrlRef.current = false;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewing(false);
    }
    
    const textChunks = chunkText(text, 1200);
    setProgress({ current: 0, total: textChunks.length });
    const fetchedPcm: Uint8Array[] = [];

    for (let i = 0; i < textChunks.length; i++) {
      if (signal.aborted) break;

      let chunkSuccess = false;
      let retries = 3;
      let delay = 1500;

      while (!chunkSuccess && retries > 0) {
        if (signal.aborted) break;
        
        try {
          if (i > 0 || retries < 3) await new Promise(resolve => setTimeout(resolve, delay));

          const prompt = textChunks[i];
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
            },
          });

          if (signal.aborted) break;

          const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            const pcm = base64ToUint8Array(base64Audio);
            fetchedPcm.push(pcm);
            setProgress(prev => ({ ...prev, current: i + 1 }));
            chunkSuccess = true;
          } else {
            throw new Error("No audio data received.");
          }
        } catch (err: any) {
          if (signal.aborted) break;
          console.error(`TTS Chunk ${i + 1} hatası (kalan deneme: ${retries - 1}):`, err?.message || err);
          retries--;
          delay += 2000;
          
          if (retries === 0) {
            const errorMsg = err?.message || 'Bilinmeyen hata';
            setError(`Ses oluşturulamadı: ${errorMsg}`);
            break;
          }
        }
      }

      if (!chunkSuccess) {
        setProgress(prev => ({ ...prev, total: fetchedPcm.length }));
        break;
      }
    }

    if (!signal.aborted) {
      setIsGenerating(false);
      
      if (fetchedPcm.length > 0) {
        // Tüm PCM verilerini birleştir
        const totalLen = fetchedPcm.reduce((acc, val) => acc + val.length, 0);
        const combined = new Uint8Array(totalLen);
        let offset = 0;
        for (const pcm of fetchedPcm) {
          combined.set(pcm, offset);
          offset += pcm.length;
        }
        const fullWav = createWavBlob(combined, 24000);
        const finalUrl = URL.createObjectURL(fullWav);
        
        // State güncelle
        setFullAudioUrl(finalUrl);
        isBlobUrlRef.current = true;
        
        // Audio elementine ata ve çal
        if (audioRef.current) {
          audioRef.current.src = finalUrl;
          audioRef.current.load();
          
          // Yüklenmesini bekle ve çal
          const playWhenReady = () => {
            audioRef.current?.play()
              .then(() => setIsPlaying(true))
              .catch(e => console.error("Auto-play failed:", e));
          };
          
          // canplaythrough event ile bekle
          audioRef.current.addEventListener('canplaythrough', playWhenReady, { once: true });
        }

        // Backend'e kaydet (arka planda)
        if (noteId) {
          try {
            const formData = new FormData();
            formData.append("audio_file", fullWav, "tts.wav");
            formData.append("tts_text", text);
            await api.post(`/api/notes/${noteId}/upload-audio`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Store'u güncelle
            const { useNoteStore } = await import('@/stores/noteStore');
            useNoteStore.getState().fetchNotes();
          } catch (e) {
            console.error("Ses DB'ye kaydedilemedi:", e);
          }
        }
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    // Eğer fullAudioUrl varsa ve audio src'si boşsa, set et
    if (fullAudioUrl && (!audioRef.current.src || audioRef.current.src === '' || audioRef.current.src === window.location.href)) {
      audioRef.current.src = fullAudioUrl;
      audioRef.current.load();
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Play failed:", e));
    }
  };

  const stop = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsGenerating(false);
    setPlaybackTime(0);
  };

  const seekTo = (time: number) => {
    if (audioRef.current && Number.isFinite(time)) {
      audioRef.current.currentTime = time;
      setPlaybackTime(time);
    }
  };

  const download = () => {
    if (!fullAudioUrl) return;
    const a = document.createElement('a');
    a.href = fullAudioUrl;
    a.download = `not-seslendirme-${new Date().getTime()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return {
    voice,
    setVoice,
    VOICES,
    isGenerating,
    isPreviewing,
    isPlaying,
    progress,
    error,
    fullAudioUrl,
    generateAndPlay,
    previewVoice,
    togglePlayPause,
    stop,
    download,
    playbackTime,
    playbackDuration,
    seekTo,
    hasSavedAudio
  };
}
