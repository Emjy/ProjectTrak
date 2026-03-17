import { createHmac, scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

export interface SessionData {
  userId: string;
  orgId: string;
  role: 'admin' | 'member';
  mustChangePassword?: boolean;
}

const COOKIE = 'pt_session';
const SECRET = process.env.SESSION_SECRET ?? 'projecttrak-dev-secret-change-in-production';

function sign(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verify(token: string): SessionData | null {
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const expected = createHmac('sha256', SECRET).update(payload).digest('base64url');
    const sigBuf = Buffer.from(sig, 'base64url');
    const expBuf = Buffer.from(expected, 'base64url');
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionData;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): SessionData | null {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}

const MAX_AGE = 60 * 60 * 24 * 30;

export function makeSessionCookieHeader(data: SessionData): string {
  const token = sign(data);
  return `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`;
}

export function makeClearCookieHeader(): string {
  return `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    const candidate = scryptSync(password, salt, 32).toString('hex');
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(candidate, 'hex'));
  } catch {
    return false;
  }
}
