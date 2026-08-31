export interface Company {
  id: string;
  name: string;
  cnpj: string;
  status: 'Ativo' | 'Inativo';
}

export interface OperationalUnit {
  id: string;
  companyId: string;
  name: string;
  code: string;
  city: string;
  state: string;
}

export interface Department {
  id: string;
  unitId: string;
  name: string; // Ex: "Usinagem", "Manutenção Geral", "Caldeiraria", "Elétrica"
  code: string;
  managerName?: string;
}

export interface WorkArea {
  id: string;
  departmentId: string;
  name: string; // Ex: "Linha de Montagem A", "Subestação 02", "Pátio de Carga"
  code: string;
}

export interface Position {
  id: string;
  code: string; // Ex: "CARG-001"
  name: string; // Ex: "Eletricista Industrial", "Mecânico Montador", "Técnico Mecatrônico", "Soldador TIG"
  cbo?: string;
  description?: string;
  baseHourlyRate?: number; // R$/hora
  defaultHourlyRate?: number;
  status?: 'Ativo' | 'Inativo';
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  cpf?: string;
  registrationNumber: string; // Matrícula (ex: "MAT-2024-089")
  phone?: string;
  email?: string;
  company?: string;
  unit?: string;
  department?: string; // Setor
  area?: string;
  cargo_id?: string;   // Chave estrangeira para Position
  positionName?: string; // Nome do cargo vinculado
  hourlyRate: number;
  shift?: string;
  status?: 'Ativo' | 'Férias' | 'Afastado' | 'Inativo';
  active?: boolean;
  photoUrl?: string;
  admissionDate?: string;
  createdAt: string;
  updatedAt: string;
}
