import type { IssuePriorityValue, IssueStatusValue } from '@/lib/constants/issues';

const statusClasses: Record<IssueStatusValue, string> = {
  OPEN: 'bg-[#fff4ce] text-[#7a4a00] ring-[#f1c361]',
  IN_PROGRESS: 'bg-[#fde2cf] text-[#7c2d12] ring-[#f7b683]',
  BLOCKED: 'bg-[#f8d0d0] text-[#811d1c] ring-[#f3a6a6]',
  RESOLVED: 'bg-[#d9f2dd] text-[#1f5132] ring-[#9fd5b0]',
  CLOSED: 'bg-[#e2e8f0] text-[#1e293b] ring-[#cbd5f5]',
};

const priorityClasses: Record<IssuePriorityValue, string> = {
  LOW: 'bg-[#e2e8f0] text-[#1e293b] ring-[#cbd5f5]',
  MEDIUM: 'bg-[#feecc8] text-[#7a4a00] ring-[#f7d89b]',
  HIGH: 'bg-[#fde2cf] text-[#7c2d12] ring-[#f7b683]',
  CRITICAL: 'bg-[#f8d0d0] text-[#811d1c] ring-[#f3a6a6]',
};

type BadgeProps = {
  value: string;
  className?: string;
};

export function IssueStatusBadge({ value, className }: BadgeProps) {
  const variant = statusClasses[value as IssueStatusValue] ?? 'bg-slate-100 text-slate-800';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variant} ${className ?? ''}`}
    >
      {value.replace('_', ' ')}
    </span>
  );
}

export function IssuePriorityBadge({ value, className }: BadgeProps) {
  const variant = priorityClasses[value as IssuePriorityValue] ?? 'bg-slate-100 text-slate-800';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variant} ${className ?? ''}`}
    >
      {value}
    </span>
  );
}

