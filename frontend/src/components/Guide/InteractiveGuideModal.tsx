'use client';

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, HelpCircle, MapPin, Search, User, Users, Car, CheckCircle } from 'lucide-react';

export type GuideSection = 'MAPA' | 'BUSCADOR' | 'PERFIL' | 'GRUPOS' | 'CABINA_CHOFER' | 'DESPACHADOR';

interface GuideStep {
  title: string;
  description: string;
  icon: any;
  tip?: string;
}

const GUIDE_CONTENT: Record<GuideSection, { name: string; steps: GuideStep[] }> = {
  MAPA: {
    name: 'Mapa Provincial Interactivo',
    steps: [
      {
        title: 'Exploración en Tiempo Real',
        description: 'Observa la ubicación real y rumbo de las unidades en circulación, paraderos base oficiales y puntos tranquilos de la provincia.',
        icon: MapPin,
        tip: 'Toca cualquier vehículo para consultar sus asientos libres, placa y chofer.'
      },
      {
        title: 'Selector de Capas Geográficas',
        description: 'Alterna entre el Mapa Vial estándar, Vista Satelital (ideal para el valle de Supe y Pativilca) y el Modo Nocturno Vial sin reflejos.',
        icon: HelpCircle,
        tip: 'El Modo Nocturno optimiza la visibilidad en conducción nocturna.'
      },
      {
        title: 'Timbre Digital de Bajada ("Me bajo aquí")',
        description: 'Cuando viajes a bordo de un vehículo, el timbre digital te permite solicitar parada de forma segura en la próxima esquina.',
        icon: CheckCircle,
        tip: 'Solo se activa cuando viajas a bordo para evitar alertas accidentales al chofer.'
      }
    ]
  },
  BUSCADOR: {
    name: 'Buscador de Destinos y Rutas',
    steps: [
      {
        title: '¿A dónde vas en Barranca?',
        description: 'Escribe cualquier destino (UNAB, Hospital, Supe, Pativilca, Mercado) para centrar el mapa y filtrar unidades cercanas.',
        icon: Search,
        tip: 'Combina paraderos registrados con hitos geográficos de toda la provincia.'
      },
      {
        title: 'Accesos Directos a Distritos',
        description: 'Utiliza los chips rápidos para saltar de inmediato al Campus UNAB, Supe Pueblo, Pativilca o Paramonga con un solo toque.',
        icon: MapPin,
        tip: 'Diseñado para uso ágil con una sola mano en movimiento.'
      }
    ]
  },
  PERFIL: {
    name: 'Perfil y Onboarding Seguro',
    steps: [
      {
        title: 'Identidad Real y Confianza',
        description: 'Verifica tu número telefónico (+51) y nombres para tener acceso a pactar carreras, unirte a grupos o postular como chofer.',
        icon: User,
        tip: 'Una identidad verificada protege a pasajeros y conductores.'
      },
      {
        title: 'Avatar y Contacto SOS de Emergencia',
        description: 'Personaliza tu cuenta con avatares provinciales o tu foto, y registra tu contacto de auxilio para viajes seguros.',
        icon: CheckCircle,
        tip: 'Configurable y editable en cualquier momento sin costo de datos.'
      }
    ]
  },
  GRUPOS: {
    name: 'Grupos y Empresas de Transporte',
    steps: [
      {
        title: 'Comités Formales y Grupos de Pasajeros',
        description: 'Accede a los grupos oficiales de transporte con sus tarifas o crea tus propios grupos cerrados de estudio y trabajo.',
        icon: Users,
        tip: 'Los grupos pueden ser públicos o privados con moderación.'
      },
      {
        title: 'Multicanal de Comunicación',
        description: 'Comunícate con los conductores mediante el chat interno o vía llamada y WhatsApp directo desde tu teléfono.',
        icon: HelpCircle,
        tip: 'Totalmente integrado para resolver dudas o coordinar salidas.'
      }
    ]
  },
  CABINA_CHOFER: {
    name: 'Cabina del Conductor (Cockpit)',
    steps: [
      {
        title: 'Control de Asientos y Carga',
        description: 'Marca asientos libres u ocupados en 1 toque y monitorea la disponibilidad de parrilla de tu unidad en vivo.',
        icon: Car,
        tip: 'La información se sincroniza instantáneamente con los pasajeros en el mapa.'
      },
      {
        title: 'Alertas de Bajada en Ruta',
        description: 'Recibe avisos acústicos y visuales cuando un pasajero presione "Me bajo aquí" antes de llegar a su parada.',
        icon: CheckCircle,
        tip: 'Permite orillarse y frenar con suavidad y seguridad.'
      }
    ]
  },
  DESPACHADOR: {
    name: 'Panel de Control de Paradero',
    steps: [
      {
        title: 'Gestión de Cola de Unidades',
        description: 'Registra la salida ordenada de vehículos en orden de llegada y controla los tiempos de intervalo entre turnos.',
        icon: MapPin,
        tip: 'Exclusivo para encargados acreditados por comités de transporte.'
      }
    ]
  }
};

export default function InteractiveGuideModal({
  isOpen,
  onClose,
  section = 'MAPA'
}: {
  isOpen: boolean;
  onClose: () => void;
  section?: GuideSection;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const content = GUIDE_CONTENT[section] || GUIDE_CONTENT.MAPA;
  const totalSteps = content.steps.length;
  const activeStepData = content.steps[currentStep] || content.steps[0];
  const StepIcon = activeStepData.icon;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-[#14161a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Cabecera con Botón de Cerrar Visible en Todo Momento */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-xs">
              ?
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Guía Rápida</span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">{content.name}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 flex items-center gap-1 text-xs font-semibold"
            aria-label="Cerrar guía"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar</span>
          </button>
        </div>

        {/* Contenido del Paso */}
        <div className="p-5 space-y-4">
          {/* Indicador de Progreso */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Paso {currentStep + 1} de {totalSteps}</span>
            <div className="flex items-center gap-1.5">
              {content.steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStep
                      ? 'w-6 bg-blue-600'
                      : 'w-2 bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Tarjeta del Paso Activo */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <StepIcon className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white pt-1">
              {activeStepData.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeStepData.description}
            </p>
            {activeStepData.tip && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                💡 Consejo: {activeStepData.tip}
              </div>
            )}
          </div>

          {/* Botones de Control con Cancelar/Cerrar */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={currentStep > 0 ? handlePrev : onClose}
              className="py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1 active:scale-95"
            >
              {currentStep > 0 ? (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </>
              ) : (
                <span>Cerrar Guía</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs active:scale-95"
            >
              <span>{currentStep === totalSteps - 1 ? '¡Entendido!' : 'Siguiente'}</span>
              {currentStep < totalSteps - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
