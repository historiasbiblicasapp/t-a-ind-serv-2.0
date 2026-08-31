import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Employee, Position, UserRole } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { formatCurrency, generateUUID } from '../lib/utils';
import {
  Users,
  Briefcase,
  ShieldCheck,
  PlusCircle,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Clock,
  DollarSign,
  UserCheck
} from 'lucide-react';

export const PeopleView: React.FC = () => {
  const { employees, positions, saveEmployee, deleteEmployee, savePosition, deletePosition } = useData();
  const { can, users } = useAuth();

  const [activeTab, setActiveTab] = useState<'employees' | 'positions' | 'roles'>('employees');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  // Form states for Employee
  const [empName, setEmpName] = useState('');
  const [empCpf, setEmpCpf] = useState('');
  const [empRegistration, setEmpRegistration] = useState('');
  const [empCargoId, setEmpCargoId] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empHourlyRate, setEmpHourlyRate] = useState(85.0);
  const [empShift, setEmpShift] = useState('1º Turno (06:00 - 14:20)');

  // Form states for Position / Cargo
  const [posCode, setPosCode] = useState('');
  const [posName, setPosName] = useState('');
  const [posCbo, setPosCbo] = useState('');
  const [posDescription, setPosDescription] = useState('');
  const [posDefaultRate, setPosDefaultRate] = useState(90.0);

  const handleOpenNewEmployee = () => {
    setEditingEmployee(null);
    const nextReg = `MAT-${String(employees.length + 101)}`;
    const defaultPos = positions[0];

    setEmpName('');
    setEmpCpf('');
    setEmpRegistration(nextReg);
    setEmpCargoId(defaultPos?.id || '');
    setEmpEmail('');
    setEmpPhone('');
    setEmpHourlyRate(defaultPos?.defaultHourlyRate || 85.0);
    setEmpShift('1º Turno (06:00 - 14:20)');
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpName(emp.name);
    setEmpCpf(emp.cpf || '');
    setEmpRegistration(emp.registrationNumber);
    setEmpCargoId(emp.cargo_id || '');
    setEmpEmail(emp.email || '');
    setEmpPhone(emp.phone || '');
    setEmpHourlyRate(emp.hourlyRate);
    setEmpShift(emp.shift || '1º Turno');
    setIsEmployeeModalOpen(true);
  };

  const handleCargoChange = (cargoId: string) => {
    setEmpCargoId(cargoId);
    const selected = positions.find(p => p.id === cargoId);
    if (selected) {
      setEmpHourlyRate(selected.defaultHourlyRate || selected.baseHourlyRate || 85.0);
    }
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const pos = positions.find(p => p.id === empCargoId);

    const emp: Employee = {
      id: editingEmployee?.id || generateUUID(),
      name: empName,
      cpf: empCpf,
      registrationNumber: empRegistration,
      cargo_id: empCargoId,
      positionName: pos?.name || 'Técnico Especialista',
      email: empEmail,
      phone: empPhone,
      hourlyRate: Number(empHourlyRate),
      shift: empShift,
      active: true,
      status: 'Ativo',
      createdAt: editingEmployee?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveEmployee(emp);
    setIsEmployeeModalOpen(false);
  };

  const handleOpenNewPosition = () => {
    setEditingPosition(null);
    const nextCode = `CRG-${String(positions.length + 1).padStart(3, '0')}`;
    setPosCode(nextCode);
    setPosName('');
    setPosCbo('9113-05');
    setPosDescription('');
    setPosDefaultRate(85.0);
    setIsPositionModalOpen(true);
  };

  const handleSavePosition = (e: React.FormEvent) => {
    e.preventDefault();
    const pos: Position = {
      id: editingPosition?.id || generateUUID(),
      code: posCode,
      name: posName,
      cbo: posCbo,
      description: posDescription,
      baseHourlyRate: Number(posDefaultRate),
      defaultHourlyRate: Number(posDefaultRate),
      active: true,
      status: 'Ativo',
      createdAt: editingPosition?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    savePosition(pos);
    setIsPositionModalOpen(false);
  };

  const employeeColumns: Column<Employee>[] = [
    {
      header: 'Matrícula',
      accessor: (e) => <span className="font-mono font-bold text-amber-400">{e.registrationNumber}</span>,
      className: 'w-28',
    },
    {
      header: 'Funcionário / Especialista',
      accessor: (e) => (
        <div>
          <span className="font-bold text-slate-100 block text-xs">{e.name}</span>
          <span className="text-[11px] text-slate-400">{e.email || e.phone || 'Sem contato'}</span>
        </div>
      ),
    },
    {
      header: 'Cargo (Vinculado)',
      accessor: (e) => (
        <span className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded border border-slate-700 text-xs font-semibold">
          {e.positionName}
        </span>
      ),
      className: 'w-48',
    },
    {
      header: 'Turno de Trabalho',
      accessor: (e) => <span className="text-xs text-slate-300">{e.shift || '1º Turno'}</span>,
      className: 'text-xs text-slate-300',
    },
    {
      header: 'Taxa Horária',
      accessor: (e) => (
        <span className="font-mono font-bold text-emerald-400 text-xs">
          {formatCurrency(e.hourlyRate)}/h
        </span>
      ),
      className: 'w-28 text-right',
      align: 'right',
    },
    {
      header: 'Ações',
      accessor: (e) => (
        <div className="flex items-center justify-end gap-1">
          {can('editar') && (
            <button
              onClick={() => handleOpenEditEmployee(e)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Editar Funcionário"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
            </button>
          )}
        </div>
      ),
      className: 'w-20 text-right',
      align: 'right',
    },
  ];

  const positionColumns: Column<Position>[] = [
    {
      header: 'Código',
      accessor: (p) => <span className="font-mono font-bold text-amber-400">{p.code}</span>,
      className: 'w-28',
    },
    {
      header: 'Cargo Industrial',
      accessor: (p) => (
        <div>
          <span className="font-bold text-slate-100 block text-xs">{p.name}</span>
          <span className="text-[11px] text-slate-400">{p.description}</span>
        </div>
      ),
    },
    {
      header: 'CBO',
      accessor: (p) => <span className="font-mono text-xs text-slate-300">{p.cbo}</span>,
      className: 'w-28',
    },
    {
      header: 'Taxa Hora Padrão',
      accessor: (p) => (
        <span className="font-mono font-bold text-emerald-400 text-xs">
          {formatCurrency(p.defaultHourlyRate || p.baseHourlyRate || 0)}/h
        </span>
      ),
      className: 'w-32 text-right',
      align: 'right',
    },
    {
      header: 'Profissionais Vinculados',
      accessor: (p) => (
        <span className="text-xs text-slate-300 font-mono font-semibold">
          {employees.filter(e => e.cargo_id === p.id || e.positionName === p.name).length} pessoas
        </span>
      ),
      className: 'w-36 text-center',
      align: 'center',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Gestão de Pessoas, Cargos & Permissões RBAC
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastro de técnicos, cargos com taxas horárias e controle de perfis de acesso
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'employees' && can('criar') && (
            <button
              onClick={handleOpenNewEmployee}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Funcionário</span>
            </button>
          )}

          {activeTab === 'positions' && can('criar') && (
            <button
              onClick={handleOpenNewPosition}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Cargo</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-2 ${
            activeTab === 'employees'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Funcionários & Técnicos ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('positions')}
          className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-2 ${
            activeTab === 'positions'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Cargos & Taxas ({positions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Matriz de Perfis RBAC</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'employees' && (
        <DataTable
          data={employees}
          columns={employeeColumns}
          keyExtractor={(e) => e.id}
          searchPlaceholder="Pesquisar funcionário por nome, matrícula ou cargo..."
          searchFilter={(e, q) =>
            e.name.toLowerCase().includes(q) ||
            e.registrationNumber.toLowerCase().includes(q) ||
            e.positionName.toLowerCase().includes(q)
          }
          pageSize={10}
        />
      )}

      {activeTab === 'positions' && (
        <DataTable
          data={positions}
          columns={positionColumns}
          keyExtractor={(p) => p.id}
          searchPlaceholder="Pesquisar cargos por código ou nome..."
          searchFilter={(p, q) =>
            p.code.toLowerCase().includes(q) ||
            p.name.toLowerCase().includes(q) ||
            (p.cbo ? p.cbo.toLowerCase().includes(q) : false)
          }
          pageSize={10}
        />
      )}

      {activeTab === 'roles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Matriz de Permissões por Nível de Acesso (RBAC)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                role: 'ADMINISTRADOR' as UserRole,
                desc: 'Acesso irrestrito a todos os módulos, configurações, exclusões e auditoria do sistema.',
                perms: ['Criar', 'Visualizar', 'Editar', 'Excluir', 'Configurações Globais', 'Auditoria'],
                color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
              },
              {
                role: 'SUPERVISOR' as UserRole,
                desc: 'Supervisão técnica, planejamento PCM, aprovação de ordens e fechamento de serviços.',
                perms: ['Criar', 'Visualizar', 'Editar', 'Aprovação OS', 'Gestão de Preventivas'],
                color: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
              },
              {
                role: 'TECNICO' as UserRole,
                desc: 'Operação de campo, apontamento de execuções de OS, requisição de peças e leitura de QR Codes.',
                perms: ['Visualizar', 'Apontar Execuções', 'Requisitar Peças', 'Escanear QR'],
                color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              },
              {
                role: 'SOLICITANTE' as UserRole,
                desc: 'Abertura de chamados de manutenção e acompanhamento de status de ordens próprias.',
                perms: ['Abrir Chamado (Nova OS)', 'Acompanhar Status'],
                color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
              },
            ].map(r => (
              <div key={r.role} className={`p-4 rounded-xl border ${r.color} space-y-2`}>
                <h4 className="font-bold text-xs uppercase tracking-wider">{r.role}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">{r.desc}</p>
                <div className="pt-2 border-t border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Privilégios:</span>
                  {r.perms.map((p, idx) => (
                    <div key={idx} className="text-[10px] text-slate-200 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-400" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {isEmployeeModalOpen && (
        <Modal
          isOpen={isEmployeeModalOpen}
          onClose={() => setIsEmployeeModalOpen(false)}
          title={editingEmployee ? `Editar: ${empName}` : 'Cadastrar Novo Funcionário'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveEmployee} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Matrícula *</label>
                <input
                  type="text"
                  required
                  value={empRegistration}
                  onChange={(e) => setEmpRegistration(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Cargo Vinculado *</label>
                <select
                  value={empCargoId}
                  onChange={(e) => handleCargoChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-semibold"
                >
                  {positions.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.defaultHourlyRate)}/h)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Taxa Horária (R$/h)</label>
                <input
                  type="number"
                  step="0.01"
                  value={empHourlyRate}
                  onChange={(e) => setEmpHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold text-emerald-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Turno</label>
                <input
                  type="text"
                  value={empShift}
                  onChange={(e) => setEmpShift(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Telefone</label>
                <input
                  type="text"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEmployeeModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-lg"
              >
                Salvar Funcionário
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Position Modal */}
      {isPositionModalOpen && (
        <Modal
          isOpen={isPositionModalOpen}
          onClose={() => setIsPositionModalOpen(false)}
          title="Cadastrar Cargo Industrial"
          maxWidth="md"
        >
          <form onSubmit={handleSavePosition} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Código *</label>
                <input
                  type="text"
                  required
                  value={posCode}
                  onChange={(e) => setPosCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">CBO *</label>
                <input
                  type="text"
                  required
                  value={posCbo}
                  onChange={(e) => setPosCbo(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nome do Cargo *</label>
              <input
                type="text"
                required
                value={posName}
                onChange={(e) => setPosName(e.target.value)}
                placeholder="Ex: Mecânico Industrial Especialista"
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Taxa Horária Padrão (R$/h) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={posDefaultRate}
                onChange={(e) => setPosDefaultRate(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Descrição</label>
              <textarea
                rows={2}
                value={posDescription}
                onChange={(e) => setPosDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPositionModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-lg"
              >
                Salvar Cargo
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
