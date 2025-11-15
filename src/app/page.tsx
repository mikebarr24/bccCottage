import Link from 'next/link';

import { getServerAuthSession } from '@/lib/auth';

const features = [
  {
    title: 'Mournes location',
    body: 'Sandy Brae, Attical - tucked below the Windy Gap beside Eagle and Pigeon Rock. The perfect launchpad for Mournes classics.',
  },
  {
    title: 'Sleeps a full meet',
    body: 'Open-plan bunks for eight plus sofas, mats, and camping space. Expect room for ~15 climbers when things get cosy.',
  },
  {
    title: 'Fully equipped',
    body: 'Refurbished kitchen with Stanley stove, electric cooker, immersion heater, electric shower, and multiple fireplaces.',
  },
  {
    title: 'Alfie Conn library',
    body: 'Hundreds of guidebooks and mountaineering titles donated by Colmcille Climbers—browse during your stay, borrow with permission.',
  },
];

const visitorNotes = [
  'Bring your own bedding and mats.',
  'Only toilet on site—respect the plumbing and leave no trace.',
  'Parking for 1-2 cars at the lane; overflow 300 m along Sandy Brae.',
  'No central heating. Use the fireplaces or electric heater in the end bedroom.',
  'Minimum nightly contributions: £5 for BCC/MI clubs, £10 for other affiliated visitors.',
];

export default async function Home() {
  const session = await getServerAuthSession();
  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-r from-[#0f3d2e] via-[#133524] to-[#0b2418] p-8 text-white shadow-xl">
        <p className="text-sm uppercase tracking-wide text-white/80">Belfast Climbing Club</p>
        <h1 className="mt-3 text-4xl font-bold">Henry&apos;s Cottage, Mourne Mountains</h1>
        <p className="mt-4 max-w-3xl text-white/80">
          Dr Henry McKee&apos;s restored stone cottage is now the heart of BCC life—open to members
          and partner clubs for weekend meets, training courses, and rainy-day reading sessions.
          Track maintenance issues, request bookings, and sync the shared calendar in one place.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/bookings"
            className="inline-flex items-center rounded-full bg-[#d4a017] px-6 py-2 text-sm font-semibold text-[#0f1f14] transition hover:bg-[#b38512]"
          >
            Request a stay →
          </Link>
          {session?.user && (
            <Link
              href="/issues"
              className="inline-flex items-center rounded-full border border-white/50 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View open issues
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{feature.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">House notes</h2>
        <p className="mt-2 text-sm text-slate-600">
          A few reminders so everyone leaves the place better than they found it:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
          {visitorNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
