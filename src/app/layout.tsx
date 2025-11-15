import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';

import { HeaderAuthControls } from '@/components/auth/header-auth-controls';
import { HeaderNavLinks } from '@/components/navigation/header-nav-links';
import { AuthSessionProvider } from '@/components/providers/session-provider';
import { getServerAuthSession } from '@/lib/auth';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Henry's Cottage | Belfast Climbing Club",
  description:
    "Book Henry's Cottage in the Mournes, track maintenance issues, and sync stays to Google Calendar.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerAuthSession();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 antialiased`}>
        <AuthSessionProvider session={session}>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-[#d4a017]/30 bg-[#0f3d2e] text-white shadow-sm">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-white">
                  <Image
                    src="/bcc-logo.webp"
                    alt="Belfast Climbing Club"
                    width={40}
                    height={40}
                    priority
                    className="rounded-full border border-white/30 bg-white/90 p-1"
                  />
                  <span>Henry&apos;s Cottage · BCC</span>
                </Link>
                <nav className="flex items-center gap-6 text-sm font-medium text-white/80">
                  <HeaderNavLinks />
                </nav>
                <HeaderAuthControls />
              </div>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
