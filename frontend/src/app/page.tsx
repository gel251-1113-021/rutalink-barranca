'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import MapWrapper from '../components/Map/MapWrapper';
import BottomSheet from '../components/BottomSheet';
import AuthModal from '../components/AuthModal';
import ProfileModal from '../components/ProfileModal';
import VehicleDesignerModal from '../components/VehicleDesigner/VehicleDesignerModal';
import DispatcherPanel from '../components/Dispatcher/DispatcherPanel';
import GroupManagementModal from '../components/Groups/GroupManagementModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { StopPoint, VehicleUnit } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Compass, MapPin, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const { user, isGuest } = useAuth();

  // Estados de Tema y Modales
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [vehicleDesignerOpen, setVehicleDesignerOpen] = useState<boolean>(false);
  const [dispatcherPanelOpen, setDispatcherPanelOpen] = useState<boolean>(false);
  const [groupManagementOpen, setGroupManagementOpen] = useState<boolean>(false);

  // Estados de Datos
  const [stops, setStops] = useState<StopPoint[]>([]);
  const [vehicles, setVehicles] = useState<VehicleUnit[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ type: 'stop' | 'vehicle'; data: any } | null>(null);

  // Alerta temporal de "Estoy esperando aquí"
  const [waitingAlert, setWaitingAlert] = useState<string | null>(null);

  // Efecto para tema Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Cargar paraderos y vehículos desde la API pública / Supabase
  const loadData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // 1. Cargar paraderos
      const stopsRes = await fetch(`${apiUrl}/api/stops`).catch(() => null);
      if (stopsRes && stopsRes.ok) {
        const data = await stopsRes.json();
        setStops(data.stops || []);
      } else {
        // Fallback directo a Supabase en caso de que backend esté iniciando
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
        }
      }

      // 2. Cargar vehículos
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
      } else {
        setVehicles([
          {
            id: 'd0000000-0000-0000-0000-000000000001',
            plate: 'B1A-789',
            brand_model: 'Toyota Yaris Sedán 2022',
            vehicle_type: 'SEDAN',
            seat_layout: [],
            capacity: 4,
            roof_rack: true,
            max_cargo_kg: 40,
            cargo_status: 'VACIO',
            status: 'DISPONIBLE',
            latitude: -10.7500,
            longitude: -77.7580,
            driver_name: 'Jorge Huamán Castillo',
            driver_rating: 5.0,
            last_location_update: new Date().toISOString()
          },
          {
            id: 'd0000000-0000-0000-0000-000000000002',
            plate: 'C3M-456',
            brand_model: 'Chevrolet Sail Sedán',
            vehicle_type: 'SEDAN',
            seat_layout: [],
            capacity: 4,
            roof_rack: false,
            max_cargo_kg: 30,
            cargo_status: 'DISPONIBLE',
            status: 'DISPONIBLE',
            latitude: -10.7490,
            longitude: -77.7520,
            driver_name: 'Walter Rosales Díaz',
            driver_rating: 4.9,
            last_location_update: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('[Data Fetch Error]:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleWaitingClick = () => {
    if (isGuest) {
      setAuthModalOpen(true);
      return;
    }
    setWaitingAlert('¡Señal temporal activada! Los choferes de la zona ven tu pin por 15 minutos.');
    setTimeout(() => setWaitingAlert(null), 4000);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-100 dark:bg-[#0c0d0f]">
      {/* Barra de Navegación Superior */}
      <Header
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenVehicleDesigner={() => setVehicleDesignerOpen(true)}
        onOpenDispatcherPanel={() => setDispatcherPanelOpen(true)}
        onOpenGroupManagement={() => setGroupManagementOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Alerta flotante de Confirmación */}
      {waitingAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-emerald-600 text-white text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{waitingAlert}</span>
        </div>
      )}

      {/* Mapa Interactivo de Barranca */}
      <div className="relative flex-1 w-full h-full">
        <ErrorBoundary>
          <MapWrapper
            stops={stops}
            vehicles={vehicles}
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem}
            darkMode={darkMode}
          />
        </ErrorBoundary>
      </div>

      {/* Bottom Sheet Deslizable con Niveles de Información */}
      <BottomSheet
        stops={stops}
        vehicles={vehicles}
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem}
        onWaitingClick={handleWaitingClick}
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

      {/* Modales Especializados Sprint 2 */}
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
    </main>
  );
}
