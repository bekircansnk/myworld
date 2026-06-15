import React, { useEffect, useRef } from "react";
import { useLiveTranslateStore } from "@/stores/liveTranslateStore";
import { Trash2, MessageSquare, Volume2 } from "lucide-react";

export function TranscriptPanel() {
  const { transcripts, clearTranscripts, isAudioPlaying } = useLiveTranslateStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Yeni transkript geldiğinde otomatik en alta kaydır
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  return (
    <div className="flex-1 min-h-0 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/5 rounded-3xl flex flex-col overflow-hidden shadow-inner">
      {/* Panel Header */}
      <div className="px-5 py-3 border-b border-slate-200/40 dark:border-white/5 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Canlı Transkript
          </span>
          {isAudioPlaying && (
            <span className="flex items-center gap-1 text-[10px] text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full animate-pulse font-semibold">
              <Volume2 className="w-3 h-3" />
              Ses oynatılıyor
            </span>
          )}
        </div>
        
        {transcripts.length > 0 && (
          <button
            onClick={clearTranscripts}
            className="flex items-center gap-1.5 px-2.5 py-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-lg text-xs font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Temizle
          </button>
        )}
      </div>

      {/* Transkript Akışı */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {transcripts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
            <MessageSquare className="w-10 h-10 mb-2 opacity-35" />
            <p className="text-sm font-bold">Henüz konuşma yok</p>
            <p className="text-xs max-w-[200px] mt-1 opacity-75">
              Yukarıdaki butonlardan birine basarak konuşmayı başlatabilirsiniz.
            </p>
          </div>
        ) : (
          transcripts.flatMap((entry) => {
            const bubbles = [];
            const timeStr = new Date(entry.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            });

            // 1. Orijinal Baloncuk
            if (entry.text) {
              const isMeOriginal = entry.speaker === "me";
              bubbles.push(
                <div
                  key={`${entry.id}_orig`}
                  className={`flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                    isMeOriginal ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      isMeOriginal
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm font-semibold leading-relaxed">
                      {entry.text}
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1 mb-1.5">
                    {timeStr} • {isMeOriginal ? "Ben (Türkçe)" : "Karşı Taraf (İngilizce)"}
                  </span>
                </div>
              );
            } else if (!entry.text && !entry.translatedText) {
              const isMeOriginal = entry.speaker === "me";
              bubbles.push(
                <div
                  key={`${entry.id}_loading`}
                  className={`flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                    isMeOriginal ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      isMeOriginal
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm font-semibold leading-relaxed opacity-60 italic animate-pulse">
                      Konuşuluyor...
                    </p>
                  </div>
                </div>
              );
            }

            // 2. Çeviri Baloncuk
            if (entry.translatedText) {
              const isMeTranslated = entry.speaker === "other"; 
              bubbles.push(
                <div
                  key={`${entry.id}_trans`}
                  className={`flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                    isMeTranslated ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      isMeTranslated
                        ? "bg-indigo-500/90 text-white rounded-br-none border border-indigo-400/20"
                        : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-bl-none border border-emerald-100/30 dark:border-emerald-500/10"
                    }`}
                  >
                    <p className="text-sm font-medium leading-relaxed italic">
                      {entry.translatedText}
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1 mb-1.5">
                    {timeStr} • {isMeTranslated ? "Türkçe Çeviri" : "İngilizce Çeviri"}
                  </span>
                </div>
              );
            } else if (entry.text && !entry.isFinal) {
              const isMeTranslated = entry.speaker === "other";
              bubbles.push(
                <div
                  key={`${entry.id}_trans_loading`}
                  className={`flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                    isMeTranslated ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${
                      isMeTranslated
                        ? "bg-indigo-500/50 text-white/70 rounded-br-none"
                        : "bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-800/70 dark:text-emerald-300/70 rounded-bl-none"
                    }`}
                  >
                    <p className="text-xs leading-relaxed italic animate-pulse">
                      Çevriliyor...
                    </p>
                  </div>
                </div>
              );
            }

            return bubbles;
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
