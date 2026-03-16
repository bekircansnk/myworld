import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { chunkText, base64ToUint8Array, createWavBlob } from './utils';

export const VOICES = [
  { id: 'Puck', name: 'Puck (Yumuşak, Sakin)' },
  { id: 'Charon', name: 'Charon (Derin, Tok)' },
  { id: 'Kore', name: 'Kore (Net, Öğretici)' },
  { id: 'Fenrir', name: 'Fenrir (Güçlü, Kararlı)' },
  { id: 'Zephyr', name: 'Zephyr (Hafif, Akıcı)' },
];

interface UseTTSProps {
  apiKey?: string;
}

export function useTTS({ apiKey }: UseTTSProps = {}) {
  const [voice, setVoice] = useState('Kore');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [fullAudioUrl, setFullAudioUrl] = useState<string | null>(null);
  
  const audioQueueRef = useRef<string[]>([]);
  const currentPlayIndexRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize AI client
  const ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || '' });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = '';
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      audioQueueRef.current.forEach(url => URL.revokeObjectURL(url));
      if (fullAudioUrl) URL.revokeObjectURL(fullAudioUrl);
    };
  }, [fullAudioUrl]);

  const playNextInQueue = useCallback(() => {
    if (!audioRef.current) return;
    
    if (currentPlayIndexRef.current < audioQueueRef.current.length) {
      const targetUrl = audioQueueRef.current[currentPlayIndexRef.current];
      if (audioRef.current.src !== targetUrl) {
        audioRef.current.src = targetUrl;
        audioRef.current.play().catch(e => console.error("Auto-play failed:", e));
        setIsPlaying(true);
      }
    } else if (!isGenerating) {
      setIsPlaying(false);
    }
  }, [isGenerating]);

  const handleAudioEnded = useCallback(() => {
    currentPlayIndexRef.current += 1;
    playNextInQueue();
  }, [playNextInQueue]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = handleAudioEnded;
      audioRef.current.onerror = () => {
        console.error("Audio playback error, skipping chunk.");
        handleAudioEnded();
      };
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onplay = () => setIsPlaying(true);
    }
  }, [handleAudioEnded]);

  // Trigger playback when queue updates
  useEffect(() => {
    if (audioQueueRef.current.length > 0 && !isPlaying && currentPlayIndexRef.current < audioQueueRef.current.length) {
      playNextInQueue();
    }
  }, [audioQueueRef.current.length, isPlaying, playNextInQueue]);

  const previewVoice = async (selectedVoice: string = voice) => {
    if (isPreviewing) return;
    
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
        
        audio.onended = () => setIsPreviewing(false);
        audio.onerror = () => setIsPreviewing(false);
        await audio.play();
      }
    } catch (error) {
      console.error("Preview error:", error);
      setIsPreviewing(false);
    }
  };

  const generateAndPlay = async (text: string) => {
    if (!text.trim()) return;
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setIsGenerating(true);
    setError(null);
    audioQueueRef.current = [];
    currentPlayIndexRef.current = 0;
    setIsPlaying(false);
    if (fullAudioUrl) URL.revokeObjectURL(fullAudioUrl);
    setFullAudioUrl(null);
    
    if (audioRef.current) audioRef.current.pause();
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewing(false);
    }
    
    const textChunks = chunkText(text, 400);
    setProgress({ current: 0, total: textChunks.length });
    let fetchedPcm: Uint8Array[] = [];

    for (let i = 0; i < textChunks.length; i++) {
      if (signal.aborted) break;

      let chunkSuccess = false;
      let retries = 3;
      let delay = 1500;

      while (!chunkSuccess && retries > 0) {
        if (signal.aborted) break;
        
        try {
          if (i > 0 || retries < 3) await new Promise(resolve => setTimeout(resolve, delay));

          const prompt = `Yumuşak, güzel ve öğretici bir tonda oku:\n\n${textChunks[i]}`;
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
            
            const wavBlob = createWavBlob(pcm, 24000);
            const url = URL.createObjectURL(wavBlob);
            
            audioQueueRef.current = [...audioQueueRef.current, url];
            setProgress(prev => ({ ...prev, current: i + 1 }));
            
            // Trigger playback for the first chunk immediately
            if (i === 0 && audioRef.current) {
               playNextInQueue();
            }
            
            chunkSuccess = true;
          } else {
            throw new Error("No audio data received.");
          }
        } catch (err) {
          if (signal.aborted) break;
          retries--;
          delay += 2000;
          
          if (retries === 0) {
            setError("API sınırlarına ulaşıldı veya bir hata oluştu. İşlem yarıda kesildi.");
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
        const totalLen = fetchedPcm.reduce((acc, val) => acc + val.length, 0);
        const combined = new Uint8Array(totalLen);
        let offset = 0;
        for (const pcm of fetchedPcm) {
          combined.set(pcm, offset);
          offset += pcm.length;
        }
        const fullWav = createWavBlob(combined, 24000);
        setFullAudioUrl(URL.createObjectURL(fullWav));
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (audioQueueRef.current.length > 0) {
        audioRef.current.play();
      }
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
    download
  };
}
