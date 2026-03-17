'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TaskComment, User } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { useApp } from '@/context/AppContext';

interface TaskCommentsProps {
  taskId: string;
  currentUser: User;
  mentionableUsers: User[];
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'à l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

/** Renders comment content, turning @{userId} into colored chips */
function CommentContent({ content, users }: { content: string; users: User[] }) {
  const parts = content.split(/(@\{[^}]+\})/g);
  return (
    <span>
      {parts.map((part, i) => {
        const match = part.match(/^@\{([^}]+)\}$/);
        if (match) {
          const user = users.find(u => u.id === match[1]);
          if (user) {
            return (
              <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium"
                style={{ backgroundColor: user.avatarColor + '22', color: user.avatarColor }}>
                @{user.name.split(' ')[0]}
              </span>
            );
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export default function TaskComments({ taskId, currentUser, mentionableUsers }: TaskCommentsProps) {
  const { users: allUsers } = useApp();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(0);
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/tasks/${taskId}/comments`);
    if (res.ok) setComments(await res.json());
    setLoading(false);
  }, [taskId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const mentionSuggestions = mentionQuery !== null
    ? mentionableUsers.filter(u =>
        u.name.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : [];

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    const cursor = e.target.selectionStart ?? val.length;
    // Find @ before cursor
    const beforeCursor = val.slice(0, cursor);
    const atIdx = beforeCursor.lastIndexOf('@');
    if (atIdx !== -1 && !beforeCursor.slice(atIdx).includes(' ')) {
      setMentionQuery(beforeCursor.slice(atIdx + 1));
      setMentionStart(atIdx);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (user: User) => {
    const before = content.slice(0, mentionStart);
    const after = content.slice(textareaRef.current?.selectionStart ?? content.length);
    const newContent = `${before}@{${user.id}} ${after}`;
    setContent(newContent);
    setMentionQuery(null);
    setTimeout(() => {
      const pos = before.length + user.id.length + 4;
      textareaRef.current?.setSelectionRange(pos, pos);
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => Math.min(i + 1, mentionSuggestions.length - 1)); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setMentionIndex(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionSuggestions[mentionIndex]); return; }
      if (e.key === 'Escape')    { setMentionQuery(null); return; }
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: currentUser.id, content }),
      });
      if (res.ok) {
        const comment: TaskComment = await res.json();
        setComments(prev => [...prev, comment]);
        setContent('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/tasks/${taskId}/comments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setComments(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-slate-700">
        Commentaires
        {comments.length > 0 && (
          <span className="ml-2 text-xs font-normal text-slate-400">{comments.length}</span>
        )}
      </h3>

      {/* Comment list */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {loading && (
          <div className="text-xs text-slate-400 py-4 text-center">Chargement...</div>
        )}
        {!loading && comments.length === 0 && (
          <div className="text-xs text-slate-400 py-4 text-center">Aucun commentaire. Soyez le premier !</div>
        )}
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3 group">
            {comment.author && <Avatar user={comment.author} size="sm" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-slate-700">{comment.author?.name ?? 'Inconnu'}</span>
                <span className="text-[10px] text-slate-400">{formatRelative(comment.createdAt)}</span>
                {comment.authorId === currentUser.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-red-500 transition-all"
                  >
                    Supprimer
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">
                <CommentContent content={comment.content} users={allUsers} />
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="relative">
        {mentionQuery !== null && mentionSuggestions.length > 0 && (
          <div className="absolute bottom-full mb-1 left-0 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-48">
            {mentionSuggestions.map((u, i) => (
              <button
                key={u.id}
                type="button"
                onMouseDown={e => { e.preventDefault(); insertMention(u); }}
                className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-slate-50 ${i === mentionIndex ? 'bg-indigo-50' : ''}`}
              >
                <Avatar user={u} size="xs" />
                <span className="font-medium text-slate-700">{u.name}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-end">
          <Avatar user={currentUser} size="sm" />
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ajouter un commentaire... (@mention, Ctrl+Entrée pour envoyer)"
              rows={2}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="flex-shrink-0 px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors self-end"
          >
            {submitting ? '...' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  );
}
