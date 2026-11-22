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
  deleteAccount: () => Promise<{ error?: string }>;
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
          await fetchProfile(session.user.id);
        } else {
          // Respaldo de hidratación anti-recarga (F5) para producción
          if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('rutalink_user_session');
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                if (parsed?.id) {
                  setUser({ id: parsed.id, email: parsed.email, user_metadata: parsed });
                  const cachedProfile: UserProfile = {
                    id: parsed.id,
                    email: parsed.email,
                    full_name: parsed.full_name,
                    phone: parsed.phone,
                    active_role: parsed.active_role || 'PASAJERO',
                    rating: 5.0,
                    created_at: new Date().toISOString()
                  } as UserProfile;
                  setProfile(cachedProfile);
                  // Intentar refrescar en segundo plano con Supabase
                  fetchProfile(parsed.id);
                }
              } catch (e) {
                console.warn('[Cache parse error]:', e);
              }
            } else {
              setUser(null);
              setProfile(null);
            }
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
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rutalink_user_session');
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
    } catch (err) {
      console.error('[Auth Error] Error consultando perfil:', err);
    }
    return null;
  }

  async function upsertAndFetchProfile(userId: string, fullName: string, phone: string, role: UserRole, email?: string) {
    try {
      const existing = await fetchProfile(userId);
      if (existing) return existing;

      const newProf = {
        id: userId,
        full_name: fullName,
        phone: phone,
        active_role: role,
        email: email,
        rating: 5.0,
        updated_at: new Date().toISOString()
      };

      const { data: inserted } = await supabase
        .from('profiles')
        .upsert(newProf)
        .select()
        .single();

      if (inserted) {
        setProfile(inserted as UserProfile);
        return inserted as UserProfile;
      }
    } catch (err) {
      console.error('[Profile Upsert Error]:', err);
    }
    return null;
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            active_role: role
          }
        }
      });
      if (error) return { error: error.message };

      // Consolidar sesión inmediata con signInWithPassword para evitar sesiones nulas en Supabase
      const loginRes = await supabase.auth.signInWithPassword({ email, password }).catch(() => null);
      const activeUser = loginRes?.data?.user || data.user;

      if (activeUser) {
        setUser(activeUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('rutalink_user_session', JSON.stringify({
            id: activeUser.id,
            email: activeUser.email || email,
            full_name: fullName,
            phone,
            active_role: role
          }));
        }
        await upsertAndFetchProfile(activeUser.id, fullName, phone, role, email);
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

  const deleteAccount = async () => {
    if (!user) return { error: 'No autenticado' };
    try {
      // Llamada al endpoint backend para borrado en cascada
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(`${apiUrl}/api/auth/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const d = await res.json();
        return { error: d.error || 'Fallo al eliminar cuenta' };
      }

      await logout();
      return {};
    } catch (err: any) {
      return { error: err.message || 'Error de conexión' };
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
