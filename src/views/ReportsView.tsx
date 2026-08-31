import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { exportWorkOrdersToCSV, exportWorkOrdersToExcel, printWorkOrdersList } from '../lib/exportUtils';
import { formatCurrency, formatDate } from '../lib/utils';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  DollarSign,
  Wrench,
  Cpu
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { workOrders, equipment, departments } = useData();

  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredOrders = workOrders.filter(wo => {
    if (selectedType !== 'ALL' && wo.type !== selectedType) return false;
    if (selectedDepartment !== 'ALL' && wo.department !== selectedDepartment) return false;
    if (wo.date < startDate || wo.date > endDate) return false;
    return true;
  });

  const totalCost = filteredOrders.reduce((acc, curr) => acc + (curr.values?.totalCost || 0), 0);
  const totalLaborHours = filteredOrders.reduce((acc, curr) => acc + curr.labor.reduce((lAcc, l) => lAcc + (l.hours * l.quantity), 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            Central de Relatórios & Exportações
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Geração de relatórios executivos em PDF, planilhas Excel e arquivos CSV
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportWorkOrdersToCSV(filteredOrders)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => exportWorkOrdersToExcel(filteredOrders)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar Excel (.XLS)</span>
          </button>

          <button
            onClick={() => printWorkOrdersList(filteredOrders)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Filter Matrix Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          Filtros de Parâmetros para Relatório
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Data Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tipo de Manutenção</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-medium"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="Corretiva">Corretiva</option>
              <option value="Preventiva">Preventiva</option>
              <option value="Preditiva">Preditiva</option>
              <option value="Inspeção">Inspeção</option>
              <option value="Melhoria">Melhoria</option>
              <option value="Emergencial">Emergencial</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Setor Industrial</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-medium"
            >
              <option value="ALL">Todos os Setores</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-semibold uppercase text-slate-400">Total de Ordens Filtradas</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">{filteredOrders.length} OS</p>
          <p className="text-[11px] text-slate-500 mt-1">Concluídas: {filteredOrders.filter(o => o.status === 'Concluída').length}</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-semibold uppercase text-slate-400">Custo Total Acumulado</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatCurrency(totalCost)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Média por OS: {formatCurrency(filteredOrders.length ? totalCost / filteredOrders.length : 0)}</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs font-semibold uppercase text-slate-400">Horas de Mão de Obra</span>
          <p className="text-2xl font-black text-blue-400 font-mono mt-1">{totalLaborHours.toFixed(1)} h</p>
          <p className="text-[11px] text-slate-500 mt-1">Horas homem dedicadas</p>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold uppercase text-slate-200">Prévia dos Dados do Relatório ({filteredOrders.length} registros)</span>
          <span>Período: {formatDate(startDate)} a {formatDate(endDate)}</span>
        </div>

        <div className="overflow-x-auto max-h-96 custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">OS</th>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Equipamento</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Setor</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Custo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredOrders.map(wo => (
                <tr key={wo.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{wo.orderNumber}</td>
                  <td className="py-2.5 px-3 font-mono">{formatDate(wo.date)}</td>
                  <td className="py-2.5 px-3 font-medium">{wo.equipmentCode} - {wo.equipmentName}</td>
                  <td className="py-2.5 px-3">{wo.type}</td>
                  <td className="py-2.5 px-3">{wo.department}</td>
                  <td className="py-2.5 px-3 font-semibold">{wo.status}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(wo.values?.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
