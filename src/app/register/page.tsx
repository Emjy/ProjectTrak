'use client';

import { useState } from 'react';
import PasswordInput from '@/components/ui/PasswordInput';

export default function RegisterPage() {
  const [setupKey, setSetupKey] = useState('');
  const [orgName, setOrgName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName, name, email, password, setupKey }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Erreur'); return; }
      setSlug(data.slug);
    } finally {
      setLoading(false);
    }
  };

  if (slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Organisation créée !</h2>
            <p className="text-sm text-slate-500 mb-4">URL de connexion de votre organisation :</p>
            <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm font-mono text-indigo-600 border border-slate-200 mb-6 break-all">
              /login/{slug}
            </div>
            <a
              href={`/login/${slug}`}
              className="inline-block w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Accéder à l&apos;espace
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Nouvelle organisation</h1>
          <p className="text-sm text-slate-500 mt-1">Réservé à l&apos;administrateur de la plateforme</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Clé d&apos;accès plateforme</label>
            <PasswordInput value={setupKey} onChange={setSetupKey} required placeholder="Clé fournie par l'administrateur" />
            {/* <p className="text-xs text-slate-400 mt-1">Définie par la variable d&apos;env <code className="bg-slate-100 px-1 rounded">SETUP_KEY</code> (défaut : <code className="bg-slate-100 px-1 rounded">projecttrak-setup-2024</code>)</p> */}
          </div>
          <hr className="border-slate-100" />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nom de l&apos;organisation</label>
            <input
              type="text" required value={orgName} onChange={e => setOrgName(e.target.value)}
              placeholder="My Agency"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nom de l&apos;administrateur</label>
            <input
              type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="Alice Martin"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="alice@my-agency.com"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mot de passe admin</label>
            <PasswordInput value={password} onChange={setPassword} required placeholder="8 caractères minimum" minLength={8} />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Création…' : 'Créer l\'organisation'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4">
          <a href="/login" className="text-indigo-600 hover:underline">← Retour à la connexion</a>
        </p>
      </div>
    </div>
  );
}
