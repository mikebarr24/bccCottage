'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';

import { updateBookingStatusAction } from '@/app/bookings/actions';
import { BOOKING_STATUSES } from '@/lib/constants/bookings';
import { UpdateButton } from '@/components/ui/update-button';

type Props = {
  bookingId: string;
  currentStatus: string;
};

export function BookingStatusForm({ bookingId, currentStatus }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateBookingStatusAction, { ok: false });

  useEffect(() => {
    if (!state.ok) {
      return;
    }

    const timeout = setTimeout(() => setIsOpen(false), 0);
    return () => clearTimeout(timeout);
  }, [state.ok]);

  if (!isOpen) {
    return (
      <UpdateButton size="compact" className="self-start" onClick={() => setIsOpen(true)}>
        Update booking
      </UpdateButton>
    );
  }

  return (
    <form action={formAction} className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
      <input type="hidden" name="bookingId" value={bookingId} />
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Status
        </label>
        <select
          name="status"
          defaultValue={currentStatus}
          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
        >
          {BOOKING_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Share context for the requester"
          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
        />
      </div>

      <div className="mt-3 space-y-4">
        <div className="flex gap-2">
          <SubmitButton pending={pending} />
          <button
            type="button"
            disabled={pending}
            onClick={() => setIsOpen(false)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            Cancel
          </button>
        </div>
        {state.message && (
          <p
            className={`text-xs ${state.ok ? 'text-[#0f3d2e]' : 'text-rose-600'}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-md bg-[#0f3d2e] px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#0b2a1f] disabled:opacity-50"
    >
      {pending ? 'Saving…' : 'Save'}
    </button>
  );
}

