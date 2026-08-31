import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Equipment, EquipmentStatus } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { formatCurrency, formatDate, generateUUID } from '../lib/utils';
import {
  Cpu,
  PlusCircle,
  QrCode,
  Wrench,
  Activity,
  Calendar,
  Layers,
  Edit3,
  Trash2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface EquipmentViewProps {
  onSelectEquipment?: (eq: Equipment) => void;
}

export const EquipmentView: React.FC<EquipmentViewProps> = () => {
  const { equipment, saveEquipment, deleteEquipment, workOrders, companies, units, departments, areas } = useData();
  const { can } = useAuth();

  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Form states for adding/editing equipment
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState('Usinagem CNC');
  const [criticality, setCriticality] = useState<'A' | 'B' | 'C'>('B');
  const [status, setStatus] = useState<EquipmentStatus>('Operacional');
  const [company, setCompany] = useState('');
  const [unit, setUnit] = useState('');
  const [department, setDepartment] = useState('');
  const [area, setArea] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [manufacturingYear, setManufacturingYear] = useState(2022);
  const [installationDate, setInstallationDate] = useState('2022-03-15');
  const [hourMeterHours, setHourMeterHours] = useState(1200);

  const handleOpenCreate = () => {
    const nextCode = `EQ-${String(equipment.length + 1).padStart(3, '0')}`;
    setEditingItem(null);
    setCode(nextCode);
    setName('');
    setTag(nextCode);
    setCategory('Usinagem CNC');
    setCriticality('B');
    setStatus('Operacional');
    setCompany(companies[0]?.name || 'T&A Industrial Service Ltda.');
    setUnit(units[0]?.name || 'Planta Principal - Joinville');
    setDepartment(departments[0]?.name || 'Usinagem Pesada');
    setArea(areas[0]?.name || 'Linha CNC 01');
    setManufacturer('');
    setModel('');
    setSerialNumber('');
    setManufacturingYear(new Date().getFullYear());
    setInstallationDate(new Date().toISOString().split('T')[0]);
    setHourMeterHours(0);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (eq: Equipment) => {
    setEditingItem(eq);
    setCode(eq.code);
    setName(eq.name);
    setTag(eq.tag || eq.code);
    setCategory(eq.category);
    setCriticality(eq.criticality);
    setStatus(eq.status);
    setCompany(eq.company);
    setUnit(eq.unit);
    setDepartment(eq.department);
    setArea(eq.area);
    setManufacturer(eq.manufacturer || '');
    setModel(eq.model || '');
    setSerialNumber(eq.serialNumber || '');
    setManufacturingYear(eq.manufacturingYear || 2022);
    setInstallationDate(eq.installationDate || '2022-01-01');
    setHourMeterHours(eq.hourMeterHours || 0);
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const item: Equipment = {
      id: editingItem?.id || generateUUID(),
      code,
      name,
      tag,
      category,
      criticality,
      status,
      company,
      unit,
      department,
      area,
      manufacturer,
      model,
      serialNumber,
      manufacturingYear,
      installationDate,
      hourMeterHours,
      qrCodeData: `TES-ASSET://${code}`,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveEquipment(item);
    setIsEditModalOpen(false);
  };

  const columns: Column<Equipment>[] = [
    {
      header: 'Código / Tag',
      accessor: (eq) => (
        <div>
          <span className="font-mono font-bold text-amber-400 block">{eq.code}</span>
          <span className="text-[10px] text-slate-500 font-mono">Tag: {eq.tag || eq.code}</span>
        </div>
      ),
      className: 'w-32',
    },
    {
      header: 'Equipamento',
      accessor: (eq) => (
        <div>
          <span className="font-bold text-slate-100 block">{eq.name}</span>
          <span className="text-xs text-slate-400">{eq.manufacturer} {eq.model}</span>
        </div>
      ),
    },
    {
      header: 'Categoria',
      accessor: 'category',
      className: 'text-xs text-slate-300',
    },
    {
      header: 'Localização',
      accessor: (eq) => (
        <span className="text-xs text-slate-300">
          {eq.unit} / {eq.department}
        </span>
      ),
    },
    {
      header: 'Criticidade',
      accessor: (eq) => {
        const isHigh = eq.criticality === 'Alta' || eq.criticality === 'A';
        const isMedium = eq.criticality === 'Média' || eq.criticality === 'B';
        return (
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
              isHigh
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : isMedium
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isHigh ? 'Classe A (Alta)' : isMedium ? 'Classe B (Média)' : 'Classe C (Baixa)'}
          </span>
        );
      },
      align: 'center',
      className: 'w-28 text-center',
    },
    {
      header: 'Status',
      accessor: (eq) => <StatusBadge status={eq.status} size="sm" />,
      className: 'w-32',
    },
    {
      header: 'Horímetro',
      accessor: (eq) => (
        <span className="font-mono font-semibold text-slate-300 text-xs">
          {eq.hourMeterHours?.toLocaleString()} h
        </span>
      ),
      className: 'w-28 text-right',
      align: 'right',
    },
    {
      header: 'Ações',
      accessor: (eq) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedEq(eq);
              setIsQRModalOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
            title="Ver QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
          {can('editar') && (
            <button
              onClick={() => handleOpenEdit(eq)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Editar Equipamento"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
            </button>
          )}
        </div>
      ),
      className: 'w-24 text-right',
      align: 'right',
    },
  ];

  // Equipment work order history
  const equipmentOrders = selectedEq ? workOrders.filter(w => w.equipmentId === selectedEq.id) : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            Cadastro de Equipamentos & Ativos Industriais
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerenciamento de fichas técnicas, criticidade ABC e rastreabilidade por QR Code
          </p>
        </div>

        {can('criar') && (
          <button
            id="equipment-new-btn"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Equipamento</span>
          </button>
        )}
      </div>

      {/* Main Table */}
      <DataTable
        data={equipment}
        columns={columns}
        keyExtractor={(eq) => eq.id}
        searchPlaceholder="Pesquisar por código, tag, nome, fabricante ou setor..."
        searchFilter={(eq, q) =>
          eq.code.toLowerCase().includes(q) ||
          eq.name.toLowerCase().includes(q) ||
          (eq.tag && eq.tag.toLowerCase().includes(q)) ||
          (eq.manufacturer && eq.manufacturer.toLowerCase().includes(q)) ||
          eq.department.toLowerCase().includes(q)
        }
        onRowClick={(eq) => setSelectedEq(eq)}
        pageSize={10}
      />

      {/* Equipment Technical Detail Modal */}
      {selectedEq && !isQRModalOpen && (
        <Modal
          isOpen={Boolean(selectedEq)}
          onClose={() => setSelectedEq(null)}
          title={`${selectedEq.code} — ${selectedEq.name}`}
          subtitle={`${selectedEq.category} | ${selectedEq.department} / ${selectedEq.area}`}
          icon={<Cpu className="w-5 h-5 text-amber-400" />}
          maxWidth="4xl"
          headerActions={
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 mr-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Gerar Tag QR Code</span>
            </button>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Status Operacional:</span>
                <StatusBadge status={selectedEq.status} size="sm" />
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Criticidade ABC:</span>
                <span className="font-bold text-amber-400 font-mono">Classe {selectedEq.criticality}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Fabricante / Modelo:</span>
                <span className="font-semibold text-slate-200">{selectedEq.manufacturer || '-'} {selectedEq.model || ''}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Nº de Série:</span>
                <span className="font-mono text-slate-300">{selectedEq.serialNumber || '-'}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block font-medium">Horímetro Atual:</span>
                <span className="font-mono font-bold text-slate-100">{selectedEq.hourMeterHours?.toLocaleString()} h</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block font-medium">Ano de Fabricação:</span>
                <span className="font-semibold text-slate-200">{selectedEq.manufacturingYear}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block font-medium">Data Instalação:</span>
                <span className="font-semibold text-slate-200">{formatDate(selectedEq.installationDate || '')}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block font-medium">Total de OS Registradas:</span>
                <span className="font-bold text-emerald-400 font-mono">{equipmentOrders.length} ordens</span>
              </div>
            </div>

            {/* Historical Work Orders */}
            <div>
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-3">
                Histórico de Manutenções deste Ativo
              </h4>

              {equipmentOrders.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                  Nenhuma ordem de serviço aberta para este equipamento.
                </div>
              ) : (
                <div className="space-y-2">
                  {equipmentOrders.map((wo) => (
                    <div
                      key={wo.id}
                      className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-amber-400">{wo.orderNumber}</span>
                        <StatusBadge status={wo.status} size="sm" />
                        <span className="text-slate-300 font-medium truncate max-w-sm">{wo.description}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-emerald-400 font-bold">{formatCurrency(wo.values?.totalCost)}</span>
                        <span className="text-[10px] text-slate-400 block">{formatDate(wo.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* QR Code Tag Modal */}
      {selectedEq && isQRModalOpen && (
        <Modal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          title={`Tag de Identificação & QR Code — ${selectedEq.code}`}
          maxWidth="md"
          icon={<QrCode className="w-5 h-5 text-amber-400" />}
        >
          <div className="p-6 bg-white text-slate-900 rounded-xl flex flex-col items-center justify-center text-center space-y-4 border border-slate-300">
            <div className="flex items-center gap-2 border-b border-slate-300 pb-2 w-full justify-center">
              <span className="font-black text-lg text-slate-900 tracking-tight">T&amp;A INDUSTRIAL SERVICE</span>
            </div>

            {/* Industrial QR Code representation */}
            <div className="p-4 bg-slate-100 border-4 border-slate-900 rounded-xl shadow-inner">
              <div className="w-48 h-48 bg-slate-900 p-3 rounded-lg flex flex-col items-center justify-center text-amber-400">
                <QrCode className="w-36 h-36" />
                <span className="text-[10px] font-mono font-bold text-white mt-1">{selectedEq.code}</span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-xl font-mono text-slate-900">{selectedEq.code}</h3>
              <p className="font-bold text-sm text-slate-800">{selectedEq.name}</p>
              <p className="text-xs text-slate-600 font-medium">
                {selectedEq.unit} • {selectedEq.department} • {selectedEq.area}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Data: {selectedEq.qrCodeData}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors"
            >
              Imprimir Etiqueta Industrial
            </button>
          </div>
        </Modal>
      )}

      {/* Equipment Add/Edit Form Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={editingItem ? `Editar Equipamento: ${code}` : 'Cadastrar Novo Equipamento'}
          subtitle="Preencha os dados técnicos e localização operacional do ativo"
          maxWidth="3xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Código / ID *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tag Física</label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Criticidade *</label>
                <select
                  value={criticality}
                  onChange={(e) => setCriticality(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-bold"
                >
                  <option value="A">Classe A (Crítico / Parada de Fábrica)</option>
                  <option value="B">Classe B (Importante / Média Relevância)</option>
                  <option value="C">Classe C (Baixa Criticidade / Redundante)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nome do Equipamento *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Centro de Usinagem 5 Eixos CNC 01"
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Categoria</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Status Operacional</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-semibold"
                >
                  <option value="Operacional">Operacional</option>
                  <option value="Em Manutenção">Em Manutenção</option>
                  <option value="Parado">Parado</option>
                  <option value="Desativado">Desativado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Horímetro Inicial (h)</label>
                <input
                  type="number"
                  value={hourMeterHours}
                  onChange={(e) => setHourMeterHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Fabricante</label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Modelo</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nº Série</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-lg"
              >
                {editingItem ? 'Salvar Equipamento' : 'Cadastrar Equipamento'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
