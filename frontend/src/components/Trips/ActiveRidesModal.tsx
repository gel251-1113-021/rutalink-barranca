'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io, Socket } from 'socket.io-client';
import { 
  X, 
  Car, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  Phone, 
  ShieldCheck, 
  KeyRound, 
  Send, 
  AlertTriangle,
  Navigation,
  Check,
  RefreshCw
} from 'lucide-react';
import { notificationService } from '../../lib/notifications';

export interface ActiveRideItem {
  id: string;
  requestId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone?: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  plate: string;
  brandModel: string;
  origin: string;
  destination: string;
  fare: string;
  pin: string;
  status: 'PENDIENTE' | 'CONFIRMADA' | 'A_BORDO' | 'FINALIZADA';
  createdAt: string;
}

interface ActiveRidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRides?: ActiveRideItem[];
  onUpdateRideStatus?: (rideId: string, newStatus: 'PENDIENTE' | 'CONFIRMADA' | 'A_BORDO' | 'FINALIZADA') => void;
}

export default function ActiveRidesModal({
  isOpen,
  onClose,
  activeRides = [],
  onUpdateRideStatus = () => {}
}: ActiveRidesModalProps) {
  const { user, profile } = useAuth();
  const currentRole = profile?.active_role || 'PASAJERO';
  const isDriver = currentRole === 'CONDUCTOR_AFILIADO' || currentRole === 'CONDUCTOR_INDEPENDIENTE' || currentRole === 'CHOFER' || currentRole === 'CONDUCTOR';

  const [selectedRide, setSelectedRide] = useState<ActiveRideItem | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Chat en tiempo real interno
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (activeRides.length > 0 && !selectedRide) {
      setSelectedRide(activeRides[0]);
    }
  }, [activeRides, selectedRide]);

  useEffect(() => {
    if (!isOpen) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rutalink-backend.onrender.com';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 4,
      auth: { userId: user?.id }
    });
    socketRef.current = socket;

    if (user?.id) {
      socket.emit('register_user', {
        userId: user.id,
        role: currentRole,
        name: profile?.full_name || 'Usuario'
      });
    }

    socket.on('ride_chat_message', (msg: any) => {
      setChatMessages(prev => [...prev, msg]);
      notificationService.playChime('message');
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, user?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!isOpen) return null;

  const handleSendInternalChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !selectedRide) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      rideId: selectedRide.id,
      sender: profile?.full_name || user?.email?.split('@')[0] || (isDriver ? 'Conductor' : 'Pasajero'),
      text: chatInputText.trim(),
      isDriver,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInputText('');

    if (socketRef.current) {
      const targetUserId = isDriver ? selectedRide.passengerId : selectedRide.driverId;
      socketRef.current.emit('send_ride_chat', {
        targetUserId,
        message: newMsg,
        fromUserId: user?.id
      });
    }
  };

  const handleValidateBoardingPin = () => {
    if (!selectedRide) return;
    if (pinInput.trim() === selectedRide.pin) {
      setPinError(false);
      onUpdateRideStatus(selectedRide.id, 'A_BORDO');
      setSelectedRide({ ...selectedRide, status: 'A_BORDO' });
      setChatMessages(prev => [
        ...prev,
        {
          id: `pin-${Date.now()}`,
          sender: 'Seguridad RutaLink',
          text: '✓ PIN de seguridad validado con éxito. Pasajero a bordo del vehículo.',
          isSystem: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16181d] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabecera */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-base">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
                  Seguimiento Satelital
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Mis Carreras en Tiempo Real
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {activeRides.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Car className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No tienes carreras activas en este momento
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {isDriver
                  ? 'Activa tu transmisión satelital para recibir solicitudes de pasajeros en la provincia de Barranca.'
                  : 'Puedes acordar una carrera expreso directamente desde el mapa con cualquier chofer en línea.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selector si hay más de 1 carrera */}
              {activeRides.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {activeRides.map(ride => (
                    <button
                      key={ride.id}
                      onClick={() => setSelectedRide(ride)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                        selectedRide?.id === ride.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {ride.origin.split(' ')[0]} ➔ {ride.destination.split(' ')[0]} (S/ {ride.fare})
                    </button>
                  ))}
                </div>
              )}

              {selectedRide && (
                <>
                  {/* Ficha Resumen de la Carrera Pactada */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {isDriver ? 'Pasajero a Bordo:' : 'Conductor Asignado:'}
                        </span>
                        <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                          {isDriver ? selectedRide.passengerName : selectedRide.driverName}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {selectedRide.brandModel} · Placa <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedRide.plate}</strong>
                        </span>
                      </div>

                      {/* Tarifa y Estado */}
                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-bold block">Tarifa Acordada</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          S/ {selectedRide.fare}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-0.5 ${
                          selectedRide.status === 'CONFIRMADA'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : selectedRide.status === 'A_BORDO'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {selectedRide.status === 'CONFIRMADA' ? 'En Camino al Recojo' : selectedRide.status === 'A_BORDO' ? 'Viaje en Progreso' : 'Finalizada'}
                        </span>
                      </div>
                    </div>

                    {/* Ruta de Recojo y Destino */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span><strong>Recojo:</strong> {selectedRide.origin}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Destino:</strong> {selectedRide.destination}</span>
                      </div>
                    </div>

                    {/* PIN de Abordaje Seguro */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <span className="font-bold text-amber-950 dark:text-amber-200 block">
                            Código PIN de Seguridad: <strong className="font-mono text-sm tracking-widest text-amber-900 dark:text-amber-100 bg-white dark:bg-black/30 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">{selectedRide.pin}</strong>
                          </span>
                          <span className="text-[10px] text-amber-700 dark:text-amber-300">
                            {isDriver ? 'Solicita este PIN al pasajero para validar el abordaje.' : 'Muestra este código al chofer al momento de subir a la unidad.'}
                          </span>
                        </div>
                      </div>

                      {/* Botón de Validación para Conductor */}
                      {isDriver && selectedRide.status === 'CONFIRMADA' && (
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="PIN"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                            className="w-16 px-2 py-1 text-center font-mono font-bold rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleValidateBoardingPin}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                          >
                            Validar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mensajería Interna en Tiempo Real */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col bg-slate-50 dark:bg-[#181a20]">
                    <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1c1f26] flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>Chat en Vivo de la Carrera</span>
                      </div>
                      <span className="text-[10.5px] font-normal text-slate-400">
                        Canal privado auditado
                      </span>
                    </div>

                    <div className="p-3 h-48 overflow-y-auto space-y-2 text-xs">
                      {chatMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                          Escribe aquí para coordinar el recojo con tu contraparte en tiempo real.
                        </div>
                      ) : (
                        chatMessages.map(msg => (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${
                              msg.isSystem
                                ? 'items-center text-center'
                                : (msg.isDriver === isDriver ? 'items-end' : 'items-start')
                            }`}
                          >
                            {msg.isSystem ? (
                              <div className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-[10.5px] text-slate-600 dark:text-slate-400">
                                {msg.text}
                              </div>
                            ) : (
                              <div
                                className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                                  msg.isDriver === isDriver
                                    ? 'bg-blue-600 text-white rounded-br-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                <span className="block text-[9.5px] opacity-80 font-bold mb-0.5">
                                  {msg.sender}
                                </span>
                                <p className="text-xs">{msg.text}</p>
                                <span className="block text-[9px] opacity-70 text-right mt-0.5">
                                  {msg.time}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendInternalChat} className="p-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1c1f26] flex gap-2">
                      <input
                        type="text"
                        value={chatInputText}
                        onChange={(e) => setChatInputText(e.target.value)}
                        placeholder="Escribe un mensaje de coordinación..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={!chatInputText.trim()}
                        className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                  {/* Acciones de la Carrera */}
                  <div className="flex gap-2 pt-2">
                    {selectedRide.status === 'A_BORDO' && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateRideStatus(selectedRide.id, 'FINALIZADA');
                          notificationService.notify({
                            title: '✓ Viaje Finalizado',
                            body: `Carrera hacia ${selectedRide.destination} completada con éxito.`,
                            type: 'ride_request'
                          });
                          onClose();
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                      >
                        <Check className="w-4 h-4" />
                        <span>Marcar Viaje como Completado</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
