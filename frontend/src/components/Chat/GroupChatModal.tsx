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
  Car,
  Clock,
  Compass,
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';

interface ChatMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  message_type: 'TEXTO' | 'AVISO_RUTA' | 'UBICACION' | 'AUDIO_SIMULADO' | 'NEGOCIACION';
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
  type: 'COMUNITARIO' | 'EMPRESARIAL' | 'DIRECTO_1A1';
  description: string;
  badge: string;
  isPrivate?: boolean;
  accessCode?: string;
  phone?: string;
  createdBy?: string;
  vehiclePlate?: string;
  driverName?: string;
  vehicleModel?: string;
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
  },
  // CHATS DIRECTOS 1 A 1 (NEGOCIACIONES Y CARRERAS)
  {
    id: 'direct-01',
    name: 'Jorge Huamán · Toyota Yaris (B1A-789)',
    type: 'DIRECTO_1A1',
    description: 'Coordinación directa de viaje ruta Barranca Centro - UNAB',
    badge: 'Yaris B1A-789',
    isPrivate: false,
    phone: '+51 987654323',
    vehiclePlate: 'B1A-789',
    driverName: 'Jorge Huamán Castillo',
    vehicleModel: 'Toyota Yaris Sedán 2023',
    members: [
      { userId: 'a0000000-0000-0000-0000-000000000003', name: 'Jorge Huamán', phone: '+51 987654323', role: 'CREADOR', userType: 'CHOFER' },
      { userId: 'a0000000-0000-0000-0000-000000000005', name: 'Lucía Fernández (UNAB)', phone: '+51 987654325', role: 'MIEMBRO', userType: 'PASAJERO' }
    ]
  },
  {
    id: 'direct-02',
    name: 'Pedro Chumpitaz · Combi HiAce (Z9P-140)',
    type: 'DIRECTO_1A1',
    description: 'Línea Interdistrital Barranca - Supe - Puerto Supe',
    badge: 'Combi Z9P-140',
    isPrivate: false,
    phone: '+51 987654330',
    vehiclePlate: 'Z9P-140',
    driverName: 'Pedro Chumpitaz Solís',
    vehicleModel: 'Toyota HiAce Combi 2024',
    members: [
      { userId: 'd-driver-02', name: 'Pedro Chumpitaz', phone: '+51 987654330', role: 'CREADOR', userType: 'CHOFER' },
      { userId: 'a0000000-0000-0000-0000-000000000005', name: 'Lucía Fernández (UNAB)', phone: '+51 987654325', role: 'MIEMBRO', userType: 'PASAJERO' }
    ]
  }
];

const PASSENGER_QUICK_CHIPS = [
  '📍 Estoy en el paradero ahora',
  '⏱️ ¿A cuántos minutos estás?',
  '🪑 ¿Tienes asientos libres?',
  '🔔 Me bajo en la próxima esquina',
  '💰 ¿Cuánto es el pasaje?',
  '🎒 Llevo equipaje/mochila',
  '✅ Confirmado, te espero'
];

const DRIVER_QUICK_CHIPS = [
  '🟢 Unidad en camino hacia tu punto',
  '⏳ Llego en 3 minutos exactos',
  '🛑 Llegué al paradero indicado',
  '⚠️ Mucho tráfico en Panamericana',
  '🪑 Tengo 2 asientos disponibles',
  '✅ Asiento reservado para ti'
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
  const [activeTabMode, setActiveTabMode] = useState<'CORREDORES' | 'DIRECTOS'>('CORREDORES');
  const [groups, setGroups] = useState<GroupOption[]>(INITIAL_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<GroupOption>(INITIAL_GROUPS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Control de grupos privados vs públicos
  const [unlockedGroupIds, setUnlockedGroupIds] = useState<string[]>([
    'b0000000-0000-0000-0000-000000000002', // Público UNAB
    'b0000000-0000-0000-0000-000000000004', // Público Urbano
    'direct-01',
    'direct-02'
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

  // Verificar si el usuario actual es admin de este grupo
  const currentMemberRecord = selectedGroup.members.find(m => m.userId === currentUser.id);
  const isCurrentUserAdmin = 
    selectedGroup.createdBy === currentUser.id ||
    currentMemberRecord?.role === 'CREADOR' ||
    currentMemberRecord?.role === 'CO_ADMIN' ||
    currentUser.role === 'ADMIN_EMPRESA';

  const isDriverUser = currentUser.role.includes('CONDUCTOR') || currentUser.role.includes('CHOFER');
  const quickChips = isDriverUser ? DRIVER_QUICK_CHIPS : PASSENGER_QUICK_CHIPS;

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
          // Mensajes demostrativos contextuales
          const isDirect = selectedGroup.type === 'DIRECTO_1A1';
          setMessages([
            {
              id: 'm-1',
              group_id: selectedGroup.id,
              sender_id: selectedGroup.createdBy || 'system',
              sender_name: isDirect ? (selectedGroup.driverName || 'Conductor') : 'Coordinación RutaLink',
              sender_role: isDirect ? 'CONDUCTOR_AFILIADO' : 'ADMIN_EMPRESA',
              message: isDirect
                ? `Hola, soy ${selectedGroup.driverName || 'el conductor'}. Estoy al volante del ${selectedGroup.vehicleModel || 'vehículo'} (${selectedGroup.vehiclePlate || 'placa'}). ¿A dónde te diriges?`
                : `¡Bienvenidos al canal oficial "${selectedGroup.name}"! Este espacio comunitario es para coordinación en tiempo real de viajes, rutas y avisos en toda la provincia de Barranca.`,
              message_type: 'TEXTO',
              created_at: new Date(Date.now() - 1800000).toISOString()
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

    showToast(`¡Canal "${newGroup.name}" creado con éxito! Eres el Administrador.`);
  };

  // Promover o Degradar Co-Administrador
  const handleToggleAdmin = (memberId: string) => {
    if (!isCurrentUserAdmin) return;

    setGroups(prevGroups => prevGroups.map(g => {
      if (g.id !== selectedGroup.id) return g;
      const updatedMembers = g.members.map(m => {
        if (m.userId === memberId) {
          if (m.role === 'CREADOR') return m;
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

    showToast('Roles actualizados correctamente.');
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
    showToast(`¡${newMember.name} agregado al canal!`);
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
  const waGroupLink = `https://wa.me/${cleanPhone.startsWith('51') ? cleanPhone : '51' + cleanPhone}?text=${encodeURIComponent(`Hola, me comunico respecto al transporte "${selectedGroup.name}" en RutaLink Barranca.`)}`;

  const visibleGroups = groups.filter(g => {
    if (activeTabMode === 'DIRECTOS') return g.type === 'DIRECTO_1A1';
    return g.type !== 'DIRECTO_1A1';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#111317] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[92vh] sm:h-[84vh] overflow-hidden animate-in slide-in-from-bottom duration-200 relative">
        
        {/* Notificación Toast flotante */}
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Cabecera Estilo WhatsApp / Red Comunitaria */}
        <div className="px-4 py-3 bg-[#0a5c4d] dark:bg-[#162329] text-white flex items-center justify-between shrink-0 shadow-xs">
          <div 
            onClick={() => setShowGroupInfo(true)}
            className="flex items-center gap-3 cursor-pointer hover:opacity-95 transition flex-1 min-w-0 pr-2"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-base shrink-0">
              {selectedGroup.type === 'DIRECTO_1A1' ? '🚗' : selectedGroup.type === 'EMPRESARIAL' ? '🚖' : '👥'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold truncate leading-tight">
                  {selectedGroup.name}
                </h2>
                {isCurrentUserAdmin && selectedGroup.type !== 'DIRECTO_1A1' && (
                  <span className="text-[9px] bg-amber-400 text-slate-900 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-100/90 dark:text-slate-300 truncate flex items-center gap-1">
                <span>{selectedGroup.type === 'DIRECTO_1A1' ? (selectedGroup.vehiclePlate || 'Directo') : `${selectedGroup.members.length} miembros`}</span>
                <span>•</span>
                <span className="text-emerald-300 dark:text-emerald-400 font-semibold">Toca para detalles</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Llamada Directa */}
            <a
              href={`tel:${groupPhone}`}
              title="Llamar al número de contacto"
              className="p-2 rounded-full hover:bg-white/20 transition text-white"
            >
              <Phone className="w-4 h-4" />
            </a>

            {/* WhatsApp Directo */}
            <a
              href={waGroupLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir WhatsApp del teléfono"
              className="p-2 rounded-full hover:bg-white/20 transition text-emerald-300"
            >
              <MessageSquare className="w-4 h-4" />
            </a>

            {/* Info */}
            <button
              type="button"
              onClick={() => setShowGroupInfo(true)}
              title="Información y participantes"
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

        {/* Conmutador de Modo: Corredores Viales vs Negociaciones 1 a 1 */}
        <div className="grid grid-cols-2 bg-slate-100 dark:bg-[#161a20] border-b border-slate-200 dark:border-slate-800 p-1 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTabMode('CORREDORES');
              const firstCorridor = groups.find(g => g.type !== 'DIRECTO_1A1');
              if (firstCorridor) setSelectedGroup(firstCorridor);
            }}
            className={`py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTabMode === 'CORREDORES'
                ? 'bg-white dark:bg-[#20252e] text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Corredores Viales</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTabMode('DIRECTOS');
              const firstDirect = groups.find(g => g.type === 'DIRECTO_1A1');
              if (firstDirect) setSelectedGroup(firstDirect);
            }}
            className={`py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTabMode === 'DIRECTOS'
                ? 'bg-white dark:bg-[#20252e] text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-blue-600" />
            <span>Chats de Carrera (1 a 1)</span>
          </button>
        </div>

        {/* Carrusel Horizontal de Canales Activos */}
        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-[#14171d] border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-semibold no-scrollbar">
          {activeTabMode === 'CORREDORES' && (
            <button
              type="button"
              onClick={() => setShowCreateGroup(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1 shrink-0 shadow-2xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Canal</span>
            </button>
          )}

          {visibleGroups.map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setSelectedGroup(g);
                setShowGroupInfo(false);
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition shrink-0 flex items-center gap-1.5 active:scale-95 ${
                selectedGroup.id === g.id
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white font-black shadow-2xs'
                  : 'bg-white dark:bg-[#1e232b] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {g.type === 'DIRECTO_1A1' ? (
                <Car className="w-3.5 h-3.5 text-blue-400" />
              ) : g.isPrivate ? (
                <Lock className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
              )}
              <span>{g.badge}</span>
            </button>
          ))}
        </div>

        {/* VISTA 1: INFORMACIÓN Y ADMINISTRACIÓN */}
        {showGroupInfo ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50 dark:bg-[#111317] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-bold">
                  {selectedGroup.type === 'DIRECTO_1A1' ? '🚗' : selectedGroup.type === 'EMPRESARIAL' ? '🚖' : '👥'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedGroup.name}</h3>
                  <span className="text-[11px] text-slate-500">
                    {selectedGroup.type === 'DIRECTO_1A1' ? 'Negociación 1 a 1' : selectedGroup.type === 'EMPRESARIAL' ? 'Comité Provincial' : 'Comunidad de Pasajeros'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGroupInfo(false)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1d22] border border-slate-200 dark:border-slate-700"
              >
                Volver
              </button>
            </div>

            {/* Ficha Técnica si es Directo con Vehículo */}
            {selectedGroup.type === 'DIRECTO_1A1' && selectedGroup.vehiclePlate && (
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Datos de la Unidad y Conductor</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Placa de Rodaje:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedGroup.vehiclePlate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Vehículo:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedGroup.vehicleModel}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Descripción */}
            <div className="p-3.5 bg-white dark:bg-[#181c22] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Descripción del Canal</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedGroup.description}
              </p>
            </div>

            {/* Contacto Directo */}
            <div className="p-3.5 bg-white dark:bg-[#181c22] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Canales Directos</span>
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
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Participantes */}
            <div className="p-3.5 bg-white dark:bg-[#181c22] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedGroup.members.length} Participantes
                </span>
                {isCurrentUserAdmin && selectedGroup.type !== 'DIRECTO_1A1' && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Modo Administrador
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                                Creador
                              </span>
                            )}
                            {isCoAdmin && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                                Co-Admin
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">{member.phone}</span>
                        </div>
                      </div>

                      {isCurrentUserAdmin && !isCreator && !isMe && selectedGroup.type !== 'DIRECTO_1A1' && (
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

              {isCurrentUserAdmin && selectedGroup.type !== 'DIRECTO_1A1' && (
                <form onSubmit={handleAddMemberSubmit} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Agregar Miembro</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nombre (ej. Juan)"
                      value={newMemberName}
                      onChange={e => setNewMemberName(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181a20]"
                    />
                    <input
                      type="tel"
                      placeholder="Celular (987...)"
                      value={newMemberPhone}
                      onChange={e => setNewMemberPhone(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181a20]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 text-white font-bold text-xs"
                  >
                    + Registrar Miembro
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : showCreateGroup ? (
          /* VISTA 2: CREAR NUEVO CANAL */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50 dark:bg-[#111317]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nuevo Canal de Comunicación</h3>
                <p className="text-[11px] text-slate-500">Quedarás como Administrador del canal</p>
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
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Finalidad del Canal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGroupType('COMUNITARIO')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      newGroupType === 'COMUNITARIO'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 font-bold'
                        : 'bg-white dark:bg-[#1a1d22] border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold">👥 Carpool / Pasajeros</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">UNAB, Supe, Caral y vecinos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewGroupType('EMPRESARIAL')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      newGroupType === 'EMPRESARIAL'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 font-bold'
                        : 'bg-white dark:bg-[#1a1d22] border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold">🚖 Empresa / Comité</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Línea de colectivos y combis</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Canal
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="Ej. Colectivos Supe - Barranca Noche"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181a20]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Acceso
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGroupIsPrivate(false)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      !newGroupIsPrivate ? 'bg-slate-900 text-white dark:bg-emerald-600' : 'bg-white dark:bg-[#1a1d22]'
                    }`}
                  >
                    Público
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGroupIsPrivate(true)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      newGroupIsPrivate ? 'bg-slate-900 text-white dark:bg-emerald-600' : 'bg-white dark:bg-[#1a1d22]'
                    }`}
                  >
                    Privado
                  </button>
                </div>
              </div>

              {newGroupIsPrivate && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clave de Acceso
                  </label>
                  <input
                    type="text"
                    value={newGroupAccessCode}
                    onChange={e => setNewGroupAccessCode(e.target.value)}
                    placeholder="Ej. BARRANCA2026"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181a20] font-mono uppercase"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  value={newGroupPhone}
                  onChange={e => setNewGroupPhone(e.target.value)}
                  placeholder="+51 987654321"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181a20]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  Crear Canal
                </button>
              </div>
            </form>
          </div>
        ) : isCurrentGroupLocked ? (
          /* VISTA 3: CANAL PRIVADO */
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-[#111317]">
            <div className="w-14 h-14 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Canal Privado de Coordinación
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-4">
              Ingresa el código de acceso autorizado para entrar a <strong className="text-slate-800 dark:text-slate-200">{selectedGroup.name}</strong>.
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
                  placeholder="Clave (ej. COMITE1)"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181a20] font-mono font-bold text-center uppercase tracking-wider"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {passcodeError && (
                <p className="text-[11px] text-rose-500 font-semibold">{passcodeError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Desbloquear Canal</span>
              </button>
            </form>
          </div>
        ) : (
          /* VISTA 4: CHAT ACTIVO CON RESPUESTAS RÁPIDAS (SMART CHIPS) */
          <>
            {/* Mensajes */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto overscroll-contain touch-scroll space-y-2.5 bg-[#efeae2] dark:bg-[#0b141a] bg-opacity-95">
              {loading && messages.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  Cargando mensajes del canal...
                </div>
              )}

              {/* Mensaje de Seguridad Comunitaria */}
              <div className="flex justify-center my-1">
                <div className="bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700/80 text-[10px] text-amber-900 dark:text-amber-200 px-3 py-1 rounded-xl shadow-2xs flex items-center gap-1.5 max-w-sm text-center">
                  <Lock className="w-3 h-3 text-amber-700 dark:text-amber-300 shrink-0" />
                  <span>Comunicaciones cifradas para la red de transporte provincial de Barranca.</span>
                </div>
              </div>

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
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 shadow-2xs text-xs relative ${
                        isNotice
                          ? 'bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100'
                          : isMe
                          ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 rounded-tr-none'
                          : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-slate-100 rounded-tl-none'
                      }`}
                    >
                      {!isMe && (
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-[11px] text-[#008069] dark:text-[#25d366]">
                            {m.sender_name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                            {m.sender_role === 'CONDUCTOR_AFILIADO' ? 'Chofer' : m.sender_role === 'ENCARGADO_PARADERO' ? 'Despachador' : m.sender_role.includes('ADMIN') ? 'Admin' : 'Pasajero'}
                          </span>
                        </div>
                      )}

                      {isNotice && (
                        <div className="flex items-center gap-1 text-amber-800 dark:text-amber-300 font-bold mb-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Aviso Oficial de Ruta / Tráfico</span>
                        </div>
                      )}

                      {isLocation && (
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-300 font-bold mb-1 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>Punto de Espera Compartido</span>
                        </div>
                      )}

                      <p className="leading-relaxed whitespace-pre-wrap font-medium">{m.message}</p>

                      <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>{formatTime(m.created_at)}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Smart Chips de Respuesta Rápida de 1 Toque */}
            <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#14171d] border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] uppercase font-black text-slate-400 shrink-0 pl-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Rápido:</span>
              </span>
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip, chip.includes('📍') ? 'UBICACION' : chip.includes('⚠️') ? 'AVISO_RUTA' : 'TEXTO')}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1e232b] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-semibold whitespace-nowrap shrink-0 shadow-2xs active:scale-95 transition"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Formulario de Mensaje */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 bg-white dark:bg-[#1e242b] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => handleSendMessage('📍 Me encuentro en el paradero ahora.', 'UBICACION')}
                title="Enviar ubicación"
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#2a3942] text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center justify-center shrink-0 transition"
              >
                <MapPin className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe un mensaje de coordinación..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#2a3942] text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-xl bg-[#008069] hover:bg-[#006e5a] text-white disabled:opacity-40 transition shadow-xs flex items-center justify-center shrink-0 active:scale-95"
                aria-label="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
