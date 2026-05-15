import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAuthenticatedUser();
  if (!auth.user) return auth.errorResponse!;

  const slug = (await params).slug;

  const event = await prisma.event.findUnique({ where: { slug }, include: { books: true } });
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Ownership check: only author or SUPER_ADMIN can edit
  if (event.authorId !== auth.user.id && auth.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (event.deleted) {
    return NextResponse.json({ error: 'Event has been deleted' }, { status: 410 });
  }

  const body = await request.json();
  const { title, description, venue, startAt, endAt, heroImageUrl, theme, published, book } = body;

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (venue !== undefined) updateData.venue = venue;
  if (startAt !== undefined) updateData.startAt = new Date(startAt);
  if (endAt !== undefined) updateData.endAt = endAt ? new Date(endAt) : null;
  if (heroImageUrl !== undefined) updateData.heroImageUrl = heroImageUrl;
  if (theme !== undefined) updateData.theme = theme;
  if (published !== undefined) updateData.published = published;

  const updated = await prisma.event.update({
    where: { id: event.id },
    data: updateData,
    include: { books: true },
  });

  // Update book if provided
  if (book && event.books.length > 0) {
    await prisma.book.update({
      where: { id: event.books[0].id },
      data: {
        title: book.title ?? event.books[0].title,
        author: book.author ?? event.books[0].author,
        subtitle: book.subtitle ?? event.books[0].subtitle,
        coverUrl: book.coverUrl ?? event.books[0].coverUrl,
        description: book.description ?? event.books[0].description,
      },
    });
  }

  await createAuditLog({
    action: 'event.updated',
    entity: 'Event',
    entityId: event.id,
    description: `Updated ${title || event.title}`,
    userId: auth.user.id,
    metadata: { updatedFields: Object.keys(updateData) },
  });

  return NextResponse.json({ success: true, event: updated });
}
