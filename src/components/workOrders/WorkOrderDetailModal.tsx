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
import { formatCurrency, formatDate, formatDateTime, generateUUID } from '../../lib/utils';
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
  Clock,
  Building,
  UserCheck,
  AlertTriangle,
  Send,
  Camera,
  Layers
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

  const { employees, positions, saveWorkOrder, updateWorkOrderStatus, logAudit } = useData();
  const { currentUser, can } = useAuth();

  const [activeTab, setActiveTab] = useState<OSTab>('labor');

  // Form states for adding items
  const [newScope, setNewScope] = useState<Partial<WorkOrderScope>>({
    itemNumber: String((workOrder.scope.length || 0) + 1).padStart(3, '0'),
    description: '',
    peopleCount: 1,
    startDate: `${workOrder.date} 08:00`,
    endDate: `${workOrder.deadlineDate} 17:00`,
    responsibleName: workOrder.responsibleName,
    observation: ''
  });

  const [newLaborEmployeeId, setNewLaborEmployeeId] = useState('');
  const [newLaborHours, setNewLaborHours] = useState(4);

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

  // Six symmetrical tabs specification: Same height, spacing, alignment, centered icons, centered text, symmetrical layout
  const tabs: { id: OSTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'labor', label: 'Mão de Obra', icon: Users, count: workOrder.labor.length },
    { id: 'scope', label: 'Escopo', icon: FileText, count: workOrder.scope.length },
    { id: 'resources', label: 'Recursos', icon: Wrench, count: workOrder.resources.length },
    { id: 'values', label: 'Valores', icon: DollarSign },
    { id: 'milestones', label: 'Até', icon: CalendarCheck2, count: workOrder.milestones.length },
    { id: 'executions', label: 'Execuções', icon: PlayCircle, count: workOrder.executions.length },
  ];

  // Helper to persist work order updates with auto-sync
  const updateOrder = (partial: Partial<WorkOrder>) => {
    const updated = {
      ...workOrder,
      ...partial,
      updatedAt: new Date().toISOString()
    };
    saveWorkOrder(updated);
  };

  // 1. ESCOPO HANDLERS (TRIGGERS SPECIAL RULE: ESCOPO -> MÃO DE OBRA)
  const handleAddScope = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScope.description) return;

    const itemNum = newScope.itemNumber || String(workOrder.scope.length + 1).padStart(3, '0');
    const people = Number(newScope.peopleCount) || 1;

    const createdScope: WorkOrderScope = {
      id: generateUUID(),
      itemNumber: itemNum,
      description: newScope.description,
      peopleCount: people,
      startDate: newScope.startDate || `${workOrder.date} 08:00`,
      endDate: newScope.endDate || `${workOrder.deadlineDate} 17:00`,
      responsibleName: newScope.responsibleName || workOrder.responsibleName,
      observation: newScope.observation
    };

    const newScopeList = [...workOrder.scope, createdScope];
    // AUTOMATIC SYNCHRONIZATION: Escopo -> Mão de Obra
    const syncedLaborList = syncScopeToLabor(newScopeList, workOrder.labor, employees, positions);

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
    const newScopeList = workOrder.scope.filter(s => s.id !== scopeId);
    const syncedLaborList = syncScopeToLabor(newScopeList, workOrder.labor, employees, positions);
    updateOrder({
      scope: newScopeList,
      labor: syncedLaborList
    });
  };

  // 2. MÃO DE OBRA HANDLERS
  const handleUpdateLaborEmployee = (laborId: string, empId: string) => {
    const details = getEmployeePositionDetails(empId, employees, positions);
    const emp = employees.find(e => e.id === empId);

    const updatedLabor = workOrder.labor.map(l => {
      if (l.id === laborId) {
        const hourlyRate = details.hourlyRate;
        const totalValue = l.quantity * l.hours * hourlyRate;
        return {
          ...l,
          employeeId: empId,
          employeeName: emp?.name || '',
          positionId: details.positionId,
          positionName: details.positionName, // AUTOMATIC CARGO LINK
          hourlyRate,
          totalValue
        };
      }
      return l;
    });

    updateOrder({ labor: updatedLabor });
  };

  const handleUpdateLaborHours = (laborId: string, hours: number) => {
    const updatedLabor = workOrder.labor.map(l => {
      if (l.id === laborId) {
        const totalValue = l.quantity * hours * l.hourlyRate;
        return { ...l, hours, totalValue };
      }
      return l;
    });
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

    updateOrder({
      resources: [...workOrder.resources, createdResource]
    });

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
    updateOrder({
      resources: workOrder.resources.filter(r => r.id !== recId)
    });
  };

  // 4. VALORES HANDLERS
  const handleUpdateValues = (key: keyof WorkOrder['values'], value: number) => {
    const current = { ...workOrder.values, [key]: value };
    const totalCost = (
      current.laborCost +
      current.partsCost +
      current.materialsCost +
      current.servicesCost +
      current.resourcesCost +
      current.additionalCosts
    );
    updateOrder({ values: { ...current, totalCost } });
  };

  // 5. MARCOS / ATÉ HANDLERS
  const handleToggleMilestone = (msId: string) => {
    const updated = workOrder.milestones.map(m => {
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
    updateOrder({ milestones: updated });
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
      employeeId: emp?.id || '',
      employeeName: emp?.name || 'Técnico',
      positionName: emp?.positionName || 'Especialista',
      description: newExecution.description,
      servicePerformed: newExecution.servicePerformed,
      observations: newExecution.observations,
    };

    updateOrder({
      executions: [createdExecution, ...workOrder.executions]
    });

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${workOrder.orderNumber} — ${workOrder.equipmentName}`}
      subtitle={`${workOrder.type} | Prioridade ${workOrder.priority} | ${workOrder.department} / ${workOrder.area}`}
      maxWidth="6xl"
      icon={<Layers className="w-5 h-5 text-amber-400" />}
      headerActions={
        <div className="flex items-center gap-2 mr-2">
          <button
            onClick={() => onPrint(workOrder)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
            title="Imprimir Ordem de Serviço"
          >
            <Printer className="w-4 h-4 text-slate-300" />
          </button>

          {can('editar') && (
            <button
              onClick={() => onEdit(workOrder)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
              title="Editar Cadastro da OS"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
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
              <span className="text-slate-400 block font-medium">Solicitante:</span>
              <span className="text-slate-200 font-semibold truncate block">
                {workOrder.requesterName}
              </span>
              <span className="text-slate-400">{formatDate(workOrder.date)} às {workOrder.time}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Responsável Técnico:</span>
              <span className="text-amber-400 font-semibold truncate block">
                {workOrder.responsibleName || 'Não atribuído'}
              </span>
              <span className="text-slate-400">{workOrder.department}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Prazo Limite:</span>
              <span className="text-slate-200 font-bold">
                {formatDate(workOrder.deadlineDate)} {workOrder.deadlineTime || ''}
              </span>
              <span className="text-emerald-400 font-mono font-bold block">
                Total: {formatCurrency(workOrder.values?.totalCost)}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Descrição do Serviço:
            </span>
            <p className="text-slate-200 leading-relaxed">{workOrder.description}</p>
          </div>
        </div>

        {/* 6 SYMMETRICAL TABS WITH MATCHING HEIGHT, SPACING, ALIGNMENT, CENTERED ICONS & TEXT */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`h-20 sm:h-22 p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-bold scale-[1.02]'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center mb-1.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                </div>
                <span className="text-xs tracking-tight line-clamp-1">
                  {tab.label}
                </span>
                {tab.count !== undefined && (
                  <span
                    className={`mt-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-slate-950 text-amber-400 font-bold'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}

        {/* 1. MÃO DE OBRA */}
        {activeTab === 'labor' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Mão de Obra Vinculada
                </h4>
                <p className="text-xs text-amber-400/90 mt-0.5">
                  Itens e quantidades sincronizados automaticamente a partir do Escopo do Serviço.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Mão de Obra</span>
                <span className="text-base font-extrabold font-mono text-emerald-400">
                  {formatCurrency(workOrder.values?.laborCost)}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-3 w-16 text-center">Item</th>
                    <th className="py-3 px-3 w-16 text-center">Qtd</th>
                    <th className="py-3 px-3">Funcionário</th>
                    <th className="py-3 px-3">Cargo (Auto)</th>
                    <th className="py-3 px-3 w-20 text-center">Horas</th>
                    <th className="py-3 px-3 w-28 text-right">Valor Hora</th>
                    <th className="py-3 px-3 w-32 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {workOrder.labor.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Nenhuma mão de obra cadastrada. Adicione itens no Escopo para gerar automaticamente.
                      </td>
                    </tr>
                  ) : (
                    workOrder.labor.map((lab) => (
                      <tr key={lab.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                          {lab.itemNumber}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold">
                          {lab.quantity}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={lab.employeeId}
                            onChange={(e) => handleUpdateLaborEmployee(lab.id, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                          >
                            <option value="">Selecione o Funcionário...</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>
                                {emp.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-1 bg-slate-900 text-slate-300 rounded border border-slate-700 font-medium inline-block">
                            {lab.positionName || 'Não especificado'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={lab.hours}
                            onChange={(e) => handleUpdateLaborHours(lab.id, Number(e.target.value))}
                            className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-center text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">
                          {formatCurrency(lab.hourlyRate)}/h
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                          {formatCurrency(lab.totalValue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. ESCOPO DO SERVIÇO */}
        {activeTab === 'scope' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Escopo do Serviço (Atividades Programadas)
              </h4>
              <span className="text-xs text-slate-400">
                {workOrder.scope.length} etapas cadastradas
              </span>
            </div>

            {/* Scope Form */}
            <form onSubmit={handleAddScope} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Nº</label>
                <input
                  type="text"
                  required
                  value={newScope.itemNumber}
                  onChange={(e) => setNewScope({ ...newScope, itemNumber: e.target.value })}
                  placeholder="001"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold text-center"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Pessoas</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newScope.peopleCount}
                  onChange={(e) => setNewScope({ ...newScope, peopleCount: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-center font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-8">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Descrição do Escopo *</label>
                <input
                  type="text"
                  required
                  value={newScope.description}
                  onChange={(e) => setNewScope({ ...newScope, description: e.target.value })}
                  placeholder="Ex: Desmontar conjunto frontal, despressurizar circuito e substituir retentor..."
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Data Inicial</label>
                <input
                  type="text"
                  value={newScope.startDate}
                  onChange={(e) => setNewScope({ ...newScope, startDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Data Final</label>
                <input
                  type="text"
                  value={newScope.endDate}
                  onChange={(e) => setNewScope({ ...newScope, endDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Responsável</label>
                <select
                  value={newScope.responsibleName}
                  onChange={(e) => setNewScope({ ...newScope, responsibleName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                >
                  <option value={workOrder.responsibleName}>{workOrder.responsibleName}</option>
                  {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                </select>
              </div>

              <div className="sm:col-span-10">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Observação</label>
                <input
                  type="text"
                  value={newScope.observation}
                  onChange={(e) => setNewScope({ ...newScope, observation: e.target.value })}
                  placeholder="Instruções de segurança ou restrições..."
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>
            </form>

            {/* Scope List */}
            <div className="space-y-2">
              {workOrder.scope.map((sc) => (
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
                    onClick={() => handleDeleteScope(sc.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    title="Excluir Item de Escopo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
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
                Total: {formatCurrency(workOrder.values?.resourcesCost)}
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
              {workOrder.resources.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                  Nenhum recurso ou ferramenta adicional alocado.
                </div>
              ) : (
                workOrder.resources.map((rec) => (
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
                        onClick={() => handleDeleteResource(rec.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
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

        {/* 4. VALORES */}
        {activeTab === 'values' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Composição de Custos da Ordem de Serviço
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 block font-medium">1. Mão de Obra (Calculado)</span>
                <span className="text-xl font-bold font-mono text-slate-100">
                  {formatCurrency(workOrder.values?.laborCost)}
                </span>
                <p className="text-[11px] text-slate-500">Calculado com base nas horas e cargos</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 block font-medium">2. Peças Sobressalentes</span>
                <input
                  type="number"
                  step="0.01"
                  value={workOrder.values?.partsCost || 0}
                  onChange={(e) => handleUpdateValues('partsCost', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 block font-medium">3. Materiais / Consumíveis</span>
                <input
                  type="number"
                  step="0.01"
                  value={workOrder.values?.materialsCost || 0}
                  onChange={(e) => handleUpdateValues('materialsCost', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 block font-medium">4. Serviços Terceirizados</span>
                <input
                  type="number"
                  step="0.01"
                  value={workOrder.values?.servicesCost || 0}
                  onChange={(e) => handleUpdateValues('servicesCost', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 block font-medium">5. Recursos / Ferramentas</span>
                <span className="text-xl font-bold font-mono text-slate-100">
                  {formatCurrency(workOrder.values?.resourcesCost)}
                </span>
                <p className="text-[11px] text-slate-500">Calculado a partir da aba de Recursos</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 block font-medium">6. Custos Adicionais / Descarte</span>
                <input
                  type="number"
                  step="0.01"
                  value={workOrder.values?.additionalCosts || 0}
                  onChange={(e) => handleUpdateValues('additionalCosts', Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold"
                />
              </div>
            </div>

            {/* Total Highlight */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Custo Total Consolidado da OS
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Soma de mão de obra direta, peças, materiais, serviços e recursos
                </p>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                {formatCurrency(workOrder.values?.totalCost)}
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
              {workOrder.milestones.map((ms) => {
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
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Concluído em: {ms.completedDate}
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
                Apontamentos de Execução Realizada
              </h4>
              <span className="text-xs text-slate-400">
                {workOrder.executions.length} apontamento(s)
              </span>
            </div>

            {/* Execution Form */}
            <form onSubmit={handleAddExecution} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={newExecution.date}
                    onChange={(e) => setNewExecution({ ...newExecution, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Hora Inicial *</label>
                  <input
                    type="time"
                    required
                    value={newExecution.startTime}
                    onChange={(e) => setNewExecution({ ...newExecution, startTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Hora Final *</label>
                  <input
                    type="time"
                    required
                    value={newExecution.endTime}
                    onChange={(e) => setNewExecution({ ...newExecution, endTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Executante *</label>
                  <select
                    value={newExecution.employeeId}
                    onChange={(e) => setNewExecution({ ...newExecution, employeeId: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.positionName || 'Técnico'})</option>
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
              {workOrder.executions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                  Nenhum apontamento de execução registrado até o momento.
                </div>
              ) : (
                workOrder.executions.map((exec) => (
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
  );
};
