import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIONS } from '../../src/shared/messages.js';
import { createInitialState } from '../../src/shared/schema.js';
import { routeMessage } from '../../src/background/message-router.js';

test('end-to-end flow: update settings then evaluate intervention state', async () => {
  let state = createInitialState();
  const context = {
    getState: async () => state,
    setState: async (nextState) => {
      state = nextState;
    }
  };

  const updated = await routeMessage(
    {
      action: ACTIONS.UPDATE_SETTINGS,
      patch: {
        credibilityGuidance: 'strong',
        sameStoryThreshold: 8.5,
        enableEchoChamberBreaker: true,
        echoChamberBreakerThreshold: 3
      }
    },
    context
  );
  assert.equal(updated.ok, true);
  assert.equal(updated.settings.credibilityGuidance, 'strong');

  const ts = Date.UTC(2026, 1, 22, 18, 30, 0);
  for (const domain of ['foxnews.com', 'breitbart.com', 'infowars.com']) {
    const tracked = await routeMessage(
      { action: ACTIONS.TRACK_VISIT, payload: { domain, title: 'Policy', timestamp: ts } },
      context
    );
    assert.equal(tracked.ok, true);
  }

  const intervention = await routeMessage(
    {
      action: ACTIONS.GET_INTERVENTION_STATE,
      payload: { domain: 'infowars.com', title: 'Policy' }
    },
    context
  );
  assert.equal(intervention.ok, true);
  const kinds = intervention.interventions.map((item) => item.kind);
  assert.ok(kinds.includes('same-story-upgrade'));
  assert.ok(kinds.includes('echo-chamber-breaker'));
});
