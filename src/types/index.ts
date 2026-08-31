export * from './auth';
export * from './workOrder';
export * from './equipment';
export * from './preventive';
export * from './inventory';
export * from './organizational';
export * from './reports';

export type PageId = 
  | 'dashboard'
  | 'work-orders'
  | 'equipment'
  | 'maintenance'
  | 'planning'
  | 'inventory'
  | 'people'
  | 'suppliers'
  | 'reports'
  | 'indicators'
  | 'settings';
