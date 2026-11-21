'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../components/Header';
import MapWrapper from '../components/Map/MapWrapper';
import BottomSheet from '../components/BottomSheet';
import AuthModal from '../components/AuthModal';
import ProfileModal from '../components/ProfileModal';
import VehicleDesignerModal from '../components/VehicleDesigner/VehicleDesignerModal';
import DispatcherPanel from '../components/Dispatcher/DispatcherPanel';
import GroupManagementModal from '../components/Groups/GroupManagementModal';
import AgreementRoomModal from '../components/Trips/AgreementRoomModal';
import VehicleLiveCabinModal from '../components/VehicleViewer/VehicleLiveCabinModal';
import OfflineBanner from '../components/Offline/OfflineBanner';
import SmsFallbackModal from '../components/Offline/SmsFallbackModal';
import AnalyticsModal from '../components/Analytics/AnalyticsModal';
import BottomNavBar from '../components/Mobile/BottomNavBar';
import DriverCockpitModal from '../components/Driver/DriverCockpitModal';
import GroupChatModal from '../components/Chat/GroupChatModal';
import ContactsModal from '../components/Contacts/ContactsModal';
import VehicleInspectModal from '../components/VehicleViewer/VehicleInspectModal';
import RouteBuilderModal from '../components/RouteBuilder/RouteBuilderModal';
import TripHistoryModal from '../components/Trips/TripHistoryModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { StopPoint, VehicleUnit, RouteCorridor } from '../types';
import { useAuth } from '../context/AuthContext';
import { offlineStore } from '../lib/offlineStore';
import { BellRing, Car, Check, MapPin, Navigation } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const INITIAL_STOPS: StopPoint[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Paradero Base Central Barranca',
    type: 'BASE',
    address_reference: 'Av. José Gálvez 450 (Cerca a Plaza Vea)',
    latitude: -10.7512,
    longitude: -77.7615,
    group_name: 'Comité 1 de Transporte Barranca - Supe - UNAB',
    queued_vehicles_count: 3,
    status_note: 'Flujo normal. Salidas cada 5 minutos hacia UNAB y Supe.'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Punto de Parada UNAB - Campus Universitario',
    type: 'ZONA_TRANQUILA',
    address_reference: 'Puerta Principal Av. Toribio de Luzuriaga',
    latitude: -10.7485,
    longitude: -77.7550,
    group_name: 'Comité 1 de Transporte Barranca - Supe - UNAB',
    queued_vehicles_count: 1,
    status_note: 'Parada autorizada frente al campus UNAB.'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Paradero Supe Pueblo',
    type: 'BASE',
    address_reference: 'Calle Francisco Bolognesi (Plaza de Supe)',
    latitude: -10.7980,
    longitude: -77.7125,
    group_name: 'Comité 1 de Transporte Barranca - Supe - UNAB',
    queued_vehicles_count: 2,
    status_note: 'Salidas hacia Barranca cada 10 min.'
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    name: 'Punto Tranquilo Óvalo Pativilca',
    type: 'ZONA_TRANQUILA',
    address_reference: 'Cruce Panamericana Norte y desvío Huaraz',
    latitude: -10.6970,
    longitude: -77.7845,
    group_name: 'Comité 1 de Transporte Barranca - Supe - UNAB',
    queued_vehicles_count: 0
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    name: 'Punto de Abordaje Paramonga',
    type: 'ZONA_TRANQUILA',
    address_reference: 'Entrada Av. Ferrocarril',
    latitude: -10.6720,
    longitude: -77.8150,
    group_name: 'Comité 1 de Transporte Barranca - Supe - UNAB',
    queued_vehicles_count: 0
  }
];

const INITIAL_VEHICLES: VehicleUnit[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    plate: 'B1A-789',
    brand_model: 'Toyota Yaris Sedán 2023',
    vehicle_type: 'SEDAN',
    seat_layout: [
      { x: 1, y: 1, id: 'c1', type: 'driver', label: 'Conductor', status: 'occupied' },
      { x: 2, y: 1, id: 's1', type: 'passenger', label: 'Copiloto', status: 'free' },
      { x: 1, y: 2, id: 's2', type: 'passenger', label: 'Atrás Izq', status: 'occupied' },
      { x: 1.5, y: 2, id: 's3', type: 'passenger', label: 'Atrás Centro', status: 'free' },
      { x: 2, y: 2, id: 's4', type: 'passenger', label: 'Atrás Der', status: 'free' }
    ],
    capacity: 4,
    roof_rack: true,
    max_cargo_kg: 40,
    cargo_status: 'VACIO',
    status: 'DISPONIBLE',
    latitude: -10.7500,
    longitude: -77.7580,
    current_heading: 85,
    driver_name: 'Jorge Huamán Castillo',
    driver_phone: '+51 987654323',
    driver_rating: 4.8,
    group_name: 'Comité 1 de Transporte Barranca - Supe - UNAB',
    last_location_update: new Date().toISOString()
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    plate: 'C3M-456',
    brand_model: 'Chevrolet Sail Sedán',
    vehicle_type: 'SEDAN',
    seat_layout: [
      { x: 1, y: 1, id: 'c1', type: 'driver', label: 'Conductor', status: 'occupied' },
      { x: 2, y: 1, id: 's1', type: 'passenger', label: 'Copiloto', status: 'free' },
      { x: 1, y: 2, id: 's2', type: 'passenger', label: 'Atrás Izq', status: 'occupied' },
      { x: 1.5, y: 2, id: 's3', type: 'passenger', label: 'Atrás Centro', status: 'free' },
      { x: 2, y: 2, id: 's4', type: 'passenger', label: 'Atrás Der', status: 'free' }
    ],
    capacity: 4,
    roof_rack: false,
    max_cargo_kg: 30,
    cargo_status: 'DISPONIBLE',
    status: 'DISPONIBLE',
    latitude: -10.7490,
    longitude: -77.7520,
    current_heading: 180,
    driver_name: 'Walter Rosales Díaz',
    driver_phone: '+51 987654324',
    driver_rating: 4.6,
    last_location_update: new Date().toISOString()
  }
];

const INITIAL_ROUTES: RouteCorridor[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    name: 'Ruta Troncal 1: Barranca Centro — Campus UNAB',
    origin_name: 'Paradero Base Central Barranca',
    destination_name: 'Punto UNAB (Av. Toribio de Luzuriaga)',
    distance_km: 3.8,
    estimated_duration_min: 10,
    geojson: {
      type: 'LineString',
      coordinates: [
        [-77.7615, -10.7512],
        [-77.7590, -10.7505],
        [-77.7565, -10.7495],
        [-77.7550, -10.7485]
      ]
    }
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    name: 'Ruta Interdistrital 2: Barranca — Supe Pueblo',
    origin_name: 'Paradero Base Central Barranca',
    destination_name: 'Paradero Supe Pueblo',
    distance_km: 9.2,
    estimated_duration_min: 18,
    geojson: {
      type: 'LineString',
      coordinates: [
        [-77.7615, -10.7512],
        [-77.7530, -10.7650],
        [-77.7380, -10.7820],
        [-77.7125, -10.7980]
      ]
    }
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    name: 'Ruta Norte 3: Barranca — Pativilca — Paramonga',
    origin_name: 'Paradero Base Central Barranca',
    destination_name: 'Entrada Paramonga (Fortaleza)',
    distance_km: 14.5,
    estimated_duration_min: 25,
    geojson: {
      type: 'LineString',
      coordinates: [
        [-77.7615, -10.7512],
        [-77.7700, -10.7200],
        [-77.7845, -10.6970],
        [-77.8150, -10.6720]
      ]
    }
  }
];

export default function HomePage() {
  const { user, profile, isGuest } = useAuth();

  // Estados de Tema y Navegación Móvil
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'map' | 'driver' | 'chat' | 'contacts' | 'builder' | 'history'>('map');

  // Modales Generales
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [tripHistoryOpen, setTripHistoryOpen] = useState<boolean>(false);
  const [vehicleDesignerOpen, setVehicleDesignerOpen] = useState<boolean>(false);
  const [dispatcherPanelOpen, setDispatcherPanelOpen] = useState<boolean>(false);
  const [groupManagementOpen, setGroupManagementOpen] = useState<boolean>(false);
  const [agreementModalOpen, setAgreementModalOpen] = useState<boolean>(false);
  const [selectedDriverForAgreement, setSelectedDriverForAgreement] = useState<any | null>(null);
  const [cabinModalOpen, setCabinModalOpen] = useState<boolean>(false);
  const [selectedVehicleForCabin, setSelectedVehicleForCabin] = useState<VehicleUnit | null>(null);

  // Modales Sprint 4 (Off-Grid y Analítica)
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [smsModalOpen, setSmsModalOpen] = useState<boolean>(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState<boolean>(false);

  // Modales Sprint 5 (Cabina Conductor, Chat Grupal, Contactos, Visualizador Vehículo, Creador Rutas)
  const [driverCockpitOpen, setDriverCockpitOpen] = useState<boolean>(false);
  const [groupChatOpen, setGroupChatOpen] = useState<boolean>(false);
  const [contactsOpen, setContactsOpen] = useState<boolean>(false);
  const [routeBuilderOpen, setRouteBuilderOpen] = useState<boolean>(false);
  const [inspectedVehicle, setInspectedVehicle] = useState<any | null>(null);

  // Estados de Usuario y Ubicación
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffs, setDropoffs] = useState<any[]>([]);
  const [passengerContextState, setPassengerContextState] = useState<'CAMINO' | 'ESPERANDO' | 'A_BORDO'>('CAMINO');

  // Estados de Datos Cartográficos
  const [stops, setStops] = useState<StopPoint[]>(INITIAL_STOPS);
  const [vehicles, setVehicles] = useState<VehicleUnit[]>(INITIAL_VEHICLES);
  const [routes, setRoutes] = useState<RouteCorridor[]>(INITIAL_ROUTES);
  const [selectedItem, setSelectedItem] = useState<{ type: 'stop' | 'vehicle' | 'route'; data: any } | null>(null);
  const [passengerSignal, setPassengerSignal] = useState<{ lat: number; lng: number; note?: string } | null>(null);
  const [notificationToast, setNotificationToast] = useState<{ title: string; message: string; type?: 'info' | 'success' } | null>(null);

  const socketRef = useRef<Socket | null>(null);

  const currentRole = profile?.active_role || 'PASAJERO';
  const isDriver = currentRole === 'CONDUCTOR_AFILIADO' || currentRole === 'CONDUCTOR_INDEPENDIENTE';

  // Sincronización de tema
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Detector de conectividad
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }
    setLastSyncTime(offlineStore.getLastSync() || new Date().toISOString());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      // 1. Paraderos
      const stopsRes = await fetch(`${apiUrl}/api/stops`).catch(() => null);
      if (stopsRes && stopsRes.ok) {
        const data = await stopsRes.json();
        const loadedStops: StopPoint[] = (data.stops || []).map((s: any) => ({
          ...s,
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
          queued_vehicles_count: Number(s.queued_vehicles_count || 0)
        }));
        if (loadedStops.length > 0) {
          setStops(loadedStops);
          offlineStore.saveStops(loadedStops);
        }
      }

      // 2. Vehículos
      const vehiclesRes = await fetch(`${apiUrl}/api/vehicles`).catch(() => null);
      if (vehiclesRes && vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        const mappedVehicles: VehicleUnit[] = (data.vehicles || []).map((v: any) => ({
          ...v,
          latitude: Number(v.latitude),
          longitude: Number(v.longitude),
          driver_rating: parseFloat(String(v.driver_rating || '5.0')) || 5.0
        }));
        if (mappedVehicles.length > 0) {
          setVehicles(mappedVehicles);
          offlineStore.saveVehicles(mappedVehicles);
        }
      }

      // 3. Rutas Viales
      const routesRes = await fetch(`${apiUrl}/api/routes`).catch(() => null);
      if (routesRes && routesRes.ok) {
        const routesData = await routesRes.json();
        const loadedRoutes: RouteCorridor[] = routesData.routes || [];
        if (loadedRoutes.length > 0) {
          setRoutes(loadedRoutes);
          offlineStore.saveRoutes(loadedRoutes);
        }
      }

      // 4. Bajadas Solicitadas Activas ("Me bajo aquí")
      const dropoffsRes = await fetch(`${apiUrl}/api/dropoffs/active`).catch(() => null);
      if (dropoffsRes && dropoffsRes.ok) {
        const dData = await dropoffsRes.json();
        setDropoffs(dData.dropoffs || []);
      }
    } catch (err) {
      console.error('[LoadData Exception]:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sockets en tiempo real
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    // Movimiento continuo de vehículos
    socket.on('vehicle_moved', (data: { vehicleId: string; latitude: number; longitude: number; heading?: number }) => {
      setVehicles(prev => prev.map(v => {
        if (v.id === data.vehicleId) {
          return {
            ...v,
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            current_heading: data.heading ?? v.current_heading,
            last_location_update: new Date().toISOString()
          };
        }
        return v;
      }));
    });

    // Asientos actualizados
    socket.on('cabin_seat_updated', (data: { vehicleId: string; seatLayout: any[] }) => {
      setVehicles(prev => prev.map(v => {
        if (v.id === data.vehicleId) {
          return { ...v, seat_layout: data.seatLayout };
        }
        return v;
      }));
    });

    // Paradas solicitadas ("Me bajo aquí")
    socket.on('dropoff_requested', (data: any) => {
      setDropoffs(prev => [data, ...prev]);
      setNotificationToast({
        title: '🛑 Parada Solicitada',
        message: `${data.landmark_reference} (Pasajero a bordo)`,
        type: 'info'
      });
      setTimeout(() => setNotificationToast(null), 5000);
    });

    // Estado del chofer cambiado
    socket.on('vehicle_status_changed', (data: any) => {
      setVehicles(prev => prev.map(v => {
        if (v.id === data.vehicleId) {
          return { ...v, status: data.status };
        }
        return v;
      }));
    });

    // Rutas nuevas creadas
    socket.on('route_created', (data: any) => {
      setRoutes(prev => [...prev, data]);
      setNotificationToast({
        title: 'Nueva Ruta Trazada',
        message: data.name,
        type: 'success'
      });
      setTimeout(() => setNotificationToast(null), 4000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Función: Activar mi Ubicación GPS del Teléfono
  const handleLocateUser = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          setNotificationToast({
            title: '📍 GPS Activado',
            message: 'Tu ubicación ha sido centrada en el mapa.',
            type: 'success'
          });
          setTimeout(() => setNotificationToast(null), 3500);
        },
        () => {
          // Fallback a coordenadas de Barranca
          const barrancaCoords = { lat: -10.7515, lng: -77.7610 };
          setUserLocation(barrancaCoords);
          setNotificationToast({
            title: 'Ubicación Aproximada',
            message: 'Centrado en Plaza de Armas de Barranca.',
            type: 'info'
          });
          setTimeout(() => setNotificationToast(null), 3000);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  // Función: "Me bajo aquí" (Parada solicitada en 1 toque)
  const handleRequestDropoff = async () => {
    const lat = userLocation ? userLocation.lat : -10.7512;
    const lng = userLocation ? userLocation.lng : -77.7615;

    try {
      const res = await fetch('/api/dropoffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passengerId: user?.id,
          passengerName: profile?.full_name || 'Pasajero a Bordo',
          vehiclePlate: 'B1A-789',
          lat,
          lng,
          landmark: 'Esquina / Paradero Solicitado (Av. Gálvez)'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDropoffs(prev => [data.dropoff, ...prev]);
        setNotificationToast({
          title: '🛑 ¡Parada Solicitada!',
          message: 'El chofer ha recibido la alerta de bajada en el mapa.',
          type: 'success'
        });
        setTimeout(() => setNotificationToast(null), 4000);
      }
    } catch (e) {
      console.error('Error al pedir bajada:', e);
    }
  };

  // Manejador de navegación inferior adaptado por rol
  const handleSelectBottomTab = (tab: 'map' | 'driver' | 'chat' | 'contacts' | 'builder' | 'history') => {
    setActiveMobileTab(tab);
    if (tab === 'driver') setDriverCockpitOpen(true);
    if (tab === 'history') setTripHistoryOpen(true);
    if (tab === 'chat') setGroupChatOpen(true);
    if (tab === 'contacts') setContactsOpen(true);
    if (tab === 'builder') setRouteBuilderOpen(true);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-[#0c0d0f]">
      {/* Barra de Navegación Superior */}
      <Header
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenHistory={() => setTripHistoryOpen(true)}
        onOpenVehicleDesigner={() => setVehicleDesignerOpen(true)}
        onOpenDispatcherPanel={() => setDispatcherPanelOpen(true)}
        onOpenGroupManagement={() => setGroupManagementOpen(true)}
        onOpenSmsFallback={() => setSmsModalOpen(true)}
        onOpenAnalytics={() => setAnalyticsModalOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        isOffline={isOffline}
      />

      {/* Banner de Modo Sin Conexión */}
      <OfflineBanner
        isOffline={isOffline}
        onOpenSms={() => setSmsModalOpen(true)}
        lastSyncTime={lastSyncTime}
      />

      {/* Barra de Estado Contextual Superior para Pasajeros y Choferes */}
      <div className="z-20 w-full bg-white/90 dark:bg-[#121417]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs">
        {isDriver ? (
          /* Conductor: Acceso rápido a su cabina */
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Chofer en Servicio · Toyota Yaris (B1A-789)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDriverCockpitOpen(true)}
              className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1.5 transition active:scale-95"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Abrir Mi Cabina</span>
            </button>
          </div>
        ) : (
          /* Pasajero: Selector de estado contextual (1 toque) */
          <div className="w-full flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
              Mi estado:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setPassengerContextState('CAMINO')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                  passengerContextState === 'CAMINO'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                🚶 En camino
              </button>
              <button
                type="button"
                onClick={() => {
                  setPassengerContextState('ESPERANDO');
                  setNotificationToast({
                    title: 'Señal Activada',
                    message: 'Esperando vehículo en paradero.',
                    type: 'info'
                  });
                  setTimeout(() => setNotificationToast(null), 3000);
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                  passengerContextState === 'ESPERANDO'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                📍 Esperando aquí
              </button>
              <button
                type="button"
                onClick={() => setPassengerContextState('A_BORDO')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition ${
                  passengerContextState === 'A_BORDO'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                🚗 A bordo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notificación Toast Flotante */}
      {notificationToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-[#16181d] text-slate-900 dark:text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-200">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
            <BellRing className="w-3.5 h-3.5" />
          </div>
          <div>
            <strong className="block text-[11px] font-bold text-blue-600">{notificationToast.title}</strong>
            <span className="text-[11px] text-slate-600 dark:text-slate-300">{notificationToast.message}</span>
          </div>
        </div>
      )}

      {/* Mapa Interactivo Google Maps Oficial */}
      <div className="relative flex-1 w-full h-full min-h-0 pb-16">
        <ErrorBoundary>
          <MapWrapper
            stops={stops}
            vehicles={vehicles}
            routes={routes}
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem}
            darkMode={darkMode}
            passengerSignal={passengerSignal}
            userLocation={userLocation}
            dropoffs={dropoffs}
            onVehicleTap={(v) => setInspectedVehicle(v)}
            onRequestDropoff={handleRequestDropoff}
            onLocateUser={handleLocateUser}
          />
        </ErrorBoundary>
      </div>

      {/* Panel Deslizable Bottom Sheet (Paraderos, Vehículos, Rutas) */}
      <BottomSheet
        stops={stops}
        vehicles={vehicles}
        routes={routes}
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem}
        onWaitingClick={handleLocateUser}
        onOpenLiveCabin={(v) => setInspectedVehicle(v)}
        onOpenAgreement={(d) => {
          setSelectedDriverForAgreement(d);
          setAgreementModalOpen(true);
        }}
      />

      {/* Barra de Navegación Inferior Móvil Fija */}
      <BottomNavBar
        activeTab={activeMobileTab}
        onSelectTab={handleSelectBottomTab}
        userRole={currentRole}
        unreadChatCount={2}
      />

      {/* 1. Modal Cabina Interactiva del Conductor */}
      <DriverCockpitModal
        isOpen={driverCockpitOpen}
        onClose={() => setDriverCockpitOpen(false)}
        driverName={profile?.full_name || 'Jorge Huamán Castillo'}
        vehiclePlate="B1A-789"
        vehicleModel="Toyota Yaris Sedán 2023"
        onUpdateStatus={(st, note) => {
          setNotificationToast({
            title: 'Estado Actualizado',
            message: note,
            type: 'success'
          });
          setTimeout(() => setNotificationToast(null), 3000);
        }}
      />

      {/* 2. Modal Chat Grupal Tipo WhatsApp */}
      <GroupChatModal
        isOpen={groupChatOpen}
        onClose={() => setGroupChatOpen(false)}
        currentUser={{
          id: user?.id || 'a0000000-0000-0000-0000-000000000005',
          name: profile?.full_name || 'Lucía Fernández (UNAB)',
          role: currentRole
        }}
      />

      {/* 3. Modal Directorio de Contactos y Llamadas */}
      <ContactsModal
        isOpen={contactsOpen}
        onClose={() => setContactsOpen(false)}
      />

      {/* 4. Modal Visualizador Táctil del Modelo Virtual del Vehículo */}
      <VehicleInspectModal
        isOpen={!!inspectedVehicle}
        onClose={() => setInspectedVehicle(null)}
        vehicle={inspectedVehicle}
        onBoardRequest={() => {
          handleLocateUser();
          setNotificationToast({
            title: 'Abordaje Solicitado',
            message: 'El conductor ha recibido tu punto de abordaje.',
            type: 'success'
          });
          setTimeout(() => setNotificationToast(null), 3500);
        }}
      />

      {/* 5. Modal Creador Interactivo de Rutas */}
      <RouteBuilderModal
        isOpen={routeBuilderOpen}
        onClose={() => setRouteBuilderOpen(false)}
        onRouteSaved={(newR) => {
          setRoutes(prev => [...prev, newR]);
        }}
      />

      {/* 6. Modal Historial de Viajes (Pasajero y Conductor) */}
      <TripHistoryModal
        isOpen={tripHistoryOpen}
        onClose={() => setTripHistoryOpen(false)}
        userId={user?.id}
        userRole={currentRole}
      />

      {/* Modales Existentes */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      <VehicleDesignerModal
        isOpen={vehicleDesignerOpen}
        onClose={() => setVehicleDesignerOpen(false)}
        onSaved={loadData}
      />

      <DispatcherPanel
        isOpen={dispatcherPanelOpen}
        onClose={() => setDispatcherPanelOpen(false)}
        onStatusUpdated={loadData}
      />

      <GroupManagementModal
        isOpen={groupManagementOpen}
        onClose={() => setGroupManagementOpen(false)}
      />

      <VehicleLiveCabinModal
        isOpen={cabinModalOpen}
        onClose={() => setCabinModalOpen(false)}
        vehicle={selectedVehicleForCabin}
      />

      <AgreementRoomModal
        isOpen={agreementModalOpen}
        onClose={() => setAgreementModalOpen(false)}
        driverData={selectedDriverForAgreement}
      />

      <SmsFallbackModal
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
      />

      <AnalyticsModal
        isOpen={analyticsModalOpen}
        onClose={() => setAnalyticsModalOpen(false)}
      />
    </main>
  );
}
