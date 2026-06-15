import React, { useState } from "react";
import { useLiveTranslateStore } from "@/stores/liveTranslateStore";
import { useLiveTranslate } from "@/hooks/useLiveTranslate";
import { SUPPORTED_LANGUAGES } from "./constants";
import { LanguageSelector } from "./LanguageSelector";
import { TranslateButton } from "./TranslateButton";
import { TranscriptPanel } from "./TranscriptPanel";
import { ConnectionStatus } from "./ConnectionStatus";
import { ArrowLeftRight, VolumeX, Settings, Volume2, Mic, ToggleLeft, ToggleRight, Info } from "lucide-react";

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
    <div className="flex-1 min-h-0 flex flex-col p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/20 max-w-5xl mx-auto w-full">
      {/* Üst Kısım: Başlık ve Ayarlar Butonu */}
      <div className="flex items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <span>Canlı Sesli Çeviri</span>
            {isAutomaticMode && (
              <span className="text-[10px] bg-indigo-500/10 text-indigo-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                Otomatik Mod
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm mt-0.5 font-medium">
            Akıllı kulaklık ve hoparlör ayrımıyla çift yönlü çeviri yapın.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Ayarlar Butonu */}
          <button
            onClick={() => {
              setShowSettings(!showSettings);
              refreshDevices();
            }}
            className={`p-2.5 rounded-2xl border transition-all ${
              showSettings 
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
            title="Ses Cihazı Ayarları"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Acil Durdur / Sesi Kapat butonu */}
          {(activeMode !== "none" || isAudioPlaying) && (
            <button
              onClick={handleStopAll}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-red-500/20 transition-all"
            >
              <VolumeX className="w-4 h-4" />
              Durdur
            </button>
          )}
        </div>
      </div>

      {/* Ses Aygıtları Ayarları Paneli */}
      {showSettings && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-lg mb-6 animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-500" />
            Ses Cihazı Ayarları
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Giriş Cihazı (Mikrofon) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                Mikrofon (Giriş)
              </label>
              <select
                value={audioInputDevice}
                onChange={(e) => setAudioInputDevice(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
              >
                <option value="default">Varsayılan Mikrofon</option>
                {devices.inputs.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Mikrofon (${d.deviceId.substring(0, 5)})`}</option>
                ))}
              </select>
            </div>

            {/* Benim Çıkışım (Kulaklık) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                Benim Çıkışım (Kulaklık)
              </label>
              <select
                value={audioOutputDeviceMe}
                onChange={(e) => setAudioOutputDeviceMe(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
              >
                <option value="default">Varsayılan Çıkış</option>
                {devices.outputs.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Kulaklık (${d.deviceId.substring(0, 5)})`}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">Bana gelen çeviriler bu kanala gider.</span>
            </div>

            {/* Karşı Tarafın Çıkışı (Hoparlör) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                Karşı Tarafın Çıkışı (Hoparlör)
              </label>
              <select
                value={audioOutputDeviceOther}
                onChange={(e) => setAudioOutputDeviceOther(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
              >
                <option value="default">Varsayılan Çıkış</option>
                {devices.outputs.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Hoparlör (${d.deviceId.substring(0, 5)})`}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">Karşı tarafa giden çeviriler bu kanala gider.</span>
            </div>
          </div>

          {/* Akıllı Yönlendirme Bilgilendirmesi */}
          <div className="mt-4 p-3 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl flex items-start gap-2.5 border border-indigo-100/50 dark:border-indigo-500/10">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-600/90 dark:text-indigo-400/90 leading-relaxed font-semibold">
              <strong>Akıllı Çeviri Sistemi:</strong> Kulaklık takılıyken, kulağınızla konuştuğunuz Türkçe ses İngilizceye çevrilip dışarıdaki kişinin duyması için **Dış Hoparlörden** çalacaktır. Dışarıdaki kişi İngilizce konuştuğunda ise ses Türkçeye çevrilip sadece sizin duymanız için **Kulaklıktan** çalacaktır.
            </p>
          </div>
        </div>
      )}

      {/* Dil Seçiciler Kartı */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-3xl p-5 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4 shrink-0">
        <LanguageSelector
          label="Benim Dilim"
          selectedCode={myLanguage}
          onSelect={setMyLanguage}
          excludeCode={targetLanguage}
        />
        
        <button
          onClick={swapLanguages}
          disabled={status !== "idle"}
          className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-2xl transition-all shadow-inner disabled:opacity-50 shrink-0 mt-4 md:mt-5"
          title="Dilleri Değiştir"
        >
          <ArrowLeftRight className="w-5 h-5" />
        </button>

        <LanguageSelector
          label="Karşı Tarafın Dili"
          selectedCode={targetLanguage}
          onSelect={setTargetLanguage}
          excludeCode={myLanguage}
        />
      </div>

      {/* Otomatik Mod Toggle Alanı */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-3xl p-4 shadow-sm mb-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-500">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-sm font-bold text-slate-800 dark:text-white">
              Otomatik Dil Algılama ve Çeviri
            </span>
            <span className="block text-xs text-slate-400 font-medium">
              Sürekli dinleme yapar, dilleri kendisi ayırt eder ve çevirir.
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
            <ToggleRight className="w-12 h-12 stroke-[1.5px]" />
          ) : (
            <ToggleLeft className="w-12 h-12 stroke-[1.5px] text-slate-300 dark:text-slate-700" />
          )}
        </button>
      </div>

      {/* Büyük Butonlar / Otomatik Mod Başlat Butonu */}
      <div className="shrink-0 mb-6">
        {isAutomaticMode ? (
          /* Otomatik Mod Dev Tekli Buton */
          <button
            onClick={handleAutoToggleClick}
            className={`w-full py-8 px-6 rounded-3xl transition-all duration-300 flex flex-col items-center justify-center gap-3 font-extrabold text-lg shadow-md border ${
              activeMode !== "none"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-transparent"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            <div className={`p-4 rounded-2xl ${activeMode !== "none" ? "bg-white/20 scale-110" : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500"} transition-all`}>
              <Mic className={`w-8 h-8 ${activeMode !== "none" ? "animate-pulse" : ""}`} />
            </div>
            <span>
              {activeMode !== "none" ? "OTOMATİK ÇEVİRİ AKTİF (DİNLEYEN)" : "OTOMATİK ÇEVİRİYİ BAŞLAT"}
            </span>
            <span className="text-xs font-semibold opacity-75">
              {activeMode !== "none" 
                ? "Konuşmayı bitirdiğinizde otomatik olarak doğru dilde çeviri çalacaktır." 
                : "Sürekli dinleme yaparak iki dili de otomatik çevirir."}
            </span>
          </button>
        ) : (
          /* Manuel Butonlar */
          <div className="flex flex-col sm:flex-row gap-4">
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
      <div className="shrink-0 mb-4 bg-white/40 dark:bg-slate-900/20 rounded-2xl py-1 border border-slate-100 dark:border-white/5">
        <ConnectionStatus />
      </div>

      {/* Transkript Paneli (Tüm kalan alanı kaplar) */}
      <TranscriptPanel />
    </div>
  );
}
