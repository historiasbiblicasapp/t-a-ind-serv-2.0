import React from 'react';
import { WorkOrder } from '../../types';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Printer, Download, CheckSquare, Wrench } from 'lucide-react';
import { GearBoltIcon } from '../common/BrandLogo';

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

  const travelCost = workOrder.values?.travelCost || 0;
  const taxAmount = workOrder.values?.taxAmount || 0;
  const taxPercent = workOrder.values?.taxPercent || 0;
  const subtotalCost = workOrder.values?.subtotalCost || (
    (workOrder.values?.laborCost || 0) +
    (workOrder.values?.partsCost || 0) +
    (workOrder.values?.materialsCost || 0) +
    (workOrder.values?.servicesCost || 0) +
    (workOrder.values?.resourcesCost || 0) +
    (workOrder.values?.additionalCosts || 0) +
    travelCost
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Visualização de Impressão — ${workOrder.orderNumber}`}
      maxWidth="5xl"
      icon={<Printer className="w-5 h-5 text-amber-400" />}
      headerActions={
        <div className="flex items-center gap-2 mr-2">
          <button
            id="print-os-trigger-btn"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir OS</span>
          </button>
        </div>
      }
    >
      <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-300 font-sans print:border-none print:shadow-none print:p-0 text-xs leading-normal">
        {/* Printable Industrial Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-950 border border-slate-700 p-1 flex items-center justify-center rounded-lg shadow-sm">
              <GearBoltIcon size={36} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight uppercase text-slate-900">
                  T&amp;A
                </span>
                <span className="text-lg font-bold tracking-tight uppercase text-amber-600">
                  Industrial
                </span>
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Service
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Departamento de Engenharia e Planejamento de Manutenção (PCM)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">ORDEM DE SERVIÇO</span>
            <span className="text-2xl font-black font-mono text-slate-900 tracking-tight">{workOrder.orderNumber}</span>
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
            <span className={`font-bold uppercase ${
              workOrder.priority === 'Crítica' ? 'text-red-600' :
              workOrder.priority === 'Alta' ? 'text-amber-700' : 'text-slate-800'
            }`}>
              {workOrder.priority}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block">Status Atual:</span>
            <span className="font-bold text-slate-900 uppercase">{workOrder.status}</span>
          </div>
        </div>

        {/* Client / Equipment Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 border border-slate-300 p-3 rounded bg-slate-50 text-[11px]">
          <div>
            <h3 className="font-bold text-slate-700 uppercase border-b border-slate-200 pb-1 mb-1.5">
              1. Localização &amp; Solicitante
            </h3>
            <p><span className="font-semibold">Empresa:</span> {workOrder.company}</p>
            <p><span className="font-semibold">Unidade:</span> {workOrder.unit} — {workOrder.department}</p>
            <p><span className="font-semibold">Área / Linha:</span> {workOrder.area}</p>
            <p><span className="font-semibold">Solicitante:</span> {workOrder.requesterName || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-700 uppercase border-b border-slate-200 pb-1 mb-1.5">
              2. Equipamento &amp; Ativo
            </h3>
            <p><span className="font-semibold">Tag/Código:</span> <span className="font-mono font-bold text-slate-900">{workOrder.equipmentCode}</span></p>
            <p><span className="font-semibold">Nome do Ativo:</span> {workOrder.equipmentName}</p>
            <p><span className="font-semibold">Responsável:</span> {workOrder.responsibleName || 'Não atribuído'}</p>
            <p><span className="font-semibold">Prazo Limite:</span> {formatDate(workOrder.deadlineDate)} {workOrder.deadlineTime || ''}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4 border border-slate-300 p-3 rounded">
          <h3 className="font-bold text-slate-700 uppercase border-b border-slate-200 pb-1 mb-1 text-[11px]">
            3. Descrição do Problema / Objeto do Serviço
          </h3>
          <p className="text-slate-800 text-[11px] whitespace-pre-wrap leading-relaxed mt-1">
            {workOrder.description || 'Nenhuma descrição detalhada informada.'}
          </p>
        </div>

        {/* 1. ESCOPO DE ATIVIDADES */}
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 uppercase mb-1.5 text-[11px] flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
            4. Escopo Técnico de Atividades Detalhadas
          </h3>
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-200 text-slate-800 uppercase font-bold">
                <th className="border border-slate-300 p-1.5 w-12 text-center">Item</th>
                <th className="border border-slate-300 p-1.5 text-left">Descrição da Atividade / Tarefa</th>
                <th className="border border-slate-300 p-1.5 w-16 text-center">Pessoas</th>
                <th className="border border-slate-300 p-1.5 w-32 text-left">Início</th>
                <th className="border border-slate-300 p-1.5 w-32 text-left">Término</th>
                <th className="border border-slate-300 p-1.5 w-32 text-left">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {(workOrder.scope || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-slate-300 p-2 text-center text-slate-500 italic">
                    Nenhum item de escopo cadastrado.
                  </td>
                </tr>
              ) : (
                (workOrder.scope || []).map((sc) => (
                  <tr key={sc.id}>
                    <td className="border border-slate-300 p-1.5 text-center font-mono font-bold">{sc.itemNumber}</td>
                    <td className="border border-slate-300 p-1.5 font-medium">
                      {sc.description}
                      {sc.observation && <span className="block text-[9px] text-slate-500 italic mt-0.5">Obs: {sc.observation}</span>}
                    </td>
                    <td className="border border-slate-300 p-1.5 text-center font-semibold">{sc.peopleCount || 1}</td>
                    <td className="border border-slate-300 p-1.5">{sc.startDate || '—'}</td>
                    <td className="border border-slate-300 p-1.5">{sc.endDate || '—'}</td>
                    <td className="border border-slate-300 p-1.5">{sc.responsibleName || 'A definir'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 2. MÃO DE OBRA VINCULADA */}
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 uppercase mb-1.5 text-[11px] flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            5. Alocação de Mão de Obra e Especialistas
          </h3>
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-200 text-slate-800 uppercase font-bold">
                <th className="border border-slate-300 p-1.5 w-12 text-center">Item</th>
                <th className="border border-slate-300 p-1.5 text-left">Funcionário / Técnico</th>
                <th className="border border-slate-300 p-1.5 text-left">Cargo / Especialidade</th>
                <th className="border border-slate-300 p-1.5 w-16 text-center">Horas</th>
                <th className="border border-slate-300 p-1.5 w-24 text-right">Valor Hora</th>
                <th className="border border-slate-300 p-1.5 w-24 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(workOrder.labor || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-slate-300 p-2 text-center text-slate-500 italic">
                    Nenhum profissional alocado.
                  </td>
                </tr>
              ) : (
                (workOrder.labor || []).map((lb) => (
                  <tr key={lb.id}>
                    <td className="border border-slate-300 p-1.5 text-center font-mono font-bold">{lb.itemNumber}</td>
                    <td className="border border-slate-300 p-1.5 font-semibold">{lb.employeeName || 'A definir'}</td>
                    <td className="border border-slate-300 p-1.5">{lb.positionName}</td>
                    <td className="border border-slate-300 p-1.5 text-center">{lb.hours}h</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">{formatCurrency(lb.hourlyRate)}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono font-bold">{formatCurrency(lb.totalValue)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold">
                <td colSpan={5} className="border border-slate-300 p-1.5 text-right uppercase">Total Estimado Mão de Obra:</td>
                <td className="border border-slate-300 p-1.5 text-right font-mono text-slate-900">{formatCurrency(workOrder.values?.laborCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 3. RECURSOS / FERRAMENTAS SE HOUVER */}
        {workOrder.resources && workOrder.resources.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 uppercase mb-1.5 text-[11px]">
              6. Recursos, Equipamentos Especiais e Ferramental
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-[10px]">
              <thead>
                <tr className="bg-slate-200 text-slate-800 uppercase font-bold">
                  <th className="border border-slate-300 p-1.5 w-12 text-center">Item</th>
                  <th className="border border-slate-300 p-1.5 text-left">Recurso / Ferramenta</th>
                  <th className="border border-slate-300 p-1.5 w-16 text-center">Tipo</th>
                  <th className="border border-slate-300 p-1.5 w-16 text-center">Qtd</th>
                  <th className="border border-slate-300 p-1.5 w-24 text-right">Custo Total</th>
                </tr>
              </thead>
              <tbody>
                {workOrder.resources.map((rc, idx) => (
                  <tr key={rc.id}>
                    <td className="border border-slate-300 p-1.5 text-center font-mono font-bold">{idx + 1}</td>
                    <td className="border border-slate-300 p-1.5 font-medium">{rc.name}</td>
                    <td className="border border-slate-300 p-1.5 text-center">{rc.type}</td>
                    <td className="border border-slate-300 p-1.5 text-center">{rc.quantity}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono font-bold">{formatCurrency(rc.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cost Summary & Signatures */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t-2 border-slate-900">
          <div className="border border-slate-300 p-3 rounded bg-slate-50">
            <h3 className="font-bold text-[10px] uppercase text-slate-700 mb-1.5 border-b border-slate-200 pb-0.5">
              Composição Financeira &amp; Tributária
            </h3>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span>1. Mão de Obra Direta:</span>
                <span className="font-mono font-semibold">{formatCurrency(workOrder.values?.laborCost)}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span>2. Peças &amp; Materiais:</span>
                <span className="font-mono font-semibold">{formatCurrency((workOrder.values?.partsCost || 0) + (workOrder.values?.materialsCost || 0))}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span>3. Serviços Terceirizados &amp; Recursos:</span>
                <span className="font-mono font-semibold">{formatCurrency((workOrder.values?.servicesCost || 0) + (workOrder.values?.resourcesCost || 0))}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span>4. Deslocamento / Transporte:</span>
                <span className="font-mono font-semibold">{formatCurrency(travelCost)}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-300 font-bold text-slate-800">
                <span>Subtotal Operacional:</span>
                <span className="font-mono">{formatCurrency(subtotalCost)}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200 text-slate-600">
                <span>Impostos ({taxPercent > 0 ? `${taxPercent}%` : 'Inclusos/Diretos'}):</span>
                <span className="font-mono font-semibold">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 font-extrabold text-[12px] text-slate-900 border-t-2 border-slate-800">
                <span>VALOR TOTAL GERAL:</span>
                <span className="font-mono text-emerald-800">{formatCurrency(workOrder.values?.totalCost)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8 flex flex-col justify-end">
            <div className="border-t border-slate-900 pt-1 text-center">
              <span className="font-bold block text-[10px] text-slate-900">Responsável Técnico / Executante</span>
              <span className="text-[9px] text-slate-500">{workOrder.responsibleName || 'Assinatura e Carimbo'}</span>
            </div>
            <div className="border-t border-slate-900 pt-1 text-center">
              <span className="font-bold block text-[10px] text-slate-900">Aprovação / Liberação Operacional</span>
              <span className="text-[9px] text-slate-500">Gestor da Área Solicitante (Cliente)</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
