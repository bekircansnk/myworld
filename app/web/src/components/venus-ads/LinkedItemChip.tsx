import React from 'react';
import { Target, FlaskConical, Palette, ListTodo } from 'lucide-react';

export type LinkedItemType = 'campaign' | 'experiment' | 'creative' | 'task';

interface LinkedItemChipProps {
  type: LinkedItemType;
  label: string;
  onClick?: () => void;
}

const TYPE_CONFIG = {
  campaign: {
    icon: Target,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40',
    border: 'border-indigo-100 dark:border-indigo-800/50'
  },
  experiment: {
    icon: FlaskConical,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40',
    border: 'border-blue-100 dark:border-blue-800/50'
  },
  creative: {
    icon: Palette,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40',
    border: 'border-purple-100 dark:border-purple-800/50'
  },
  task: {
    icon: ListTodo,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40',
    border: 'border-emerald-100 dark:border-emerald-800/50'
  }
};

export function LinkedItemChip({ type, label, onClick }: LinkedItemChipProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <button
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      disabled={!onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all truncate max-w-[150px] ${config.bg} ${config.color} ${config.border} ${onClick ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'}`}
      title={label}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
