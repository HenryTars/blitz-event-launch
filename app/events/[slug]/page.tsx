import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EventDetailsClient from '@/components/EventDetailsClient';

export default async function Page({ params }: { params: Promise<{ slug?: string | string[] }> }) {
  const resolvedParams = await params;
  const slug = Array.isArray(resolvedParams.slug) ? resolvedParams.slug[0] : resolvedParams.slug;

  if (!slug) {
    return notFound();
  }

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      books: true,
      author: true,
      analytics: true
    }
  });

  if (!event) {
    return notFound();
  }

  const book = event.books[0];

  return (
    <EventDetailsClient
      slug={slug}
      event={{
        title: event.title,
        description: event.description,
        venue: event.venue ?? '',
        startAt: event.startAt.toISOString(),
        endAt: event.endAt?.toISOString(),
        heroImageUrl: event.heroImageUrl ?? '',
        theme: event.theme,
        authorName: event.author.name ?? event.author.email,
        book: {
          title: book?.title ?? '',
          author: book?.author ?? '',
          description: book?.description ?? '',
          coverUrl: book?.coverUrl ?? ''
        }
      }}
      analytics={{
        totalInvites: event.analytics?.totalInvites ?? 0,
        acceptedCount: event.analytics?.acceptedCount ?? 0,
        declinedCount: event.analytics?.declinedCount ?? 0,
        attendanceCount: event.analytics?.attendanceCount ?? 0
      }}
    />
  );
}
