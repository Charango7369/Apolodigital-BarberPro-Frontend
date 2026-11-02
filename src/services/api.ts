import { Service, Barber, Client, Appointment, Sale, DashboardMetrics, BusinessInfo } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

export const api = {
  // Services
  async getServices(category?: string): Promise<Service[]> {
    const url = category ? `${API_BASE}/services?category=${encodeURIComponent(category)}` : `${API_BASE}/services`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar servicios');
    return res.json();
  },

  async createService(data: Partial<Service>): Promise<Service> {
    const res = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear servicio');
    return res.json();
  },

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    const res = await fetch(`${API_BASE}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar servicio');
    return res.json();
  },

  async deleteService(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/services/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar servicio');
  },

  // Barbers
  async getBarbers(): Promise<Barber[]> {
    const res = await fetch(`${API_BASE}/barbers`);
    if (!res.ok) throw new Error('Error al cargar equipo de barberos');
    return res.json();
  },

  async createBarber(data: Partial<Barber>): Promise<Barber> {
    const res = await fetch(`${API_BASE}/barbers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al registrar barbero');
    return res.json();
  },

  async updateBarber(id: string, data: Partial<Barber>): Promise<Barber> {
    const res = await fetch(`${API_BASE}/barbers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar barbero');
    return res.json();
  },

  // Clients
  async getClients(search?: string): Promise<Client[]> {
    const url = search ? `${API_BASE}/clients?search=${encodeURIComponent(search)}` : `${API_BASE}/clients`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar clientes');
    return res.json();
  },

  async createClient(data: Partial<Client>): Promise<Client> {
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear cliente');
    return res.json();
  },

  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    const res = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar cliente');
    return res.json();
  },

  async deleteClient(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar cliente');
  },

  // Appointments
  async getAppointments(date?: string, barberId?: string): Promise<Appointment[]> {
    let url = `${API_BASE}/appointments?`;
    if (date) url += `date=${encodeURIComponent(date)}&`;
    if (barberId) url += `barber_id=${encodeURIComponent(barberId)}&`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar citas');
    return res.json();
  },

  async getAvailability(date: string, serviceId: string, barberId?: string): Promise<{
    date: string;
    service_id: string;
    service_name: string;
    duration_minutes: number;
    barber_id: string | null;
    available_slots: string[];
  }> {
    let url = `${API_BASE}/appointments/availability?date=${encodeURIComponent(date)}&service_id=${encodeURIComponent(serviceId)}`;
    if (barberId && barberId !== 'all') {
      url += `&barber_id=${encodeURIComponent(barberId)}`;
    }
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al consultar disponibilidad');
    }
    return res.json();
  },

  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al programar cita');
    }
    return res.json();
  },

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al actualizar estado de cita');
    }
    return res.json();
  },

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al actualizar cita');
    }
    return res.json();
  },

  async deleteAppointment(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al cancelar cita');
  },

  // Checkout / Sales
  async processCheckout(data: {
    appointment_id?: string;
    client_name: string;
    barber_id: string;
    barber_name: string;
    services_total: number;
    products_total?: number;
    tip?: number;
    total: number;
    payment_method: string;
    notes?: string;
  }): Promise<Sale> {
    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al procesar cobro');
    return res.json();
  },

  async getSales(date?: string): Promise<Sale[]> {
    const url = date ? `${API_BASE}/checkout/sales?date=${encodeURIComponent(date)}` : `${API_BASE}/checkout/sales`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar ventas');
    return res.json();
  },

  // Stats
  async getDashboardMetrics(date?: string): Promise<DashboardMetrics> {
    const url = date ? `${API_BASE}/stats/dashboard?target_date=${encodeURIComponent(date)}` : `${API_BASE}/stats/dashboard`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar métricas');
    return res.json();
  },

  async getBusinessInfo(): Promise<BusinessInfo> {
    const res = await fetch(`${API_BASE}/stats/business-info`);
    if (!res.ok) throw new Error('Error al cargar información del negocio');
    return res.json();
  }
};
