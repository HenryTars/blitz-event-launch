import { z } from 'zod';

export const createInvitationSchema = z.object({
  eventId: z.string().trim().min(1, 'Event is required.'),
  guestName: z.string().trim().min(2, 'Guest name is required.'),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .pipe(z.string().email('Email is invalid.').optional()),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .pipe(z.string().min(7, 'Phone number is too short.').optional())
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const rsvpStatusSchema = z.enum(['ACCEPTED', 'DECLINED', 'LATER']);
