import React, { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  PiggyBank,
  Scale,
  Calendar,
  Percent,
  ChevronRight,
  Plus,
  Users,
  Eye,
  PieChart as PieIcon,
  Filter
} from 'lucide-react';
import { PeriodFilter, Transaction, Category } from '../../types/finance.ts';
import {
  getAccounts,
  getTransactions,
  getCategories,
  getSavingsGoals,
  getDebts,
  formatRupiah,
  formatDateIndonesian,
  getActivePartner
} from '../../lib/storage.ts';
import {
  IncomeExpenseChart,
  BalanceTrendChart,
  CategoryPieChart
} from '../charts/FinancialCharts.tsx';

interface DashboardViewProps {
  userId: string;
  onOpenAddModal: () => void;
  onSelectTab: (tab: string) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export function DashboardView({
  userId,
  onOpenAddModal,
  onSelectTab,
  onEditTransaction,
}: DashboardViewProps) {
  const [period, setPeriod] = useState<PeriodFilter>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [activeChartTab, setActiveChartTab] = useState<'inc_exp' | 'trend' | 'category'>('inc_exp');

  // Load user data
  const accounts = useMemo(() => getAccounts(userId), [userId]);
  const allTransactions = useMemo(() => getTransactions(userId), [userId]);
  const categories = useMemo(() => getCategories(userId), [userId]);
  const savingsGoals = useMemo(() => getSavingsGoals(userId), [userId]);
  const debts = useMemo(() => getDebts(userId), [userId]);
  const partnerInfo = useMemo(() => getActivePartner(userId), [userId]);

  // Total balance across all accounts
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [accounts]);

  // Total savings
  const totalSavings = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  }, [savingsGoals]);

  // Total debts and receivables
  const { totalDebt, totalReceivable } = useMemo(() => {
    let dSum = 0;
    let rSum = 0;
    debts.forEach((d) => {
      const remaining = Math.max(0, d.amount - d.paidAmount);
      if (d.type === 'debt') dSum += remaining;
      else rSum += remaining;
    });
    return { totalDebt: dSum, totalReceivable: rSum };
  }, [debts]);

  // Filter transactions based on period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return allTransactions.filter((tx) => {
      const txDate = new Date(tx.date);

      if (period === 'today') {
        return tx.date === todayStr;
      }

      if (period === 'this_week') {
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(now.getDate() - now.getDay());
        return txDate >= firstDayOfWeek;
      }

      if (period === 'this_month') {
        return (
          txDate.getFullYear() === now.getFullYear() &&
          txDate.getMonth() === now.getMonth()
        );
      }

      if (period === 'last_3_months') {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return txDate >= threeMonthsAgo;
      }

      if (period === 'this_year') {
        return txDate.getFullYear() === now.getFullYear();
      }

      if (period === 'custom') {
        if (!customStart && !customEnd) return true;
        const start = customStart ? new Date(customStart) : new Date(0);
        const end = customEnd ? new Date(customEnd + 'T23:59:59') : new Date();
        return txDate >= start && txDate <= end;
      }

      return true;
    });
  }, [allTransactions, period, customStart, customEnd]);

  // Period stats
  const periodIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const periodExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const netCashFlow = periodIncome - periodExpense;
  const expensePercentage = periodIncome > 0 ? Math.min(100, Math.round((periodExpense / periodIncome) * 100)) : 0;

  // Chart: Income vs Expense grouped by week / month
  const chartData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach((t) => {
      const dateObj = new Date(t.date);
      // Format as DD/MM
      const label = `${dateObj.getDate()} ${dateObj.toLocaleString('id-ID', { month: 'short' })}`;
      if (!map.has(label)) {
        map.set(label, { income: 0, expense: 0 });
      }
      const item = map.get(label)!;
      if (t.type === 'income') item.income += t.amount;
      if (t.type === 'expense') item.expense += t.amount;
    });

    const entries = Array.from(map.entries()).map(([label, val]) => ({
      label,
      income: val.income,
      expense: val.expense,
    }));

    if (entries.length === 0) {
      return [
        { label: 'Minggu 1', income: periodIncome * 0.4, expense: periodExpense * 0.35 },
        { label: 'Minggu 2', income: periodIncome * 0.3, expense: periodExpense * 0.25 },
        { label: 'Minggu 3', income: periodIncome * 0.2, expense: periodExpense * 0.2 },
        { label: 'Minggu 4', income: periodIncome * 0.1, expense: periodExpense * 0.2 },
      ];
    }
    return entries.slice(-7);
  }, [filteredTransactions, periodIncome, periodExpense]);

  // Chart: Category Breakdown for Donut Chart
  const categoryChartData = useMemo(() => {
    const expenseTxs = filteredTransactions.filter((t) => t.type === 'expense');
    const catMap = new Map<string, number>();

    expenseTxs.forEach((t) => {
      catMap.set(t.categoryId, (catMap.get(t.categoryId) || 0) + t.amount);
    });

    return Array.from(catMap.entries())
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          name: cat?.name || 'Lainnya',
          amount,
          color: cat?.color || '#94A3B8',
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories]);

  // Chart: Balance Trend Data
  const balanceTrendData = useMemo(() => {
    let running = totalBalance - (periodIncome - periodExpense);
    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const points: { date: string; balance: number }[] = [];

    sorted.forEach((t) => {
      if (t.type === 'income') running += t.amount;
      if (t.type === 'expense') running -= t.amount;
      const d = new Date(t.date);
      points.push({
        date: `${d.getDate()}/${d.getMonth() + 1}`,
        balance: running,
      });
    });

    if (points.length < 2) {
      return [
        { date: '1 Nov', balance: totalBalance * 0.85 },
        { date: '5 Nov', balance: totalBalance * 0.9 },
        { date: '10 Nov', balance: totalBalance },
      ];
    }
    return points.slice(-8);
  }, [filteredTransactions, totalBalance, periodIncome, periodExpense]);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top Banner / Welcome & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Ringkasan Keuangan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pantau arus kas, saldo, dan performa keuangan pribadi Anda secara real-time.
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl shrink-0">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'this_week', label: 'Minggu Ini' },
            { id: 'this_month', label: 'Bulan Ini' },
            { id: 'last_3_months', label: '3 Bulan' },
            { id: 'this_year', label: 'Tahun Ini' },
            { id: 'custom', label: 'Kustom' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as PeriodFilter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                period === item.id
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker when selected */}
      {period === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Dari:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Sampai:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo Card (Primary Navy Theme) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172554] to-[#1E3A8A] p-5 text-white shadow-md shadow-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200">Total Saldo Bersih</span>
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Wallet className="h-4 w-4 text-blue-200" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
            {formatRupiah(totalBalance)}
          </p>
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-xs text-blue-200">
            <span>{accounts.length} Rekening Aktif</span>
            <button
              onClick={() => onSelectTab('profil')}
              className="hover:text-white flex items-center gap-1 font-medium underline"
            >
              Kelola Akun
            </button>
          </div>
        </div>

        {/* Pemasukan Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pemasukan</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {formatRupiah(periodIncome)}
          </p>
          <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span>+ Arus kas masuk periode ini</span>
          </p>
        </div>

        {/* Pengeluaran Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pengeluaran</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {formatRupiah(periodExpense)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Rasio Pengeluaran:</span>
            <span
              className={`font-bold tabular-nums ${
                expensePercentage > 80 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {expensePercentage}% dari income
            </span>
          </div>
        </div>

        {/* Selisih Arus Kas (Net Flow) Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Selisih (Arus Kas Bersih)</span>
            <div
              className={`p-2 rounded-xl ${
                netCashFlow >= 0
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
              }`}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </div>
          </div>
          <p
            className={`mt-3 text-2xl font-bold tracking-tight tabular-nums ${
              netCashFlow >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {netCashFlow >= 0 ? '+' : ''}
            {formatRupiah(netCashFlow)}
          </p>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {netCashFlow >= 0 ? 'Surplus keuangan sehat' : 'Defisit - perketat anggaran'}
          </p>
        </div>
      </div>

      {/* Secondary Metrics Strip: Tabungan, Utang, Piutang */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Tabungan */}
        <div
          onClick={() => onSelectTab('tabungan')}
          className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-blue-400 cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tabungan</p>
              <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                {formatRupiah(totalSavings)}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Total Utang (Hutang Saya) */}
        <div
          onClick={() => onSelectTab('utang_piutang')}
          className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-rose-400 cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Utang Saya (Belum Lunas)</p>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {formatRupiah(totalDebt)}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Total Piutang (Uang Saya di Orang Lain) */}
        <div
          onClick={() => onSelectTab('utang_piutang')}
          className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-emerald-400 cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Piutang (Uang di Pihak Lain)</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatRupiah(totalReceivable)}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Partner Spotlight Banner if connected */}
      {partnerInfo && (
        <div className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {partnerInfo.partner.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Terhubung dengan Rekan: {partnerInfo.partner.fullName}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Buka tab Rekan untuk melihat perbandingan & dashboard keuangan bersama.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('rekan')}
            className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Dashboard Bersama
          </button>
        </div>
      )}

      {/* Visual Charts Container with Tabs */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Visualisasi Analitik Keuangan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grafik interaktif untuk mengamati tren dan komposisi pengeluaran
            </p>
          </div>

          {/* Chart View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveChartTab('inc_exp')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeChartTab === 'inc_exp'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pemasukan vs Pengeluaran
            </button>
            <button
              onClick={() => setActiveChartTab('trend')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeChartTab === 'trend'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tren Saldo
            </button>
            <button
              onClick={() => setActiveChartTab('category')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeChartTab === 'category'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Kategori Pengeluaran
            </button>
          </div>
        </div>

        {/* Chart Content Area */}
        <div className="pt-4">
          {activeChartTab === 'inc_exp' && <IncomeExpenseChart data={chartData} />}
          {activeChartTab === 'trend' && <BalanceTrendChart data={balanceTrendData} />}
          {activeChartTab === 'category' && <CategoryPieChart categories={categoryChartData} />}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Transaksi Terbaru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Riwayat mutasi pencatatan keuangan Anda
            </p>
          </div>
          <button
            onClick={() => onSelectTab('transaksi')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
          {allTransactions.slice(0, 5).map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            const acc = accounts.find((a) => a.id === tx.accountId);
            const isInc = tx.type === 'income';

            return (
              <div
                key={tx.id}
                onClick={() => onEditTransaction(tx)}
                className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-sm"
                    style={{ backgroundColor: cat?.color || '#3B82F6' }}
                  >
                    {isInc ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{cat?.name || 'Umum'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{acc?.name || 'Akun'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateIndonesian(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xs sm:text-sm font-bold tabular-nums ${
                      isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isInc ? '+' : '-'}
                    {formatRupiah(tx.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {tx.paymentMethod}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
