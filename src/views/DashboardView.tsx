import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/common/Badge';
import { formatCurrency, formatDate } from '../lib/utils';
import { WorkOrder, Equipment } from '../types';
import {
  Activity,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  DollarSign,
  TrendingUp,
  Cpu,
  Package,
  PlusCircle,
  QrCode,
  FileSpreadsheet,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { PageId } from '../types';

interface DashboardViewProps {
  onNavigate?: (page: PageId) => void;
  onOpenNewOS?: () => void;
  onOpenNewWorkOrder?: () => void;
  onOpenQRScanner?: () => void;
  onSelectWorkOrder?: (order: WorkOrder) => void;
  onSelectEquipment?: (eq: Equipment) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate = (_page: PageId) => {},
  onOpenNewOS,
  onOpenNewWorkOrder,
  onOpenQRScanner = () => {},
  onSelectWorkOrder = (_order: WorkOrder) => {},
  onSelectEquipment = (_eq: Equipment) => {},
}) => {
  const handleOpenNew = onOpenNewWorkOrder || onOpenNewOS || (() => {});
  const { kpis, workOrders, equipment, parts, preventivePlans } = useData();
  const { can } = useAuth();

  const recentOrders = workOrders.slice(0, 6);
  const criticalEquipment = equipment.filter(e => e.criticality === 'A' || e.status === 'Em Manutenção' || e.status === 'Parado').slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Painel Operacional em Tempo Real
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 mt-1 tracking-tight">
            TeS Manutenção Industrial
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoramento de ativos, confiabilidade de planta e ordens de serviço ativas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {can('criar') && (
            <button
              id="dash-quick-new-os"
              onClick={handleOpenNew}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Abrir Nova OS</span>
            </button>
          )}

          <button
            onClick={onOpenQRScanner}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Scanner QR Tag</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Relatórios</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Disponibilidade Operacional"
          value={`${kpis.operationalAvailabilityPercent}%`}
          icon={Activity}
          subtext="Meta mundial WCM: >95%"
          trend={{ value: '+1.4% este mês', isPositive: true }}
          color="emerald"
          onClick={() => onNavigate('indicators')}
        />

        <StatCard
          title="MTBF (Tempo Médio Entre Falhas)"
          value={`${kpis.mtbfHours}h`}
          icon={Clock}
          subtext="Confiabilidade contínua"
          trend={{ value: '+35h vs mês anterior', isPositive: true }}
          color="blue"
          onClick={() => onNavigate('indicators')}
        />

        <StatCard
          title="MTTR (Tempo Médio de Reparo)"
          value={`${kpis.mttrHours}h`}
          icon={Wrench}
          subtext="Meta de reparo rápido: <4h"
          trend={{ value: '-0.6h redução', isPositive: true }}
          color="amber"
          onClick={() => onNavigate('indicators')}
        />

        <StatCard
          title="Ordens Ativas (Backlog)"
          value={kpis.openWorkOrdersCount + kpis.inProgressWorkOrdersCount}
          icon={AlertOctagon}
          subtext={`${kpis.inProgressWorkOrdersCount} em execução agora`}
          trend={{ value: `${kpis.delayedWorkOrdersCount} em atraso`, isPositive: kpis.delayedWorkOrdersCount === 0 }}
          color={kpis.delayedWorkOrdersCount > 0 ? 'rose' : 'purple'}
          onClick={() => onNavigate('work-orders')}
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Investido (OS)</span>
            <p className="text-base font-bold font-mono text-emerald-400">{formatCurrency(kpis.totalMaintenanceCost)}</p>
          </div>
          <DollarSign className="w-5 h-5 text-emerald-400/50" />
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Aderência Preventiva</span>
            <p className="text-base font-bold font-mono text-amber-400">{kpis.preventiveComplianceRatePercent}%</p>
          </div>
          <TrendingUp className="w-5 h-5 text-amber-400/50" />
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Ativos em Operação</span>
            <p className="text-base font-bold font-mono text-slate-200">{kpis.activeEquipmentCount} / {equipment.length}</p>
          </div>
          <Cpu className="w-5 h-5 text-blue-400/50" />
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Itens Estoque Baixo</span>
            <p className="text-base font-bold font-mono text-rose-400">{kpis.lowStockItemsCount} itens</p>
          </div>
          <Package className="w-5 h-5 text-rose-400/50" />
        </div>
      </div>

      {/* Main Grid: Recent Work Orders & Critical Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Work Orders (2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Ordens de Serviço Recentes
              </h2>
            </div>
            <button
              onClick={() => onNavigate('work-orders')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Ver Todas ({workOrders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl divide-y divide-slate-800/60">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onSelectWorkOrder(order)}
                className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-amber-400">
                      {order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} size="sm" />
                    <PriorityBadge priority={order.priority} size="sm" />
                    <TypeBadge type={order.type} size="sm" />
                  </div>
                  <p className="text-xs font-semibold text-slate-100 truncate">
                    {order.equipmentCode} — {order.equipmentName}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {order.description}
                  </p>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center text-right shrink-0 border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {formatCurrency(order.values?.totalCost)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Prazo: {formatDate(order.deadlineDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Critical Assets & Preventives */}
        <div className="space-y-6">
          {/* Critical Assets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Ativos Críticos (Classe A)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('equipment')}
                className="text-xs text-amber-400 hover:underline"
              >
                Ver Ativos
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5 shadow-xl">
              {criticalEquipment.map((eq) => (
                <div
                  key={eq.id}
                  onClick={() => onSelectEquipment(eq)}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-200">{eq.code}</span>
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Classe {eq.criticality}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-[170px]">{eq.name}</p>
                  </div>
                  <StatusBadge status={eq.status} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Preventives */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Próximas Preventivas
                </h3>
              </div>
              <button
                onClick={() => onNavigate('maintenance')}
                className="text-xs text-emerald-400 hover:underline"
              >
                Planos
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 shadow-xl">
              {preventivePlans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block truncate max-w-[180px]">
                      {plan.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {plan.equipmentCode} • {plan.frequency}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-amber-400">
                    {formatDate(plan.nextMaintenanceDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
