'use client';

import { useActionState, useEffect, useRef } from 'react';

import { requestBookingAction } from '@/app/bookings/actions';

export function BookingForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction, pending] = useActionState(requestBookingAction, { ok: false });

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Request the cottage</h2>
        <p className="text-sm text-slate-500">
          This form is open to BCC members and visiting clubs. We&apos;ll email you once the committee
          approves the dates.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="requesterName">
            Your name
          </label>
          <input
            id="requesterName"
            name="requesterName"
            required
            placeholder="Jane Climber"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
          />
          {state.fieldErrors?.requesterName && (
            <p className="text-sm text-rose-600">{state.fieldErrors.requesterName[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="requesterEmail">
            Email
          </label>
          <input
            id="requesterEmail"
            name="requesterEmail"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
          />
          {state.fieldErrors?.requesterEmail && (
            <p className="text-sm text-rose-600">{state.fieldErrors.requesterEmail[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="requesterPhone">
          Phone (optional)
        </label>
        <input
          id="requesterPhone"
          name="requesterPhone"
          placeholder="+44 7000 000000"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="title">
          Booking title
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="Weekend club meet"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
        />
        {state.fieldErrors?.title && (
          <p className="text-sm text-rose-600">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="startDate">
            Arrive
          </label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
          />
          {state.fieldErrors?.startDate && (
            <p className="text-sm text-rose-600">{state.fieldErrors.startDate[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="endDate">
            Depart
          </label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
          />
          {state.fieldErrors?.endDate && (
            <p className="text-sm text-rose-600">{state.fieldErrors.endDate[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="notes">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Number of people, gear plans, or other context."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
        />
      </div>

      {state.message && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            state.ok ? 'bg-[#e9f3eb] text-[#0f3d2e]' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-md bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2a1f] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? 'Submitting…' : 'Request booking'}
      </button>
    </form>
  );
}

