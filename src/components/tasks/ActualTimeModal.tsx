'use client';

import { useState } from 'react';
import { TimeUnit } from '@/types';

interface ActualTimeModalProps {
  taskTitle: string;
  onSave: (actualTime: number, actualTimeUnit: TimeUnit) => void;
  onSkip: () => void;
}

export default function ActualTimeModal({ taskTitle, onSave, onSkip }: ActualTimeModalProps) {
  const [actualTime, setActualTime] = useState('');
  const [actualTimeUnit, setActualTimeUnit] = useState<TimeUnit>('hours');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!actualTime || parseInt(actualTime) < 0) return;
    setLoading(true);
    try {
      onSave(parseInt(actualTime), actualTimeUnit);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Enregistrer le temps réel</h3>
          <p className="text-sm text-gray-500 mt-1">Tâche: <span className="font-medium">{taskTitle}</span></p>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Combien de temps avez-vous réellement passé sur cette tâche ?</p>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Temps réel</label>
              <input
                type="number"
                value={actualTime}
                onChange={(e) => setActualTime(e.target.value)}
                min="0"
                placeholder="Ex: 3"
                autoFocus
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
              <select
                value={actualTimeUnit}
                onChange={(e) => setActualTimeUnit(e.target.value as TimeUnit)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Heures</option>
                <option value="days">Jours</option>
                <option value="weeks">Semaines</option>
                <option value="years">Années</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onSkip}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Ignorer
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !actualTime || parseInt(actualTime) < 0}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
