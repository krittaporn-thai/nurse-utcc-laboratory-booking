import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Laboratory,
  InventoryItem,
  Booking,
  PreInspection,
  PostInspection,
  DamageLog,
  BookingStatus,
  LabUsageStat
} from '../types';
import {
  INITIAL_LABS,
  INITIAL_INVENTORY,
  INITIAL_BOOKINGS,
  INITIAL_PRE_INSPECTIONS,
  INITIAL_POST_INSPECTIONS,
  INITIAL_DAMAGES
} from './initialData';

// Supabase configuration state
const STORAGE_KEY_SUPABASE = 'nurse_lab_supabase_config';
const STORAGE_KEY_DATA = 'nurse_lab_store_v3';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPABASE);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to parse Supabase config', e);
  }
  const metaEnv = (import.meta as { env?: Record<string, string> }).env || {};
  return {
    url: metaEnv.VITE_SUPABASE_URL || '',
    anonKey: metaEnv.VITE_SUPABASE_ANON_KEY || '',
    isConnected: false
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(config));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (config.url && config.anonKey) {
    if (!supabaseInstance) {
      supabaseInstance = createClient(config.url, config.anonKey);
    }
    return supabaseInstance;
  }
  return null;
}

// Local Persistent Store Engine
export interface AppStoreData {
  labs: Laboratory[];
  inventory: InventoryItem[];
  bookings: Booking[];
  preInspections: PreInspection[];
  postInspections: PostInspection[];
  damages: DamageLog[];
  isAdminAuthenticated: boolean;
  adminCode: string;
}

export function loadLocalStore(): AppStoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATA);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-update booking statuses based on current time
      if (parsed.bookings) {
        parsed.bookings = updateDynamicStatuses(parsed.bookings, parsed.postInspections || []);
      }
      return {
        labs: parsed.labs || INITIAL_LABS,
        inventory: parsed.inventory || INITIAL_INVENTORY,
        bookings: parsed.bookings || INITIAL_BOOKINGS,
        preInspections: parsed.preInspections || INITIAL_PRE_INSPECTIONS,
        postInspections: parsed.postInspections || INITIAL_POST_INSPECTIONS,
        damages: parsed.damages || INITIAL_DAMAGES,
        isAdminAuthenticated: parsed.isAdminAuthenticated || false,
        adminCode: 'NURSEUTCC01'
      };
    }
  } catch (err) {
    console.error('Error loading local store:', err);
  }

  return {
    labs: INITIAL_LABS,
    inventory: INITIAL_INVENTORY,
    bookings: INITIAL_BOOKINGS,
    preInspections: INITIAL_PRE_INSPECTIONS,
    postInspections: INITIAL_POST_INSPECTIONS,
    damages: INITIAL_DAMAGES,
    isAdminAuthenticated: false,
    adminCode: 'NURSEUTCC01'
  };
}

export function saveLocalStore(data: Partial<AppStoreData>) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DATA);
    let current: Partial<AppStoreData> = {};
    if (raw) {
      try {
        current = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse existing store:', e);
      }
    }
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving local store:', err);
    return data as AppStoreData;
  }
}

import { calculateBookingStatus } from './dateUtils';

// Update booking status dynamic rules based strictly on full DateTime comparison:
// 1. รอดำเนินการ (สีเหลือง): current_datetime < booking_start_datetime
// 2. กำลังใช้งาน (สีเขียว): booking_start_datetime <= current_datetime < booking_end_datetime
// 3. เสร็จสิ้น (สีแดง): current_datetime >= booking_end_datetime
export function updateDynamicStatuses(bookings: Booking[], postInspections: PostInspection[] = []): Booking[] {
  const now = new Date();

  return bookings.map((b) => {
    // If rejected or cancelled, keep as is
    if (b.status === 'rejected' || b.status === 'cancelled') {
      return b;
    }

    // Calculate real-time status using full DateTime comparison
    const dynamicStatus = calculateBookingStatus(
      b.booking_date,
      b.start_time,
      b.end_time,
      b.status,
      now
    );

    // Mark post_inspection_done if post inspection exists
    const hasPostInspection = postInspections.some((p) => p.booking_id === b.id);

    return {
      ...b,
      status: dynamicStatus,
      post_inspection_done: hasPostInspection || b.post_inspection_done
    };
  });
}

// Calculation logic for Laboratory Usage Percentage based on criteria:
// 100% = ใช้งาน >= 5 วัน
// 80% = ใช้งาน 4 วัน
// 75% = ใช้งาน 3 วัน
// 70% = ใช้งาน 2 วัน
// < 2 วัน = (days / 5) * 100 (e.g. 1 วัน = 35% or 40%)
export function calculateUsagePercentage(daysUsed: number): number {
  if (daysUsed >= 5) return 100;
  if (daysUsed === 4) return 80;
  if (daysUsed === 3) return 75;
  if (daysUsed === 2) return 70;
  if (daysUsed === 1) return 35;
  return 0;
}

export function computeLabStats(labs: Laboratory[], bookings: Booking[]): LabUsageStat[] {
  return labs.map((lab) => {
    const labBookings = bookings.filter((b) => b.lab_id === lab.id && b.status !== 'rejected' && b.status !== 'cancelled');
    // Unique dates count
    const uniqueDates = new Set(labBookings.map((b) => b.booking_date));
    const totalDaysUsed = uniqueDates.size;
    const usagePercentage = calculateUsagePercentage(totalDaysUsed);

    return {
      lab_id: lab.id,
      lab_name: lab.name,
      booking_count: labBookings.length,
      total_days_used: totalDaysUsed,
      usage_percentage: usagePercentage
    };
  });
}

// SQL Generator Script for Supabase Schema
export const SUPABASE_SQL_SCHEMA = `-- ===============================================
-- SUPABASE POSTGRESQL SCHEMA FOR NURSE LAB SYSTEM
-- ===============================================

-- 1. Laboratories Table
CREATE TABLE IF NOT EXISTS public.laboratories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  building TEXT NOT NULL,
  floor TEXT NOT NULL,
  capacity INT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_ready BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Inventory Items
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('consumable', 'medical_equipment', 'asset')),
  stock_qty INT DEFAULT 0,
  unit TEXT NOT NULL
);

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code TEXT NOT NULL UNIQUE,
  requester_name TEXT NOT NULL,
  department TEXT NOT NULL,
  faculty TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  objective TEXT,
  participant_count INT DEFAULT 1,
  lab_id TEXT NOT NULL,
  lab_name TEXT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_use', 'completed', 'cancelled')),
  consumables JSONB DEFAULT '[]'::jsonb,
  medical_equipment JSONB DEFAULT '[]'::jsonb,
  assets JSONB DEFAULT '[]'::jsonb,
  terms_accepted BOOLEAN DEFAULT TRUE,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pre-Inspection
CREATE TABLE IF NOT EXISTS public.pre_inspection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL,
  inspection_date DATE NOT NULL,
  inspector_name TEXT NOT NULL,
  notes TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  consumables_checked BOOLEAN DEFAULT TRUE,
  equipment_checked BOOLEAN DEFAULT TRUE,
  assets_checked BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'pass',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Post-Inspection
CREATE TABLE IF NOT EXISTS public.post_inspection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL,
  inspection_date DATE NOT NULL,
  inspector_name TEXT NOT NULL,
  consumables_status TEXT DEFAULT 'complete',
  equipment_status TEXT DEFAULT 'complete',
  assets_status TEXT DEFAULT 'complete',
  notes TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Damage Logs
CREATE TABLE IF NOT EXISTS public.damages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) DEFAULT 0,
  responsible_person TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY & CENTRAL ACCESS POLICIES
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_inspection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_inspection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damages ENABLE ROW LEVEL SECURITY;

-- 1. Laboratories: Public read for all users, Admin modify
CREATE POLICY "Public read laboratories" ON public.laboratories FOR SELECT USING (true);
CREATE POLICY "Public insert laboratories" ON public.laboratories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update laboratories" ON public.laboratories FOR UPDATE USING (true);
CREATE POLICY "Public delete laboratories" ON public.laboratories FOR DELETE USING (true);

-- 2. Bookings: Public read and create for all users (No user_id isolation)
CREATE POLICY "Public read all bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Public delete bookings" ON public.bookings FOR DELETE USING (true);

-- 3. Inspection & Damages: Public read & full access for central system
CREATE POLICY "Public read pre_inspection" ON public.pre_inspection FOR SELECT USING (true);
CREATE POLICY "Public insert pre_inspection" ON public.pre_inspection FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update pre_inspection" ON public.pre_inspection FOR UPDATE USING (true);

CREATE POLICY "Public read post_inspection" ON public.post_inspection FOR SELECT USING (true);
CREATE POLICY "Public insert post_inspection" ON public.post_inspection FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update post_inspection" ON public.post_inspection FOR UPDATE USING (true);

CREATE POLICY "Public read damages" ON public.damages FOR SELECT USING (true);
CREATE POLICY "Public insert damages" ON public.damages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update damages" ON public.damages FOR UPDATE USING (true);
CREATE POLICY "Public delete damages" ON public.damages FOR DELETE USING (true);
`;
