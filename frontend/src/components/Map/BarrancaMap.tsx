'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { StopPoint, VehicleUnit } from '../../types';

interface BarrancaMapProps {
  stops: StopPoint[];
  vehicles: VehicleUnit[];
  selectedItem: { type: 'stop' | 'vehicle'; data: any } | null;
  onSelectItem: (item: { type: 'stop' | 'vehicle'; data: any } | null) => void;
  darkMode: boolean;
}

// Iconos personalizados SVG para Leaflet
const createStopIcon = (type: string, queueCount: number) => {
  const isBase = type === 'BASE';
  const color = isBase ? '#2563EB' : '#10B981'; // Azul base, verde zona tranquila
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        background-color: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        ${queueCount > 0 ? `
          <div style="
            position: absolute;
            top: -5px;
            right: -6px;
            background: #ef4444;
            color: white;
            font-size: 10px;
            font-weight: 800;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1.5px solid white;
          ">
            ${queueCount}
          </div>
        ` : ''}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

const createVehicleIcon = (status: string, plate: string) => {
  const isAvailable = status === 'DISPONIBLE';
  const color = isAvailable ? '#10B981' : '#EF4444'; // Verde disponible, Rojo lleno
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        position: relative;
        background-color: #1e293b;
        border: 2px solid ${color};
        padding: 3px 6px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        gap: 4px;
        color: white;
        white-space: nowrap;
      ">
        <span style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${color};
          display: inline-block;
        "></span>
        <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">${plate}</span>
      </div>
    `,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
    popupAnchor: [0, -14],
  });
};

// Componente para sincronizar vista del mapa si se selecciona un punto
function MapController({ selectedItem }: { selectedItem: any }) {
  const map = useMap();
  useEffect(() => {
    if (selectedItem?.data) {
      const lat = selectedItem.data.latitude;
      const lng = selectedItem.data.longitude;
      if (lat && lng) {
        map.flyTo([lat, lng], 15, { duration: 1.2 });
      }
    }
  }, [selectedItem, map]);
  return null;
}

export default function BarrancaMap({
  stops,
  vehicles,
  selectedItem,
  onSelectItem,
  darkMode,
}: BarrancaMapProps) {
  // Coordenadas centrales de la Provincia de Barranca
  const defaultCenter: [number, number] = [-10.7512, -77.7615];

  // TileLayer de CartoDB (Limpio, estilo mapa editorial urbano)
  const tileUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13.5}
      zoomControl={false}
      className="w-full h-full z-10"
      attributionControl={false}
    >
      <TileLayer url={tileUrl} maxZoom={19} />
      <MapController selectedItem={selectedItem} />

      {/* Marcadores de Paraderos y Puntos de Abordaje */}
      {stops.map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.latitude, stop.longitude]}
          icon={createStopIcon(stop.type, stop.queued_vehicles_count)}
          eventHandlers={{
            click: () => onSelectItem({ type: 'stop', data: stop }),
          }}
        >
          <Popup className="custom-map-popup">
            <div className="p-1 text-xs">
              <span className="font-bold text-slate-900 block">{stop.name}</span>
              <span className="text-[11px] text-slate-500 block">{stop.address_reference}</span>
              <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="font-semibold text-blue-600">{stop.type === 'BASE' ? 'Paradero Base' : 'Zona Tranquila'}</span>
                <span className="font-bold text-slate-700">{stop.queued_vehicles_count} carros en cola</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Marcadores de Vehículos en Vivo */}
      {vehicles.map((v) => (
        <Marker
          key={v.id}
          position={[v.latitude, v.longitude]}
          icon={createVehicleIcon(v.status, v.plate)}
          eventHandlers={{
            click: () => onSelectItem({ type: 'vehicle', data: v }),
          }}
        >
          <Popup className="custom-map-popup">
            <div className="p-1 text-xs">
              <span className="font-bold text-slate-900 block">{v.brand_model} ({v.plate})</span>
              <span className="text-[11px] text-slate-500 block">Chofer: {v.driver_name}</span>
              <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className={`font-bold ${v.status === 'DISPONIBLE' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {v.status === 'DISPONIBLE' ? '● Disponible' : '● Unidad Llena'}
                </span>
                <span className="text-slate-600 font-medium">★ {v.driver_rating.toFixed(1)}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
