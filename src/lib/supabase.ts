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
 * Sincroniza uma Ordem de Serviço diretamente no Supabase em tempo real com schema flexível
 */
export async function syncWorkOrderToSupabase(order: any): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const payload: any = {
      id: order.id,
      order_number: order.orderNumber,
      requester_name: order.requesterName || order.responsibleName || '',
      requester_id: order.requesterId || null,
      date: order.date || new Date().toISOString().split('T')[0],
      time: order.time || '08:00',
      company: order.company || '',
      unit: order.unit || '',
      department: order.department || '',
      area: order.area || '',
      equipment_id: order.equipmentId || null,
      equipment_code: order.equipmentCode || '',
      equipment_name: order.equipmentName || '',
      type: order.type || 'Corretiva',
      priority: order.priority || 'Média',
      description: order.description || '',
      responsible_id: order.responsibleId || null,
      responsible_name: order.responsibleName || '',
      status: order.status || 'Aberta',
      deadline_date: order.deadlineDate || order.date || new Date().toISOString().split('T')[0],
      deadline_time: order.deadlineTime || '18:00',
      observations: order.observations || '',
      values: order.values || {},
      completed_at: order.completedAt || null,
      updated_at: new Date().toISOString()
    };

    const { error } = await client.from('work_orders').upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Erro ao sincronizar WorkOrder no Supabase:', error.message);
      sendTelemetryErrorToSupabase({
        errorType: 'NETWORK_SYNC',
        title: `Falha ao sincronizar OS ${order.orderNumber}`,
        message: error.message,
        contextData: { orderId: order.id, orderNumber: order.orderNumber, error }
      }).catch(() => {});
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Falha na sincronização com Supabase:', err);
    return false;
  }
}

/**
 * Sincroniza Equipamentos no Supabase
 */
export async function syncEquipmentToSupabase(eq: any): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('equipment').upsert({
      id: eq.id,
      code: eq.code,
      name: eq.name,
      model: eq.model,
      serial_number: eq.serialNumber,
      manufacturer: eq.manufacturer,
      status: eq.status,
      criticality: eq.criticality,
      company: eq.company,
      unit: eq.unit,
      department: eq.department,
      area: eq.area,
      location: eq.location,
      hourly_cost: eq.hourlyCost,
      updated_at: new Date().toISOString()
    });
    if (error) console.warn('Erro ao sincronizar Equipamento:', error.message);
    return !error;
  } catch (err) {
    console.warn('Erro ao conectar Supabase para Equipamento:', err);
    return false;
  }
}

/**
 * Sincroniza Funcionários no Supabase
 */
export async function syncEmployeeToSupabase(emp: any): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('employees').upsert({
      id: emp.id,
      name: emp.name,
      registration_number: emp.registrationNumber,
      email: emp.email,
      phone: emp.phone,
      position: emp.position,
      department: emp.department,
      hourly_rate: emp.hourlyRate,
      active: emp.active,
      updated_at: new Date().toISOString()
    });
    if (error) console.warn('Erro ao sincronizar Funcionário:', error.message);
    return !error;
  } catch (err) {
    console.warn('Erro ao conectar Supabase para Funcionário:', err);
    return false;
  }
}

/**
 * Sincroniza Peças/Estoque no Supabase
 */
export async function syncPartToSupabase(part: any): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('parts').upsert({
      id: part.id,
      code: part.code,
      name: part.name,
      description: part.description,
      current_quantity: part.currentQuantity,
      minimum_quantity: part.minimumQuantity,
      unit_cost: part.unitCost,
      unit_of_measure: part.unitOfMeasure,
      category: part.category,
      location: part.location,
      updated_at: new Date().toISOString()
    });
    if (error) console.warn('Erro ao sincronizar Peça:', error.message);
    return !error;
  } catch (err) {
    console.warn('Erro ao conectar Supabase para Peça:', err);
    return false;
  }
}

/**
 * Sincroniza Plano Preventivo no Supabase
 */
export async function syncPlanToSupabase(plan: any): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('preventive_plans').upsert({
      id: plan.id,
      code: plan.code,
      title: plan.title,
      description: plan.description,
      equipment_id: plan.equipmentId,
      equipment_code: plan.equipmentCode,
      equipment_name: plan.equipmentName,
      frequency_type: plan.frequencyType,
      frequency_value: plan.frequencyValue,
      status: plan.status,
      tasks: plan.tasks,
      updated_at: new Date().toISOString()
    });
    if (error) console.warn('Erro ao sincronizar Plano Preventivo:', error.message);
    return !error;
  } catch (err) {
    console.warn('Erro ao conectar Supabase para Plano:', err);
    return false;
  }
}

/**
 * Sincroniza Fornecedor no Supabase
 */
export async function syncSupplierToSupabase(sup: any): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  try {
    const { error } = await client.from('suppliers').upsert({
      id: sup.id,
      code: sup.code,
      name: sup.name,
      cnpj: sup.cnpj,
      contact_person: sup.contactPerson,
      email: sup.email,
      phone: sup.phone,
      active: sup.active,
      updated_at: new Date().toISOString()
    });
    if (error) console.warn('Erro ao sincronizar Fornecedor:', error.message);
    return !error;
  } catch (err) {
    console.warn('Erro ao conectar Supabase para Fornecedor:', err);
    return false;
  }
}

/**
 * Executa uma sincronização completa de todos os dados locais para o Supabase
 */
export async function syncAllEntitiesToSupabase(allData: {
  workOrders: any[];
  equipment: any[];
  employees: any[];
  parts: any[];
  preventivePlans: any[];
  suppliers: any[];
}): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, count: 0, error: 'Supabase não está configurado. Insira a URL e a Anon Key.' };
  }

  try {
    let synced = 0;
    for (const wo of allData.workOrders) {
      if (await syncWorkOrderToSupabase(wo)) synced++;
    }
    for (const eq of allData.equipment) {
      if (await syncEquipmentToSupabase(eq)) synced++;
    }
    for (const emp of allData.employees) {
      if (await syncEmployeeToSupabase(emp)) synced++;
    }
    for (const p of allData.parts) {
      if (await syncPartToSupabase(p)) synced++;
    }
    for (const plan of allData.preventivePlans) {
      if (await syncPlanToSupabase(plan)) synced++;
    }
    for (const sup of allData.suppliers) {
      if (await syncSupplierToSupabase(sup)) synced++;
    }

    return { success: true, count: synced };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message };
  }
}

/**
 * Coletor Direto de Backup Completo do Navegador do Cliente
 * Transmite todo o snapshot de dados e estado do navegador para a tabela de logs e backups remotos
 */
export async function collectAndUploadBrowserData(currentUser?: any): Promise<{ success: boolean; message: string; details?: any }> {
  const client = getSupabase();
  const rawStorageBackup = {
    captured_at: new Date().toISOString(),
    client_info: {
      userAgent: navigator.userAgent,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      url: window.location.href
    },
    user: currentUser || { name: 'Desconhecido', email: 'não informado' },
    storage_keys: {} as Record<string, any>
  };

  // Coleta todas as chaves do LocalStorage do navegador do cliente
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key);
        try {
          rawStorageBackup.storage_keys[key] = JSON.parse(val || '');
        } catch {
          rawStorageBackup.storage_keys[key] = val;
        }
      }
    }
  } catch (e) {
    console.warn('Erro ao ler localStorage do cliente:', e);
  }

  // Se o Supabase estiver conectado, envia para a telemetria com prioridade máxima
  if (client) {
    try {
      const { error } = await client.from('client_error_logs').insert([{
        user_name: currentUser?.name || 'Coletor Remoto',
        user_email: currentUser?.email || 'telemetria@tsindustrial.com',
        user_role: currentUser?.role || 'Sistema',
        error_type: 'USER_ACTION',
        title: `SNAPSHOT COMPLETO COLETADO DO NAVEGADOR DO CLIENTE [${new Date().toLocaleDateString('pt-BR')}]`,
        message: `Coleta remota de emergência realizada com sucesso. Total de chaves: ${Object.keys(rawStorageBackup.storage_keys).length}`,
        context_data: rawStorageBackup,
        url_path: window.location.pathname,
        device_info: navigator.userAgent,
        app_version: 'v2.5.0'
      }]);

      if (!error) {
        return {
          success: true,
          message: 'Snapshot de todos os dados do navegador coletado e enviado com sucesso ao Supabase!',
          details: rawStorageBackup
        };
      }
    } catch (err: any) {
      console.warn('Erro ao salvar snapshot no Supabase:', err);
    }
  }

  return {
    success: true,
    message: 'Dados locais coletados com sucesso e salvos no pacote de emergência!',
    details: rawStorageBackup
  };
}

/**
 * Configura Ouvinte em Tempo Real (Realtime Subscription) do Supabase
 */
export function setupSupabaseRealtime(onWorkOrderChange: (payload: any) => void) {
  const client = getSupabase();
  if (!client) return null;

  try {
    const channel = client
      .channel('public:work_orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_orders' },
        (payload) => {
          console.info('[SUPABASE REALTIME EVENT]', payload);
          onWorkOrderChange(payload);
        }
      )
      .subscribe((status) => {
        console.info('[SUPABASE REALTIME STATUS]', status);
      });

    return channel;
  } catch (e) {
    console.warn('Não foi possível ativar realtime do Supabase:', e);
    return null;
  }
}

