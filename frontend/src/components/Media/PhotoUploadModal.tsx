'use client';

import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Check, Image as ImageIcon, AlertCircle, RefreshCw, Lock } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  category?: 'PERFIL' | 'VEHICULO' | 'PARADERO' | 'LLEGADA';
  onPhotoUploaded: (base64Image: string) => void;
}

const CATEGORY_CONFIG: Record<string, { title: string; subtitle: string; cameraLabel: string; galleryLabel: string }> = {
  PERFIL: {
    title: 'Foto de Perfil',
    subtitle: 'Elige una foto tuya para que los conductores y pasajeros te reconozcan',
    cameraLabel: 'Tomar Foto con Cámara',
    galleryLabel: 'Elegir de la Galería'
  },
  VEHICULO: {
    title: 'Fotografía del Vehículo',
    subtitle: 'Captura la parte frontal de la unidad donde se distinga el modelo y la placa',
    cameraLabel: 'Tomar Foto de la Unidad',
    galleryLabel: 'Subir Foto del Vehículo'
  },
  PARADERO: {
    title: 'Foto del Paradero o Local',
    subtitle: 'Toma una foto del punto físico de parada, letrero o referencia del local',
    cameraLabel: 'Tomar Foto del Local / Paradero',
    galleryLabel: 'Subir Foto del Paradero'
  },
  LLEGADA: {
    title: 'Evidencia de Despacho',
    subtitle: 'Captura la foto de inspección y control de salida o llegada de la unidad',
    cameraLabel: 'Capturar Foto de Evidencia',
    galleryLabel: 'Adjuntar Archivo de Evidencia'
  }
};

export default function PhotoUploadModal({
  isOpen,
  onClose,
  title,
  subtitle,
  category = 'PERFIL',
  onPhotoUploaded
}: PhotoUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.PERFIL;
  const modalTitle = title || config.title;
  const modalSubtitle = subtitle || config.subtitle;

  // Compresión y optimización en Canvas HTML5 para rendimiento móvil
  const processImageFile = (file: File) => {
    setIsProcessing(true);
    setPermissionError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPreview(compressedDataUrl);
        }
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Apertura de cámara con verificación de permisos en dispositivos móviles y escritorio
  const handleOpenCamera = async () => {
    setPermissionError(null);
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        // Permiso concedido: liberamos la cámara y disparamos el input de captura nativa
        stream.getTracks().forEach(track => track.stop());
        cameraInputRef.current?.click();
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionError('Permiso de cámara bloqueado en el navegador. Por favor toca el candado junto a la URL y permite el acceso a la cámara.');
        } else {
          // Si el navegador no permite preview directo pero soporta captura vía input:
          cameraInputRef.current?.click();
        }
      }
    } else {
      cameraInputRef.current?.click();
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onPhotoUploaded(preview);
      onClose();
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#14161a] w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Cabecera Adaptada con Botón Cancelar/Cerrar */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">{modalTitle}</h3>
              <p className="text-[11px] text-slate-500 truncate">{modalSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controles de Entrada */}
        <div className="p-5 space-y-4 text-center">
          {/* Input 1: Cámara Directa con Capture Environment */}
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Input 2: Galería / Archivos */}
          <input
            type="file"
            ref={galleryInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Alerta de Permiso de Cámara Bloqueado */}
          {permissionError && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-left flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200 animate-in fade-in">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Acceso a cámara bloqueado</p>
                <p className="text-[11px] mt-0.5">{permissionError}</p>
              </div>
            </div>
          )}

          {preview ? (
            /* Vista Previa de la Fotografía Capturada */
            <div className="space-y-3">
              <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 shadow-inner">
                <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold flex items-center gap-1 py-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tomar otra foto</span>
                </button>
              </div>
            </div>
          ) : (
            /* Opciones de Captura para el Público Real */
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleOpenCamera}
                className="w-full p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md transition"
              >
                <Camera className="w-5 h-5" />
                <span>{config.cameraLabel}</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 border border-slate-200/80 dark:border-slate-700 transition"
              >
                <ImageIcon className="w-5 h-5 text-slate-500" />
                <span>{config.galleryLabel}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition active:scale-98"
              >
                Cancelar
              </button>

              <p className="text-[10.5px] text-slate-400 mt-2">
                La fotografía se optimiza automáticamente para carga ultra-rápida en red móvil.
              </p>
            </div>
          )}

          {preview && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>Guardar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
