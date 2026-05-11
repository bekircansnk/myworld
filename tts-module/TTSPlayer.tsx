import React from 'react';
import { Play, Pause, Square, Loader2, Volume2, Download, Mic } from 'lucide-react';
import { useTTS } from './useTTS';

interface TTSPlayerProps {
  text: string;
  apiKey?: string;
  className?: string;
}

export function TTSPlayer({ text, apiKey, className = '' }: TTSPlayerProps) {
  const {
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
  } = useTTS({ apiKey });

  const hasStarted = progress.total > 0;
  const isFinished = !isGenerating && hasStarted;

  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-4 ${className}`}>
      
      {/* Üst Kısım: Ses Seçimi ve Ana Buton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Ses Seçici */}
        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 rounded-lg p-1.5 w-full sm:w-auto">
          <Volume2 className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            disabled={isGenerating || isPlaying}
            className="bg-transparent border-none text-sm text-slate-200 focus:ring-0 cursor-pointer outline-none w-full sm:w-auto"
          >
            {VOICES.map((v) => (
              <option key={v.id} value={v.id} className="bg-slate-800 text-slate-200">
                {v.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => previewVoice()}
            disabled={isPreviewing || isGenerating || isPlaying}
            className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors"
            title="Sesi Önizle"
          >
            {isPreviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
        </div>

        {/* Ana Aksiyon Butonu (Başlat/Durdur) */}
        {!hasStarted || isFinished ? (
          <button
            onClick={() => generateAndPlay(text)}
            disabled={!text.trim() || isGenerating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Mic className="w-4 h-4" />
            <span>Notu Sese Dönüştür</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={togglePlayPause}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Duraklat' : 'Devam Et'}</span>
            </button>
            <button
              onClick={stop}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
              title="İptal Et"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          </div>
        )}
      </div>

      {/* Alt Kısım: İlerleme ve Hata Durumu */}
      {hasStarted && (
        <div className="flex flex-col gap-2">
          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              {isGenerating && <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />}
              <span>
                {isGenerating 
                  ? `İşleniyor... (${progress.current}/${progress.total})` 
                  : 'İşlem tamamlandı.'}
              </span>
            </div>
            
            {/* İndir Butonu (Sadece bittiğinde görünür) */}
            {fullAudioUrl && (
              <button
                onClick={download}
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>İndir</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hata Mesajı */}
      {error && (
        <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
}
