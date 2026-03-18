'use client';

import { useState } from 'react';
import { TimeEntryUnit } from '@/types';

interface TimeEntryFormProps {
  taskId: string;
  projectId: string;
  onSave: (data: { duration: number; unit: TimeEntryUnit; date: string; note?: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function TimeEntryForm({ taskId: _taskId, projectId: _projectId, onSave, onCancel, loading }: TimeEntryFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [duration, setDuration] = useState('');
  const [unit, setUnit] = useState<TimeEntryUnit>('hours');
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration || parseFloat(duration) <= 0) return;
    await onSave({
      duration: parseFloat(duration),
      unit,
      date,
      note: note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Durée *</label>
          <input
            type="number"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            min="0.1"
            step="0.5"
            placeholder="Ex : 2"
            required
            autoFocus
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Unité</label>
          <select
            value={unit}
            onChange={e => setUnit(e.target.value as TimeEntryUnit)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Heures</option>
            <option value="days">Jours</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Note <span className="text-slate-400">(optionnel)</span></label>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Ex : Réunion client, dev feature X..."
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
        />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading || !duration || parseFloat(duration) <= 0}
          className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
