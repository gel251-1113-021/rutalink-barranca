'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { StopPoint, VehicleUnit, RouteCorridor } from '../../types';
import { 
  Layers, 
  Locate, 
  Flag, 
  Navigation, 
  MapPin, 
  Compass, 
  Check, 
  ChevronDown, 
  X, 
  Eye, 
  Car, 
  Clock, 
  Sparkles,
  MessageSquare
} from 'lucide-react';

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
  passengerState?: 'CAMINO' | 'ESPERANDO' | 'A_BORDO';
  dropoffs?: DropoffPoint[];
  onVehicleTap?: (vehicle: VehicleUnit) => void;
  onRequestDropoff?: () => void;
  onCancelDropoff?: () => void;
  hasActiveDropoff?: boolean;
  onLocateUser?: () => void;
  onPinLocation?: (coords: { lat: number; lng: number; address: string }) => void;
}

// --------------------------------------------------------------------------------
// Geocodificador Inverso y Red de Referencias Oficiales de la Provincia de Barranca (WGS84)
// Incorpora los 5 distritos y sus valles: Paramonga, Pativilca, Barranca, Supe Puerto, Supe y Caral
// --------------------------------------------------------------------------------
const BARRANCA_STREET_REFERENCES = [
  // 1. DISTRITO DE BARRANCA (Centro Urbano y Campus UNAB)
  { lat: -10.7523, lng: -77.7622, name: 'Jr. José Gálvez cdra. 4 (Plaza de Armas de Barranca)' },
  { lat: -10.7512, lng: -77.7615, name: 'Intersección Jr. Lima con Jr. Gálvez, Barranca Centro' },
  { lat: -10.7505, lng: -77.7635, name: 'Jr. Bolognesi (Frente a Mercado Modelo de Barranca)' },
  { lat: -10.7490, lng: -77.7580, name: 'Av. Grau (Frente a Metro y Hospital de Barranca)' },
  { lat: -10.7550, lng: -77.7600, name: 'Av. Gálvez esq. Jr. Zavala (Terminal Terrestre Barranca)' },
  { lat: -10.7485, lng: -77.7550, name: 'Av. Toribio de Luzuriaga (Puerta Principal Campus UNAB)' },
  { lat: -10.7428, lng: -77.7485, name: 'Panamericana Norte km 192 (Acceso Norte Campus UNAB)' },
  { lat: -10.7580, lng: -77.7695, name: 'Malecón Chorrillos / Playa de Barranca' },
  { lat: -10.7450, lng: -77.7660, name: 'Av. Costanera con Jr. Miraflores, Barranca' },
  { lat: -10.7380, lng: -77.7350, name: 'Sector Vino Alto (Valle Agrícola de Barranca)' },

  // 2. DISTRITO DE SUPE PUEBLO Y VALLE SAGRADO DE CARAL
  { lat: -10.7981, lng: -77.7135, name: 'Jr. Bolívar con Jr. Sucre (Plaza de Armas de Supe Pueblo)' },
  { lat: -10.8920, lng: -77.5250, name: 'Ciudad Sagrada de Caral (Valle de Supe)' },
  { lat: -10.8350, lng: -77.6500, name: 'Era de Pando (Valle Supe Medio)' },
  { lat: -10.8650, lng: -77.5850, name: 'Piedra Parada (Ruta Caral - Valle Supe)' },
  { lat: -10.9050, lng: -77.5050, name: 'Chupacigarro (Zona Arqueológica Valle Supe)' },

  // 3. DISTRITO DE SUPE PUERTO
  { lat: -10.8035, lng: -77.7420, name: 'Av. La Marina (Muelle y Terminal de Puerto Supe)' },
  { lat: -10.8120, lng: -77.7480, name: 'Playa Hermosa (Caleta de Pescadores Puerto Supe)' },

  // 4. DISTRITO DE PATIVILCA Y VALLE PATIVILCA
  { lat: -10.6974, lng: -77.7831, name: 'Óvalo de Pativilca (Cruce Panamericana Norte con Desvío Huaraz)' },
  { lat: -10.6930, lng: -77.7850, name: 'Jr. San Martín (Plaza de Armas de Pativilca)' },
  { lat: -10.6850, lng: -77.7450, name: 'Huayto (Valle de Pativilca)' },
  { lat: -10.7100, lng: -77.7650, name: 'Upaca (Valle Río Pativilca)' },
  { lat: -10.7020, lng: -77.7780, name: 'Pampa San José / Cerro Blanco (Pativilca)' },

  // 5. DISTRITO DE PARAMONGA Y VALLE FORTALEZA
  { lat: -10.6720, lng: -77.8180, name: 'Av. Central (Plaza Principal de Paramonga)' },
  { lat: -10.6550, lng: -77.8300, name: 'Carretera Valle Fortaleza (Fortaleza de Paramonga)' },
  { lat: -10.6250, lng: -77.8150, name: 'Huaricana (Valle Fortaleza - Paramonga)' },
  { lat: -10.6650, lng: -77.8420, name: 'Sector Porvenir / Caballet (Paramonga)' }
];

function reverseGeocodeBarranca(lat: number, lng: number): string {
  let closest = BARRANCA_STREET_REFERENCES[0];
  let minDistance = 999999;

  for (const ref of BARRANCA_STREET_REFERENCES) {
    const dLat = ref.lat - lat;
    const dLng = ref.lng - lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = ref;
    }
  }

  // Si está a menos de ~1.2km de una referencia conocida
  if (minDistance < 0.012) {
    return closest.name;
  }
  // Fallback a coordenadas WGS84 con referencia provincial
  return `Punto Geográfico en Barranca (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
}

// --------------------------------------------------------------------------------
// Iconos Vectoriales Personalizados
// --------------------------------------------------------------------------------
const getVehicleCategoryEmoji = (type?: string) => {
  const norm = (type || '').toUpperCase();
  if (norm.includes('MOTO')) return '🛺';
  if (norm.includes('MINIVAN')) return '🚐';
  if (norm.includes('COMBI') || norm.includes('BUS') || norm.includes('HIACE')) return '🚍';
  if (norm.includes('STATION') || norm.includes('WAGON') || norm.includes('PROBOX') || norm.includes('SUV')) return '🚙';
  return '🚗';
};

// Icono de Vehículo con orientación de rumbo real (heading 0-360°)
const createVehicleIcon = (
  status: string, 
  plate: string, 
  darkMode: boolean, 
  vehicleType?: string, 
  heading?: number
) => {
  const isAvailable = status === 'DISPONIBLE';
  const dotColor = isAvailable ? '#10b981' : '#3b82f6';
  const bgColor = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f8fafc' : '#0f172a';
  const emoji = getVehicleCategoryEmoji(vehicleType);
  const rot = typeof heading === 'number' && !isNaN(heading) ? heading : 0;

  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        position: relative;
        background-color: ${bgColor};
        border: 2px solid ${isAvailable ? '#10b981' : '#2563eb'};
        padding: 5px 9px;
        border-radius: 9999px;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);
        display: flex;
        align-items: center;
        gap: 5px;
        color: ${textColor};
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
      ">
        <span style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${dotColor};
          display: inline-block;
          box-shadow: 0 0 6px ${dotColor};
        "></span>
        <span style="font-size: 12px; font-weight: 900; letter-spacing: 0.3px; font-family: ui-monospace, monospace;">${plate}</span>
        <span style="font-size: 13px;">${emoji}</span>
        <span style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          transform: rotate(${rot}deg);
          color: ${isAvailable ? '#059669' : '#2563eb'};
          font-weight: 900;
          margin-left: 2px;
        ">▲</span>
      </div>
    `,
    iconSize: [108, 32],
    iconAnchor: [54, 16],
    popupAnchor: [0, -16],
  });
};

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

// Icono Pin Magnético de Precisión para Marcar en el Mapa (Estilo Google Maps)
const createPinnedLocationIcon = () => {
  return L.divIcon({
    className: 'custom-pinned-location-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: bounce 1s infinite alternate;
      ">
        <div style="
          width: 38px;
          height: 38px;
          background: #dc2626;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 6px 16px rgba(220, 38, 38, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 14px;
            height: 14px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
        <div style="
          width: 12px;
          height: 5px;
          background: rgba(0,0,0,0.25);
          border-radius: 50%;
          margin-top: 3px;
          filter: blur(1px);
        "></div>
      </div>
    `,
    iconSize: [38, 46],
    iconAnchor: [19, 44],
    popupAnchor: [0, -42],
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
        padding: 4px 8px;
        border-radius: 12px;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap;
      ">
        <span>🛑</span>
        <span>${landmark || 'Bajada'}</span>
      </div>
    `,
    iconSize: [84, 26],
    iconAnchor: [42, 13],
    popupAnchor: [0, -14],
  });
};

// Icono de Pasajero Esperando
const createWaitingPassengerIcon = () => {
  return L.divIcon({
    className: 'custom-waiting-passenger-marker',
    html: `
      <div style="
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
      const lat = Number(selectedItem.data.latitude || selectedItem.data.lat);
      const lng = Number(selectedItem.data.longitude || selectedItem.data.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 16, { duration: 1.1 });
      }
    }
  }, [selectedItem, map]);

  return null;
}

// Capturador de Clics en el Mapa para Marcado de Puntos
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
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
  passengerState = 'CAMINO',
  dropoffs = [],
  onVehicleTap,
  onRequestDropoff,
  onCancelDropoff,
  hasActiveDropoff,
  onLocateUser,
  onPinLocation
}: BarrancaMapProps) {
  const defaultCenter: [number, number] = [-10.7512, -77.7615];

  // Modos de Capa Cartográfica Oficial (Google Maps Platform WGS84 Sin Marcas de Agua)
  const [mapLayer, setMapLayer] = useState<'google-streets' | 'google-hybrid' | 'google-satellite' | 'google-traffic' | 'night-mode'>('google-streets');
  const [layerDropdownOpen, setLayerDropdownOpen] = useState(false);
  const [routeDisplayMode, setRouteDisplayMode] = useState<'POINTS' | 'ROADS'>('POINTS');
  const [trackingGps, setTrackingGps] = useState<boolean>(true);

  // Marcador de Posición Pin Personalizado en el Mapa (Estilo Google Maps)
  const [pinnedPoint, setPinnedPoint] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  // Estado para confirmación táctil de "Me bajo aquí" (Timbre de parada)
  const [dropoffPromptOpen, setDropoffPromptOpen] = useState(false);
  const [showAboardAlert, setShowAboardAlert] = useState(false);

  // Servidores de Teselas de Cartografía Oficial (Google Maps Platform WGS84 Sin Marcas de Agua)
  const TILE_SERVERS: Record<string, string> = {
    'google-streets': 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    'google-hybrid': 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    'google-satellite': 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    'google-traffic': 'https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}',
    'night-mode': 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
  };

  const isDarkMap = mapLayer === 'night-mode' || (mapLayer === 'google-streets' && darkMode);
  const currentTileUrl = TILE_SERVERS[mapLayer] || TILE_SERVERS['google-streets'];

  // Manejar clic en el mapa para fijar punto real
  const handleMapClick = (lat: number, lng: number) => {
    const address = reverseGeocodeBarranca(lat, lng);
    const newPin = { lat, lng, address };
    setPinnedPoint(newPin);
    if (onPinLocation) onPinLocation(newPin);
  };

  // Manejar arrastre del pin magnético de precisión
  const handleMarkerDragEnd = (e: any) => {
    const marker = e.target;
    const position = marker.getLatLng();
    const address = reverseGeocodeBarranca(position.lat, position.lng);
    const updated = { lat: position.lat, lng: position.lng, address };
    setPinnedPoint(updated);
    if (onPinLocation) onPinLocation(updated);
  };

  // Detección de Proximidad en Tiempo Real ("Vehículos Cerca de Mí" / Radar Provincial)
  const closestVehicle = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return null;
    const refLat = userLocation?.lat ?? -10.7512;
    const refLng = userLocation?.lng ?? -77.7615;

    let nearest: { vehicle: VehicleUnit; distKm: number; etaMin: number } | null = null;
    let minD = 999999;

    for (const v of vehicles) {
      if (typeof v.latitude !== 'number' || typeof v.longitude !== 'number') continue;
      const dLat = (v.latitude - refLat) * 111.32;
      const dLng = (v.longitude - refLng) * 111.32 * Math.cos((refLat * Math.PI) / 180);
      const d = Math.sqrt(dLat * dLat + dLng * dLng);
      if (d < minD) {
        minD = d;
        const eta = Math.max(1, Math.round((d / 28) * 60));
        nearest = { vehicle: v, distKm: d, etaMin: eta };
      }
    }
    return nearest;
  }, [vehicles, userLocation]);

  const isRouteSelected = (routeId: string) => {
    return selectedItem?.type === 'route' && selectedItem.data?.id === routeId;
  };

  return (
    <div className="relative w-full h-full select-none">
      {/* 1. Selector Superior Izquierdo: Modo de Rutas (Puntos vs Trazo Vial) */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1 p-1 bg-white/95 dark:bg-[#16181d]/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/80 dark:border-slate-800 text-xs font-bold pointer-events-auto">
        <button
          type="button"
          onClick={() => setRouteDisplayMode('POINTS')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
            routeDisplayMode === 'POINTS'
              ? 'bg-emerald-600 text-white font-extrabold shadow-2xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Modo Puntos: Paraderos limpios sin cruce de manzanas"
        >
          <span>📍</span>
          <span className="hidden sm:inline">Puntos Marcados</span>
          <span className="sm:hidden">Puntos</span>
        </button>
        <button
          type="button"
          onClick={() => setRouteDisplayMode('ROADS')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
            routeDisplayMode === 'ROADS'
              ? 'bg-blue-600 text-white font-extrabold shadow-2xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Modo Pistas: Rutas continuas por avenidas de Barranca"
        >
          <span>🛣️</span>
          <span className="hidden sm:inline">Trazo Vial</span>
          <span className="sm:hidden">Pistas</span>
        </button>
      </div>

      {/* 2. Selector Discreto de Capas (Calles, Satélite, Híbrido, Tráfico, Nocturno) */}
      <div className="absolute top-3 right-3 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={() => setLayerDropdownOpen(!layerDropdownOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-[#16181d]/95 backdrop-blur-md shadow-md border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 active:scale-95 transition"
        >
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">
            {mapLayer === 'google-streets' ? 'Google Maps' : mapLayer === 'google-hybrid' ? 'Híbrido' : mapLayer === 'google-satellite' ? 'Satélite' : mapLayer === 'google-traffic' ? 'Tráfico en Vivo' : 'Modo Nocturno'}
          </span>
          <span className="sm:hidden">Capas</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>

        {layerDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#16181d] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-1.5 text-xs font-semibold z-30 animate-in fade-in zoom-in-95">
            <div className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
              Capas Cartográficas
            </div>
            
            <button
              type="button"
              onClick={() => { setMapLayer('google-streets'); setLayerDropdownOpen(false); }}
              className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition ${
                mapLayer === 'google-streets' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>🗺️ Mapa Vial Google</span>
              {mapLayer === 'google-streets' && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => { setMapLayer('google-hybrid'); setLayerDropdownOpen(false); }}
              className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition ${
                mapLayer === 'google-hybrid' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>🏙️ Vista Híbrida</span>
              {mapLayer === 'google-hybrid' && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => { setMapLayer('google-satellite'); setLayerDropdownOpen(false); }}
              className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition ${
                mapLayer === 'google-satellite' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>🛰️ Satélite Rural / Valle</span>
              {mapLayer === 'google-satellite' && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => { setMapLayer('google-traffic'); setLayerDropdownOpen(false); }}
              className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition ${
                mapLayer === 'google-traffic' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>🚦 Tráfico en Tiempo Real</span>
              {mapLayer === 'google-traffic' && <Check className="w-4 h-4 text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => { setMapLayer('night-mode'); setLayerDropdownOpen(false); }}
              className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition ${
                mapLayer === 'night-mode' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>🌙 Modo Nocturno (Conducción)</span>
              {mapLayer === 'night-mode' && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          </div>
        )}
      </div>

      {/* 3. Tarjeta Flotante: Punto Geográfico Marcado por el Usuario en el Mapa */}
      {pinnedPoint && (
        <div className="absolute bottom-28 left-4 right-4 sm:left-auto sm:right-20 sm:w-96 z-30 bg-white/98 dark:bg-[#121417]/98 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 animate-in slide-in-from-bottom duration-200 pointer-events-auto">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Punto Fijado en Mapa</span>
                <strong className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight block">
                  {pinnedPoint.address}
                </strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPinnedPoint(null)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 mb-3 bg-slate-50 dark:bg-[#181a20] px-2.5 py-1 rounded-xl">
            WGS84: {pinnedPoint.lat.toFixed(6)}, {pinnedPoint.lng.toFixed(6)}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (onRequestDropoff) onRequestDropoff();
                setPinnedPoint(null);
              }}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Pedir Recojo Aquí</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPinnedPoint(null);
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition active:scale-95"
            >
              <span>Guardar Punto</span>
            </button>
          </div>
        </div>
      )}

      {/* Radar de Proximidad en Vivo: Vehículo más cercano */}
      {closestVehicle && (
        <div 
          onClick={() => {
            if (onVehicleTap) onVehicleTap(closestVehicle.vehicle);
          }}
          className="absolute left-3 bottom-24 sm:bottom-28 z-20 max-w-[260px] bg-white/95 dark:bg-[#13161a]/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 flex items-center gap-2.5 cursor-pointer hover:border-blue-400 transition active:scale-98 pointer-events-auto"
          title="Toca para ver la unidad más cercana"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200/60 dark:border-blue-900/60 relative">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute -top-0.5 -right-0.5"></span>
            🚗
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                A {closestVehicle.distKm < 1 ? `${Math.round(closestVehicle.distKm * 1000)} m` : `${closestVehicle.distKm.toFixed(1)} km`}
              </span>
              <span className="text-[10px] text-slate-400">·</span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                ~{closestVehicle.etaMin} min
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {closestVehicle.vehicle.brand_model}
            </p>
          </div>
        </div>
      )}

      {/* 4. Botones Flotantes Táctiles (GPS Exacto + Me Bajo Aquí) */}
      <div className="absolute right-3 bottom-24 sm:bottom-28 z-20 flex flex-col items-end gap-2.5 pointer-events-auto">
        {/* Aviso Educativo si el pasajero toca "Me bajo aquí" sin estar a bordo */}
        {showAboardAlert && (
          <div className="p-3 rounded-2xl bg-slate-900/95 text-white shadow-2xl border border-slate-700 max-w-xs text-xs animate-in fade-in duration-200 mb-1">
            <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
              <span>🔔</span>
              <span>Timbre Digital de Bajada</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Solo se activa cuando cambias tu estado a <strong>&quot;A bordo&quot;</strong> arriba o estás en viaje dentro de un vehículo.
            </p>
          </div>
        )}

        {/* Botón: Centrar / Seguir ubicación GPS */}
        {onLocateUser && (
          <button
            type="button"
            onClick={onLocateUser}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1a1d24] text-blue-600 dark:text-blue-400 shadow-xl border border-slate-200/90 dark:border-slate-700 flex items-center justify-center hover:bg-blue-50 transition active:scale-90"
            title="Centrar en mi ubicación GPS exacta"
            aria-label="Ubicar mi posición GPS"
          >
            <Locate className="w-6 h-6" />
          </button>
        )}

        {/* Diálogo de Confirmación: Timbre de Bajada */}
        {dropoffPromptOpen && (
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#15181e] shadow-2xl border border-slate-200 dark:border-slate-700 text-left max-w-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 mb-1.5 text-rose-600 font-bold text-xs">
              <span className="text-base">🛑</span>
              <span>¿Pedir parada al chofer?</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Se emitirá una señal en la cabina del vehículo indicando parada en la próxima esquina.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDropoffPromptOpen(false)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setDropoffPromptOpen(false);
                  if (onRequestDropoff) onRequestDropoff();
                }}
                className="px-3 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs active:scale-95 transition"
              >
                Confirmar Bajada
              </button>
            </div>
          </div>
        )}

        {/* Botón: Me bajo aquí / Cancelar Parada (Condicionado por estado) */}
        {hasActiveDropoff && onCancelDropoff ? (
          <button
            type="button"
            onClick={onCancelDropoff}
            className="px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition active:scale-95 border bg-rose-700 hover:bg-rose-800 text-white border-rose-600 animate-pulse"
            title="Cancelar mi parada solicitada"
          >
            <span className="text-sm">❌</span>
            <span>Cancelar Parada</span>
          </button>
        ) : onRequestDropoff && !dropoffPromptOpen ? (
          <button
            type="button"
            onClick={() => {
              if (passengerState !== 'A_BORDO') {
                setShowAboardAlert(true);
                setTimeout(() => setShowAboardAlert(false), 3800);
                return;
              }
              setDropoffPromptOpen(true);
            }}
            className={`px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition active:scale-95 border ${
              passengerState === 'A_BORDO'
                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-rose-500/30'
                : 'bg-rose-500/25 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-300/40 dark:border-rose-800/40'
            }`}
            title={passengerState === 'A_BORDO' ? "Avisar al chofer para bajar" : "Toca para saber cuándo se activa"}
          >
            <span className="text-sm">🛑</span>
            <span>Me bajo aquí</span>
            {passengerState !== 'A_BORDO' && (
              <span className="text-[10px] bg-rose-200/50 dark:bg-rose-900/50 px-1.5 py-0.5 rounded-md font-semibold">
                Info
              </span>
            )}
          </button>
        ) : null}
      </div>

      {/* 5. Contenedor de Mapa Leaflet con Motor Geográfico Real */}
      <MapContainer
        center={defaultCenter}
        zoom={14}
        zoomControl={false}
        style={{ width: '100%', height: '100%', minHeight: '100%' }}
        className="w-full h-full z-10"
        attributionControl={false}
      >
        <TileLayer 
          key={`${mapLayer}-${darkMode}`}
          url={currentTileUrl} 
          maxZoom={20} 
          className={isDarkMap ? 'dark-navigation-tiles' : ''}
        />
        <MapController selectedItem={selectedItem} userLocation={userLocation} />
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Pin Magnético Arrastrable Colocado por el Usuario */}
        {pinnedPoint && (
          <Marker
            position={[pinnedPoint.lat, pinnedPoint.lng]}
            icon={createPinnedLocationIcon()}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDragEnd
            }}
          >
            <Popup className="custom-map-popup">
              <div className="p-1 text-xs">
                <span className="font-bold text-red-600 block">📍 Punto Marcado</span>
                <span className="text-slate-700 block">{pinnedPoint.address}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Arrastra para mover con precisión</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Trazado Polyline de Rutas Viales Oficiales (Activo en modo Trazo Vial) */}
        {routeDisplayMode === 'ROADS' && routes.map((r) => {
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
                weight: selected ? 6 : 4,
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

        {/* Marcadores de Paraderos Oficiales */}
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
                    <span className="font-bold text-slate-700">{stop.queued_vehicles_count || 0} en cola</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Marcadores de Vehículos en Vivo con Orientación de Rumbo (Heading) */}
        {vehicles.map((v, index) => {
          const lat = Number(v.latitude);
          const lng = Number(v.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={v.id}
              position={[lat, lng]}
              icon={createVehicleIcon(v.status, v.plate, darkMode, v.vehicle_type, v.current_heading)}
              zIndexOffset={100 + index * 5}
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

        {/* Marcador GPS del Dispositivo del Usuario */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserGpsIcon()}
          >
            <Popup className="custom-map-popup">
              <div className="p-1 text-xs text-center font-bold text-blue-600">
                📍 Tu ubicación satelital exacta
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de "Me bajo aquí" (Alertas de bajada solicitada) */}
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

        {/* Señal de Pasajero Esperando */}
        {passengerSignal && (
          <Marker
            position={[passengerSignal.lat, passengerSignal.lng]}
            icon={createWaitingPassengerIcon()}
          >
            <Popup className="custom-map-popup">
              <div className="p-1 text-xs">
                <span className="font-bold text-blue-600 block">Pasajero Esperando</span>
                <span className="text-[11px] text-slate-600 block">{passengerSignal.note || 'Esperando en paradero'}</span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
