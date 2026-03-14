"use client";

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function LoginOverlay() {
  const { login } = useAuthStore();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginTab) {
        // Login requires form-data because of OAuth2PasswordRequestForm in FastAPI
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await api.post('/api/auth/login', formData, {
           headers: { 'Content-Type': 'multipart/form-data' }
        });
        login(response.data.access_token, response.data.user);
      } else {
        // Register
        const registerResponse = await api.post('/api/auth/register', { username, password, name: username });
        // After register, auto login
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const loginResponse = await api.post('/api/auth/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        login(loginResponse.data.access_token, loginResponse.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xl transition-all duration-500">
      <div className="w-full max-w-md p-8 bg-white/5 dark:bg-[#0a0f1d] border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-indigo-500/30 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/70 bg-clip-text text-transparent mb-2">My World</h1>
            <p className="text-sm text-foreground/70">Kişisel yönetim sistemine hoş geldin.</p>
          </div>

          <div className="flex bg-foreground/5 p-1 rounded-xl mb-8">
            <button 
              onClick={() => { setIsLoginTab(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLoginTab ? 'bg-indigo-600 text-white shadow-lg' : 'text-foreground/70 hover:text-foreground'}`}
            >
              Giriş Yap
            </button>
            <button 
              onClick={() => { setIsLoginTab(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLoginTab ? 'bg-indigo-600 text-white shadow-lg' : 'text-foreground/70 hover:text-foreground'}`}
            >
              Kayıt Ol
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-2 block">Kullanıcı Adı</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                placeholder="Kullanıcı adınız"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-2 block">Şifre</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
            
            {error && <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Yükleniyor...
                </>
              ) : isLoginTab ? 'Sisteme Giriş Yap' : 'Hesap Oluştur'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
