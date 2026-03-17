'use client';

import { useState } from 'react';
import Modal from './Modal';
import PasswordInput from './PasswordInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: Props) {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setCurrent(''); setPassword(''); setConfirm(''); setError(''); setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, password }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Erreur'); return; }
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Changer le mot de passe">
      {success ? (
        <div className="space-y-4 text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <p className="text-sm text-slate-700 font-medium">Mot de passe mis à jour</p>
          <button onClick={handleClose} className="w-full py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
            Fermer
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mot de passe actuel</label>
            <PasswordInput value={current} onChange={setCurrent} required autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
            <PasswordInput value={password} onChange={setPassword} required placeholder="8 caractères minimum" minLength={8} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Confirmer</label>
            <PasswordInput value={confirm} onChange={setConfirm} required />
          </div>
          {password && confirm && password !== confirm && (
            <p className="text-xs text-rose-500">Les mots de passe ne correspondent pas</p>
          )}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleClose} className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
              Annuler
            </button>
            <button type="submit"
              disabled={loading || !current || password.length < 8 || password !== confirm}
              className="flex-1 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {loading ? 'Enregistrement…' : 'Changer'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
