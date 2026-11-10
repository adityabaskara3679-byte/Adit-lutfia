import React, { useState } from 'react';
import {
  Wallet,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export function AuthModal() {
  const { login, register, allUsers } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await login(identifier, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Login gagal.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password minimal harus 8 karakter.');
      return;
    }

    setIsLoading(true);
    const res = await register({
      fullName,
      username,
      email,
      password,
    });
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Pendaftaran gagal.');
    }
  };

  const handleQuickDemoLogin = async (demoUsername: string) => {
    setErrorMessage('');
    setIsLoading(true);
    await login(demoUsername);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#172554] via-blue-700 to-[#2563EB] text-white shadow-lg shadow-blue-900/30">
            <Wallet className="h-7 w-7" />
          </div>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            MitraKeuangan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Aplikasi Manajemen Keuangan Pribadi & Kolaborasi Rekan Terenkripsi
          </p>
        </div>

        {/* Forgot Password Flow */}
        {showForgotPassword ? (
          <div className="mt-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Reset Password Akun
            </h2>
            <p className="text-xs text-slate-500">
              Masukkan email yang terdaftar untuk menerima tautan pemulihan sandi.
            </p>
            <input
              type="email"
              placeholder="nama@email.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              onClick={() => {
                alert('Tautan reset password simulasi telah dikirim ke email Anda.');
                setShowForgotPassword(false);
              }}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Kirim Tautan Reset
            </button>
            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-center text-xs text-slate-500 hover:underline"
            >
              Kembali ke Login
            </button>
          </div>
        ) : (
          <>
            {/* Toggle Login / Register */}
            <div className="mt-6 flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setErrorMessage('');
                }}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                  !isRegisterMode
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Masuk Akun
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setErrorMessage('');
                }}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                  isRegisterMode
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Daftar Baru
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {!isRegisterMode ? (
              <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username atau Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="aditya atau email@domain.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Lupa password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimal 8 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Ingat Saya</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                >
                  {isLoading ? 'Memproses...' : 'Masuk ke Aplikasi'}
                </button>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cth: Aditya Baskara"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username Unik
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cth: adityab"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Email Aktif
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aditya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password (min. 8 karakter)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                >
                  {isLoading ? 'Membuat Akun...' : 'Daftar Akun Baru'}
                </button>
              </form>
            )}

            {/* 1-Click Demo Accounts Quick Login for Reviewers */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Akses Cepat Uji Coba Demo (1-Klik):
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('aditya')}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-left hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 transition-colors"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Aditya</p>
                  <p className="text-[10px] text-slate-400">@aditya (Akun 1)</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('sarah')}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-left hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 transition-colors"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Sarah</p>
                  <p className="text-[10px] text-slate-400">@sarah (Akun Rekan)</p>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
