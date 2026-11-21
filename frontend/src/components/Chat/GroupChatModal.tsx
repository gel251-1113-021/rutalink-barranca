'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MapPin, AlertTriangle, Users, MessageSquare, CheckCheck } from 'lucide-react';

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

interface GroupOption {
  id: string;
  name: string;
  type: string;
  description: string;
  badge: string;
}

const GROUPS: GroupOption[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Comité 1: Barranca - Supe - UNAB',
    type: 'EMPRESARIAL',
    description: 'Colectivos y Minivans autorizados',
    badge: 'Comité Oficial'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Comunidad UNAB - Viajes Compartidos',
    type: 'COMUNITARIO',
    description: 'Estudiantes y docentes (Carpooling)',
    badge: 'UNAB Estudiantes'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    name: 'Expreso Pativilca - Paramonga',
    type: 'EMPRESARIAL',
    description: 'Corredor Norte Panamericana',
    badge: 'Ruta Norte'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    name: 'Mototaxis y Colectivos Barranca',
    type: 'COMUNITARIO',
    description: 'Rutas urbanas y Mercado Modelo',
    badge: 'Urbano'
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
  const [selectedGroup, setSelectedGroup] = useState<GroupOption>(GROUPS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        // Reemplazar tempMsg con el persistido
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? data.message : m));
      }
    } catch (err) {
      console.error('Error enviando mensaje:', err);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#121418] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[90vh] sm:h-[80vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Cabecera Estilo WhatsApp */}
        <div className="px-4 py-3 bg-[#008069] dark:bg-[#1f2c34] text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-base">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold truncate max-w-[210px] leading-tight">
                  {selectedGroup.name}
                </h2>
              </div>
              <p className="text-[11px] text-emerald-100 dark:text-slate-300">
                {selectedGroup.description}
              </p>
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

        {/* Selector de Grupos (Pestañas horizontales) */}
        <div className="flex gap-1.5 p-2 bg-slate-100 dark:bg-[#181c22] border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-[11px] font-semibold no-scrollbar">
          {GROUPS.map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGroup(g)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition shrink-0 ${
                selectedGroup.id === g.id
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'bg-white dark:bg-[#20242b] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {g.badge}
            </button>
          ))}
        </div>

        {/* Área de Mensajes con Fondo WhatsApp */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#efeae2] dark:bg-[#0b141a] bg-opacity-95">
          {loading && messages.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-500">
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
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 shadow-xs text-xs relative ${
                    isNotice
                      ? 'bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100'
                      : isMe
                      ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 rounded-tr-none'
                      : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Nombre del remitente si no soy yo */}
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-bold text-[11px] text-[#008069] dark:text-[#25d366]">
                        {m.sender_name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                        {m.sender_role === 'CONDUCTOR_AFILIADO' ? 'Chofer' : m.sender_role === 'ENCARGADO_PARADERO' ? 'Despachador' : 'Pasajero'}
                      </span>
                    </div>
                  )}

                  {/* Cuerpo del Mensaje */}
                  {isNotice && (
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold mb-1 text-[10.5px]">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Aviso Oficial de Ruta / Tráfico</span>
                    </div>
                  )}

                  {isLocation && (
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-300 font-bold mb-1 text-[10.5px]">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>Ubicación Compartida en Tiempo Real</span>
                    </div>
                  )}

                  <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>

                  {/* Hora y Visto */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9.5px] text-slate-500 dark:text-slate-400">
                    <span>{formatTime(m.created_at)}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Botones de Acción Rápida (1 toque) */}
        <div className="px-3 py-1.5 bg-slate-50 dark:bg-[#161a20] border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <button
            type="button"
            onClick={() => handleSendMessage('📍 Me encuentro esperando en el paradero ahora mismo.', 'UBICACION')}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#20242b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 whitespace-nowrap flex items-center gap-1 shadow-2xs"
          >
            <MapPin className="w-3 h-3 text-blue-600" />
            <span>Compartir ubicación</span>
          </button>

          <button
            type="button"
            onClick={() => handleSendMessage('⚠️ Tráfico lento en Panamericana Norte altura Óvalo Pativilca.', 'AVISO_RUTA')}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#20242b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 whitespace-nowrap flex items-center gap-1 shadow-2xs"
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Aviso de tráfico</span>
          </button>
        </div>

        {/* Input de Mensaje */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-2.5 bg-white dark:bg-[#1e242b] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje al grupo..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-[#2a3942] text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-2xl bg-[#008069] hover:bg-[#006e5a] text-white disabled:opacity-40 transition shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
