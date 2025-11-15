'use client';

import { useActionState, useEffect, useRef } from 'react';

import { createIssueAction, type FormActionState } from '@/app/issues/actions';
import { ISSUE_PRIORITIES } from '@/lib/constants/issues';

const initialState: FormActionState = {
  ok: false,
};

export function IssueForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction, pending] = useActionState(createIssueAction, initialState);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Log a new issue</h2>
        <p className="text-sm text-slate-500">
          Capture problems as soon as you notice them to keep Henry&apos;s Cottage running smoothly.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="E.g. Electric heater trips the circuit"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
        />
        {state.fieldErrors?.title && (
          <p className="text-sm text-rose-600">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          placeholder="Describe what happened, what you tried, and any workarounds."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
        />
        {state.fieldErrors?.description && (
          <p className="text-sm text-rose-600">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="MEDIUM"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
          >
            {ISSUE_PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="targetDate">
            Target date
          </label>
          <input
            type="date"
            id="targetDate"
            name="targetDate"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
          />
          {state.fieldErrors?.targetDate && (
            <p className="text-sm text-rose-600">{state.fieldErrors.targetDate[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="location">
          Location (optional)
        </label>
        <input
          id="location"
          name="location"
          placeholder="Kitchen, upstairs stove, etc."
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
        {pending ? 'Saving…' : 'Create issue'}
      </button>
    </form>
  );
}

