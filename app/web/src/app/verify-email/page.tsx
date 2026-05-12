"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// E-posta doğrulama mantığı
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Geçersiz doğrulama linki. Token bulunamadı.");
      return;
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    fetch(`${API_BASE}/api/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "E-posta doğrulandı!");
          setEmail(data.email || "");
        } else {
          setStatus("error");
          setMessage(data.detail || "Doğrulama başarısız oldu.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] p-4">
      <div className="w-full max-w-md bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Başlık */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">🌍 Pikseliş</h1>
          <p className="text-indigo-200 text-sm mt-1">E-posta Doğrulama</p>
        </div>

        {/* İçerik */}
        <div className="p-8 text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 text-sm">E-posta doğrulanıyor...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Doğrulandı! ✅</h2>
              <p className="text-slate-400 text-sm">{message}</p>
              {email && <p className="text-indigo-400 text-sm font-medium">{email}</p>}
              <a
                href="/"
                className="inline-block mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/25"
              >
                Sisteme Giriş Yap
              </a>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Doğrulama Başarısız</h2>
              <p className="text-slate-400 text-sm">{message}</p>
              <a
                href="/"
                className="inline-block mt-4 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
              >
                Ana Sayfaya Dön
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sayfa — Suspense ile sarmalıyoruz (useSearchParams SSR uyumluluğu)
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
