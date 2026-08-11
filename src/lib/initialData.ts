import {
  Laboratory,
  InventoryItem,
  Booking,
  PreInspection,
  PostInspection,
  DamageLog,
  StoryItem
} from '../types';

export const INITIAL_LABS: Laboratory[] = [
  {
    id: 'lab-1',
    code: 'NLAB-101',
    name: 'ห้องปฏิบัติการการพยาบาลพื้นฐาน 1 (Basic Nursing Skill Lab 1)',
    building: 'อาคารเฉลิมพระเกียรติ (อาคาร 3)',
    floor: 'ชั้น 4',
    capacity: 30,
    description: 'ห้องปฏิบัติการสำหรับการฝึกทักษะการพยาบาลพื้นฐาน เตียงฝึกปฏิบัติ หุ่นฝึกฉีดยา และการดูแลผู้ป่วย',
    image_url: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800',
    is_ready: true,
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'lab-2',
    code: 'NLAB-102',
    name: 'ห้องปฏิบัติการการพยาบาลพื้นฐาน 2 (Basic Nursing Skill Lab 2)',
    building: 'อาคารเฉลิมพระเกียรติ (อาคาร 3)',
    floor: 'ชั้น 4',
    capacity: 30,
    description: 'ห้องปฏิบัติการทักษะหัตถการพื้นฐาน เครื่องมือการพยาบาลขั้นพื้นฐานครบครัน',
    image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    is_ready: true,
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'lab-3',
    code: 'NLAB-201',
    name: 'ห้องปฏิบัติการการประเมินภาวะสุขภาพ (Health Assessment Lab)',
    building: 'อาคารเฉลิมพระเกียรติ (อาคาร 3)',
    floor: 'ชั้น 5',
    capacity: 25,
    description: 'อุปกรณ์ตรวจประเมินภาวะสุขภาพครบชุด หูฟังตรวจปอดและหัวใจ อุปกรณ์วัดสัญญาณชีพ',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    is_ready: true,
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'lab-4',
    code: 'NLAB-301',
    name: 'ห้องปฏิบัติการการพยาบาลผู้ป่วยวิกฤต (Critical Care Simulation Lab)',
    building: 'อาคารเฉลิมพระเกียรติ (อาคาร 3)',
    floor: 'ชั้น 5',
    capacity: 20,
    description: 'ห้องจำลองการพยาบาลผู้ป่วยวิกฤต พร้อมหุ่นจำลองเสมือนจริง และเครื่องติดตามสัญญาณชีพ',
    image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    is_ready: true,
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'lab-5',
    code: 'NLAB-302',
    name: 'ห้องปฏิบัติการการพยาบาลมารดา ทารก และการคลอด (Maternal & Child Lab)',
    building: 'อาคารเฉลิมพระเกียรติ (อาคาร 3)',
    floor: 'ชั้น 6',
    capacity: 25,
    description: 'ห้องปฏิบัติการทำคลอดจำลอง เตียงทำคลอด หุ่นจำลองทารกแรกเกิด และเครื่องฟังเสียงหัวใจทารกในครรภ์',
    image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    is_ready: true,
    created_at: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'lab-6',
    code: 'NLAB-401',
    name: 'ห้องปฏิบัติการทักษะการพยาบาลขั้นสูง (Advanced Clinical Skill Lab)',
    building: 'อาคารเฉลิมพระเกียรติ (อาคาร 3)',
    floor: 'ชั้น 6',
    capacity: 30,
    description: 'ห้องปฏิบัติการทักษะคลินิกขั้นสูง อุปกรณ์ใส่สายยาง ให้สารน้ำ และทำหัตถการพิเศษ',
    image_url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800',
    is_ready: true,
    created_at: '2026-08-01T08:00:00.000Z'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'หุ่นฝึกฉีดยาเข้ากล้ามเนื้อ (Intramuscular Model)',
    category: 'medical_equipment',
    stock_qty: 10,
    unit: 'ชุด'
  },
  {
    id: 'inv-2',
    name: 'เครื่องตรวจวัดสัญญาณชีพ (Patient Monitor)',
    category: 'medical_equipment',
    stock_qty: 5,
    unit: 'เครื่อง'
  },
  {
    id: 'inv-3',
    name: 'ชุดอุปกรณ์ทำแผลปราศจากเชื้อ (Dressing Set)',
    category: 'consumable',
    stock_qty: 50,
    unit: 'ชุด'
  },
  {
    id: 'inv-4',
    name: 'เข็มฉีดยาพร้อมไซริ้งค์ 5 ml',
    category: 'consumable',
    stock_qty: 200,
    unit: 'อัน'
  },
  {
    id: 'inv-5',
    name: 'เตียงผู้ป่วยไฟฟ้า 3 ไกร์',
    category: 'asset',
    stock_qty: 12,
    unit: 'เตียง'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_PRE_INSPECTIONS: PreInspection[] = [];

export const INITIAL_POST_INSPECTIONS: PostInspection[] = [];

export const INITIAL_DAMAGES: DamageLog[] = [];

export const INSTAGRAM_STORIES: StoryItem[] = [
  {
    id: 'story-1',
    title: 'คำแนะนำการใช้ห้องปฏิบัติการ',
    subtitle: 'ระเบียบการเข้าใช้ห้องปฏิบัติการพยาบาล',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    tag: 'คู่มือใช้งาน',
    description: 'ข้อปฏิบัติสำหรับการเข้าใช้งานห้องปฏิบัติการพยาบาล:\n1. แต่งกายด้วยชุดปฏิบัติการพยาบาลเรียบร้อย\n2. ตรวจสอบอุปกรณ์ก่อนและหลังการใช้งานเสมอ\n3. ห้ามนำอาหารและเครื่องดื่มเข้าห้องปฏิบัติการ\n4. ทำความสะอาดเตียงและหุ่นจำลองหลังเลิกใช้งาน'
  },
  {
    id: 'story-2',
    title: 'ขั้นตอนการจองห้องปฏิบัติการ',
    subtitle: 'ระบบจองออนไลน์ คณะพยาบาลศาสตร์',
    image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    tag: 'ประชาสัมพันธ์',
    description: 'จองห้องปฏิบัติการล่วงหน้าอย่างน้อย 1 วันทำการ และรอการอนุมัติจากอาจารย์ผู้ดูแลผ่านระบบ'
  }
];

