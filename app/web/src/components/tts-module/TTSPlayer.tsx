import React from 'react';
import { Play, Pause, Square, Loader2, Volume2, Download, Mic } from 'lucide-react';
import { useTTS } from './useTTS';

interface TTSPlayerProps {
  text: string;
  noteId?: number;
  savedAudioUrl?: string;
  savedAudioText?: string;
  currentText?: string;
  apiKey?: string;
  className?: string;
}

export function TTSPlayer({ text, noteId, savedAudioUrl, savedAudioText, currentText, apiKey, className = '' }: TTSPlayerProps) {
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
    download,
    playbackTime,
    playbackDuration,
    seekTo
  } = useTTS({ apiKey });

  // Zaman formatlama yardımcısı (01:23)
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const hasStarted = progress.total > 0 || !!fullAudioUrl;
  const isFinished = !isGenerating && hasStarted;

  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-4 ${className}`}>
      
      {/* Üst Kısım: Ses Seçimi ve Ana Buton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Ses Seçici */}
        <div className={`flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 rounded-lg p-1.5 w-full sm:w-auto ${fullAudioUrl ? 'opacity-50 pointer-events-none' : ''}`}>
          <Volume2 className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            disabled={isGenerating || isPlaying || !!fullAudioUrl}
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
            disabled={isPreviewing || isGenerating || isPlaying || !!fullAudioUrl}
            className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors"
            title="Sesi Önizle"
          >
            {isPreviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
        </div>

        {/* Ana Aksiyon Butonu (Başlat/Durdur) */}
        {!isGenerating && !fullAudioUrl ? (
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
              disabled={isGenerating}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isGenerating ? 'Ses Hazırlanıyor...' : (isPlaying ? 'Duraklat' : 'Dinle')}</span>
            </button>
            <button
              onClick={stop}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
              title={isGenerating ? "İşlemi İptal Et" : "Oynatıcıyı Yeniden Başlat (Ses Sıfırlanır)"}
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          </div>
        )}
      </div>

      {/* Alt Kısım: İlerleme ve Hata Durumu */}
      {hasStarted && (
        <div className="flex flex-col gap-2">
          {isGenerating ? (
            <>
              {/* Progress Bar Yükleme Aşaması */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                <span>İşleniyor... ({progress.current}/{progress.total})</span>
              </div>
            </>
          ) : (
            fullAudioUrl && (
              <div className="flex flex-col gap-2 mt-1">
                {/* Oynatma (Scrub Yüzeyi) Progress Bar */}
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] tabular-nums font-medium text-slate-400 w-7 text-right">
                    {formatTime(playbackTime)}
                  </span>
                  
                  <div className="relative flex-1 group cursor-pointer h-4 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max={playbackDuration || 100}
                      step="0.01"
                      value={playbackTime}
                      onChange={(e) => seekTo(Number(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 relative overflow-hidden group-hover:bg-slate-700 transition-colors">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-75 relative"
                        style={{ width: `${playbackDuration > 0 ? (playbackTime / playbackDuration) * 100 : 0}%` }}
                      >
                        {/* Dot indicator */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm shadow-indigo-500/50 scale-0 group-hover:scale-100 transition-transform" />
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] tabular-nums font-medium text-slate-400 w-7">
                    {formatTime(playbackDuration)}
                  </span>
                </div>
                
                {/* Durum & İndirme İkonu */}
                <div className="flex items-center justify-between ml-1 text-xs">
                  <div className="text-[10px] text-emerald-400 font-bold tracking-wide">
                    Ses Dosyası Hazır
                  </div>
                  <button
                    onClick={download}
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition-colors p-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>İndir</span>
                  </button>
                </div>
              </div>
            )
          )}
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
