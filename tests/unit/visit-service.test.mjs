import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/shared/schema.js';
import { getCurrentWeekSummary, trackVisit } from '../../src/background/visit-service.js';

test('trackVisit rejects payload without domain', () => {
  const state = createInitialState();
  const result = trackVisit(state, { title: 'No domain' });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'INVALID_VISIT_DOMAIN');
});

test('trackVisit appends visit and updates week scores', () => {
  const state = createInitialState();
  const ts = Date.UTC(2026, 1, 22, 12, 0, 0);
  const result = trackVisit(state, {
    domain: 'Example.com',
    title: 'Story',
    category: 'news',
    credibility: 8.2,
    timestamp: ts
  });

  assert.equal(result.ok, true);
  const week = result.state.weekly[result.weekKey];
  assert.equal(week.visits.length, 1);
  assert.equal(week.scores.credibility, 8.2);
  assert.deepEqual(week.aggregates.domains, ['example.com']);
  assert.equal(week.visits[0].sourceName.length > 0, true);
});

test('getCurrentWeekSummary returns consistent structure', () => {
  const state = createInitialState();
  const summary = getCurrentWeekSummary(state, Date.UTC(2026, 1, 22, 12, 0, 0));
  assert.ok(summary.weekKey.startsWith('2026-W'));
  assert.equal(summary.summary.totals.visits, 0);
});

test('trackVisit can trigger echo debt after repeated same-bias visits', () => {
  let state = createInitialState();
  state.settings.echoChamberBreakerThreshold = 3;
  const ts = Date.UTC(2026, 1, 22, 12, 0, 0);
  const domains = ['foxnews.com', 'breitbart.com', 'infowars.com'];
  domains.forEach((domain, index) => {
    const result = trackVisit(state, { domain, title: 'Story', timestamp: ts + index });
    state = result.state;
  });
  assert.equal(state.telemetry.echoChamberDebt, true);
  assert.equal(state.telemetry.echoChamberDebtBias, 'right');
});
