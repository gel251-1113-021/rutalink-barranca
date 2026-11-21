'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  Compass, 
  User, 
  LogIn, 
  LogOut, 
  Sun, 
  Moon, 
  ChevronDown, 
  ShieldCheck, 
  Car, 
  MapPin, 
  Users,
  MessageSquare,
  BarChart3,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';
import RutaLinkLogo from './Branding/RutaLinkLogo';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenHistory?: () => void;
  onOpenVehicleDesigner?: () => void;
  onOpenDispatcherPanel?: () => void;
  onOpenGroupManagement?: () => void;
  onOpenSmsFallback?: () => void;
  onOpenAnalytics?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isOffline?: boolean;
}

const ROLE_LABELS: Record<UserRole, { label: string; badgeClass: string; icon: any }> = {
  PASAJERO: {
    label: 'Pasajero',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60',
    icon: User
  },
  CONDUCTOR_AFILIADO: {
    label: 'Chofer Afiliado',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60',
    icon: Car
  },
  CONDUCTOR_INDEPENDIENTE: {
    label: 'Chofer Indep.',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60',
    icon: Car
  },
  ADMIN_EMPRESA: {
    label: 'Admin Empresa',
    badgeClass: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/60',
    icon: ShieldCheck
  },
  ENCARGADO_PARADERO: {
    label: 'Despachador',
    badgeClass: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200/60',
    icon: MapPin
  },
  SUPERADMIN: {
    label: 'SuperAdmin',
    badgeClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60',
    icon: ShieldCheck
  }
};

export default function Header({ 
  onOpenAuth, 
  onOpenProfile, 
  onOpenHistory,
  onOpenVehicleDesigner,
  onOpenDispatcherPanel,
  onOpenGroupManagement,
  onOpenSmsFallback,
  onOpenAnalytics,
  darkMode, 
  onToggleDarkMode,
  isOffline = false
}: HeaderProps) {
  const { user, profile, isGuest, logout, switchRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const currentRole = profile?.active_role || 'PASAJERO';
  const roleInfo = ROLE_LABELS[currentRole] || ROLE_LABELS.PASAJERO;
  const RoleIcon = roleInfo.icon;

  const availableRoles: UserRole[] = [
    'PASAJERO',
    'CONDUCTOR_AFILIADO',
    'CONDUCTOR_INDEPENDIENTE',
    'ENCARGADO_PARADERO',
    'ADMIN_EMPRESA'
  ];

  return (
    <header className="relative z-30 w-full bg-white/95 dark:bg-[#121417]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-4 py-2.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo Oficial de Barranca & Marca */}
        <div className="flex items-center gap-2 cursor-pointer">
          <RutaLinkLogo size="md" showSubtitle={true} />
          {/* Indicador de Red */}
          <div 
            title={isOffline ? 'Sin conexión de red - Modo Off-Grid' : 'Conectado a la red de Barranca'}
            className="flex items-center ml-1"
          >
            {isOffline ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-full border border-amber-200/60">
                <WifiOff className="w-3 h-3" /> Offline
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
        </div>

        {/* Acciones de la barra */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Botón Modo Sin Internet (SMS) */}
          {onOpenSmsFallback && (
            <button
              onClick={onOpenSmsFallback}
              title="Consultar horarios y carros por SMS tradicional (sin saldo ni megas)"
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Sin Internet (SMS)</span>
            </button>
          )}

          {/* Botón Reporte de Viajes */}
          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              title="Ver reporte de viajes y flota"
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Reporte Viajes</span>
            </button>
          )}

          {/* Alternador de Modo Claro / Oscuro */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Alternar tema"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {isGuest ? (
            /* Modo Invitado */
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-medium">
                <Users className="w-3.5 h-3.5" /> Modo Invitado
              </span>
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
            </div>
          ) : (
            /* Usuario Autenticado con Selector Dinámico de Rol */
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Botones de Acción Especializados por Rol */}
              {(currentRole === 'CONDUCTOR_AFILIADO' || currentRole === 'CONDUCTOR_INDEPENDIENTE') && onOpenVehicleDesigner && (
                <button
                  onClick={onOpenVehicleDesigner}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-100 transition"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Diseñar Unidad</span>
                </button>
              )}

              {currentRole === 'ENCARGADO_PARADERO' && onOpenDispatcherPanel && (
                <button
                  onClick={onOpenDispatcherPanel}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/70 hover:bg-blue-100 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Control Paradero</span>
                </button>
              )}

              {currentRole === 'ADMIN_EMPRESA' && onOpenGroupManagement && (
                <button
                  onClick={onOpenGroupManagement}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/70 hover:bg-purple-100 transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Gestión Flota</span>
                </button>
              )}

              {/* Selector de Rol Dinámico */}
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition ${roleInfo.badgeClass}`}
                >
                  <RoleIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{roleInfo.label}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#16181d] rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-1.5 z-50 text-xs">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      Alternar Rol Activo
                    </div>
                    {availableRoles.map((r) => {
                      const item = ROLE_LABELS[r];
                      const Icon = item.icon;
                      const isCurrent = currentRole === r;
                      return (
                        <button
                          key={r}
                          onClick={() => {
                            switchRole(r);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between transition ${
                            isCurrent
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 font-bold text-blue-700 dark:text-blue-300'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                          </div>
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botón de Historial de Viajes */}
              {onOpenHistory && (
                <button
                  onClick={onOpenHistory}
                  title="Ver mi historial de viajes"
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 transition"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline font-semibold">Historial</span>
                </button>
              )}

              {/* Botón de Perfil */}
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 transition"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden md:inline font-semibold truncate max-w-[120px]">
                  {profile?.full_name?.split(' ')[0] || 'Mi Perfil'}
                </span>
              </button>

              {/* Salir */}
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
