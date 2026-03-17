import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { getSessionFromRequest } from '@/lib/session';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { id } = await params;
    const body = await req.json();
    // Ensure target user belongs to same org
    const target = db.select().from(users).where(eq(users.id, id)).get();
    if (!target || target.orgId !== session.orgId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    db.update(users).set({ name: body.name, email: body.email, avatarColor: body.avatarColor, role: body.role }).where(eq(users.id, id)).run();
    const user = db.select().from(users).where(eq(users.id, id)).get();
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(_req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { id } = await params;
    // Ensure target user belongs to same org and is not self
    const target = db.select().from(users).where(eq(users.id, id)).get();
    if (!target || target.orgId !== session.orgId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (id === session.userId) return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });

    db.delete(users).where(eq(users.id, id)).run();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
