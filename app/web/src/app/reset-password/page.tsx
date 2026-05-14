"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"form" | "loading" | "success" | "error" | "invalid">("loading");
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Token geçerliliğini kontrol et
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMessage("Geçersiz sıfırlama linki. Token bulunamadı.");
      return;
    }

    fetch(`${API_BASE}/api/auth/verify-token/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (data.valid && data.type === "reset_password") {
          setStatus("form");
        } else {
          setStatus("invalid");
          setMessage(data.reason || "Bu link geçersiz veya süresi dolmuş.");
        }
      })
      .catch(() => {
        setStatus("invalid");
        setMessage("Bağlantı hatası. Lütfen tekrar deneyin.");
      });
  }, [token, API_BASE]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage("Şifreler eşleşmiyor!");
      return;
    }
    
    if (newPassword.length < 4) {
      setMessage("Şifre en az 4 karakter olmalıdır.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password-with-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Şifreniz başarıyla güncellendi!");
      } else {
        setStatus("error");
        setMessage(data.detail || "Şifre sıfırlama başarısız oldu.");
      }
    } catch {
      setStatus("error");
      setMessage("Bir bağlantı hatası oluştu.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f1e6] dark:bg-[#0f1117] transition-colors duration-500 overflow-y-auto">
      
      {/* Animated Background Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/50 dark:from-[#080B14] dark:via-[#0F1423] dark:to-[#0A0D18]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-400/10 dark:bg-indigo-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-70 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-purple-400/10 dark:bg-purple-600/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-60 animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className="relative w-full max-w-[420px] mx-auto p-4 sm:p-0 my-8 z-10">
        
        {/* Glass Card */}
        <div className="bg-white/95 dark:bg-[#111421]/95 border border-slate-200/50 dark:border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300">
          
          <div className="p-8">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Şifre Sıfırlama</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {status === "form" ? "Yeni şifrenizi belirleyin." : 
                 status === "success" ? "İşlem başarılı." : 
                 status === "invalid" || status === "error" ? "İşlem başarısız." : "Bağlantı kontrol ediliyor..."}
              </p>
            </div>

            {/* Token kontrol edilirken */}
            {status === "loading" && (
              <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-500 rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">İşlem yapılıyor, lütfen bekleyin...</p>
              </div>
            )}

            {/* Form */}
            {status === "form" && (
              <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Yeni Şifre</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={4}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-12 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-base"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Şifre Tekrar</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={4}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-12 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-base"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {message && (
                  <div className="animate-in fade-in slide-in-from-top-2 text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-500/10 p-3.5 rounded-xl border border-red-100 dark:border-red-500/20 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 mt-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 text-base"
                >
                  Şifremi Güncelle
                </button>
              </form>
            )}

            {/* Başarılı */}
            {status === "success" && (
              <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-500/20 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Şifre Güncellendi!</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[280px] mx-auto leading-relaxed">{message}</p>
                </div>
                
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl transition-all hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                  >
                    Giriş Yap
                  </Link>
                </div>
              </div>
            )}

            {/* Hata / Geçersiz */}
            {(status === "error" || status === "invalid") && (
              <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-100 dark:border-red-500/20 shadow-inner">
                  <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {status === "invalid" ? "Geçersiz Link" : "Hata Oluştu"}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[280px] mx-auto leading-relaxed">{message}</p>
                </div>
                
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center w-full py-3.5 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 font-semibold rounded-xl transition-all hover:bg-slate-200 dark:hover:bg-white/20 active:scale-[0.98] gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Ana Sayfaya Dön
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f4f1e6] dark:bg-[#0f1117]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
