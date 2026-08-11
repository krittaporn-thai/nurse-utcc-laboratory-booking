import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Laboratory,
  InventoryItem,
  Booking,
  PreInspection,
  PostInspection,
  DamageLog,
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
import { calculateBookingStatus } from './dateUtils';

// Supabase configuration state
const STORAGE_KEY_SUPABASE = 'nurse_lab_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const defaultUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPABASE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey && parsed.isConnected) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse Supabase config', e);
  }
  const metaEnv = (import.meta as { env?: Record<string, string> }).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL || '';
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConnected: true
    };
  }

  return {
    url: defaultUrl,
    anonKey: 'local-supabase-anon-key',
    isConnected: true
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(config));
    supabaseInstance = null;
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  const config = getSupabaseConfig();
  if (!supabaseInstance) {
    supabaseInstance = createClient(config.url, config.anonKey);
  }
  return supabaseInstance;
}

export function getLocalSupabaseClient(): SupabaseClient {
  const defaultUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  return createClient(defaultUrl, 'local-supabase-anon-key');
}

export interface AppStoreData {
  labs: Laboratory[];
  inventory: InventoryItem[];
  bookings: Booking[];
  preInspections: PreInspection[];
  postInspections: PostInspection[];
  damages: DamageLog[];
  isAdminAuthenticated: boolean;
}

// Memory fallback cache in runtime
let memoryStore: AppStoreData = {
  labs: INITIAL_LABS,
  inventory: INITIAL_INVENTORY,
  bookings: INITIAL_BOOKINGS,
  preInspections: INITIAL_PRE_INSPECTIONS,
  postInspections: INITIAL_POST_INSPECTIONS,
  damages: INITIAL_DAMAGES,
  isAdminAuthenticated: false
};

// =========================================
// SUPABASE SERVICE LAYER (SINGLE SOURCE OF TRUTH)
// =========================================

function mapLabRecord(item: any): Laboratory {
  return {
    id: String(item.id),
    code: String(item.code || ''),
    name: String(item.name || ''),
    building: String(item.building || ''),
    floor: String(item.floor || ''),
    capacity: Number(item.capacity || 0),
    description: String(item.description || ''),
    image_url: String(item.image_url || ''),
    is_ready: Boolean(item.is_ready ?? true),
    created_at: String(item.created_at || new Date().toISOString())
  };
}

async function seedInitialLabs(client: SupabaseClient) {
  try {
    const payload = INITIAL_LABS.map((l) => ({
      id: l.id,
      code: l.code,
      name: l.name,
      building: l.building,
      floor: l.floor,
      capacity: l.capacity,
      description: l.description,
      image_url: l.image_url,
      is_ready: l.is_ready,
      created_at: l.created_at
    }));
    await client.from('laboratories').upsert(payload);
  } catch (e) {
    console.error('Failed to seed initial labs:', e);
  }
}

// --- Laboratories ---
export async function getLabs(): Promise<Laboratory[]> {
  const client = getSupabaseClient();

  try {
    const { data, error } = await client.from('laboratories').select('*').order('code', { ascending: true });
    if (error || !data || data.length === 0) {
      console.log('Laboratories table empty or fetch error. Seeding default labs...');
      await seedInitialLabs(client);
      const { data: refetched } = await client.from('laboratories').select('*').order('code', { ascending: true });
      if (refetched && refetched.length > 0) {
        const labs = refetched.map(mapLabRecord);
        memoryStore.labs = labs;
        return labs;
      }
      memoryStore.labs = INITIAL_LABS;
      return INITIAL_LABS;
    }

    const labs = data.map(mapLabRecord);
    memoryStore.labs = labs;
    return labs;
  } catch (err) {
    console.error('getLabs exception:', err);
    memoryStore.labs = INITIAL_LABS;
    return INITIAL_LABS;
  }
}

export async function createLab(lab: Laboratory): Promise<Laboratory> {
  const client = getSupabaseClient();
  try {
    const payload = {
      id: lab.id,
      code: lab.code,
      name: lab.name,
      building: lab.building,
      floor: lab.floor,
      capacity: lab.capacity,
      description: lab.description,
      image_url: lab.image_url,
      is_ready: lab.is_ready,
      created_at: lab.created_at || new Date().toISOString()
    };
    const { data, error } = await client.from('laboratories').insert(payload).select();
    if (error) {
      console.error('INSERT LAB ERROR:', error);
    } else {
      console.log('INSERT RESULT', data);
    }
  } catch (e) {
    console.error('createLab error:', e);
  }
  return lab;
}

export async function updateLab(lab: Laboratory): Promise<Laboratory> {
  const client = getSupabaseClient();
  try {
    const payload = {
      code: lab.code,
      name: lab.name,
      building: lab.building,
      floor: lab.floor,
      capacity: lab.capacity,
      description: lab.description,
      image_url: lab.image_url,
      is_ready: lab.is_ready
    };
    const { data, error } = await client.from('laboratories').update(payload).eq('id', lab.id).select();
    if (error) {
      console.error('UPDATE LAB ERROR:', error);
    } else {
      console.log('UPDATE RESULT', data);
    }
  } catch (e) {
    console.error('updateLab error:', e);
  }
  return lab;
}

export async function deleteLab(labId: string): Promise<void> {
  const client = getSupabaseClient();
  try {
    const { data, error } = await client.from('laboratories').delete().eq('id', labId).select();
    if (error) {
      console.error('DELETE LAB ERROR:', error);
    } else {
      console.log('DELETE RESULT', data);
    }
  } catch (e) {
    console.error('deleteLab error:', e);
  }
}

// --- Bookings ---
export async function getBookings(): Promise<Booking[]> {
  const client = getSupabaseClient();

  try {
    const { data, error } = await client.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('LOAD BOOKINGS ERROR:', error);
      return memoryStore.bookings;
    }
    console.log('LOAD RESULT', data);
    const formatted: Booking[] = (data || []).map((item) => ({
      id: String(item.id),
      booking_code: String(item.booking_code || ''),
      requester_name: String(item.requester_name || ''),
      department: String(item.department || ''),
      faculty: String(item.faculty || ''),
      phone: String(item.phone || ''),
      email: String(item.email || ''),
      subject_code: String(item.subject_code || ''),
      subject_name: String(item.subject_name || ''),
      activity_name: String(item.activity_name || ''),
      objective: String(item.objective || ''),
      participant_count: Number(item.participant_count || 1),
      lab_id: String(item.lab_id || ''),
      lab_name: String(item.lab_name || ''),
      booking_date: String(item.booking_date || ''),
      start_time: String(item.start_time || ''),
      end_time: String(item.end_time || ''),
      status: item.status || 'pending',
      consumables: item.consumables || [],
      medical_equipment: item.medical_equipment || [],
      assets: item.assets || [],
      terms_accepted: Boolean(item.terms_accepted ?? true),
      rejection_reason: item.rejection_reason,
      pre_inspection_done: Boolean(item.pre_inspection_done ?? false),
      post_inspection_done: Boolean(item.post_inspection_done ?? false),
      created_at: String(item.created_at || new Date().toISOString())
    }));
    memoryStore.bookings = updateDynamicStatuses(formatted, memoryStore.postInspections);
    return memoryStore.bookings;
  } catch (err) {
    console.error('getBookings exception:', err);
    return memoryStore.bookings;
  }
}

export async function createBooking(booking: Booking): Promise<Booking> {
  const client = getSupabaseClient();
  try {
    const payload = {
      id: booking.id,
      booking_code: booking.booking_code,
      requester_name: booking.requester_name,
      department: booking.department,
      faculty: booking.faculty,
      phone: booking.phone,
      email: booking.email,
      subject_code: booking.subject_code,
      subject_name: booking.subject_name,
      activity_name: booking.activity_name,
      objective: booking.objective,
      participant_count: booking.participant_count,
      lab_id: booking.lab_id,
      lab_name: booking.lab_name,
      booking_date: booking.booking_date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      consumables: booking.consumables,
      medical_equipment: booking.medical_equipment,
      assets: booking.assets,
      terms_accepted: booking.terms_accepted,
      rejection_reason: booking.rejection_reason,
      created_at: booking.created_at || new Date().toISOString()
    };
    const { data, error } = await client.from('bookings').insert(payload).select();
    if (error) {
      console.error('INSERT BOOKING ERROR:', error);
    } else {
      console.log('INSERT RESULT', data);
    }
  } catch (e) {
    console.error('createBooking error:', e);
  }
  return booking;
}

export async function updateBooking(booking: Booking): Promise<Booking> {
  const client = getSupabaseClient();
  try {
    const payload = {
      booking_code: booking.booking_code,
      requester_name: booking.requester_name,
      department: booking.department,
      faculty: booking.faculty,
      phone: booking.phone,
      email: booking.email,
      subject_code: booking.subject_code,
      subject_name: booking.subject_name,
      activity_name: booking.activity_name,
      objective: booking.objective,
      participant_count: booking.participant_count,
      lab_id: booking.lab_id,
      lab_name: booking.lab_name,
      booking_date: booking.booking_date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      consumables: booking.consumables,
      medical_equipment: booking.medical_equipment,
      assets: booking.assets,
      terms_accepted: booking.terms_accepted,
      rejection_reason: booking.rejection_reason,
      pre_inspection_done: booking.pre_inspection_done,
      post_inspection_done: booking.post_inspection_done
    };
    const { data, error } = await client.from('bookings').update(payload).eq('id', booking.id).select();
    if (error) {
      console.error('UPDATE BOOKING ERROR:', error);
    } else {
      console.log('UPDATE RESULT', data);
    }
  } catch (e) {
    console.error('updateBooking error:', e);
  }
  return booking;
}

export async function deleteBooking(bookingId: string): Promise<void> {
  memoryStore.bookings = memoryStore.bookings.filter((b) => b.id !== bookingId);
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('bookings').delete().eq('id', bookingId).select();
      if (error) {
        console.error('DELETE BOOKING ERROR:', error);
      } else {
        console.log('DELETE RESULT', data);
      }
    } catch (e) {
      console.error('deleteBooking error:', e);
    }
  }
}

// --- Pre-Inspections ---
export async function getPreInspections(): Promise<PreInspection[]> {
  const client = getSupabaseClient();
  if (!client) return memoryStore.preInspections;

  try {
    const { data, error } = await client.from('pre_inspection').select('*').order('created_at', { ascending: false });
    if (error || !data) return memoryStore.preInspections;
    memoryStore.preInspections = data.map((item) => ({
      id: item.id,
      booking_id: item.booking_id,
      inspection_date: item.inspection_date,
      inspector_name: item.inspector_name,
      notes: item.notes || '',
      images: item.images || [],
      consumables_checked: item.consumables_checked ?? true,
      equipment_checked: item.equipment_checked ?? true,
      assets_checked: item.assets_checked ?? true,
      status: item.status || 'pass',
      created_at: item.created_at || new Date().toISOString()
    }));
    return memoryStore.preInspections;
  } catch (err) {
    return memoryStore.preInspections;
  }
}

export async function createPreInspection(inspection: PreInspection): Promise<PreInspection> {
  memoryStore.preInspections = [inspection, ...memoryStore.preInspections];
  memoryStore.bookings = memoryStore.bookings.map((b) =>
    b.id === inspection.booking_id ? { ...b, pre_inspection_done: true } : b
  );
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('pre_inspection').insert({
        id: inspection.id,
        booking_id: inspection.booking_id,
        inspection_date: inspection.inspection_date,
        inspector_name: inspection.inspector_name,
        notes: inspection.notes,
        images: inspection.images,
        consumables_checked: inspection.consumables_checked,
        equipment_checked: inspection.equipment_checked,
        assets_checked: inspection.assets_checked,
        status: inspection.status
      }).select();
      if (error) {
        console.error('INSERT PRE_INSPECTION ERROR:', error);
      } else {
        console.log('INSERT RESULT', data);
      }
      await client.from('bookings').update({ pre_inspection_done: true }).eq('id', inspection.booking_id);
    } catch (e) {
      console.error('createPreInspection error:', e);
    }
  }
  return inspection;
}

// --- Post-Inspections ---
export async function getPostInspections(): Promise<PostInspection[]> {
  const client = getSupabaseClient();
  if (!client) return memoryStore.postInspections;

  try {
    const { data, error } = await client.from('post_inspection').select('*').order('created_at', { ascending: false });
    if (error || !data) return memoryStore.postInspections;
    console.log('LOAD RESULT', data);
    memoryStore.postInspections = data.map((item) => ({
      id: item.id,
      booking_id: item.booking_id,
      inspection_date: item.inspection_date,
      inspector_name: item.inspector_name,
      consumables_status: item.consumables_status || 'complete',
      equipment_status: item.equipment_status || 'complete',
      assets_status: item.assets_status || 'complete',
      notes: item.notes || '',
      images: item.images || [],
      created_at: item.created_at || new Date().toISOString()
    }));
    return memoryStore.postInspections;
  } catch (err) {
    return memoryStore.postInspections;
  }
}

export async function createPostInspection(inspection: PostInspection): Promise<PostInspection> {
  memoryStore.postInspections = [inspection, ...memoryStore.postInspections];
  memoryStore.bookings = memoryStore.bookings.map((b) =>
    b.id === inspection.booking_id ? { ...b, status: 'completed' as const, post_inspection_done: true } : b
  );
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('post_inspection').insert({
        id: inspection.id,
        booking_id: inspection.booking_id,
        inspection_date: inspection.inspection_date,
        inspector_name: inspection.inspector_name,
        consumables_status: inspection.consumables_status,
        equipment_status: inspection.equipment_status,
        assets_status: inspection.assets_status,
        notes: inspection.notes,
        images: inspection.images
      }).select();
      if (error) {
        console.error('INSERT POST_INSPECTION ERROR:', error);
      } else {
        console.log('INSERT RESULT', data);
      }
      await client.from('bookings').update({ status: 'completed', post_inspection_done: true }).eq('id', inspection.booking_id);
    } catch (e) {
      console.error('createPostInspection error:', e);
    }
  }
  return inspection;
}

// --- Damages ---
export async function getDamages(): Promise<DamageLog[]> {
  const client = getSupabaseClient();
  if (!client) return memoryStore.damages;

  try {
    const { data, error } = await client.from('damages').select('*').order('created_at', { ascending: false });
    if (error || !data) return memoryStore.damages;
    console.log('LOAD RESULT', data);
    memoryStore.damages = data.map((item) => ({
      id: item.id,
      booking_id: item.booking_id,
      item_name: item.item_name,
      item_type: item.item_type,
      quantity: Number(item.quantity || 1),
      unit_price: Number(item.unit_price || 0),
      total_amount: Number(item.total_amount || 0),
      responsible_person: item.responsible_person || '',
      notes: item.notes || '',
      created_at: item.created_at || new Date().toISOString()
    }));
    return memoryStore.damages;
  } catch (err) {
    return memoryStore.damages;
  }
}

export async function createDamage(damage: DamageLog): Promise<DamageLog> {
  memoryStore.damages = [damage, ...memoryStore.damages];
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('damages').insert({
        id: damage.id,
        booking_id: damage.booking_id,
        item_name: damage.item_name,
        item_type: damage.item_type,
        quantity: damage.quantity,
        unit_price: damage.unit_price,
        total_amount: damage.total_amount,
        responsible_person: damage.responsible_person,
        notes: damage.notes
      }).select();
      if (error) {
        console.error('INSERT DAMAGE ERROR:', error);
      } else {
        console.log('INSERT RESULT', data);
      }
    } catch (e) {
      console.error('createDamage error:', e);
    }
  }
  return damage;
}

export async function deleteDamage(damageId: string): Promise<void> {
  memoryStore.damages = memoryStore.damages.filter((d) => d.id !== damageId);
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('damages').delete().eq('id', damageId).select();
      if (error) {
        console.error('DELETE DAMAGE ERROR:', error);
      } else {
        console.log('DELETE RESULT', data);
      }
    } catch (e) {
      console.error('deleteDamage error:', e);
    }
  }
}

// --- Admin Settings Verification ---
export async function verifyAdminPasscodeInDb(inputPasscode: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data } = await client.from('admin_settings').select('setting_value').eq('setting_key', 'admin_passcode').single();
      if (data && data.setting_value) {
        return inputPasscode.trim() === data.setting_value.trim();
      }
    } catch (e) {
      // Fallback if table not queried
    }
  }
  return inputPasscode.trim().toUpperCase() === 'NURSEUTCC01';
}

// --- Full Store Fetcher ---
export async function fetchFullStore(isAdminAuth: boolean = false): Promise<AppStoreData> {
  const [labs, postInspections, preInspections, bookings, damages] = await Promise.all([
    getLabs(),
    getPostInspections(),
    getPreInspections(),
    getBookings(),
    getDamages()
  ]);

  const updatedBookings = updateDynamicStatuses(bookings, postInspections);

  return {
    labs,
    inventory: INITIAL_INVENTORY,
    bookings: updatedBookings,
    preInspections,
    postInspections,
    damages,
    isAdminAuthenticated: isAdminAuth
  };
}

// --- Supabase Realtime Subscription ---
export function subscribeToStoreChanges(onStoreUpdate: (data: AppStoreData) => void): () => void {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();

  // If connected to local origin REST endpoint, use EventSource SSE for realtime
  if (typeof window !== 'undefined' && (config.url.includes(window.location.host) || config.url.includes('localhost') || config.url === window.location.origin)) {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/rest/v1/realtime');
      eventSource.onmessage = async (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.event === 'change') {
            const fresh = await fetchFullStore();
            onStoreUpdate(fresh);
          }
        } catch (err) {
          console.error('Realtime SSE parse error:', err);
        }
      };
    } catch (e) {
      console.error('EventSource error:', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }

  const channel = client
    .channel('public-central-db')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'laboratories' }, async () => {
      const fresh = await fetchFullStore();
      onStoreUpdate(fresh);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, async () => {
      const fresh = await fetchFullStore();
      onStoreUpdate(fresh);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pre_inspection' }, async () => {
      const fresh = await fetchFullStore();
      onStoreUpdate(fresh);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'post_inspection' }, async () => {
      const fresh = await fetchFullStore();
      onStoreUpdate(fresh);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'damages' }, async () => {
      const fresh = await fetchFullStore();
      onStoreUpdate(fresh);
    })
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

// Update booking status dynamic rules based strictly on full DateTime comparison
export function updateDynamicStatuses(bookings: Booking[], postInspections: PostInspection[] = []): Booking[] {
  const now = new Date();

  return bookings.map((b) => {
    if (b.status === 'rejected' || b.status === 'cancelled') {
      return b;
    }

    const dynamicStatus = calculateBookingStatus(
      b.booking_date,
      b.start_time,
      b.end_time,
      b.status,
      now
    );

    const hasPostInspection = postInspections.some((p) => p.booking_id === b.id);

    return {
      ...b,
      status: dynamicStatus,
      post_inspection_done: hasPostInspection || b.post_inspection_done
    };
  });
}

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
-- SUPABASE POSTGRESQL CENTRAL DATABASE SCHEMA
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
  pre_inspection_done BOOLEAN DEFAULT FALSE,
  post_inspection_done BOOLEAN DEFAULT FALSE,
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

-- 7. Admin Settings Table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES ('admin_passcode', 'NURSEUTCC01')
ON CONFLICT (setting_key) DO NOTHING;

-- ENABLE ROW LEVEL SECURITY & CENTRAL ACCESS POLICIES
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_inspection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_inspection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 1. Laboratories Policies
CREATE POLICY "Public read laboratories" ON public.laboratories FOR SELECT USING (true);
CREATE POLICY "Public insert laboratories" ON public.laboratories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update laboratories" ON public.laboratories FOR UPDATE USING (true);
CREATE POLICY "Public delete laboratories" ON public.laboratories FOR DELETE USING (true);

-- 2. Bookings Policies
CREATE POLICY "Public read all bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Public delete bookings" ON public.bookings FOR DELETE USING (true);

-- 3. Inspection & Damages Policies
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

-- 4. Admin Settings Policies
CREATE POLICY "Public read admin_settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Public update admin_settings" ON public.admin_settings FOR UPDATE USING (true);
`;

