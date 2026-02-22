import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIONS } from '../../src/shared/messages.js';
import { createInitialState } from '../../src/shared/schema.js';
import { routeMessage } from '../../src/background/message-router.js';

test('message router handles health ping', async () => {
  const state = createInitialState();
  const response = await routeMessage(
    { action: ACTIONS.HEALTH_PING },
    {
      getState: async () => state,
      setState: async () => {}
    }
  );
  assert.equal(response.ok, true);
  assert.equal(response.schemaVersion, state.schemaVersion);
});

test('message router tracks visit and returns weekly summary', async () => {
  let state = createInitialState();
  const context = {
    getState: async () => state,
    setState: async (next) => {
      state = next;
    }
  };

  const tracked = await routeMessage(
    {
      action: ACTIONS.TRACK_VISIT,
      payload: {
        domain: 'example.com',
        category: 'news',
        credibility: 7.5,
        timestamp: Date.UTC(2026, 1, 22, 12, 0, 0)
      }
    },
    context
  );

  assert.equal(tracked.ok, true);

  const summary = await routeMessage(
    {
      action: ACTIONS.GET_WEEKLY_SUMMARY,
      nowTs: Date.UTC(2026, 1, 22, 12, 0, 0)
    },
    context
  );
  assert.equal(summary.ok, true);
  assert.equal(summary.summary.totals.visits, 1);

  const detail = await routeMessage(
    {
      action: ACTIONS.GET_WEEKLY_DETAIL,
      nowTs: Date.UTC(2026, 1, 22, 12, 0, 0)
    },
    context
  );
  assert.equal(detail.ok, true);
  assert.equal(detail.visits.length, 1);

  const trend = await routeMessage(
    { action: ACTIONS.GET_TREND, maxWeeks: 8 },
    context
  );
  assert.equal(trend.ok, true);
  assert.equal(trend.points.length, 1);

  const settings = await routeMessage({ action: ACTIONS.GET_SETTINGS }, context);
  assert.equal(settings.ok, true);
  assert.equal(typeof settings.settings.trackingEnabled, 'boolean');

  const updated = await routeMessage(
    { action: ACTIONS.UPDATE_SETTINGS, patch: { credibilityGuidance: 'strong' } },
    context
  );
  assert.equal(updated.ok, true);
  assert.equal(updated.settings.credibilityGuidance, 'strong');

  const intervention = await routeMessage(
    {
      action: ACTIONS.GET_INTERVENTION_STATE,
      payload: { domain: 'infowars.com', title: 'Same story' }
    },
    context
  );
  assert.equal(intervention.ok, true);
  assert.ok(Array.isArray(intervention.interventions));

  const exported = await routeMessage({ action: ACTIONS.EXPORT_STATE }, context);
  assert.equal(exported.ok, true);
  assert.ok(exported.csv.includes('weekKey,timestamp,domain'));

  const cleared = await routeMessage({ action: ACTIONS.CLEAR_DATA }, context);
  assert.equal(cleared.ok, true);
  assert.deepEqual(state.weekly, {});
});
