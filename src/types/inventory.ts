export interface Supplier {
  id: string;
  companyName?: string; // Razão Social
  legalName?: string;
  tradeName: string;   // Nome Fantasia
  cnpj: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  contactPerson?: string;
  contactName?: string;
  status?: 'Ativo' | 'Inativo';
  active?: boolean;
  isApproved?: boolean;
  categoriesSupplied?: string[];
  category?: string;
  rating?: number;
  notes?: string;
  createdAt: string;
}

export type MovementType = 'Entrada' | 'Saída' | 'Ajuste' | 'Baixa OS' | 'Devolução';

export interface Part {
  id: string;
  code: string; // Ex: "ROL-6205-2RS"
  name: string;
  description?: string;
  category: 'Peças' | 'Materiais' | 'Consumíveis' | 'Ferramentas' | 'EPI' | 'Lubrificantes' | string;
  unit: 'UN' | 'KG' | 'L' | 'M' | 'CX' | 'PAR' | 'KIT' | string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  location: string; // Ex: "Prateleira A-04"
  supplierId?: string;
  supplierName?: string;
  compatibleEquipmentIds?: string[];
  status: 'Normal' | 'Estoque Baixo' | 'Crítico' | 'Sem Estoque' | string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  partId: string;
  partCode: string;
  partName: string;
  type: MovementType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  previousStock?: number;
  newStock?: number;
  workOrderId?: string;
  workOrderNumber?: string;
  reason?: string;
  notes?: string;
  responsibleName?: string;
  requesterName?: string;
  date: string;
  time: string;
}
