'use client';

import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  PhoneCall, 
  Send, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Radio, 
  HelpCircle 
} from 'lucide-react';

interface SmsFallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SMS_GATEWAY_NUMBER = '900123456';

const QUICK_COMMANDS = [
  {
    cmd: 'DONDE BARRANCA',
    title: 'Consultar Paradero Central',
    desc: 'Unidades en cola y tiempo estimado de salida hacia UNAB/Supe'
  },
  {
    cmd: 'RUTA UNAB',
    title: 'Ruta Troncal UNAB',
    desc: 'Tarifa oficial, kilometraje y unidades en circulación'
  },
  {
    cmd: 'SOS',
    title: 'Alerta SOS de Seguridad',
    desc: 'Notifica al contacto de emergencia y registra auditoría'
  }
];

export default function SmsFallbackModal({ isOpen, onClose }: SmsFallbackModalProps) {
  const [inputCommand, setInputCommand] = useState('DONDE BARRANCA');
  const [simulatedLog, setSimulatedLog] = useState<{
    cmd: string;
    reply: string;
    time: string;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  // Generar URI de SMS nativo para celulares móviles
  const nativeSmsUri = `sms:${SMS_GATEWAY_NUMBER}?body=${encodeURIComponent(inputCommand)}`;

  // Simulación en vivo llamando a /api/sms/inbound
  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/sms/inbound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone: '987654321',
          text: inputCommand
        })
      });

      const data = await res.json();
      setSimulatedLog({
        cmd: inputCommand,
        reply: data.reply || 'Sin respuesta del gateway',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    } catch (e) {
      setSimulatedLog({
        cmd: inputCommand,
        reply: '[RutaLink SMS Simulado] Paradero Base Central: 3 unidades en cola. Salidas continuas.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16181d] w-full max-w-md rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Gateway SMS Fallback (Modo Sin Datos)
              </h2>
              <p className="text-[11px] text-slate-500">
                Red 2G / GSM para zonas rurales y sin cobertura
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Explicación breve */}
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              ¿No tienes saldo o cobertura 4G en la Panamericana?
            </span>
            <p className="text-[11px] text-slate-500">
              Envía un mensaje de texto SMS regular al número institucional <strong className="font-mono text-slate-800 dark:text-slate-200">{SMS_GATEWAY_NUMBER}</strong> y el servidor te responderá en segundos.
            </p>
          </div>

          {/* Comandos Rápidos */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Selecciona o Escribe un Comando:
            </label>
            <div className="space-y-1.5">
              {QUICK_COMMANDS.map(qc => (
                <button
                  key={qc.cmd}
                  type="button"
                  onClick={() => setInputCommand(qc.cmd)}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    inputCommand === qc.cmd
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <span className="font-mono font-bold text-xs block">{qc.cmd}</span>
                    <span className="text-[10.5px] opacity-80">{qc.desc}</span>
                  </div>
                  {inputCommand === qc.cmd && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Campo de comando editable */}
          <div>
            <input
              type="text"
              value={inputCommand}
              onChange={e => setInputCommand(e.target.value.toUpperCase())}
              placeholder="Escribe tu comando (ej. DONDE BARRANCA)"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Acciones: Abrir SMS Nativo vs Simular en Navegador */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={nativeSmsUri}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5 text-center"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Abrir SMS Nativo</span>
            </a>

            <button
              type="button"
              disabled={isSimulating}
              onClick={handleSimulate}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSimulating ? 'Consultando...' : 'Probar Gateway'}</span>
            </button>
          </div>

          {/* Respuesta simulada */}
          {simulatedLog && (
            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="uppercase font-bold">Respuesta SMS Recibida</span>
                <span className="font-mono">{simulatedLog.time}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#121417] border border-slate-200/60 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
                {simulatedLog.reply}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
