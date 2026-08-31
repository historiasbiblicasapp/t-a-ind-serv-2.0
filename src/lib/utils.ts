import { WorkOrderStatus, WorkOrderPriority, WorkOrderType, EquipmentStatus } from '../types';

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeString: string | undefined | null): string {
  if (!dateTimeString) return '-';
  try {
    if (dateTimeString.includes('T')) {
      const [datePart, timePart] = dateTimeString.split('T');
      const [y, m, d] = datePart.split('-');
      const time = timePart.substring(0, 5);
      return `${d}/${m}/${y} ${time}`;
    }
    return dateTimeString;
  } catch {
    return dateTimeString;
  }
}

export function getStatusColor(status: WorkOrderStatus | EquipmentStatus | string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'Aberta':
      return {
        bg: 'bg-sky-500/10',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        dot: 'bg-sky-400',
      };
    case 'Aguardando':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
      };
    case 'Planejada':
      return {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400',
        border: 'border-indigo-500/30',
        dot: 'bg-indigo-400',
      };
    case 'Em execução':
      return {
        bg: 'bg-amber-500/15 animate-pulse',
        text: 'text-amber-300',
        border: 'border-amber-500/50',
        dot: 'bg-amber-400',
      };
    case 'Pausada':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        dot: 'bg-orange-400',
      };
    case 'Concluída':
    case 'Operacional':
    case 'Ativo':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    case 'Cancelada':
    case 'Parado':
    case 'Inativo':
    case 'Crítico':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        dot: 'bg-rose-400',
      };
    case 'Em Manutenção':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
      };
    default:
      return {
        bg: 'bg-slate-800',
        text: 'text-slate-300',
        border: 'border-slate-700',
        dot: 'bg-slate-400',
      };
  }
}

export function getPriorityColor(priority: WorkOrderPriority): {
  bg: string;
  text: string;
  border: string;
} {
  switch (priority) {
    case 'Crítica':
      return { bg: 'bg-rose-500/15', text: 'text-rose-400 font-semibold', border: 'border-rose-500/40' };
    case 'Alta':
      return { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/40' };
    case 'Normal':
      return { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' };
    case 'Baixa':
      return { bg: 'bg-slate-800/80', text: 'text-slate-400', border: 'border-slate-700' };
    default:
      return { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
  }
}

export function getTypeBadge(type: WorkOrderType): {
  label: string;
  bg: string;
  text: string;
} {
  switch (type) {
    case 'Corretiva':
      return { label: 'Corretiva', bg: 'bg-rose-950/60', text: 'text-rose-300' };
    case 'Preventiva':
      return { label: 'Preventiva', bg: 'bg-emerald-950/60', text: 'text-emerald-300' };
    case 'Preditiva':
      return { label: 'Preditiva', bg: 'bg-purple-950/60', text: 'text-purple-300' };
    case 'Inspeção':
      return { label: 'Inspeção', bg: 'bg-cyan-950/60', text: 'text-cyan-300' };
    case 'Melhoria':
      return { label: 'Melhoria', bg: 'bg-blue-950/60', text: 'text-blue-300' };
    case 'Emergencial':
      return { label: 'Emergencial', bg: 'bg-red-950/80', text: 'text-red-400 font-bold' };
    default:
      return { label: type, bg: 'bg-slate-900', text: 'text-slate-300' };
  }
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
