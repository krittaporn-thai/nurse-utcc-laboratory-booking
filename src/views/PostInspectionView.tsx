import React, { useState } from 'react';
import {
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { Booking, PostInspection } from '../types';
import { ImageUpload } from '../components/ImageUpload';

interface Props {
  bookings: Booking[];
  postInspections: PostInspection[];
  isAdmin: boolean;
  onSavePostInspection: (inspection: PostInspection) => void;
  onOpenAdminModal: () => void;
}

export const PostInspectionView: React.FC<Props> = ({
  bookings,
  postInspections,
  isAdmin,
  onSavePostInspection,
  onOpenAdminModal
}) => {
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [inspectorName, setInspectorName] = useState('กฤตพร ดวงใจ');
  const [inspectionDate, setInspectionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [consumablesStatus, setConsumablesStatus] = useState<'complete' | 'lost' | 'damaged'>('complete');
  const [equipmentStatus, setEquipmentStatus] = useState<'complete' | 'lost' | 'damaged'>('complete');
  const [assetsStatus, setAssetsStatus] = useState<'complete' | 'lost' | 'damaged'>('complete');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
          <PackageCheck size={32} />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          เมนูเฉพาะผู้ดูแลระบบ (ADMIN)
        </h3>
        <p className="text-xs text-slate-500">
          บันทึกการตรวจรับอุปกรณ์และครุภัณฑ์หลังใช้งาน
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

  const activeBookings = bookings.filter((b) => b.status === 'in_use' || b.status === 'approved' || b.status === 'completed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;

    const newRecord: PostInspection = {
      id: `post-${Date.now()}`,
      booking_id: selectedBookingId,
      inspection_date: inspectionDate,
      inspector_name: inspectorName,
      consumables_status: consumablesStatus,
      equipment_status: equipmentStatus,
      assets_status: assetsStatus,
      notes,
      images: imageUrl ? [imageUrl] : [],
      created_at: new Date().toISOString()
    };

    onSavePostInspection(newRecord);
    setSelectedBookingId('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PackageCheck size={22} className="text-teal-600 dark:text-teal-400" />
          <span>เมนูตรวจรับหลังใช้งาน (Post-Inspection)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          ตรวจสอบวัสดุสิ้นเปลือง อุปกรณ์การแพทย์ และครุภัณฑ์หลังใช้ (สถานะ: ครบถ้วน / สูญหาย / ชำรุด) พร้อมแนบรูปภาพ
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-3">
          บันทึกการตรวจรับหลังการใช้งาน
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">เลือกรายการจอง *</label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
              required
            >
              <option value="">-- เลือกรายการจอง --</option>
              {activeBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  [{b.booking_code}] {b.requester_name} - {b.lab_name} ({b.booking_date})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">วันที่ตรวจรับหลังใช้งาน *</label>
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

          {/* Status Selectors */}
          <div>
            <label className="block font-semibold mb-1">สถานะวัสดุสิ้นเปลือง</label>
            <select
              value={consumablesStatus}
              onChange={(e) => setConsumablesStatus(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            >
              <option value="complete">ครบถ้วนสมบูรณ์</option>
              <option value="lost">สูญหาย</option>
              <option value="damaged">ชำรุดเสียหาย</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">สถานะอุปกรณ์การแพทย์</label>
            <select
              value={equipmentStatus}
              onChange={(e) => setEquipmentStatus(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            >
              <option value="complete">ครบถ้วนสมบูรณ์</option>
              <option value="lost">สูญหาย</option>
              <option value="damaged">ชำรุดเสียหาย</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">สถานะครุภัณฑ์</label>
            <select
              value={assetsStatus}
              onChange={(e) => setAssetsStatus(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            >
              <option value="complete">ครบถ้วนสมบูรณ์</option>
              <option value="lost">สูญหาย</option>
              <option value="damaged">ชำรุดเสียหาย</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">หมายเหตุ / รายละเอียดความเสียหาย (ถ้ามี)</label>
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
              label="รูปภาพหลักฐานหลังใช้งาน (อัปโหลดไฟล์)"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs rounded-2xl shadow-md shadow-pink-500/20"
        >
          บันทึกผลการตรวจรับหลังใช้งาน (เปลี่ยนสถานะเป็น เสร็จสิ้น 🔴)
        </button>
      </form>

      {/* History List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          ประวัติการตรวจรับหลังใช้งาน ({postInspections.length} รายการ)
        </h3>

        <div className="space-y-3">
          {postInspections.length === 0 ? (
            <p className="text-center py-6 text-slate-400 text-xs font-semibold">ยังไม่มีข้อมูล</p>
          ) : (
            postInspections.map((p) => {
              const b = bookings.find((bk) => bk.id === p.booking_id);
              const hasIssue = p.consumables_status !== 'complete' || p.equipment_status !== 'complete' || p.assets_status !== 'complete';
              return (
                <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-pink-600 font-mono">
                      [{b ? b.booking_code : p.booking_id}] {b?.requester_name}
                    </span>
                    {hasIssue ? (
                      <span className="text-rose-600 font-bold bg-rose-100 px-2.5 py-0.5 rounded-full">
                        พบชำรุด / สูญหาย
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        ครบถ้วนสมบูรณ์ 🔴 (เสร็จสิ้น)
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>ผู้ตรวจรับ:</strong> {p.inspector_name} | <strong>วันที่:</strong> {p.inspection_date}
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
