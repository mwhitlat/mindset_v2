import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/shared/schema.js';
import { mergeSettings } from '../../src/background/settings-service.js';

test('mergeSettings applies valid patch', () => {
  const state = createInitialState();
  const next = mergeSettings(state, {
    credibilityGuidance: 'strong',
    sameStoryThreshold: 8.8
  });
  assert.equal(next.settings.credibilityGuidance, 'strong');
  assert.equal(next.settings.sameStoryThreshold, 8.8);
});

test('mergeSettings bounds invalid numeric inputs', () => {
  const state = createInitialState();
  const next = mergeSettings(state, {
    lowCredibilityThreshold: 999,
    echoChamberBreakerThreshold: 0
  });
  assert.equal(next.settings.lowCredibilityThreshold, 9.5);
  assert.equal(next.settings.echoChamberBreakerThreshold, 3);
});
