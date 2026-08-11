import React, { useState } from 'react';
import {
  Calendar,
  Building2,
  Users,
  PieChart as PieIcon,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Award,
  ChevronRight,
  Info,
  CalendarDays,
  Bookmark,
  CheckSquare,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { Laboratory, Booking, LabUsageStat } from '../types';
import { computeLabStats } from '../lib/supabase';
import { getAcademicYear } from '../lib/dateUtils';

interface Props {
  labs: Laboratory[];
  bookings: Booking[];
  onNavigateTab: (tab: any) => void;
  onSelectBookingDetail: (booking: Booking) => void;
  searchTerm: string;
}

export const DashboardView: React.FC<Props> = ({
  labs,
  bookings,
  onNavigateTab,
  onSelectBookingDetail,
  searchTerm
}) => {
  // Filter bookings by search
  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.requester_name.toLowerCase().includes(term) ||
      b.subject_name.toLowerCase().includes(term) ||
      b.subject_code.toLowerCase().includes(term) ||
      b.lab_name.toLowerCase().includes(term) ||
      b.faculty.toLowerCase().includes(term) ||
      b.department.toLowerCase().includes(term)
    );
  });

  // Calculate Key Numbers
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const inUseCount = bookings.filter((b) => b.status === 'in_use').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  // Lab usage stats
  const labStats: LabUsageStat[] = computeLabStats(labs, bookings);

  // Status color badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
            <Clock size={12} className="animate-spin" />
            <span>รอดำเนินการ (เหลือง)</span>
          </span>
        );
      case 'in_use':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
            <CheckCircle2 size={12} className="animate-pulse" />
            <span>กำลังใช้งาน (เขียว)</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50">
            <CheckCircle2 size={12} />
            <span>เสร็จสิ้น (แดง)</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-300 dark:border-teal-700/50">
            <CheckCircle2 size={12} />
            <span>อนุมัติแล้ว</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <AlertCircle size={12} />
            <span>ไม่อนุมัติ</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Top Banner & Quick Stat Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-700 rounded-2xl p-4 text-white shadow-lg shadow-teal-900/20 relative overflow-hidden border border-teal-600/40">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Calendar size={100} />
          </div>
          <p className="text-xs font-medium text-teal-100">การจองทั้งหมด</p>
          <p className="font-display text-2xl sm:text-3xl font-extrabold mt-1">{totalBookings} <span className="text-xs font-normal">รายการ</span></p>
          <p className="text-[10px] text-teal-200 mt-2 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>อัปเดตแบบเรียลไทม์</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs geometric-card">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">รอดำเนินการ</span>
            <Clock size={18} />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 pl-2">{pendingCount}</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 pl-2">สถานะ: สีเหลือง</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs geometric-card">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">กำลังใช้งาน</span>
            <CheckCircle2 size={18} />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 pl-2">{inUseCount}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 pl-2">สถานะ: สีเขียว</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs geometric-card">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">เสร็จสิ้นแล้ว</span>
            <CheckSquare size={18} />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 pl-2">{completedCount}</p>
          <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-2 pl-2">สถานะ: สีแดง</p>
        </div>

      </div>

      {/* Important Requirements Notice Box */}
      <div className="bg-gradient-to-br from-amber-50 via-amber-50/90 to-amber-100/60 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-amber-950 dark:text-amber-200 text-base sm:text-lg">
              เงื่อนไขสำคัญก่อนเข้าใช้ห้องปฏิบัติการพยาบาล
            </h3>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 mt-0.5">
              ข้อปฏิบัติและเงื่อนไขการตรวจรับอุปกรณ์ก่อนเริ่มใช้งานจริง
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
          <div className="p-4 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-amber-200/80 dark:border-amber-900/60 shadow-2xs space-y-2">
            <p className="font-medium text-slate-800 dark:text-slate-100 flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2"></span>
              <span>
                "ผู้ขอใช้ห้องต้องเข้าตรวจรับวัสดุสิ้นเปลือง อุปกรณ์การแพทย์ และครุภัณฑ์ ก่อนวันใช้งานอย่างน้อย <strong>7 วันทำการ</strong> (วันจันทร์-ศุกร์ เวลา 08.30-17.00 น. ยกเว้นวันหยุดราชการ) กับเจ้าหน้าที่ผู้รับผิดชอบห้องปฏิบัติการพยาบาล"
              </span>
            </p>
          </div>

          <div className="p-4 bg-rose-50/90 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 shadow-2xs">
            <p className="font-semibold text-rose-800 dark:text-rose-300 flex items-start gap-2.5 text-xs sm:text-sm">
              <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>
                "หากไม่ดำเนินการตรวจรับรายการดังกล่าว ให้ถือว่าเจ้าหน้าที่ไม่มีส่วนรับผิดชอบต่อความเสียหายหรือข้อผิดพลาดใด ๆ ที่เกิดขึ้น"
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table / Feed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <CalendarDays size={18} className="text-teal-600 dark:text-teal-400" />
              <span>ตารางรายการจองล่าสุด (Recent Bookings)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              กดที่รายการเพื่อดูรายละเอียดครุภัณฑ์ วัสดุอุปกรณ์ และเวลาใช้งาน
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('calendar')}
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>ดูปฏิทินทั้งหมด</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] rounded-xl border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">รหัสจอง</th>
                <th className="p-3">วันที่ & เวลา</th>
                <th className="p-3">ห้องปฏิบัติการ</th>
                <th className="p-3">รายวิชา / กิจกรรม</th>
                <th className="p-3">ผู้ขอใช้</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3 text-right">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                    ยังไม่มีข้อมูล
                  </td>
                </tr>
              ) : (
                filteredBookings.slice(0, 6).map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => onSelectBookingDetail(b)}
                    className="hover:bg-teal-50/50 dark:hover:bg-teal-950/20 cursor-pointer transition"
                  >
                    <td className="p-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                      {b.booking_code}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                        <span>{b.booking_date}</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 rounded-md border border-amber-300 dark:border-amber-700">
                          ปีการศึกษา {getAcademicYear(b.booking_date)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{b.start_time} - {b.end_time} น.</div>
                    </td>
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                      {b.lab_name}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                        {b.subject_code} - {b.subject_name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{b.activity_name}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{b.requester_name}</div>
                      <div className="text-[10px] text-slate-400">{b.department}</div>
                    </td>
                    <td className="p-3">{getStatusBadge(b.status)}</td>
                    <td className="p-3 text-right">
                      <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                        ดูข้อมูล
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Criteria Notice Box At Bottom of Dashboard */}
      <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-600/10 border border-teal-300 dark:border-teal-700/50 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-display font-bold text-sm">
          <Info size={20} className="text-teal-600 dark:text-teal-400 shrink-0" />
          <span>เกณฑ์การกำหนดคิดผลรวมของการจองห้องปฏิบัติการพยาบาล</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-teal-200 dark:border-teal-800/40 text-center">
            <span className="block font-display text-lg font-black text-emerald-600">100%</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">ใช้งาน &gt;= 5 วัน</span>
          </div>

          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-teal-200 dark:border-teal-800/40 text-center">
            <span className="block font-display text-lg font-black text-teal-600">80%</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">ใช้งาน 4 วัน</span>
          </div>

          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-teal-200 dark:border-teal-800/40 text-center">
            <span className="block font-display text-lg font-black text-amber-600">75%</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">ใช้งาน 3 วัน</span>
          </div>

          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-teal-200 dark:border-teal-800/40 text-center">
            <span className="block font-display text-lg font-black text-rose-600">70%</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">ใช้งาน 2 วัน</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
          * ระบบคำนวณและแสดงผลสรุป <strong className="text-slate-900 dark:text-white">รายสัปดาห์, รายเดือน, รายปี</strong> อัตโนมัติ พร้อมบันทึกประวัติย้อนหลังในฐานข้อมูล Supabase
        </p>
      </div>

    </div>
  );
};
