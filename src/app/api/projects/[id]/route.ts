import { NextRequest, NextResponse } from 'next/server';
import { db, projects, tasks, taskAssignees, projectTeams } from '@/db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

function mapTask(t: typeof tasks.$inferSelect, assigneeIds: string[]) {
  return { ...t, dueDate: t.dueDate ?? undefined, teamId: t.teamId ?? undefined, assigneeIds };
}

function getProjectWithTeams(id: string) {
  const project = db.select().from(projects).where(eq(projects.id, id)).get();
  if (!project) return null;
  const teamIds = db.select().from(projectTeams).where(eq(projectTeams.projectId, id)).all().map(pt => pt.teamId);
  const projectTasks = db.select().from(tasks).where(eq(tasks.projectId, id)).all();
  const allAssignees = db.select().from(taskAssignees).all();
  return {
    ...project,
    dueDate: project.dueDate ?? undefined,
    teamIds,
    tasks: projectTasks.map(t => mapTask(t, allAssignees.filter(a => a.taskId === t.id).map(a => a.userId))),
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = getProjectWithTeams(id);
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    db.update(projects).set({
      name: body.name,
      description: body.description,
      status: body.status,
      color: body.color,
      dueDate: body.dueDate ?? null,
    }).where(eq(projects.id, id)).run();

    // Replace team assignments
    if (Array.isArray(body.teamIds)) {
      db.delete(projectTeams).where(eq(projectTeams.projectId, id)).run();
      for (const teamId of body.teamIds as string[]) {
        db.insert(projectTeams).values({ id: randomUUID(), projectId: id, teamId }).run();
      }
    }

    const result = getProjectWithTeams(id);
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    db.delete(projects).where(eq(projects.id, id)).run();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
