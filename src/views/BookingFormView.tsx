import React, { useState, useEffect } from 'react';
import {
  CalendarPlus,
  User,
  Building,
  Mail,
  Phone,
  BookOpen,
  Clock,
  Package,
  Stethoscope,
  Bed,
  AlertTriangle,
  Send,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Laboratory, SelectedItem, Booking } from '../types';
import { CustomItemSection } from '../components/CustomItemSection';
import { getAcademicYear, getAcademicYearPeriodText } from '../lib/dateUtils';

interface Props {
  labs: Laboratory[];
  preSelectedLabId?: string;
  isAdmin?: boolean;
  onSubmitBooking: (booking: Booking) => void;
  onCancel: () => void;
}

export const BookingFormView: React.FC<Props> = ({
  labs,
  preSelectedLabId,
  isAdmin = false,
  onSubmitBooking,
  onCancel
}) => {
  // Requester State
  const [requesterName, setRequesterName] = useState(isAdmin ? 'กฤตพร ดวงใจ' : '');
  const [department, setDepartment] = useState('คณะพยาบาลศาสตร์');
  const [faculty, setFaculty] = useState('คณะพยาบาลศาสตร์');
  const [phone, setPhone] = useState('6858 หรือ 6857');
  const [email, setEmail] = useState(isAdmin ? 'nurse_lab@utcc.ac.th' : '');

  // Usage State
  const [subjectCode, setSubjectCode] = useState(isAdmin ? 'NURSE-LAB' : '');
  const [subjectName, setSubjectName] = useState(isAdmin ? 'การใช้งานห้องปฏิบัติการพยาบาล' : '');
  const [activityName, setActivityName] = useState(isAdmin ? 'กิจกรรมการพยาบาล / การสอน' : '');
  const [objective, setObjective] = useState('');
  const [participantCount, setParticipantCount] = useState<number>(30);
  const [labId, setLabId] = useState<string>(preSelectedLabId || (labs[0]?.id || ''));
  
  // Default date: Today for Admin, +7 days for standard user
  const defaultDateStr = isAdmin
    ? new Date().toISOString().split('T')[0]
    : new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
    
  const [bookingDate, setBookingDate] = useState<string>(defaultDateStr);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');

  // Custom Items State
  const [consumables, setConsumables] = useState<SelectedItem[]>([]);
  const [medicalEquipment, setMedicalEquipment] = useState<SelectedItem[]>([]);
  const [assets, setAssets] = useState<SelectedItem[]>([]);

  // Condition Acceptance Modal & Checkbox State
  const [termsAccepted, setTermsAccepted] = useState(isAdmin); // Auto-accept terms for Admin
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (preSelectedLabId) {
      setLabId(preSelectedLabId);
    }
  }, [preSelectedLabId]);

  const selectedLab = labs.find((l) => l.id === labId);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    // Standard User required fields check
    if (!isAdmin) {
      if (
        !requesterName.trim() ||
        !email.trim() ||
        !phone.trim() ||
        !subjectCode.trim() ||
        !subjectName.trim() ||
        !activityName.trim()
      ) {
        setErrorMsg('กรุณากรอกข้อมูลผู้ขอใช้และรายละเอียดการใช้งานให้ครบถ้วน');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (!termsAccepted) {
        setShowConditionModal(true);
        return;
      }
    }

    // Admin minimal requirements check: labId, bookingDate, startTime, endTime
    if (!labId || !bookingDate || !startTime || !endTime) {
      setErrorMsg('กรุณาระบุห้อง วันที่ และเวลาใช้งานให้ครบถ้วน');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      booking_code: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
      requester_name: requesterName.trim() || 'ผู้ใช้บริการทั่วไป',
      department: department || 'คณะพยาบาลศาสตร์',
      faculty: faculty || 'คณะพยาบาลศาสตร์',
      phone: phone.trim() || '6858 หรือ 6857',
      email: email.trim() || 'user@utcc.ac.th',
      subject_code: subjectCode.trim() || 'NS-REQ',
      subject_name: subjectName.trim() || 'ขอใช้ห้องปฏิบัติการ',
      activity_name: activityName.trim() || 'กิจกรรมการเรียนการสอน',
      objective: objective.trim(),
      participant_count: Number(participantCount) || 1,
      lab_id: labId,
      lab_name: selectedLab ? selectedLab.name : 'ห้องปฏิบัติการพยาบาล',
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      status: isAdmin ? 'approved' : 'pending', // Auto-approve if created by Admin
      consumables: consumables.filter(i => i.name.trim()),
      medical_equipment: medicalEquipment.filter(i => i.name.trim()),
      assets: assets.filter(i => i.name.trim()),
      terms_accepted: true,
      created_at: new Date().toISOString()
    };

    // Confetti effect
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onSubmitBooking(newBooking);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fadeIn">
      
      {/* Form Title Banner */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-700 rounded-3xl p-6 text-white shadow-xl shadow-teal-900/20 border border-teal-600/40 relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
            <CalendarPlus size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">
                แบบฟอร์มขอจองห้องปฏิบัติการพยาบาล
              </h2>
              {isAdmin && (
                <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase flex items-center gap-1 shadow-xs">
                  <ShieldCheck size={12} /> สิทธิ์ Admin (ผู้ดูแลระบบ)
                </span>
              )}
            </div>
            <p className="text-xs text-teal-100 mt-1">
              {isAdmin
                ? 'Admin สามารถสร้างรายการจองแทนผู้ใช้ (จองย้อนหลัง/วันปัจจุบัน/ล่วงหน้า) โดยกรอกข้อมูลขั้นต่ำได้ทันที'
                : 'ผู้ใช้งานทั่วไปสามารถจองห้องและระบุรายการวัสดุ/อุปกรณ์ด้วยตนเอง'}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Privilege Explanation Banner */}
      {isAdmin && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center gap-2 font-extrabold text-amber-900 dark:text-amber-200 text-sm">
            <ShieldCheck size={18} className="text-amber-600 shrink-0" />
            <span>สิทธิ์พิเศษสำหรับผู้ดูแลระบบ (Admin)</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
            <li>สามารถจองย้อนหลัง (เพื่อเก็บสถิติ), จองวันปัจจุบัน (กรณีเร่งด่วน), หรือจองล่วงหน้าได้โดยไม่มีข้อจำกัด</li>
            <li>สามารถบันทึกรายการจองได้ทันทีแม้กรอกข้อมูลไม่ครบทุกช่อง (ขั้นต่ำระบุเพียง ห้อง, วันที่ และเวลา)</li>
            <li>รายการจะได้รับสิทธิ์อนุมัติทันทีโดยอัตโนมัติ</li>
          </ul>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle size={18} className="text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitForm} className="space-y-6">
        
        {/* Section 1: ข้อมูลผู้ขอใช้ (Requester Info) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-base font-display font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="flex items-center gap-2">
              <User size={18} className="text-teal-600 dark:text-teal-400" />
              <span>1. ข้อมูลผู้ขอใช้ห้องปฏิบัติการ</span>
            </span>
            {isAdmin && <span className="text-[11px] text-amber-600 font-bold">(ไม่บังคับสำหรับ Admin)</span>}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                ชื่อ-นามสกุล {!isAdmin && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="เช่น อ.ดร.กมลวรรณ บุญมี"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                required={!isAdmin}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                คณะ {!isAdmin && <span className="text-rose-500">*</span>}
              </label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              >
                <option value="คณะบริหารธุรกิจ">คณะบริหารธุรกิจ</option>
                <option value="คณะบัญชี">คณะบัญชี</option>
                <option value="คณะเศรษฐศาสตร์">คณะเศรษฐศาสตร์</option>
                <option value="คณะมนุษยศาสตร์">คณะมนุษยศาสตร์</option>
                <option value="คณะวิทยาศาสตร์และเทคโนโลยี">คณะวิทยาศาสตร์และเทคโนโลยี</option>
                <option value="คณะนิเทศศาสตร์">คณะนิเทศศาสตร์</option>
                <option value="คณะวิศวกรรมศาสตร์">คณะวิศวกรรมศาสตร์</option>
                <option value="คณะนิติศาสตร์">คณะนิติศาสตร์</option>
                <option value="คณะการท่องเที่ยวและอุตสาหกรรมบริการ">คณะการท่องเที่ยวและอุตสาหกรรมบริการ</option>
                <option value="คณะการศึกษาปฐมวัย">คณะการศึกษาปฐมวัย</option>
                <option value="คณะดิจิทัลอาร์ตและดีไซน์">คณะดิจิทัลอาร์ตและดีไซน์</option>
                <option value="คณะพยาบาลศาสตร์">คณะพยาบาลศาสตร์</option>
                <option value="คณะวิทยพัฒน์">คณะวิทยพัฒน์</option>
                <option value="คณะการสร้างเจ้าของธุรกิจสร้างสรรค์">คณะการสร้างเจ้าของธุรกิจสร้างสรรค์</option>
                <option value="วิทยาลัยการศึกษาต่อเนื่อง">วิทยาลัยการศึกษาต่อเนื่อง</option>
                <option value="International School of Management">International School of Management</option>
                <option value="泰-中国际管理学院">泰-中国际管理学院</option>
                <option value="บัณฑิตวิทยาลัย">บัณฑิตวิทยาลัย</option>
                <option value="Harbour.Space Institute of Technology">Harbour.Space Institute of Technology</option>
                <option value="หน่วยงาน/อื่นๆ">หน่วยงาน/อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                หน่วยงาน / ภาควิชา {!isAdmin && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="เช่น คณะพยาบาลศาสตร์"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required={!isAdmin}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                เบอร์โทรศัพท์ติดต่อ {!isAdmin && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="6858 หรือ 6857"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required={!isAdmin}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                อีเมลสำหรับรับผลอนุมัติ (E-mail) {!isAdmin && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="เช่น instructor@utcc.ac.th"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required={!isAdmin}
              />
            </div>
          </div>
        </div>

        {/* Section 2: ข้อมูลการใช้งาน (Usage Details) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="flex items-center gap-2">
              <BookOpen size={18} className="text-rose-500" />
              <span>2. ข้อมูลการขอใช้ห้องและเวลา</span>
            </span>
            {isAdmin && <span className="text-[11px] text-emerald-600 font-bold">(บังคับเฉพาะ ห้อง, วันที่, เวลา)</span>}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                ห้องปฏิบัติการที่ต้องการใช้ <span className="text-rose-500">*</span>
              </label>
              <select
                value={labId}
                onChange={(e) => setLabId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                required
              >
                {labs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} - {l.name} ({l.building})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                จำนวนผู้เข้าร่วม (คน)
              </label>
              <input
                type="number"
                value={participantCount}
                onChange={(e) => setParticipantCount(Number(e.target.value))}
                min={1}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                รหัสวิชา {!isAdmin && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                placeholder="เช่น NS101"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                required={!isAdmin}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                ชื่อรายวิชา {!isAdmin && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="เช่น การพยาบาลพื้นฐาน 1"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required={!isAdmin}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                ชื่อกิจกรรม {!isAdmin && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="เช่น สอบปฏิบัติการทำแผล aseptic technique"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required={!isAdmin}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                วัตถุประสงค์ในการขอใช้ห้อง
              </label>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={2}
                placeholder="อธิบายวัตถุประสงค์สั้นๆ"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              ></textarea>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                วันที่ต้องการใช้งาน <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                required
              />
              {bookingDate && (
                <p className="mt-1.5 text-xs text-teal-700 dark:text-teal-300 font-semibold flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/60 p-2 rounded-xl border border-teal-200 dark:border-teal-800">
                  <span className="font-extrabold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700">
                    ปีการศึกษา {getAcademicYear(bookingDate)}
                  </span>
                  <span>({getAcademicYearPeriodText(getAcademicYear(bookingDate))})</span>
                </p>
              )}
              {isAdmin && (
                <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                  * Admin เลือกได้ทั้ง วันที่ย้อนหลัง, วันปัจจุบัน, หรือวันล่วงหน้า
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  เวลาเริ่ม <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  เวลาสิ้นสุด <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>
            </div>

          </div>
        </div>

        {/* Freeform Items Sections */}
        <CustomItemSection
          title="3. วัสดุสิ้นเปลืองที่ต้องการใช้"
          categoryLabel="วัสดุสิ้นเปลือง"
          icon={<Package size={18} className="text-amber-500" />}
          iconBgColor="bg-amber-50 text-amber-600"
          items={consumables}
          onChangeItems={setConsumables}
          placeholderName="ชื่อรายการ เช่น ถุงมือยาง / Alcohol Pad"
          placeholderUnit="หน่วยนับ เช่น คู่ / กล่อง / ชิ้น"
        />

        <CustomItemSection
          title="4. อุปกรณ์การแพทย์ที่ต้องการยืม"
          categoryLabel="อุปกรณ์การแพทย์"
          icon={<Stethoscope size={18} className="text-blue-500" />}
          iconBgColor="bg-blue-50 text-blue-600"
          items={medicalEquipment}
          onChangeItems={setMedicalEquipment}
          placeholderName="ชื่อรายการ เช่น หูฟังการตรวจ / เครื่องวัดความดัน"
          placeholderUnit="หน่วยนับ เช่น อัน / เครื่อง"
        />

        <CustomItemSection
          title="5. ครุภัณฑ์ที่ต้องการยืม"
          categoryLabel="ครุภัณฑ์"
          icon={<Bed size={18} className="text-purple-500" />}
          iconBgColor="bg-purple-50 text-purple-600"
          items={assets}
          onChangeItems={setAssets}
          placeholderName="ชื่อรายการ เช่น หุ่น CPR ผู้ใหญ่ / เตียงผู้ป่วย"
          placeholderUnit="หน่วยนับ เช่น ตัว / เตียง / ชุด"
        />

        {/* Section 6: เงื่อนไขก่อนเข้าใช้ห้อง (Mandatory 7-Day Pre-condition Warning) */}
        <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs text-amber-950 dark:text-amber-200">
              <h4 className="font-display font-extrabold text-sm text-amber-900 dark:text-amber-300">
                เงื่อนไขสำคัญก่อนเข้าใช้ห้องปฏิบัติการพยาบาล
              </h4>
              <p className="leading-relaxed">
                "ผู้ขอใช้ห้องต้องเข้าตรวจรับวัสดุสิ้นเปลือง อุปกรณ์การแพทย์ และครุภัณฑ์ ก่อนวันใช้งานอย่างน้อย 7 วันทำการ (วันจันทร์-ศุกร์ เวลา 08.30-17.00 น. ยกเว้นวันหยุดราชการ) กับเจ้าหน้าที่ผู้รับผิดชอบห้องปฏิบัติการพยาบาล"
              </p>
              <p className="font-bold text-rose-700 dark:text-rose-300 leading-relaxed">
                "หากไม่ดำเนินการตรวจรับรายการดังกล่าว ให้ถือว่าเจ้าหน้าที่ไม่มีส่วนรับผิดชอบต่อความเสียหายหรือข้อผิดพลาดใด ๆ ที่เกิดขึ้น"
              </p>
            </div>
          </div>

          {!isAdmin && (
            <div className="pt-2 border-t border-amber-200 dark:border-amber-800/50 flex items-center gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-900 dark:text-white">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-amber-400"
                />
                <span>[ x ] ยอมรับเงื่อนไขการใช้งานห้องปฏิบัติการพยาบาล</span>
              </label>
            </div>
          )}
        </div>

        {/* Form Action Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="flex-2 py-3 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-600/20 transition flex items-center justify-center gap-2"
          >
            <Send size={16} />
            <span>{isAdmin ? 'บันทึกรายการจองทันที (Admin)' : 'ยืนยันส่งคำขอจองห้องปฏิบัติการ'}</span>
          </button>
        </div>

      </form>

      {/* Terms Warning Dialog Modal if submit clicked without checkbox */}
      {showConditionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                กรุณายอมรับเงื่อนไขก่อนส่งการจอง
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                ผู้ขอใช้ห้องต้องเข้าตรวจรับวัสดุอุปกรณ์ล่วงหน้าอย่างน้อย 7 วันทำการก่อนวันใช้งาน
              </p>
            </div>

            <button
              onClick={() => {
                setTermsAccepted(true);
                setShowConditionModal(false);
              }}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20"
            >
              ยินยอมและยอมรับเงื่อนไข
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
