export type TransactionType = 'income' | 'expense' | 'transfer' | 'savings';

export type PaymentMethod = 'cash' | 'transfer' | 'debit' | 'credit' | 'qris' | 'ewallet';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  password?: string;
  securityPin?: string; // 6-digit PIN for fast app unlocking
  isAppLockEnabled?: boolean;
  avatarUrl?: string;
  currency: string; // 'IDR', 'USD'
  createdAt: string;
}

export interface FinancialAccount {
  id: string;
  userId: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'investment';
  accountNumber?: string;
  balance: number;
  color: string;
  icon: string;
}

export interface Category {
  id: string;
  userId?: string; // undefined if default system category
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  accountId: string; // source account
  toAccountId?: string; // for transfer
  paymentMethod: PaymentMethod;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  monthlyLimit: number;
  month: string; // YYYY-MM
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  notes?: string;
  color: string;
  deposits: {
    id: string;
    amount: number;
    date: string;
    note?: string;
  }[];
}

export interface Debt {
  id: string;
  userId: string;
  type: 'debt' | 'receivable'; // debt = utang saya, receivable = piutang
  personName: string;
  amount: number;
  paidAmount: number;
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  notes?: string;
  status: 'unpaid' | 'partial' | 'paid';
  installments: {
    id: string;
    amount: number;
    date: string;
    note?: string;
  }[];
}

export interface SharingPermissions {
  shareBalance: boolean;
  shareIncome: boolean;
  shareExpense: boolean;
  shareSavings: boolean;
  shareDebts: boolean;
  shareTransactions: boolean;
  shareReports: boolean;
}

export interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  // Permissions set by each party
  requesterPermissions: SharingPermissions;
  receiverPermissions: SharingPermissions;
}

export type PeriodFilter = 'today' | 'this_week' | 'this_month' | 'last_3_months' | 'this_year' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}
