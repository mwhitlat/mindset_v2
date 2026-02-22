export const ACTIONS = Object.freeze({
  HEALTH_PING: 'health:ping',
  TRACK_VISIT: 'visit:track',
  GET_WEEKLY_SUMMARY: 'summary:get-weekly',
  GET_WEEKLY_DETAIL: 'summary:get-weekly-detail',
  GET_TREND: 'summary:get-trend',
  GET_SETTINGS: 'settings:get',
  UPDATE_SETTINGS: 'settings:update',
  CLEAR_DATA: 'data:clear',
  EXPORT_STATE: 'data:export',
  GET_INTERVENTION_STATE: 'intervention:get-state'
});

export function isKnownAction(action) {
  return Object.values(ACTIONS).includes(action);
}
