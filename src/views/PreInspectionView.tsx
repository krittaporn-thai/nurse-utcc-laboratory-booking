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
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { Booking, PreInspection } from '../types';
import { ImageUpload } from '../components/ImageUpload';

interface Props {
  bookings: Booking[];
  preInspections: PreInspection[];
  isAdmin: boolean;
  onSavePreInspection: (inspection: PreInspection) => void;
  onUpdatePreInspection?: (inspection: PreInspection) => void;
  onDeletePreInspection?: (inspectionId: string) => void;
  onOpenAdminModal: () => void;
}

export const PreInspectionView: React.FC<Props> = ({
  bookings,
  preInspections,
  isAdmin,
  onSavePreInspection,
  onUpdatePreInspection,
  onDeletePreInspection,
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

  // Edit Modal State
  const [editingInspection, setEditingInspection] = useState<PreInspection | null>(null);
  const [editInspectorName, setEditInspectorName] = useState('');
  const [editInspectionDate, setEditInspectionDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editConsumablesChecked, setEditConsumablesChecked] = useState(true);
  const [editEquipmentChecked, setEditEquipmentChecked] = useState(true);
  const [editAssetsChecked, setEditAssetsChecked] = useState(true);

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
    setNotes('');
    setImageUrl('');
  };

  const openEditModal = (p: PreInspection) => {
    setEditingInspection(p);
    setEditInspectorName(p.inspector_name || '');
    setEditInspectionDate(p.inspection_date || '');
    setEditNotes(p.notes || '');
    setEditImageUrl(p.images && p.images.length > 0 ? p.images[0] : '');
    setEditConsumablesChecked(p.consumables_checked ?? true);
    setEditEquipmentChecked(p.equipment_checked ?? true);
    setEditAssetsChecked(p.assets_checked ?? true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInspection) return;

    const updated: PreInspection = {
      ...editingInspection,
      inspector_name: editInspectorName,
      inspection_date: editInspectionDate,
      notes: editNotes,
      images: editImageUrl ? [editImageUrl] : [],
      consumables_checked: editConsumablesChecked,
      equipment_checked: editEquipmentChecked,
      assets_checked: editAssetsChecked
    };

    if (onUpdatePreInspection) {
      onUpdatePreInspection(updated);
    }
    setEditingInspection(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบรายการตรวจรับก่อนใช้งานนี้ใช่หรือไม่?')) {
      if (onDeletePreInspection) {
        onDeletePreInspection(id);
      }
    }
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
          บันทึกวันตรวจรับ ผู้ตรวจรับ รายการวัสดุสิ้นเปลือง อุปกรณ์การแพทย์ ครุภัณฑ์ และแนบรูปภาพก่อนเข้าใช้งาน
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

          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border">
            <label className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={consumablesChecked}
                onChange={(e) => setConsumablesChecked(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600"
              />
              <span>ตรวจวัสดุสิ้นเปลืองแล้ว</span>
            </label>

            <label className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={equipmentChecked}
                onChange={(e) => setEquipmentChecked(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600"
              />
              <span>ตรวจอุปกรณ์การแพทย์แล้ว</span>
            </label>

            <label className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={assetsChecked}
                onChange={(e) => setAssetsChecked(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600"
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
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-teal-600/20"
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
                  <div className="flex items-center justify-between font-bold flex-wrap gap-2">
                    <span className="text-teal-600 dark:text-teal-400 font-mono">
                      [{b ? b.booking_code : p.booking_id}] {b?.requester_name || 'ผู้ใช้'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                        <CheckCircle2 size={14} />
                        ผ่านการตรวจรับ ({p.inspection_date})
                      </span>
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
                    <strong>ผู้ตรวจรับ:</strong> {p.inspector_name} | <strong>ห้อง:</strong> {b?.lab_name || '-'}
                  </p>
                  {p.notes && <p className="text-slate-500 italic">"{p.notes}"</p>}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit PreInspection Modal */}
      {editingInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingInspection(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              แก้ไขบันทึกการตรวจรับก่อนใช้งาน (Admin)
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

              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border">
                <label className="flex items-center gap-2 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editConsumablesChecked}
                    onChange={(e) => setEditConsumablesChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span>ตรวจวัสดุสิ้นเปลืองแล้ว</span>
                </label>
                <label className="flex items-center gap-2 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editEquipmentChecked}
                    onChange={(e) => setEditEquipmentChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span>ตรวจอุปกรณ์การแพทย์แล้ว</span>
                </label>
                <label className="flex items-center gap-2 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editAssetsChecked}
                    onChange={(e) => setEditAssetsChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span>ตรวจครุภัณฑ์แล้ว</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold mb-1">หมายเหตุ / ผลการตรวจรับ</label>
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
                  label="รูปภาพการตรวจรับ"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingInspection(null)}
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
