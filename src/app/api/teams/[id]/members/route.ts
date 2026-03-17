import { NextRequest, NextResponse } from 'next/server';
import { db, teamMembers, users } from '@/db';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const existing = db.select().from(teamMembers)
      .where(and(eq(teamMembers.teamId, params.id), eq(teamMembers.userId, body.userId)))
      .get();
    if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 });

    const id = `mb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    db.insert(teamMembers).values({ id, teamId: params.id, userId: body.userId, role: body.role ?? 'member' }).run();
    const member = db.select().from(teamMembers).where(eq(teamMembers.id, id)).get();
    const user = db.select().from(users).where(eq(users.id, body.userId)).get();
    return NextResponse.json({ ...member, user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await req.json();
    db.delete(teamMembers)
      .where(and(eq(teamMembers.teamId, params.id), eq(teamMembers.userId, userId)))
      .run();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
