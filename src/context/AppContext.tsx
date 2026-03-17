'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppContextType, Project, ProjectWithTasks, Task, User, Team, TeamMemberRole } from '@/types';

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      setProjects(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const refreshUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      setUsers(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const refreshTeams = useCallback(async () => {
    try {
      const res = await fetch('/api/teams');
      setTeams(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    Promise.all([refreshProjects(), refreshUsers(), refreshTeams()]).finally(() => setLoading(false));
  }, [refreshProjects, refreshUsers, refreshTeams]);

  // — Projects —
  const addProject = useCallback(async (data: Omit<Project, 'id' | 'createdAt'>): Promise<ProjectWithTasks> => {
    const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const project: ProjectWithTasks = await res.json();
    setProjects(prev => [project, ...prev]);
    return project;
  }, []);

  const updateProject = useCallback(async (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>> & { teamIds?: string[] }) => {
    const existing = projects.find(p => p.id === id);
    if (!existing) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...existing, ...data }) });
    const updated: ProjectWithTasks = await res.json();
    setProjects(prev => prev.map(p => p.id === id ? updated : p));
  }, [projects]);

  const deleteProject = useCallback(async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  // — Tasks —
  const addTask = useCallback(async (data: Omit<Task, 'id'>): Promise<Task> => {
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const task: Task = await res.json();
    setProjects(prev => prev.map(p => p.id === data.projectId ? { ...p, tasks: [...p.tasks, task] } : p));
    return task;
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<Omit<Task, 'id'>>) => {
    const task = projects.flatMap(p => p.tasks).find(t => t.id === id);
    if (!task) return;
    const res = await fetch(`/api/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...task, ...data }) });
    const updated: Task = await res.json();
    setProjects(prev => prev.map(p => ({ ...p, tasks: p.tasks.map(t => t.id === id ? updated : t) })));
  }, [projects]);

  const deleteTask = useCallback(async (id: string, projectId: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.filter(t => t.id !== id) } : p));
  }, []);

  const getProjectById = useCallback((id: string) => projects.find(p => p.id === id), [projects]);

  // — Users —
  const addUser = useCallback(async (data: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const user: User = await res.json();
    setUsers(prev => [...prev, user]);
    return user;
  }, []);

  const updateUser = useCallback(async (id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>) => {
    await fetch(`/api/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  // — Teams —
  const addTeam = useCallback(async (data: Omit<Team, 'id' | 'createdAt' | 'members'>): Promise<Team> => {
    const res = await fetch('/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const team: Team = await res.json();
    setTeams(prev => [...prev, team]);
    return team;
  }, []);

  const updateTeam = useCallback(async (id: string, data: Partial<Omit<Team, 'id' | 'createdAt' | 'members'>>) => {
    const res = await fetch(`/api/teams/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const updated: Team = await res.json();
    setTeams(prev => prev.map(t => t.id === id ? updated : t));
  }, []);

  const deleteTeam = useCallback(async (id: string) => {
    await fetch(`/api/teams/${id}`, { method: 'DELETE' });
    setTeams(prev => prev.filter(t => t.id !== id));
  }, []);

  const addTeamMember = useCallback(async (teamId: string, userId: string, role: TeamMemberRole = 'member') => {
    const res = await fetch(`/api/teams/${teamId}/members`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, role }) });
    const member = await res.json();
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: [...(t.members ?? []), member] } : t));
  }, []);

  const removeTeamMember = useCallback(async (teamId: string, userId: string) => {
    await fetch(`/api/teams/${teamId}/members`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: (t.members ?? []).filter(m => m.userId !== userId) } : t));
  }, []);

  return (
    <AppContext.Provider value={{ projects, users, teams, loading, refreshProjects, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask, getProjectById, addUser, updateUser, deleteUser, addTeam, updateTeam, deleteTeam, addTeamMember, removeTeamMember }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
