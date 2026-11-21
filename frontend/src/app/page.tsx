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
import { ErrorBoundary } from '../components/ErrorBoundary';
import { StopPoint, VehicleUnit, RouteCorridor } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { offlineStore } from '../lib/offlineStore';
import { Compass, MapPin, CheckCircle2, BellRing, Route } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function HomePage() {
  const { user, profile, isGuest } = useAuth();

  // Estados de Tema y Modales (Light Mode por defecto para estética blanco, azul y negro)
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [vehicleDesignerOpen, setVehicleDesignerOpen] = useState<boolean>(false);
  const [dispatcherPanelOpen, setDispatcherPanelOpen] = useState<boolean>(false);
  const [groupManagementOpen, setGroupManagementOpen] = useState<boolean>(false);

  // Modales Especializados Sprint 3
  const [agreementModalOpen, setAgreementModalOpen] = useState<boolean>(false);
  const [selectedDriverForAgreement, setSelectedDriverForAgreement] = useState<any | null>(null);
  const [cabinModalOpen, setCabinModalOpen] = useState<boolean>(false);
  const [selectedVehicleForCabin, setSelectedVehicleForCabin] = useState<VehicleUnit | null>(null);

  // Modales Especializados Sprint 4 (Off-Grid, SMS Fallback y Analítica)
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [smsModalOpen, setSmsModalOpen] = useState<boolean>(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState<boolean>(false);

  // Estados de Datos Cartográficos y Viales
  const [stops, setStops] = useState<StopPoint[]>([]);
  const [vehicles, setVehicles] = useState<VehicleUnit[]>([]);
  const [routes, setRoutes] = useState<RouteCorridor[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ type: 'stop' | 'vehicle' | 'route'; data: any } | null>(null);

  // Señal en tiempo real de pasajero esperando
  const [passengerSignal, setPassengerSignal] = useState<{ lat: number; lng: number; note?: string } | null>(null);
  const [notificationToast, setNotificationToast] = useState<{ title: string; message: string; type?: 'info' | 'success' } | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // Efecto para tema Dark Mode / Light Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Detector de estado de red (Online / Offline) y telemetría de resiliencia (Sprint 4)
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const handleOnline = () => {
      setIsOffline(false);
      fetch(`${apiUrl}/api/analytics/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          eventType: 'ONLINE_RESTORED',
          networkType: '4G',
          latencyMs: 38
        })
      }).catch(() => {});
    };

    const handleOffline = () => {
      setIsOffline(true);
      fetch(`${apiUrl}/api/analytics/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          eventType: 'OFFLINE_DETECTED',
          networkType: 'OFFLINE',
          latencyMs: 0
        })
      }).catch(() => {});
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }

    setLastSyncTime(offlineStore.getLastSync());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.id]);

  // Cargar datos (con sincronización en caché local para soporte Off-Grid)
  const loadData = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      // 1. Cargar Paraderos
      const stopsRes = await fetch(`${apiUrl}/api/stops`).catch(() => null);
      if (stopsRes && stopsRes.ok) {
        const data = await stopsRes.json();
        const loadedStops = data.stops || [];
        setStops(loadedStops);
        offlineStore.saveStops(loadedStops);
        setLastSyncTime(new Date().toISOString());
      } else {
        // Fallback a caché local o Supabase directo
        const cachedStops = offlineStore.getStops();
        if (cachedStops.length > 0) {
          setStops(cachedStops);
        } else {
          const { data: stopsData } = await supabase
            .from('stops')
            .select(`
              id, name, type, address_reference, group_id,
              stop_live_status (queued_vehicles_count, status_note, photo_url, updated_at)
            `);
          if (stopsData) {
            const coordsMap: Record<string, [number, number]> = {
              'c0000000-0000-0000-0000-000000000001': [-10.7512, -77.7615],
              'c0000000-0000-0000-0000-000000000002': [-10.7485, -77.7550],
              'c0000000-0000-0000-0000-000000000003': [-10.7980, -77.7125],
              'c0000000-0000-0000-0000-000000000004': [-10.6970, -77.7845],
              'c0000000-0000-0000-0000-000000000005': [-10.6720, -77.8150]
            };
            const mappedStops: StopPoint[] = stopsData.map((s: any) => {
              const live = s.stop_live_status?.[0] || {};
              const coords = coordsMap[s.id] || [-10.7512, -77.7615];
              return {
                id: s.id,
                name: s.name,
                type: s.type,
                latitude: coords[0],
                longitude: coords[1],
                address_reference: s.address_reference,
                queued_vehicles_count: live.queued_vehicles_count || 0,
                status_note: live.status_note,
                photo_url: live.photo_url,
                last_status_update: live.updated_at
              };
            });
            setStops(mappedStops);
            offlineStore.saveStops(mappedStops);
          }
        }
      }

      // 2. Cargar Vehículos
      const vehiclesRes = await fetch(`${apiUrl}/api/vehicles`).catch(() => null);
      if (vehiclesRes && vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        const mappedVehicles: VehicleUnit[] = (data.vehicles || []).map((v: any) => ({
          ...v,
          latitude: Number(v.latitude),
          longitude: Number(v.longitude),
          driver_rating: parseFloat(String(v.driver_rating || '5.0')) || 5.0
        }));
        setVehicles(mappedVehicles);
        offlineStore.saveVehicles(mappedVehicles);
      } else {
        const cachedVehicles = offlineStore.getVehicles();
        if (cachedVehicles.length > 0) {
          setVehicles(cachedVehicles);
        }
      }

      // 3. Cargar Rutas Viales OSRM / GeoJSON
      const routesRes = await fetch(`${apiUrl}/api/routes`).catch(() => null);
      if (routesRes && routesRes.ok) {
        const routesData = await routesRes.json();
        const loadedRoutes = routesData.routes || [];
        setRoutes(loadedRoutes);
        offlineStore.saveRoutes(loadedRoutes);
      } else {
        const cachedRoutes = offlineStore.getRoutes();
        if (cachedRoutes.length > 0) {
          setRoutes(cachedRoutes);
        } else {
          // Fallback con los 3 corredores oficiales
          const defaultRoutes: RouteCorridor[] = [
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
                ] as [number, number][]
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
                ] as [number, number][]
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
                ] as [number, number][]
              }
            }
          ];
          setRoutes(defaultRoutes);
          offlineStore.saveRoutes(defaultRoutes);
        }
      }
    } catch (err) {
      console.error('[LoadData Exception]:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sincronización en Vivo mediante Socket.io (Sprint 3 & 4)
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    // 1. Escuchar actualización continua de GPS de vehículos
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

    // 2. Escuchar cambios de estado de cabina (asientos ocupados/libres)
    socket.on('cabin_seat_updated', (data: { vehicleId: string; seatLayout: any[] }) => {
      setVehicles(prev => prev.map(v => {
        if (v.id === data.vehicleId) {
          return { ...v, seat_layout: data.seatLayout };
        }
        return v;
      }));

      setSelectedVehicleForCabin(prev => {
        if (prev && prev.id === data.vehicleId) {
          return { ...prev, seat_layout: data.seatLayout };
        }
        return prev;
      });
    });

    // 3. Escuchar actualizaciones de cola de paraderos
    socket.on('stop_live_updated', (data: { stopId: string; queuedCount: number; statusNote?: string; photoUrl?: string }) => {
      setStops(prev => prev.map(s => {
        if (s.id === data.stopId) {
          return {
            ...s,
            queued_vehicles_count: data.queuedCount,
            status_note: data.statusNote ?? s.status_note,
            photo_url: data.photoUrl ?? s.photo_url,
            last_status_update: new Date().toISOString()
          };
        }
        return s;
      }));
    });

    // 4. Escuchar señal de "Pasajero esperando"
    socket.on('passenger_waiting_signal', (data: { latitude: number; longitude: number; note?: string; passengerName?: string }) => {
      setPassengerSignal({
        lat: Number(data.latitude),
        lng: Number(data.longitude),
        note: data.note || 'Pasajero solicitando unidad'
      });

      const passengerTitle = data.passengerName || 'Pasajero';
      setNotificationToast({
        title: 'Señal en Ruta',
        message: `${passengerTitle} esperando cerca al corredor vial`,
        type: 'info'
      });

      // Si el usuario actual es chofer activo, activar síntesis de voz (Web Speech API)
      const currentRole = profile?.active_role;
      if (currentRole === 'CONDUCTOR_AFILIADO' || currentRole === 'CONDUCTOR_INDEPENDIENTE') {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            const utterance = new SpeechSynthesisUtterance('Nuevo pasajero esperando en la ruta.');
            utterance.lang = 'es-PE';
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
          } catch (e) {
            console.warn('[SpeechSynthesis Exception]:', e);
          }
        }
      }

      setTimeout(() => {
        setNotificationToast(null);
      }, 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, [profile?.active_role]);

  // Manejador de señal de abordaje ("Esperar aquí")
  const handleWaitingClick = () => {
    if (isGuest) {
      setAuthModalOpen(true);
      return;
    }

    const currentLat = -10.7512;
    const currentLng = -77.7615;

    setPassengerSignal({
      lat: currentLat,
      lng: currentLng,
      note: 'Tu señal de abordaje está activa por 15 minutos.'
    });

    // Emitir señal al servidor WebSocket para difusión a choferes
    if (socketRef.current) {
      socketRef.current.emit('passenger_waiting_signal', {
        userId: user?.id,
        passengerName: profile?.full_name || user?.email?.split('@')[0],
        latitude: currentLat,
        longitude: currentLng,
        note: 'Esperando unidad para abordaje'
      });
    }

    setNotificationToast({
      title: '¡Señal Activada!',
      message: 'Los choferes en circulación han sido notificados.',
      type: 'success'
    });
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Apertura de modales especializados
  const handleOpenLiveCabin = (vehicle: VehicleUnit) => {
    setSelectedVehicleForCabin(vehicle);
    setCabinModalOpen(true);
  };

  const handleOpenAgreement = (driverData: any) => {
    setSelectedDriverForAgreement(driverData);
    setAgreementModalOpen(true);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-[#0c0d0f]">
      {/* Barra de Navegación Superior con Soporte de Métricas y SMS Fallback */}
      <Header
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenVehicleDesigner={() => setVehicleDesignerOpen(true)}
        onOpenDispatcherPanel={() => setDispatcherPanelOpen(true)}
        onOpenGroupManagement={() => setGroupManagementOpen(true)}
        onOpenSmsFallback={() => setSmsModalOpen(true)}
        onOpenAnalytics={() => setAnalyticsModalOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        isOffline={isOffline}
      />

      {/* Banner de Modo Fuera de Línea (Sprint 4) */}
      <OfflineBanner
        isOffline={isOffline}
        onOpenSms={() => setSmsModalOpen(true)}
        lastSyncTime={lastSyncTime}
      />

      {/* Notificación Toast Flotante */}
      {notificationToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-[#16181d] text-slate-900 dark:text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-200">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
            <BellRing className="w-3.5 h-3.5" />
          </div>
          <div>
            <strong className="block text-[11px] font-bold text-blue-600">{notificationToast.title}</strong>
            <span className="text-[11px] text-slate-600 dark:text-slate-300">{notificationToast.message}</span>
          </div>
        </div>
      )}

      {/* Mapa Interactivo de la Provincia de Barranca */}
      <div className="relative flex-1 w-full h-full">
        <ErrorBoundary>
          <MapWrapper
            stops={stops}
            vehicles={vehicles}
            routes={routes}
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem}
            darkMode={darkMode}
            passengerSignal={passengerSignal}
          />
        </ErrorBoundary>
      </div>

      {/* Bottom Sheet Deslizable con Buscador Inteligente y Modos de Revelación */}
      <BottomSheet
        stops={stops}
        vehicles={vehicles}
        routes={routes}
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem}
        onWaitingClick={handleWaitingClick}
        onOpenLiveCabin={handleOpenLiveCabin}
        onOpenAgreement={handleOpenAgreement}
      />

      {/* Modales de Autenticación y Perfil */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Modales Operativos Sprint 2 */}
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

      {/* Modales Especializados Sprint 3 */}
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

      {/* Modales Especializados Sprint 4 */}
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
