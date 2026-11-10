import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  PiggyBank,
  Receipt,
  FileImage,
  Calendar,
  X
} from 'lucide-react';
import { Transaction, TransactionType } from '../../types/finance.ts';
import {
  getTransactions,
  getCategories,
  getAccounts,
  formatRupiah,
  formatDateIndonesian
} from '../../lib/storage.ts';

interface TransactionListProps {
  userId: string;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export function TransactionList({
  userId,
  onOpenAddModal,
  onEditTransaction,
}: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);

  const transactions = useMemo(() => getTransactions(userId), [userId]);
  const categories = useMemo(() => getCategories(userId), [userId]);
  const accounts = useMemo(() => getAccounts(userId), [userId]);

  // Filter & Sort
  const filteredList = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = tx.title.toLowerCase().includes(q);
          const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
          if (!matchesTitle && !matchesNotes) return false;
        }

        // Type
        if (selectedType !== 'all' && tx.type !== selectedType) {
          return false;
        }

        // Category
        if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
          return false;
        }

        // Date
        if (dateFilter && tx.date !== dateFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, selectedType, selectedCategory, dateFilter, sortBy]);

  // Aggregate totals of filtered list
  const { totalIn, totalOut } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;
    filteredList.forEach((t) => {
      if (t.type === 'income') inSum += t.amount;
      if (t.type === 'expense') outSum += t.amount;
    });
    return { totalIn: inSum, totalOut: outSum };
  }, [filteredList]);

  return (
    <div className="space-y-5 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daftar Transaksi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola seluruh transaksi pemasukan, pengeluaran, transfer, dan setoran tabungan.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Transaksi</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari transaksi berdasarkan nama, keterangan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Horizontal filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Type Segmented buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'income', label: 'Pemasukan' },
              { id: 'expense', label: 'Pengeluaran' },
              { id: 'transfer', label: 'Transfer' },
              { id: 'savings', label: 'Tabungan' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedType === tab.id
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Date filter */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="text-slate-400 hover:text-slate-600">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 ml-auto">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:outline-none"
            >
              <option value="date_desc">Tanggal (Terbaru)</option>
              <option value="date_asc">Tanggal (Terlama)</option>
              <option value="amount_desc">Nominal (Terbesar)</option>
              <option value="amount_asc">Nominal (Terkecil)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary of Filtered Items */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
        <span>Menampilkan {filteredList.length} transaksi</span>
        <div className="flex items-center gap-4">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
            +{formatRupiah(totalIn)}
          </span>
          <span className="text-rose-600 dark:text-rose-400 font-semibold tabular-nums">
            -{formatRupiah(totalOut)}
          </span>
        </div>
      </div>

      {/* Transaction List Cards */}
      <div className="space-y-2">
        {filteredList.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Receipt className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tidak ada transaksi ditemukan
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Coba sesuaikan filter atau tambahkan transaksi baru Anda.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Catat Transaksi Sekarang
            </button>
          </div>
        ) : (
          filteredList.map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            const acc = accounts.find((a) => a.id === tx.accountId);
            const isInc = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';
            const isSavings = tx.type === 'savings';

            return (
              <div
                key={tx.id}
                onClick={() => onEditTransaction(tx)}
                className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50 cursor-pointer shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Category / Type Icon badge */}
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white font-bold shadow-sm"
                    style={{
                      backgroundColor:
                        isTransfer ? '#2563EB' : isSavings ? '#4F46E5' : cat?.color || '#3B82F6',
                    }}
                  >
                    {isInc && <TrendingUp className="h-5 w-5" />}
                    {tx.type === 'expense' && <TrendingDown className="h-5 w-5" />}
                    {isTransfer && <ArrowRightLeft className="h-5 w-5" />}
                    {isSavings && <PiggyBank className="h-5 w-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tx.title}
                      </p>
                      {tx.receiptUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewReceipt(tx.receiptUrl || null);
                          }}
                          title="Lihat Struk"
                          className="text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform"
                        >
                          <FileImage className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{cat?.name || 'Umum'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{acc?.name || 'Akun'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateIndonesian(tx.date)}</span>
                      {tx.notes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="italic truncate max-w-[150px]">"{tx.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <p
                    className={`text-sm sm:text-base font-bold tabular-nums ${
                      isInc
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isTransfer
                        ? 'text-blue-600 dark:text-blue-400'
                        : isSavings
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-900 dark:text-white'
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
          })
        )}
      </div>

      {/* Receipt Modal Preview */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Foto Bukti Transaksi
              </span>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 max-h-[70vh] overflow-auto flex items-center justify-center">
              <img
                src={previewReceipt}
                alt="Receipt Preview"
                className="max-h-[65vh] w-auto rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
