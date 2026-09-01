import React, { useState } from 'react';
import {
  WorkOrder,
  WorkOrderScope,
  WorkOrderLabor,
  WorkOrderResource,
  WorkOrderExecution,
  WorkOrderStatus
} from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge, PriorityBadge, TypeBadge } from '../common/Badge';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate, generateUUID } from '../../lib/utils';
import { syncScopeToLabor, getEmployeePositionDetails } from '../../lib/scopeLaborSync';
import {
  Users,
  FileText,
  Wrench,
  DollarSign,
  CalendarCheck2,
  PlayCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Edit3,
  AlertTriangle,
  Send,
  Layers,
  Truck,
  Receipt,
  Percent,
  UserCheck,
  UserPlus,
  Clock,
  Briefcase
} from 'lucide-react';

interface WorkOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  onEdit: (order: WorkOrder) => void;
  onPrint: (order: WorkOrder) => void;
}

type OSTab = 'labor' | 'scope' | 'resources' | 'values' | 'milestones' | 'executions';

export const WorkOrderDetailModal: React.FC<WorkOrderDetailModalProps> = ({
  isOpen,
  onClose,
  workOrder,
  onEdit,
  onPrint,
}) => {
  if (!workOrder) return null;

  const { employees, positions, saveWorkOrder, deleteWorkOrder, updateWorkOrderStatus } = useData();
  const { currentUser, can } = useAuth();

  const [activeTab, setActiveTab] = useState<OSTab>('labor');
  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false);

  // Form states for adding items
  const [newScope, setNewScope] = useState<Partial<WorkOrderScope>>({
    itemNumber: String((workOrder.scope?.length || 0) + 1).padStart(3, '0'),
    description: '',
    peopleCount: 1,
    startDate: `${workOrder.date} 08:00`,
    endDate: `${workOrder.deadlineDate} 17:00`,
    responsibleName: workOrder.responsibleName,
    observation: ''
  });

  const [newLaborItemNumber, setNewLaborItemNumber] = useState<string>('');
  const [newLaborEmployeeId, setNewLaborEmployeeId] = useState<string>('');
  const [newLaborHours, setNewLaborHours] = useState<number>(4);
  const [newLaborHourlyRate, setNewLaborHourlyRate] = useState<number>(0);
  const [newLaborQty, setNewLaborQty] = useState<number>(1);

  const [newResource, setNewResource] = useState<Partial<WorkOrderResource>>({
    type: 'Ferramenta',
    name: '',
    quantity: 1,
    unit: 'UN',
    unitCost: 0,
    status: 'Em Uso',
    notes: ''
  });

  const [newExecution, setNewExecution] = useState<Partial<WorkOrderExecution>>({
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '12:00',
    employeeId: employees[0]?.id || '',
    description: '',
    servicePerformed: '',
    observations: ''
  });

  // Six symmetrical tabs
  const tabs: { id: OSTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'labor', label: 'Mão de Obra', icon: Users, count: workOrder.labor?.length || 0 },
    { id: 'scope', label: 'Escopo', icon: FileText, count: workOrder.scope?.length || 0 },
    { id: 'resources', label: 'Recursos', icon: Wrench, count: workOrder.resources?.length || 0 },
    { id: 'values', label: 'Valores', icon: DollarSign },
    { id: 'milestones', label: 'Até', icon: CalendarCheck2, count: workOrder.milestones?.length || 0 },
    { id: 'executions', label: 'Execuções', icon: PlayCircle, count: workOrder.executions?.length || 0 },
  ];

  // Helper to calculate totals
  const recalculateValues = (
    currentValues: WorkOrder['values'],
    laborCost: number,
    resourcesCost: number,
    overrides?: Partial<WorkOrder['values']>
  ): WorkOrder['values'] => {
    const val = { ...currentValues, ...overrides };

    const distance = val.travelDistanceKm || 0;
    const rate = val.travelRatePerKm || 2.50;
    const travelCost = val.travelCost !== undefined ? val.travelCost : (distance * rate);

    const subtotalCost = (
      laborCost +
      (val.partsCost || 0) +
      (val.materialsCost || 0) +
      (val.servicesCost || 0) +
      resourcesCost +
      (val.additionalCosts || 0) +
      travelCost
    );

    const taxPercent = val.taxPercent || 0;
    const taxAmount = val.taxAmount !== undefined && overrides?.taxAmount !== undefined
      ? val.taxAmount
      : (subtotalCost * (taxPercent / 100));

    const totalCost = subtotalCost + taxAmount;

    return {
      ...val,
      laborCost,
      resourcesCost,
      travelDistanceKm: distance,
      travelRatePerKm: rate,
      travelCost,
      subtotalCost,
      taxPercent,
      taxAmount,
      totalCost
    };
  };

  // Helper to persist work order updates with auto-sync
  const updateOrder = (partial: Partial<WorkOrder>) => {
    const nextLabor = partial.labor !== undefined ? partial.labor : (workOrder.labor || []);
    const nextResources = partial.resources !== undefined ? partial.resources : (workOrder.resources || []);
    const nextScope = partial.scope !== undefined ? partial.scope : (workOrder.scope || []);

    const currentLaborCost = nextLabor.reduce((acc, curr) => acc + (Number(curr.totalValue) || (Number(curr.hours) * Number(curr.hourlyRate) * (Number(curr.quantity) || 1)) || 0), 0);
    const currentResourcesCost = nextResources.reduce((acc, curr) => acc + (Number(curr.totalCost) || 0), 0);

    const newValues = recalculateValues(
      partial.values || workOrder.values || {
        laborCost: 0,
        partsCost: 0,
        materialsCost: 0,
        servicesCost: 0,
        resourcesCost: 0,
        additionalCosts: 0,
        travelDistanceKm: 0,
        travelRatePerKm: 2.50,
        travelCost: 0,
        taxPercent: 0,
        taxAmount: 0,
        subtotalCost: 0,
        totalCost: 0
      },
      currentLaborCost,
      currentResourcesCost
    );

    const updated: WorkOrder = {
      ...workOrder,
      ...partial,
      labor: nextLabor,
      resources: nextResources,
      scope: nextScope,
      values: newValues,
      updatedAt: new Date().toISOString()
    };
    saveWorkOrder(updated);
  };

  // 1. ESCOPO HANDLERS (TRIGGERS SPECIAL RULE: ESCOPO -> MÃO DE OBRA)
  const handleAddScope = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScope.description) return;

    const currentScope = workOrder.scope || [];
    const itemNum = newScope.itemNumber || String(currentScope.length + 1).padStart(3, '0');
    const people = Number(newScope.peopleCount) || 1;

    const createdScope: WorkOrderScope = {
      id: generateUUID(),
      itemNumber: itemNum,
      description: newScope.description,
      peopleCount: people,
      startDate: newScope.startDate || `${workOrder.date} 08:00`,
      endDate: newScope.endDate || `${workOrder.deadlineDate} 17:00`,
      responsibleId: newScope.responsibleId,
      responsibleName: newScope.responsibleName || workOrder.responsibleName,
      observation: newScope.observation
    };

    const newScopeList = [...currentScope, createdScope];
    // AUTOMATIC SYNCHRONIZATION: Escopo -> Mão de Obra
    const syncedLaborList = syncScopeToLabor(newScopeList, workOrder.labor || [], employees, positions);

    updateOrder({
      scope: newScopeList,
      labor: syncedLaborList
    });

    setNewScope({
      itemNumber: String(newScopeList.length + 1).padStart(3, '0'),
      description: '',
      peopleCount: 1,
      startDate: `${workOrder.date} 08:00`,
      endDate: `${workOrder.deadlineDate} 17:00`,
      responsibleName: workOrder.responsibleName,
      observation: ''
    });
  };

  const handleDeleteScope = (scopeId: string) => {
    const currentScope = workOrder.scope || [];
    const newScopeList = currentScope.filter(s => s.id !== scopeId);
    updateOrder({
      scope: newScopeList
    });
  };

  // 2. MÃO DE OBRA HANDLERS
  const handleLaborEmployeeChange = (empId: string) => {
    setNewLaborEmployeeId(empId);
    if (empId) {
      const { hourlyRate } = getEmployeePositionDetails(empId, employees, positions);
      setNewLaborHourlyRate(hourlyRate || 75);
    } else {
      setNewLaborHourlyRate(0);
    }
  };

  const handleAddManualLabor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaborEmployeeId) return;

    const emp = employees.find(e => e.id === newLaborEmployeeId);
    if (!emp) return;

    const { positionName, hourlyRate: defaultRate, positionId } = getEmployeePositionDetails(emp.id, employees, positions);
    const rate = newLaborHourlyRate > 0 ? Number(newLaborHourlyRate) : defaultRate;
    const hours = Number(newLaborHours) || 1;
    const qty = Number(newLaborQty) || 1;
    const totalVal = qty * hours * rate;

    const currentLabor = workOrder.labor || [];
    const currentScope = workOrder.scope || [];

    // Find linked scope item if selected
    const chosenItemNum = newLaborItemNumber || (currentScope[0]?.itemNumber || String(currentLabor.length + 1).padStart(3, '0'));
    const linkedScope = currentScope.find(s => s.itemNumber === chosenItemNum);
    const activityDesc = linkedScope?.description || (chosenItemNum ? `Atividade ${chosenItemNum}` : 'Geral / Apoio');

    // Check if there is an unassigned / placeholder labor entry for this itemNumber
    const placeholderIndex = currentLabor.findIndex(
      l => l.itemNumber === chosenItemNum && (!l.employeeId || !l.employeeName || l.employeeName === 'A Definir' || l.employeeName === 'Não atribuído')
    );

    let updatedLabor: WorkOrderLabor[];
    if (placeholderIndex >= 0) {
      // Replace placeholder with the real technician
      updatedLabor = currentLabor.map((l, idx) => {
        if (idx === placeholderIndex) {
          return {
            ...l,
            itemNumber: chosenItemNum,
            activityDescription: activityDesc,
            quantity: qty,
            positionId,
            positionName,
            employeeId: emp.id,
            employeeName: emp.name,
            hours,
            hourlyRate: rate,
            totalValue: totalVal
          };
        }
        return l;
      });
    } else {
      // Append new labor item
      const createdLabor: WorkOrderLabor = {
        id: generateUUID(),
        itemNumber: chosenItemNum,
        activityDescription: activityDesc,
        quantity: qty,
        positionId,
        positionName,
        employeeId: emp.id,
        employeeName: emp.name,
        hours,
        hourlyRate: rate,
        totalValue: totalVal
      };
      updatedLabor = [...currentLabor, createdLabor];
    }

    // Also update scope item's responsible if it was unassigned
    let updatedScope = currentScope;
    if (linkedScope && (!linkedScope.responsibleId || !linkedScope.responsibleName)) {
      updatedScope = currentScope.map(s => {
        if (s.id === linkedScope.id) {
          return {
            ...s,
            responsibleId: emp.id,
            responsibleName: emp.name
          };
        }
        return s;
      });
    }

    updateOrder({
      labor: updatedLabor,
      scope: updatedScope
    });

    setNewLaborEmployeeId('');
    setNewLaborHours(4);
    setNewLaborHourlyRate(0);
  };

  const handleAssignTechnicianToLabor = (laborId: string, employeeId: string) => {
    if (!employeeId) return;
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const { positionName, hourlyRate, positionId } = getEmployeePositionDetails(emp.id, employees, positions);
    const currentLabor = workOrder.labor || [];

    const updatedLabor = currentLabor.map(l => {
      if (l.id === laborId) {
        const hours = Number(l.hours) || 4;
        const qty = Number(l.quantity) || 1;
        const rate = hourlyRate || Number(l.hourlyRate) || 75;
        return {
          ...l,
          employeeId: emp.id,
          employeeName: emp.name,
          positionId,
          positionName,
          hourlyRate: rate,
          totalValue: qty * hours * rate
        };
      }
      return l;
    });

    updateOrder({ labor: updatedLabor });
  };

  const handleUpdateLaborHours = (laborId: string, delta: number) => {
    const currentLabor = workOrder.labor || [];
    const updatedLabor = currentLabor.map(l => {
      if (l.id === laborId) {
        const newHours = Math.max(0.5, (Number(l.hours) || 4) + delta);
        const qty = Number(l.quantity) || 1;
        const rate = Number(l.hourlyRate) || 0;
        return {
          ...l,
          hours: newHours,
          totalValue: qty * newHours * rate
        };
      }
      return l;
    });
    updateOrder({ labor: updatedLabor });
  };

  const handleDeleteLabor = (laborId: string) => {
    const currentLabor = workOrder.labor || [];
    const updatedLabor = currentLabor.filter(l => l.id !== laborId);
    updateOrder({ labor: updatedLabor });
  };

  // 3. RECURSOS HANDLERS
  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.name) return;

    const qty = Number(newResource.quantity) || 1;
    const cost = Number(newResource.unitCost) || 0;

    const createdResource: WorkOrderResource = {
      id: generateUUID(),
      type: newResource.type as any || 'Ferramenta',
      name: newResource.name,
      quantity: qty,
      unit: newResource.unit || 'UN',
      unitCost: cost,
      totalCost: qty * cost,
      status: newResource.status as any || 'Em Uso',
      notes: newResource.notes
    };

    const currentResources = workOrder.resources || [];
    const newResourcesList = [...currentResources, createdResource];
    updateOrder({ resources: newResourcesList });

    setNewResource({
      type: 'Ferramenta',
      name: '',
      quantity: 1,
      unit: 'UN',
      unitCost: 0,
      status: 'Em Uso',
      notes: ''
    });
  };

  const handleDeleteResource = (recId: string) => {
    const currentResources = workOrder.resources || [];
    const newResourcesList = currentResources.filter(r => r.id !== recId);
    updateOrder({ resources: newResourcesList });
  };

  // 4. VALORES HANDLERS
  const handleUpdateValues = (key: keyof WorkOrder['values'], value: number) => {
    const currentVal = workOrder.values || {
      laborCost: 0,
      partsCost: 0,
      materialsCost: 0,
      servicesCost: 0,
      resourcesCost: 0,
      additionalCosts: 0,
      travelDistanceKm: 0,
      travelRatePerKm: 2.50,
      travelCost: 0,
      taxPercent: 0,
      taxAmount: 0,
      subtotalCost: 0,
      totalCost: 0
    };

    const currentLaborCost = (workOrder.labor || []).reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
    const currentResourcesCost = (workOrder.resources || []).reduce((acc, curr) => acc + (curr.totalCost || 0), 0);

    const updatedOverrides: Partial<WorkOrder['values']> = { [key]: value };

    if (key === 'travelDistanceKm') {
      const rate = currentVal.travelRatePerKm || 2.50;
      updatedOverrides.travelCost = value * rate;
    } else if (key === 'travelRatePerKm') {
      const dist = currentVal.travelDistanceKm || 0;
      updatedOverrides.travelCost = dist * value;
    }

    const calculatedValues = recalculateValues(
      currentVal,
      currentLaborCost,
      currentResourcesCost,
      updatedOverrides
    );

    const updated: WorkOrder = {
      ...workOrder,
      values: calculatedValues,
      updatedAt: new Date().toISOString()
    };
    saveWorkOrder(updated);
  };

  // 5. MARCOS / ATÉ HANDLERS
  const handleToggleMilestone = (msId: string) => {
    const currentMilestones = workOrder.milestones || [];
    const updated = currentMilestones.map(m => {
      if (m.id === msId) {
        const isDone = m.status === 'Concluído';
        return {
          ...m,
          status: (isDone ? 'Pendente' : 'Concluído') as any,
          completedDate: isDone ? undefined : new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return m;
    });
    const updatedOrder: WorkOrder = {
      ...workOrder,
      milestones: updated,
      updatedAt: new Date().toISOString()
    };
    saveWorkOrder(updatedOrder);
  };

  // 6. EXECUÇÕES HANDLERS
  const handleAddExecution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExecution.description || !newExecution.servicePerformed) return;

    const emp = employees.find(e => e.id === newExecution.employeeId) || employees[0];

    const createdExecution: WorkOrderExecution = {
      id: generateUUID(),
      date: newExecution.date || new Date().toISOString().split('T')[0],
      startTime: newExecution.startTime || '08:00',
      endTime: newExecution.endTime || '12:00',
      employeeId: emp.id,
      employeeName: emp.name,
      positionName: emp.positionId ? (positions.find(p => p.id === emp.positionId)?.name || 'Técnico') : 'Técnico',
      description: newExecution.description,
      servicePerformed: newExecution.servicePerformed,
      observations: newExecution.observations
    };

    const currentExecutions = workOrder.executions || [];
    const updatedOrder: WorkOrder = {
      ...workOrder,
      executions: [createdExecution, ...currentExecutions],
      updatedAt: new Date().toISOString()
    };
    saveWorkOrder(updatedOrder);

    setNewExecution({
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '12:00',
      employeeId: employees[0]?.id || '',
      description: '',
      servicePerformed: '',
      observations: ''
    });
  };

  const handleStatusChange = (newStatus: WorkOrderStatus) => {
    updateWorkOrderStatus(workOrder.id, newStatus);
  };

  const handleDeleteWorkOrder = () => {
    deleteWorkOrder(workOrder.id);
    setIsDeletingConfirm(false);
    onClose();
  };

  const isMasterOrAdmin = can('excluir') || currentUser?.isMaster || currentUser?.email?.toLowerCase() === 'microwasmel@gmail.com';

  const laborList = workOrder.labor || [];
  const scopeList = workOrder.scope || [];
  const resourcesList = workOrder.resources || [];
  const milestonesList = workOrder.milestones || [];
  const executionsList = workOrder.executions || [];

  const val = workOrder.values || {
    laborCost: 0,
    partsCost: 0,
    materialsCost: 0,
    servicesCost: 0,
    resourcesCost: 0,
    additionalCosts: 0,
    travelDistanceKm: 0,
    travelRatePerKm: 2.50,
    travelCost: 0,
    taxPercent: 0,
    taxAmount: 0,
    subtotalCost: 0,
    totalCost: 0
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${workOrder.orderNumber} — ${workOrder.equipmentName}`}
        subtitle={`${workOrder.type} | Prioridade ${workOrder.priority} | ${workOrder.company || 'T&A Industrial Service'}`}
        maxWidth="6xl"
        icon={<Layers className="w-5 h-5 text-amber-400" />}
        headerActions={
          <div className="flex items-center gap-2 mr-2">
            <button
              id="detail-modal-print-btn"
              onClick={() => onPrint(workOrder)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 shadow-sm"
              title="Imprimir Ordem de Serviço"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Imprimir OS</span>
            </button>

            {can('editar') && (
              <button
                id="detail-modal-edit-btn"
                onClick={() => onEdit(workOrder)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-sm"
                title="Editar Cadastro da OS"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Editar OS</span>
              </button>
            )}

            {isMasterOrAdmin && (
              <button
                id="detail-modal-delete-btn"
                onClick={() => setIsDeletingConfirm(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
                title="Excluir Ordem de Serviço"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span className="hidden md:inline">Excluir</span>
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Top Summary Card */}
          <div className="bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-extrabold font-mono text-amber-400">
                  {workOrder.orderNumber}
                </span>
                <StatusBadge status={workOrder.status} size="lg" />
                <PriorityBadge priority={workOrder.priority} />
                <TypeBadge type={workOrder.type} />
              </div>

              {/* Quick Status Lifecycle Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                <select
                  id="os-status-select"
                  value={workOrder.status}
                  onChange={(e) => handleStatusChange(e.target.value as WorkOrderStatus)}
                  className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="Aberta">Aberta</option>
                  <option value="Aguardando">Aguardando</option>
                  <option value="Planejada">Planejada</option>
                  <option value="Em execução">Em execução</option>
                  <option value="Pausada">Pausada</option>
                  <option value="Concluída">Concluída</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-800/80">
              <div>
                <span className="text-slate-400 block font-medium">Equipamento:</span>
                <span className="text-slate-200 font-bold font-mono">
                  {workOrder.equipmentCode}
                </span>
                <span className="text-slate-300 block truncate">{workOrder.equipmentName}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Localização:</span>
                <span className="text-slate-200 font-medium">
                  {workOrder.unit}
                </span>
                <span className="text-slate-400 block truncate">
                  {workOrder.department} — {workOrder.area}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Responsável Técnico:</span>
                <span className="text-slate-200 font-medium">
                  {workOrder.responsibleName || 'Não atribuído'}
                </span>
                <span className="text-slate-400 block">
                  Solicitante: {workOrder.requesterName}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Prazo Limite:</span>
                <span className="text-amber-400 font-mono font-bold">
                  {formatDate(workOrder.deadlineDate)} {workOrder.deadlineTime || ''}
                </span>
                <span className="text-slate-400 block">
                  Aberta em: {formatDate(workOrder.date)} {workOrder.time}
                </span>
              </div>
            </div>

            {workOrder.description && (
              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                  Descrição do Chamado:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                  {workOrder.description}
                </p>
              </div>
            )}
          </div>

          {/* Symmetrical 6-Tab Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center h-20 ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="relative mb-1 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="absolute -top-1.5 -right-3.5 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-full min-w-[16px]">
                        {tab.count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold leading-tight mt-1">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENTS */}

          {/* 1. MÃO DE OBRA */}
          {activeTab === 'labor' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    Mão de Obra e Especialistas Alocados
                  </h4>
                  <p className="text-xs text-slate-400">
                    Aloque os técnicos diretamente para as atividades do escopo com cálculo automático de horas e valores.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400">
                    {laborList.length} alocação(ões)
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-400 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    Total: {formatCurrency(val.laborCost)}
                  </span>
                </div>
              </div>

              {/* Add / Allocate Labor Form */}
              <form onSubmit={handleAddManualLabor} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  Alocar Profissional para Atividade
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* 1. Atividade / Escopo */}
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Atividade / Item do Escopo *
                    </label>
                    <select
                      id="labor-scope-item-select"
                      value={newLaborItemNumber}
                      onChange={(e) => setNewLaborItemNumber(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
                    >
                      {scopeList.length === 0 && (
                        <option value="001">Item 001 — Atividade Principal</option>
                      )}
                      {scopeList.map((sc) => (
                        <option key={sc.id} value={sc.itemNumber}>
                          Item {sc.itemNumber} — {sc.description.length > 40 ? sc.description.substring(0, 40) + '...' : sc.description}
                        </option>
                      ))}
                      <option value="GERAL">Geral / Apoio Operacional</option>
                    </select>
                  </div>

                  {/* 2. Profissional / Técnico */}
                  <div className="sm:col-span-7">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Profissional / Técnico Especialista *
                    </label>
                    <select
                      id="labor-employee-select"
                      value={newLaborEmployeeId}
                      onChange={(e) => handleLaborEmployeeChange(e.target.value)}
                      required
                      className="w-full px-2.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
                    >
                      <option value="">Selecione um funcionário...</option>
                      {employees.map((emp) => {
                        const { positionName, hourlyRate } = getEmployeePositionDetails(emp.id, employees, positions);
                        return (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} • {positionName} ({formatCurrency(hourlyRate)}/h)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end">
                  {/* 3. Horas Previstas */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Horas Previstas
                    </label>
                    <input
                      id="labor-hours-input"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={newLaborHours}
                      onChange={(e) => setNewLaborHours(Number(e.target.value))}
                      className="w-full px-2.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-center font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 4. Valor Hora (R$) */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Taxa Horária (R$)
                    </label>
                    <input
                      id="labor-rate-input"
                      type="number"
                      min="0"
                      step="1"
                      value={newLaborHourlyRate || ''}
                      onChange={(e) => setNewLaborHourlyRate(Number(e.target.value))}
                      placeholder="R$/h"
                      className="w-full px-2.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-center font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 5. Subtotal Preview */}
                  <div className="sm:col-span-3 flex items-center h-9 px-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium mr-1.5">Subtotal:</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {formatCurrency((Number(newLaborHours) || 0) * (Number(newLaborHourlyRate) || 0))}
                    </span>
                  </div>

                  {/* 6. Botão Alocar */}
                  <div className="sm:col-span-3">
                    <button
                      id="labor-submit-btn"
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 rounded-lg transition-all shadow-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      Alocar Técnico
                    </button>
                  </div>
                </div>
              </form>

              {/* Labor List */}
              <div className="space-y-2.5">
                {laborList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800 space-y-2">
                    <Users className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                    <p className="font-medium text-slate-400">Nenhum profissional alocado nesta Ordem de Serviço.</p>
                    <p className="text-[11px] text-slate-500">
                      Utilize o formulário acima para alocar técnicos e especialistas às tarefas do escopo.
                    </p>
                  </div>
                ) : (
                  laborList.map((lb) => {
                    const isUnassigned = !lb.employeeName || lb.employeeName === 'A Definir' || lb.employeeName === 'Não atribuído';
                    const matchedScope = scopeList.find(s => s.itemNumber === lb.itemNumber);
                    const activityLabel = lb.activityDescription || matchedScope?.description || (lb.itemNumber === 'GERAL' ? 'Apoio Geral' : `Atividade ${lb.itemNumber}`);

                    return (
                      <div
                        key={lb.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isUnassigned
                            ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          {/* Left Section: Badges & Technician Info */}
                          <div className="flex items-start sm:items-center gap-3">
                            <span className="px-2.5 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded font-mono font-bold text-xs shrink-0">
                              Item {lb.itemNumber}
                            </span>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {isUnassigned ? (
                                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    A Definir (Pendente de Atribuição)
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    {lb.employeeName}
                                  </span>
                                )}

                                <span className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700 font-medium">
                                  {lb.positionName || 'Técnico Especialista'}
                                </span>

                                <span className="text-[11px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/80">
                                  {activityLabel}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-400">
                                {lb.quantity > 1 ? `${lb.quantity}x ` : ''}
                                {lb.hours}h previstas • Taxa: {formatCurrency(lb.hourlyRate)}/h
                              </p>
                            </div>
                          </div>

                          {/* Right Section: Inline Assignment or Calculation + Delete Action */}
                          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                            {/* If unassigned, show quick employee selector */}
                            {isUnassigned ? (
                              <div className="flex items-center gap-2">
                                <select
                                  id={`assign-tech-select-${lb.id}`}
                                  onChange={(e) => handleAssignTechnicianToLabor(lb.id, e.target.value)}
                                  defaultValue=""
                                  className="px-2.5 py-1.5 text-xs bg-slate-950 border border-amber-500/40 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400"
                                >
                                  <option value="">Atribuir Técnico Agora...</option>
                                  {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                      {emp.name} ({getEmployeePositionDetails(emp.id, employees, positions).positionName})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              /* Quick Hour Adjustment Buttons */
                              <div className="flex items-center gap-1 bg-slate-950/80 rounded-lg p-1 border border-slate-800">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateLaborHours(lb.id, -0.5)}
                                  className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                                  title="Diminuir 30min"
                                >
                                  -
                                </button>
                                <span className="px-2 text-xs font-mono text-slate-200 font-bold">
                                  {lb.hours}h
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateLaborHours(lb.id, 0.5)}
                                  className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                                  title="Aumentar 30min"
                                >
                                  +
                                </button>
                              </div>
                            )}

                            {/* Total Value */}
                            <span className="text-xs font-mono font-bold text-emerald-400 min-w-[70px] text-right">
                              {formatCurrency(lb.totalValue || (lb.hours * lb.hourlyRate * (lb.quantity || 1)))}
                            </span>

                            {/* Functional Delete Button with explicit touch target & hover */}
                            <button
                              id={`delete-labor-btn-${lb.id}`}
                              type="button"
                              onClick={() => handleDeleteLabor(lb.id)}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 active:scale-95 rounded-lg border border-slate-700/60 hover:border-rose-500/40 transition-all flex items-center justify-center"
                              title="Remover Mão de Obra"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 2. ESCOPO */}
          {activeTab === 'scope' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                    Escopo Técnico de Atividades
                  </h4>
                  <p className="text-xs text-slate-400">
                    Ao adicionar escopo com número de pessoas, a mão de obra é sincronizada automaticamente.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {scopeList.length} Atividade(s)
                </span>
              </div>

              {/* Add Scope Form */}
              <form onSubmit={handleAddScope} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Nº Item</label>
                    <input
                      type="text"
                      value={newScope.itemNumber}
                      onChange={(e) => setNewScope({ ...newScope, itemNumber: e.target.value })}
                      placeholder="001"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-center font-mono"
                    />
                  </div>

                  <div className="sm:col-span-8">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Descrição da Atividade Técnica *</label>
                    <input
                      type="text"
                      required
                      value={newScope.description}
                      onChange={(e) => setNewScope({ ...newScope, description: e.target.value })}
                      placeholder="Ex: Desmontar acoplamento e verificar folga axial..."
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Pessoas</label>
                    <input
                      type="number"
                      min="1"
                      value={newScope.peopleCount}
                      onChange={(e) => setNewScope({ ...newScope, peopleCount: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-center font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Data/Hora Início</label>
                    <input
                      type="text"
                      value={newScope.startDate}
                      onChange={(e) => setNewScope({ ...newScope, startDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Data/Hora Fim</label>
                    <input
                      type="text"
                      value={newScope.endDate}
                      onChange={(e) => setNewScope({ ...newScope, endDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>

                  <div className="sm:col-span-4 flex items-end">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Inserir no Escopo
                    </button>
                  </div>
                </div>
              </form>

              {/* Scope List */}
              <div className="space-y-2">
                {scopeList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                    Nenhum item de escopo registrado.
                  </div>
                ) : (
                  scopeList.map((sc) => (
                    <div
                      key={sc.id}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-mono font-bold text-xs">
                          Nº {sc.itemNumber}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-100 leading-snug">
                            {sc.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                            <span className="text-amber-300 font-semibold">
                              {sc.peopleCount} pessoa(s)
                            </span>
                            <span>•</span>
                            <span>Início: {sc.startDate}</span>
                            <span>•</span>
                            <span>Fim: {sc.endDate}</span>
                            <span>•</span>
                            <span className="text-slate-300 font-medium">Resp: {sc.responsibleName}</span>
                          </div>
                          {sc.observation && (
                            <p className="text-[11px] text-slate-400 mt-1 bg-slate-950/40 px-2 py-1 rounded">
                              Obs: {sc.observation}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        id={`delete-scope-btn-${sc.id}`}
                        type="button"
                        onClick={() => handleDeleteScope(sc.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 active:scale-95 rounded-lg border border-slate-700/60 hover:border-rose-500/40 transition-all flex items-center justify-center shrink-0"
                        title="Excluir Item de Escopo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3. RECURSOS */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Recursos, Ferramentas & Veículos Alocados
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Total: {formatCurrency(val.resourcesCost)}
                </span>
              </div>

              {/* Resource Form */}
              <form onSubmit={handleAddResource} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Tipo</label>
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                  >
                    <option value="Ferramenta">Ferramenta</option>
                    <option value="Equipamento">Equipamento</option>
                    <option value="Máquina">Máquina</option>
                    <option value="Veículo">Veículo</option>
                    <option value="Material">Material</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Nome do Recurso *</label>
                  <input
                    type="text"
                    required
                    value={newResource.name}
                    onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                    placeholder="Ex: Torquímetro 50-350Nm"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Qtd / Un</label>
                  <input
                    type="number"
                    min="1"
                    value={newResource.quantity}
                    onChange={(e) => setNewResource({ ...newResource, quantity: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-center font-mono"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Custo Estimado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newResource.unitCost}
                    onChange={(e) => setNewResource({ ...newResource, unitCost: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-right font-mono"
                  />
                </div>

                <div className="sm:col-span-10">
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Observação / Certificado de Calibração</label>
                  <input
                    type="text"
                    value={newResource.notes}
                    onChange={(e) => setNewResource({ ...newResource, notes: e.target.value })}
                    placeholder="Ex: Certificado RBC válido até Dez/2026..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Alocar
                  </button>
                </div>
              </form>

              {/* Resources List */}
              <div className="space-y-2">
                {resourcesList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                    Nenhum recurso ou ferramenta adicional alocado.
                  </div>
                ) : (
                  resourcesList.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 text-xs font-medium">
                          {rec.type}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-100">{rec.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {rec.quantity} {rec.unit} • {rec.notes || 'Sem observações adicionais'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {formatCurrency(rec.totalCost)}
                        </span>
                        <button
                          id={`delete-resource-btn-${rec.id}`}
                          type="button"
                          onClick={() => handleDeleteResource(rec.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 active:scale-95 rounded-lg border border-slate-700/60 hover:border-rose-500/40 transition-all flex items-center justify-center shrink-0"
                          title="Remover Recurso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. VALORES & COMPOSIÇÃO FINANCEIRA COM DESLOCAMENTO E IMPOSTOS */}
          {activeTab === 'values' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                    Composição de Custos, Deslocamento & Tributos
                  </h4>
                  <p className="text-xs text-slate-400">
                    Gerencie custos operacionais, cálculo de deslocamento da equipe e alíquota de impostos.
                  </p>
                </div>
              </div>

              {/* Operational Costs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 block font-medium">1. Mão de Obra (Calculado)</span>
                  <span className="text-xl font-bold font-mono text-slate-100">
                    {formatCurrency(val.laborCost)}
                  </span>
                  <p className="text-[11px] text-slate-500">Calculado com base nas horas e cargos alocados</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 block font-medium">2. Peças Sobressalentes (R$)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={val.partsCost || 0}
                    onChange={(e) => handleUpdateValues('partsCost', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 block font-medium">3. Materiais / Consumíveis (R$)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={val.materialsCost || 0}
                    onChange={(e) => handleUpdateValues('materialsCost', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 block font-medium">4. Serviços Terceirizados (R$)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={val.servicesCost || 0}
                    onChange={(e) => handleUpdateValues('servicesCost', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 block font-medium">5. Recursos / Ferramental (Calculado)</span>
                  <span className="text-xl font-bold font-mono text-slate-100">
                    {formatCurrency(val.resourcesCost)}
                  </span>
                  <p className="text-[11px] text-slate-500">Calculado a partir da aba de Recursos</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 block font-medium">6. Custos Adicionais / Descarte (R$)</span>
                  <input
                    type="number"
                    step="0.01"
                    value={val.additionalCosts || 0}
                    onChange={(e) => handleUpdateValues('additionalCosts', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Dedicated Team Travel Calculation Section */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Truck className="w-4 h-4" />
                  <span>Deslocamento &amp; Transporte da Equipe</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Distância Total (Km)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={val.travelDistanceKm || 0}
                      onChange={(e) => handleUpdateValues('travelDistanceKm', Number(e.target.value))}
                      placeholder="Ex: 85"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Tarifa por Km (R$/Km)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.10"
                      value={val.travelRatePerKm || 2.50}
                      onChange={(e) => handleUpdateValues('travelRatePerKm', Number(e.target.value))}
                      placeholder="Ex: 2.50"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Custo Total de Deslocamento (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={val.travelCost || 0}
                      onChange={(e) => handleUpdateValues('travelCost', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Dedicated Taxes & Financial Totals Breakdown */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Receipt className="w-4 h-4" />
                  <span>Impostos, Tributação e Fechamento Geral</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block font-medium">Subtotal Operacional:</span>
                    <span className="text-lg font-bold font-mono text-slate-200">
                      {formatCurrency(val.subtotalCost || 0)}
                    </span>
                    <p className="text-[10px] text-slate-500">Mão de obra + Peças + Serviços + Deslocamento</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <Percent className="w-3 h-3 text-amber-400" />
                      Alíquota de Impostos (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={val.taxPercent || 0}
                      onChange={(e) => handleUpdateValues('taxPercent', Number(e.target.value))}
                      placeholder="Ex: 6.5"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">ISS / ICMS / Simples Nacional</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Valor dos Impostos (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={val.taxAmount || 0}
                      onChange={(e) => handleUpdateValues('taxAmount', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Calculado sobre o subtotal</p>
                  </div>
                </div>

                {/* Grand Total Consolidated Highlight */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-slate-950 border border-amber-500/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      VALOR TOTAL GERAL CONSOLIDADO DA OS
                    </p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Subtotal Operacional ({formatCurrency(val.subtotalCost || 0)}) + Impostos ({formatCurrency(val.taxAmount || 0)})
                    </p>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                    {formatCurrency(val.totalCost || 0)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. ATÉ (PRAZOS E SLAS) */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Até (Prazos, SLAs e Marcos de Entrega)
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  Prazo Final: {formatDate(workOrder.deadlineDate)} {workOrder.deadlineTime || ''}
                </span>
              </div>

              <div className="space-y-3">
                {milestonesList.map((ms) => {
                  const isCompleted = ms.status === 'Concluído';
                  return (
                    <div
                      key={ms.id}
                      onClick={() => handleToggleMilestone(ms.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {ms.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Prazo Alvo: <span className="font-semibold text-slate-300">{ms.targetDate}</span>
                            {ms.responsibleName && ` • Resp: ${ms.responsibleName}`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-amber-400 border-slate-700'
                        }`}>
                          {ms.status}
                        </span>
                        {ms.completedDate && (
                          <span className="block text-[10px] text-slate-500 mt-1 font-mono">
                            {ms.completedDate}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. EXECUÇÕES */}
          {activeTab === 'executions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Apontamentos e Histórico de Execuções Técnicas
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {executionsList.length} Apontamento(s)
                </span>
              </div>

              {/* Execution Form */}
              <form onSubmit={handleAddExecution} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Data</label>
                    <input
                      type="date"
                      value={newExecution.date}
                      onChange={(e) => setNewExecution({ ...newExecution, date: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Início</label>
                    <input
                      type="time"
                      value={newExecution.startTime}
                      onChange={(e) => setNewExecution({ ...newExecution, startTime: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-center"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Término</label>
                    <input
                      type="time"
                      value={newExecution.endTime}
                      onChange={(e) => setNewExecution({ ...newExecution, endTime: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-center"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Executante *</label>
                    <select
                      value={newExecution.employeeId}
                      onChange={(e) => setNewExecution({ ...newExecution, employeeId: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({positions.find(p => p.id === emp.positionId)?.name || 'Técnico'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Resumo da Atividade *</label>
                  <input
                    type="text"
                    required
                    value={newExecution.description}
                    onChange={(e) => setNewExecution({ ...newExecution, description: e.target.value })}
                    placeholder="Ex: Troca dos rolamentos do fuso e calibração dinâmica..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Serviço Realizado / Laudo Técnico *</label>
                  <textarea
                    required
                    rows={2}
                    value={newExecution.servicePerformed}
                    onChange={(e) => setNewExecution({ ...newExecution, servicePerformed: e.target.value })}
                    placeholder="Descreva as medidas encontradas, testes de carga, procedimentos realizados..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Registrar Execução
                  </button>
                </div>
              </form>

              {/* Executions Log */}
              <div className="space-y-3">
                {executionsList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                    Nenhum apontamento de execução registrado até o momento.
                  </div>
                ) : (
                  executionsList.map((exec) => (
                    <div
                      key={exec.id}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-100">{exec.employeeName}</span>
                          <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {exec.positionName || 'Técnico'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {formatDate(exec.date)} • {exec.startTime} às {exec.endTime}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-200">{exec.description}</p>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                        {exec.servicePerformed}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Confirmation Modal for Work Order Deletion */}
      {isDeletingConfirm && (
        <Modal
          isOpen={isDeletingConfirm}
          onClose={() => setIsDeletingConfirm(false)}
          title="Confirmar Exclusão de Ordem de Serviço"
          maxWidth="md"
          icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja excluir permanentemente a Ordem de Serviço{' '}
              <strong className="text-amber-400 font-mono">{workOrder.orderNumber}</strong>?
            </p>
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-[11px] text-rose-300">
              Esta ação removerá todos os apontamentos, escopos, registros de mão de obra e custos vinculados a esta OS.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeletingConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                Cancelar
              </button>
              <button
                id="confirm-delete-os-btn"
                onClick={handleDeleteWorkOrder}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors shadow-md"
              >
                Sim, Excluir OS
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
