'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

/**
 * Isotipo Oficial de RutaLink basado en la cartografía real de la Provincia de Barranca:
 * - Silueta de los 5 distritos provinciales (Paramonga, Pativilca, Barranca, Supe Puerto, Supe).
 * - Eje conector central: Carretera Panamericana Norte.
 * - Los 3 valles fluviales (Río Fortaleza, Río Pativilca y Río Supe/Caral).
 * - Nodo central de geolocalización en Barranca Centro / Campus UNAB.
 */
export function RutaLinkIsotype({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Isotipo Oficial RutaLink Provincia de Barranca"
    >
      <defs>
        {/* Gradiente Azul Pacífico / Institucional */}
        <linearGradient id="rlNavyGradient" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="60%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        {/* Gradiente Valles Norte (Paramonga Verde - Pativilca Amarillo) */}
        <linearGradient id="rlValleyNorth" x1="40" y1="10" x2="65" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="60%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>

        {/* Gradiente Centro (Barranca Dorado / Sol) */}
        <linearGradient id="rlBarrancaGold" x1="45" y1="50" x2="70" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        {/* Gradiente Sur (Supe Puerto Turquesa - Supe Pueblo Azul Caral) */}
        <linearGradient id="rlSupeValley" x1="45" y1="75" x2="105" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Eje Vial Panamericana Dorado */}
        <linearGradient id="rlSpineGold" x1="30" y1="115" x2="60" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>

        <filter id="rlShadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#020617" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Contenedor Geométrico con Base Escudo Redondeado */}
      <rect width="120" height="120" rx="30" fill="url(#rlNavyGradient)" filter="url(#rlShadow)" />

      {/* 1. Silueta Paramonga (Norte / Valle Fortaleza) */}
      <path
        d="M 52,14 
           C 62,12 75,18 78,28 
           C 80,36 74,45 66,50 
           C 58,54 50,48 44,42 
           C 40,36 44,18 52,14 Z"
        fill="url(#rlValleyNorth)"
        opacity="0.92"
      />

      {/* 2. Silueta Pativilca (Centro-Norte / Río Pativilca) */}
      <path
        d="M 64,48 
           C 74,44 86,52 88,64 
           C 90,72 82,78 72,78 
           C 62,78 54,72 56,62 
           C 58,54 60,50 64,48 Z"
        fill="#eab308"
        opacity="0.95"
      />

      {/* 3. Silueta Barranca Centro (Corazón Provincial / Costa y UNAB) */}
      <path
        d="M 48,60 
           C 56,58 72,62 76,72 
           C 78,82 68,90 56,90 
           C 46,90 38,82 40,72 
           C 42,64 44,60 48,60 Z"
        fill="url(#rlBarrancaGold)"
      />

      {/* 4. Silueta Supe Puerto y Supe Pueblo / Caral (Sur) */}
      <path
        d="M 44,82 
           C 52,80 62,82 66,88 
           C 74,86 92,82 102,90 
           C 108,98 100,108 86,110 
           C 72,112 56,106 48,98 
           C 40,94 38,86 44,82 Z"
        fill="url(#rlSupeValley)"
        opacity="0.92"
      />

      {/* 5. Eje Troncal de Movilidad: Carretera Panamericana Norte que une los 5 distritos */}
      <path
        d="M 62,112 
           C 52,95 48,78 54,64 
           C 58,52 64,38 56,16"
        stroke="url(#rlSpineGold)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Línea central punteada de la carretera */}
      <path
        d="M 62,112 
           C 52,95 48,78 54,64 
           C 58,52 64,38 56,16"
        stroke="#1e293b"
        strokeWidth="1.6"
        strokeDasharray="3 3.5"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* 6. Nodo de Geolocalización Central en Barranca / UNAB */}
      <circle cx="53" cy="68" r="9" fill="#ffffff" filter="url(#rlShadow)" />
      <circle cx="53" cy="68" r="6" fill="#2563eb" />
      <circle cx="53" cy="68" r="2.5" fill="#fbbf24" />

      {/* Ondas sutiles del Océano Pacífico (Litoral de Barranca y Puerto Supe) */}
      <path
        d="M 22,66 C 26,62 30,68 34,64"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 20,76 C 24,72 28,78 32,74"
        stroke="#38bdf8"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

export default function RutaLinkLogo({ size = 'md', showSubtitle = true, className = '' }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <RutaLinkIsotype className={iconSizes[size]} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight ${textSizes[size]} text-slate-900 dark:text-white`}>
            Ruta<span className="text-blue-600 dark:text-blue-400">Link</span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Barranca
          </span>
        </div>
        {showSubtitle && (
          <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-tight mt-0.5">
            Red de Movilidad Provincial · UNAB
          </span>
        )}
      </div>
    </div>
  );
}

// Insignias Oficiales de los 5 Distritos de la Provincia de Barranca + Campus UNAB
export function DistrictBadge({ district }: { district: 'barranca' | 'supe' | 'puerto_supe' | 'pativilca' | 'paramonga' | 'unab' }) {
  const BADGES = {
    barranca: { name: 'Barranca', color: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800', icon: '🏛️' },
    supe: { name: 'Supe Pueblo', color: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700', icon: '🏺' },
    puerto_supe: { name: 'Puerto Supe', color: 'bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800', icon: '⚓' },
    pativilca: { name: 'Pativilca', color: 'bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800', icon: '🌾' },
    paramonga: { name: 'Paramonga', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800', icon: '🏰' },
    unab: { name: 'Campus UNAB', color: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800', icon: '🎓' }
  };

  const item = BADGES[district] || BADGES.barranca;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.color}`}>
      <span>{item.icon}</span>
      <span>{item.name}</span>
    </span>
  );
}

