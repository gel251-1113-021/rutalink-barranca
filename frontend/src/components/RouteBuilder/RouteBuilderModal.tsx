'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, MapPin, Route, Check, Navigation, Sparkles } from 'lucide-react';

interface Waypoint {
  name: string;
  lat: number;
  lng: number;
}

const PRESET_POINTS: Waypoint[] = [
  { name: 'Paradero Base Central Barranca (Av. Gálvez)', lat: -10.7512, lng: -77.7615 },
  { name: 'Plaza de Armas de Barranca', lat: -10.7525, lng: -77.7600 },
  { name: 'Campus Universitario UNAB (Luzuriaga)', lat: -10.7485, lng: -77.7550 },
  { name: 'Hospital de Barranca', lat: -10.7550, lng: -77.7640 },
  { name: 'Plaza de Supe Pueblo', lat: -10.7980, lng: -77.7125 },
  { name: 'Óvalo de Pativilca (Cruce Panamericana)', lat: -10.6970, lng: -77.7845 },
  { name: 'Entrada Paramonga (Av. Ferrocarril)', lat: -10.6720, lng: -77.8150 }
];

interface RouteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteSaved?: (route: any) => void;
}

export default function RouteBuilderModal({
  isOpen,
  onClose,
  onRouteSaved
}: RouteBuilderModalProps) {
  const [routeName, setRouteName] = useState('');
  const [selectedWaypoints, setSelectedWaypoints] = useState<Waypoint[]>([
    PRESET_POINTS[0],
    PRESET_POINTS[2]
  ]);
  const [calculating, setCalculating] = useState(false);
  const [calculatedRoute, setCalculatedRoute] = useState<{
    distanceKm: number;
    durationMin: number;
    coordinates: [number, number][];
  } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddPreset = (pt: Waypoint) => {
    if (selectedWaypoints.some(w => w.name === pt.name)) return;
    setSelectedWaypoints(prev => [...prev, pt]);
  };

  const handleRemovePoint = (index: number) => {
    setSelectedWaypoints(prev => prev.filter((_, i) => i !== index));
    setCalculatedRoute(null);
  };

  // Calcular ruta sobre pistas reales (OSRM)
  const handleCalculateRoute = async () => {
    if (selectedWaypoints.length < 2) return;
    setCalculating(true);
    try {
      const waypointsCoords = selectedWaypoints.map(w => [w.lng, w.lat]);
      const res = await fetch('/api/routes/osrm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waypoints: waypointsCoords })
      });

      if (res.ok) {
        const data = await res.json();
        setCalculatedRoute(data.route);
      }
    } catch (e) {
      console.error('Error calculando ruta:', e);
    } finally {
      setCalculating(false);
    }
  };

  const [assignToFleet, setAssignToFleet] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState('b0000000-0000-0000-0000-000000000001');

  // Guardar ruta construida y asignar a la flota si está marcado
  const handleSaveRoute = async () => {
    if (!routeName.trim() || !calculatedRoute) return;

    try {
      const res = await fetch('/api/routes/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: routeName.trim(),
          waypoints: selectedWaypoints,
          coordinates: calculatedRoute.coordinates,
          totalKm: calculatedRoute.distanceKm,
          estimatedMinutes: calculatedRoute.durationMin
        })
      });

      if (res.ok) {
        const data = await res.json();
        const saved = data.route;

        // Si se seleccionó asignar a la flota del comité
        if (assignToFleet && selectedGroupId) {
          await fetch('/api/routes/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              routeId: saved.id,
              routeName: routeName.trim(),
              groupId: selectedGroupId
            })
          });
          setSuccessMsg(`¡Ruta "${routeName}" guardada y asignada a toda la flota de la empresa!`);
        } else {
          setSuccessMsg(`¡Ruta "${routeName}" guardada con éxito!`);
        }

        if (onRouteSaved) onRouteSaved(saved);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (e) {
      console.error('Error guardando ruta:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#13161a] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Cabecera */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Route className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Creador Visual de Rutas</h2>
              <p className="text-xs text-indigo-100">Traza paradas y encaja la ruta sobre pistas reales</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificación de éxito */}
        {successMsg && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 text-center animate-in fade-in">
            ✓ {successMsg}
          </div>
        )}

        {/* Contenido con scroll */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Nombre de la Ruta */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Nombre de la Nueva Ruta
            </label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="Ej: Ruta Rápida UNAB - Puerto Supe"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1c2027] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Secuencia de Puntos Marcados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Secuencia de Paradas ({selectedWaypoints.length})
              </label>
              <span className="text-[11px] text-slate-500">Mínimo 2 paradas</span>
            </div>

            <div className="space-y-2">
              {selectedWaypoints.map((w, index) => (
                <div
                  key={`${w.name}-${index}`}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181c22] shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {w.name}
                    </span>
                  </div>
                  {selectedWaypoints.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePoint(index)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Agregar Paradas Rápidas de Barranca */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
              + Agregar punto frecuente de Barranca:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_POINTS.map((p) => {
                const isAdded = selectedWaypoints.some(w => w.name === p.name);
                return (
                  <button
                    key={p.name}
                    type="button"
                    disabled={isAdded}
                    onClick={() => handleAddPreset(p)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition flex items-center gap-1 ${
                      isAdded
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-white dark:bg-[#1a1e25] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <Plus className="w-3 h-3 text-indigo-500" />
                    <span>{p.name.split('(')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botón para Calcular Enrutamiento sobre Pistas */}
          <button
            type="button"
            disabled={calculating || selectedWaypoints.length < 2}
            onClick={handleCalculateRoute}
            className="w-full py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{calculating ? 'Encajando sobre pistas reales...' : 'Ajustar ruta a pistas de Google Maps (OSRM)'}</span>
          </button>

          {/* Resumen del cálculo vial */}
          {calculatedRoute && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 animate-in fade-in space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span>✓ Trazado sobre pista calculado</span>
                <span className="text-emerald-700 dark:text-emerald-300">{calculatedRoute.distanceKm} km</span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                Tiempo estimado de viaje: <strong>{calculatedRoute.durationMin} minutos</strong> a velocidad crucero.
              </p>

              {/* Asignación masiva a la flota del comité */}
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignToFleet}
                    onChange={(e) => setAssignToFleet(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Asignar esta ruta a toda la flota de mi empresa / comité
                  </span>
                </label>

                {assignToFleet && (
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white dark:bg-[#1a1e25] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    <option value="b0000000-0000-0000-0000-000000000001">Comité 1 de Transporte Barranca - Supe - UNAB</option>
                    <option value="b0000000-0000-0000-0000-000000000002">Comunidad Universitaria UNAB - Viajes Compartidos</option>
                    <option value="b0000000-0000-0000-0000-000000000003">Línea Expreso Pativilca - Paramonga - Barranca</option>
                  </select>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Pie de guardado */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111317] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!routeName.trim() || !calculatedRoute}
            onClick={handleSaveRoute}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Ruta</span>
          </button>
        </div>

      </div>
    </div>
  );
}
