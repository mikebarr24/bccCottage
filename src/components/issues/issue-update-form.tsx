'use client';

import { useActionState, useEffect, useRef } from 'react';

import { createIssueUpdateAction, type FormActionState } from '@/app/issues/actions';
import { ISSUE_STATUSES } from '@/lib/constants/issues';

const initialState: FormActionState = {
  ok: false,
};

type IssueUpdateFormProps = {
  issueId: string;
  showStatusField?: boolean;
};

export function IssueUpdateForm({ issueId, showStatusField = true }: IssueUpdateFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction, pending] = useActionState(createIssueUpdateAction, initialState);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 rounded-lg border border-slate-200 bg-white/70 p-4 shadow-sm"
    >
      <input type="hidden" name="issueId" value={issueId} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor={`notes-${issueId}`}>
          Update notes
        </label>
        <textarea
          id={`notes-${issueId}`}
          name="notes"
          rows={3}
          required
          placeholder="Share progress or context…"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
        />
        {state.fieldErrors?.notes && (
          <p className="text-sm text-rose-600">{state.fieldErrors.notes[0]}</p>
        )}
      </div>

      {showStatusField && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor={`status-${issueId}`}>
            Change status
          </label>
          <select
            id={`status-${issueId}`}
            name="status"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/40"
            defaultValue=""
          >
            <option value="">Keep current status</option>
            {ISSUE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      )}

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
        {pending ? 'Saving…' : 'Add update'}
      </button>
    </form>
  );
}

