"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, User, AtSign, Eye, EyeOff, ArrowLeft, Sparkles, KeyRound } from 'lucide-react';

type Tab = 'login' | 'register';
type ViewState = 'main' | 'forgot' | 'otp';

export function LoginOverlay() {
  const { login } = useAuthStore();
  
  // Tab ve Görünüm Durumları
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [viewState, setViewState] = useState<ViewState>('main');
  
  // Form alanları
  const [identifier, setIdentifier] = useState(''); // E-posta veya kullanıcı adı
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // UI Durumları
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Kaydedilmiş giriş bilgilerini yükle
  useEffect(() => {
    const savedUser = localStorage.getItem('myworld_saved_user');
    if (savedUser) setIdentifier(savedUser);
  }, []);

  const isEmail = (str: string) => str.includes('@');

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleSendOtp = async () => {
    if (!identifier || !isEmail(identifier)) {
       setError("Lütfen geçerli bir e-posta adresi girin.");
       return;
    }
    setLoading(true);
    resetMessages();
    try {
      await api.post('/api/auth/send-login-otp', { email: identifier });
      setViewState('otp');
      setSuccess('6 haneli giriş kodunuz e-posta adresinize gönderildi.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Kod gönderilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (viewState === 'forgot') {
        // Şifre sıfırlama linki gönder
        await api.post('/api/auth/forgot-password', { email: identifier });
        setSuccess('E-posta adresinize şifre sıfırlama linki gönderildi. Lütfen gelen kutunuzu kontrol edin.');
      }
      else if (viewState === 'otp') {
        // Şifresiz giriş (OTP)
        const response = await api.post('/api/auth/login-with-otp', {
           email: identifier,
           code: otpCode
        });
        localStorage.setItem('myworld_saved_user', identifier);
        login(response.data.access_token, response.data.user);
      }
      else if (activeTab === 'login') {
        // Giriş — e-posta veya kullanıcı adı
        const formData = new FormData();
        formData.append('username', identifier);
        formData.append('password', password);
        
        const response = await api.post('/api/auth/login', formData, {
           headers: { 'Content-Type': 'multipart/form-data' }
        });
        localStorage.setItem('myworld_saved_user', identifier);
        login(response.data.access_token, response.data.user);
      } else {
        // Kayıt
        if (password !== confirmPassword) {
          setError('Şifreler eşleşmiyor');
          setLoading(false);
          return;
        }
        
        const registerData: Record<string, string> = { 
          username, 
          password, 
          name 
        };
        if (email) registerData.email = email;
        
        await api.post('/api/auth/register', registerData);
        
        // Otomatik giriş
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const loginResponse = await api.post('/api/auth/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        localStorage.setItem('myworld_saved_user', username);
        login(loginResponse.data.access_token, loginResponse.data.user);
        
        if (email) {
          setSuccess('Hesabınız oluşturuldu! E-posta doğrulama linki gönderildi.');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setViewState('main');
    resetMessages();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md transition-all duration-500 overflow-y-auto">
      <div className="relative w-full max-w-[420px] mx-auto p-4 sm:p-0 my-8">
        
        {/* Ambient Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />
        
        {/* Glass Card */}
        <div className="bg-white/95 dark:bg-[#111421]/95 border border-slate-200/50 dark:border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300">
          
          <div className="p-8">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold bg-gradient-to-br from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-fuchsia-400 bg-clip-text text-transparent mb-2">My World</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {viewState === 'forgot' ? 'Şifrenizi sıfırlamak için e-postanızı girin.' 
                  : viewState === 'otp' ? 'E-postanıza gelen 6 haneli kodu girin.'
                  : activeTab === 'login' ? 'Kişisel yönetim sistemine hoş geldin.'
                  : 'Sistemi kullanmaya başlamak için hesap oluşturun.'}
              </p>
            </div>

            {/* Tab Navigation (Sadece ana görünümde) */}
            {viewState === 'main' && (
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl mb-8">
                <button 
                  type="button"
                  onClick={() => switchTab('login')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${activeTab === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  Giriş Yap
                </button>
                <button 
                  type="button"
                  onClick={() => switchTab('register')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${activeTab === 'register' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  Kayıt Ol
                </button>
              </div>
            )}

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* --- FORGOT PASSWORD & OTP BACK BUTTON --- */}
              {viewState !== 'main' && (
                <button 
                  type="button" 
                  onClick={() => { setViewState('main'); resetMessages(); }}
                  className="text-sm text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium mb-4 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Giriş ekranına dön
                </button>
              )}

              {/* --- REGISTER FIELDS --- */}
              {viewState === 'main' && activeTab === 'register' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Ad Soyad</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-base"
                        placeholder="Adınız Soyadınız"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Kullanıcı Adı</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <AtSign className="w-5 h-5 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        required
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-base"
                        placeholder="kullaniciadi"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                      E-posta Adresi <span className="text-slate-400 text-xs font-normal">(Opsiyonel)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-slate-400" />
                      </div>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-base"
                        placeholder="ornek@gmail.com"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* --- IDENTIFIER (LOGIN / FORGOT) --- */}
              {viewState !== 'otp' && activeTab === 'login' && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    {viewState === 'forgot' ? 'E-posta Adresi' : 'E-posta veya Kullanıcı Adı'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <input 
                      type={viewState === 'forgot' ? 'email' : 'text'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-base"
                      placeholder={viewState === 'forgot' ? 'ornek@gmail.com' : 'ornek@gmail.com'}
                    />
                  </div>
                  {/* E-posta girilince hemen altında animasyonla beliren küçük OTP linki */}
                  {viewState === 'main' && isEmail(identifier) && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all duration-200 animate-in fade-in slide-in-from-top-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Şifresiz Giriş Yap — Kod Al
                    </button>
                  )}
                </div>
              )}

              {/* --- PASSWORD FIELDS --- */}
              {viewState === 'main' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Şifre</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-slate-400" />
                      </div>
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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

                  {activeTab === 'register' && (
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
                  )}
                </>
              )}

              {/* --- OTP FIELD --- */}
              {viewState === 'otp' && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block text-center">
                    6 Haneli Kod
                  </label>
                  <input 
                    type="text" 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                    maxLength={6}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all font-bold"
                    placeholder="------"
                  />
                  <p className="text-center text-xs text-slate-500 mt-3">
                    Kod <span className="font-semibold text-slate-700 dark:text-slate-300">{identifier}</span> adresine gönderildi.
                  </p>
                </div>
              )}
              
              {/* --- MESSAGES --- */}
              {error && (
                <div className="animate-in fade-in slide-in-from-top-2 text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-500/10 p-3.5 rounded-xl border border-red-100 dark:border-red-500/20 flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">⚠️</div>
                  <p>{error}</p>
                </div>
              )}
              {success && (
                <div className="animate-in fade-in slide-in-from-top-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20 flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">✅</div>
                  <p>{success}</p>
                </div>
              )}
              
              {/* --- SUBMIT BUTTON --- */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Yükleniyor...
                  </>
                ) : viewState === 'forgot' ? 'Sıfırlama Linki Gönder'
                  : viewState === 'otp' ? 'Giriş Yap' 
                  : activeTab === 'register' ? 'Hesap Oluştur' 
                  : 'Sisteme Giriş Yap'
                }
              </button>

              {/* --- FORGOT PASSWORD LINK (LOGIN ONLY) --- */}
              {viewState === 'main' && activeTab === 'login' && (
                <div className="text-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => { setViewState('forgot'); resetMessages(); }}
                    className="text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Şifremi Unuttum?
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
