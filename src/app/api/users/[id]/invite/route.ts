import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { getSessionFromRequest } from '@/lib/session';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(_req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const target = db.select().from(users).where(eq(users.id, id)).get();
  if (!target || target.orgId !== session.orgId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const inviteToken = randomBytes(24).toString('hex');
  db.update(users).set({ inviteToken }).where(eq(users.id, id)).run();

  return NextResponse.json({ inviteToken });
}
