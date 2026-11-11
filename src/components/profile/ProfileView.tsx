import React, { useState, useMemo } from 'react';
import {
  User,
  Settings,
  CreditCard,
  Tag,
  Download,
  Upload,
  LogOut,
  Moon,
  Sun,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Users,
  Lock,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  Database,
  Copy,
  FileCode,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { Category, FinancialAccount } from '../../types/finance.ts';
import {
  getCategories,
  saveCategory,
  deleteCategory,
  getAccounts,
  saveAccount,
  deleteAccount,
  formatRupiah
} from '../../lib/storage.ts';
import { getSupabaseCredentials, setCustomSupabaseCredentials } from '../../lib/supabase.ts';

export function ProfileView() {
  const {
    user,
    allUsers,
    updateProfile,
    switchUser,
    logout,
    lockApp,
    setSecurityPin,
    updatePassword,
    toggleAppLock
  } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile Form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currency, setCurrency] = useState(user?.currency || 'IDR');
  const [isSaved, setIsSaved] = useState(false);

  // Security Form States
  const [newPin, setNewPin] = useState(user?.securityPin || '');
  const [pinSaved, setPinSaved] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // Categories & Accounts
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'accounts' | 'categories' | 'backup'>('profile');

  // New Category State
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'income' | 'expense'>('expense');
  const [catColor, setCatColor] = useState('#2563EB');

  // New Account State
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<'bank' | 'cash' | 'ewallet' | 'investment'>('bank');
  const [accBalance, setAccBalance] = useState('');
  const [accNumber, setAccNumber] = useState('');

  const categories = useMemo(() => getCategories(user?.id), [user?.id, activeTab]);
  const accounts = useMemo(() => (user ? getAccounts(user.id) : []), [user?.id, activeTab]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ fullName, currency });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !user) return;

    const newCat: Category = {
      id: `cat-custom-${Date.now()}`,
      userId: user.id,
      name: catName.trim(),
      type: catType,
      icon: 'Tag',
      color: catColor,
      isCustom: true,
    };

    saveCategory(newCat);
    setCatName('');
  };

  const handleDeleteCategory = (catId: string) => {
    if (confirm('Hapus kategori ini?')) {
      deleteCategory(catId);
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim() || !user) return;
    const balance = parseInt(accBalance.replace(/[^0-9]/g, ''), 10) || 0;

    const newAcc: FinancialAccount = {
      id: `acc-${Date.now()}`,
      userId: user.id,
      name: accName.trim(),
      type: accType,
      balance,
      accountNumber: accNumber.trim() || undefined,
      color: accType === 'bank' ? '#2563EB' : accType === 'cash' ? '#16A34A' : '#F97316',
      icon: accType === 'bank' ? 'CreditCard' : accType === 'cash' ? 'Wallet' : 'Smartphone',
    };

    saveAccount(newAcc);
    setAccName('');
    setAccBalance('');
    setAccNumber('');
  };

  const handleDeleteAccount = (accId: string) => {
    if (confirm('Hapus akun / rekening ini?')) {
      deleteAccount(accId);
    }
  };

  // Backup and Restore
  const handleExportBackup = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      storage: {
        users: localStorage.getItem('mitra_keuangan_users'),
        accounts: localStorage.getItem('mitra_keuangan_accounts'),
        categories: localStorage.getItem('mitra_keuangan_categories'),
        transactions: localStorage.getItem('mitra_keuangan_transactions'),
        budgets: localStorage.getItem('mitra_keuangan_budgets'),
        savings: localStorage.getItem('mitra_keuangan_savings'),
        debts: localStorage.getItem('mitra_keuangan_debts'),
        friendships: localStorage.getItem('mitra_keuangan_friendships'),
      },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MitraKeuangan_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.storage) {
          Object.entries(data.storage).forEach(([key, val]) => {
            if (val) localStorage.setItem(`mitra_keuangan_${key}`, val as string);
          });
          alert('Data berhasil dipulihkan! Halaman akan dimuat ulang.');
          window.location.reload();
        }
      } catch (err) {
        alert('Format file cadangan tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const [sqlCopied, setSqlCopied] = useState(false);

  const supabaseSqlSchema = `-- ==============================================================================
-- SKEMA DATABASE SUPABASE (POSTGRESQL) - APLIKASI MITRA KEUANGAN
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL PROFIL PENGGUNA (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    security_pin VARCHAR(6) DEFAULT NULL,
    is_app_lock_enabled BOOLEAN DEFAULT TRUE,
    avatar_url TEXT DEFAULT NULL,
    currency VARCHAR(10) DEFAULT 'IDR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL REKENING / SUMBER DANA (ACCOUNTS)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'ewallet', 'investment')),
    account_number TEXT DEFAULT NULL,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    color VARCHAR(20) DEFAULT '#2563EB',
    icon VARCHAR(50) DEFAULT 'Wallet',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL KATEGORI KEUANGAN (CATEGORIES)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50) DEFAULT 'Tag',
    color VARCHAR(20) DEFAULT '#2563EB',
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL TRANSAKSI (TRANSACTIONS)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'savings')),
    title TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'debit', 'credit', 'qris', 'ewallet')),
    notes TEXT DEFAULT NULL,
    receipt_url TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL ANGGARAN BULANAN (BUDGETS)
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    monthly_limit NUMERIC(15, 2) NOT NULL CHECK (monthly_limit >= 0),
    month VARCHAR(7) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category_id, month)
);

-- 6. TABEL TARGET TABUNGAN (SAVINGS_GOALS)
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(15, 2) DEFAULT 0.00,
    target_date DATE NOT NULL,
    notes TEXT DEFAULT NULL,
    color VARCHAR(20) DEFAULT '#2563EB',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABEL SETORAN TABUNGAN
CREATE TABLE IF NOT EXISTS public.savings_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    savings_goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL UTANG & PIUTANG (DEBTS)
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('debt', 'receivable')),
    person_name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    paid_amount NUMERIC(15, 2) DEFAULT 0.00,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    notes TEXT DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABEL CICILAN UTANG
CREATE TABLE IF NOT EXISTS public.debt_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABEL REKAN / PASANGAN (FRIENDSHIPS)
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    requester_permissions JSONB DEFAULT '{"shareBalance": true, "shareIncome": true, "shareExpense": true, "shareSavings": true, "shareDebts": true, "shareTransactions": true, "shareReports": true}',
    receiver_permissions JSONB DEFAULT '{"shareBalance": true, "shareIncome": true, "shareExpense": true, "shareSavings": true, "shareDebts": true, "shareTransactions": true, "shareReports": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, receiver_id)
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view categories" ON public.categories FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can manage custom categories" ON public.categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage savings" ON public.savings_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage debts" ON public.debts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage friendships" ON public.friendships FOR ALL USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
`;

  const handleDownloadSupabaseSchema = () => {
    const blob = new Blob([supabaseSqlSchema], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supabase_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySupabaseSchema = () => {
    navigator.clipboard.writeText(supabaseSqlSchema);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  const currentCreds = useMemo(() => getSupabaseCredentials(), []);
  const [cloudUrl, setCloudUrl] = useState(currentCreds.url);
  const [cloudKey, setCloudKey] = useState(currentCreds.key);
  const [cloudSaved, setCloudSaved] = useState(false);

  const handleSaveCloudCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomSupabaseCredentials(cloudUrl, cloudKey);
    setCloudSaved(true);
    setTimeout(() => {
      setCloudSaved(false);
      window.location.reload();
    }, 1500);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPin.trim().replace(/[^0-9]/g, '');
    if (clean.length !== 6) {
      alert('PIN harus berupa 6 digit angka.');
      return;
    }
    setSecurityPin(clean);
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setPassError('Konfirmasi password baru tidak cocok.');
      return;
    }

    const res = updatePassword(oldPassword, newPassword);
    if (!res.success) {
      setPassError(res.error || 'Gagal mengubah password.');
    } else {
      setPassSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPassSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Profil & Pengaturan
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Atur informasi akun, keamanan password & PIN, mata uang, tema, kategori khusus, akun bank, dan cadangkan data.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Profil & Tampilan
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Keamanan & PIN</span>
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'accounts'
              ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Rekening & Dompet
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'categories'
              ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Kategori Keuangan
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'backup'
              ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Backup & Restore
        </button>
      </div>

      {/* TAB 1: PROFILE & APPEARANCE */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Informasi Pengguna
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.username || ''}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400">Username unik untuk undangan rekan</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mata Uang Utama
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="IDR">IDR (Rupiah Indonesia - Rp)</option>
                  <option value="USD">USD (US Dollar - $)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Simpan Perubahan
                </button>
                {isSaved && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="h-4 w-4" /> Tersimpan!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Theme & Appearance */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Tema Aplikasi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih antara mode terang (Light) atau mode gelap (Dark)
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="h-4 w-4 text-blue-400" />
                  <span>Mode Gelap</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span>Mode Terang</span>
                </>
              )}
            </button>
          </div>

          {/* User Switcher (only if multiple users exist on device) */}
          {allUsers.length > 1 && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Akun Terdaftar di Perangkat Ini
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Pindah antar akun pengguna terdaftar di perangkat ini.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allUsers.map((u) => {
                  const isCurrent = u.id === user?.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{u.fullName}</p>
                        <p className="text-[11px] text-slate-400">@{u.username}</p>
                      </div>
                      {isCurrent ? (
                        <span className="text-[10px] font-bold text-blue-600 bg-white dark:bg-blue-900 px-2 py-0.5 rounded-full">
                          Akun Aktif
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Ganti Akun</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="pt-2">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB: SECURITY & PIN */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          {/* Card 1: App Lock Protection Status */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Proteksi Kunci Layar (App Lock Gate)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Wajibkan verifikasi Password atau PIN 6-digit setiap kali aplikasi dibuka agar orang lain tidak bisa mengintip.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleAppLock(!(user?.isAppLockEnabled !== false))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    user?.isAppLockEnabled !== false ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      user?.isAppLockEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {user?.isAppLockEnabled !== false ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Uji langsung fitur penguncian layar dengan menekan tombol kunci di bawah.
              </p>
              <button
                type="button"
                onClick={lockApp}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 shadow-sm transition-colors"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Kunci Aplikasi Sekarang</span>
              </button>
            </div>
          </div>

          {/* Card 2: 6-Digit PIN Settings */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Atur PIN Keamanan (6 Digit Angka)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              PIN ini digunakan untuk membuka aplikasi dengan cepat pada smartphone satu tangan menggunakan papan tombol angka.
            </p>

            <form onSubmit={handleSavePin} className="space-y-3 max-w-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  PIN 6 Digit (Hanya Angka)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="6 Angka PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  className="w-full tracking-widest text-lg font-bold rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Simpan PIN Baru
                </button>
                {pinSaved && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="h-4 w-4" /> PIN Berhasil Disimpan!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Card 3: Change Account Password */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Ganti Password Akun
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Password akun digunakan untuk login utama dan alternatif pembuka kunci aplikasi.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password Baru (min. 8 karakter)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {passError && (
                <p className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{passError}</span>
                </p>
              )}

              {passSuccess && (
                <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                  <Check className="h-3.5 w-3.5" />
                  <span>Password berhasil diperbarui!</span>
                </p>
              )}

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Perbarui Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          {/* Add Account Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Tambah Rekening / Sumber Dana Baru
            </h2>
            <form onSubmit={handleAddAccount} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Akun
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Bank Mandiri, Dompet"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tipe Akun
                </label>
                <select
                  value={accType}
                  onChange={(e) => setAccType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="bank">Bank</option>
                  <option value="cash">Tunai (Cash)</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="investment">Investasi</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Saldo Awal (Rp)
                </label>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={accBalance ? parseInt(accBalance, 10).toLocaleString('id-ID') : ''}
                  onChange={(e) => setAccBalance(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-blue-600 py-2.5 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                + Tambah Akun
              </button>
            </form>
          </div>

          {/* Accounts List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {acc.type}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {acc.name}
                  </h3>
                  <p className="text-base font-extrabold text-blue-600 dark:text-blue-400 tabular-nums mt-0.5">
                    {formatRupiah(acc.balance)}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteAccount(acc.id)}
                  className="text-slate-300 hover:text-rose-500 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {/* Add Category Form */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Tambah Kategori Transaksi Kustom
            </h2>
            <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Donasi, Hobi, Kos"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tipe Kategori
                </label>
                <select
                  value={catType}
                  onChange={(e) => setCatType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Warna Kategori
                </label>
                <div className="flex items-center gap-1.5">
                  {['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#2563EB', '#8B5CF6', '#EC4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCatColor(c)}
                      className={`h-6 w-6 rounded-full transition-transform ${catColor === c ? 'scale-125 ring-2 ring-blue-500' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-blue-600 py-2.5 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                + Tambah Kategori
              </button>
            </form>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="h-3.5 w-3.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {c.name}
                  </span>
                </div>
                {c.isCustom && (
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Cadangkan & Pulihkan Data (Backup & Restore)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Amankan seluruh data keuangan Anda ke dalam file cadangan JSON lokal agar tidak pernah hilang.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Cadangkan Data (Export JSON)
                </span>
                <p className="text-[11px] text-slate-500">
                  Unduh seluruh akun, mutasi transaksi, anggaran, target tabungan, dan relasi rekan Anda.
                </p>
                <button
                  onClick={handleExportBackup}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Backup File</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Pulihkan Data (Restore JSON)
                </span>
                <p className="text-[11px] text-slate-500">
                  Unggah file cadangan JSON untuk mengembalikan data keuangan sebelumnya.
                </p>
                <label className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100">
                  <Upload className="h-4 w-4" />
                  <span>Pilih File Backup JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* CARD: INTEGRASI VS CODE & SUPABASE */}
          <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 p-6 shadow-sm dark:border-blue-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Pengembangan Lokal di VS Code & Database Supabase</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                      Cloud SQL
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Gunakan skrip SQL dan panduan ini untuk menghubungkan aplikasi Anda ke Supabase PostgreSQL melalui VS Code.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mb-2">
                  1
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Buat Database</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Buka supabase.com, buat project baru, dan buka menu <strong>SQL Editor</strong>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mb-2">
                  2
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Jalankan SQL</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Salin atau unduh file skema SQL di bawah ini dan klik <strong>Run</strong> di Supabase SQL Editor.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900 dark:text-blue-300 mb-2">
                  3
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Koneksi .env.local</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Salin Project URL & Anon Key ke file <code>.env.local</code> di VS Code Anda.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadSupabaseSchema}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Unduh Skema SQL (supabase_schema.sql)</span>
              </button>

              <button
                type="button"
                onClick={handleCopySupabaseSchema}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
              >
                {sqlCopied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Skrip SQL Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Salin Seluruh Skrip SQL</span>
                  </>
                )}
              </button>
            </div>

            {/* Form Koneksi Langsung Supabase di Browser */}
            <form onSubmit={handleSaveCloudCredentials} className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span>Koneksi Supabase Langsung di Browser (Opsional)</span>
                </span>
                {currentCreds.isConfigured && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="h-3 w-3" /> Terhubung
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Masukkan Project URL & Anon Key dari Dashboard Supabase Anda jika ingin sinkronisasi multi-perangkat langsung aktif di HP ini:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzabcdefg.supabase.co"
                    value={cloudUrl}
                    onChange={(e) => setCloudUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Anon Public Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={cloudKey}
                    onChange={(e) => setCloudKey(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 py-2 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Simpan & Hubungkan Database
                </button>
                {cloudSaved && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="h-4 w-4" /> Kredensial Tersimpan! Memuat ulang...
                  </span>
                )}
              </div>
            </form>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              💡 Panduan langkah demi langkah lengkap tersedia di file <code>PANDUAN_VSCODE_SUPABASE.md</code> di dalam folder proyek Anda.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
