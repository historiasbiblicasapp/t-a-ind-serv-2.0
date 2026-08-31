import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const env = (import.meta as any).env || {};
  const url = env.VITE_SUPABASE_URL || localStorage.getItem('tes_supabase_url') || '';
  const anonKey = env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('tes_supabase_key') || '';
  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey)
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem('tes_supabase_url', url.trim());
  localStorage.setItem('tes_supabase_key', anonKey.trim());
  supabaseClient = null; // reset client to re-initialize
}

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, anonKey);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseClient;
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url, key);
    const { error } = await testClient.from('work_orders').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Erro ao conectar com Supabase' };
  }
}
