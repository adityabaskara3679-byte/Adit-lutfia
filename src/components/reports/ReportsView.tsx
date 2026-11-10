import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Transaction, Category } from '../../types/finance.ts';
import {
  getTransactions,
  getCategories,
  getAccounts,
  formatRupiah,
  formatDateIndonesian
} from '../../lib/storage.ts';

interface ReportsViewProps {
  userId: string;
}

export function ReportsView({ userId }: ReportsViewProps) {
  const [reportType, setReportType] = useState<'cashflow' | 'income' | 'expense' | 'category' | 'monthly_comparison'>('cashflow');
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'this_year'>('this_month');

  const transactions = useMemo(() => getTransactions(userId), [userId]);
  const categories = useMemo(() => getCategories(userId), [userId]);
  const accounts = useMemo(() => getAccounts(userId), [userId]);

  const now = new Date();

  // Filtered transactions for the selected period
  const filteredTx = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (period === 'this_month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (period === 'last_month') {
        const lastM = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastY = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return d.getMonth() === lastM && d.getFullYear() === lastY;
      }
      if (period === 'this_year') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [transactions, period, now]);

  // Aggregate totals
  const totalIncome = useMemo(
    () => filteredTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [filteredTx]
  );
  const totalExpense = useMemo(
    () => filteredTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [filteredTx]
  );
  const netSavings = totalIncome - totalExpense;

  // Group by category
  const categorySummary = useMemo(() => {
    const map = new Map<string, { income: number; expense: number; count: number }>();
    filteredTx.forEach((t) => {
      if (!map.has(t.categoryId)) {
        map.set(t.categoryId, { income: 0, expense: 0, count: 0 });
      }
      const item = map.get(t.categoryId)!;
      item.count += 1;
      if (t.type === 'income') item.income += t.amount;
      if (t.type === 'expense') item.expense += t.amount;
    });

    return Array.from(map.entries())
      .map(([catId, val]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          id: catId,
          name: cat?.name || 'Lainnya',
          color: cat?.color || '#64748B',
          type: cat?.type || 'expense',
          ...val,
        };
      })
      .sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
  }, [filteredTx, categories]);

  // Monthly Comparison Table (Last 4 months)
  const monthlyComparison = useMemo(() => {
    const months: { name: string; income: number; expense: number; net: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yVal = d.getFullYear();
      const mName = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

      const txsInMonth = transactions.filter((t) => {
        const td = new Date(t.date);
        return td.getMonth() === mIdx && td.getFullYear() === yVal;
      });

      const inc = txsInMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = txsInMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      months.push({
        name: mName,
        income: inc,
        expense: exp,
        net: inc - exp,
      });
    }
    return months;
  }, [transactions, now]);

  // Export to CSV / Excel
  const handleExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Judul', 'Tipe', 'Nominal', 'Kategori', 'Akun Sumber', 'Metode Pembayaran', 'Catatan'];
    const rows = filteredTx.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId)?.name || '';
      const acc = accounts.find((a) => a.id === t.accountId)?.name || '';
      return [
        t.id,
        t.date,
        `"${t.title.replace(/"/g, '""')}"`,
        t.type,
        t.amount,
        `"${cat}"`,
        `"${acc}"`,
        t.paymentMethod,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_${period}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header & Export Actions (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Laporan Keuangan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Analisis arus kas, distribusi pengeluaran, perbandingan bulanan, dan ekspor data resmi.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 shadow-sm transition-colors"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Ekspor Excel (CSV)</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Report Type Strip (Hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm no-print">
        {/* Report Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {[
            { id: 'cashflow', label: 'Arus Kas' },
            { id: 'category', label: 'Per Kategori' },
            { id: 'monthly_comparison', label: 'Perbandingan Bulanan' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setReportType(item.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                reportType === item.id
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Period Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="h-4 w-4 text-slate-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:outline-none"
          >
            <option value="this_month">Bulan Ini</option>
            <option value="last_month">Bulan Lalu</option>
            <option value="this_year">Tahun Berjalan</option>
          </select>
        </div>
      </div>

      {/* PRINTABLE REPORT DOCUMENT CONTAINER */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        {/* Report Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">
              MitraKeuangan Finance Statement
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {reportType === 'cashflow' && 'Laporan Arus Kas (Cash Flow Statement)'}
              {reportType === 'category' && 'Laporan Pengeluaran Berdasarkan Kategori'}
              {reportType === 'monthly_comparison' && 'Laporan Komparasi Keuangan Antarbulan'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Periode: {period === 'this_month' ? 'Bulan Ini' : period === 'last_month' ? 'Bulan Lalu' : 'Tahun 2026'} · Dicetak otomatis
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Status Keuangan:
            </span>
            <p
              className={`text-sm font-extrabold tabular-nums ${
                netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {netSavings >= 0 ? 'Surplus ' : 'Defisit '}
              {formatRupiah(Math.abs(netSavings))}
            </p>
          </div>
        </div>

        {/* Highlight Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Total Pemasukan</span>
            <p className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">
              +{formatRupiah(totalIncome)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Total Pengeluaran</span>
            <p className="text-xl font-bold text-rose-600 mt-1 tabular-nums">
              -{formatRupiah(totalExpense)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Net Arus Kas (Tabungan Bersih)</span>
            <p
              className={`text-xl font-bold mt-1 tabular-nums ${
                netSavings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'
              }`}
            >
              {formatRupiah(netSavings)}
            </p>
          </div>
        </div>

        {/* REPORT CONTENT VIEW 1: CASH FLOW LIST */}
        {reportType === 'cashflow' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Rincian Mutasi Arus Kas ({filteredTx.length} Transaksi)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Deskripsi Transaksi</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Akun</th>
                    <th className="py-2.5 px-3 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTx.map((tx) => {
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    const acc = accounts.find((a) => a.id === tx.accountId);
                    const isInc = tx.type === 'income';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {formatDateIndonesian(tx.date)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {tx.title}
                          {tx.notes && <span className="block text-[10px] text-slate-400 font-normal">{tx.notes}</span>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {cat?.name || 'Umum'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {acc?.name || '-'}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold tabular-nums whitespace-nowrap ${
                            isInc ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isInc ? '+' : '-'}
                          {formatRupiah(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT CONTENT VIEW 2: CATEGORY BREAKDOWN */}
        {reportType === 'category' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Distribusi Keuangan Berdasarkan Kategori
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3 text-center">Jumlah Transaksi</th>
                    <th className="py-2.5 px-3 text-right">Total Pemasukan</th>
                    <th className="py-2.5 px-3 text-right">Total Pengeluaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categorySummary.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3 px-3 capitalize text-slate-500">{item.type}</td>
                      <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-300 tabular-nums">
                        {item.count}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-600 font-semibold tabular-nums">
                        {item.income > 0 ? `+${formatRupiah(item.income)}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right text-rose-600 font-semibold tabular-nums">
                        {item.expense > 0 ? `-${formatRupiah(item.expense)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT CONTENT VIEW 3: MONTHLY COMPARISON */}
        {reportType === 'monthly_comparison' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Perbandingan Arus Kas 4 Bulan Terakhir
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Periode Bulan</th>
                    <th className="py-2.5 px-3 text-right">Pemasukan</th>
                    <th className="py-2.5 px-3 text-right">Pengeluaran</th>
                    <th className="py-2.5 px-3 text-right">Selisih Bersih (Net)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {monthlyComparison.map((m) => {
                    const isSurplus = m.net >= 0;
                    return (
                      <tr key={m.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{m.name}</td>
                        <td className="py-3 px-3 text-right text-emerald-600 font-bold tabular-nums">
                          +{formatRupiah(m.income)}
                        </td>
                        <td className="py-3 px-3 text-right text-rose-600 font-bold tabular-nums">
                          -{formatRupiah(m.expense)}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-extrabold tabular-nums ${
                            isSurplus ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'
                          }`}
                        >
                          {isSurplus ? '+' : ''}
                          {formatRupiah(m.net)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSurplus
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                            }`}
                          >
                            {isSurplus ? 'Surplus' : 'Defisit'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
