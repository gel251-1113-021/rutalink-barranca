'use client';

import React, { useState, useEffect } from 'react';
import { X, Phone, MessageCircle, ShieldAlert, Bus, Users, Search, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface ContactItem {
  id: string;
  name: string;
  role: 'CHOFER' | 'PARADERO' | 'EMERGENCIA' | 'PERSONAL';
  phone: string;
  detail: string;
  plate?: string;
  route?: string;
  badge?: string;
  isCustom?: boolean;
}

const INITIAL_CONTACTS: ContactItem[] = [
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
  const [activeTab, setActiveTab] = useState<'CHOFER' | 'PARADERO' | 'EMERGENCIA' | 'PERSONAL'>('CHOFER');
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState<ContactItem[]>(INITIAL_CONTACTS);

  // Formulario para Agregar Contacto
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'CHOFER' | 'PARADERO' | 'PERSONAL'>('CHOFER');
  const [newDetail, setNewDetail] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Cargar contactos personalizados de LocalStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('rutalink_user_custom_contacts');
        if (stored) {
          const parsed: ContactItem[] = JSON.parse(stored);
          setContacts([...parsed, ...INITIAL_CONTACTS]);
        }
      }
    } catch (e) {
      console.warn('Error loading contacts:', e);
    }
  }, []);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const formattedPhone = newPhone.trim().startsWith('+51') 
      ? newPhone.trim() 
      : newPhone.trim().length === 9 
      ? `+51 ${newPhone.trim()}` 
      : newPhone.trim();

    const newContact: ContactItem = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      role: newRole,
      phone: formattedPhone,
      detail: newDetail.trim() || (newRole === 'CHOFER' ? 'Chofer de confianza' : 'Contacto agregado'),
      plate: newPlate.trim().toUpperCase() || undefined,
      badge: 'Mi Contacto',
      isCustom: true
    };

    const updated = [newContact, ...contacts];
    setContacts(updated);

    try {
      if (typeof window !== 'undefined') {
        const customOnly = updated.filter(c => c.isCustom);
        localStorage.setItem('rutalink_user_custom_contacts', JSON.stringify(customOnly));
      }
    } catch (err) {
      console.warn('Error saving contact to local storage', err);
    }

    setShowAddForm(false);
    setNewName('');
    setNewPhone('');
    setNewDetail('');
    setNewPlate('');
    setActiveTab(newRole as any);
    showToast(`Contacto "${newContact.name}" guardado exitosamente.`);
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    try {
      if (typeof window !== 'undefined') {
        const customOnly = updated.filter(c => c.isCustom);
        localStorage.setItem('rutalink_user_custom_contacts', JSON.stringify(customOnly));
      }
    } catch (err) {
      console.warn('Error removing contact', err);
    }
    showToast('Contacto eliminado.');
  };

  const filtered = contacts.filter(c => {
    const matchesTab = activeTab === 'PERSONAL' ? c.isCustom : (c.role === activeTab || (activeTab === 'CHOFER' && c.isCustom && c.role === 'CHOFER'));
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.phone.includes(search) ||
                          (c.plate && c.plate.toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#13161a] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-200 relative">
        
        {/* Toast flotante */}
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Cabecera */}
        <div className="px-5 py-4 bg-[#0a5c4d] dark:bg-[#162329] text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Directorio Telefónico</h2>
              <p className="text-xs text-emerald-100">Llamadas y WhatsApp directos de Barranca</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Cerrar' : 'Agregar'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulario Desplegable: Agregar Contacto */}
        {showAddForm && (
          <form onSubmit={handleAddContactSubmit} className="p-4 bg-slate-100 dark:bg-[#1a1e26] border-b border-slate-200 dark:border-slate-800 space-y-3 animate-in slide-in-from-top duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Agregar Nuevo Contacto / Chofer</span>
              </h3>
              <span className="text-[10px] text-slate-500">Guardado en tu dispositivo</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Nombre (ej. Chofer Mario)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#20252e] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <input
                type="tel"
                required
                placeholder="Celular (ej. 987654321)"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#20252e] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as any)}
                className="px-2.5 py-2 text-xs rounded-xl bg-white dark:bg-[#20252e] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
              >
                <option value="CHOFER">🚗 Chofer</option>
                <option value="PARADERO">🚏 Paradero</option>
                <option value="PERSONAL">⭐ Personal</option>
              </select>
              <input
                type="text"
                placeholder="Placa (ej. B1A-789)"
                value={newPlate}
                onChange={e => setNewPlate(e.target.value)}
                className="px-2.5 py-2 text-xs rounded-xl bg-white dark:bg-[#20252e] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-mono"
              />
              <input
                type="text"
                placeholder="Detalle (ej. Yaris Blanco)"
                value={newDetail}
                onChange={e => setNewDetail(e.target.value)}
                className="px-2.5 py-2 text-xs rounded-xl bg-white dark:bg-[#20252e] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                Guardar Contacto
              </button>
            </div>
          </form>
        )}

        {/* Buscador y Pestañas */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#181c22] border-b border-slate-200 dark:border-slate-800 space-y-2.5">
          {/* Buscador */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, placa o teléfono..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#20252d] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Pestañas */}
          <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('CHOFER')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1 active:scale-95 ${
                activeTab === 'CHOFER'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-2xs'
                  : 'bg-white dark:bg-[#20252d] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Choferes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PARADERO')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1 active:scale-95 ${
                activeTab === 'PARADERO'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-2xs'
                  : 'bg-white dark:bg-[#20252d] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Paraderos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PERSONAL')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1 active:scale-95 ${
                activeTab === 'PERSONAL'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-2xs'
                  : 'bg-white dark:bg-[#20252d] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>⭐ Mis Choferes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('EMERGENCIA')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1 active:scale-95 ${
                activeTab === 'EMERGENCIA'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-[#20252d] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Auxilio</span>
            </button>
          </div>
        </div>

        {/* Lista de Contactos */}
        <div className="p-3.5 overflow-y-auto overscroll-contain touch-scroll space-y-2.5 flex-1 pb-10">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No se encontraron contactos en esta categoría. Puedes presionar "+ Agregar" arriba para registrar uno.
            </div>
          ) : (
            filtered.map((c) => {
              const cleanPhone = c.phone.replace(/[^0-9]/g, '');
              const waLink = `https://wa.me/${cleanPhone.startsWith('51') ? cleanPhone : '51' + cleanPhone}?text=${encodeURIComponent(`Hola ${c.name}, te contacto desde la plataforma comunitaria RutaLink Barranca.`)}`;

              return (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181c22] shadow-2xs hover:border-emerald-300 transition flex items-center justify-between gap-3 active:scale-98"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {c.name}
                      </span>
                      {c.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 shrink-0">
                          {c.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {c.detail}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {c.phone}
                      </span>
                      {c.plate && (
                        <span className="font-mono text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-slate-700 dark:text-slate-300">
                          {c.plate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Botón Llamar */}
                    <a
                      href={`tel:${c.phone}`}
                      className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 transition active:scale-90 flex items-center justify-center"
                      title="Llamar"
                    >
                      <Phone className="w-4 h-4" />
                    </a>

                    {/* Botón WhatsApp */}
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 transition active:scale-90 flex items-center justify-center"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>

                    {/* Eliminar si es personalizado */}
                    {c.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteContact(c.id)}
                        className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 transition active:scale-90"
                        title="Eliminar contacto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111317] text-center">
          <p className="text-[10.5px] text-slate-500">
            Directorio de transporte comunitario · Barranca · Supe · Pativilca · Paramonga · UNAB
          </p>
        </div>

      </div>
    </div>
  );
}
