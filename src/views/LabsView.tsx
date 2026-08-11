import React, { useState } from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  X,
  CalendarPlus,
  Info
} from 'lucide-react';
import { Laboratory } from '../types';
import { ImageUpload } from '../components/ImageUpload';

interface Props {
  labs: Laboratory[];
  isAdmin: boolean;
  onAddLab: (lab: Laboratory) => void;
  onEditLab: (lab: Laboratory) => void;
  onDeleteLab: (labId: string) => void;
  onReserveLab: (labId: string) => void;
  onOpenAdminModal: () => void;
}

const DEFAULT_LAB_IMAGE = 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80';

export const LabsView: React.FC<Props> = ({
  labs,
  isAdmin,
  onAddLab,
  onEditLab,
  onDeleteLab,
  onReserveLab,
  onOpenAdminModal
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Laboratory | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('อาคารเฉลิมพระเกียรติ (อาคาร 3)');
  const [floor, setFloor] = useState('ชั้น 4');
  const [capacity, setCapacity] = useState(40);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isReady, setIsReady] = useState(true);

  const openCreateModal = () => {
    setEditingLab(null);
    setCode(`NLAB-${101 + labs.length}`);
    setName('');
    setBuilding('อาคารเฉลิมพระเกียรติ (อาคาร 3)');
    setFloor('ชั้น 4');
    setCapacity(40);
    setDescription('');
    setImageUrl('');
    setIsReady(true);
    setIsModalOpen(true);
  };

  const openEditModal = (lab: Laboratory) => {
    setEditingLab(lab);
    setCode(lab.code);
    setName(lab.name);
    setBuilding(lab.building);
    setFloor(lab.floor);
    setCapacity(lab.capacity);
    setDescription(lab.description);
    setImageUrl(lab.image_url || '');
    setIsReady(lab.is_ready);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const labData: Laboratory = {
      id: editingLab ? editingLab.id : `lab-${Date.now()}`,
      code: code || `NLAB-${Date.now()}`,
      name,
      building,
      floor,
      capacity: Number(capacity),
      description,
      image_url: imageUrl || DEFAULT_LAB_IMAGE,
      is_ready: isReady,
      created_at: editingLab ? editingLab.created_at : new Date().toISOString()
    };

    if (editingLab) {
      onEditLab(labData);
    } else {
      onAddLab(labData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 size={22} className="text-teal-600 dark:text-teal-400" />
            <span>ข้อมูลห้องปฏิบัติการพยาบาล ({labs.length} ห้อง)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            แสดงข้อมูลอาคาร ชั้น ความจุผู้ใช้งาน และสถานะความพร้อมของแต่ละห้อง
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition active:scale-95 shrink-0"
          >
            <Plus size={16} />
            <span>เพิ่มห้องปฏิบัติการใหม่</span>
          </button>
        ) : (
          <button
            onClick={onOpenAdminModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold rounded-xl transition shrink-0"
          >
            <Info size={14} className="text-teal-600 dark:text-teal-400" />
            <span>เข้าสู่ระบบ ADMIN เพื่อจัดการห้อง</span>
          </button>
        )}
      </div>

      {/* Labs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {labs.map((lab) => (
          <div
            key={lab.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
          >
            {/* Image Header */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={lab.image_url || DEFAULT_LAB_IMAGE}
                alt={lab.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_LAB_IMAGE;
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider">
                  {lab.code}
                </span>
                {lab.is_ready ? (
                  <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <CheckCircle2 size={12} />
                    พร้อมใช้งาน
                  </span>
                ) : (
                  <span className="bg-amber-600 text-white px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <AlertCircle size={12} />
                    งดใช้ชั่วคราว
                  </span>
                )}
              </div>

              {/* Admin Actions Overlay */}
              {isAdmin && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl">
                  <button
                    onClick={() => openEditModal(lab)}
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition"
                    title="แก้ไขข้อมูลห้อง"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`ยืนยันการลบห้องปฏิบัติการ ${lab.name}?`)) {
                        onDeleteLab(lab.id);
                      }
                    }}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition"
                    title="ลบห้อง"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base leading-snug">
                  {lab.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {lab.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>{lab.building} - {lab.floor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>รองรับความจุได้สูงสุด {lab.capacity} คน</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onReserveLab(lab.id)}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-teal-600/20 transition flex items-center justify-center gap-2"
              >
                <CalendarPlus size={16} />
                <span>จองห้องปฏิบัติการนี้</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Add/Edit Lab Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="text-teal-600 dark:text-teal-400" size={20} />
              <span>{editingLab ? 'แก้ไขห้องปฏิบัติการ' : 'เพิ่มห้องปฏิบัติการใหม่'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">รหัสห้อง *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">ชื่อห้องปฏิบัติการ *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น ห้องปฏิบัติการพยาบาลเด็ก"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">อาคาร</label>
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">ชั้น</label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">ความจุผู้ใช้งาน (คน)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    min={1}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">สถานะห้อง</label>
                  <select
                    value={isReady ? 'ready' : 'maintenance'}
                    onChange={(e) => setIsReady(e.target.value === 'ready')}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="ready">พร้อมใช้งาน</option>
                    <option value="maintenance">งดใช้ชั่วคราว</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">รายละเอียดห้อง</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="อธิบายรายละเอียดทักษะที่ใช้ หรือลักษณะห้อง..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              {/* Image Upload Field */}
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                label="รูปภาพประจำห้องปฏิบัติการ (อัปโหลดไฟล์)"
              />

              <div className="pt-3 flex items-center justify-between gap-3">
                {editingLab && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`คุณแน่ใจหรือไม่ที่จะลบห้องปฏิบัติการ ${editingLab.name}?`)) {
                        onDeleteLab(editingLab.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="px-3.5 py-2.5 font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Trash2 size={15} />
                    <span>ลบห้อง</span>
                  </button>
                )}
                <div className="flex-1 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition active:scale-95"
                  >
                    บันทึกข้อมูลห้อง
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
