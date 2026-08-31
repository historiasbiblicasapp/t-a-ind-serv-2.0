import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatCurrency } from '../lib/utils';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import {
  CalendarDays,
  Clock,
  Wrench,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { WorkOrder } from '../types';

interface PlanningViewProps {
  onSelectWorkOrder?: (order: WorkOrder) => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ onSelectWorkOrder }) => {
  const { workOrders, preventivePlans, equipment } = useData();
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Group work orders by deadline date
  const plannedOrders = workOrders.filter(w => w.status === 'Planejada' || w.status === 'Aberta' || w.status === 'Em execução');

  // Days simulation for calendar
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + (selectedWeek * 7));
    return d;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-400" />
            Planejamento e Controle de Manutenção (PCM)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cronograma semanal de intervenções, nivelamento de mão de obra e paradas programadas
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setSelectedWeek(prev => prev - 1)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
            title="Semana Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-200 px-3">
            {selectedWeek === 0 ? 'Semana Atual' : selectedWeek > 0 ? `+${selectedWeek} Semanas` : `${selectedWeek} Semanas`}
          </span>
          <button
            onClick={() => setSelectedWeek(prev => prev + 1)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
            title="Próxima Semana"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Timeline Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {days.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const isToday = day.toDateString() === new Date().toDateString();
          const dayName = day.toLocaleDateString('pt-BR', { weekday: 'short' });
          const dayOrders = plannedOrders.filter(o => o.deadlineDate === dateStr || o.date === dateStr);

          return (
            <div
              key={idx}
              className={`rounded-xl border p-3 flex flex-col min-h-[360px] ${
                isToday
                  ? 'bg-amber-500/5 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              {/* Day Header */}
              <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{dayName}</span>
                  <span className={`text-base font-extrabold font-mono ${isToday ? 'text-amber-400' : 'text-slate-200'}`}>
                    {day.getDate()}/{day.getMonth() + 1}
                  </span>
                </div>
                {isToday && (
                  <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold rounded">
                    HOJE
                  </span>
                )}
              </div>

              {/* Day Cards */}
              <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                {dayOrders.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-4 text-[11px] text-slate-600">
                    Sem ordens agendadas
                  </div>
                ) : (
                  dayOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => onSelectWorkOrder && onSelectWorkOrder(order)}
                      className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer space-y-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-amber-400">
                          {order.orderNumber}
                        </span>
                        <PriorityBadge priority={order.priority} size="sm" />
                      </div>
                      <p className="text-xs font-semibold text-slate-100 truncate">
                        {order.equipmentCode}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {order.description}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                        <span className="text-slate-400">{order.responsibleName || 'Técnico'}</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          {formatCurrency(order.values?.totalCost)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
