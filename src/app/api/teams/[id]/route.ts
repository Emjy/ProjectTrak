import { NextRequest, NextResponse } from 'next/server';
import { db, teams, teamMembers, users } from '@/db';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    db.update(teams).set({ name: body.name, description: body.description, color: body.color }).where(eq(teams.id, id)).run();
    const team = db.select().from(teams).where(eq(teams.id, id)).get();
    const members = db.select().from(teamMembers).where(eq(teamMembers.teamId, id)).all();
    const allUsers = db.select().from(users).all();
    return NextResponse.json({ ...team, members: members.map(m => ({ ...m, user: allUsers.find(u => u.id === m.userId) })) });
  } catch {
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    db.delete(teams).where(eq(teams.id, id)).run();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}
