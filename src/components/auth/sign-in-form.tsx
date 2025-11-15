'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState, useTransition } from 'react';

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email')?.toString().trim() ?? '';
    const password = formData.get('password')?.toString() ?? '';

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/',
      });

      if (result?.error) {
        setError('Invalid email or password.');
        return;
      }

      router.push(result?.url ?? '/');
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-2 focus:ring-[#d4a017]/40"
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-[#0f3d2e] focus:outline-none focus:ring-2 focus:ring-[#d4a017]/40"
          placeholder="••••••••"
        />
      </div>
      {error && (
        <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-lg bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2a1f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

