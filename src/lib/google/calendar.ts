import { google } from 'googleapis';

import type { Booking, User } from '@prisma/client';

const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary';
const calendarTimeZone = process.env.GOOGLE_CALENDAR_TIMEZONE ?? 'Europe/Dublin';
const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const rawServiceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

function isCalendarConfigured() {
  return Boolean(serviceAccountEmail && rawServiceAccountKey);
}

function getServiceAccountClient() {
  if (!isCalendarConfigured()) {
    console.warn('Google service account credentials are not configured.');
    return null;
  }

  const privateKey = rawServiceAccountKey!.replace(/\\n/g, '\n');

  return new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
}

type BookingWithRelations = Booking & {
  createdBy: Pick<User, 'name' | 'email'> | null;
};

function buildEventPayload(booking: BookingWithRelations) {
  const descriptionLines = [
    booking.notes?.trim(),
    `Booked by ${booking.requesterName || booking.createdBy?.name || 'BCC member'}`,
    booking.requesterEmail
      ? `Contact: ${booking.requesterEmail}`
      : booking.createdBy?.email
        ? `Contact: ${booking.createdBy.email}`
        : null,
    booking.requesterPhone ? `Phone: ${booking.requesterPhone}` : null,
    "Henry's Cottage · Sandy Brae, Attical, Mournes",
  ]
    .filter(Boolean)
    .join('\n');

  return {
    summary: booking.title,
    description: descriptionLines,
    start: {
      dateTime: booking.startDate.toISOString(),
      timeZone: calendarTimeZone,
    },
    end: {
      dateTime: booking.endDate.toISOString(),
      timeZone: calendarTimeZone,
    },
  };
}

export async function syncBookingToCalendar(booking: BookingWithRelations) {
  const authClient = getServiceAccountClient();
  if (!authClient) {
    return null;
  }

  const calendar = google.calendar({
    version: 'v3',
    auth: authClient,
  });

  const payload = buildEventPayload(booking);

  try {
    if (booking.googleEventId) {
      const response = await calendar.events.update({
        calendarId,
        eventId: booking.googleEventId,
        requestBody: payload,
      });
      return response.data.id ?? booking.googleEventId;
    }

    const response = await calendar.events.insert({
      calendarId,
      requestBody: payload,
    });

    return response.data.id ?? null;
  } catch (error) {
    console.error('Failed to sync booking with Google Calendar', error);
    return null;
  }
}

export async function deleteBookingFromCalendar(booking: Booking) {
  if (!booking.googleEventId) {
    return;
  }

  const authClient = getServiceAccountClient();
  if (!authClient) {
    return;
  }

  const calendar = google.calendar({
    version: 'v3',
    auth: authClient,
  });

  try {
    await calendar.events.delete({
      calendarId,
      eventId: booking.googleEventId,
    });
  } catch (error) {
    console.error('Failed to remove Google Calendar event', error);
  }
}

