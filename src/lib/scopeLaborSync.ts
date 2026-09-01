import { WorkOrderScope, WorkOrderLabor, Employee, Position } from '../types';
import { generateUUID } from './utils';

/**
 * SINCRONIZAÇÃO ESCOPO → MÃO DE OBRA
 * 
 * Regra:
 * 1. Preserva todos os técnicos já alocados manualmente.
 * 2. Quando um novo item de escopo possui responsável técnico definido, 
 *    cria automaticamente o registro de mão de obra vinculado ao item do escopo.
 * 3. Garante que os cargos e valores-hora venham sempre sincronizados com os dados reais dos Funcionários e Cargos.
 */
export function syncScopeToLabor(
  scopes: WorkOrderScope[],
  currentLabors: WorkOrderLabor[],
  employees: Employee[],
  positions: Position[]
): WorkOrderLabor[] {
  const resultLabors: WorkOrderLabor[] = [...(currentLabors || [])];

  (scopes || []).forEach((scope, index) => {
    const itemNum = scope.itemNumber || String(index + 1).padStart(3, '0');
    const existingIndex = resultLabors.findIndex(l => l.itemNumber === itemNum);

    // Se já existe um labor para este item, atualiza a descrição da atividade vinculada se faltar
    if (existingIndex >= 0) {
      if (!resultLabors[existingIndex].activityDescription) {
        resultLabors[existingIndex].activityDescription = scope.description;
      }
    } else if (scope.responsibleId) {
      // Se não existe e o escopo possui técnico responsável indicado
      const { positionName, hourlyRate, positionId } = getEmployeePositionDetails(
        scope.responsibleId,
        employees,
        positions
      );
      const emp = employees.find(e => e.id === scope.responsibleId);
      const hours = 4.0;
      const qty = scope.peopleCount > 0 ? scope.peopleCount : 1;

      resultLabors.push({
        id: generateUUID(),
        itemNumber: itemNum,
        activityDescription: scope.description,
        quantity: qty,
        employeeId: scope.responsibleId,
        employeeName: emp?.name || scope.responsibleName || 'Técnico Especialista',
        positionId,
        positionName,
        hours,
        hourlyRate,
        totalValue: qty * hours * hourlyRate
      });
    }
  });

  return resultLabors;
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
    return { positionId: '', positionName: 'Técnico Especialista', hourlyRate: 75.0 };
  }

  let positionName = emp.positionName;
  let hourlyRate = emp.hourlyRate;
  const cargoId = emp.cargo_id || (emp as any).positionId || '';

  if (cargoId) {
    const pos = positions.find(p => p.id === cargoId);
    if (pos) {
      if (!positionName) positionName = pos.name;
      if (!hourlyRate || hourlyRate <= 0) {
        hourlyRate = pos.baseHourlyRate || pos.defaultHourlyRate || 75.0;
      }
    }
  }

  return {
    positionId: cargoId,
    positionName: positionName || 'Técnico Especialista',
    hourlyRate: hourlyRate || 75.0
  };
}

