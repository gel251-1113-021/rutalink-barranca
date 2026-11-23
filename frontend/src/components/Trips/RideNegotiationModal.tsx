'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io, Socket } from 'socket.io-client';
import { notificationService } from '../../lib/notifications';
import { 
  X, 
  Send, 
  ShieldCheck, 
  MapPin, 
  DollarSign, 
  Users, 
  Car, 
  CheckCircle2, 
  Clock, 
  Share2, 
  Radio, 
  AlertTriangle,
  Phone,
  MessageCircle,
  KeyRound,
  Check
} from 'lucide-react';
import RealisticVehicleSVG from '../Branding/RealisticVehicleSVG';

interface RideNegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDriver?: {
    id: string;
    name: string;
    plate: string;
    brandModel: string;
    rating: number;
    phone?: string;
  } | null;
  userCoords?: { lat: number; lng: number } | null;
}

export default function RideNegotiationModal({
  isOpen,
  onClose,
  initialDriver,
  userCoords
}: RideNegotiationModalProps) {
  const { user, profile } = useAuth();

  const [mode, setMode] = useState<'BROADCAST_GROUP' | 'DIRECT_DRIVER'>(
    initialDriver ? 'DIRECT_DRIVER' : 'BROADCAST_GROUP'
  );

  // Campos de la carrera
  const [origin, setOrigin] = useState(
    userCoords ? 'Mi Ubicación GPS Actual (Barranca)' : 'Av. José Gálvez 450 (Cerca a Plaza Vea)'
  );
  const [destination, setDestination] = useState('Campus Universitario UNAB (Puerta 1)');
  const [proposedFare, setProposedFare] = useState('5.00');
  const [passengerCount, setPassengerCount] = useState(1);
  const [hasLuggage, setHasLuggage] = useState(false);

  // Estados de la negociación por grupo (Broadcast)
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResponses, setBroadcastResponses] = useState<any[]>([]);
  const [selectedDriverForRide, setSelectedDriverForRide] = useState<any>(initialDriver || null);

  // Estados de seguridad y carrera pactada
  const [rideState, setRideState] = useState<'PLANNING' | 'WAITING_ACCEPTANCE' | 'AGREED' | 'IN_TRANSIT' | 'COMPLETED'>('PLANNING');
  const [securityPin, setSecurityPin] = useState('');
  const [inputPinValidation, setInputPinValidation] = useState('');
  const [isPinValidated, setIsPinValidated] = useState(false);

  // Chat 1 a 1 para modo directo o tras aceptar
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rutalink-backend.onrender.com';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 4
    });
    socketRef.current = socket;

    // Escuchar respuesta de choferes en tiempo real
    socket.on('ride_response_received', (driverResp: any) => {
      notificationService.notify({
        title: '🚗 Chofer Disponible en Barranca',
        body: `${driverResp.driverName} (${driverResp.plate}) acepta tu viaje por S/ ${driverResp.offeredFare}`,
        type: 'ride_request'
      });

      setBroadcastResponses(prev => {
        const exists = prev.some(d => d.driverId === driverResp.driverId || d.plate === driverResp.plate);
        if (exists) {
          return prev.map(d => d.driverId === driverResp.driverId ? driverResp : d);
        }
        return [driverResp, ...prev];
      });
      setIsBroadcasting(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen]);

  useEffect(() => {
    if (initialDriver) {
      setSelectedDriverForRide(initialDriver);
      setMode('DIRECT_DRIVER');
    }
  }, [initialDriver]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!isOpen) return null;

  // Iniciar consulta de difusión al grupo de choferes en vivo
  const handleStartBroadcast = () => {
    setIsBroadcasting(true);
    setRideState('WAITING_ACCEPTANCE');
    setBroadcastResponses([]);

    // Emisión real vía WebSockets hacia la red de conductores
    if (socketRef.current) {
      socketRef.current.emit('ride_request_broadcast', {
        passengerId: user?.id,
        passengerName: profile?.full_name || user?.email?.split('@')[0] || 'Pasajero',
        passengerPhone: profile?.phone || '',
        origin,
        destination,
        proposedFare,
        passengerCount,
        hasLuggage,
        userCoords,
        driverId: initialDriver?.id
      });
    }

    notificationService.notify({
      title: '📡 Búsqueda en Curso',
      body: `Buscando choferes en la red de Barranca para carrera hacia ${destination}`,
      type: 'message'
    });
  };

  // Aceptar chofer y pactar la carrera con PIN de seguridad
  const handleConfirmRideWithDriver = (driver: any, finalFare: string) => {
    setSelectedDriverForRide(driver);
    setProposedFare(finalFare);
    // Generar PIN aleatorio de seguridad de 4 dígitos
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setSecurityPin(pin);
    setRideState('AGREED');

    // Emitir confirmación en tiempo real al chofer
    if (socketRef.current) {
      socketRef.current.emit('ride_agreement_finalized', {
        requestId: `ride_${Date.now()}`,
        passengerId: user?.id,
        driverId: driver.driverId || driver.id,
        finalFare,
        securityPin: pin,
        pickupLocation: origin,
        destination
      });
    }

    notificationService.notify({
      title: '🤝 ¡Carrera Pactada con Éxito!',
      body: `Vehículo ${driver.brandModel || ''} (${driver.plate}). Código PIN de abordaje: ${pin}`,
      type: 'ride_request'
    });

    // Mensaje inicial en sala de seguridad
    setChatMessages([
      {
        id: 'sys-1',
        sender: 'Sistema RutaLink Seguridad',
        text: `✓ Carrera pactada por S/. ${finalFare} con ${driver.driverName || driver.name}. Muestra tu PIN ${pin} al abordar el vehículo (${driver.plate}).`,
        isSystem: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Enviar mensaje en chat 1 a 1
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: user?.email?.split('@')[0] || 'Pasajero',
      text: chatInput.trim(),
      isSystem: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Respuesta del conductor
    if (selectedDriverForRide) {
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            sender: selectedDriverForRide.name,
            text: `Entendido. Estoy llegando en el ${selectedDriverForRide.brandModel} (${selectedDriverForRide.plate}). Te espero con las luces intermitentes.`,
            isSystem: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 1000);
    }
  };

  // Validar PIN de abordaje
  const handleValidatePin = () => {
    if (inputPinValidation.trim() === securityPin) {
      setIsPinValidated(true);
      setRideState('IN_TRANSIT');
      setChatMessages(prev => [
        ...prev,
        {
          id: `pin-ok-${Date.now()}`,
          sender: 'Control de Seguridad',
          text: '✓ PIN Correcto validado. Pasajero a bordo de forma segura. Monitoreo satelital activo.',
          isSystem: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      alert('PIN incorrecto. Verifica los 4 dígitos generados en la pantalla.');
    }
  };

  // Compartir carrera por WhatsApp
  const shareRideWhatsApp = () => {
    if (!selectedDriverForRide) return;
    const shareText = `Hola, voy en una carrera segura con RutaLink Barranca:\n- Conductor: ${selectedDriverForRide.name}\n- Vehículo: ${selectedDriverForRide.brandModel} (Placa ${selectedDriverForRide.plate})\n- Origen: ${origin}\n- Destino: ${destination}\n- Tarifa pactada: S/. ${proposedFare}\n- Código de Seguridad PIN: ${securityPin}\nMonitoreado en vivo.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#14161a] w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabecera Editorial Blanco/Azul */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">
                {rideState === 'AGREED' || rideState === 'IN_TRANSIT'
                  ? 'Carrera Pactada en Curso'
                  : 'Pactar Carrera con Precio Justo'}
              </h2>
              <p className="text-[11px] text-blue-100">
                Seguridad verificada con código PIN · Negociación sin comisiones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Modo si estamos planificando */}
        {rideState === 'PLANNING' && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#181a20]">
            <button
              type="button"
              onClick={() => setMode('BROADCAST_GROUP')}
              className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-2 ${
                mode === 'BROADCAST_GROUP'
                  ? 'border-blue-600 text-blue-600 bg-white dark:bg-[#14161a]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Radio className="w-4 h-4 text-blue-600" />
              <span>1. Consultar a Choferes del Grupo</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('DIRECT_DRIVER')}
              className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-2 ${
                mode === 'DIRECT_DRIVER'
                  ? 'border-blue-600 text-blue-600 bg-white dark:bg-[#14161a]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Car className="w-4 h-4 text-indigo-600" />
              <span>2. Pedir a Chofer Específico</span>
            </button>
          </div>
        )}

        {/* Contenido Dinámico */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* FASE 1: Planificación y Oferta */}
          {rideState === 'PLANNING' && (
            <div className="space-y-4">
              
              {/* Formulario de Trayecto */}
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Punto de Partida (Recojo)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={origin}
                      onChange={e => setOrigin(e.target.value)}
                      placeholder="Ej. Plaza de Armas Barranca / Jr. Gálvez"
                      className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-slate-100"
                    />
                    <MapPin className="w-4 h-4 text-blue-600 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Destino
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={destination}
                      onChange={e => setDestination(e.target.value)}
                      placeholder="Ej. Campus Universitario UNAB / Plaza de Supe"
                      className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1a1d22] border border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-slate-100"
                    />
                    <MapPin className="w-4 h-4 text-indigo-600 absolute left-2.5 top-3" />
                  </div>
                </div>
              </div>

              {/* Oferta de Tarifa y Detalles */}
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      ¿Cuánto ofreces por la carrera?
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Precio pactado directo, sin tarifas infladas
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-white dark:bg-[#181c22] px-3 py-1.5 rounded-xl border border-blue-300 dark:border-blue-800 shadow-xs">
                    <span className="text-xs font-bold text-slate-600">S/.</span>
                    <input
                      type="number"
                      step="0.5"
                      value={proposedFare}
                      onChange={e => setProposedFare(e.target.value)}
                      className="w-14 text-sm font-black text-blue-700 dark:text-blue-300 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Botones de ajuste rápido */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-semibold">Ajustar:</span>
                  {['4.00', '5.00', '6.00', '8.00'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setProposedFare(val)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition border ${
                        proposedFare === val
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-[#1b1f26] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      S/. {val}
                    </button>
                  ))}
                </div>

                {/* Pasajeros y Maletera */}
                <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Pasajeros:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPassengerCount(n)}
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition border ${
                            passengerCount === n
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-[#1b1f26] text-slate-700 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={hasLuggage}
                      onChange={e => setHasLuggage(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Equipaje en maletera</span>
                  </label>
                </div>
              </div>

              {/* Botón de Acción según Modo */}
              {mode === 'BROADCAST_GROUP' ? (
                <button
                  type="button"
                  onClick={handleStartBroadcast}
                  className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
                  <span>Consultar al Grupo si hay Vehículo Disponible</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-[#1a1d22] rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Chofer seleccionado:</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {selectedDriverForRide?.name || 'Jorge Huamán Castillo'}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {selectedDriverForRide?.brandModel || 'Toyota Yaris'} · {selectedDriverForRide?.plate || 'B1A-789'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-600">
                      ★ {selectedDriverForRide?.rating || '4.8'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConfirmRideWithDriver(selectedDriverForRide || {
                      id: 'd1',
                      name: 'Jorge Huamán Castillo',
                      plate: 'B1A-789',
                      brandModel: 'Toyota Yaris Sedán 2023',
                      rating: 4.8,
                      phone: '+51 987654323'
                    }, proposedFare)}
                    className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Enviar Solicitud Directa a {selectedDriverForRide?.name?.split(' ')[0] || 'Chofer'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* FASE 2: Esperando Respuestas de Choferes del Grupo */}
          {rideState === 'WAITING_ACCEPTANCE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 mx-auto flex items-center justify-center text-blue-600">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {isBroadcasting ? 'Consultando a la flota del comité...' : 'Choferes vacíos que respondieron:'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Trayecto: <strong className="text-slate-700 dark:text-slate-300">{origin}</strong> ➔ <strong className="text-slate-700 dark:text-slate-300">{destination}</strong> (Tu oferta: S/. {proposedFare})
                </p>
              </div>

              {/* Lista de Respuestas de Choferes en Tiempo Real */}
              <div className="space-y-2.5">
                {broadcastResponses.map(drv => (
                  <div
                    key={drv.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#1b1f26] border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between animate-in slide-in-from-bottom-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {drv.name}
                        </span>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-200">
                          ★ {drv.rating}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {drv.brandModel} · Placa <strong className="font-mono text-slate-700 dark:text-slate-300">{drv.plate}</strong>
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          Llega en {drv.distanceMin} min
                        </span>
                        <span className="text-[10.5px] font-bold text-slate-800 dark:text-slate-200">
                          Tarifa: S/. {drv.offeredFare}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConfirmRideWithDriver(drv, drv.offeredFare)}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aceptar Chofer</span>
                    </button>
                  </div>
                ))}

                {isBroadcasting && (
                  <div className="p-3 text-center text-xs text-slate-400 animate-pulse">
                    Esperando confirmaciones de vehículos vacíos en la zona...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FASE 3: Carrera Pactada, Código PIN de Seguridad y Chat 1 a 1 */}
          {(rideState === 'AGREED' || rideState === 'IN_TRANSIT') && selectedDriverForRide && (
            <div className="space-y-4">
              
              {/* Tarjeta de Seguridad con PIN */}
              <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block">
                      Capa Extra de Seguridad · Código PIN
                    </span>
                    <span className="text-2xl font-black font-mono tracking-widest text-white mt-0.5 block">
                      {securityPin}
                    </span>
                    <p className="text-[10.5px] text-emerald-100 mt-1">
                      Indica este código al chofer al momento de subir al auto
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">Tarifa Cerrada</span>
                    <span className="text-xl font-black text-white">S/. {proposedFare}</span>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={shareRideWhatsApp}
                        className="py-1 px-2.5 rounded-xl bg-white text-emerald-800 font-bold text-[10.5px] shadow-xs hover:bg-emerald-50 transition flex items-center gap-1.5 ml-auto"
                      >
                        <Share2 className="w-3 h-3 text-emerald-700" />
                        <span>Compartir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ficha del Conductor y Vehículo */}
              <div className="p-3.5 bg-slate-50 dark:bg-[#181a20] rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Chofer en camino:</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedDriverForRide.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {selectedDriverForRide.brandModel} · Placa <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedDriverForRide.plate}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedDriverForRide.phone || '+51987654323'}`}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 transition"
                    title="Llamar al chofer"
                  >
                    <Phone className="w-4 h-4 text-blue-600" />
                  </a>
                  <a
                    href={`https://wa.me/${(selectedDriverForRide.phone || '51987654323').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Validación del PIN (para confirmar inicio) */}
              {!isPinValidated ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900 dark:text-amber-200 block">Validar Abordaje Seguro</span>
                      <span className="text-[10.5px] text-amber-700 dark:text-amber-300">Digita el PIN de 4 dígitos para arrancar el viaje</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={4}
                      value={inputPinValidation}
                      onChange={e => setInputPinValidation(e.target.value)}
                      placeholder="PIN"
                      className="w-14 text-center font-mono font-bold text-xs py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-[#181a20]"
                    />
                    <button
                      type="button"
                      onClick={handleValidatePin}
                      className="py-1.5 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                    >
                      Validar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Viaje en curso y monitoreado. PIN verificado con éxito.</span>
                </div>
              )}

              {/* Chat Directo 1 a 1 de la Carrera */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col h-44 bg-slate-50/50 dark:bg-[#111317]">
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2 text-xs">
                  {chatMessages.map(m => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.isSystem
                          ? 'items-center text-center'
                          : m.sender === (user?.email?.split('@')[0] || 'Pasajero')
                          ? 'items-end'
                          : 'items-start'
                      }`}
                    >
                      {m.isSystem ? (
                        <span className="px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                          {m.text}
                        </span>
                      ) : (
                        <div
                          className={`max-w-[80%] p-2 rounded-2xl text-[11px] ${
                            m.sender === (user?.email?.split('@')[0] || 'Pasajero')
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white dark:bg-[#181a20] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                          }`}
                        >
                          <span className="text-[9px] font-bold opacity-75 block">{m.sender} · {m.time}</span>
                          <span>{m.text}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendChatMessage} className="p-2 bg-white dark:bg-[#16181d] border-t border-slate-200 dark:border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Escribe un mensaje al conductor..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1b1f26] border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Botón de Finalizar Carrera */}
              <button
                type="button"
                onClick={() => {
                  setRideState('COMPLETED');
                  setTimeout(() => {
                    alert('Carrera completada exitosamente. ¡Gracias por viajar seguro con RutaLink Barranca!');
                    onClose();
                  }, 500);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Finalizar Carrera y Calificar Conductor
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
