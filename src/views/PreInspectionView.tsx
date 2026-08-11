import React, { useState } from 'react';
import {
  FileCheck2,
  Calendar,
  CheckCircle2,
  User,
  Image as ImageIcon,
  CheckSquare,
  Clock,
  Plus,
  X
} from 'lucide-react';
import { Booking, PreInspection } from '../types';
import { ImageUpload } from '../components/ImageUpload';

interface Props {
  bookings: Booking[];
  preInspections: PreInspection[];
  isAdmin: boolean;
  onSavePreInspection: (inspection: PreInspection) => void;
  onOpenAdminModal: () => void;
}

export const PreInspectionView: React.FC<Props> = ({
  bookings,
  preInspections,
  isAdmin,
  onSavePreInspection,
  onOpenAdminModal
}) => {
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [inspectorName, setInspectorName] = useState('กฤตพร ดวงใจ');
  const [inspectionDate, setInspectionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [consumablesChecked, setConsumablesChecked] = useState(true);
  const [equipmentChecked, setEquipmentChecked] = useState(true);
  const [assetsChecked, setAssetsChecked] = useState(true);

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
          <FileCheck2 size={32} />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          เมนูเฉพาะผู้ดูแลระบบ (ADMIN)
        </h3>
        <p className="text-xs text-slate-500">
          บันทึกการตรวจรับวัสดุและอุปกรณ์ล่วงหน้าก่อนวันใช้งาน
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

  const approvedBookings = bookings.filter((b) => b.status === 'approved' || b.status === 'in_use' || b.status === 'completed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;

    const newRecord: PreInspection = {
      id: `pre-${Date.now()}`,
      booking_id: selectedBookingId,
      inspection_date: inspectionDate,
      inspector_name: inspectorName,
      notes,
      images: imageUrl ? [imageUrl] : [],
      consumables_checked: consumablesChecked,
      equipment_checked: equipmentChecked,
      assets_checked: assetsChecked,
      status: 'pass',
      created_at: new Date().toISOString()
    };

    onSavePreInspection(newRecord);
    setSelectedBookingId('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCheck2 size={22} className="text-teal-600 dark:text-teal-400" />
          <span>เมนูตรวจรับก่อนใช้งาน (Pre-Inspection)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          บันทึกวันตรวจรับ ผู้ตรวจรับ รายการวัสดุสิ้นเปลือง อุปกรณ์การแพทย์ ครุภัณฑ์ และแนบรูปภาพก่อนเข้าใช้งาน 7 วันทำการ
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-3">
          บันทึกการตรวจรับล่วงหน้า
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">เลือกรายการจองที่ต้องการตรวจรับ *</label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
              required
            >
              <option value="">-- เลือกรายการจอง --</option>
              {approvedBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  [{b.booking_code}] {b.requester_name} - {b.lab_name} ({b.booking_date})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">วันที่ตรวจรับ *</label>
            <input
              type="date"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">ผู้ตรวจรับ (เจ้าหน้าที่) *</label>
            <input
              type="text"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              required
            />
          </div>

          <div className="sm:col-span-2 grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border">
            <label className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={consumablesChecked}
                onChange={(e) => setConsumablesChecked(e.target.checked)}
                className="w-4 h-4 rounded text-pink-600"
              />
              <span>ตรวจวัสดุสิ้นเปลืองแล้ว</span>
            </label>

            <label className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={equipmentChecked}
                onChange={(e) => setEquipmentChecked(e.target.checked)}
                className="w-4 h-4 rounded text-pink-600"
              />
              <span>ตรวจอุปกรณ์การแพทย์แล้ว</span>
            </label>

            <label className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={assetsChecked}
                onChange={(e) => setAssetsChecked(e.target.checked)}
                className="w-4 h-4 rounded text-pink-600"
              />
              <span>ตรวจครุภัณฑ์แล้ว</span>
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">หมายเหตุ / ผลการตรวจรับ</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            ></textarea>
          </div>

          <div className="sm:col-span-2">
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="รูปภาพการตรวจรับก่อนใช้งาน (อัปโหลดไฟล์)"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs rounded-2xl shadow-md shadow-pink-500/20"
        >
          บันทึกผลการตรวจรับก่อนใช้งาน
        </button>
      </form>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          ประวัติการตรวจรับก่อนใช้งาน ({preInspections.length} รายการ)
        </h3>

        <div className="space-y-3">
          {preInspections.length === 0 ? (
            <p className="text-center py-6 text-slate-400 text-xs font-semibold">ยังไม่มีข้อมูล</p>
          ) : (
            preInspections.map((p) => {
            const b = bookings.find((bk) => bk.id === p.booking_id);
            return (
              <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-pink-600 font-mono">
                    [{b ? b.booking_code : p.booking_id}] {b?.requester_name}
                  </span>
                  <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={14} />
                    ผ่านการตรวจรับแล้ว ({p.inspection_date})
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  <strong>ผู้ตรวจรับ:</strong> {p.inspector_name} | <strong>ห้อง:</strong> {b?.lab_name}
                </p>
                <p className="text-slate-500 italic">"{p.notes}"</p>
              </div>
            );
            })
          )}
        </div>
      </div>

    </div>
  );
};
