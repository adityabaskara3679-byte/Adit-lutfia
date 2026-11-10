import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  LogOut,
  Users,
  CheckCircle2,
  Delete
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export function AppLockGate() {
  const { user, unlockApp, logout, switchUser, allUsers } = useAuth();
  const [inputVal, setInputVal] = useState('');
  const [inputMode, setInputMode] = useState<'pin' | 'password'>('pin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSwitchUser, setShowSwitchUser] = useState(false);

  // Focus effect
  useEffect(() => {
    setErrorMsg('');
    setInputVal('');
  }, [inputMode]);

  const handleUnlockSubmit = (codeToVerify?: string) => {
    const code = codeToVerify !== undefined ? codeToVerify : inputVal;
    if (!code) {
      setErrorMsg('Masukkan password atau PIN keamanan.');
      return;
    }

    const ok = unlockApp(code);
    if (ok) {
      setIsSuccess(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Password atau PIN salah. Silakan coba lagi.');
      setInputVal('');
    }
  };

  const handleNumpadPress = (num: string) => {
    if (inputVal.length < 6) {
      const next = inputVal + num;
      setInputVal(next);
      setErrorMsg('');
      if (next.length === 6) {
        // Auto-verify when 6 digits are typed!
        handleUnlockSubmit(next);
      }
    }
  };

  const handleBackspace = () => {
    setInputVal((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-lg overflow-y-auto antialiased">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 text-center my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Lock Shield Icon */}
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#172554] via-blue-700 to-[#2563EB] text-white shadow-xl shadow-blue-900/40">
          {isSuccess ? (
            <Unlock className="h-8 w-8 text-emerald-300 animate-bounce" />
          ) : (
            <Lock className="h-8 w-8 text-white" />
          )}
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 text-white text-[10px]">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* User Identity */}
        <div className="mt-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {user?.fullName || 'Pengguna'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            @{user?.username} · Aplikasi Terkunci
          </p>
        </div>

        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
          Masukkan Password atau PIN untuk membuka akses data keuangan Anda.
        </p>

        {/* Input Mode Switcher: PIN vs Password */}
        <div className="mt-4 flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
          <button
            type="button"
            onClick={() => setInputMode('pin')}
            className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
              inputMode === 'pin'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            PIN Keamanan (6 Digit)
          </button>
          <button
            type="button"
            onClick={() => setInputMode('password')}
            className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
              inputMode === 'password'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Password Akun
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-2 text-xs text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MODE 1: 6-DIGIT PIN WITH TOUCH NUMPAD */}
        {inputMode === 'pin' && (
          <div className="mt-4 space-y-4">
            {/* 6 PIN Indicator Dots */}
            <div className="flex items-center justify-center gap-3 py-2">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const filled = inputVal.length > idx;
                return (
                  <div
                    key={idx}
                    className={`h-4 w-4 rounded-full border-2 transition-all duration-200 ${
                      filled
                        ? 'border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400 scale-110 shadow-sm shadow-blue-500/50'
                        : 'border-slate-300 dark:border-slate-600 bg-transparent'
                    }`}
                  />
                );
              })}
            </div>

            {/* Numeric Keypad for Mobile & Desktop Touch */}
            <div className="grid grid-cols-3 gap-2 pt-1 max-w-[260px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleNumpadPress(digit)}
                  className="flex h-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 text-base font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                >
                  {digit}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handleNumpadPress('0')}
                className="flex h-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 text-base font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                aria-label="Hapus Digit"
                className="flex h-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 active:scale-95 transition-all"
              >
                <Delete className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: PASSWORD INPUT */}
        {inputMode === 'password' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUnlockSubmit();
            }}
            className="mt-4 space-y-3"
          >
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password akun"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
            >
              Buka Kunci
            </button>
          </form>
        )}

        {/* Default Demo Helper Hint */}
        <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-2 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
          <p>
            PIN bawaan: <strong className="text-blue-600 dark:text-blue-400">123456</strong> atau Password: <strong className="text-blue-600 dark:text-blue-400">password123</strong>
          </p>
        </div>

        {/* Footer Actions: Switch User or Logout */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowSwitchUser(!showSwitchUser)}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-medium"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Ganti Pengguna</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>

        {/* Switch User Dropdown */}
        {showSwitchUser && (
          <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-left">
            <p className="text-[10px] font-bold uppercase text-slate-400 px-2 py-0.5">
              Pilih Akun Lain:
            </p>
            {allUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  switchUser(u.id);
                  setShowSwitchUser(false);
                  setInputVal('');
                  setErrorMsg('');
                }}
                className="w-full text-left p-1.5 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-between"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {u.fullName} (@{u.username})
                </span>
                {u.id === user?.id && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
