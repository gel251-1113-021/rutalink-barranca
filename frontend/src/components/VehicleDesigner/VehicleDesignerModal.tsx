'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  X, 
  Car, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Layers
} from 'lucide-react';
import RealisticVehicleSVG from '../Branding/RealisticVehicleSVG';

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
      { id: 'c1', label: 'Chofer', x: 1, y: 1, type: 'driver', status: 'occupied' },
      { id: 's1', label: 'Copiloto', x: 2, y: 1, type: 'passenger', status: 'free' },
      { id: 's2', label: 'Atrás Izq', x: 1, y: 2, type: 'passenger', status: 'free' },
      { id: 's3', label: 'Atrás Med', x: 2, y: 2, type: 'passenger', status: 'free' },
      { id: 's4', label: 'Atrás Der', x: 3, y: 2, type: 'passenger', status: 'free' }
    ]
  },
  MOTOTAXI: {
    name: 'Mototaxi Torito (Bajaj / TVS King)',
    capacity: 3,
    seats: [
      { id: 'c1', label: 'Chofer', x: 2, y: 1, type: 'driver', status: 'occupied' },
      { id: 's1', label: 'P1 Izq', x: 1, y: 2, type: 'passenger', status: 'free' },
      { id: 's2', label: 'P2 Centro', x: 2, y: 2, type: 'passenger', status: 'free' },
      { id: 's3', label: 'P3 Der', x: 3, y: 2, type: 'passenger', status: 'free' }
    ]
  },
  MINIVAN: {
    name: 'Miniván Colectivo (Toyota Avanza / Suzuki Ertiga)',
    capacity: 6,
    seats: [
      { id: 'c1', label: 'Chofer', x: 1, y: 1, type: 'driver', status: 'occupied' },
      { id: 's1', label: 'A1 Copiloto', x: 2, y: 1, type: 'passenger', status: 'free' },
      { id: 's2', label: 'A2 Fila 2 Izq', x: 1, y: 2, type: 'passenger', status: 'free' },
      { id: 's3', label: 'A3 Fila 2 Der', x: 2, y: 2, type: 'passenger', status: 'free' },
      { id: 's4', label: 'A4 Fila 3 Izq', x: 1, y: 3, type: 'passenger', status: 'free' },
      { id: 's5', label: 'A5 Fila 3 Centro', x: 2, y: 3, type: 'passenger', status: 'free' },
      { id: 's6', label: 'A6 Fila 3 Der', x: 3, y: 3, type: 'passenger', status: 'free' }
    ]
  },
  COMBI: {
    name: 'Combi Interdistrital (Toyota HiAce)',
    capacity: 14,
    seats: [
      { id: 'c1', label: 'Chofer', x: 1, y: 1, type: 'driver', status: 'occupied' },
      { id: 's1', label: 'Copiloto', x: 2, y: 1, type: 'passenger', status: 'free' },
      { id: 's2', label: 'A2', x: 1, y: 2, type: 'passenger', status: 'free' },
      { id: 's3', label: 'A3', x: 2, y: 2, type: 'passenger', status: 'free' },
      { id: 's4', label: 'A4', x: 3, y: 2, type: 'passenger', status: 'free' },
      { id: 's5', label: 'A5', x: 1, y: 3, type: 'passenger', status: 'free' },
      { id: 's6', label: 'A6', x: 2, y: 3, type: 'passenger', status: 'free' },
      { id: 's7', label: 'A7', x: 3, y: 3, type: 'passenger', status: 'free' },
      { id: 's8', label: 'A8', x: 1, y: 4, type: 'passenger', status: 'free' },
      { id: 's9', label: 'A9', x: 2, y: 4, type: 'passenger', status: 'free' },
      { id: 's10', label: 'A10', x: 3, y: 4, type: 'passenger', status: 'free' },
      { id: 's11', label: 'A11', x: 1, y: 5, type: 'passenger', status: 'free' },
      { id: 's12', label: 'A12', x: 2, y: 5, type: 'passenger', status: 'free' },
      { id: 's13', label: 'A13', x: 3, y: 5, type: 'passenger', status: 'free' },
      { id: 's14', label: 'A14', x: 4, y: 5, type: 'passenger', status: 'free' }
    ]
  },
  STATION_WAGON: {
    name: 'Station Wagon / SUV (Toyota Probox / Rush)',
    capacity: 4,
    seats: [
      { id: 'c1', label: 'Chofer', x: 1, y: 1, type: 'driver', status: 'occupied' },
      { id: 's1', label: 'Copiloto', x: 2, y: 1, type: 'passenger', status: 'free' },
      { id: 's2', label: 'Atrás Izq', x: 1, y: 2, type: 'passenger', status: 'free' },
      { id: 's3', label: 'Atrás Med', x: 2, y: 2, type: 'passenger', status: 'free' },
      { id: 's4', label: 'Atrás Der', x: 3, y: 2, type: 'passenger', status: 'free' }
    ]
  }
};

export default function VehicleDesignerModal({ isOpen, onClose, onSaved }: VehicleDesignerModalProps) {
  const { user } = useAuth();

  const [selectedTemplate, setSelectedTemplate] = useState<'SEDAN' | 'MOTOTAXI' | 'MINIVAN' | 'COMBI' | 'STATION_WAGON'>('SEDAN');
  const [plate, setPlate] = useState('B1A-789');
  const [brandModel, setBrandModel] = useState('Toyota Yaris 2022');
  const [seats, setSeats] = useState<SeatConfig[]>(PRESET_TEMPLATES.SEDAN.seats);

  // Características de Carga
  const [roofRack, setRoofRack] = useState(true);
  const [maxCargoKg, setMaxCargoKg] = useState(40);
  const [cargoStatus, setCargoStatus] = useState<'VACIO' | 'MEDIO' | 'LLENO'>('VACIO');
  const [currentStatus, setCurrentStatus] = useState<string>('DISPONIBLE');

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
            setCurrentStatus(data.vehicle.status || 'DISPONIBLE');
          }
        }
      } catch (e) {
        console.warn('No se pudo cargar vehículo previo');
      }
    }
    if (isOpen) loadCurrentVehicle();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleApplyTemplate = (type: 'SEDAN' | 'MOTOTAXI' | 'MINIVAN' | 'COMBI' | 'STATION_WAGON') => {
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rutalink-backend.onrender.com';
      let token = '';
      try {
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token || '';
      } catch {
        // Fallback
      }

      if (!token) {
        const session = JSON.parse(localStorage.getItem('sb-rnrstlizbgmxkjsekodl-auth-token') || '{}');
        token = session.access_token || '';
      }

      const payload = {
        plate: plate.toUpperCase().trim(),
        brandModel,
        vehicleType: selectedTemplate,
        seatLayout: seats,
        capacity: seats.filter(s => s.type === 'passenger').length,
        roofRack,
        maxCargoKg,
        cargoStatus,
        owner_id: user?.id
      };

      let savedSuccessfully = false;

      // 1. Intento por backend API
      try {
        const res = await fetch(`${apiUrl}/api/vehicles/save-design`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          savedSuccessfully = true;
        } else {
          console.warn('[VehicleDesigner] Backend returned error, trying direct Supabase fallback...');
        }
      } catch (backendFetchErr) {
        console.warn('[VehicleDesigner] Backend fetch failed, trying direct Supabase fallback...', backendFetchErr);
      }

      // 2. Fallback de alta disponibilidad directo a Supabase con la sesión del usuario
      if (!savedSuccessfully && user) {
        const { error: sbError } = await supabase
          .from('vehicles')
          .upsert({
            owner_id: user.id,
            plate: plate.toUpperCase().trim(),
            brand_model: brandModel,
            vehicle_type: selectedTemplate,
            seat_layout: seats,
            capacity: seats.filter(s => s.type === 'passenger').length,
            roof_rack: roofRack,
            max_cargo_kg: maxCargoKg,
            cargo_status: cargoStatus,
            status: 'DISPONIBLE',
            last_location_update: new Date().toISOString()
          }, { onConflict: 'plate' });

        if (!sbError) {
          savedSuccessfully = true;
        } else {
          console.error('[VehicleDesigner] Supabase direct error:', sbError);
          setIsSaving(false);
          setMsg({ text: sbError.message || 'Error guardando en base de datos', type: 'error' });
          return;
        }
      }

      setIsSaving(false);
      if (savedSuccessfully) {
        setMsg({ text: '¡Diseño 2D de la unidad guardado con éxito!', type: 'success' });
        if (onSaved) onSaved();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setMsg({ text: 'No se pudo guardar el diseño vehicular. Verifica tu sesión.', type: 'error' });
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

                    {/* Bloqueo Operativo si está en Ruta Activa */}
          {currentStatus === 'EN_RUTA' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <strong className="block text-xs">Unidad Actualmente en Ruta de Servicio</strong>
                  <span className="text-[11px] text-amber-700 dark:text-amber-300">
                    Por seguridad de pasajeros, debes finalizar tu recorrido antes de cambiar de auto o placa.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentStatus('DISPONIBLE');
                  setMsg({ text: '✓ Estado cambiado a Disponible fuera de servicio. Ya puedes modificar tu unidad.', type: 'success' });
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition shadow-xs"
              >
                Liberar y Modificar
              </button>
            </div>
          )}

          {/* Selector de Plantilla Visual */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Selecciona la Carrocería Base (Modelos de Barranca)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['SEDAN', 'MOTOTAXI', 'MINIVAN', 'COMBI', 'STATION_WAGON'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleApplyTemplate(type)}
                  className={`p-2 rounded-xl border text-left transition ${
                    selectedTemplate === type
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs uppercase font-bold truncate">
                    {type === 'STATION_WAGON' ? 'STATION' : type}
                  </div>
                  <div className="text-[10px] opacity-75">{PRESET_TEMPLATES[type]?.capacity || 4} Pasajeros</div>
                </button>
              ))}
            </div>
          </div>

          {/* Plano Gráfico Interactivo de Asientos con Maqueta SVG */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#121417] border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                2. Maqueta Virtual e Interiores Táctiles ({freeSeatsCount} de {passengerSeatsCount} Libres)
              </span>
              <span className="text-[11px] text-slate-400">Toca un asiento en la maqueta para cambiar estado</span>
            </div>

            {/* Maqueta Vectorial SVG Realista */}
            <div className="p-3 rounded-3xl bg-white dark:bg-[#181a20] border border-slate-200 dark:border-slate-700 shadow-inner flex justify-center">
              <RealisticVehicleSVG
                category={selectedTemplate}
                seats={seats.map(s => ({
                  id: s.id,
                  label: s.label,
                  type: s.type,
                  status: s.status
                }))}
                interactive={true}
                onToggleSeat={handleToggleSeatStatus}
                plate={plate}
                className="w-full max-w-[260px] h-auto"
              />
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
              disabled={isSaving || currentStatus === "EN_RUTA"}
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
