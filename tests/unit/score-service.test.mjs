import test from 'node:test';
import assert from 'node:assert/strict';
import { computeWeekSummary } from '../../src/background/score-service.js';

test('computeWeekSummary returns empty-safe summary', () => {
  const summary = computeWeekSummary({});
  assert.equal(summary.totals.visits, 0);
  assert.equal(summary.scores.credibility, null);
});

test('computeWeekSummary calculates credibility and diversity', () => {
  const summary = computeWeekSummary({
    visits: [
      { domain: 'a.com', credibility: 8, category: 'news' },
      { domain: 'b.com', credibility: 6, category: 'news' },
      { domain: 'a.com', credibility: 7, category: 'educational' }
    ]
  });
  assert.equal(summary.totals.visits, 3);
  assert.equal(summary.totals.domains, 2);
  assert.equal(summary.scores.credibility, 7);
  assert.equal(summary.categories.news, 2);
  assert.equal(summary.categories.educational, 1);
});
