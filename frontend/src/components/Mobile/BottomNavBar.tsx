'use client';

import React from 'react';
import { Map, Car, MessageSquare, PhoneCall, Route, Clock } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'map' | 'driver' | 'chat' | 'contacts' | 'builder' | 'history';
  onSelectTab: (tab: 'map' | 'driver' | 'chat' | 'contacts' | 'builder' | 'history') => void;
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
    <nav 
      aria-label="Navegación principal inferior"
      className="fixed bottom-0 left-0 right-0 z-40 h-[62px] bg-white/98 dark:bg-[#111317]/98 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 safe-area-bottom select-none"
    >
      <div className="max-w-md mx-auto h-full flex items-center justify-around">
        {/* 1. Mapa Interactivo */}
        <button
          type="button"
          onClick={() => onSelectTab('map')}
          className={`flex-1 h-full flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
            activeTab === 'map'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition ${activeTab === 'map' ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/20' : ''}`}>
            <Map className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs font-semibold mt-0.5 tracking-tight">Mapa</span>
        </button>

        {/* 2. Para Conductor: Mi Cabina | Para Pasajero: Mis Viajes */}
        {isDriver ? (
          <button
            type="button"
            onClick={() => onSelectTab('driver')}
            className={`flex-1 h-full flex flex-col items-center justify-center py-1 rounded-2xl transition-all relative ${
              activeTab === 'driver'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${activeTab === 'driver' ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/20' : ''}`}>
              <Car className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs font-semibold mt-0.5 tracking-tight">Mi Cabina</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectTab('history')}
            className={`flex-1 h-full flex flex-col items-center justify-center py-1 rounded-2xl transition-all relative ${
              activeTab === 'history'
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${activeTab === 'history' ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/20' : ''}`}>
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs font-semibold mt-0.5 tracking-tight">Mis Viajes</span>
          </button>
        )}

        {/* 3. Grupos WhatsApp (Comité y Pasajeros) */}
        <button
          type="button"
          onClick={() => onSelectTab('chat')}
          className={`flex-1 h-full flex flex-col items-center justify-center py-1 rounded-2xl transition-all relative ${
            activeTab === 'chat'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition relative ${activeTab === 'chat' ? 'bg-emerald-50 dark:bg-emerald-900/40 ring-1 ring-emerald-500/20' : ''}`}>
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold mt-0.5 tracking-tight">Grupos</span>
        </button>

        {/* 4. Contactos Telefónicos */}
        <button
          type="button"
          onClick={() => onSelectTab('contacts')}
          className={`flex-1 h-full flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
            activeTab === 'contacts'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition ${activeTab === 'contacts' ? 'bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-500/20' : ''}`}>
            <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-xs font-semibold mt-0.5 tracking-tight">Contactos</span>
        </button>

        {/* 5. Creador de Rutas (Administrador) */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => onSelectTab('builder')}
            className={`flex-1 h-full flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
              activeTab === 'builder'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${activeTab === 'builder' ? 'bg-indigo-50 dark:bg-indigo-900/40 ring-1 ring-indigo-500/20' : ''}`}>
              <Route className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs font-semibold mt-0.5 tracking-tight">Trazar</span>
          </button>
        )}
      </div>
    </nav>
  );
}
