'use client';

import React from 'react';

export type VehicleCategory = 'MOTOTAXI' | 'SEDAN' | 'STATION_WAGON' | 'MINIVAN' | 'COMBI';

interface Seat {
  id: string;
  label: string;
  type: 'driver' | 'passenger';
  status: 'occupied' | 'free';
}

interface VehicleVisualizerProps {
  category: VehicleCategory | string;
  seats: Seat[];
  onToggleSeat?: (seatId: string) => void;
  interactive?: boolean;
  className?: string;
}

export function VehicleCategoryIcon({ category, className = 'w-5 h-5' }: { category: string; className?: string }) {
  const norm = (category || '').toUpperCase();
  if (norm.includes('MOTO') || norm === 'MOTOTAXI') {
    return <span className="text-base" title="Mototaxi Torito">🛺</span>;
  }
  if (norm.includes('MINIVAN')) {
    return <span className="text-base" title="Miniván">🚐</span>;
  }
  if (norm.includes('COMBI') || norm.includes('BUS')) {
    return <span className="text-base" title="Combi / Microbús">🚍</span>;
  }
  return <span className="text-base" title="Auto Sedán">🚗</span>;
}

// Visualizador Digital 2D de Vehículos con Siluetas Realistas de Barranca
export default function VehicleDigitalModel({
  category = 'SEDAN',
  seats = [],
  onToggleSeat,
  interactive = false,
  className = ''
}: VehicleVisualizerProps) {
  const norm = (category || 'SEDAN').toUpperCase();
  const isMototaxi = norm.includes('MOTO');
  const isMinivan = norm.includes('MINIVAN');
  const isCombi = norm.includes('COMBI') || norm.includes('BUS');

  // Default seats si están vacíos
  const getRenderSeats = (): Seat[] => {
    if (seats && seats.length > 0) return seats;
    if (isMototaxi) {
      return [
        { id: 'c1', label: 'Chofer', type: 'driver', status: 'occupied' },
        { id: 's1', label: 'Atrás Izq', type: 'passenger', status: 'free' },
        { id: 's2', label: 'Atrás Centro', type: 'passenger', status: 'free' },
        { id: 's3', label: 'Atrás Der', type: 'passenger', status: 'free' }
      ];
    }
    if (isMinivan) {
      return [
        { id: 'c1', label: 'Chofer', type: 'driver', status: 'occupied' },
        { id: 's1', label: 'Copiloto', type: 'passenger', status: 'free' },
        { id: 's2', label: 'Fila 2 Izq', type: 'passenger', status: 'occupied' },
        { id: 's3', label: 'Fila 2 Der', type: 'passenger', status: 'free' },
        { id: 's4', label: 'Fila 3 Izq', type: 'passenger', status: 'free' },
        { id: 's5', label: 'Fila 3 Centro', type: 'passenger', status: 'free' },
        { id: 's6', label: 'Fila 3 Der', type: 'passenger', status: 'free' }
      ];
    }
    if (isCombi) {
      return [
        { id: 'c1', label: 'Chofer', type: 'driver', status: 'occupied' },
        { id: 's1', label: 'Copiloto', type: 'passenger', status: 'free' },
        { id: 's2', label: 'Fila 1 Izq', type: 'passenger', status: 'occupied' },
        { id: 's3', label: 'Fila 1 Pasillo', type: 'passenger', status: 'free' },
        { id: 's4', label: 'Fila 1 Der', type: 'passenger', status: 'occupied' },
        { id: 's5', label: 'Fila 2 Izq', type: 'passenger', status: 'free' },
        { id: 's6', label: 'Fila 2 Der', type: 'passenger', status: 'free' },
        { id: 's7', label: 'Fondo Izq', type: 'passenger', status: 'free' },
        { id: 's8', label: 'Fondo Centro', type: 'passenger', status: 'free' },
        { id: 's9', label: 'Fondo Der', type: 'passenger', status: 'free' }
      ];
    }
    // Sedán estándar (Yaris / Sail)
    return [
      { id: 'c1', label: 'Chofer', type: 'driver', status: 'occupied' },
      { id: 's1', label: 'Copiloto', type: 'passenger', status: 'free' },
      { id: 's2', label: 'Atrás Izq', type: 'passenger', status: 'occupied' },
      { id: 's3', label: 'Atrás Centro', type: 'passenger', status: 'free' },
      { id: 's4', label: 'Atrás Der', type: 'passenger', status: 'free' }
    ];
  };

  const renderSeats = getRenderSeats();

  const handleSeatClick = (seat: Seat) => {
    if (!interactive || seat.type === 'driver' || !onToggleSeat) return;
    onToggleSeat(seat.id);
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 1. Mototaxi Torito Bajaj (3 Ruedas) */}
      {isMototaxi && (
        <div className="relative w-40 bg-white dark:bg-[#111419] rounded-3xl p-3 border-2 border-amber-400 dark:border-amber-600 shadow-md">
          {/* Lona / Carpa Superior */}
          <div className="w-full text-center mb-2">
            <span className="text-[8px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200">
              Torito Bajaj 3 Ruedas
            </span>
          </div>

          {/* Rueda delantera y Timón */}
          <div className="flex flex-col items-center mb-3">
            <div className="w-4 h-6 bg-slate-800 rounded-sm mb-1"></div>
            <div className="w-12 h-1.5 bg-slate-400 rounded-full"></div>
            <div className="mt-1 p-2 rounded-xl bg-slate-200 dark:bg-slate-800 border text-center">
              <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 block">🛵 Chofer</span>
            </div>
          </div>

          {/* Asiento Trasero (3 Pasajeros) */}
          <div className="grid grid-cols-3 gap-1 pt-2 border-t-2 border-dashed border-slate-300 dark:border-slate-700">
            {renderSeats.filter(s => s.type !== 'driver').map(seat => {
              const isOcc = seat.status === 'occupied';
              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={!interactive}
                  onClick={() => handleSeatClick(seat)}
                  className={`p-2 rounded-xl border flex flex-col items-center transition ${
                    isOcc
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-700 dark:text-rose-300'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-700 dark:text-emerald-300 hover:scale-105'
                  }`}
                >
                  <span className="text-xs">{isOcc ? '👤' : '💺'}</span>
                  <span className="text-[7.5px] font-bold mt-0.5">{isOcc ? 'Ocup.' : 'LIBRE'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Miniván 7 Pasajeros (Toyota Avanza) */}
      {isMinivan && (
        <div className="relative w-52 bg-white dark:bg-[#111419] rounded-4xl p-4 border-2 border-blue-400 dark:border-blue-600 shadow-md">
          <div className="w-full text-center mb-2">
            <span className="text-[8px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200">
              Miniván 7 Pasajeros (Avanza)
            </span>
          </div>

          {/* Parabrisas */}
          <div className="w-full h-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-3 border border-blue-200"></div>

          {/* Fila 1: Chofer y Copiloto */}
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 border text-center">
              <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">🧑‍✈️ Chofer</span>
            </div>
            {renderSeats.find(s => s.id === 's1') && (
              <button
                type="button"
                disabled={!interactive}
                onClick={() => handleSeatClick(renderSeats.find(s => s.id === 's1')!)}
                className={`p-2 rounded-xl border text-center transition ${
                  renderSeats.find(s => s.id === 's1')!.status === 'occupied'
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                }`}
              >
                <span className="text-xs">{renderSeats.find(s => s.id === 's1')!.status === 'occupied' ? '👤' : '💺'}</span>
                <span className="text-[8px] font-bold block">Copiloto</span>
              </button>
            )}
          </div>

          {/* Fila 2 (2 Asientos) */}
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            {renderSeats.filter(s => s.id === 's2' || s.id === 's3').map(seat => {
              const isOcc = seat.status === 'occupied';
              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={!interactive}
                  onClick={() => handleSeatClick(seat)}
                  className={`p-2 rounded-xl border text-center transition ${
                    isOcc ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  }`}
                >
                  <span className="text-xs">{isOcc ? '👤' : '💺'}</span>
                  <span className="text-[8px] font-bold block">{isOcc ? 'Ocupado' : 'LIBRE'}</span>
                </button>
              );
            })}
          </div>

          {/* Fila 3 (3 Asientos de fondo) */}
          <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-200 dark:border-slate-700">
            {renderSeats.filter(s => s.id === 's4' || s.id === 's5' || s.id === 's6').map(seat => {
              const isOcc = seat.status === 'occupied';
              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={!interactive}
                  onClick={() => handleSeatClick(seat)}
                  className={`p-1.5 rounded-xl border text-center transition ${
                    isOcc ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  }`}
                >
                  <span className="text-[10px]">{isOcc ? '👤' : '💺'}</span>
                  <span className="text-[7.5px] font-bold block">{isOcc ? 'Ocup.' : 'LIBRE'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Combi / Microbús (Toyota HiAce) */}
      {isCombi && (
        <div className="relative w-56 bg-white dark:bg-[#111419] rounded-4xl p-4 border-2 border-indigo-400 dark:border-indigo-600 shadow-md">
          <div className="w-full text-center mb-2">
            <span className="text-[8px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200">
              Combi Interdistrital (HiAce)
            </span>
          </div>

          {/* Parabrisas Combi */}
          <div className="w-full h-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-full mb-3 border border-indigo-200"></div>

          {/* Asientos de Combi en filas */}
          <div className="grid grid-cols-3 gap-1.5">
            {renderSeats.map(seat => {
              if (seat.type === 'driver') {
                return (
                  <div key={seat.id} className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 border text-center">
                    <span className="text-[8.5px] font-bold text-slate-700 dark:text-slate-300">🧑‍✈️ Chofer</span>
                  </div>
                );
              }
              const isOcc = seat.status === 'occupied';
              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={!interactive}
                  onClick={() => handleSeatClick(seat)}
                  className={`p-1.5 rounded-xl border text-center transition ${
                    isOcc ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  }`}
                >
                  <span className="text-[10px]">{isOcc ? '👤' : '💺'}</span>
                  <span className="text-[7.5px] font-bold block truncate">{isOcc ? 'Ocup.' : 'LIBRE'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Sedán Colectivo / Station Wagon (Toyota Yaris / Probox) */}
      {!isMototaxi && !isMinivan && !isCombi && (
        <div className="relative w-48 bg-white dark:bg-[#111419] rounded-4xl p-4 border-2 border-slate-300 dark:border-slate-700 shadow-md">
          <div className="w-full text-center mb-2">
            <span className="text-[8px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200">
              Colectivo Sedán 4 Pasajeros
            </span>
          </div>

          {/* Parabrisas */}
          <div className="w-full h-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-3 border border-blue-200"></div>

          {/* Fila Delantera */}
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 border text-center">
              <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">🧑‍✈️ Chofer</span>
            </div>
            {renderSeats.find(s => s.id === 's1') && (
              <button
                type="button"
                disabled={!interactive}
                onClick={() => handleSeatClick(renderSeats.find(s => s.id === 's1')!)}
                className={`p-2.5 rounded-xl border text-center transition ${
                  renderSeats.find(s => s.id === 's1')!.status === 'occupied'
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                }`}
              >
                <span className="text-xs">{renderSeats.find(s => s.id === 's1')!.status === 'occupied' ? '👤' : '💺'}</span>
                <span className="text-[8px] font-bold block">Copiloto</span>
              </button>
            )}
          </div>

          {/* Fila Trasera */}
          <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-200 dark:border-slate-700">
            {renderSeats.filter(s => s.id !== 'c1' && s.id !== 's1').map(seat => {
              const isOcc = seat.status === 'occupied';
              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={!interactive}
                  onClick={() => handleSeatClick(seat)}
                  className={`p-2 rounded-xl border text-center transition ${
                    isOcc ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  }`}
                >
                  <span className="text-xs">{isOcc ? '👤' : '💺'}</span>
                  <span className="text-[7.5px] font-bold block">{isOcc ? 'Ocup.' : 'LIBRE'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
