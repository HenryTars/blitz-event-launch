import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined)
  .pipe(z.string().url('Enter a valid URL.').optional());

export const createEventSchema = z
  .object({
    title: z.string().trim().min(3, 'Event title must be at least 3 characters.'),
    description: z.string().trim().min(20, 'Description should tell guests what makes the event special.'),
    venue: z.string().trim().min(2, 'Venue is required.'),
    startAt: z.string().min(1, 'Start date and time are required.'),
    endAt: z.string().optional(),
    heroImageUrl: optionalUrl,
    theme: z.enum(['luxury', 'poetry', 'minimal']).default('luxury'),
    organizerName: z.string().trim().min(2, 'Organizer name is required.'),
    organizerEmail: z.string().trim().email('Enter a valid organizer email.'),
    bookTitle: z.string().trim().min(2, 'Book title is required.'),
    bookAuthor: z.string().trim().min(2, 'Book author is required.'),
    bookCoverUrl: optionalUrl,
    bookDescription: z.string().trim().min(12, 'Book description is required.')
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startAt);

    if (Number.isNaN(start.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startAt'],
        message: 'Start date is invalid.'
      });
    }

    if (data.endAt) {
      const end = new Date(data.endAt);

      if (Number.isNaN(end.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endAt'],
          message: 'End date is invalid.'
        });
      }

      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endAt'],
          message: 'End date must be after the start date.'
        });
      }
    }
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;
