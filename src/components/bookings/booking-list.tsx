import type { Prisma } from '@prisma/client';

import { BookingStatusBadge } from '@/components/bookings/booking-badges';
import { BookingStatusForm } from '@/components/bookings/booking-status-form';
import {
  ListCard,
  ListCardActions,
  ListCardDescription,
  ListCardHeader,
  ListCardTitle,
} from '@/components/ui/list-card';
import { formatDateTime } from '@/lib/format-date';

export type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    createdBy: true;
    approvedBy: true;
  };
}>;

type Props = {
  bookings: BookingWithRelations[];
  isAdmin: boolean;
};

export function BookingList({ bookings, isAdmin }: Props) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center">
        <p className="text-base font-medium text-slate-900">No bookings yet</p>
        <p className="text-sm text-slate-500">Be the first to schedule a getaway.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <ListCard
          key={booking.id}
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="space-y-3">
            <ListCardHeader>
              <BookingStatusBadge status={booking.status as never} />
              {booking.googleEventId && (
                <span className="text-xs uppercase text-[#d4a017]">Synced to Google</span>
              )}
            </ListCardHeader>
            <div className="space-y-1">
              <ListCardTitle>{booking.title}</ListCardTitle>
              <ListCardDescription>
                {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
              </ListCardDescription>
              <ListCardDescription className="text-slate-500">
                Requested by {booking.requesterName || booking.createdBy?.name || 'Unknown'} •{' '}
                {booking.requesterEmail ? (
                  <a
                    href={`mailto:${booking.requesterEmail}`}
                    className="text-[#0f3d2e] underline decoration-[#d4a017]/60 hover:text-[#d4a017]"
                  >
                    {booking.requesterEmail}
                  </a>
                ) : (
                  booking.createdBy?.email ?? 'no email'
                )}
              </ListCardDescription>
              {booking.requesterPhone && (
                <ListCardDescription className="text-xs uppercase tracking-wide text-slate-400">
                  Phone: {booking.requesterPhone}
                </ListCardDescription>
              )}
              {booking.notes && (
                <ListCardDescription>
                  <span className="font-medium">Notes:</span> {booking.notes}
                </ListCardDescription>
              )}
            </div>
          </div>
          {isAdmin && (
            <ListCardActions className="justify-end lg:mt-0">
              <BookingStatusForm bookingId={booking.id} currentStatus={booking.status} />
            </ListCardActions>
          )}
        </ListCard>
      ))}
    </div>
  );
}

function formatDate(date: Date | string) {
  return formatDateTime(date);
}

