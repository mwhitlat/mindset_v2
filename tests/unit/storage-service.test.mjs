import test from 'node:test';
import assert from 'node:assert/strict';
import { SCHEMA_VERSION } from '../../src/shared/schema.js';
import { normalizeStoragePayload } from '../../src/background/storage-service.js';

test('normalizeStoragePayload returns initial state for empty payload', () => {
  const normalized = normalizeStoragePayload({});
  assert.equal(normalized.schemaVersion, SCHEMA_VERSION);
  assert.ok(normalized.settings);
});

test('normalizeStoragePayload migrates v1-shaped payload', () => {
  const normalized = normalizeStoragePayload({
    userData: {
      settings: { isTracking: false },
      weeklyData: {
        '2026-W08': {
          visits: [{ domain: 'example.com', title: 'hello' }],
          categories: { news: 1 }
        }
      }
    },
    credibilityLoad: 15,
    recentBiasHistory: ['left']
  });

  assert.equal(normalized.schemaVersion, SCHEMA_VERSION);
  assert.equal(normalized.settings.trackingEnabled, false);
  assert.equal(normalized.telemetry.credibilityLoad, 15);
  assert.equal(normalized.weekly['2026-W08'].visits.length, 1);
});

test('normalizeStoragePayload returns current payload unchanged', () => {
  const current = { state: { schemaVersion: SCHEMA_VERSION, weekly: {} } };
  const normalized = normalizeStoragePayload(current);
  assert.equal(normalized.schemaVersion, SCHEMA_VERSION);
  assert.deepEqual(normalized.weekly, {});
});
