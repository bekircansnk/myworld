import React from "react";
import { Mic, User, Radio } from "lucide-react";

interface TranslateButtonProps {
  mode: "me" | "other";
  isActive: boolean;
  onClick: () => void;
  languageName: string;
  flag: string;
}

export function TranslateButton({ mode, isActive, onClick, languageName, flag }: TranslateButtonProps) {
  const isMe = mode === "me";
  
  // Renk ve stil kararları (Premium tasarım, canli pulse)
  const activeStyles = isMe
    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-transparent"
    : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_8px_30px_rgba(16,185,129,0.4)] border-transparent";

  const inactiveStyles = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm";

  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300 relative overflow-hidden group select-none min-h-[160px] md:min-h-[220px] ${
        isActive ? activeStyles : inactiveStyles
      }`}
    >
      {/* Dalga form animasyonu (Sadece aktifken arka planda) */}
      {isActive && (
        <div className="absolute inset-0 flex items-end justify-center gap-1 opacity-25 px-8 pb-4">
          <span className="w-1 bg-white rounded-full animate-[pulse_1.2s_infinite] h-8 delay-100"></span>
          <span className="w-1 bg-white rounded-full animate-[pulse_1.2s_infinite] h-12 delay-300"></span>
          <span className="w-1 bg-white rounded-full animate-[pulse_1.2s_infinite] h-16 delay-500"></span>
          <span className="w-1 bg-white rounded-full animate-[pulse_1.2s_infinite] h-12 delay-200"></span>
          <span className="w-1 bg-white rounded-full animate-[pulse_1.2s_infinite] h-8 delay-400"></span>
        </div>
      )}

      {/* İkon / Görsel */}
      <div className={`p-4 rounded-2xl transition-all duration-300 mb-3 ${
        isActive 
          ? 'bg-white/20 scale-110 rotate-3' 
          : 'bg-slate-100 dark:bg-white/5 group-hover:scale-105'
      }`}>
        {isMe ? (
          <Mic className={`w-7 h-7 ${isActive ? 'text-white' : 'text-indigo-500 dark:text-indigo-400'}`} />
        ) : (
          <User className={`w-7 h-7 ${isActive ? 'text-white' : 'text-emerald-500 dark:text-emerald-400'}`} />
        )}
      </div>

      {/* Yazılar */}
      <span className="text-xs font-black tracking-widest uppercase opacity-75">
        {isMe ? "BEN KONUŞUYORUM" : "KARŞI TARAF"}
      </span>
      
      <span className="text-lg font-extrabold mt-1 flex items-center gap-1.5">
        <span>{flag}</span>
        <span>{languageName}</span>
      </span>

      {/* Aktiflik Noktası */}
      {isActive && (
        <span className="absolute top-4 right-4 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
      )}
    </button>
  );
}
