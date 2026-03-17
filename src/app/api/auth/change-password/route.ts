import { NextRequest, NextResponse } from 'next/server';
import { db, users, eq } from '@/db';
import { getSessionFromRequest, hashPassword, makeSessionCookieHeader } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { password, currentPassword } = await req.json();
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'Mot de passe trop court (8 caractères minimum)' }, { status: 400 });
  }

  // If not a forced change, verify current password
  if (!session.mustChangePassword) {
    if (!currentPassword) return NextResponse.json({ error: 'Mot de passe actuel requis' }, { status: 400 });
    const user = db.select().from(users).where(eq(users.id, session.userId)).get();
    const { verifyPassword } = await import('@/lib/session');
    if (!user?.passwordHash || !verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
    }
  }

  db.update(users)
    .set({ passwordHash: hashPassword(password), mustChangePassword: false })
    .where(eq(users.id, session.userId))
    .run();

  // Reissue session without mustChangePassword flag
  const res = NextResponse.json({ ok: true });
  res.headers.append('Set-Cookie', makeSessionCookieHeader({ userId: session.userId, orgId: session.orgId, role: session.role }));
  return res;
}
