import React from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Building2,
  Mail,
  Phone,
  Package,
  Stethoscope,
  Bed,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Edit,
  Check,
  X as XIcon
} from 'lucide-react';
import { Booking, SelectedItem } from '../types';
import { formatDateWithAcademicYear, getAcademicYear, getAcademicYearPeriodText } from '../lib/dateUtils';

interface Props {
  booking: Booking | null;
  onClose: () => void;
  onOpenEditItems?: (booking: Booking) => void;
}

export const BookingDetailModal: React.FC<Props> = ({
  booking,
  onClose,
  onOpenEditItems
}) => {
  if (!booking) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            🟡 สถานะ: รอดำเนินการ (ยังไม่ถึงเวลาจอง)
          </span>
        );
      case 'in_use':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            🟢 สถานะ: กำลังใช้งาน (อยู่ในช่วงเวลาจอง)
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
            🔴 สถานะ: เสร็จสิ้น (สิ้นสุดช่วงเวลาจอง)
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            🔵 สถานะ: อนุมัติแล้ว
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            ❌ สถานะ: ไม่อนุมัติ
          </span>
        );
      default:
        return null;
    }
  };

  const renderItemListWithStatus = (items: SelectedItem[], title: string, icon: React.ReactNode, bgColor: string) => {
    if (!items || items.length === 0) {
      return (
        <div className={`p-3.5 ${bgColor} rounded-2xl text-xs flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            {icon}
            <strong className="text-slate-800 dark:text-slate-200">{title}:</strong>
            <span className="text-slate-500">ไม่มี</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`p-3.5 ${bgColor} rounded-2xl text-xs space-y-2`}>
        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-1.5 font-bold text-slate-800 dark:text-slate-200">
          {icon}
          <span>{title} ({items.length} รายการ):</span>
        </div>

        <div className="space-y-1.5">
          {items.map((item) => {
            const avail = item.availability || 'available';
            return (
              <div key={item.id} className="py-1 border-b border-black/5 dark:border-white/5 last:border-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    • {item.name} <span className="text-slate-500 font-normal">({item.quantity} {item.unit || 'ชิ้น'})</span>
                  </span>

                  {avail === 'available' || avail === 'sufficient' ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                      <Check size={12} /> มี (พอใช้)
                    </span>
                  ) : avail === 'insufficient' ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                      ⚠️ มี (ไม่พอตามที่ขอใช้)
                    </span>
                  ) : avail === 'unavailable' ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                      <XIcon size={12} /> ไม่มีบริการ
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-extrabold shrink-0">
                      ⏳ รอตรวจสอบ
                    </span>
                  )}
                </div>

                {avail === 'insufficient' && (
                  <div className="ml-3 p-2 bg-amber-100/60 dark:bg-amber-950/40 rounded-lg text-[11px] text-amber-900 dark:text-amber-200 space-y-0.5">
                    <div>
                      <span className="font-bold">จำนวนที่มีบริการจริง:</span>{' '}
                      <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
                        {item.available_quantity ?? item.quantity} {item.unit || 'ชิ้น'}
                      </span>{' '}
                      <span className="text-slate-500">(จากที่ขอ {item.quantity} {item.unit || 'ชิ้น'})</span>
                    </div>
                    {item.note && (
                      <div>
                        <span className="font-bold">เหตุผล/หมายเหตุ:</span> {item.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 pr-8">
          <div>
            <span className="font-mono text-xs font-extrabold text-teal-700 dark:text-teal-300">
              {booking.booking_code}
            </span>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {booking.subject_code} - {booking.subject_name}
            </h3>
          </div>
        </div>

        <div>{getStatusBadge(booking.status)}</div>

        {/* Requester Info */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-2 text-xs border border-slate-200/60 dark:border-slate-700/60">
          <h4 className="font-display font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
            <User size={16} className="text-teal-600 dark:text-teal-400" />
            <span>ข้อมูลผู้ขอใช้</span>
          </h4>
          <p><strong>ชื่อ-นามสกุล:</strong> {booking.requester_name}</p>
          <p><strong>หน่วยงาน:</strong> {booking.department} ({booking.faculty})</p>
          <p><strong>ติดต่อ:</strong> {booking.email} | Tel: {booking.phone}</p>
        </div>

        {/* Usage Details */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-2 text-xs border border-slate-200/60 dark:border-slate-700/60">
          <h4 className="font-display font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
            <Building2 size={16} className="text-teal-600 dark:text-teal-400" />
            <span>รายละเอียดการใช้ห้องปฏิบัติการ</span>
          </h4>
          <p><strong>ห้องที่จอง:</strong> {booking.lab_name}</p>
          <p className="flex flex-wrap items-center gap-2">
            <span><strong>วันที่ใช้งาน:</strong> {formatDateWithAcademicYear(booking.booking_date)}</span>
            <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 text-[10px] font-bold rounded-lg border border-amber-300 dark:border-amber-700">
              {getAcademicYearPeriodText(getAcademicYear(booking.booking_date))}
            </span>
          </p>
          <p><strong>เวลา:</strong> {booking.start_time} - {booking.end_time} น.</p>
          <p><strong>กิจกรรม:</strong> {booking.activity_name}</p>
          <p><strong>จำนวนผู้เข้าร่วม:</strong> {booking.participant_count} คน</p>
          <p><strong>วัตถุประสงค์:</strong> {booking.objective || '-'}</p>
        </div>

        {/* Borrowed items lists with Availability */}
        <div className="space-y-3">
          {renderItemListWithStatus(booking.consumables, 'วัสดุสิ้นเปลือง', <Package size={16} className="text-amber-500" />, 'bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50')}
          {renderItemListWithStatus(booking.medical_equipment, 'อุปกรณ์การแพทย์', <Stethoscope size={16} className="text-blue-500" />, 'bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50')}
          {renderItemListWithStatus(booking.assets, 'ครุภัณฑ์', <Bed size={16} className="text-purple-500" />, 'bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/50')}
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {onOpenEditItems && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEditItems(booking);
              }}
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Edit size={16} />
              <span>แก้ไขรายละเอียดการจอง & อุปกรณ์</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
