import React from 'react';
import { WorkOrderStatus, WorkOrderPriority, WorkOrderType, EquipmentStatus } from '../../types';
import { getStatusColor, getPriorityColor, getTypeBadge } from '../../lib/utils';

interface StatusBadgeProps {
  status: WorkOrderStatus | EquipmentStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const colors = getStatusColor(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {status}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: WorkOrderPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const colors = getPriorityColor(priority);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} whitespace-nowrap`}
    >
      {priority}
    </span>
  );
};

interface TypeBadgeProps {
  type: WorkOrderType;
  size?: 'sm' | 'md';
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = 'md' }) => {
  const badge = getTypeBadge(type);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border border-slate-700/60 ${badge.bg} ${badge.text} ${sizeClasses} whitespace-nowrap`}
    >
      {badge.label}
    </span>
  );
};
