'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Calendar, Star, DollarSign, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TripItem {
  id: string;
  origin_name: string;
  destination_name: string;
  agreed_price: number;
  status: string;
  rating?: number;
  review_comment?: string;
  created_at: string;
  driver_name?: string;
  passenger_name?: string;
  vehicle_plate?: string;
  vehicle_model?: string;
}

interface TripHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userRole?: string;
}

export default function TripHistoryModal({
  isOpen,
  onClose,
  userId = 'a0000000-0000-0000-0000-000000000005',
  userRole = 'PASAJERO'
}: TripHistoryModalProps) {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<TripItem | null>(null);

  const isDriver = userRole === 'CONDUCTOR_AFILIADO' || userRole === 'CONDUCTOR_INDEPENDIENTE';

  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/trips/history/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setTrips(data.trips || []);
        }
      } catch (err) {
        console.error('Error al cargar historial:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  // Cálculos estadísticos para el chofer
  const totalEarned = trips.reduce((acc, t) => acc + Number(t.agreed_price || 0), 0);
  const totalCompleted = trips.filter(t => t.status === 'FINALIZADO').length;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Fecha reciente';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#13161a] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Cabecera */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                {isDriver ? 'Historial de Servicios del Conductor' : 'Mis Viajes Realizados'}
              </h2>
              <p className="text-xs text-blue-100">Registro auditado de traslados en Barranca</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen Operativo para Conductor */}
        {isDriver && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900 grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 bg-white dark:bg-[#181c22] rounded-2xl border border-blue-200 dark:border-blue-800 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Recaudación Total</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                S/. {totalEarned.toFixed(2)}
              </span>
            </div>
            <div className="p-2.5 bg-white dark:bg-[#181c22] rounded-2xl border border-blue-200 dark:border-blue-800 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Servicios Completados</span>
              <span className="text-base font-black text-blue-600 dark:text-blue-400">
                {totalCompleted} viajes
              </span>
            </div>
          </div>
        )}

        {/* Lista de Viajes */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Cargando historial de traslados...
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Aún no tienes viajes registrados.
            </div>
          ) : (
            trips.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181c22] shadow-2xs hover:border-blue-300 dark:hover:border-slate-700 transition space-y-2.5"
              >
                {/* Origen y Destino */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      <span className="truncate">{t.origin_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                      <span className="truncate">{t.destination_name}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      S/. {Number(t.agreed_price).toFixed(2)}
                    </span>
                    <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                      ✓ {t.status}
                    </span>
                  </div>
                </div>

                {/* Detalles del Chofer / Auto y Fecha */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2 truncate">
                    <span>{isDriver ? `Pasajero: ${t.passenger_name || 'Compañero'}` : `Chofer: ${t.driver_name || 'Afiliado'}`}</span>
                    {t.vehicle_plate && (
                      <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">
                        {t.vehicle_plate}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0">{formatDate(t.created_at)}</span>
                </div>

                {/* Calificación y comentario */}
                {t.rating && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                    <span>{'★'.repeat(t.rating)}</span>
                    {t.review_comment && (
                      <span className="text-[10px] text-slate-500 font-normal italic truncate">
                        «{t.review_comment}»
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pie */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111317] text-center">
          <p className="text-[11px] text-slate-500">
            Comprobantes electrónicos y registro seguro en la red RutaLink Barranca
          </p>
        </div>

      </div>
    </div>
  );
}
