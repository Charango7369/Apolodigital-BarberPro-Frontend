import React, { useState } from 'react';
import { CreditCard, QrCode, Banknote, DollarSign, CheckCircle, Printer, Share2, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Appointment, Barber, Sale } from '../types';

interface PosViewProps {
  activeAppointments: Appointment[];
  barbers: Barber[];
  sales: Sale[];
  initialAppointment?: Appointment | null;
  onProcessCheckout: (data: {
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
  }) => Promise<Sale>;
}

export const PosView: React.FC<PosViewProps> = ({
  activeAppointments,
  barbers,
  sales,
  initialAppointment,
  onProcessCheckout,
}) => {
  const [selectedAptId, setSelectedAptId] = useState<string>(initialAppointment?.id || '');
  const [clientName, setClientName] = useState(initialAppointment?.client_name || '');
  const [selectedBarberId, setSelectedBarberId] = useState(initialAppointment?.barber_id || barbers[0]?.id || '');
  const [serviceAmount, setServiceAmount] = useState<number>(initialAppointment?.price || 50);
  const [productAmount, setProductAmount] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(5);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr_simple' | 'card'>('qr_simple');
  const [cashReceived, setCashReceived] = useState<number>(60);
  const [notes, setNotes] = useState('');

  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // When selected appointment changes
  const handleAppointmentSelect = (aptId: string) => {
    setSelectedAptId(aptId);
    if (!aptId) return;
    const apt = activeAppointments.find((a) => a.id === aptId);
    if (apt) {
      setClientName(apt.client_name);
      setSelectedBarberId(apt.barber_id);
      setServiceAmount(apt.price);
      setCashReceived(apt.price + tipAmount);
    }
  };

  const currentBarber = barbers.find((b) => b.id === selectedBarberId) || barbers[0];
  const subtotal = serviceAmount + productAmount;
  const total = subtotal + tipAmount;
  const changeDue = Math.max(0, cashReceived - total);

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || total <= 0) return;

    setIsProcessing(true);
    try {
      const sale = await onProcessCheckout({
        appointment_id: selectedAptId || undefined,
        client_name: clientName,
        barber_id: currentBarber.id,
        barber_name: currentBarber.name,
        services_total: serviceAmount,
        products_total: productAmount,
        tip: tipAmount,
        total: total,
        payment_method: paymentMethod,
        notes: notes || undefined,
      });

      setCompletedSale(sale);

      // Confetti celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f0b429', '#1a4fd6', '#60a5fa', '#ffffff'],
      });
    } catch (err) {
      console.error(err);
      alert('Error al registrar la venta en caja.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewCheckout = () => {
    setCompletedSale(null);
    setSelectedAptId('');
    setClientName('');
    setServiceAmount(50);
    setProductAmount(0);
    setTipAmount(5);
    setCashReceived(60);
    setNotes('');
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-[#0d2347]/80 border border-[#3b82f6]/20 flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#f0b429]" />
            Caja & Punto de Venta (POS)
          </h2>
          <p className="text-xs text-[#94a3b8] mt-1">
            Cobro rápido de citas finalizadas, propinas de barberos y pagos con QR Simple Bolivia.
          </p>
        </div>

        {completedSale && (
          <button
            onClick={handleNewCheckout}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1a4fd6] to-[#2563eb] text-white text-xs font-semibold shadow-md shadow-[#1a4fd6]/30"
          >
            + Nueva Transacción
          </button>
        )}
      </div>

      {completedSale ? (
        /* Digital Receipt View */
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#0d2347] border-2 border-[#f0b429]/40 shadow-2xl relative text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0a1628] border border-[#f0b429] mx-auto flex items-center justify-center mb-3">
            <CheckCircle className="w-8 h-8 text-[#f0b429]" />
          </div>

          <h3 className="font-heading font-extrabold text-2xl text-white mb-1">
            ¡Cobro Exitoso!
          </h3>
          <p className="text-xs text-[#60a5fa] mb-6">
            Comprobante Oficial • ApoloDigital Barber
          </p>

          <div className="p-4 rounded-xl bg-[#0a1628] border border-[#3b82f6]/20 text-left space-y-3 mb-6 text-xs">
            <div className="flex justify-between border-b border-[#3b82f6]/15 pb-2">
              <span className="text-[#94a3b8]">Transacción:</span>
              <span className="font-mono text-white">{completedSale.id}</span>
            </div>
            <div className="flex justify-between border-b border-[#3b82f6]/15 pb-2">
              <span className="text-[#94a3b8]">Cliente:</span>
              <span className="font-bold text-white">{completedSale.client_name}</span>
            </div>
            <div className="flex justify-between border-b border-[#3b82f6]/15 pb-2">
              <span className="text-[#94a3b8]">Barbero Asignado:</span>
              <span className="text-[#60a5fa]">{completedSale.barber_name}</span>
            </div>
            <div className="flex justify-between border-b border-[#3b82f6]/15 pb-2">
              <span className="text-[#94a3b8]">Método de Pago:</span>
              <span className="capitalize font-semibold text-[#f0b429]">
                {completedSale.payment_method === 'qr_simple'
                  ? 'QR Simple Bolivia'
                  : completedSale.payment_method === 'cash'
                  ? 'Efectivo'
                  : 'Tarjeta'}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#3b82f6]/15 pb-2">
              <span className="text-[#94a3b8]">Servicio:</span>
              <span className="text-white">{completedSale.subtotal} Bs.</span>
            </div>
            {completedSale.tip > 0 && (
              <div className="flex justify-between border-b border-[#3b82f6]/15 pb-2">
                <span className="text-[#94a3b8]">Propina Barbero:</span>
                <span className="text-[#fbbf24]">+{completedSale.tip} Bs.</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-sm font-extrabold text-white">
              <span className="text-[#60a5fa]">TOTAL PAGADO:</span>
              <span className="text-[#f0b429] text-base">{completedSale.total} Bs.</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={printReceipt}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#102a54] hover:bg-[#1a4fd6]/40 text-white text-xs font-semibold border border-[#3b82f6]/30 transition-all"
            >
              <Printer className="w-4 h-4 text-[#60a5fa]" />
              <span>Imprimir Ticket</span>
            </button>
            <button
              onClick={handleNewCheckout}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#1a4fd6] to-[#2563eb] text-white text-xs font-bold shadow-md shadow-[#1a4fd6]/30"
            >
              Siguiente Cobro
            </button>
          </div>
        </div>
      ) : (
        /* Form POS Checkout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form & Selection */}
          <div className="lg:col-span-2 space-y-5">
            {/* Quick appointment selector */}
            <div className="p-4 rounded-2xl bg-[#0d2347]/70 border border-[#3b82f6]/20">
              <label className="block text-xs font-bold text-[#60a5fa] uppercase tracking-wider mb-2">
                1. Seleccionar Cita en Curso / Pendiente de Cobro
              </label>
              <select
                value={selectedAptId}
                onChange={(e) => handleAppointmentSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#3b82f6]/30 text-white text-sm focus:outline-none focus:border-[#60a5fa]"
              >
                <option value="">-- Cobro Libre / Cliente Sin Cita Previa (Walk-in) --</option>
                {activeAppointments.map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    {apt.time} • {apt.client_name} • {apt.service_name} ({apt.price} Bs.) - {apt.barber_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer & Barber details */}
            <div className="p-5 rounded-2xl bg-[#0d2347]/70 border border-[#3b82f6]/20 space-y-4">
              <h3 className="font-heading font-bold text-sm text-white">
                2. Datos del Cliente & Especialista
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#c8deff] mb-1">Nombre del Cliente</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej: Marcelo Suárez"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#3b82f6]/30 text-white text-sm focus:outline-none focus:border-[#60a5fa]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#c8deff] mb-1">Barbero que atendió</label>
                  <select
                    value={selectedBarberId}
                    onChange={(e) => setSelectedBarberId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-[#3b82f6]/30 text-white text-sm focus:outline-none focus:border-[#60a5fa]"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.nickname || b.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing items */}
            <div className="p-5 rounded-2xl bg-[#0d2347]/70 border border-[#3b82f6]/20 space-y-4">
              <h3 className="font-heading font-bold text-sm text-white">
                3. Desglose de Servicios & Productos
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#c8deff] mb-1">Servicio de Barbería (Bs.)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={serviceAmount}
                    onChange={(e) => setServiceAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a1628] border border-[#3b82f6]/30 text-white text-sm font-bold text-[#f0b429] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#c8deff] mb-1">Productos / Pomada (Bs.)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={productAmount}
                    onChange={(e) => setProductAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a1628] border border-[#3b82f6]/30 text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#c8deff] mb-1">Propina para Barbero (Bs.)</label>
                  <div className="flex items-center gap-1.5">
                    {[0, 5, 10].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTipAmount(val)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          tipAmount === val
                            ? 'bg-[#f0b429] text-[#0a1628]'
                            : 'bg-[#102a54] text-[#94a3b8] hover:text-white'
                        }`}
                      >
                        +{val}
                      </button>
                    ))}
                    <input
                      type="number"
                      min="0"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg bg-[#0a1628] border border-[#3b82f6]/30 text-white text-xs font-bold text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-5 rounded-2xl bg-[#0d2347]/70 border border-[#3b82f6]/20 space-y-4">
              <h3 className="font-heading font-bold text-sm text-white">
                4. Método de Pago
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr_simple')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'qr_simple'
                      ? 'bg-gradient-to-br from-[#1a4fd6]/40 to-[#102a54] border-[#f0b429] shadow-lg shadow-[#f0b429]/15'
                      : 'bg-[#0a1628]/60 border-[#3b82f6]/20 text-[#94a3b8] hover:text-white'
                  }`}
                >
                  <QrCode className="w-6 h-6 text-[#f0b429]" />
                  <span className="text-xs font-bold text-white">QR Simple</span>
                  <span className="text-[10px] text-[#60a5fa]">Banco Unión / BCP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-gradient-to-br from-[#1a4fd6]/40 to-[#102a54] border-[#f0b429] shadow-lg shadow-[#f0b429]/15'
                      : 'bg-[#0a1628]/60 border-[#3b82f6]/20 text-[#94a3b8] hover:text-white'
                  }`}
                >
                  <Banknote className="w-6 h-6 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Efectivo</span>
                  <span className="text-[10px] text-[#94a3b8]">En mano</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-gradient-to-br from-[#1a4fd6]/40 to-[#102a54] border-[#f0b429] shadow-lg shadow-[#f0b429]/15'
                      : 'bg-[#0a1628]/60 border-[#3b82f6]/20 text-[#94a3b8] hover:text-white'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-[#60a5fa]" />
                  <span className="text-xs font-bold text-white">Tarjeta / POS</span>
                  <span className="text-[10px] text-[#94a3b8]">Débito / Crédito</span>
                </button>
              </div>

              {/* Cash Calculator */}
              {paymentMethod === 'cash' && (
                <div className="p-3.5 rounded-xl bg-[#0a1628] border border-[#3b82f6]/20 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#c8deff]">Monto Recibido:</span>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 rounded-lg bg-[#102a54] border border-[#3b82f6]/30 text-white font-bold text-sm text-center"
                    />
                    <span className="text-xs text-[#f0b429]">Bs.</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#94a3b8]">Cambio / Vuelto:</span>
                    <div className="font-heading font-extrabold text-base text-emerald-400">
                      {changeDue} Bs.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Interactive QR */}
          <div className="space-y-5">
            <div className="p-6 rounded-2xl bg-[#0d2347] border border-[#3b82f6]/30 shadow-xl space-y-4">
              <h3 className="font-heading font-extrabold text-lg text-white border-b border-[#3b82f6]/20 pb-3">
                Resumen de Cobro
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#c8deff]">
                  <span>Servicio en sillón:</span>
                  <span className="font-semibold text-white">{serviceAmount} Bs.</span>
                </div>
                {productAmount > 0 && (
                  <div className="flex justify-between text-[#c8deff]">
                    <span>Productos adicionales:</span>
                    <span className="font-semibold text-white">+{productAmount} Bs.</span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between text-[#fbbf24]">
                    <span>Propina ({currentBarber.name}):</span>
                    <span className="font-bold">+{tipAmount} Bs.</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#3b82f6]/20 flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-[#60a5fa]">TOTAL A COBRAR:</span>
                  <span className="font-heading font-extrabold text-2xl text-[#f0b429]">
                    {total} <span className="text-sm">Bs.</span>
                  </span>
                </div>
              </div>

              {/* QR Simple Bolivia Graphic */}
              {paymentMethod === 'qr_simple' && (
                <div className="p-4 rounded-xl bg-[#0a1628] border border-[#f0b429]/40 text-center space-y-2">
                  <div className="text-[11px] font-bold text-[#f0b429] uppercase tracking-wider">
                    QR Simple Bolivia • Interoperable
                  </div>
                  {/* Generated QR Mock pattern */}
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=APOLODIGITAL-BARBER-BOB-${total}-BS`}
                      alt="QR Simple"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[10px] text-[#94a3b8]">
                    Escanea desde cualquier app bancaria de Bolivia (Banco Unión, BCP, BNB, etc.)
                  </div>
                </div>
              )}

              {/* Final Confirm Button */}
              <button
                onClick={handleSubmitCheckout}
                disabled={isProcessing || !clientName.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:brightness-110 disabled:opacity-50 text-white font-heading font-bold text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isProcessing ? 'Procesando...' : `Confirmar Cobro • ${total} Bs.`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
