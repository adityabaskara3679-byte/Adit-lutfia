-- ==============================================================================
-- SKEMA DATABASE SUPABASE (POSTGRESQL) - APLIKASI MITRA KEUANGAN
-- ==============================================================================
-- Jalankan skrip ini pada SQL Editor di Dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/_/sql

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL PROFIL PENGGUNA (PROFILES)
-- Terhubung langsung dengan auth.users bawaan Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    security_pin VARCHAR(6) DEFAULT NULL,
    is_app_lock_enabled BOOLEAN DEFAULT TRUE,
    avatar_url TEXT DEFAULT NULL,
    currency VARCHAR(10) DEFAULT 'IDR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL REKENING / SUMBER DANA (ACCOUNTS)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'ewallet', 'investment')),
    account_number TEXT DEFAULT NULL,
    balance NUMERIC(15, 2) DEFAULT 0.00,
    color VARCHAR(20) DEFAULT '#2563EB',
    icon VARCHAR(50) DEFAULT 'Wallet',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL KATEGORI KEUANGAN (CATEGORIES)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL jika kategori bawaan sistem
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50) DEFAULT 'Tag',
    color VARCHAR(20) DEFAULT '#2563EB',
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL TRANSAKSI (TRANSACTIONS)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'savings')),
    title TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL, -- jika transfer
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'debit', 'credit', 'qris', 'ewallet')),
    notes TEXT DEFAULT NULL,
    receipt_url TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL ANGGARAN BULANAN (BUDGETS)
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    monthly_limit NUMERIC(15, 2) NOT NULL CHECK (monthly_limit >= 0),
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM (misal: 2026-11)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category_id, month)
);

-- 7. TABEL TARGET TABUNGAN (SAVINGS_GOALS)
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(15, 2) DEFAULT 0.00,
    target_date DATE NOT NULL,
    notes TEXT DEFAULT NULL,
    color VARCHAR(20) DEFAULT '#2563EB',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABEL RIWAYAT SETORAN TABUNGAN (SAVINGS_DEPOSITS)
CREATE TABLE IF NOT EXISTS public.savings_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    savings_goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABEL UTANG & PIUTANG (DEBTS)
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('debt', 'receivable')), -- debt = utang saya, receivable = piutang
    person_name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    paid_amount NUMERIC(15, 2) DEFAULT 0.00,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    notes TEXT DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABEL CICILAN / PEMBAYARAN UTANG (DEBT_INSTALLMENTS)
CREATE TABLE IF NOT EXISTS public.debt_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABEL KONEKSI REKAN / PASANGAN (FRIENDSHIPS)
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    requester_permissions JSONB DEFAULT '{"shareBalance": true, "shareIncome": true, "shareExpense": true, "shareSavings": true, "shareDebts": true, "shareTransactions": true, "shareReports": true}',
    receiver_permissions JSONB DEFAULT '{"shareBalance": true, "shareIncome": true, "shareExpense": true, "shareSavings": true, "shareDebts": true, "shareTransactions": true, "shareReports": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_id, receiver_id)
);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) - PERLINDUNGAN AKSES DATA
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- POLICIES: PROFILES
CREATE POLICY "Users can view and update their own profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = id);

-- POLICIES: ACCOUNTS
CREATE POLICY "Users can manage their own accounts"
    ON public.accounts FOR ALL
    USING (auth.uid() = user_id);

-- POLICIES: CATEGORIES
CREATE POLICY "Users can view default categories or own custom categories"
    ON public.categories FOR SELECT
    USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage their custom categories"
    ON public.categories FOR ALL
    USING (auth.uid() = user_id);

-- POLICIES: TRANSACTIONS
CREATE POLICY "Users can manage their own transactions"
    ON public.transactions FOR ALL
    USING (auth.uid() = user_id);

-- POLICIES: BUDGETS
CREATE POLICY "Users can manage their own budgets"
    ON public.budgets FOR ALL
    USING (auth.uid() = user_id);

-- POLICIES: SAVINGS
CREATE POLICY "Users can manage their own savings goals"
    ON public.savings_goals FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage savings deposits"
    ON public.savings_deposits FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.savings_goals sg
        WHERE sg.id = savings_deposits.savings_goal_id AND sg.user_id = auth.uid()
    ));

-- POLICIES: DEBTS
CREATE POLICY "Users can manage their own debts"
    ON public.debts FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage debt installments"
    ON public.debt_installments FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.debts d
        WHERE d.id = debt_installments.debt_id AND d.user_id = auth.uid()
    ));

-- POLICIES: FRIENDSHIPS
CREATE POLICY "Users can view and manage their friendships"
    ON public.friendships FOR ALL
    USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- ==============================================================================
-- 11. TRIGGER OTOMATIS: BUAT PROFIL SAAT REGISTRASI SUPABASE AUTH
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email
    );

    -- Buat akun default (Kas Tunai & Rekening Utama)
    INSERT INTO public.accounts (user_id, name, type, balance, color, icon)
    VALUES
        (NEW.id, 'Uang Tunai (Cash)', 'cash', 0, '#16A34A', 'Banknote'),
        (NEW.id, 'Rekening Bank Utama', 'bank', 0, '#2563EB', 'Building2');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SELESAI! Skema database siap digunakan.
