'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { StopPoint, VehicleUnit, RouteCorridor } from '../../types';

interface DropoffPoint {
  id: string;
  latitude: number;
  longitude: number;
  landmark_reference: string;
  passenger_name?: string;
}

interface MapWrapperProps {
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

// Carga dinámica del mapa deshabilitando SSR para evitar incompatibilidad de window en Node.js
const DynamicBarrancaMap = dynamic(() => import('./BarrancaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#121417] text-slate-400 gap-3">
      <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-400">
        Cargando cartografía urbana de Barranca y UNAB...
      </span>
    </div>
  ),
});

export default function MapWrapper(props: MapWrapperProps) {
  return <DynamicBarrancaMap {...props} />;
}
