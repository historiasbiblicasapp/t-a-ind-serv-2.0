import React from 'react';
import { useData } from '../contexts/DataContext';
import { StatCard } from '../components/common/StatCard';
import { formatCurrency } from '../lib/utils';
import {
  BarChart3,
  Activity,
  Clock,
  Wrench,
  TrendingUp,
  AlertOctagon,
  Percent,
  CheckCircle2,
  PieChart
} from 'lucide-react';

export const IndicatorsView: React.FC = () => {
  const { kpis, workOrders, equipment } = useData();

  // Root cause breakdown simulation
  const typeCounts = {
    Corretiva: workOrders.filter(w => w.type === 'Corretiva').length,
    Preventiva: workOrders.filter(w => w.type === 'Preventiva').length,
    Preditiva: workOrders.filter(w => w.type === 'Preditiva').length,
    Inspeção: workOrders.filter(w => w.type === 'Inspeção').length,
    Emergencial: workOrders.filter(w => w.type === 'Emergencial').length,
  };

  const total = workOrders.length || 1;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          Indicadores de Confiabilidade & Engenharia de Manutenção
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Cálculo automatizado de MTBF, MTTR, Disponibilidade Física (%), Taxa de Falhas e Backlog
        </p>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Disponibilidade Física (A)"
          value={`${kpis.operationalAvailabilityPercent}%`}
          icon={Activity}
          subtext="A = MTBF / (MTBF + MTTR)"
          color="emerald"
        />

        <StatCard
          title="MTBF (Confiabilidade)"
          value={`${kpis.mtbfHours} h`}
          icon={Clock}
          subtext="Tempo Médio Entre Falhas"
          color="blue"
        />

        <StatCard
          title="MTTR (Mantenabilidade)"
          value={`${kpis.mttrHours} h`}
          icon={Wrench}
          subtext="Tempo Médio para Reparo"
          color="amber"
        />

        <StatCard
          title="Backlog da Manutenção"
          value="2.8 sem"
          icon={AlertOctagon}
          subtext="Carga de trabalho acumulada"
          color="purple"
        />
      </div>

      {/* Mathematical Breakdown & Formulas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Type Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            Distribuição por Tipo de OS
          </h3>

          <div className="space-y-3">
            {Object.entries(typeCounts).map(([type, count]) => {
              const percent = Math.round((count / total) * 100);
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{type}</span>
                    <span className="font-mono text-slate-400">{count} OS ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        type === 'Preventiva'
                          ? 'bg-emerald-400'
                          : type === 'Corretiva'
                          ? 'bg-amber-400'
                          : type === 'Emergencial'
                          ? 'bg-rose-500'
                          : 'bg-blue-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-bold text-amber-400 block mb-0.5">Norma Recomendada:</span>
            A relação ideal em plantas industriais de classe mundial é 80% Preventiva/Preditiva e &le;20% Corretiva.
          </div>
        </div>

        {/* Reliability Engineering Formulas */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Fórmulas & Métodos de Cálculo Automatizados
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase text-amber-400">1. Disponibilidade Operacional</span>
              <p className="font-mono text-xs bg-slate-900 p-2 rounded text-slate-200 border border-slate-800">
                A = [ (HT - DT) / HT ] &times; 100
              </p>
              <p className="text-[11px] text-slate-400 leading-normal">
                HT = Horas Totais de Calendário (720h/mês) | DT = Horas Paradas por Falha.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase text-blue-400">2. MTBF (Confiabilidade)</span>
              <p className="font-mono text-xs bg-slate-900 p-2 rounded text-slate-200 border border-slate-800">
                MTBF = Horas em Operação / Nº Falhas
              </p>
              <p className="text-[11px] text-slate-400 leading-normal">
                Indica o tempo médio que o equipamento funciona sem quebras não planejadas.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase text-emerald-400">3. MTTR (Mantenabilidade)</span>
              <p className="font-mono text-xs bg-slate-900 p-2 rounded text-slate-200 border border-slate-800">
                MTTR = Tempo Total de Reparo / Nº Falhas
              </p>
              <p className="text-[11px] text-slate-400 leading-normal">
                Mede a eficiência, preparo técnico e disponibilidade de ferramentas da equipe.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase text-purple-400">4. Backlog (Semanas)</span>
              <p className="font-mono text-xs bg-slate-900 p-2 rounded text-slate-200 border border-slate-800">
                Backlog = Total Horas OS Abertas / Capacidade Semanal
              </p>
              <p className="text-[11px] text-slate-400 leading-normal">
                Permite dimensionar a necessidade de hora extra ou contratação externa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
