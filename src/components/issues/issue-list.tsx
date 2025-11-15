import type { Prisma } from '@prisma/client';

import { IssuePriorityBadge, IssueStatusBadge } from '@/components/issues/issue-badges';
import {
  ListCard,
  ListCardActions,
  ListCardDescription,
  ListCardHeader,
  ListCardMeta,
  ListCardTitle,
} from '@/components/ui/list-card';
import { UpdateButton } from '@/components/ui/update-button';
import { formatDate } from '@/lib/format-date';

export type IssueListItem = Prisma.IssueGetPayload<{
  include: {
    reportedBy: true;
    assignedTo: true;
    updates: {
      take: 1;
    };
  };
}>;

type IssueListProps = {
  issues: IssueListItem[];
  showUpdateButton?: boolean;
};

export function IssueList({ issues, showUpdateButton = false }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center">
        <p className="text-base font-medium text-slate-900">No issues just yet 🎉</p>
        <p className="text-sm text-slate-500">
          Everything looks good. If you spot something broken, log it using the form.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => {
        const latestUpdate = issue.updates.at(0);
        return (
          <ListCard
            key={issue.id}
            className="transition hover:border-[#d4a017]/60 hover:shadow-md"
          >
            <ListCardHeader>
              <IssueStatusBadge value={issue.status} />
              <IssuePriorityBadge value={issue.priority} />
              {issue.location && (
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {issue.location}
                </span>
              )}
            </ListCardHeader>

            <div className="mt-2 space-y-1">
              <ListCardTitle>{issue.title}</ListCardTitle>
              <ListCardDescription className="line-clamp-2">
                {issue.description}
              </ListCardDescription>
            </div>

            <ListCardMeta>
              <span>Opened by {issue.reportedBy?.name ?? 'Unknown member'}</span>
              {issue.assignedTo?.name && <span>Assigned to {issue.assignedTo.name}</span>}
              {latestUpdate && (
                <span className="italic">Last update {formatDate(latestUpdate.createdAt)}</span>
              )}
            </ListCardMeta>
            {showUpdateButton && (
              <ListCardActions>
                <UpdateButton href={`/issues/${issue.id}`} />
              </ListCardActions>
            )}
          </ListCard>
        );
      })}
    </div>
  );
}

