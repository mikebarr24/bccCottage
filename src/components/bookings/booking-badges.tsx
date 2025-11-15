import type { BookingStatusValue } from '@/lib/constants/bookings';

const bookingStatusClasses: Record<BookingStatusValue, string> = {
  PENDING: 'bg-[#fff4ce] text-[#7a4a00] ring-[#f1c361]',
  APPROVED: 'bg-[#d9f2dd] text-[#1f5132] ring-[#9fd5b0]',
  DECLINED: 'bg-[#f8d0d0] text-[#811d1c] ring-[#f3a6a6]',
  CANCELLED: 'bg-[#e2e8f0] text-[#1e293b] ring-[#cbd5f5]',
};

export function BookingStatusBadge({ status }: { status: string }) {
  const variant =
    bookingStatusClasses[status as BookingStatusValue] ?? 'bg-slate-100 text-slate-700 ring-slate-200';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${variant}`}
    >
      {status.toLowerCase()}
    </span>
  );
}

