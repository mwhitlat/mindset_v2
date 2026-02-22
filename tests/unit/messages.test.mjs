import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIONS, isKnownAction } from '../../src/shared/messages.js';

test('known action is recognized', () => {
  assert.equal(isKnownAction(ACTIONS.HEALTH_PING), true);
  assert.equal(isKnownAction(ACTIONS.TRACK_VISIT), true);
  assert.equal(isKnownAction(ACTIONS.GET_WEEKLY_SUMMARY), true);
  assert.equal(isKnownAction(ACTIONS.GET_WEEKLY_DETAIL), true);
  assert.equal(isKnownAction(ACTIONS.GET_TREND), true);
  assert.equal(isKnownAction(ACTIONS.GET_SETTINGS), true);
  assert.equal(isKnownAction(ACTIONS.UPDATE_SETTINGS), true);
  assert.equal(isKnownAction(ACTIONS.CLEAR_DATA), true);
  assert.equal(isKnownAction(ACTIONS.EXPORT_STATE), true);
  assert.equal(isKnownAction(ACTIONS.GET_INTERVENTION_STATE), true);
  assert.equal(isKnownAction('unknown:action'), false);
});
