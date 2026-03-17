'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import ProjectCard from '@/components/projects/ProjectCard';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProjectForm from '@/components/projects/ProjectForm';
import { Project, ProjectStatus, ProjectWithTasks } from '@/types';

const statusFilters: { label: string; value: ProjectStatus | 'all' }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Actifs', value: 'active' },
  { label: 'Terminés', value: 'completed' },
  { label: 'En pause', value: 'on-hold' },
];

export default function ProjectsPage() {
  const { projects, loading, addProject, updateProject, deleteProject } = useApp();
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProjectWithTasks | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectWithTasks | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = projects.filter((p) => {
    const matchesStatus = filter === 'all' || p.status === filter;
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreate = async (data: Omit<Project, 'id' | 'createdAt'>) => {
    setSaving(true);
    try {
      await addProject(data);
      setCreateOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (data: Omit<Project, 'id' | 'createdAt'>) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await updateProject(editTarget.id, data);
      setEditTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteProject(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${filter === f.value ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-40"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau projet
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        {loading ? 'Chargement...' : filtered.length === 0 ? 'Aucun projet trouvé' : `${filtered.length} projet${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => setEditTarget(project)}
              onDelete={() => setDeleteTarget(project)}
            />
          ))}
        </div>
      ) : !loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 text-slate-300">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          </svg>
          <p className="text-base font-medium text-slate-500">Aucun projet</p>
          <p className="text-sm mt-1 mb-5">Créez votre premier projet pour commencer.</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau projet
          </button>
        </div>
      ) : null}

      {/* Create modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Nouveau projet">
        <ProjectForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          loading={saving}
        />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Modifier le projet">
        {editTarget && (
          <ProjectForm
            initial={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            loading={saving}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer le projet"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.name}" ? Toutes ses tâches seront également supprimées.`}
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}
