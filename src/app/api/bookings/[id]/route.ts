import { BookingStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteBookingFromCalendar, syncBookingToCalendar } from '@/lib/google/calendar';
import { bookingUpdateSchema } from '@/lib/validation/bookings';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      createdBy: true,
      approvedBy: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const raw = await request.json();
  const parsed = bookingUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 422 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { createdBy: true },
  });

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  let googleEventId = booking.googleEventId;

  if (parsed.data.status === BookingStatus.APPROVED) {
    const eventId = await syncBookingToCalendar(booking);
    googleEventId = eventId ?? googleEventId;
  }

  const cancelStatuses: BookingStatus[] = [BookingStatus.CANCELLED, BookingStatus.DECLINED];
  if (cancelStatuses.includes(parsed.data.status)) {
    await deleteBookingFromCalendar(booking);
    googleEventId = null;
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: parsed.data.status,
      notes: parsed.data.notes ?? booking.notes,
      approvedById: session.user.id,
      googleEventId,
      lastSyncedAt: new Date(),
    },
    include: {
      createdBy: true,
      approvedBy: true,
    },
  });

  return NextResponse.json({ booking: updated });
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

  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  await deleteBookingFromCalendar(booking);
  await prisma.booking.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

