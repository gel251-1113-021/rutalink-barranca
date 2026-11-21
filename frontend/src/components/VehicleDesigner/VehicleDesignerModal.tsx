'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Car, Shield, CheckCircle2, AlertCircle, Save, Plus, Trash2, ArrowUpCircle } from 'lucide-react';

interface VehicleDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

interface SeatItem {
  id: string;
  label: string;
  type: 'driver' | 'passenger';
  status: 'free' | 'occupied';
  x: number; // Columna en el layout (1 a 4)
  y: number; // Fila en el layout (1 a 6)
}

// Plantillas preestablecidas
const PRESET_TEMPLATES: Record<string, { name: string; capacity: number; type: 'SEDAN' | 'SUV' | 'MINIVAN' | 'COMBI'; seats: SeatItem[] }> = {
  SEDAN: {
    name: 'Sedán (Toyota Yaris / Probox)',
    capacity: 4,
    type: 'SEDAN',
    seats: [
      { id: 'c1', label: 'Conductor', type: 'driver', status: 'occupied', x: 1, y: 1 },
      { id: 's1', label: 'Copiloto', type: 'passenger', status: 'free', x: 2, y: 1 },
      { id: 's2', label: 'Atrás Izq', type: 'passenger', status: 'free', x: 1, y: 2 },
      { id: 's3', label: 'Atrás Centro', type: 'passenger', status: 'free', x: 1.5, y: 2 },
      { id: 's4', label: 'Atrás Der', type: 'passenger', status: 'free', x: 2, y: 2 }
    ]
  },
  SUV: {
    name: 'SUV / Camioneta Rural (6 pas.)',
    capacity: 6,
    type: 'SUV',
    seats: [
      { id: 'c1', label: 'Conductor', type: 'driver', status: 'occupied', x: 1, y: 1 },
      { id: 's1', label: 'Copiloto', type: 'passenger', status: 'free', x: 2, y: 1 },
      { id: 's2', label: 'Fila 2 Izq', type: 'passenger', status: 'free', x: 1, y: 2 },
      { id: 's3', label: 'Fila 2 Der', type: 'passenger', status: 'free', x: 2, y: 2 },
      { id: 's4', label: 'Fila 3 Izq', type: 'passenger', status: 'free', x: 1, y: 3 },
      { id: 's5', label: 'Fila 3 Der', type: 'passenger', status: 'free', x: 2, y: 3 }
    ]
  },
  MINIVAN: {
    name: 'Miniván (Hyundai H-1 / 10 pas.)',
    capacity: 10,
    type: 'MINIVAN',
    seats: [
      { id: 'c1', label: 'Conductor', type: 'driver', status: 'occupied', x: 1, y: 1 },
      { id: 's1', label: 'Copiloto 1', type: 'passenger', status: 'free', x: 2, y: 1 },
      { id: 's2', label: 'Copiloto 2', type: 'passenger', status: 'free', x: 3, y: 1 },
      { id: 's3', label: 'Fila 2 Izq', type: 'passenger', status: 'free', x: 1, y: 2 },
      { id: 's4', label: 'Fila 2 Der', type: 'passenger', status: 'free', x: 3, y: 2 },
      { id: 's5', label: 'Fila 3 Izq', type: 'passenger', status: 'free', x: 1, y: 3 },
      { id: 's6', label: 'Fila 3 Der', type: 'passenger', status: 'free', x: 3, y: 3 },
      { id: 's7', label: 'Fila 4 Izq', type: 'passenger', status: 'free', x: 1, y: 4 },
      { id: 's8', label: 'Fila 4 Cen', type: 'passenger', status: 'free', x: 2, y: 4 },
      { id: 's9', label: 'Fila 4 Der', type: 'passenger', status: 'free', x: 3, y: 4 }
    ]
  },
  COMBI: {
    name: 'Combi Rural (Toyota HiAce / 14 pas.)',
    capacity: 14,
    type: 'COMBI',
    seats: [
      { id: 'c1', label: 'Conductor', type: 'driver', status: 'occupied', x: 1, y: 1 },
      { id: 's1', label: 'Copiloto 1', type: 'passenger', status: 'free', x: 2, y: 1 },
      { id: 's2', label: 'Copiloto 2', type: 'passenger', status: 'free', x: 3, y: 1 },
      { id: 's3', label: 'Fila 2 Izq', type: 'passenger', status: 'free', x: 1, y: 2 },
      { id: 's4', label: 'Fila 2 Pleg', type: 'passenger', status: 'free', x: 2, y: 2 },
      { id: 's5', label: 'Fila 2 Der', type: 'passenger', status: 'free', x: 3, y: 2 },
      { id: 's6', label: 'Fila 3 Izq', type: 'passenger', status: 'free', x: 1, y: 3 },
      { id: 's7', label: 'Fila 3 Pleg', type: 'passenger', status: 'free', x: 2, y: 3 },
      { id: 's8', label: 'Fila 3 Der', type: 'passenger', status: 'free', x: 3, y: 3 },
      { id: 's9', label: 'Fila 4 Izq', type: 'passenger', status: 'free', x: 1, y: 4 },
      { id: 's10', label: 'Fila 4 Cen', type: 'passenger', status: 'free', x: 2, y: 4 },
      { id: 's11', label: 'Fila 4 Der', type: 'passenger', status: 'free', x: 3, y: 4 }
    ]
  }
};

export default function VehicleDesignerModal({ isOpen, onClose, onSaved }: VehicleDesignerModalProps) {
  const { user } = useAuth();

  const [selectedTemplate, setSelectedTemplate] = useState<'SEDAN' | 'SUV' | 'MINIVAN' | 'COMBI'>('SEDAN');
  const [plate, setPlate] = useState('B1A-789');
  const [brandModel, setBrandModel] = useState('Toyota Yaris Sedán 2022');
  const [seats, setSeats] = useState<SeatItem[]>(PRESET_TEMPLATES.SEDAN.seats);
  const [roofRack, setRoofRack] = useState(true);
  const [maxCargoKg, setMaxCargoKg] = useState(40);
  const [cargoStatus, setCargoStatus] = useState<'VACIO' | 'MEDIO' | 'LLENO'>('VACIO');

  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Cargar datos existentes si los hay
  useEffect(() => {
    async function loadCurrentVehicle() {
      if (!user) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const session = JSON.parse(localStorage.getItem('sb-rnrstlizbgmxkjsekodl-auth-token') || '{}');
        const token = session.access_token;
        if (!token) return;

        const res = await fetch(`${apiUrl}/api/vehicles/my-vehicle`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.vehicle) {
            setPlate(data.vehicle.plate);
            setBrandModel(data.vehicle.brand_model);
            setSelectedTemplate(data.vehicle.vehicle_type);
            setSeats(data.vehicle.seat_layout || PRESET_TEMPLATES[data.vehicle.vehicle_type]?.seats || []);
            setRoofRack(data.vehicle.roof_rack);
            setMaxCargoKg(data.vehicle.max_cargo_kg);
            setCargoStatus(data.vehicle.cargo_status || 'VACIO');
          }
        }
      } catch (e) {
        console.warn('No se pudo cargar vehículo previo');
      }
    }
    if (isOpen) loadCurrentVehicle();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleApplyTemplate = (type: 'SEDAN' | 'SUV' | 'MINIVAN' | 'COMBI') => {
    setSelectedTemplate(type);
    const tmpl = PRESET_TEMPLATES[type];
    setSeats(tmpl.seats);
    setBrandModel(tmpl.name);
  };

  const handleToggleSeatStatus = (seatId: string) => {
    setSeats(prev => prev.map(s => {
      if (s.id === seatId) {
        if (s.type === 'driver') return s; // Asiento de conductor fijo
        return {
          ...s,
          status: s.status === 'free' ? 'occupied' : 'free'
        };
      }
      return s;
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const session = JSON.parse(localStorage.getItem('sb-rnrstlizbgmxkjsekodl-auth-token') || '{}');
      const token = session.access_token;

      const payload = {
        plate,
        brandModel,
        vehicleType: selectedTemplate,
        seatLayout: seats,
        capacity: seats.filter(s => s.type === 'passenger').length,
        roofRack,
        maxCargoKg,
        cargoStatus
      };

      const res = await fetch(`${apiUrl}/api/vehicles/save-design`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setIsSaving(false);

      if (!res.ok) {
        setMsg({ text: data.error || 'Fallo al guardar diseño', type: 'error' });
      } else {
        setMsg({ text: '¡Diseño 2D de la unidad guardado con éxito!', type: 'success' });
        if (onSaved) onSaved();
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setIsSaving(false);
      setMsg({ text: err.message || 'Error de red', type: 'error' });
    }
  };

  const passengerSeatsCount = seats.filter(s => s.type === 'passenger').length;
  const freeSeatsCount = seats.filter(s => s.type === 'passenger' && s.status === 'free').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16181d] w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold">
              <Car className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Constructor 2D: Diseña tu Unidad
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Plano digital táctil de cabina y control de carga para Barranca y la ruta
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {msg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              }`}
            >
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Selector de Plantilla Visual */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Selecciona la Carrocería Base
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['SEDAN', 'SUV', 'MINIVAN', 'COMBI'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleApplyTemplate(type)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedTemplate === type
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs uppercase">{type}</div>
                  <div className="text-[10px] opacity-75">{PRESET_TEMPLATES[type].capacity} Pasajeros</div>
                </button>
              ))}
            </div>
          </div>

          {/* Plano Gráfico Interactivo de Asientos (SVG / Canvas táctil) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#121417] border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                2. Plano Táctil de Cabina ({freeSeatsCount} de {passengerSeatsCount} Libres)
              </span>
              <span className="text-[11px] text-slate-400">Toca un asiento para alternar estado</span>
            </div>

            {/* Chasis estilizado del vehículo en SVG */}
            <div className="relative max-w-xs mx-auto p-4 rounded-3xl bg-white dark:bg-[#181a20] border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-inner">
              <div className="text-center text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                Frente / Capó
              </div>

              {/* Matriz de asientos */}
              <div className="space-y-3">
                {[1, 2, 3, 4].map(row => {
                  const rowSeats = seats.filter(s => s.y === row);
                  if (rowSeats.length === 0) return null;

                  return (
                    <div key={row} className="flex items-center justify-center gap-3">
                      {rowSeats.map(seat => {
                        const isDriver = seat.type === 'driver';
                        const isFree = seat.status === 'free';

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => handleToggleSeatStatus(seat.id)}
                            className={`px-3 py-2.5 rounded-xl text-center text-xs font-bold transition shadow-sm flex flex-col items-center justify-center min-w-[70px] ${
                              isDriver
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-default'
                                : isFree
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-emerald-400'
                                : 'bg-red-500 hover:bg-red-600 text-white border-2 border-red-400'
                            }`}
                          >
                            <span className="text-[10px] leading-tight block">{seat.label}</span>
                            <span className="text-[9px] uppercase opacity-90 mt-0.5">
                              {isDriver ? 'Chofer' : isFree ? 'Libre' : 'Ocupado'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-3">
                Maletera / Bodega Trasera
              </div>
            </div>
          </div>

          {/* Formulario Técnico de Datos y Carga */}
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Número de Placa
                </label>
                <input
                  type="text"
                  required
                  value={plate}
                  onChange={e => setPlate(e.target.value.toUpperCase())}
                  placeholder="B1A-789"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f2329] border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Modelo y Marca
                </label>
                <input
                  type="text"
                  required
                  value={brandModel}
                  onChange={e => setBrandModel(e.target.value)}
                  placeholder="Toyota Yaris 2022"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f2329] border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Especificaciones de Carga */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                3. Capacidad de Carga y Parrilla Superior
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
                {/* Parrilla en Techo */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#121417] border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-medium">Parrilla en Techo</span>
                  <input
                    type="checkbox"
                    checked={roofRack}
                    onChange={e => setRoofRack(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {/* Peso Máximo */}
                <div className="p-2 rounded-lg bg-white dark:bg-[#121417] border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Carga máx:</span>
                    <strong className="text-emerald-600">{maxCargoKg} kg</strong>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={5}
                    value={maxCargoKg}
                    onChange={e => setMaxCargoKg(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Estado de Bodega */}
                <div className="p-2 rounded-lg bg-white dark:bg-[#121417] border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] block mb-1">Espacio en Maletera:</span>
                  <select
                    value={cargoStatus}
                    onChange={e => setCargoStatus(e.target.value as any)}
                    className="w-full text-[11px] bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="VACIO">Disponible (Vacío)</option>
                    <option value="MEDIO">Medio lleno</option>
                    <option value="LLENO">Bodega Llena</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando plano...' : 'Guardar y Publicar Unidad'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
