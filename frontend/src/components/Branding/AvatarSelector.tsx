'use client';

import React from 'react';

export interface AvatarOption {
  id: string;
  name: string;
  role: string;
  emoji: string;
  bgGradient: string;
}

export const PRESET_AVATARS: AvatarOption[] = [
  { id: 'av_driver_formal', name: 'Chofer Formal Comité', role: 'CONDUCTOR_AFILIADO', emoji: '🧑‍✈️', bgGradient: 'from-blue-500 to-indigo-600' },
  { id: 'av_driver_indep', name: 'Chofer Independiente', role: 'CONDUCTOR_INDEPENDIENTE', emoji: '🧢', bgGradient: 'from-amber-500 to-orange-600' },
  { id: 'av_student_unab', name: 'Estudiante UNAB', role: 'PASAJERO', emoji: '👩‍🎓', bgGradient: 'from-purple-500 to-pink-600' },
  { id: 'av_student_male', name: 'Estudiante UNAB', role: 'PASAJERO', emoji: '👨‍🎓', bgGradient: 'from-cyan-500 to-blue-600' },
  { id: 'av_passenger_work', name: 'Pasajero Trabajador', role: 'PASAJERO', emoji: '💼', bgGradient: 'from-slate-600 to-slate-800' },
  { id: 'av_passenger_local', name: 'Vecina de Barranca', role: 'PASAJERO', emoji: '👵', bgGradient: 'from-emerald-500 to-teal-600' },
  { id: 'av_dispatcher', name: 'Despachador Paradero', role: 'ENCARGADO_PARADERO', emoji: '🦺', bgGradient: 'from-yellow-500 to-amber-600' },
  { id: 'av_admin', name: 'Administrador Empresa', role: 'ADMIN_EMPRESA', emoji: '👔', bgGradient: 'from-indigo-600 to-slate-900' }
];

export function UserAvatarDisplay({ avatarId, name, size = 'md', className = '' }: { avatarId?: string; name?: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const avatar = PRESET_AVATARS.find(a => a.id === avatarId) || PRESET_AVATARS[0];
  const initial = (name || 'U').charAt(0).toUpperCase();

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-base',
    lg: 'w-14 h-14 text-2xl'
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-tr ${avatar.bgGradient} flex items-center justify-center text-white font-bold shadow-2xs shrink-0 select-none ${sizeClasses[size]} ${className}`}
      title={avatar.name}
    >
      <span>{avatar.emoji}</span>
    </div>
  );
}

export default function AvatarSelector({
  selectedId,
  onSelect
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
        Selecciona tu Avatar Digital (Cero peso / Cero almacenamiento)
      </label>
      <div className="grid grid-cols-4 gap-2">
        {PRESET_AVATARS.map((av) => {
          const isSelected = selectedId === av.id;
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => onSelect(av.id)}
              className={`p-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 shadow-xs scale-105'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${av.bgGradient} flex items-center justify-center text-lg shadow-2xs`}>
                <span>{av.emoji}</span>
              </div>
              <span className="text-[9px] font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight truncate max-w-full">
                {av.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
