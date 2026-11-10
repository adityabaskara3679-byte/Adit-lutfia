import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Wallet,
  Users,
  LogOut,
  ChevronDown,
  UserCheck,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAddModal: () => void;
}

export function Navbar({ currentTab, onSelectTab, onOpenAddModal }: NavbarProps) {
  const { user, allUsers, switchUser, logout, lockApp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Brand Zone */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#172554] to-[#2563EB] text-white shadow-sm shadow-blue-900/20">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                MitraKeuangan
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
              Personal & Partner Finance
            </p>
          </div>
        </button>
      </div>

      {/* Center Zone - Page title indicator on mobile, or desktop quick context */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-xs font-medium text-slate-600 dark:text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Keuangan Real-Time Terenkripsi</span>
      </div>

      {/* Right Zone: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Button (Desktop only, mobile uses center FAB) */}
        <button
          onClick={onOpenAddModal}
          className="hidden md:inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
        >
          <span>+ Catat Transaksi</span>
        </button>

        {/* Lock Screen Button */}
        <button
          onClick={lockApp}
          title="Kunci Aplikasi Sekarang"
          aria-label="Kunci Aplikasi"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
          <Lock className="h-4 w-4" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* User Account Switcher & Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-2.5 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="h-7 w-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center uppercase">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                {user?.fullName || 'Pengguna'}
              </p>
              <p className="text-[10px] text-slate-400">@{user?.username}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {showUserDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserDropdown(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {user?.fullName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>

                {/* User Switcher (only if multiple users exist on device) */}
                {allUsers.length > 1 && (
                  <div className="py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ganti Akun Terdaftar
                    </p>
                    {allUsers.map((u) => {
                      const isCurrent = u.id === user?.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowUserDropdown(false);
                          }}
                          className={`flex w-full items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors ${
                            isCurrent
                              ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900/30 dark:text-blue-300'
                              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="truncate">{u.fullName} (@{u.username})</span>
                          </div>
                          {isCurrent && <UserCheck className="h-3.5 w-3.5 text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Profile & Logout */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      onSelectTab('profil');
                      setShowUserDropdown(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>Profil & Pengaturan</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      lockApp();
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                  >
                    <Lock className="h-4 w-4 text-blue-500" />
                    <span>Kunci Layar Sekarang</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
