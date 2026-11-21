'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Send, 
  ShieldCheck, 
  MapPin, 
  DollarSign, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Car
} from 'lucide-react';

interface AgreementRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverData: {
    id: string;
    name: string;
    plate: string;
    brandModel: string;
    rating: number;
  } | null;
}

export default function AgreementRoomModal({ isOpen, onClose, driverData }: AgreementRoomModalProps) {
  const { user } = useAuth();

  const [origin, setOrigin] = useState('UNAB Campus Barranca');
  const [destination, setDestination] = useState('Plaza de Supe');
  const [agreedPrice, setAgreedPrice] = useState('3.50');
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'm1',
      sender_name: 'Sistema RutaLink',
      message: 'Sala efímera 1 a 1 auditada. Pacta el punto exacto de recojo y la tarifa antes de abordar.',
      created_at: new Date().toISOString(),
      is_system: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isPacted, setIsPacted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !driverData) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender_name: user?.email?.split('@')[0] || 'Tú',
      message: inputText.trim(),
      created_at: new Date().toISOString(),
      is_system: false
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Respuesta simulada inteligente del chofer si es prueba
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `msg_drv_${Date.now()}`,
          sender_name: driverData.name,
          message: `De acuerdo. Te recojo en ${origin} por S/. ${agreedPrice}. Voy en camino en el ${driverData.brandModel} (${driverData.plate}).`,
          created_at: new Date().toISOString(),
          is_system: false
        }
      ]);
    }, 1200);
  };

  const handleConfirmPact = () => {
    setIsPacted(true);
    setMessages(prev => [
      ...prev,
      {
        id: `sys_${Date.now()}`,
        sender_name: 'Seguridad RutaLink',
        message: `✓ Acuerdo cerrado con éxito por S/. ${agreedPrice}. Viaje auditado y enlazado al monitoreo satelital.`,
        created_at: new Date().toISOString(),
        is_system: true
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121417] w-full max-w-lg rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col h-[85vh] max-h-[600px]">
        {/* Cabecera Editorial Blanco/Azul/Negro */}
        <div className="px-4 py-3 bg-white dark:bg-[#121417] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  Acuerdo 1 a 1: {driverData.name}
                </h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60">
                  ★ {driverData.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {driverData.brandModel} · Placa <strong className="font-mono text-slate-700 dark:text-slate-300">{driverData.plate}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ficha Resumen del Pacto (Pre-acuerdo) */}
        <div className="p-3 bg-slate-50/80 dark:bg-[#16181d] border-b border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-white dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Origen</span>
            <input
              type="text"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              className="w-full text-[11px] font-semibold text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none truncate"
            />
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Destino</span>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-full text-[11px] font-semibold text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none truncate"
            />
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Tarifa (S/.)</span>
            <div className="flex items-center gap-0.5">
              <span className="text-[11px] text-slate-400 font-bold">S/.</span>
              <input
                type="number"
                step="0.5"
                value={agreedPrice}
                onChange={e => setAgreedPrice(e.target.value)}
                className="w-full text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Área de Mensajes Auditados */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs bg-slate-50/40 dark:bg-[#0f1115]">
          {messages.map(m => {
            if (m.is_system) {
              return (
                <div key={m.id} className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-center text-[11px] text-blue-800 dark:text-blue-300">
                  {m.message}
                </div>
              );
            }

            const isMe = m.sender_name === (user?.email?.split('@')[0] || 'Tú');

            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400 font-medium">
                  <span>{m.sender_name}</span>
                  <span>·</span>
                  <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[80%] leading-relaxed ${
                    isMe
                      ? 'bg-slate-900 dark:bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-[#1a1d22] text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {m.message}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Barra de Entrada y Botón de Pacto */}
        <div className="p-3 bg-white dark:bg-[#121417] border-t border-slate-100 dark:border-slate-800 space-y-2">
          {!isPacted ? (
            <button
              type="button"
              onClick={handleConfirmPact}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar y Cerrar Acuerdo (S/. {agreedPrice})</span>
            </button>
          ) : (
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Acuerdo Activo · Monitoreo de Ubicación Iniciado</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Escribe un mensaje de coordinación..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#1a1d22] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500 transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
