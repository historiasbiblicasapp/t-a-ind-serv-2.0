import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Part, InventoryMovement } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { formatCurrency, formatDate, generateUUID } from '../lib/utils';
import {
  Package,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  History,
  Tag,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { parts, movements, savePart, registerMovement, suppliers, workOrders } = useData();
  const { can, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'parts' | 'movements'>('parts');
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  // Form states for new part
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Rolamentos & Mancais');
  const [unit, setUnit] = useState('UN');
  const [currentStock, setCurrentStock] = useState(10);
  const [minStock, setMinStock] = useState(5);
  const [maxStock, setMaxStock] = useState(50);
  const [unitCost, setUnitCost] = useState(120);
  const [location, setLocation] = useState('Prateleira A-01');

  // Form states for inventory movement (Entrada / Saída)
  const [selectedPartId, setSelectedPartId] = useState(parts[0]?.id || '');
  const [movementType, setMovementType] = useState<InventoryMovement['type']>('Saída');
  const [movementQty, setMovementQty] = useState(1);
  const [movementWorkOrderId, setMovementWorkOrderId] = useState('');
  const [movementNotes, setMovementNotes] = useState('');

  const handleOpenNewPart = () => {
    const nextCode = `PEC-${String(parts.length + 1).padStart(3, '0')}`;
    setCode(nextCode);
    setName('');
    setCategory('Rolamentos & Mancais');
    setUnit('UN');
    setCurrentStock(10);
    setMinStock(5);
    setMaxStock(50);
    setUnitCost(100);
    setLocation('Prateleira A-01');
    setIsPartModalOpen(true);
  };

  const handleSavePart = (e: React.FormEvent) => {
    e.preventDefault();
    const newPart: Part = {
      id: generateUUID(),
      code,
      name,
      category,
      unit,
      currentStock,
      minStock,
      maxStock,
      unitCost,
      location,
      status: currentStock <= minStock ? 'Estoque Baixo' : 'Normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    savePart(newPart);
    setIsPartModalOpen(false);
  };

  const handleRegisterMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPart = parts.find(p => p.id === selectedPartId);
    if (!targetPart) return;

    registerMovement({
      partId: targetPart.id,
      partCode: targetPart.code,
      partName: targetPart.name,
      type: movementType,
      quantity: Number(movementQty),
      unitCost: targetPart.unitCost,
      workOrderId: movementWorkOrderId || undefined,
      requesterName: currentUser?.name || 'Técnico de Manutenção',
      notes: movementNotes
    });

    setIsMovementModalOpen(false);
    setMovementNotes('');
  };

  const partColumns: Column<Part>[] = [
    {
      header: 'Código',
      accessor: (p) => <span className="font-mono font-bold text-amber-400">{p.code}</span>,
      className: 'w-28',
    },
    {
      header: 'Descrição do Item',
      accessor: (p) => (
        <div>
          <span className="font-bold text-slate-100 block text-xs">{p.name}</span>
          <span className="text-[11px] text-slate-400">{p.category}</span>
        </div>
      ),
    },
    {
      header: 'Localização',
      accessor: 'location',
      className: 'text-xs text-slate-300 font-mono',
    },
    {
      header: 'Estoque Atual',
      accessor: (p) => (
        <span className={`font-mono font-bold text-xs ${
          p.currentStock <= p.minStock ? 'text-rose-400' : 'text-slate-100'
        }`}>
          {p.currentStock} {p.unit}
        </span>
      ),
      className: 'w-28 text-center',
      align: 'center',
    },
    {
      header: 'Estoque Mínimo',
      accessor: (p) => (
        <span className="font-mono text-slate-400 text-xs">{p.minStock} {p.unit}</span>
      ),
      className: 'w-28 text-center',
      align: 'center',
    },
    {
      header: 'Custo Unitário',
      accessor: (p) => (
        <span className="font-mono text-slate-300 text-xs">{formatCurrency(p.unitCost)}</span>
      ),
      className: 'w-28 text-right',
      align: 'right',
    },
    {
      header: 'Valor Total',
      accessor: (p) => (
        <span className="font-mono font-bold text-emerald-400 text-xs">
          {formatCurrency(p.currentStock * p.unitCost)}
        </span>
      ),
      className: 'w-28 text-right',
      align: 'right',
    },
    {
      header: 'Status',
      accessor: (p) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            p.status === 'Normal'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : p.status === 'Estoque Baixo'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          {p.status}
        </span>
      ),
      className: 'w-32 text-center',
      align: 'center',
    },
  ];

  const movementColumns: Column<InventoryMovement>[] = [
    {
      header: 'Data / Hora',
      accessor: (m) => (
        <span className="font-mono text-xs text-slate-300">
          {formatDate(m.date)} {m.time}
        </span>
      ),
      className: 'w-32',
    },
    {
      header: 'Tipo',
      accessor: (m) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${
            m.type === 'Entrada' || m.type === 'Devolução'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          {m.type}
        </span>
      ),
      className: 'w-24 text-center',
      align: 'center',
    },
    {
      header: 'Item',
      accessor: (m) => (
        <div>
          <span className="font-mono font-bold text-amber-400 block text-xs">{m.partCode}</span>
          <span className="text-[11px] text-slate-300">{m.partName}</span>
        </div>
      ),
    },
    {
      header: 'Quantidade',
      accessor: (m) => (
        <span className="font-mono font-bold text-xs text-slate-100">{m.quantity}</span>
      ),
      className: 'w-20 text-center',
      align: 'center',
    },
    {
      header: 'Valor Total',
      accessor: (m) => (
        <span className="font-mono font-bold text-emerald-400 text-xs">
          {formatCurrency(m.totalCost)}
        </span>
      ),
      className: 'w-28 text-right',
      align: 'right',
    },
    {
      header: 'Requisitante / OS',
      accessor: (m) => (
        <div>
          <span className="text-xs font-medium text-slate-200 block">{m.responsibleName || m.requesterName || 'Almoxarifado'}</span>
          {m.workOrderId && <span className="text-[10px] text-amber-400 font-mono">OS: {m.workOrderNumber || 'Vinculada'}</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Almoxarifado & Estoque de Manutenção
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Controle de peças sobressalentes, ferramentas e movimentações de entrada e saída
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMovementModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors shadow-sm"
          >
            <ArrowDownLeft className="w-4 h-4 text-amber-400" />
            <span>Movimentação (Entrada/Saída)</span>
          </button>

          {can('criar') && (
            <button
              id="inventory-new-part-btn"
              onClick={handleOpenNewPart}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Peça</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('parts')}
          className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-2 ${
            activeTab === 'parts'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catálogo de Peças ({parts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-2 ${
            activeTab === 'movements'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico de Movimentações ({movements.length})</span>
        </button>
      </div>

      {/* Tables based on tab */}
      {activeTab === 'parts' ? (
        <DataTable
          data={parts}
          columns={partColumns}
          keyExtractor={(p) => p.id}
          searchPlaceholder="Pesquisar peças por código, nome, categoria ou localização..."
          searchFilter={(p, q) =>
            p.code.toLowerCase().includes(q) ||
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.location && p.location.toLowerCase().includes(q))
          }
          pageSize={10}
        />
      ) : (
        <DataTable
          data={movements}
          columns={movementColumns}
          keyExtractor={(m) => m.id}
          searchPlaceholder="Pesquisar movimentações por código, peça ou requisitante..."
          searchFilter={(m, q) =>
            m.partCode.toLowerCase().includes(q) ||
            m.partName.toLowerCase().includes(q) ||
            (m.responsibleName && m.responsibleName.toLowerCase().includes(q)) ||
            (m.requesterName && m.requesterName.toLowerCase().includes(q))
          }
          pageSize={10}
        />
      )}

      {/* Movement Modal */}
      {isMovementModalOpen && (
        <Modal
          isOpen={isMovementModalOpen}
          onClose={() => setIsMovementModalOpen(false)}
          title="Registrar Movimentação de Estoque"
          subtitle="Lance entradas de fornecedor ou requisições de saída para Ordens de Serviço"
          maxWidth="md"
        >
          <form onSubmit={handleRegisterMovement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tipo de Movimentação *</label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-bold"
              >
                <option value="Saída">Saída (Aplicação em Manutenção)</option>
                <option value="Entrada">Entrada (Compra / Fornecedor)</option>
                <option value="Devolução">Devolução ao Almoxarifado</option>
                <option value="Ajuste">Ajuste de Inventário</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Item / Peça *</label>
              <select
                value={selectedPartId}
                onChange={(e) => setSelectedPartId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-medium"
              >
                {parts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name} (Saldo: {p.currentStock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Quantidade *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movementQty}
                  onChange={(e) => setMovementQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Vincular OS (Opcional)</label>
                <select
                  value={movementWorkOrderId}
                  onChange={(e) => setMovementWorkOrderId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                >
                  <option value="">Nenhuma OS</option>
                  {workOrders.map(wo => (
                    <option key={wo.id} value={wo.id}>{wo.orderNumber}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Observações</label>
              <input
                type="text"
                value={movementNotes}
                onChange={(e) => setMovementNotes(e.target.value)}
                placeholder="Ex: NF 10928 ou Substituição corretiva..."
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsMovementModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-lg"
              >
                Confirmar Lançamento
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Part Add Modal */}
      {isPartModalOpen && (
        <Modal
          isOpen={isPartModalOpen}
          onClose={() => setIsPartModalOpen(false)}
          title="Cadastrar Nova Peça Sobressalente"
          maxWidth="2xl"
        >
          <form onSubmit={handleSavePart} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Código *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Descrição da Peça *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Rolamento Autocompensador 22216 EK"
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
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
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Unidade</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Localização Física</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Estoque Inicial</label>
                <input
                  type="number"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Estoque Mínimo</label>
                <input
                  type="number"
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Estoque Máximo</label>
                <input
                  type="number"
                  value={maxStock}
                  onChange={(e) => setMaxStock(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Custo Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={unitCost}
                  onChange={(e) => setUnitCost(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-emerald-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPartModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-lg"
              >
                Cadastrar Peça
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
