import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { WorkOrder, WorkOrderStatus, WorkOrderType, WorkOrderPriority } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/common/Badge';
import { formatCurrency, formatDate } from '../lib/utils';
import { exportWorkOrdersToCSV, exportWorkOrdersToExcel, printWorkOrdersList } from '../lib/exportUtils';
import {
  PlusCircle,
  Download,
  FileSpreadsheet,
  Printer,
  SlidersHorizontal,
  ClipboardList,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface WorkOrdersViewProps {
  onOpenNewOS?: () => void;
  onOpenNewWorkOrder?: () => void;
  onSelectWorkOrder?: (order: WorkOrder) => void;
  onEditWorkOrder?: (order: WorkOrder) => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  onOpenNewOS,
  onOpenNewWorkOrder,
  onSelectWorkOrder,
  onEditWorkOrder,
}) => {
  const handleOpenNew = onOpenNewWorkOrder || onOpenNewOS || (() => {});
  const { workOrders } = useData();
  const { can } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Filter list
  const filteredOrders = workOrders.filter((wo) => {
    if (statusFilter !== 'ALL' && wo.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && wo.type !== typeFilter) return false;
    if (priorityFilter !== 'ALL' && wo.priority !== priorityFilter) return false;
    return true;
  });

  const columns: Column<WorkOrder>[] = [
    {
      header: 'Número OS',
      accessor: (wo) => (
        <span className="font-mono font-bold text-amber-400">{wo.orderNumber}</span>
      ),
      className: 'w-28',
    },
    {
      header: 'Equipamento',
      accessor: (wo) => (
        <div>
          <span className="font-mono font-bold text-slate-200 text-xs">{wo.equipmentCode}</span>
          <span className="text-slate-400 block text-xs truncate max-w-xs">{wo.equipmentName}</span>
        </div>
      ),
    },
    {
      header: 'Tipo',
      accessor: (wo) => <TypeBadge type={wo.type} size="sm" />,
      className: 'w-24 text-center',
      align: 'center',
    },
    {
      header: 'Prioridade',
      accessor: (wo) => <PriorityBadge priority={wo.priority} size="sm" />,
      className: 'w-24 text-center',
      align: 'center',
    },
    {
      header: 'Status',
      accessor: (wo) => <StatusBadge status={wo.status} size="sm" />,
      className: 'w-32',
    },
    {
      header: 'Responsável',
      accessor: (wo) => (
        <span className="text-slate-300 font-medium text-xs truncate block max-w-[140px]">
          {wo.responsibleName || 'Não atribuído'}
        </span>
      ),
    },
    {
      header: 'Prazo Limite',
      accessor: (wo) => (
        <span className="text-slate-300 font-mono text-xs">
          {formatDate(wo.deadlineDate)}
        </span>
      ),
      className: 'w-28',
    },
    {
      header: 'Custo Total',
      accessor: (wo) => (
        <span className="font-mono font-bold text-emerald-400 text-xs">
          {formatCurrency(wo.values?.totalCost)}
        </span>
      ),
      className: 'w-28 text-right',
      align: 'right',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            Ordens de Serviço Industriais
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Total de {workOrders.length} ordens registradas no sistema
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Actions */}
          <button
            onClick={() => exportWorkOrdersToCSV(filteredOrders)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
            title="Exportar CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => exportWorkOrdersToExcel(filteredOrders)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
            title="Exportar Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => printWorkOrdersList(filteredOrders)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
            title="Imprimir Tabela"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>

          {can('criar') && (
            <button
              id="work-orders-new-btn"
              onClick={handleOpenNew}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-500/20 active:scale-95 ml-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova OS</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { id: 'ALL', label: 'Todas as OS', count: workOrders.length },
          { id: 'Aberta', label: 'Abertas', count: workOrders.filter(w => w.status === 'Aberta').length },
          { id: 'Em execução', label: 'Em Execução', count: workOrders.filter(w => w.status === 'Em execução').length },
          { id: 'Planejada', label: 'Planejadas', count: workOrders.filter(w => w.status === 'Planejada').length },
          { id: 'Concluída', label: 'Concluídas', count: workOrders.filter(w => w.status === 'Concluída').length },
          { id: 'Cancelada', label: 'Canceladas', count: workOrders.filter(w => w.status === 'Cancelada').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border whitespace-nowrap transition-colors flex items-center gap-2 ${
              statusFilter === tab.id
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              statusFilter === tab.id ? 'bg-slate-950 text-amber-400 font-bold' : 'bg-slate-800 text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main DataTable */}
      <DataTable
        data={filteredOrders}
        columns={columns}
        keyExtractor={(wo) => wo.id}
        searchPlaceholder="Pesquisar por nº OS, equipamento, solicitante ou descrição..."
        searchFilter={(wo, q) =>
          wo.orderNumber.toLowerCase().includes(q) ||
          wo.equipmentCode.toLowerCase().includes(q) ||
          wo.equipmentName.toLowerCase().includes(q) ||
          wo.description.toLowerCase().includes(q) ||
          wo.requesterName.toLowerCase().includes(q) ||
          (wo.responsibleName && wo.responsibleName.toLowerCase().includes(q))
        }
        filterComponent={
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="Corretiva">Corretiva</option>
              <option value="Preventiva">Preventiva</option>
              <option value="Preditiva">Preditiva</option>
              <option value="Inspeção">Inspeção</option>
              <option value="Melhoria">Melhoria</option>
              <option value="Emergencial">Emergencial</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Todas Prioridades</option>
              <option value="Baixa">Baixa</option>
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
        }
        onRowClick={(wo) => onSelectWorkOrder(wo)}
        pageSize={12}
      />
    </div>
  );
};
