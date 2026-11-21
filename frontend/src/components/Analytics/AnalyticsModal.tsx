'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  BarChart3, 
  Car, 
  MapPin, 
  Route, 
  Star, 
  Download, 
  MessageSquare, 
  CheckCircle2, 
  Users,
  Activity
} from 'lucide-react';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalyticsModal({ isOpen, onClose }: AnalyticsModalProps) {
  const [metrics, setMetrics] = useState<any>({
    total_vehicles: 2,
    active_vehicles: 2,
    total_stops: 5,
    total_queued: 3,
    total_routes: 3,
    avg_rating: 5.0,
    total_agreements: 1,
    sms_queries: 4
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadMetrics() {
      if (!isOpen) return;
      setIsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/analytics/metrics`);
        if (res.ok) {
          const data = await res.json();
          if (data.metrics) {
            setMetrics(data.metrics);
          }
        }
      } catch (e) {
        console.warn('Usando métricas predeterminadas:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/analytics/export`);
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_RutaLink_Barranca_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Error descargando reporte');
    } finally {
      setIsExporting(false);
    }
  };

  const ratingNum = typeof metrics.avg_rating === 'number' 
    ? metrics.avg_rating 
    : parseFloat(String(metrics.avg_rating || '5.0'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16181d] w-full max-w-xl rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Métricas y Analítica de Transporte
              </h2>
              <p className="text-[11px] text-slate-500">
                Provincia de Barranca · UNAB · Corredores Viales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Tarjetas de Métricas Clave (Modo Claro Refinado) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Flota Activa */}
            <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Flota en Servicio
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>{metrics.active_vehicles} / {metrics.total_vehicles}</span>
              </div>
              <span className="text-[10.5px] text-emerald-700 dark:text-emerald-400 font-medium">
                100% unidades activas
              </span>
            </div>

            {/* Paraderos y Cola */}
            <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Paraderos / En Cola
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{metrics.total_queued} autos</span>
              </div>
              <span className="text-[10.5px] text-slate-500">
                {metrics.total_stops} paraderos monitoreados
              </span>
            </div>

            {/* Corredores */}
            <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Rutas Oficiales
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Route className="w-4 h-4 text-blue-600" />
                <span>{metrics.total_routes} Rutas</span>
              </div>
              <span className="text-[10.5px] text-slate-500">
                UNAB, Supe y Paramonga
              </span>
            </div>

            {/* Satisfacción */}
            <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Calificación Choferes
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{isNaN(ratingNum) ? '5.0' : ratingNum.toFixed(1)} / 5.0</span>
              </div>
              <span className="text-[10.5px] text-slate-500">
                Evaluación continua UNAB
              </span>
            </div>

            {/* Consultas SMS */}
            <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Consultas SMS 2G
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>{metrics.sms_queries || 4} SMS</span>
              </div>
              <span className="text-[10.5px] text-purple-700 dark:text-purple-300 font-medium">
                Zonas sin cobertura
              </span>
            </div>

            {/* Acuerdos 1 a 1 */}
            <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Acuerdos Auditados
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span>{metrics.total_agreements || 1} pactos</span>
              </div>
              <span className="text-[10.5px] text-slate-500">
                Salas efímeras 1 a 1
              </span>
            </div>
          </div>

          {/* Resumen de Desempeño Operativo */}
          <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Estado de la Red de Transporte Urbano
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              La red opera bajo cumplimiento del candado horario (TBAC) de 06:00 a 21:00 con validación perimétrica por geovalla a 100 metros en el Paradero Base Central de Barranca. El estrangulamiento de telemetría GPS mantiene la tasa de actualización en 5 segundos reduciendo la latencia de red a menos de 45 ms.
            </p>
          </div>

          {/* Botón de Exportación */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportData}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generando reporte...' : 'Descargar Reporte de Auditoría (JSON / Oficial)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
