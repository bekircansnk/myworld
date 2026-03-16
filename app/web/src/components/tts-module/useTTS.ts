import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { chunkText, base64ToUint8Array, createWavBlob } from './utils';

export const VOICES = [
  { id: 'Puck', name: 'Yumuşak' },
  { id: 'Charon', name: 'Derin' },
  { id: 'Kore', name: 'Net' },
  { id: 'Fenrir', name: 'Güçlü' },
  { id: 'Zephyr', name: 'Hafif' },
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

  // Playback tracking
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize AI client
  const ai = new GoogleGenAI({ 
    apiKey: apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyD4yG67W0hkE-I62E2-DE2e6ERofjEQvaM' 
  });

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
      if (fullAudioUrl) URL.revokeObjectURL(fullAudioUrl);
    };
  }, [fullAudioUrl]);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setPlaybackTime(0);
      };
      audioRef.current.onerror = () => {
        console.error("Audio playback error.");
        setIsPlaying(false);
      };
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setPlaybackTime(audioRef.current.currentTime);
        }
      };
      audioRef.current.onloadedmetadata = () => {
        if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
          setPlaybackDuration(audioRef.current.duration);
        }
      };
      audioRef.current.oncanplay = () => {
        if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
          setPlaybackDuration(audioRef.current.duration);
        }
      }
    }
  }, []);

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
    setIsPlaying(false);
    if (fullAudioUrl) URL.revokeObjectURL(fullAudioUrl);
    setFullAudioUrl(null);
    
    if (audioRef.current) audioRef.current.pause();
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewing(false);
    }
    
    // Chunk size increased to 4000 to keep most notes as a single block
    const textChunks = chunkText(text, 4000);
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
            
            setProgress(prev => ({ ...prev, current: i + 1 }));
            
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
        const finalUrl = URL.createObjectURL(fullWav);
        setFullAudioUrl(finalUrl);
        
        // Auto-play instantly when generation completely finishes
        if (audioRef.current) {
          audioRef.current.src = finalUrl;
          audioRef.current.play().catch(e => console.error("Auto-play combined failed:", e));
          setIsPlaying(true);
        }
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (fullAudioUrl || audioRef.current.src) {
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
    setPlaybackTime(0);
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
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
    seekTo
  };
}
