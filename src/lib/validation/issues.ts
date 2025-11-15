import { IssuePriority, IssueStatus } from '@prisma/client';
import { z } from 'zod';

export const issueCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.nativeEnum(IssuePriority).default(IssuePriority.MEDIUM),
  location: z.string().optional(),
  targetDate: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
});

export const issueUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.nativeEnum(IssueStatus).optional(),
  priority: z.nativeEnum(IssuePriority).optional(),
  assignedToId: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
});

export const issueUpdateLogSchema = z.object({
  issueId: z.string().min(1),
  notes: z.string().min(2, 'Please provide a bit more detail'),
  status: z.nativeEnum(IssueStatus).optional(),
});

export function parseDateInput(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date');
  }

  return parsed;
}

