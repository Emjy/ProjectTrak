import { NextRequest, NextResponse } from 'next/server';
import { db, teams, teamMembers, users } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allTeams = db.select().from(teams).all();
    const allMembers = db.select().from(teamMembers).all();
    const allUsers = db.select().from(users).all();

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
  try {
    const body = await req.json();
    const id = `tm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const createdAt = new Date().toISOString();
    db.insert(teams).values({ id, name: body.name, description: body.description ?? '', color: body.color ?? '#6366f1', createdAt }).run();
    const team = db.select().from(teams).where(eq(teams.id, id)).get();
    return NextResponse.json({ ...team, members: [] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
