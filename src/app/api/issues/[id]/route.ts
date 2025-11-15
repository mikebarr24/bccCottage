import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { issueUpdateSchema, parseDateInput } from '@/lib/validation/issues';

const issuePatchSchema = issueUpdateSchema.extend({
  notes: z.string().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const issue = await prisma.issue.findUnique({
    where: { id },
    include: {
      reportedBy: true,
      assignedTo: true,
      updates: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!issue) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
  }

  return NextResponse.json({ issue });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawBody = await request.json();
  const parsed = issuePatchSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (data.title) updateData.title = data.title;
  if (data.description) updateData.description = data.description;
  if (data.status) updateData.status = data.status;
  if (data.priority) updateData.priority = data.priority;
  if (data.location || data.location === '') updateData.location = data.location || null;

  if (Object.prototype.hasOwnProperty.call(rawBody, 'assignedToId')) {
    updateData.assignedToId = data.assignedToId ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(rawBody, 'targetDate')) {
    try {
      updateData.targetDate =
        data.targetDate && data.targetDate.length > 0 ? parseDateInput(data.targetDate) : null;
    } catch {
      return NextResponse.json({ error: { targetDate: 'Invalid date supplied' } }, { status: 422 });
    }
  }

  let issue;

  if (Object.keys(updateData).length > 0) {
    issue = await prisma.issue.update({
      where: { id },
      data: updateData,
    });
  } else {
    issue = await prisma.issue.findUnique({ where: { id } });
  }

  if (!issue) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
  }

  if (data.notes || data.status) {
    await prisma.issueUpdate.create({
      data: {
        issueId: id,
        authorId: session.user.id,
        notes: data.notes ?? `Status updated to ${data.status}`,
        status: data.status,
      },
    });
  }

  return NextResponse.json({ issue });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.issue.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

