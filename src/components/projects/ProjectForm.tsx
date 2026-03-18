'use client';

import { useState } from 'react';
import { Project, ProjectStatus, TimeUnit } from '@/types';
import { useApp } from '@/context/AppContext';

const COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6',
];

interface ProjectFormProps {
  initial?: Partial<Project>;
  onSubmit: (data: Omit<Project, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ProjectForm({ initial, onSubmit, onCancel, loading }: ProjectFormProps) {
  const { teams } = useApp();
  const [name, setName]             = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus]         = useState<ProjectStatus>(initial?.status ?? 'active');
  const [color, setColor]           = useState(initial?.color ?? '#6366f1');
  const [dueDate, setDueDate]       = useState(initial?.dueDate ?? '');
  const [teamIds, setTeamIds]       = useState<string[]>(initial?.teamIds ?? []);
  const [estimatedTime, setEstimatedTime] = useState(initial?.estimatedTime?.toString() ?? '');
  const [estimatedTimeUnit, setEstimatedTimeUnit] = useState<TimeUnit>(initial?.estimatedTimeUnit ?? 'days');

  const toggleTeam = (id: string) =>
    setTeamIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      status,
      color,
      dueDate: dueDate || undefined,
      estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
      estimatedTimeUnit: estimatedTime ? estimatedTimeUnit : undefined,
      teamIds
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du projet *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Refonte site web"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez le projet..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Teams multi-select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Équipes assignées
          {teamIds.length > 0 && (
            <span className="ml-2 text-xs font-normal text-indigo-600">{teamIds.length} sélectionnée{teamIds.length > 1 ? 's' : ''}</span>
          )}
        </label>
        {teams.length === 0 ? (
          <p className="text-xs text-slate-400">Aucune équipe. Créez-en depuis la page Équipe.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {teams.map(t => {
              const selected = teamIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTeam(t.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    selected
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                  {t.name}
                  {selected && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="active">Actif</option>
            <option value="on-hold">En pause</option>
            <option value="completed">Terminé</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;échéance</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Temps estimé</label>
          <input type="number" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)}
            min="0" placeholder="Ex: 2"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
          <select value={estimatedTimeUnit} onChange={e => setEstimatedTimeUnit(e.target.value as TimeUnit)} disabled={!estimatedTime}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <option value="minutes">Minutes</option>
            <option value="hours">Heures</option>
            <option value="days">Jours</option>
            <option value="weeks">Semaines</option>
            <option value="years">Années</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: color === c ? '#1e293b' : 'transparent',
                transform: color === c ? 'scale(1.15)' : undefined,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Enregistrement...' : initial?.id ? 'Mettre à jour' : 'Créer le projet'}
        </button>
      </div>
    </form>
  );
}
