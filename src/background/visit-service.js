import { computeWeekSummary } from './score-service.js';
import { assessSourceProfile } from '../shared/source-profile.js';
import { updateTelemetryFromVisit } from './guidance-service.js';

function getWeekKey(ts) {
  const date = new Date(ts);
  const year = date.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const dayOfYear = Math.floor((date - start) / 86400000) + 1;
  const week = Math.ceil(dayOfYear / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function normalizeVisitPayload(payload = {}) {
  const domain = typeof payload.domain === 'string' ? payload.domain.toLowerCase() : '';
  const title = typeof payload.title === 'string' ? payload.title : '';
  const profile = assessSourceProfile(domain, title);
  const ts = Number(payload.timestamp);
  return {
    domain,
    title,
    sourceName: profile.name,
    bias: profile.bias,
    category: typeof payload.category === 'string' ? payload.category : profile.category,
    credibility: Number.isFinite(Number(payload.credibility)) ? Number(payload.credibility) : profile.credibility,
    timestamp: Number.isFinite(ts) ? ts : Date.now()
  };
}

export function trackVisit(state, payload = {}) {
  const visit = normalizeVisitPayload(payload);
  if (!visit.domain) {
    return { ok: false, error: 'INVALID_VISIT_DOMAIN', state };
  }

  const next = structuredClone(state);
  const weekKey = getWeekKey(visit.timestamp);
  if (!next.weekly[weekKey]) {
    next.weekly[weekKey] = {
      visits: [],
      aggregates: { categories: {}, domains: [] },
      scores: { overallHealth: null, credibility: null, sourceDiversity: 0 }
    };
  }

  next.weekly[weekKey].visits.push(visit);
  const summary = computeWeekSummary(next.weekly[weekKey]);
  next.weekly[weekKey].aggregates = {
    categories: summary.categories,
    domains: Object.keys(
      next.weekly[weekKey].visits.reduce((acc, v) => {
        if (v.domain) acc[v.domain] = true;
        return acc;
      }, {})
    )
  };
  next.weekly[weekKey].scores = summary.scores;
  const withTelemetry = updateTelemetryFromVisit(next, visit);
  return { ok: true, state: withTelemetry, weekKey };
}

export function getCurrentWeekSummary(state, nowTs = Date.now()) {
  const weekKey = getWeekKey(nowTs);
  const week = state.weekly[weekKey] || {
    visits: [],
    aggregates: { categories: {}, domains: [] },
    scores: { overallHealth: null, credibility: null, sourceDiversity: 0 }
  };
  return { weekKey, summary: computeWeekSummary(week) };
}

export function getCurrentWeekDetail(state, nowTs = Date.now()) {
  const weekKey = getWeekKey(nowTs);
  const week = state.weekly[weekKey] || {
    visits: [],
    aggregates: { categories: {}, domains: [] },
    scores: { overallHealth: null, credibility: null, sourceDiversity: 0 }
  };

  const sortedVisits = [...week.visits].sort((a, b) => b.timestamp - a.timestamp);
  return {
    weekKey,
    summary: computeWeekSummary(week),
    visits: sortedVisits
  };
}
