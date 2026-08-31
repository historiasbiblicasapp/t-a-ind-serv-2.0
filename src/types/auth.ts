export type UserRole = 
  | 'Administrador'
  | 'Gerente'
  | 'Supervisor'
  | 'Planejamento'
  | 'Manutenção'
  | 'Almoxarifado'
  | 'Técnico'
  | 'Operador'
  | 'Solicitante';

export type Permission = 
  | 'visualizar'
  | 'criar'
  | 'editar'
  | 'excluir'
  | 'aprovar'
  | 'finalizar'
  | 'cancelar'
  | 'exportar'
  | 'administrar';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  role: UserRole;
  company: string;
  unit: string;
  department: string;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Administrador: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'finalizar', 'cancelar', 'exportar', 'administrar'],
  Gerente: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'finalizar', 'cancelar', 'exportar'],
  Supervisor: ['visualizar', 'criar', 'editar', 'aprovar', 'finalizar', 'cancelar', 'exportar'],
  Planejamento: ['visualizar', 'criar', 'editar', 'aprovar', 'exportar'],
  Manutenção: ['visualizar', 'criar', 'editar', 'finalizar', 'exportar'],
  Almoxarifado: ['visualizar', 'criar', 'editar', 'exportar'],
  Técnico: ['visualizar', 'criar', 'editar', 'finalizar'],
  Operador: ['visualizar', 'criar'],
  Solicitante: ['visualizar', 'criar'],
};
