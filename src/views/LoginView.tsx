import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePWA } from '../contexts/PWAContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Download, 
  Wifi, 
  WifiOff, 
  AlertCircle,
  HardHat,
  Wrench,
  UserCheck
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { isOnline, isInstallable, installApp } = usePWA();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Credenciais inválidas. Tente novamente.');
      }
      setIsLoading(false);
    }, 250);
  };

  const handleSelectQuickUser = (userEmail: string, userPass = 'admin') => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between relative overflow-hidden font-sans text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Decorative Tech Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/80 to-slate-950 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner with PWA & Offline status */}
      <header className="relative z-10 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <BrandLogo size="md" showText={true} />

        <div className="flex items-center gap-3">
          {/* Online/Offline Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isOnline 
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
          }`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online (Sincronizado)' : 'Modo Offline Ativo'}</span>
          </div>

          {/* PWA Install Button */}
          {isInstallable && (
            <button
              id="login-install-pwa-btn"
              onClick={() => installApp()}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Login Center Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          
          {/* Brand Logo & Header Title */}
          <div className="text-center mb-6 flex flex-col items-center">
            <div className="mb-3 relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-900 to-slate-950 p-2 flex items-center justify-center shadow-xl shadow-blue-950/80 border border-blue-400/40 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="T&S Industrial Service"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    e.currentTarget.src = '/logo.svg';
                  }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 justify-center">
              <span className="font-black text-2xl text-slate-100 tracking-tight">T&amp;S</span>
              <span className="font-bold text-2xl text-amber-400 tracking-tight">Industrial</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
              Industrial Service
            </span>
            <p className="text-xs text-slate-400 mt-2">
              Controle de Manutenção, Ordens de Serviço &amp; Ativos
            </p>
          </div>

          {/* Error Feedback */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@tsindustrial.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Lembrar neste navegador</span>
              </label>
              <span className="text-slate-500 font-mono text-[11px]">Offline-Ready</span>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Validando Acesso...</span>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Selectors */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              Perfis Rápidos de Demonstração
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectQuickUser('admin@tsindustrial.com', 'admin')}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400">Administrador</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">Carlos Ferreira</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickUser('gerente@tsindustrial.com', 'gerente')}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400">Gerente</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">Eduardo Martins</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickUser('joao.silva@tsindustrial.com', 'tecnico')}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">Técnico</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">João da Silva</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickUser('pcm@tsindustrial.com', 'pcm')}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-bold text-slate-200 group-hover:text-purple-400">PCM</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">Amanda V.</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-3 border-t border-slate-900 bg-slate-950/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} T&amp;S Industrial Service. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>PWA v1.0.0 • Service Worker Ativo</span>
            <span>Armazenamento Local Criptografado</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
