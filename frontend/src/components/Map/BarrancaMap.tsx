'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { StopPoint, VehicleUnit, RouteCorridor } from '../../types';
import { Layers, Locate, Flag, Navigation } from 'lucide-react';

interface DropoffPoint {
  id: string;
  latitude: number;
  longitude: number;
  landmark_reference: string;
  passenger_name?: string;
}

interface BarrancaMapProps {
  stops: StopPoint[];
  vehicles: VehicleUnit[];
  routes?: RouteCorridor[];
  selectedItem: { type: 'stop' | 'vehicle' | 'route'; data: any } | null;
  onSelectItem: (item: { type: 'stop' | 'vehicle' | 'route'; data: any } | null) => void;
  darkMode: boolean;
  passengerSignal?: { lat: number; lng: number; note?: string } | null;
  userLocation?: { lat: number; lng: number } | null;
  dropoffs?: DropoffPoint[];
  onVehicleTap?: (vehicle: VehicleUnit) => void;
  onRequestDropoff?: () => void;
  onLocateUser?: () => void;
}

// Icono de Paradero Refinado
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

// Icono de Vehículo en Vivo (Táctil con placa)
const createVehicleIcon = (status: string, plate: string, darkMode: boolean) => {
  const isAvailable = status === 'DISPONIBLE';
  const dotColor = isAvailable ? '#10b981' : '#3b82f6';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f8fafc' : '#0f172a';
  const borderColor = darkMode ? '#334155' : '#cbd5e1';

  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        position: relative;
        background-color: ${bgColor};
        border: 2px solid ${isAvailable ? '#10b981' : '#2563eb'};
        padding: 4px 9px;
        border-radius: 9999px;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.22);
        display: flex;
        align-items: center;
        gap: 5px;
        color: ${textColor};
        white-space: nowrap;
        cursor: pointer;
      ">
        <span style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${dotColor};
          display: inline-block;
          box-shadow: 0 0 6px ${dotColor};
        "></span>
        <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.3px; font-family: ui-monospace, monospace;">${plate}</span>
        <span style="font-size: 10px;">🚗</span>
      </div>
    `,
    iconSize: [84, 28],
    iconAnchor: [42, 14],
    popupAnchor: [0, -16],
  });
};

// Icono de Ubicación del Usuario (Punto Azul GPS Pulsante)
const createUserGpsIcon = () => {
  return L.divIcon({
    className: 'custom-user-gps-marker',
    html: `
      <div style="
        position: relative;
        width: 18px;
        height: 18px;
        background: #2563eb;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.35);
      ">
        <div style="
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1.5px solid #2563eb;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
};

// Icono de "Me bajo aquí" (Bandera Roja de Parada Solicitada)
const createDropoffMarkerIcon = (landmark: string) => {
  return L.divIcon({
    className: 'custom-dropoff-marker',
    html: `
      <div style="
        background: #ef4444;
        color: #ffffff;
        padding: 3px 7px;
        border-radius: 12px;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        font-weight: 700;
        white-space: nowrap;
      ">
        <span>🛑</span>
        <span>${landmark || 'Bajada'}</span>
      </div>
    `,
    iconSize: [80, 24],
    iconAnchor: [40, 12],
    popupAnchor: [0, -14],
  });
};

// Icono de Pasajero Esperando
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

// Controlador de Cámara
function MapController({
  selectedItem,
  userLocation
}: {
  selectedItem: any;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.2 });
    }
  }, [userLocation, map]);

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
  userLocation,
  dropoffs = [],
  onVehicleTap,
  onRequestDropoff,
  onLocateUser
}: BarrancaMapProps) {
  const defaultCenter: [number, number] = [-10.7512, -77.7615];

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
      {/* Selector Flotante de Estilo de Mapa */}
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

      {/* Botones Flotantes Táctiles Móviles (Ubicación GPS + Me Bajo Aquí) */}
      <div className="absolute right-3 bottom-24 z-20 flex flex-col gap-2.5">
        {/* Botón: Activar mi ubicación */}
        {onLocateUser && (
          <button
            type="button"
            onClick={onLocateUser}
            className="w-11 h-11 rounded-2xl bg-white dark:bg-[#1a1d24] text-blue-600 dark:text-blue-400 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-blue-50 transition active:scale-95"
            title="Centrar en mi ubicación GPS"
          >
            <Locate className="w-5 h-5" />
          </button>
        )}

        {/* Botón: Me bajo aquí */}
        {onRequestDropoff && (
          <button
            type="button"
            onClick={onRequestDropoff}
            className="px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition active:scale-95 animate-pulse"
            title="Solicitar parada al chofer"
          >
            <span>🛑</span>
            <span>Me bajo aquí</span>
          </button>
        )}
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
        <MapController selectedItem={selectedItem} userLocation={userLocation} />

        {/* Trazado Polyline de Rutas Viales Oficiales */}
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

        {/* Marcadores de Vehículos en Vivo (Táctiles) */}
        {vehicles.map((v) => {
          const lat = Number(v.latitude);
          const lng = Number(v.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={v.id}
              position={[lat, lng]}
              icon={createVehicleIcon(v.status, v.plate, darkMode)}
              eventHandlers={{
                click: () => {
                  if (onVehicleTap) {
                    onVehicleTap(v);
                  } else {
                    onSelectItem({ type: 'vehicle', data: v });
                  }
                },
              }}
            />
          );
        })}

        {/* Marcador GPS de la Ubicación del Usuario */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserGpsIcon()}
          >
            <Popup className="custom-map-popup">
              <div className="p-1 text-xs text-center font-bold text-blue-600">
                📍 Tu ubicación actual
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de "Me bajo aquí" (Paradas solicitadas por pasajeros) */}
        {dropoffs.map((d) => (
          <Marker
            key={d.id}
            position={[d.latitude, d.longitude]}
            icon={createDropoffMarkerIcon(d.landmark_reference)}
          >
            <Popup className="custom-map-popup">
              <div className="p-1 text-xs">
                <span className="font-bold text-rose-600 block">🛑 Parada Solicitada</span>
                <span className="text-[11px] text-slate-600 block">{d.landmark_reference}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Pasajero: {d.passenger_name || 'A bordo'}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pin de señal de pasajero esperando */}
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
