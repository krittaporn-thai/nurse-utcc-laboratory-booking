import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  BookOpen,
  X,
  Layers,
  CalendarDays,
  RotateCcw
} from 'lucide-react';
import { Laboratory, Booking } from '../types';
import { getAcademicYear, getAcademicYearPeriodText } from '../lib/dateUtils';

interface Props {
  labs: Laboratory[];
  bookings: Booking[];
  onSelectBookingDetail: (booking: Booking) => void;
  onNewBookingClick: () => void;
}

export const CalendarView: React.FC<Props> = ({
  labs,
  bookings,
  onSelectBookingDetail,
  onNewBookingClick
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedLabId, setSelectedLabId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper for Thai Month Names
  const monthNamesThai = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // Generate Year options (AD 2020-2035 / พ.ศ. 2563-2578)
  const yearsList = Array.from({ length: 16 }, (_, i) => 2020 + i);

  const prevMonth = () => {
    const newD = new Date(year, month - 1, 1);
    setCurrentDate(newD);
    const mStr = String(newD.getMonth() + 1).padStart(2, '0');
    setSelectedDateStr(`${newD.getFullYear()}-${mStr}-01`);
  };

  const nextMonth = () => {
    const newD = new Date(year, month + 1, 1);
    setCurrentDate(newD);
    const mStr = String(newD.getMonth() + 1).padStart(2, '0');
    setSelectedDateStr(`${newD.getFullYear()}-${mStr}-01`);
  };

  const handleMonthSelect = (mIndex: number) => {
    const newD = new Date(year, mIndex, 1);
    setCurrentDate(newD);
    const mStr = String(mIndex + 1).padStart(2, '0');
    setSelectedDateStr(`${year}-${mStr}-01`);
  };

  const handleYearSelect = (yVal: number) => {
    const newD = new Date(yVal, month, 1);
    setCurrentDate(newD);
    const mStr = String(month + 1).padStart(2, '0');
    setSelectedDateStr(`${yVal}-${mStr}-01`);
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDateStr(val);
    if (!val) return;
    const parts = val.split('-');
    if (parts.length === 3) {
      const yVal = parseInt(parts[0], 10);
      const mVal = parseInt(parts[1], 10) - 1;
      const dVal = parseInt(parts[2], 10);
      if (!isNaN(yVal) && !isNaN(mVal) && !isNaN(dVal)) {
        setCurrentDate(new Date(yVal, mVal, dVal));
      }
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (selectedLabId !== 'all' && b.lab_id !== selectedLabId) return false;
    if (selectedStatus !== 'all' && b.status !== selectedStatus) return false;
    return true;
  });

  // Helper to format date string YYYY-MM-DD
  const formatDayString = (dayNumber: number) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(dayNumber).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  // Render status badge style
  const getCalendarStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700/60';
      case 'in_use':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700/60';
      case 'completed':
        return 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-700/60';
      case 'approved':
        return 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700/60';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Calendar Header & Control Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon size={22} className="text-teal-600 dark:text-teal-400" />
              <span>ปฏิทินการจองห้องปฏิบัติการพยาบาล (Monthly Calendar)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
              <span>แสดงรายการจองห้องปฏิบัติการ</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 text-[11px] font-bold rounded-lg border border-amber-300 dark:border-amber-700">
                สังกัดปีการศึกษา {getAcademicYear(currentDate)} ({getAcademicYearPeriodText(getAcademicYear(currentDate))})
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={prevMonth}
              title="เดือนก่อนหน้า"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="font-extrabold text-sm sm:text-base text-teal-700 dark:text-teal-300 px-3 font-mono bg-teal-50 dark:bg-teal-950/50 py-1 rounded-xl border border-teal-200 dark:border-teal-800">
              {monthNamesThai[month]} พ.ศ. {year + 543}
            </span>

            <button
              onClick={nextMonth}
              title="เดือนถัดไป"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              <ChevronRight size={18} />
            </button>

            <button
              onClick={handleTodayClick}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <RotateCcw size={13} />
              <span>วันนี้</span>
            </button>
          </div>
        </div>

        {/* Date, Month, Year Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          
          {/* Month Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <CalendarIcon size={12} className="text-teal-600" />
              <span>เลือกเดือน:</span>
            </label>
            <select
              value={month}
              onChange={(e) => handleMonthSelect(parseInt(e.target.value, 10))}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {monthNamesThai.map((mName, idx) => (
                <option key={mName} value={idx}>
                  {idx + 1}. {mName}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <CalendarDays size={12} className="text-teal-600" />
              <span>เลือกปี (พ.ศ.):</span>
            </label>
            <select
              value={year}
              onChange={(e) => handleYearSelect(parseInt(e.target.value, 10))}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            >
              {yearsList.map((yVal) => (
                <option key={yVal} value={yVal}>
                  พ.ศ. {yVal + 543} ({yVal})
                </option>
              ))}
            </select>
          </div>

          {/* Direct Specific Date Selector */}
          <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <CalendarDays size={12} className="text-amber-600" />
              <span>ระบุเลือกวันที่/เดือน/ปี โดยตรง:</span>
            </label>
            <input
              type="date"
              value={selectedDateStr}
              onChange={handleDateInputChange}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>

        </div>

        {/* Filter Toolbar & Status Color Legends */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Lab & Status Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Filter size={14} />
              <span>กรองห้อง:</span>
            </div>

            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">ทุกห้องปฏิบัติการ ({labs.length} ห้อง)</option>
              {labs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code} - {l.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="pending">🟡 รอดำเนินการ (สีเหลือง)</option>
              <option value="in_use">🟢 กำลังใช้ (สีเขียว)</option>
              <option value="completed">🔴 เสร็จสิ้น (สีแดง)</option>
            </select>
          </div>

          {/* Status Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>รอดำเนินการ (ยังไม่ถึงเวลาจอง)</span>
            </span>

            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>กำลังใช้งาน (อยู่ในช่วงเวลาจอง)</span>
            </span>

            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 border border-rose-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>เสร็จสิ้น (สิ้นสุดช่วงเวลาจอง)</span>
            </span>
          </div>

        </div>

      </div>

      {/* Monthly Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs overflow-hidden">
        
        {/* Day Header Row */}
        <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-500 dark:text-slate-400 py-2 border-b border-slate-200 dark:border-slate-800">
          <div className="text-rose-500">อา.</div>
          <div>จ.</div>
          <div>อ.</div>
          <div>พ.</div>
          <div>พฤ.</div>
          <div>ศ.</div>
          <div className="text-teal-600 dark:text-teal-400">ส.</div>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 auto-rows-fr gap-1 sm:gap-2 mt-2">
          
          {/* Empty lead cells */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} className="min-h-[90px] sm:min-h-[110px] p-1 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl opacity-30"></div>
          ))}

          {/* Actual Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayStr = formatDayString(dayNum);
            const dayBookings = filteredBookings.filter((b) => b.booking_date === dayStr);

            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNum;

            const isSelected = selectedDateStr === dayStr;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => setSelectedDateStr(dayStr)}
                className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-xl border transition-all flex flex-col cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 dark:border-amber-500 ring-2 ring-amber-400/50 shadow-sm'
                    : isToday
                    ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-500 dark:border-teal-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center'
                        : isSelected
                        ? 'w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayBookings.length > 0 && (
                    <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-1.5 py-0.5 rounded-md">
                      {dayBookings.length} จอง
                    </span>
                  )}
                </div>

                {/* Day events badges */}
                <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar max-h-24">
                  {dayBookings.map((b) => (
                    <div
                      key={b.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBookingDetail(b);
                      }}
                      className={`p-1.5 rounded-xl border text-[10px] font-medium leading-tight cursor-pointer hover:scale-[1.02] transition shadow-xs ${getCalendarStatusStyle(
                        b.status
                      )}`}
                    >
                      <div className="font-bold truncate">{b.lab_name.split(' ')[0]}</div>
                      <div className="text-[9px] opacity-90 truncate font-mono">{b.start_time}-{b.end_time}</div>
                      <div className="truncate opacity-80">{b.subject_code}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
};

