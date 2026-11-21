'use client';

import React, { useState } from 'react';
import { X, Phone, MessageCircle, ShieldAlert, Bus, Users, Search } from 'lucide-react';

interface ContactItem {
  id: string;
  name: string;
  role: 'CHOFER' | 'PARADERO' | 'EMERGENCIA';
  phone: string;
  detail: string;
  plate?: string;
  route?: string;
  badge?: string;
}

const CONTACTS: ContactItem[] = [
  // 1. Choferes en Ruta
  {
    id: 'c1',
    name: 'Jorge Huamán Castillo',
    role: 'CHOFER',
    phone: '+51 987654323',
    detail: 'Toyota Yaris Sedán 2023',
    plate: 'B1A-789',
    route: 'Troncal Barranca - UNAB',
    badge: 'Comité 1'
  },
  {
    id: 'c2',
    name: 'Carlos Morales Echevarría',
    role: 'CHOFER',
    phone: '+51 987654313',
    detail: 'Toyota Avanza Miniván 7 Pasajeros',
    plate: 'A7U-102',
    route: 'Corredor Universitario UNAB',
    badge: 'Comité 1'
  },
  {
    id: 'c3',
    name: 'Luis Alberto Alva',
    role: 'CHOFER',
    phone: '+51 987654314',
    detail: 'Hyundai Elantra Sedán',
    plate: 'T5F-330',
    route: 'Ruta Barranca - Supe Pueblo',
    badge: 'Comité 1'
  },
  {
    id: 'c4',
    name: 'Walter Rosales Díaz',
    role: 'CHOFER',
    phone: '+51 987654324',
    detail: 'Chevrolet Sail Sedán',
    plate: 'C3M-456',
    route: 'Servicio Libre / Colectivo',
    badge: 'Independiente'
  },
  {
    id: 'c5',
    name: 'Ricardo Pantoja Gómez',
    role: 'CHOFER',
    phone: '+51 987654315',
    detail: 'Nissan Versa Confort',
    plate: 'D2K-881',
    route: 'Expreso Pativilca - Paramonga',
    badge: 'Expreso Norte'
  },
  // 2. Paraderos Base y Despacho
  {
    id: 'p1',
    name: 'Paradero Base Central Gálvez (Barranca)',
    role: 'PARADERO',
    phone: '+51 987654321',
    detail: 'Atención 06:00 a 21:00 · Av. José Gálvez 450',
    badge: 'Central'
  },
  {
    id: 'p2',
    name: 'Paradero Supe Pueblo (Plaza Bolognesi)',
    role: 'PARADERO',
    phone: '+51 987654322',
    detail: 'Despachador Manuel Silva · Salidas cada 4 min',
    badge: 'Supe'
  },
  // 3. Centrales de Emergencia de la Provincia de Barranca
  {
    id: 'e1',
    name: 'Serenazgo Municipal de Barranca',
    role: 'EMERGENCIA',
    phone: '024-235-2122',
    detail: 'Seguridad Ciudadana 24 Horas',
    badge: 'Seguridad'
  },
  {
    id: 'e2',
    name: 'Comisaría PNP de Barranca',
    role: 'EMERGENCIA',
    phone: '024-235-2182',
    detail: 'Policía Nacional del Perú',
    badge: 'PNP'
  },
  {
    id: 'e3',
    name: 'Hospital de Barranca (Emergencias)',
    role: 'EMERGENCIA',
    phone: '024-235-2244',
    detail: 'Ambulancia y Urgencias Médicas',
    badge: 'Salud'
  }
];

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactsModal({ isOpen, onClose }: ContactsModalProps) {
  const [activeTab, setActiveTab] = useState<'CHOFER' | 'PARADERO' | 'EMERGENCIA'>('CHOFER');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = CONTACTS.filter(c => {
    const matchesTab = c.role === activeTab;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.phone.includes(search) ||
                          (c.plate && c.plate.toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#13161a] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Cabecera */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Directorio Telefónico</h2>
              <p className="text-xs text-blue-100">Llamadas y WhatsApp directos de Barranca</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buscador y Pestañas */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#181c22] border-b border-slate-200 dark:border-slate-800 space-y-2.5">
          {/* Buscador */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, placa o teléfono..."
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#20252d] border border-slate-200 dark:border-slate-700 rounded-2xl text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Pestañas */}
          <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('CHOFER')}
              className={`py-2.5 rounded-2xl transition flex items-center justify-center gap-1.5 active:scale-95 ${
                activeTab === 'CHOFER'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#20252d] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Choferes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PARADERO')}
              className={`py-2.5 rounded-2xl transition flex items-center justify-center gap-1.5 active:scale-95 ${
                activeTab === 'PARADERO'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#20252d] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>Paraderos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('EMERGENCIA')}
              className={`py-2.5 rounded-2xl transition flex items-center justify-center gap-1.5 active:scale-95 ${
                activeTab === 'EMERGENCIA'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#20252d] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Emergencia</span>
            </button>
          </div>
        </div>

        {/* Lista de Contactos con Scroll Fluido */}
        <div className="p-4 overflow-y-auto overscroll-contain touch-scroll space-y-3 flex-1 pb-10">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-500">
              No se encontraron contactos en esta categoría.
            </div>
          ) : (
            filtered.map((c) => {
              const cleanPhone = c.phone.replace(/[^0-9]/g, '');
              const waLink = `https://wa.me/${cleanPhone.startsWith('51') ? cleanPhone : '51' + cleanPhone}?text=${encodeURIComponent(`Hola ${c.name}, te contacto desde la plataforma RutaLink Barranca.`)}`;

              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181c22] shadow-2xs hover:border-blue-300 dark:hover:border-slate-700 transition flex items-center justify-between gap-3 active:scale-98"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {c.name}
                      </span>
                      {c.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 shrink-0">
                          {c.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                      {c.detail}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {c.phone}
                      </span>
                      {c.plate && (
                        <span className="font-mono text-xs font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-700 dark:text-slate-300">
                          {c.plate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botones de Contacto (Grandes, cómodos para dedos) */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Botón Llamar */}
                    <a
                      href={`tel:${c.phone}`}
                      className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 transition shadow-2xs active:scale-90 flex items-center justify-center"
                      title="Llamar por teléfono"
                      aria-label="Llamar"
                    >
                      <Phone className="w-5 h-5" />
                    </a>

                    {/* Botón WhatsApp */}
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 transition shadow-2xs active:scale-90 flex items-center justify-center"
                      title="Abrir chat de WhatsApp"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111317] text-center">
          <p className="text-[11px] text-slate-500">
            Números oficiales auditados para la Provincia de Barranca · UNAB
          </p>
        </div>

      </div>
    </div>
  );
}
