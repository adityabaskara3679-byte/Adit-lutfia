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
  // Always ensure default categories are present
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    const categories: Category[] = [
      ...DEFAULT_INCOME_CATEGORIES,
      ...DEFAULT_EXPENSE_CATEGORIES,
    ];
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }

  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
    localStorage.removeItem(CURRENT_USER_ID_KEY);
    if (!localStorage.getItem(ACCOUNTS_KEY)) localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(TRANSACTIONS_KEY)) localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(BUDGETS_KEY)) localStorage.setItem(BUDGETS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(SAVINGS_KEY)) localStorage.setItem(SAVINGS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(DEBTS_KEY)) localStorage.setItem(DEBTS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(FRIENDSHIPS_KEY)) localStorage.setItem(FRIENDSHIPS_KEY, JSON.stringify([]));
  } else {
    // Purge demo users (usr-1 and usr-2) and their demo data if still stored
    try {
      const users: UserProfile[] = JSON.parse(existingUsers);
      const cleaned = users.filter((u) => u.id !== 'usr-1' && u.id !== 'usr-2');
      if (cleaned.length !== users.length) {
        localStorage.setItem(USERS_KEY, JSON.stringify(cleaned));
        const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
        if (currentId === 'usr-1' || currentId === 'usr-2') {
          if (cleaned.length > 0) {
            localStorage.setItem(CURRENT_USER_ID_KEY, cleaned[0].id);
          } else {
            localStorage.removeItem(CURRENT_USER_ID_KEY);
          }
        }

        // Clean demo accounts
        const accounts: FinancialAccount[] = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts.filter((a) => a.userId !== 'usr-1' && a.userId !== 'usr-2')));

        // Clean demo transactions
        const transactions: Transaction[] = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions.filter((t) => t.userId !== 'usr-1' && t.userId !== 'usr-2')));

        // Clean demo budgets
        const budgets: Budget[] = JSON.parse(localStorage.getItem(BUDGETS_KEY) || '[]');
        localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets.filter((b) => b.userId !== 'usr-1' && b.userId !== 'usr-2')));

        // Clean demo savings
        const savings: SavingsGoal[] = JSON.parse(localStorage.getItem(SAVINGS_KEY) || '[]');
        localStorage.setItem(SAVINGS_KEY, JSON.stringify(savings.filter((s) => s.userId !== 'usr-1' && s.userId !== 'usr-2')));

        // Clean demo debts
        const debts: Debt[] = JSON.parse(localStorage.getItem(DEBTS_KEY) || '[]');
        localStorage.setItem(DEBTS_KEY, JSON.stringify(debts.filter((d) => d.userId !== 'usr-1' && d.userId !== 'usr-2')));

        // Clean demo friendships
        const friendships: Friendship[] = JSON.parse(localStorage.getItem(FRIENDSHIPS_KEY) || '[]');
        localStorage.setItem(FRIENDSHIPS_KEY, JSON.stringify(friendships.filter((f) => f.requesterId !== 'usr-1' && f.receiverId !== 'usr-1' && f.requesterId !== 'usr-2' && f.receiverId !== 'usr-2')));
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

// Bulk import/sync partner's real financial data into local storage
export function importPartnerFinancialData(data: {
  profile: UserProfile;
  accounts?: FinancialAccount[];
  transactions?: Transaction[];
  savings?: SavingsGoal[];
  debts?: Debt[];
}) {
  const partnerId = data.profile.id;

  // 1. Save partner profile
  saveUser(data.profile);

  // 2. Save/merge accounts
  if (data.accounts && Array.isArray(data.accounts)) {
    const list: FinancialAccount[] = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    const otherAccounts = list.filter((a) => a.userId !== partnerId);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...otherAccounts, ...data.accounts]));
  }

  // 3. Save/merge transactions
  if (data.transactions && Array.isArray(data.transactions)) {
    const list: Transaction[] = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    const otherTxs = list.filter((t) => t.userId !== partnerId);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([...otherTxs, ...data.transactions]));
  }

  // 4. Save/merge savings
  if (data.savings && Array.isArray(data.savings)) {
    const list: SavingsGoal[] = JSON.parse(localStorage.getItem(SAVINGS_KEY) || '[]');
    const otherSavings = list.filter((s) => s.userId !== partnerId);
    localStorage.setItem(SAVINGS_KEY, JSON.stringify([...otherSavings, ...data.savings]));
  }

  // 5. Save/merge debts
  if (data.debts && Array.isArray(data.debts)) {
    const list: Debt[] = JSON.parse(localStorage.getItem(DEBTS_KEY) || '[]');
    const otherDebts = list.filter((d) => d.userId !== partnerId);
    localStorage.setItem(DEBTS_KEY, JSON.stringify([...otherDebts, ...data.debts]));
  }
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
