'use server';

import { IssueStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { issueCreateSchema, issueUpdateLogSchema, parseDateInput } from '@/lib/validation/issues';

export type FormActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createIssueAction(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return { ok: false, message: 'You must be signed in to log an issue.' };
  }

  const payload = {
    title: formData.get('title'),
    description: formData.get('description'),
    priority: formData.get('priority'),
    location: formData.get('location'),
    targetDate: formData.get('targetDate'),
  };

  const parsed = issueCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: 'Please fix the highlighted fields.',
    };
  }

  let targetDate: Date | null = null;
  try {
    targetDate = parseDateInput(parsed.data.targetDate);
  } catch {
    return {
      ok: false,
      fieldErrors: { targetDate: ['Invalid target date'] },
    };
  }

  try {
    await prisma.issue.create({
      data: {
        title: parsed.data.title.trim(),
        description: parsed.data.description.trim(),
        priority: parsed.data.priority,
        location: parsed.data.location?.trim() || null,
        targetDate: targetDate ?? undefined,
        reportedById: session.user.id,
        updates: {
          create: {
            notes: 'Issue created',
            authorId: session.user.id,
            status: IssueStatus.OPEN,
          },
        },
      },
    });
  } catch (error) {
    console.error('Failed to create issue', error);
    return {
      ok: false,
      message: 'Unable to save the issue. Please try again.',
    };
  }

  revalidatePath('/issues');

  return {
    ok: true,
    message: 'Issue logged successfully.',
  };
}

export async function createIssueUpdateAction(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return { ok: false, message: 'You must be signed in to update an issue.' };
  }

  const payload = {
    issueId: formData.get('issueId'),
    notes: formData.get('notes'),
    status: formData.get('status') || undefined,
  };

  const parsed = issueUpdateLogSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: 'Please review your update before submitting.',
    };
  }

  const { issueId, notes, status } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.issueUpdate.create({
        data: {
          issueId,
          notes: notes.trim(),
          status,
          authorId: session.user.id,
        },
      });

      if (status) {
        await tx.issue.update({
          where: { id: issueId },
          data: { status },
        });
      }
    });
  } catch (error) {
    console.error('Failed to update issue', error);
    return {
      ok: false,
      message: 'Unable to update the issue right now.',
    };
  }

  revalidatePath('/issues');
  revalidatePath(`/issues/${parsed.data.issueId}`);

  return {
    ok: true,
    message: status
      ? `Issue moved to ${status.replace('_', ' ').toLowerCase()}.`
      : 'Update added.',
  };
}

