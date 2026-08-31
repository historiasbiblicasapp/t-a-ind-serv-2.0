export type EquipmentStatus = 'Operacional' | 'Em Manutenção' | 'Parado' | 'Em Inspeção' | 'Desativado';

export interface Equipment {
  id: string;
  code: string; // Ex: "EQ-CNC-01"
  tag?: string;
  patrimonyNumber?: string; // Ex: "PAT-88492"
  name: string;
  category: string; // Ex: "Usinagem", "Caldeiraria", "Elétrica", "Compressores", "Transporte"
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  manufacturingYear?: number;
  installationDate?: string;
  hourMeterHours?: number;
  company: string;
  unit: string;
  department: string; // Setor
  area: string;
  location?: string;
  status: EquipmentStatus;
  acquisitionDate?: string;
  warrantyExpiration?: string;
  qrCodeData: string;
  criticality: 'Alta' | 'Média' | 'Baixa' | 'A' | 'B' | 'C';
  specifications?: Record<string, string>;
  observations?: string;
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
}
