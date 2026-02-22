import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIONS } from '../../src/shared/messages.js';
import { createInitialState } from '../../src/shared/schema.js';
import { routeMessage } from '../../src/background/message-router.js';

test('end-to-end flow: health -> track visit -> weekly summary', async () => {
  let state = createInitialState();
  const context = {
    getState: async () => state,
    setState: async (nextState) => {
      state = nextState;
    }
  };

  const health = await routeMessage({ action: ACTIONS.HEALTH_PING }, context);
  assert.equal(health.ok, true);

  const nowTs = Date.UTC(2026, 1, 22, 18, 30, 0);
  const tracked = await routeMessage(
    {
      action: ACTIONS.TRACK_VISIT,
      payload: {
        domain: 'Reuters.com',
        title: 'World Update',
        category: 'news',
        credibility: 8.4,
        timestamp: nowTs
      }
    },
    context
  );
  assert.equal(tracked.ok, true);

  const summary = await routeMessage(
    { action: ACTIONS.GET_WEEKLY_SUMMARY, nowTs },
    context
  );
  assert.equal(summary.ok, true);
  assert.equal(summary.summary.totals.visits, 1);
  assert.equal(summary.summary.totals.domains, 1);
  assert.equal(summary.summary.scores.credibility, 8.4);
});
