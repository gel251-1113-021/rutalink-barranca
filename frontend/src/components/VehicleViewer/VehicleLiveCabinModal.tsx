'use client';

import React from 'react';
import { X, Car, Shield, Luggage, CheckCircle2, User } from 'lucide-react';
import { VehicleUnit } from '../../types';

interface VehicleLiveCabinModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleUnit | null;
  onSelectSeat?: (seatId: string) => void;
}

export default function VehicleLiveCabinModal({ isOpen, onClose, vehicle }: VehicleLiveCabinModalProps) {
  if (!isOpen || !vehicle) return null;

  const seatLayout: any[] = vehicle.seat_layout || [];
  const passengerSeats = seatLayout.filter(s => s.type === 'passenger');
  const freeSeats = passengerSeats.filter(s => s.status === 'free');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121417] w-full max-w-md rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabecera */}
        <div className="px-4 py-3 bg-white dark:bg-[#121417] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold">
              <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {vehicle.brand_model}
              </h3>
              <p className="text-[11px] text-slate-500">
                Placa <strong className="font-mono text-slate-700 dark:text-slate-300">{vehicle.plate}</strong> · Chofer: {vehicle.driver_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          {/* Indicador de Disponibilidad */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Disponibilidad en Vivo</span>
              <strong className="text-sm text-slate-900 dark:text-slate-100">
                {freeSeats.length} de {passengerSeats.length} asientos libres
              </strong>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              freeSeats.length > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60'
            }`}>
              {freeSeats.length > 0 ? 'Con Espacio' : 'Unidad Llena'}
            </span>
          </div>

          {/* Plano Digital de la Cabina */}
          <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-[#16181d] border border-slate-200/70 dark:border-slate-800">
            <div className="text-center text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-3">
              Frente / Parabrisas
            </div>

            <div className="max-w-[240px] mx-auto p-4 rounded-3xl bg-white dark:bg-[#1a1d22] border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              {[1, 2, 3, 4].map(row => {
                const rowSeats = seatLayout.filter(s => s.y === row);
                if (rowSeats.length === 0) return null;

                return (
                  <div key={row} className="flex items-center justify-center gap-2.5">
                    {rowSeats.map(seat => {
                      const isDriver = seat.type === 'driver';
                      const isFree = seat.status === 'free';

                      return (
                        <div
                          key={seat.id}
                          className={`px-2.5 py-2 rounded-xl text-center text-xs font-semibold shadow-2xs flex flex-col items-center justify-center min-w-[65px] transition ${
                            isDriver
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                              : isFree
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          <span className="text-[10px] leading-tight block truncate max-w-[55px]">{seat.label}</span>
                          <span className="text-[9px] font-bold mt-0.5">
                            {isDriver ? 'Chofer' : isFree ? 'Libre' : 'Ocupado'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="text-center text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-3">
              Bodega / Maletera
            </div>
          </div>

          {/* Información de Maletera y Parrilla */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Luggage className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Capacidad de Equipaje</span>
                <strong className="text-slate-800 dark:text-slate-200">{vehicle.max_cargo_kg || 40} kg</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Parrilla en Techo</span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {vehicle.roof_rack ? 'Habilitada' : 'No disponible'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
