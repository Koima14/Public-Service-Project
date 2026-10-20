import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, ArrowDown } from 'lucide-react';

export default function PriorityBadge({ priority = 'Medium' }) {
  const configs = {
    'Low': {
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: ArrowDown,
      dot: 'bg-slate-400'
    },
    'Medium': {
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: AlertCircle,
      dot: 'bg-sky-500'
    },
    'High': {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
      dot: 'bg-amber-500'
    },
    'Critical': {
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: ShieldAlert,
      dot: 'bg-red-500 animate-pulse'
    }
  };

  const config = configs[priority] || configs['Medium'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{priority}</span>
    </span>
  );
}
