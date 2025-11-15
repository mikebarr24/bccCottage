import Link from 'next/link';
import { redirect } from 'next/navigation';

import { IssueList } from '@/components/issues/issue-list';
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ISSUE_STATUSES } from '@/lib/constants/issues';
import { IssueStatus, Prisma } from '@prisma/client';

type IssuesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ORDER_OPTIONS = [
  { value: 'priority_desc', label: 'Priority (High → Low)' },
  { value: 'priority_asc', label: 'Priority (Low → High)' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

export default async function IssuesPage({ searchParams }: IssuesPageProps) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect('/signin');
  }

  const resolvedParams = await searchParams;
  const actionParam = resolvedParams?.action;
  if (actionParam === 'reset') {
    redirect('/issues');
  }
  const selectedStatusParam = resolvedParams?.status;
  const selectedStatus = Array.isArray(selectedStatusParam)
    ? selectedStatusParam[0]
    : selectedStatusParam;
  const selectedOrderParam = resolvedParams?.order;
  const selectedOrder = Array.isArray(selectedOrderParam)
    ? selectedOrderParam[0]
    : selectedOrderParam;
  const hideClosedParam = resolvedParams?.hideClosed;
  const hideClosed = Array.isArray(hideClosedParam) ? hideClosedParam[0] === 'on' : hideClosedParam === 'on';

  const filter =
    selectedStatus && selectedStatus !== 'ALL'
      ? {
          status: selectedStatus as IssueStatus,
        }
      : {};

  const orderBy = mapOrder(selectedOrder);

  const issues = await prisma.issue.findMany({
    where: {
      ...filter,
      ...(hideClosed
        ? {
            status: {
              notIn: ['RESOLVED', 'CLOSED'],
            },
          }
        : {}),
    },
    include: {
      reportedBy: true,
      assignedTo: true,
      updates: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Henry&apos;s Cottage issues</h1>
          <p className="text-sm text-slate-500">Track open maintenance tasks and progress updates.</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/issues/new"
            className="inline-flex items-center rounded-md bg-[#0f3d2e] px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-[#0b2a1f]"
          >
            Log new issue
          </Link>
          <Link
            href="/bookings"
            className="inline-flex items-center rounded-md border border-[#d4a017]/60 px-4 py-2 font-semibold text-[#0f3d2e] transition hover:bg-[#fff4ce]"
          >
            View bookings
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form className="flex flex-wrap items-end gap-4" action="/issues">
          <div className="flex flex-col gap-1">
            <label htmlFor="status" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={selectedStatus ?? 'ALL'}
              className="w-48 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/50"
            >
              <option value="ALL">All statuses</option>
              {ISSUE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="order" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Order by
            </label>
            <select
              id="order"
              name="order"
              defaultValue={selectedOrder ?? 'priority_desc'}
              className="w-48 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/50"
            >
              {ORDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              name="action"
              value="apply"
              className="inline-flex items-center rounded-md bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2a1f]"
            >
              Apply filters
            </button>
            <Link
              href="/issues?action=reset"
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              Reset
            </Link>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              name="hideClosed"
              defaultChecked={hideClosed}
              className="h-4 w-4 rounded border-slate-300 text-[#0f3d2e] focus:ring-[#d4a017]/50"
            />
            Hide resolved/closed
          </label>
        </form>
      </div>

      <IssueList issues={issues} showUpdateButton />
    </div>
  );
}

function mapOrder(order?: string): Prisma.IssueOrderByWithRelationInput[] {
  switch (order) {
    case 'priority_asc':
      return [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ];
    case 'newest':
      return [{ createdAt: 'desc' }];
    case 'oldest':
      return [{ createdAt: 'asc' }];
    default:
      return [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ];
  }
}

