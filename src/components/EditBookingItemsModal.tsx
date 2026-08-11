import React, { useState } from 'react';
import {
  X,
  Package,
  Stethoscope,
  Bed,
  AlertTriangle,
  Lock,
  Save,
  Calendar,
  Clock,
  ShieldCheck,
  Building2,
  User,
  FileText,
  Layers,
  GraduationCap,
  Users
} from 'lucide-react';
import { Booking, SelectedItem, Laboratory } from '../types';
import { CustomItemSection } from './CustomItemSection';
import {
  isWithin5BusinessDays,
  calculateBusinessDays,
  getAcademicYear,
  getAcademicYearPeriodText
} from '../lib/dateUtils';

interface Props {
  booking: Booking | null;
  isAdmin: boolean;
  labs?: Laboratory[];
  onClose: () => void;
  onSaveBookingItems: (updatedBooking: Booking) => void;
}

const FACULTY_OPTIONS = [
  'คณะพยาบาลศาสตร์',
  'คณะบริหารธุรกิจ',
  'คณะบัญชี',
  'คณะเศรษฐศาสตร์',
  'คณะมนุษยศาสตร์',
  'คณะวิทยาศาสตร์และเทคโนโลยี',
  'คณะนิเทศศาสตร์',
  'คณะวิศวกรรมศาสตร์',
  'คณะนิติศาสตร์',
  'คณะการท่องเที่ยวและอุตสาหกรรมบริการ',
  'คณะการศึกษาปฐมวัย',
  'คณะดิจิทัลอาร์ตและดีไซน์',
  'คณะวิทยพัฒน์',
  'คณะการสร้างเจ้าของธุรกิจสร้างสรรค์',
  'วิทยาลัยการศึกษาต่อเนื่อง',
  'International School of Management',
  '泰-中国际管理学院',
  'บัณฑิตวิทยาลัย',
  'Harbour.Space Institute of Technology',
  'หน่วยงาน/อื่นๆ'
];

export const EditBookingItemsModal: React.FC<Props> = ({
  booking,
  isAdmin,
  labs = [],
  onClose,
  onSaveBookingItems
}) => {
  if (!booking) return null;

  // Active Tab: 'details' (รายละเอียดห้อง & ผู้ขอ) or 'items' (วัสดุ/อุปกรณ์/ครุภัณฑ์)
  const [activeTab, setActiveTab] = useState<'details' | 'items'>('details');

  // Requester Info State
  const [requesterName, setRequesterName] = useState(booking.requester_name || '');
  const [department, setDepartment] = useState(booking.department || '');
  const [faculty, setFaculty] = useState(booking.faculty || 'คณะพยาบาลศาสตร์');
  const [phone, setPhone] = useState(booking.phone || '');
  const [email, setEmail] = useState(booking.email || '');

  // Lab Usage Details State
  const [labId, setLabId] = useState(booking.lab_id || '');
  const [labName, setLabName] = useState(booking.lab_name || '');
  const [bookingDate, setBookingDate] = useState(booking.booking_date || '');
  const [startTime, setStartTime] = useState(booking.start_time || '08:30');
  const [endTime, setEndTime] = useState(booking.end_time || '12:00');
  const [subjectCode, setSubjectCode] = useState(booking.subject_code || '');
  const [subjectName, setSubjectName] = useState(booking.subject_name || '');
  const [activityName, setActivityName] = useState(booking.activity_name || '');
  const [participantCount, setParticipantCount] = useState<number>(booking.participant_count || 1);
  const [objective, setObjective] = useState(booking.objective || '');

  // Items State
  const [consumables, setConsumables] = useState<SelectedItem[]>(booking.consumables || []);
  const [medicalEquipment, setMedicalEquipment] = useState<SelectedItem[]>(booking.medical_equipment || []);
  const [assets, setAssets] = useState<SelectedItem[]>(booking.assets || []);

  const businessDaysRemaining = calculateBusinessDays(booking.booking_date);
  const isLockedForUser = isWithin5BusinessDays(booking.booking_date) && !isAdmin;

  const handleSave = () => {
    if (isLockedForUser) return;

    // Determine lab_name from selected labId if labs array exists
    let updatedLabName = labName;
    if (labs && labs.length > 0) {
      const foundLab = labs.find((l) => l.id === labId);
      if (foundLab) {
        updatedLabName = `${foundLab.code} - ${foundLab.name}`;
      }
    }

    const resetAvailability = (items: SelectedItem[]) =>
      items.map((i) => ({ ...i, availability: i.availability || ('pending' as const) }));

    const updated: Booking = {
      ...booking,
      requester_name: requesterName,
      department,
      faculty,
      phone,
      email,

      lab_id: labId,
      lab_name: updatedLabName,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      subject_code: subjectCode,
      subject_name: subjectName,
      activity_name: activityName,
      participant_count: Number(participantCount) || 1,
      objective,

      consumables: isAdmin ? consumables : resetAvailability(consumables),
      medical_equipment: isAdmin ? medicalEquipment : resetAvailability(medicalEquipment),
      assets: isAdmin ? assets : resetAvailability(assets),
      status: isAdmin ? booking.status : 'pending',
    };

    onSaveBookingItems(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative my-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 pr-8">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-extrabold text-teal-700 dark:text-teal-300">
                {booking.booking_code}
              </span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-semibold">
                แก้ไขข้อมูลการจองห้องปฏิบัติการ
              </span>
              {isAdmin && (
                <span className="text-xs bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-amber-300 dark:border-amber-700">
                  <ShieldCheck size={13} /> สิทธิ์ Admin (แก้ไขได้ทุกส่วน)
                </span>
              )}
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-1">
              {labName || booking.lab_name} ({bookingDate || booking.booking_date})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ผู้ขอใช้: {requesterName || booking.requester_name} | รายวิชา: {subjectCode} {subjectName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* 5 Business Days Lock Banner for standard user */}
        {isLockedForUser ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 font-extrabold text-rose-800 dark:text-rose-300 text-sm">
              <Lock size={20} className="text-rose-600 shrink-0" />
              <span>ระบบปิดการแก้ไขข้อมูลอัตโนมัติ (เหลือน้อยกว่า 5 วันทำการ)</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              การแก้ไขข้อมูลการจองและวัสดุอุปกรณ์จะต้องดำเนินการล่วงหน้าอย่างน้อย <strong>5 วันทำการ</strong>
            </p>
            <p className="font-semibold text-rose-700 dark:text-rose-400">
              ขณะนี้เหลือเวลา {businessDaysRemaining} วันทำการ พ้นกำหนดการแก้ไขข้อมูลแล้ว เว้นแต่ได้รับการอนุมัติเป็นกรณีพิเศษจาก Admin (ผู้ดูแลระบบ)
            </p>
          </div>
        ) : (
          isAdmin && (
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800/80 rounded-2xl text-xs flex items-center gap-2 text-teal-900 dark:text-teal-200 font-medium">
              <ShieldCheck size={18} className="text-teal-600 shrink-0" />
              <span>
                เจ้าหน้าที่ผู้ดูแลระบบ (Admin) สามารถปรับเปลี่ยน รายละเอียดการใช้ห้อง, วันเวลา, ผู้ขอใช้, รายวิชา รวมถึงรายการวัสดุอุปกรณ์ได้ทั้งหมด
              </span>
            </div>
          )
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2.5 border-b-2 flex items-center justify-center gap-2 transition ${
              activeTab === 'details'
                ? 'border-teal-600 text-teal-700 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 size={16} />
            <span>1. รายละเอียดการใช้ห้อง & ผู้ขอใช้</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-2.5 border-b-2 flex items-center justify-center gap-2 transition ${
              activeTab === 'items'
                ? 'border-teal-600 text-teal-700 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-950/30'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Package size={16} />
            <span>2. รายการวัสดุ/อุปกรณ์/ครุภัณฑ์</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <div className={isLockedForUser ? 'opacity-60 pointer-events-none' : ''}>
          
          {/* TAB 1: รายละเอียดการใช้ห้องปฏิบัติการ & ผู้ขอใช้ */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-fadeIn text-xs">
              
              {/* Section 1: ข้อมูลผู้ขอใช้ */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs border-b border-slate-200 dark:border-slate-700 pb-2">
                  <User size={16} className="text-teal-600" />
                  <span>ข้อมูลผู้ขอใช้บริการ</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      ชื่อ-นามสกุลผู้ขอใช้ *
                    </label>
                    <input
                      type="text"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      สังกัดคณะ *
                    </label>
                    <select
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl"
                    >
                      {FACULTY_OPTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      หน่วยงาน / ภาควิชา *
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        เบอร์โทรศัพท์ *
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        อีเมล *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: รายละเอียดการใช้ห้องปฏิบัติการ */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs border-b border-slate-200 dark:border-slate-700 pb-2">
                  <Building2 size={16} className="text-teal-600" />
                  <span>รายละเอียดการใช้ห้องปฏิบัติการพยาบาล</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      ห้องปฏิบัติการ *
                    </label>
                    {labs && labs.length > 0 ? (
                      <select
                        value={labId}
                        onChange={(e) => setLabId(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-bold text-teal-700 dark:text-teal-300"
                      >
                        {labs.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.code} - {l.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={labName}
                        onChange={(e) => setLabName(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-bold"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      วันที่ใช้งาน *
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-mono font-bold"
                      required
                    />
                    {bookingDate && (
                      <p className="mt-1 text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 inline-block">
                        สังกัดปีการศึกษา {getAcademicYear(bookingDate)} ({getAcademicYearPeriodText(getAcademicYear(bookingDate))})
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        เวลาเริ่มต้น *
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        เวลาสิ้นสุด *
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        รหัสวิชา *
                      </label>
                      <input
                        type="text"
                        value={subjectCode}
                        onChange={(e) => setSubjectCode(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-mono font-bold"
                        placeholder="เช่น NS101"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        จำนวนผู้เข้าร่วม (คน) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={participantCount}
                        onChange={(e) => setParticipantCount(Number(e.target.value))}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      ชื่อรายวิชา *
                    </label>
                    <input
                      type="text"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl"
                      placeholder="เช่น การพยาบาลพื้นฐาน"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      ชื่อกิจกรรม / หัวข้อปฏิบัติการ *
                    </label>
                    <input
                      type="text"
                      value={activityName}
                      onChange={(e) => setActivityName(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl"
                      placeholder="เช่น ฝึกทักษะการฉีดยาและการให้สารน้ำทางหลอดเลือดดำ"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      วัตถุประสงค์การใช้ห้อง
                    </label>
                    <textarea
                      rows={2}
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border rounded-xl"
                      placeholder="เช่น เพื่อให้นักศึกษาได้ฝึกปฏิบัติจริงก่อนสอบ OSCA"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: รายการวัสดุ/อุปกรณ์/ครุภัณฑ์ */}
          {activeTab === 'items' && (
            <div className="space-y-4 animate-fadeIn">
              <CustomItemSection
                title="1. วัสดุสิ้นเปลือง"
                categoryLabel="วัสดุสิ้นเปลือง"
                icon={<Package size={18} className="text-amber-500" />}
                iconBgColor="bg-amber-50 text-amber-600"
                items={consumables}
                onChangeItems={setConsumables}
                placeholderName="ชื่อรายการ เช่น ถุงมือยาง / Alcohol Pad"
                placeholderUnit="หน่วยนับ เช่น คู่ / กล่อง / ชิ้น"
              />

              <CustomItemSection
                title="2. อุปกรณ์การแพทย์"
                categoryLabel="อุปกรณ์การแพทย์"
                icon={<Stethoscope size={18} className="text-blue-500" />}
                iconBgColor="bg-blue-50 text-blue-600"
                items={medicalEquipment}
                onChangeItems={setMedicalEquipment}
                placeholderName="ชื่อรายการ เช่น หูฟังการตรวจ / เครื่องวัดความดัน"
                placeholderUnit="หน่วยนับ เช่น อัน / เครื่อง"
              />

              <CustomItemSection
                title="3. ครุภัณฑ์"
                categoryLabel="ครุภัณฑ์"
                icon={<Bed size={18} className="text-purple-500" />}
                iconBgColor="bg-purple-50 text-purple-600"
                items={assets}
                onChangeItems={setAssets}
                placeholderName="ชื่อรายการ เช่น หุ่น CPR ผู้ใหญ่ / เตียงผู้ป่วย"
                placeholderUnit="หน่วยนับ เช่น ตัว / เตียง / ชุด"
              />
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
          >
            ยกเลิก
          </button>

          {!isLockedForUser && (
            <button
              type="button"
              onClick={handleSave}
              className="flex-2 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/20 transition flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>{isAdmin ? 'บันทึกการแก้ไขข้อมูลทั้งหมด (Admin)' : 'บันทึกข้อมูล และส่งให้ Admin ตรวจสอบ'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
