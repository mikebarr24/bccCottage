import { BookingStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncBookingToCalendar } from '@/lib/google/calendar';

export async function POST() {
  const session = await getServerAuthSession();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.APPROVED,
    },
    include: {
      createdBy: true,
    },
  });

  let synced = 0;

  for (const booking of bookings) {
    const eventId = await syncBookingToCalendar(booking);
    if (eventId && eventId !== booking.googleEventId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          googleEventId: eventId,
          lastSyncedAt: new Date(),
        },
      });
      synced += 1;
    }
  }

  return NextResponse.json({ synced });
}

