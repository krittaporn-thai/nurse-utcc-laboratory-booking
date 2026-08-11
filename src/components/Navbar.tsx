import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  CalendarPlus,
  CheckSquare,
  FileCheck2,
  PackageCheck,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'calendar'
  | 'labs'
  | 'booking'
  | 'approval'
  | 'pre_check'
  | 'post_check'
  | 'damage'
  | 'reports';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isAdmin: boolean;
  pendingApprovalCount: number;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  isAdmin,
  pendingApprovalCount
}) => {
  const mainNavItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar' as NavTab, label: 'ปฏิทินการจอง', icon: Calendar },
    { id: 'labs' as NavTab, label: 'ห้องปฏิบัติการ', icon: Building2 },
    { id: 'booking' as NavTab, label: 'จองห้องพยาบาล', icon: CalendarPlus, highlight: true },
    { id: 'reports' as NavTab, label: 'รายงานสถิติ', icon: BarChart3 }
  ];

  const adminNavItems = [
    {
      id: 'approval' as NavTab,
      label: 'อนุมัติการจอง',
      icon: CheckSquare,
      badge: pendingApprovalCount > 0 ? pendingApprovalCount : null
    },
    { id: 'pre_check' as NavTab, label: 'ตรวจรับก่อนใช้งาน', icon: FileCheck2 },
    { id: 'post_check' as NavTab, label: 'ตรวจรับหลังใช้งาน', icon: PackageCheck },
    { id: 'damage' as NavTab, label: 'บันทึกความเสียหาย', icon: AlertTriangle }
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800 min-h-[calc(100vh-100px)] p-4 space-y-6 sticky top-[110px] self-start">
        
        {/* Main Menu Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            เมนูหลัก
          </div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white shadow-md shadow-teal-700/20'
                      : item.highlight
                      ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/60'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-white' : item.highlight ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-white/80" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin Management Section - Visible ONLY when logged in as Admin */}
        {isAdmin && (
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={12} className="text-teal-500" />
                <span>ส่วนผู้ดูแลระบบ (ADMIN)</span>
              </span>
            </div>

            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white shadow-md shadow-teal-700/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

      </aside>

      {/* Mobile Instagram Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-2">
        <div className="flex items-center justify-around">
          
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              activeTab === 'dashboard' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] mt-0.5">หน้าแรก</span>
          </button>

          <button
            onClick={() => onTabChange('calendar')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              activeTab === 'calendar' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500'
            }`}
          >
            <Calendar size={20} />
            <span className="text-[10px] mt-0.5">ปฏิทิน</span>
          </button>

          {/* Floating Center Reservation Button */}
          <button
            onClick={() => onTabChange('booking')}
            className="flex flex-col items-center justify-center w-12 h-12 -mt-5 bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 text-white rounded-full shadow-lg shadow-teal-600/30 active:scale-95 transition"
          >
            <CalendarPlus size={22} />
          </button>

          <button
            onClick={() => onTabChange('labs')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              activeTab === 'labs' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500'
            }`}
          >
            <Building2 size={20} />
            <span className="text-[10px] mt-0.5">ห้องแล็บ</span>
          </button>

          <button
            onClick={() => onTabChange('reports')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              activeTab === 'reports' ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500'
            }`}
          >
            <BarChart3 size={20} />
            <span className="text-[10px] mt-0.5">รายงาน</span>
          </button>

        </div>
      </div>
    </>
  );
};
