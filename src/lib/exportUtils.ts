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
