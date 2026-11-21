'use client';

import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Check, X, Sparkles } from 'lucide-react';

export interface AvatarOption {
  id: string;
  name: string;
  role: string;
  emoji: string;
  bgGradient: string;
}

export const PRESET_AVATARS: AvatarOption[] = [
  // 1. Estudiantes y Universitarios UNAB
  { id: 'av_student_unab', name: 'Estudiante UNAB', role: 'PASAJERO', emoji: '👩‍🎓', bgGradient: 'from-purple-500 to-pink-600' },
  { id: 'av_student_male', name: 'Universitario UNAB', role: 'PASAJERO', emoji: '👨‍🎓', bgGradient: 'from-cyan-500 to-blue-600' },
  { id: 'av_student_tech', name: 'Tecnólogo / Sistemas', role: 'PASAJERO', emoji: '🧑‍💻', bgGradient: 'from-indigo-500 to-purple-700' },

  // 2. Conductores de la Provincia
  { id: 'av_driver_formal', name: 'Chofer Formal Comité', role: 'CONDUCTOR_AFILIADO', emoji: '🧑‍✈️', bgGradient: 'from-blue-600 to-indigo-700' },
  { id: 'av_driver_combi', name: 'Chofer Combi HiAce', role: 'CONDUCTOR_AFILIADO', emoji: '🚐', bgGradient: 'from-emerald-600 to-teal-700' },
  { id: 'av_driver_mototaxi', name: 'Mototaxista Torito', role: 'CONDUCTOR_INDEPENDIENTE', emoji: '🛺', bgGradient: 'from-amber-500 to-yellow-600' },
  { id: 'av_driver_indep', name: 'Chofer Indep. Express', role: 'CONDUCTOR_INDEPENDIENTE', emoji: '🧢', bgGradient: 'from-orange-500 to-red-600' },

  // 3. Trabajadores y Comercio
  { id: 'av_passenger_work', name: 'Profesional Comercio', role: 'PASAJERO', emoji: '💼', bgGradient: 'from-slate-600 to-slate-800' },
  { id: 'av_merchant', name: 'Comerciante Mercado', role: 'PASAJERO', emoji: '🛒', bgGradient: 'from-teal-500 to-emerald-700' },
  { id: 'av_health_worker', name: 'Salud Hospital Barranca', role: 'PASAJERO', emoji: '🩺', bgGradient: 'from-rose-500 to-pink-600' },
  { id: 'av_teacher', name: 'Docente / Educación', role: 'PASAJERO', emoji: '📚', bgGradient: 'from-blue-500 to-cyan-600' },

  // 4. Residentes de Distritos del Litoral y Valle
  { id: 'av_passenger_local', name: 'Vecina de Barranca', role: 'PASAJERO', emoji: '👵', bgGradient: 'from-emerald-500 to-teal-600' },
  { id: 'av_farmer_valle', name: 'Productor Valle Supe', role: 'PASAJERO', emoji: '🌾', bgGradient: 'from-lime-600 to-emerald-700' },
  { id: 'av_port_puerto', name: 'Vecino Puerto Supe', role: 'PASAJERO', emoji: '⚓', bgGradient: 'from-sky-600 to-blue-800' },
  { id: 'av_sports', name: 'Deportista Chorrillos', role: 'PASAJERO', emoji: '🏃', bgGradient: 'from-fuchsia-500 to-purple-600' },
  { id: 'av_tourist', name: 'Visitante Caral / Paramonga', role: 'PASAJERO', emoji: '📸', bgGradient: 'from-amber-500 to-orange-700' },

  // 5. Autoridades Operativas
  { id: 'av_dispatcher', name: 'Despachador Paradero', role: 'ENCARGADO_PARADERO', emoji: '🦺', bgGradient: 'from-amber-400 to-yellow-600' },
  { id: 'av_admin', name: 'Administrador Empresa', role: 'ADMIN_EMPRESA', emoji: '👔', bgGradient: 'from-indigo-700 to-slate-900' }
];

export function UserAvatarDisplay({ 
  avatarId, 
  photoUrl, 
  name, 
  size = 'md', 
  className = '' 
}: { 
  avatarId?: string; 
  photoUrl?: string; 
  name?: string; 
  size?: 'sm' | 'md' | 'lg' | 'xl'; 
  className?: string 
}) {
  const avatar = PRESET_AVATARS.find(a => a.id === avatarId) || PRESET_AVATARS[0];

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-base',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-16 h-16 text-3xl'
  };

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name || 'Avatar'}
        className={`rounded-2xl object-cover shadow-2xs shrink-0 border border-slate-200 dark:border-slate-700 ${sizeClasses[size]} ${className}`}
      />
    );
  }

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
  photoUrl,
  onSelect,
  onOpenPhotoModal,
  onCancel
}: {
  selectedId: string;
  photoUrl?: string;
  onSelect: (id: string) => void;
  onOpenPhotoModal?: () => void;
  onCancel?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'presets' | 'photo'>('presets');

  return (
    <div className="space-y-3">
      {/* Barra de Selección: Avatar Digital vs Foto Personal */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Avatar o Foto de Perfil
        </label>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancelar</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'presets'
              ? 'bg-white dark:bg-[#16181d] text-blue-600 dark:text-blue-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Iconos de Barranca ({PRESET_AVATARS.length})</span>
        </button>

        {onOpenPhotoModal && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('photo');
              onOpenPhotoModal();
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'photo' || photoUrl
                ? 'bg-white dark:bg-[#16181d] text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{photoUrl ? 'Foto Cargada' : 'Tomar / Subir Foto'}</span>
          </button>
        )}
      </div>

      {/* Grilla Expandida de Avatares (16 opciones responsivas) */}
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto overscroll-contain pr-1 touch-scroll">
        {PRESET_AVATARS.map((av) => {
          const isSelected = selectedId === av.id && !photoUrl;
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => {
                onSelect(av.id);
                setActiveTab('presets');
              }}
              className={`p-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 shadow-xs scale-102'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/70 dark:bg-[#121417]'
              }`}
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr ${av.bgGradient} flex items-center justify-center text-lg shadow-2xs shrink-0`}>
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
