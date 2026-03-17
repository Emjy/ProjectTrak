export type ProjectStatus = "active" | "completed" | "on-hold";
export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type UserRole = "admin" | "member";
export type TeamMemberRole = "owner" | "member";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  dueDate?: string;
  createdAt: string;
  teamIds: string[];
}

export interface Notification {
  id: string;
  commentId: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  authorId: string;
  authorName: string;
  authorAvatarColor: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: string[];   // multiple members
  teamId?: string;         // optional team assignment
  dueDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  role: UserRole;
  createdAt: string;
  activated?: boolean;
  orgId?: string;
  orgName?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  user?: User;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: User;
}

export interface ProjectWithTasks extends Project {
  tasks: Task[];
}

export interface AppContextType {
  projects: ProjectWithTasks[];
  users: User[];
  teams: Team[];
  currentUser: User | null;
  loading: boolean;
  refreshProjects: () => Promise<void>;
  addProject: (data: Omit<Project, 'id' | 'createdAt'>) => Promise<ProjectWithTasks>;
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>> & { teamIds?: string[] }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (data: Omit<Task, 'id'>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Omit<Task, 'id' | 'assigneeIds'>> & { assigneeIds?: string[] }) => Promise<void>;
  deleteTask: (id: string, projectId: string) => Promise<void>;
  getProjectById: (id: string) => ProjectWithTasks | undefined;
  addUser: (data: Omit<User, 'id' | 'createdAt'> & { password?: string }) => Promise<User>;
  updateUser: (id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addTeam: (data: Omit<Team, 'id' | 'createdAt' | 'members'>) => Promise<Team>;
  updateTeam: (id: string, data: Partial<Omit<Team, 'id' | 'createdAt' | 'members'>>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  addTeamMember: (teamId: string, userId: string, role?: TeamMemberRole) => Promise<void>;
  removeTeamMember: (teamId: string, userId: string) => Promise<void>;
}
