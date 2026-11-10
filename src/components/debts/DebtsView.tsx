import React, { useState, useMemo } from 'react';
import {
  Scale,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Trash2
} from 'lucide-react';
import { Debt } from '../../types/finance.ts';
import {
  getDebts,
  saveDebt,
  deleteDebt,
  formatRupiah,
  formatDateIndonesian
} from '../../lib/storage.ts';

interface DebtsViewProps {
  userId: string;
}

export function DebtsView({ userId }: DebtsViewProps) {
  const [filterType, setFilterType] = useState<'all' | 'debt' | 'receivable'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  // Form State
  const [type, setType] = useState<'debt' | 'receivable'>('debt');
  const [personName, setPersonName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Installment Form State
  const [installmentAmountInput, setInstallmentAmountInput] = useState('');
  const [installmentNote, setInstallmentNote] = useState('');

  const debts = useMemo(() => getDebts(userId), [userId, showModal, showInstallmentModal]);

  // Calculations
  const { totalDebtRemaining, totalReceivableRemaining } = useMemo(() => {
    let dRemaining = 0;
    let rRemaining = 0;

    debts.forEach((d) => {
      const rem = Math.max(0, d.amount - d.paidAmount);
      if (d.type === 'debt') dRemaining += rem;
      else rRemaining += rem;
    });

    return { totalDebtRemaining: dRemaining, totalReceivableRemaining: rRemaining };
  }, [debts]);

  const filteredDebts = useMemo(() => {
    if (filterType === 'all') return debts;
    return debts.filter((d) => d.type === filterType);
  }, [debts, filterType]);

  const handleOpenNew = () => {
    setSelectedDebt(null);
    setType('debt');
    setPersonName('');
    setAmountInput('1000000');
    setStartDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setNotes('');
    setShowModal(true);
  };

  const handleOpenInstallment = (debt: Debt) => {
    setSelectedDebt(debt);
    const rem = Math.max(0, debt.amount - debt.paidAmount);
    setInstallmentAmountInput(rem.toString());
    setInstallmentNote('Pembayaran cicilan');
    setShowInstallmentModal(true);
  };

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountInput.replace(/[^0-9]/g, ''), 10) || 0;
    if (!personName.trim() || amount <= 0) {
      alert('Mohon isi nama pihak dan nominal yang valid.');
      return;
    }

    const d: Debt = {
      id: selectedDebt ? selectedDebt.id : `dbt-${Date.now()}`,
      userId,
      type,
      personName: personName.trim(),
      amount,
      paidAmount: selectedDebt ? selectedDebt.paidAmount : 0,
      startDate: startDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
      status: selectedDebt ? selectedDebt.status : 'unpaid',
      installments: selectedDebt ? selectedDebt.installments : [],
    };

    saveDebt(d);
    setShowModal(false);
  };

  const handleSaveInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt) return;
    const amount = parseInt(installmentAmountInput.replace(/[^0-9]/g, ''), 10) || 0;
    if (amount <= 0) {
      alert('Nominal cicilan harus lebih dari 0.');
      return;
    }

    const newPaid = selectedDebt.paidAmount + amount;
    const isPaidInFull = newPaid >= selectedDebt.amount;

    const updated: Debt = {
      ...selectedDebt,
      paidAmount: newPaid,
      status: isPaidInFull ? 'paid' : 'partial',
      installments: [
        {
          id: `ins-${Date.now()}`,
          amount,
          date: new Date().toISOString().split('T')[0],
          note: installmentNote.trim(),
        },
        ...selectedDebt.installments,
      ],
    };

    saveDebt(updated);
    setShowInstallmentModal(false);
  };

  const handleDeleteDebt = (id: string) => {
    if (confirm('Hapus catatan ini?')) {
      deleteDebt(id);
      setShowModal(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pencatatan Utang & Piutang
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pantau kewajiban utang Anda dan piutang uang yang dipinjam oleh pihak lain.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Catatan</span>
        </button>
      </div>

      {/* KPI Cards: Total Utang vs Total Piutang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Utang Saya (Hutang yang harus saya bayar) */}
        <div className="p-5 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Total Utang Saya (Kewajiban)
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
            {formatRupiah(totalDebtRemaining)}
          </p>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Kewajiban yang belum dilunasi kepada pihak lain
          </p>
        </div>

        {/* Piutang (Uang saya di pihak lain) */}
        <div className="p-5 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Total Piutang Saya (Aset Tagihan)
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatRupiah(totalReceivableRemaining)}
          </p>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Uang Anda yang belum dikembalikan oleh pihak lain
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            filterType === 'all'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setFilterType('debt')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            filterType === 'debt'
              ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-700 dark:text-rose-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Utang Saya
        </button>
        <button
          onClick={() => setFilterType('receivable')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            filterType === 'receivable'
              ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Piutang Saya
        </button>
      </div>

      {/* Debts List */}
      <div className="space-y-3">
        {filteredDebts.map((d) => {
          const isDebt = d.type === 'debt';
          const remaining = Math.max(0, d.amount - d.paidAmount);
          const isPaid = d.status === 'paid' || remaining === 0;

          return (
            <div
              key={d.id}
              className="p-5 rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${
                      isDebt ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  >
                    {isDebt ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {d.personName}
                      </h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isDebt
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}
                      >
                        {isDebt ? 'Utang' : 'Piutang'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Jatuh Tempo: {formatDateIndonesian(d.dueDate)} · Sejak: {formatDateIndonesian(d.startDate)}
                    </p>
                  </div>
                </div>

                {isPaid ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Lunas
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full">
                    <Clock className="h-3.5 w-3.5" /> {d.paidAmount > 0 ? 'Dibayar Sebagian' : 'Belum Dibayar'}
                  </span>
                )}
              </div>

              {d.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  "{d.notes}"
                </p>
              )}

              {/* Progress of Payment */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Total: {formatRupiah(d.amount)}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Sudah Dibayar: {formatRupiah(d.paidAmount)}
                </span>
                <span
                  className={`font-bold tabular-nums ${
                    isDebt ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  Sisa: {formatRupiah(remaining)}
                </span>
              </div>

              {/* Installment History Preview */}
              {d.installments && d.installments.length > 0 && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1 text-[11px]">
                  <p className="font-semibold text-slate-500">Riwayat Pembayaran:</p>
                  {d.installments.map((ins) => (
                    <div key={ins.id} className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>{formatDateIndonesian(ins.date)} ({ins.note || 'Cicilan'})</span>
                      <span className="font-bold text-emerald-600">{formatRupiah(ins.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleDeleteDebt(d.id)}
                  className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus</span>
                </button>

                {!isPaid && (
                  <button
                    onClick={() => handleOpenInstallment(d)}
                    className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    + Catat Cicilan / Bayar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT DEBT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Catat Utang / Piutang Baru
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDebt} className="mt-4 space-y-3">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('debt')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    type === 'debt' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Utang Saya (Hutang)
                </button>
                <button
                  type="button"
                  onClick={() => setType('receivable')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    type === 'receivable' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Piutang Saya (Tagihan)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pihak / Orang
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Rian, Bank, Toko Elektronik"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="text"
                  required
                  value={amountInput ? parseInt(amountInput, 10).toLocaleString('id-ID') : ''}
                  onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan / Catatan
                </label>
                <input
                  type="text"
                  placeholder="cth: Pinjaman modal, talangan belanja"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
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
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD INSTALLMENT */}
      {showInstallmentModal && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Catat Pembayaran / Cicilan
              </h2>
              <button onClick={() => setShowInstallmentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Pihak: <span className="font-bold text-slate-900 dark:text-white">{selectedDebt.personName}</span> (Sisa: {formatRupiah(Math.max(0, selectedDebt.amount - selectedDebt.paidAmount))})
            </p>

            <form onSubmit={handleSaveInstallment} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nominal Dibayar (Rp)
                </label>
                <input
                  type="text"
                  required
                  value={installmentAmountInput ? parseInt(installmentAmountInput, 10).toLocaleString('id-ID') : ''}
                  onChange={(e) => setInstallmentAmountInput(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Pembayaran
                </label>
                <input
                  type="text"
                  placeholder="cth: Transfer cicilan via BCA"
                  value={installmentNote}
                  onChange={(e) => setInstallmentNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInstallmentModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Simpan Cicilan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
