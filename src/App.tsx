import React, { useState, useEffect } from 'react';
import { api, setAuthToken } from './services/api';
import {
  Service,
  Barber,
  Client,
  Appointment,
  Sale,
  DashboardMetrics,
  AppointmentStatus,
  User,
  UserRole,
  CashShift
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AgendaView } from './components/AgendaView';
import { ServicesView } from './components/ServicesView';
import { ClientsView } from './components/ClientsView';
import { BarbersView } from './components/BarbersView';
import { PosView } from './components/PosView';
import { StatsView } from './components/StatsView';
import { ClientBookingView } from './components/ClientBookingView';
import { AppointmentModal } from './components/AppointmentModal';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'admin' | 'client'>('admin');
  const [currentTab, setCurrentTab] = useState<string>('agenda');

  // Authentication & RBAC User State
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-admin-01',
    email: 'admin@apolodigital.lat',
    full_name: 'Admin Recepción',
    role: 'admin',
    tenant_id: 'org_apolo_sopocachi',
  });

  // Cash Shifts (Arqueo Ciego)
  const [currentShift, setCurrentShift] = useState<CashShift | null>(null);
  const [isShiftOpen, setIsShiftOpen] = useState<boolean>(true);

  // Core Data
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Filters & State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedBarberId, setSelectedBarberId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & POS Target
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [slotTimeForModal, setSlotTimeForModal] = useState<string>('10:00');
  const [slotBarberIdForModal, setSlotBarberIdForModal] = useState<string>('');
  const [posTargetAppointment, setPosTargetAppointment] = useState<Appointment | null>(null);

  // Initial Data Fetch
  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      // Auto login as default admin for smooth immediate session
      try {
        const loginRes = await api.login('admin@apolodigital.lat', 'Apolo2026!');
        setCurrentUser(loginRes.user);
      } catch (loginErr) {
        console.warn('Fallback: continuing without re-login');
      }

      const [srvs, brbs, clts, apts, sls, mtr, shiftData] = await Promise.all([
        api.getServices(),
        api.getBarbers(),
        api.getClients(),
        api.getAppointments(selectedDate),
        api.getSales(selectedDate),
        api.getDashboardMetrics(selectedDate),
        api.getCurrentShift().catch(() => ({ is_open: false, shift: null })),
      ]);

      setServices(srvs);
      setBarbers(brbs);
      setClients(clts);
      setAppointments(apts);
      setSales(sls);
      setMetrics(mtr);
      setIsShiftOpen(shiftData.is_open);
      setCurrentShift(shiftData.shift);
    } catch (err) {
      console.error('Error loading data from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // When selectedDate changes, refresh appointments and stats
  useEffect(() => {
    const refreshDateData = async () => {
      try {
        const [apts, sls, mtr] = await Promise.all([
          api.getAppointments(selectedDate),
          api.getSales(selectedDate),
          api.getDashboardMetrics(selectedDate),
        ]);
        setAppointments(apts);
        setSales(sls);
        setMetrics(mtr);
      } catch (err) {
        console.error('Error refreshing date data:', err);
      }
    };
    refreshDateData();
  }, [selectedDate]);

  // Switch User Role (Auditoría OWASP)
  const handleSwitchUserRole = async (role: UserRole) => {
    let email = 'admin@apolodigital.lat';
    if (role === 'owner') email = 'dueno@apolodigital.lat';
    if (role === 'barber') email = 'alex@apolodigital.lat';
    if (role === 'client') email = 'cliente@apolodigital.lat';

    try {
      setIsLoading(true);
      const res = await api.login(email, 'Apolo2026!');
      setCurrentUser(res.user);

      // Si es barbero, preseleccionar su sillón
      if (res.user.role === 'barber' && res.user.barber_id) {
        setSelectedBarberId(res.user.barber_id);
      } else {
        setSelectedBarberId('all');
      }

      // Refrescar datos con el contexto del nuevo rol
      const [apts, sls, mtr] = await Promise.all([
        api.getAppointments(selectedDate),
        api.getSales(selectedDate),
        api.getDashboardMetrics(selectedDate),
      ]);
      setAppointments(apts);
      setSales(sls);
      setMetrics(mtr);
    } catch (err) {
      console.error('Error switching user role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cash Shifts Handlers
  const handleOpenShift = async (initialCash: number, notes?: string) => {
    const res = await api.openCashShift(initialCash, notes);
    setIsShiftOpen(true);
    setCurrentShift(res.shift);
  };

  const handleCloseShift = async (actualCounted: number, notes?: string) => {
    const res = await api.closeCashShift(actualCounted, notes);
    setIsShiftOpen(false);
    setCurrentShift(res.shift);
    return { verdict: res.verdict, difference: res.difference };
  };

  // Handlers for Appointments
  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await api.updateAppointmentStatus(id, status);
      const [apts, mtr, clts] = await Promise.all([
        api.getAppointments(selectedDate),
        api.getDashboardMetrics(selectedDate),
        api.getClients(),
      ]);
      setAppointments(apts);
      setMetrics(mtr);
      setClients(clts);
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(err.message || 'Error al actualizar el estado de la cita.');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await api.deleteAppointment(id);
      const [apts, mtr] = await Promise.all([
        api.getAppointments(selectedDate),
        api.getDashboardMetrics(selectedDate),
      ]);
      setAppointments(apts);
      setMetrics(mtr);
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      alert(err.message || 'Error al cancelar la cita.');
    }
  };

  const handleSaveAppointment = async (data: Partial<Appointment>) => {
    await api.createAppointment(data);
    const [apts, clts, mtr] = await Promise.all([
      api.getAppointments(selectedDate),
      api.getClients(),
      api.getDashboardMetrics(selectedDate),
    ]);
    setAppointments(apts);
    setClients(clts);
    setMetrics(mtr);
  };

  const handleOpenNewAtSlot = (time: string, barberId?: string) => {
    setSlotTimeForModal(time);
    if (barberId) setSlotBarberIdForModal(barberId);
    setIsAppointmentModalOpen(true);
  };

  const handleOpenCheckoutFromAppointment = (apt: Appointment) => {
    setPosTargetAppointment(apt);
    setCurrentTab('pos');
  };

  // Handlers for Checkout / Sales
  const handleProcessCheckout = async (checkoutData: any): Promise<Sale> => {
    const sale = await api.processCheckout(checkoutData);
    const [apts, sls, mtr, clts, shiftData] = await Promise.all([
      api.getAppointments(selectedDate),
      api.getSales(selectedDate),
      api.getDashboardMetrics(selectedDate),
      api.getClients(),
      api.getCurrentShift().catch(() => ({ is_open: true, shift: null })),
    ]);
    setAppointments(apts);
    setSales(sls);
    setMetrics(mtr);
    setClients(clts);
    if (shiftData.shift) setCurrentShift(shiftData.shift);
    return sale;
  };

  // Handlers for Services
  const handleCreateService = async (serviceData: Partial<Service>) => {
    await api.createService(serviceData);
    const srvs = await api.getServices();
    setServices(srvs);
  };

  const handleUpdateService = async (id: string, serviceData: Partial<Service>) => {
    await api.updateService(id, serviceData);
    const srvs = await api.getServices();
    setServices(srvs);
  };

  const handleDeleteService = async (id: string) => {
    await api.deleteService(id);
    const srvs = await api.getServices();
    setServices(srvs);
  };

  // Handlers for Clients
  const handleCreateClient = async (clientData: Partial<Client>) => {
    await api.createClient(clientData);
    const clts = await api.getClients();
    setClients(clts);
  };

  const handleUpdateClient = async (id: string, clientData: Partial<Client>) => {
    await api.updateClient(id, clientData);
    const clts = await api.getClients();
    setClients(clts);
  };

  const handleDeleteClient = async (id: string) => {
    await api.deleteClient(id);
    const clts = await api.getClients();
    setClients(clts);
  };

  // Handlers for Barbers
  const handleCreateBarber = async (barberData: Partial<Barber>) => {
    await api.createBarber(barberData);
    const brbs = await api.getBarbers();
    setBarbers(brbs);
  };

  const handleUpdateBarber = async (id: string, barberData: Partial<Barber>) => {
    await api.updateBarber(id, barberData);
    const brbs = await api.getBarbers();
    setBarbers(brbs);
  };

  // Handler for Client Booking Portal
  const handleClientBooking = async (aptData: Partial<Appointment>): Promise<Appointment> => {
    const res = await api.createAppointment(aptData);
    const [apts, clts, mtr] = await Promise.all([
      api.getAppointments(selectedDate),
      api.getClients(),
      api.getDashboardMetrics(selectedDate),
    ]);
    setAppointments(apts);
    setClients(clts);
    setMetrics(mtr);
    return res;
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex flex-col font-sans relative selection:bg-[#1a4fd6] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        viewMode={viewMode}
        currentUser={currentUser}
        setViewMode={setViewMode}
        onSwitchUserRole={handleSwitchUserRole}
        onOpenNewAppointment={() => {
          setSlotTimeForModal('10:00');
          setSlotBarberIdForModal('');
          setIsAppointmentModalOpen(true);
        }}
      />

      {/* Main Body */}
      {viewMode === 'client' ? (
        /* Public Client Booking View */
        <main className="flex-1">
          <ClientBookingView
            services={services}
            barbers={barbers}
            onBookAppointment={handleClientBooking}
            onBackToAdmin={() => setViewMode('admin')}
          />
        </main>
      ) : (
        /* Admin / Booksy Biz Management View */
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-[#1a4fd6] border-t-[#f0b429] rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {currentTab === 'agenda' && (
                  <AgendaView
                    appointments={appointments}
                    barbers={barbers}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedBarberId={selectedBarberId}
                    setSelectedBarberId={setSelectedBarberId}
                    currentUser={currentUser}
                    onStatusChange={handleStatusChange}
                    onOpenCheckout={handleOpenCheckoutFromAppointment}
                    onNewAppointmentAtSlot={handleOpenNewAtSlot}
                    onDeleteAppointment={handleDeleteAppointment}
                  />
                )}

                {currentTab === 'services' && (
                  <ServicesView
                    services={services}
                    onCreateService={handleCreateService}
                    onUpdateService={handleUpdateService}
                    onDeleteService={handleDeleteService}
                  />
                )}

                {currentTab === 'clients' && (
                  <ClientsView
                    clients={clients}
                    onCreateClient={handleCreateClient}
                    onUpdateClient={handleUpdateClient}
                    onDeleteClient={handleDeleteClient}
                  />
                )}

                {currentTab === 'barbers' && (
                  <BarbersView
                    barbers={barbers}
                    onCreateBarber={handleCreateBarber}
                    onUpdateBarber={handleUpdateBarber}
                  />
                )}

                {currentTab === 'pos' && (
                  <PosView
                    activeAppointments={appointments.filter((a) => a.status !== 'cancelled')}
                    barbers={barbers}
                    sales={sales}
                    currentShift={currentShift}
                    isShiftOpen={isShiftOpen}
                    currentUser={currentUser}
                    initialAppointment={posTargetAppointment}
                    onOpenShift={handleOpenShift}
                    onCloseShift={handleCloseShift}
                    onProcessCheckout={handleProcessCheckout}
                  />
                )}

                {currentTab === 'stats' && (
                  <StatsView metrics={metrics} sales={sales} />
                )}
              </>
            )}
          </main>
        </div>
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        services={services}
        barbers={barbers}
        clients={clients}
        initialDate={selectedDate}
        initialTime={slotTimeForModal}
        initialBarberId={slotBarberIdForModal}
        onSave={handleSaveAppointment}
      />
    </div>
  );
};

export default App;
