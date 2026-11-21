'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { X, Mail, Lock, User, Phone, CheckCircle2, AlertCircle, Compass } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, resetPassword } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('PASAJERO');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      onClose();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const res = await register(email, password, fullName, phone, role);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('¡Cuenta registrada exitosamente!');
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const res = await resetPassword(email);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Enlace de recuperación enviado a tu correo.');
    }
  };

  // Cuentas de demostración rápida verificadas
  const quickDemoAccounts = [
    { label: 'Admin Empresa', email: 'admin.barranca@rutalink.pe', pass: 'RutaLink2026Admin!' },
    { label: 'Despachador Supe', email: 'despachador.supe@rutalink.pe', pass: 'RutaLink2026Desp!' },
    { label: 'Chofer Afiliado', email: 'chofer.pativilca@rutalink.pe', pass: 'RutaLink2026Chofer!' },
    { label: 'Chofer Independiente', email: 'chofer.indep@rutalink.pe', pass: 'RutaLink2026Indep!' },
    { label: 'Estudiante UNAB', email: 'estudiante.unab@rutalink.pe', pass: 'RutaLink2026Estudiante!' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16181d] w-full max-w-md rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {tab === 'login' ? 'Iniciar Sesión' : tab === 'register' ? 'Crear Cuenta' : 'Recuperar Contraseña'}
              </h2>
              <p className="text-[11px] text-slate-500">RutaLink Barranca</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        {tab !== 'forgot' && (
          <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2.5 transition border-b-2 text-center ${
                tab === 'login'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Ingresar
            </button>
            <button
              onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2.5 transition border-b-2 text-center ${
                tab === 'register'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Registrarse
            </button>
          </div>
        )}

        <div className="p-4 sm:p-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Formulario Login */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@rutalink.pe"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[11px] text-blue-600 hover:text-blue-500 font-medium"
                  >
                    ¿Olvidaste tu clave?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
              >
                {loading ? 'Validando...' : 'Entrar a RutaLink'}
              </button>

              {/* Botón rápido de demo */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider text-center">
                  Cuentas de Prueba Verificadas (1 Toque)
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickDemoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword(acc.pass);
                      }}
                      className="text-left px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 dark:bg-slate-800/60 dark:hover:bg-blue-950/40 border border-slate-200/70 hover:border-blue-200 text-[11px] text-slate-700 dark:text-slate-300 transition"
                    >
                      <div className="font-semibold truncate">{acc.label}</div>
                      <div className="text-[9px] text-slate-400 truncate">{acc.email.split('@')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* Formulario Register */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="987654321"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rol Inicial
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  <option value="PASAJERO">Pasajero (UNAB / General)</option>
                  <option value="CONDUCTOR_AFILIADO">Conductor Afiliado (Línea)</option>
                  <option value="CONDUCTOR_INDEPENDIENTE">Conductor Independiente</option>
                  <option value="ENCARGADO_PARADERO">Encargado de Paradero (Despacho)</option>
                  <option value="ADMIN_EMPRESA">Administrador de Empresa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
              >
                {loading ? 'Creando cuenta...' : 'Registrar Cuenta'}
              </button>
            </form>
          )}

          {/* Formulario Forgot */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <p className="text-xs text-slate-500">
                Ingresa el correo asociado a tu cuenta para enviarte un enlace de recuperación.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
              </button>

              <button
                type="button"
                onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
              >
                Volver al inicio de sesión
              </button>
            </form>
          )}

          {/* Modo Invitado */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition font-medium"
            >
              Continuar explorando en Modo Invitado (Sin Registro)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
