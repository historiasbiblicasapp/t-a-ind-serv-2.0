import React, { useState, useEffect } from 'react';
import { WorkOrder, WorkOrderStatus, WorkOrderType, WorkOrderPriority } from '../../types';
import { Modal } from '../common/Modal';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { generateUUID } from '../../lib/utils';
import { ClipboardList, Plus } from 'lucide-react';

interface WorkOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: WorkOrder | null;
}

export const WorkOrderFormModal: React.FC<WorkOrderFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { equipment, employees, companies, units, departments, areas, saveWorkOrder, workOrders } = useData();
  const { currentUser } = useAuth();

  const isEditing = Boolean(initialData);

  const [orderNumber, setOrderNumber] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [company, setCompany] = useState('');
  const [unit, setUnit] = useState('');
  const [department, setDepartment] = useState('');
  const [area, setArea] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [type, setType] = useState<WorkOrderType>('Corretiva');
  const [priority, setPriority] = useState<WorkOrderPriority>('Normal');
  const [description, setDescription] = useState('');
  const [responsibleId, setResponsibleId] = useState('');
  const [status, setStatus] = useState<WorkOrderStatus>('Aberta');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('17:00');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (initialData) {
      setOrderNumber(initialData.orderNumber);
      setRequesterName(initialData.requesterName);
      setDate(initialData.date);
      setTime(initialData.time);
      setCompany(initialData.company);
      setUnit(initialData.unit);
      setDepartment(initialData.department);
      setArea(initialData.area);
      setEquipmentId(initialData.equipmentId);
      setType(initialData.type);
      setPriority(initialData.priority);
      setDescription(initialData.description);
      setResponsibleId(initialData.responsibleId || '');
      setStatus(initialData.status);
      setDeadlineDate(initialData.deadlineDate);
      setDeadlineTime(initialData.deadlineTime || '17:00');
      setObservations(initialData.observations || '');
    } else {
      const now = new Date();
      const currentYear = now.getFullYear();
      const nextNum = String(workOrders.length + 95).padStart(4, '0');
      
      setOrderNumber(`OS-${currentYear}-${nextNum}`);
      setRequesterName(currentUser?.name || '');
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toTimeString().substring(0, 5));
      setCompany(companies[0]?.name || 'T&A Industrial Service Ltda.');
      setUnit(units[0]?.name || 'Planta Principal - Joinville');
      setDepartment(departments[0]?.name || 'Usinagem Pesada');
      setArea(areas[0]?.name || 'Linha CNC 01');
      setEquipmentId(equipment[0]?.id || '');
      setType('Corretiva');
      setPriority('Normal');
      setDescription('');
      setResponsibleId(employees[0]?.id || '');
      setStatus('Aberta');
      
      // Default deadline = tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDeadlineDate(tomorrow.toISOString().split('T')[0]);
      setDeadlineTime('17:00');
      setObservations('');
    }
  }, [initialData, isOpen, currentUser, equipment, employees, companies, units, departments, areas, workOrders.length]);

  const handleEquipmentChange = (eqId: string) => {
    setEquipmentId(eqId);
    const selected = equipment.find(e => e.id === eqId);
    if (selected) {
      if (selected.company) setCompany(selected.company);
      if (selected.unit) setUnit(selected.unit);
      if (selected.department) setDepartment(selected.department);
      if (selected.area) setArea(selected.area);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedEq = equipment.find(e => e.id === equipmentId) || equipment[0];
    const selectedResp = employees.find(e => e.id === responsibleId);

    const baseOrder: WorkOrder = initialData || {
      id: generateUUID(),
      orderNumber,
      requesterName,
      requesterId: currentUser?.id,
      date,
      time,
      company,
      unit,
      department,
      area,
      equipmentId: selectedEq?.id || '',
      equipmentCode: selectedEq?.code || 'EQ-00',
      equipmentName: selectedEq?.name || 'Equipamento',
      type,
      priority,
      description,
      responsibleId: selectedResp?.id,
      responsibleName: selectedResp?.name || 'Não atribuído',
      status,
      deadlineDate,
      deadlineTime,
      observations,
      scope: [
        {
          id: generateUUID(),
          itemNumber: '001',
          description: description || 'Diagnóstico e reparo técnico',
          peopleCount: 1,
          startDate: `${date} ${time}`,
          endDate: `${deadlineDate} ${deadlineTime}`,
          responsibleId: selectedResp?.id,
          responsibleName: selectedResp?.name
        }
      ],
      labor: [],
      resources: [],
      values: {
        laborCost: 0,
        partsCost: 0,
        materialsCost: 0,
        servicesCost: 0,
        resourcesCost: 0,
        additionalCosts: 0,
        totalCost: 0
      },
      milestones: [
        { id: generateUUID(), title: 'Diagnóstico e Liberação de Escopo', targetDate: deadlineDate, status: 'Pendente', responsibleName: selectedResp?.name }
      ],
      executions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedOrder: WorkOrder = {
      ...baseOrder,
      orderNumber,
      requesterName,
      date,
      time,
      company,
      unit,
      department,
      area,
      equipmentId: selectedEq?.id || '',
      equipmentCode: selectedEq?.code || 'EQ-00',
      equipmentName: selectedEq?.name || 'Equipamento',
      type,
      priority,
      description,
      responsibleId: selectedResp?.id,
      responsibleName: selectedResp?.name || 'Não atribuído',
      status,
      deadlineDate,
      deadlineTime,
      observations,
    };

    saveWorkOrder(updatedOrder);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar Ordem de Serviço: ${orderNumber}` : 'Nova Ordem de Serviço'}
      subtitle="Preencha os dados cadastrais da Ordem de Serviço Industrial"
      icon={<ClipboardList className="w-5 h-5 text-amber-400" />}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Identification Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Número da OS *
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Solicitante *
            </label>
            <input
              type="text"
              required
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Data Abertura *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Hora *
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Location & Organization */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Empresa
            </label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Unidade
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Setor
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Área
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
          </div>
        </div>

        {/* Equipment Selection & Classification */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Equipamento *
            </label>
            <select
              required
              value={equipmentId}
              onChange={(e) => handleEquipmentChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
            >
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.code} - {eq.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Tipo de Manutenção *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WorkOrderType)}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
            >
              <option value="Corretiva">Corretiva</option>
              <option value="Preventiva">Preventiva</option>
              <option value="Preditiva">Preditiva</option>
              <option value="Inspeção">Inspeção</option>
              <option value="Melhoria">Melhoria</option>
              <option value="Emergencial">Emergencial</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Prioridade *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as WorkOrderPriority)}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
            >
              <option value="Baixa">Baixa</option>
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Descrição do Problema / Serviço Solicitado *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva detalhadamente o sintoma, falha mecânica, elétrica ou escopo do serviço a ser realizado..."
            className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        {/* Responsible, Status & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Responsável Técnico
            </label>
            <select
              value={responsibleId}
              onChange={(e) => setResponsibleId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="">Não atribuído</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.positionName || 'Técnico'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Status da OS *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Prazo Limite *
              </label>
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Hora Limite
              </label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Observations */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Observações / Restrições de Parada
          </label>
          <input
            type="text"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ex: Parada autorizada pelo gerente. Necessário LOTO e andaime."
            className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            {isEditing ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
