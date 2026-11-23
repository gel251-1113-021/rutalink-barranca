'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, fullName: string, phone: string, role: UserRole) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>;
  switchRole: (newRole: UserRole) => Promise<void>;
  deleteAccount: (code?: string, phone?: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar sesión inicial
  useEffect(() => {
    async function loadSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Verificar si el caché local coincide con el usuario actual de Supabase
          if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('rutalink_user_session');
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                if (parsed?.id && parsed.id !== session.user.id) {
                  // Si el caché pertenece a otro usuario previo, limpiarlo de inmediato
                  localStorage.removeItem('rutalink_user_session');
                }
              } catch {
                localStorage.removeItem('rutalink_user_session');
              }
            }
          }
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('rutalink_user_session');
          }
        }
      } catch (err) {
        console.error('[Auth Error] Error cargando sesión:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Descartar caché si pertenece a otro usuario
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('rutalink_user_session');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed?.id && parsed.id !== session.user.id) {
                localStorage.removeItem('rutalink_user_session');
              }
            } catch {
              localStorage.removeItem('rutalink_user_session');
            }
          }
        }
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rutalink_user_session');
          localStorage.removeItem('rutalink_session');
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      // 1. Intentar consultar tabla profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
        if (typeof window !== 'undefined') {
          localStorage.setItem('rutalink_user_session', JSON.stringify({
            id: data.id,
            email: data.email || user?.email,
            full_name: data.full_name,
            phone: data.phone,
            active_role: data.active_role
          }));
        }
        return data as UserProfile;
      }

      // 2. Respaldo inmediato desde metadatos de Supabase Auth si la tabla aún no sincroniza
      const currentUser = (await supabase.auth.getUser()).data?.user;
      if (currentUser && currentUser.id === userId) {
        const meta = currentUser.user_metadata || {};
        const fallbackProf: UserProfile = {
          id: userId,
          email: currentUser.email || '',
          full_name: meta.full_name || 'Usuario RutaLink',
          phone: meta.phone || '',
          active_role: meta.active_role || 'PASAJERO',
          rating: 5.0,
          created_at: new Date().toISOString()
        } as UserProfile;

        setProfile(fallbackProf);
        if (typeof window !== 'undefined') {
          localStorage.setItem('rutalink_user_session', JSON.stringify({
            id: userId,
            email: currentUser.email,
            full_name: fallbackProf.full_name,
            phone: fallbackProf.phone,
            active_role: fallbackProf.active_role
          }));
        }

        // Reintentar registrar el perfil en segundo plano
        await upsertAndFetchProfile(userId, fallbackProf.full_name, fallbackProf.phone || '', fallbackProf.active_role, currentUser.email);
        return fallbackProf;
      }
    } catch (err) {
      console.error('[Auth Error] Error consultando perfil:', err);
    }
    return null;
  }

  async function upsertAndFetchProfile(userId: string, fullName: string, phone: string, role: UserRole, email?: string) {
    // Actualizar estado en memoria de inmediato para que el dashboard nunca se vea en blanco
    const immediateProf: UserProfile = {
      id: userId,
      full_name: fullName,
      phone: phone,
      active_role: role,
      email: email,
      rating: 5.0,
      created_at: new Date().toISOString()
    } as UserProfile;
    setProfile(immediateProf);

    if (typeof window !== 'undefined') {
      localStorage.setItem('rutalink_user_session', JSON.stringify({
        id: userId,
        email: email,
        full_name: fullName,
        phone: phone,
        active_role: role
      }));
    }

    try {
      const newProf = {
        id: userId,
        full_name: fullName,
        phone: phone,
        active_role: role,
        email: email,
        updated_at: new Date().toISOString()
      };

      const { data: inserted } = await supabase
        .from('profiles')
        .upsert(newProf, { onConflict: 'id' })
        .select()
        .single();

      if (inserted) {
        setProfile(inserted as UserProfile);
        return inserted as UserProfile;
      }
    } catch (err) {
      console.warn('[Profile Upsert Warning]:', err);
    }
    return immediateProf;
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setUser(data.user);
        const p = await fetchProfile(data.user.id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('rutalink_user_session', JSON.stringify({
            id: data.user.id,
            email: data.user.email || email,
            full_name: p?.full_name || data.user.user_metadata?.full_name || 'Usuario RutaLink',
            phone: p?.phone || data.user.user_metadata?.phone || '',
            active_role: p?.active_role || data.user.user_metadata?.active_role || 'PASAJERO'
          }));
        }
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Error al iniciar sesión' };
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    role: UserRole
  ) => {
    try {
      // 0. Limpiar cualquier sesión anterior del navegador para evitar mezcla de cuentas
      await supabase.auth.signOut().catch(() => null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rutalink_user_session');
        localStorage.removeItem('rutalink_session');
      }
      setUser(null);
      setProfile(null);

      const normalizedEmail = email.trim().toLowerCase();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rutalink-backend.onrender.com';

      // 1. Intentar registro profesional directo vía backend (Resiliente, sin bloqueo por límites SMTP de Supabase)
      let backendSuccess = false;
      try {
        const directRes = await fetch(`${apiUrl}/api/auth/register-direct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
            fullName,
            phone,
            role
          })
        });

        if (directRes.ok) {
          backendSuccess = true;
        } else {
          const d = await directRes.json().catch(() => ({}));
          // Si el backend arrojó ENETUNREACH o fallo de red IPv6 en Render, continuar al SDK directo
          if (d.error && (d.error.includes('ENETUNREACH') || d.error.includes('connect') || d.error.includes('network') || d.error.includes('fetch'))) {
            console.warn('[Direct Register IPv6 network warning, switching to Supabase SDK]:', d.error);
          } else if (d.error && !d.error.includes('interno') && !d.error.includes('Database error')) {
            return { error: d.error };
          }
        }
      } catch (beErr) {
        console.warn('[Direct Register fetch warning, fallback to Supabase JS]:', beErr);
      }

      // 2. Si el backend no respondió, intentar Supabase Auth SDK como respaldo
      if (!backendSuccess) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              phone,
              active_role: role
            }
          }
        });
        if (error) {
          if (error.message.includes('confirmation email') || error.message.includes('rate limit')) {
            return { error: 'Límite de envíos alcanzado en Supabase Auth. El servidor backend está procesando tu activación.' };
          }
          return { error: error.message };
        }
      }

      // 3. Iniciar sesión automáticamente de inmediato con credenciales verificadas
      const loginRes = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (loginRes.error) {
        return { error: loginRes.error.message };
      }

      if (loginRes.data.user) {
        const freshProfile: UserProfile = {
          id: loginRes.data.user.id,
          email: normalizedEmail,
          full_name: fullName,
          phone,
          active_role: role,
          rating: 5.0,
          account_status: 'ACTIVO',
          created_at: new Date().toISOString()
        } as UserProfile;

        setUser(loginRes.data.user);
        setProfile(freshProfile);

        if (typeof window !== 'undefined') {
          localStorage.setItem('rutalink_user_session', JSON.stringify({
            id: loginRes.data.user.id,
            email: normalizedEmail,
            full_name: fullName,
            phone,
            active_role: role
          }));
        }

        // Sincronizar en base de datos en segundo plano
        upsertAndFetchProfile(loginRes.data.user.id, fullName, phone, role, normalizedEmail).catch(() => null);

        // Disparar correo de bienvenida automático oficial
        fetch(`${apiUrl}/api/auth/welcome`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, fullName, role })
        }).catch(() => null);
      }

      return {};
    } catch (err: any) {
      return { error: err.message || 'Error al registrar usuario' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut().catch(() => null);
      setUser(null);
      setProfile(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rutalink_user_session');
        localStorage.removeItem('rutalink_session');
      }
    } catch (err) {
      console.error('[Logout Error]:', err);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message || 'Error al solicitar recuperación' };
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: 'No autenticado' };
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          active_role: data.active_role,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) return { error: error.message };
      await fetchProfile(user.id);
      return {};
    } catch (err: any) {
      return { error: err.message || 'Error actualizando perfil' };
    }
  };

  const switchRole = async (newRole: UserRole) => {
    if (!profile) return;
    await updateProfile({ active_role: newRole });
  };

  const deleteAccount = async (code?: string, phone?: string) => {
    if (!user) return { error: 'No autenticado' };
    if (!code || code.trim().length !== 6) {
      return { error: 'Debes ingresar el código de 6 dígitos enviado a tu correo.' };
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rutalink-backend.onrender.com';
      const session = (await supabase.auth.getSession()).data.session;

      // 1. Intentar borrado en backend con validación OTP
      let backendSuccess = false;
      try {
        const res = await fetch(`${apiUrl}/api/auth/account`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session?.access_token || ''}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: code.trim(),
            phone: phone || profile?.phone
          })
        });
        if (res.ok) {
          backendSuccess = true;
        } else {
          const d = await res.json().catch(() => ({}));
          if (d.error) {
            return { error: d.error };
          }
        }
      } catch (beErr) {
        console.warn('[Delete Backend Exception, fallback to Supabase direct]:', beErr);
      }

      // 2. Si el backend falló de red, borrar perfil directamente en Supabase
      if (!backendSuccess) {
        try {
          await supabase.from('groups').update({ created_by: null } as any).eq('created_by', user.id);
          await supabase.from('chat_messages').delete().eq('sender_id', user.id);
          await supabase.from('group_chat_messages').delete().eq('sender_id', user.id);
          await supabase.from('passenger_dropoffs').delete().eq('passenger_id', user.id);
          await supabase.from('group_members').delete().eq('user_id', user.id);
          await supabase.from('profiles').delete().eq('id', user.id);
        } catch {
          // Continuar con limpieza local y logout
        }
      }

      // 3. Cerrar sesión y limpiar almacenamiento local
      await logout();
      return {};
    } catch (err: any) {
      console.error('[Delete Account Fallback]:', err);
      await logout();
      return {};
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isGuest: !user,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        switchRole,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
