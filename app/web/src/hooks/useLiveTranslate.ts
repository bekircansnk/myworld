import { useEffect, useRef, useState } from "react";
import { useLiveTranslateStore } from "@/stores/liveTranslateStore";
import { getGeminiApiKey, rotateGeminiApiKey, getKeysCount } from "@/lib/geminiKeys";
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
    addLog,
  } = useLiveTranslateStore();

  const wsMeRef = useRef<WebSocket | null>(null);
  const wsOtherRef = useRef<WebSocket | null>(null);
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

    const closeSocket = (ws: WebSocket | null) => {
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        ws.close();
      }
    };

    closeSocket(wsMeRef.current);
    wsMeRef.current = null;
    closeSocket(wsOtherRef.current);
    wsOtherRef.current = null;

    setStatus("idle");
  };

  // Oturumu Başlat
  const connectSession = async (currentMode: "me" | "other" | "auto") => {
    disconnect();
    setStatus("connecting");
    setErrorMessage(null);

    const apiKey = getGeminiApiKey();
    addLog(`Oturum başlatılıyor. Model: gemini-3.5-live-translate-preview, Mod: ${currentMode}`);
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

      let connectedSocketsCount = 0;
      const onConnectSuccess = () => {
        connectedSocketsCount += 1;
        if (currentMode === "auto") {
          if (connectedSocketsCount >= 2) {
            setStatus("connected");
            retryCountRef.current = 0;
          }
        } else {
          setStatus("connected");
          retryCountRef.current = 0;
        }
      };

      const onFailure = (err: any) => {
        console.error("Connection failure callback:", err);
        handleKeyFailure(currentMode);
      };

      // WebSocket oluşturma yardımcı fonksiyonu
      const createTranslationSocket = (
        targetLangCode: string,
        echo: boolean,
        isMeConn: boolean
      ): WebSocket => {
        const ws = new WebSocket(url);
        
        let connectionTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket connection timeout. Reconnecting...");
            ws.close();
            onFailure(new Error("Timeout"));
          }
        }, 6000);

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          addLog(`${isMeConn ? "[BENİM SESİM]" : "[KARŞI TARAF]"} soket bağlantısı başarıyla kuruldu. Model ayarlanıyor...`);
          onConnectSuccess();

          const setupMessage = {
            setup: {
              model: "models/gemini-3.5-live-translate-preview",
              generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: "Aoede" // Aoede, Puck, Charon, Kore, Fenrir
                    }
                  }
                },
                translationConfig: {
                  targetLanguageCode: targetLangCode,
                  echoTargetLanguage: echo
                }
              },
              contextWindowCompression: {
                triggerTokens: "0",
                slidingWindow: { targetTokens: "0" }
              },
              inputAudioTranscription: {},
              outputAudioTranscription: {}
            }
          };

          addLog(`Kurulum Gönderildi -> Hedef Dil: ${targetLangCode}, Echo: ${echo}`);
          ws.send(JSON.stringify(setupMessage));
        };

        ws.onmessage = async (event) => {
          try {
            let dataStr = "";
            if (typeof event.data === "string") {
              dataStr = event.data;
            } else if (event.data instanceof Blob) {
              dataStr = await event.data.text();
            } else if (event.data instanceof ArrayBuffer) {
              dataStr = new TextDecoder().decode(event.data);
            } else {
              dataStr = event.data.toString();
            }
            const response = JSON.parse(dataStr);

            // A. Giriş Metin Deşifresi (Input Transcription)
            if (response.serverContent?.inputTranscription?.text) {
              const inputTxt = response.serverContent.inputTranscription.text;
              const speaker = isMeConn ? "me" : "other";
              
              addLog(`[Giriş - ${speaker === "me" ? "Ben" : "Karşı"}] ${inputTxt}`);

              if (!currentTurnIdRef.current) {
                currentTurnIdRef.current = Math.random().toString(36).substring(7);
                addTranscript({
                  id: currentTurnIdRef.current,
                  speaker,
                  text: inputTxt,
                  timestamp: new Date().toISOString(),
                  isFinal: false
                });
              } else {
                updateTranscript(currentTurnIdRef.current, {
                  text: inputTxt,
                  speaker
                });
              }
            }

            // B. Model Çıktısı (Çeviri metni & Ses parçaları)
            if (response.serverContent?.modelTurn?.parts) {
              const parts = response.serverContent.modelTurn.parts;

              parts.forEach((part: any) => {
                // Çeviri Metni
                if (part.text) {
                  const translationTxt = part.text;
                  const speaker = isMeConn ? "me" : "other";
                  
                  addLog(`[Çeviri - ${speaker === "me" ? "Me->Other" : "Other->Me"}] ${translationTxt}`);

                  if (!currentTurnIdRef.current) {
                    currentTurnIdRef.current = Math.random().toString(36).substring(7);
                    addTranscript({
                      id: currentTurnIdRef.current,
                      speaker,
                      text: "",
                      translatedText: translationTxt,
                      timestamp: new Date().toISOString(),
                      isFinal: false
                    });
                  } else {
                    updateTranscript(currentTurnIdRef.current, {
                      translatedText: translationTxt,
                      speaker
                    });
                  }
                }

                // PCM Ses Parçası
                if (part.inlineData && part.inlineData.mimeType?.startsWith("audio/pcm")) {
                  let sampleRate = 24000;
                  const match = part.inlineData.mimeType.match(/rate=(\d+)/);
                  if (match && match[1]) {
                    sampleRate = parseInt(match[1], 10);
                  }

                  // Benim çevirilmiş sesim (TR->ENG) karşı tarafa (Hoparlör, isToTr = false)
                  // Karşı tarafın çevrilmiş sesi (ENG->TR) bana (Kulaklık, isToTr = true)
                  const isToTr = !isMeConn;
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
          console.error(`WebSocket error [isMe: ${isMeConn}]:`, err);
          addLog(`HATA: ${isMeConn ? "Benim sesim" : "Karşı taraf"} soketinde hata oluştu.`);
        };

        ws.onclose = (event) => {
          console.log(`WebSocket closed [isMe: ${isMeConn}]: Code ${event.code}`);
          addLog(`Kapatıldı: ${isMeConn ? "Benim sesim" : "Karşı taraf"} soketi (Kod: ${event.code}, Sebep: ${event.reason || "Belirtilmedi"})`);
          if (status === "connecting" || (event.code !== 1000 && event.code !== 1005)) {
            onFailure(new Error(`WebSocket closed unexpectedly with code ${event.code}`));
          }
        };

        return ws;
      };

      // Mod seçimine göre soketleri ayağa kaldır
      const myLangCode = myLanguage.split("-")[0];
      const targetLangCode = targetLanguage.split("-")[0];

      if (currentMode === "me") {
        // Yalnızca benim sesimi karşı tarafa çeviren soketi aç (echo: true)
        wsMeRef.current = createTranslationSocket(targetLangCode, true, true);
      } else if (currentMode === "other") {
        // Yalnızca karşı tarafın sesini bana çeviren soketi aç (echo: true)
        wsOtherRef.current = createTranslationSocket(myLangCode, true, false);
      } else if (currentMode === "auto") {
        // Otomatik Mod: İki soketi birden aç (echo: false, yankı yapmasın)
        // Soket 1: Benim sesimi dinler -> Diğer dile çevirip hoparlörden verir
        wsMeRef.current = createTranslationSocket(targetLangCode, false, true);
        // Soket 2: Karşı tarafın sesini dinler -> Benim dilime çevirip kulaklıktan verir
        wsOtherRef.current = createTranslationSocket(myLangCode, false, false);
      }

      // 3. Ses Girişini Başlat (16kHz PCM Mono)
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioCtx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = float32ToInt16(inputData);
        const base64Data = arrayBufferToBase64(pcmData.buffer);
        
        const mediaMsg = JSON.stringify({
          realtimeInput: {
            mediaChunks: [
              {
                mimeType: "audio/pcm;rate=16000",
                data: base64Data
              }
            ]
          }
        });

        if (wsMeRef.current && wsMeRef.current.readyState === WebSocket.OPEN) {
          wsMeRef.current.send(mediaMsg);
        }
        if (wsOtherRef.current && wsOtherRef.current.readyState === WebSocket.OPEN) {
          wsOtherRef.current.send(mediaMsg);
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
    } catch (err: any) {
      console.error("Failed to connect live translate session:", err);
      addLog(`HATA: ${err.message || err}`);
      setErrorMessage(err.message || "Mikrofon izni alınamadı veya bağlantı kurulamadı.");
      setStatus("error");
    }
  };

  const handleKeyFailure = (currentMode: "me" | "other" | "auto") => {
    const totalKeys = getKeysCount();
    addLog(`Key hatası algılandı. Retry sayısı: ${retryCountRef.current}/${totalKeys}`);
    if (retryCountRef.current < totalKeys) {
      retryCountRef.current += 1;
      const newKey = rotateGeminiApiKey();
      addLog(`API anahtarı döndürülüyor. Yeni index denenecek...`);
      setTimeout(() => {
        connectSession(currentMode);
      }, 1000);
    } else {
      addLog(`Kritik: Tüm kayıtlı API anahtarları tükendi!`);
      setErrorMessage(`Bağlantı başarısız. Toplam ${totalKeys} API anahtarı denendi fakat sonuç alınamadı. Key limitlerini veya interneti kontrol edin.`);
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
