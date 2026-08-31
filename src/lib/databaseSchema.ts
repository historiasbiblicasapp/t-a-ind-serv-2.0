export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- TES MANUTENÇÃO - SISTEMA DE GESTÃO DE MANUTENÇÃO INDUSTRIAL
-- Script Completo de Criação de Banco de Dados PostgreSQL / Supabase
-- ====================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABELA DE EMPRESAS
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. UNIDADES OPERACIONAIS
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SETORES / DEPARTAMENTOS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    manager_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ÁREAS DE TRABALHO
CREATE TABLE IF NOT EXISTS public.areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CARGOS
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_hourly_rate NUMERIC(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. FUNCIONÁRIOS
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(20) UNIQUE NOT NULL,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    company VARCHAR(255) NOT NULL,
    unit VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    cargo_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
    position_name VARCHAR(255),
    hourly_rate NUMERIC(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Férias', 'Afastado', 'Inativo')),
    photo_url TEXT,
    admission_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CATEGORIAS DE EQUIPAMENTO
CREATE TABLE IF NOT EXISTS public.equipment_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20)
);

-- 9. EQUIPAMENTOS
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    patrimony_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(150),
    model VARCHAR(150),
    serial_number VARCHAR(100),
    company VARCHAR(255) NOT NULL,
    unit VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(30) DEFAULT 'Operacional' CHECK (status IN ('Operacional', 'Em Manutenção', 'Parado', 'Em Inspeção', 'Desativado')),
    acquisition_date DATE,
    warranty_expiration DATE,
    qr_code_data TEXT NOT NULL,
    criticality VARCHAR(20) DEFAULT 'Média' CHECK (criticality IN ('Alta', 'Média', 'Baixa')),
    specifications JSONB DEFAULT '{}'::jsonb,
    observations TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ORDENS DE SERVIÇO (WORK ORDERS)
CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    requester_name VARCHAR(255) NOT NULL,
    requester_id UUID,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    company VARCHAR(255) NOT NULL,
    unit VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE RESTRICT,
    equipment_code VARCHAR(50) NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('Corretiva', 'Preventiva', 'Preditiva', 'Inspeção', 'Melhoria', 'Emergencial')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Baixa', 'Normal', 'Alta', 'Crítica')),
    description TEXT NOT NULL,
    responsible_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    responsible_name VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Aguardando', 'Planejada', 'Em execução', 'Pausada', 'Concluída', 'Cancelada')),
    deadline_date DATE NOT NULL,
    deadline_time VARCHAR(10),
    observations TEXT,
    values JSONB DEFAULT '{"laborCost":0,"partsCost":0,"materialsCost":0,"servicesCost":0,"resourcesCost":0,"additionalCosts":0,"totalCost":0}'::jsonb,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. ESCOPO DO SERVIÇO (WORK ORDER SCOPE)
CREATE TABLE IF NOT EXISTS public.work_order_scope (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    item_number VARCHAR(20) NOT NULL, -- Ex: "001"
    description TEXT NOT NULL,
    people_count INTEGER NOT NULL DEFAULT 1,
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    responsible_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    responsible_name VARCHAR(255),
    observation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. MÃO DE OBRA (WORK ORDER LABOR)
CREATE TABLE IF NOT EXISTS public.work_order_labor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    item_number VARCHAR(20) NOT NULL, -- Vinculado ao Escopo
    quantity INTEGER NOT NULL DEFAULT 1, -- Vinculado ao Pessoas do Escopo
    employee_id UUID REFERENCES public.employees(id) ON DELETE RESTRICT,
    employee_name VARCHAR(255) NOT NULL,
    position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
    position_name VARCHAR(255) NOT NULL,
    hours NUMERIC(6,2) DEFAULT 0.00,
    hourly_rate NUMERIC(10,2) DEFAULT 0.00,
    total_value NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. RECURSOS DA OS (WORK ORDER RESOURCES)
CREATE TABLE IF NOT EXISTS public.work_order_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit VARCHAR(20) NOT NULL,
    unit_cost NUMERIC(10,2) DEFAULT 0.00,
    total_cost NUMERIC(12,2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'Disponível',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. EXECUÇÕES DA OS (WORK ORDER EXECUTIONS)
CREATE TABLE IF NOT EXISTS public.work_order_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    employee_name VARCHAR(255) NOT NULL,
    position_name VARCHAR(255),
    description TEXT NOT NULL,
    service_performed TEXT NOT NULL,
    observations TEXT,
    photos TEXT[],
    signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. PLANOS DE MANUTENÇÃO PREVENTIVA
CREATE TABLE IF NOT EXISTS public.maintenance_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    equipment_name VARCHAR(255) NOT NULL,
    equipment_code VARCHAR(50) NOT NULL,
    periodicity_type VARCHAR(30) NOT NULL,
    periodicity_value INTEGER NOT NULL,
    last_maintenance_date DATE,
    next_maintenance_date DATE NOT NULL,
    responsible_name VARCHAR(255),
    estimated_duration_hours NUMERIC(5,2) DEFAULT 1.0,
    checklist_items JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(30) DEFAULT 'Ativo',
    priority VARCHAR(20) DEFAULT 'Normal',
    auto_generate_os BOOLEAN DEFAULT TRUE,
    advance_days_warning INTEGER DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. FORNECEDORES (SUPPLIERS)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    contact_person VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Ativo',
    categories_supplied TEXT[],
    rating INTEGER DEFAULT 5,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. PEÇAS E ESTOQUE (PARTS & INVENTORY)
CREATE TABLE IF NOT EXISTS public.parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    current_stock NUMERIC(10,2) DEFAULT 0,
    min_stock NUMERIC(10,2) DEFAULT 0,
    max_stock NUMERIC(10,2) DEFAULT 100,
    unit_cost NUMERIC(10,2) DEFAULT 0.00,
    location VARCHAR(100),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'Normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. MOVIMENTAÇÕES DE ESTOQUE
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_id UUID REFERENCES public.parts(id) ON DELETE CASCADE,
    part_code VARCHAR(50) NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    unit_cost NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(12,2) NOT NULL,
    previous_stock NUMERIC(10,2) NOT NULL,
    new_stock NUMERIC(10,2) NOT NULL,
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
    work_order_number VARCHAR(50),
    reason TEXT NOT NULL,
    responsible_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. NOTIFICAÇÕES DO SISTEMA
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    related_entity_id VARCHAR(100),
    related_entity_type VARCHAR(50),
    severity VARCHAR(20) DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. LOGS DE AUDITORIA (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    record_identifier VARCHAR(255) NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    device TEXT,
    ip_address VARCHAR(50)
);

-- 21. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read for all users" ON public.work_orders FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert for all users" ON public.work_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update for all users" ON public.work_orders FOR UPDATE USING (true);
`;

export const supabaseFullDDL = SUPABASE_SQL_SCHEMA;
