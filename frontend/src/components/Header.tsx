'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Clock,
  Share2,
  Menu,
  X,
  HelpCircle,
  Star
} from 'lucide-react';
import RutaLinkLogo from './Branding/RutaLinkLogo';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenCockpit?: () => void;
  onOpenHistory?: () => void;
  onOpenVehicleDesigner?: () => void;
  onOpenDispatcherPanel?: () => void;
  onOpenGroupManagement?: () => void;
  onOpenSmsFallback?: () => void;
  onOpenAnalytics?: () => void;
  onOpenShareApp?: () => void;
  onOpenGuide?: () => void;
  onOpenReviews?: () => void;
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
  CHOFER: {
    label: 'Chofer',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60',
    icon: Car
  },
  CONDUCTOR: {
    label: 'Conductor',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60',
    icon: Car
  },
  ADMIN_EMPRESA: {
    label: 'Admin Empresa',
    badgeClass: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/60',
    icon: ShieldCheck
  },
  ADMIN_GRUPO_PASAJEROS: {
    label: 'Admin Pasajeros',
    badgeClass: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/60',
    icon: Users
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
  onOpenCockpit,
  onOpenHistory,
  onOpenVehicleDesigner,
  onOpenDispatcherPanel,
  onOpenGroupManagement,
  onOpenSmsFallback,
  onOpenAnalytics,
  onOpenShareApp,
  onOpenGuide,
  onOpenReviews,
  darkMode, 
  onToggleDarkMode,
  isOffline = false
}: HeaderProps) {
  const { user, profile, isGuest, logout, switchRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentRole = profile?.active_role || 'PASAJERO';
  const roleInfo = (ROLE_LABELS && ROLE_LABELS[currentRole]) || (ROLE_LABELS && ROLE_LABELS.PASAJERO) || {
    label: 'Pasajero',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60',
    icon: User
  };
  const RoleIcon = roleInfo?.icon || User;

  const availableRoles: UserRole[] = [
    'PASAJERO',
    'CONDUCTOR_AFILIADO',
    'CONDUCTOR_INDEPENDIENTE',
    'CHOFER',
    'CONDUCTOR',
    'ADMIN_GRUPO_PASAJEROS',
    'ADMIN_EMPRESA',
    'ENCARGADO_PARADERO'
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
          {/* Botón Guía Interactiva en Escritorio */}
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              title="Guía rápida interactiva y ayuda"
              className="hidden lg:flex px-2.5 py-1.5 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 text-xs font-semibold transition items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Guía</span>
            </button>
          )}

          {/* Botones de Barra Superior (Visibles en Tablets y Escritorio) */}
          {onOpenSmsFallback && (
            <button
              onClick={onOpenSmsFallback}
              title="Consultar horarios y carros por SMS tradicional (sin saldo ni megas)"
              className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 text-xs font-semibold transition items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Sin Internet (SMS)</span>
            </button>
          )}

          {/* Botón Reporte de Viajes */}
          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              title="Ver reporte de viajes y flota"
              className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 text-xs font-semibold transition items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Reporte Viajes</span>
            </button>
          )}

          {/* Botón Compartir App Web */}
          {onOpenShareApp && (
            <button
              onClick={onOpenShareApp}
              title="Compartir link y código QR de la aplicación"
              className="hidden lg:flex px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-xs font-semibold transition items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Compartir App</span>
            </button>
          )}

          {/* Alternador de Modo Claro / Oscuro (En escritorio directo, en móvil en el drawer) */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Alternar tema"
            className="hidden sm:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {isGuest ? (
            /* Modo Invitado */
            <div className="flex items-center gap-1.5">
              <span className="hidden lg:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-medium">
                <Users className="w-3.5 h-3.5" /> Modo Invitado
              </span>
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
            </div>
          ) : (
            /* Usuario Autenticado con Selector Dinámico de Rol */
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Botones de Acción Especializados por Rol */}
              {(currentRole === 'CONDUCTOR_AFILIADO' || currentRole === 'CONDUCTOR_INDEPENDIENTE' || currentRole === 'CHOFER' || currentRole === 'CONDUCTOR') && (
                <>
                  {onOpenCockpit && (
                    <button
                      onClick={onOpenCockpit}
                      className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition active:scale-95"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Mi Cabina</span>
                    </button>
                  )}
                  {onOpenVehicleDesigner && (
                    <button
                      onClick={onOpenVehicleDesigner}
                      className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-100 transition"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Diseñar Unidad</span>
                    </button>
                  )}
                </>
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

              {(currentRole === 'ADMIN_EMPRESA' || currentRole === 'ADMIN_GRUPO_PASAJEROS') && onOpenGroupManagement && (
                <button
                  onClick={onOpenGroupManagement}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/70 hover:bg-purple-100 transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{currentRole === 'ADMIN_EMPRESA' ? 'Gestión Flota' : 'Gestión Grupos'}</span>
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
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#16181d] rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-1.5 z-50 text-xs animate-in fade-in duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      Alternar Rol Activo
                    </div>
                    {availableRoles.map((r) => {
                      const item = (ROLE_LABELS && ROLE_LABELS[r]) || roleInfo;
                      const Icon = item?.icon || User;
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

              {/* Botón de Historial de Viajes (Visible en sm y superior) */}
              {onOpenHistory && (
                <button
                  onClick={onOpenHistory}
                  title="Ver mi historial de viajes"
                  className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 transition"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline font-semibold">Historial</span>
                </button>
              )}

              {/* Botón de Perfil (Visible en sm y superior) */}
              <button
                onClick={onOpenProfile}
                className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 transition"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden md:inline font-semibold truncate max-w-[120px]">
                  {profile?.full_name || user?.user_metadata?.full_name || 'Mi Perfil'}
                </span>
              </button>

              {/* Salir (En escritorio directo) */}
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="hidden sm:flex p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Botón Menú Móvil Prominente (Solo teléfonos - Acceso total a todas las herramientas) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú de opciones"
            className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0 border border-slate-200/80 dark:border-slate-700 active:scale-95 text-xs font-bold shadow-2xs"
          >
            <Menu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Menú</span>
          </button>
        </div>
      </div>

      {/* Drawer Desplegable Móvil Completo - Montado en document.body con Portal para escapar del stacking context del header */}
      {mobileMenuOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-[9999] sm:hidden flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-[88%] max-w-xs h-[100dvh] bg-white dark:bg-[#13161a] border-l border-slate-200 dark:border-slate-800 flex flex-col p-4 sm:p-5 overflow-y-auto animate-in slide-in-from-right duration-200 shadow-2xl"
          >
            {/* Cabecera del Menú Lateral */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <RutaLinkLogo size="sm" showSubtitle={false} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Usuario Actual o Ingreso */}
            <div className="py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              {isGuest ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                  className="w-full py-3 px-4 rounded-2xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión / Registro</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile?.full_name || user?.user_metadata?.full_name || 'Usuario RutaLink'}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email || profile?.email || profile?.phone || 'Usuario RutaLink'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onOpenProfile(); }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold text-center hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    Ver y Editar Mi Perfil
                  </button>
                </div>
              )}
            </div>

            {/* Alternador de Rol en Móvil */}
            {!isGuest && (
              <div className="py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Mi Rol Activo</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {availableRoles.map(r => {
                    const item = (ROLE_LABELS && ROLE_LABELS[r]) || roleInfo;
                    const Icon = item?.icon || User;
                    const isCurrent = currentRole === r;
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition text-left ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Herramientas Principales Táctiles (48px alto por botón) */}
            <div className="py-3 space-y-1 flex-1 overflow-y-auto">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Todas las Opciones</p>
              
              {/* 1. Guía Interactiva */}
              {onOpenGuide && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenGuide(); }}
                  className="w-full p-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-left text-sm font-bold flex items-center justify-between text-blue-700 dark:text-blue-300 active:scale-98 transition"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Guía de RutaLink</span>
                  </div>
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Ayuda</span>
                </button>
              )}

              {/* 2. Compartir App Web y QR */}
              {onOpenShareApp && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenShareApp(); }}
                  className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left text-sm font-semibold flex items-center gap-3 text-emerald-600 dark:text-emerald-400 active:scale-98 transition"
                >
                  <Share2 className="w-5 h-5 shrink-0" />
                  <span>Compartir App y Código QR</span>
                </button>
              )}

              {/* 3. Reporte de Viajes */}
              {onOpenAnalytics && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAnalytics(); }}
                  className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left text-sm font-semibold flex items-center gap-3 text-slate-700 dark:text-slate-200 active:scale-98 transition"
                >
                  <BarChart3 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Reporte de Movilidad (PDF)</span>
                </button>
              )}

              {/* 4. Calificaciones y Reseñas (Solo registrados) */}
              {onOpenReviews && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isGuest) {
                      onOpenAuth();
                      return;
                    }
                    onOpenReviews();
                  }}
                  className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left text-sm font-semibold flex items-center justify-between text-amber-600 dark:text-amber-400 active:scale-98 transition"
                >
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 shrink-0 fill-amber-500 text-amber-500" />
                    <span>Calificaciones y Reseñas</span>
                  </div>
                  {isGuest && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md">Regístrate</span>}
                </button>
              )}

              {/* 5. Historial de Viajes (Solo registrados) */}
              {onOpenHistory && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isGuest) {
                      onOpenAuth();
                      return;
                    }
                    onOpenHistory();
                  }}
                  className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left text-sm font-semibold flex items-center justify-between text-slate-700 dark:text-slate-200 active:scale-98 transition"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                    <span>Historial de Mis Viajes</span>
                  </div>
                  {isGuest && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md">Regístrate</span>}
                </button>
              )}

              {/* 6. Modo Sin Internet (SMS) (Público / Abierto) */}
              {onOpenSmsFallback && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenSmsFallback(); }}
                  className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left text-sm font-semibold flex items-center gap-3 text-slate-700 dark:text-slate-200 active:scale-98 transition"
                >
                  <MessageSquare className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Modo Sin Megas (SMS)</span>
                </button>
              )}

              {/* 7. Grupos de Transporte y Pasajeros (Solo registrados) */}
              {onOpenGroupManagement && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isGuest) {
                      onOpenAuth();
                      return;
                    }
                    onOpenGroupManagement();
                  }}
                  className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left text-sm font-semibold flex items-center justify-between text-purple-600 dark:text-purple-400 active:scale-98 transition"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 shrink-0" />
                    <span>Grupos de Pasajeros y Empresas</span>
                  </div>
                  {isGuest && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md">Regístrate</span>}
                </button>
              )}

              {/* Herramientas especializadas según rol */}
              {(currentRole === 'CONDUCTOR_AFILIADO' || currentRole === 'CONDUCTOR_INDEPENDIENTE') && onOpenVehicleDesigner && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenVehicleDesigner(); }}
                  className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left text-sm font-semibold flex items-center gap-3 text-emerald-600 dark:text-emerald-400 active:scale-98 transition"
                >
                  <Car className="w-5 h-5 shrink-0" />
                  <span>Diseñador 2D de Mi Unidad</span>
                </button>
              )}

              {currentRole === 'ENCARGADO_PARADERO' && onOpenDispatcherPanel && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenDispatcherPanel(); }}
                  className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left text-sm font-semibold flex items-center gap-3 text-cyan-600 dark:text-cyan-400 active:scale-98 transition"
                >
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>Control de Paradero Base</span>
                </button>
              )}
            </div>

            {/* Alternar Tema y Cerrar Sesión */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 shrink-0">
              <button
                onClick={onToggleDarkMode}
                className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center justify-between active:scale-98 transition"
              >
                <span>Modo de Pantalla: {darkMode ? 'Oscuro' : 'Claro'}</span>
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {!isGuest && (
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="w-full p-2.5 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-sm font-bold flex items-center justify-center gap-2 active:scale-98 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
