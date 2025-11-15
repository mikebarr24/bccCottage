'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTransition } from 'react';

export function HeaderAuthControls() {
  const { status } = useSession();
  const [pending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(() => {
      void signOut({ callbackUrl: '/signin' });
    });
  };

  if (status === 'loading') {
    return (
      <div className="rounded-full bg-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600">
        Loading…
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        className="rounded-full border border-white/40 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
      >
        {pending ? 'Signing out…' : 'Sign out'}
      </button>
    );
  }

  return (
    <Link
      href="/signin"
      className="rounded-full bg-[#d4a017] px-4 py-1.5 text-sm font-semibold text-[#0f1f14] transition hover:bg-[#b38512]"
    >
      Sign in
    </Link>
  );
}

