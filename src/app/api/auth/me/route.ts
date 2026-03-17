import { NextRequest, NextResponse } from 'next/server';
import { db, users, organizations, eq } from '@/db';
import { getSessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = db.select().from(users).where(eq(users.id, session.userId)).get();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const org = user.orgId ? db.select().from(organizations).where(eq(organizations.id, user.orgId)).get() : null;

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarColor: user.avatarColor,
    role: user.role,
    orgId: user.orgId,
    orgName: org?.name ?? null,
  });
}
