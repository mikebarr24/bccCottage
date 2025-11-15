import { IssueStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { issueCreateSchema, parseDateInput } from '@/lib/validation/issues';

export async function GET() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const issues = await prisma.issue.findMany({
    include: {
      reportedBy: true,
      assignedTo: true,
      updates: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: [
      { status: 'asc' },
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return NextResponse.json({ issues });
}

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json();
  const parsed = issueCreateSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }

  let targetDate: Date | null = null;
  try {
    targetDate = parseDateInput(parsed.data.targetDate);
  } catch {
    return NextResponse.json({ error: { targetDate: 'Invalid date supplied' } }, { status: 422 });
  }

  const issue = await prisma.issue.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      location: parsed.data.location ?? undefined,
      targetDate: targetDate ?? undefined,
      reportedById: session.user.id,
      assignedToId: parsed.data.assignedToId ?? undefined,
      updates: {
        create: {
          notes: 'Issue created',
          authorId: session.user.id,
          status: IssueStatus.OPEN,
        },
      },
    },
  });

  return NextResponse.json({ issue }, { status: 201 });
}

