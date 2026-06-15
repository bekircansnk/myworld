import React, { useState } from "react";
import { useLiveTranslateStore } from "@/stores/liveTranslateStore";
import { useLiveTranslate } from "@/hooks/useLiveTranslate";
import { SUPPORTED_LANGUAGES } from "./constants";
import { LanguageSelector } from "./LanguageSelector";
import { TranslateButton } from "./TranslateButton";
import { TranscriptPanel } from "./TranscriptPanel";
import { ConnectionStatus } from "./ConnectionStatus";
import { ArrowLeftRight, VolumeX, Settings, Volume2, Mic, ToggleLeft, ToggleRight, Info, MessageSquare, X, Headphones } from "lucide-react";

export function LiveTranslatePage() {
  const {
    myLanguage,
    targetLanguage,
    activeMode,
    audioInputDevice,
    audioOutputDeviceMe,
    audioOutputDeviceOther,
    isAutomaticMode,
    setMyLanguage,
    setTargetLanguage,
    swapLanguages,
    setActiveMode,
    setAudioInputDevice,
    setAudioOutputDeviceMe,
    setAudioOutputDeviceOther,
    setIsAutomaticMode,
    isAudioPlaying
  } = useLiveTranslateStore();

  const { status, devices, stopAllAudioPlayback, refreshDevices } = useLiveTranslate();
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileTranscript, setShowMobileTranscript] = useState(false);

  const myLangObj = SUPPORTED_LANGUAGES.find(l => l.code === myLanguage) || SUPPORTED_LANGUAGES[0];
  const targetLangObj = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage) || SUPPORTED_LANGUAGES[1];

  const handleMeClick = () => {
    if (activeMode === "me") {
      setActiveMode("none");
    } else {
      setActiveMode("me");
    }
  };

  const handleOtherClick = () => {
    if (activeMode === "other") {
      setActiveMode("none");
    } else {
      setActiveMode("other");
    }
  };

  const handleAutoToggleClick = () => {
    if (activeMode !== "none") {
      setActiveMode("none");
    } else {
      setActiveMode("me"); // Otomatik modu tetikler
    }
  };

  const handleStopAll = () => {
    setActiveMode("none");
    stopAllAudioPlayback();
  };

  return (
    <div className="flex-1 min-h-0 max-h-[calc(100vh-65px)] lg:max-h-none overflow-hidden lg:overflow-visible flex flex-col p-3 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/20 max-w-7xl mx-auto w-full relative">
      
      {/* İki Sütunlu Desktop Düzeni, Tek Sütunlu Mobil Düzeni */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 overflow-hidden">
        
        {/* Sol Kolon: Kontroller, Butonlar, Diller (Col: 7) */}
        <div className="lg:col-span-7 flex flex-col min-h-0 overflow-y-auto pr-0 lg:pr-2 space-y-4 pb-16 lg:pb-0">
          
          {/* Üst Kısım: Başlık */}
          <div className="flex items-center justify-between gap-4 shrink-0">
            <div>
              <h1 className="text-lg md:text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                <span>Canlı Sesli Çeviri</span>
                {isAutomaticMode && (
                  <span className="text-[9px] bg-indigo-500/10 text-indigo-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    Otomatik Mod
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground text-[11px] md:text-sm mt-0.5 font-medium">
                Akıllı kulaklık ve hoparlör ayrımıyla çift yönlü çeviri yapın.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  refreshDevices();
                }}
                className={`p-2 rounded-xl border transition-all ${
                  showSettings 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
                title="Ses Cihazı Ayarları"
              >
                <Settings className="w-4.5 h-4.5" />
              </button>

              {(activeMode !== "none" || isAudioPlaying) && (
                <button
                  onClick={handleStopAll}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs shadow-md shadow-red-500/20 transition-all"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  Durdur
                </button>
              )}
            </div>
          </div>

          {/* Ses Aygıtları Ayarları Paneli */}
          {showSettings && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-indigo-500" />
                Ses Cihazı Ayarları
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Giriş Cihazı */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Mikrofon (Giriş)
                  </label>
                  <select
                    value={audioInputDevice}
                    onChange={(e) => setAudioInputDevice(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
                  >
                    <option value="default">Varsayılan Mikrofon</option>
                    {devices.inputs.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || `Mikrofon (${d.deviceId.substring(0, 5)})`}</option>
                    ))}
                  </select>
                </div>

                {/* Benim Çıkışım (Kulaklık) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Kulağım (Kulaklık)
                  </label>
                  <select
                    value={audioOutputDeviceMe}
                    onChange={(e) => setAudioOutputDeviceMe(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
                  >
                    <option value="default">Varsayılan Çıkış</option>
                    {devices.outputs.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || `Çıkış (${d.deviceId.substring(0, 5)})`}</option>
                    ))}
                  </select>
                </div>

                {/* Karşı Tarafın Çıkışı (Hoparlör) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                    Karşı Taraf (Hoparlör)
                  </label>
                  <select
                    value={audioOutputDeviceOther}
                    onChange={(e) => setAudioOutputDeviceOther(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
                  >
                    <option value="default">Varsayılan Çıkış</option>
                    {devices.outputs.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || `Hoparlör (${d.deviceId.substring(0, 5)})`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 p-2.5 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl flex items-start gap-2 border border-indigo-100/50 dark:border-indigo-500/10">
                <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-indigo-600/90 dark:text-indigo-400/90 leading-normal font-semibold">
                  <strong>Akıllı Ses Ayrımı:</strong> Türkçe konuştuklarınız dışarıya **Hoparlörden** İngilizce verilir. Karşı taraf İngilizce konuşursa size **Kulaklıktan** Türkçe ses gelir.
                </p>
              </div>
            </div>
          )}

          {/* Diller */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center gap-3 shrink-0">
            <LanguageSelector
              label="Benim Dilim"
              selectedCode={myLanguage}
              onSelect={setMyLanguage}
              excludeCode={targetLanguage}
            />
            
            <button
              onClick={swapLanguages}
              disabled={status !== "idle"}
              className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-inner disabled:opacity-50 shrink-0 mt-4"
              title="Dilleri Değiştir"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <LanguageSelector
              label="Karşı Taraf"
              selectedCode={targetLanguage}
              onSelect={setTargetLanguage}
              excludeCode={myLanguage}
            />
          </div>

          {/* Otomatik Mod Toggle */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-2xl p-3.5 shadow-sm flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-500">
                <Mic className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block text-xs md:text-sm font-bold text-slate-800 dark:text-white">
                  Otomatik Dil Algılama ve Çeviri
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">
                  Sürekli dinleme yapar ve dilleri ayırt eder.
                </span>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (status !== "idle") handleStopAll();
                setIsAutomaticMode(!isAutomaticMode);
              }}
              className="text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              {isAutomaticMode ? (
                <ToggleRight className="w-10 h-10 stroke-[1.5px]" />
              ) : (
                <ToggleLeft className="w-10 h-10 stroke-[1.5px] text-slate-300 dark:text-slate-700" />
              )}
            </button>
          </div>

          {/* Büyük Butonlar / Otomatik Başlat */}
          <div className="shrink-0 flex-1 flex flex-col justify-center min-h-[140px]">
            {isAutomaticMode ? (
              <button
                onClick={handleAutoToggleClick}
                className={`w-full py-6 px-4 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 font-extrabold text-sm shadow-md border ${
                  activeMode !== "none"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-transparent"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <div className={`p-3 rounded-xl ${activeMode !== "none" ? "bg-white/20 scale-105" : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500"} transition-all`}>
                  <Mic className={`w-6 h-6 ${activeMode !== "none" ? "animate-pulse" : ""}`} />
                </div>
                <span>
                  {activeMode !== "none" ? "OTOMATİK ÇEVİRİ DİNLENİYOR..." : "OTOMATİK ÇEVİRİYİ BAŞLAT"}
                </span>
                <span className="text-[10px] font-semibold opacity-75 max-w-[260px] text-center">
                  {activeMode !== "none" 
                    ? "Sürekli dinleme aktif. Konuşmanız bittiğinde otomatik çevrilir." 
                    : "İki dili otomatik tespit ederek doğru kanala (hoparlör/kulaklık) çeviri yapar."}
                </span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <TranslateButton
                  mode="me"
                  isActive={activeMode === "me"}
                  onClick={handleMeClick}
                  languageName={myLangObj.name}
                  flag={myLangObj.flag}
                />
                <TranslateButton
                  mode="other"
                  isActive={activeMode === "other"}
                  onClick={handleOtherClick}
                  languageName={targetLangObj.name}
                  flag={targetLangObj.flag}
                />
              </div>
            )}
          </div>

          {/* Durum / Log Paneli */}
          <div className="shrink-0 bg-white/40 dark:bg-slate-900/20 rounded-xl py-0.5 border border-slate-100 dark:border-white/5">
            <ConnectionStatus />
          </div>
        </div>

        {/* Sağ Kolon: Transkript Sütunu (Sadece Desktop'ta) (Col: 5) */}
        <div className="hidden lg:col-span-5 lg:flex flex-col min-h-0 h-full border-l border-slate-200/50 dark:border-white/5 pl-4">
          <TranscriptPanel />
        </div>
      </div>

      {/* Mobilde Yüzen Transkript Baloncuğu Butonu */}
      <button
        onClick={() => setShowMobileTranscript(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-indigo-500"
      >
        <MessageSquare className="w-5.5 h-5.5" />
      </button>

      {/* Mobil Transkript Popover Modal (Baloncuk Yapısı) */}
      {showMobileTranscript && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl flex flex-col overflow-hidden max-h-[80vh] w-full max-w-lg mx-auto shadow-2xl border border-slate-200 dark:border-white/10 animate-in slide-in-from-bottom-8 duration-300">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-indigo-500" />
                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Konuşma Geçmişi</span>
              </div>
              <button 
                onClick={() => setShowMobileTranscript(false)} 
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
              <TranscriptPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
