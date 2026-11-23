'use client';

import React, { useState } from 'react';
import { X, Check, AlertCircle, Send, CheckCircle2, Car, Users, Volume2, Save, Radio } from 'lucide-react';
import RealisticVehicleSVG from '../Branding/RealisticVehicleSVG';
import { notificationService } from '../../lib/notifications';

interface Seat {
  id: string;
  label: string;
  type: 'driver' | 'passenger';
  status: 'occupied' | 'free';
  x: number;
  y: number;
}

interface DriverCockpitModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  vehicleType?: string;
  vehicleId?: string;
  initialSeats?: Seat[];
  hasRegisteredVehicle?: boolean;
  onOpenDesigner?: () => void;
  onUpdateStatus?: (status: string, note: string) => void;
  onUpdateSeats?: (layout: Seat[]) => void;
  onSendMessage?: (msg: string) => void;
}

const getCategorySeats = (type?: string): Seat[] => {
  const norm = (type || '').toUpperCase();
  if (norm.includes('MOTO')) {
    return [
      { id: 'c1', label: 'Conductor', type: 'driver', status: 'occupied', x: 1.5, y: 1 },
      { id: 's1', label: 'P1 Izq', type: 'passenger', status: 'free', x: 1, y: 2 },
      { id: 's2', label: 'P2 Centro', type: 'passenger', status: 'occupied', x: 1.5, y: 2 },
      { id: 's3', label: 'P3 Der', type: 'passenger', status: 'free', x: 2, y: 2 }
    ];
  }
  if (norm.includes('MINIVAN')) {
    return [
      { id: 'c1', label: 'Chofer', type: 'driver', status: 'occupied', x: 1, y: 1 },
      { id: 's1', label: 'Copiloto A1', type: 'passenger', status: 'free', x: 2, y: 1 },
      { id: 's2', label: 'A2 Fila 2 Izq', type: 'passenger', status: 'occupied', x: 1, y: 2 },
      { id: 's3', label: 'A3 Fila 2 Der', type: 'passenger', status: 'free', x: 2, y: 2 },
      { id: 's4', label: 'A4 Fila 3 Izq', type: 'passenger', status: 'free', x: 1, y: 3 },
      { id: 's5', label: 'A5 Fila 3 Centro', type: 'passenger', status: 'free', x: 1.5, y: 3 },
      { id: 's6', label: 'A6 Fila 3 Der', type: 'passenger', status: 'free', x: 2, y: 3 }
    ];
  }
  if (norm.includes('COMBI') || norm.includes('BUS')) {
    return [
      { id: 'c1', label: 'Chofer', type: 'driver', status: 'occupied', x: 1, y: 1 },
      { id: 's1', label: 'Copiloto A1', type: 'passenger', status: 'free', x: 3, y: 1 },
      { id: 's2', label: 'A2', type: 'passenger', status: 'free', x: 1, y: 2 },
      { id: 's3', label: 'A3', type: 'passenger', status: 'free', x: 2, y: 2 },
      { id: 's4', label: 'A4', type: 'passenger', status: 'occupied', x: 3, y: 2 },
      { id: 's5', label: 'A5', type: 'passenger', status: 'free', x: 1, y: 3 },
      { id: 's6', label: 'A6', type: 'passenger', status: 'occupied', x: 2, y: 3 },
      { id: 's7', label: 'A7', type: 'passenger', status: 'free', x: 3, y: 3 },
      { id: 's8', label: 'A8', type: 'passenger', status: 'free', x: 1, y: 4 },
      { id: 's9', label: 'A9', type: 'passenger', status: 'free', x: 2, y: 4 },
      { id: 's10', label: 'A10', type: 'passenger', status: 'free', x: 3, y: 4 },
      { id: 's11', label: 'A11', type: 'passenger', status: 'free', x: 1, y: 5 },
      { id: 's12', label: 'A12', type: 'passenger', status: 'free', x: 1.6, y: 5 },
      { id: 's13', label: 'A13', type: 'passenger', status: 'free', x: 2.3, y: 5 },
      { id: 's14', label: 'A14', type: 'passenger', status: 'free', x: 3, y: 5 }
    ];
  }
  // Station Wagon / Probox o Sedán
  return [
    { id: 'c1', label: 'Conductor', type: 'driver', status: 'occupied', x: 1, y: 1 },
    { id: 's1', label: 'Copiloto A1', type: 'passenger', status: 'free', x: 2, y: 1 },
    { id: 's2', label: 'Atrás Izq A2', type: 'passenger', status: 'occupied', x: 1, y: 2 },
    { id: 's3', label: 'Atrás Centro A3', type: 'passenger', status: 'free', x: 1.5, y: 2 },
    { id: 's4', label: 'Atrás Der A4', type: 'passenger', status: 'free', x: 2, y: 2 }
  ];
};

const normalizeSeats = (input: any, vehicleType?: string): Seat[] => {
  if (!input) return getCategorySeats(vehicleType);
  let parsed = input;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return getCategorySeats(vehicleType);
    }
  }
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.map((s: any, idx: number) => ({
      id: s.id || `s${idx}`,
      label: s.label || `Asiento ${idx + 1}`,
      type: s.type || 'passenger',
      status: s.status === 'occupied' ? 'occupied' : 'free',
      x: typeof s.x === 'number' ? s.x : 1,
      y: typeof s.y === 'number' ? s.y : 1
    }));
  }
  return getCategorySeats(vehicleType);
};

export default function DriverCockpitModal({
  isOpen,
  onClose,
  driverName = 'Conductor Autorizado',
  vehiclePlate = 'SIN-PLACA',
  vehicleModel = 'Unidad en Ruta',
  vehicleType = 'SEDAN',
  vehicleId,
  initialSeats,
  hasRegisteredVehicle = true,
  onOpenDesigner,
  onUpdateStatus,
  onUpdateSeats,
  onSendMessage
}: DriverCockpitModalProps) {
  // Estados de conducción
  const [currentStatus, setCurrentStatus] = useState<'DISPONIBLE' | 'EN_RUTA' | 'LLENO' | 'FUERA_SERVICIO'>('EN_RUTA');
  const [statusNote, setStatusNote] = useState('Conduciendo ahora');

  // Disposición 2D de asientos adaptada por tipo de vehículo o cargada de la BD
  const [seats, setSeats] = useState<Seat[]>(() => normalizeSeats(initialSeats, vehicleType));

  React.useEffect(() => {
    setSeats(normalizeSeats(initialSeats, vehicleType));
  }, [vehicleType, initialSeats]);

  const [notification, setNotification] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen) return null;

  const passengerSeats = seats.filter(s => s.type !== 'driver');
  const occupiedCount = passengerSeats.filter(s => s.status === 'occupied').length;
  const freeCount = passengerSeats.length - occupiedCount;

  // Alternar asiento en 1 toque
  const toggleSeat = async (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.type === 'driver') return;

    const newSeats = seats.map(s => {
      if (s.id === seatId) {
        return {
          ...s,
          status: s.status === 'free' ? ('occupied' as const) : ('free' as const)
        };
      }
      return s;
    });

    setSeats(newSeats);
    const updatedSeat = newSeats.find(s => s.id === seatId);

    // Notificación visual rápida
    showToast(`${seat.label}: ${updatedSeat?.status === 'occupied' ? 'Ocupado' : 'Libre'}`);

    if (onUpdateSeats) {
      onUpdateSeats(newSeats);
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rutalink-backend.onrender.com';
      await fetch(`${apiUrl}/api/driver/seats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, plate: vehiclePlate, seatLayout: newSeats })
      });
    } catch (e) {
      // Offline fallback
    }
  };

  // Cambiar estado en 1 toque
  const handleSelectStatus = async (status: 'DISPONIBLE' | 'EN_RUTA' | 'LLENO' | 'FUERA_SERVICIO', note: string) => {
    setCurrentStatus(status);
    setStatusNote(note);
    showToast(`Estado: ${note}`);

    if (onUpdateStatus) {
      onUpdateStatus(status, note);
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rutalink-backend.onrender.com';
      await fetch(`${apiUrl}/api/driver/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, plate: vehiclePlate, status, contextualNote: note })
      });
    } catch (e) {
      // Offline fallback
    }
  };

  // Enviar mensaje rápido
  const sendCannedMessage = (msg: string) => {
    showToast(`Mensaje enviado: "${msg}"`);
    if (onSendMessage) {
      onSendMessage(msg);
    }
  };

  // Guardar y Publicar en Tiempo Real hacia todos los pasajeros y la BD
  const handlePublishAll = async () => {
    setIsPublishing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rutalink-backend.onrender.com';
      await Promise.all([
        fetch(`${apiUrl}/api/driver/seats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleId, plate: vehiclePlate, seatLayout: seats })
        }).catch(() => null),
        fetch(`${apiUrl}/api/driver/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleId, plate: vehiclePlate, status: currentStatus, contextualNote: statusNote })
        }).catch(() => null)
      ]);

      if (onUpdateSeats) onUpdateSeats(seats);
      if (onUpdateStatus) onUpdateStatus(currentStatus, statusNote);

      notificationService.playChime('message');
      showToast('✓ ¡Asientos y estado publicados en vivo a los pasajeros!');
    } catch {
      showToast('Actualizado localmente en cabina.');
    } finally {
      setIsPublishing(false);
    }
  };

  const showToast = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#14161a] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Cabecera Móvil de la Cabina */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Cabina del Conductor</h2>
              <p className="text-xs text-blue-100">{driverName} · <span className="font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded text-[11px]">{vehiclePlate}</span></p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de alerta si aún no tiene vehículo registrado en la base de datos */}
        {!hasRegisteredVehicle && (
          <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/30 px-4 py-3 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <span className="text-lg shrink-0">🛠️</span>
              <div className="min-w-0">
                <strong className="block font-bold">Sin Unidad Vinculada</strong>
                <span className="text-[11px] opacity-80 block truncate">Registra tu placa y modelo para transmitir asientos en vivo.</span>
              </div>
            </div>
            {onOpenDesigner && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDesigner();
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-xl text-xs shrink-0 shadow-xs transition"
              >
                Diseñar Auto
              </button>
            )}
          </div>
        )}

        {/* Notificación Toast flotante */}
        {notification && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 text-center animate-in fade-in">
            ✓ {notification}
          </div>
        )}

        {/* Contenido Táctil con Scroll Fluido */}
        <div className="p-5 overflow-y-auto overscroll-contain touch-scroll space-y-5 pb-12">
          
          {/* 1. Selector de Estado Táctil (1 toque) */}
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2.5">
              ¿Qué estás haciendo ahora? (Toca para cambiar)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectStatus('EN_RUTA', 'Conduciendo ahora')}
                className={`p-4 rounded-2xl border text-left transition flex items-center justify-between active:scale-95 ${
                  currentStatus === 'EN_RUTA'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></span>
                    <span className="font-bold text-sm sm:text-base">Conduciendo</span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-1">En marcha por la ruta</span>
                </div>
                {currentStatus === 'EN_RUTA' && <Check className="w-5 h-5 text-blue-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectStatus('DISPONIBLE', 'Esperando en paradero')}
                className={`p-4 rounded-2xl border text-left transition flex items-center justify-between active:scale-95 ${
                  currentStatus === 'DISPONIBLE'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                    <span className="font-bold text-sm sm:text-base">Esperando</span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-1">Llenando en paradero</span>
                </div>
                {currentStatus === 'DISPONIBLE' && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectStatus('LLENO', 'Vehículo lleno')}
                className={`p-4 rounded-2xl border text-left transition flex items-center justify-between active:scale-95 ${
                  currentStatus === 'LLENO'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600"></span>
                    <span className="font-bold text-sm sm:text-base">Lleno</span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-1">Completo</span>
                </div>
                {currentStatus === 'LLENO' && <Check className="w-5 h-5 text-rose-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectStatus('FUERA_SERVICIO', 'Fuera de turno')}
                className={`p-4 rounded-2xl border text-left transition flex items-center justify-between active:scale-95 ${
                  currentStatus === 'FUERA_SERVICIO'
                    ? 'border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                    <span className="font-bold text-sm sm:text-base">Descanso</span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-1">Fuera de servicio</span>
                </div>
                {currentStatus === 'FUERA_SERVICIO' && <Check className="w-5 h-5 text-slate-700 dark:text-slate-200 shrink-0" />}
              </button>
            </div>
          </div>

          {/* 2. Visualizador Táctil 2D de Asientos (Toca para Libre/Ocupado) */}
          <div className="bg-slate-50 dark:bg-[#1a1d24] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Control Táctil de Asientos
                </h3>
                <p className="text-[11px] text-slate-500">Toca con el dedo cualquier asiento para cambiar su estado</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {freeCount} libres / {occupiedCount} ocupados
                </span>
              </div>
            </div>

            {/* Maqueta Fiel del Vehículo SVG Top-Down */}
            <div className="relative max-w-[280px] mx-auto bg-white dark:bg-[#111317] rounded-3xl p-3 border-2 border-slate-300 dark:border-slate-700 shadow-inner">
              <RealisticVehicleSVG
                category={vehicleType || 'SEDAN'}
                seats={seats}
                onToggleSeat={(id) => toggleSeat(id)}
                interactive={true}
                plate={vehiclePlate}
                className="w-full"
              />
            </div>

            {/* Botón táctil para publicar asientos al instante */}
            <div className="mt-3">
              <button
                type="button"
                onClick={handlePublishAll}
                disabled={isPublishing}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Radio className={`w-3.5 h-3.5 ${isPublishing ? 'animate-spin' : 'animate-pulse'}`} />
                <span>{isPublishing ? 'Emitiendo...' : `Emitir ${freeCount} Asientos Libres en Vivo`}</span>
              </button>
            </div>
          </div>

          {/* 3. Mensajería Rápida para Pasajeros y Despachador (1 toque) */}
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2.5">
              Mensajes Rápidos a Pasajeros (1 toque)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => sendCannedMessage('Salgo en 2 minutos')}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-white dark:bg-[#16181e] text-left text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4 text-blue-600 shrink-0" />
                <span>«Salgo en 2 minutos»</span>
              </button>

              <button
                type="button"
                onClick={() => sendCannedMessage('Hay tráfico en la Panamericana')}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 bg-white dark:bg-[#16181e] text-left text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-2 active:scale-95"
              >
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>«Hay tráfico en Panamericana»</span>
              </button>

              <button
                type="button"
                onClick={() => sendCannedMessage('Último asiento disponible')}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-white dark:bg-[#16181e] text-left text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>«Último asiento disponible»</span>
              </button>

              <button
                type="button"
                onClick={() => sendCannedMessage('Llegando al Paradero UNAB')}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-[#16181e] text-left text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-2 active:scale-95"
              >
                <Volume2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>«Llegando a paradero UNAB»</span>
              </button>
            </div>
          </div>

        </div>

        {/* Pie del modal con botón de Guardar y Publicar en Tiempo Real */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111317] flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handlePublishAll}
            disabled={isPublishing}
            className="w-full sm:flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Radio className={`w-4 h-4 ${isPublishing ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{isPublishing ? 'Publicando en Vivo...' : '💾 Guardar y Publicar en Tiempo Real'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-2xl transition active:scale-95"
          >
            Volver al mapa
          </button>
        </div>

      </div>
    </div>
  );
}
