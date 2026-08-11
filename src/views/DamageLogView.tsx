import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  User,
  FileText,
  Calculator,
  X
} from 'lucide-react';
import { DamageLog, Booking } from '../types';
import { ImageUpload } from '../components/ImageUpload';

interface Props {
  damages: DamageLog[];
  bookings: Booking[];
  isAdmin: boolean;
  onSaveDamage: (damage: DamageLog) => void;
  onUpdateDamage?: (damage: DamageLog) => void;
  onDeleteDamage: (damageId: string) => void;
  onOpenAdminModal: () => void;
}

export const DamageLogView: React.FC<Props> = ({
  damages,
  bookings,
  isAdmin,
  onSaveDamage,
  onUpdateDamage,
  onDeleteDamage,
  onOpenAdminModal
}) => {
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<'consumable' | 'medical_equipment' | 'asset'>('asset');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(1500);
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Edit Modal State
  const [editingDamage, setEditingDamage] = useState<DamageLog | null>(null);
  const [editBookingId, setEditBookingId] = useState('');
  const [editItemName, setEditItemName] = useState('');
  const [editItemType, setEditItemType] = useState<'consumable' | 'medical_equipment' | 'asset'>('asset');
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editUnitPrice, setEditUnitPrice] = useState<number>(1000);
  const [editResponsiblePerson, setEditResponsiblePerson] = useState('');
  const [editNotes, setEditNotes] = useState('');

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
          <AlertTriangle size={32} />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          เมนูเฉพาะผู้ดูแลระบบ (ADMIN)
        </h3>
        <p className="text-xs text-slate-500">
          บันทึกรายการอุปกรณ์ ชำรุด สูญหาย คำนวณมูลค่าความเสียหาย และผู้รับผิดชอบ
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

  // Automatic calculation of total damage cost
  const calculatedTotal = quantity * unitPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const newRecord: DamageLog = {
      id: `dmg-${Date.now()}`,
      booking_id: selectedBookingId || 'N/A',
      item_name: itemName,
      item_type: itemType,
      quantity: Number(quantity),
      unit_price: Number(unitPrice),
      total_amount: calculatedTotal,
      responsible_person: responsiblePerson || 'ผู้ขอใช้ห้อง/กลุ่มนักศึกษา',
      notes,
      created_at: new Date().toISOString()
    };

    onSaveDamage(newRecord);

    setItemName('');
    setQuantity(1);
    setUnitPrice(1000);
    setNotes('');
  };

  const openEditModal = (d: DamageLog) => {
    setEditingDamage(d);
    setEditBookingId(d.booking_id || '');
    setEditItemName(d.item_name || '');
    setEditItemType(d.item_type || 'asset');
    setEditQuantity(d.quantity || 1);
    setEditUnitPrice(d.unit_price || 0);
    setEditResponsiblePerson(d.responsible_person || '');
    setEditNotes(d.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDamage) return;

    const updatedTotal = editQuantity * editUnitPrice;
    const updated: DamageLog = {
      ...editingDamage,
      booking_id: editBookingId,
      item_name: editItemName,
      item_type: editItemType,
      quantity: Number(editQuantity),
      unit_price: Number(editUnitPrice),
      total_amount: updatedTotal,
      responsible_person: editResponsiblePerson,
      notes: editNotes
    };

    if (onUpdateDamage) {
      onUpdateDamage(updated);
    }
    setEditingDamage(null);
  };

  const totalAllDamages = damages.reduce((sum, d) => sum + d.total_amount, 0);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle size={22} className="text-teal-600 dark:text-teal-400" />
            <span>เมนูบันทึกความเสียหาย (Damage Log)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            บันทึกรายการวัสดุ/อุปกรณ์ชำรุด สูญหาย คำนวณมูลค่าความเสียหายอัตโนมัติ และผู้รับผิดชอบ
          </p>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-2 rounded-2xl text-rose-800 dark:text-rose-300 font-bold text-xs shrink-0">
          มูลค่าความเสียหายรวม: {totalAllDamages.toLocaleString()} บาท
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b pb-3">
          บันทึกรายการความเสียหายใหม่
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">รายการจองที่เกี่ยวข้อง</label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
            >
              <option value="">-- ไม่ระบุ / เหตุการณ์ทั่วไป --</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  [{b.booking_code}] {b.requester_name} - {b.lab_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">ประเภทรายการ *</label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
            >
              <option value="asset">ครุภัณฑ์</option>
              <option value="medical_equipment">อุปกรณ์การแพทย์</option>
              <option value="consumable">วัสดุสิ้นเปลือง</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">ชื่อรายการอุปกรณ์ที่ชำรุด/สูญหาย *</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="เช่น หุ่นจำลองแขนฝึกฉีดยา / หูฟังตรวจ Stethoscope"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">จำนวนที่ชำรุด/สูญหาย *</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">ราคาต่อหน่วย (บาท) *</label>
            <input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              min={0}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              required
            />
          </div>

          <div className="sm:col-span-2 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800/40 flex items-center justify-between">
            <span className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
              <Calculator size={18} />
              <span>คำนวณมูลค่าความเสียหายรวมอัตโนมัติ:</span>
            </span>
            <span className="text-lg font-mono font-extrabold text-rose-700 dark:text-rose-300">
              {calculatedTotal.toLocaleString()} บาท
            </span>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">ผู้รับผิดชอบชดใช้ความเสียหาย *</label>
            <input
              type="text"
              value={responsiblePerson}
              onChange={(e) => setResponsiblePerson(e.target.value)}
              placeholder="เช่น นักศึกษาหลักสูตรพยาบาลศาสตรบัณฑิต กลุ่ม 2"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">หมายเหตุเพิ่มเติม</label>
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
              label="รูปภาพหลักฐานความเสียหาย (อัปโหลดไฟล์)"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-rose-500/20"
        >
          บันทึกรายการความเสียหาย
        </button>
      </form>

      {/* Damage Log List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          ตารางประวัติความเสียหายทั้งหมด ({damages.length} รายการ)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">รายการอุปกรณ์</th>
                <th className="p-3">จำนวน</th>
                <th className="p-3">ราคา/หน่วย</th>
                <th className="p-3">มูลค่ารวม</th>
                <th className="p-3">ผู้รับผิดชอบ</th>
                <th className="p-3">วันที่บันทึก</th>
                <th className="p-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {damages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                    ยังไม่มีข้อมูล
                  </td>
                </tr>
              ) : (
                damages.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {d.item_name}
                    </td>
                    <td className="p-3 font-mono font-bold">{d.quantity}</td>
                    <td className="p-3 font-mono">{d.unit_price.toLocaleString()} ฿</td>
                    <td className="p-3 font-mono font-extrabold text-rose-600">
                      {d.total_amount.toLocaleString()} ฿
                    </td>
                    <td className="p-3">{d.responsible_person}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {new Date(d.created_at).toLocaleDateString('th-TH')}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(d)}
                          className="p-1 text-teal-600 hover:text-teal-800 dark:text-teal-400"
                          title="แก้ไข"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('คุณต้องการลบรายการความเสียหายนี้ใช่หรือไม่?')) {
                              onDeleteDamage(d.id);
                            }
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700"
                          title="ลบ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Damage Modal */}
      {editingDamage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingDamage(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              แก้ไขรายการความเสียหาย (Admin)
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">ชื่อรายการอุปกรณ์ที่ชำรุด/สูญหาย</label>
                <input
                  type="text"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ประเภท</label>
                <select
                  value={editItemType}
                  onChange={(e) => setEditItemType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="asset">ครุภัณฑ์</option>
                  <option value="medical_equipment">อุปกรณ์การแพทย์</option>
                  <option value="consumable">วัสดุสิ้นเปลือง</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">จำนวน</label>
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(Number(e.target.value))}
                    min={1}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">ราคาต่อหน่วย (บาท)</label>
                  <input
                    type="number"
                    value={editUnitPrice}
                    onChange={(e) => setEditUnitPrice(Number(e.target.value))}
                    min={0}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl font-bold text-rose-800 dark:text-rose-200 flex justify-between">
                <span>มูลค่าความเสียหายรวม:</span>
                <span className="font-mono">{(editQuantity * editUnitPrice).toLocaleString()} บาท</span>
              </div>

              <div>
                <label className="block font-semibold mb-1">ผู้รับผิดชอบชดใช้</label>
                <input
                  type="text"
                  value={editResponsiblePerson}
                  onChange={(e) => setEditResponsiblePerson(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">หมายเหตุเพิ่มเติม</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDamage(null)}
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
