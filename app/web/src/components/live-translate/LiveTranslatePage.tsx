import React from "react";
import { useLiveTranslateStore } from "@/stores/liveTranslateStore";
import { useLiveTranslate } from "@/hooks/useLiveTranslate";
import { SUPPORTED_LANGUAGES } from "./constants";
import { LanguageSelector } from "./LanguageSelector";
import { TranslateButton } from "./TranslateButton";
import { TranscriptPanel } from "./TranscriptPanel";
import { ConnectionStatus } from "./ConnectionStatus";
import { ArrowLeftRight, VolumeX } from "lucide-react";

export function LiveTranslatePage() {
  const {
    myLanguage,
    targetLanguage,
    activeMode,
    setMyLanguage,
    setTargetLanguage,
    swapLanguages,
    setActiveMode,
    isAudioPlaying
  } = useLiveTranslateStore();

  const { status, stopAllAudioPlayback } = useLiveTranslate();

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

  const handleStopAll = () => {
    setActiveMode("none");
    stopAllAudioPlayback();
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/20 max-w-5xl mx-auto w-full">
      {/* Üst Kısım: Başlık ve Açıklama */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-black tracking-tight text-slate-800 dark:text-white">
            Canlı Sesli Çeviri
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm mt-0.5 font-medium">
            Karşılıklı konuşmalarınızı anında sesli ve yazılı olarak çevirin.
          </p>
        </div>
        
        {/* Acil Durdur / Sesi Kapat butonu */}
        {(activeMode !== "none" || isAudioPlaying) && (
          <button
            onClick={handleStopAll}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-red-500/20 transition-all self-start md:self-auto"
          >
            <VolumeX className="w-4 h-4 animate-bounce" />
            Konuşmayı Durdur
          </button>
        )}
      </div>

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

      {/* Büyük Konuşma Butonları Paneli */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 shrink-0">
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

      {/* Durum Göstergesi */}
      <div className="shrink-0 mb-4 bg-white/40 dark:bg-slate-900/20 rounded-2xl py-1 border border-slate-100 dark:border-white/5">
        <ConnectionStatus />
      </div>

      {/* Transkript Bölümü (Tüm kalan alanı kaplar) */}
      <TranscriptPanel />
    </div>
  );
}
