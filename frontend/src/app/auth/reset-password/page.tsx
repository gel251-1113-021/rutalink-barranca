'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import RutaLinkLogo, { RutaLinkIsotype } from '../../../components/Branding/RutaLinkLogo';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  useEffect(() => {
    // Comprobar si hay una sesión activa o si vino de un enlace de recuperación
    async function checkRecoverySession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsRecoverySession(true);
      }
    }

    checkRecoverySession();

    // Escuchar el evento de recuperación de contraseña de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setIsRecoverySession(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('La nueva contraseña debe tener como mínimo 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setErrorMsg(error.message || 'Error al actualizar la contraseña.');
      } else {
        setSuccessMsg('¡Tu contraseña ha sido actualizada con éxito! Redirigiendo...');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error inesperado al restablecer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0c0d0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#13161a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <RutaLinkIsotype className="w-12 h-12" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Restablecer Contraseña
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Crea una nueva contraseña segura para tu cuenta de RutaLink
          </p>
        </div>

        {/* Alertas */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nueva Contraseña (Mínimo 8 caracteres)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl bg-slate-50 dark:bg-[#181a20] border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50 active:scale-98"
          >
            {loading ? 'Guardando contraseña...' : 'Actualizar Contraseña'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center gap-1.5 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a RutaLink</span>
          </button>
        </div>

      </div>
    </main>
  );
}
