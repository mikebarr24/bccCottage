'use server';

import { BookingStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteBookingFromCalendar, syncBookingToCalendar } from '@/lib/google/calendar';
import { bookingRequestSchema, bookingUpdateSchema, parseBookingDates } from '@/lib/validation/bookings';

type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function requestBookingAction(_: FormState, formData: FormData): Promise<FormState> {
  const session = await getServerAuthSession();

  const payload = {
    title: formData.get('title'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    notes: formData.get('notes'),
    requesterName: formData.get('requesterName'),
    requesterEmail: formData.get('requesterEmail'),
    requesterPhone: formData.get('requesterPhone'),
  };

  const parsed = bookingRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: 'Fix the highlighted fields and try again.',
    };
  }

  let startDate: Date;
  let endDate: Date;
  try {
    ({ startDate, endDate } = parseBookingDates(parsed.data.startDate, parsed.data.endDate));
  } catch {
    return {
      ok: false,
      fieldErrors: { endDate: ['Invalid date range'] },
    };
  }

  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
      AND: [
        { startDate: { lt: endDate } },
        { endDate: { gt: startDate } },
      ],
    },
  });

  if (overlappingBooking) {
    return {
      ok: false,
      message: 'Those dates conflict with another booking. Please pick a different slot.',
    };
  }

  try {
    await prisma.booking.create({
      data: {
        title: parsed.data.title.trim(),
        notes: parsed.data.notes?.trim() ?? null,
        startDate,
        endDate,
        status: BookingStatus.PENDING,
        createdById: session?.user?.id,
        requesterName: parsed.data.requesterName.trim(),
        requesterEmail: parsed.data.requesterEmail.trim(),
        requesterPhone: parsed.data.requesterPhone?.trim() || null,
      },
    });
  } catch (error) {
    console.error('Unable to create booking', error);
    return {
      ok: false,
      message: 'Unable to create the booking right now.',
    };
  }

  revalidatePath('/bookings');

  return {
    ok: true,
    message: 'Booking requested. An admin will confirm shortly.',
  };
}

export async function updateBookingStatusAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return { ok: false, message: 'You need to sign in.' };
  }

  if (session.user.role !== 'ADMIN') {
    return { ok: false, message: 'Only admins can update bookings.' };
  }

  const payload = {
    bookingId: formData.get('bookingId'),
    status: formData.get('status'),
    notes: formData.get('notes'),
  };

  const bookingId = typeof payload.bookingId === 'string' ? payload.bookingId : '';

  const parsed = bookingUpdateSchema.safeParse({
    status: payload.status,
    notes: payload.notes,
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { createdBy: true },
  });

  if (!booking) {
    return { ok: false, message: 'Booking not found.' };
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

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: parsed.data.status,
      notes: parsed.data.notes ?? booking.notes,
      approvedById: session.user.id,
      googleEventId,
      lastSyncedAt: new Date(),
    },
  });

  revalidatePath('/bookings');

  return {
    ok: true,
    message: `Booking updated to ${parsed.data.status.toLowerCase()}.`,
  };
}

