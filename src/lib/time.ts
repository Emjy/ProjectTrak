import { TimeUnit } from '@/types';

/**
 * Convert any time unit to minutes (base unit for calculations)
 */
export function timeToMinutes(value: number, unit: TimeUnit): number {
  const conversions: Record<TimeUnit, number> = {
    minutes: 1,
    hours: 60,
    days: 60 * 8, // 8 hour workday
    weeks: 60 * 8 * 5, // 5 day week
    years: 60 * 8 * 5 * 52, // 52 weeks per year
  };
  return value * conversions[unit];
}

/**
 * Format minutes into readable time string
 * E.g., 480 minutes → "8 hours"
 */
export function formatTime(minutes: number): string {
  if (minutes === 0) return '0m';

  const days = Math.floor(minutes / (60 * 8));
  const hours = Math.floor((minutes % (60 * 8)) / 60);
  const mins = minutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}j`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);

  return parts.join(' ');
}

/**
 * Format time with unit as entered by user
 * E.g., (5, 'hours') → "5 heures"
 */
export function formatTimeWithUnit(value: number | undefined, unit: TimeUnit | undefined): string {
  if (!value || !unit) return '—';

  const labels: Record<TimeUnit, [string, string]> = {
    minutes: ['minute', 'minutes'],
    hours:   ['heure',  'heures'],
    days:    ['jour',   'jours'],
    weeks:   ['semaine','semaines'],
    years:   ['an',     'ans'],
  };
  const [singular, plural] = labels[unit];
  return `${value} ${value > 1 ? plural : singular}`;
}

/**
 * Calculate ratio and status (estimated vs actual)
 * Returns { ratio, status }
 * ratio > 1: behind (took longer than estimated)
 * ratio < 1: ahead (finished faster)
 * ratio 0.8-1.2: on-track
 */
export function calculateRatio(
  estimatedValue: number | undefined,
  estimatedUnit: TimeUnit | undefined,
  actualValue: number | undefined,
  actualUnit: TimeUnit | undefined
): { ratio: number | null; status: 'ahead' | 'on-track' | 'behind' } {
  if (!estimatedValue || !estimatedUnit || !actualValue || !actualUnit) {
    return { ratio: null, status: 'on-track' };
  }

  const estimatedMinutes = timeToMinutes(estimatedValue, estimatedUnit);
  const actualMinutes = timeToMinutes(actualValue, actualUnit);

  if (estimatedMinutes === 0) {
    return { ratio: null, status: 'on-track' };
  }

  const ratio = actualMinutes / estimatedMinutes;

  // Determine status: on-track if between 0.8 and 1.2
  let status: 'ahead' | 'on-track' | 'behind';
  if (ratio < 0.8) {
    status = 'ahead';
  } else if (ratio > 1.2) {
    status = 'behind';
  } else {
    status = 'on-track';
  }

  return { ratio, status };
}

/**
 * Format ratio as percentage
 * E.g., 1.5 → "150%"
 */
export function formatRatio(ratio: number | null): string {
  if (ratio === null) return '—';
  return `${Math.round(ratio * 100)}%`;
}

/**
 * Get status color for display
 */
export function getStatusColor(status: 'ahead' | 'on-track' | 'behind'): string {
  switch (status) {
    case 'ahead':
      return 'text-green-600';
    case 'on-track':
      return 'text-blue-600';
    case 'behind':
      return 'text-red-600';
  }
}

/**
 * Get status label
 */
export function getStatusLabel(status: 'ahead' | 'on-track' | 'behind'): string {
  switch (status) {
    case 'ahead':
      return 'En avance';
    case 'on-track':
      return 'À l\'heure';
    case 'behind':
      return 'En retard';
  }
}
