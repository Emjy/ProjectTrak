'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/auth/activate?token=${token}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d ? setUserInfo(d) : setInvalid(true));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Erreur'); return; }
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  if (invalid) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <p className="text-slate-500 mb-2">Ce lien d'invitation est invalide ou a déjà été utilisé.</p>
        <a href="/login" className="text-indigo-600 hover:underline text-sm">← Se connecter</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          {userInfo ? (
            <>
              <h1 className="text-2xl font-bold text-slate-900">Bienvenue, {userInfo.name.split(' ')[0]} !</h1>
              <p className="text-sm text-slate-500 mt-1">{userInfo.email}</p>
              <p className="text-sm text-slate-500 mt-2">Choisissez un mot de passe pour activer votre compte.</p>
            </>
          ) : (
            <div className="space-y-2">
              <div className="h-7 w-48 mx-auto bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-32 mx-auto bg-slate-100 rounded animate-pulse" />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mot de passe</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="8 caractères minimum" minLength={8} autoFocus
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Confirmer</label>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400" />
          </div>
          {password && confirm && password !== confirm && (
            <p className="text-xs text-rose-500">Les mots de passe ne correspondent pas</p>
          )}
          <button type="submit"
            disabled={loading || !userInfo || password.length < 8 || password !== confirm}
            className="w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {loading ? 'Activation…' : 'Activer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}
