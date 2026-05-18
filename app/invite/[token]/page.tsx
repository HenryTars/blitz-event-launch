import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import InvitationPage from '@/components/InvitationPage';

export default async function Page({ params }: { params: Promise<{ token?: string | string[] }> }) {
  const resolvedParams = await params;
  const token = Array.isArray(resolvedParams.token) ? resolvedParams.token[0] : resolvedParams.token;

  if (!token) {
    return notFound();
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      preorder: true,
      event: {
        include: {
          books: true
        }
      }
    }
  });

  if (!invitation) {
    return notFound();
  }

  const book = invitation.event.books[0];

  return (
    <InvitationPage
      token={token}
      shortCode={invitation.shortCode || undefined}
      guestName={invitation.guestName}
      isApproved={invitation.isApproved}
      status={invitation.status as 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'LATER'}
      initialPreorderQuantity={invitation.preorder?.quantity ?? 0}
      event={{
        title: invitation.event.title,
        description: invitation.event.description,
        venue: invitation.event.venue ?? '',
        startAt: invitation.event.startAt.toISOString(),
        book: {
          title: book?.title ?? '',
          author: book?.author ?? '',
          description: book?.description ?? '',
          coverUrl: book?.coverUrl ?? ''
        }
      }}
    />
  );
}
