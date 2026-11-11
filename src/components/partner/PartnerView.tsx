import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Scale,
  Sparkles,
  Settings,
  ChevronRight,
  Info,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  Share2,
  Link2,
  KeyRound
} from 'lucide-react';
import {
  UserProfile,
  Friendship,
  SharingPermissions,
  PeriodFilter,
  Transaction
} from '../../types/finance.ts';
import {
  getAllUsers,
  getFriendships,
  getActivePartner,
  saveFriendship,
  deleteFriendship,
  saveUser,
  getAccounts,
  getTransactions,
  getSavingsGoals,
  getDebts,
  getCategories,
  formatRupiah,
  formatDateIndonesian,
  DEFAULT_SHARING_PERMISSIONS
} from '../../lib/storage.ts';
import { supabase, isSupabaseConfigured } from '../../lib/supabase.ts';
import {
  IncomeExpenseChart,
  BalanceTrendChart,
  ComparisonBar
} from '../charts/FinancialCharts.tsx';

interface PartnerViewProps {
  userId: string;
  onSelectTab: (tab: string) => void;
  onEditTransaction?: (tx: Transaction) => void;
}

export function PartnerView({ userId, onSelectTab }: PartnerViewProps) {
  const [partnerSubTab, setPartnerSubTab] = useState<'saya' | 'rekan' | 'gabungan'>('gabungan');
  const [period, setPeriod] = useState<PeriodFilter>('this_month');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteError, setInviteError] = useState('');

  const allUsers = useMemo(() => getAllUsers(), []);
  const friendships = useMemo(() => getFriendships(userId), [userId]);
  const activePartnerData = useMemo(() => getActivePartner(userId), [userId, friendships]);

  // Invitations received (pending)
  const pendingRequests = useMemo(() => {
    return friendships.filter((f) => f.receiverId === userId && f.status === 'pending');
  }, [friendships, userId]);

  // Outgoing invitations
  const sentRequests = useMemo(() => {
    return friendships.filter((f) => f.requesterId === userId && f.status === 'pending');
  }, [friendships, userId]);

  // My Financial Data
  const myAccounts = useMemo(() => getAccounts(userId), [userId]);
  const myTransactions = useMemo(() => getTransactions(userId), [userId]);
  const mySavings = useMemo(() => getSavingsGoals(userId), [userId]);
  const myDebts = useMemo(() => getDebts(userId), [userId]);
  const categories = useMemo(() => getCategories(userId), [userId]);

  const myBalance = useMemo(() => myAccounts.reduce((sum, a) => sum + a.balance, 0), [myAccounts]);
  const mySavingsTotal = useMemo(() => mySavings.reduce((sum, s) => sum + s.currentAmount, 0), [mySavings]);
  const myDebtTotal = useMemo(
    () => myDebts.filter((d) => d.type === 'debt').reduce((sum, d) => sum + Math.max(0, d.amount - d.paidAmount), 0),
    [myDebts]
  );
  const myReceivableTotal = useMemo(
    () => myDebts.filter((d) => d.type === 'receivable').reduce((sum, d) => sum + Math.max(0, d.amount - d.paidAmount), 0),
    [myDebts]
  );

  // Filter My Transactions by period
  const myFilteredTx = useMemo(() => {
    const now = new Date();
    return myTransactions.filter((tx) => {
      const d = new Date(tx.date);
      if (period === 'this_month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (period === 'this_year') return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [myTransactions, period]);

  const myIncome = useMemo(
    () => myFilteredTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [myFilteredTx]
  );
  const myExpense = useMemo(
    () => myFilteredTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [myFilteredTx]
  );

  // Partner's Financial Data (Filtered strictly by partnerPermissions!)
  const partnerUser = activePartnerData?.partner;
  const partnerPerms = activePartnerData?.partnerPermissions;
  const myPerms = activePartnerData?.myPermissions;

  const partnerAccounts = useMemo(() => {
    if (!partnerUser || !partnerPerms?.shareBalance) return [];
    return getAccounts(partnerUser.id);
  }, [partnerUser, partnerPerms]);

  const partnerBalance = useMemo(() => {
    if (!partnerPerms?.shareBalance) return 0;
    return partnerAccounts.reduce((sum, a) => sum + a.balance, 0);
  }, [partnerAccounts, partnerPerms]);

  const partnerTransactions = useMemo(() => {
    if (!partnerUser) return [];
    const txs = getTransactions(partnerUser.id);
    return txs.filter((t) => {
      if (t.type === 'income' && !partnerPerms?.shareIncome) return false;
      if (t.type === 'expense' && !partnerPerms?.shareExpense) return false;
      return true;
    });
  }, [partnerUser, partnerPerms]);

  const partnerFilteredTx = useMemo(() => {
    const now = new Date();
    return partnerTransactions.filter((tx) => {
      const d = new Date(tx.date);
      if (period === 'this_month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (period === 'this_year') return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [partnerTransactions, period]);

  const partnerIncome = useMemo(() => {
    if (!partnerPerms?.shareIncome) return 0;
    return partnerFilteredTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  }, [partnerFilteredTx, partnerPerms]);

  const partnerExpense = useMemo(() => {
    if (!partnerPerms?.shareExpense) return 0;
    return partnerFilteredTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  }, [partnerFilteredTx, partnerPerms]);

  const partnerSavings = useMemo(() => {
    if (!partnerUser || !partnerPerms?.shareSavings) return [];
    return getSavingsGoals(partnerUser.id);
  }, [partnerUser, partnerPerms]);

  const partnerSavingsTotal = useMemo(() => {
    if (!partnerPerms?.shareSavings) return 0;
    return partnerSavings.reduce((sum, s) => sum + s.currentAmount, 0);
  }, [partnerSavings, partnerPerms]);

  const partnerDebts = useMemo(() => {
    if (!partnerUser || !partnerPerms?.shareDebts) return [];
    return getDebts(partnerUser.id);
  }, [partnerUser, partnerPerms]);

  const partnerDebtTotal = useMemo(() => {
    if (!partnerPerms?.shareDebts) return 0;
    return partnerDebts.filter((d) => d.type === 'debt').reduce((s, d) => s + Math.max(0, d.amount - d.paidAmount), 0);
  }, [partnerDebts, partnerPerms]);

  const partnerReceivableTotal = useMemo(() => {
    if (!partnerPerms?.shareDebts) return 0;
    return partnerDebts.filter((d) => d.type === 'receivable').reduce((s, d) => s + Math.max(0, d.amount - d.paidAmount), 0);
  }, [partnerDebts, partnerPerms]);

  // Combined Joint Totals
  const jointBalance = myBalance + partnerBalance;
  const jointIncome = myIncome + partnerIncome;
  const jointExpense = myExpense + partnerExpense;
  const jointSavings = mySavingsTotal + partnerSavingsTotal;
  const jointNet = jointIncome - jointExpense;

  const [inviteMethod, setInviteMethod] = useState<'code' | 'username'>('code');
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [copiedMyCode, setCopiedMyCode] = useState(false);
  const [copiedMyLink, setCopiedMyLink] = useState(false);
  const [isSearchingCloud, setIsSearchingCloud] = useState(false);

  const currentUser = useMemo(() => allUsers.find((u) => u.id === userId), [allUsers, userId]);

  const generateMyPairingCode = () => {
    if (!currentUser) return '';
    const payload = {
      id: currentUser.id,
      username: currentUser.username,
      fullName: currentUser.fullName,
      email: currentUser.email,
      currency: currentUser.currency || 'IDR',
    };
    try {
      return 'MK-SYNC-' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    } catch {
      return 'MK-SYNC-' + btoa(JSON.stringify(payload));
    }
  };

  const generateMyInviteLink = () => {
    const code = generateMyPairingCode();
    if (!code) return '';
    return `${window.location.origin}${window.location.pathname}#invite=${code}`;
  };

  const handleCopyMyCode = () => {
    const code = generateMyPairingCode();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedMyCode(true);
      setTimeout(() => setCopiedMyCode(false), 2500);
    }
  };

  const handleCopyMyLink = () => {
    const link = generateMyInviteLink();
    if (link) {
      navigator.clipboard.writeText(link);
      setCopiedMyLink(true);
      setTimeout(() => setCopiedMyLink(false), 2500);
    }
  };

  const handleConnectViaCode = (codeToConnect?: string) => {
    const raw = (codeToConnect || partnerCodeInput).trim();
    if (!raw) {
      setInviteError('Masukkan kode rekan atau buka tautan undangan rekan.');
      return;
    }

    try {
      let cleanCode = raw;
      if (raw.includes('#invite=')) {
        cleanCode = raw.split('#invite=')[1];
      }
      if (cleanCode.startsWith('MK-SYNC-')) {
        cleanCode = cleanCode.replace('MK-SYNC-', '');
      }

      const jsonStr = decodeURIComponent(escape(atob(cleanCode)));
      const partnerData = JSON.parse(jsonStr);

      if (!partnerData.id || !partnerData.username) {
        throw new Error('Data profil rekan tidak valid');
      }

      if (partnerData.id === userId) {
        setInviteError('Anda tidak dapat menghubungkan akun sendiri.');
        return;
      }

      // Save partner to local users list so they exist on this device!
      saveUser({
        id: partnerData.id,
        username: partnerData.username,
        fullName: partnerData.fullName || partnerData.username,
        email: partnerData.email || `${partnerData.username}@local.app`,
        currency: partnerData.currency || 'IDR',
        createdAt: new Date().toISOString(),
      });

      // Check if friendship already exists
      const existing = friendships.find(
        (f) =>
          (f.requesterId === userId && f.receiverId === partnerData.id) ||
          (f.receiverId === userId && f.requesterId === partnerData.id)
      );

      if (existing) {
        if (existing.status === 'accepted') {
          setInviteError(`Anda sudah terhubung dengan @${partnerData.username}.`);
          return;
        }
        // If pending, accept immediately
        const accepted: Friendship = {
          ...existing,
          status: 'accepted',
          updatedAt: new Date().toISOString(),
        };
        saveFriendship(accepted);
        alert(`Berhasil terhubung dengan @${partnerData.username}!`);
        setShowInviteModal(false);
        window.location.reload();
        return;
      }

      // Create mutually accepted friendship since code was shared directly
      const newFriendship: Friendship = {
        id: `fr-${Date.now()}`,
        requesterId: userId,
        receiverId: partnerData.id,
        status: 'accepted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requesterPermissions: { ...DEFAULT_SHARING_PERMISSIONS },
        receiverPermissions: { ...DEFAULT_SHARING_PERMISSIONS },
      };

      saveFriendship(newFriendship);
      setShowInviteModal(false);
      alert(`Selamat! Anda dan @${partnerData.username} berhasil terhubung sebagai rekan keuangan.`);
      window.location.reload();
    } catch {
      setInviteError('Format kode rekan tidak valid. Pastikan kode disalin lengkap dari HP rekan.');
    }
  };

  // URL Hash Auto-invite check on load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('#invite=')) {
      const code = window.location.hash.split('#invite=')[1];
      if (code) {
        handleConnectViaCode(code);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  // Handlers for Friendship Invitation
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    const targetUsername = inviteUsername.trim().toLowerCase();

    if (!targetUsername) {
      setInviteError('Masukkan username rekan.');
      return;
    }

    // 1. Check local users first
    let targetUser = allUsers.find((u) => u.username.toLowerCase() === targetUsername);

    // 2. If not found locally, query Supabase cloud if configured!
    if (!targetUser && isSupabaseConfigured) {
      setIsSearchingCloud(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', targetUsername)
          .maybeSingle();

        if (data && !error) {
          targetUser = {
            id: data.id,
            username: data.username,
            fullName: data.full_name || data.username,
            email: data.email,
            currency: data.currency || 'IDR',
            createdAt: data.created_at || new Date().toISOString(),
          };
          saveUser(targetUser);
        }
      } catch {}
      setIsSearchingCloud(false);
    }

    if (!targetUser) {
      setInviteError(
        `User "${targetUsername}" tidak ditemukan di perangkat ini. Karena data belum terhubung ke database online, gunakan tab "Kode Hubung Instan" di atas untuk menghubungkan antar-HP langsung!`
      );
      return;
    }

    if (targetUser.id === userId) {
      setInviteError('Anda tidak dapat mengundang diri sendiri.');
      return;
    }

    // Check existing
    const existing = friendships.find(
      (f) =>
        (f.requesterId === userId && f.receiverId === targetUser.id) ||
        (f.receiverId === userId && f.requesterId === targetUser.id)
    );

    if (existing) {
      if (existing.status === 'accepted') {
        setInviteError('Anda sudah terhubung dengan rekan ini.');
        return;
      }
      if (existing.status === 'pending') {
        setInviteError('Undangan pertemanan sedang menunggu konfirmasi.');
        return;
      }
    }

    const newFriendship: Friendship = {
      id: `fr-${Date.now()}`,
      requesterId: userId,
      receiverId: targetUser.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requesterPermissions: { ...DEFAULT_SHARING_PERMISSIONS },
      receiverPermissions: { ...DEFAULT_SHARING_PERMISSIONS },
    };

    saveFriendship(newFriendship);
    setInviteUsername('');
    setShowInviteModal(false);
    alert(`Undangan berhasil dikirim ke @${targetUser.username}!`);
  };

  const handleAcceptInvite = (friendship: Friendship) => {
    const updated: Friendship = {
      ...friendship,
      status: 'accepted',
      updatedAt: new Date().toISOString(),
    };
    saveFriendship(updated);
    alert('Undangan rekan diterima!');
  };

  const handleRejectInvite = (friendship: Friendship) => {
    const updated: Friendship = {
      ...friendship,
      status: 'rejected',
      updatedAt: new Date().toISOString(),
    };
    saveFriendship(updated);
  };

  const handleDisconnect = () => {
    if (activePartnerData && confirm(`Putuskan koneksi rekan dengan @${activePartnerData.partner.username}?`)) {
      deleteFriendship(activePartnerData.friendship.id);
    }
  };

  const handleToggleMyPermission = (key: keyof SharingPermissions) => {
    if (!activePartnerData) return;
    const isRequester = activePartnerData.friendship.requesterId === userId;
    const currentPerms = isRequester
      ? activePartnerData.friendship.requesterPermissions
      : activePartnerData.friendship.receiverPermissions;

    const newPerms = { ...currentPerms, [key]: !currentPerms[key] };

    const updated: Friendship = {
      ...activePartnerData.friendship,
      requesterPermissions: isRequester ? newPerms : activePartnerData.friendship.requesterPermissions,
      receiverPermissions: !isRequester ? newPerms : activePartnerData.friendship.receiverPermissions,
      updatedAt: new Date().toISOString(),
    };

    saveFriendship(updated);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header and Connection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Manajemen Keuangan Rekan
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full">
              Partner Finance
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola keuangan bersama pasangan atau rekan bisnis dengan transparansi & kontrol privasi penuh.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activePartnerData ? (
            <button
              onClick={() => setShowPermissionsModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 shadow-sm transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Izin Berbagi Data</span>
            </button>
          ) : (
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Undang Rekan</span>
            </button>
          )}
        </div>
      </div>

      {/* Pending Invitations Banner if any */}
      {pendingRequests.length > 0 && (
        <div className="rounded-3xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
          <p className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">
            Permintaan Terhubung Rekan Menunggu Konfirmasi:
          </p>
          <div className="space-y-2">
            {pendingRequests.map((req) => {
              const requester = allUsers.find((u) => u.id === req.requesterId);
              return (
                <div
                  key={req.id}
                  className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {requester?.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {requester?.fullName} (@{requester?.username})
                      </p>
                      <p className="text-[11px] text-slate-500">Mengajak berbagi akses keuangan bersama</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptInvite(req)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      Terima
                    </button>
                    <button
                      onClick={() => handleRejectInvite(req)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Partner Connection Strip */}
      {activePartnerData ? (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-md">
                {partnerUser?.fullName.charAt(0)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {partnerUser?.fullName}
                </span>
                <span className="text-xs text-slate-400">(@{partnerUser?.username})</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Terhubung sejak {formatDateIndonesian(activePartnerData.friendship.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPermissionsModal(true)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
            >
              Atur Izin Privasi
            </button>
            <button
              onClick={handleDisconnect}
              className="text-xs font-medium text-rose-500 hover:text-rose-700 px-2 py-1"
            >
              Putuskan Rekan
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 p-6 text-center">
          <Users className="mx-auto h-10 w-10 text-slate-400 mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Belum Terhubung dengan Rekan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Undang pasangan, rekan usaha, atau keluarga dengan username mereka untuk mulai memantau dan menggabungkan keuangan bersama.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                setInviteMethod('code');
                setShowInviteModal(true);
              }}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 flex items-center gap-1.5"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Hubungkan Rekan (Kode / Link)</span>
            </button>
            <button
              onClick={handleCopyMyCode}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5"
            >
              {copiedMyCode ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Kode Saya Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin Kode Saya</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs: 1. Saya, 2. Rekan, 3. Gabungan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start">
          <button
            onClick={() => setPartnerSubTab('saya')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              partnerSubTab === 'saya'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Keuangan Saya
          </button>
          <button
            onClick={() => setPartnerSubTab('rekan')}
            disabled={!activePartnerData}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              !activePartnerData
                ? 'opacity-40 cursor-not-allowed'
                : partnerSubTab === 'rekan'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Keuangan Rekan
          </button>
          <button
            onClick={() => setPartnerSubTab('gabungan')}
            disabled={!activePartnerData}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              !activePartnerData
                ? 'opacity-40 cursor-not-allowed'
                : partnerSubTab === 'gabungan'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Total Gabungan</span>
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1" />
          <button
            onClick={() => setPeriod('this_month')}
            className={`px-2.5 py-1 rounded-lg ${period === 'this_month' ? 'bg-slate-200 dark:bg-slate-700 font-semibold text-slate-900 dark:text-white' : ''}`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setPeriod('this_year')}
            className={`px-2.5 py-1 rounded-lg ${period === 'this_year' ? 'bg-slate-200 dark:bg-slate-700 font-semibold text-slate-900 dark:text-white' : ''}`}
          >
            Tahun Ini
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: KEUANGAN SAYA */}
      {partnerSubTab === 'saya' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Saldo Saya</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatRupiah(myBalance)}
              </p>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Pemasukan Saya</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
                {formatRupiah(myIncome)}
              </p>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Pengeluaran Saya</span>
              <p className="text-2xl font-bold text-rose-600 mt-1 tabular-nums">
                {formatRupiah(myExpense)}
              </p>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Tabungan Saya</span>
              <p className="text-2xl font-bold text-indigo-600 mt-1 tabular-nums">
                {formatRupiah(mySavingsTotal)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: KEUANGAN REKAN */}
      {partnerSubTab === 'rekan' && partnerUser && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              Menampilkan data milik @{partnerUser.username} yang diizinkan untuk Anda lihat sesuai pengaturan privasi rekan.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Saldo Rekan */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Saldo Rekan</span>
              {partnerPerms?.shareBalance ? (
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                  {formatRupiah(partnerBalance)}
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" /> Tidak dibagikan
                </p>
              )}
            </div>

            {/* Pemasukan Rekan */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Pemasukan Rekan</span>
              {partnerPerms?.shareIncome ? (
                <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
                  {formatRupiah(partnerIncome)}
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" /> Tidak dibagikan
                </p>
              )}
            </div>

            {/* Pengeluaran Rekan */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Pengeluaran Rekan</span>
              {partnerPerms?.shareExpense ? (
                <p className="text-2xl font-bold text-rose-600 mt-1 tabular-nums">
                  {formatRupiah(partnerExpense)}
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" /> Tidak dibagikan
                </p>
              )}
            </div>

            {/* Tabungan Rekan */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Tabungan Rekan</span>
              {partnerPerms?.shareSavings ? (
                <p className="text-2xl font-bold text-indigo-600 mt-1 tabular-nums">
                  {formatRupiah(partnerSavingsTotal)}
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" /> Tidak dibagikan
                </p>
              )}
            </div>
          </div>

          {/* Partner Shared Transactions */}
          {partnerPerms?.shareTransactions && partnerFilteredTx.length > 0 && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Riwayat Transaksi Rekan yang Dibagikan
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {partnerFilteredTx.slice(0, 5).map((t) => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{t.title}</p>
                      <p className="text-slate-400 text-[11px]">{formatDateIndonesian(t.date)}</p>
                    </div>
                    <span
                      className={`font-bold tabular-nums ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatRupiah(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: DASHBOARD GABUNGAN (KEUANGAN BERSAMA - FLAGSHIP FEATURE) */}
      {partnerSubTab === 'gabungan' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Main 3 Column Overview: Saya, Rekan, Bersama */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Keuangan Saya */}
            <div className="p-5 rounded-3xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  Keuangan Saya
                </h3>
              </div>
              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Saldo:</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">{formatRupiah(myBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Pemasukan:</span>
                  <span className="font-bold text-emerald-600 tabular-nums">+{formatRupiah(myIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Pengeluaran:</span>
                  <span className="font-bold text-rose-600 tabular-nums">-{formatRupiah(myExpense)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Tabungan:</span>
                  <span className="font-bold text-indigo-600 tabular-nums">{formatRupiah(mySavingsTotal)}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Keuangan Rekan */}
            <div className="p-5 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                  Keuangan Rekan (@{partnerUser?.username || 'Rekan'})
                </h3>
              </div>
              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Saldo:</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {partnerPerms?.shareBalance ? formatRupiah(partnerBalance) : '(Privat)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Pemasukan:</span>
                  <span className="font-bold text-emerald-600 tabular-nums">
                    {partnerPerms?.shareIncome ? `+${formatRupiah(partnerIncome)}` : '(Privat)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Pengeluaran:</span>
                  <span className="font-bold text-rose-600 tabular-nums">
                    {partnerPerms?.shareExpense ? `-${formatRupiah(partnerExpense)}` : '(Privat)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Tabungan:</span>
                  <span className="font-bold text-indigo-600 tabular-nums">
                    {partnerPerms?.shareSavings ? formatRupiah(partnerSavingsTotal) : '(Privat)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 3: Total Keuangan Bersama */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#172554] to-[#1E3A8A] text-white shadow-md">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  Total Keuangan Bersama
                </h3>
              </div>
              <div className="mt-4 space-y-2.5 text-xs text-blue-100">
                <div className="flex justify-between">
                  <span>Total Saldo:</span>
                  <span className="font-extrabold text-white text-sm tabular-nums">{formatRupiah(jointBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Pemasukan:</span>
                  <span className="font-bold text-emerald-300 tabular-nums">+{formatRupiah(jointIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Pengeluaran:</span>
                  <span className="font-bold text-rose-300 tabular-nums">-{formatRupiah(jointExpense)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Tabungan:</span>
                  <span className="font-bold text-indigo-200 tabular-nums">{formatRupiah(jointSavings)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Bars */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Grafik Perbandingan Keuangan (Saya vs Rekan)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualisasi komparatif porsi kontribusi keuangan Anda dan rekan
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2">
              <ComparisonBar
                label="Perbandingan Saldo Kas & Rekening"
                myName="Saya"
                myAmount={myBalance}
                partnerName={`@${partnerUser?.username || 'Rekan'}`}
                partnerAmount={partnerBalance}
              />
              <ComparisonBar
                label="Perbandingan Pemasukan Periode Ini"
                myName="Saya"
                myAmount={myIncome}
                partnerName={`@${partnerUser?.username || 'Rekan'}`}
                partnerAmount={partnerIncome}
              />
              <ComparisonBar
                label="Perbandingan Pengeluaran Periode Ini"
                myName="Saya"
                myAmount={myExpense}
                partnerName={`@${partnerUser?.username || 'Rekan'}`}
                partnerAmount={partnerExpense}
              />
              <ComparisonBar
                label="Perbandingan Akumulasi Tabungan"
                myName="Saya"
                myAmount={mySavingsTotal}
                partnerName={`@${partnerUser?.username || 'Rekan'}`}
                partnerAmount={partnerSavingsTotal}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INVITE PARTNER */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Hubungkan Rekan Keuangan</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteError('');
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Tab Selector: Kode Instan vs Cari Username */}
            <div className="mt-3 flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => {
                  setInviteMethod('code');
                  setInviteError('');
                }}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  inviteMethod === 'code'
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Kode Rekan (Beda HP)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInviteMethod('username');
                  setInviteError('');
                }}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  inviteMethod === 'username'
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Cari @username</span>
              </button>
            </div>

            {/* METHOD 1: INSTANT PAIRING CODE (WORKS IMMEDIATELY ACROSS PHONES!) */}
            {inviteMethod === 'code' && (
              <div className="mt-4 space-y-4">
                {/* 1. Bagikan Kode Saya */}
                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                      Kode Profil Saya
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 bg-white dark:bg-blue-900/60 px-2 py-0.5 rounded-full font-semibold">
                      @{currentUser?.username}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Kirimkan kode atau tautan ini kepada pasangan/rekan Anda via WhatsApp untuk langsung terhubung:
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyMyCode}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 px-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      {copiedMyCode ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Kode Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Salin Kode Rekan</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyMyLink}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                    >
                      {copiedMyLink ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Link2 className="h-3.5 w-3.5" />
                      )}
                      <span>Salin Link</span>
                    </button>
                  </div>
                </div>

                {/* 2. Masukkan Kode Rekan */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Masukkan Kode dari HP Rekan:
                  </label>
                  <input
                    type="text"
                    placeholder="Tempel kode MK-SYNC-... di sini"
                    value={partnerCodeInput}
                    onChange={(e) => {
                      setPartnerCodeInput(e.target.value);
                      setInviteError('');
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleConnectViaCode()}
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    Hubungkan Rekan Sekarang
                  </button>
                </div>
              </div>
            )}

            {/* METHOD 2: USERNAME LOOKUP (DATABASE / LOCAL) */}
            {inviteMethod === 'username' && (
              <form onSubmit={handleSendInvite} className="mt-4 space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cari username rekan yang terdaftar pada database online Supabase atau perangkat ini.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username Rekan
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">@</span>
                    <input
                      type="text"
                      required
                      placeholder="cth: username_rekan"
                      value={inviteUsername}
                      onChange={(e) => {
                        setInviteUsername(e.target.value);
                        setInviteError('');
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-7 pr-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSearchingCloud}
                  className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSearchingCloud ? 'Mencari di Database Cloud...' : 'Kirim Undangan Rekan'}
                </button>
              </form>
            )}

            {/* Error Message */}
            {inviteError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{inviteError}</span>
              </div>
            )}

            {/* Footer Notice */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-400">
                💡 <strong>Tips:</strong> Jika kedua HP belum dihubungkan ke Supabase, gunakan tombol <strong>Salin Kode Rekan</strong> lalu kirimkan ke WhatsApp rekan Anda untuk terhubung secara instan!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SHARING PERMISSIONS */}
      {showPermissionsModal && activePartnerData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Pengaturan Izin Berbagi Data
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pilih data keuangan Anda yang boleh dilihat oleh @{activePartnerData.partner.username}
                </p>
              </div>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 my-4 space-y-2">
              {[
                { key: 'shareBalance', label: 'Berbagi Ringkasan Saldo', desc: 'Total saldo di semua rekening & kas' },
                { key: 'shareIncome', label: 'Berbagi Pemasukan', desc: 'Total dan rincian arus kas masuk' },
                { key: 'shareExpense', label: 'Berbagi Pengeluaran', desc: 'Total dan rincian pengeluaran belanja' },
                { key: 'shareSavings', label: 'Berbagi Target Tabungan', desc: 'Progres pencapaian tabungan' },
                { key: 'shareDebts', label: 'Berbagi Utang dan Piutang', desc: 'Kewajiban dan piutang aktif' },
                { key: 'shareTransactions', label: 'Berbagi Riwayat Transaksi', desc: 'Daftar mutasi transaksi harian' },
                { key: 'shareReports', label: 'Berbagi Laporan Keuangan', desc: 'Arus kas dan analisis bulanan' },
              ].map((item) => {
                const isEnabled = myPerms?.[item.key as keyof SharingPermissions];
                return (
                  <div key={item.key} className="pt-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</p>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleMyPermission(item.key as keyof SharingPermissions)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowPermissionsModal(false)}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Simpan & Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
