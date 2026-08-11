import React, { useState } from 'react';
import {
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  User,
  Image as ImageIcon,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { Booking, PostInspection } from '../types';
import { ImageUpload } from '../components/ImageUpload';

interface Props {
  bookings: Booking[];
  postInspections: PostInspection[];
  isAdmin: boolean;
  onSavePostInspection: (inspection: PostInspection) => void;
  onUpdatePostInspection?: (inspection: PostInspection) => void;
  onDeletePostInspection?: (inspectionId: string) => void;
  onOpenAdminModal: () => void;
}

export const PostInspectionView: React.FC<Props> = ({
  bookings,
  postInspections,
  isAdmin,
  onSavePostInspection,
  onUpdatePostInspection,
  onDeletePostInspection,
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

  // Edit Modal State
  const [editingPostInspection, setEditingPostInspection] = useState<PostInspection | null>(null);
  const [editInspectorName, setEditInspectorName] = useState('');
  const [editInspectionDate, setEditInspectionDate] = useState('');
  const [editConsumablesStatus, setEditConsumablesStatus] = useState<'complete' | 'lost' | 'damaged'>('complete');
  const [editEquipmentStatus, setEditEquipmentStatus] = useState<'complete' | 'lost' | 'damaged'>('complete');
  const [editAssetsStatus, setEditAssetsStatus] = useState<'complete' | 'lost' | 'damaged'>('complete');
  const [editNotes, setEditNotes] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

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
    setNotes('');
    setImageUrl('');
  };

  const openEditModal = (p: PostInspection) => {
    setEditingPostInspection(p);
    setEditInspectorName(p.inspector_name || '');
    setEditInspectionDate(p.inspection_date || '');
    setEditConsumablesStatus(p.consumables_status || 'complete');
    setEditEquipmentStatus(p.equipment_status || 'complete');
    setEditAssetsStatus(p.assets_status || 'complete');
    setEditNotes(p.notes || '');
    setEditImageUrl(p.images && p.images.length > 0 ? p.images[0] : '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPostInspection) return;

    const updated: PostInspection = {
      ...editingPostInspection,
      inspector_name: editInspectorName,
      inspection_date: editInspectionDate,
      consumables_status: editConsumablesStatus,
      equipment_status: editEquipmentStatus,
      assets_status: editAssetsStatus,
      notes: editNotes,
      images: editImageUrl ? [editImageUrl] : []
    };

    if (onUpdatePostInspection) {
      onUpdatePostInspection(updated);
    }
    setEditingPostInspection(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบรายการตรวจรับหลังใช้งานนี้ใช่หรือไม่?')) {
      if (onDeletePostInspection) {
        onDeletePostInspection(id);
      }
    }
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
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-teal-600/20"
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
                  <div className="flex items-center justify-between font-bold flex-wrap gap-2">
                    <span className="text-teal-600 dark:text-teal-400 font-mono">
                      [{b ? b.booking_code : p.booking_id}] {b?.requester_name || 'ผู้ใช้'}
                    </span>
                    <div className="flex items-center gap-2">
                      {hasIssue ? (
                        <span className="text-rose-600 font-bold bg-rose-100 px-2.5 py-0.5 rounded-full">
                          พบชำรุด / สูญหาย
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          ครบถ้วนสมบูรณ์ 🔴
                        </span>
                      )}
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 bg-teal-100 hover:bg-teal-200 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Edit size={12} /> แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 size={12} /> ลบ
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>ผู้ตรวจรับ:</strong> {p.inspector_name} | <strong>วันที่:</strong> {p.inspection_date}
                  </p>
                  {p.notes && <p className="text-slate-500 italic">"{p.notes}"</p>}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit PostInspection Modal */}
      {editingPostInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingPostInspection(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              แก้ไขบันทึกการตรวจรับหลังใช้งาน (Admin)
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">วันที่ตรวจรับ</label>
                <input
                  type="date"
                  value={editInspectionDate}
                  onChange={(e) => setEditInspectionDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ผู้ตรวจรับ</label>
                <input
                  type="text"
                  value={editInspectorName}
                  onChange={(e) => setEditInspectorName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">สถานะวัสดุสิ้นเปลือง</label>
                <select
                  value={editConsumablesStatus}
                  onChange={(e) => setEditConsumablesStatus(e.target.value as any)}
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
                  value={editEquipmentStatus}
                  onChange={(e) => setEditEquipmentStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="complete">ครบถ้วนสมบูรณ์</option>
                  <option value="lost">สูญหาย</option>
                  <option value="damaged">ชำรุดเสียหาย</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">สถานะครุภัณฑ์</label>
                <select
                  value={editAssetsStatus}
                  onChange={(e) => setEditAssetsStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="complete">ครบถ้วนสมบูรณ์</option>
                  <option value="lost">สูญหาย</option>
                  <option value="damaged">ชำรุดเสียหาย</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">หมายเหตุ / รายละเอียดความเสียหาย</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                ></textarea>
              </div>

              <div>
                <ImageUpload
                  value={editImageUrl}
                  onChange={setEditImageUrl}
                  label="รูปภาพหลักฐานหลังใช้งาน"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPostInspection(null)}
                  className="flex-1 py-2 font-medium bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-bold text-white bg-teal-600 rounded-xl shadow-md"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
