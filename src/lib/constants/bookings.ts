export const BOOKING_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

export type BookingStatusValue = (typeof BOOKING_STATUSES)[number]['value'];

