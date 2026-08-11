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
  ShieldCheck,
  Trash2
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
  onDeleteBooking?: (bookingId: string) => void;
  onOpenAdminModal: () => void;
}

export const ApprovalWorkflowView: React.FC<Props> = ({
  bookings,
  labs,
  isAdmin,
  onApproveBooking,
  onRejectBooking,
  onUpdateBooking,
  onDeleteBooking,
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

  // Editing items & lab details modal state
  const [editingItemsBooking, setEditingItemsBooking] = useState<Booking | null>(null);

  // Active Filter Tab: 'pending' | 'approved' | 'all'
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
          <CheckSquare size={32} />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          เมนูเฉพาะผู้ดูแลระบบ (ADMIN)
        </h3>
        <p className="text-xs text-slate-500">
          อนุมัติ/ปฏิเสธ คำขอจองห้องปฏิบัติการพยาบาล ตรวจสอบรายการอุปกรณ์
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

  const handleConfirmReject = (id: string) => {
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธการจอง');
      return;
    }
    onRejectBooking(id, rejectReason);
    setRejectingBookingId(null);
    setRejectReason('');
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบรายการจองนี้ออกจากระบบใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      if (onDeleteBooking) {
        onDeleteBooking(id);
      }
    }
  };

  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    setEditDate(booking.booking_date);
    setEditStartTime(booking.start_time);
    setEditEndTime(booking.end_time);
    setEditLabId(booking.lab_id);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    const selectedLab = labs.find((l) => l.id === editLabId);
    const updatedLabName = selectedLab ? `${selectedLab.code} - ${selectedLab.name}` : editingBooking.lab_name;

    const updated: Booking = {
      ...editingBooking,
      booking_date: editDate,
      start_time: editStartTime,
      end_time: editEndTime,
      lab_id: editLabId,
      lab_name: updatedLabName
    };

    onUpdateBooking(updated);
    setEditingBooking(null);
  };

  const handleUpdateItemAvailability = (
    booking: Booking,
    category: 'consumables' | 'medical_equipment' | 'assets',
    itemId: string,
    avail: 'available' | 'insufficient' | 'unavailable'
  ) => {
    const updatedItems = booking[category].map((i) => {
      if (i.id === itemId) {
        return { ...i, availability: avail };
      }
      return i;
    });

    const updated: Booking = {
      ...booking,
      [category]: updatedItems
    };

    onUpdateBooking(updated);
  };

  const handleUpdateItemDetails = (
    booking: Booking,
    category: 'consumables' | 'medical_equipment' | 'assets',
    itemId: string,
    details: { available_quantity?: number; note?: string }
  ) => {
    const updatedItems = booking[category].map((i) => {
      if (i.id === itemId) {
        return { ...i, ...details };
      }
      return i;
    });

    const updated: Booking = {
      ...booking,
      [category]: updatedItems
    };

    onUpdateBooking(updated);
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
      <div className="space-y-2 mt-2 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
        <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1.5">
          {icon}
          <span>{title} ({items.length} รายการ):</span>
        </div>

        <div className="space-y-2.5">
          {items.map((item) => {
            const currentAvail = item.availability || 'available';
            return (
              <div key={item.id} className="text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    • {item.name} <span className="text-teal-600 dark:text-teal-400 font-bold">({item.quantity} {item.unit || 'ชิ้น'})</span>
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleUpdateItemAvailability(booking, category, item.id, 'available')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition ${
                        currentAvail === 'available' || currentAvail === 'sufficient'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                    >
                      <Check size={12} /> มี (พอใช้)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateItemAvailability(booking, category, item.id, 'insufficient')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition ${
                        currentAvail === 'insufficient'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-amber-100 hover:text-amber-900'
                      }`}
                    >
                      ⚠️ มี (ไม่พอ)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateItemAvailability(booking, category, item.id, 'unavailable')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition ${
                        currentAvail === 'unavailable'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-rose-100 hover:text-rose-800'
                      }`}
                    >
                      <X size={12} /> ไม่มีบริการ
                    </button>
                  </div>
                </div>

                {currentAvail === 'insufficient' && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800/60 text-[11px] space-y-1.5">
                    <div className="flex items-center gap-2">
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

  const filteredBookings = activeTab === 'pending'
    ? pendingList
    : activeTab === 'approved'
    ? approvedList
    : bookings;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare size={22} className="text-teal-600 dark:text-teal-400" />
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
              จัดการการจอง & อนุมัติ (Admin CRUD Management)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Admin สามารถเพิ่ม แก้ไขข้อมูลการจอง/อุปกรณ์ เปลี่ยนวัน/เวลา/ห้อง อนุมัติ ปฏิเสธ หรือลบรายการจองได้ทั้งหมด
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            รอดำเนินการ ({pendingList.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'approved'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            อนุมัติแล้ว ({approvedList.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({bookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-teal-600 dark:text-teal-400" />
            <span>
              {activeTab === 'pending'
                ? 'คำขอจองที่รอดำเนินการ (Pending Requests)'
                : activeTab === 'approved'
                ? 'รายการที่อนุมัติแล้ว (Approved Bookings)'
                : 'รายการการจองทั้งหมดในระบบ (All Bookings)'}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono font-normal">
            แสดง {filteredBookings.length} รายการ
          </span>
        </h3>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-semibold">
            ยังไม่มีข้อมูลในหมวดหมู่นี้
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-extrabold text-sm text-teal-700 dark:text-teal-300">
                      {b.booking_code}
                    </span>
                    <span
                      className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                        b.status === 'pending'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : b.status === 'approved' || b.status === 'in_use'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : b.status === 'completed'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}
                    >
                      {b.status === 'pending'
                        ? '🟡 รอดำเนินการ'
                        : b.status === 'approved'
                        ? '🔵 อนุมัติแล้ว'
                        : b.status === 'in_use'
                        ? '🟢 กำลังใช้งาน'
                        : b.status === 'completed'
                        ? '🔴 เสร็จสิ้น'
                        : '❌ ปฏิเสธ/ยกเลิก'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      ยื่นเมื่อ: {new Date(b.created_at).toLocaleString('th-TH')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="ลบรายการจอง (Admin)"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
                  
                  {/* Item Availability Panel */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        รายการวัสดุ/อุปกรณ์ (Admin ตรวจสอบสถานะ มี / ไม่มี):
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingItemsBooking(b)}
                        className="text-[11px] font-bold text-teal-600 hover:text-teal-700 underline"
                      >
                        ✏️ แก้ไขข้อมูลการจอง & อุปกรณ์ทั้งหมด
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

                {/* Actions Footer */}
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
                  <div className="flex flex-wrap gap-2 pt-1 justify-end items-center">
                    <button
                      onClick={() => openEditModal(b)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Edit size={14} />
                      <span>เปลี่ยนวัน/เวลา/ห้อง</span>
                    </button>

                    <button
                      onClick={() => setEditingItemsBooking(b)}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-teal-200 dark:border-teal-800"
                    >
                      <Edit size={14} />
                      <span>แก้ไขรายละเอียด/ผู้ขอ</span>
                    </button>

                    {b.status === 'pending' && (
                      <>
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
                          <span>อนุมัติการจอง</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDelete(b.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition"
                    >
                      <Trash2 size={14} />
                      <span>ลบการจอง</span>
                    </button>
                  </div>
                )}

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
                  className="flex-1 py-2 font-medium bg-slate-100 dark:bg-slate-800 rounded-xl"
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
