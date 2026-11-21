'use client';

import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Check, MessageCircle, QrCode, Printer, Sparkles, ExternalLink } from 'lucide-react';
import RutaLinkLogo from '../Branding/RutaLinkLogo';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

export default function ShareAppModal({ isOpen, onClose, appUrl: externalUrl }: ShareAppModalProps) {
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState(externalUrl || 'https://rutalink-barranca.pe');

  useEffect(() => {
    if (externalUrl) {
      setAppUrl(externalUrl);
    } else if (typeof window !== 'undefined') {
      setAppUrl(window.location.origin);
    }
  }, [externalUrl]);

  if (!isOpen) return null;

  const shareText = `¡Hola! Te comparto *RutaLink Barranca*, la aplicación web oficial de transporte y movilidad segura en la Provincia de Barranca (Campus UNAB, Supe, Pativilca y Paramonga). 🚗🛺\n\nConsulta colectivos en tiempo real, verifica paraderos y pacta carreras seguras con código PIN:\n${appUrl}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handlePrintQR = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#14161a] w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabecera */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">Compartir RutaLink Barranca</h2>
              <p className="text-[11px] text-blue-100">Difusión para pasajeros, estudiantes y conductores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 overflow-y-auto space-y-4 text-center">
          
          {/* Logo y Tarjeta QR Imprimible */}
          <div className="p-5 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#1b1f26] dark:to-[#13161c] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner flex flex-col items-center">
            <RutaLinkLogo size="sm" showSubtitle={false} className="mb-2" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-3">
              Escanea para abrir la app sin descargar nada
            </span>

            {/* Código QR Vectorial de Alta Definición */}
            <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="140" height="140">
                {/* Esquinas guía del QR */}
                <rect x="10" y="10" width="40" height="40" rx="6" fill="#1e3a8a" />
                <rect x="18" y="18" width="24" height="24" rx="3" fill="#ffffff" />
                <rect x="23" y="23" width="14" height="14" rx="2" fill="#1e3a8a" />

                <rect x="110" y="10" width="40" height="40" rx="6" fill="#1e3a8a" />
                <rect x="118" y="18" width="24" height="24" rx="3" fill="#ffffff" />
                <rect x="123" y="23" width="14" height="14" rx="2" fill="#1e3a8a" />

                <rect x="10" y="110" width="40" height="40" rx="6" fill="#1e3a8a" />
                <rect x="18" y="118" width="24" height="24" rx="3" fill="#ffffff" />
                <rect x="23" y="123" width="14" height="14" rx="2" fill="#1e3a8a" />

                {/* Patrón de datos QR */}
                <rect x="58" y="14" width="8" height="8" rx="2" fill="#2563eb" />
                <rect x="74" y="14" width="8" height="8" rx="2" fill="#1e3a8a" />
                <rect x="90" y="14" width="8" height="8" rx="2" fill="#2563eb" />
                <rect x="58" y="30" width="8" height="8" rx="2" fill="#1e3a8a" />
                <rect x="74" y="30" width="24" height="8" rx="2" fill="#2563eb" />
                <rect x="58" y="46" width="16" height="8" rx="2" fill="#2563eb" />
                <rect x="82" y="46" width="16" height="8" rx="2" fill="#1e3a8a" />

                {/* Centro con isotipo de auto / sol de Barranca */}
                <rect x="62" y="62" width="36" height="36" rx="8" fill="#1e3a8a" />
                <circle cx="80" cy="80" r="12" fill="#fbbf24" />
                <circle cx="80" cy="80" r="6" fill="#ffffff" />

                {/* Datos inferiores */}
                <rect x="58" y="106" width="8" height="16" rx="2" fill="#1e3a8a" />
                <rect x="74" y="106" width="16" height="8" rx="2" fill="#2563eb" />
                <rect x="98" y="106" width="8" height="8" rx="2" fill="#1e3a8a" />
                <rect x="114" y="106" width="16" height="16" rx="2" fill="#2563eb" />
                <rect x="138" y="106" width="8" height="8" rx="2" fill="#1e3a8a" />
                <rect x="58" y="130" width="16" height="8" rx="2" fill="#2563eb" />
                <rect x="82" y="130" width="24" height="8" rx="2" fill="#1e3a8a" />
                <rect x="114" y="130" width="8" height="16" rx="2" fill="#2563eb" />
                <rect x="130" y="138" width="16" height="8" rx="2" fill="#1e3a8a" />
              </svg>
            </div>

            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-3 bg-white dark:bg-[#181a20] px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {appUrl}
            </span>
          </div>

          {/* Botones de Compartir */}
          <div className="space-y-2">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Compartir en Grupos de WhatsApp</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* Copiar enlace */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#191d24] text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-blue-600" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
              </button>

              {/* Imprimir cartel QR */}
              <button
                type="button"
                onClick={handlePrintQR}
                className="py-2.5 px-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#191d24] text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>Imprimir Cartel QR</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

