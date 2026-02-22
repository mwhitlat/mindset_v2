import test from 'node:test';
import assert from 'node:assert/strict';
import { assessSourceProfile, getAlternativeSources } from '../../src/shared/source-profile.js';

test('assessSourceProfile returns known source credibility', () => {
  const profile = assessSourceProfile('www.reuters.com', 'World update');
  assert.equal(profile.category, 'news');
  assert.equal(profile.credibility, 9.2);
  assert.equal(profile.bias, 'center');
});

test('assessSourceProfile infers category for unknown domains', () => {
  const profile = assessSourceProfile('example.org', 'Learn JavaScript course');
  assert.equal(profile.credibility, null);
  assert.equal(profile.category, 'educational');
});

test('getAlternativeSources returns high-cred options', () => {
  const alts = getAlternativeSources('infowars.com', 2);
  assert.equal(alts.length, 2);
  assert.ok(alts[0].credibility >= 8.5);
});
