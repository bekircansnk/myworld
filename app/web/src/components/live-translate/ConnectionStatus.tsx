import React from "react";
import { useLiveTranslateStore } from "@/stores/liveTranslateStore";
import { getActiveKeyIndex, getKeysCount } from "@/lib/geminiKeys";

export function ConnectionStatus() {
  const { status, errorMessage } = useLiveTranslateStore();
  const activeIndex = getActiveKeyIndex();
  const totalKeys = getKeysCount();

  if (status === "idle") {
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-slate-500 text-xs font-semibold">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse"></span>
        Hazır (Gemini Live API)
      </div>
    );
  }

  if (status === "connecting") {
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-amber-500 text-xs font-semibold">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
        Bağlantı kuruluyor (Key #{activeIndex + 1}/{totalKeys})...
      </div>
    );
  }

  if (status === "connected") {
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-green-500 text-xs font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
        Canlı Bağlantı Aktif (Key #{activeIndex + 1})
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2 text-red-500 text-xs font-bold">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
        Bağlantı Hatası
      </div>
      {errorMessage && (
        <span className="text-[10px] font-normal text-red-400 max-w-xs text-center truncate">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
