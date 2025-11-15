import { redirect } from 'next/navigation';
import { SignInForm } from '@/components/auth/sign-in-form';
import { getServerAuthSession } from '@/lib/auth';

export default async function SignInPage() {
  const session = await getServerAuthSession();
  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 rounded-3xl bg-white/90 p-10 shadow-xl">
      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-wide text-[#d4a017]">Belfast Climbing Club</p>
        <h1 className="text-3xl font-bold text-slate-900">Sign in to Henry&apos;s Cottage</h1>
        <p className="text-base text-slate-600">
          Use your cottage credentials to request bookings, log maintenance issues, and stay
          informed about upkeep tasks. Accounts are provisioned by the BCC committee.
        </p>
      </div>
      <SignInForm />
      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Need access?</p>
        <p>
          Ask the BCC committee to add your email address and set a password in the cottage system.
          Admin users can promote members to additional roles as required.
        </p>
        <p className="mt-4 text-xs text-slate-500">
          Demo accounts after seeding: <strong>admin@bcc.local / admin123</strong> and{' '}
          <strong>member@bcc.local / member123</strong>.
        </p>
      </div>
    </div>
  );
}
