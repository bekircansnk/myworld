"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Download, RefreshCw, Sparkles, X, AlertCircle, CheckCircle2 } from "lucide-react";

import { useTaskStore } from "@/stores/taskStore";

// Native plugin bridge — Android tarafındaki ApkInstallerPlugin'e erişim
const ApkInstaller = Capacitor.isNativePlatform()
  ? Capacitor.registerPlugin("ApkInstaller")
  : null;

interface VersionInfo {
  version: string;
  version_code: number;
  download_url: string;
  changelog: string;
  force_update: boolean;
  min_supported_version: string;
}

type UpdateState = "idle" | "checking" | "available" | "downloading" | "installing" | "error";

/**
 * Uygulama açıldığında sürüm kontrolü yapıp güncelleme modalı gösteren bileşen.
 * Sadece Capacitor native platformda çalışır.
 */
export function AppUpdateChecker() {
  const [state, setState] = useState<UpdateState>("idle");
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // Sürüm karşılaştırma: "1.4" vs "1.5" → true (yeni sürüm var)
  const isNewerVersion = useCallback((current: string, server: string): boolean => {
    const c = current.split(".").map(Number);
    const s = server.split(".").map(Number);
    for (let i = 0; i < Math.max(c.length, s.length); i++) {
      const cv = c[i] || 0;
      const sv = s[i] || 0;
      if (sv > cv) return true;
      if (sv < cv) return false;
    }
    return false;
  }, []);

  // Sürüm kontrolü fonksiyonu — hem ilk açılışta hem resume'da çağrılır
  const checkVersion = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      setState("checking");

      // Cihazın mevcut sürümünü al
      let appInfo;
      try {
        appInfo = await App.getInfo();
        setCurrentVersion(appInfo.version);
      } catch (infoError) {
        console.error("App.getInfo() alınamadı, varsayılan değerler kullanılacak:", infoError);
        appInfo = { version: "1.0.0", build: "0" };
        setCurrentVersion("1.0.0");
      }

      // Backend'den son sürüm bilgisini çek
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://myworld-twqx.onrender.com";
      let res = null;
      let retries = 3;
      let delay = 2000;

      while (retries > 0) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout (Render.com cold start için)

          res = await fetch(`${apiUrl}/api/app-version`, {
            signal: controller.signal,
            cache: "no-store", // Her zaman güncel veri çek
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            break; // Başarılı
          }
        } catch (fetchErr) {
          console.warn(`Sürüm kontrolü denemesi başarısız (${retries} deneme kaldı):`, fetchErr);
        }

        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5; // Exponential backoff
        }
      }

      if (!res || !res.ok) {
        console.error("Sürüm kontrolü API'sine erişilemedi.");
        setState("idle");
        return;
      }

      const data: VersionInfo = await res.json();

      const deviceBuild = parseInt(appInfo.build, 10) || 0;
      const serverBuild = data.version_code || 0;

      const hasNewVersion = isNewerVersion(appInfo.version, data.version) || (serverBuild > deviceBuild);

      if (hasNewVersion) {
        setVersionInfo(data);
        setState("available");
      } else {
        setState("idle");
      }
    } catch (e) {
      console.error("Sürüm kontrolü sırasında beklenmedik hata:", e);
      setState("idle");
    }
  }, [isNewerVersion]);

  // İlk açılışta kontrol et
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    checkVersion();
  }, [checkVersion]);

  // Uygulama ön plana geldiğinde tekrar kontrol et
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listener = App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        setTimeout(checkVersion, 1000);
      }
    });
    return () => { listener.then(l => l.remove()); };
  }, [checkVersion]);

  // APK indirme ve yükleme
  const handleUpdate = useCallback(async () => {
    if (!versionInfo) return;

    let progressListener: any = null;
    try {
      setState("downloading");
      setProgress(0);
      setErrorMsg("");

      const fileName = `Pikselis_v${versionInfo.version}.apk`;

      // Native progress listener
      progressListener = await Filesystem.addListener("progress", (progressInfo) => {
        if (progressInfo.contentLength > 0) {
          const pct = Math.round((progressInfo.bytes / progressInfo.contentLength) * 100);
          setProgress(pct);
        }
      });

      // Native downloadFile call
      const downloadResult = await Filesystem.downloadFile({
        url: versionInfo.download_url,
        path: fileName,
        directory: Directory.Cache,
        progress: true,
      });

      if (progressListener) {
        await progressListener.remove();
        progressListener = null;
      }

      const fileUri = downloadResult.path;
      if (!fileUri) {
        throw new Error("İndirilen dosya yolu alınamadı");
      }

      // URI'den dosya yolunu çıkar
      let filePath = fileUri;
      if (filePath.startsWith("file://")) {
        filePath = filePath.replace("file://", "");
      }

      setState("installing");

      // Native plugin ile APK yükleme ekranını aç
      if (ApkInstaller) {
        await (ApkInstaller as any).install({ filePath });
      }

      // Yükleme ekranı açıldıktan sonra state'i sıfırla
      setTimeout(() => setState("idle"), 3000);
    } catch (err: any) {
      if (progressListener) {
        await progressListener.remove();
      }
      console.error("Güncelleme hatası:", err);
      const isPermError = err?.message === "INSTALL_PERMISSION_REQUIRED" || 
                         (err && typeof err === "object" && err.toString().includes("INSTALL_PERMISSION_REQUIRED"));
      if (isPermError) {
        setErrorMsg("Bilinmeyen kaynaklardan uygulama yükleme izni kapalı. İzin ayarları ekranı açıldı, lütfen izin verip tekrar güncellemeyi deneyin.");
      } else {
        setErrorMsg(err?.message || "Bilinmeyen hata");
      }
      setState("error");
    }
  }, [versionInfo]);

  // Modalı kapatmaya izin ver (Kullanıcı istediği zaman es geçebilir)
  const handleDismiss = useCallback(() => {
    setState("idle");
  }, []);

  const handleCloseError = useCallback(() => {
    setState("idle");
  }, []);

  // Tekrar dene
  const handleRetry = useCallback(() => {
    handleUpdate();
  }, [handleUpdate]);

  // Modal gösterilecek durumlar
  if (state !== "available" && state !== "downloading" && state !== "installing" && state !== "error") {
    return null;
  }

  // Güncelleme artık "es geçilebilir" (dismissible) olacak ama her girişte tekrar çıkacak.
  const isForceUpdate = false;

  const content = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop — Tıklayınca kapanır */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Kapatma Butonu (Sağ Üst) */}
        {state !== "downloading" && state !== "installing" && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Üst dekoratif gradient */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* İçerik */}
        <div className="p-6 pt-8 flex flex-col items-center text-center gap-4">
          {/* İkon */}
          {state === "error" ? (
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          ) : state === "installing" ? (
            <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 animate-pulse" />
            </div>
          ) : state === "downloading" ? (
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Download className="w-8 h-8 text-indigo-500 animate-bounce" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          )}

          {/* Başlık */}
          <div>
            {state === "error" ? (
              <>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  İndirme Başarısız
                </h2>
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errorMsg}
                </p>
              </>
            ) : state === "installing" ? (
              <>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  Yükleniyor...
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Android yükleme ekranı açılıyor
                </p>
              </>
            ) : state === "downloading" ? (
              <>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  İndiriliyor...
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Pikseliş v{versionInfo?.version}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  Yeni Sürüm Mevcut! 🎉
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  v{currentVersion} → v{versionInfo?.version}
                </p>
              </>
            )}
          </div>

          {/* İndirme Progress Bar */}
          {state === "downloading" && (
            <div className="w-full">
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 tabular-nums font-medium">
                %{progress}
              </p>
            </div>
          )}

          {/* Sürüm Notları */}
          {state === "available" && versionInfo?.changelog && (
            <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Yenilikler
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {versionInfo.changelog}
              </p>
            </div>
          )}
        </div>

        {/* Butonlar */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-white/10 px-6 py-4">
          {state === "available" && (
            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Güncelle
              </button>
            </div>
          )}

          {state === "error" && (
            <div className="flex gap-3">
              <button
                onClick={handleCloseError}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                Kapat
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Tekrar Dene
              </button>
            </div>
          )}

          {(state === "downloading" || state === "installing") && (
            <p className="text-center text-xs text-slate-400">
              Lütfen bekleyin, işlem devam ediyor...
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
