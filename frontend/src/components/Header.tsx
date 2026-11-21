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
  Users 
} from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenVehicleDesigner?: () => void;
  onOpenDispatcherPanel?: () => void;
  onOpenGroupManagement?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const ROLE_LABELS: Record<UserRole, { label: string; badgeClass: string; icon: any }> = {
  PASAJERO: {
    label: 'Pasajero',
    badgeClass: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: User
  },
  CONDUCTOR_AFILIADO: {
    label: 'Chofer Afiliado',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: Car
  },
  CONDUCTOR_INDEPENDIENTE: {
    label: 'Chofer Indep.',
    badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: Car
  },
  ADMIN_EMPRESA: {
    label: 'Admin Empresa',
    badgeClass: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    icon: ShieldCheck
  },
  ENCARGADO_PARADERO: {
    label: 'Despachador',
    badgeClass: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    icon: MapPin
  },
  SUPERADMIN: {
    label: 'SuperAdmin',
    badgeClass: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    icon: ShieldCheck
  }
};

export default function Header({ 
  onOpenAuth, 
  onOpenProfile, 
  onOpenVehicleDesigner,
  onOpenDispatcherPanel,
  onOpenGroupManagement,
  darkMode, 
  onToggleDarkMode 
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
    <header className="relative z-30 w-full bg-white/95 dark:bg-[#121417]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & Marca */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold shadow-sm">
            <Compass className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-50">
                RutaLink
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Barranca
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-0.5">
              UNAB · Supe · Pativilca · Paramonga
            </p>
          </div>
        </div>

        {/* Acciones de la barra */}
        <div className="flex items-center gap-2">
          {/* Alternador de Modo Claro / Oscuro */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Alternar tema"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {isGuest ? (
            /* Modo Invitado */
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-medium">
                <Users className="w-3.5 h-3.5" /> Modo Invitado
              </span>
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" /> Iniciar Sesión
              </button>
            </div>
          ) : (
            /* Usuario Autenticado con Selector Dinámico de Rol */
            <div className="flex items-center gap-2">
              {/* Botones de Acción Especializados por Rol */}
              {(currentRole === 'CONDUCTOR_AFILIADO' || currentRole === 'CONDUCTOR_INDEPENDIENTE') && onOpenVehicleDesigner && (
                <button
                  onClick={onOpenVehicleDesigner}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Diseñar Unidad</span>
                </button>
              )}

              {currentRole === 'ENCARGADO_PARADERO' && onOpenDispatcherPanel && (
                <button
                  onClick={onOpenDispatcherPanel}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Control Paradero</span>
                </button>
              )}

              {currentRole === 'ADMIN_EMPRESA' && onOpenGroupManagement && (
                <button
                  onClick={onOpenGroupManagement}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Gestión Flota</span>
                </button>
              )}

              {/* Selector de Rol Dinámico */}
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition ${roleInfo.badgeClass}`}
                >
                  <RoleIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{roleInfo.label}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1d21] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 text-xs">
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
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
                              ? 'bg-slate-100 dark:bg-slate-800/80 font-semibold text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                          </div>
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botón de Perfil */}
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden md:inline font-medium truncate max-w-[120px]">
                  {profile?.full_name?.split(' ')[0] || 'Mi Perfil'}
                </span>
              </button>

              {/* Salir */}
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
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
