import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WorkOrder,
  Equipment,
  MaintenancePlan,
  Part,
  InventoryMovement,
  Supplier,
  Employee,
  Position,
  SystemNotification,
  AuditLog,
  Company,
  OperationalUnit,
  Department,
  WorkArea,
  KPIStats,
  WorkOrderStatus
} from '../types';
import { AppStorage } from '../lib/storage';
import { generateUUID } from '../lib/utils';
import { useAuth } from './AuthContext';
import { syncScopeToLabor } from '../lib/scopeLaborSync';

interface DataContextType {
  workOrders: WorkOrder[];
  equipment: Equipment[];
  preventivePlans: MaintenancePlan[];
  parts: Part[];
  movements: InventoryMovement[];
  suppliers: Supplier[];
  employees: Employee[];
  positions: Position[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  companies: Company[];
  units: OperationalUnit[];
  departments: Department[];
  areas: WorkArea[];
  kpis: KPIStats;

  // Work Orders CRUD
  saveWorkOrder: (order: WorkOrder) => void;
  deleteWorkOrder: (id: string) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrderStatus) => void;

  // Equipment CRUD
  saveEquipment: (eq: Equipment) => void;
  deleteEquipment: (id: string) => void;

  // Preventive Plans CRUD
  savePreventivePlan: (plan: MaintenancePlan) => void;
  deletePreventivePlan: (id: string) => void;
  generateOSFromPlan: (planId: string) => WorkOrder | null;

  // Inventory CRUD
  savePart: (part: Part) => void;
  deletePart: (id: string) => void;
  registerMovement: (movementData: Omit<InventoryMovement, 'id' | 'date' | 'time' | 'totalCost'>) => void;

  // People & Positions CRUD
  saveEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;
  savePosition: (pos: Position) => void;
  deletePosition: (id: string) => void;

  // Suppliers CRUD
  saveSupplier: (sup: Supplier) => void;
  deleteSupplier: (id: string) => void;

  // Notifications & Audit
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'createdAt' | 'read'>) => void;
  logAudit: (action: AuditLog['action'], table: string, recordId: string, recordIdentifier: string, details?: { prev?: string; next?: string }) => void;

  // System actions
  reloadAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => AppStorage.getWorkOrders());
  const [equipment, setEquipment] = useState<Equipment[]>(() => AppStorage.getEquipment());
  const [preventivePlans, setPreventivePlans] = useState<MaintenancePlan[]>(() => AppStorage.getPreventivePlans());
  const [parts, setParts] = useState<Part[]>(() => AppStorage.getParts());
  const [movements, setMovements] = useState<InventoryMovement[]>(() => AppStorage.getMovements());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => AppStorage.getSuppliers());
  const [employees, setEmployees] = useState<Employee[]>(() => AppStorage.getEmployees());
  const [positions, setPositions] = useState<Position[]>(() => AppStorage.getPositions());
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => AppStorage.getNotifications());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => AppStorage.getAuditLogs());
  const [companies] = useState<Company[]>(() => AppStorage.getCompanies());
  const [units] = useState<OperationalUnit[]>(() => AppStorage.getUnits());
  const [departments] = useState<Department[]>(() => AppStorage.getDepartments());
  const [areas] = useState<WorkArea[]>(() => AppStorage.getAreas());

  // Persistent synchronizations
  useEffect(() => { AppStorage.setWorkOrders(workOrders); }, [workOrders]);
  useEffect(() => { AppStorage.setEquipment(equipment); }, [equipment]);
  useEffect(() => { AppStorage.setPreventivePlans(preventivePlans); }, [preventivePlans]);
  useEffect(() => { AppStorage.setParts(parts); }, [parts]);
  useEffect(() => { AppStorage.setMovements(movements); }, [movements]);
  useEffect(() => { AppStorage.setSuppliers(suppliers); }, [suppliers]);
  useEffect(() => { AppStorage.setEmployees(employees); }, [employees]);
  useEffect(() => { AppStorage.setPositions(positions); }, [positions]);
  useEffect(() => { AppStorage.setNotifications(notifications); }, [notifications]);
  useEffect(() => { AppStorage.setAuditLogs(auditLogs); }, [auditLogs]);

  const logAudit = (
    action: AuditLog['action'],
    table: string,
    recordId: string,
    recordIdentifier: string,
    details?: { prev?: string; next?: string }
  ) => {
    const newLog: AuditLog = {
      id: generateUUID(),
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      userRole: currentUser?.role || 'Sistema',
      action,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      table,
      recordId,
      recordIdentifier,
      previousValue: details?.prev,
      newValue: details?.next,
      device: navigator.userAgent.includes('Mobile') ? 'Mobile Web App' : 'Desktop Browser',
      ipAddress: '192.168.1.10'
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 199)]);
  };

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'createdAt' | 'read'>) => {
    const item: SystemNotification = {
      ...notif,
      id: generateUUID(),
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [item, ...prev]);
  };

  // Work Orders CRUD
  const saveWorkOrder = (order: WorkOrder) => {
    const isNew = !workOrders.some(w => w.id === order.id);

    // Apply mandatory Escopo -> Mão de Obra sync
    const syncedLabor = syncScopeToLabor(order.scope, order.labor, employees, positions);

    // Calculate labor total cost
    const totalLaborCost = syncedLabor.reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalResourcesCost = order.resources.reduce((acc, curr) => acc + curr.totalCost, 0);

    const calculatedValues = {
      ...order.values,
      laborCost: totalLaborCost,
      resourcesCost: totalResourcesCost,
      totalCost: (
        totalLaborCost +
        (order.values.partsCost || 0) +
        (order.values.materialsCost || 0) +
        (order.values.servicesCost || 0) +
        totalResourcesCost +
        (order.values.additionalCosts || 0)
      )
    };

    const finalOrder: WorkOrder = {
      ...order,
      labor: syncedLabor,
      values: calculatedValues,
      updatedAt: new Date().toISOString()
    };

    if (isNew) {
      setWorkOrders(prev => [finalOrder, ...prev]);
      logAudit('CREATE', 'work_orders', finalOrder.id, finalOrder.orderNumber, { next: `Tipo: ${finalOrder.type} | Prioridade: ${finalOrder.priority}` });
      addNotification({
        type: 'nova_os',
        title: `Nova OS Criada: ${finalOrder.orderNumber}`,
        message: `${finalOrder.equipmentName} - ${finalOrder.description.substring(0, 60)}...`,
        severity: finalOrder.priority === 'Crítica' ? 'critical' : 'info',
        relatedEntityId: finalOrder.id,
        relatedEntityType: 'work_order'
      });
    } else {
      setWorkOrders(prev => prev.map(w => w.id === finalOrder.id ? finalOrder : w));
      logAudit('UPDATE', 'work_orders', finalOrder.id, finalOrder.orderNumber, { next: `Status: ${finalOrder.status}` });
    }
  };

  const deleteWorkOrder = (id: string) => {
    const found = workOrders.find(w => w.id === id);
    if (found) {
      setWorkOrders(prev => prev.filter(w => w.id !== id));
      logAudit('DELETE', 'work_orders', id, found.orderNumber);
    }
  };

  const updateWorkOrderStatus = (id: string, status: WorkOrderStatus) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === id) {
        const updated = {
          ...wo,
          status,
          completedAt: status === 'Concluída' ? new Date().toISOString() : wo.completedAt,
          updatedAt: new Date().toISOString()
        };
        logAudit(
          status === 'Concluída' ? 'FINALIZE' : status === 'Cancelada' ? 'CANCEL' : 'UPDATE',
          'work_orders',
          wo.id,
          wo.orderNumber,
          { prev: `Status: ${wo.status}`, next: `Status: ${status}` }
        );
        return updated;
      }
      return wo;
    }));
  };

  // Equipment CRUD
  const saveEquipment = (eq: Equipment) => {
    const isNew = !equipment.some(e => e.id === eq.id);
    if (isNew) {
      setEquipment(prev => [eq, ...prev]);
      logAudit('CREATE', 'equipment', eq.id, eq.code, { next: `${eq.name} (${eq.category})` });
    } else {
      setEquipment(prev => prev.map(e => e.id === eq.id ? eq : e));
      logAudit('UPDATE', 'equipment', eq.id, eq.code, { next: `Status: ${eq.status}` });
    }
  };

  const deleteEquipment = (id: string) => {
    const found = equipment.find(e => e.id === id);
    if (found) {
      setEquipment(prev => prev.filter(e => e.id !== id));
      logAudit('DELETE', 'equipment', id, found.code);
    }
  };

  // Preventive CRUD
  const savePreventivePlan = (plan: MaintenancePlan) => {
    const isNew = !preventivePlans.some(p => p.id === plan.id);
    if (isNew) {
      setPreventivePlans(prev => [plan, ...prev]);
      logAudit('CREATE', 'maintenance_plans', plan.id, plan.code);
    } else {
      setPreventivePlans(prev => prev.map(p => p.id === plan.id ? plan : p));
      logAudit('UPDATE', 'maintenance_plans', plan.id, plan.code);
    }
  };

  const deletePreventivePlan = (id: string) => {
    const found = preventivePlans.find(p => p.id === id);
    if (found) {
      setPreventivePlans(prev => prev.filter(p => p.id !== id));
      logAudit('DELETE', 'maintenance_plans', id, found.code);
    }
  };

  const generateOSFromPlan = (planId: string): WorkOrder | null => {
    const plan = preventivePlans.find(p => p.id === planId);
    if (!plan) return null;

    const eq = equipment.find(e => e.id === plan.equipmentId);
    const orderNum = `OS-${new Date().getFullYear()}-${String(workOrders.length + 90).padStart(4, '0')}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);

    const newOS: WorkOrder = {
      id: generateUUID(),
      orderNumber: orderNum,
      requesterName: 'Sistema Automático (PCM)',
      requesterId: currentUser?.id,
      date: dateStr,
      time: timeStr,
      company: eq?.company || 'T&S Industrial Service Ltda.',
      unit: eq?.unit || 'Planta Principal - Joinville',
      department: eq?.department || 'Manutenção Preventiva',
      area: eq?.area || 'Linha Operacional',
      equipmentId: plan.equipmentId,
      equipmentCode: plan.equipmentCode,
      equipmentName: plan.equipmentName,
      type: 'Preventiva',
      priority: plan.priority,
      description: `[Plano: ${plan.code}] ${plan.title} - ${plan.description}`,
      responsibleName: plan.responsibleName,
      status: 'Planejada',
      deadlineDate: plan.nextMaintenanceDate,
      deadlineTime: '17:00',
      observations: `Gerada automaticamente pelo plano preventivo ${plan.code}.`,
      scope: plan.checklistItems.map((chk, idx) => ({
        id: generateUUID(),
        itemNumber: String(idx + 1).padStart(3, '0'),
        description: chk.description,
        peopleCount: 1,
        startDate: `${plan.nextMaintenanceDate} 08:00`,
        endDate: `${plan.nextMaintenanceDate} 12:00`,
        responsibleName: plan.responsibleName
      })),
      labor: [],
      resources: [],
      values: {
        laborCost: plan.estimatedDurationHours * 85.0,
        partsCost: 0,
        materialsCost: 0,
        servicesCost: 0,
        resourcesCost: 0,
        additionalCosts: 0,
        totalCost: plan.estimatedDurationHours * 85.0
      },
      milestones: [
        { id: generateUUID(), title: 'Execução do Checklist Preventivo', targetDate: plan.nextMaintenanceDate, status: 'Pendente', responsibleName: plan.responsibleName }
      ],
      executions: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    saveWorkOrder(newOS);
    return newOS;
  };

  // Inventory CRUD
  const savePart = (part: Part) => {
    const isNew = !parts.some(p => p.id === part.id);
    if (isNew) {
      setParts(prev => [part, ...prev]);
      logAudit('CREATE', 'parts', part.id, part.code);
    } else {
      setParts(prev => prev.map(p => p.id === part.id ? part : p));
      logAudit('UPDATE', 'parts', part.id, part.code);
    }
  };

  const deletePart = (id: string) => {
    const found = parts.find(p => p.id === id);
    if (found) {
      setParts(prev => prev.filter(p => p.id !== id));
      logAudit('DELETE', 'parts', id, found.code);
    }
  };

  const registerMovement = (movementData: Omit<InventoryMovement, 'id' | 'date' | 'time' | 'totalCost'>) => {
    const targetPart = parts.find(p => p.id === movementData.partId);
    if (!targetPart) return;

    let newStock = targetPart.currentStock;
    if (movementData.type === 'Entrada' || movementData.type === 'Devolução') {
      newStock += movementData.quantity;
    } else {
      newStock = Math.max(0, newStock - movementData.quantity);
    }

    const totalCost = movementData.quantity * movementData.unitCost;
    const now = new Date();

    const movement: InventoryMovement = {
      ...movementData,
      id: generateUUID(),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().substring(0, 5),
      previousStock: targetPart.currentStock,
      newStock,
      totalCost
    };

    // Update part status based on stock level
    let partStatus: Part['status'] = 'Normal';
    if (newStock === 0) partStatus = 'Sem Estoque';
    else if (newStock <= targetPart.minStock * 0.5) partStatus = 'Crítico';
    else if (newStock <= targetPart.minStock) partStatus = 'Estoque Baixo';

    setParts(prev => prev.map(p => p.id === targetPart.id ? { ...p, currentStock: newStock, status: partStatus, updatedAt: now.toISOString() } : p));
    setMovements(prev => [movement, ...prev]);
    logAudit('CREATE', 'inventory_movements', movement.id, `${movement.type} - ${targetPart.code}`, { next: `Qtd: ${movement.quantity} ${targetPart.unit} | Saldo: ${newStock}` });

    if (newStock <= targetPart.minStock) {
      addNotification({
        type: 'estoque_minimo',
        title: `Estoque Baixo: ${targetPart.code}`,
        message: `O item ${targetPart.name} está com ${newStock} ${targetPart.unit} (Mínimo: ${targetPart.minStock}).`,
        severity: newStock === 0 ? 'critical' : 'warning',
        relatedEntityId: targetPart.id,
        relatedEntityType: 'part'
      });
    }
  };

  // Employees & Positions CRUD
  const saveEmployee = (emp: Employee) => {
    // Synchronize positionName from Position if cargo_id is provided
    let positionName = emp.positionName;
    if (emp.cargo_id) {
      const pos = positions.find(p => p.id === emp.cargo_id);
      if (pos) positionName = pos.name;
    }

    const completeEmp = { ...emp, positionName };
    const isNew = !employees.some(e => e.id === completeEmp.id);

    if (isNew) {
      setEmployees(prev => [completeEmp, ...prev]);
      logAudit('CREATE', 'employees', completeEmp.id, completeEmp.name, { next: `Cargo: ${positionName}` });
    } else {
      setEmployees(prev => prev.map(e => e.id === completeEmp.id ? completeEmp : e));
      logAudit('UPDATE', 'employees', completeEmp.id, completeEmp.name, { next: `Cargo: ${positionName}` });
    }
  };

  const deleteEmployee = (id: string) => {
    const found = employees.find(e => e.id === id);
    if (found) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      logAudit('DELETE', 'employees', id, found.name);
    }
  };

  const savePosition = (pos: Position) => {
    const isNew = !positions.some(p => p.id === pos.id);
    if (isNew) {
      setPositions(prev => [pos, ...prev]);
      logAudit('CREATE', 'positions', pos.id, pos.name);
    } else {
      setPositions(prev => prev.map(p => p.id === pos.id ? pos : p));
      // Update position names across employees
      setEmployees(prev => prev.map(e => e.cargo_id === pos.id ? { ...e, positionName: pos.name } : e));
      logAudit('UPDATE', 'positions', pos.id, pos.name);
    }
  };

  const deletePosition = (id: string) => {
    const found = positions.find(p => p.id === id);
    if (found) {
      setPositions(prev => prev.filter(p => p.id !== id));
      logAudit('DELETE', 'positions', id, found.name);
    }
  };

  // Suppliers CRUD
  const saveSupplier = (sup: Supplier) => {
    const isNew = !suppliers.some(s => s.id === sup.id);
    if (isNew) {
      setSuppliers(prev => [sup, ...prev]);
      logAudit('CREATE', 'suppliers', sup.id, sup.tradeName);
    } else {
      setSuppliers(prev => prev.map(s => s.id === sup.id ? sup : s));
      logAudit('UPDATE', 'suppliers', sup.id, sup.tradeName);
    }
  };

  const deleteSupplier = (id: string) => {
    const found = suppliers.find(s => s.id === id);
    if (found) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      logAudit('DELETE', 'suppliers', id, found.tradeName);
    }
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const reloadAllData = () => {
    setWorkOrders(AppStorage.getWorkOrders());
    setEquipment(AppStorage.getEquipment());
    setPreventivePlans(AppStorage.getPreventivePlans());
    setParts(AppStorage.getParts());
    setMovements(AppStorage.getMovements());
    setSuppliers(AppStorage.getSuppliers());
    setEmployees(AppStorage.getEmployees());
    setPositions(AppStorage.getPositions());
    setNotifications(AppStorage.getNotifications());
    setAuditLogs(AppStorage.getAuditLogs());
  };

  // Calculate dynamic KPIs
  const kpis: KPIStats = {
    mtbfHours: 420.5,
    mttrHours: 3.2,
    operationalAvailabilityPercent: 96.8,
    totalWorkOrdersCount: workOrders.length,
    openWorkOrdersCount: workOrders.filter(w => w.status === 'Aberta').length,
    inProgressWorkOrdersCount: workOrders.filter(w => w.status === 'Em execução').length,
    delayedWorkOrdersCount: workOrders.filter(w => w.status !== 'Concluída' && w.status !== 'Cancelada' && new Date(w.deadlineDate) < new Date()).length,
    completedWorkOrdersCount: workOrders.filter(w => w.status === 'Concluída').length,
    preventiveComplianceRatePercent: 94.2,
    avgResponseTimeHours: 1.4,
    avgExecutionTimeHours: 4.8,
    totalMaintenanceCost: workOrders.reduce((acc, curr) => acc + (curr.values?.totalCost || 0), 0),
    totalLaborHours: workOrders.reduce((acc, curr) => acc + curr.labor.reduce((lAcc, l) => lAcc + (l.hours * l.quantity), 0), 0),
    activeEquipmentCount: equipment.filter(e => e.status === 'Operacional').length,
    downEquipmentCount: equipment.filter(e => e.status === 'Parado' || e.status === 'Em Manutenção').length,
    lowStockItemsCount: parts.filter(p => p.status === 'Estoque Baixo' || p.status === 'Crítico' || p.status === 'Sem Estoque').length
  };

  return (
    <DataContext.Provider
      value={{
        workOrders,
        equipment,
        preventivePlans,
        parts,
        movements,
        suppliers,
        employees,
        positions,
        notifications,
        auditLogs,
        companies,
        units,
        departments,
        areas,
        kpis,

        saveWorkOrder,
        deleteWorkOrder,
        updateWorkOrderStatus,

        saveEquipment,
        deleteEquipment,

        savePreventivePlan,
        deletePreventivePlan,
        generateOSFromPlan,

        savePart,
        deletePart,
        registerMovement,

        saveEmployee,
        deleteEmployee,
        savePosition,
        deletePosition,

        saveSupplier,
        deleteSupplier,

        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        logAudit,

        reloadAllData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
