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
import RideNegotiationModal from '../components/Trips/RideNegotiationModal';
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
import ShareAppModal from '../components/Mobile/ShareAppModal';
import ReviewModal from '../components/Reviews/ReviewModal';
import PhotoUploadModal from '../components/Media/PhotoUploadModal';
import LoadingSplashScreen from '../components/Branding/LoadingSplashScreen';
import InteractiveGuideModal from '../components/Guide/InteractiveGuideModal';
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
  // 1. SEDÁN ESTÁNDAR
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    plate: 'B1A-789',
    brand_model: 'Toyota Yaris Sedán 2023',
    vehicle_type: 'SEDAN',
    seat_layout: [
      { x: 1, y: 1, id: 'c1', type: 'driver', label: 'Conductor', status: 'occupied' },
      { x: 2, y: 1, id: 's1', type: 'passenger', label: 'Copiloto A1', status: 'free' },
      { x: 1, y: 2, id: 's2', type: 'passenger', label: 'Atrás Izq A2', status: 'occupied' },
      { x: 1.5, y: 2, id: 's3', type: 'passenger', label: 'Atrás Centro A3', status: 'free' },
      { x: 2, y: 2, id: 's4', type: 'passenger', label: 'Atrás Der A4', status: 'free' }
    ],
    capacity: 4,
    roof_rack: true,
    max_cargo_kg: 45,
    cargo_status: 'VACIO',
    status: 'DISPONIBLE',
    latitude: -10.7538,
    longitude: -77.7612,
    current_heading: 110,
    driver_name: 'Jorge Huamán Castillo',
    driver_phone: '+51 987654323',
    driver_rating: 4.8,
    group_name: 'Comité 1 de Transporte Barranca - Supe - UNAB',
    last_location_update: new Date().toISOString()
  },
  // 2. COMBI INTERDISTRITAL (14 PASAJEROS)
  {
    id: 'd0000000-0000-0000-0000-000000000006',
    plate: 'Z9P-140',
    brand_model: 'Toyota HiAce Combi 2024',
    vehicle_type: 'COMBI',
    seat_layout: [
      { x: 1, y: 1, id: 'c1', type: 'driver', label: 'Chofer', status: 'occupied' },
      { x: 3, y: 1, id: 's1', type: 'passenger', label: 'Copiloto A1', status: 'free' },
      { x: 1, y: 2, id: 's2', type: 'passenger', label: 'A2', status: 'free' },
      { x: 2, y: 2, id: 's3', type: 'passenger', label: 'A3', status: 'free' },
      { x: 3, y: 2, id: 's4', type: 'passenger', label: 'A4', status: 'occupied' },
      { x: 1, y: 3, id: 's5', type: 'passenger', label: 'A5', status: 'free' },
      { x: 2, y: 3, id: 's6', type: 'passenger', label: 'A6', status: 'occupied' },
      { x: 3, y: 3, id: 's7', type: 'passenger', label: 'A7', status: 'free' },
      { x: 1, y: 4, id: 's8', type: 'passenger', label: 'A8', status: 'free' },
      { x: 2, y: 4, id: 's9', type: 'passenger', label: 'A9', status: 'free' },
      { x: 3, y: 4, id: 's10', type: 'passenger', label: 'A10', status: 'free' },
      { x: 1, y: 5, id: 's11', type: 'passenger', label: 'A11', status: 'free' },
      { x: 1.6, y: 5, id: 's12', type: 'passenger', label: 'A12', status: 'free' },
      { x: 2.3, y: 5, id: 's13', type: 'passenger', label: 'A13', status: 'free' },
      { x: 3, y: 5, id: 's14', type: 'passenger', label: 'A14', status: 'free' }
    ],
    capacity: 14,
    roof_rack: true,
    max_cargo_kg: 150,
    cargo_status: 'DISPONIBLE',
    status: 'DISPONIBLE',
    latitude: -10.7280,
    longitude: -77.7580,
    current_heading: 340,
    driver_name: 'Pedro Chumpitaz Solís',
    driver_phone: '+51 987654330',
    driver_rating: 4.9,
    group_name: 'Comité 1 de Transporte Barranca - Supe - UNAB',
    last_location_update: new Date().toISOString()
  },
  // 3. MINIVÁN COLECTIVO (6 PASAJEROS)
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    plate: 'A7U-102',
    brand_model: 'Toyota Avanza Miniván 2024',
    vehicle_type: 'MINIVAN',
    seat_layout: [
      { x: 1, y: 1, id: 'c1', type: 'driver', label: 'Chofer', status: 'occupied' },
      { x: 2, y: 1, id: 's1', type: 'passenger', label: 'Copiloto A1', status: 'free' },
      { x: 1, y: 2, id: 's2', type: 'passenger', label: 'A2 Intermedio', status: 'occupied' },
      { x: 2, y: 2, id: 's3', type: 'passenger', label: 'A3 Intermedio', status: 'free' },
      { x: 1, y: 3, id: 's4', type: 'passenger', label: 'A4 Atrás', status: 'free' },
      { x: 1.5, y: 3, id: 's5', type: 'passenger', label: 'A5 Atrás Centro', status: 'free' },
      { x: 2, y: 3, id: 's6', type: 'passenger', label: 'A6 Atrás Der', status: 'free' }
    ],
    capacity: 6,
    roof_rack: true,
    max_cargo_kg: 80,
    cargo_status: 'DISPONIBLE',
    status: 'DISPONIBLE',
    latitude: -10.7435,
    longitude: -77.7480,
    current_heading: 45,
    driver_name: 'Carlos Morales Echevarría',
    driver_phone: '+51 987654313',
    driver_rating: 4.95,
    group_name: 'Comité 1 de Transporte Barranca - Supe - UNAB',
    last_location_update: new Date().toISOString()
  },
  // 4. STATION WAGON / PROBOX CON PARRILLA (4 PASAJEROS + 120 KG)
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    plate: 'P4R-550',
    brand_model: 'Toyota Probox Station Wagon con Parrilla',
    vehicle_type: 'STATION_WAGON',
    seat_layout: [
      { x: 1, y: 1, id: 'c1', type: 'driver', label: 'Chofer', status: 'occupied' },
      { x: 2, y: 1, id: 's1', type: 'passenger', label: 'Copiloto A1', status: 'free' },
      { x: 1, y: 2, id: 's2', type: 'passenger', label: 'Atrás Izq A2', status: 'occupied' },
      { x: 1.5, y: 2, id: 's3', type: 'passenger', label: 'Atrás Centro A3', status: 'free' },
      { x: 2, y: 2, id: 's4', type: 'passenger', label: 'Atrás Der A4', status: 'free' }
    ],
    capacity: 4,
    roof_rack: true,
    max_cargo_kg: 120,
    cargo_status: 'DISPONIBLE',
    status: 'DISPONIBLE',
    latitude: -10.7780,
    longitude: -77.7420,
    current_heading: 150,
    driver_name: 'Walter Rosales Díaz',
    driver_phone: '+51 987654324',
    driver_rating: 4.7,
    group_name: 'Asociación de Mototaxis y Colectivos Rápidos Barranca',
    last_location_update: new Date().toISOString()
  },
  // 5. MOTOTAXI TORITO (3 PASAJEROS)
  {
    id: 'd0000000-0000-0000-0000-000000000007',
    plate: 'MT-4021',
    brand_model: 'Bajaj Torito 4T Mototaxi Barranca',
    vehicle_type: 'MOTOTAXI',
    seat_layout: [
      { x: 1.5, y: 1, id: 'c1', type: 'driver', label: 'Chofer', status: 'occupied' },
      { x: 1, y: 2, id: 's1', type: 'passenger', label: 'P1 Izq', status: 'free' },
      { x: 1.5, y: 2, id: 's2', type: 'passenger', label: 'P2 Centro', status: 'occupied' },
      { x: 2, y: 2, id: 's3', type: 'passenger', label: 'P3 Der', status: 'free' }
    ],
    capacity: 3,
    roof_rack: false,
    max_cargo_kg: 20,
    cargo_status: 'DISPONIBLE',
    status: 'DISPONIBLE',
    latitude: -10.7505,
    longitude: -77.7635,
    current_heading: 270,
    driver_name: 'Luis Morales Pajuelo',
    driver_phone: '+51 987654329',
    driver_rating: 4.85,
    group_name: 'Asociación de Mototaxis y Colectivos Rápidos Barranca',
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
        [-77.76150, -10.75120], // Base Central Gálvez
        [-77.76020, -10.75160], // Cruce Jr. Lima
        [-77.75920, -10.75100], // Av. Pampa de Lara
        [-77.75780, -10.75040], // Jr. Bolognesi / Primavera
        [-77.75650, -10.74980], // Prolongación Primavera
        [-77.75540, -10.74920], // Entrada Av. Luzuriaga
        [-77.75500, -10.74850]  // Puerta Principal Campus UNAB
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
        [-77.7580, -10.7580],
        [-77.7520, -10.7680],
        [-77.7420, -10.7800],
        [-77.7310, -10.7900],
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
        [-77.7660, -10.7380],
        [-77.7720, -10.7200],
        [-77.7845, -10.6970],
        [-77.8010, -10.6800],
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

  // Modales Sprint 5 y 6 (Cabina Conductor, Chat Grupal, Contactos, Visualizador Vehículo, Creador Rutas)
  const [driverCockpitOpen, setDriverCockpitOpen] = useState<boolean>(false);
  const [groupChatOpen, setGroupChatOpen] = useState<boolean>(false);
  const [contactsOpen, setContactsOpen] = useState<boolean>(false);
  const [routeBuilderOpen, setRouteBuilderOpen] = useState<boolean>(false);
  const [inspectedVehicle, setInspectedVehicle] = useState<any | null>(null);

  // Modales Pre-Lanzamiento (Compartir App / QR, Calificaciones y Reseñas, Fotos Reales, Guía)
  const [shareAppOpen, setShareAppOpen] = useState<boolean>(false);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [reviewTarget, setReviewTarget] = useState<{ id?: string; name?: string; type?: 'CONDUCTOR' | 'EMPRESA' } | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState<boolean>(false);
  const [photoModalTarget, setPhotoModalTarget] = useState<{ title?: string; category?: 'PERFIL' | 'VEHICULO' | 'PARADERO' | 'LLEGADA' } | null>(null);
  const [guideModalOpen, setGuideModalOpen] = useState<boolean>(false);

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
  const watchIdRef = useRef<number | null>(null);

  const currentRole = profile?.active_role || 'PASAJERO';
  const isDriver = currentRole === 'CONDUCTOR_AFILIADO' || currentRole === 'CONDUCTOR_INDEPENDIENTE';

  // Splash de carga inicial con identidad visual oficial de Barranca
  const [isInitialAppLoading, setIsInitialAppLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialAppLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Vehículo dinámico del conductor activo
  const myVehicle = vehicles.find(v => 
    v.driver_name?.toLowerCase().includes((profile?.full_name || '').toLowerCase()) || 
    v.driver_phone === profile?.phone
  ) || vehicles[0];

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

  // Manejador de selección de destino inteligente ("¿A dónde vas?")
  const handleSelectDestination = (destName: string, coords?: { lat: number; lng: number }) => {
    if (coords) {
      setSelectedItem({
        type: 'stop',
        data: {
          id: `dest-${Date.now()}`,
          name: destName,
          latitude: coords.lat,
          longitude: coords.lng,
          type: 'DESTINO',
          address_reference: `Hito provincial: ${destName}`,
          queued_vehicles_count: 0
        }
      });
    }
    setNotificationToast({
      title: 'Destino Seleccionado',
      message: `Cámara fijada en ${destName}. Rutas y unidades activas disponibles.`,
      type: 'info'
    });
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Manejador de punto marcado por el usuario en el mapa (Geocodificación)
  const handlePinLocation = (pin: { lat: number; lng: number; address: string }) => {
    setNotificationToast({
      title: '📍 Punto Fijado en el Mapa',
      message: pin.address,
      type: 'info'
    });
    setTimeout(() => setNotificationToast(null), 3500);
  };

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
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Función: Activar mi Ubicación GPS del Teléfono (Alta Precisión de Hardware en Tiempo Real)
  const handleLocateUser = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setNotificationToast({
        title: '🛰️ Conectando con Satélites GPS...',
        message: 'Detectando posición exacta de tu dispositivo móvil...',
        type: 'info'
      });

      // 1. Obtención inmediata por hardware con máximo rigor de precisión
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          setNotificationToast({
            title: '📍 GPS Exacto Conectado',
            message: `Precisión: ${Math.round(pos.coords.accuracy || 4)} metros. Posición real fijada.`,
            type: 'success'
          });
          setTimeout(() => setNotificationToast(null), 3500);
        },
        (err) => {
          console.warn('GPS error:', err);
          let errorMsg = 'No se pudo obtener la señal GPS exacta.';
          if (err.code === 1) {
            errorMsg = 'Permiso de ubicación denegado. Activa el GPS de tu navegador.';
          } else if (err.code === 2) {
            errorMsg = 'Ubicación no disponible. Verifica que el GPS de tu celular esté encendido.';
          } else if (err.code === 3) {
            errorMsg = 'Tiempo de espera agotado buscando satélites GPS.';
          }
          setNotificationToast({
            title: '⚠️ Aviso de Ubicación',
            message: errorMsg,
            type: 'info'
          });
          setTimeout(() => setNotificationToast(null), 4000);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );

      // 2. Rastreo continuo en vivo (watchPosition) para actualizar cuando el usuario camina o viaja
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          // Filtrar lecturas de baja precisión (>40m) para evitar jitter
          if (!pos.coords.accuracy || pos.coords.accuracy <= 40) {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        (err) => console.warn('watchPosition aviso:', err.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
      );
    } else {
      setNotificationToast({
        title: 'GPS no disponible',
        message: 'Tu navegador no soporta geolocalización satelital.',
        type: 'info'
      });
      setTimeout(() => setNotificationToast(null), 3000);
    }
  };

  // Función: "Me bajo aquí" (Parada solicitada en 1 toque - Requiere usuario registrado a bordo)
  const handleRequestDropoff = async () => {
    if (isGuest) {
      setNotificationToast({
        title: '🔒 Pasajero Registrado',
        message: 'Debes iniciar sesión con tu cuenta de pasajero para accionar el timbre de bajada.',
        type: 'info'
      });
      setAuthModalOpen(true);
      return;
    }

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

  // Manejador de navegación inferior adaptado por rol con protección de invitados
  const handleSelectBottomTab = (tab: 'map' | 'driver' | 'chat' | 'contacts' | 'builder' | 'history') => {
    if ((tab === 'chat' || tab === 'driver' || tab === 'history' || tab === 'builder') && isGuest) {
      setNotificationToast({
        title: '🔒 Acceso Exclusivo de Pasajeros Registrados',
        message: 'Crea tu cuenta o ingresa para acceder a los chats de grupo, coordinación de flota y viajes.',
        type: 'info'
      });
      setAuthModalOpen(true);
      return;
    }

    setActiveMobileTab(tab);
    if (tab === 'driver') setDriverCockpitOpen(true);
    if (tab === 'history') setTripHistoryOpen(true);
    if (tab === 'chat') setGroupChatOpen(true);
    if (tab === 'contacts') setContactsOpen(true);
    if (tab === 'builder') setRouteBuilderOpen(true);
  };

  if (isInitialAppLoading) {
    return (
      <LoadingSplashScreen
        message="Sincronizando satélite y terminales de Barranca..."
        subMessage="Red Provincial: UNAB · Supe · Pativilca · Paramonga"
        fullScreen={true}
      />
    );
  }

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
        onOpenShareApp={() => setShareAppOpen(true)}
        onOpenGuide={() => setGuideModalOpen(true)}
        onOpenReviews={() => setReviewModalOpen(true)}
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
      <div className="z-20 w-full bg-white/95 dark:bg-[#121417]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-between text-xs sm:text-sm">
        {isDriver ? (
          /* Conductor: Acceso rápido a su cabina */
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                Chofer en Servicio · {myVehicle.brand_model} ({myVehicle.plate})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDriverCockpitOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-2xs flex items-center gap-1.5 transition active:scale-95"
            >
              <Car className="w-4 h-4" />
              <span>Abrir Mi Cabina</span>
            </button>
          </div>
        ) : (
          /* Pasajero: Selector de estado contextual adaptativo (4 columnas en móvil, barra completa en PC) */
          <div className="w-full grid grid-cols-4 gap-1.5 sm:flex sm:items-center sm:justify-between sm:gap-2">
            <div className="contents sm:flex sm:items-center sm:gap-2">
              <span className="hidden sm:inline text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                Mi estado:
              </span>
              <button
                type="button"
                onClick={() => setPassengerContextState('CAMINO')}
                className={`py-1.5 px-1 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 flex items-center justify-center gap-1 ${
                  passengerContextState === 'CAMINO'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>🚶</span>
                <span className="hidden sm:inline">En camino</span>
                <span className="sm:hidden text-[11px]">Camino</span>
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
                className={`py-1.5 px-1 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 flex items-center justify-center gap-1 ${
                  passengerContextState === 'ESPERANDO'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>📍</span>
                <span className="hidden sm:inline">Esperando</span>
                <span className="sm:hidden text-[11px]">Espera</span>
              </button>
              <button
                type="button"
                onClick={() => setPassengerContextState('A_BORDO')}
                className={`py-1.5 px-1 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 flex items-center justify-center gap-1 ${
                  passengerContextState === 'A_BORDO'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>🚗</span>
                <span className="hidden sm:inline">A bordo</span>
                <span className="sm:hidden text-[11px]">A bordo</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isGuest) {
                  setNotificationToast({
                    title: '🔒 Pasajero Registrado',
                    message: 'Crea tu cuenta o inicia sesión para pactar carreras seguras con choferes.',
                    type: 'info'
                  });
                  setAuthModalOpen(true);
                  return;
                }
                setSelectedDriverForAgreement(null);
                setAgreementModalOpen(true);
              }}
              className="py-1.5 px-1 sm:px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1 transition active:scale-95"
            >
              <span>🚖</span>
              <span className="hidden sm:inline">Pactar Carrera Expreso</span>
              <span className="sm:hidden text-[11px]">Carrera</span>
            </button>
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
            passengerState={passengerContextState}
            dropoffs={dropoffs}
            onVehicleTap={(v) => setInspectedVehicle(v)}
            onRequestDropoff={handleRequestDropoff}
            onLocateUser={handleLocateUser}
            onPinLocation={handlePinLocation}
          />
        </ErrorBoundary>
      </div>

      {/* Panel Deslizable Bottom Sheet (Paraderos, Vehículos, Rutas y Lugares) */}
      <BottomSheet
        stops={stops}
        vehicles={vehicles}
        routes={routes}
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem}
        onWaitingClick={handleLocateUser}
        onOpenLiveCabin={(v) => setInspectedVehicle(v)}
        onOpenAgreement={(d) => {
          if (isGuest) {
            setNotificationToast({
              title: '🔒 Pasajero Registrado',
              message: 'Crea tu cuenta o inicia sesión para acordar viajes con choferes.',
              type: 'info'
            });
            setAuthModalOpen(true);
            return;
          }
          setSelectedDriverForAgreement(d);
          setAgreementModalOpen(true);
        }}
        onSelectDestination={handleSelectDestination}
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
        driverName={profile?.full_name || myVehicle?.driver_name || 'Jorge Huamán Castillo'}
        vehiclePlate={myVehicle?.plate || 'B1A-789'}
        vehicleModel={myVehicle?.brand_model || 'Toyota Yaris Sedán 2023'}
        vehicleType={myVehicle?.vehicle_type || 'SEDAN'}
        vehicleId={myVehicle?.id}
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
        onOpenAgreement={(driverData) => {
          if (isGuest) {
            setNotificationToast({
              title: '🔒 Pasajero Registrado',
              message: 'Crea tu cuenta o inicia sesión para acordar viajes con choferes.',
              type: 'info'
            });
            setAuthModalOpen(true);
            return;
          }
          setSelectedDriverForAgreement(driverData);
          setAgreementModalOpen(true);
        }}
        onOpenReview={(target) => {
          if (isGuest) {
            setNotificationToast({
              title: '🔒 Pasajero Registrado',
              message: 'Inicia sesión para calificar a conductores y empresas.',
              type: 'info'
            });
            setAuthModalOpen(true);
            return;
          }
          setReviewTarget(target);
          setReviewModalOpen(true);
        }}
        onOpenPhotoUpload={(title, category) => {
          if (isGuest) {
            setNotificationToast({
              title: '🔒 Pasajero Registrado',
              message: 'Inicia sesión para subir fotografías de evidencia.',
              type: 'info'
            });
            setAuthModalOpen(true);
            return;
          }
          setPhotoModalTarget({ title, category });
          setPhotoModalOpen(true);
        }}
        onBoardRequest={() => {
          if (isGuest) {
            setNotificationToast({
              title: '🔒 Pasajero Registrado',
              message: 'Inicia sesión para solicitar abordaje a choferes.',
              type: 'info'
            });
            setAuthModalOpen(true);
            return;
          }
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
        onOpenPhotoUpload={(title, category) => {
          setPhotoModalTarget({ title, category });
          setPhotoModalOpen(true);
        }}
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

      <RideNegotiationModal
        isOpen={agreementModalOpen}
        onClose={() => setAgreementModalOpen(false)}
        initialDriver={selectedDriverForAgreement}
        userCoords={userLocation}
      />

      <SmsFallbackModal
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
      />

      <AnalyticsModal
        isOpen={analyticsModalOpen}
        onClose={() => setAnalyticsModalOpen(false)}
      />

      {/* 7. Modal Compartir App Web y Código QR */}
      <ShareAppModal
        isOpen={shareAppOpen}
        onClose={() => setShareAppOpen(false)}
      />

      {/* 8. Modal Calificar y Reseñas Comunitarias */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        targetId={reviewTarget?.id}
        targetName={reviewTarget?.name}
        targetType={reviewTarget?.type}
      />

      {/* 9. Modal Subir Foto Real (Cámara y Galería con Compresión Liviana) */}
      <PhotoUploadModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title={photoModalTarget?.title}
        category={photoModalTarget?.category}
        onPhotoUploaded={(dataUrl) => {
          setNotificationToast({
            title: 'Fotografía Guardada',
            message: 'La imagen se ha optimizado y guardado con éxito.',
            type: 'success'
          });
          setTimeout(() => setNotificationToast(null), 3000);
        }}
      />

      {/* 10. Modal Guía Interactiva Paso a Paso */}
      <InteractiveGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        section="MAPA"
      />
    </main>
  );
}
