import React from 'react';
import { WorkOrder } from '../../types';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Printer, Download, CheckSquare } from 'lucide-react';

interface WorkOrderPrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
}

export const WorkOrderPrintView: React.FC<WorkOrderPrintViewProps> = ({
  isOpen,
  onClose,
  workOrder,
}) => {
  if (!workOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Visualização de Impressão — ${workOrder.orderNumber}`}
      maxWidth="5xl"
      icon={<Printer className="w-5 h-5 text-amber-400" />}
      headerActions={
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-md mr-2"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Gerar PDF</span>
        </button>
      }
    >
      <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-300 font-sans print:border-none print:shadow-none print:p-0 text-xs leading-normal">
        {/* Printable Industrial Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 text-amber-400 font-extrabold text-xl flex items-center justify-center rounded">
              T&S
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight uppercase text-slate-900">
                T&S Industrial Service
              </h1>
              <p className="text-[11px] text-slate-600 font-medium">
                Departamento de Engenharia e Planejamento de Manutenção (PCM)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold uppercase text-slate-500 block">ORDEM DE SERVIÇO</span>
            <span className="text-xl font-black font-mono text-slate-900">{workOrder.orderNumber}</span>
          </div>
        </div>

        {/* Identification Grid */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-slate-100 border border-slate-300 rounded mb-4 text-[11px]">
          <div>
            <span className="font-bold text-slate-500 block">Data/Hora Emissão:</span>
            <span className="font-semibold text-slate-900">{formatDate(workOrder.date)} {workOrder.time}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block">Tipo Manutenção:</span>
            <span className="font-bold text-slate-900 uppercase">{workOrder.type}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block">Prioridade:</span>
            <span className="font-bold text-slate-900 uppercase">{workOrder.priority}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block">Status:</span>
            <span className="font-bold text-slate-900 uppercase">{workOrder.status}</span>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-500 block">Ativo / Equipamento:</span>
            <span className="font-bold text-slate-900 font-mono">{workOrder.equipmentCode}</span> — {workOrder.equipmentName}
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-500 block">Localização Operacional:</span>
            <span className="font-medium text-slate-900">{workOrder.company} / {workOrder.unit} ({workOrder.department})</span>
          </div>
        </div>

        {/* Problem Description */}
        <div className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-white px-2 py-1 rounded-t">
            1. Descrição do Problema / Solicitação
          </h2>
          <div className="border border-t-0 border-slate-300 p-3 rounded-b text-slate-800 leading-relaxed">
            {workOrder.description}
          </div>
        </div>

        {/* Scope of Work */}
        <div className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-white px-2 py-1 rounded-t">
            2. Escopo Programado de Atividades
          </h2>
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <th className="border border-slate-300 p-1.5 w-12 text-center">Nº</th>
                <th className="border border-slate-300 p-1.5 w-12 text-center">Pessoas</th>
                <th className="border border-slate-300 p-1.5 text-left">Descrição da Etapa</th>
                <th className="border border-slate-300 p-1.5 text-left w-36">Início - Fim</th>
                <th className="border border-slate-300 p-1.5 text-left w-28">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {workOrder.scope.map(sc => (
                <tr key={sc.id}>
                  <td className="border border-slate-300 p-1.5 text-center font-mono font-bold">{sc.itemNumber}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold">{sc.peopleCount}</td>
                  <td className="border border-slate-300 p-1.5 font-medium">{sc.description}</td>
                  <td className="border border-slate-300 p-1.5">{sc.startDate}</td>
                  <td className="border border-slate-300 p-1.5">{sc.responsibleName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Labor Breakdown */}
        <div className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-white px-2 py-1 rounded-t">
            3. Alocação de Mão de Obra e Especialidades
          </h2>
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <th className="border border-slate-300 p-1.5 w-12 text-center">Item</th>
                <th className="border border-slate-300 p-1.5 w-12 text-center">Qtd</th>
                <th className="border border-slate-300 p-1.5 text-left">Funcionário</th>
                <th className="border border-slate-300 p-1.5 text-left">Cargo</th>
                <th className="border border-slate-300 p-1.5 w-16 text-center">Horas</th>
                <th className="border border-slate-300 p-1.5 w-24 text-right">Valor Hora</th>
                <th className="border border-slate-300 p-1.5 w-24 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {workOrder.labor.map(lb => (
                <tr key={lb.id}>
                  <td className="border border-slate-300 p-1.5 text-center font-mono font-bold">{lb.itemNumber}</td>
                  <td className="border border-slate-300 p-1.5 text-center">{lb.quantity}</td>
                  <td className="border border-slate-300 p-1.5 font-semibold">{lb.employeeName || 'A definir'}</td>
                  <td className="border border-slate-300 p-1.5">{lb.positionName}</td>
                  <td className="border border-slate-300 p-1.5 text-center">{lb.hours}h</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono">{formatCurrency(lb.hourlyRate)}</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono font-bold">{formatCurrency(lb.totalValue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold">
                <td colSpan={6} className="border border-slate-300 p-1.5 text-right uppercase">Total Estimado Mão de Obra:</td>
                <td className="border border-slate-300 p-1.5 text-right font-mono text-slate-900">{formatCurrency(workOrder.values?.laborCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Cost Summary & Signatures */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t-2 border-slate-900">
          <div className="border border-slate-300 p-3 rounded">
            <h3 className="font-bold text-[10px] uppercase text-slate-600 mb-1">Resumo Financeiro Consolidado</h3>
            <div className="flex justify-between py-0.5 border-b border-slate-200">
              <span>Mão de Obra:</span>
              <span className="font-mono">{formatCurrency(workOrder.values?.laborCost)}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-200">
              <span>Peças & Materiais:</span>
              <span className="font-mono">{formatCurrency((workOrder.values?.partsCost || 0) + (workOrder.values?.materialsCost || 0))}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-200">
              <span>Serviços & Recursos:</span>
              <span className="font-mono">{formatCurrency((workOrder.values?.servicesCost || 0) + (workOrder.values?.resourcesCost || 0))}</span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-[11px] text-slate-900">
              <span>VALOR TOTAL DA OS:</span>
              <span className="font-mono">{formatCurrency(workOrder.values?.totalCost)}</span>
            </div>
          </div>

          <div className="space-y-6 flex flex-col justify-end">
            <div className="border-t border-slate-900 pt-1 text-center">
              <span className="font-bold block text-[10px] text-slate-900">Responsável Técnico / Executante</span>
              <span className="text-[9px] text-slate-500">{workOrder.responsibleName || 'Assinatura e Carimbo'}</span>
            </div>
            <div className="border-t border-slate-900 pt-1 text-center">
              <span className="font-bold block text-[10px] text-slate-900">Aprovação / Liberação Operacional</span>
              <span className="text-[9px] text-slate-500">Gestor da Área Solicitante</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
