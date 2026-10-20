import React from 'react';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const configs = {
    'Pending': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
      icon: Clock,
      label: 'Pending Review'
    },
    'In Progress': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
      icon: Loader2,
      label: 'In Progress',
      iconClass: 'animate-spin'
    },
    'Resolved': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
      icon: CheckCircle2,
      label: 'Resolved'
    },
    'Rejected': {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
      icon: XCircle,
      label: 'Rejected'
    }
  };

  const config = configs[status] || configs['Pending'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ring-1 ${config.bg} ${sizeClasses[size]}`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.iconClass || ''}`} />
      <span>{config.label}</span>
    </span>
  );
}
