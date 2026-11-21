'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  BarChart3, 
  Car, 
  MapPin, 
  Route, 
  Star, 
  Printer, 
  FileDown, 
  CheckCircle2, 
  Users, 
  Building2, 
  UserCheck, 
  Clock, 
  TrendingUp, 
  Calendar,
  ShieldCheck
} from 'lucide-react';
import RutaLinkLogo from '../Branding/RutaLinkLogo';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalyticsModal({ isOpen, onClose }: AnalyticsModalProps) {
  // Selector de ámbito del reporte
  const [reportScope, setReportScope] = useState<'GENERAL' | 'GRUPO' | 'CONDUCTOR'>('GENERAL');
  
  // Selectores específicos
  const [selectedGroup, setSelectedGroup] = useState('Comité 1: Barranca - Supe - UNAB');
  const [selectedDriver, setSelectedDriver] = useState('Jorge Huamán Castillo (B1A-789)');

  const [isLoading, setIsLoading] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Imprimir o Guardar en PDF directamente
  const handlePrintToPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#14161a] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabecera Principal */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">
                Centro de Reportes y Estadísticas de Movilidad
              </h2>
              <p className="text-[11px] text-blue-100">
                Informes oficiales para administración, comités y conductores · Exportable a PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Ámbito: General | Por Grupo | Por Conductor */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#181a20] shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setReportScope('GENERAL')}
            className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-2 ${
              reportScope === 'GENERAL'
                ? 'border-blue-600 text-blue-600 bg-white dark:bg-[#14161a]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>1. Reporte General Provincial</span>
          </button>

          <button
            type="button"
            onClick={() => setReportScope('GRUPO')}
            className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-2 ${
              reportScope === 'GRUPO'
                ? 'border-blue-600 text-blue-600 bg-white dark:bg-[#14161a]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>2. Reporte por Comité / Empresa</span>
          </button>

          <button
            type="button"
            onClick={() => setReportScope('CONDUCTOR')}
            className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-2 ${
              reportScope === 'CONDUCTOR'
                ? 'border-blue-600 text-blue-600 bg-white dark:bg-[#14161a]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>3. Reporte por Conductor</span>
          </button>
        </div>

        {/* Contenido del Reporte */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4" id="printable-report-area">
          
          {/* Membrete Oficial del Reporte para Pantalla e Impresión */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#191d24] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RutaLinkLogo size="sm" showSubtitle={false} />
              <div className="border-l border-slate-300 dark:border-slate-700 pl-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Documento Oficial</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {reportScope === 'GENERAL' && 'Informe General de Operaciones Provinciales'}
                  {reportScope === 'GRUPO' && `Informe de Rendimiento: ${selectedGroup}`}
                  {reportScope === 'CONDUCTOR' && `Informe de Desempeño: ${selectedDriver}`}
                </span>
              </div>
            </div>
            <div className="text-right text-[10.5px] text-slate-500 font-mono">
              <span>{new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="block">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* 1. VISTA REPORTE GENERAL PROVINCIAL */}
          {reportScope === 'GENERAL' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Tarjetas Principales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60">
                  <span className="text-[10px] uppercase font-bold text-blue-600 block mb-0.5">Pasajeros Hoy</span>
                  <span className="text-xl font-extrabold text-blue-950 dark:text-blue-100">1,428</span>
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold block mt-1">+12% vs ayer</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-0.5">Puntualidad</span>
                  <span className="text-xl font-extrabold text-emerald-950 dark:text-emerald-100">98.2%</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold block mt-1">Salidas a tiempo</span>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 block mb-0.5">Flota en Ruta</span>
                  <span className="text-xl font-extrabold text-indigo-950 dark:text-indigo-100">42</span>
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold block mt-1">Vehículos activos</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block mb-0.5">Satisfacción</span>
                  <span className="text-xl font-extrabold text-amber-950 dark:text-amber-100 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    4.9 / 5.0
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold block mt-1">380 opiniones</span>
                </div>
              </div>

              {/* Horas Pico y Distribución */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Horarios de Mayor Demanda de Pasajeros
                </span>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-white dark:bg-[#1e222a] border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold block">Mañana (UNAB / Trabajo)</span>
                    <span className="font-black text-xs text-blue-600">07:00 - 08:30 AM</span>
                    <span className="text-[9.5px] text-slate-500 block">480 pasajeros/hora</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-[#1e222a] border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold block">Mediodía (Almuerzo)</span>
                    <span className="font-black text-xs text-indigo-600">12:30 - 02:00 PM</span>
                    <span className="text-[9.5px] text-slate-500 block">310 pasajeros/hora</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-[#1e222a] border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold block">Tarde / Noche (Retorno)</span>
                    <span className="font-black text-xs text-emerald-600">06:00 - 08:30 PM</span>
                    <span className="text-[9.5px] text-slate-500 block">425 pasajeros/hora</span>
                  </div>
                </div>
              </div>

              {/* Tabla de Corredores de Transporte */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                <div className="bg-slate-100 dark:bg-[#1e222a] px-3.5 py-2 font-bold text-slate-700 dark:text-slate-300">
                  Resumen por Rutas Principales
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="px-3.5 py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Ruta Troncal: Barranca Centro ➔ Campus UNAB</span>
                      <span className="text-[10.5px] text-slate-500">Tarifa oficial S/. 3.50 · 620 viajes</span>
                    </div>
                    <span className="font-bold text-emerald-600">Alta Demanda (96% ocupación)</span>
                  </div>
                  <div className="px-3.5 py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Ruta Interdistrital: Barranca ➔ Supe Pueblo</span>
                      <span className="text-[10.5px] text-slate-500">Tarifa oficial S/. 4.00 · 410 viajes</span>
                    </div>
                    <span className="font-bold text-blue-600">Demanda Regular (84% ocupación)</span>
                  </div>
                  <div className="px-3.5 py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Ruta Norte: Barranca ➔ Pativilca ➔ Paramonga</span>
                      <span className="text-[10.5px] text-slate-500">Tarifa oficial S/. 4.50 · 398 viajes</span>
                    </div>
                    <span className="font-bold text-indigo-600">Demanda Regular (80% ocupación)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. VISTA REPORTE POR COMITÉ / EMPRESA */}
          {reportScope === 'GRUPO' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Selector de Comité */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Seleccionar Empresa o Comité:
                </label>
                <select
                  value={selectedGroup}
                  onChange={e => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-300 dark:border-slate-700 font-bold"
                >
                  <option value="Comité 1: Barranca - Supe - UNAB">Comité 1: Barranca - Supe - UNAB (Oficial)</option>
                  <option value="Comunidad UNAB - Viajes Compartidos">Comunidad UNAB - Viajes Compartidos</option>
                  <option value="Expreso Pativilca - Paramonga">Expreso Pativilca - Paramonga</option>
                  <option value="Mototaxis y Colectivos Urbanos">Mototaxis y Colectivos Urbanos</option>
                </select>
              </div>

              {/* Ficha del Comité */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Flota Afiliada</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">18 Autos</span>
                  <span className="text-[10.5px] text-emerald-600 font-medium block mt-0.5">16 en servicio</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Viajes del Mes</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">2,410</span>
                  <span className="text-[10.5px] text-blue-600 font-medium block mt-0.5">99.1% completados</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Ocupación Promedio</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">3.6 / 4</span>
                  <span className="text-[10.5px] text-slate-500 font-medium block mt-0.5">Asientos por viaje</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-[#181a20] rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Cumplimiento del Reglamento de Ruta
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Las unidades afiliadas a <strong>{selectedGroup}</strong> mantienen un registro limpio de seguridad con cumplimiento de tarifas pactadas oficiales y salidas escalonadas cada 5 minutos en hora punta desde el Paradero Base.
                </p>
              </div>
            </div>
          )}

          {/* 3. VISTA REPORTE POR CONDUCTOR ESPECÍFICO */}
          {reportScope === 'CONDUCTOR' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Selector de Conductor */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Seleccionar Conductor:
                </label>
                <select
                  value={selectedDriver}
                  onChange={e => setSelectedDriver(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-300 dark:border-slate-700 font-bold"
                >
                  <option value="Jorge Huamán Castillo (B1A-789)">Jorge Huamán Castillo — Toyota Yaris (Placa B1A-789)</option>
                  <option value="Walter Rosales Díaz (C3M-456)">Walter Rosales Díaz — Chevrolet Sail (Placa C3M-456)</option>
                  <option value="Manuel Mendoza (A9Z-112)">Manuel Mendoza — Station Wagon Probox (Placa A9Z-112)</option>
                </select>
              </div>

              {/* Ficha Individual del Conductor */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Carreras Hoy</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">14 viajes</span>
                  <span className="text-[10.5px] text-emerald-600 font-medium block mt-0.5">100% completadas</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Calificación</span>
                  <span className="text-xl font-black text-amber-600 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    4.8 / 5.0
                  </span>
                  <span className="text-[10.5px] text-slate-500 block mt-0.5">92 valoraciones</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Puntualidad</span>
                  <span className="text-xl font-black text-blue-600">99.0%</span>
                  <span className="text-[10.5px] text-blue-700 font-medium block mt-0.5">Llegada puntual</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Ganancias Est.</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">S/. 175.00</span>
                  <span className="text-[10.5px] text-slate-500 block mt-0.5">Jornada de hoy</span>
                </div>
              </div>

              {/* Reseñas Recientes de Pasajeros */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                <div className="bg-slate-100 dark:bg-[#1e222a] px-3.5 py-2 font-bold text-slate-700 dark:text-slate-300">
                  Comentarios y Opiniones Recientes de Pasajeros
                </div>
                <div className="p-3.5 space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Lucía Fernández (Estudiante UNAB)</span>
                      <span className="text-amber-500 font-bold">★★★★★ 5.0</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      "Excelente chofer, muy prudente manejando en la Panamericana y el vehículo estaba súper limpio."
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Carlos Ramírez</span>
                      <span className="text-amber-500 font-bold">★★★★★ 5.0</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      "Pactamos el precio rápido y llegó en menos de 3 minutos al punto acordado."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Exportación / Salida a PDF */}
          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrintToPdf}
              className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const reportContent = {
                  scope: reportScope,
                  date: new Date().toISOString(),
                  target: reportScope === 'GRUPO' ? selectedGroup : reportScope === 'CONDUCTOR' ? selectedDriver : 'Red Provincial',
                  status: 'Aprobado y Verificado'
                };
                const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Reporte_${reportScope}_RutaLink_${Date.now()}.json`;
                a.click();
              }}
              className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span>Exportar Ficha de Datos</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
