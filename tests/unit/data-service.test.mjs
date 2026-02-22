import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/shared/schema.js';
import { exportVisitsCsv, getTrend, resetState } from '../../src/background/data-service.js';

test('resetState returns fresh schema state', () => {
  const state = resetState();
  assert.ok(state.schemaVersion >= 1);
  assert.deepEqual(state.weekly, {});
});

test('getTrend returns ordered weekly points', () => {
  const state = createInitialState();
  state.weekly['2026-W01'] = { visits: [{}, {}], scores: { credibility: 7.1, overallHealth: 7.2 } };
  state.weekly['2026-W02'] = { visits: [{}], scores: { credibility: 6.8, overallHealth: 6.9 } };
  const points = getTrend(state, 8);
  assert.equal(points.length, 2);
  assert.equal(points[0].weekKey, '2026-W01');
  assert.equal(points[1].visits, 1);
});

test('exportVisitsCsv includes visit rows', () => {
  const state = createInitialState();
  state.weekly['2026-W08'] = {
    visits: [{ timestamp: 1, domain: 'example.com', category: 'news', credibility: 7.1, title: 'Title' }]
  };
  const csv = exportVisitsCsv(state);
  assert.ok(csv.includes('weekKey,timestamp,domain,category,credibility,title'));
  assert.ok(csv.includes('2026-W08,1,example.com,news,7.1'));
});
