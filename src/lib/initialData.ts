import { 
  User, 
  Position, 
  Employee, 
  Equipment, 
  WorkOrder, 
  MaintenancePlan, 
  Part, 
  Supplier, 
  SystemNotification, 
  AuditLog,
  Company,
  OperationalUnit,
  Department,
  WorkArea
} from '../types';

export const INITIAL_COMPANIES: Company[] = [
  { id: 'comp-1', name: 'T&S Industrial Service Ltda.', cnpj: '12.345.678/0001-90', status: 'Ativo' },
  { id: 'comp-2', name: 'Indústrias Metalúrgicas Brasil Ltda', cnpj: '98.765.432/0001-10', status: 'Ativo' }
];

export const INITIAL_UNITS: OperationalUnit[] = [
  { id: 'unit-1', companyId: 'comp-1', name: 'Planta Principal - Joinville', code: 'PLT-01', city: 'Joinville', state: 'SC' },
  { id: 'unit-2', companyId: 'comp-1', name: 'Unidade de Usinagem - Curitiba', code: 'PLT-02', city: 'Curitiba', state: 'PR' }
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dep-1', unitId: 'unit-1', name: 'Usinagem Pesada', code: 'SET-USI', managerName: 'Carlos Silveira' },
  { id: 'dep-2', unitId: 'unit-1', name: 'Caldeiraria & Solda', code: 'SET-CAL', managerName: 'Roberto Mendes' },
  { id: 'dep-3', unitId: 'unit-1', name: 'Montagem Eletromecânica', code: 'SET-ELM', managerName: 'Juliana Costa' },
  { id: 'dep-4', unitId: 'unit-1', name: 'Utilidades & Compressores', code: 'SET-UTL', managerName: 'Marcos Vinicius' }
];

export const INITIAL_AREAS: WorkArea[] = [
  { id: 'area-1', departmentId: 'dep-1', name: 'Linha CNC 01', code: 'AREA-CNC1' },
  { id: 'area-2', departmentId: 'dep-1', name: 'Tornos Convencionais', code: 'AREA-TRN' },
  { id: 'area-3', departmentId: 'dep-2', name: 'Célula de Solda Robotizada', code: 'AREA-SLD' },
  { id: 'area-4', departmentId: 'dep-4', name: 'Sala de Compressores e Chiller', code: 'AREA-CMP' }
];

export const INITIAL_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    code: 'CARG-001',
    name: 'Eletricista Industrial Especialista',
    description: 'Manutenção elétrica preventiva e corretiva de quadros, motores e inversores',
    baseHourlyRate: 85.0,
    status: 'Ativo',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'pos-2',
    code: 'CARG-002',
    name: 'Mecânico de Manutenção Hidráulica',
    description: 'Reparos em bombas hidráulicas, válvulas proporcionais e cilindros',
    baseHourlyRate: 90.0,
    status: 'Ativo',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'pos-3',
    code: 'CARG-003',
    name: 'Técnico Mecatrônico / Automação',
    description: 'Diagnóstico em CLPs Siemens/Rockwell, servomotores e redes industriais',
    baseHourlyRate: 110.0,
    status: 'Ativo',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'pos-4',
    code: 'CARG-004',
    name: 'Soldador Qualificado TIG/MIG',
    description: 'Recuperação estrutural, tubulações de alta pressão e caldeiraria fina',
    baseHourlyRate: 80.0,
    status: 'Ativo',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'pos-5',
    code: 'CARG-005',
    name: 'Lubrificador Técnico de Máquinas',
    description: 'Planos de relubrificação, análise de óleo e troca de filtros de sistemas',
    baseHourlyRate: 55.0,
    status: 'Ativo',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'pos-6',
    code: 'CARG-006',
    name: 'Planejador de Manutenção (PCM)',
    description: 'Dimensionamento de escopo, nivelamento de recursos e controle de paradas',
    baseHourlyRate: 95.0,
    status: 'Ativo',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'João da Silva Santos',
    cpf: '123.456.789-01',
    registrationNumber: 'MAT-2023-014',
    phone: '(47) 98844-1122',
    email: 'joao.silva@tsindustrial.com',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Montagem Eletromecânica',
    area: 'Linha CNC 01',
    cargo_id: 'pos-1',
    positionName: 'Eletricista Industrial Especialista',
    hourlyRate: 85.0,
    status: 'Ativo',
    admissionDate: '2023-03-15',
    createdAt: '2023-03-15T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'emp-2',
    name: 'Marcos Aurélio Nogueira',
    cpf: '234.567.890-12',
    registrationNumber: 'MAT-2022-088',
    phone: '(47) 99122-3344',
    email: 'marcos.nogueira@tsindustrial.com',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Usinagem Pesada',
    area: 'Tornos Convencionais',
    cargo_id: 'pos-2',
    positionName: 'Mecânico de Manutenção Hidráulica',
    hourlyRate: 90.0,
    status: 'Ativo',
    admissionDate: '2022-06-01',
    createdAt: '2022-06-01T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'emp-3',
    name: 'Juliana Fernandes Lima',
    cpf: '345.678.901-23',
    registrationNumber: 'MAT-2024-002',
    phone: '(47) 98455-6677',
    email: 'juliana.lima@tsindustrial.com',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Montagem Eletromecânica',
    area: 'Linha CNC 01',
    cargo_id: 'pos-3',
    positionName: 'Técnico Mecatrônico / Automação',
    hourlyRate: 110.0,
    status: 'Ativo',
    admissionDate: '2024-01-10',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'emp-4',
    name: 'Rodrigo Barbosa Alencar',
    cpf: '456.789.012-34',
    registrationNumber: 'MAT-2021-115',
    phone: '(47) 99788-9900',
    email: 'rodrigo.alencar@tsindustrial.com',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Caldeiraria & Solda',
    area: 'Célula de Solda Robotizada',
    cargo_id: 'pos-4',
    positionName: 'Soldador Qualificado TIG/MIG',
    hourlyRate: 80.0,
    status: 'Ativo',
    admissionDate: '2021-08-20',
    createdAt: '2021-08-20T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'emp-5',
    name: 'Paulo Henrique Siqueira',
    cpf: '567.890.123-45',
    registrationNumber: 'MAT-2023-091',
    phone: '(47) 98111-2233',
    email: 'paulo.siqueira@tsindustrial.com',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Utilidades & Compressores',
    area: 'Sala de Compressores e Chiller',
    cargo_id: 'pos-5',
    positionName: 'Lubrificador Técnico de Máquinas',
    hourlyRate: 55.0,
    status: 'Ativo',
    admissionDate: '2023-11-05',
    createdAt: '2023-11-05T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-master',
    name: 'Administrador Master',
    email: 'microwasmel@gmail.com',
    password: 'admin',
    phone: '(47) 99999-8888',
    role: 'Administrador',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Diretoria de Engenharia & Manutenção',
    status: 'Ativo',
    isMaster: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'user-admin',
    name: 'Carlos Alberto Ferreira',
    email: 'admin@tsindustrial.com',
    password: 'admin',
    phone: '(47) 98800-0001',
    role: 'Administrador',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Diretoria de Operações',
    status: 'Ativo',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'user-manager',
    name: 'Eduardo Martins',
    email: 'gerente@tsindustrial.com',
    password: 'gerente',
    phone: '(47) 98800-0002',
    role: 'Gerente',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Gerência de Manutenção',
    status: 'Ativo',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'user-tech',
    name: 'João da Silva Santos',
    email: 'joao.silva@tsindustrial.com',
    password: 'tecnico',
    phone: '(47) 98844-1122',
    role: 'Técnico',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Montagem Eletromecânica',
    status: 'Ativo',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'user-plan',
    name: 'Amanda Vasconcelos',
    email: 'pcm@tsindustrial.com',
    password: 'pcm',
    phone: '(47) 98800-0004',
    role: 'Planejamento',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'PCM - Planejamento',
    status: 'Ativo',
    createdAt: '2025-01-01T00:00:00Z'
  }
];

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-1',
    code: 'CNC-5AX-01',
    patrimonyNumber: 'PAT-00412',
    name: 'Centro de Usinagem 5 Eixos CNC',
    category: 'Usinagem',
    manufacturer: 'DMG MORI',
    model: 'DMU 50 3rd Gen',
    serialNumber: 'DMU50-2022-8874',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Usinagem Pesada',
    area: 'Linha CNC 01',
    location: 'Galpão 02 - Posto 04',
    status: 'Operacional',
    acquisitionDate: '2022-04-10',
    warrantyExpiration: '2025-04-10',
    qrCodeData: 'TES-EQ:CNC-5AX-01',
    criticality: 'Alta',
    specifications: {
      'Potência Spindle': '20 kW (15.000 RPM)',
      'Comando Numérico': 'Siemens Sinumerik 840D',
      'Curso X/Y/Z': '650 x 520 x 475 mm',
      'Pressão Hidráulica': '160 bar'
    },
    observations: 'Equipamento crítico na linha de produção aeroespacial e moldes.'
  },
  {
    id: 'eq-2',
    code: 'TRN-CNC-02',
    patrimonyNumber: 'PAT-00418',
    name: 'Torno CNC Barramento Inclinado',
    category: 'Usinagem',
    manufacturer: 'Romi',
    model: 'GL 280M',
    serialNumber: 'RMI-280-4912',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Usinagem Pesada',
    area: 'Linha CNC 01',
    location: 'Galpão 02 - Posto 07',
    status: 'Em Manutenção',
    acquisitionDate: '2021-08-15',
    warrantyExpiration: '2023-08-15',
    qrCodeData: 'TES-EQ:TRN-CNC-02',
    criticality: 'Alta',
    specifications: {
      'Diâmetro Máximo': '280 mm',
      'Torre': '12 posições acionadas BMT 55',
      'Comando': 'Fanuc 0i-TF'
    },
    observations: 'Vibração anormal detectada no rolamento do fuso principal.'
  },
  {
    id: 'eq-3',
    code: 'CMP-PAR-01',
    patrimonyNumber: 'PAT-00109',
    name: 'Compressor de Ar Parafuso Rotativo 75HP',
    category: 'Compressores',
    manufacturer: 'Atlas Copco',
    model: 'GA 55 VSD+',
    serialNumber: 'AC-GA55-90118',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Utilidades & Compressores',
    area: 'Sala de Compressores e Chiller',
    location: 'Casa de Força - Bloco U',
    status: 'Operacional',
    acquisitionDate: '2020-02-20',
    warrantyExpiration: '2022-02-20',
    qrCodeData: 'TES-EQ:CMP-PAR-01',
    criticality: 'Alta',
    specifications: {
      'Vazão': '380 m³/h',
      'Pressão de Trabalho': '8.5 bar',
      'Inversor de Frequência': 'Integrado'
    },
    observations: 'Alimenta toda a rede pneumática da fábrica. Preventiva mensal rigorosa.'
  },
  {
    id: 'eq-4',
    code: 'PRE-HID-03',
    patrimonyNumber: 'PAT-00331',
    name: 'Prensa Hidráulica 200 Toneladas',
    category: 'Caldeiraria',
    manufacturer: 'Schuler',
    model: 'HPS-200-4C',
    serialNumber: 'SCH-200-7762',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Caldeiraria & Solda',
    area: 'Célula de Solda Robotizada',
    location: 'Galpão 01 - Baia 03',
    status: 'Parado',
    acquisitionDate: '2019-11-05',
    warrantyExpiration: '2021-11-05',
    qrCodeData: 'TES-EQ:PRE-HID-03',
    criticality: 'Alta',
    specifications: {
      'Capacidade': '2000 kN (200 Ton)',
      'Curso do Pistão': '600 mm',
      'Bomba Principal': 'Rexroth A10VSO'
    },
    observations: 'Parada emergencial devido a vazamento de óleo no retentor principal.'
  },
  {
    id: 'eq-5',
    code: 'ROB-SLD-01',
    patrimonyNumber: 'PAT-00520',
    name: 'Célula de Solda Robotizada 6 Eixos',
    category: 'Automação',
    manufacturer: 'KUKA',
    model: 'KR 16 arc HW',
    serialNumber: 'KUK-16-11094',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Caldeiraria & Solda',
    area: 'Célula de Solda Robotizada',
    location: 'Galpão 01 - Célula 01',
    status: 'Operacional',
    acquisitionDate: '2023-01-20',
    warrantyExpiration: '2026-01-20',
    qrCodeData: 'TES-EQ:ROB-SLD-01',
    criticality: 'Média',
    specifications: {
      'Alcance Máximo': '1611 mm',
      'Carga Útil': '16 kg',
      'Fonte de Solda': 'Fronius TPS 500i'
    },
    observations: 'Calibração dos eixos e tocha realizada a cada 3 meses.'
  },
  {
    id: 'eq-6',
    code: 'PON-ROL-01',
    patrimonyNumber: 'PAT-00215',
    name: 'Ponte Rolante Biviga 15 Toneladas',
    category: 'Transporte',
    manufacturer: 'Demag Cranes',
    model: 'ZKKE 15t x 22m',
    serialNumber: 'DMG-CR-4402',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Usinagem Pesada',
    area: 'Linha CNC 01',
    location: 'Galpão 02 - Vão Principal',
    status: 'Operacional',
    acquisitionDate: '2021-03-12',
    warrantyExpiration: '2023-03-12',
    qrCodeData: 'TES-EQ:PON-ROL-01',
    criticality: 'Média',
    specifications: {
      'Capacidade': '15.000 kg',
      'Vão Livre': '22 metros',
      'Altura de Elevação': '9 metros'
    },
    observations: 'Inspeção estrutural periódica de cabos de aço e freios de elevação.'
  }
];

export const INITIAL_PARTS: Part[] = [
  {
    id: 'prt-1',
    code: 'ROL-6205-2RSH',
    name: 'Rolamento Rígido de Esferas 6205 2RSH DDU',
    description: 'Rolamento blindado com vedação de borracha nitrílica para alta rotação',
    category: 'Peças',
    unit: 'UN',
    currentStock: 24,
    minStock: 10,
    maxStock: 50,
    unitCost: 48.50,
    location: 'Prateleira A-02 / Gaveta 05',
    supplierId: 'sup-1',
    supplierName: 'SKF Rolamentos & Vedações do Brasil',
    status: 'Normal',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: 'prt-2',
    code: 'RET-VITON-65X90',
    name: 'Retentor Viton Alta Temperatura 65x90x10',
    description: 'Retentor em fluorocarbono resistente a óleos sintéticos e até 200°C',
    category: 'Peças',
    unit: 'UN',
    currentStock: 4,
    minStock: 8,
    maxStock: 30,
    unitCost: 112.00,
    location: 'Prateleira B-01 / Gaveta 12',
    supplierId: 'sup-2',
    supplierName: 'Parker Hannifin Automação e Vedações',
    status: 'Estoque Baixo',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: 'prt-3',
    code: 'OLEO-ISO-VG-68',
    name: 'Óleo Hidráulico Sintético ISO VG 68 (Balde 20L)',
    description: 'Fluido hidráulico antidesgaste com aditivação antiespumante e antioxidante',
    category: 'Lubrificantes',
    unit: 'CX',
    currentStock: 15,
    minStock: 6,
    maxStock: 40,
    unitCost: 420.00,
    location: 'Área de Inflamáveis - Palete 03',
    supplierId: 'sup-3',
    supplierName: 'Mobil Lubrificantes Industriais',
    status: 'Normal',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: 'prt-4',
    code: 'FIL-HID-10MIC',
    name: 'Elemento Filtrante Hidráulico Retorno 10 Micra',
    description: 'Filtro de fibra inorgânica para alta pressão Rexroth / Hydac',
    category: 'Peças',
    unit: 'UN',
    currentStock: 2,
    minStock: 5,
    maxStock: 20,
    unitCost: 285.00,
    location: 'Prateleira A-04 / Gaveta 02',
    supplierId: 'sup-2',
    supplierName: 'Parker Hannifin Automação e Vedações',
    status: 'Crítico',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: 'prt-5',
    code: 'DISJ-MOT-32A',
    name: 'Disjuntor Motor Termomagnético 24-32A',
    description: 'Proteção contra curto-circuito e sobrecarga para motores trifásicos Siemens',
    category: 'Materiais',
    unit: 'UN',
    currentStock: 8,
    minStock: 4,
    maxStock: 20,
    unitCost: 195.00,
    location: 'Prateleira E-01 / Gaveta 08',
    supplierId: 'sup-4',
    supplierName: 'Siemens Brasil Componentes Elétricos',
    status: 'Normal',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    companyName: 'SKF do Brasil Ltda',
    tradeName: 'SKF Rolamentos & Vedações do Brasil',
    cnpj: '61.066.508/0001-30',
    phone: '(11) 4619-9000',
    email: 'atendimento.industrial@skf.com',
    address: 'Rod. Raposo Tavares, km 30 - Cotia/SP',
    contactPerson: 'Fernando Garcia',
    status: 'Ativo',
    categoriesSupplied: ['Rolamentos', 'Mancais', 'Vedações'],
    rating: 5,
    notes: 'Fornecedor homologado padrão A. Entrega em até 48h.',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sup-2',
    companyName: 'Parker Hannifin Indústria e Comércio Ltda',
    tradeName: 'Parker Hannifin Automação e Vedações',
    cnpj: '60.672.488/0001-20',
    phone: '(12) 4009-3500',
    email: 'vendas.hidraulica@parker.com',
    address: 'Av. Lucas Nogueira Garcez, 2181 - Jacareí/SP',
    contactPerson: 'Mariana Rocha',
    status: 'Ativo',
    categoriesSupplied: ['Válvulas', 'Bombas', 'Filtros', 'Retentores'],
    rating: 5,
    notes: 'Distribuidor direto para peças hidráulicas da Prensa e Tornos.',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sup-3',
    companyName: 'Cosan Lubrificantes e Especialidades S.A.',
    tradeName: 'Mobil Lubrificantes Industriais',
    cnpj: '33.000.092/0001-69',
    phone: '(11) 3748-8000',
    email: 'pedidos@moove.com.br',
    address: 'Av. Dr. Chucri Zaidan, 920 - São Paulo/SP',
    contactPerson: 'Gustavo Paiva',
    status: 'Ativo',
    categoriesSupplied: ['Óleos Industriais', 'Graxas Especiais'],
    rating: 4,
    notes: 'Fornecimento a granel e tambores.',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sup-4',
    companyName: 'Siemens Infraestrutura e Indústria Ltda',
    tradeName: 'Siemens Brasil Componentes Elétricos',
    cnpj: '44.013.159/0001-98',
    phone: '(11) 4585-7000',
    email: 'suporte.tecnico@siemens.com',
    address: 'Av. Mutinga, 3800 - Pirituba, São Paulo/SP',
    contactPerson: 'Renata Beltrão',
    status: 'Ativo',
    categoriesSupplied: ['CLP', 'Inversores', 'Disjuntores', 'Contatoras'],
    rating: 5,
    notes: 'Fornecedor de peças para automação.',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const INITIAL_PREVENTIVE_PLANS: MaintenancePlan[] = [
  {
    id: 'prev-1',
    code: 'PLN-CNC-MENSAL',
    title: 'Manutenção Preventiva Mensal - Centro de Usinagem 5 Eixos',
    description: 'Inspeção geométrica, lubrificação das guias lineares e teste de concentricidade do Spindle',
    equipmentId: 'eq-1',
    equipmentCode: 'CNC-5AX-01',
    equipmentName: 'Centro de Usinagem 5 Eixos CNC',
    periodicityType: 'Dias',
    periodicityValue: 30,
    lastMaintenanceDate: '2025-01-15',
    nextMaintenanceDate: '2025-02-15',
    responsibleId: 'emp-3',
    responsibleName: 'Juliana Fernandes Lima',
    estimatedDurationHours: 4.5,
    checklistItems: [
      { id: 'chk-1', description: 'Verificar nível do óleo de lubrificação central das guias lineares', type: 'conforme_nao_conforme', required: true, order: 1 },
      { id: 'chk-2', description: 'Medir pressão do sistema hidráulico do contra-peso do cabeçote', type: 'medicao', expectedValue: '140 bar', unit: 'bar', required: true, order: 2 },
      { id: 'chk-3', description: 'Inspecionar folga axial e vibração do cone porta-ferramentas (Spindle)', type: 'conforme_nao_conforme', required: true, order: 3 },
      { id: 'chk-4', description: 'Limpeza e teste funcional do trocador automático de ferramentas', type: 'conforme_nao_conforme', required: true, order: 4 },
      { id: 'chk-5', description: 'Checagem dos fins de curso e cortinas de luz de segurança', type: 'conforme_nao_conforme', required: true, order: 5 }
    ],
    status: 'Ativo',
    priority: 'Alta',
    autoGenerateOS: true,
    advanceDaysWarning: 5,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  {
    id: 'prev-2',
    code: 'PLN-CMP-TRIMESTRAL',
    title: 'Preventiva Trimestral do Compressor Parafuso 75HP',
    description: 'Troca de elemento filtrante, análise de óleo, limpeza do radiador e teste da válvula de segurança',
    equipmentId: 'eq-3',
    equipmentCode: 'CMP-PAR-01',
    equipmentName: 'Compressor de Ar Parafuso Rotativo 75HP',
    periodicityType: 'Dias',
    periodicityValue: 90,
    lastMaintenanceDate: '2024-11-20',
    nextMaintenanceDate: '2025-02-20',
    responsibleId: 'emp-5',
    responsibleName: 'Paulo Henrique Siqueira',
    estimatedDurationHours: 3.0,
    checklistItems: [
      { id: 'chk-6', description: 'Substituição do filtro de ar e filtro separador ar/óleo', type: 'conforme_nao_conforme', required: true, order: 1 },
      { id: 'chk-7', description: 'Coleta de amostra de óleo lubrificante para análise espectrométrica', type: 'conforme_nao_conforme', required: true, order: 2 },
      { id: 'chk-8', description: 'Aferição de temperatura de descarga do elemento compressor', type: 'medicao', expectedValue: '85 °C', unit: '°C', required: true, order: 3 },
      { id: 'chk-9', description: 'Teste de atuação manual e alívio da válvula de segurança ASME', type: 'conforme_nao_conforme', required: true, order: 4 }
    ],
    status: 'Ativo',
    priority: 'Alta',
    autoGenerateOS: true,
    advanceDaysWarning: 7,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-11-20T00:00:00Z'
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-1',
    orderNumber: 'OS-2025-0089',
    requesterName: 'Roberto Mendes (Supervisor de Caldeiraria)',
    requesterId: 'user-manager',
    date: '2025-02-02',
    time: '08:30',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Caldeiraria & Solda',
    area: 'Célula de Solda Robotizada',
    equipmentId: 'eq-4',
    equipmentCode: 'PRE-HID-03',
    equipmentName: 'Prensa Hidráulica 200 Toneladas',
    type: 'Emergencial',
    priority: 'Crítica',
    description: 'Vazamento volumoso de óleo hidráulico no retentor do cilindro principal e queda brusca de pressão na prensagem de chapas.',
    responsibleId: 'emp-2',
    responsibleName: 'Marcos Aurélio Nogueira',
    status: 'Em execução',
    deadlineDate: '2025-02-03',
    deadlineTime: '17:00',
    observations: 'Máquina parada gerando gargalo na expedição da linha automotiva. Parada autorizada pela gerência industrial.',
    
    // Escopo com itens 001, 002, 003
    scope: [
      {
        id: 'sc-1',
        itemNumber: '001',
        description: 'Despressurizar circuito hidráulico, desmontar flange frontal e drenar retentor danificado',
        peopleCount: 2,
        startDate: '2025-02-02 09:00',
        endDate: '2025-02-02 14:00',
        responsibleId: 'emp-2',
        responsibleName: 'Marcos Aurélio Nogueira',
        observation: 'Utilizar bacia de contenção de óleo e EPI impermeável.'
      },
      {
        id: 'sc-2',
        itemNumber: '002',
        description: 'Substituição do conjunto de retentores Viton 65x90x10 e elemento filtrante de 10 micra',
        peopleCount: 2,
        startDate: '2025-02-02 14:30',
        endDate: '2025-02-02 18:00',
        responsibleId: 'emp-2',
        responsibleName: 'Marcos Aurélio Nogueira',
        observation: 'Aplicar graxa especial de montagem nas vedações.'
      },
      {
        id: 'sc-3',
        itemNumber: '003',
        description: 'Completar nível de óleo ISO VG 68, teste de estanqueidade e aferição da pressão de prensagem (200 bar)',
        peopleCount: 1,
        startDate: '2025-02-03 08:00',
        endDate: '2025-02-03 11:30',
        responsibleId: 'emp-1',
        responsibleName: 'João da Silva Santos',
        observation: 'Acompanhar 10 ciclos completos de prensagem com o operador.'
      }
    ],

    // Mão de Obra com correspondência OBRIGATÓRIA (Item 001 -> Qtd 2, Item 002 -> Qtd 2, Item 003 -> Qtd 1)
    labor: [
      {
        id: 'lab-1',
        itemNumber: '001',
        quantity: 2,
        employeeId: 'emp-2',
        employeeName: 'Marcos Aurélio Nogueira',
        positionId: 'pos-2',
        positionName: 'Mecânico de Manutenção Hidráulica',
        hours: 5.0,
        hourlyRate: 90.0,
        totalValue: 900.0 // 2 pessoas * 5h * R$ 90/h
      },
      {
        id: 'lab-2',
        itemNumber: '002',
        quantity: 2,
        employeeId: 'emp-2',
        employeeName: 'Marcos Aurélio Nogueira',
        positionId: 'pos-2',
        positionName: 'Mecânico de Manutenção Hidráulica',
        hours: 3.5,
        hourlyRate: 90.0,
        totalValue: 630.0 // 2 pessoas * 3.5h * R$ 90/h
      },
      {
        id: 'lab-3',
        itemNumber: '003',
        quantity: 1,
        employeeId: 'emp-1',
        employeeName: 'João da Silva Santos',
        positionId: 'pos-1',
        positionName: 'Eletricista Industrial Especialista',
        hours: 3.5,
        hourlyRate: 85.0,
        totalValue: 297.5 // 1 pessoa * 3.5h * R$ 85/h
      }
    ],

    // Recursos
    resources: [
      {
        id: 'rec-1',
        type: 'Ferramenta',
        name: 'Torquímetro de Estalo 50-350 Nm e Chaves Soquete Impacto',
        quantity: 1,
        unit: 'JG',
        unitCost: 150.0,
        totalCost: 150.0,
        status: 'Em Uso',
        notes: 'Ferramental retirado da ferramentaria central com calibração RBC válida'
      },
      {
        id: 'rec-2',
        type: 'Equipamento',
        name: 'Bomba Manual de Pressurização e Dreno de Vácuo',
        quantity: 1,
        unit: 'UN',
        unitCost: 80.0,
        totalCost: 80.0,
        status: 'Em Uso',
        notes: 'Equipamento de suporte para purga do ar da linha'
      }
    ],

    // Valores
    values: {
      laborCost: 1827.50,
      partsCost: 509.00, // 2 retentores (R$ 224) + 1 filtro (R$ 285)
      materialsCost: 420.00, // 1 balde óleo ISO VG 68
      servicesCost: 0,
      resourcesCost: 230.00,
      additionalCosts: 150.00, // Descarte ambiental de resíduos de óleo
      totalCost: 3136.50
    },

    // Até (Prazos e SLAs)
    milestones: [
      { id: 'ms-1', title: 'Isolamento LOTO e Drenagem Segura', targetDate: '2025-02-02 12:00', completedDate: '2025-02-02 11:45', status: 'Concluído', responsibleName: 'Marcos Aurélio Nogueira' },
      { id: 'ms-2', title: 'Substituição das Vedações e Filtros', targetDate: '2025-02-02 18:00', status: 'Pendente', responsibleName: 'Marcos Aurélio Nogueira' },
      { id: 'ms-3', title: 'Testes de Carga e Liberação para Produção', targetDate: '2025-02-03 11:30', status: 'Pendente', responsibleName: 'João da Silva Santos' }
    ],

    // Execuções registradas
    executions: [
      {
        id: 'exec-1',
        date: '2025-02-02',
        startTime: '09:00',
        endTime: '12:00',
        employeeId: 'emp-2',
        employeeName: 'Marcos Aurélio Nogueira',
        positionName: 'Mecânico de Manutenção Hidráulica',
        description: 'Bloqueio de energia elétrica e hidráulica (LOTO). Desmontagem da carcaça frontal do cilindro da Prensa 200T.',
        servicePerformed: 'Retirado retentor danificado com deformação plástica no lábio de vedação. Limpeza química de toda a sede do cilindro com desengraxante industrial.'
      }
    ],

    createdAt: '2025-02-02T08:30:00Z',
    updatedAt: '2025-02-02T12:05:00Z'
  },
  {
    id: 'wo-2',
    orderNumber: 'OS-2025-0085',
    requesterName: 'Carlos Silveira (Encarregado Usinagem)',
    requesterId: 'user-manager',
    date: '2025-01-28',
    time: '14:00',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Usinagem Pesada',
    area: 'Linha CNC 01',
    equipmentId: 'eq-1',
    equipmentCode: 'CNC-5AX-01',
    equipmentName: 'Centro de Usinagem 5 Eixos CNC',
    type: 'Preventiva',
    priority: 'Alta',
    description: 'Manutenção preventiva programada de 1.000 horas do Centro de Usinagem 5 eixos DMG MORI.',
    responsibleId: 'emp-3',
    responsibleName: 'Juliana Fernandes Lima',
    status: 'Concluída',
    deadlineDate: '2025-01-29',
    deadlineTime: '18:00',
    observations: 'Preventiva concluída dentro do prazo planejado pelo PCM. Tolerâncias geométricas 100% conformes.',
    
    scope: [
      {
        id: 'sc-201',
        itemNumber: '001',
        description: 'Checagem e limpeza dos filtros do painel elétrico Siemens e verificação dos ventiladores axiais',
        peopleCount: 1,
        startDate: '2025-01-28 14:00',
        endDate: '2025-01-28 16:30',
        responsibleId: 'emp-1',
        responsibleName: 'João da Silva Santos',
        observation: 'Trocada manta filtrante do armário elétrico.'
      },
      {
        id: 'sc-202',
        itemNumber: '002',
        description: 'Alinhamento a laser dos eixos rotativos B e C e teste de repetibilidade com relógio apalpador micrométrico',
        peopleCount: 2,
        startDate: '2025-01-28 16:30',
        endDate: '2025-01-29 11:30',
        responsibleId: 'emp-3',
        responsibleName: 'Juliana Fernandes Lima',
        observation: 'Desvio medido: 0.003 mm (dentro da tolerância nominal de 0.005 mm).'
      }
    ],

    labor: [
      {
        id: 'lab-201',
        itemNumber: '001',
        quantity: 1,
        employeeId: 'emp-1',
        employeeName: 'João da Silva Santos',
        positionId: 'pos-1',
        positionName: 'Eletricista Industrial Especialista',
        hours: 2.5,
        hourlyRate: 85.0,
        totalValue: 212.50
      },
      {
        id: 'lab-202',
        itemNumber: '002',
        quantity: 2,
        employeeId: 'emp-3',
        employeeName: 'Juliana Fernandes Lima',
        positionId: 'pos-3',
        positionName: 'Técnico Mecatrônico / Automação',
        hours: 7.0,
        hourlyRate: 110.0,
        totalValue: 1540.0 // 2 pessoas * 7h * R$ 110/h
      }
    ],

    resources: [
      {
        id: 'rec-201',
        type: 'Equipamento',
        name: 'Sistema de Calibração a Laser Renishaw Ballbar QC20-W',
        quantity: 1,
        unit: 'UN',
        unitCost: 350.0,
        totalCost: 350.0,
        status: 'Devolvido',
        notes: 'Instrumento de alta precisão do setor de metrologia'
      }
    ],

    values: {
      laborCost: 1752.50,
      partsCost: 0,
      materialsCost: 95.00,
      servicesCost: 0,
      resourcesCost: 350.00,
      additionalCosts: 0,
      totalCost: 2197.50
    },

    milestones: [
      { id: 'ms-201', title: 'Inspeção Elétrica e Painéis', targetDate: '2025-01-28 17:00', completedDate: '2025-01-28 16:30', status: 'Concluído', responsibleName: 'João da Silva Santos' },
      { id: 'ms-202', title: 'Metrologia e Calibração de Eixos', targetDate: '2025-01-29 12:00', completedDate: '2025-01-29 11:30', status: 'Concluído', responsibleName: 'Juliana Fernandes Lima' },
      { id: 'ms-203', title: 'Usinagem de Peça Teste Padrão e Liberação', targetDate: '2025-01-29 17:00', completedDate: '2025-01-29 16:45', status: 'Concluído', responsibleName: 'Juliana Fernandes Lima' }
    ],

    executions: [
      {
        id: 'exec-201',
        date: '2025-01-28',
        startTime: '14:00',
        endTime: '16:30',
        employeeId: 'emp-1',
        employeeName: 'João da Silva Santos',
        positionName: 'Eletricista Industrial Especialista',
        description: 'Reaperto geral de bornes, limpeza do painel com ar seco e teste dos sensores de temperatura.',
        servicePerformed: 'Painel elétrico 100% higienizado e ventiladores testados com rotação nominal.'
      },
      {
        id: 'exec-202',
        date: '2025-01-29',
        startTime: '08:00',
        endTime: '16:45',
        employeeId: 'emp-3',
        employeeName: 'Juliana Fernandes Lima',
        positionName: 'Técnico Mecatrônico / Automação',
        description: 'Teste dinâmico de circularidade com Ballbar QC20-W e compensação de folga no CNC Sinumerik 840D.',
        servicePerformed: 'Concluída usinagem de corpo de prova em alumínio 7075 com rugosidade Ra 0.4 µm.'
      }
    ],

    completedAt: '2025-01-29T16:50:00Z',
    createdAt: '2025-01-28T14:00:00Z',
    updatedAt: '2025-01-29T16:50:00Z'
  },
  {
    id: 'wo-3',
    orderNumber: 'OS-2025-0091',
    requesterName: 'Juliana Costa (Supervisora de Montagem)',
    requesterId: 'user-manager',
    date: '2025-02-01',
    time: '10:15',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Usinagem Pesada',
    area: 'Linha CNC 01',
    equipmentId: 'eq-2',
    equipmentCode: 'TRN-CNC-02',
    equipmentName: 'Torno CNC Barramento Inclinado',
    type: 'Corretiva',
    priority: 'Alta',
    description: 'Ruído metálico acentuado e sobreaquecimento no cabeçote principal durante operações de desbaste pesado.',
    responsibleId: 'emp-2',
    responsibleName: 'Marcos Aurélio Nogueira',
    status: 'Aberta',
    deadlineDate: '2025-02-04',
    deadlineTime: '18:00',
    observations: 'Aguardando chegada do jogo de rolamentos de precisão 6205 para início da desmontagem do fuso.',
    
    scope: [
      {
        id: 'sc-301',
        itemNumber: '001',
        description: 'Desmontagem da torre de ferramentas e desacoplamento do motor do fuso principal',
        peopleCount: 2,
        startDate: '2025-02-04 08:00',
        endDate: '2025-02-04 12:00',
        responsibleId: 'emp-2',
        responsibleName: 'Marcos Aurélio Nogueira',
        observation: 'Marcar posições angulares para remontagem.'
      }
    ],

    labor: [
      {
        id: 'lab-301',
        itemNumber: '001',
        quantity: 2,
        employeeId: 'emp-2',
        employeeName: 'Marcos Aurélio Nogueira',
        positionId: 'pos-2',
        positionName: 'Mecânico de Manutenção Hidráulica',
        hours: 4.0,
        hourlyRate: 90.0,
        totalValue: 720.0
      }
    ],

    resources: [],

    values: {
      laborCost: 720.00,
      partsCost: 97.00,
      materialsCost: 0,
      servicesCost: 0,
      resourcesCost: 0,
      additionalCosts: 0,
      totalCost: 817.00
    },

    milestones: [
      { id: 'ms-301', title: 'Chegada das Peças do Almoxarifado', targetDate: '2025-02-03 16:00', status: 'Pendente', responsibleName: 'Marcos Aurélio Nogueira' },
      { id: 'ms-302', title: 'Montagem e Teste de Balanceamento Dinâmico', targetDate: '2025-02-04 17:00', status: 'Pendente', responsibleName: 'Marcos Aurélio Nogueira' }
    ],

    executions: [],

    createdAt: '2025-02-01T10:15:00Z',
    updatedAt: '2025-02-01T10:15:00Z'
  },
  {
    id: 'wo-4',
    orderNumber: 'OS-2025-0092',
    requesterName: 'Marcos Vinicius (Supervisor Utilidades)',
    requesterId: 'user-manager',
    date: '2025-02-02',
    time: '11:00',
    company: 'T&S Industrial Service Ltda.',
    unit: 'Planta Principal - Joinville',
    department: 'Utilidades & Compressores',
    area: 'Sala de Compressores e Chiller',
    equipmentId: 'eq-3',
    equipmentCode: 'CMP-PAR-01',
    equipmentName: 'Compressor de Ar Parafuso Rotativo 75HP',
    type: 'Preditiva',
    priority: 'Normal',
    description: 'Análise de vibração triaxial e termografia infravermelha no motor e acoplamento do compressor.',
    responsibleId: 'emp-3',
    responsibleName: 'Juliana Fernandes Lima',
    status: 'Planejada',
    deadlineDate: '2025-02-05',
    deadlineTime: '15:00',
    observations: 'Inspeção preditiva sem parada da produção.',
    
    scope: [
      {
        id: 'sc-401',
        itemNumber: '001',
        description: 'Coleta de espectro de aceleração e velocidade em 6 pontos do motor e unidade compressora',
        peopleCount: 1,
        startDate: '2025-02-05 09:00',
        endDate: '2025-02-05 11:30',
        responsibleId: 'emp-3',
        responsibleName: 'Juliana Fernandes Lima',
        observation: 'Emitir laudo preditivo com comparação de envelope de aceleração.'
      }
    ],

    labor: [
      {
        id: 'lab-401',
        itemNumber: '001',
        quantity: 1,
        employeeId: 'emp-3',
        employeeName: 'Juliana Fernandes Lima',
        positionId: 'pos-3',
        positionName: 'Técnico Mecatrônico / Automação',
        hours: 2.5,
        hourlyRate: 110.0,
        totalValue: 275.0
      }
    ],

    resources: [],

    values: {
      laborCost: 275.00,
      partsCost: 0,
      materialsCost: 0,
      servicesCost: 0,
      resourcesCost: 0,
      additionalCosts: 0,
      totalCost: 275.00
    },

    milestones: [
      { id: 'ms-401', title: 'Emissão do Laudo Termográfico e Espectral', targetDate: '2025-02-05 15:00', status: 'Pendente', responsibleName: 'Juliana Fernandes Lima' }
    ],

    executions: [],

    createdAt: '2025-02-02T11:00:00Z',
    updatedAt: '2025-02-02T11:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    type: 'equipamento_parado',
    title: 'Equipamento Parado Crítico',
    message: 'A Prensa Hidráulica 200 Toneladas (PRE-HID-03) está parada por vazamento na vedação.',
    read: false,
    relatedEntityId: 'wo-1',
    relatedEntityType: 'work_order',
    severity: 'critical',
    createdAt: '2025-02-02T08:35:00Z'
  },
  {
    id: 'notif-2',
    type: 'estoque_minimo',
    title: 'Alerta de Estoque Mínimo',
    message: 'O item Elemento Filtrante Hidráulico 10 Micra atingiu nível crítico (2 unidades em estoque).',
    read: false,
    relatedEntityId: 'prt-4',
    relatedEntityType: 'part',
    severity: 'warning',
    createdAt: '2025-02-02T09:10:00Z'
  },
  {
    id: 'notif-3',
    type: 'preventiva_proxima',
    title: 'Manutenção Preventiva Próxima',
    message: 'Preventiva PLN-CNC-MENSAL do Centro de Usinagem 5 Eixos vence em 13 dias.',
    read: true,
    relatedEntityId: 'prev-1',
    relatedEntityType: 'preventive',
    severity: 'info',
    createdAt: '2025-02-01T07:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    userId: 'user-admin',
    userName: 'Carlos Alberto Ferreira',
    userRole: 'Administrador',
    action: 'CREATE',
    timestamp: '2025-02-02 08:30:15',
    table: 'work_orders',
    recordId: 'wo-1',
    recordIdentifier: 'OS-2025-0089',
    newValue: 'Status: Em execução | Prioridade: Crítica | Equipamento: PRE-HID-03',
    device: 'Desktop Chrome 122 - Windows 11',
    ipAddress: '192.168.10.45'
  },
  {
    id: 'aud-2',
    userId: 'user-tech',
    userName: 'João da Silva Santos',
    userRole: 'Técnico',
    action: 'FINALIZE',
    timestamp: '2025-01-29 16:50:00',
    table: 'work_orders',
    recordId: 'wo-2',
    recordIdentifier: 'OS-2025-0085',
    previousValue: 'Status: Em execução',
    newValue: 'Status: Concluída | Custo Total: R$ 2.197,50',
    device: 'Tablet Android - Coletor Industrial',
    ipAddress: '192.168.10.112'
  },
  {
    id: 'aud-3',
    userId: 'user-admin',
    userName: 'Carlos Alberto Ferreira',
    userRole: 'Administrador',
    action: 'LOGIN',
    timestamp: '2025-02-02 07:55:00',
    table: 'users',
    recordId: 'user-admin',
    recordIdentifier: 'admin@tsindustrial.com',
    newValue: 'Sessão iniciada com perfil Administrador',
    device: 'Desktop Chrome 122 - Windows 11',
    ipAddress: '192.168.10.45'
  }
];
