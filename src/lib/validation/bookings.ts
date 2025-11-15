import { BookingStatus } from '@prisma/client';
import { z } from 'zod';

export const bookingRequestSchema = z
  .object({
    title: z.string().min(3, 'Please enter a more descriptive title'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    requesterName: z.string().min(2, 'Please tell us who is booking'),
    requesterEmail: z.string().email('Enter a valid email'),
    requesterPhone: z.string().max(40).optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start < end;
    },
    {
      path: ['endDate'],
      message: 'End date must be after the start date',
    }
  );

export const bookingUpdateSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  notes: z.string().optional(),
});

export function parseBookingDates(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error('Invalid booking dates');
  }

  return { startDate, endDate };
}

