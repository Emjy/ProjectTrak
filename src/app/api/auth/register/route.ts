import { NextRequest, NextResponse } from 'next/server';
import { db, organizations, users, eq } from '@/db';
import { hashPassword, makeSessionCookieHeader } from '@/lib/session';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

const SETUP_KEY = process.env.SETUP_KEY ?? 'projecttrak-setup-2024';

export async function POST(req: NextRequest) {
  const { orgName, name, email, password, setupKey } = await req.json();

  if (!setupKey || setupKey !== SETUP_KEY) {
    return NextResponse.json({ error: 'Clé d\'accès invalide' }, { status: 403 });
  }
  if (!orgName || !name || !email || !password) {
    return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Mot de passe trop court (8 caractères minimum)' }, { status: 400 });
  }

  const existingUser = db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).get();
  if (existingUser) {
    return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
  }

  const now = new Date().toISOString();
  const orgId = `org_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
  const userId = `u_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
  const baseSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const existing = db.select().from(organizations).where(eq(organizations.slug, baseSlug)).get();
  const slug = existing ? baseSlug + '-' + orgId.slice(-4) : baseSlug;

  db.insert(organizations).values({ id: orgId, name: orgName, slug, createdAt: now }).run();
  db.insert(users).values({
    id: userId,
    orgId,
    name,
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
    avatarColor: '#6366f1',
    role: 'admin',
    createdAt: now,
  }).run();

  const res = NextResponse.json({ ok: true, slug });
  res.headers.append('Set-Cookie', makeSessionCookieHeader({ userId, orgId, role: 'admin' }));
  return res;
}
