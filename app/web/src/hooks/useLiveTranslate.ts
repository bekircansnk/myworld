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

  // Ses çalmayı durdurmak için aktif ses kaynaklarını tutan dizi
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // PCM Base64 verisini çalma kuyruğu
  const playPcmChunk = (base64Data: string, sampleRate = 24000) => {
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
      
      // Eğer suspend durumundaysa (tarayıcı güvenlik kısıtlaması) resume et
      if (ctx.state === "suspended") {
        ctx.resume();
      }

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
      
      // Çalmaya başladığında state'i güncelle
      setIsAudioPlaying(true);
      
      // Kaynak bittiğinde listeden kaldır
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

  // Tüm ses çalma işlemlerini anında durdurma
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

  // WebSocket ve mikrofon bağlantısını sonlandır
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

  // WebSocket ve Mikrofon bağlantısını başlat
  const connectSession = async (currentMode: "me" | "other") => {
    disconnect();
    setStatus("connecting");
    setErrorMessage(null);

    const apiKey = getGeminiApiKey();
    // Bidi (Bidirectional) Live API endpoint'i
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

    console.log(`Connecting to Gemini Live API with key index... Mode: ${currentMode}`);

    try {
      // 1. Mikrofon izni ve stream al
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 2. WebSocket kur
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
        console.log("WebSocket connection established!");
        setStatus("connected");
        retryCountRef.current = 0; // Başarılı bağlantıda retry sayısını sıfırla

        // A. Setup/Konfigürasyon mesajı gönder
        const sourceLang = currentMode === "me" ? myLanguage : targetLanguage;
        const destLang = currentMode === "me" ? targetLanguage : myLanguage;

        const systemInstruction = `You are a professional instant translator. 
Your goal is to translate everything you hear immediately.
Translate from language code ${sourceLang} to language code ${destLang}.
- Output ONLY the translated audio and translated text.
- Do NOT add any conversational filler, explanations, greetings or remarks.
- Translate accurately, keeping the natural tone of the speaker.
- Speak in the destination language.`;

        const setupMessage = {
          setup: {
            model: "models/gemini-2.0-flash-exp",
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Aoede" // Puck, Charon, Kore, Fenrir, Aoede
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

        // ScriptProcessor kullanarak ses yakalama
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
          
          // Gelen ses verisini çal
          if (response.serverContent?.modelTurn?.parts) {
            const parts = response.serverContent.modelTurn.parts;
            
            // Eğer yeni bir model sırası başladıysa transkript kaydı oluştur
            if (!currentTurnIdRef.current) {
              currentTurnIdRef.current = Math.random().toString(36).substring(7);
              addTranscript({
                id: currentTurnIdRef.current,
                speaker: currentMode === "me" ? "other" : "me", // Benim konuştuğum karşı tarafa (other) gider, karşı tarafınki bana (me)
                text: "",
                timestamp: new Date().toISOString(),
                isFinal: false
              });
            }

            parts.forEach((part: any) => {
              // PCM Ses Chunk'ı
              if (part.inlineData && part.inlineData.mimeType?.startsWith("audio/pcm")) {
                playPcmChunk(part.inlineData.data);
              }
              
              // Metin Transkripti (Varsa)
              if (part.text) {
                const text = part.text;
                if (currentTurnIdRef.current) {
                  updateTranscript(currentTurnIdRef.current, {
                    text: text // Not: Çift yönlü çeviride model doğrudan çeviriyi verir
                  });
                }
              }
            });
          }

          // Model konuşması tamamlandıysa turn sıfırla
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
        console.log(`WebSocket closed: Code ${event.code}, Reason: ${event.reason}`);
        // Eğer anormal bir kapanma olduysa ve henüz bağlanamadıysak key rotate et
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

  // API Key hatası durumunda bir sonraki key'i deneme mekanizması
  const handleKeyFailure = (currentMode: "me" | "other") => {
    if (retryCountRef.current < 3) {
      retryCountRef.current += 1;
      const newKey = rotateGeminiApiKey();
      console.log(`Retrying session connection (Attempt ${retryCountRef.current}) with next key...`);
      setTimeout(() => {
        connectSession(currentMode);
      }, 500);
    } else {
      setErrorMessage("API Limitleri aşıldı veya tüm anahtarlar geçersiz. Lütfen daha sonra tekrar deneyin.");
      setStatus("error");
      disconnect();
    }
  };

  // Mod değiştiğinde (Ben konuşuyorum / Karşı taraf konuşuyor / Durdurulduğunda)
  useEffect(() => {
    if (activeMode === "none") {
      disconnect();
    } else {
      connectSession(activeMode === "me" ? "me" : "other");
    }

    return () => {
      // Unmount'ta temizlik yap
      if (activeMode === "none") {
        disconnect();
      }
    };
  }, [activeMode]);

  // Sayfa kapandığında bağlantıyı kapat
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    status,
    activeMode,
    connectSession,
    disconnect,
    stopAllAudioPlayback
  };
}
