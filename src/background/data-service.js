import { createInitialState } from '../shared/schema.js';

function sortWeekKeys(keys = []) {
  return [...keys].sort((a, b) => a.localeCompare(b));
}

export function resetState() {
  return createInitialState();
}

export function getTrend(state, maxWeeks = 8) {
  const weekKeys = sortWeekKeys(Object.keys(state.weekly || {})).slice(-maxWeeks);
  return weekKeys.map((weekKey) => {
    const week = state.weekly[weekKey];
    const visits = Array.isArray(week?.visits) ? week.visits.length : 0;
    const credibility = week?.scores?.credibility ?? null;
    const overallHealth = week?.scores?.overallHealth ?? null;
    return { weekKey, visits, credibility, overallHealth };
  });
}

export function exportVisitsCsv(state) {
  const headers = ['weekKey', 'timestamp', 'domain', 'category', 'credibility', 'title'];
  const rows = [headers.join(',')];
  Object.entries(state.weekly || {}).forEach(([weekKey, week]) => {
    (week.visits || []).forEach((visit) => {
      const row = [
        weekKey,
        visit.timestamp || '',
        visit.domain || '',
        visit.category || '',
        visit.credibility ?? '',
        JSON.stringify(visit.title || '')
      ];
      rows.push(row.join(','));
    });
  });
  return rows.join('\n');
}
