import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  Users,
  FileSpreadsheet,
  Settings
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAddModal: () => void;
}

export function BottomNav({ currentTab, onSelectTab, onOpenAddModal }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transaksi', label: 'Transaksi', icon: Receipt },
    // Center button is handled separately
    { id: 'rekan', label: 'Rekan', icon: Users },
    { id: 'laporan', label: 'Laporan', icon: FileSpreadsheet },
    { id: 'profil', label: 'Profil', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-slate-200/80 bg-white/95 pb-safe backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95">
      <div className="relative mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex min-h-[44px] min-w-[48px] flex-col items-center justify-center transition-colors ${
            currentTab === 'dashboard'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] mt-1 tracking-tight">Dashboard</span>
        </button>

        {/* Tab 2: Transaksi */}
        <button
          onClick={() => onSelectTab('transaksi')}
          className={`flex min-h-[44px] min-w-[48px] flex-col items-center justify-center transition-colors ${
            currentTab === 'transaksi'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className="h-5 w-5" />
          <span className="text-[10px] mt-1 tracking-tight">Transaksi</span>
        </button>

        {/* Center Floating Action Button (+) */}
        <div className="relative -top-3 flex items-center justify-center">
          <button
            onClick={onOpenAddModal}
            aria-label="Tambah Transaksi"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#172554] via-blue-700 to-[#2563EB] text-white shadow-lg shadow-blue-600/40 active:scale-95 transition-transform"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Rekan */}
        <button
          onClick={() => onSelectTab('rekan')}
          className={`flex min-h-[44px] min-w-[48px] flex-col items-center justify-center transition-colors ${
            currentTab === 'rekan'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-[10px] mt-1 tracking-tight">Rekan</span>
        </button>

        {/* Tab 4: Laporan */}
        <button
          onClick={() => onSelectTab('laporan')}
          className={`flex min-h-[44px] min-w-[48px] flex-col items-center justify-center transition-colors ${
            currentTab === 'laporan'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="h-5 w-5" />
          <span className="text-[10px] mt-1 tracking-tight">Laporan</span>
        </button>

        {/* Tab 5: Profil */}
        <button
          onClick={() => onSelectTab('profil')}
          className={`flex min-h-[44px] min-w-[48px] flex-col items-center justify-center transition-colors ${
            currentTab === 'profil'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] mt-1 tracking-tight">Profil</span>
        </button>
      </div>
    </nav>
  );
}
