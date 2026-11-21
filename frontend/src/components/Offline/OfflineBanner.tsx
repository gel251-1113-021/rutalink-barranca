'use client';

import React from 'react';
import { WifiOff, MessageSquare, Database } from 'lucide-react';

interface OfflineBannerProps {
  isOffline: boolean;
  onOpenSms: () => void;
  lastSyncTime?: string | null;
}

export default function OfflineBanner({ isOffline, onOpenSms, lastSyncTime }: OfflineBannerProps) {
  if (!isOffline) return null;

  return (
    <div className="absolute top-14 left-0 right-0 z-30 px-3 sm:px-6 py-2 bg-amber-50/95 dark:bg-amber-950/80 backdrop-blur-md border-b border-amber-200/80 dark:border-amber-800 text-amber-900 dark:text-amber-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-amber-200/70 dark:bg-amber-900/60 flex items-center justify-center text-amber-800 dark:text-amber-300">
            <WifiOff className="w-3 h-3" />
          </div>
          <div>
            <strong className="font-bold">Modo Fuera de Línea (Off-Grid):</strong>
            <span className="ml-1 text-[11px] text-amber-800/90 dark:text-amber-300">
              Operando con caché local de paraderos y rutas.
              {lastSyncTime && ` (Sincronizado: ${new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenSms}
          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shadow-2xs transition flex items-center gap-1.5"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Consultar por SMS (Sin Datos)</span>
        </button>
      </div>
    </div>
  );
}
