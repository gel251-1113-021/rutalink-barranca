'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MapPin, 
  AlertTriangle, 
  Users, 
  MessageSquare, 
  CheckCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  Globe, 
  Plus, 
  Phone, 
  Info, 
  ShieldCheck, 
  Crown, 
  UserPlus, 
  Share2, 
  CheckCircle2,
  Car
} from 'lucide-react';

interface ChatMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  message_type: 'TEXTO' | 'AVISO_RUTA' | 'UBICACION' | 'AUDIO_SIMULADO';
  created_at: string;
}

interface GroupMember {
  userId: string;
  name: string;
  phone: string;
  role: 'CREADOR' | 'CO_ADMIN' | 'MIEMBRO';
  userType: 'PASAJERO' | 'CHOFER' | 'DESPACHADOR';
}

interface GroupOption {
  id: string;
  name: string;
  type: 'COMUNITARIO' | 'EMPRESARIAL';
  description: string;
  badge: string;
  isPrivate?: boolean;
  accessCode?: string;
  phone?: string;
  createdBy?: string;
  members: GroupMember[];
}

const INITIAL_GROUPS: GroupOption[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Comité 1: Barranca - Supe - UNAB',
    type: 'EMPRESARIAL',
    description: 'Colectivos y Minivans autorizados con base física en Av. Gálvez',
    badge: 'Comité 1 (Privado)',
    isPrivate: true,
    accessCode: 'COMITE1',
    phone: '+51 987654321',
    createdBy: 'a0000000-0000-0000-0000-000000000001',
    members: [
      { userId: 'a0000000-0000-0000-0000-000000000001', name: 'Carlos Mendoza (Gerente Comité)', phone: '+51 987654321', role: 'CREADOR', userType: 'CHOFER' },
      { userId: 'a0000000-0000-0000-0000-000000000002', name: 'Raúl Medina (Despachador Gálvez)', phone: '+51 987654322', role: 'CO_ADMIN', userType: 'DESPACHADOR' },
      { userId: 'a0000000-0000-0000-0000-000000000003', name: 'Jorge Huamán (Chofer Yaris)', phone: '+51 987654323', role: 'MIEMBRO', userType: 'CHOFER' },
      { userId: 'a0000000-0000-0000-0000-000000000005', name: 'Lucía Fernández (UNAB)', phone: '+51 987654325', role: 'MIEMBRO', userType: 'PASAJERO' }
    ]
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Comunidad UNAB - Viajes Compartidos',
    type: 'COMUNITARIO',
    description: 'Estudiantes y docentes de la UNAB organizando carpooling seguro',
    badge: 'UNAB Estudiantes (Público)',
    isPrivate: false,
    phone: '+51 987654325',
    createdBy: 'a0000000-0000-0000-0000-000000000005',
    members: [
      { userId: 'a0000000-0000-0000-0000-000000000005', name: 'Lucía Fernández (UNAB)', phone: '+51 987654325', role: 'CREADOR', userType: 'PASAJERO' },
      { userId: 'a0000000-0000-0000-0000-000000000006', name: 'Marcos Rivas (UNAB Ing)', phone: '+51 987654326', role: 'CO_ADMIN', userType: 'PASAJERO' },
      { userId: 'a0000000-0000-0000-0000-000000000007', name: 'Andrea Torres (UNAB Enfermería)', phone: '+51 987654327', role: 'MIEMBRO', userType: 'PASAJERO' }
    ]
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    name: 'Expreso Pativilca - Paramonga',
    type: 'EMPRESARIAL',
    description: 'Corredor Norte Panamericana y ruta Fortaleza',
    badge: 'Ruta Norte (Privado)',
    isPrivate: true,
    accessCode: 'NORTE2026',
    phone: '+51 987654328',
    createdBy: 'a0000000-0000-0000-0000-000000000008',
    members: [
      { userId: 'a0000000-0000-0000-0000-000000000008', name: 'Alberto Salas (Admin Norte)', phone: '+51 987654328', role: 'CREADOR', userType: 'CHOFER' },
      { userId: 'a0000000-0000-0000-0000-000000000005', name: 'Lucía Fernández (UNAB)', phone: '+51 987654325', role: 'MIEMBRO', userType: 'PASAJERO' }
    ]
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    name: 'Mototaxis y Colectivos Barranca Centro',
    type: 'COMUNITARIO',
    description: 'Rutas urbanas, Mercado Modelo, Hospital y Playa Chorrillos',
    badge: 'Urbano (Público)',
    isPrivate: false,
    phone: '+51 987654329',
    createdBy: 'a0000000-0000-0000-0000-000000000009',
    members: [
      { userId: 'a0000000-0000-0000-0000-000000000009', name: 'Luis Morales (Asoc. Mototaxis)', phone: '+51 987654329', role: 'CREADOR', userType: 'CHOFER' },
      { userId: 'a0000000-0000-0000-0000-000000000005', name: 'Lucía Fernández (UNAB)', phone: '+51 987654325', role: 'MIEMBRO', userType: 'PASAJERO' }
    ]
  }
];

interface GroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { id: string; name: string; role: string };
}

export default function GroupChatModal({
  isOpen,
  onClose,
  currentUser = { id: 'a0000000-0000-0000-0000-000000000005', name: 'Lucía Fernández (UNAB)', role: 'PASAJERO' }
}: GroupChatModalProps) {
  const [groups, setGroups] = useState<GroupOption[]>(INITIAL_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<GroupOption>(INITIAL_GROUPS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Control de grupos privados vs públicos
  const [unlockedGroupIds, setUnlockedGroupIds] = useState<string[]>([
    'b0000000-0000-0000-0000-000000000002', // Público UNAB
    'b0000000-0000-0000-0000-000000000004'  // Público Urbano
  ]);
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Modales Internos: Info del Grupo y Crear Grupo
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // Formulario Crear Grupo
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<'COMUNITARIO' | 'EMPRESARIAL'>('COMUNITARIO');
  const [newGroupIsPrivate, setNewGroupIsPrivate] = useState(false);
  const [newGroupAccessCode, setNewGroupAccessCode] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupPhone, setNewGroupPhone] = useState('');

  // Formulario Agregar Miembro
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isCurrentGroupLocked = selectedGroup.isPrivate && !unlockedGroupIds.includes(selectedGroup.id);

  // Verificar si el usuario actual es admin de este grupo (Creador o Co-Admin)
  const currentMemberRecord = selectedGroup.members.find(m => m.userId === currentUser.id);
  const isCurrentUserAdmin = 
    selectedGroup.createdBy === currentUser.id ||
    currentMemberRecord?.role === 'CREADOR' ||
    currentMemberRecord?.role === 'CO_ADMIN' ||
    currentUser.role === 'ADMIN_EMPRESA';

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUnlockGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcodeAttempt.trim()) return;

    if (
      !selectedGroup.accessCode ||
      passcodeAttempt.trim().toUpperCase() === selectedGroup.accessCode.toUpperCase()
    ) {
      setUnlockedGroupIds(prev => [...prev, selectedGroup.id]);
      setPasscodeAttempt('');
      setPasscodeError('');
      showToast('¡Acceso concedido al grupo privado!');
    } else {
      setPasscodeError(`Clave incorrecta. Clave de acceso de prueba: ${selectedGroup.accessCode}`);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cargar historial al abrir o cambiar de grupo
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/chat/groups/${selectedGroup.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        } else {
          // Mensajes demostrativos si aún no hay mensajes en base de datos
          setMessages([
            {
              id: 'm-1',
              group_id: selectedGroup.id,
              sender_id: 'a0000000-0000-0000-0000-000000000001',
              sender_name: 'Coordinador RutaLink',
              sender_role: 'ADMIN_EMPRESA',
              message: `¡Bienvenidos al grupo oficial "${selectedGroup.name}"! Este canal es para coordinación en tiempo real de viajes, rutas y avisos en Barranca.`,
              message_type: 'TEXTO',
              created_at: new Date(Date.now() - 3600000).toISOString()
            }
          ]);
        }
      } catch (err) {
        console.error('Error cargando chat:', err);
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 150);
      }
    };

    fetchMessages();
  }, [isOpen, selectedGroup.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (customText?: string, type: 'TEXTO' | 'AVISO_RUTA' | 'UBICACION' = 'TEXTO') => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      group_id: selectedGroup.id,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      message: textToSend.trim(),
      message_type: type,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMsg]);
    if (!customText) setInputText('');

    try {
      const res = await fetch(`/api/chat/groups/${selectedGroup.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          message: textToSend.trim(),
          messageType: type
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? data.message : m));
      }
    } catch (err) {
      console.error('Error enviando mensaje:', err);
    }
  };

  // Crear Nuevo Grupo (Pasajeros o Empresa)
  const handleCreateNewGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroupId = `group-${Date.now()}`;
    const accessCode = newGroupIsPrivate 
      ? (newGroupAccessCode.trim() || 'RUTALINK_' + Math.floor(100 + Math.random() * 900))
      : undefined;

    const newGroup: GroupOption = {
      id: newGroupId,
      name: newGroupName.trim(),
      type: newGroupType,
      description: newGroupDesc.trim() || (newGroupType === 'COMUNITARIO' ? 'Grupo de carpooling y movilidad compartida' : 'Comité de transporte de Barranca'),
      badge: `${newGroupName.trim().slice(0, 15)} (${newGroupIsPrivate ? 'Privado' : 'Público'})`,
      isPrivate: newGroupIsPrivate,
      accessCode,
      phone: newGroupPhone.trim() || '+51 987654325',
      createdBy: currentUser.id,
      members: [
        {
          userId: currentUser.id,
          name: currentUser.name,
          phone: newGroupPhone.trim() || '+51 987654325',
          role: 'CREADOR',
          userType: currentUser.role.includes('CONDUCTOR') ? 'CHOFER' : 'PASAJERO'
        }
      ]
    };

    setGroups(prev => [newGroup, ...prev]);
    setSelectedGroup(newGroup);
    setUnlockedGroupIds(prev => [...prev, newGroupId]);
    setShowCreateGroup(false);
    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupAccessCode('');
    setNewGroupPhone('');

    showToast(`¡Grupo "${newGroup.name}" creado con éxito! Eres el Administrador.`);
  };

  // Promover o Degradar Co-Administrador estilo WhatsApp
  const handleToggleAdmin = (memberId: string) => {
    if (!isCurrentUserAdmin) return;

    setGroups(prevGroups => prevGroups.map(g => {
      if (g.id !== selectedGroup.id) return g;
      const updatedMembers = g.members.map(m => {
        if (m.userId === memberId) {
          if (m.role === 'CREADOR') return m; // El creador no cambia
          const nextRole: 'CO_ADMIN' | 'MIEMBRO' = m.role === 'CO_ADMIN' ? 'MIEMBRO' : 'CO_ADMIN';
          return { ...m, role: nextRole };
        }
        return m;
      });
      return { ...g, members: updatedMembers };
    }));

    setSelectedGroup(prev => {
      const updatedMembers = prev.members.map(m => {
        if (m.userId === memberId) {
          if (m.role === 'CREADOR') return m;
          const nextRole: 'CO_ADMIN' | 'MIEMBRO' = m.role === 'CO_ADMIN' ? 'MIEMBRO' : 'CO_ADMIN';
          return { ...m, role: nextRole };
        }
        return m;
      });
      return { ...prev, members: updatedMembers };
    });

    showToast('Roles de administración de grupo actualizados.');
  };

  // Agregar Nuevo Miembro al Grupo
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember: GroupMember = {
      userId: `user-${Date.now()}`,
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || '+51 987654321',
      role: 'MIEMBRO',
      userType: 'PASAJERO'
    };

    setGroups(prevGroups => prevGroups.map(g => {
      if (g.id !== selectedGroup.id) return g;
      return { ...g, members: [...g.members, newMember] };
    }));

    setSelectedGroup(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));

    setNewMemberName('');
    setNewMemberPhone('');
    showToast(`¡${newMember.name} agregado al grupo!`);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const groupPhone = selectedGroup.phone || '+51 987654321';
  const cleanPhone = groupPhone.replace(/[^0-9]/g, '');
  const waGroupLink = `https://wa.me/${cleanPhone.startsWith('51') ? cleanPhone : '51' + cleanPhone}?text=${encodeURIComponent(`Hola, me comunico respecto al grupo "${selectedGroup.name}" en RutaLink Barranca.`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#121418] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[90vh] sm:h-[82vh] overflow-hidden animate-in slide-in-from-bottom duration-200 relative">
        
        {/* Notificación Toast flotante */}
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Cabecera Estilo WhatsApp con Multicanales (Llamada, WhatsApp, Info) */}
        <div className="px-4 py-3 bg-[#008069] dark:bg-[#1f2c34] text-white flex items-center justify-between shrink-0 shadow-sm">
          <div 
            onClick={() => setShowGroupInfo(true)}
            className="flex items-center gap-3 cursor-pointer hover:opacity-95 transition flex-1 min-w-0 pr-2"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-base shrink-0">
              {selectedGroup.type === 'EMPRESARIAL' ? '🚖' : '👥'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold truncate leading-tight">
                  {selectedGroup.name}
                </h2>
                {isCurrentUserAdmin && (
                  <span className="text-[9px] bg-amber-400 text-slate-900 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-100 dark:text-slate-300 truncate">
                {selectedGroup.members.length} miembros • Toca para info y ajustes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Multicanal: Llamada Directa */}
            <a
              href={`tel:${groupPhone}`}
              title="Llamar al número de contacto del grupo"
              className="p-2 rounded-full hover:bg-white/20 transition text-white"
            >
              <Phone className="w-4 h-4" />
            </a>

            {/* Multicanal: WhatsApp Directo */}
            <a
              href={waGroupLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir chat en WhatsApp del teléfono"
              className="p-2 rounded-full hover:bg-white/20 transition text-emerald-300"
            >
              <MessageSquare className="w-4 h-4" />
            </a>

            {/* Info del Grupo */}
            <button
              type="button"
              onClick={() => setShowGroupInfo(true)}
              title="Ver participantes y administración del grupo"
              className="p-2 rounded-full hover:bg-white/20 transition text-white"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Pestañas de Grupos + Botón '+ Crear Grupo' */}
        <div className="flex items-center gap-2 p-2.5 bg-slate-100 dark:bg-[#181c22] border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs sm:text-sm font-bold no-scrollbar">
          {/* Botón Crear Nuevo Grupo */}
          <button
            type="button"
            onClick={() => setShowCreateGroup(true)}
            className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition flex items-center gap-1.5 shrink-0 shadow-2xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Grupo</span>
          </button>

          {groups.map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setSelectedGroup(g);
                setShowGroupInfo(false);
              }}
              className={`px-3.5 py-2 rounded-2xl whitespace-nowrap transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
                selectedGroup.id === g.id
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white font-black shadow-2xs'
                  : 'bg-white dark:bg-[#20242b] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold'
              }`}
            >
              {g.isPrivate ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Globe className="w-3.5 h-3.5 text-blue-500" />}
              <span>{g.badge}</span>
            </button>
          ))}
        </div>

        {/* VISTA 1: INFORMACIÓN Y ADMINISTRACIÓN DEL GRUPO (ESTILO WHATSAPP) */}
        {showGroupInfo ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50 dark:bg-[#111317] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-bold">
                  {selectedGroup.type === 'EMPRESARIAL' ? '🚖' : '👥'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedGroup.name}</h3>
                  <span className="text-[11px] text-slate-500">
                    Tipo: {selectedGroup.type === 'EMPRESARIAL' ? 'Empresa de Transporte' : 'Comunidad de Pasajeros'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGroupInfo(false)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1d22] border border-slate-200 dark:border-slate-700"
              >
                Volver al Chat
              </button>
            </div>

            {/* Descripción y Estado */}
            <div className="p-3.5 bg-white dark:bg-[#181c22] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Descripción del Grupo</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedGroup.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                <span className="text-slate-500">Privacidad:</span>
                <span className="font-bold flex items-center gap-1 text-slate-800 dark:text-slate-200">
                  {selectedGroup.isPrivate ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-500" /> Privado (Clave: {selectedGroup.accessCode || 'COMITE1'})
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5 text-blue-500" /> Público (Abierto a toda Barranca)
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Canales de Contacto Directo */}
            <div className="p-3.5 bg-white dark:bg-[#181c22] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Canales de Contacto Externo</span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${groupPhone}`}
                  className="py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-2 border border-blue-200/60 hover:bg-blue-100 transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Llamar {groupPhone}</span>
                </a>
                <a
                  href={waGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200/60 hover:bg-emerald-100 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Grupo</span>
                </a>
              </div>
            </div>

            {/* Participantes y Designación de Administradores */}
            <div className="p-3.5 bg-white dark:bg-[#181c22] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Miembros y Administradores</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedGroup.members.length} Participantes
                  </p>
                </div>
                {isCurrentUserAdmin && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Panel de Administración
                  </span>
                )}
              </div>

              {/* Lista de Miembros */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedGroup.members.map((member) => {
                  const isCreator = member.role === 'CREADOR';
                  const isCoAdmin = member.role === 'CO_ADMIN';
                  const isMe = member.userId === currentUser.id;

                  return (
                    <div
                      key={member.userId}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1e222a] flex items-center justify-between border border-slate-200/70 dark:border-slate-700/60 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                          {isCreator ? <Crown className="w-4 h-4 text-amber-500" /> : isCoAdmin ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {member.name} {isMe && '(Tú)'}
                            </span>
                            {isCreator && (
                              <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
                                Creador
                              </span>
                            )}
                            {isCoAdmin && (
                              <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded-full border border-emerald-300">
                                Co-Admin
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">{member.phone}</span>
                        </div>
                      </div>

                      {/* Botón de Co-Administrador para el Admin del Grupo */}
                      {isCurrentUserAdmin && !isCreator && !isMe && (
                        <button
                          type="button"
                          onClick={() => handleToggleAdmin(member.userId)}
                          className={`text-[10.5px] font-bold px-2 py-1 rounded-lg border transition ${
                            isCoAdmin
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {isCoAdmin ? 'Quitar Admin' : 'Hacer Co-Admin'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Agregar Miembro Rápido si es Admin */}
              {isCurrentUserAdmin && (
                <form onSubmit={handleAddMemberSubmit} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Agregar Miembro al Grupo</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nombre (ej. Juan Pérez)"
                      value={newMemberName}
                      onChange={e => setNewMemberName(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181a20] text-slate-900 dark:text-white"
                    />
                    <input
                      type="tel"
                      placeholder="Celular (ej. 987654321)"
                      value={newMemberPhone}
                      onChange={e => setNewMemberPhone(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181a20] text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 text-white font-bold text-xs transition"
                  >
                    + Registrar Miembro
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : showCreateGroup ? (
          /* VISTA 2: FORMULARIO PARA CREAR NUEVO GRUPO (PASAJEROS O EMPRESA) */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50 dark:bg-[#111317]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Crear Nuevo Grupo de Barranca</h3>
                <p className="text-[11px] text-slate-500">Quedarás configurado automáticamente como Administrador</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateGroup(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewGroupSubmit} className="space-y-3.5">
              {/* Tipo de Grupo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Grupo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGroupType('COMUNITARIO')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      newGroupType === 'COMUNITARIO'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-[#1a1d22] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-bold">👥 Pasajeros / Carpool</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Comunidad UNAB, vecinos y rutas habituales</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewGroupType('EMPRESARIAL')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      newGroupType === 'EMPRESARIAL'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 font-bold ring-2 ring-blue-500/20'
                        : 'bg-white dark:bg-[#1a1d22] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-bold">🚖 Empresa / Comité</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Línea de colectivos, combis y minivans</span>
                  </button>
                </div>
              </div>

              {/* Nombre del Grupo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Grupo
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder={newGroupType === 'COMUNITARIO' ? 'Ej. Pasajeros UNAB Supe - Noche' : 'Ej. Comité 4 Colectivos Paramonga'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181a20] text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              {/* Privacidad */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Privacidad y Acceso
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGroupIsPrivate(false)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      !newGroupIsPrivate
                        ? 'bg-slate-900 text-white dark:bg-emerald-600'
                        : 'bg-white dark:bg-[#1a1d22] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Público</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewGroupIsPrivate(true)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      newGroupIsPrivate
                        ? 'bg-slate-900 text-white dark:bg-emerald-600'
                        : 'bg-white dark:bg-[#1a1d22] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Privado</span>
                  </button>
                </div>
              </div>

              {/* Clave si es Privado */}
              {newGroupIsPrivate && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Código de Acceso / Clave de Invitación
                  </label>
                  <input
                    type="text"
                    value={newGroupAccessCode}
                    onChange={e => setNewGroupAccessCode(e.target.value)}
                    placeholder="Ej. UNAB2026 o BARRANCA1"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181a20] font-mono uppercase tracking-wider text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* Teléfono de Contacto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Celular de Contacto (Para llamadas y WhatsApp)
                </label>
                <input
                  type="tel"
                  value={newGroupPhone}
                  onChange={e => setNewGroupPhone(e.target.value)}
                  placeholder="Ej. +51 987654321"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181a20] text-slate-900 dark:text-white"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción o Referencia de Ruta
                </label>
                <textarea
                  rows={2}
                  value={newGroupDesc}
                  onChange={e => setNewGroupDesc(e.target.value)}
                  placeholder="Detalles sobre el punto de encuentro, horarios o tarifa referencial..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181a20] text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
                >
                  Crear y Ser Administrador
                </button>
              </div>
            </form>
          </div>
        ) : isCurrentGroupLocked ? (
          /* VISTA 3: GRUPO PRIVADO BLOQUEADO */
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-[#111317]">
            <div className="w-14 h-14 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3 shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Grupo Privado y Cerrado
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-4">
              Este grupo pertenece a <strong className="text-slate-800 dark:text-slate-200">{selectedGroup.name}</strong> y requiere código de acceso para ver y participar.
            </p>

            <form onSubmit={handleUnlockGroup} className="w-full max-w-xs space-y-2.5">
              <div className="relative">
                <input
                  type="text"
                  value={passcodeAttempt}
                  onChange={e => {
                    setPasscodeAttempt(e.target.value);
                    setPasscodeError('');
                  }}
                  placeholder="Ingresa clave (ej. COMITE1)"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181a20] font-mono font-bold text-center uppercase tracking-wider focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {passcodeError && (
                <p className="text-[11px] text-rose-500 font-semibold">{passcodeError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Desbloquear y Acceder al Grupo</span>
              </button>
            </form>
          </div>
        ) : (
          /* VISTA 4: CHAT ACTIVO ESTILO WHATSAPP */
          <>
            <div className="flex-1 p-4 overflow-y-auto overscroll-contain touch-scroll space-y-3 bg-[#efeae2] dark:bg-[#0b141a] bg-opacity-95 pb-6">
              {loading && messages.length === 0 && (
                <div className="text-center py-6 text-sm text-slate-500">
                  Cargando mensajes del grupo...
                </div>
              )}

              {messages.map((m) => {
                const isMe = m.sender_id === currentUser.id;
                const isNotice = m.message_type === 'AVISO_RUTA';
                const isLocation = m.message_type === 'UBICACION';

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-xs text-xs sm:text-sm relative ${
                        isNotice
                          ? 'bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100'
                          : isMe
                          ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 rounded-tr-none'
                          : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-slate-100 rounded-tl-none'
                      }`}
                    >
                      {/* Remitente si no soy yo */}
                      {!isMe && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-bold text-xs text-[#008069] dark:text-[#25d366]">
                            {m.sender_name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                            {m.sender_role === 'CONDUCTOR_AFILIADO' ? 'Chofer' : m.sender_role === 'ENCARGADO_PARADERO' ? 'Despachador' : m.sender_role.includes('ADMIN') ? 'Admin' : 'Pasajero'}
                          </span>
                        </div>
                      )}

                      {/* Aviso oficial */}
                      {isNotice && (
                        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold mb-1 text-xs">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Aviso Oficial de Ruta / Tráfico</span>
                        </div>
                      )}

                      {/* Ubicación compartida */}
                      {isLocation && (
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-300 font-bold mb-1 text-xs">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span>Ubicación Compartida en Tiempo Real</span>
                        </div>
                      )}

                      <p className="leading-relaxed whitespace-pre-wrap font-medium">{m.message}</p>

                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>{formatTime(m.created_at)}</span>
                        {isMe && <CheckCheck className="w-4 h-4 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Acciones Rápidas (1 Toque) */}
            <div className="px-3 py-2 bg-slate-50 dark:bg-[#161a20] border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => handleSendMessage('📍 Me encuentro esperando en el paradero ahora mismo.', 'UBICACION')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#20242b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 whitespace-nowrap flex items-center gap-1.5 shadow-2xs font-semibold active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Compartir ubicación</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage('⚠️ Tráfico lento en Panamericana Norte altura Óvalo Pativilca.', 'AVISO_RUTA')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#20242b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 whitespace-nowrap flex items-center gap-1.5 shadow-2xs font-semibold active:scale-95"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Aviso de tráfico</span>
              </button>
            </div>

            {/* Formulario de Mensaje */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white dark:bg-[#1e242b] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe un mensaje al grupo..."
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-[#2a3942] text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-12 h-12 rounded-2xl bg-[#008069] hover:bg-[#006e5a] text-white disabled:opacity-40 transition shadow-xs flex items-center justify-center shrink-0 active:scale-95"
                aria-label="Enviar mensaje"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
