export type WorkOrderStatus = 
  | 'Aberta'
  | 'Aguardando'
  | 'Planejada'
  | 'Em execução'
  | 'Pausada'
  | 'Concluída'
  | 'Cancelada';

export type WorkOrderType = 
  | 'Corretiva'
  | 'Preventiva'
  | 'Preditiva'
  | 'Inspeção'
  | 'Melhoria'
  | 'Emergencial';

export type WorkOrderPriority = 
  | 'Baixa'
  | 'Normal'
  | 'Alta'
  | 'Crítica';

export interface WorkOrderScope {
  id: string;
  itemNumber: string; // Ex: "001"
  description: string;
  peopleCount: number; // Ex: 2
  startDate: string;
  endDate: string;
  responsibleId?: string;
  responsibleName?: string;
  observation?: string;
}

export interface WorkOrderLabor {
  id: string;
  itemNumber: string; // Preenchido automaticamente pelo Escopo (ex: "001")
  quantity: number;   // Preenchido automaticamente pelo Escopo (ex: 2)
  employeeId: string;
  employeeName: string;
  positionId?: string;
  positionName: string; // Auto-preenchido do Cargo do Funcionário
  hours: number;
  hourlyRate: number;
  totalValue: number;
}

export interface WorkOrderResource {
  id: string;
  type: 'Ferramenta' | 'Equipamento' | 'Máquina' | 'Veículo' | 'Material' | 'Outro';
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  status: 'Disponível' | 'Alocado' | 'Em Uso' | 'Devolvido';
  notes?: string;
}

export interface WorkOrderExecution {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  employeeId: string;
  employeeName: string;
  positionName?: string;
  description: string;
  servicePerformed: string;
  observations?: string;
  photos?: string[];
  signature?: string;
}

export interface WorkOrderValues {
  laborCost: number;
  partsCost: number;
  materialsCost: number;
  servicesCost: number;
  resourcesCost: number;
  additionalCosts: number;
  totalCost: number;
}

export interface WorkOrderDeadlineMilestone {
  id: string;
  title: string;
  targetDate: string;
  completedDate?: string;
  status: 'Pendente' | 'Concluído' | 'Atrasado';
  responsibleName?: string;
  notes?: string;
}

export interface WorkOrder {
  id: string;
  orderNumber: string; // Ex: "OS-2026-0042"
  requesterName: string;
  requesterId?: string;
  date: string;
  time: string;
  company: string;
  unit: string;
  department: string;
  area: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  type: WorkOrderType;
  priority: WorkOrderPriority;
  description: string;
  responsibleId?: string;
  responsibleName?: string;
  status: WorkOrderStatus;
  deadlineDate: string;
  deadlineTime?: string;
  observations?: string;
  
  // 6 Symmetrical sub-modules
  scope: WorkOrderScope[];
  labor: WorkOrderLabor[];
  resources: WorkOrderResource[];
  values: WorkOrderValues;
  milestones: WorkOrderDeadlineMilestone[];
  executions: WorkOrderExecution[];

  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
