'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  UserCheck, 
  Building2, 
  Share2 
} from 'lucide-react';

interface GroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GroupManagementModal({ isOpen, onClose }: GroupManagementModalProps) {
  const { user } = useAuth();

  const [tab, setTab] = useState<'my_groups' | 'pending_drivers' | 'create_group'>('my_groups');
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);

  // Form crear grupo
  const [name, setName] = useState('');
  const [type, setType] = useState<'EMPRESARIAL' | 'COMUNITARIO'>('EMPRESARIAL');
  const [description, setDescription] = useState('');
  const [baseAddress, setBaseAddress] = useState('');
  const [fareRange, setFareRange] = useState('S/. 2.50 - S/. 4.00');

  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadGroups() {
      if (!user) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const session = JSON.parse(localStorage.getItem('sb-rnrstlizbgmxkjsekodl-auth-token') || '{}');
        const token = session.access_token;
        if (!token) return;

        const res = await fetch(`${apiUrl}/api/groups/my-groups`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGroups(data.groups || []);
          if (data.groups?.length > 0) {
            setSelectedGroupId(data.groups[0].id);
          }
        }
      } catch (e) {
        console.error('Error cargando grupos:', e);
      }
    }

    if (isOpen) loadGroups();
  }, [isOpen, user]);

  // Cargar choferes en espera cuando se selecciona un grupo
  useEffect(() => {
    async function loadPendingDrivers() {
      if (!selectedGroupId) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const session = JSON.parse(localStorage.getItem('sb-rnrstlizbgmxkjsekodl-auth-token') || '{}');
        const token = session.access_token;

        const res = await fetch(`${apiUrl}/api/groups/${selectedGroupId}/pending-drivers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPendingDrivers(data.pendingDrivers || []);
        }
      } catch (e) {
        console.error('Error cargando postulantes:', e);
      }
    }

    if (isOpen && selectedGroupId) loadPendingDrivers();
  }, [isOpen, selectedGroupId]);

  if (!isOpen) return null;

  const handleApproveDriver = async (driverUserId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const session = JSON.parse(localStorage.getItem('sb-rnrstlizbgmxkjsekodl-auth-token') || '{}');
      const token = session.access_token;

      const res = await fetch(`${apiUrl}/api/groups/${selectedGroupId}/approve-driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ driverUserId })
      });

      if (res.ok) {
        setPendingDrivers(prev => prev.filter(d => d.user_id !== driverUserId));
        setMsg({ text: 'Conductor aprobado e integrado a la flota activa', type: 'success' });
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (e: any) {
      setMsg({ text: e.message || 'Error aprobando conductor', type: 'error' });
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const session = JSON.parse(localStorage.getItem('sb-rnrstlizbgmxkjsekodl-auth-token') || '{}');
      const token = session.access_token;

      const res = await fetch(`${apiUrl}/api/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          type,
          description,
          baseAddress,
          fareRange,
          baseLatitude: -10.7512,
          baseLongitude: -77.7615
        })
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        setMsg({ text: 'Grupo registrado con éxito', type: 'success' });
        setGroups(prev => [data.group, ...prev]);
        setTab('my_groups');
      } else {
        setMsg({ text: data.error || 'Error creando grupo', type: 'error' });
      }
    } catch (e: any) {
      setIsLoading(false);
      setMsg({ text: e.message || 'Error de red', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16181d] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600 text-white font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Gestión de Grupos y Flota
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Líneas Empresariales y Comunidades UNAB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas */}
        <div className="grid grid-cols-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setTab('my_groups')}
            className={`py-2.5 transition border-b-2 ${
              tab === 'my_groups'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Mis Grupos
          </button>
          <button
            onClick={() => setTab('pending_drivers')}
            className={`py-2.5 transition border-b-2 ${
              tab === 'pending_drivers'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Postulantes ({pendingDrivers.length})
          </button>
          <button
            onClick={() => setTab('create_group')}
            className={`py-2.5 transition border-b-2 ${
              tab === 'create_group'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            + Crear Grupo
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {msg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              }`}
            >
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* TAB 1: Mis Grupos */}
          {tab === 'my_groups' && (
            <div className="space-y-3">
              {groups.map(g => (
                <div
                  key={g.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{g.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      g.type === 'EMPRESARIAL'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    }`}>
                      {g.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{g.description || 'Sin descripción'}</p>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Tarifas: {g.fare_range || 'S/. 2.50 - S/. 4.00'}</span>
                    <span>Rol: <strong className="text-purple-500">{g.role_in_group}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Postulantes en Espera */}
          {tab === 'pending_drivers' && (
            <div className="space-y-3 text-xs">
              {pendingDrivers.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  No hay conductores en espera de aprobación para esta línea.
                </div>
              ) : (
                pendingDrivers.map(d => (
                  <div
                    key={d.user_id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 dark:text-slate-100">{d.full_name}</strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        En Espera
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Unidad: {d.brand_model || 'Vehículo registrado'} ({d.plate || 'Sin placa'}) · Cel: {d.phone || 'No registrado'}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApproveDriver(d.user_id)}
                      className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Aprobar Conductor e Integrar a la Flota</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Crear Grupo */}
          {tab === 'create_group' && (
            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Grupo / Comité
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. Comité 2 Barranca - Pativilca"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f2329] border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Grupo
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f2329] border border-slate-200 dark:border-slate-700"
                  >
                    <option value="EMPRESARIAL">Línea Formal (Empresarial)</option>
                    <option value="COMUNITARIO">Comunidad de Pasajeros</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tarifa Referencial
                  </label>
                  <input
                    type="text"
                    value={fareRange}
                    onChange={e => setFareRange(e.target.value)}
                    placeholder="S/. 2.50 - S/. 4.00"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f2329] border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Dirección del Paradero Base
                </label>
                <input
                  type="text"
                  value={baseAddress}
                  onChange={e => setBaseAddress(e.target.value)}
                  placeholder="Av. José Gálvez 450, Barranca"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f2329] border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Descripción o Ruta
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ruta interdistrital Barranca - Supe - UNAB..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f2329] border border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{isLoading ? 'Creando grupo...' : 'Registrar Grupo'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
