'use client';

import React from 'react';
import { Map, Car, MessageSquare, PhoneCall, Route, Shield } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'map' | 'driver' | 'chat' | 'contacts' | 'builder';
  onSelectTab: (tab: 'map' | 'driver' | 'chat' | 'contacts' | 'builder') => void;
  userRole?: string;
  unreadChatCount?: number;
}

export default function BottomNavBar({
  activeTab,
  onSelectTab,
  userRole = 'PASAJERO',
  unreadChatCount = 0
}: BottomNavBarProps) {
  const isDriver = userRole === 'CONDUCTOR_AFILIADO' || userRole === 'CONDUCTOR_INDEPENDIENTE';
  const isAdmin = userRole === 'ADMIN_EMPRESA' || userRole === 'SUPERADMIN';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111317]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 shadow-lg px-2 py-1 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. Mapa */}
        <button
          type="button"
          onClick={() => onSelectTab('map')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'map'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${activeTab === 'map' ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
            <Map className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">Mapa</span>
        </button>

        {/* 2. Cabina de Conductor / Mi Viaje */}
        <button
          type="button"
          onClick={() => onSelectTab('driver')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
            activeTab === 'driver'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${activeTab === 'driver' ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
            <Car className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">{isDriver ? 'Mi Cabina' : 'Chofer'}</span>
        </button>

        {/* 3. Chat Grupal (WhatsApp) */}
        <button
          type="button"
          onClick={() => onSelectTab('chat')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
            activeTab === 'chat'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition relative ${activeTab === 'chat' ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''}`}>
            <MessageSquare className="w-5 h-5" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5">Grupos</span>
        </button>

        {/* 4. Contactos Telefónicos */}
        <button
          type="button"
          onClick={() => onSelectTab('contacts')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'contacts'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${activeTab === 'contacts' ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
            <PhoneCall className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">Contactos</span>
        </button>

        {/* 5. Creador de Rutas (Para Administradores o trazado) */}
        <button
          type="button"
          onClick={() => onSelectTab('builder')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'builder'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${activeTab === 'builder' ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
            <Route className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">Trazar</span>
        </button>
      </div>
    </nav>
  );
}
