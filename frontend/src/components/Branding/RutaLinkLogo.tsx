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
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Isotipo Oficial RutaLink Provincia de Barranca"
    >
      <defs>
        {/* Fondo Nocturno Premium / Escudo */}
        <linearGradient id="rlBgGrad" x1="10" y1="0" x2="150" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0b1120" />
          <stop offset="60%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Gradiente Panamericana */}
        <linearGradient id="rlPanaGold" x1="30" y1="170" x2="65" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>

        {/* Sombra de relieve */}
        <filter id="rlEmblemShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#020617" floodOpacity="0.45" />
        </filter>
        <filter id="rlDistrictGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Escudo Base Curvo con Bordes Suaves */}
      <rect
        x="4"
        y="4"
        width="152"
        height="172"
        rx="34"
        fill="url(#rlBgGrad)"
        stroke="#334155"
        strokeWidth="1.8"
        filter="url(#rlEmblemShadow)"
      />

      {/* Brillo perimetral */}
      <rect
        x="5"
        y="5"
        width="150"
        height="170"
        rx="33"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="0.8"
        opacity="0.25"
      />

      {/* GRUPO CARTOGRAFÍA PROVINCIAL DE BARRANCA */}
      <g id="mapa-provincial-barranca" filter="url(#rlDistrictGlow)" transform="translate(10, 8) scale(0.88)">
        
        {/* 1. DISTRITO PARAMONGA (Norte - Verde Valle Fortaleza) */}
        <path
          d="M 52,8 
             C 60,6 74,16 78,28 
             C 80,38 72,50 64,54 
             C 58,56 50,52 46,46 
             C 44,40 40,40 38,44 
             C 32,50 36,60 40,66 
             C 34,68 20,64 12,70 
             C 8,74 12,82 18,88 
             C 24,84 32,76 38,72 
             C 46,74 46,62 50,56 
             C 56,58 60,54 58,46 
             C 56,38 52,24 50,14 Z"
          fill="#65a30d"
          stroke="#4d7c0f"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* 2. DISTRITO PATIVILCA (Centro-Norte - Amarillo) */}
        <path
          d="M 50,56 
             C 56,58 68,52 72,54 
             C 80,58 88,72 88,80 
             C 86,88 78,92 72,92 
             C 62,94 48,92 40,94 
             C 34,92 32,84 38,72 
             C 46,74 46,62 50,56 Z"
          fill="#eab308"
          stroke="#ca8a04"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* 3. DISTRITO BARRANCA (Centro - Naranja Capital Provincial) */}
        <path
          d="M 38,72 
             C 42,84 34,92 40,94 
             C 48,92 62,94 72,92 
             C 76,96 74,106 68,112 
             C 58,114 52,118 44,116 
             C 38,112 34,102 36,92 
             C 30,86 32,78 38,72 Z"
          fill="#ea580c"
          stroke="#c2410c"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* 4. DISTRITO SUPE PUERTO (Costa Suroeste - Turquesa / Océano) */}
        <path
          d="M 38,112 
             C 44,118 48,118 46,124 
             C 42,126 38,126 36,122 
             C 34,118 36,114 38,112 Z"
          fill="#06b6d4"
          stroke="#0891b2"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* 5. DISTRITO SUPE (Sureste - Azul Caral y Valle Supe) */}
        <path
          d="M 46,124 
             C 52,118 68,112 74,116 
             C 84,118 94,114 102,118 
             C 106,124 100,132 94,136 
             C 88,142 86,150 78,156 
             C 72,160 66,154 62,146 
             C 56,144 50,146 44,140 
             C 42,132 44,126 46,124 Z"
          fill="#64748b"
          stroke="#475569"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* RÍOS FLUVIALES DE LOS 3 VALLES (Líneas Celestes) */}
        {/* Río Fortaleza */}
        <path
          d="M 72,12 C 60,30 46,46 36,54"
          stroke="#38bdf8"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Río Pativilca */}
        <path
          d="M 86,76 C 70,82 50,88 34,92"
          stroke="#38bdf8"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Río Supe */}
        <path
          d="M 98,130 C 80,132 64,136 44,136"
          stroke="#38bdf8"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* CARRETERA PANAMERICANA NORTE (Columna vertebral vial en oro) */}
        <path
          d="M 16,84 
             C 24,88 32,96 38,106 
             C 44,118 48,136 54,166"
          stroke="url(#rlPanaGold)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 16,84 
             C 24,88 32,96 38,106 
             C 44,118 48,136 54,166"
          stroke="#0f172a"
          strokeWidth="1.2"
          strokeDasharray="2 3"
          strokeLinecap="round"
        />

        {/* NODO GEOGRÁFICO CENTRAL BARRANCA - UNAB (Baliza GPS) */}
        <circle cx="48" cy="104" r="8" fill="#ffffff" opacity="0.9" />
        <circle cx="48" cy="104" r="5.5" fill="#2563eb" />
        <circle cx="48" cy="104" r="2.2" fill="#fbbf24" />

        {/* Baliza Puerto Supe */}
        <circle cx="40" cy="120" r="3" fill="#06b6d4" stroke="#ffffff" strokeWidth="0.8" />

        {/* Baliza Caral / Supe */}
        <circle cx="82" cy="136" r="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
      </g>
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

