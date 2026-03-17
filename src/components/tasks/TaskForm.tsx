'use client';

import { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { useApp } from '@/context/AppContext';
import Avatar, { getInitials } from '@/components/ui/Avatar';

interface TaskFormProps {
  projectId: string;
  initial?: Partial<Task>;
  onSubmit: (data: Omit<Task, 'id'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function TaskForm({ projectId, initial, onSubmit, onCancel, loading }: TaskFormProps) {
  const { users, teams, getProjectById } = useApp();

  // Derive teams assigned to this project
  const project = getProjectById(projectId);
  const projectTeamIds = new Set(project?.teamIds ?? []);
  const projectTeams = teams.filter(t => projectTeamIds.has(t.id));
  // Members eligible = union of all project teams' members (or all users if no teams assigned)
  const projectMemberIds = new Set(
    projectTeams.flatMap(t => (t.members ?? []).map(m => m.userId))
  );
  const baseEligibleUsers = projectTeams.length > 0
    ? users.filter(u => projectMemberIds.has(u.id))
    : users;

  const eligibleUsers = baseEligibleUsers;

  const [title, setTitle]             = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus]           = useState<TaskStatus>(initial?.status ?? 'todo');
  const [priority, setPriority]       = useState<TaskPriority>(initial?.priority ?? 'medium');
  const [assigneeIds, setAssigneeIds] = useState<string[]>(initial?.assigneeIds ?? []);
  const [dueDate, setDueDate]         = useState(initial?.dueDate ?? '');

  const toggleAssignee = (uid: string) => {
    setAssigneeIds(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      projectId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeIds,
      dueDate: dueDate || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Ex: Créer les maquettes"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required autoFocus />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Détails, contexte, liens utiles..." rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="todo">À faire</option>
            <option value="in-progress">En cours</option>
            <option value="done">Terminé</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
          <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>
      </div>

      {/* Assignees multi-select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assigné à
          {assigneeIds.length > 0 && (
            <span className="ml-2 text-xs font-normal text-indigo-600">{assigneeIds.length} sélectionné{assigneeIds.length > 1 ? 's' : ''}</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {eligibleUsers.map(u => {
            const selected = assigneeIds.includes(u.id);
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => toggleAssignee(u.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  selected
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: u.avatarColor }}
                >
                  {getInitials(u.name)}
                </div>
                {u.name.split(' ')[0]}
                {selected && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
              {eligibleUsers.length === 0 && (
            <p className="text-xs text-slate-400">
              {projectTeams.length > 0
                ? 'Aucun membre dans les équipes de ce projet.'
                : 'Assignez des équipes au projet pour filtrer les membres.'}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Échéance</label>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={loading || !title.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? 'Enregistrement...' : initial?.id ? 'Mettre à jour' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}
