'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { StopPoint, VehicleUnit, RouteCorridor } from '../../types';
import { Layers, Map as MapIcon } from 'lucide-react';

interface BarrancaMapProps {
  stops: StopPoint[];
  vehicles: VehicleUnit[];
  routes?: RouteCorridor[];
  selectedItem: { type: 'stop' | 'vehicle' | 'route'; data: any } | null;
  onSelectItem: (item: { type: 'stop' | 'vehicle' | 'route'; data: any } | null) => void;
  darkMode: boolean;
  passengerSignal?: { lat: number; lng: number; note?: string } | null;
}

// Iconos personalizados refinados (White, Navy Blue, Soft Emerald/Rose)
const createStopIcon = (type: string, queueCount: number, darkMode: boolean) => {
  const isBase = type === 'BASE';
  const primaryColor = isBase ? '#2563eb' : '#059669';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#cbd5e1';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        background-color: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid ${borderColor};
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.16);
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${primaryColor};
        transition: transform 0.15s ease;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        ${queueCount > 0 ? `
          <div style="
            position: absolute;
            top: -5px;
            right: -6px;
            background: #2563eb;
            color: #ffffff;
            font-size: 9.5px;
            font-weight: 700;
            width: 17px;
            height: 17px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1.5px solid ${bgColor};
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
          ">
            ${queueCount}
          </div>
        ` : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const createVehicleIcon = (status: string, plate: string, darkMode: boolean) => {
  const isAvailable = status === 'DISPONIBLE';
  const dotColor = isAvailable ? '#10b981' : '#f43f5e';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f8fafc' : '#0f172a';
  const borderColor = darkMode ? '#334155' : '#cbd5e1';

  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        position: relative;
        background-color: ${bgColor};
        border: 1.5px solid ${borderColor};
        padding: 3px 8px;
        border-radius: 9999px;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);
        display: flex;
        align-items: center;
        gap: 5px;
        color: ${textColor};
        white-space: nowrap;
      ">
        <span style="
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: ${dotColor};
          display: inline-block;
        "></span>
        <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.3px; font-family: ui-monospace, monospace;">${plate}</span>
      </div>
    `,
    iconSize: [68, 24],
    iconAnchor: [34, 12],
    popupAnchor: [0, -14],
  });
};

const createWaitingPassengerIcon = () => {
  return L.divIcon({
    className: 'custom-waiting-passenger-marker',
    html: `
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        background: #2563eb;
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.25);
        animation: pulse 2s infinite;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="7" r="4"/>
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Sincronizador de cámara y zoom
function MapController({ selectedItem }: { selectedItem: any }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedItem) return;

    if (selectedItem.type === 'route' && selectedItem.data?.geojson?.coordinates?.length) {
      const latLngs = selectedItem.data.geojson.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
      );
      map.fitBounds(latLngs, { padding: [60, 60], maxZoom: 15 });
    } else if (selectedItem.data) {
      const lat = Number(selectedItem.data.latitude);
      const lng = Number(selectedItem.data.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 15, { duration: 1.1 });
      }
    }
  }, [selectedItem, map]);

  return null;
}

export default function BarrancaMap({
  stops,
  vehicles,
  routes = [],
  selectedItem,
  onSelectItem,
  darkMode,
  passengerSignal,
}: BarrancaMapProps) {
  // Centro por defecto: Plaza de Armas de Barranca
  const defaultCenter: [number, number] = [-10.7512, -77.7615];

  // Selector de Proveedor de Cartografía:
  // 'google-streets': Google Maps oficial estándar (Calles, avenidas, colores oficiales Google Maps, 0 watermarks)
  // 'google-hybrid': Google Maps oficial satélite híbrido con nombres de calles
  // 'osm': OpenStreetMap comunitario
  const [mapLayer, setMapLayer] = useState<'google-streets' | 'google-hybrid' | 'osm'>('google-streets');

  const TILE_SERVERS: Record<string, string> = {
    'google-streets': 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    'google-hybrid': 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    'osm': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  const currentTileUrl = TILE_SERVERS[mapLayer] || TILE_SERVERS['google-streets'];

  const isRouteSelected = (routeId: string) => {
    return selectedItem?.type === 'route' && selectedItem.data?.id === routeId;
  };

  return (
    <div className="relative w-full h-full">
      {/* Selector Flotante de Estilo de Mapa (Google Maps / Satélite / OSM) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 p-1 bg-white/95 dark:bg-[#16181d]/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => setMapLayer('google-streets')}
          className={`px-2.5 py-1 rounded-xl transition ${
            mapLayer === 'google-streets'
              ? 'bg-blue-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Google Maps
        </button>
        <button
          type="button"
          onClick={() => setMapLayer('google-hybrid')}
          className={`px-2.5 py-1 rounded-xl transition ${
            mapLayer === 'google-hybrid'
              ? 'bg-blue-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Satélite
        </button>
        <button
          type="button"
          onClick={() => setMapLayer('osm')}
          className={`px-2.5 py-1 rounded-xl transition ${
            mapLayer === 'osm'
              ? 'bg-blue-600 text-white font-bold shadow-2xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          OSM
        </button>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={14}
        zoomControl={false}
        style={{ width: '100%', height: '100%', minHeight: '100%' }}
        className="w-full h-full z-10"
        attributionControl={false}
      >
        <TileLayer 
          key={mapLayer}
          url={currentTileUrl} 
          maxZoom={20} 
        />
        <MapController selectedItem={selectedItem} />

        {/* Trazado Polyline de Rutas Viales Oficiales (Sprint 3) */}
        {routes.map((r) => {
          if (!r.geojson?.coordinates || r.geojson.coordinates.length < 2) return null;
          const latLngs = r.geojson.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
          );
          const selected = isRouteSelected(r.id);

          return (
            <Polyline
              key={r.id}
              positions={latLngs}
              pathOptions={{
                color: selected ? '#1d4ed8' : '#2563eb',
                weight: selected ? 5.5 : 4,
                opacity: selected ? 0.95 : 0.75,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: selected ? undefined : '5, 6'
              }}
              eventHandlers={{
                click: () => onSelectItem({ type: 'route', data: r }),
              }}
            />
          );
        })}

        {/* Marcadores de Paraderos */}
        {stops.map((stop) => {
          const lat = Number(stop.latitude);
          const lng = Number(stop.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={stop.id}
              position={[lat, lng]}
              icon={createStopIcon(stop.type, stop.queued_vehicles_count || 0, darkMode)}
              eventHandlers={{
                click: () => onSelectItem({ type: 'stop', data: stop }),
              }}
            >
              <Popup className="custom-map-popup">
                <div className="p-1 text-xs">
                  <span className="font-bold text-slate-900 block">{stop.name}</span>
                  <span className="text-[11px] text-slate-500 block">{stop.address_reference}</span>
                  <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-blue-600">
                      {stop.type === 'BASE' ? 'Paradero Físico Base' : 'Zona Tranquila'}
                    </span>
                    <span className="font-bold text-slate-700">{stop.queued_vehicles_count || 0} carros en cola</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Marcadores de Vehículos en Vivo con Telemetría Continua */}
        {vehicles.map((v) => {
          const lat = Number(v.latitude);
          const lng = Number(v.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          const ratingNum = typeof v.driver_rating === 'number' 
            ? v.driver_rating 
            : parseFloat(String(v.driver_rating || '5.0'));

          return (
            <Marker
              key={v.id}
              position={[lat, lng]}
              icon={createVehicleIcon(v.status, v.plate, darkMode)}
              eventHandlers={{
                click: () => onSelectItem({ type: 'vehicle', data: v }),
              }}
            >
              <Popup className="custom-map-popup">
                <div className="p-1 text-xs">
                  <span className="font-bold text-slate-900 block">{v.brand_model} ({v.plate})</span>
                  <span className="text-[11px] text-slate-500 block">Chofer: {v.driver_name}</span>
                  <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className={`font-bold ${v.status === 'DISPONIBLE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {v.status === 'DISPONIBLE' ? '● Disponible' : '● Unidad Llena'}
                    </span>
                    <span className="text-slate-600 font-medium">★ {isNaN(ratingNum) ? '5.0' : ratingNum.toFixed(1)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Pin de señal de pasajero esperando (Sprint 3) */}
        {passengerSignal && (
          <Marker
            position={[passengerSignal.lat, passengerSignal.lng]}
            icon={createWaitingPassengerIcon()}
          >
            <Popup className="custom-map-popup">
              <div className="p-1 text-xs">
                <span className="font-bold text-blue-600 block">Pasajero Esperando</span>
                <span className="text-[11px] text-slate-600 block">{passengerSignal.note || 'Esperando unidad para abordaje'}</span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
