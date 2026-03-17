import { NextRequest, NextResponse } from 'next/server';
import { db, organizations, eq } from '@/db';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const org = db.select().from(organizations).where(eq(organizations.slug, params.slug)).get();
  if (!org) return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
  return NextResponse.json({ id: org.id, name: org.name, slug: org.slug });
}
