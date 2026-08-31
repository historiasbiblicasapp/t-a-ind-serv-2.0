export interface ChecklistItem {
  id: string;
  description: string;
  instructions?: string;
  type: 'conforme_nao_conforme' | 'medicao' | 'texto' | 'foto';
  expectedValue?: string;
  unit?: string;
  required: boolean;
  order: number;
}

export interface Checklist {
  id: string;
  title: string;
  category: string;
  items: ChecklistItem[];
}

export type MaintenanceFrequency = 'Semanal' | 'Quinzenal' | 'Mensal' | 'Bimestral' | 'Trimestral' | 'Semestral' | 'Anual' | 'Por Horímetro' | 'Dias' | 'Semanas' | 'Meses' | 'Horas de Operação' | 'Ciclos';

export interface MaintenancePlan {
  id: string;
  code: string;
  title: string;
  description: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  frequency?: MaintenanceFrequency;
  intervalValue?: number;
  periodicityType?: 'Dias' | 'Semanas' | 'Meses' | 'Horas de Operação' | 'Ciclos' | string;
  periodicityValue?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate: string;
  responsibleId?: string;
  responsibleName: string;
  estimatedDurationHours: number;
  checklistId?: string;
  checklistItems: ChecklistItem[] | { id: string; description: string }[];
  status?: 'Ativo' | 'Pausado' | 'Vencido' | 'Em Andamento';
  active?: boolean;
  priority: 'Baixa' | 'Normal' | 'Alta' | 'Crítica';
  autoGenerateOS?: boolean;
  advanceDaysWarning?: number;
  createdAt: string;
  updatedAt: string;
}
