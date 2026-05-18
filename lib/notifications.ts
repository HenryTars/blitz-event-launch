import { prisma } from '@/lib/prisma';

interface CreateNotificationInput {
  userId: string;
  type?: string;
  title: string;
  message?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type || 'info',
        title: input.title,
        message: input.message || null,
        link: input.link || null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null
      }
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export async function createNotificationForEventOwner(
  eventId: string,
  input: Omit<CreateNotificationInput, 'userId'>
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { authorId: true }
    });
    if (event) {
      await createNotification({ ...input, userId: event.authorId });
    }
  } catch (error) {
    console.error('Failed to create notification for event owner:', error);
  }
}
