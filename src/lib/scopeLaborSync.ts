import { WorkOrderScope, WorkOrderLabor, Employee, Position } from '../types';
import { generateUUID } from './utils';

/**
 * REGRA ESPECIAL OBRIGATÓRIA: ESCOPO → MÃO DE OBRA
 * 
 * Regra:
 * 1. Cada item do Escopo (Nº itemNumber e Qtd Pessoas peopleCount) sincroniza automaticamente
 *    com a tabela de Mão de Obra (Item itemNumber e Qtd quantity).
 * 2. Quando um funcionário é associado ou selecionado, seu cargo (Cargo) e valor hora
 *    são preenchidos automaticamente com base no cadastro de Funcionários e Cargos (cargo_id).
 */
export function syncScopeToLabor(
  scopes: WorkOrderScope[],
  currentLabors: WorkOrderLabor[],
  employees: Employee[],
  positions: Position[]
): WorkOrderLabor[] {
  const updatedLabors: WorkOrderLabor[] = [];

  scopes.forEach((scope, index) => {
    // Busca registro existente de mão de obra para este número de item ou posição
    const existingLabor = currentLabors.find(l => l.itemNumber === scope.itemNumber) || currentLabors[index];

    let employeeId = existingLabor?.employeeId || '';
    let employeeName = existingLabor?.employeeName || '';
    let positionId = existingLabor?.positionId || '';
    let positionName = existingLabor?.positionName || '';
    let hourlyRate = existingLabor?.hourlyRate || 0;
    const hours = existingLabor?.hours ?? 4.0;
    const quantity = scope.peopleCount > 0 ? scope.peopleCount : 1;

    // Se houver responsável no escopo e nenhum funcionário selecionado ainda
    if (!employeeId && scope.responsibleId) {
      const respEmp = employees.find(e => e.id === scope.responsibleId);
      if (respEmp) {
        employeeId = respEmp.id;
        employeeName = respEmp.name;
        positionId = respEmp.cargo_id;
        positionName = respEmp.positionName;
        hourlyRate = respEmp.hourlyRate;
      }
    }

    // Se houver funcionário selecionado, garante que o cargo_id e nome do cargo estejam sincronizados
    if (employeeId) {
      const emp = employees.find(e => e.id === employeeId);
      if (emp) {
        employeeName = emp.name;
        positionId = emp.cargo_id;
        positionName = emp.positionName;
        if (hourlyRate <= 0) {
          hourlyRate = emp.hourlyRate;
        }
      }
    }

    // Se ainda não tiver valor hora, tenta buscar pelo cargo
    if (positionId && hourlyRate <= 0) {
      const pos = positions.find(p => p.id === positionId);
      if (pos) {
        positionName = pos.name;
        hourlyRate = pos.baseHourlyRate;
      }
    }

    const totalValue = quantity * hours * hourlyRate;

    updatedLabors.push({
      id: existingLabor?.id || generateUUID(),
      itemNumber: scope.itemNumber || String(index + 1).padStart(3, '0'),
      quantity: quantity,
      employeeId,
      employeeName,
      positionId,
      positionName: positionName || 'Técnico Especialista',
      hours,
      hourlyRate,
      totalValue
    });
  });

  return updatedLabors;
}

/**
 * Encontra o cargo e taxa horária automaticamente a partir do Funcionário
 */
export function getEmployeePositionDetails(
  employeeId: string,
  employees: Employee[],
  positions: Position[]
): {
  positionId: string;
  positionName: string;
  hourlyRate: number;
} {
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) {
    return { positionId: '', positionName: '', hourlyRate: 0 };
  }

  let positionName = emp.positionName;
  let hourlyRate = emp.hourlyRate;

  if (emp.cargo_id) {
    const pos = positions.find(p => p.id === emp.cargo_id);
    if (pos) {
      positionName = pos.name;
      if (!hourlyRate) hourlyRate = pos.baseHourlyRate;
    }
  }

  return {
    positionId: emp.cargo_id,
    positionName: positionName || 'Não especificado',
    hourlyRate: hourlyRate || 75.0
  };
}
