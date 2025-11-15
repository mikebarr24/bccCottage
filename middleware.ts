import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware() {
    // no-op; authorization handled via callback below
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  }
);

export const config = {
  matcher: ['/issues/:path*', '/api/issues/:path*'],
};

