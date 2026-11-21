'use client';

import React, { useState } from 'react';
import { StopPoint, VehicleUnit } from '../types';
import { 
  ChevronUp, 
  ChevronDown, 
  MapPin, 
  Car, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Info, 
  ChevronRight, 
  X,
  Compass,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface BottomSheetProps {
  stops: StopPoint[];
  vehicles: VehicleUnit[];
  selectedItem: { type: 'stop' | 'vehicle'; data: any } | null;
  onSelectItem: (item: { type: 'stop' | 'vehicle'; data: any } | null) => void;
  onWaitingClick: () => void;
}

export default function BottomSheet({
  stops,
  vehicles,
  selectedItem,
  onSelectItem,
  onWaitingClick
}: BottomSheetProps) {
  // Estados de altura: 'collapsed' | 'half' | 'full'
  const [sheetState, setSheetState] = useState<'collapsed' | 'half' | 'full'>('collapsed');
  const [activeTab, setActiveTab] = useState<'stops' | 'vehicles'>('stops');
  const [disclosureLevel, setDisclosureLevel] = useState<1 | 2 | 3>(1);

  const toggleHeight = () => {
    if (sheetState === 'collapsed') setSheetState('half');
    else if (sheetState === 'half') setSheetState('full');
    else setSheetState('collapsed');
  };

  const selectedStop: StopPoint | null = selectedItem?.type === 'stop' ? selectedItem.data : null;
  const selectedVehicle: VehicleUnit | null = selectedItem?.type === 'vehicle' ? selectedItem.data : null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-[#15181d] rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 transition-sheet flex flex-col ${
        sheetState === 'collapsed'
          ? 'h-24'
          : sheetState === 'half'
          ? 'h-[46vh]'
          : 'h-[85vh]'
      }`}
    >
      {/* Tirador / Handle táctil */}
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

      {/* Contenido condicional: Detalle de Selección vs Explorador General */}
      {selectedItem ? (
        /* VISTA DETALLADA CON REVELACIÓN PROGRESIVA EN 3 NIVELES */
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-1">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {selectedItem.type === 'stop' ? <MapPin className="w-4 h-4" /> : <Car className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {selectedItem.type === 'stop' ? 'Punto de Abordaje' : 'Unidad en Circulación'}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {selectedStop?.name || `${selectedVehicle?.brand_model} (${selectedVehicle?.plate})`}
                </h3>
              </div>
            </div>
            <button
              onClick={() => onSelectItem(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selector de Nivel de Revelación Progresiva */}
          <div className="flex items-center gap-1.5 mb-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs">
            <button
              onClick={() => setDisclosureLevel(1)}
              className={`flex-1 py-1 rounded-lg font-medium transition text-center ${
                disclosureLevel === 1
                  ? 'bg-white dark:bg-[#1f2329] text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Nivel 1 (Resumen)
            </button>
            <button
              onClick={() => setDisclosureLevel(2)}
              className={`flex-1 py-1 rounded-lg font-medium transition text-center ${
                disclosureLevel === 2
                  ? 'bg-white dark:bg-[#1f2329] text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Nivel 2 (Operativo)
            </button>
            <button
              onClick={() => setDisclosureLevel(3)}
              className={`flex-1 py-1 rounded-lg font-medium transition text-center ${
                disclosureLevel === 3
                  ? 'bg-white dark:bg-[#1f2329] text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Nivel 3 (Identidad)
            </button>
          </div>

          {/* Contenido según tipo y nivel */}
          {selectedStop && (
            <div className="space-y-3 text-xs">
              {/* Nivel 1: Obligatorio / 3 segundos */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Cola Vehicular en Vivo</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                    {selectedStop.queued_vehicles_count} unidades listas
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {selectedStop.address_reference}
                </p>
                {selectedStop.status_note && (
                  <p className="mt-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {selectedStop.status_note}
                  </p>
                )}
              </div>

              {/* Nivel 2: Expandido */}
              {disclosureLevel >= 2 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Detalles Operativos</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Tipo de Parada:</span>
                      <p className="font-semibold">{selectedStop.type === 'BASE' ? 'Paradero Físico Base' : 'Zona Tranquila de Abordaje'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Empresa / Comité:</span>
                      <p className="font-semibold">{selectedStop.group_name || 'Comité 1 Barranca'}</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                    Actualizado: {selectedStop.last_status_update ? new Date(selectedStop.last_status_update).toLocaleTimeString() : 'Hace instantes'}
                  </div>
                </div>
              )}

              {/* Nivel 3: Valor Agregado / Reseña */}
              {disclosureLevel >= 3 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Normativa del Punto</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Punto vigilado con geovalla GPS a 100 metros. Las salidas están reguladas por despachador verificado con candado horario (TBAC) de 06:00 a 21:00.
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedVehicle && (
            <div className="space-y-3 text-xs">
              {/* Nivel 1: Resumen en 3s */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{selectedVehicle.brand_model}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    selectedVehicle.status === 'DISPONIBLE'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                  }`}>
                    {selectedVehicle.status === 'DISPONIBLE' ? 'Asientos Libres' : 'Unidad Llena'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Placa: <strong className="text-slate-700 dark:text-slate-300">{selectedVehicle.plate}</strong></span>
                  <span>Chofer: <strong className="text-slate-700 dark:text-slate-300">{selectedVehicle.driver_name}</strong></span>
                </div>
              </div>

              {/* Nivel 2: Vista previa de Asientos 2D */}
              {disclosureLevel >= 2 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Esquema Digital de Cabina</span>
                  <div className="flex items-center justify-center py-2 bg-white dark:bg-[#121417] rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-2 p-2">
                      <div className="p-2 rounded bg-slate-200 dark:bg-slate-700 text-center font-bold text-[10px]">
                        Chofer
                      </div>
                      <div className="p-2 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-center font-bold text-[10px]">
                        Copiloto (Libre)
                      </div>
                      <div className="p-2 rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-center font-bold text-[10px]">
                        Atrás Izq (Ocupado)
                      </div>
                      <div className="p-2 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-center font-bold text-[10px]">
                        Atrás Der (Libre)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nivel 3: Identidad y Políticas */}
              {disclosureLevel >= 3 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Capacidad de Carga y Pagos</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Parrilla habilitada: {selectedVehicle.roof_rack ? 'Sí' : 'No'}. Carga máxima: {selectedVehicle.max_cargo_kg} kg. Métodos de pago aceptados: Efectivo, Yape y Plin.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* VISTA GENERAL EXPLORADORA */
        <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden">
          {/* Fila compacta de vista colapsada */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-500" />
                Movilidad en Vivo — Barranca
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {stops.length} paraderos activos · {vehicles.length} unidades en ruta
              </p>
            </div>

            {/* Botón "Estoy esperando aquí" */}
            <button
              onClick={onWaitingClick}
              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Esperar aquí</span>
            </button>
          </div>

          {/* Pestañas cuando está expandido */}
          {sheetState !== 'collapsed' && (
            <>
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('stops')}
                  className={`pb-1 px-1 border-b-2 transition ${
                    activeTab === 'stops'
                      ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                      : 'border-transparent text-slate-400'
                  }`}
                >
                  Paraderos ({stops.length})
                </button>
                <button
                  onClick={() => setActiveTab('vehicles')}
                  className={`pb-1 px-1 border-b-2 transition ${
                    activeTab === 'vehicles'
                      ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                      : 'border-transparent text-slate-400'
                  }`}
                >
                  Unidades en Vivo ({vehicles.length})
                </button>
              </div>

              {/* Lista Scrollable */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {activeTab === 'stops' && (
                  stops.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => onSelectItem({ type: 'stop', data: s })}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500 cursor-pointer transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-xl text-white ${s.type === 'BASE' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100">{s.name}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{s.address_reference}</p>
                          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                            {s.type === 'BASE' ? 'Paradero Físico Base' : 'Zona Tranquila'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-1.5">
                        <div className="px-2 py-1 rounded-lg bg-white dark:bg-[#121417] border border-slate-200 dark:border-slate-800 text-center font-bold text-slate-800 dark:text-slate-200">
                          {s.queued_vehicles_count}
                          <span className="block text-[9px] font-normal text-slate-400">en cola</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))
                )}

                {activeTab === 'vehicles' && (
                  vehicles.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => onSelectItem({ type: 'vehicle', data: v })}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500 cursor-pointer transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-xl text-white ${v.status === 'DISPONIBLE' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100">{v.plate}</h4>
                            <span className="text-[10px] text-slate-500">{v.brand_model}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Chofer: {v.driver_name}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          v.status === 'DISPONIBLE'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                        }`}>
                          {v.status === 'DISPONIBLE' ? 'Libre' : 'Lleno'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
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
