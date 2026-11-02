import React from 'react';
import { Calendar, Plus, Scissors, Smartphone, Store } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  viewMode: 'admin' | 'client';
  setViewMode: (mode: 'admin' | 'client') => void;
  onOpenNewAppointment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  onOpenNewAppointment,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a1628]/85 backdrop-blur-md border-b border-[#3b82f6]/20 px-4 md:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a4fd6] to-[#0d2347] border border-[#3b82f6]/40 flex items-center justify-center p-1.5 shadow-lg shadow-[#1a4fd6]/20">
              <img
                src="/isotipo-apolo.png"
                alt="ApoloDigital"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback icon if image doesn't load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Scissors className="w-5 h-5 text-[#f0b429] absolute drop-shadow" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                  Apolo<span className="text-[#60a5fa]">Digital</span>
                </span>
                <span className="text-[#f0b429] font-heading font-black text-xl tracking-wider">
                  BARBER
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#94a3b8]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Booksy Biz Edition</span>
                <span className="text-[#f0b429]">•</span>
                <span className="text-[#c8deff]">apolodigital.lat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Date badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d2347]/60 border border-[#3b82f6]/20 text-xs text-[#c8deff]">
          <Calendar className="w-3.5 h-3.5 text-[#f0b429]" />
          <span className="capitalize">{todayFormatted}</span>
          <span className="text-[#94a3b8]">|</span>
          <span className="text-[#60a5fa] font-medium">Bolivia (GMT-4)</span>
        </div>

        {/* Right Actions: Mode Switcher & New Appointment */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Admin / Client */}
          <div className="flex items-center p-1 rounded-xl bg-[#0d2347] border border-[#3b82f6]/25">
            <button
              onClick={() => setViewMode('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'admin'
                  ? 'bg-gradient-to-r from-[#1a4fd6] to-[#2563eb] text-white shadow-md shadow-[#1a4fd6]/40'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Panel Barbería</span>
            </button>
            <button
              onClick={() => setViewMode('client')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'client'
                  ? 'bg-gradient-to-r from-[#f0b429] to-[#fbbf24] text-[#0a1628] font-bold shadow-md shadow-[#f0b429]/30'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portal Clientes</span>
            </button>
          </div>

          {/* Quick Action: New Appointment */}
          {viewMode === 'admin' && (
            <button
              onClick={onOpenNewAppointment}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1a4fd6] via-[#2563eb] to-[#3b82f6] hover:brightness-110 text-white text-xs md:text-sm font-semibold shadow-lg shadow-[#1a4fd6]/30 border border-[#60a5fa]/40 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Nueva Cita</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
