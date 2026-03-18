import { NextRequest, NextResponse } from 'next/server';
import { db, projects, tasks, taskAssignees, projectTeams } from '@/db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { getSessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';

function mapTask(t: typeof tasks.$inferSelect, assigneeIds: string[]) {
  return {
    ...t,
    dueDate: t.dueDate ?? undefined,
    teamId: t.teamId ?? undefined,
    estimatedTimeUnit: t.estimatedTimeUnit ?? undefined,
    actualTimeUnit: t.actualTimeUnit ?? undefined,
    assigneeIds,
  };
}

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const allProjects = db.select().from(projects).where(eq(projects.orgId, session.orgId)).all();
    const allTasks = db.select().from(tasks).all();
    const allAssignees = db.select().from(taskAssignees).all();
    const allProjectTeams = db.select().from(projectTeams).all();

    const result = allProjects.map(p => ({
      ...p,
      dueDate: p.dueDate ?? undefined,
      teamIds: allProjectTeams.filter(pt => pt.projectId === p.id).map(pt => pt.teamId),
      tasks: allTasks
        .filter(t => t.projectId === p.id)
        .map(t => mapTask(t, allAssignees.filter(a => a.taskId === t.id).map(a => a.userId))),
    }));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const body = await req.json();
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    db.insert(projects).values({
      id,
      orgId: session.orgId,
      name: body.name,
      description: body.description ?? '',
      status: body.status ?? 'active',
      color: body.color ?? '#6366f1',
      dueDate: body.dueDate ?? null,
      estimatedTime: body.estimatedTime ?? null,
      estimatedTimeUnit: body.estimatedTimeUnit ?? null,
      createdAt,
    }).run();

    const teamIds: string[] = body.teamIds ?? [];
    for (const teamId of teamIds) {
      db.insert(projectTeams).values({ id: randomUUID(), projectId: id, teamId }).run();
    }

    const project = db.select().from(projects).where(eq(projects.id, id)).get();
    return NextResponse.json({
      ...project,
      dueDate: project?.dueDate ?? undefined,
      estimatedTimeUnit: project?.estimatedTimeUnit ?? undefined,
      teamIds,
      tasks: []
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
