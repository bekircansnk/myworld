"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"form" | "loading" | "success" | "error" | "invalid">("loading");
  const [message, setMessage] = useState("");

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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] p-4">
      <div className="w-full max-w-md bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Başlık */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">🔑 Şifre Sıfırlama</h1>
          <p className="text-red-100 text-sm mt-1">Yeni şifrenizi belirleyin</p>
        </div>

        <div className="p-8">
          {/* Token kontrol edilirken */}
          {status === "loading" && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 text-sm">İşlem yapılıyor...</p>
            </div>
          )}

          {/* Form */}
          {status === "form" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Yeni Şifre</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={4}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">Şifre Tekrar</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={4}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>

              {message && (
                <div className="text-red-400 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-500/25 active:scale-[0.98]"
              >
                Şifremi Güncelle
              </button>
            </form>
          )}

          {/* Başarılı */}
          {status === "success" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Şifre Güncellendi! ✅</h2>
              <p className="text-slate-400 text-sm">{message}</p>
              <a
                href="/"
                className="inline-block mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/25"
              >
                Giriş Yap
              </a>
            </div>
          )}

          {/* Hata / Geçersiz */}
          {(status === "error" || status === "invalid") && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">
                {status === "invalid" ? "Geçersiz Link" : "Hata Oluştu"}
              </h2>
              <p className="text-slate-400 text-sm">{message}</p>
              <div className="flex gap-3 justify-center mt-4">
                <a
                  href="/"
                  className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all text-sm"
                >
                  Ana Sayfa
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]">
        <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
