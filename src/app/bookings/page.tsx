import Link from 'next/link';

import { redirect } from 'next/navigation';

import { BookingForm } from '@/components/bookings/booking-form';
import { BookingList } from '@/components/bookings/booking-list';
import { BookingStatus, Prisma } from '@prisma/client';
import { getServerAuthSession } from '@/lib/auth';
import { formatDate } from '@/lib/format-date';
import { prisma } from '@/lib/prisma';

type BookingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type BookingListData = Awaited<ReturnType<typeof prisma.booking.findMany>>;

const ORDER_OPTIONS = [
  { value: 'start_asc', label: 'Start date (Soonest)' },
  { value: 'start_desc', label: 'Start date (Latest)' },
  { value: 'status', label: 'Status' },
];

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const session = await getServerAuthSession();
  const isSignedIn = Boolean(session?.user);
  const resolvedParams = await searchParams;

  const action = resolvedParams?.action;
  if (action === 'reset') {
    redirect('/bookings');
  }

  const selectedStatusParam = resolvedParams?.status;
  const selectedStatus = Array.isArray(selectedStatusParam)
    ? selectedStatusParam[0]
    : selectedStatusParam;
  const selectedOrderParam = resolvedParams?.order;
  const selectedOrder = Array.isArray(selectedOrderParam)
    ? selectedOrderParam[0]
    : selectedOrderParam;
  const hideDeclinedValues = resolvedParams?.hideDeclined;
  const hideDeclined =
    hideDeclinedValues === undefined
      ? false
      : Array.isArray(hideDeclinedValues)
        ? hideDeclinedValues.includes('on')
        : hideDeclinedValues === 'on';
  const hidePastValues = resolvedParams?.hidePast;
  const hidePast =
    hidePastValues === undefined
      ? true
      : Array.isArray(hidePastValues)
        ? hidePastValues.includes('on')
        : hidePastValues === 'on';

  const filter =
    selectedStatus && selectedStatus !== 'ALL'
      ? {
          status: selectedStatus as BookingStatus,
        }
      : {};

  const bookings = await prisma.booking.findMany({
    where: {
      ...filter,
      ...(hideDeclined
        ? {
            status: {
              notIn: ['DECLINED', 'CANCELLED'],
            },
          }
        : {}),
      ...(hidePast
        ? {
            endDate: {
              gte: new Date(),
            },
          }
        : {}),
      ...(!isSignedIn
        ? {
            status: BookingStatus.APPROVED,
          }
        : {}),
    },
    include: {
      createdBy: true,
      approvedBy: true,
    },
    orderBy: mapBookingOrder(selectedOrder),
  });

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-[#0f3d2e] via-[#143726] to-[#1a1a1a] p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-white/80">Henry&apos;s Cottage</p>
            <h1 className="mt-2 text-3xl font-bold">Bookings &amp; availability</h1>
            <p className="mt-3 max-w-3xl text-white/80">
              Reserve the Belfast Climbing Club base in the Mournes for club meets, training
              weekends, or a quiet retreat. All bookings appear on the shared Google Calendar to
              avoid clashes.
            </p>
          </div>
          <Link
            href="#request"
            className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#0f3d2e] shadow-sm transition hover:bg-[#fff4ce]"
          >
            Request the cottage
          </Link>
        </div>
      </section>

      {isSignedIn && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="flex flex-wrap items-end gap-4" action="/bookings">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="status"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={selectedStatus ?? 'ALL'}
                className="w-48 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/50"
              >
                {STATUS_FILTERS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="order"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Order by
              </label>
              <select
                id="order"
                name="order"
                defaultValue={selectedOrder ?? 'start_asc'}
                className="w-48 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/50"
              >
                {ORDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                name="action"
                value="apply"
                className="inline-flex items-center rounded-md bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2a1f]"
              >
                Apply filters
              </button>
              <Link
                href="/bookings?action=reset"
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                Reset
              </Link>
            </div>

            <div className="flex flex-col gap-2 text-sm text-slate-600">
              <label className="inline-flex items-center gap-2">
                <input type="hidden" name="hideDeclined" value="off" />
                <input
                  type="checkbox"
                  name="hideDeclined"
                  value="on"
                  defaultChecked={hideDeclined}
                  className="h-4 w-4 rounded border-slate-300 text-[#0f3d2e] focus:ring-[#d4a017]/50"
                />
                Hide declined/cancelled
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="hidden" name="hidePast" value="off" />
                <input
                  type="checkbox"
                  name="hidePast"
                  value="on"
                  defaultChecked={hidePast}
                  className="h-4 w-4 rounded border-slate-300 text-[#0f3d2e] focus:ring-[#d4a017]/50"
                />
                Hide past bookings
              </label>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[3fr,2fr]">
        {isSignedIn ? (
          <BookingList bookings={bookings} isAdmin={Boolean(isAdmin)} />
        ) : (
          <PublicBookingDates bookings={bookings} />
        )}
        <div id="request">
          <BookingForm />
        </div>
      </div>
    </div>
  );
}

function mapBookingOrder(order?: string): Prisma.BookingOrderByWithRelationInput[] {
  switch (order) {
    case 'start_desc':
      return [{ startDate: 'desc' }];
    case 'status':
      return [{ status: 'asc' }, { startDate: 'asc' }];
    default:
      return [{ startDate: 'asc' }];
  }
}

function PublicBookingDates({ bookings }: { bookings: BookingListData }) {
  return (
    <div className="rounded-2xl border border-[#d4a017]/40 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[#0f3d2e]">Upcoming reservations</h2>
      <p className="text-sm text-slate-500">
        These dates are already booked. Submit a request and the committee will confirm
        availability.
      </p>
      <div className="mt-4 space-y-3">
        {bookings.length === 0 && <p className="text-sm text-slate-500">No reservations yet.</p>}
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex flex-col rounded-xl border border-slate-200 bg-[#fffaf4] px-4 py-3 text-sm text-slate-700"
          >
            <span className="font-semibold text-[#0f3d2e]">
              {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Need full details?{' '}
        <Link href="/signin" className="text-[#0f3d2e] underline decoration-[#d4a017]/60">
          Sign in
        </Link>{' '}
        with your committee credentials.
      </p>
    </div>
  );
}
