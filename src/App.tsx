import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { BottomNav } from './components/layout/BottomNav.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { TransactionList } from './components/transactions/TransactionList.tsx';
import { PartnerView } from './components/partner/PartnerView.tsx';
import { BudgetView } from './components/budget/BudgetView.tsx';
import { SavingsView } from './components/savings/SavingsView.tsx';
import { DebtsView } from './components/debts/DebtsView.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { ProfileView } from './components/profile/ProfileView.tsx';
import { TransactionModal } from './components/transactions/TransactionModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { AppLockGate } from './components/auth/AppLockGate.tsx';
import { Transaction } from './types/finance.ts';

function MainApp() {
  const { user, isAuthenticated, isAppLocked } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  // 1. If not authenticated, require Login / Register
  if (!isAuthenticated || !user) {
    return <AuthModal />;
  }

  // 2. If app is locked, require Password or PIN before entering page!
  if (isAppLocked) {
    return <AppLockGate />;
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={handleOpenAdd}
      />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenAddModal={handleOpenAdd}
        />

        {/* Scrollable Main Content Container */}
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {currentTab === 'dashboard' && (
              <DashboardView
                key={`dash-${refreshKey}-${user.id}`}
                userId={user.id}
                onOpenAddModal={handleOpenAdd}
                onSelectTab={setCurrentTab}
                onEditTransaction={handleEditTx}
              />
            )}

            {currentTab === 'transaksi' && (
              <TransactionList
                key={`tx-${refreshKey}-${user.id}`}
                userId={user.id}
                onOpenAddModal={handleOpenAdd}
                onEditTransaction={handleEditTx}
              />
            )}

            {currentTab === 'rekan' && (
              <PartnerView
                key={`rekan-${refreshKey}-${user.id}`}
                userId={user.id}
                onSelectTab={setCurrentTab}
                onEditTransaction={handleEditTx}
              />
            )}

            {currentTab === 'anggaran' && (
              <BudgetView
                key={`budget-${refreshKey}-${user.id}`}
                userId={user.id}
              />
            )}

            {currentTab === 'tabungan' && (
              <SavingsView
                key={`savings-${refreshKey}-${user.id}`}
                userId={user.id}
              />
            )}

            {currentTab === 'utang_piutang' && (
              <DebtsView
                key={`debts-${refreshKey}-${user.id}`}
                userId={user.id}
              />
            )}

            {currentTab === 'laporan' && (
              <ReportsView
                key={`reports-${refreshKey}-${user.id}`}
                userId={user.id}
              />
            )}

            {currentTab === 'profil' && (
              <ProfileView
                key={`profil-${refreshKey}-${user.id}`}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation with center (+) FAB */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={handleOpenAdd}
      />

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSaved={handleRefresh}
        userId={user.id}
        initialTransaction={editingTransaction}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
