import { ACTIONS } from '../shared/messages.js';
import { getCurrentWeekDetail, getCurrentWeekSummary, trackVisit } from './visit-service.js';
import { assessSourceProfile } from '../shared/source-profile.js';
import { buildInterventionState } from './guidance-service.js';
import { mergeSettings } from './settings-service.js';
import { exportVisitsCsv, getTrend, resetState } from './data-service.js';

export async function routeMessage(request, context) {
  const { getState, setState } = context;
  const state = await getState();

  if (request.action === ACTIONS.HEALTH_PING) {
    return { ok: true, service: 'background', ts: Date.now(), schemaVersion: state.schemaVersion };
  }

  if (request.action === ACTIONS.TRACK_VISIT) {
    const result = trackVisit(state, request.payload);
    if (!result.ok) return { ok: false, error: result.error };
    await setState(result.state);
    return { ok: true, weekKey: result.weekKey };
  }

  if (request.action === ACTIONS.GET_WEEKLY_SUMMARY) {
    const { weekKey, summary } = getCurrentWeekSummary(state, request.nowTs);
    return { ok: true, weekKey, summary };
  }

  if (request.action === ACTIONS.GET_WEEKLY_DETAIL) {
    const { weekKey, summary, visits } = getCurrentWeekDetail(state, request.nowTs);
    return { ok: true, weekKey, summary, visits };
  }

  if (request.action === ACTIONS.GET_TREND) {
    return { ok: true, points: getTrend(state, request.maxWeeks || 8) };
  }

  if (request.action === ACTIONS.GET_SETTINGS) {
    return { ok: true, settings: state.settings };
  }

  if (request.action === ACTIONS.UPDATE_SETTINGS) {
    const nextState = mergeSettings(state, request.patch || {});
    await setState(nextState);
    return { ok: true, settings: nextState.settings };
  }

  if (request.action === ACTIONS.CLEAR_DATA) {
    const nextState = resetState();
    await setState(nextState);
    return { ok: true };
  }

  if (request.action === ACTIONS.EXPORT_STATE) {
    return { ok: true, state, csv: exportVisitsCsv(state) };
  }

  if (request.action === ACTIONS.GET_INTERVENTION_STATE) {
    const payload = request.payload || {};
    const domain = payload.domain || '';
    const title = payload.title || '';
    const pageProfile = assessSourceProfile(domain, title);
    return buildInterventionState(state, pageProfile, title);
  }

  return { ok: false, error: 'UNKNOWN_ACTION' };
}
