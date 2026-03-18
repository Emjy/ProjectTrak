import { NextRequest, NextResponse } from 'next/server';
import { db, teamMembers, users } from '@/db';
import { eq, and } from 'drizzle-orm';
import { getSessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = db.select().from(teamMembers)
      .where(and(eq(teamMembers.teamId, id), eq(teamMembers.userId, body.userId)))
      .get();
    if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 });

    const memberId = `mb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    db.insert(teamMembers).values({ id: memberId, teamId: id, userId: body.userId, role: body.role ?? 'member' }).run();
    const member = db.select().from(teamMembers).where(eq(teamMembers.id, memberId)).get();
    const user = db.select().from(users).where(eq(users.id, body.userId)).get();
    return NextResponse.json({ ...member, user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { id } = await params;
    const { userId } = await req.json();
    db.delete(teamMembers)
      .where(and(eq(teamMembers.teamId, id), eq(teamMembers.userId, userId)))
      .run();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
