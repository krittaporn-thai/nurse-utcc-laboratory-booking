import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Mail,
  User,
  Building2,
  Edit,
  Send,
  AlertCircle,
  FileText,
  X,
  Check,
  Package,
  Stethoscope,
  Bed,
  ShieldCheck
} from 'lucide-react';
import { Booking, Laboratory, SelectedItem } from '../types';
import { EditBookingItemsModal } from '../components/EditBookingItemsModal';

interface Props {
  bookings: Booking[];
  labs: Laboratory[];
  isAdmin: boolean;
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string, reason: string) => void;
  onUpdateBooking: (updated: Booking) => void;
  onOpenAdminModal: () => void;
}

export const ApprovalWorkflowView: React.FC<Props> = ({
  bookings,
  labs,
  isAdmin,
  onApproveBooking,
  onRejectBooking,
  onUpdateBooking,
  onOpenAdminModal
}) => {
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Editing date/time modal state
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editLabId, setEditLabId] = useState('');

  // Editing items modal state
  const [editingItemsBooking, setEditingItemsBooking] = useState<Booking | null>(null);

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
          <CheckSquare size={32} />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          ต้องใช้สิทธิ์ผู้ดูแลระบบ (ADMIN)
        </h3>
        <p className="text-xs text-slate-500">
          เมนูอนุมัติการจองห้องปฏิบัติการพยาบาลสำหรับผู้ดูแลระบบเท่านั้น
        </p>
        <button
          onClick={onOpenAdminModal}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20"
        >
          เข้าสู่ระบบ ADMIN
        </button>
      </div>
    );
  }

  const pendingList = bookings.filter((b) => b.status === 'pending');
  const approvedList = bookings.filter((b) => b.status === 'approved' || b.status === 'in_use' || b.status === 'completed');
  const rejectedList = bookings.filter((b) => b.status === 'rejected');

  const openEditModal = (b: Booking) => {
    setEditingBooking(b);
    setEditDate(b.booking_date);
    setEditStartTime(b.start_time);
    setEditEndTime(b.end_time);
    setEditLabId(b.lab_id);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    const selectedLab = labs.find((l) => l.id === editLabId);
    const updated: Booking = {
      ...editingBooking,
      booking_date: editDate,
      start_time: editStartTime,
      end_time: editEndTime,
      lab_id: editLabId,
      lab_name: selectedLab ? selectedLab.name : editingBooking.lab_name
    };

    onUpdateBooking(updated);
    setEditingBooking(null);
  };

  const handleConfirmReject = (bookingId: string) => {
    if (!rejectReason.trim()) return;
    onRejectBooking(bookingId, rejectReason);
    setRejectingBookingId(null);
    setRejectReason('');
  };

  // Item availability toggle handler
  const handleToggleItemAvailability = (
    booking: Booking,
    category: 'consumables' | 'medical_equipment' | 'assets',
    itemId: string,
    availability: 'available' | 'sufficient' | 'insufficient' | 'unavailable'
  ) => {
    const updatedCategory = booking[category].map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          availability,
          available_quantity: availability === 'insufficient' ? (item.available_quantity ?? Math.max(1, item.quantity - 1)) : item.quantity
        };
      }
      return item;
    });

    const updatedBooking: Booking = {
      ...booking,
      [category]: updatedCategory
    };

    onUpdateBooking(updatedBooking);
  };

  const handleUpdateItemDetails = (
    booking: Booking,
    category: 'consumables' | 'medical_equipment' | 'assets',
    itemId: string,
    fields: { available_quantity?: number; note?: string }
  ) => {
    const updatedCategory = booking[category].map((item) => {
      if (item.id === itemId) {
        return { ...item, ...fields };
      }
      return item;
    });

    const updatedBooking: Booking = {
      ...booking,
      [category]: updatedCategory
    };

    onUpdateBooking(updatedBooking);
  };

  const renderItemApprovalList = (
    booking: Booking,
    category: 'consumables' | 'medical_equipment' | 'assets',
    title: string,
    icon: React.ReactNode
  ) => {
    const items = booking[category];
    if (!items || items.length === 0) return null;

    return (
      <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-800 dark:text-slate-200">
          {icon}
          <span>{title} ({items.length} รายการ):</span>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const status = item.availability || 'available';
            const isSufficient = status === 'available' || status === 'sufficient';
            const isInsufficient = status === 'insufficient';
            const isUnavailable = status === 'unavailable';

            return (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      (ขอใช้ {item.quantity} {item.unit || 'ชิ้น'})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleItemAvailability(booking, category, item.id, 'sufficient')}
                      className={`px-2 py-1 rounded-lg font-bold text-[10px] transition flex items-center gap-1 ${
                        isSufficient
                          ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800'
                      }`}
                      title="อนุมัติว่ามีอุปกรณ์ และมีปริมาณเพียงพอตามที่ขอ"
                    >
                      <Check size={11} />
                      <span>มี (พอใช้)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleItemAvailability(booking, category, item.id, 'insufficient')}
                      className={`px-2 py-1 rounded-lg font-bold text-[10px] transition flex items-center gap-1 ${
                        isInsufficient
                          ? 'bg-amber-600 text-white shadow-xs ring-1 ring-amber-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800'
                      }`}
                      title="อนุมัติว่ามีอุปกรณ์ แต่มีไม่พอตามปริมาณที่ขอใช้"
                    >
                      <span>⚠️ มี (ไม่พอใช้)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleItemAvailability(booking, category, item.id, 'unavailable')}
                      className={`px-2 py-1 rounded-lg font-bold text-[10px] transition flex items-center gap-1 ${
                        isUnavailable
                          ? 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800'
                      }`}
                      title="ไม่มีอุปกรณ์ให้บริการ"
                    >
                      <X size={11} />
                      <span>ไม่มี</span>
                    </button>
                  </div>
                </div>

                {/* Additional Details Form for Insufficient Status */}
                {isInsufficient && (
                  <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg p-2.5 space-y-2 text-[11px] animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="font-bold text-amber-900 dark:text-amber-200 shrink-0">
                        จำนวนที่มีบริการจริง:
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={item.quantity}
                          value={item.available_quantity ?? item.quantity}
                          onChange={(e) =>
                            handleUpdateItemDetails(booking, category, item.id, {
                              available_quantity: parseInt(e.target.value, 10) || 0
                            })
                          }
                          className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-md text-amber-900 dark:text-amber-100 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <span className="text-amber-800 dark:text-amber-300 font-medium">
                          {item.unit || 'ชิ้น'} (จากที่ขอ {item.quantity} {item.unit || 'ชิ้น'})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="font-bold text-amber-900 dark:text-amber-200 shrink-0">
                        หมายเหตุ / เหตุผลที่ไม่เพียงพอ:
                      </label>
                      <input
                        type="text"
                        placeholder="ระบุสาเหตุ เช่น ชำรุดบางส่วน, ติดใช้งานห้องอื่น, อยู่ระหว่างจัดซื้อ"
                        value={item.note || ''}
                        onChange={(e) =>
                          handleUpdateItemDetails(booking, category, item.id, {
                            note: e.target.value
                          })
                        }
                        className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-md text-amber-900 dark:text-amber-100 placeholder:text-amber-400/80 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
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
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare size={22} className="text-teal-600 dark:text-teal-400" />
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
              Workflow การอนุมัติการจอง (Admin Approval)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Admin สามารถเลือกรายการว่า "มี" หรือ "ไม่มี" บันทึกผล และส่งอีเมลแจ้งผู้ขอใช้ห้องได้ทันที
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="bg-amber-100 text-amber-900 font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-amber-300">
            รออนุมัติ: {pendingList.length} รายการ
          </span>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Clock size={18} className="text-amber-500" />
          <span>คำขอจองที่รอดำเนินการ (Pending Requests)</span>
        </h3>

        {pendingList.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-semibold">
            ยังไม่มีข้อมูล
          </div>
        ) : (
          <div className="space-y-5">
            {pendingList.map((b) => (
              <div
                key={b.id}
                className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-teal-700 dark:text-teal-300">
                      {b.booking_code}
                    </span>
                    <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      รอดำเนินการ
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ยื่นเมื่อ: {new Date(b.created_at).toLocaleString('th-TH')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">ผู้ขอใช้ & หน่วยงาน:</span>
                    <strong className="text-slate-900 dark:text-white text-sm">{b.requester_name}</strong>
                    <p className="text-slate-600 dark:text-slate-300">{b.department} ({b.faculty})</p>
                    <p className="text-slate-500 text-[11px]">{b.email} | Tel: {b.phone}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">ห้องปฏิบัติการ & เวลา:</span>
                    <strong className="text-teal-600 dark:text-teal-400 text-sm">{b.lab_name}</strong>
                    <p className="text-slate-800 dark:text-slate-200 font-bold font-mono">
                      วันที่: {b.booking_date} (เวลา {b.start_time} - {b.end_time} น.)
                    </p>
                    <p className="text-slate-500 text-[11px]">วิชา: {b.subject_code} {b.subject_name}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  <p><strong>กิจกรรม:</strong> {b.activity_name}</p>
                  {b.objective && <p className="text-[11px] text-slate-500"><strong>วัตถุประสงค์:</strong> {b.objective}</p>}
                  
                  {/* Admin Item Availability Approval Panel */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        รายการที่ผู้ขอกรอกมา (Admin อนุมัติสถานะ มี / ไม่มี):
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingItemsBooking(b)}
                        className="text-[11px] font-bold text-teal-600 hover:text-teal-700 underline"
                      >
                        + เพิ่ม/ลบ/แก้ไขรายการแทนผู้ขอ
                      </button>
                    </div>

                    {renderItemApprovalList(b, 'consumables', 'วัสดุสิ้นเปลือง', <Package size={14} className="text-amber-500" />)}
                    {renderItemApprovalList(b, 'medical_equipment', 'อุปกรณ์การแพทย์', <Stethoscope size={14} className="text-blue-500" />)}
                    {renderItemApprovalList(b, 'assets', 'ครุภัณฑ์', <Bed size={14} className="text-purple-500" />)}

                    {b.consumables.length === 0 && b.medical_equipment.length === 0 && b.assets.length === 0 && (
                      <p className="text-slate-400 text-xs italic py-1">
                        ผู้ขอใช้ไม่ได้ระบุรายการวัสดุ/อุปกรณ์
                      </p>
                    )}
                  </div>
                </div>

                {/* Reject reason input prompt */}
                {rejectingBookingId === b.id ? (
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl space-y-2 text-xs">
                    <label className="block font-bold text-rose-800">ระบุเหตุผลในการปฏิเสธการจอง:</label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="เช่น ห้องถูกจองซ้อน หรือมีกิจกรรมปรับปรุงอุปกรณ์"
                      className="w-full p-2 bg-white border rounded-lg"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setRejectingBookingId(null)}
                        className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg"
                      >
                        ยกเลิก
                      </button>
                      <button
                        onClick={() => handleConfirmReject(b.id)}
                        className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg"
                      >
                        ยืนยันปฏิเสธ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1 justify-end">
                    <button
                      onClick={() => openEditModal(b)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Edit size={14} />
                      <span>เปลี่ยนวัน/เวลา/ห้อง</span>
                    </button>

                    <button
                      onClick={() => setRejectingBookingId(b.id)}
                      className="px-3.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <XCircle size={14} />
                      <span>ปฏิเสธคำขอ</span>
                    </button>

                    <button
                      onClick={() => onApproveBooking(b.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
                    >
                      <CheckCircle2 size={14} />
                      <span>อนุมัติการจอง + ส่งอีเมล</span>
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Bookings Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span>รายการที่อนุมัติแล้ว ({approvedList.length} รายการ)</span>
        </h3>

        {approvedList.length === 0 ? (
          <p className="text-center py-6 text-slate-400 text-xs font-semibold">ยังไม่มีข้อมูล</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {approvedList.map((b) => (
              <div
                key={b.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                    {b.booking_code}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {b.status === 'approved' ? 'อนุมัติแล้ว' : b.status}
                  </span>
                </div>
                <div>
                  <strong className="text-slate-900 dark:text-white">{b.requester_name}</strong>
                  <p className="text-slate-500">{b.lab_name}</p>
                  <p className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    {b.booking_date} ({b.start_time} - {b.end_time} น.)
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItemsBooking(b)}
                    className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-[11px] rounded-lg border border-teal-200 dark:border-teal-800"
                  >
                    ✏️ แก้ไขข้อมูลการจอง & อุปกรณ์ (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px] rounded-lg"
                  >
                    เปลี่ยนวัน/เวลา/ห้อง
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Edit Date / Time / Room Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setEditingBooking(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              เปลี่ยนวัน เวลา หรือห้องปฏิบัติการ
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">เลือกห้องใหม่</label>
                <select
                  value={editLabId}
                  onChange={(e) => setEditLabId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  {labs.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.code} - {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">วันที่ใหม่</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="flex-1 py-2 font-medium bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-bold text-white bg-teal-600 rounded-xl"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Freeform Item & Lab Details Editing Modal */}
      {editingItemsBooking && (
        <EditBookingItemsModal
          booking={editingItemsBooking}
          isAdmin={true}
          labs={labs}
          onClose={() => setEditingItemsBooking(null)}
          onSaveBookingItems={(updated) => {
            onUpdateBooking(updated);
            setEditingItemsBooking(null);
          }}
        />
      )}

    </div>
  );
};
