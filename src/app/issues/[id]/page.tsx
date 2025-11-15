import { notFound, redirect } from 'next/navigation';

import { IssuePriorityBadge, IssueStatusBadge } from '@/components/issues/issue-badges';
import { IssueUpdateForm } from '@/components/issues/issue-update-form';
import { getServerAuthSession } from '@/lib/auth';
import { formatDate, formatDateTime } from '@/lib/format-date';
import { prisma } from '@/lib/prisma';

type IssueDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function IssueDetailPage({ params }: IssueDetailPageProps) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect('/signin');
  }

  const resolvedParams = await params;
  const issueId = resolvedParams?.id;
  if (!issueId) {
    return null;
  }

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      reportedBy: true,
      assignedTo: true,
      updates: {
        include: {
          author: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!issue) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white/90 p-6 shadow-md lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <IssueStatusBadge value={issue.status} />
            <IssuePriorityBadge value={issue.priority} />
            {issue.location && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {issue.location}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{issue.title}</h1>
          <p className="mt-2 text-slate-600">{issue.description}</p>
        </div>
        <div className="min-w-[260px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium text-slate-900">Reported by</dt>
              <dd>{issue.reportedBy?.name ?? 'Unknown'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-slate-900">Assigned to</dt>
              <dd>{issue.assignedTo?.name ?? 'Unassigned'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-slate-900">Opened</dt>
              <dd>{formatDate(issue.createdAt)}</dd>
            </div>
            {issue.targetDate && (
              <div className="flex justify-between">
                <dt className="font-medium text-slate-900">Target date</dt>
                <dd>{formatDate(issue.targetDate)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Progress log</h2>
          <ul className="space-y-4 border-l-2 border-slate-200 pl-6">
            {issue.updates.map((update) => (
              <li key={update.id} className="relative">
                <span className="absolute -left-9 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#d4a017] ring-2 ring-[#f1c361]">
                  ●
                </span>
                <div className="rounded-xl bg-slate-50/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>{update.author?.name ?? 'System'}</span>
                    <span>{formatDateTime(update.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{update.notes}</p>
                  {update.status && (
                    <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#0f3d2e]">
                      Status: {update.status.replace('_', ' ')}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <IssueUpdateForm issueId={issue.id} />
      </div>
    </div>
  );
}

