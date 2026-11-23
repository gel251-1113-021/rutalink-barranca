'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Maximize2,
  Minimize2,
  Building2,
  GraduationCap,
  Store,
  Umbrella
} from 'lucide-react';

// Hitos Geográficos y Destinos Reales en la Provincia de Barranca (WGS84)
export const BARRANCA_LANDMARKS = [
  { id: 'l1', name: 'Campus UNAB (Universidad Nacional de Barranca)', lat: -10.7428, lng: -77.7485, district: 'Barranca', category: 'UNIVERSIDAD', address: 'Av. Toribio de Luzuriaga / Panamericana Norte km 192' },
  { id: 'l2', name: 'Hospital de Barranca (Emergencias y Consultorios)', lat: -10.7490, lng: -77.7580, district: 'Barranca', category: 'SALUD', address: 'Av. Grau cdra. 5' },
  { id: 'l3', name: 'Supermercado Metro Barranca (Centro Comercial)', lat: -10.7492, lng: -77.7585, district: 'Barranca', category: 'COMERCIO', address: 'Av. Grau con Jr. Ayacucho' },
  { id: 'l4', name: 'Terminal Terrestre Interprovincial de Barranca', lat: -10.7550, lng: -77.7600, district: 'Barranca', category: 'TERMINAL', address: 'Av. Gálvez con Jr. Zavala' },
  { id: 'l5', name: 'Plaza de Armas de Barranca (Centro Cívico)', lat: -10.7523, lng: -77.7622, district: 'Barranca', category: 'CENTRO', address: 'Jr. José Gálvez cdra. 4' },
  { id: 'l6', name: 'Mercado Modelo de Barranca (Abastos y Frutas)', lat: -10.7505, lng: -77.7635, district: 'Barranca', category: 'COMERCIO', address: 'Jr. Bolognesi' },
  { id: 'l7', name: 'Playa Chorrillos y Malecón Costanero', lat: -10.7580, lng: -77.7695, district: 'Barranca', category: 'TURISMO', address: 'Av. Chorrillos' },
  { id: 'l8', name: 'Mirador Cristo Redentor de Barranca', lat: -10.7600, lng: -77.7680, district: 'Barranca', category: 'TURISMO', address: 'Cerro Colorado' },
  { id: 'l9', name: 'Plaza de Armas de Supe Pueblo', lat: -10.7981, lng: -77.7135, district: 'Supe', category: 'CENTRO', address: 'Jr. Bolívar con Jr. Sucre' },
  { id: 'l10', name: 'Ciudad Sagrada de Caral (Patrimonio Mundial)', lat: -10.8920, lng: -77.5250, district: 'Supe', category: 'TURISMO', address: 'Valle de Supe Medio' },
  { id: 'l11', name: 'Puerto Supe (Terminal y Caleta Pesquera)', lat: -10.8035, lng: -77.7420, district: 'Supe Puerto', category: 'PUERTO', address: 'Av. La Marina' },
  { id: 'l12', name: 'Playa Hermosa (Puerto Supe)', lat: -10.8120, lng: -77.7480, district: 'Supe Puerto', category: 'TURISMO', address: 'Litoral Puerto Supe' },
  { id: 'l13', name: 'Óvalo de Pativilca (Cruce Panamericana Norte)', lat: -10.6974, lng: -77.7831, district: 'Pativilca', category: 'CRUCE', address: 'Panamericana Norte km 202 con desvío Huaraz' },
  { id: 'l14', name: 'Plaza de Armas de Pativilca', lat: -10.6930, lng: -77.7850, district: 'Pativilca', category: 'CENTRO', address: 'Jr. San Martín' },
  { id: 'l15', name: 'Sector Huayto y Upaca (Valle Pativilca)', lat: -10.6850, lng: -77.7450, district: 'Pativilca', category: 'RURAL', address: 'Carretera Valle Pativilca' },
  { id: 'l16', name: 'Fortaleza de Paramonga (Monumento Histórico)', lat: -10.6550, lng: -77.8300, district: 'Paramonga', category: 'TURISMO', address: 'Carretera Valle Fortaleza' },
  { id: 'l17', name: 'Plaza de Armas de Paramonga', lat: -10.6720, lng: -77.8180, district: 'Paramonga', category: 'CENTRO', address: 'Av. Central' },
  { id: 'l18', name: 'Sector Huaricana / Porvenir (Valle Fortaleza)', lat: -10.6250, lng: -77.8150, district: 'Paramonga', category: 'RURAL', address: 'Valle Fortaleza Norte' }
];

interface BottomSheetProps {
  stops: StopPoint[];
  vehicles: VehicleUnit[];
  routes?: any[];
  selectedItem: { type: 'stop' | 'vehicle' | 'route'; data: any } | null;
  onSelectItem: (item: { type: 'stop' | 'vehicle' | 'route'; data: any } | null) => void;
  onWaitingClick: () => void;
  onOpenLiveCabin?: (vehicle: VehicleUnit) => void;
  onOpenAgreement?: (driverData: any) => void;
  onSelectDestination?: (dest: string, coords?: { lat: number; lng: number }) => void;
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
  // 'minimized': Barra compacta de 48px para disfrutar el mapa completo interactivo
  // 'half': Vista media (52vh) para explorar sin perder de vista el mapa
  // 'full': Pantalla casi completa para listados extensos
  const [sheetState, setSheetState] = useState<'minimized' | 'half' | 'full'>('minimized');
  const [activeTab, setActiveTab] = useState<'stops' | 'vehicles' | 'routes' | 'places'>('stops');
  const [searchQuery, setSearchQuery] = useState('');

  // Referencias para control de gestos táctiles con el dedo (drag / swipe)
  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Si el usuario toca un vehículo o paradero en el mapa, abrimos el panel para ver el detalle
  useEffect(() => {
    if (selectedItem && sheetState === 'minimized') {
      setSheetState('half');
    }
  }, [selectedItem]);

  // Manejo de gestos táctiles (Dedo) para expandir y retraer suavemente
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || touchStartY.current === null || touchCurrentY.current === null) {
      isDragging.current = false;
      return;
    }

    const deltaY = touchCurrentY.current - touchStartY.current;

    // Arrastre hacia ARRIBA significativo (deltaY < -45px): Expande
    if (deltaY < -45) {
      if (sheetState === 'minimized') setSheetState('half');
      else if (sheetState === 'half') setSheetState('full');
    }
    // Arrastre hacia ABAJO significativo (deltaY > 45px): Retrae
    else if (deltaY > 45) {
      if (sheetState === 'full') setSheetState('half');
      else if (sheetState === 'half') setSheetState('minimized');
    }

    isDragging.current = false;
    touchStartY.current = null;
    touchCurrentY.current = null;
  };

  // Si el usuario está al inicio de la lista y desliza el dedo hacia abajo, retrae el panel
  const handleListTouchMove = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    if (scrollContainerRef.current.scrollTop === 0 && touchStartY.current !== null) {
      const currentY = e.touches[0].clientY;
      if (currentY - touchStartY.current > 70) {
        if (sheetState === 'full') setSheetState('half');
        else if (sheetState === 'half') setSheetState('minimized');
        touchStartY.current = null;
      }
    }
  };

  const selectedStop: StopPoint | null = selectedItem?.type === 'stop' ? selectedItem.data : null;
  const selectedVehicle: VehicleUnit | null = selectedItem?.type === 'vehicle' ? selectedItem.data : null;
  const selectedRoute: any | null = selectedItem?.type === 'route' ? selectedItem.data : null;

  // Filtrado de paraderos, vehículos e hitos geográficos por el buscador
  const filteredStops = stops.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address_reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(v =>
    v.brand_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.driver_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLandmarks = BARRANCA_LANDMARKS.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const QUICK_DESTINATIONS = [
    { name: 'UNAB Campus', lat: -10.7428, lng: -77.7485 },
    { name: 'Supe Pueblo', lat: -10.7981, lng: -77.7135 },
    { name: 'Pativilca', lat: -10.6974, lng: -77.7831 },
    { name: 'Paramonga', lat: -10.6720, lng: -77.8180 },
    { name: 'Barranca Centro', lat: -10.7523, lng: -77.7622 }
  ];

  // 1. ESTADO MINIMIZADO: Barra flotante táctil que deja el 90%+ del mapa 100% interactivo
  if (sheetState === 'minimized' && !selectedItem) {
    return (
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="fixed bottom-[66px] left-3 right-3 z-30 flex items-center justify-between pointer-events-auto touch-pan-y"
      >
        <button
          type="button"
          onClick={() => setSheetState('half')}
          className="flex-1 max-w-lg mx-auto py-3 px-4 rounded-2xl bg-white/95 dark:bg-[#121417]/95 backdrop-blur-md shadow-xl border border-slate-200/90 dark:border-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-100 font-bold text-sm active:scale-98 transition group select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold leading-tight text-slate-900 dark:text-slate-100">
                {vehicles.length > 0
                  ? `${vehicles.length} ${vehicles.length === 1 ? 'vehículo en ruta' : 'vehículos en ruta'} · ${stops.length} paraderos`
                  : `0 vehículos en vivo · ${stops.length} paraderos oficiales`}
              </span>
              <span className="block text-[11px] font-medium text-slate-500">
                Desliza con el dedo hacia arriba ▲ o toca aquí
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-2xs">
            <span>Ver Lista</span>
            <ChevronUp className="w-4 h-4" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-[62px] left-0 right-0 z-30 bg-white dark:bg-[#121417] rounded-t-3xl shadow-[0_-10px_35px_rgba(0,0,0,0.12)] border-t border-slate-200/90 dark:border-slate-800 transition-sheet flex flex-col ${
        sheetState === 'minimized'
          ? 'h-16'
          : sheetState === 'half'
          ? 'h-[64vh]'
          : 'h-[calc(100dvh-70px)]'
      }`}
    >
      {/* Tirador táctil sensible al dedo para arrastrar arriba/abajo */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full pt-2.5 pb-2 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 cursor-grab active:cursor-grabbing select-none"
      >
        <button
          type="button"
          onClick={() => {
            if (sheetState === 'half') setSheetState('full');
            else setSheetState('half');
          }}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold text-xs py-1"
        >
          <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
          <span>{sheetState === 'full' ? 'Deslizar para reducir ▼' : 'Deslizar para expandir ▲'}</span>
        </button>

        {/* Botón Prominente: Ocultar para Ver Mapa Completo */}
        <button
          type="button"
          onClick={() => {
            if (selectedItem) onSelectItem(null);
            setSheetState('minimized');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition active:scale-95"
        >
          <Minimize2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Ver Mapa Completo</span>
        </button>
      </div>

      {/* Contenido Condicional: Detalle vs Explorador General */}
      {selectedItem ? (
        /* VISTA DETALLADA ADAPTADA A CELULAR */
        <div 
          ref={scrollContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleListTouchMove}
          className="flex-1 overflow-y-auto overscroll-contain px-4 pb-24 pt-2 touch-scroll"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                {selectedItem.type === 'stop' ? <MapPin className="w-5 h-5" /> : selectedItem.type === 'route' ? <Route className="w-5 h-5" /> : <Car className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  {selectedItem.type === 'stop' ? 'Paradero Oficial' : selectedItem.type === 'route' ? 'Ruta Troncal' : 'Unidad en Circulación'}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {selectedStop?.name || selectedRoute?.name || `${selectedVehicle?.brand_model}`}
                </h3>
              </div>
            </div>
            <button
              onClick={() => onSelectItem(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Cerrar detalle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Detalle Paradero */}
          {selectedStop && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#16181d] border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Cola Vehicular en Vivo</span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 font-bold text-xs">
                    {selectedStop.queued_vehicles_count} unidades esperando
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedStop.address_reference}
                </p>
                {selectedStop.status_note && (
                  <p className="mt-2.5 text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    {selectedStop.status_note}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#16181d] border border-slate-200/80 dark:border-slate-800 space-y-2">
                <span className="text-xs uppercase font-bold text-slate-400">Datos del Paradero</span>
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-400 block text-xs">Tipo de punto:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedStop.type === 'BASE' ? 'Paradero Físico Base' : 'Punto Tranquilo'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Comité o Empresa:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedStop.group_name || 'Comité 1 Barranca'}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onWaitingClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98"
              >
                <MapPin className="w-4 h-4" />
                <span>Esperar en este paradero</span>
              </button>
            </div>
          )}

          {/* Detalle Ruta con ETA y Trazado Real */}
          {selectedRoute && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#16181d] border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{selectedRoute.name}</span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs">
                    Troncal Vial
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {selectedRoute.origin_name} → {selectedRoute.destination_name}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Distancia vial:</span>
                    <strong className="text-sm font-black text-slate-800 dark:text-slate-200">{selectedRoute.distance_km} km</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tiempo estimado (ETA):</span>
                    <strong className="text-sm font-black text-blue-600 dark:text-blue-400">~{selectedRoute.estimated_duration_min} min</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detalle Vehículo */}
          {selectedVehicle && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#16181d] border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getVehicleEmoji(selectedVehicle.vehicle_type)}</span>
                    <div>
                      <span className="font-black font-mono text-base sm:text-lg text-slate-900 dark:text-slate-50 tracking-wider">
                        {selectedVehicle.plate}
                      </span>
                      <p className="text-xs text-slate-500 font-medium">{selectedVehicle.brand_model}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                    selectedVehicle.status === 'DISPONIBLE'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200'
                  }`}>
                    {selectedVehicle.status === 'DISPONIBLE' ? 'Disponible' : 'Lleno'}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
                  Chofer: <strong className="text-slate-900 dark:text-slate-100">{selectedVehicle.driver_name}</strong>
                </div>
              </div>

              {/* Acciones Táctiles Cómodas */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenLiveCabin && onOpenLiveCabin(selectedVehicle)}
                  className="py-3 px-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Asientos</span>
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
                  className="py-3 px-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Pactar Carrera</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#16181d] border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-xs uppercase font-bold text-slate-400">Capacidad y Equipaje</span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {selectedVehicle.capacity} pasajeros · Parrilla: {selectedVehicle.roof_rack ? 'Sí' : 'No'}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VISTA GENERAL EXPLORADORA */
        <div className="flex-1 flex flex-col px-3.5 sm:px-4 pb-2 overflow-hidden">
          {/* Fila superior con buscador inteligente de destinos de Barranca */}
          <div className="pt-2 mb-2">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="¿A dónde vas? (ej. UNAB, Hospital, Supe, Pativilca...)"
                className="w-full pl-11 pr-4 py-2 text-sm sm:text-base rounded-2xl bg-slate-100 dark:bg-[#181a20] border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Chips rápidos de destino para toque rápido en celular */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-1">
              {QUICK_DESTINATIONS.map(dest => (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => {
                    setSearchQuery(dest.name);
                    if (onSelectDestination) onSelectDestination(dest.name, { lat: dest.lat, lng: dest.lng });
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap transition text-xs font-semibold border border-slate-200 dark:border-slate-700 shrink-0 active:scale-95"
                >
                  {dest.name}
                </button>
              ))}
            </div>
          </div>

          {/* Pestañas de selección con tipografía grande */}
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2 text-xs sm:text-sm font-bold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('stops')}
              className={`pb-1 border-b-2 transition whitespace-nowrap ${
                activeTab === 'stops'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Paraderos ({filteredStops.length})
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`pb-1 border-b-2 transition whitespace-nowrap ${
                activeTab === 'vehicles'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Vehículos ({filteredVehicles.length})
            </button>
            <button
              onClick={() => setActiveTab('places')}
              className={`pb-1 border-b-2 transition whitespace-nowrap ${
                activeTab === 'places'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Lugares Clave ({filteredLandmarks.length})
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`pb-1 border-b-2 transition whitespace-nowrap ${
                activeTab === 'routes'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Rutas ({routes.length})
            </button>
          </div>

          {/* Listado con scroll fluido táctil y densidad óptima */}
          <div 
            ref={scrollContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleListTouchMove}
            className="flex-1 overflow-y-auto overscroll-contain space-y-2 touch-scroll pr-1 pb-16"
          >
            {/* 1. Paraderos */}
            {activeTab === 'stops' && (
              filteredStops.map(s => (
                <div
                  key={s.id}
                  onClick={() => onSelectItem({ type: 'stop', data: s })}
                  className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 dark:bg-[#16181d] border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 cursor-pointer transition flex items-center justify-between active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl text-white shrink-0 ${s.type === 'BASE' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{s.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{s.address_reference}</p>
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                        {s.type === 'BASE' ? 'Paradero Físico Base' : 'Punto Tranquilo'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2 shrink-0">
                    <div className="px-2 py-0.5 rounded-xl bg-white dark:bg-[#1a1d22] border border-slate-200 dark:border-slate-800 text-center font-bold text-xs text-slate-800 dark:text-slate-200">
                      {s.queued_vehicles_count}
                      <span className="block text-[9px] font-normal text-slate-400">en cola</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}

            {/* 2. Vehículos en Vivo */}
            {activeTab === 'vehicles' && (
              filteredVehicles.map(v => (
                <div
                  key={v.id}
                  onClick={() => onSelectItem({ type: 'vehicle', data: v })}
                  className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 dark:bg-[#16181d] border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 cursor-pointer transition flex items-center justify-between active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center text-lg shrink-0 ${v.status === 'DISPONIBLE' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                      <span>{getVehicleEmoji(v.vehicle_type)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 tracking-wider">
                          {v.plate}
                        </h4>
                        <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[140px]">{v.brand_model}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Chofer: <strong className="text-slate-700 dark:text-slate-300">{v.driver_name}</strong></p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.status === 'DISPONIBLE'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200'
                    }`}>
                      {v.status === 'DISPONIBLE' ? 'Libre' : 'Lleno'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}

            {/* 3. Lugares Clave e Instituciones de Barranca */}
            {activeTab === 'places' && (
              filteredLandmarks.map(l => (
                <div
                  key={l.id}
                  onClick={() => {
                    if (onSelectDestination) {
                      onSelectDestination(l.name, { lat: l.lat, lng: l.lng });
                    }
                  }}
                  className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 dark:bg-[#16181d] border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition flex items-center justify-between active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 border border-indigo-200/80 shrink-0">
                      {l.category === 'UNIVERSIDAD' ? <GraduationCap className="w-4 h-4" /> : l.category === 'TURISMO' ? <Umbrella className="w-4 h-4" /> : l.category === 'COMERCIO' ? <Store className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{l.name}</h4>
                      <p className="text-[11px] text-slate-500">{l.address} · {l.district}</p>
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                        Hito Geográfico WGS84
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))
            )}

            {/* 4. Rutas Troncales */}
            {activeTab === 'routes' && (
              routes.map((r: any) => (
                <div
                  key={r.id}
                  onClick={() => onSelectItem({ type: 'route', data: r })}
                  className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 dark:bg-[#16181d] border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 cursor-pointer transition flex items-center justify-between active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 border border-blue-200/80 shrink-0">
                      <Route className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{r.name}</h4>
                      <p className="text-[11px] text-slate-500">{r.origin_name} → {r.destination_name}</p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {r.distance_km} km · ~{r.estimated_duration_min} min (ETA)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
