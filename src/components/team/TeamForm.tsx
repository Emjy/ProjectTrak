'use client';

import { useState } from 'react';
import { Team } from '@/types';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

interface TeamFormProps {
  initial?: Partial<Team>;
  onSubmit: (data: Omit<Team, 'id' | 'createdAt' | 'members'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function TeamForm({ initial, onSubmit, onCancel, loading }: TeamFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [color, setColor] = useState(initial?.color ?? '#6366f1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim(), color });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l&apos;équipe *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Développement" autoFocus required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez l'équipe..." rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: c, borderColor: color === c ? '#1e293b' : 'transparent', transform: color === c ? 'scale(1.15)' : undefined }} />
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Annuler</button>
        <button type="submit" disabled={loading || !name.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? 'Enregistrement...' : initial?.id ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
