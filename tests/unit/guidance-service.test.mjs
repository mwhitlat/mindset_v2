import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/shared/schema.js';
import { assessSourceProfile } from '../../src/shared/source-profile.js';
import { buildInterventionState, updateTelemetryFromVisit } from '../../src/background/guidance-service.js';

test('updateTelemetryFromVisit increases load on low credibility', () => {
  const state = createInitialState();
  const next = updateTelemetryFromVisit(state, {
    credibility: 3.0,
    bias: 'right',
    timestamp: Date.UTC(2026, 1, 22)
  });
  assert.ok(next.telemetry.credibilityLoad > state.telemetry.credibilityLoad);
});

test('buildInterventionState emits same-story upgrade for low-cred source', () => {
  const state = createInitialState();
  const profile = assessSourceProfile('infowars.com', 'Breaking story');
  const response = buildInterventionState(state, profile, 'Breaking story');
  const kinds = response.interventions.map((x) => x.kind);
  assert.ok(kinds.includes('same-story-upgrade'));
});

test('buildInterventionState emits echo breaker when debt side matches page side', () => {
  const state = createInitialState();
  state.telemetry.echoChamberDebt = true;
  state.telemetry.echoChamberDebtBias = 'right';
  const profile = assessSourceProfile('foxnews.com', 'Policy');
  const response = buildInterventionState(state, profile, 'Policy');
  const kinds = response.interventions.map((x) => x.kind);
  assert.ok(kinds.includes('echo-chamber-breaker'));
});

test('buildInterventionState prioritizes echo breaker above same story', () => {
  const state = createInitialState();
  state.telemetry.echoChamberDebt = true;
  state.telemetry.echoChamberDebtBias = 'right';
  state.settings.sameStoryThreshold = 9.5;
  const profile = assessSourceProfile('infowars.com', 'Policy story');
  const response = buildInterventionState(state, profile, 'Policy story');
  assert.equal(response.interventions[0].kind, 'echo-chamber-breaker');
});
