import React, { useState, useMemo } from 'react';
import {
  PiggyBank,
  Plus,
  Target,
  Calendar,
  CheckCircle,
  TrendingUp,
  History,
  X,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { SavingsGoal } from '../../types/finance.ts';
import {
  getSavingsGoals,
  saveSavingsGoal,
  deleteSavingsGoal,
  formatRupiah,
  formatDateIndonesian
} from '../../lib/storage.ts';

interface SavingsViewProps {
  userId: string;
}

export function SavingsView({ userId }: SavingsViewProps) {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Goal Form
  const [goalName, setGoalName] = useState('');
  const [targetAmountInput, setTargetAmountInput] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#2563EB');

  // Deposit Form
  const [depositAmountInput, setDepositAmountInput] = useState('');
  const [depositNote, setDepositNote] = useState('');

  const savingsGoals = useMemo(() => getSavingsGoals(userId), [userId, showGoalModal, showDepositModal]);

  const totalAccumulated = useMemo(
    () => savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0),
    [savingsGoals]
  );
  const totalTarget = useMemo(
    () => savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0),
    [savingsGoals]
  );
  const overallProgress = totalTarget > 0 ? Math.round((totalAccumulated / totalTarget) * 100) : 0;

  const handleOpenNewGoal = () => {
    setSelectedGoal(null);
    setGoalName('');
    setTargetAmountInput('10000000');
    setTargetDate(new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setNotes('');
    setColor('#2563EB');
    setShowGoalModal(true);
  };

  const handleOpenDeposit = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setDepositAmountInput('500000');
    setDepositNote('Setoran rutin');
    setShowDepositModal(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmt = parseInt(targetAmountInput.replace(/[^0-9]/g, ''), 10) || 0;
    if (!goalName.trim() || targetAmt <= 0) {
      alert('Masukkan nama target dan nominal yang valid.');
      return;
    }

    const goal: SavingsGoal = {
      id: selectedGoal ? selectedGoal.id : `svg-${Date.now()}`,
      userId,
      name: goalName.trim(),
      targetAmount: targetAmt,
      currentAmount: selectedGoal ? selectedGoal.currentAmount : 0,
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
      color,
      deposits: selectedGoal ? selectedGoal.deposits : [],
    };

    saveSavingsGoal(goal);
    setShowGoalModal(false);
  };

  const handleSaveDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    const amount = parseInt(depositAmountInput.replace(/[^0-9]/g, ''), 10) || 0;
    if (amount <= 0) {
      alert('Nominal setoran harus lebih dari 0.');
      return;
    }

    const updatedGoal: SavingsGoal = {
      ...selectedGoal,
      currentAmount: selectedGoal.currentAmount + amount,
      deposits: [
        {
          id: `dep-${Date.now()}`,
          amount,
          date: new Date().toISOString().split('T')[0],
          note: depositNote.trim(),
        },
        ...selectedGoal.deposits,
      ],
    };

    saveSavingsGoal(updatedGoal);
    setShowDepositModal(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Hapus target tabungan ini?')) {
      deleteSavingsGoal(goalId);
      setShowGoalModal(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Target Tabungan (Savings Goals)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rencanakan target impian, catat setoran tabungan, dan pantau persentase pencapaian.
          </p>
        </div>

        <button
          onClick={handleOpenNewGoal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Target Baru</span>
        </button>
      </div>

      {/* Aggregate Savings Summary */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Dana Terkumpul
            </span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
              {formatRupiah(totalAccumulated)}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Total Akumulasi Target</p>
              <p className="text-base font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                {formatRupiah(totalTarget)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Pencapaian Global</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {overallProgress}%
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, overallProgress)}%` }}
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsGoals.map((goal) => {
          const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="p-5 rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
                    style={{ backgroundColor: goal.color }}
                  >
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {goal.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Target: {formatDateIndonesian(goal.targetDate)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Progres: {pct}%
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatRupiah(goal.currentAmount)} / {formatRupiah(goal.targetAmount)}
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    style={{ width: `${pct}%`, backgroundColor: goal.color }}
                    className="h-full rounded-full transition-all duration-300"
                  />
                </div>
                <p className="text-[11px] text-slate-400 text-right">
                  Sisa: {formatRupiah(remaining)}
                </p>
              </div>

              {/* Deposits History Preview */}
              {goal.deposits && goal.deposits.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Riwayat Setoran Terakhir
                  </span>
                  {goal.deposits.slice(0, 2).map((dep) => (
                    <div key={dep.id} className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{formatDateIndonesian(dep.date)} {dep.note && `(${dep.note})`}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatRupiah(dep.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Deposit Button */}
              <button
                onClick={() => handleOpenDeposit(goal)}
                className="w-full rounded-xl bg-blue-50 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Setor Tabungan</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD GOAL */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Buat Target Tabungan Baru
              </h2>
              <button onClick={() => setShowGoalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Target Impian
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Beli Mobil, Liburan, Dana Darurat"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Nominal (Rp)
                </label>
                <input
                  type="text"
                  required
                  value={targetAmountInput ? parseInt(targetAmountInput, 10).toLocaleString('id-ID') : ''}
                  onChange={(e) => setTargetAmountInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="15.000.000"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Tanggal Tercapai
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Warna Kartu
                </label>
                <div className="flex items-center gap-2">
                  {['#2563EB', '#16A34A', '#EC4899', '#8B5CF6', '#F59E0B', '#0284C7'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-blue-500' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD DEPOSIT */}
      {showDepositModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Setor ke: {selectedGoal.name}
              </h2>
              <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeposit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nominal Setoran (Rp)
                </label>
                <input
                  type="text"
                  required
                  value={depositAmountInput ? parseInt(depositAmountInput, 10).toLocaleString('id-ID') : ''}
                  onChange={(e) => setDepositAmountInput(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Setoran
                </label>
                <input
                  type="text"
                  placeholder="cth: Tabungan gaji bulanan"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Catat Setoran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
