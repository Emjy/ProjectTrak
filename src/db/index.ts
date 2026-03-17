import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { projects, tasks, users, teams, teamMembers, taskAssignees, taskComments, projectTeams } from './schema';
import { eq } from 'drizzle-orm';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'projecttrak.db');
const sqlite = new Database(DB_PATH);

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite);

// Create all tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    color TEXT NOT NULL DEFAULT '#6366f1',
    due_date TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_color TEXT NOT NULL DEFAULT '#6366f1',
    role TEXT NOT NULL DEFAULT 'member',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member'
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
    due_date TEXT
  );

  CREATE TABLE IF NOT EXISTS task_assignees (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(task_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS project_teams (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE(project_id, team_id)
  );

  CREATE TABLE IF NOT EXISTS task_comments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// Migrations on existing DB
const taskCols = (sqlite.prepare('PRAGMA table_info(tasks)').all() as { name: string }[]).map(c => c.name);
if (!taskCols.includes('description')) sqlite.exec(`ALTER TABLE tasks ADD COLUMN description TEXT NOT NULL DEFAULT ''`);
if (!taskCols.includes('team_id'))     sqlite.exec(`ALTER TABLE tasks ADD COLUMN team_id TEXT REFERENCES teams(id) ON DELETE SET NULL`);

// Seed data
const projectCount = (sqlite.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }).count;
if (projectCount === 0) {
  const now = new Date().toISOString();

  const seedUsers = [
    { id: 'u1', name: 'Alice Martin',  email: 'alice@example.com',  color: '#6366f1', role: 'admin'  },
    { id: 'u2', name: 'Bob Dupont',    email: 'bob@example.com',    color: '#ec4899', role: 'member' },
    { id: 'u3', name: 'Clara Petit',   email: 'clara@example.com',  color: '#10b981', role: 'member' },
    { id: 'u4', name: 'David Chen',    email: 'david@example.com',  color: '#f59e0b', role: 'member' },
  ];
  const seedTeams = [
    { id: 'tm1', name: 'Design',        description: 'Équipe design & UX',    color: '#8b5cf6' },
    { id: 'tm2', name: 'Développement', description: 'Équipe front & back',   color: '#3b82f6' },
  ];
  const seedTeamMembers = [
    { id: 'mb1', teamId: 'tm1', userId: 'u1', role: 'owner'  },
    { id: 'mb2', teamId: 'tm1', userId: 'u2', role: 'member' },
    { id: 'mb3', teamId: 'tm2', userId: 'u3', role: 'owner'  },
    { id: 'mb4', teamId: 'tm2', userId: 'u4', role: 'member' },
    { id: 'mb5', teamId: 'tm2', userId: 'u1', role: 'member' },
  ];
  const seedProjects = [
    { id: 'p1', name: 'Website Redesign', description: 'Refonte complète du site vitrine',               status: 'active',    color: '#6366f1', dueDate: '2026-04-15' },
    { id: 'p2', name: 'Mobile App MVP',   description: "MVP de l'application mobile iOS & Android",      status: 'active',    color: '#ec4899', dueDate: '2026-05-30' },
    { id: 'p3', name: 'API Integration',  description: 'Intégration APIs tierces (paiement, emailing)',  status: 'on-hold',   color: '#f59e0b', dueDate: '2026-03-20' },
  ];
  const seedProjectTeams = [
    { id: 'pt1', projectId: 'p1', teamId: 'tm1' },
    { id: 'pt2', projectId: 'p1', teamId: 'tm2' },
    { id: 'pt3', projectId: 'p2', teamId: 'tm2' },
    { id: 'pt4', projectId: 'p3', teamId: 'tm2' },
  ];
  // [taskId, projectId, title, description, status, priority, teamId, dueDate, assigneeIds[]]
  const seedTasks: [string, string, string, string, string, string, string | null, string | null, string[]][] = [
    ['t1', 'p1', 'Maquettes Figma',       'Créer les maquettes haute fidélité',                   'done',        'high',   'tm1',  '2026-02-01', ['u1', 'u2']],
    ['t2', 'p1', 'Intégration HTML/CSS',  'Intégrer les maquettes en HTML/CSS responsive',        'in-progress', 'high',   null,   '2026-03-20', ['u3']],
    ['t3', 'p1', 'Tests cross-browser',   'Vérifier la compatibilité Chrome, Firefox, Safari',    'todo',        'medium', null,   '2026-04-10', []],
    ['t4', 'p2', 'Architecture technique','Définir l\'architecture et les choix technologiques',  'done',        'high',   'tm2',  '2026-02-15', ['u3', 'u4']],
    ['t5', 'p2', 'Écran authentification','Développer les écrans login, register, reset password','in-progress', 'high',   null,   '2026-03-25', ['u3']],
    ['t6', 'p2', 'Écran dashboard',       'Développer le dashboard avec les KPIs',                'todo',        'medium', null,   '2026-04-20', ['u2', 'u4']],
    ['t7', 'p2', 'Tests unitaires',       'Écrire les tests pour les composants critiques',       'todo',        'low',    null,   '2026-05-15', []],
    ['t8', 'p3', 'Stripe integration',    'Intégrer le SDK Stripe pour les paiements',            'in-progress', 'high',   null,   '2026-03-10', ['u4']],
    ['t9', 'p3', 'Sendgrid setup',        'Configurer Sendgrid pour les emails transactionnels',  'todo',        'medium', null,   '2026-03-15', ['u2']],
  ];

  const ins = {
    user:    sqlite.prepare('INSERT INTO users (id, name, email, avatar_color, role, created_at) VALUES (?,?,?,?,?,?)'),
    team:    sqlite.prepare('INSERT INTO teams (id, name, description, color, created_at) VALUES (?,?,?,?,?)'),
    member:  sqlite.prepare('INSERT INTO team_members (id, team_id, user_id, role) VALUES (?,?,?,?)'),
    project:     sqlite.prepare('INSERT INTO projects (id, name, description, status, color, due_date, created_at) VALUES (?,?,?,?,?,?,?)'),
    projectTeam: sqlite.prepare('INSERT INTO project_teams (id, project_id, team_id) VALUES (?,?,?)'),
    task:        sqlite.prepare('INSERT INTO tasks (id, project_id, title, description, status, priority, team_id, due_date) VALUES (?,?,?,?,?,?,?,?)'),
    assignee:    sqlite.prepare('INSERT INTO task_assignees (id, task_id, user_id) VALUES (?,?,?)'),
  };

  for (const u of seedUsers)       ins.user.run(u.id, u.name, u.email, u.color, u.role, now);
  for (const t of seedTeams)       ins.team.run(t.id, t.name, t.description, t.color, now);
  for (const m of seedTeamMembers) ins.member.run(m.id, m.teamId, m.userId, m.role);
  for (const p of seedProjects)    ins.project.run(p.id, p.name, p.description, p.status, p.color, p.dueDate, now);
  for (const pt of seedProjectTeams) ins.projectTeam.run(pt.id, pt.projectId, pt.teamId);
  for (const [tid, pid, title, desc, status, priority, teamId, dueDate, assigneeIds] of seedTasks) {
    ins.task.run(tid, pid, title, desc, status, priority, teamId, dueDate);
    assigneeIds.forEach((uid, i) => ins.assignee.run(`ta_seed_${tid}_${i}`, tid, uid));
  }
}

export { projects, tasks, users, teams, teamMembers, taskAssignees, taskComments, projectTeams, eq };
