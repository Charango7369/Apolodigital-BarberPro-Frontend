export type AppointmentStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Service {
  id: string;
  name: string;
  category: string;
  duration_minutes: number;
  price: number;
  description?: string;
  is_active: boolean;
}

export interface Barber {
  id: string;
  name: string;
  nickname?: string;
  photo_url?: string;
  phone?: string;
  specialty?: string;
  commission_rate: number;
  rating: number;
  is_active: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  total_visits: number;
  total_spent: number;
  last_visit?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id?: string;
  client_name: string;
  client_phone: string;
  barber_id: string;
  barber_name: string;
  service_id: string;
  service_name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration_minutes: number;
  price: number;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  appointment_id?: string;
  client_name: string;
  barber_id: string;
  barber_name: string;
  subtotal: number;
  tip: number;
  total: number;
  payment_method: 'cash' | 'qr_simple' | 'card';
  notes?: string;
  created_at: string;
}

export interface DashboardMetrics {
  date: string;
  revenue_today: number;
  tips_today: number;
  sales_count: number;
  total_appointments: number;
  completed_appointments: number;
  in_progress_appointments: number;
  confirmed_appointments: number;
  occupancy_rate_percent: number;
  top_barbers: {
    name: string;
    appointments: number;
    revenue: number;
  }[];
  top_services: {
    name: string;
    count: number;
    revenue: number;
  }[];
  payment_breakdown: {
    method: string;
    total: number;
    count: number;
  }[];
  active_barbers_count: number;
}

export interface BusinessInfo {
  name: string;
  slogan: string;
  phone: string;
  address: string;
  currency: string;
  website: string;
  schedule_start: string;
  schedule_end: string;
  slot_interval_minutes: number;
}
