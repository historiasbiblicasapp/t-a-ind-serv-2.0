import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { MaintenancePlan, MaintenanceFrequency } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { PriorityBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatDate, generateUUID } from '../lib/utils';
import {
  Wrench,
  PlusCircle,
  PlayCircle,
  CheckSquare,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Send,
  AlertCircle
} from 'lucide-react';

interface MaintenanceViewProps {
  onOpenWorkOrderModal?: (planOSId: string) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = () => {
  const { preventivePlans, savePreventivePlan, deletePreventivePlan, generateOSFromPlan, equipment, employees } = useData();
  const { can } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states for preventive plan
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [frequency, setFrequency] = useState<MaintenanceFrequency>('Mensal');
  const [intervalValue, setIntervalValue] = useState(30);
  const [estimatedDurationHours, setEstimatedDurationHours] = useState(4);
  const [priority, setPriority] = useState<'Baixa' | 'Normal' | 'Alta' | 'Crítica'>('Alta');
  const [responsibleName, setResponsibleName] = useState('');
  const [description, setDescription] = useState('');
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState('');
  const [checklistItems, setChecklistItems] = useState<{ id: string; description: string }[]>([
    { id: '1', description: 'Inspeção visual e limpeza geral' },
    { id: '2', description: 'Lubrificação dos mancais e rolamentos' },
    { id: '3', description: 'Reaperto de parafusos e conexões estruturais' }
  ]);
  const [newCheckItem, setNewCheckItem] = useState('');

  const handleOpenNewPlan = () => {
    const nextCode = `PLN-${String(preventivePlans.length + 1).padStart(3, '0')}`;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 15);

    setCode(nextCode);
    setTitle('');
    setEquipmentId(equipment[0]?.id || '');
    setFrequency('Mensal');
    setIntervalValue(30);
    setEstimatedDurationHours(4);
    setPriority('Alta');
    setResponsibleName(employees[0]?.name || 'Equipe Mecânica');
    setDescription('');
    setNextMaintenanceDate(nextDate.toISOString().split('T')[0]);
    setChecklistItems([
      { id: '1', description: 'Inspeção de nível de óleo e vazamentos' },
      { id: '2', description: 'Verificação da pressão hidráulica e pneumática' },
      { id: '3', description: 'Medição de corrente e vibração do motor principal' }
    ]);
    setIsPlanModalOpen(true);
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    setChecklistItems([...checklistItems, { id: generateUUID(), description: newCheckItem.trim() }]);
    setNewCheckItem('');
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklistItems(checklistItems.filter(c => c.id !== id));
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const eq = equipment.find(e => e.id === equipmentId) || equipment[0];

    const plan: MaintenancePlan = {
      id: generateUUID(),
      code,
      title,
      equipmentId: eq.id,
      equipmentCode: eq.code,
      equipmentName: eq.name,
      frequency,
      intervalValue,
      periodicityType: 'Dias',
      periodicityValue: intervalValue,
      estimatedDurationHours,
      priority,
      responsibleName,
      description,
      checklistItems,
      active: true,
      status: 'Ativo',
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextMaintenanceDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    savePreventivePlan(plan);
    setIsPlanModalOpen(false);
  };

  const handleGenerateOS = (planId: string) => {
    const generated = generateOSFromPlan(planId);
    if (generated) {
      setSuccessMessage(`Ordem de Serviço ${generated.orderNumber} gerada com sucesso a partir do plano preventivo!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const columns: Column<MaintenancePlan>[] = [
    {
      header: 'Código',
      accessor: (p) => <span className="font-mono font-bold text-amber-400">{p.code}</span>,
      className: 'w-28',
    },
    {
      header: 'Título do Plano',
      accessor: (p) => (
        <div>
          <span className="font-bold text-slate-100 block text-xs">{p.title}</span>
          <span className="text-[11px] text-slate-400">{p.description}</span>
        </div>
      ),
    },
    {
      header: 'Equipamento',
      accessor: (p) => (
        <div>
          <span className="font-mono font-bold text-slate-200 text-xs">{p.equipmentCode}</span>
          <span className="text-[11px] text-slate-400 block truncate max-w-xs">{p.equipmentName}</span>
        </div>
      ),
    },
    {
      header: 'Frequência',
      accessor: (p) => (
        <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 text-xs font-semibold">
          {p.frequency} ({p.intervalValue}d)
        </span>
      ),
      className: 'w-32',
    },
    {
      header: 'Prioridade',
      accessor: (p) => <PriorityBadge priority={p.priority} size="sm" />,
      className: 'w-24 text-center',
      align: 'center',
    },
    {
      header: 'Próxima Execução',
      accessor: (p) => (
        <span className="font-mono font-bold text-amber-400 text-xs">
          {formatDate(p.nextMaintenanceDate)}
        </span>
      ),
      className: 'w-32',
    },
    {
      header: 'Ação Rápida',
      accessor: (p) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleGenerateOS(p.id);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
          title="Gerar Ordem de Serviço Imediata"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Gerar OS</span>
        </button>
      ),
      className: 'w-32 text-right',
      align: 'right',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            Planos de Manutenção Preventiva & Sistemática
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Periodicidades, checklists padronizados e disparo automático de Ordens de Serviço
          </p>
        </div>

        {can('criar') && (
          <button
            id="preventive-new-btn"
            onClick={handleOpenNewPlan}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Plano Preventivo</span>
          </button>
        )}
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Table */}
      <DataTable
        data={preventivePlans}
        columns={columns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Pesquisar planos preventivos por código, título, equipamento..."
        searchFilter={(p, q) =>
          p.code.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.equipmentCode.toLowerCase().includes(q) ||
          p.equipmentName.toLowerCase().includes(q) ||
          p.responsibleName.toLowerCase().includes(q)
        }
        onRowClick={(p) => setSelectedPlan(p)}
        pageSize={10}
      />

      {/* Plan Details Modal */}
      {selectedPlan && (
        <Modal
          isOpen={Boolean(selectedPlan)}
          onClose={() => setSelectedPlan(null)}
          title={`${selectedPlan.code} — ${selectedPlan.title}`}
          subtitle={`Equipamento: ${selectedPlan.equipmentCode} (${selectedPlan.equipmentName})`}
          maxWidth="3xl"
          icon={<Wrench className="w-5 h-5 text-amber-400" />}
          headerActions={
            <button
              onClick={() => {
                handleGenerateOS(selectedPlan.id);
                setSelectedPlan(null);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg mr-2"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Gerar OS Agora</span>
            </button>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Periodicidade:</span>
                <span className="font-bold text-slate-100">{selectedPlan.frequency} ({selectedPlan.intervalValue} dias)</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Duração Estimada:</span>
                <span className="font-bold text-slate-100 font-mono">{selectedPlan.estimatedDurationHours} horas</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Prioridade:</span>
                <PriorityBadge priority={selectedPlan.priority} size="sm" />
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Responsável Padrão:</span>
                <span className="font-bold text-slate-100">{selectedPlan.responsibleName}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-800">
                <span className="text-slate-400 block font-medium">Última Execução:</span>
                <span className="text-slate-300 font-mono">{formatDate(selectedPlan.lastMaintenanceDate || '')}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-800">
                <span className="text-slate-400 block font-medium">Próxima Execução Programada:</span>
                <span className="font-bold text-amber-400 font-mono">{formatDate(selectedPlan.nextMaintenanceDate)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Checklist Operacional de Tarefas ({selectedPlan.checklistItems.length} itens)
              </h4>
              <div className="space-y-2">
                {selectedPlan.checklistItems.map((chk, idx) => (
                  <div
                    key={chk.id || idx}
                    className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center gap-3 text-xs"
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200 font-medium">{chk.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Plan Modal */}
      {isPlanModalOpen && (
        <Modal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          title="Criar Novo Plano Preventivo"
          subtitle="Configure a rotina de manutenção, frequência e checklist técnico"
          maxWidth="4xl"
        >
          <form onSubmit={handleSavePlan} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Código do Plano *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Título do Plano *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Preventiva Mensal Mecânica & Pneumática"
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Equipamento Alvo *</label>
                <select
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-medium"
                >
                  {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.code} - {eq.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Frequência *</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-medium"
                >
                  <option value="Semanal">Semanal (7 dias)</option>
                  <option value="Quinzenal">Quinzenal (15 dias)</option>
                  <option value="Mensal">Mensal (30 dias)</option>
                  <option value="Bimestral">Bimestral (60 dias)</option>
                  <option value="Trimestral">Trimestral (90 dias)</option>
                  <option value="Semestral">Semestral (180 dias)</option>
                  <option value="Anual">Anual (365 dias)</option>
                  <option value="Por Horímetro">Por Horímetro (Horas)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Duração Estimada (h)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={estimatedDurationHours}
                  onChange={(e) => setEstimatedDurationHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Descrição / Instruções do Plano</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Orientações de bloqueio de energia (LOTO), EPIs obrigatórios..."
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 resize-none"
              />
            </div>

            {/* Checklist Builder */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Itens de Checklist da Preventiva ({checklistItems.length} cadastrados)
              </label>

              <div className="space-y-2 mb-3">
                {checklistItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 font-bold">{idx + 1}.</span>
                      <span className="text-slate-200">{item.description}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklist(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  placeholder="Novo item de checklist (Ex: Verificar tensão das correias)..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAddChecklist}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-lg border border-slate-700"
                >
                  Adicionar Item
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-lg"
              >
                Salvar Plano Preventivo
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
