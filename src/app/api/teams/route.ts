import { NextRequest, NextResponse } from 'next/server';
import { db, teams, teamMembers, users } from '@/db';
import { eq } from 'drizzle-orm';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const allTeams = db.select().from(teams).where(eq(teams.orgId, session.orgId)).all();
    const allMembers = db.select().from(teamMembers).all();
    const allUsers = db.select().from(users).where(eq(users.orgId, session.orgId)).all();

    const result = allTeams.map(team => ({
      ...team,
      members: allMembers
        .filter(m => m.teamId === team.id)
        .map(m => ({ ...m, user: allUsers.find(u => u.id === m.userId) })),
    }));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const id = `tm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const createdAt = new Date().toISOString();
    db.insert(teams).values({
      id,
      orgId: session.orgId,
      name: body.name,
      description: body.description ?? '',
      color: body.color ?? '#6366f1',
      createdAt,
    }).run();
    const team = db.select().from(teams).where(eq(teams.id, id)).get();
    return NextResponse.json({ ...team, members: [] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
