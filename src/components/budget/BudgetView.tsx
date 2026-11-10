import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  X,
  Trash2
} from 'lucide-react';
import { Budget, Category } from '../../types/finance.ts';
import {
  getBudgets,
  getCategories,
  getTransactions,
  saveBudget,
  deleteBudget,
  formatRupiah
} from '../../lib/storage.ts';

interface BudgetViewProps {
  userId: string;
}

export function BudgetView({ userId }: BudgetViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [limitInput, setLimitInput] = useState('');

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const budgets = useMemo(() => getBudgets(userId), [userId, showModal]);
  const categories = useMemo(() => getCategories(userId), [userId]);
  const transactions = useMemo(() => getTransactions(userId), [userId]);

  // Current month expense transactions
  const monthExpenses = useMemo(() => {
    return transactions.filter((t) => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
  }, [transactions, now]);

  // Total budget and total spent
  const totalBudgetLimit = useMemo(() => budgets.reduce((sum, b) => sum + b.monthlyLimit, 0), [budgets]);
  const totalSpent = useMemo(() => monthExpenses.reduce((sum, t) => sum + t.amount, 0), [monthExpenses]);
  const totalRemaining = Math.max(0, totalBudgetLimit - totalSpent);
  const overallPercentage = totalBudgetLimit > 0 ? Math.round((totalSpent / totalBudgetLimit) * 100) : 0;

  // Open modal for new budget
  const handleOpenNew = () => {
    setEditingBudget(null);
    const expenseCats = categories.filter((c) => c.type === 'expense');
    setCategoryId(expenseCats[0]?.id || '');
    setLimitInput('1000000');
    setShowModal(true);
  };

  const handleEdit = (b: Budget) => {
    setEditingBudget(b);
    setCategoryId(b.categoryId);
    setLimitInput(b.monthlyLimit.toString());
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseInt(limitInput.replace(/[^0-9]/g, ''), 10) || 0;
    if (limit <= 0) {
      alert('Batas anggaran harus lebih dari 0.');
      return;
    }

    const b: Budget = {
      id: editingBudget ? editingBudget.id : `bg-${Date.now()}`,
      userId,
      categoryId,
      monthlyLimit: limit,
      month: currentMonthStr,
    };

    saveBudget(b);
    setShowModal(false);
  };

  const handleDelete = () => {
    if (editingBudget && confirm('Hapus anggaran ini?')) {
      deleteBudget(editingBudget.id);
      setShowModal(false);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Manajemen Anggaran (Budget)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kontrol batas pengeluaran bulanan dan pantau batas aman pemakaian keuangan Anda.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Atur Anggaran Kategori</span>
        </button>
      </div>

      {/* Overall Budget Overview Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Anggaran Bulan Ini
            </span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
              {formatRupiah(totalBudgetLimit)}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Sudah Digunakan</p>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {formatRupiah(totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Sisa Anggaran</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatRupiah(totalRemaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 dark:text-slate-300">Penggunaan Anggaran Keseluruhan</span>
            <span
              className={`tabular-nums ${
                overallPercentage >= 100
                  ? 'text-rose-600 font-bold'
                  : overallPercentage >= 80
                  ? 'text-amber-500 font-bold'
                  : 'text-blue-600'
              }`}
            >
              {overallPercentage}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage >= 100
                  ? 'bg-rose-500'
                  : overallPercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const cat = categories.find((c) => c.id === b.categoryId);
          const spent = monthExpenses
            .filter((t) => t.categoryId === b.categoryId)
            .reduce((sum, t) => sum + t.amount, 0);

          const pct = Math.round((spent / b.monthlyLimit) * 100);
          const remaining = b.monthlyLimit - spent;
          const isOver = pct >= 100;
          const isWarning = pct >= 80 && pct < 100;

          return (
            <div
              key={b.id}
              onClick={() => handleEdit(b)}
              className="p-5 rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:border-blue-400 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: cat?.color || '#3B82F6' }}
                  />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {cat?.name || 'Kategori'}
                  </span>
                </div>

                {isOver ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full">
                    <AlertCircle className="h-3.5 w-3.5" /> Melebihi Batas!
                  </span>
                ) : isWarning ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full">
                    <AlertTriangle className="h-3.5 w-3.5" /> Waspada 80%+
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5" /> Aman
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(100, pct)}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Terpakai: {pct}%</span>
                  <span>{formatRupiah(spent)} / {formatRupiah(b.monthlyLimit)}</span>
                </div>
              </div>

              {/* Numbers */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  {remaining >= 0 ? 'Sisa Anggaran:' : 'Kelebihan Pengeluaran:'}
                </span>
                <span
                  className={`font-bold tabular-nums ${
                    remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatRupiah(Math.abs(remaining))}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Budget */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingBudget ? 'Edit Anggaran Kategori' : 'Pasang Anggaran Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Kategori Pengeluaran
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Batas Anggaran Bulanan (Rp)
                </label>
                <input
                  type="text"
                  required
                  value={limitInput ? parseInt(limitInput, 10).toLocaleString('id-ID') : ''}
                  onChange={(e) => setLimitInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="2.000.000"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                {editingBudget ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus Anggaran</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
