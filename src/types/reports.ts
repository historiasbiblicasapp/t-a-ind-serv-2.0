export type ReportType = 
  | 'work_orders'
  | 'equipment'
  | 'maintenance'
  | 'costs'
  | 'inventory'
  | 'labor'
  | 'executions'
  | 'preventives';

export interface ReportFilter {
  type: ReportType;
  startDate: string;
  endDate: string;
  status?: string;
  department?: string;
  equipmentId?: string;
  priority?: string;
  employeeId?: string;
}

export interface KPIStats {
  mtbfHours: number; // Mean Time Between Failures
  mttrHours: number; // Mean Time To Repair
  operationalAvailabilityPercent: number; // Disponibilidade (%)
  totalWorkOrdersCount: number;
  openWorkOrdersCount: number;
  inProgressWorkOrdersCount: number;
  delayedWorkOrdersCount: number;
  completedWorkOrdersCount: number;
  preventiveComplianceRatePercent: number; // % preventivas no prazo
  avgResponseTimeHours: number; // Tempo médio de atendimento
  avgExecutionTimeHours: number; // Tempo médio de execução
  totalMaintenanceCost: number; // Custos totais
  totalLaborHours: number; // Horas trabalhadas
  activeEquipmentCount: number;
  downEquipmentCount: number;
  lowStockItemsCount: number;
}

export type NotificationType = 
  | 'nova_os'
  | 'os_atribuida'
  | 'os_atrasada'
  | 'preventiva_proxima'
  | 'preventiva_vencida'
  | 'equipamento_parado'
  | 'estoque_minimo'
  | 'prazo_proximo';

export interface SystemNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'work_order' | 'equipment' | 'part' | 'preventive';
  createdAt: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'FINALIZE' | 'CANCEL' | 'EXPORT' | 'LOGIN' | 'QR_SCAN';
  timestamp: string;
  table: string;
  recordId: string;
  recordIdentifier: string; // ex: "OS-2026-001" or "EQ-TORNO-01"
  previousValue?: string;
  newValue?: string;
  device: string;
  ipAddress?: string;
}
