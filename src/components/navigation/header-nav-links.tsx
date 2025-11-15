'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function HeaderNavLinks() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <>
      <Link href="/" className="transition hover:text-white">
        Overview
      </Link>
      {isAuthenticated && (
        <Link href="/issues" className="transition hover:text-white">
          Issues
        </Link>
      )}
      <Link href="/bookings" className="transition hover:text-white">
        Bookings
      </Link>
    </>
  );
}

