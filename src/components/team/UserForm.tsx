'use client';

import { useState } from 'react';
import { User, UserRole } from '@/types';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

interface UserFormProps {
  initial?: Partial<User>;
  onSubmit: (data: Omit<User, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function UserForm({ initial, onSubmit, onCancel, loading }: UserFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [avatarColor, setAvatarColor] = useState(initial?.avatarColor ?? '#6366f1');
  const [role, setRole] = useState<UserRole>(initial?.role ?? 'member');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSubmit({ name: name.trim(), email: email.trim(), avatarColor, role });
  };

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Preview */}
      <div className="flex justify-center py-2">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: avatarColor }}>
          {initials}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Alice Martin" autoFocus required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alice@example.com" required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
        <select value={role} onChange={e => setRole(e.target.value as UserRole)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="member">Membre</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Couleur d&apos;avatar</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setAvatarColor(c)}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{ backgroundColor: c, borderColor: avatarColor === c ? '#1e293b' : 'transparent', transform: avatarColor === c ? 'scale(1.15)' : undefined }} />
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Annuler</button>
        <button type="submit" disabled={loading || !name.trim() || !email.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? 'Enregistrement...' : initial?.id ? 'Mettre à jour' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}
