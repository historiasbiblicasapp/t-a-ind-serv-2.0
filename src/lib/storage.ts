import {
  WorkOrder,
  Equipment,
  MaintenancePlan,
  Part,
  InventoryMovement,
  Employee,
  Position,
  Supplier,
  User,
  SystemNotification,
  AuditLog,
  Company,
  OperationalUnit,
  Department,
  WorkArea
} from '../types';

import {
  INITIAL_COMPANIES,
  INITIAL_UNITS,
  INITIAL_DEPARTMENTS,
  INITIAL_AREAS,
  INITIAL_POSITIONS,
  INITIAL_EMPLOYEES,
  INITIAL_USERS,
  INITIAL_EQUIPMENT,
  INITIAL_PARTS,
  INITIAL_SUPPLIERS,
  INITIAL_PREVENTIVE_PLANS,
  INITIAL_WORK_ORDERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from './initialData';

const STORAGE_KEY_PREFIX = 'tes_manutencao_';

function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error loading ${key} from storage, using fallback:`, err);
    return fallback;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export class AppStorage {
  static getCompanies(): Company[] {
    return getStorageItem('companies', INITIAL_COMPANIES);
  }
  static setCompanies(data: Company[]): void {
    setStorageItem('companies', data);
  }

  static getUnits(): OperationalUnit[] {
    return getStorageItem('units', INITIAL_UNITS);
  }
  static setUnits(data: OperationalUnit[]): void {
    setStorageItem('units', data);
  }

  static getDepartments(): Department[] {
    return getStorageItem('departments', INITIAL_DEPARTMENTS);
  }
  static setDepartments(data: Department[]): void {
    setStorageItem('departments', data);
  }

  static getAreas(): WorkArea[] {
    return getStorageItem('areas', INITIAL_AREAS);
  }
  static setAreas(data: WorkArea[]): void {
    setStorageItem('areas', data);
  }

  static getPositions(): Position[] {
    return getStorageItem('positions', INITIAL_POSITIONS);
  }
  static setPositions(data: Position[]): void {
    setStorageItem('positions', data);
  }

  static getEmployees(): Employee[] {
    return getStorageItem('employees', INITIAL_EMPLOYEES);
  }
  static setEmployees(data: Employee[]): void {
    setStorageItem('employees', data);
  }

  static getUsers(): User[] {
    return getStorageItem('users', INITIAL_USERS);
  }
  static setUsers(data: User[]): void {
    setStorageItem('users', data);
  }

  static getEquipment(): Equipment[] {
    return getStorageItem('equipment', INITIAL_EQUIPMENT);
  }
  static setEquipment(data: Equipment[]): void {
    setStorageItem('equipment', data);
  }

  static getParts(): Part[] {
    return getStorageItem('parts', INITIAL_PARTS);
  }
  static setParts(data: Part[]): void {
    setStorageItem('parts', data);
  }

  static getMovements(): InventoryMovement[] {
    return getStorageItem('movements', []);
  }
  static setMovements(data: InventoryMovement[]): void {
    setStorageItem('movements', data);
  }

  static getSuppliers(): Supplier[] {
    return getStorageItem('suppliers', INITIAL_SUPPLIERS);
  }
  static setSuppliers(data: Supplier[]): void {
    setStorageItem('suppliers', data);
  }

  static getPreventivePlans(): MaintenancePlan[] {
    return getStorageItem('preventive_plans', INITIAL_PREVENTIVE_PLANS);
  }
  static setPreventivePlans(data: MaintenancePlan[]): void {
    setStorageItem('preventive_plans', data);
  }

  static getWorkOrders(): WorkOrder[] {
    return getStorageItem('work_orders', INITIAL_WORK_ORDERS);
  }
  static setWorkOrders(data: WorkOrder[]): void {
    setStorageItem('work_orders', data);
  }

  static getNotifications(): SystemNotification[] {
    return getStorageItem('notifications', INITIAL_NOTIFICATIONS);
  }
  static setNotifications(data: SystemNotification[]): void {
    setStorageItem('notifications', data);
  }

  static getAuditLogs(): AuditLog[] {
    return getStorageItem('audit_logs', INITIAL_AUDIT_LOGS);
  }
  static setAuditLogs(data: AuditLog[]): void {
    setStorageItem('audit_logs', data);
  }

  static resetToDefault(): void {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
  }

  static exportFullBackupJSON(): string {
    const backup = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      companies: this.getCompanies(),
      units: this.getUnits(),
      departments: this.getDepartments(),
      areas: this.getAreas(),
      positions: this.getPositions(),
      employees: this.getEmployees(),
      users: this.getUsers(),
      equipment: this.getEquipment(),
      parts: this.getParts(),
      movements: this.getMovements(),
      suppliers: this.getSuppliers(),
      preventivePlans: this.getPreventivePlans(),
      workOrders: this.getWorkOrders(),
      notifications: this.getNotifications(),
      auditLogs: this.getAuditLogs()
    };
    return JSON.stringify(backup, null, 2);
  }

  static importBackupJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.workOrders) this.setWorkOrders(data.workOrders);
      if (data.equipment) this.setEquipment(data.equipment);
      if (data.employees) this.setEmployees(data.employees);
      if (data.positions) this.setPositions(data.positions);
      if (data.parts) this.setParts(data.parts);
      if (data.suppliers) this.setSuppliers(data.suppliers);
      if (data.preventivePlans) this.setPreventivePlans(data.preventivePlans);
      if (data.auditLogs) this.setAuditLogs(data.auditLogs);
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }
}
