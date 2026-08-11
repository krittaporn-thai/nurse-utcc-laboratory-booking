/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  Building2,
  FileSpreadsheet,
  Download,
  Printer,
  Database,
  ShieldCheck,
  Package,
  Stethoscope,
  Bed,
  Layers,
  BookOpen,
  RefreshCw,
  Lock,
  Search,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { Laboratory, Booking } from '../types';
import { getAcademicYear, getAcademicYearPeriodText } from '../lib/dateUtils';
import {
  calculateWeeklyStats,
  calculateMonthlyStats,
  calculateYearlyStats,
  getMonthsForAcademicYear,
  WeeklyStatItem,
  MonthlyStatItem,
  YearlyStatItem
} from '../lib/statsUtils';
import {
  downloadCSV,
  downloadXLSX,
  downloadJSONBackup,
  openPrintWindow
} from '../lib/exportUtils';

interface Props {
  labs: Laboratory[];
  bookings: Booking[];
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
}

export const ACADEMIC_YEAR_OPTIONS = [2568, 2569, 2570, 2571];

export const getDynamicAcademicYears = (bookings: Booking[] = []) => {
  const currentAcademicYear = getAcademicYear(new Date());
  const yearsSet = new Set<number>([2568, 2569, 2570, 2571, currentAcademicYear]);
  bookings.forEach((b) => {
    if (b.booking_date) {
      yearsSet.add(getAcademicYear(b.booking_date));
    }
  });

  return Array.from(yearsSet)
    .sort((a, b) => a - b)
    .map((y) => ({
      yearBE: y,
      label: `ปีการศึกษา ${y}`,
      periodText: getAcademicYearPeriodText(y)
    }));
};

export const ReportsView: React.FC<Props> = ({ labs, bookings, isAdmin = false, onOpenAdminModal }) => {
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'yearly' | 'warehouse'>('weekly');

  // Academic Year Filter state (default: current academic year)
  const defaultYear = getAcademicYear(new Date());
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number>(defaultYear);
  const [selectedLabId, setSelectedLabId] = useState<string>('ALL');

  // Warehouse Filter State
  const [filterAcademicYear, setFilterAcademicYear] = useState<string>('ALL');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterWarehouseLabId, setFilterWarehouseLabId] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [warehouseSearch, setWarehouseSearch] = useState<string>('');

  const dynamicAcademicYears = useMemo(() => getDynamicAcademicYears(bookings), [bookings]);

  // Central Calculation Logic Calls
  const weeklyStats: WeeklyStatItem[] = useMemo(() => {
    return calculateWeeklyStats(bookings, selectedAcademicYear, selectedLabId);
  }, [bookings, selectedAcademicYear, selectedLabId]);

  const monthlyStats: MonthlyStatItem[] = useMemo(() => {
    return calculateMonthlyStats(bookings, selectedAcademicYear, selectedLabId);
  }, [bookings, selectedAcademicYear, selectedLabId]);

  const yearlyStat: YearlyStatItem = useMemo(() => {
    return calculateYearlyStats(bookings, selectedAcademicYear, selectedLabId);
  }, [bookings, selectedAcademicYear, selectedLabId]);

  // Comparison across all years
  const yearlyComparisonData = useMemo(() => {
    return dynamicAcademicYears.map((y) => {
      const stat = calculateYearlyStats(bookings, y.yearBE, selectedLabId);
      return {
        academicYear: y.yearBE,
        yearLabel: `ปีการศึกษา ${y.yearBE}`,
        periodText: y.periodText,
        averagePercentage: stat.averagePercentage
      };
    });
  }, [bookings, dynamicAcademicYears, selectedLabId]);

  // Guard file exports for Admin only
  const handleExportWithAdminCheck = (exportFn: () => void) => {
    if (!isAdmin) {
      if (onOpenAdminModal) {
        onOpenAdminModal();
      } else {
        alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่มีสิทธิ์จัดเก็บและส่งออกไฟล์ข้อมูล');
      }
      return;
    }
    exportFn();
  };

  // Render Export Action Bar
  const renderExportBar = (
    title: string,
    subtitle: string,
    onExportXlsx: () => void,
    onExportCsv: () => void,
    onExportPdf: () => void
  ) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h3>
            {isAdmin ? (
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                <ShieldCheck size={12} /> สิทธิ์ Admin ยืนยันแล้ว
              </span>
            ) : (
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                <Lock size={12} /> เฉพาะ Admin เท่านั้น
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleExportWithAdminCheck(onExportXlsx)}
            className={`px-3.5 py-2 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 ${
              isAdmin
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-100 hover:bg-amber-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
            }`}
          >
            {isAdmin ? <FileSpreadsheet size={15} /> : <Lock size={14} className="text-amber-600" />}
            <span>ดาวน์โหลด Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportWithAdminCheck(onExportCsv)}
            className={`px-3.5 py-2 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 ${
              isAdmin
                ? 'bg-slate-800 hover:bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-amber-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
            }`}
          >
            {isAdmin ? <Download size={15} /> : <Lock size={14} className="text-amber-600" />}
            <span>ดาวน์โหลด CSV (.csv)</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportWithAdminCheck(onExportPdf)}
            className={`px-3.5 py-2 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 ${
              isAdmin
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-slate-100 hover:bg-amber-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
            }`}
          >
            {isAdmin ? <Printer size={15} /> : <Lock size={14} className="text-amber-600" />}
            <span>พิมพ์ / ส่งออก PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {!isAdmin && (
        <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-amber-600 shrink-0" />
            <span>การเก็บและส่งออกไฟล์ข้อมูลรายงานเป็นสิทธิ์เฉพาะเจ้าหน้าที่ผู้ดูแลระบบ (Admin) เท่านั้น</span>
          </div>
          <button
            type="button"
            onClick={onOpenAdminModal}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shrink-0 transition flex items-center gap-1 shadow-xs"
          >
            <ShieldCheck size={13} />
            <span>เข้าสู่ระบบ Admin</span>
          </button>
        </div>
      )}
    </div>
  );

  // 1. EXPORT WEEKLY REPORT
  const handleExportWeekly = (format: 'xlsx' | 'csv' | 'pdf') => {
    const headers = [
      'ปีการศึกษา',
      'เดือนประจำรายงาน',
      'สัปดาห์ที่',
      'จำนวนวันใช้งานจริง (วัน)',
      'เปอร์เซ็นต์การใช้งาน (%)'
    ];

    const rows = weeklyStats.map((w) => [
      `ปีการศึกษา ${w.academicYear}`,
      `${w.monthName} ${w.yearBE}`,
      w.weekLabel,
      `${w.usedDaysCount} วัน`,
      `${w.percentage}%`
    ]);

    if (format === 'csv') {
      downloadCSV(`Weekly_Report_AcademicYear_${selectedAcademicYear}.csv`, headers, rows);
    } else if (format === 'xlsx') {
      const data = weeklyStats.map((w) => ({
        'ปีการศึกษา': `ปีการศึกษา ${w.academicYear}`,
        'เดือนประจำรายงาน': `${w.monthName} ${w.yearBE}`,
        'สัปดาห์ที่': w.weekLabel,
        'จำนวนวันใช้งานจริง (วัน)': w.usedDaysCount,
        'เปอร์เซ็นต์การใช้งาน (%)': w.percentage
      }));
      downloadXLSX(`Weekly_Report_AcademicYear_${selectedAcademicYear}.xlsx`, [
        { name: `รายสัปดาห์ ปีการศึกษา ${selectedAcademicYear}`, data }
      ]);
    } else {
      openPrintWindow(
        `รายงานสถิติการใช้งานห้องปฏิบัติการรายสัปดาห์ (ปีการศึกษา ${selectedAcademicYear})`,
        `ข้อมูลคำนวณตามปีการศึกษา ${selectedAcademicYear} (1 ส.ค. ${selectedAcademicYear} - 31 ก.ค. ${selectedAcademicYear + 1})`,
        [
          { label: 'ปีการศึกษา', value: `${selectedAcademicYear}` },
          { label: 'จำนวนสัปดาห์ทั้งหมด', value: `${weeklyStats.length} สัปดาห์` },
          { label: 'เปอร์เซ็นต์ใช้งานเฉลี่ย', value: `${yearlyStat.averagePercentage}%` }
        ],
        [{ title: 'รายละเอียดการใช้งานรายสัปดาห์ (Weekly Stats)', headers, rows }]
      );
    }
  };

  // 2. EXPORT MONTHLY REPORT
  const handleExportMonthly = (format: 'xlsx' | 'csv' | 'pdf') => {
    const headers = [
      'ปีการศึกษา',
      'ปี-เดือน (YearMonth)',
      'เดือนประจำปีการศึกษา',
      'เปอร์เซ็นต์รายสัปดาห์ในเดือน',
      'เปอร์เซ็นต์เฉลี่ยรายเดือน (%)'
    ];

    const rows = monthlyStats.map((m) => [
      `ปีการศึกษา ${m.academicYear}`,
      m.yearMonth,
      m.monthName,
      m.weeklyPercentages.map((p) => `${p}%`).join(', '),
      `${m.averagePercentage}%`
    ]);

    if (format === 'csv') {
      downloadCSV(`Monthly_Report_AcademicYear_${selectedAcademicYear}.csv`, headers, rows);
    } else if (format === 'xlsx') {
      const data = monthlyStats.map((m) => ({
        'ปีการศึกษา': `ปีการศึกษา ${m.academicYear}`,
        'ปี-เดือน': m.yearMonth,
        'เดือนประจำปีการศึกษา': m.monthName,
        'เปอร์เซ็นต์รายสัปดาห์': m.weeklyPercentages.map((p) => `${p}%`).join(', '),
        'เปอร์เซ็นต์เฉลี่ยรายเดือน (%)': m.averagePercentage
      }));
      downloadXLSX(`Monthly_Report_AcademicYear_${selectedAcademicYear}.xlsx`, [
        { name: `รายเดือน ปีการศึกษา ${selectedAcademicYear}`, data }
      ]);
    } else {
      openPrintWindow(
        `รายงานสถิติการใช้งานห้องปฏิบัติการรายเดือน (ปีการศึกษา ${selectedAcademicYear})`,
        `ข้อมูลคำนวณตามปีการศึกษา ${selectedAcademicYear} (1 ส.ค. ${selectedAcademicYear} - 31 ก.ค. ${selectedAcademicYear + 1})`,
        [
          { label: 'ปีการศึกษา', value: `${selectedAcademicYear}` },
          { label: 'จำนวนเดือนประจำปี', value: '12 เดือน' },
          { label: 'เปอร์เซ็นต์ใช้งานเฉลี่ยทั้งปี', value: `${yearlyStat.averagePercentage}%` }
        ],
        [{ title: 'รายละเอียดสรุปรายเดือน (Monthly Stats)', headers, rows }]
      );
    }
  };

  // 3. EXPORT YEARLY REPORT
  const handleExportYearly = (format: 'xlsx' | 'csv' | 'pdf') => {
    const headers = ['ปีการศึกษา', 'ช่วงเวลาปีการศึกษา', 'เปอร์เซ็นต์เฉลี่ยทั้งปี (%)'];

    const rows = yearlyComparisonData.map((y) => [
      `ปีการศึกษา ${y.academicYear}`,
      y.periodText,
      `${y.averagePercentage}%`
    ]);

    if (format === 'csv') {
      downloadCSV(`Yearly_Report_AcademicYear_${selectedAcademicYear}.csv`, headers, rows);
    } else if (format === 'xlsx') {
      const data = yearlyComparisonData.map((y) => ({
        'ปีการศึกษา': `ปีการศึกษา ${y.academicYear}`,
        'ช่วงเวลาปีการศึกษา': y.periodText,
        'เปอร์เซ็นต์เฉลี่ยทั้งปี (%)': y.averagePercentage
      }));
      downloadXLSX(`Yearly_Report_AcademicYear_${selectedAcademicYear}.xlsx`, [
        { name: 'เปรียบเทียบรายปีการศึกษา', data }
      ]);
    } else {
      openPrintWindow(
        `รายงานสถิติการใช้งานห้องปฏิบัติการรายปี (ปีการศึกษา ${selectedAcademicYear})`,
        `เปรียบเทียบเชิงสถิติรายปีการศึกษา (1 สิงหาคม - 31 กรกฎาคม)`,
        [
          { label: 'ปีการศึกษาที่เลือก', value: `${selectedAcademicYear}` },
          { label: 'อัตราการใช้งานปีการศึกษานี้', value: `${yearlyStat.averagePercentage}%` }
        ],
        [{ title: 'ตารางเปรียบเทียบสถิติรายปีการศึกษา (Yearly Stats)', headers, rows }]
      );
    }
  };

  // 4. DATA WAREHOUSE FILTERED RECORDS
  const filteredWarehouseBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!b.booking_date) return false;

      // Academic Year check
      if (filterAcademicYear !== 'ALL' && getAcademicYear(b.booking_date) !== Number(filterAcademicYear)) {
        return false;
      }

      // Date range check
      if (filterStartDate && b.booking_date < filterStartDate) return false;
      if (filterEndDate && b.booking_date > filterEndDate) return false;

      // Lab check
      if (filterWarehouseLabId !== 'ALL' && b.lab_id !== filterWarehouseLabId) return false;

      // Department check
      if (filterDepartment !== 'ALL' && b.department !== filterDepartment) return false;

      // Subject check
      if (filterSubject && !`${b.subject_code} ${b.subject_name}`.toLowerCase().includes(filterSubject.toLowerCase())) {
        return false;
      }

      // Search keyword
      if (warehouseSearch.trim()) {
        const q = warehouseSearch.toLowerCase();
        const textToSearch = `${b.booking_code} ${b.requester_name} ${b.subject_code} ${b.subject_name} ${b.lab_name} ${b.activity_name}`.toLowerCase();
        if (!textToSearch.includes(q)) return false;
      }

      return true;
    });
  }, [bookings, filterAcademicYear, filterStartDate, filterEndDate, filterWarehouseLabId, filterDepartment, filterSubject, warehouseSearch]);

  // EXPORT WAREHOUSE
  const handleExportWarehouse = (format: 'xlsx' | 'csv' | 'pdf') => {
    const headers = [
      'รหัสการจอง',
      'ผู้ขอใช้',
      'หน่วยงาน/คณะ',
      'ห้องปฏิบัติการ',
      'วันที่ใช้งาน',
      'สังกัดปีการศึกษา',
      'ช่วงเวลา',
      'รหัสวิชา & ชื่อวิชา',
      'กิจกรรม',
      'สถานะการจอง'
    ];

    const rows = filteredWarehouseBookings.map((b) => [
      b.booking_code,
      b.requester_name,
      `${b.department} (${b.faculty})`,
      b.lab_name,
      b.booking_date,
      `ปีการศึกษา ${getAcademicYear(b.booking_date)}`,
      `${b.start_time} - ${b.end_time} น.`,
      `${b.subject_code} ${b.subject_name}`,
      b.activity_name,
      b.status
    ]);

    if (format === 'csv') {
      downloadCSV('Data_Warehouse_Export_UTCC.csv', headers, rows);
    } else if (format === 'xlsx') {
      const excelData = rows.map((r) => ({
        'รหัสการจอง': r[0],
        'ผู้ขอใช้': r[1],
        'หน่วยงาน/คณะ': r[2],
        'ห้องปฏิบัติการ': r[3],
        'วันที่ใช้งาน': r[4],
        'สังกัดปีการศึกษา': r[5],
        'ช่วงเวลา': r[6],
        'รหัสวิชา & ชื่อวิชา': r[7],
        'กิจกรรม': r[8],
        'สถานะการจอง': r[9]
      }));
      downloadXLSX('Data_Warehouse_Export_UTCC.xlsx', [{ name: 'คลังข้อมูลสถิติ', data: excelData }]);
    } else {
      openPrintWindow(
        'รายงานคลังข้อมูลสถิติย้อนหลังการจองห้องปฏิบัติการพยาบาล',
        `กรองข้อมูลจำนวน ${filteredWarehouseBookings.length} รายการ`,
        [
          { label: 'จำนวนรายการที่กรอง', value: `${filteredWarehouseBookings.length} รายการ` }
        ],
        [{ title: 'ตารางรายการจองย้อนหลังและล่วงหน้าทั้งหมด', headers, rows }]
      );
    }
  };

  // Backup file export
  const handleDownloadFullBackup = () => {
    const backupData = {
      exportTimestamp: new Date().toISOString(),
      systemName: 'NurseLab UTCC System Backup',
      totalBookings: bookings.length,
      totalLabs: labs.length,
      labs,
      bookings
    };
    downloadJSONBackup(backupData, `NurseLab_UTCC_Full_Backup_${new Date().toISOString().split('T')[0]}.json`);
  };

  const COLORS = ['#0d9488', '#0f766e', '#14b8a6', '#0284c7', '#059669', '#d97706'];

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Header Banner & Navigation */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 text-white shadow-xl border border-slate-700/80 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck size={12} /> สิทธิ์ผู้ดูแลระบบ (Admin) ยืนยันแล้ว
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Lock size={12} /> เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น
                </span>
              )}
              <span className="text-slate-400 text-xs">| ศูนย์จัดเก็บสถิติและรายงาน</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight mt-1.5 flex items-center gap-2.5">
              <BarChart3 size={26} className="text-teal-400" />
              <span>รายงานสถิติการใช้งานห้องปฏิบัติการพยาบาล</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              คำนวณตามหลักปีการศึกษา (1 สิงหาคม - 31 กรกฎาคม) ตรงตามมาตรฐานสถิติ คณะพยาบาลศาสตร์
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => handleExportWithAdminCheck(handleDownloadFullBackup)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center gap-2"
            >
              {isAdmin ? <Database size={16} /> : <Lock size={16} />}
              <span>สำรองข้อมูลระบบทั้งหมด (Backup File)</span>
            </button>
          </div>
        </div>

        {/* Global Academic Year Filter Bar */}
        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <Calendar size={18} className="text-teal-400" />
            <span>ตัวกรองปีการศึกษา (Academic Year Filter):</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(Number(e.target.value))}
              className="bg-slate-900 border border-teal-500/50 text-teal-300 rounded-xl px-3.5 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {dynamicAcademicYears.map((y) => (
                <option key={y.yearBE} value={y.yearBE}>
                  ปีการศึกษา {y.yearBE} ({y.periodText})
                </option>
              ))}
            </select>

            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3.5 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="ALL">ทุกห้องปฏิบัติการ (All Labs)</option>
              {labs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Tabs Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700/60 font-bold text-xs">
          <button
            type="button"
            onClick={() => setReportType('weekly')}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              reportType === 'weekly'
                ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Calendar size={15} />
            <span>1. รายงานรายสัปดาห์ (Weekly)</span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('monthly')}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              reportType === 'monthly'
                ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <BarChart3 size={15} />
            <span>2. รายงานรายเดือน (Monthly)</span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('yearly')}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              reportType === 'yearly'
                ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Award size={15} />
            <span>3. รายงานรายปี (Yearly)</span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('warehouse')}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              reportType === 'warehouse'
                ? 'bg-teal-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Database size={15} />
            <span>4. คลังข้อมูลสถิติ</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          1. WEEKLY REPORT VIEW
         ========================================================================= */}
      {reportType === 'weekly' && (
        <div className="space-y-6">
          {renderExportBar(
            `ดาวน์โหลดรายงานรายสัปดาห์ (Weekly Report - ปีการศึกษา ${selectedAcademicYear})`,
            'คำนวณจำนวนวันใช้งานจริงต่อสัปดาห์ พร้อมแปลงเป็นเปอร์เซ็นต์ตามเกณฑ์สถิติ (0วัน=0%, 1วัน=20%, 2วัน=70%, 3วัน=75%, 4วัน=80%, 5วัน+=100%)',
            () => handleExportWeekly('xlsx'),
            () => handleExportWeekly('csv'),
            () => handleExportWeekly('pdf')
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">ปีการศึกษาที่เลือก</p>
              <p className="text-2xl font-display font-extrabold text-teal-600 dark:text-teal-400">
                ปีการศึกษา {selectedAcademicYear}
              </p>
              <p className="text-[10px] text-slate-500">1 ส.ค. {selectedAcademicYear} - 31 ก.ค. {selectedAcademicYear + 1}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">จำนวนสัปดาห์ประมวลผล</p>
              <p className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100">
                {weeklyStats.length} <span className="text-xs text-slate-500 font-normal">สัปดาห์</span>
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold">ครอบคลุมตลอด 12 เดือน</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">เปอร์เซ็นต์ใช้งานเฉลี่ยรวม</p>
              <p className="text-3xl font-display font-extrabold text-teal-600 dark:text-teal-400">
                {yearlyStat.averagePercentage}%
              </p>
              <p className="text-[10px] text-teal-600 font-semibold">เฉลี่ยภาพรวมทั้งปีการศึกษา</p>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-teal-600 dark:text-teal-400" />
              <span>กราฟเปอร์เซ็นต์การใช้งานห้องปฏิบัติการรายสัปดาห์ (ปีการศึกษา {selectedAcademicYear})</span>
            </h3>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 9 }} interval={1} angle={-30} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(value: any, name: any, item: any) => [
                      `${value}% (ใช้งานจริง ${item.payload.usedDaysCount} วัน)`,
                      'เปอร์เซ็นต์การใช้งาน'
                    ]}
                  />
                  <Bar dataKey="percentage" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Calendar size={18} className="text-teal-600" />
              <span>ตารางสรุปข้อมูลสถิติการใช้งานรายสัปดาห์ (Weekly Usage Report)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">ปีการศึกษา</th>
                    <th className="px-4 py-3">เดือนประจำรายงาน</th>
                    <th className="px-4 py-3">สัปดาห์ที่</th>
                    <th className="px-4 py-3 text-center">จำนวนวันใช้งานจริง</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">เปอร์เซ็นต์การใช้งาน (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {weeklyStats.map((w, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">ปีการศึกษา {w.academicYear}</td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{w.monthName} {w.yearBE}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">{w.weekLabel}</td>
                      <td className="px-4 py-2.5 text-center font-mono font-bold text-teal-600 dark:text-teal-400">
                        {w.usedDaysCount} วัน
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                        <span className={`px-2.5 py-0.5 rounded-full ${
                          w.percentage >= 80 ? 'bg-emerald-100 text-emerald-800' : w.percentage >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {w.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. MONTHLY REPORT VIEW
         ========================================================================= */}
      {reportType === 'monthly' && (
        <div className="space-y-6">
          {renderExportBar(
            `ดาวน์โหลดรายงานรายเดือน (Monthly Report - ปีการศึกษา ${selectedAcademicYear})`,
            'คำนวณ Monthly Percentage = Average(Weekly Percentage) ของสัปดาห์ในเดือนเดียวกัน จัดกลุ่มด้วย AcademicYear + YearMonth',
            () => handleExportMonthly('xlsx'),
            () => handleExportMonthly('csv'),
            () => handleExportMonthly('pdf')
          )}

          {/* Monthly KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">สังกัดปีการศึกษา</p>
              <p className="text-2xl font-display font-extrabold text-teal-600 dark:text-teal-400">
                ปีการศึกษา {selectedAcademicYear}
              </p>
              <p className="text-[10px] text-slate-500">เรียงตั้งแต่ 2025-08 ถึง 2026-07</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">จำนวนเดือนประมวลผล</p>
              <p className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100">
                12 <span className="text-xs text-slate-500 font-normal">เดือน</span>
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold">1 สิงหาคม - 31 กรกฎาคม</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">เปอร์เซ็นต์เฉลี่ยรายเดือนสูงสุด</p>
              <p className="text-3xl font-display font-extrabold text-teal-600 dark:text-teal-400">
                {Math.max(...monthlyStats.map((m) => m.averagePercentage))}%
              </p>
              <p className="text-[10px] text-teal-600 font-semibold">เดือนที่มีการใช้งานสูงสุด</p>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <BarChart3 size={18} className="text-teal-600 dark:text-teal-400" />
              <span>กราฟเปอร์เซ็นต์การใช้งานรายเดือน ทั้ง 12 เดือน (ปีการศึกษา {selectedAcademicYear})</span>
            </h3>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStats} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="monthName" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(value: any) => [`${value}%`, 'เปอร์เซ็นต์เฉลี่ยรายเดือน']}
                  />
                  <Bar dataKey="averagePercentage" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Calendar size={18} className="text-teal-600" />
              <span>ตารางสรุปสถิติรายเดือน (Monthly Usage Report - AcademicYear + YearMonth)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">ปีการศึกษา</th>
                    <th className="px-4 py-3">ปี-เดือน (YearMonth)</th>
                    <th className="px-4 py-3">เดือนประจำปีการศึกษา</th>
                    <th className="px-4 py-3 text-center">เปอร์เซ็นต์รายสัปดาห์ในเดือน</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">เปอร์เซ็นต์เฉลี่ยรายเดือน (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {monthlyStats.map((m) => (
                    <tr key={m.yearMonth} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">ปีการศึกษา {m.academicYear}</td>
                      <td className="px-4 py-3 font-mono font-bold text-teal-600 dark:text-teal-400">{m.yearMonth}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{m.monthName}</td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                        [{m.weeklyPercentages.map((p) => `${p}%`).join(', ')}]
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                        <span className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                          {m.averagePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. YEARLY REPORT VIEW
         ========================================================================= */}
      {reportType === 'yearly' && (
        <div className="space-y-6">
          {renderExportBar(
            `ดาวน์โหลดรายงานรายปี (Yearly Report - ปีการศึกษา ${selectedAcademicYear})`,
            'คำนวณ Yearly Percentage = Average(Monthly Percentage) ของ 12 เดือนภายในปีการศึกษาเดียวกัน ห้ามรวมข้ามปีการศึกษา',
            () => handleExportYearly('xlsx'),
            () => handleExportYearly('csv'),
            () => handleExportYearly('pdf')
          )}

          {/* Yearly Single Academic Year Focus Card */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-3xl p-6 text-white shadow-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                สรุปสถิติประจำปีการศึกษา
              </span>
              <span className="font-mono text-xs opacity-90">{yearlyStat.periodText}</span>
            </div>
            <div className="flex items-baseline gap-3 pt-2">
              <h3 className="text-4xl font-display font-black">ปีการศึกษา {yearlyStat.academicYear}</h3>
              <p className="text-3xl font-bold text-teal-200 font-mono">{yearlyStat.averagePercentage}%</p>
            </div>
            <p className="text-xs text-teal-100">
              เปอร์เซ็นต์เฉลี่ยภาพรวมทั้งปีการศึกษา (คำนวณตรงตามสูตรจากค่าเฉลี่ยรายเดือน 12 เดือน)
            </p>
          </div>

          {/* Yearly Comparison Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Award size={18} className="text-teal-600" />
              <span>เปรียบเทียบเปอร์เซ็นต์เฉลี่ยทั้งปี แยกตามปีการศึกษา (Yearly Comparison)</span>
            </h3>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="yearLabel" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(value: any) => [`${value}%`, 'เปอร์เซ็นต์เฉลี่ยทั้งปี']}
                  />
                  <Bar dataKey="averagePercentage" radius={[8, 8, 0, 0]}>
                    {yearlyComparisonData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Yearly Comparison Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Calendar size={18} className="text-teal-600" />
              <span>ตารางสรุปเปรียบเทียบรายปีการศึกษา (Yearly Usage Summary Table)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">ปีการศึกษา</th>
                    <th className="px-4 py-3">ช่วงเวลาปีการศึกษา (1 ส.ค. - 31 ก.ค.)</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">เปอร์เซ็นต์เฉลี่ยทั้งปี (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {yearlyComparisonData.map((y) => (
                    <tr
                      key={y.academicYear}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        y.academicYear === selectedAcademicYear ? 'bg-teal-50/50 dark:bg-teal-950/30 font-bold' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-900 dark:text-white font-bold">
                        ปีการศึกษา {y.academicYear} {y.academicYear === selectedAcademicYear && '(กำลังเลือก)'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono">{y.periodText}</td>
                      <td className="px-4 py-3 text-right font-mono font-extrabold text-teal-600 text-sm">
                        {y.averagePercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. DATA WAREHOUSE & HISTORICAL SEARCH VIEW
         ========================================================================= */}
      {reportType === 'warehouse' && (
        <div className="space-y-6">
          {renderExportBar(
            'ดาวน์โหลดคลังข้อมูลสถิตีย้อนหลัง (Data Warehouse Export)',
            'สืบค้น กรอง และส่งออกรายการจองห้องปฏิบัติการย้อนหลังทั้งหมด',
            () => handleExportWarehouse('xlsx'),
            () => handleExportWarehouse('csv'),
            () => handleExportWarehouse('pdf')
          )}

          {/* Warehouse Filter Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database size={20} className="text-teal-600 dark:text-teal-400" />
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                  ค้นหาและกรองข้อมูลคลังสถิตีย้อนหลัง (Data Warehouse Query)
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFilterAcademicYear('ALL');
                  setFilterStartDate('');
                  setFilterEndDate('');
                  setFilterWarehouseLabId('ALL');
                  setFilterDepartment('ALL');
                  setFilterSubject('');
                  setWarehouseSearch('');
                }}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1"
              >
                <RefreshCw size={12} />
                <span>ล้างตัวกรองทั้งหมด</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ปีการศึกษา:
                </label>
                <select
                  value={filterAcademicYear}
                  onChange={(e) => setFilterAcademicYear(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-white"
                >
                  <option value="ALL">ทุกปีการศึกษา (All Academic Years)</option>
                  {dynamicAcademicYears.map((y) => (
                    <option key={y.yearBE} value={y.yearBE}>
                      {y.label} ({y.periodText})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ห้องปฏิบัติการ:
                </label>
                <select
                  value={filterWarehouseLabId}
                  onChange={(e) => setFilterWarehouseLabId(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="ALL">ทุกห้องปฏิบัติการ (All Labs)</option>
                  {labs.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  วันที่เริ่มต้น:
                </label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  วันที่สิ้นสุด:
                </label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ค้นหาคำสำคัญ (Search Keywords):
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาตามรหัสการจอง, ชื่อผู้ขอใช้, รหัสวิชา, ชื่อวิชา, หรือชื่อกิจกรรม..."
                  value={warehouseSearch}
                  onChange={(e) => setWarehouseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Warehouse Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">
                ผลการค้นหาข้อมูลในคลังสถิติ ({filteredWarehouseBookings.length} รายการ)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase">
                  <tr>
                    <th className="px-3 py-2.5">รหัสการจอง</th>
                    <th className="px-3 py-2.5">ผู้ขอใช้ / หน่วยงาน</th>
                    <th className="px-3 py-2.5">ห้องปฏิบัติการ</th>
                    <th className="px-3 py-2.5">วันที่ & สังกัดปีการศึกษา</th>
                    <th className="px-3 py-2.5">รายวิชา / กิจกรรม</th>
                    <th className="px-3 py-2.5 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredWarehouseBookings.length > 0 ? (
                    filteredWarehouseBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2 font-mono font-bold text-teal-600">{b.booking_code}</td>
                        <td className="px-3 py-2">
                          <div className="font-bold text-slate-900 dark:text-white">{b.requester_name}</div>
                          <div className="text-[10px] text-slate-500">{b.department}</div>
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-200">{b.lab_name}</td>
                        <td className="px-3 py-2">
                          <div className="font-mono font-bold">{b.booking_date}</div>
                          <div className="text-[10px] text-teal-600 font-bold">ปีการศึกษา {getAcademicYear(b.booking_date)}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-bold text-slate-900 dark:text-white">{b.subject_code} {b.subject_name}</div>
                          <div className="text-[10px] text-slate-500">{b.activity_name}</div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'approved' || b.status === 'in_use' || b.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        ไม่พบข้อมูลตามเงื่อนไขที่กำหนด
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
