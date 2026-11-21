'use client';

import React, { useState } from 'react';
import { X, Check, AlertCircle, Send, CheckCircle2, Car, Users, Volume2 } from 'lucide-react';

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
  vehicleId?: string;
  onUpdateStatus?: (status: string, note: string) => void;
  onUpdateSeats?: (layout: Seat[]) => void;
  onSendMessage?: (msg: string) => void;
}

export default function DriverCockpitModal({
  isOpen,
  onClose,
  driverName = 'Jorge Huamán Castillo',
  vehiclePlate = 'B1A-789',
  vehicleModel = 'Toyota Yaris Sedán 2023',
  vehicleId = 'd0000000-0000-0000-0000-000000000001',
  onUpdateStatus,
  onUpdateSeats,
  onSendMessage
}: DriverCockpitModalProps) {
  // Estados de conducción
  const [currentStatus, setCurrentStatus] = useState<'DISPONIBLE' | 'EN_RUTA' | 'LLENO' | 'FUERA_SERVICIO'>('EN_RUTA');
  const [statusNote, setStatusNote] = useState('Conduciendo ahora');

  // Disposición 2D de asientos
  const [seats, setSeats] = useState<Seat[]>([
    { id: 'c1', label: 'Conductor', type: 'driver', status: 'occupied', x: 1, y: 1 },
    { id: 's1', label: 'Copiloto', type: 'passenger', status: 'free', x: 2, y: 1 },
    { id: 's2', label: 'Atrás Izq', type: 'passenger', status: 'occupied', x: 1, y: 2 },
    { id: 's3', label: 'Atrás Centro', type: 'passenger', status: 'free', x: 1.5, y: 2 },
    { id: 's4', label: 'Atrás Der', type: 'passenger', status: 'free', x: 2, y: 2 }
  ]);

  const [notification, setNotification] = useState<string | null>(null);

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
      await fetch('/api/driver/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, seatLayout: newSeats })
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
      await fetch('/api/driver/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, status, contextualNote: note })
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

        {/* Notificación Toast flotante */}
        {notification && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 text-center animate-in fade-in">
            ✓ {notification}
          </div>
        )}

        {/* Contenido Táctil con Scroll */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* 1. Selector de Estado Táctil (1 toque) */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              ¿Qué estás haciendo ahora? (Toca para cambiar)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectStatus('EN_RUTA', 'Conduciendo ahora')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                  currentStatus === 'EN_RUTA'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                    <span className="font-bold text-xs">Conduciendo ahora</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">En marcha por la ruta</span>
                </div>
                {currentStatus === 'EN_RUTA' && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectStatus('DISPONIBLE', 'Esperando en paradero')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                  currentStatus === 'DISPONIBLE'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="font-bold text-xs">Esperando en paradero</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Llenando asientos</span>
                </div>
                {currentStatus === 'DISPONIBLE' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectStatus('LLENO', 'Vehículo lleno')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                  currentStatus === 'LLENO'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    <span className="font-bold text-xs">Vehículo lleno</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">No recibe abordajes</span>
                </div>
                {currentStatus === 'LLENO' && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectStatus('FUERA_SERVICIO', 'Fuera de turno')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                  currentStatus === 'FUERA_SERVICIO'
                    ? 'border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span className="font-bold text-xs">Descansando</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Fuera de servicio</span>
                </div>
                {currentStatus === 'FUERA_SERVICIO' && <Check className="w-4 h-4 text-slate-700 dark:text-slate-200 shrink-0" />}
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

            {/* Maqueta del Vehículo */}
            <div className="relative max-w-[260px] mx-auto bg-white dark:bg-[#111317] rounded-3xl p-5 border-2 border-slate-300 dark:border-slate-700 shadow-inner">
              {/* Parabrisas delantero */}
              <div className="w-full h-3 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-4 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <span className="text-[8px] font-bold text-blue-600 dark:text-blue-300">PARABRISAS DELANTERO</span>
              </div>

              {/* Fila Delantera: Conductor y Copiloto */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Asiento Conductor (Fijo) */}
                <div className="p-3 rounded-2xl bg-slate-200 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-600 flex flex-col items-center justify-center text-center opacity-80 cursor-not-allowed">
                  <Car className="w-5 h-5 text-slate-700 dark:text-slate-300 mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Conductor</span>
                  <span className="text-[8px] text-slate-500 font-semibold">(Tú)</span>
                </div>

                {/* Copiloto (Táctil) */}
                <button
                  type="button"
                  onClick={() => toggleSeat('s1')}
                  className={`p-3 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center text-center shadow-xs ${
                    seats.find(s => s.id === 's1')?.status === 'occupied'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  <Users className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">Copiloto</span>
                  <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                    seats.find(s => s.id === 's1')?.status === 'occupied'
                      ? 'bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100'
                      : 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100'
                  }`}>
                    {seats.find(s => s.id === 's1')?.status === 'occupied' ? 'Ocupado' : 'LIBRE'}
                  </span>
                </button>
              </div>

              {/* Fila Trasera (3 Asientos Táctiles) */}
              <div className="grid grid-cols-3 gap-2">
                {['s2', 's3', 's4'].map(id => {
                  const s = seats.find(item => item.id === id);
                  if (!s) return null;
                  const isOcc = s.status === 'occupied';

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleSeat(id)}
                      className={`p-2.5 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center justify-center text-center shadow-xs ${
                        isOcc
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      <Users className="w-4 h-4 mb-0.5" />
                      <span className="text-[9px] font-bold truncate max-w-full">{s.label}</span>
                      <span className={`text-[8px] font-bold px-1 py-0.2 rounded-full mt-1 ${
                        isOcc
                          ? 'bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100'
                          : 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100'
                      }`}>
                        {isOcc ? 'Ocupado' : 'LIBRE'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Maletera */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-4 flex items-center justify-center">
                <span className="text-[7.5px] text-slate-500 font-semibold">MALETERA</span>
              </div>
            </div>
          </div>

          {/* 3. Mensajería Rápida para Pasajeros y Despachador (1 toque) */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Mensajes Rápidos a Pasajeros (1 toque)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => sendCannedMessage('Salgo en 2 minutos')}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-white dark:bg-[#16181e] text-left text-xs font-medium text-slate-700 dark:text-slate-200 transition flex items-center gap-2 active:bg-blue-50"
              >
                <Send className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>«Salgo en 2 minutos»</span>
              </button>

              <button
                type="button"
                onClick={() => sendCannedMessage('Hay tráfico en la Panamericana')}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 bg-white dark:bg-[#16181e] text-left text-xs font-medium text-slate-700 dark:text-slate-200 transition flex items-center gap-2 active:bg-amber-50"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>«Hay tráfico en Panamericana»</span>
              </button>

              <button
                type="button"
                onClick={() => sendCannedMessage('Último asiento disponible')}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-white dark:bg-[#16181e] text-left text-xs font-medium text-slate-700 dark:text-slate-200 transition flex items-center gap-2 active:bg-emerald-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>«Último asiento disponible»</span>
              </button>

              <button
                type="button"
                onClick={() => sendCannedMessage('Llegando al Paradero UNAB')}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-[#16181e] text-left text-xs font-medium text-slate-700 dark:text-slate-200 transition flex items-center gap-2 active:bg-indigo-50"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>«Llegando a paradero UNAB»</span>
              </button>
            </div>
          </div>

        </div>

        {/* Pie del modal con botón de cierre */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111317] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Listo, volver al mapa
          </button>
        </div>

      </div>
    </div>
  );
}
