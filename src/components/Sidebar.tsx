import React from 'react';
import {
  CalendarDays,
  Scissors,
  Users,
  Sparkles,
  CreditCard,
  BarChart3,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const menuItems = [
    { id: 'agenda', label: 'Agenda & Calendario', icon: CalendarDays, badge: 'En vivo' },
    { id: 'services', label: 'Servicios & Tarifas', icon: Scissors },
    { id: 'clients', label: 'Clientes & CRM', icon: Users, badge: 'WhatsApp' },
    { id: 'barbers', label: 'Equipo Barberos', icon: Sparkles },
    { id: 'pos', label: 'Caja & Checkout', icon: CreditCard, badge: 'QR Simple' },
    { id: 'stats', label: 'Métricas de Negocio', icon: BarChart3 },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#0d2347]/70 backdrop-blur-md border-r border-[#3b82f6]/20 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-[#60a5fa] uppercase tracking-wider mb-2 font-heading">
            Gestión Booksy Biz
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1a4fd6] to-[#2563eb] text-white shadow-md shadow-[#1a4fd6]/30 border border-[#3b82f6]/40'
                      : 'text-[#c8deff] hover:bg-[#102a54] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#f0b429]' : 'text-[#60a5fa]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#f0b429] text-[#0a1628]'
                          : 'bg-[#102a54] text-[#60a5fa] border border-[#3b82f6]/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Barber Pole Mini Graphic */}
        <div className="rounded-xl p-3 bg-[#0a1628]/80 border border-[#3b82f6]/20 overflow-hidden relative">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-2.5 h-10 rounded-full barber-pole-stripes border border-white/20 shrink-0"></div>
            <div>
              <div className="text-xs font-bold text-[#f0b429]">Sillones Activos</div>
              <div className="text-[11px] text-[#94a3b8]">4 Barberos disponibles hoy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Footer */}
      <div className="pt-4 border-t border-[#3b82f6]/15 text-xs text-[#94a3b8] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px]">Desarrollado para:</span>
          <span className="text-[#f0b429] font-bold text-[11px]">Bolivia</span>
        </div>
        <a
          href="https://apolodigital.lat"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#102a54]/60 hover:bg-[#1a4fd6]/20 border border-[#3b82f6]/20 text-[#c8deff] hover:text-white transition-all text-[11px] group"
        >
          <span>apolodigital.lat</span>
          <ExternalLink className="w-3 h-3 text-[#60a5fa] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </aside>
  );
};
