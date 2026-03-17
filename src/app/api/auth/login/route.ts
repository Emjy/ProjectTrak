import { NextRequest, NextResponse } from 'next/server';
import { db, users, organizations, eq } from '@/db';
import { verifyPassword, makeSessionCookieHeader } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { email, password, orgSlug } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

  const user = db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).get();
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
  }

  // If orgSlug provided, verify user belongs to that org
  if (orgSlug) {
    const org = db.select().from(organizations).where(eq(organizations.slug, orgSlug)).get();
    if (!org || user.orgId !== org.id) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }
  }

  const sessionData: Parameters<typeof makeSessionCookieHeader>[0] = {
    userId: user.id,
    orgId: user.orgId!,
    role: user.role as 'admin' | 'member',
    ...(user.mustChangePassword ? { mustChangePassword: true } : {}),
  };
  const res = NextResponse.json({ ok: true, mustChangePassword: user.mustChangePassword ?? false });
  res.headers.append('Set-Cookie', makeSessionCookieHeader(sessionData));
  return res;
}
