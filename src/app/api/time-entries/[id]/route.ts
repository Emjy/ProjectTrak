import { NextRequest, NextResponse } from 'next/server';
import { db, timeEntries, eq } from '@/db';
import { and } from 'drizzle-orm';
import { getSessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;

  const entry = (await db.select().from(timeEntries).where(eq(timeEntries.id, id)))[0];
  if (!entry) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  // Only owner or admin can delete
  if (entry.userId !== session.userId && session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  await db.delete(timeEntries).where(and(eq(timeEntries.id, id), eq(timeEntries.orgId, session.orgId)));
  return NextResponse.json({ ok: true });
}
