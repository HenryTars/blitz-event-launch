import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    const invitationCount = await prisma.invitation.count();
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      message: 'Database connection successful',
      counts: {
        users: userCount,
        events: eventCount,
        invitations: invitationCount
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof Error && 'code' in error ? (error as any).code : undefined,
        details: process.env.NODE_ENV === 'development' ? JSON.stringify(error, null, 2) : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    console.log('Initializing database...');
    await prisma.$connect();

    const counts = {
      users: await prisma.user.count(),
      events: await prisma.event.count(),
      invitations: await prisma.invitation.count(),
      checkIns: await prisma.checkIn.count()
    };

    return NextResponse.json({
      message: 'Database connection verified.',
      counts
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
