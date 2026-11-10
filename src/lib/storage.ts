import {
  UserProfile,
  FinancialAccount,
  Category,
  Transaction,
  Budget,
  SavingsGoal,
  Debt,
  Friendship,
  SharingPermissions
} from '../types/finance.ts';

// Storage keys
const USERS_KEY = 'mitra_keuangan_users';
const CURRENT_USER_ID_KEY = 'mitra_keuangan_current_user_id';
const ACCOUNTS_KEY = 'mitra_keuangan_accounts';
const CATEGORIES_KEY = 'mitra_keuangan_categories';
const TRANSACTIONS_KEY = 'mitra_keuangan_transactions';
const BUDGETS_KEY = 'mitra_keuangan_budgets';
const SAVINGS_KEY = 'mitra_keuangan_savings';
const DEBTS_KEY = 'mitra_keuangan_debts';
const FRIENDSHIPS_KEY = 'mitra_keuangan_friendships';

export const DEFAULT_SHARING_PERMISSIONS: SharingPermissions = {
  shareBalance: true,
  shareIncome: true,
  shareExpense: true,
  shareSavings: true,
  shareDebts: true,
  shareTransactions: true,
  shareReports: true,
};

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'userId'>[] = [
  { id: 'cat-in-1', name: 'Gaji', type: 'income', icon: 'Briefcase', color: '#16A34A' },
  { id: 'cat-in-2', name: 'Bisnis', type: 'income', icon: 'TrendingUp', color: '#2563EB' },
  { id: 'cat-in-3', name: 'Freelance', type: 'income', icon: 'Laptop', color: '#0D9488' },
  { id: 'cat-in-4', name: 'Investasi', type: 'income', icon: 'PieChart', color: '#8B5CF6' },
  { id: 'cat-in-5', name: 'Bonus', type: 'income', icon: 'Award', color: '#F59E0B' },
  { id: 'cat-in-6', name: 'Hadiah', type: 'income', icon: 'Gift', color: '#EC4899' },
  { id: 'cat-in-7', name: 'Pemasukan Lainnya', type: 'income', icon: 'PlusCircle', color: '#64748B' },
];

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'userId'>[] = [
  { id: 'cat-ex-1', name: 'Makanan & Minuman', type: 'expense', icon: 'Utensils', color: '#EF4444' },
  { id: 'cat-ex-2', name: 'Transportasi', type: 'expense', icon: 'Car', color: '#F97316' },
  { id: 'cat-ex-3', name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#EC4899' },
  { id: 'cat-ex-4', name: 'Tagihan & Utilitas', type: 'expense', icon: 'FileText', color: '#6366F1' },
  { id: 'cat-ex-5', name: 'Kesehatan', type: 'expense', icon: 'HeartPulse', color: '#10B981' },
  { id: 'cat-ex-6', name: 'Pendidikan', type: 'expense', icon: 'GraduationCap', color: '#0284C7' },
  { id: 'cat-ex-7', name: 'Hiburan', type: 'expense', icon: 'Film', color: '#8B5CF6' },
  { id: 'cat-ex-8', name: 'Kebutuhan Rumah', type: 'expense', icon: 'Home', color: '#D97706' },
  { id: 'cat-ex-9', name: 'Langganan', type: 'expense', icon: 'Repeat', color: '#059669' },
  { id: 'cat-ex-10', name: 'Pengeluaran Lainnya', type: 'expense', icon: 'MoreHorizontal', color: '#64748B' },
];

// Seed initial state if empty
export function initializeStorage() {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    const user1: UserProfile = {
      id: 'usr-1',
      username: 'aditya',
      fullName: 'Aditya Baskara',
      email: 'adityabaskara3679@gmail.com',
      password: 'password123',
      securityPin: '123456',
      isAppLockEnabled: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      currency: 'IDR',
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    const user2: UserProfile = {
      id: 'usr-2',
      username: 'sarah',
      fullName: 'Sarah Amalia',
      email: 'sarah.amalia@partner.id',
      password: 'password123',
      securityPin: '123456',
      isAppLockEnabled: true,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      currency: 'IDR',
      createdAt: '2026-01-05T00:00:00.000Z',
    };

    const users = [user1, user2];
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_ID_KEY, user1.id);

    // Initial Accounts for Aditya
    const accounts: FinancialAccount[] = [
      { id: 'acc-1', userId: user1.id, name: 'BCA Utama', type: 'bank', accountNumber: '8830192831', balance: 14500000, color: '#2563EB', icon: 'CreditCard' },
      { id: 'acc-2', userId: user1.id, name: 'Dompet Tunai', type: 'cash', balance: 1250000, color: '#16A34A', icon: 'Wallet' },
      { id: 'acc-3', userId: user1.id, name: 'GoPay & OVO', type: 'ewallet', balance: 750000, color: '#0284C7', icon: 'Smartphone' },
      { id: 'acc-4', userId: user1.id, name: 'Bibit Reksadana', type: 'investment', balance: 10000000, color: '#8B5CF6', icon: 'TrendingUp' },

      // Accounts for Sarah
      { id: 'acc-5', userId: user2.id, name: 'Bank Mandiri', type: 'bank', accountNumber: '13700928374', balance: 9200000, color: '#1E40AF', icon: 'CreditCard' },
      { id: 'acc-6', userId: user2.id, name: 'Kas Tunai', type: 'cash', balance: 800000, color: '#16A34A', icon: 'Wallet' },
      { id: 'acc-7', userId: user2.id, name: 'ShopeePay', type: 'ewallet', balance: 450000, color: '#EA580C', icon: 'Smartphone' },
    ];
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

    // Categories
    const categories: Category[] = [
      ...DEFAULT_INCOME_CATEGORIES,
      ...DEFAULT_EXPENSE_CATEGORIES,
    ];
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));

    // Current date helpers for dynamic realistic 2026 dates
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const day = (d: number) => `${curYear}-${curMonth}-${String(d).padStart(2, '0')}`;

    // Transactions for Aditya
    const transactions: Transaction[] = [
      { id: 'tx-1', userId: user1.id, type: 'income', title: 'Gaji Bulanan', amount: 15000000, date: day(1), categoryId: 'cat-in-1', accountId: 'acc-1', paymentMethod: 'transfer', notes: 'Gaji pokok perusahan tech', createdAt: new Date().toISOString() },
      { id: 'tx-2', userId: user1.id, type: 'income', title: 'Proyek Desain Web', amount: 4500000, date: day(5), categoryId: 'cat-in-3', accountId: 'acc-1', paymentMethod: 'transfer', notes: 'Freelance redesign landing page', createdAt: new Date().toISOString() },
      { id: 'tx-3', userId: user1.id, type: 'expense', title: 'Belanja Bulanan Supermarket', amount: 1450000, date: day(2), categoryId: 'cat-ex-8', accountId: 'acc-1', paymentMethod: 'debit', notes: 'Bahan makanan & sabun', createdAt: new Date().toISOString() },
      { id: 'tx-4', userId: user1.id, type: 'expense', title: 'Makan Malam Restoran', amount: 350000, date: day(4), categoryId: 'cat-ex-1', accountId: 'acc-3', paymentMethod: 'qris', notes: 'Dinner bersama tim', createdAt: new Date().toISOString() },
      { id: 'tx-5', userId: user1.id, type: 'expense', title: 'Bensin & Tol', amount: 420000, date: day(6), categoryId: 'cat-ex-2', accountId: 'acc-2', paymentMethod: 'cash', notes: 'Isi Pertamax & saldo e-toll', createdAt: new Date().toISOString() },
      { id: 'tx-6', userId: user1.id, type: 'expense', title: 'Tagihan Listrik & WiFi', amount: 890000, date: day(7), categoryId: 'cat-ex-4', accountId: 'acc-1', paymentMethod: 'transfer', notes: 'PLN & Indihome', createdAt: new Date().toISOString() },
      { id: 'tx-7', userId: user1.id, type: 'expense', title: 'Langganan Netflix & Spotify', amount: 245000, date: day(8), categoryId: 'cat-ex-9', accountId: 'acc-3', paymentMethod: 'ewallet', notes: 'Family premium tier', createdAt: new Date().toISOString() },
      { id: 'tx-8', userId: user1.id, type: 'savings', title: 'Setor Target Laptop Baru', amount: 1500000, date: day(3), categoryId: 'cat-in-7', accountId: 'acc-1', paymentMethod: 'transfer', notes: 'Alokasi tabungan bulanan', createdAt: new Date().toISOString() },

      // Transactions for Sarah
      { id: 'tx-9', userId: user2.id, type: 'income', title: 'Gaji Kantor', amount: 11000000, date: day(1), categoryId: 'cat-in-1', accountId: 'acc-5', paymentMethod: 'transfer', notes: 'Gaji staf akunting', createdAt: new Date().toISOString() },
      { id: 'tx-10', userId: user2.id, type: 'income', title: 'Jual Kue & Dessert', amount: 1800000, date: day(6), categoryId: 'cat-in-2', accountId: 'acc-7', paymentMethod: 'ewallet', notes: 'Pesanan brownies hampers', createdAt: new Date().toISOString() },
      { id: 'tx-11', userId: user2.id, type: 'expense', title: 'Kebutuhan Rumah & Sayur', amount: 980000, date: day(2), categoryId: 'cat-ex-8', accountId: 'acc-5', paymentMethod: 'debit', notes: 'Belanja mingguan pasar & supermarket', createdAt: new Date().toISOString() },
      { id: 'tx-12', userId: user2.id, type: 'expense', title: 'Skincare & Make up', amount: 650000, date: day(4), categoryId: 'cat-ex-3', accountId: 'acc-7', paymentMethod: 'qris', notes: 'Sunscreen dan pelembab', createdAt: new Date().toISOString() },
      { id: 'tx-13', userId: user2.id, type: 'expense', title: 'Bensin Motor', amount: 120000, date: day(5), categoryId: 'cat-ex-2', accountId: 'acc-6', paymentMethod: 'cash', notes: 'Isi full tank', createdAt: new Date().toISOString() },
      { id: 'tx-14', userId: user2.id, type: 'savings', title: 'Tabungan Nikah & Rumah', amount: 2000000, date: day(3), categoryId: 'cat-in-7', accountId: 'acc-5', paymentMethod: 'transfer', notes: 'Tabungan bersama', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

    // Budgets for Aditya
    const budgets: Budget[] = [
      { id: 'bg-1', userId: user1.id, categoryId: 'cat-ex-1', monthlyLimit: 2500000, month: `${curYear}-${curMonth}` },
      { id: 'bg-2', userId: user1.id, categoryId: 'cat-ex-2', monthlyLimit: 1200000, month: `${curYear}-${curMonth}` },
      { id: 'bg-3', userId: user1.id, categoryId: 'cat-ex-4', monthlyLimit: 1500000, month: `${curYear}-${curMonth}` },
      { id: 'bg-4', userId: user1.id, categoryId: 'cat-ex-8', monthlyLimit: 2000000, month: `${curYear}-${curMonth}` },
      { id: 'bg-5', userId: user1.id, categoryId: 'cat-ex-7', monthlyLimit: 800000, month: `${curYear}-${curMonth}` },

      // Budgets for Sarah
      { id: 'bg-6', userId: user2.id, categoryId: 'cat-ex-1', monthlyLimit: 1800000, month: `${curYear}-${curMonth}` },
      { id: 'bg-7', userId: user2.id, categoryId: 'cat-ex-3', monthlyLimit: 1000000, month: `${curYear}-${curMonth}` },
      { id: 'bg-8', userId: user2.id, categoryId: 'cat-ex-8', monthlyLimit: 1500000, month: `${curYear}-${curMonth}` },
    ];
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));

    // Savings Goals
    const savings: SavingsGoal[] = [
      {
        id: 'svg-1',
        userId: user1.id,
        name: 'Target Beli MacBook Pro M3',
        targetAmount: 24000000,
        currentAmount: 12000000,
        targetDate: `${curYear}-12-31`,
        notes: 'Upgrade perangkat kerja software dev',
        color: '#2563EB',
        deposits: [
          { id: 'dep-1', amount: 5000000, date: `${curYear}-01-10`, note: 'Setoran awal tahun' },
          { id: 'dep-2', amount: 3500000, date: `${curYear}-02-15`, note: 'Bonus freelance' },
          { id: 'dep-3', amount: 3500000, date: day(3), note: 'Alokasi gaji bulanan' },
        ],
      },
      {
        id: 'svg-2',
        userId: user1.id,
        name: 'Dana Darurat 6 Bulan',
        targetAmount: 30000000,
        currentAmount: 18500000,
        targetDate: `${curYear}-10-30`,
        notes: 'Disimpan di instrumen likuid pasar uang',
        color: '#16A34A',
        deposits: [
          { id: 'dep-4', amount: 10000000, date: `${curYear}-01-01`, note: 'Saldo tabungan tahun lalu' },
          { id: 'dep-5', amount: 8500000, date: `${curYear}-02-28`, note: 'Top up dana darurat' },
        ],
      },
      // Sarah's Savings
      {
        id: 'svg-3',
        userId: user2.id,
        name: 'Dana Liburan ke Jepang',
        targetAmount: 25000000,
        currentAmount: 14000000,
        targetDate: `${curYear}-11-20`,
        notes: 'Tiket pesawat & penginapan Tokyo-Kyoto',
        color: '#EC4899',
        deposits: [
          { id: 'dep-6', amount: 8000000, date: `${curYear}-01-15`, note: 'Tabungan awal liburan' },
          { id: 'dep-7', amount: 6000000, date: day(3), note: 'Setoran bulan ini' },
        ],
      },
    ];
    localStorage.setItem(SAVINGS_KEY, JSON.stringify(savings));

    // Debts and Receivables
    const debts: Debt[] = [
      {
        id: 'dbt-1',
        userId: user1.id,
        type: 'receivable', // Piutang: Teman berhutang ke Aditya
        personName: 'Rian Pratama',
        amount: 2500000,
        paidAmount: 1000000,
        startDate: `${curYear}-02-01`,
        dueDate: `${curYear}-04-15`,
        notes: 'Pinjaman modal beli sparepart motor',
        status: 'partial',
        installments: [
          { id: 'ins-1', amount: 1000000, date: `${curYear}-02-28`, note: 'Transfer cicilan pertama' },
        ],
      },
      {
        id: 'dbt-2',
        userId: user1.id,
        type: 'debt', // Utang: Aditya berhutang cicilan elektronik
        personName: 'Toko Elektronik Megah',
        amount: 3600000,
        paidAmount: 2400000,
        startDate: `${curYear}-01-05`,
        dueDate: `${curYear}-05-05`,
        notes: 'Cicilan monitor 4K kerja (sisa 2 bulan)',
        status: 'partial',
        installments: [
          { id: 'ins-2', amount: 1200000, date: `${curYear}-01-20`, note: 'Cicilan 1' },
          { id: 'ins-3', amount: 1200000, date: `${curYear}-02-20`, note: 'Cicilan 2' },
        ],
      },
      // Sarah's Debts
      {
        id: 'dbt-3',
        userId: user2.id,
        type: 'receivable',
        personName: 'Dina Lestari',
        amount: 1500000,
        paidAmount: 1500000,
        startDate: `${curYear}-01-10`,
        dueDate: `${curYear}-02-28`,
        notes: 'Talangan beli tiket konser',
        status: 'paid',
        installments: [
          { id: 'ins-4', amount: 1500000, date: `${curYear}-02-25`, note: 'Lunas ditransfer BCA' },
        ],
      },
    ];
    localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));

    // Friendship between Aditya and Sarah
    const friendship: Friendship = {
      id: 'fr-1',
      requesterId: user1.id,
      receiverId: user2.id,
      status: 'accepted',
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-01-11T09:30:00.000Z',
      requesterPermissions: { ...DEFAULT_SHARING_PERMISSIONS },
      receiverPermissions: { ...DEFAULT_SHARING_PERMISSIONS },
    };
    localStorage.setItem(FRIENDSHIPS_KEY, JSON.stringify([friendship]));
  } else {
    // Ensure all existing users have passwords & pins
    try {
      const users: UserProfile[] = JSON.parse(existingUsers);
      let updated = false;
      users.forEach((u) => {
        if (!u.password) {
          u.password = 'password123';
          updated = true;
        }
        if (!u.securityPin) {
          u.securityPin = '123456';
          updated = true;
        }
        if (u.isAppLockEnabled === undefined) {
          u.isAppLockEnabled = true;
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    } catch {}
  }
}

// Data Getters and Setters
export function getAllUsers(): UserProfile[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_ID_KEY);
}

export function setCurrentUserId(userId: string) {
  localStorage.setItem(CURRENT_USER_ID_KEY, userId);
}

export function getCurrentUser(): UserProfile | null {
  const userId = getCurrentUserId();
  if (!userId) return null;
  const users = getAllUsers();
  return users.find((u) => u.id === userId) || users[0] || null;
}

export function saveUser(user: UserProfile) {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Accounts
export function getAccounts(userId: string): FinancialAccount[] {
  try {
    const list: FinancialAccount[] = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    return list.filter((a) => a.userId === userId);
  } catch {
    return [];
  }
}

export function saveAccount(account: FinancialAccount) {
  const list: FinancialAccount[] = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  const idx = list.findIndex((a) => a.id === account.id);
  if (idx >= 0) {
    list[idx] = account;
  } else {
    list.push(account);
  }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

export function deleteAccount(accountId: string) {
  const list: FinancialAccount[] = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  const filtered = list.filter((a) => a.id !== accountId);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(filtered));
}

// Categories
export function getCategories(userId?: string): Category[] {
  try {
    const list: Category[] = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
    return list.filter((c) => !c.userId || c.userId === userId);
  } catch {
    return [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];
  }
}

export function saveCategory(category: Category) {
  const list: Category[] = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
  const idx = list.findIndex((c) => c.id === category.id);
  if (idx >= 0) {
    list[idx] = category;
  } else {
    list.push(category);
  }
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
}

export function deleteCategory(categoryId: string) {
  const list: Category[] = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
  const filtered = list.filter((c) => c.id !== categoryId);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
}

// Transactions
export function getTransactions(userId: string): Transaction[] {
  try {
    const list: Transaction[] = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    return list
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

export function saveTransaction(tx: Transaction) {
  const list: Transaction[] = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  const idx = list.findIndex((t) => t.id === tx.id);
  const oldTx = idx >= 0 ? list[idx] : null;

  if (idx >= 0) {
    list[idx] = tx;
  } else {
    list.push(tx);
  }
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));

  // Recalculate account balances
  adjustAccountBalances(tx, oldTx);
}

export function deleteTransaction(txId: string) {
  const list: Transaction[] = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  const tx = list.find((t) => t.id === txId);
  if (tx) {
    // Revert balance
    revertAccountBalances(tx);
    const filtered = list.filter((t) => t.id !== txId);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
  }
}

function adjustAccountBalances(newTx: Transaction, oldTx: Transaction | null) {
  const accounts: FinancialAccount[] = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  
  // Revert old if edit
  if (oldTx) {
    const oldAcc = accounts.find((a) => a.id === oldTx.accountId);
    if (oldAcc) {
      if (oldTx.type === 'income') oldAcc.balance -= oldTx.amount;
      if (oldTx.type === 'expense' || oldTx.type === 'savings') oldAcc.balance += oldTx.amount;
      if (oldTx.type === 'transfer') {
        oldAcc.balance += oldTx.amount;
        if (oldTx.toAccountId) {
          const toAcc = accounts.find((a) => a.id === oldTx.toAccountId);
          if (toAcc) toAcc.balance -= oldTx.amount;
        }
      }
    }
  }

  // Apply new
  const targetAcc = accounts.find((a) => a.id === newTx.accountId);
  if (targetAcc) {
    if (newTx.type === 'income') targetAcc.balance += newTx.amount;
    if (newTx.type === 'expense' || newTx.type === 'savings') targetAcc.balance -= newTx.amount;
    if (newTx.type === 'transfer') {
      targetAcc.balance -= newTx.amount;
      if (newTx.toAccountId) {
        const toAcc = accounts.find((a) => a.id === newTx.toAccountId);
        if (toAcc) toAcc.balance += newTx.amount;
      }
    }
  }

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function revertAccountBalances(tx: Transaction) {
  const accounts: FinancialAccount[] = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  const acc = accounts.find((a) => a.id === tx.accountId);
  if (acc) {
    if (tx.type === 'income') acc.balance -= tx.amount;
    if (tx.type === 'expense' || tx.type === 'savings') acc.balance += tx.amount;
    if (tx.type === 'transfer') {
      acc.balance += tx.amount;
      if (tx.toAccountId) {
        const toAcc = accounts.find((a) => a.id === tx.toAccountId);
        if (toAcc) toAcc.balance -= tx.amount;
      }
    }
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
}

// Budgets
export function getBudgets(userId: string): Budget[] {
  try {
    const list: Budget[] = JSON.parse(localStorage.getItem(BUDGETS_KEY) || '[]');
    return list.filter((b) => b.userId === userId);
  } catch {
    return [];
  }
}

export function saveBudget(budget: Budget) {
  const list: Budget[] = JSON.parse(localStorage.getItem(BUDGETS_KEY) || '[]');
  const idx = list.findIndex((b) => b.id === budget.id);
  if (idx >= 0) {
    list[idx] = budget;
  } else {
    list.push(budget);
  }
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(list));
}

export function deleteBudget(budgetId: string) {
  const list: Budget[] = JSON.parse(localStorage.getItem(BUDGETS_KEY) || '[]');
  const filtered = list.filter((b) => b.id !== budgetId);
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(filtered));
}

// Savings Goals
export function getSavingsGoals(userId: string): SavingsGoal[] {
  try {
    const list: SavingsGoal[] = JSON.parse(localStorage.getItem(SAVINGS_KEY) || '[]');
    return list.filter((s) => s.userId === userId);
  } catch {
    return [];
  }
}

export function saveSavingsGoal(goal: SavingsGoal) {
  const list: SavingsGoal[] = JSON.parse(localStorage.getItem(SAVINGS_KEY) || '[]');
  const idx = list.findIndex((s) => s.id === goal.id);
  if (idx >= 0) {
    list[idx] = goal;
  } else {
    list.push(goal);
  }
  localStorage.setItem(SAVINGS_KEY, JSON.stringify(list));
}

export function deleteSavingsGoal(goalId: string) {
  const list: SavingsGoal[] = JSON.parse(localStorage.getItem(SAVINGS_KEY) || '[]');
  const filtered = list.filter((s) => s.id !== goalId);
  localStorage.setItem(SAVINGS_KEY, JSON.stringify(filtered));
}

// Debts
export function getDebts(userId: string): Debt[] {
  try {
    const list: Debt[] = JSON.parse(localStorage.getItem(DEBTS_KEY) || '[]');
    return list.filter((d) => d.userId === userId);
  } catch {
    return [];
  }
}

export function saveDebt(debt: Debt) {
  const list: Debt[] = JSON.parse(localStorage.getItem(DEBTS_KEY) || '[]');
  const idx = list.findIndex((d) => d.id === debt.id);
  if (idx >= 0) {
    list[idx] = debt;
  } else {
    list.push(debt);
  }
  localStorage.setItem(DEBTS_KEY, JSON.stringify(list));
}

export function deleteDebt(debtId: string) {
  const list: Debt[] = JSON.parse(localStorage.getItem(DEBTS_KEY) || '[]');
  const filtered = list.filter((d) => d.id !== debtId);
  localStorage.setItem(DEBTS_KEY, JSON.stringify(filtered));
}

// Friendships / Partner Connections
export function getFriendships(userId: string): Friendship[] {
  try {
    const list: Friendship[] = JSON.parse(localStorage.getItem(FRIENDSHIPS_KEY) || '[]');
    return list.filter((f) => f.requesterId === userId || f.receiverId === userId);
  } catch {
    return [];
  }
}

export function getActivePartner(userId: string): { partner: UserProfile; friendship: Friendship; myPermissions: SharingPermissions; partnerPermissions: SharingPermissions } | null {
  const friendships = getFriendships(userId);
  const active = friendships.find((f) => f.status === 'accepted');
  if (!active) return null;

  const partnerId = active.requesterId === userId ? active.receiverId : active.requesterId;
  const allUsers = getAllUsers();
  const partner = allUsers.find((u) => u.id === partnerId);
  if (!partner) return null;

  const isRequester = active.requesterId === userId;
  return {
    partner,
    friendship: active,
    myPermissions: isRequester ? active.requesterPermissions : active.receiverPermissions,
    partnerPermissions: isRequester ? active.receiverPermissions : active.requesterPermissions,
  };
}

export function saveFriendship(friendship: Friendship) {
  const list: Friendship[] = JSON.parse(localStorage.getItem(FRIENDSHIPS_KEY) || '[]');
  const idx = list.findIndex((f) => f.id === friendship.id);
  if (idx >= 0) {
    list[idx] = friendship;
  } else {
    list.push(friendship);
  }
  localStorage.setItem(FRIENDSHIPS_KEY, JSON.stringify(list));
}

export function deleteFriendship(friendshipId: string) {
  const list: Friendship[] = JSON.parse(localStorage.getItem(FRIENDSHIPS_KEY) || '[]');
  const filtered = list.filter((f) => f.id !== friendshipId);
  localStorage.setItem(FRIENDSHIPS_KEY, JSON.stringify(filtered));
}

// Formatting helpers
export function formatRupiah(amount: number, currency: string = 'IDR'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  return 'Rp' + Math.round(amount).toLocaleString('id-ID');
}

export function formatDateIndonesian(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
