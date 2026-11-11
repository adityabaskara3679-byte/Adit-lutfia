import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Trash2,
  Check,
  ArrowRightLeft,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  PaymentMethod,
  Category,
  FinancialAccount
} from '../../types/finance.ts';
import {
  getCategories,
  getAccounts,
  saveTransaction,
  deleteTransaction,
  formatRupiah
} from '../../lib/storage.ts';
import { pushUserDataToCloud } from '../../lib/cloudSync.ts';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId: string;
  initialTransaction?: Transaction | null;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSaved,
  userId,
  initialTransaction,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [amountInput, setAmountInput] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);

  useEffect(() => {
    if (isOpen) {
      const allCats = getCategories(userId);
      const userAccs = getAccounts(userId);
      setCategories(allCats);
      setAccounts(userAccs);

      if (initialTransaction) {
        setType(initialTransaction.type);
        setTitle(initialTransaction.title);
        setAmount(initialTransaction.amount);
        setAmountInput(initialTransaction.amount.toString());
        setDate(initialTransaction.date);
        setCategoryId(initialTransaction.categoryId);
        setAccountId(initialTransaction.accountId);
        setToAccountId(initialTransaction.toAccountId || '');
        setPaymentMethod(initialTransaction.paymentMethod);
        setNotes(initialTransaction.notes || '');
        setReceiptUrl(initialTransaction.receiptUrl);
      } else {
        // Defaults
        setType('expense');
        setTitle('');
        setAmount(0);
        setAmountInput('');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setReceiptUrl(undefined);
        setPaymentMethod('qris');

        // Pick first matching category
        const expCats = allCats.filter((c) => c.type === 'expense');
        setCategoryId(expCats[0]?.id || '');
        setAccountId(userAccs[0]?.id || '');
        setToAccountId(userAccs[1]?.id || '');
      }
    }
  }, [isOpen, initialTransaction, userId]);

  // Adjust categories when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const filtered = categories.filter((c) => c.type === (newType === 'income' ? 'income' : 'expense'));
    if (filtered.length > 0 && !filtered.some((c) => c.id === categoryId)) {
      setCategoryId(filtered[0].id);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10) || 0;
    setAmount(num);
    setAmountInput(raw);
  };

  const addQuickAmount = (delta: number) => {
    const next = amount + delta;
    setAmount(next);
    setAmountInput(next.toString());
  };

  // Receipt image upload / capture handler
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Mohon masukkan nama atau keterangan transaksi.');
      return;
    }
    if (amount <= 0) {
      alert('Nominal transaksi harus lebih dari 0.');
      return;
    }
    if (!accountId) {
      alert('Pilih akun atau sumber dana.');
      return;
    }

    const tx: Transaction = {
      id: initialTransaction ? initialTransaction.id : `tx-${Date.now()}`,
      userId,
      type,
      title: title.trim(),
      amount,
      date,
      categoryId: categoryId || 'cat-ex-10',
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      paymentMethod,
      notes: notes.trim(),
      receiptUrl,
      createdAt: initialTransaction ? initialTransaction.createdAt : new Date().toISOString(),
    };

    saveTransaction(tx);
    pushUserDataToCloud(userId);
    onSaved();
    onClose();
  };

  const handleDelete = () => {
    if (initialTransaction && confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      deleteTransaction(initialTransaction.id);
      pushUserDataToCloud(userId);
      onSaved();
      onClose();
    }
  };

  if (!isOpen) return null;

  const relevantCats = categories.filter((c) =>
    type === 'income' ? c.type === 'income' : c.type === 'expense'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {initialTransaction ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Isi rincian transaksi dengan mudah dan cepat
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Transaction Type Segmented Switcher */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-500'
              }`}
            >
              <TrendingDown className="h-4 w-4 mb-0.5" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-500'
              }`}
            >
              <TrendingUp className="h-4 w-4 mb-0.5" />
              <span>Pemasukan</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('transfer')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                type === 'transfer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-500'
              }`}
            >
              <ArrowRightLeft className="h-4 w-4 mb-0.5" />
              <span>Transfer</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('savings')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                type === 'savings'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-500'
              }`}
            >
              <PiggyBank className="h-4 w-4 mb-0.5" />
              <span>Tabungan</span>
            </button>
          </div>

          {/* Amount Display & Input */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nominal Transaksi (Rp)
            </label>
            <div className="relative mt-1 flex items-baseline">
              <span className="text-xl font-bold text-slate-400 mr-1.5">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={amountInput ? parseInt(amountInput, 10).toLocaleString('id-ID') : ''}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-transparent text-2xl font-extrabold text-slate-900 dark:text-white focus:outline-none tabular-nums placeholder-slate-300 dark:placeholder-slate-600"
              />
            </div>
            {/* Quick Amount Buttons */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[50000, 100000, 500000, 1000000, 5000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addQuickAmount(val)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  +{formatRupiah(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Title and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama / Keterangan
              </label>
              <input
                type="text"
                required
                placeholder="cth: Makan Siang, Gaji Kantor, Belanja"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category (if not transfer) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategori
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                {relevantCats.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accounts & Transfer Source/Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {type === 'transfer' ? 'Dari Akun' : 'Akun / Sumber Dana'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatRupiah(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ke Akun Tujuan
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatRupiah(acc.balance)})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="qris">QRIS</option>
                  <option value="transfer">Transfer Bank</option>
                  <option value="cash">Tunai (Cash)</option>
                  <option value="debit">Kartu Debit</option>
                  <option value="credit">Kartu Kredit</option>
                  <option value="ewallet">E-Wallet</option>
                </select>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="cth: Makan bersama keluarga, promo cashback"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Receipt Upload / Struk */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Bukti Transaksi / Foto Struk
            </label>
            <div className="flex items-center gap-3">
              {receiptUrl ? (
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 w-24 h-24 bg-slate-100">
                  <img
                    src={receiptUrl}
                    alt="Bukti Struk"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setReceiptUrl(undefined)}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-3 px-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <Camera className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Upload Foto Struk / Faktur
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
          {initialTransaction ? (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Check className="h-4 w-4" />
              <span>{initialTransaction ? 'Simpan Perubahan' : 'Catat Transaksi'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
