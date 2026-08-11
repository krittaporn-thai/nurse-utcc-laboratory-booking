export type UserRole = 'ADMIN' | 'USER';

export interface AdminUser {
  id: string;
  code: string; // 'NURSEUTCC01'
  name: string;
  email: string;
  role: 'ADMIN';
}

export interface Laboratory {
  id: string;
  code: string; // e.g., 'LAB-101'
  name: string; // e.g., 'ห้องปฏิบัติการพยาบาลพื้นฐาน (Basic Nursing Skill Lab)'
  building: string; // e.g., 'อาคาร 3'
  floor: string; // e.g., 'ชั้น 4'
  capacity: number; // e.g., 40
  description: string;
  image_url: string;
  is_ready: boolean;
  created_at?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'consumable' | 'medical_equipment' | 'asset';
  stock_qty: number;
  unit: string;
}

export interface SelectedItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  availability?: 'available' | 'sufficient' | 'insufficient' | 'unavailable' | 'pending';
  available_quantity?: number;
  note?: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'in_use' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  booking_code: string; // e.g., 'BK-2026-001'
  requester_name: string;
  department: string;
  faculty: string;
  phone: string;
  email: string;
  subject_code: string;
  subject_name: string;
  activity_name: string;
  objective: string;
  participant_count: number;
  lab_id: string;
  lab_name: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  status: BookingStatus;
  consumables: SelectedItem[];
  medical_equipment: SelectedItem[];
  assets: SelectedItem[];
  terms_accepted: boolean;
  rejection_reason?: string;
  pre_inspection_done?: boolean;
  post_inspection_done?: boolean;
  created_at: string;
}

export interface PreInspection {
  id: string;
  booking_id: string;
  inspection_date: string;
  inspector_name: string;
  notes: string;
  images: string[];
  consumables_checked: boolean;
  equipment_checked: boolean;
  assets_checked: boolean;
  status: 'pass' | 'pending';
  created_at: string;
}

export interface PostInspection {
  id: string;
  booking_id: string;
  inspection_date: string;
  inspector_name: string;
  consumables_status: 'complete' | 'lost' | 'damaged';
  equipment_status: 'complete' | 'lost' | 'damaged';
  assets_status: 'complete' | 'lost' | 'damaged';
  notes: string;
  images: string[];
  created_at: string;
}

export interface DamageLog {
  id: string;
  booking_id: string;
  item_name: string;
  item_type: 'consumable' | 'medical_equipment' | 'asset';
  quantity: number;
  unit_price: number;
  total_amount: number;
  responsible_person: string;
  notes: string;
  created_at: string;
}

export interface UsageRuleCriterion {
  days: number;
  percentage: number;
  description: string;
}

export interface LabUsageStat {
  lab_id: string;
  lab_name: string;
  booking_count: number;
  total_days_used: number;
  usage_percentage: number; // Based on 5-day week rules (>=5d = 100%, 4d = 80%, 3d = 75%, 2d = 70%)
}

export interface DepartmentStat {
  department: string;
  faculty: string;
  count: number;
  percentage: number;
}

export interface StoryItem {
  id: string;
  lab_id?: string;
  title: string;
  subtitle: string;
  image_url: string;
  tag: string;
  description: string;
  has_new?: boolean;
}
