import { Booking } from '../types';
import { getAcademicYear } from './dateUtils';

export interface WeeklyStatItem {
  academicYear: number;
  yearMonth: string;         // 'YYYY-MM'
  monthName: string;         // 'สิงหาคม'
  yearBE: number;            // 2568
  weekNumber: number;        // 1..5
  weekLabel: string;         // 'สัปดาห์ที่ 1 (1-7)'
  usedDaysCount: number;     // 0..7
  percentage: number;        // 0..100
}

export interface MonthlyStatItem {
  academicYear: number;
  yearMonth: string;         // 'YYYY-MM'
  monthName: string;         // 'สิงหาคม 2568'
  monthCode: string;         // 'AUG'
  weeklyPercentages: number[];
  averagePercentage: number;
}

export interface YearlyStatItem {
  academicYear: number;      // 2568
  periodText: string;        // '1 ส.ค. 2568 - 31 ก.ค. 2569'
  monthlyPercentages: number[];
  averagePercentage: number;
}

/**
 * Calculates percentage from number of actual lab usage days in a week.
 *
 * Threshold:
 * - 0 days = 0%
 * - 1 day  = 20%
 * - 2 days = 70%
 * - 3 days = 75%
 * - 4 days = 80%
 * - 5+ days = 100%
 */
export function calculateWeeklyPercentage(usedDaysCount: number): number {
  if (usedDaysCount <= 0) return 0;
  if (usedDaysCount === 1) return 20;
  if (usedDaysCount === 2) return 70;
  if (usedDaysCount === 3) return 75;
  if (usedDaysCount === 4) return 80;
  return 100;
}

const MONTH_METADATA = [
  { code: 'AUG', name: 'สิงหาคม', monthIndex: 8, yearOffsetAD: 0 },
  { code: 'SEP', name: 'กันยายน', monthIndex: 9, yearOffsetAD: 0 },
  { code: 'OCT', name: 'ตุลาคม', monthIndex: 10, yearOffsetAD: 0 },
  { code: 'NOV', name: 'พฤศจิกายน', monthIndex: 11, yearOffsetAD: 0 },
  { code: 'DEC', name: 'ธันวาคม', monthIndex: 12, yearOffsetAD: 0 },
  { code: 'JAN', name: 'มกราคม', monthIndex: 1, yearOffsetAD: 1 },
  { code: 'FEB', name: 'กุมภาพันธ์', monthIndex: 2, yearOffsetAD: 1 },
  { code: 'MAR', name: 'มีนาคม', monthIndex: 3, yearOffsetAD: 1 },
  { code: 'APR', name: 'เมษายน', monthIndex: 4, yearOffsetAD: 1 },
  { code: 'MAY', name: 'พฤษภาคม', monthIndex: 5, yearOffsetAD: 1 },
  { code: 'JUN', name: 'มิถุนายน', monthIndex: 6, yearOffsetAD: 1 },
  { code: 'JUL', name: 'กรกฎาคม', monthIndex: 7, yearOffsetAD: 1 }
];

/**
 * Get all 12 month configurations for a given Academic Year (BE).
 * Academic Year starts Aug 1 of (academicYearBE - 543) and ends Jul 31 of (academicYearBE - 542).
 */
export function getMonthsForAcademicYear(academicYearBE: number) {
  const startYearAD = academicYearBE - 543;

  return MONTH_METADATA.map((m) => {
    const yearAD = startYearAD + m.yearOffsetAD;
    const yearBE = yearAD + 543;
    const monthStr = String(m.monthIndex).padStart(2, '0');
    const yearMonth = `${yearAD}-${monthStr}`;

    return {
      ...m,
      yearAD,
      yearBE,
      yearMonth,
      fullName: `${m.name} ${yearBE}`
    };
  });
}

/**
 * Filter bookings that belong to a specific Academic Year and optional Lab ID.
 */
export function filterBookingsForAcademicYear(
  bookings: Booking[],
  targetAcademicYearBE: number,
  labId: string = 'ALL'
): Booking[] {
  return bookings.filter((b) => {
    if (!b.booking_date) return false;
    // Exclude rejected or cancelled
    if (b.status === 'rejected' || b.status === 'cancelled') return false;
    if (labId !== 'ALL' && b.lab_id !== labId) return false;

    const bAcadYear = getAcademicYear(b.booking_date);
    return bAcadYear === targetAcademicYearBE;
  });
}

/**
 * Central logic to compute Weekly Statistics for an Academic Year.
 */
export function calculateWeeklyStats(
  bookings: Booking[],
  academicYearBE: number,
  labId: string = 'ALL'
): WeeklyStatItem[] {
  const validBookings = filterBookingsForAcademicYear(bookings, academicYearBE, labId);
  const months = getMonthsForAcademicYear(academicYearBE);
  const weeklyItems: WeeklyStatItem[] = [];

  months.forEach((m) => {
    // Determine days in this month
    const totalDaysInMonth = new Date(m.yearAD, m.monthIndex, 0).getDate();

    // 5 week ranges per month: 1-7, 8-14, 15-21, 22-28, 29..end
    const weekRanges = [
      { num: 1, start: 1, end: 7 },
      { num: 2, start: 8, end: 14 },
      { num: 3, start: 15, end: 21 },
      { num: 4, start: 22, end: 28 },
      { num: 5, start: 29, end: totalDaysInMonth }
    ];

    weekRanges.forEach((w) => {
      // Find bookings falling in this week window
      const usedDatesSet = new Set<string>();

      validBookings.forEach((b) => {
        if (!b.booking_date) return;
        const [yStr, mStr, dStr] = b.booking_date.split('-');
        const bYear = parseInt(yStr, 10);
        const bMonth = parseInt(mStr, 10);
        const bDay = parseInt(dStr, 10);

        if (bYear === m.yearAD && bMonth === m.monthIndex && bDay >= w.start && bDay <= w.end) {
          usedDatesSet.add(b.booking_date);
        }
      });

      const usedDaysCount = usedDatesSet.size;
      const percentage = calculateWeeklyPercentage(usedDaysCount);

      weeklyItems.push({
        academicYear: academicYearBE,
        yearMonth: m.yearMonth,
        monthName: m.name,
        yearBE: m.yearBE,
        weekNumber: w.num,
        weekLabel: `สัปดาห์ที่ ${w.num} (${w.start}-${w.end} ${m.name.substring(0, 4)}.)`,
        usedDaysCount,
        percentage
      });
    });
  });

  return weeklyItems;
}

/**
 * Central logic to compute Monthly Statistics for an Academic Year.
 * Monthly Percentage = Average(Weekly Percentages in that month)
 */
export function calculateMonthlyStats(
  bookings: Booking[],
  academicYearBE: number,
  labId: string = 'ALL'
): MonthlyStatItem[] {
  const weeklyItems = calculateWeeklyStats(bookings, academicYearBE, labId);
  const months = getMonthsForAcademicYear(academicYearBE);

  return months.map((m) => {
    const monthWeeks = weeklyItems.filter((w) => w.yearMonth === m.yearMonth);
    const weeklyPercentages = monthWeeks.map((w) => w.percentage);
    const totalPct = weeklyPercentages.reduce((sum, p) => sum + p, 0);
    const averagePercentage = monthWeeks.length > 0 ? Math.round((totalPct / monthWeeks.length) * 10) / 10 : 0;

    return {
      academicYear: academicYearBE,
      yearMonth: m.yearMonth,
      monthName: `${m.name} ${m.yearBE}`,
      monthCode: m.code,
      weeklyPercentages,
      averagePercentage
    };
  });
}

/**
 * Central logic to compute Yearly Statistics for an Academic Year.
 * Yearly Percentage = Average(Monthly Percentages in that Academic Year)
 */
export function calculateYearlyStats(
  bookings: Booking[],
  academicYearBE: number,
  labId: string = 'ALL'
): YearlyStatItem {
  const monthlyItems = calculateMonthlyStats(bookings, academicYearBE, labId);
  const monthlyPercentages = monthlyItems.map((m) => m.averagePercentage);
  const totalPct = monthlyPercentages.reduce((sum, p) => sum + p, 0);
  const averagePercentage = monthlyItems.length > 0 ? Math.round((totalPct / monthlyItems.length) * 10) / 10 : 0;

  const endYearBE = academicYearBE + 1;
  const periodText = `1 ส.ค. ${academicYearBE} - 31 ก.ค. ${endYearBE}`;

  return {
    academicYear: academicYearBE,
    periodText,
    monthlyPercentages,
    averagePercentage
  };
}
