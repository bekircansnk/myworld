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
    isAudioPlaying,
    logs,
    clearLogs,
    addLog
  } = useLiveTranslateStore();

  const { status, devices, stopAllAudioPlayback, refreshDevices } = useLiveTranslate();
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileTranscript, setShowMobileTranscript] = useState(false);
  const [showLogConsole, setShowLogConsole] = useState(true); // Log konsolu varsayılan olarak açık olsun

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
    <div className="flex-1 w-full flex flex-col p-3 md:p-6 lg:p-8 lg:h-full bg-slate-50/50 dark:bg-slate-950/20 max-w-7xl mx-auto relative overflow-y-auto lg:overflow-hidden pb-24 lg:pb-8">
      
      {/* İki Sütunlu Desktop Düzeni, Tek Sütunlu Mobil Düzeni */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 lg:h-full">
        
        {/* Sol Kolon: Kontroller, Butonlar, Diller (Col: 7) */}
        <div className="lg:col-span-7 flex flex-col space-y-4 min-h-0 overflow-y-auto lg:pr-2 pb-2 scrollbar-thin">
          
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
              <p className="text-muted-foreground text-[11px] md:text-xs mt-0.5 font-medium">
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
                title="Ses Cihazı İleri Ayarları"
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

          {/* İleri Ses Aygıtları Ayarları Paneli */}
          {showSettings && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-indigo-500" />
                İleri Giriş Aygıtı
              </h3>
              
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

          {/* Kolay Kulaklık / Hoparlör Yönlendirme Paneli (Hızlı Geçiş Modu) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 shadow-sm shrink-0">
            <span className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-wider">
              🔊 HIZLI SES GEÇİŞ MODU
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Kulağım (Kulaklık) */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1">
                  <Headphones className="w-3.5 h-3.5" />
                  KULAĞIM (KULAKLIK)
                </span>
                <select
                  value={audioOutputDeviceMe}
                  onChange={(e) => {
                    setAudioOutputDeviceMe(e.target.value);
                    addLog(`Kulağım çıkışı değiştirildi: ${e.target.value}`);
                  }}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
                >
                  <option value="default">Varsayılan Çıkış</option>
                  {devices.outputs.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Çıkış (${d.deviceId.substring(0, 5)})`}</option>
                  ))}
                </select>
              </div>

              {/* Karşı Taraf (Hoparlör) */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  KARŞI TARAF (HOPARLÖR)
                </span>
                <select
                  value={audioOutputDeviceOther}
                  onChange={(e) => {
                    setAudioOutputDeviceOther(e.target.value);
                    addLog(`Karşı taraf çıkışı değiştirildi: ${e.target.value}`);
                  }}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500"
                >
                  <option value="default">Varsayılan Çıkış</option>
                  {devices.outputs.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Çıkış (${d.deviceId.substring(0, 5)})`}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-2 text-[9px] text-slate-400 font-semibold leading-normal flex items-start gap-1">
              <Info className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                Telefon veya bilgisayarda kulaklık takılıyken, kendi dilinizi hoparlöre, karşı tarafın dilini kulaklığınıza yönlendirerek kesintisiz akıllı çeviri yapabilirsiniz.
              </span>
            </div>
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
                  Sürekli dinleme yapar ve dilleri kendi ayırt ederek çevirir.
                </span>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (status !== "idle") handleStopAll();
                setIsAutomaticMode(!isAutomaticMode);
                addLog(`Otomatik Mod toggled: ${!isAutomaticMode}`);
              }}
              className="text-indigo-500 hover:text-indigo-600 transition-colors animate-fade-in"
            >
              {isAutomaticMode ? (
                <ToggleRight className="w-10 h-10 stroke-[1.5px]" />
              ) : (
                <ToggleLeft className="w-10 h-10 stroke-[1.5px] text-slate-300 dark:text-slate-700" />
              )}
            </button>
          </div>

          {/* Büyük Butonlar / Otomatik Başlat */}
          <div className="shrink-0 flex flex-col justify-center min-h-[120px]">
            {isAutomaticMode ? (
              <button
                onClick={handleAutoToggleClick}
                className={`w-full py-5 px-4 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 font-extrabold text-sm shadow-md border ${
                  activeMode !== "none"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-transparent"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <div className={`p-2.5 rounded-xl ${activeMode !== "none" ? "bg-white/20 scale-105" : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500"} transition-all`}>
                  <Mic className={`w-5 h-5 ${activeMode !== "none" ? "animate-pulse" : ""}`} />
                </div>
                <span className="tracking-wide text-xs md:text-sm">
                  {activeMode !== "none" ? "OTOMATİK ÇEVİRİ DİNLENİYOR..." : "OTOMATİK ÇEVİRİYİ BAŞLAT"}
                </span>
                <span className="text-[10px] font-semibold opacity-75 max-w-[280px] text-center">
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

          {/* Durum Göstergesi */}
          <div className="shrink-0 bg-white/40 dark:bg-slate-900/20 rounded-xl py-0.5 border border-slate-100 dark:border-white/5">
            <ConnectionStatus />
          </div>

          {/* Canlı Log & Teşhis Paneli (Hata Ayıklama İçin) */}
          <div className="mt-4 shrink-0 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <button
              onClick={() => setShowLogConsole(!showLogConsole)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-950/80 text-white font-bold text-xs uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                CANLI BAĞLANTI LOGLARI VE TEŞHİS PANELİ
              </span>
              <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                {showLogConsole ? "KAPAT" : "GÖSTER"}
              </span>
            </button>
            
            {showLogConsole && (
              <div className="p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">Websocket durumu ve API anahtarı takibi:</span>
                  <button
                    onClick={clearLogs}
                    className="text-[9px] text-red-400 hover:text-red-300 font-bold bg-red-500/10 px-2.5 py-1 rounded"
                  >
                    Logları Temizle
                  </button>
                </div>
                <div className="h-32 overflow-y-auto bg-black/50 border border-white/5 rounded-lg p-2 font-mono text-[10px] text-emerald-400 space-y-1 scrollbar-thin">
                  {logs.length === 0 ? (
                    <div className="text-slate-500 italic">Log bulunmuyor. Çeviri başlattığınızda loglar burada görünecektir.</div>
                  ) : (
                    logs.map((log, idx) => (
                      <div key={idx} className="whitespace-pre-wrap leading-relaxed border-b border-white/5 pb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sağ Kolon: Transkript Sütunu (Tüm cihazlarda görünür) (Col: 5) */}
        <div className="lg:col-span-5 flex flex-col min-h-[400px] h-full lg:border-l border-slate-200/50 dark:border-white/5 lg:pl-4 mt-6 lg:mt-0">
          <TranscriptPanel />
        </div>
      </div>
    </div>
  );
}
