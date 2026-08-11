import React from 'react';
import {
  ShieldCheck,
  Search,
  UserCheck,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { StoryItem, Laboratory } from '../types';

interface Props {
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onLogoutAdmin: () => void;
  onOpenDbSettings?: () => void;
  onSelectStory?: (story: StoryItem) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onNewBookingClick: () => void;
  labs: Laboratory[];
  onSyncNow?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<Props> = ({
  isAdmin,
  onOpenAdminModal,
  onLogoutAdmin,
  onOpenDbSettings,
  onSelectStory,
  searchTerm,
  onSearchChange,
  onNewBookingClick,
  labs,
  onSyncNow,
  isSyncing = false
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 p-0.5 shadow-md shadow-teal-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <span className="font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-teal-400 via-emerald-300 to-teal-200 text-base">
                  NL
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight leading-tight">
                  NurseLab <span className="text-teal-600 dark:text-teal-400 font-bold">UTCC</span>
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 rounded-md border border-teal-200 dark:border-teal-800/60">
                  คณะพยาบาลศาสตร์
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden xs:block">
                ระบบจองห้องปฏิบัติการพยาบาล
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ค้นหาห้องแล็บ, รหัสวิชา, ผู้จอง..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 focus:border-teal-500 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>
          </div>

          {/* Action Tools & Admin Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Sync Now Button */}
            {onSyncNow && (
              <button
                onClick={onSyncNow}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition border border-slate-200 dark:border-slate-700 active:scale-95 disabled:opacity-60"
                title="รีเฟรช / ซิงค์ข้อมูลล่าสุด"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin text-teal-600 dark:text-teal-400' : ''} />
                <span className="hidden sm:inline">{isSyncing ? 'กำลังซิงค์...' : 'Sync Now'}</span>
              </button>
            )}

            {/* Quick New Booking Button */}
            <button
              onClick={onNewBookingClick}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-teal-600/20 transition active:scale-95"
            >
              <PlusCircle size={15} />
              <span>จองห้องทันที</span>
            </button>

            {/* Admin Switcher */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                <UserCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span className="hidden xs:inline">ADMIN (ผู้ดูแลระบบ)</span>
                <button
                  onClick={onLogoutAdmin}
                  className="ml-1 text-[10px] text-slate-500 hover:text-rose-600 underline"
                  title="ออกจากระบบ Admin"
                >
                  [ออก]
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white text-xs font-semibold rounded-full shadow-xs transition active:scale-95"
              >
                <ShieldCheck size={15} className="text-pink-400 dark:text-pink-600" />
                <span>เข้าสู่ระบบ ADMIN</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
