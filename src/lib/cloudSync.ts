import { supabase, isSupabaseConfigured } from './supabase.ts';
import {
  getAllUsers,
  getAccounts,
  getTransactions,
  getSavingsGoals,
  getDebts,
  saveUser,
  importPartnerFinancialData
} from './storage.ts';
import {
  UserProfile,
  FinancialAccount,
  Transaction,
  SavingsGoal,
  Debt
} from '../types/finance.ts';

// Push current user's local financial data to Supabase
export async function pushUserDataToCloud(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const users = getAllUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return false;

    // 1. Sync Profile
    await supabase.from('profiles').upsert({
      id: user.id,
      username: user.username,
      full_name: user.fullName,
      email: user.email,
      currency: user.currency || 'IDR',
      security_pin: user.securityPin || null,
      is_app_lock_enabled: user.isAppLockEnabled ?? true,
      updated_at: new Date().toISOString(),
    });

    // 2. Sync Accounts
    const accounts = getAccounts(userId);
    if (accounts.length > 0) {
      const formattedAccounts = accounts.map((a) => ({
        id: a.id,
        user_id: userId,
        name: a.name,
        type: a.type,
        account_number: a.accountNumber || null,
        balance: a.balance,
        color: a.color,
        icon: a.icon,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('accounts').upsert(formattedAccounts);
    }

    // 3. Sync Transactions
    const transactions = getTransactions(userId);
    if (transactions.length > 0) {
      const formattedTxs = transactions.map((t) => ({
        id: t.id,
        user_id: userId,
        type: t.type,
        title: t.title,
        amount: t.amount,
        date: t.date,
        category_id: t.categoryId || null,
        account_id: t.accountId || null,
        to_account_id: t.toAccountId || null,
        payment_method: t.paymentMethod,
        notes: t.notes || null,
        receipt_url: t.receiptUrl || null,
      }));
      await supabase.from('transactions').upsert(formattedTxs);
    }

    // 4. Sync Savings Goals
    const savings = getSavingsGoals(userId);
    if (savings.length > 0) {
      const formattedSavings = savings.map((s) => ({
        id: s.id,
        user_id: userId,
        name: s.name,
        target_amount: s.targetAmount,
        current_amount: s.currentAmount,
        target_date: s.targetDate,
        notes: s.notes || null,
        color: s.color,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('savings_goals').upsert(formattedSavings);
    }

    // 5. Sync Debts
    const debts = getDebts(userId);
    if (debts.length > 0) {
      const formattedDebts = debts.map((d) => ({
        id: d.id,
        user_id: userId,
        type: d.type,
        person_name: d.personName,
        amount: d.amount,
        paid_amount: d.paidAmount,
        start_date: d.startDate,
        due_date: d.dueDate,
        notes: d.notes || null,
        status: d.status,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('debts').upsert(formattedDebts);
    }

    return true;
  } catch (err) {
    console.error('Error syncing data to cloud:', err);
    return false;
  }
}

// Pull partner's live financial data from Supabase Cloud
export async function syncPartnerFromCloud(partnerId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    // 1. Fetch Profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', partnerId)
      .maybeSingle();

    if (!profileData) return false;

    const partnerProfile: UserProfile = {
      id: profileData.id,
      username: profileData.username,
      fullName: profileData.full_name || profileData.username,
      email: profileData.email,
      currency: profileData.currency || 'IDR',
      createdAt: profileData.created_at || new Date().toISOString(),
    };

    // 2. Fetch Accounts
    const { data: accountsData } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', partnerId);

    const partnerAccounts: FinancialAccount[] = (accountsData || []).map((a: any) => ({
      id: a.id,
      userId: partnerId,
      name: a.name,
      type: a.type,
      accountNumber: a.account_number || undefined,
      balance: Number(a.balance) || 0,
      color: a.color || '#2563EB',
      icon: a.icon || 'Wallet',
    }));

    // 3. Fetch Transactions
    const { data: txsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', partnerId);

    const partnerTransactions: Transaction[] = (txsData || []).map((t: any) => ({
      id: t.id,
      userId: partnerId,
      type: t.type,
      title: t.title,
      amount: Number(t.amount) || 0,
      date: t.date,
      categoryId: t.category_id || '',
      accountId: t.account_id || '',
      toAccountId: t.to_account_id || undefined,
      paymentMethod: t.payment_method || 'cash',
      notes: t.notes || undefined,
      receiptUrl: t.receipt_url || undefined,
      createdAt: t.created_at || t.date,
    }));

    // 4. Fetch Savings
    const { data: savingsData } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', partnerId);

    const partnerSavings: SavingsGoal[] = (savingsData || []).map((s: any) => ({
      id: s.id,
      userId: partnerId,
      name: s.name,
      targetAmount: Number(s.target_amount) || 0,
      currentAmount: Number(s.current_amount) || 0,
      targetDate: s.target_date,
      notes: s.notes || undefined,
      color: s.color || '#2563EB',
      deposits: [],
    }));

    // 5. Fetch Debts
    const { data: debtsData } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', partnerId);

    const partnerDebts: Debt[] = (debtsData || []).map((d: any) => ({
      id: d.id,
      userId: partnerId,
      type: d.type,
      personName: d.person_name,
      amount: Number(d.amount) || 0,
      paidAmount: Number(d.paid_amount) || 0,
      startDate: d.start_date,
      dueDate: d.due_date,
      notes: d.notes || undefined,
      status: d.status || 'unpaid',
      installments: [],
    }));

    // Save everything locally so all existing components work seamlessly!
    importPartnerFinancialData({
      profile: partnerProfile,
      accounts: partnerAccounts,
      transactions: partnerTransactions,
      savings: partnerSavings,
      debts: partnerDebts,
    });

    return true;
  } catch (err) {
    console.error('Error fetching partner data from cloud:', err);
    return false;
  }
}
