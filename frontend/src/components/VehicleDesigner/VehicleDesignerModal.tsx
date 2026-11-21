'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Car, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Layers
} from 'lucide-react';

interface SeatConfig {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'driver' | 'passenger';
  status: 'free' | 'occupied';
}

interface VehicleDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const PRESET_TEMPLATES: Record<string, { name: string; capacity: number; seats: SeatConfig[] }> = {
  SEDAN: {
    name: 'Sedán Estándar (Toyota Yaris / Chevrolet Sail)',
    capacity: 4,
    seats: [
      { id: 's_drv', label: 'Chofer', x: 1, y: 1, type: 'driver', status: 'occupied' },
      { id: 's_cop', label: 'Copiloto', x: 2, y: 1, type: 'passenger', status: 'free' },
      { id: 's_r1', label: 'Atrás Izq', x: 1, y: 2, type: 'passenger', status: 'free' },
      { id: 's_r2', label: 'Atrás Med', x: 2, y: 2, type: 'passenger', status: 'free' },
      { id: 's_r3', label: 'Atrás Der', x: 3, y: 2, type: 'passenger', status: 'free' }
    ]
  },
  SUV: {
    name: 'SUV / Camioneta Rural (Toyota Rush / Avanza)',
    capacity: 6,
    seats: [
      { id: 's_drv', label: 'Chofer', x: 1, y: 1, type: 'driver', status: 'occupied' },
      { id: 's_cop', label: 'Copiloto', x: 2, y: 1, type: 'passenger', status: 'free' },
      { id: 's_m1', label: 'Fila 2 Izq', x: 1, y: 2, type: 'passenger', status: 'free' },
      { id: 's_m2', label: 'Fila 2 Med', x: 2, y: 2, type: 'passenger', status: 'free' },
      { id: 's_m3', label: 'Fila 2 Der', x: 3, y: 2, type: 'passenger', status: 'free' },
      { id: 's_b1', label: 'Fila 3 Izq', x: 1, y: 3, type: 'passenger', status: 'free' },
      { id: 's_b2', label: 'Fila 3 Der', x: 2, y: 3, type: 'passenger', status: 'free' }
    ]
  },
  MINIVAN: {
    name: 'Miniván Colectivo (Hyundai H1 / Joylong)',
    capacity: 10,
    seats: [
      { id: 's_drv', label: 'Chofer', x: 1, y: 1, type: 'driver', status: 'occupied' },
      { id: 's_cop', label: 'Copiloto', x: 2, y: 1, type: 'passenger', status: 'free' },
      { id: 's_f2_1', label: 'F2-1', x: 1, y: 2, type: 'passenger', status: 'free' },
      { id: 's_f2_2', label: 'F2-2', x: 2, y: 2, type: 'passenger', status: 'free' },
      { id: 's_f2_3', label: 'F2-3', x: 3, y: 2, type: 'passenger', status: 'free' },
      { id: 's_f3_1', label: 'F3-1', x: 1, y: 3, type: 'passenger', status: 'free' },
      { id: 's_f3_2', label: 'F3-2', x: 2, y: 3, type: 'passenger', status: 'free' },
      { id: 's_f3_3', label: 'F3-3', x: 3, y: 3, type: 'passenger', status: 'free' },
      { id: 's_f4_1', label: 'F4-1', x: 1, y: 4, type: 'passenger', status: 'free' },
      { id: 's_f4_2', label: 'F4-2', x: 2, y: 4, type: 'passenger', status: 'free' },
      { id: 's_f4_3', label: 'F4-3', x: 3, y: 4, type: 'passenger', status: 'free' }
    ]
  },
  COMBI: {
    name: 'Combi Interdistrital (Toyota HiAce)',
    capacity: 14,
    seats: [
      { id: 's_drv', label: 'Chofer', x: 1, y: 1, type: 'driver', status: 'occupied' },
      { id: 's_cop1', label: 'Copiloto 1', x: 2, y: 1, type: 'passenger', status: 'free' },
      { id: 's_cop2', label: 'Copiloto 2', x: 3, y: 1, type: 'passenger', status: 'free' },
      { id: 's_f2_1', label: 'F2-1', x: 1, y: 2, type: 'passenger', status: 'free' },
      { id: 's_f2_2', label: 'F2-2', x: 2, y: 2, type: 'passenger', status: 'free' },
      { id: 's_f2_3', label: 'F2-3', x: 3, y: 2, type: 'passenger', status: 'free' },
      { id: 's_f3_1', label: 'F3-1', x: 1, y: 3, type: 'passenger', status: 'free' },
      { id: 's_f3_2', label: 'F3-2', x: 2, y: 3, type: 'passenger', status: 'free' },
      { id: 's_f3_3', label: 'F3-3', x: 3, y: 3, type: 'passenger', status: 'free' },
      { id: 's_f4_1', label: 'F4-1', x: 1, y: 4, type: 'passenger', status: 'free' },
      { id: 's_f4_2', label: 'F4-2', x: 2, y: 4, type: 'passenger', status: 'free' },
      { id: 's_f4_3', label: 'F4-3', x: 3, y: 4, type: 'passenger', status: 'free' },
      { id: 's_f4_4', label: 'F4-4', x: 4, y: 4, type: 'passenger', status: 'free' }
    ]
  }
};

export default function VehicleDesignerModal({ isOpen, onClose, onSaved }: VehicleDesignerModalProps) {
  const { user } = useAuth();

  const [selectedTemplate, setSelectedTemplate] = useState<'SEDAN' | 'SUV' | 'MINIVAN' | 'COMBI'>('SEDAN');
  const [plate, setPlate] = useState('B1A-789');
  const [brandModel, setBrandModel] = useState('Toyota Yaris 2022');
  const [seats, setSeats] = useState<SeatConfig[]>(PRESET_TEMPLATES.SEDAN.seats);

  // Características de Carga
  const [roofRack, setRoofRack] = useState(true);
  const [maxCargoKg, setMaxCargoKg] = useState(40);
  const [cargoStatus, setCargoStatus] = useState<'VACIO' | 'MEDIO' | 'LLENO'>('VACIO');

  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
        if (s.type === 'driver') return s;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16181d] w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 flex items-center justify-center font-bold">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Constructor 2D: Diseña tu Unidad
              </h2>
              <p className="text-[11px] text-slate-500">
                Plano digital táctil de cabina y control de carga para Barranca
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
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 text-rose-700 dark:text-rose-300'
              }`}
            >
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Selector de Plantilla Visual */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs uppercase font-bold">{type}</div>
                  <div className="text-[10px] opacity-75">{PRESET_TEMPLATES[type].capacity} Pasajeros</div>
                </button>
              ))}
            </div>
          </div>

          {/* Plano Gráfico Interactivo de Asientos */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#121417] border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                2. Plano Táctil de Cabina ({freeSeatsCount} de {passengerSeatsCount} Libres)
              </span>
              <span className="text-[11px] text-slate-400">Toca un asiento para alternar estado</span>
            </div>

            {/* Chasis estilizado del vehículo en SVG */}
            <div className="relative max-w-xs mx-auto p-4 rounded-3xl bg-white dark:bg-[#181a20] border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-center text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                Frente / Capó
              </div>

              {/* Matriz de asientos */}
              <div className="space-y-2.5">
                {[1, 2, 3, 4].map(row => {
                  const rowSeats = seats.filter(s => s.y === row);
                  if (rowSeats.length === 0) return null;

                  return (
                    <div key={row} className="flex items-center justify-center gap-2.5">
                      {rowSeats.map(seat => {
                        const isDriver = seat.type === 'driver';
                        const isFree = seat.status === 'free';

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => handleToggleSeatStatus(seat.id)}
                            className={`px-3 py-2 rounded-xl text-center text-xs font-semibold transition flex flex-col items-center justify-center min-w-[65px] ${
                              isDriver
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 cursor-default'
                                : isFree
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70 hover:bg-emerald-100'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/70 hover:bg-rose-100'
                            }`}
                          >
                            <span className="text-[10px] leading-tight block">{seat.label}</span>
                            <span className="text-[9px] uppercase font-bold mt-0.5">
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Número de Placa
                </label>
                <input
                  type="text"
                  required
                  value={plate}
                  onChange={e => setPlate(e.target.value.toUpperCase())}
                  placeholder="B1A-789"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Modelo y Marca
                </label>
                <input
                  type="text"
                  required
                  value={brandModel}
                  onChange={e => setBrandModel(e.target.value)}
                  placeholder="Toyota Yaris 2022"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Especificaciones de Carga */}
            <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-[#121417] border border-slate-200/70 dark:border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                3. Capacidad de Carga y Parrilla Superior
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center text-xs">
                {/* Parrilla en Techo */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-700">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Parrilla en Techo</span>
                  <input
                    type="checkbox"
                    checked={roofRack}
                    onChange={e => setRoofRack(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* Peso Máximo */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-700">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-600">Carga máx:</span>
                    <strong className="text-blue-600">{maxCargoKg} kg</strong>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={5}
                    value={maxCargoKg}
                    onChange={e => setMaxCargoKg(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Estado de Bodega */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-700">
                  <span className="text-[11px] block mb-1 text-slate-600">Espacio en Maletera:</span>
                  <select
                    value={cargoStatus}
                    onChange={e => setCargoStatus(e.target.value as any)}
                    className="w-full text-[11px] bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
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
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
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
