import { NextRequest, NextResponse } from 'next/server';
import { db, taskComments, tasks, projects, users, eq } from '@/db';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.userId;
  const mention = `@{${userId}}`;
  const allComments = db.select().from(taskComments).orderBy(taskComments.createdAt).all();
  const mentioned = allComments.filter(c => c.content.includes(mention));

  if (mentioned.length === 0) return NextResponse.json([]);

  const allTasks = db.select().from(tasks).all();
  const allProjects = db.select().from(projects).where(eq(projects.orgId, session.orgId)).all();
  const allUsers = db.select().from(users).where(eq(users.orgId, session.orgId)).all();

  const result = mentioned
    .map(c => {
      const task = allTasks.find(t => t.id === c.taskId);
      const project = task ? allProjects.find(p => p.id === task.projectId) : undefined;
      if (!project) return null; // filter out cross-org notifications
      const author = allUsers.find(u => u.id === c.authorId);
      return {
        id: c.id,
        commentId: c.id,
        taskId: c.taskId,
        taskTitle: task?.title ?? '',
        projectId: project.id,
        projectName: project.name,
        authorId: c.authorId,
        authorName: author?.name ?? 'Inconnu',
        authorAvatarColor: author?.avatarColor ?? '#6366f1',
        content: c.content,
        createdAt: c.createdAt,
      };
    })
    .filter(Boolean);

  return NextResponse.json(result);
}
