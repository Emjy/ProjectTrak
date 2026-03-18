import { NextRequest, NextResponse } from 'next/server';
import { db, timeEntries, users, tasks, projects, taskAssignees, eq } from '@/db';
import { and, gte, lte, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { getSessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const projectId = searchParams.get('projectId');
  const userId = searchParams.get('userId');
  const taskId = searchParams.get('taskId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const conditions = [eq(timeEntries.orgId, session.orgId)];

  // Members can only see their own entries
  if (session.role !== 'admin') {
    conditions.push(eq(timeEntries.userId, session.userId));
  } else if (userId) {
    conditions.push(eq(timeEntries.userId, userId));
  }

  if (projectId) conditions.push(eq(timeEntries.projectId, projectId));
  if (taskId) conditions.push(eq(timeEntries.taskId, taskId));
  if (from) conditions.push(gte(timeEntries.date, from));
  if (to) conditions.push(lte(timeEntries.date, to));

  const rows = await db.select({
    id: timeEntries.id,
    orgId: timeEntries.orgId,
    userId: timeEntries.userId,
    taskId: timeEntries.taskId,
    projectId: timeEntries.projectId,
    duration: timeEntries.duration,
    unit: timeEntries.unit,
    date: timeEntries.date,
    note: timeEntries.note,
    createdAt: timeEntries.createdAt,
    userName: users.name,
    userAvatarColor: users.avatarColor,
    taskTitle: tasks.title,
    projectName: projects.name,
    projectColor: projects.color,
  })
    .from(timeEntries)
    .leftJoin(users, eq(timeEntries.userId, users.id))
    .leftJoin(tasks, eq(timeEntries.taskId, tasks.id))
    .leftJoin(projects, eq(timeEntries.projectId, projects.id))
    .where(and(...conditions))
    .orderBy(sql`${timeEntries.date} DESC, ${timeEntries.createdAt} DESC`);

  return NextResponse.json(rows.map(r => ({
    id: r.id,
    orgId: r.orgId,
    userId: r.userId,
    taskId: r.taskId,
    projectId: r.projectId,
    duration: r.duration,
    unit: r.unit,
    date: r.date,
    note: r.note ?? undefined,
    createdAt: r.createdAt,
    taskTitle: r.taskTitle ?? undefined,
    projectName: r.projectName ?? undefined,
    projectColor: r.projectColor ?? undefined,
    user: r.userName ? {
      id: r.userId,
      name: r.userName,
      avatarColor: r.userAvatarColor ?? '#6366f1',
    } : undefined,
  })));
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { taskId, projectId, duration, unit, date, note } = body as {
    taskId: string; projectId: string; duration: number;
    unit: string; date: string; note?: string;
  };

  if (!taskId || !projectId || !duration || !unit || !date) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  // Members can only log time on tasks they are assigned to; admins are unrestricted
  if (session.role !== 'admin') {
    const assignee = await db.select().from(taskAssignees)
      .where(and(eq(taskAssignees.taskId, taskId), eq(taskAssignees.userId, session.userId)))
      .limit(1);
    if (assignee.length === 0) {
      return NextResponse.json({ error: 'Vous n\'êtes pas assigné à cette tâche' }, { status: 403 });
    }
  }

  const id = randomUUID();
  const createdAt = new Date().toISOString();

  await db.insert(timeEntries).values({
    id,
    orgId: session.orgId,
    userId: session.userId,
    taskId,
    projectId,
    duration,
    unit: unit as 'minutes' | 'hours' | 'days',
    date,
    note: note?.trim() || null,
    createdAt,
  });

  const user = (await db.select().from(users).where(eq(users.id, session.userId)))[0];
  const task = (await db.select().from(tasks).where(eq(tasks.id, taskId)))[0];
  const project = (await db.select().from(projects).where(eq(projects.id, projectId)))[0];

  return NextResponse.json({
    id, orgId: session.orgId, userId: session.userId,
    taskId, projectId, duration, unit, date, note: note?.trim() || undefined, createdAt,
    taskTitle: task?.title,
    projectName: project?.name,
    projectColor: project?.color,
    user: user ? { id: user.id, name: user.name, avatarColor: user.avatarColor } : undefined,
  });
}
