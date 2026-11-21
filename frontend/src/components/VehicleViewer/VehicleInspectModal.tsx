'use client';

import React from 'react';
import { X, Phone, MessageCircle, Star, Users, MapPin, CheckCircle, Navigation } from 'lucide-react';

interface Seat {
  id: string;
  label: string;
  type: 'driver' | 'passenger';
  status: 'occupied' | 'free';
}

interface VehicleInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: {
    id: string;
    plate: string;
    brand_model: string;
    vehicle_type?: string;
    driver_name?: string;
    driver_phone?: string;
    driver_rating?: number | string;
    status: string;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    seat_layout?: Seat[];
    route_name?: string;
  } | null;
  onBoardRequest?: (vehicleId: string) => void;
}

export default function VehicleInspectModal({
  isOpen,
  onClose,
  vehicle,
  onBoardRequest
}: VehicleInspectModalProps) {
  if (!isOpen || !vehicle) return null;

  const ratingNum = typeof vehicle.driver_rating === 'number'
    ? vehicle.driver_rating
    : parseFloat(String(vehicle.driver_rating || '5.0'));

  const seats: Seat[] = Array.isArray(vehicle.seat_layout) && vehicle.seat_layout.length > 0
    ? vehicle.seat_layout
    : [
        { id: 'c1', label: 'Conductor', type: 'driver', status: 'occupied' },
        { id: 's1', label: 'Copiloto', type: 'passenger', status: 'free' },
        { id: 's2', label: 'Atrás Izq', type: 'passenger', status: 'occupied' },
        { id: 's3', label: 'Atrás Centro', type: 'passenger', status: 'free' },
        { id: 's4', label: 'Atrás Der', type: 'passenger', status: 'free' }
      ];

  const passengerSeats = seats.filter(s => s.type !== 'driver');
  const occupiedCount = passengerSeats.filter(s => s.status === 'occupied').length;
  const freeCount = passengerSeats.length - occupiedCount;

  const phone = vehicle.driver_phone || '+51 987654323';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${cleanPhone.startsWith('51') ? cleanPhone : '51' + cleanPhone}?text=${encodeURIComponent(`Hola, veo tu vehículo ${vehicle.brand_model} (${vehicle.plate}) en RutaLink.`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#13161a] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Cabecera con Placa Destacada */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg">
              🚗
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">
                Vehículo en Vivo
              </span>
              <h2 className="text-sm font-bold truncate">{vehicle.brand_model}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black bg-white text-slate-900 px-2 py-0.8 rounded-lg shadow-xs">
              {vehicle.plate}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenido Visual */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* 1. Maqueta Visual 3D / Isométrica del Vehículo */}
          <div className="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-[#1b1f26] dark:to-[#14171d] p-4 rounded-3xl border border-slate-300 dark:border-slate-700 text-center relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Modelo Virtual e Interiores
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                {freeCount} de {passengerSeats.length} asientos libres
              </span>
            </div>

            {/* Chasis estilizado del carro (Vista aérea) */}
            <div className="relative w-44 mx-auto bg-white dark:bg-[#0f1115] rounded-[36px] p-4 border-2 border-slate-400 dark:border-slate-600 shadow-md">
              
              {/* Luces y Parabrisas Delantero */}
              <div className="w-full h-3 bg-blue-200 dark:bg-blue-900/50 rounded-full mb-3 border border-blue-300 dark:border-blue-700 flex items-center justify-center">
                <span className="text-[7.5px] font-bold text-blue-700 dark:text-blue-300">PARABRISAS</span>
              </div>

              {/* Fila Delantera */}
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                {/* Conductor */}
                <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-col items-center">
                  <span className="text-xs">🧑‍✈️</span>
                  <span className="text-[8px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">Chofer</span>
                </div>

                {/* Copiloto */}
                <div className={`p-2 rounded-xl border flex flex-col items-center transition ${
                  seats.find(s => s.id === 's1')?.status === 'occupied'
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-700 dark:text-rose-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                }`}>
                  <span className="text-xs">{seats.find(s => s.id === 's1')?.status === 'occupied' ? '👤' : '💺'}</span>
                  <span className="text-[8px] font-bold mt-0.5">
                    {seats.find(s => s.id === 's1')?.status === 'occupied' ? 'Ocupado' : 'LIBRE'}
                  </span>
                </div>
              </div>

              {/* Fila Trasera */}
              <div className="grid grid-cols-3 gap-1.5">
                {['s2', 's3', 's4'].map((id) => {
                  const s = seats.find(item => item.id === id);
                  const isOcc = s?.status === 'occupied';

                  return (
                    <div
                      key={id}
                      className={`p-1.5 rounded-xl border flex flex-col items-center ${
                        isOcc
                          ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-700 dark:text-rose-300'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      <span className="text-[10px]">{isOcc ? '👤' : '💺'}</span>
                      <span className="text-[7.5px] font-bold mt-0.5">
                        {isOcc ? 'Ocupado' : 'LIBRE'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Luneta y Maletera Trasera */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-3 border border-slate-300 dark:border-slate-700"></div>
            </div>
          </div>

          {/* 2. Datos del Conductor y Estado */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#181c22] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Conductor Asignado</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {vehicle.driver_name || 'Jorge Huamán Castillo'}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{isNaN(ratingNum) ? '5.0' : ratingNum.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500">Estado actual:</span>
              <span className={`font-bold flex items-center gap-1 ${
                vehicle.status === 'DISPONIBLE' ? 'text-emerald-600' : 'text-blue-600'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                {vehicle.status === 'DISPONIBLE' ? 'Disponible para abordar' : 'En ruta (con pasajeros)'}
              </span>
            </div>
          </div>

          {/* 3. Botones de Acción Directa con el Conductor (1 toque) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Llamar */}
            <a
              href={`tel:${phone}`}
              className="py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Phone className="w-4 h-4" />
              <span>Llamar Chofer</span>
            </a>

            {/* WhatsApp */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Botón de abordaje "Me subo aquí" */}
          <button
            type="button"
            onClick={() => {
              if (onBoardRequest) onBoardRequest(vehicle.id);
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-2xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            <span>Esperar este carro en mi posición</span>
          </button>

        </div>

      </div>
    </div>
  );
}
