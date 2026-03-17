'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { User, Team } from '@/types';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import UserForm from '@/components/team/UserForm';
import TeamForm from '@/components/team/TeamForm';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';

export default function TeamPage() {
  const { users, teams, addUser, updateUser, deleteUser, addTeam, updateTeam, deleteTeam, addTeamMember, removeTeamMember, loading } = useApp();

  const [tab, setTab] = useState<'users' | 'teams'>('users');
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser_, setDeleteUser] = useState<User | null>(null);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteTeam_, setDeleteTeam] = useState<Team | null>(null);
  // Only store the team ID — always read live data from `teams`
  const [memberTeamId, setMemberTeamId] = useState<string | null>(null);
  const [addingMember, setAddingMember] = useState<string | null>(null); // userId being added
  const [saving, setSaving] = useState(false);

  // Always derive live team from context — never use stale snapshot
  const liveTeam = memberTeamId ? teams.find(t => t.id === memberTeamId) ?? null : null;
  const currentMemberIds = new Set((liveTeam?.members ?? []).map(m => m.userId));
  const nonMembers = liveTeam ? users.filter(u => !currentMemberIds.has(u.id)) : [];

  const handleAddUser = async (data: Omit<User, 'id' | 'createdAt'>) => {
    setSaving(true);
    try { await addUser(data); setCreateUserOpen(false); } finally { setSaving(false); }
  };

  const handleEditUser = async (data: Omit<User, 'id' | 'createdAt'>) => {
    if (!editUser) return;
    setSaving(true);
    try { await updateUser(editUser.id, data); setEditUser(null); } finally { setSaving(false); }
  };

  const handleAddTeam = async (data: Omit<Team, 'id' | 'createdAt' | 'members'>) => {
    setSaving(true);
    try { await addTeam(data); setCreateTeamOpen(false); } finally { setSaving(false); }
  };

  const handleEditTeam = async (data: Omit<Team, 'id' | 'createdAt' | 'members'>) => {
    if (!editTeam) return;
    setSaving(true);
    try { await updateTeam(editTeam.id, data); setEditTeam(null); } finally { setSaving(false); }
  };

  const handleAddMember = async (userId: string) => {
    if (!liveTeam || addingMember) return; // prevent double-click
    if (currentMemberIds.has(userId)) return; // already a member
    setAddingMember(userId);
    try { await addTeamMember(liveTeam.id, userId); } finally { setAddingMember(null); }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!liveTeam) return;
    await removeTeamMember(liveTeam.id, userId);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Chargement...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Tabs + action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
          {(['users', 'teams'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
              {t === 'users' ? `Membres (${users.length})` : `Équipes (${teams.length})`}
            </button>
          ))}
        </div>
        <button
          onClick={() => tab === 'users' ? setCreateUserOpen(true) : setCreateTeamOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {tab === 'users' ? 'Ajouter un membre' : 'Créer une équipe'}
        </button>
      </div>

      {/* Users tab */}
      {tab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.length === 0 && (
            <div className="col-span-2 text-center py-16 text-slate-400 text-sm">Aucun membre. Commencez par en ajouter un.</div>
          )}
          {users.map(user => (
            <Card key={user.id} className="p-4 flex items-center gap-4 group">
              <Avatar user={user} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                  {user.role === 'admin' ? 'Admin' : 'Membre'}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditUser(user)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button onClick={() => setDeleteUser(user)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Teams tab */}
      {tab === 'teams' && (
        <div className="space-y-4">
          {teams.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm">Aucune équipe. Créez-en une.</div>
          )}
          {teams.map(team => (
            <Card key={team.id} className="p-5 group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: team.color }}>
                    {team.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{team.name}</p>
                    {team.description && <p className="text-xs text-slate-400 mt-0.5">{team.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setMemberTeamId(team.id)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Gérer
                  </button>
                  <button onClick={() => setEditTeam(team)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteTeam(team)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                  </button>
                </div>
              </div>

              {(team.members ?? []).length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {(team.members ?? []).slice(0, 6).map(m => {
                      const user = users.find(u => u.id === m.userId);
                      if (!user) return null;
                      return <Avatar key={m.id} user={user} size="sm" showTooltip />;
                    })}
                    {(team.members ?? []).length > 6 && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                        +{(team.members ?? []).length - 6}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{(team.members ?? []).length} membre{(team.members ?? []).length > 1 ? 's' : ''}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* User modals */}
      <Modal isOpen={createUserOpen} onClose={() => setCreateUserOpen(false)} title="Ajouter un membre">
        <UserForm onSubmit={handleAddUser} onCancel={() => setCreateUserOpen(false)} loading={saving} />
      </Modal>
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Modifier le membre">
        {editUser && <UserForm initial={editUser} onSubmit={handleEditUser} onCancel={() => setEditUser(null)} loading={saving} />}
      </Modal>
      <ConfirmDialog isOpen={!!deleteUser_} onClose={() => setDeleteUser(null)} onConfirm={async () => { await deleteUser(deleteUser_!.id); setDeleteUser(null); }}
        title="Supprimer le membre" message={`Supprimer "${deleteUser_?.name}" ?`} confirmLabel="Supprimer" danger />

      {/* Team modals */}
      <Modal isOpen={createTeamOpen} onClose={() => setCreateTeamOpen(false)} title="Créer une équipe">
        <TeamForm onSubmit={handleAddTeam} onCancel={() => setCreateTeamOpen(false)} loading={saving} />
      </Modal>
      <Modal isOpen={!!editTeam} onClose={() => setEditTeam(null)} title="Modifier l'équipe">
        {editTeam && <TeamForm initial={editTeam} onSubmit={handleEditTeam} onCancel={() => setEditTeam(null)} loading={saving} />}
      </Modal>
      <ConfirmDialog isOpen={!!deleteTeam_} onClose={() => setDeleteTeam(null)} onConfirm={async () => { await deleteTeam(deleteTeam_!.id); setDeleteTeam(null); }}
        title="Supprimer l'équipe" message={`Supprimer "${deleteTeam_?.name}" ?`} confirmLabel="Supprimer" danger />

      {/* Manage team members — uses liveTeam (always fresh from context) */}
      <Modal isOpen={!!memberTeamId} onClose={() => setMemberTeamId(null)} title={`Équipe : ${liveTeam?.name ?? ''}`} size="md">
        {liveTeam && (
          <div className="space-y-4">
            {/* Current members */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Membres actuels ({(liveTeam.members ?? []).length})
              </p>
              {(liveTeam.members ?? []).length === 0 ? (
                <p className="text-sm text-slate-400 py-2">Aucun membre pour l&apos;instant.</p>
              ) : (
                <div className="space-y-1">
                  {(liveTeam.members ?? []).map(m => {
                    const user = users.find(u => u.id === m.userId);
                    if (!user) return null;
                    return (
                      <div key={m.userId} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={user} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.role === 'owner' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                            {m.role === 'owner' ? 'Responsable' : 'Membre'}
                          </span>
                          <button onClick={() => handleRemoveMember(user.id)}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors font-medium">
                            Retirer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add members */}
            {nonMembers.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Ajouter un membre
                </p>
                <div className="space-y-1">
                  {nonMembers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleAddMember(user.id)}
                      disabled={addingMember === user.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors text-left disabled:opacity-50"
                    >
                      <Avatar user={user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                      {addingMember === user.id ? (
                        <span className="text-xs text-slate-400">Ajout...</span>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {nonMembers.length === 0 && (liveTeam.members ?? []).length > 0 && (
              <p className="text-sm text-slate-400 text-center pt-2 border-t border-slate-100">Tous les membres sont déjà dans cette équipe.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
