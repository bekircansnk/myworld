import { useEffect, useRef, useState } from "react";
import { useLiveTranslateStore } from "@/stores/liveTranslateStore";
import { getGeminiApiKey, rotateGeminiApiKey } from "@/lib/geminiKeys";
import { TranscriptEntry } from "@/components/live-translate/types";

export function useLiveTranslate() {
  const {
    myLanguage,
    targetLanguage,
    activeMode,
    status,
    audioInputDevice,
    audioOutputDeviceMe,
    audioOutputDeviceOther,
    isAutomaticMode,
    setStatus,
    setErrorMessage,
    addTranscript,
    updateTranscript,
    setIsAudioPlaying,
  } = useLiveTranslateStore();

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  
  // Transkript birikimi için geçici referanslar
  const currentTurnIdRef = useRef<string | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // Kullanılabilir ses cihazları listesi
  const [devices, setDevices] = useState<{
    inputs: MediaDeviceInfo[];
    outputs: MediaDeviceInfo[];
  }>({ inputs: [], outputs: [] });

  // Sistemdeki ses aygıtlarını listele
  const refreshDevices = async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices) return;
      
      // İlk başta izni tetiklemek için geçici mic isteği yapılabilir
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const inputs = deviceInfos.filter(d => d.kind === "audioinput");
      const outputs = deviceInfos.filter(d => d.kind === "audiooutput");
      setDevices({ inputs, outputs });
    } catch (err) {
      console.error("Failed to enumerate audio devices:", err);
    }
  };

  useEffect(() => {
    refreshDevices();
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener("devicechange", refreshDevices);
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", refreshDevices);
      };
    }
  }, []);

  // Ses çalma hedefini (sinkId) ayarlama
  const applySinkId = async (ctx: AudioContext, isToTr: boolean) => {
    const anyCtx = ctx as any;
    if (typeof anyCtx.setSinkId === "function") {
      const targetSinkId = isToTr ? audioOutputDeviceMe : audioOutputDeviceOther;
      try {
        await anyCtx.setSinkId(targetSinkId === "default" ? "" : targetSinkId);
        console.log(`Audio output directed to sink ID: ${targetSinkId}`);
      } catch (err) {
        console.warn("Failed to direct audio output via setSinkId:", err);
      }
    }
  };

  // PCM Base64 verisini çalma kuyruğu
  const playPcmChunk = async (base64Data: string, sampleRate = 24000, isToTr = true) => {
    try {
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      if (!playAudioContextRef.current) {
        playAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
        nextPlayTimeRef.current = playAudioContextRef.current.currentTime;
      }

      const ctx = playAudioContextRef.current;
      
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      // Ses yönlendirmesini uygula (kulaklık/hoparlör)
      await applySinkId(ctx, isToTr);

      const buffer = ctx.createBuffer(1, float32Array.length, sampleRate);
      buffer.copyToChannel(float32Array, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }

      source.start(nextPlayTimeRef.current);
      setIsAudioPlaying(true);
      
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsAudioPlaying(false);
        }
      };

      activeSourcesRef.current.push(source);
      nextPlayTimeRef.current += buffer.duration;
    } catch (err) {
      console.error("Audio chunk playback error:", err);
    }
  };

  // Tüm ses çalma işlemlerini durdurma
  const stopAllAudioPlayback = () => {
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch {}
    });
    activeSourcesRef.current = [];
    setIsAudioPlaying(false);
    nextPlayTimeRef.current = 0;
  };

  // Float32 -> Int16 PCM dönüştürücü
  const float32ToInt16 = (buffer: Float32Array): Int16Array => {
    let l = buffer.length;
    const buf = new Int16Array(l);
    while (l--) {
      const s = Math.max(-1, Math.min(1, buffer[l]));
      buf[l] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    };
    return buf;
  };

  // ArrayBuffer -> Base64 dönüştürücü
  const arrayBufferToBase64 = (buffer: ArrayBufferLike): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Bağlantıyı sonlandır
  const disconnect = () => {
    console.log("Disconnecting Live Translate session...");
    stopAllAudioPlayback();

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus("idle");
  };

  // Oturumu Başlat
  const connectSession = async (currentMode: "me" | "other" | "auto") => {
    disconnect();
    setStatus("connecting");
    setErrorMessage(null);

    const apiKey = getGeminiApiKey();
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

    try {
      // 1. Cihaz izinlerini al ve mikrofonu aç
      const constraints = {
        audio: audioInputDevice === "default" ? true : { deviceId: { exact: audioInputDevice } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      // 2. Play AudioContext'i hemen initialize et ve resume et (browser autoplay bypass)
      if (!playAudioContextRef.current) {
        playAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (playAudioContextRef.current.state === "suspended") {
        await playAudioContextRef.current.resume();
      }

      // 3. WebSocket bağlantısı kur
      const ws = new WebSocket(url);
      wsRef.current = ws;

      let connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.warn("WebSocket connection timeout. Rotating key...");
          ws.close();
          handleKeyFailure(currentMode);
        }
      }, 5000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log("WebSocket connection established! Mode:", currentMode);
        setStatus("connected");
        retryCountRef.current = 0;

        // A. Setup/Konfigürasyon mesajı gönder
        let systemInstruction = "";
        
        if (isAutomaticMode || currentMode === "auto") {
          // Otomatik mod talimatı: Çift yönlü otomatik algılama ve yönlendirme
          systemInstruction = `You are a professional bidirectional instant translator.
- You will receive audio chunks in either language code ${myLanguage} or language code ${targetLanguage}.
- Your task is to detect the source language automatically.
- If the speaker talks in ${myLanguage}, translate it immediately to ${targetLanguage} and prefix your text output with "[TO_ENG] ". Then output the translated audio and text.
- If the speaker talks in ${targetLanguage}, translate it immediately to ${myLanguage} and prefix your text output with "[TO_TR] ". Then output the translated audio and text.
- Output ONLY the translation. Do NOT add any conversational filler, greetings, comments or explanations.
- Speak in the destination language.`;
        } else {
          // Bas-Konuş/Manuel mod talimatı
          const sourceLang = currentMode === "me" ? myLanguage : targetLanguage;
          const destLang = currentMode === "me" ? targetLanguage : myLanguage;
          const toPrefix = currentMode === "me" ? "[TO_ENG]" : "[TO_TR]";

          systemInstruction = `You are a professional instant translator. 
Your goal is to translate everything you hear immediately.
Translate from language code ${sourceLang} to language code ${destLang}.
- Prefix your text output with "${toPrefix} ".
- Output ONLY the translated audio and translated text.
- Do NOT add any conversational filler, explanations, greetings or remarks.
- Translate accurately, keeping the natural tone of the speaker.
- Speak in the destination language.`;
        }

        const setupMessage = {
          setup: {
            model: "models/gemini-2.0-flash-exp",
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Aoede" // Aoede, Puck, Charon, Kore, Fenrir
                  }
                }
              }
            },
            systemInstruction: {
              parts: [
                { text: systemInstruction }
              ]
            }
          }
        };

        ws.send(JSON.stringify(setupMessage));

        // B. Ses Girişini Başlat (16kHz PCM Mono)
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = audioCtx;
        
        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;

        const processor = audioCtx.createScriptProcessor(2048, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = float32ToInt16(inputData);
            const base64Data = arrayBufferToBase64(pcmData.buffer);
            
            ws.send(JSON.stringify({
              realtimeInput: {
                mediaChunks: [
                  {
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Data
                  }
                ]
              }
            }));
          }
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          
          if (response.serverContent?.modelTurn?.parts) {
            const parts = response.serverContent.modelTurn.parts;

            parts.forEach((part: any) => {
              // Metin Transkripti (Varsa)
              let textChunk = "";
              if (part.text) {
                textChunk = part.text;
              }

              // Çeviri yönünü metinden algıla
              const isToTr = textChunk.includes("[TO_TR]") || (!textChunk.includes("[TO_ENG]") && currentMode !== "me");
              const cleanText = textChunk.replace("[TO_TR]", "").replace("[TO_ENG]", "").trim();

              if (textChunk || part.inlineData) {
                // Eğer yeni bir model sırası başladıysa transkript kaydı oluştur
                if (!currentTurnIdRef.current) {
                  currentTurnIdRef.current = Math.random().toString(36).substring(7);
                  addTranscript({
                    id: currentTurnIdRef.current,
                    speaker: isToTr ? "me" : "other", // Bana gelen çeviri 'me' (kulaklık), karşı tarafa giden 'other' (hoparlör)
                    text: cleanText,
                    timestamp: new Date().toISOString(),
                    isFinal: false
                  });
                } else if (cleanText) {
                  updateTranscript(currentTurnIdRef.current, {
                    text: cleanText,
                    speaker: isToTr ? "me" : "other"
                  });
                }
              }

              // PCM Ses Chunk'ı
              if (part.inlineData && part.inlineData.mimeType?.startsWith("audio/pcm")) {
                // Dinamik sample rate parse etme
                let sampleRate = 24000;
                const match = part.inlineData.mimeType.match(/rate=(\d+)/);
                if (match && match[1]) {
                  sampleRate = parseInt(match[1], 10);
                }

                // Hangi kanala çalacağını algıla
                const isToTr = currentTurnIdRef.current 
                  ? useLiveTranslateStore.getState().transcripts.find(t => t.id === currentTurnIdRef.current)?.speaker === "me"
                  : true;

                playPcmChunk(part.inlineData.data, sampleRate, isToTr);
              }
            });
          }

          if (response.serverContent?.turnComplete) {
            if (currentTurnIdRef.current) {
              updateTranscript(currentTurnIdRef.current, { isFinal: true });
              currentTurnIdRef.current = null;
            }
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error observed:", err);
      };

      ws.onclose = (event) => {
        console.log(`WebSocket closed: Code ${event.code}`);
        if (status === "connecting" || (event.code !== 1000 && event.code !== 1005)) {
          handleKeyFailure(currentMode);
        } else {
          setStatus("idle");
        }
      };

    } catch (err: any) {
      console.error("Failed to connect live translate session:", err);
      setErrorMessage(err.message || "Mikrofon izni alınamadı veya bağlantı kurulamadı.");
      setStatus("error");
    }
  };

  const handleKeyFailure = (currentMode: "me" | "other" | "auto") => {
    if (retryCountRef.current < 3) {
      retryCountRef.current += 1;
      const newKey = rotateGeminiApiKey();
      console.log(`Retrying session connection (Attempt ${retryCountRef.current}) with next key...`);
      setTimeout(() => {
        connectSession(currentMode);
      }, 500);
    } else {
      setErrorMessage("API Limitleri aşıldı veya tüm anahtarlar geçersiz.");
      setStatus("error");
      disconnect();
    }
  };

  // Mod değiştiğinde (Durdurulduğunda / Başlatıldığında)
  useEffect(() => {
    if (activeMode === "none") {
      disconnect();
    } else {
      connectSession(isAutomaticMode ? "auto" : activeMode);
    }

    return () => {
      if (activeMode === "none") {
        disconnect();
      }
    };
  }, [activeMode]);

  return {
    status,
    activeMode,
    devices,
    refreshDevices,
    connectSession,
    disconnect,
    stopAllAudioPlayback
  };
}
