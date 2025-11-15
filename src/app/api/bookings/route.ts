import { BookingStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bookingRequestSchema, parseBookingDates } from '@/lib/validation/bookings';

export async function GET() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    include: {
      createdBy: true,
      approvedBy: true,
    },
    orderBy: { startDate: 'asc' },
  });

  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bookingRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }

  let startDate: Date;
  let endDate: Date;

  try {
    ({ startDate, endDate } = parseBookingDates(parsed.data.startDate, parsed.data.endDate));
  } catch {
    return NextResponse.json({ error: { endDate: 'Invalid date range' } }, { status: 422 });
  }

  const overlap = await prisma.booking.findFirst({
    where: {
      status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
      AND: [{ startDate: { lt: endDate } }, { endDate: { gt: startDate } }],
    },
  });

  if (overlap) {
    return NextResponse.json(
      { error: 'Those dates are already reserved. Please choose another window.' },
      { status: 409 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      title: parsed.data.title,
      notes: parsed.data.notes ?? null,
      startDate,
      endDate,
      status: BookingStatus.PENDING,
      createdById: session.user.id,
      requesterName: parsed.data.requesterName.trim(),
      requesterEmail: parsed.data.requesterEmail.trim(),
      requesterPhone: parsed.data.requesterPhone?.trim() || null,
    },
  });

  return NextResponse.json({ booking }, { status: 201 });
}

