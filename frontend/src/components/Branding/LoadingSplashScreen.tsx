'use client';

import React from 'react';
import RutaLinkLogo from './RutaLinkLogo';

interface LoadingSplashScreenProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export default function LoadingSplashScreen({
  message = 'Conectando con la flota en tiempo real...',
  subMessage = 'Red de Movilidad Provincial · UNAB — Supe — Pativilca — Paramonga',
  fullScreen = true
}: LoadingSplashScreenProps) {
  return (
    <div
      className={`${
        fullScreen
          ? 'fixed inset-0 z-50 bg-gradient-to-b from-slate-900 via-[#0d131f] to-[#070a10] text-white flex flex-col items-center justify-center p-6'
          : 'w-full h-full min-h-[300px] bg-slate-900/90 text-white flex flex-col items-center justify-center p-6 rounded-3xl'
      } select-none animate-in fade-in duration-300`}
    >
      {/* Círculos de Resonancia / Radar Animado */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Anillo de Pulso Exterior */}
        <div className="absolute w-32 h-32 rounded-full border border-blue-500/30 animate-ping opacity-50" />
        <div className="absolute w-24 h-24 rounded-full border border-cyan-400/40 animate-pulse" />
        
        {/* Contenedor del Logo */}
        <div className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-[0_0_35px_rgba(37,99,235,0.45)] flex items-center justify-center">
          <div className="w-full h-full bg-[#0d131f] rounded-[22px] flex items-center justify-center">
            <RutaLinkLogo size="lg" showSubtitle={false} />
          </div>
        </div>
      </div>

      {/* Título de Marca Oficial de Barranca */}
      <div className="text-center space-y-1.5 max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-white font-sans">
            RutaLink
          </h1>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-400/30 tracking-widest">
            BARRANCA
          </span>
        </div>

        <p className="text-xs text-slate-300 font-medium leading-relaxed">
          {message}
        </p>

        <p className="text-[11px] text-slate-400 tracking-wide pt-1">
          {subMessage}
        </p>
      </div>

      {/* Barra de Progreso con Brillo */}
      <div className="w-48 sm:w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-6 relative shadow-inner">
        <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 rounded-full animate-[progress_1.8s_ease-in-out_infinite] w-2/3 shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
      </div>

      {/* Indicador de Estado Seguro */}
      <div className="mt-8 flex items-center gap-1.5 text-[10.5px] text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Servidores activos · UNAB Ciclo IV</span>
      </div>
    </div>
  );
}
