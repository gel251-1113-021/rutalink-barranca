'use client';

import React from 'react';
import { X, Phone, MessageCircle, Star, Users, MapPin, CheckCircle, Navigation } from 'lucide-react';
import VehicleDigitalModel, { VehicleCategoryIcon } from '../Branding/VehicleModels';

interface Seat {
  id: string;
  label: string;
  type: 'driver' | 'passenger';
  status: 'occupied' | 'free';
}

interface VehicleInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: {
    id: string;
    plate: string;
    brand_model: string;
    vehicle_type?: string;
    driver_name?: string;
    driver_phone?: string;
    driver_rating?: number | string;
    status: string;
    latitude?: number;
    longitude?: number;
    capacity?: number;
    seat_layout?: Seat[];
    route_name?: string;
  } | null;
  onBoardRequest?: (vehicleId: string) => void;
  onOpenAgreement?: (driverData: any) => void;
  onOpenReview?: (target: { id: string; name: string; type: 'CONDUCTOR' | 'EMPRESA' }) => void;
  onOpenPhotoUpload?: (title: string, category: 'VEHICULO' | 'PARADERO' | 'LLEGADA') => void;
  userRole?: string;
}

export default function VehicleInspectModal({
  isOpen,
  onClose,
  vehicle,
  onBoardRequest,
  onOpenAgreement,
  onOpenReview,
  onOpenPhotoUpload,
  userRole = 'PASAJERO'
}: VehicleInspectModalProps) {
  if (!isOpen || !vehicle) return null;

  const ratingNum = typeof vehicle.driver_rating === 'number'
    ? vehicle.driver_rating
    : parseFloat(String(vehicle.driver_rating || '5.0'));

  const seats: Seat[] = Array.isArray(vehicle.seat_layout) && vehicle.seat_layout.length > 0
    ? vehicle.seat_layout
    : [
        { id: 'c1', label: 'Conductor', type: 'driver', status: 'occupied' },
        { id: 's1', label: 'Copiloto', type: 'passenger', status: 'free' },
        { id: 's2', label: 'Atrás Izq', type: 'passenger', status: 'occupied' },
        { id: 's3', label: 'Atrás Centro', type: 'passenger', status: 'free' },
        { id: 's4', label: 'Atrás Der', type: 'passenger', status: 'free' }
      ];

  const passengerSeats = seats.filter(s => s.type !== 'driver');
  const occupiedCount = passengerSeats.filter(s => s.status === 'occupied').length;
  const freeCount = passengerSeats.length - occupiedCount;

  const rawPlate = (vehicle.plate || '').trim();
  const cleanPlate = rawPlate.replace(/\s+/g, '').toUpperCase();
  const phone = vehicle.driver_phone ? vehicle.driver_phone.trim() : '';
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const waLink = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('51') ? cleanPhone : '51' + cleanPhone}?text=${encodeURIComponent(`Hola, veo tu vehículo ${vehicle.brand_model} (${cleanPlate}) en RutaLink Barranca.`)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#13161a] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Cabecera con Placa Destacada y Anti-Desborde Inviolable */}
        <div className="px-3.5 sm:px-5 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-base sm:text-lg shrink-0">
              <VehicleCategoryIcon category={vehicle.vehicle_type || 'SEDAN'} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block truncate leading-none">
                  Vehículo en Vivo
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold truncate leading-tight mt-0.5 text-white">
                {vehicle.brand_model}
              </h2>
            </div>
          </div>

          {/* Placa oficial peruana blindada sin corte vertical jamás */}
          <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
            <div 
              title="Placa oficial registrada"
              className="bg-white text-slate-950 border border-slate-300 rounded-lg px-2 py-1 shadow-sm flex items-center gap-1 select-none shrink-0 whitespace-nowrap"
            >
              <span className="text-[10px] text-red-600 font-black leading-none select-none">🇵🇪</span>
              <span className="font-mono text-xs sm:text-sm font-black whitespace-nowrap tracking-wider text-slate-950 leading-none">
                {cleanPlate}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/15 hover:bg-white/25 transition text-white shrink-0 active:scale-95 flex items-center justify-center"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Contenido Visual con Scroll Táctil */}
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain touch-scroll space-y-4">
          
          {/* 1. Maqueta Visual 3D / Isométrica del Vehículo */}
          <div className="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-[#1b1f26] dark:to-[#14171d] p-4 rounded-3xl border border-slate-300 dark:border-slate-700 text-center relative overflow-hidden shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-left">
                Modelo Virtual e Interiores
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 whitespace-nowrap">
                {freeCount} de {passengerSeats.length} asientos libres
              </span>
            </div>

            {/* Modelo Digital SVG Vectorial */}
            <div className="py-2 flex justify-center">
              <VehicleDigitalModel
                category={vehicle.vehicle_type || 'SEDAN'}
                seats={seats}
                interactive={false}
              />
            </div>
          </div>

          {/* 2. Datos del Conductor y Estado */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#181c22] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Conductor Asignado</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {vehicle.driver_name || 'Jorge Huamán Castillo'}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{isNaN(ratingNum) ? '5.0' : ratingNum.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500">Estado actual:</span>
              <span className={`font-bold flex items-center gap-1 ${
                vehicle.status === 'DISPONIBLE' ? 'text-emerald-600' : 'text-blue-600'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                {vehicle.status === 'DISPONIBLE' ? 'Disponible para abordar' : 'En ruta (con pasajeros)'}
              </span>
            </div>
          </div>

          {/* 3. Botones de Acción Directa con el Conductor (1 toque) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Llamar */}
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Phone className="w-4 h-4" />
                <span>Llamar Chofer</span>
              </a>
            ) : (
              <div className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed">
                <Phone className="w-4 h-4" />
                <span>Sin Teléfono</span>
              </div>
            )}

            {/* WhatsApp */}
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            ) : (
              <div className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed">
                <MessageCircle className="w-4 h-4" />
                <span>Sin WhatsApp</span>
              </div>
            )}
          </div>

          {/* 4. Fotos y Calificaciones Reales */}
          <div className={`grid ${userRole === 'PASAJERO' ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
            {/* Ver / Subir Foto del Vehículo (Solo conductores y administradores) */}
            {userRole !== 'PASAJERO' && (
              <button
                type="button"
                onClick={() => {
                  if (onOpenPhotoUpload) {
                    onOpenPhotoUpload(`Fotografía del Vehículo ${cleanPlate}`, 'VEHICULO');
                  }
                }}
                className="py-2 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 transition"
              >
                <span>📷</span>
                <span>Foto de la Unidad</span>
              </button>
            )}

            {/* Dejar Reseña */}
            <button
              type="button"
              onClick={() => {
                if (onOpenReview) {
                  onOpenReview({
                    id: vehicle.id,
                    name: `${vehicle.driver_name || 'Conductor'} (${vehicle.plate})`,
                    type: 'CONDUCTOR'
                  });
                }
              }}
              className="py-2 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-300 dark:border-amber-800 transition"
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Calificar Chofer</span>
            </button>
          </div>

          {/* Pactar Carrera Expreso */}
          {onOpenAgreement && (
            <button
              type="button"
              onClick={() => {
                onOpenAgreement({
                  id: vehicle.id,
                  name: vehicle.driver_name || 'Conductor Autorizado',
                  plate: vehicle.plate,
                  brandModel: vehicle.brand_model,
                  rating: ratingNum,
                  phone: vehicle.driver_phone || ''
                });
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
            >
              <span>🤝</span>
              <span>Pactar Carrera Expreso con este Chofer</span>
            </button>
          )}

          {/* Botón de abordaje "Me subo aquí" */}
          <button
            type="button"
            onClick={() => {
              if (onBoardRequest) onBoardRequest(vehicle.id);
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-2xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            <span>Esperar este carro en mi posición</span>
          </button>

        </div>

      </div>
    </div>
  );
}
