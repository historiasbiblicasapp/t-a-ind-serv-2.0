import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './utils';

export function exportToCSV(data: any[], filename: string): void {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => 
    headers.map(header => {
      let val = obj[header];
      if (val === null || val === undefined) val = '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(data: any[], sheetName: string, filename: string): void {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPDF(title: string, subtitle: string, headers: string[], rows: (string | number)[][], filename: string): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Industrial Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 297, 28, 'F');

  // Accent Line
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 28, 297, 2, 'F');

  // App Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('T&A Industrial Service', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Sistema de Gestão de Manutenção Industrial', 14, 18);

  // Document Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 283, 13, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(245, 158, 11);
  doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')} | ${subtitle}`, 283, 20, { align: 'right' });

  // Table Rendering
  let startY = 38;
  const colWidth = Math.floor(270 / headers.length);
  
  // Table Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(14, startY, 269, 8, 'F');
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');

  headers.forEach((h, i) => {
    doc.text(h, 16 + i * colWidth, startY + 5.5);
  });

  startY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  rows.forEach((row, rowIndex) => {
    if (startY > 185) {
      doc.addPage();
      startY = 20;
    }

    if (rowIndex % 2 === 0) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(241, 245, 249);
    }
    doc.rect(14, startY, 269, 7, 'F');
    doc.setTextColor(15, 23, 42);

    row.forEach((cell, i) => {
      const cellStr = String(cell || '-');
      const truncated = cellStr.length > 28 ? cellStr.substring(0, 26) + '...' : cellStr;
      doc.text(truncated, 16 + i * colWidth, startY + 4.8);
    });

    startY += 7;
  });

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('T&A Industrial Service — Relatório Gerencial de Conformidade e Engenharia de Ativos', 14, 202);
  doc.text('Página 1 de 1', 283, 202, { align: 'right' });

  doc.save(`${filename}.pdf`);
}

export function printWorkOrderTemplate(order: any): void {
  window.print();
}

export function exportWorkOrderToPDF(order: any): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);
  const maxY = 265;
  let y = 12;

  const renderContinuationHeader = () => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, 10, contentWidth, 12, 'F');
    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(margin, 22, contentWidth, 1, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('T&A INDUSTRIAL SERVICE — ORDEM DE SERVIÇO (CONTINUAÇÃO)', margin + 3, 17);

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(8.5);
    doc.text(String(order.orderNumber || 'OS-0000'), pageWidth - margin - 3, 17, { align: 'right' });

    y = 28;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > maxY) {
      doc.addPage();
      renderContinuationHeader();
      return true;
    }
    return false;
  };

  // ==========================================
  // PAGE 1: HEADER & BANNER
  // ==========================================
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 22, 'F');
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(margin, y + 22, contentWidth, 1.5, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('T&A INDUSTRIAL SERVICE', margin + 4, y + 9);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Departamento de Engenharia e Planejamento de Manutenção (PCM)', margin + 4, y + 16);

  // OS Number
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDEM DE SERVIÇO', pageWidth - margin - 4, y + 8, { align: 'right' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(String(order.orderNumber || 'OS-0000'), pageWidth - margin - 4, y + 17, { align: 'right' });

  y += 28;

  // 1. Classification Bar
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 14, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 14, 'S');

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('EMISSÃO', margin + 3, y + 4.5);
  doc.text('TIPO', margin + 45, y + 4.5);
  doc.text('PRIORIDADE', margin + 90, y + 4.5);
  doc.text('STATUS', margin + 135, y + 4.5);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatDate(order.date)} ${order.time || ''}`, margin + 3, y + 10);
  doc.text(String(order.type || 'Manutenção').toUpperCase(), margin + 45, y + 10);
  doc.text(String(order.priority || 'Normal').toUpperCase(), margin + 90, y + 10);
  doc.text(String(order.status || 'Aberta').toUpperCase(), margin + 135, y + 10);

  y += 18;

  // 2. Client & Equipment Data
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 22, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 22, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. LOCALIZAÇÃO E CLIENTE', margin + 3, y + 4.5);
  doc.text('2. ATIVO E EQUIPAMENTO', margin + 95, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Empresa: ${order.company || 'T&A Industrial Service'}`, margin + 3, y + 9.5);
  doc.text(`Unidade / Setor: ${order.unit || '-'} — ${order.department || '-'}`, margin + 3, y + 14);
  doc.text(`Área / Linha: ${order.area || '-'}`, margin + 3, y + 18.5);

  doc.text(`Código / Tag: ${order.equipmentCode || '-'}`, margin + 95, y + 9.5);
  doc.text(`Nome do Ativo: ${order.equipmentName || '-'}`, margin + 95, y + 14);
  doc.text(`Responsável Geral: ${order.responsibleName || 'Não atribuído'}`, margin + 95, y + 18.5);

  y += 26;

  // 3. Problem Description
  const descLines = doc.splitTextToSize(order.description || 'Sem descrição detalhada.', contentWidth - 6);
  const descHeight = Math.max(16, (descLines.length * 4) + 8);
  checkPageBreak(descHeight + 4);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, descHeight, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. DESCRIÇÃO DO PROBLEMA / OBJETO DO SERVIÇO', margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(descLines, margin + 3, y + 9);

  y += descHeight + 4;

  // 4. Scope of Activities Table
  checkPageBreak(16);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('4. ESCOPO TÉCNICO DE ATIVIDADES', margin, y + 3.5);
  y += 5.5;

  const renderScopeTableHeader = () => {
    doc.setFillColor(30, 41, 59);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM', margin + 2, y + 4);
    doc.text('DESCRIÇÃO DA ATIVIDADE', margin + 14, y + 4);
    doc.text('PESSOAS', margin + 90, y + 4, { align: 'center' });
    doc.text('INÍCIO', margin + 100, y + 4);
    doc.text('TÉRMINO', margin + 128, y + 4);
    doc.text('RESPONSÁVEL', margin + 156, y + 4);
    y += 5.5;
  };

  renderScopeTableHeader();

  const scopeList = order.scope || [];
  if (scopeList.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 5, 'F');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Nenhum item de escopo registrado.', margin + 4, y + 3.5);
    y += 5;
  } else {
    scopeList.forEach((sc: any, idx: number) => {
      if (checkPageBreak(6)) {
        renderScopeTableHeader();
      }

      doc.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text(String(sc.itemNumber || idx + 1), margin + 2, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(String(sc.description || '').substring(0, 44), margin + 14, y + 4);
      doc.text(String(sc.peopleCount || 1), margin + 90, y + 4, { align: 'center' });
      doc.text(String(sc.startDate || '-').substring(0, 16), margin + 100, y + 4);
      doc.text(String(sc.endDate || '-').substring(0, 16), margin + 128, y + 4);
      doc.text(String(sc.responsibleName || 'A definir').substring(0, 22), margin + 156, y + 4);
      y += 5.5;
    });
  }

  y += 4;

  // 5. Labor / Technicians Table
  checkPageBreak(16);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('5. ALOCAÇÃO DE MÃO DE OBRA E ESPECIALISTAS', margin, y + 3.5);
  y += 5.5;

  const renderLaborTableHeader = () => {
    doc.setFillColor(30, 41, 59);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM', margin + 2, y + 4);
    doc.text('PROFISSIONAL / TÉCNICO', margin + 14, y + 4);
    doc.text('CARGO / ESPECIALIDADE', margin + 64, y + 4);
    doc.text('HORAS', margin + 132, y + 4, { align: 'center' });
    doc.text('VALOR/H', margin + 162, y + 4, { align: 'right' });
    doc.text('SUBTOTAL', margin + 184, y + 4, { align: 'right' });
    y += 5.5;
  };

  renderLaborTableHeader();

  const laborList = order.labor || [];
  if (laborList.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 5, 'F');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Nenhum profissional alocado.', margin + 4, y + 3.5);
    y += 5;
  } else {
    laborList.forEach((lb: any, idx: number) => {
      if (checkPageBreak(6)) {
        renderLaborTableHeader();
      }

      doc.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text(String(lb.itemNumber || idx + 1), margin + 2, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(String(lb.employeeName || 'A definir').substring(0, 30), margin + 14, y + 4);
      doc.text(String(lb.positionName || lb.role || 'Técnico').substring(0, 36), margin + 64, y + 4);
      doc.text(`${lb.hours || 0}h`, margin + 132, y + 4, { align: 'center' });
      doc.text(formatCurrency(lb.hourlyRate || 0), margin + 162, y + 4, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(lb.totalValue || 0), margin + 184, y + 4, { align: 'right' });
      y += 5.5;
    });
  }

  y += 4;

  // 6. Resources Table (if any)
  const resourceList = order.resources || [];
  if (resourceList.length > 0) {
    checkPageBreak(16);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('6. RECURSOS, EQUIPAMENTOS E FERRAMENTAL', margin, y + 3.5);
    y += 5.5;

    doc.setFillColor(30, 41, 59);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM', margin + 2, y + 4);
    doc.text('RECURSO / FERRAMENTA', margin + 14, y + 4);
    doc.text('TIPO', margin + 70, y + 4);
    doc.text('QTD', margin + 115, y + 4, { align: 'center' });
    doc.text('STATUS', margin + 128, y + 4);
    doc.text('CUSTO TOTAL', margin + 184, y + 4, { align: 'right' });
    y += 5.5;

    resourceList.forEach((rc: any, idx: number) => {
      checkPageBreak(6);
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text(String(idx + 1), margin + 2, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(String(rc.name || '').substring(0, 32), margin + 14, y + 4);
      doc.text(String(rc.type || '-').substring(0, 20), margin + 70, y + 4);
      doc.text(`${rc.quantity || 1} ${rc.unit || 'un'}`, margin + 115, y + 4, { align: 'center' });
      doc.text(String(rc.status || 'Alocado').substring(0, 16), margin + 128, y + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(rc.totalCost || 0), margin + 184, y + 4, { align: 'right' });
      y += 5.5;
    });

    y += 4;
  }

  // 7. Financial Summary & Signatures (Guaranteed together on page)
  checkPageBreak(48); // Ensure both boxes fit without cutting off

  const val = order.values || {};
  const travelCost = val.travelCost || 0;
  const taxAmount = val.taxAmount || 0;
  const subtotalCost = val.subtotalCost || ((val.laborCost || 0) + (val.partsCost || 0) + (val.materialsCost || 0) + (val.servicesCost || 0) + (val.resourcesCost || 0) + (val.additionalCosts || 0) + travelCost);

  // Financial Box
  const finWidth = 88;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, finWidth, 40, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, finWidth, 40, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('COMPOSIÇÃO FINANCEIRA', margin + 3, y + 4.5);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Mão de Obra Direta:', margin + 3, y + 9.5);
  doc.text(formatCurrency(val.laborCost || 0), margin + finWidth - 3, y + 9.5, { align: 'right' });

  doc.text('Peças & Materiais:', margin + 3, y + 14);
  doc.text(formatCurrency((val.partsCost || 0) + (val.materialsCost || 0)), margin + finWidth - 3, y + 14, { align: 'right' });

  doc.text('Serviços Terceiros & Recursos:', margin + 3, y + 18.5);
  doc.text(formatCurrency((val.servicesCost || 0) + (val.resourcesCost || 0)), margin + finWidth - 3, y + 18.5, { align: 'right' });

  doc.text('Deslocamento / Logística:', margin + 3, y + 23);
  doc.text(formatCurrency(travelCost), margin + finWidth - 3, y + 23, { align: 'right' });

  doc.text('Subtotal Operacional:', margin + 3, y + 27.5);
  doc.text(formatCurrency(subtotalCost), margin + finWidth - 3, y + 27.5, { align: 'right' });

  doc.text(`Tributos (${val.taxPercent ? val.taxPercent + '%' : 'Inclusos'}):`, margin + 3, y + 32);
  doc.text(formatCurrency(taxAmount), margin + finWidth - 3, y + 32, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL GERAL:', margin + 3, y + 37.5);
  doc.text(formatCurrency(val.totalCost || 0), margin + finWidth - 3, y + 37.5, { align: 'right' });

  // Signature Boxes
  const sigX = margin + finWidth + 6;
  const sigWidth = contentWidth - finWidth - 6;

  doc.setFillColor(255, 255, 255);
  doc.rect(sigX, y, sigWidth, 40, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(sigX, y, sigWidth, 40, 'S');

  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Declaro a conformidade técnica dos serviços executados.', sigX + 3, y + 4.5);

  doc.setDrawColor(15, 23, 42);
  doc.line(sigX + 4, y + 17, sigX + sigWidth - 4, y + 17);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Responsável Técnico / Executante', sigX + (sigWidth / 2), y + 21, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(String(order.responsibleName || 'T&A Industrial Service'), sigX + (sigWidth / 2), y + 25, { align: 'center' });

  doc.line(sigX + 4, y + 33, sigX + sigWidth - 4, y + 33);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Aprovação & Aceite do Cliente', sigX + (sigWidth / 2), y + 36.5, { align: 'center' });

  // Add Page Numbers & Footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `T&A Industrial Service — OS: ${order.orderNumber || ''} — Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
      margin,
      pageHeight - 6
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 6,
      { align: 'right' }
    );
  }

  // Save PDF
  doc.save(`${order.orderNumber || 'Ordem_de_Servico'}_TA_Industrial.pdf`);
}

export function exportWorkOrdersToCSV(orders: any[]): void {
  const flattened = orders.map(o => ({
    'Número OS': o.orderNumber,
    'Data': formatDate(o.date),
    'Prazo': formatDate(o.deadlineDate || ''),
    'Status': o.status,
    'Tipo': o.type,
    'Prioridade': o.priority,
    'Código Equipamento': o.equipmentCode,
    'Equipamento': o.equipmentName,
    'Setor': o.department,
    'Responsável': o.responsibleName || '',
    'Descrição': o.description,
    'Custo Total (R$)': o.values?.totalCost || 0,
    'Custo Mão de Obra (R$)': o.values?.laborCost || 0,
    'Custo Materiais (R$)': o.values?.materialsCost || 0
  }));
  exportToCSV(flattened, `relatorio_ordens_servico_${new Date().toISOString().split('T')[0]}`);
}

export function exportWorkOrdersToExcel(orders: any[]): void {
  const flattened = orders.map(o => ({
    'Número OS': o.orderNumber,
    'Data': formatDate(o.date),
    'Prazo': formatDate(o.deadlineDate || ''),
    'Status': o.status,
    'Tipo': o.type,
    'Prioridade': o.priority,
    'Código Equipamento': o.equipmentCode,
    'Equipamento': o.equipmentName,
    'Setor': o.department,
    'Responsável': o.responsibleName || '',
    'Descrição': o.description,
    'Custo Total (R$)': o.values?.totalCost || 0,
    'Custo Mão de Obra (R$)': o.values?.laborCost || 0,
    'Custo Materiais (R$)': o.values?.materialsCost || 0
  }));
  exportToExcel(flattened, 'Ordens de Serviço', `relatorio_ordens_servico_${new Date().toISOString().split('T')[0]}`);
}

export function printWorkOrdersList(orders: any[]): void {
  const headers = ['OS', 'Data', 'Equipamento', 'Tipo', 'Status', 'Prioridade', 'Custo Total'];
  const rows = orders.map(o => [
    o.orderNumber,
    formatDate(o.date),
    `${o.equipmentCode} - ${o.equipmentName}`,
    o.type,
    o.status,
    o.priority,
    formatCurrency(o.values?.totalCost)
  ]);
  exportToPDF(
    'Relatório Geral de Ordens de Serviço',
    `Total de ${orders.length} ordens registradas`,
    headers,
    rows,
    `relatorio_os_${new Date().toISOString().split('T')[0]}`
  );
}
