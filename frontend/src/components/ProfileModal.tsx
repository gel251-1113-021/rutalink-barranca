'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { X, User, Phone, ShieldAlert, Star, CheckCircle2, Trash2, Heart, Camera } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPhotoUpload?: (title: string, category: 'PERFIL' | 'VEHICULO' | 'PARADERO' | 'LLEGADA') => void;
}

export default function ProfileModal({ isOpen, onClose, onOpenPhotoUpload }: ProfileModalProps) {
  const { user, profile, updateProfile, deleteAccount } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || user?.user_metadata?.phone || '');
  const [emergencyName, setEmergencyName] = useState(profile?.emergency_contact_name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(profile?.emergency_contact_phone || '');
  const [activeRole, setActiveRole] = useState<UserRole>(profile?.active_role || user?.user_metadata?.active_role || 'PASAJERO');
  const [driverLicense, setDriverLicense] = useState<string>((profile as any)?.license_number || '');
  const [roleChangeStep, setRoleChangeStep] = useState<'IDLE' | 'REQUIRE_LICENSE'>('IDLE');

  // Sincronizar automáticamente campos al abrir el modal o recibir perfil
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setEmergencyName(profile.emergency_contact_name || '');
      setEmergencyPhone(profile.emergency_contact_phone || '');
      setActiveRole(profile.active_role || 'PASAJERO');
    } else if (user) {
      const meta = user.user_metadata || {};
      setFullName(meta.full_name || '');
      setPhone(meta.phone || '');
      setActiveRole(meta.active_role || 'PASAJERO');
    }
  }, [profile, user, isOpen]);

  const [isUpdating, setIsUpdating] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Seguridad de 2 Pasos para Eliminación de Cuenta
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteOtpChannel, setDeleteOtpChannel] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [deleteOtpCode, setDeleteOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Temporizador de Cooldown para OTP
  React.useEffect(() => {
    let timer: any;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMsg(null);

    const res = await updateProfile({
      full_name: fullName,
      phone,
      emergency_contact_name: emergencyName,
      emergency_contact_phone: emergencyPhone,
      active_role: activeRole
    });

    setIsUpdating(false);
    if (res.error) {
      setMsg({ text: res.error, type: 'error' });
    } else {
      setMsg({ text: 'Perfil actualizado con éxito', type: 'success' });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleRequestDeleteOtp = async () => {
    setMsg(null);
    const targetIdentifier = deleteOtpChannel === 'EMAIL' ? user.email : (phone || user.email);
    if (!targetIdentifier) {
      setMsg({ text: 'No hay medio de contacto registrado para enviar el código.', type: 'error' });
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rutalink-backend.onrender.com';
      const res = await fetch(`${apiUrl}/api/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: deleteOtpChannel === 'EMAIL' ? user.email : undefined,
          phone: deleteOtpChannel === 'PHONE' ? phone : undefined,
          purpose: 'delete_account'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setOtpSent(true);
        setOtpCooldown(data.cooldownSeconds || 60);
        setMsg({ text: `Código de autorización enviado a ${targetIdentifier}. Revisa tu bandeja de entrada o spam.`, type: 'success' });
      } else {
        const errData = await res.json().catch(() => ({}));
        setMsg({ text: errData.error || `No se pudo enviar el código a ${targetIdentifier}. Intenta nuevamente.`, type: 'error' });
      }
    } catch {
      setMsg({ text: `Error de conexión al solicitar código. Verifica tu red.`, type: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteOtpCode || deleteOtpCode.trim().length !== 6) {
      setMsg({ text: 'Ingresa el código de seguridad de 6 dígitos recibido.', type: 'error' });
      return;
    }

    setIsDeleting(true);
    setMsg(null);
    const res = await deleteAccount(deleteOtpCode.trim(), phone);
    setIsDeleting(false);

    if (res.error) {
      setMsg({ text: res.error, type: 'error' });
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16181d] w-full max-w-md rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 flex items-center justify-center font-bold">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Mi Perfil y Seguridad</h2>
              <p className="text-[11px] text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 max-h-[80vh] overflow-y-auto space-y-4">
          {msg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${msg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 text-rose-700 dark:text-rose-300'
                }`}
            >
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Foto de Perfil / Cámara */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  {fullName.charAt(0) || 'U'}
                </div>
                {onOpenPhotoUpload && (
                  <button
                    type="button"
                    onClick={() => onOpenPhotoUpload('Foto de Perfil', 'PERFIL')}
                    title="Tomar o cambiar foto de perfil"
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white dark:bg-slate-800 text-blue-600 shadow-md border border-slate-200 dark:border-slate-700 hover:scale-105 transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {fullName || 'Usuario RutaLink'}
                </h3>
                <p className="text-[10.5px] text-slate-500">
                  {phone || 'Sin celular verificado'}
                </p>
              </div>
            </div>

            {onOpenPhotoUpload && (
              <button
                type="button"
                onClick={() => onOpenPhotoUpload('Foto de Perfil', 'PERFIL')}
                className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold hover:bg-blue-100 transition flex items-center gap-1"
              >
                <Camera className="w-3 h-3" />
                <span>Elegir Foto</span>
              </button>
            )}
          </div>

          {/* Tarjeta de Resumen / Calificación */}
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#1a1d22] border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Reputación en Barranca</span>
              <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{(parseFloat(String(profile?.rating || '5.0')) || 5.0).toFixed(1)} / 5.0</span>
                <span className="text-slate-400 font-normal">({profile?.total_trips || 0} viajes)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Estado</span>
              <div className="text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">
                {profile?.account_status || 'ACTIVO'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre y Apellidos
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Celular Verificado
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rol Activo
                </label>
                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold transition"
                >
                  <option value="PASAJERO">Pasajero</option>
                  <option value="CONDUCTOR_AFILIADO">Chofer Afiliado</option>
                  <option value="CONDUCTOR_INDEPENDIENTE">Chofer Indep.</option>
                  <option value="ENCARGADO_PARADERO">Despachador</option>
                  <option value="ADMIN_EMPRESA">Admin Empresa</option>
                </select>
              </div>
            </div>

            {/* Seguridad / Contacto SOS */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                Contacto de Emergencia (SOS Nocturno)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nombre contacto"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                />
                <input
                  type="tel"
                  placeholder="Celular SOS"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181a20] border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
            >
              {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>

          {/* Zona de Seguridad / Eliminación de Cuenta */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 block mb-1">
                Zona de Seguridad y Privacidad
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
                Elimina permanentemente tu cuenta, historial de viajes y datos de geolocalización.
              </p>
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Deseo eliminar mi cuenta con código de seguridad
                </button>
              ) : (
                <div className="space-y-3 pt-1 animate-in fade-in">
                  <div className="p-2.5 rounded-xl bg-rose-100/60 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-[11px] text-rose-900 dark:text-rose-200">
                    <p className="font-bold mb-1">⚠️ Confirmación de Seguridad Bancaria / 2 Pasos</p>
                    <p>Por seguridad de tus datos, se enviará un código OTP de 6 dígitos para autorizar el borrado irrevocable de tu cuenta.</p>
                  </div>

                  {/* Selector de Canal: Correo o WhatsApp */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Medio para recibir el código de autorización:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setDeleteOtpChannel('EMAIL')}
                        className={`p-2 rounded-xl border text-left font-semibold transition ${deleteOtpChannel === 'EMAIL'
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 font-bold'
                          : 'bg-white dark:bg-[#181a20] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                      >
                        <span className="block text-[11px]">📧 Correo</span>
                        <span className="text-[10px] text-slate-400 truncate block">{user.email}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteOtpChannel('PHONE')}
                        className={`p-2 rounded-xl border text-left font-semibold transition ${deleteOtpChannel === 'PHONE'
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 font-bold'
                          : 'bg-white dark:bg-[#181a20] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                      >
                        <span className="block text-[11px]">💬 WhatsApp / SMS</span>
                        <span className="text-[10px] text-slate-400 truncate block">{phone || 'No registrado'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Botón Solicitar Código */}
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleRequestDeleteOtp}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
                    >
                      Enviar Código de Autorización
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Ingresa código de 6 dígitos:</span>
                        {otpCooldown > 0 ? (
                          <span className="text-slate-400 font-mono">Reenviar en {otpCooldown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleRequestDeleteOtp}
                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                          >
                            Reenviar código
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Ingresa los 6 dígitos recibidos"
                        value={deleteOtpCode}
                        onChange={(e) => setDeleteOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 text-center tracking-widest font-mono font-bold text-sm rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-[#181a20] text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDelete(false);
                            setOtpSent(false);
                            setDeleteOtpCode('');
                          }}
                          className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting || deleteOtpCode.length !== 6}
                          onClick={handleDeleteAccount}
                          className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
                        >
                          {isDeleting ? 'Borrando...' : 'Confirmar Eliminación'}
                        </button>
                      </div>
                    </div>
                  )}

                  {!otpSent && (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
