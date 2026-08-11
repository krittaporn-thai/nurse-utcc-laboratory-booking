import { BookingStatus } from '../types';

/**
 * Helper function to calculate business days (Monday to Friday) between two dates.
 * Excludes Saturdays (6) and Sundays (0).
 */
export function calculateBusinessDays(targetDateStr: string, fromDateStr?: string): number {
  const fromDate = fromDateStr ? new Date(fromDateStr) : new Date();
  const targetDate = new Date(targetDateStr);

  // Normalize hours to start of day
  fromDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  if (targetDate.getTime() <= fromDate.getTime()) {
    return 0; // Past or today
  }

  let count = 0;
  const cur = new Date(fromDate.getTime());

  // Count Mon-Fri days between fromDate and targetDate
  while (cur.getTime() < targetDate.getTime()) {
    cur.setDate(cur.getDate() + 1);
    const dayOfWeek = cur.getDay(); // 0 = Sun, 6 = Sat
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
  }

  return count;
}

/**
 * Returns true if less than 5 business days remain before targetDateStr.
 * When true, standard user editing is locked automatically.
 */
export function isWithin5BusinessDays(targetDateStr: string, fromDateStr?: string): boolean {
  const businessDays = calculateBusinessDays(targetDateStr, fromDateStr);
  return businessDays < 5;
}

/**
 * Calculate Thai Academic Year (ปีการศึกษา) for a given date.
 * Academic year starts on August 1 of year X (พ.ศ.) and ends on July 31 of year X+1 (พ.ศ.).
 * Example:
 * 1 สิงหาคม 2568 - 31 กรกฎาคม 2569 -> ปีการศึกษา 2568
 * 1 สิงหาคม 2569 - 31 กรกฎาคม 2570 -> ปีการศึกษา 2569
 */
export function getAcademicYear(dateInput: string | Date): number {
  if (!dateInput) return 2568;
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return 2568;
  const yearAD = d.getFullYear();
  const month = d.getMonth() + 1; // 1 to 12
  const yearBE = yearAD + 543;
  return month >= 8 ? yearBE : yearBE - 1;
}

/**
 * Get period text string for an Academic Year.
 * Example: 2568 -> "1 ส.ค. 2568 - 31 ก.ค. 2569"
 */
export function getAcademicYearPeriodText(academicYearBE: number): string {
  const endYearBE = academicYearBE + 1;
  return `1 ส.ค. ${academicYearBE} - 31 ก.ค. ${endYearBE}`;
}

/**
 * Format date string (YYYY-MM-DD) into Thai date with Academic Year notice.
 */
export function formatDateWithAcademicYear(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const yBE = parseInt(parts[0], 10) + 543;
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  const monthsThai = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const mName = monthsThai[m - 1] || '';
  const acadYear = getAcademicYear(dateStr);
  return `${d} ${mName} ${yBE} (ปีการศึกษา ${acadYear})`;
}

/**
 * Parses booking_date (YYYY-MM-DD or DD/MM/YYYY) and time (HH:mm)
 * into a valid local Date object (Asia/Bangkok / local wall-clock time).
 */
export function parseBookingDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  let year = 0;
  let month = 0; // 0-indexed for JS Date constructor
  let day = 0;

  const trimmedDate = dateStr.trim();
  if (trimmedDate.includes('-')) {
    const parts = trimmedDate.split('-').map((p) => parseInt(p, 10));
    if (parts.length === 3) {
      if (parts[0] > 1000) {
        // YYYY-MM-DD
        [year, month, day] = [parts[0], parts[1] - 1, parts[2]];
      } else {
        // DD-MM-YYYY
        [day, month, year] = [parts[0], parts[1] - 1, parts[2]];
      }
    }
  } else if (trimmedDate.includes('/')) {
    const parts = trimmedDate.split('/').map((p) => parseInt(p, 10));
    if (parts.length === 3) {
      if (parts[2] > 1000) {
        // DD/MM/YYYY
        [day, month, year] = [parts[0], parts[1] - 1, parts[2]];
      } else if (parts[0] > 1000) {
        // YYYY/MM/DD
        [year, month, day] = [parts[0], parts[1] - 1, parts[2]];
      }
    }
  }

  // Adjust Thai Buddhist Era (พ.ศ. > 2500 -> ค.ศ.)
  if (year > 2500) {
    year -= 543;
  }

  if (!year || isNaN(year) || isNaN(month) || isNaN(day)) return null;

  let hour = 0;
  let minute = 0;
  if (timeStr && typeof timeStr === 'string') {
    const timeParts = timeStr.trim().split(':').map((p) => parseInt(p, 10));
    hour = !isNaN(timeParts[0]) ? timeParts[0] : 0;
    minute = !isNaN(timeParts[1]) ? timeParts[1] : 0;
  }

  return new Date(year, month, day, hour, minute, 0, 0);
}

/**
 * Calculates booking status dynamically strictly using full DateTime comparison.
 *
 * Rules:
 * 1. รอดำเนินการ (สีเหลือง): current_datetime < booking_start_datetime
 * 2. กำลังใช้งาน (สีเขียว): booking_start_datetime <= current_datetime < booking_end_datetime
 * 3. เสร็จสิ้น (สีแดง): current_datetime >= booking_end_datetime
 */
export function calculateBookingStatus(
  bookingDate: string,
  startTime: string,
  endTime: string,
  currentStatus: string,
  now: Date = new Date()
): BookingStatus {
  if (currentStatus === 'rejected' || currentStatus === 'cancelled') {
    return currentStatus as BookingStatus;
  }

  const startDateTime = parseBookingDateTime(bookingDate, startTime || '00:00');
  const endDateTime = parseBookingDateTime(bookingDate, endTime || '23:59');

  if (!startDateTime || !endDateTime) {
    return (currentStatus as BookingStatus) || 'pending';
  }

  const currentMs = now.getTime();
  const startMs = startDateTime.getTime();
  const endMs = endDateTime.getTime();

  // Rule 1: current_datetime < booking_start_datetime
  if (currentMs < startMs) {
    return currentStatus === 'approved' ? 'approved' : 'pending';
  }

  // Rule 2: booking_start_datetime <= current_datetime < booking_end_datetime
  if (currentMs >= startMs && currentMs < endMs) {
    if (currentStatus === 'approved' || currentStatus === 'in_use') {
      return 'in_use';
    }
    return 'pending';
  }

  // Rule 3: current_datetime >= booking_end_datetime
  if (currentStatus === 'approved' || currentStatus === 'in_use' || currentStatus === 'completed') {
    return 'completed';
  }

  return (currentStatus as BookingStatus) || 'pending';
}


