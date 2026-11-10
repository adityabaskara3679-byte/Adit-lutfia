import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Users,
  PieChart,
  PiggyBank,
  Scale,
  FileSpreadsheet,
  Settings,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAddModal: () => void;
}

export function Sidebar({ currentTab, onSelectTab, onOpenAddModal }: SidebarProps) {
  const { lockApp } = useAuth();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transaksi', label: 'Transaksi', icon: Receipt },
    { id: 'rekan', label: 'Rekan (Partner)', icon: Users, isHighlight: true },
    { id: 'anggaran', label: 'Anggaran Bulanan', icon: PieChart },
    { id: 'tabungan', label: 'Target Tabungan', icon: PiggyBank },
    { id: 'utang_piutang', label: 'Utang & Piutang', icon: Scale },
    { id: 'laporan', label: 'Laporan Keuangan', icon: FileSpreadsheet },
    { id: 'profil', label: 'Profil & Pengaturan', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shrink-0">
      {/* Navigation List */}
      <div className="flex-1 space-y-1.5 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </div>
              {item.isHighlight && !isActive && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                  Partner
                </span>
              )}
            </button>
          );
        })}

        {/* Lock Screen Shortcut Button */}
        <button
          onClick={lockApp}
          className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors mt-2"
        >
          <Lock className="h-4 w-4" />
          <span>Kunci Layar</span>
        </button>
      </div>

      {/* Floating CTA Banner in Sidebar */}
      <div className="p-3">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 dark:border-blue-900/40 dark:from-blue-950/20 dark:to-slate-900">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold">Keuangan Bersama</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
            Hubungkan akun dengan rekan untuk melihat grafik & total saldo gabungan.
          </p>
          <button
            onClick={() => onSelectTab('rekan')}
            className="mt-3 w-full rounded-xl bg-blue-600 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Lihat Rekan
          </button>
        </div>
      </div>
    </aside>
  );
}
