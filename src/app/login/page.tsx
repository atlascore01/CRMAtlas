'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, ShieldCheck, Eye, EyeOff, Sparkles, ArrowRight, Lock, User, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Credenciales no válidas. Revisa usuario y contraseña.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Ocurrió una falla de conexión. Por favor reintenta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#001412] atlas-grid-pattern selection:bg-[#8BD990] selection:text-[#001412]">
      {/* Dynamic Ambient Glow Backdrops */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-radial from-[#8BD990]/12 via-[#4B4BA1]/12 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] rounded-full bg-[#023A40]/50 blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-[450px] h-[450px] rounded-full bg-[#4B4BA1]/25 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[440px] z-10">
        {/* Brand Tag / Innovation Badge */}


        {/* Login Container Card */}
        <div className="atlas-card rounded-3xl p-7 sm:p-9 shadow-2xl border border-[#909CC2]/20 relative overflow-hidden backdrop-blur-xl">
          {/* Top glowing accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8BD990] to-transparent shadow-[0_0_12px_#8BD990]" />

          {/* Logo Showcase Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="relative mb-3 flex flex-col items-center group">
              {/* Radial glow directly hugging the official logo */}
              <div className="absolute -inset-4 rounded-full bg-radial from-[#8BD990]/25 via-[#4B4BA1]/20 to-transparent blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <Image
                src="/brand/atlascore_logo_dark.png"
                alt="Atlascore Logo Oficial"
                width={320}
                height={246}
                priority
                className="relative w-44 sm:w-48 h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-105"
              />
            </div>

            <h1 className="text-xl sm:text-2xl font-brand font-semibold text-[#F0EBD8] tracking-wide mt-1">
              Acceso a la Plataforma
            </h1>
            <p className="text-xs sm:text-sm text-[#909CC2] mt-1.5 max-w-xs font-light leading-relaxed">
              Transformacion digital en gestión inteligente de clientes.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-red-400 shrink-0 animate-ping" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#909CC2] uppercase tracking-wider font-brand">
                Usuario Administrativo
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#909CC2]/70 pointer-events-none">
                  <User size={17} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. atlascoreadm"
                  required
                  autoComplete="username"
                  className="w-full bg-[#001c19]/90 border border-[#023A40] rounded-xl pl-10.5 pr-4 py-3 text-sm text-[#F0EBD8] placeholder-[#909CC2]/40 focus:outline-none focus:border-[#8BD990] focus:ring-2 focus:ring-[#8BD990]/25 transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-medium text-[#909CC2] uppercase tracking-wider font-brand">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#909CC2]/70 pointer-events-none">
                  <Lock size={17} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#001c19]/90 border border-[#023A40] rounded-xl pl-10.5 pr-11 py-3 text-sm text-[#F0EBD8] placeholder-[#909CC2]/40 focus:outline-none focus:border-[#8BD990] focus:ring-2 focus:ring-[#8BD990]/25 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#909CC2] hover:text-[#8BD990] transition-colors p-1 focus:outline-none"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl atlas-gradient-btn text-sm font-semibold tracking-wider uppercase font-brand shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-[#001412]" />
                    <span>Verificando Credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight size={17} className="text-[#001412] group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security & System Info Footer */}
          <div className="mt-8 pt-5 border-t border-[#909CC2]/10 flex items-center justify-between text-[11px] text-[#909CC2]/70">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#8BD990]" />
              <span>Conexión cifrada TLS 1.3</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#909CC2]/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8BD990] animate-pulse" />
              <span>v2.5 Core</span>
            </div>
          </div>
        </div>

        {/* Footer Brand Slogan */}
        <p className="text-center text-xs text-[#909CC2]/60 mt-5 font-light">
          © {new Date().getFullYear()} <span className="text-[#F0EBD8] font-medium">Atlascore</span> · Impulsando la evolución digital
        </p>
      </div>
    </div>
  );
}
