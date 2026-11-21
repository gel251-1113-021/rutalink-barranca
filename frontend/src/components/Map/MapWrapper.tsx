'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { StopPoint, VehicleUnit } from '../../types';

interface MapWrapperProps {
  stops: StopPoint[];
  vehicles: VehicleUnit[];
  selectedItem: { type: 'stop' | 'vehicle'; data: any } | null;
  onSelectItem: (item: { type: 'stop' | 'vehicle'; data: any } | null) => void;
  darkMode: boolean;
}

// Carga dinámica del mapa deshabilitando SSR para evitar incompatibilidad de window en Node.js
const DynamicBarrancaMap = dynamic(() => import('./BarrancaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-[#121417] text-slate-400 gap-3">
      <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-medium tracking-wide">Cargando cartografía de Barranca y UNAB...</span>
    </div>
  ),
});

export default function MapWrapper(props: MapWrapperProps) {
  return <DynamicBarrancaMap {...props} />;
}
