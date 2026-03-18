'use client';

import { useState, useEffect } from 'react';
import { Task, User, Team, TimeEntry, TimeEntryUnit } from '@/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import TaskComments from './TaskComments';
import TimeEntryForm from './TimeEntryForm';
import TimeEntryList from './TimeEntryList';
import { formatTimeWithUnit, timeToMinutes, formatTime } from '@/lib/time';
import { useApp } from '@/context/AppContext';

interface TaskDetailModalProps {
  task: Task | null;
  users: User[];
  teams: Team[];
  currentUser: User;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export default function TaskDetailModal({ task, users, teams, currentUser, onClose, onEdit, onDelete }: TaskDetailModalProps) {
  const { addTimeEntry, deleteTimeEntry } = useApp();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(false);

  useEffect(() => {
    if (!task) return;
    fetch(`/api/time-entries?taskId=${task.id}`)
      .then(r => r.json())
      .then(data => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]));
    setShowForm(false);
  }, [task?.id]);

  if (!task) return null;

  const assignees = (task.assigneeIds ?? []).map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
  const team = task.teamId ? teams.find(t => t.id === task.teamId) : null;
  const isOverdue = task.status !== 'done' && task.dueDate && new Date(task.dueDate) < new Date();

  const mentionableIds = new Set<string>([
    currentUser.id,
    ...assignees.map(u => u.id),
    ...(team?.members ?? []).map(m => m.userId),
  ]);
  const mentionableUsers = users.filter(u => mentionableIds.has(u.id));
  const canLogTime = currentUser.role === 'admin' || (task.assigneeIds ?? []).includes(currentUser.id);

  const totalLoggedMinutes = entries.reduce((sum, e) => sum + timeToMinutes(e.duration, e.unit as Parameters<typeof timeToMinutes>[1]), 0);

  const handleSaveEntry = async (data: { duration: number; unit: TimeEntryUnit; date: string; note?: string }) => {
    setLoadingEntry(true);
    try {
      const entry = await addTimeEntry({ taskId: task.id, projectId: task.projectId, ...data });
      setEntries(prev => [entry, ...prev]);
      setShowForm(false);
    } finally {
      setLoadingEntry(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteTimeEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <Modal isOpen={!!task} onClose={onClose} title={task.title} size="lg">
      <div className="space-y-5">
        {/* Status / Priority / Due date row */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={task.status} />
          <Badge variant={task.priority} />
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-rose-500 font-medium' : 'text-slate-500'}`}>
              <CalendarIcon />
              {formatDate(task.dueDate)}
              {isOverdue && <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-full ring-1 ring-rose-200 ml-1">En retard</span>}
            </span>
          )}
        </div>

        {/* Description */}
        {task.description ? (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">Aucune description.</p>
        )}

        {/* Team */}
        {team && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Équipe</p>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium text-white"
              style={{ backgroundColor: team.color + 'cc' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              {team.name}
            </span>
          </div>
        )}

        {/* Assignees */}
        {assignees.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Assignés</p>
            <div className="flex flex-wrap gap-2">
              {assignees.map(u => (
                <div key={u.id} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                  <Avatar user={u} size="xs" />
                  <span className="text-xs font-medium text-slate-700">{u.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estimated time */}
        {task.estimatedTime && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Estimé :</span>
            <span className="font-medium text-slate-700">{formatTimeWithUnit(task.estimatedTime, task.estimatedTimeUnit)}</span>
          </div>
        )}

        {/* Time entries */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Temps saisi
              {totalLoggedMinutes > 0 && (
                <span className="ml-2 normal-case font-normal text-indigo-600">
                  {formatTime(totalLoggedMinutes)} total
                </span>
              )}
            </p>
            {!showForm && canLogTime && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Saisir mon temps
              </button>
            )}
          </div>

          {showForm && (
            <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-200">
              <TimeEntryForm
                taskId={task.id}
                projectId={task.projectId}
                onSave={handleSaveEntry}
                onCancel={() => setShowForm(false)}
                loading={loadingEntry}
              />
            </div>
          )}

          <TimeEntryList entries={entries} onDelete={handleDeleteEntry} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Modifier
          </button>
          <button onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors ml-auto">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
            Supprimer
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Comments */}
        <TaskComments
          taskId={task.id}
          currentUser={currentUser}
          mentionableUsers={mentionableUsers}
        />
      </div>
    </Modal>
  );
}
