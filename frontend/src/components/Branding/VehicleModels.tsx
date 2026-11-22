'use client';

import React from 'react';
import RealisticVehicleSVG from './RealisticVehicleSVG';

export type VehicleCategory = 'MOTOTAXI' | 'SEDAN' | 'STATION_WAGON' | 'SUV' | 'MINIVAN' | 'COMBI' | 'BUS';

interface Seat {
  id: string;
  label: string;
  type: 'driver' | 'passenger';
  status: 'occupied' | 'free';
}

interface VehicleVisualizerProps {
  category: VehicleCategory | string;
  seats: Seat[];
  onToggleSeat?: (seatId: string) => void;
  interactive?: boolean;
  className?: string;
  plate?: string;
}

export function VehicleCategoryIcon({ category, className = 'w-5 h-5' }: { category: string; className?: string }) {
  const norm = (category || '').toUpperCase();
  if (norm.includes('BUS')) {
    return <span className="text-base" title="Bus Universitario UNAB">🚌</span>;
  }
  if (norm.includes('MOTO') || norm === 'MOTOTAXI') {
    return <span className="text-base" title="Mototaxi Torito">🛺</span>;
  }
  if (norm.includes('MINIVAN')) {
    return <span className="text-base" title="Miniván">🚐</span>;
  }
  if (norm.includes('COMBI') || norm.includes('HIACE')) {
    return <span className="text-base" title="Combi Interdistrital">🚍</span>;
  }
  if (norm.includes('STATION') || norm.includes('WAGON') || norm.includes('PROBOX') || norm.includes('SUV')) {
    return <span className="text-base" title="Station Wagon / Probox">🚙</span>;
  }
  return <span className="text-base" title="Auto Sedán">🚗</span>;
}

// Visualizador Digital Integral con Siluetas Realistas Vectoriales SVG de Barranca
export default function VehicleDigitalModel({
  category = 'SEDAN',
  seats = [],
  onToggleSeat,
  interactive = false,
  className = '',
  plate
}: VehicleVisualizerProps) {
  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      <RealisticVehicleSVG
        category={category}
        seats={seats}
        onToggleSeat={onToggleSeat}
        interactive={interactive}
        plate={plate}
        className="w-full max-w-[270px]"
      />
    </div>
  );
}
