'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export function RutaLinkIsotype({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradiente Azul Pacífico / Cielo de Barranca */}
        <linearGradient id="rlSeaGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Gradiente Sol de Barranca / Caral */}
        <linearGradient id="rlSunGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Fondo circular suave con sombra */}
      <rect width="100" height="100" rx="26" fill="url(#rlSeaGradient)" />

      {/* Olas del litoral de Barranca / Puerto Supe */}
      <path
        d="M15 72C28 65 38 78 52 72C66 66 76 76 85 71"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeOpacity="0.35"
      />
      <path
        d="M18 82C30 76 40 85 54 80C68 75 78 83 83 79"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.2"
      />

      {/* Sol costero radiante de Barranca */}
      <circle cx="70" cy="30" r="11" fill="url(#rlSunGradient)" />

      {/* Silueta de Carretera Panamericana / Ruta Conectiva */}
      <path
        d="M26 80L44 42C46 38 52 38 54 42L72 80"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Línea central punteada de la pista */}
      <path
        d="M49 46L49 52M49 58L49 65M49 71L49 78"
        stroke="#fbbf24"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Pin de Geolocalización Central (Inspirado en Cristo Redentor de Barranca) */}
      <path
        d="M49 19C42.5 19 37 24.5 37 31C37 39 49 52 49 52C49 52 61 39 61 31C61 24.5 55.5 19 49 19Z"
        fill="#ffffff"
      />
      <circle cx="49" cy="30.5" r="4.2" fill="#2563eb" />
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
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            Barranca
          </span>
        </div>
        {showSubtitle && (
          <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight mt-0.5">
            Red de Movilidad Provincial · UNAB
          </span>
        )}
      </div>
    </div>
  );
}

// Insignias de Distritos de la Provincia de Barranca
export function DistrictBadge({ district }: { district: 'barranca' | 'supe' | 'puerto_supe' | 'pativilca' | 'paramonga' | 'unab' }) {
  const BADGES = {
    barranca: { name: 'Barranca', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🏛️' },
    supe: { name: 'Supe Pueblo', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🌾' },
    puerto_supe: { name: 'Puerto Supe', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: '⚓' },
    pativilca: { name: 'Pativilca', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '🏔️' },
    paramonga: { name: 'Paramonga', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '🏰' },
    unab: { name: 'Campus UNAB', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🎓' }
  };

  const item = BADGES[district] || BADGES.barranca;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.color}`}>
      <span>{item.icon}</span>
      <span>{item.name}</span>
    </span>
  );
}

