import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCategoryBars, buildHealthGaugeModel, buildTrendBars } from '../../src/dashboard/visual-model.js';

test('buildHealthGaugeModel handles missing score safely', () => {
  const model = buildHealthGaugeModel(null);
  assert.equal(model.scoreLabel, '-');
  assert.equal(model.percent, 0);
  assert.equal(model.bandClass, 'bandNone');
});

test('buildHealthGaugeModel maps score to percent and band', () => {
  const model = buildHealthGaugeModel(7.2);
  assert.equal(model.scoreLabel, '7.2');
  assert.equal(model.percent, 72);
  assert.equal(model.bandClass, 'bandMid');
});

test('buildCategoryBars normalizes percentages', () => {
  const bars = buildCategoryBars({ news: 3, politics: 1 });
  assert.equal(bars.length, 2);
  assert.equal(bars[0].name, 'news');
  assert.equal(bars[0].percent, 75);
  assert.equal(bars[1].percent, 25);
});

test('buildTrendBars scales visits and health', () => {
  const bars = buildTrendBars([
    { weekKey: '2026-W08', visits: 4, overallHealth: 6.8 },
    { weekKey: '2026-W09', visits: 2, overallHealth: 5.1 }
  ]);
  assert.equal(bars.length, 2);
  assert.equal(bars[0].visitsPercent, 100);
  assert.equal(bars[1].visitsPercent, 50);
  assert.equal(bars[0].healthPercent, 68);
});
