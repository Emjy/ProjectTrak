import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { getSessionFromRequest } from '@/lib/session';
import { randomBytes } from 'crypto';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const all = db.select().from(users).where(eq(users.orgId, session.orgId)).all();
    return NextResponse.json(all.map(u => ({
      ...u,
      passwordHash: undefined,
      inviteToken: undefined,
      activated: !!u.passwordHash && !u.inviteToken,
    })));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const createdAt = new Date().toISOString();
    const inviteToken = randomBytes(24).toString('hex');
    db.insert(users).values({
      id,
      orgId: session.orgId,
      name: body.name,
      email: body.email,
      inviteToken,
      avatarColor: body.avatarColor ?? '#6366f1',
      role: body.role ?? 'member',
      createdAt,
    }).run();
    const user = db.select().from(users).where(eq(users.id, id)).get();
    return NextResponse.json({ ...user, passwordHash: undefined, inviteToken }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
