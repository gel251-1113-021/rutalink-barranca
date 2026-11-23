import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://rnrstlizbgmxkjsekodl.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_D6xn1hkmqDGwYfswg1ZhBg_3IkSXw9N';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase Config] Advertencia: SUPABASE_URL o SUPABASE_ANON_KEY no están definidos.');
}

// Cliente estándar anónimo
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Cliente administrativo con service role (si está disponible)
export const supabaseAdmin: SupabaseClient = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase;

// Generador de cliente de Supabase autenticado con el token Bearer del usuario (satisface políticas RLS auth.uid())
export function getAuthenticatedSupabaseClient(authHeader?: string): SupabaseClient {
  if (!authHeader) return supabaseAdmin;
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}
