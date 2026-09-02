import React from 'react';
import { WorkOrder } from '../../types';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDate } from '../../lib/utils';
import { exportWorkOrderToPDF } from '../../lib/exportUtils';
import { Printer, Download, CheckSquare, Wrench, Package, Clock, ShieldCheck, FileText, MapPin, Truck } from 'lucide-react';
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

  const handleDownloadPDF = () => {
    exportWorkOrderToPDF(workOrder);
  };

  const val = workOrder.values || {
    laborCost: 0,
    partsCost: 0,
    materialsCost: 0,
    servicesCost: 0,
    resourcesCost: 0,
    additionalCosts: 0,
    totalCost: 0
  };

  const travelCost = val.travelCost || 0;
  const taxAmount = val.taxAmount || 0;
  const taxPercent = val.taxPercent || 0;
  const subtotalCost = val.subtotalCost || (
    (val.laborCost || 0) +
    (val.partsCost || 0) +
    (val.materialsCost || 0) +
    (val.servicesCost || 0) +
    (val.resourcesCost || 0) +
    (val.additionalCosts || 0) +
    travelCost
  );

  const scopeList = workOrder.scope || [];
  const laborList = workOrder.labor || [];
  const resourceList = workOrder.resources || [];
  const milestoneList = workOrder.milestones || [];
  const executionList = workOrder.executions || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ordem de Serviço Oficial — ${workOrder.orderNumber}`}
      subtitle="Documento técnico formatado para impressão A4 e exportação em PDF"
      maxWidth="5xl"
      icon={<Printer className="w-5 h-5 text-amber-400" />}
      headerActions={
        <div className="flex items-center gap-2 mr-2 no-print">
          <button
            id="download-pdf-os-btn"
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors shadow-sm active:scale-95"
            title="Baixar arquivo PDF no computador ou celular"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Baixar PDF</span>
          </button>

          <button
            id="print-os-trigger-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-md active:scale-95"
            title="Imprimir ou Salvar em PDF via Navegador"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      }
    >
      {/* Printable Document Sheet Container */}
      <div
        id="work-order-print-document"
        className="printable-work-order-doc bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-300 font-sans print:border-none print:shadow-none print:p-0 print:m-0 text-xs leading-normal select-text max-w-4xl mx-auto"
      >
        {/* ================================================================
            CABEÇALHO OFICIAL T&A INDUSTRIAL SERVICE
           ================================================================ */}
        <div className="border-b-2 border-slate-900 pb-3 mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print-avoid-break">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-950 border border-slate-700 p-1 flex items-center justify-center rounded-lg shadow-sm shrink-0">
              <GearBoltIcon size={34} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight uppercase text-slate-900">
                  T&amp;A
                </span>
                <span className="text-base font-bold tracking-tight uppercase text-amber-600">
                  Industrial
                </span>
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Service
                </span>
              </div>
              <p className="text-[10px] text-slate-700 font-semibold tracking-tight">
                Soluções Industriais &amp; Gestão de Manutenção de Ativos
              </p>
              <p className="text-[9px] text-slate-500">
                Departamento de Engenharia e PCM (Planejamento e Controle da Manutenção)
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto border-slate-200">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
              ORDEM DE SERVIÇO
            </span>
            <span className="text-xl font-black font-mono text-slate-950 tracking-tight block">
              {workOrder.orderNumber}
            </span>
            <span className="text-[9px] text-slate-500 block">
              Emissão: <strong className="text-slate-800">{formatDate(workOrder.date)} {workOrder.time}</strong>
            </span>
          </div>
        </div>

        {/* ================================================================
            1. CLASSIFICAÇÃO & DADOS GERAIS DA OS
           ================================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-slate-100 border border-slate-300 rounded mb-3 text-[10px] print-avoid-break">
          <div>
            <span className="font-bold text-slate-500 block uppercase text-[9px]">Tipo de Manutenção:</span>
            <span className="font-bold text-slate-900 uppercase">{workOrder.type}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block uppercase text-[9px]">Prioridade:</span>
            <span className={`font-bold uppercase ${
              workOrder.priority === 'Crítica' ? 'text-red-700 font-black' :
              workOrder.priority === 'Alta' ? 'text-amber-800 font-bold' : 'text-slate-900'
            }`}>
              {workOrder.priority}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block uppercase text-[9px]">Status Operacional:</span>
            <span className="font-bold text-slate-900 uppercase">{workOrder.status}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500 block uppercase text-[9px]">Prazo Limite:</span>
            <span className="font-bold text-slate-900">
              {formatDate(workOrder.deadlineDate)} {workOrder.deadlineTime || ''}
            </span>
          </div>
        </div>

        {/* ================================================================
            2. LOCALIZAÇÃO E ATIVO / EQUIPAMENTO
           ================================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 border border-slate-300 p-2.5 rounded bg-slate-50 text-[10px] print-avoid-break">
          <div>
            <h3 className="font-bold text-slate-800 uppercase border-b border-slate-200 pb-1 mb-1 text-[10px] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-600" />
              1. Localização &amp; Solicitante
            </h3>
            <p><span className="font-semibold text-slate-600">Empresa Cliente:</span> <strong className="text-slate-900">{workOrder.company || 'T&A Industrial Service'}</strong></p>
            <p><span className="font-semibold text-slate-600">Unidade:</span> {workOrder.unit || '-'} — {workOrder.department || '-'}</p>
            <p><span className="font-semibold text-slate-600">Área / Linha:</span> {workOrder.area || '-'}</p>
            <p><span className="font-semibold text-slate-600">Solicitante:</span> {workOrder.requesterName || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 uppercase border-b border-slate-200 pb-1 mb-1 text-[10px] flex items-center gap-1">
              <Wrench className="w-3 h-3 text-amber-600" />
              2. Equipamento &amp; Ativo
            </h3>
            <p><span className="font-semibold text-slate-600">Código / Tag do Ativo:</span> <span className="font-mono font-bold text-slate-950 px-1 bg-slate-200/80 rounded border border-slate-300">{workOrder.equipmentCode}</span></p>
            <p><span className="font-semibold text-slate-600">Nome do Equipamento:</span> <strong className="text-slate-900">{workOrder.equipmentName}</strong></p>
            <p><span className="font-semibold text-slate-600">Responsável Geral:</span> {workOrder.responsibleName || 'Não atribuído'}</p>
            <p><span className="font-semibold text-slate-600">Conclusão Efetiva:</span> {workOrder.completedAt ? formatDate(workOrder.completedAt) : 'Em aberto'}</p>
          </div>
        </div>

        {/* ================================================================
            3. DESCRIÇÃO DO PROBLEMA / OBJETO DO SERVIÇO
           ================================================================ */}
        <div className="mb-3 border border-slate-300 p-2.5 rounded bg-white print-avoid-break">
          <h3 className="font-bold text-slate-800 uppercase border-b border-slate-200 pb-1 mb-1 text-[10px] flex items-center gap-1">
            <FileText className="w-3 h-3 text-amber-600" />
            3. Descrição do Problema / Objeto da Solicitação
          </h3>
          <p className="text-slate-800 text-[10px] whitespace-pre-wrap leading-relaxed mt-1">
            {workOrder.description || 'Nenhuma descrição detalhada informada.'}
          </p>
          {workOrder.observations && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[9px] text-slate-600">
              <strong className="text-slate-800">Observações Complementares / Recomendações:</strong> {workOrder.observations}
            </div>
          )}
        </div>

        {/* ================================================================
            4. ESCOPO TÉCNICO DE ATIVIDADES DETALHADAS
           ================================================================ */}
        <div className="mb-3">
          <h3 className="font-bold text-slate-800 uppercase mb-1 text-[10px] flex items-center gap-1">
            <CheckSquare className="w-3 h-3 text-amber-600" />
            4. Escopo Técnico de Atividades Detalhadas
          </h3>
          <table className="w-full border-collapse border border-slate-300 text-[9px]">
            <thead>
              <tr className="bg-slate-200 text-slate-800 uppercase font-bold">
                <th className="border border-slate-300 p-1 w-10 text-center">Item</th>
                <th className="border border-slate-300 p-1 text-left">Descrição da Atividade</th>
                <th className="border border-slate-300 p-1 w-12 text-center">Pessoas</th>
                <th className="border border-slate-300 p-1 w-28 text-left">Início</th>
                <th className="border border-slate-300 p-1 w-28 text-left">Término</th>
                <th className="border border-slate-300 p-1 w-36 text-left">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {scopeList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-slate-300 p-2 text-center text-slate-500 italic">
                    Nenhum item de escopo cadastrado.
                  </td>
                </tr>
              ) : (
                scopeList.map((sc) => (
                  <tr key={sc.id} className="hover:bg-slate-50 print-avoid-break">
                    <td className="border border-slate-300 p-1 text-center font-mono font-bold text-slate-900">{sc.itemNumber}</td>
                    <td className="border border-slate-300 p-1 font-medium">
                      {sc.description}
                      {sc.observation && <span className="block text-[8px] text-slate-500 italic mt-0.5">Obs: {sc.observation}</span>}
                    </td>
                    <td className="border border-slate-300 p-1 text-center font-semibold">{sc.peopleCount || 1}</td>
                    <td className="border border-slate-300 p-1 text-slate-700 whitespace-nowrap">{sc.startDate || '—'}</td>
                    <td className="border border-slate-300 p-1 text-slate-700 whitespace-nowrap">{sc.endDate || '—'}</td>
                    <td className="border border-slate-300 p-1 font-medium text-slate-900">{sc.responsibleName || 'A definir'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================================================================
            5. ALOCAÇÃO DE MÃO DE OBRA E ESPECIALISTAS
           ================================================================ */}
        <div className="mb-3">
          <h3 className="font-bold text-slate-800 uppercase mb-1 text-[10px] flex items-center gap-1">
            <Wrench className="w-3 h-3 text-amber-600" />
            5. Alocação de Mão de Obra e Especialistas Técnicos
          </h3>
          <table className="w-full border-collapse border border-slate-300 text-[9px]">
            <thead>
              <tr className="bg-slate-200 text-slate-800 uppercase font-bold">
                <th className="border border-slate-300 p-1 w-10 text-center">Item</th>
                <th className="border border-slate-300 p-1 text-left">Profissional / Especialista</th>
                <th className="border border-slate-300 p-1 text-left">Função / Especialidade</th>
                <th className="border border-slate-300 p-1 w-14 text-center">Horas</th>
                <th className="border border-slate-300 p-1 w-20 text-right">Taxa (R$/h)</th>
                <th className="border border-slate-300 p-1 w-24 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {laborList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-slate-300 p-2 text-center text-slate-500 italic">
                    Nenhum profissional alocado nesta Ordem de Serviço.
                  </td>
                </tr>
              ) : (
                laborList.map((lb) => {
                  const matchedScope = scopeList.find(s => s.itemNumber === lb.itemNumber);
                  const actLabel = lb.activityDescription || matchedScope?.description;

                  return (
                    <tr key={lb.id} className="hover:bg-slate-50 print-avoid-break">
                      <td className="border border-slate-300 p-1 text-center font-mono font-bold text-slate-900">{lb.itemNumber}</td>
                      <td className="border border-slate-300 p-1">
                        <span className="font-semibold text-slate-950 block">{lb.employeeName || 'A definir'}</span>
                        {actLabel && <span className="text-[8px] text-slate-500 block">Ref: {actLabel}</span>}
                      </td>
                      <td className="border border-slate-300 p-1 text-slate-800 font-medium">{lb.positionName}</td>
                      <td className="border border-slate-300 p-1 text-center font-mono">{lb.hours}h</td>
                      <td className="border border-slate-300 p-1 text-right font-mono">{formatCurrency(lb.hourlyRate)}</td>
                      <td className="border border-slate-300 p-1 text-right font-mono font-bold text-slate-900">{formatCurrency(lb.totalValue)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold print-avoid-break">
                <td colSpan={5} className="border border-slate-300 p-1 text-right uppercase text-[9px]">
                  Subtotal Mão de Obra Direta:
                </td>
                <td className="border border-slate-300 p-1 text-right font-mono text-slate-950">
                  {formatCurrency(val.laborCost)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ================================================================
            6. RECURSOS, FERRAMENTAS & EQUIPAMENTOS ESPECIAIS (SE HOUVER)
           ================================================================ */}
        {resourceList.length > 0 && (
          <div className="mb-3">
            <h3 className="font-bold text-slate-800 uppercase mb-1 text-[10px] flex items-center gap-1">
              <Package className="w-3 h-3 text-amber-600" />
              6. Recursos, Equipamentos Especiais e Ferramental
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-[9px]">
              <thead>
                <tr className="bg-slate-200 text-slate-800 uppercase font-bold">
                  <th className="border border-slate-300 p-1 w-10 text-center">Item</th>
                  <th className="border border-slate-300 p-1 text-left">Recurso / Ferramenta</th>
                  <th className="border border-slate-300 p-1 w-20 text-center">Tipo</th>
                  <th className="border border-slate-300 p-1 w-14 text-center">Qtd</th>
                  <th className="border border-slate-300 p-1 w-20 text-center">Status</th>
                  <th className="border border-slate-300 p-1 w-24 text-right">Custo Total</th>
                </tr>
              </thead>
              <tbody>
                {resourceList.map((rc, idx) => (
                  <tr key={rc.id} className="print-avoid-break">
                    <td className="border border-slate-300 p-1 text-center font-mono font-bold">{idx + 1}</td>
                    <td className="border border-slate-300 p-1 font-medium">{rc.name}</td>
                    <td className="border border-slate-300 p-1 text-center">{rc.type}</td>
                    <td className="border border-slate-300 p-1 text-center">{rc.quantity} {rc.unit}</td>
                    <td className="border border-slate-300 p-1 text-center font-semibold">{rc.status}</td>
                    <td className="border border-slate-300 p-1 text-right font-mono font-bold">{formatCurrency(rc.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================================================================
            7. MARCOS E CRONOGRAMA DE ENTREGA (SE HOUVER)
           ================================================================ */}
        {milestoneList.length > 0 && (
          <div className="mb-3">
            <h3 className="font-bold text-slate-800 uppercase mb-1 text-[10px] flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              7. Cronograma e Marcos de Entrega
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-[9px]">
              <thead>
                <tr className="bg-slate-200 text-slate-800 uppercase font-bold">
                  <th className="border border-slate-300 p-1 text-left">Marco / Etapa</th>
                  <th className="border border-slate-300 p-1 w-24 text-center">Data Alvo</th>
                  <th className="border border-slate-300 p-1 w-24 text-center">Conclusão</th>
                  <th className="border border-slate-300 p-1 w-24 text-center">Status</th>
                  <th className="border border-slate-300 p-1 w-32 text-left">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {milestoneList.map((ms) => (
                  <tr key={ms.id} className="print-avoid-break">
                    <td className="border border-slate-300 p-1 font-medium">{ms.title}</td>
                    <td className="border border-slate-300 p-1 text-center">{formatDate(ms.targetDate)}</td>
                    <td className="border border-slate-300 p-1 text-center">{ms.completedDate ? formatDate(ms.completedDate) : '—'}</td>
                    <td className="border border-slate-300 p-1 text-center font-bold">{ms.status}</td>
                    <td className="border border-slate-300 p-1">{ms.responsibleName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================================================================
            8. APONTAMENTOS DE EXECUÇÃO EM CAMPO (SE HOUVER OU BLOC DE CAMPO)
           ================================================================ */}
        {executionList.length > 0 ? (
          <div className="mb-3">
            <h3 className="font-bold text-slate-800 uppercase mb-1 text-[10px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              8. Registros e Apontamentos de Execução Realizada
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-[9px]">
              <thead>
                <tr className="bg-slate-200 text-slate-800 uppercase font-bold">
                  <th className="border border-slate-300 p-1 w-20 text-center">Data</th>
                  <th className="border border-slate-300 p-1 w-20 text-center">Horário</th>
                  <th className="border border-slate-300 p-1 w-36 text-left">Técnico Executante</th>
                  <th className="border border-slate-300 p-1 text-left">Serviço Realizado / Ocorrência</th>
                </tr>
              </thead>
              <tbody>
                {executionList.map((ex) => (
                  <tr key={ex.id} className="print-avoid-break">
                    <td className="border border-slate-300 p-1 text-center font-mono">{formatDate(ex.date)}</td>
                    <td className="border border-slate-300 p-1 text-center font-mono">{ex.startTime} às {ex.endTime}</td>
                    <td className="border border-slate-300 p-1 font-semibold">{ex.employeeName}</td>
                    <td className="border border-slate-300 p-1">{ex.servicePerformed || ex.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mb-3 border border-dashed border-slate-300 p-2 rounded bg-slate-50/50 print-avoid-break">
            <span className="text-[9px] font-bold text-slate-600 uppercase block mb-1">
              8. Apontamento de Campo (Para preenchimento manual pelo técnico):
            </span>
            <div className="grid grid-cols-3 gap-2 text-[9px] text-slate-500 pt-1">
              <div>Início dos Trabalhos: ____/____/________ às ____:____</div>
              <div>Término dos Trabalhos: ____/____/________ às ____:____</div>
              <div>Equipamento Liberado Operacional: ( ) SIM ( ) NÃO</div>
            </div>
          </div>
        )}

        {/* ================================================================
            9. COMPOSIÇÃO FINANCEIRA & ASSINATURAS (LADO A LADO)
           ================================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t-2 border-slate-900 print-avoid-break">
          {/* Quadro Financeiro */}
          <div className="border border-slate-300 p-2.5 rounded bg-slate-50">
            <h3 className="font-bold text-[9px] uppercase text-slate-800 mb-1.5 border-b border-slate-200 pb-0.5 flex items-center justify-between">
              <span>Composição Financeira &amp; Tributária</span>
              <span className="font-mono text-[8px] text-slate-500">Valores em BRL (R$)</span>
            </h3>
            <div className="space-y-1 text-[9px]">
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span className="text-slate-700">1. Mão de Obra Direta:</span>
                <span className="font-mono font-semibold text-slate-900">{formatCurrency(val.laborCost)}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span className="text-slate-700">2. Peças &amp; Materiais:</span>
                <span className="font-mono font-semibold text-slate-900">{formatCurrency((val.partsCost || 0) + (val.materialsCost || 0))}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span className="text-slate-700">3. Serviços Terceirizados &amp; Recursos:</span>
                <span className="font-mono font-semibold text-slate-900">{formatCurrency((val.servicesCost || 0) + (val.resourcesCost || 0))}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span className="text-slate-700">4. Deslocamento / Logística (Km):</span>
                <span className="font-mono font-semibold text-slate-900">{formatCurrency(travelCost)}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-300 font-bold text-slate-900 bg-slate-200/50 px-1 rounded">
                <span>Subtotal Operacional:</span>
                <span className="font-mono">{formatCurrency(subtotalCost)}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200 text-slate-600">
                <span>Impostos ({taxPercent > 0 ? `${taxPercent}%` : 'Inclusos/Diretos'}):</span>
                <span className="font-mono font-semibold">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 font-black text-[11px] text-slate-950 border-t-2 border-slate-900 bg-amber-500/10 px-1 rounded">
                <span>VALOR TOTAL GERAL:</span>
                <span className="font-mono text-emerald-900 font-black">{formatCurrency(val.totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Assinaturas Formais e Termo */}
          <div className="space-y-4 flex flex-col justify-between py-1">
            <div className="text-[8px] text-slate-500 leading-tight border border-slate-200 p-1.5 rounded bg-slate-50/50">
              <strong className="text-slate-700">Termo de Conformidade Técnica:</strong> Declaro que os serviços foram planejados e executados em conformidade com as normas regulamentadoras aplicáveis de segurança industrial e engenharia.
            </div>

            <div className="border-t border-slate-900 pt-1 text-center">
              <span className="font-bold block text-[9px] text-slate-950">
                {workOrder.responsibleName || 'Responsável Técnico Executante'}
              </span>
              <span className="text-[8px] text-slate-500">
                T&amp;A Industrial Service — Assinatura &amp; Registro Profissional
              </span>
            </div>

            <div className="border-t border-slate-900 pt-1 text-center">
              <span className="font-bold block text-[9px] text-slate-950">
                Aprovação &amp; Aceite Operacional (Cliente)
              </span>
              <span className="text-[8px] text-slate-500">
                {workOrder.requesterName ? `${workOrder.requesterName} — ` : ''}Gestor da Área Solicitante / Carimbo
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
