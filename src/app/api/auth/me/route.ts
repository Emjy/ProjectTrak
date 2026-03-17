import { NextRequest, NextResponse } from 'next/server';
import { db, users, eq } from '@/db';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = db.select().from(users).where(eq(users.id, session.userId)).get();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarColor: user.avatarColor,
    role: user.role,
    orgId: user.orgId,
  });
}
