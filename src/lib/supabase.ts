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
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Erro ao conectar com Supabase' };
  }
}

export interface ClientErrorPayload {
  errorType: 'CLIENT_REPORT' | 'RUNTIME_EXCEPTION' | 'FORM_VALIDATION' | 'NETWORK_SYNC' | 'USER_ACTION';
  title: string;
  message: string;
  contextData?: any;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  urlPath?: string;
}

/**
 * Envia automaticamente qualquer erro, reclamação de cliente ou digitação para a tabela client_error_logs no Supabase
 */
export async function sendTelemetryErrorToSupabase(payload: ClientErrorPayload): Promise<boolean> {
  const client = getSupabase();
  const logData = {
    user_name: payload.userName || 'Usuário Desconhecido',
    user_email: payload.userEmail || 'não informado',
    user_role: payload.userRole || 'Usuário',
    error_type: payload.errorType,
    title: payload.title,
    message: payload.message,
    context_data: payload.contextData || {},
    url_path: payload.urlPath || window.location.pathname,
    device_info: `${navigator.userAgent} | Tela: ${window.innerWidth}x${window.innerHeight}`,
    app_version: 'v2.5.0'
  };

  // 1. Sempre registra no log local / console para depuração
  console.info('[SUPABASE TELEMETRY LOG]', logData);

  // 2. Se o Supabase estiver configurado, envia diretamente para o banco
  if (client) {
    try {
      const { error } = await client.from('client_error_logs').insert([logData]);
      if (error) {
        console.warn('Não foi possível persistir no Supabase (verifique se a tabela client_error_logs foi criada):', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Erro ao enviar log para o Supabase:', err);
      return false;
    }
  }
  return false;
}

/**
 * Sincroniza uma Ordem de Serviço diretamente no Supabase em tempo real
 */
export async function syncWorkOrderToSupabase(order: any): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from('work_orders').upsert({
      id: order.id,
      order_number: order.orderNumber,
      requester_name: order.requesterName,
      requester_id: order.requesterId,
      date: order.date,
      time: order.time,
      company: order.company,
      unit: order.unit,
      department: order.department,
      area: order.area,
      equipment_id: order.equipmentId,
      equipment_code: order.equipmentCode,
      equipment_name: order.equipmentName,
      type: order.type,
      priority: order.priority,
      description: order.description,
      responsible_id: order.responsibleId,
      responsible_name: order.responsibleName,
      status: order.status,
      deadline_date: order.deadlineDate,
      deadline_time: order.deadlineTime,
      observations: order.observations,
      values: order.values,
      completed_at: order.completedAt,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.warn('Erro ao sincronizar WorkOrder no Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Falha na sincronização com Supabase:', err);
    return false;
  }
}
