'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Card from '@/components/ui/Card';
import TaskItem from '@/components/projects/TaskItem';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProjectForm from '@/components/projects/ProjectForm';
import TaskForm from '@/components/tasks/TaskForm';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import { Project, Task, TaskStatus } from '@/types';
import { useRouter } from 'next/navigation';
import KanbanBoard from '@/components/projects/KanbanBoard';

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' });
}

const taskStatusGroups: { label: string; value: TaskStatus; color: string }[] = [
  { label: 'À faire', value: 'todo', color: 'text-slate-600' },
  { label: 'En cours', value: 'in-progress', color: 'text-indigo-600' },
  { label: 'Terminées', value: 'done', color: 'text-emerald-600' },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const { getProjectById, updateProject, deleteProject, addTask, updateTask, deleteTask, users, teams } = useApp();
  const project = getProjectById(id);

  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask_, setDeleteTask] = useState<Task | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  // Use first admin user as "current user" for comments (no auth yet)
  const currentUser = users.find(u => u.role === 'admin') ?? users[0];

  if (!project) notFound();

  const tasks = project.tasks ?? [];
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const isOverdue = project.status !== 'completed' && project.dueDate && new Date(project.dueDate) < new Date();

  const handleEditProject = async (data: Omit<Project, 'id' | 'createdAt'>) => {
    setSaving(true);
    try {
      await updateProject(id, data);
      setEditProjectOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    await deleteProject(id);
    router.push('/projects');
  };

  const handleAddTask = async (data: Omit<Task, 'id'>) => {
    setSaving(true);
    try {
      await addTask(data);
      setAddTaskOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEditTask = async (data: Omit<Task, 'id'>) => {
    if (!editTask) return;
    setSaving(true);
    try {
      await updateTask(editTask.id, data);
      setEditTask(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTask_) return;
    await deleteTask(deleteTask_.id, id);
    setDeleteTask(null);
  };

  return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <BackIcon />
          Retour aux projets
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditProjectOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Modifier
          </button>
          <button
            onClick={() => setDeleteProjectOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>

      {/* Project Header */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ backgroundColor: project.color + '22', border: `2px solid ${project.color}44` }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
              <Badge variant={project.status} />
            </div>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <CalendarIcon />
                <span>Créé le {formatDate(project.createdAt)}</span>
              </div>
              {project.dueDate && (
                <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-500 font-medium' : ''}`}>
                  <CalendarIcon />
                  <span>Échéance : {formatDate(project.dueDate)}</span>
                  {isOverdue && <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full ring-1 ring-rose-200">En retard</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">Progression globale</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: project.color }}>{progress}%</span>
          </div>
          <ProgressBar value={progress} color={project.color} />
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <span>{doneTasks} tâches terminées</span>
            <span>{tasks.length - doneTasks} restantes</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
          {taskStatusGroups.map((group) => (
            <div key={group.value} className="text-center">
              <p className={`text-2xl font-bold tabular-nums ${group.color}`}>
                {tasks.filter((t) => t.status === group.value).length}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{group.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Tâches
            <span className="ml-2 text-sm font-normal text-slate-400">({tasks.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
              <button onClick={() => setView('list')} title="Vue liste"
                className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
              <button onClick={() => setView('kanban')} title="Vue kanban"
                className={`p-1.5 rounded-md transition-colors ${view === 'kanban' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="15" rx="1" />
                </svg>
              </button>
            </div>
            <button onClick={() => setAddTaskOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Ajouter
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-slate-400">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3 text-slate-300">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              <p className="text-sm font-medium">Aucune tâche</p>
              <p className="text-xs mt-1 mb-4">Ajoutez des tâches pour suivre la progression.</p>
              <button onClick={() => setAddTaskOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Première tâche
              </button>
            </div>
          </Card>
        ) : view === 'kanban' ? (
          <KanbanBoard
            tasks={tasks}
            projectId={id}
            onAddTask={() => setAddTaskOpen(true)}
            onViewTask={(task) => setViewTask(task)}
            onEditTask={(task) => setEditTask(task)}
            onDeleteTask={(task) => setDeleteTask(task)}
          />
        ) : (
          <div className="space-y-6 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            {taskStatusGroups.map((group) => {
              const groupTasks = tasks.filter((t) => t.status === group.value);
              if (groupTasks.length === 0) return null;
              return (
                <div key={group.value}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className={`text-sm font-semibold ${group.color}`}>{group.label}</h3>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">{groupTasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {groupTasks.map((task) => (
                      <TaskItem key={task.id} task={task} onView={() => setViewTask(task)} onEdit={() => setEditTask(task)} onDelete={() => setDeleteTask(task)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task detail modal */}
      {currentUser && (
        <TaskDetailModal
          task={viewTask}
          users={users}
          teams={teams}
          currentUser={currentUser}
          onClose={() => setViewTask(null)}
          onEdit={() => { setEditTask(viewTask); setViewTask(null); }}
          onDelete={() => { setDeleteTask(viewTask); setViewTask(null); }}
        />
      )}

      {/* Modals */}
      <Modal isOpen={editProjectOpen} onClose={() => setEditProjectOpen(false)} title="Modifier le projet">
        <ProjectForm initial={project} onSubmit={handleEditProject} onCancel={() => setEditProjectOpen(false)} loading={saving} />
      </Modal>

      <ConfirmDialog
        isOpen={deleteProjectOpen}
        onClose={() => setDeleteProjectOpen(false)}
        onConfirm={handleDeleteProject}
        title="Supprimer le projet"
        message={`Êtes-vous sûr de vouloir supprimer "${project.name}" ? Toutes ses tâches seront également supprimées.`}
        confirmLabel="Supprimer"
        danger
      />

      <Modal isOpen={addTaskOpen} onClose={() => setAddTaskOpen(false)} title="Nouvelle tâche">
        <TaskForm projectId={id} onSubmit={handleAddTask} onCancel={() => setAddTaskOpen(false)} loading={saving} />
      </Modal>

      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Modifier la tâche">
        {editTask && (
          <TaskForm projectId={id} initial={editTask} onSubmit={handleEditTask} onCancel={() => setEditTask(null)} loading={saving} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTask_}
        onClose={() => setDeleteTask(null)}
        onConfirm={handleDeleteTask}
        title="Supprimer la tâche"
        message={`Supprimer "${deleteTask_?.title}" ?`}
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}
