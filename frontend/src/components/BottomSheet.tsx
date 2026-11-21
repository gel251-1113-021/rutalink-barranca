'use client';

import React, { useState } from 'react';
import { StopPoint, VehicleUnit } from '../types';
import { 
  ChevronUp, 
  ChevronDown, 
  MapPin, 
  Car, 
  Search,
  Clock, 
  Phone, 
  ShieldCheck, 
  ChevronRight, 
  X,
  Compass,
  CheckCircle,
  Eye,
  MessageSquare,
  Route,
  Sparkles
} from 'lucide-react';

interface BottomSheetProps {
  stops: StopPoint[];
  vehicles: VehicleUnit[];
  routes?: any[];
  selectedItem: { type: 'stop' | 'vehicle' | 'route'; data: any } | null;
  onSelectItem: (item: { type: 'stop' | 'vehicle' | 'route'; data: any } | null) => void;
  onWaitingClick: () => void;
  onOpenLiveCabin?: (vehicle: VehicleUnit) => void;
  onOpenAgreement?: (driverData: any) => void;
  onSelectDestination?: (dest: string) => void;
}

const getVehicleEmoji = (type?: string) => {
  const norm = (type || '').toUpperCase();
  if (norm.includes('MOTO')) return '🛺';
  if (norm.includes('MINIVAN')) return '🚐';
  if (norm.includes('COMBI') || norm.includes('BUS')) return '🚍';
  if (norm.includes('STATION') || norm.includes('WAGON') || norm.includes('PROBOX') || norm.includes('SUV')) return '🚙';
  return '🚗';
};

export default function BottomSheet({
  stops,
  vehicles,
  routes = [],
  selectedItem,
  onSelectItem,
  onWaitingClick,
  onOpenLiveCabin,
  onOpenAgreement,
  onSelectDestination
}: BottomSheetProps) {
  const [sheetState, setSheetState] = useState<'collapsed' | 'half' | 'full'>('collapsed');
  const [activeTab, setActiveTab] = useState<'stops' | 'vehicles' | 'routes'>('stops');
  const [disclosureLevel, setDisclosureLevel] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleHeight = () => {
    if (sheetState === 'collapsed') setSheetState('half');
    else if (sheetState === 'half') setSheetState('full');
    else setSheetState('collapsed');
  };

  const selectedStop: StopPoint | null = selectedItem?.type === 'stop' ? selectedItem.data : null;
  const selectedVehicle: VehicleUnit | null = selectedItem?.type === 'vehicle' ? selectedItem.data : null;
  const selectedRoute: any | null = selectedItem?.type === 'route' ? selectedItem.data : null;

  // Filtrado de paraderos y vehículos por el buscador "¿A dónde vas?"
  const filteredStops = stops.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address_reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(v =>
    v.brand_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.driver_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const QUICK_DESTINATIONS = ['UNAB Campus', 'Supe Pueblo', 'Pativilca', 'Paramonga', 'Barranca Centro'];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-20 bg-white/98 dark:bg-[#121417]/98 backdrop-blur-md rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.06)] border-t border-slate-200/80 dark:border-slate-800 transition-sheet flex flex-col ${
        sheetState === 'collapsed'
          ? 'h-24'
          : sheetState === 'half'
          ? 'h-[48vh]'
          : 'h-[85vh]'
      }`}
    >
      {/* Tirador táctil refinado */}
      <div 
        onClick={toggleHeight}
        className="w-full pt-2.5 pb-1 flex flex-col items-center justify-center cursor-pointer select-none"
      >
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mb-1"></div>
        {sheetState === 'collapsed' ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </div>

      {/* Contenido Condicional: Detalle vs Explorador General */}
      {selectedItem ? (
        /* VISTA DETALLADA CON REVELACIÓN PROGRESIVA EN 3 NIVELES */
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-1">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                {selectedItem.type === 'stop' ? <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {selectedItem.type === 'stop' ? 'Punto de Abordaje' : selectedItem.type === 'vehicle' ? 'Unidad en Circulación' : 'Ruta'}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {selectedStop?.name || `${selectedVehicle?.brand_model} (${selectedVehicle?.plate})`}
                </h3>
              </div>
            </div>
            <button
              onClick={() => onSelectItem(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selector de Nivel de Revelación Progresiva */}
          <div className="flex items-center gap-1 mb-3 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 text-xs">
            <button
              onClick={() => setDisclosureLevel(1)}
              className={`flex-1 py-1 rounded-lg font-medium transition text-center text-[11px] ${
                disclosureLevel === 1
                  ? 'bg-white dark:bg-[#1a1d22] text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Nivel 1 (Resumen)
            </button>
            <button
              onClick={() => setDisclosureLevel(2)}
              className={`flex-1 py-1 rounded-lg font-medium transition text-center text-[11px] ${
                disclosureLevel === 2
                  ? 'bg-white dark:bg-[#1a1d22] text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Nivel 2 (Operativo)
            </button>
            <button
              onClick={() => setDisclosureLevel(3)}
              className={`flex-1 py-1 rounded-lg font-medium transition text-center text-[11px] ${
                disclosureLevel === 3
                  ? 'bg-white dark:bg-[#1a1d22] text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Nivel 3 (Identidad)
            </button>
          </div>

          {/* Detalle Paradero */}
          {selectedStop && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#16181d] border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Cola Vehicular en Vivo</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 font-bold text-[11px]">
                    {selectedStop.queued_vehicles_count} unidades listas
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  {selectedStop.address_reference}
                </p>
                {selectedStop.status_note && (
                  <p className="mt-2 text-emerald-700 dark:text-emerald-400 font-medium text-[11px] flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {selectedStop.status_note}
                  </p>
                )}
              </div>

              {disclosureLevel >= 2 && (
                <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#16181d] border border-slate-200/70 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Detalles Operativos</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Tipo:</span>
                      <p className="font-semibold">{selectedStop.type === 'BASE' ? 'Paradero Físico Base' : 'Zona Tranquila'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Línea de Transporte:</span>
                      <p className="font-semibold">{selectedStop.group_name || 'Comité 1 Barranca'}</p>
                    </div>
                  </div>
                </div>
              )}

              {disclosureLevel >= 3 && (
                <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#16181d] border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Normativa del Punto</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Punto regulado con geovalla GPS a 100m. Turno de despacho activo en horario diurno y nocturno.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Detalle Vehículo con Acciones de Sprint 3 */}
          {selectedVehicle && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#16181d] border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{selectedVehicle.brand_model}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    selectedVehicle.status === 'DISPONIBLE'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60'
                  }`}>
                    {selectedVehicle.status === 'DISPONIBLE' ? 'Disponible' : 'Lleno'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Placa: <strong className="font-mono text-slate-700 dark:text-slate-300">{selectedVehicle.plate}</strong></span>
                  <span>Chofer: <strong className="text-slate-700 dark:text-slate-300">{selectedVehicle.driver_name}</strong></span>
                </div>
              </div>

              {/* Acciones Rápidas: Ver Cabina Digital y Acordar Viaje */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onOpenLiveCabin && onOpenLiveCabin(selectedVehicle)}
                  className="py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Cabina Digital</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAgreement && onOpenAgreement({
                    id: selectedVehicle.id,
                    name: selectedVehicle.driver_name,
                    plate: selectedVehicle.plate,
                    brandModel: selectedVehicle.brand_model,
                    rating: selectedVehicle.driver_rating
                  })}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Conversar Acuerdo</span>
                </button>
              </div>

              {disclosureLevel >= 2 && (
                <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#16181d] border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Capacidad de Asientos y Equipaje</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Capacidad: {selectedVehicle.capacity} pasajeros · Carga máxima: {selectedVehicle.max_cargo_kg} kg · Parrilla: {selectedVehicle.roof_rack ? 'Sí' : 'No'}.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* VISTA GENERAL EXPLORADORA */
        <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden">
          {/* Fila compacta superior */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                RutaLink Barranca en Vivo
              </h2>
              <p className="text-[11px] text-slate-500">
                {stops.length} paraderos · {vehicles.length} unidades activas
              </p>
            </div>

            <button
              onClick={onWaitingClick}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-2xs transition"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Esperar aquí</span>
            </button>
          </div>

          {/* BUSCADOR INTELIGENTE "¿A DÓNDE VAS?" (Sprint 3) */}
          <div className="mb-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="¿A dónde vas? (ej. UNAB, Supe, Pativilca...)"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Chips rápidos de destino */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-[11px]">
              {QUICK_DESTINATIONS.map(dest => (
                <button
                  key={dest}
                  onClick={() => {
                    setSearchQuery(dest);
                    if (onSelectDestination) onSelectDestination(dest);
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 whitespace-nowrap transition text-[10.5px] border border-slate-200/60 dark:border-slate-700/60"
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>

          {/* Pestañas cuando está expandido */}
          {sheetState !== 'collapsed' && (
            <>
              <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('stops')}
                  className={`pb-1 border-b-2 transition ${
                    activeTab === 'stops'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Paraderos ({filteredStops.length})
                </button>
                <button
                  onClick={() => setActiveTab('vehicles')}
                  className={`pb-1 border-b-2 transition ${
                    activeTab === 'vehicles'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Unidades ({filteredVehicles.length})
                </button>
                <button
                  onClick={() => setActiveTab('routes')}
                  className={`pb-1 border-b-2 transition ${
                    activeTab === 'routes'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Rutas Troncales ({routes.length})
                </button>
              </div>

              {/* Lista Scrollable */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {activeTab === 'stops' && (
                  filteredStops.map(s => (
                    <div
                      key={s.id}
                      onClick={() => onSelectItem({ type: 'stop', data: s })}
                      className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#16181d] border border-slate-200/60 dark:border-slate-800 hover:border-blue-500/60 cursor-pointer transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-xl text-white ${s.type === 'BASE' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100">{s.name}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{s.address_reference}</p>
                          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                            {s.type === 'BASE' ? 'Paradero Físico Base' : 'Punto Tranquilo'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-1.5">
                        <div className="px-2 py-1 rounded-lg bg-white dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800 text-center font-bold text-slate-800 dark:text-slate-200">
                          {s.queued_vehicles_count}
                          <span className="block text-[9px] font-normal text-slate-400">en cola</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))
                )}

                {activeTab === 'vehicles' && (
                  filteredVehicles.map(v => (
                    <div
                      key={v.id}
                      onClick={() => onSelectItem({ type: 'vehicle', data: v })}
                      className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#16181d] border border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/60 cursor-pointer transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-xl text-white flex items-center justify-center text-sm ${v.status === 'DISPONIBLE' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                          <span>{getVehicleEmoji(v.vehicle_type)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 font-mono">{v.plate}</h4>
                            <span className="text-[10px] text-slate-500">{v.brand_model}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">Chofer: {v.driver_name}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          v.status === 'DISPONIBLE'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60'
                        }`}>
                          {v.status === 'DISPONIBLE' ? 'Libre' : 'Lleno'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))
                )}

                {activeTab === 'routes' && (
                  routes.map((r: any) => (
                    <div
                      key={r.id}
                      onClick={() => onSelectItem({ type: 'route', data: r })}
                      className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#16181d] border border-slate-200/60 dark:border-slate-800 hover:border-blue-500/60 cursor-pointer transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 border border-blue-200/60">
                          <Route className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100">{r.name}</h4>
                          <p className="text-[11px] text-slate-500">{r.origin_name} → {r.destination_name}</p>
                          <span className="text-[10px] text-slate-400">
                            {r.distance_km} km · ~{r.estimated_duration_min} min
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
