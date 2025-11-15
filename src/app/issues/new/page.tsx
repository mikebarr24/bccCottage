import Link from 'next/link';
import { redirect } from 'next/navigation';

import { IssueForm } from '@/components/issues/issue-form';
import { getServerAuthSession } from '@/lib/auth';

export default async function NewIssuePage() {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-[#0f3d2e] via-[#133524] to-[#0b2418] p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-wide text-white/80">Henry&apos;s Cottage</p>
        <h1 className="mt-3 text-3xl font-bold">Log a new issue</h1>
        <p className="mt-2 max-w-2xl text-white/80">
          Share as much detail as you can so the committee can prioritise repairs quickly.
        </p>
        <div className="mt-4">
          <Link
            href="/issues"
            className="inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/30"
          >
            ← Back to issue list
          </Link>
        </div>
      </div>
      <IssueForm />
    </div>
  );
}

