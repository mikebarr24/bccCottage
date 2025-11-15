# Henry's Cottage Ops

Full-stack Next.js app for Belfast Climbing Club to manage Henry's Cottage bookings, maintenance
issues, and Google Calendar sync.

## Stack

- Next.js App Router (React 19, Server Actions, Tailwind CSS v4)
- Prisma ORM with SQLite for local dev (swap to Postgres in production)
- NextAuth Credentials auth (email + password) for members/admins
- Google Calendar API via `googleapis`

## Features

- 🔐 Username/password sign-in with role-based access (member vs admin)
- 📋 Issue tracker with priorities, status transitions, and update timelines
- 🗓️ Booking workflow with conflict detection, admin approvals, and Google Calendar sync
- 📝 Public booking request form while maintenance tooling stays committee-only
- 🔁 Admin-only re-sync endpoint to reconcile bookings with the shared calendar

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Copy environment file**

   ```bash
   cp env.example .env.local
   ```

3. **Set `DATABASE_URL`**
   - Dev: keep `file:./dev.db`
   - Production: point to Postgres (e.g. `postgresql://user:pass@host:5432/bcc_cottage?schema=public`)

4. **Apply migrations & seed sample data**

   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   The app is available at http://localhost:3000.

### Default accounts

- Admin: `admin@bcc.local` / `admin123`
- Member sample: `member@bcc.local` / `member123`

These are inserted by the seed script. Update or delete them as needed.

## Environment variables

| Variable                       | Purpose                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| `DATABASE_URL`                 | SQLite (dev) or Postgres (prod) connection string            |
| `POSTGRES_URL`                 | Optional extra Postgres connection for deployment platforms  |
| `NEXTAUTH_SECRET`              | Secret used to sign NextAuth cookies/jwt                     |
| `NEXTAUTH_URL`                 | Public base URL (e.g. `http://localhost:3000` in dev)        |
| `GOOGLE_CALENDAR_ID`           | Target calendar (use the ID from Google Calendar settings)   |
| `GOOGLE_CALENDAR_TIMEZONE`     | Time zone used for calendar events (default `Europe/Dublin`) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email with Calendar write access             |
| `GOOGLE_SERVICE_ACCOUNT_KEY`   | Service account private key (use `\n` for new lines)         |

> Tip: keep `.env.local` out of version control. Use the provided `env.example` as a reference.

## Google Calendar integration

1. Create a **service account** in Google Cloud Console and grant it write access to your target
   calendar (share the calendar with the service account email).
2. Generate a JSON key for the service account and copy the `client_email` +
   `private_key` values into `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_KEY`
   (replace newline characters in the key with `\n` when storing in `.env.local`).
3. Set `GOOGLE_CALENDAR_ID` and optional `GOOGLE_CALENDAR_TIMEZONE`.
4. Booking approvals now insert/update events via the service account. Send a `POST` request to
   `/api/calendar/resync` whenever you want to reconcile local bookings with Google Calendar.

## Database & Prisma

- Update schema: `npm run prisma:migrate`
- Generate client: `npm run prisma:generate`
- Seed demo data (two users, sample booking, sample issue): `npm run prisma:seed`

Switching to Postgres in production only requires changing `DATABASE_URL` and running
`npm run prisma:migrate` against the new database.

## Available scripts

| Command                   | Description              |
| ------------------------- | ------------------------ |
| `npm run dev`             | Start Next.js dev server |
| `npm run build`           | Build for production     |
| `npm run start`           | Run production server    |
| `npm run lint`            | ESLint                   |
| `npm run format`          | Prettier formatting      |
| `npm run prisma:migrate`  | Prisma migrate dev       |
| `npm run prisma:generate` | Generate Prisma client   |
| `npm run prisma:seed`     | Seed data                |

## Project structure highlights

- `src/app/page.tsx` – landing page with cottage context and navigation
- `src/app/issues/*` – issue tracker routes, server actions, and UI components
- `src/app/bookings/*` – bookings dashboard, forms, and approval workflow
- `src/lib/google/calendar.ts` – Google Calendar helper functions
- `src/app/api/**` – REST endpoints for issues, bookings, and calendar re-sync

## Testing the flows

1. Run `npm run dev`.
2. Visit `/bookings` to submit a request (no sign-in required). Provide your name, email, and dates.
3. Sign in at `/signin` with the admin credentials above to access approvals and the issue tracker.
4. Visit `/issues` (admin only) to review or log maintenance tasks.
5. Approve/decline bookings from `/bookings` as an admin to trigger Google Calendar sync.
