import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  status: text('status', { enum: ['active', 'completed', 'on-hold'] }).notNull().default('active'),
  color: text('color').notNull().default('#6366f1'),
  dueDate: text('due_date'),
  createdAt: text('created_at').notNull(),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  avatarColor: text('avatar_color').notNull().default('#6366f1'),
  role: text('role', { enum: ['admin', 'member'] }).notNull().default('member'),
  createdAt: text('created_at').notNull(),
});

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  color: text('color').notNull().default('#6366f1'),
  createdAt: text('created_at').notNull(),
});

export const teamMembers = sqliteTable('team_members', {
  id: text('id').primaryKey(),
  teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['owner', 'member'] }).notNull().default('member'),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  status: text('status', { enum: ['todo', 'in-progress', 'done'] }).notNull().default('todo'),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull().default('medium'),
  teamId: text('team_id').references(() => teams.id, { onDelete: 'set null' }),
  dueDate: text('due_date'),
});

export const projectTeams = sqliteTable('project_teams', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
});

export const taskComments = sqliteTable('task_comments', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

export const taskAssignees = sqliteTable('task_assignees', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});
