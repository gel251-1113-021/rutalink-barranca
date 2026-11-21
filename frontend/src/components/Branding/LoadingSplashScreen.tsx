'use client';

import React from 'react';
import RutaLinkLogo from './RutaLinkLogo';

interface LoadingSplashScreenProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export default function LoadingSplashScreen({
  message = 'Sincronizando flota y terminales en tiempo real...',
  subMessage = 'Barranca · Supe · Pativilca · Paramonga · UNAB',
  fullScreen = true
}: LoadingSplashScreenProps) {
  return (
    <div
      className={`${
        fullScreen
          ? 'fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md text-slate-100 flex items-center justify-center p-4'
          : 'w-full h-full min-h-[260px] bg-slate-900/60 text-slate-100 flex items-center justify-center p-4 rounded-3xl'
      } select-none animate-in fade-in duration-200`}
    >
      {/* Tarjeta Compacta y Sobria (No genérica) */}
      <div className="bg-white dark:bg-[#13161c] text-slate-900 dark:text-white rounded-3xl p-6 sm:p-7 max-w-xs sm:max-w-sm w-full shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center">
        
        {/* Logo Oficial de Barranca */}
        <div className="mb-4">
          <RutaLinkLogo size="md" showSubtitle={false} />
        </div>

        {/* Spinner sobrio de alta precisión */}
        <div className="relative w-8 h-8 mb-4">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-800" />
          <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>

        {/* Mensaje de carga conciso */}
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 leading-snug">
          {message}
        </h3>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          {subMessage}
        </p>

        {/* Barra de progreso sutil */}
        <div className="w-32 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-blue-600 rounded-full animate-[progress_1.4s_ease-in-out_infinite] w-2/4" />
        </div>
      </div>
    </div>
  );
}
