import test from 'node:test';
import assert from 'node:assert/strict';
import { SCHEMA_VERSION } from '../../src/shared/schema.js';
import {
  detectSchemaVersion,
  migrateToCurrentSchema,
  migrateV1PayloadToV2
} from '../../src/shared/migration.js';

test('detectSchemaVersion returns explicit schema version when present', () => {
  assert.equal(detectSchemaVersion({ schemaVersion: 7 }), 7);
});

test('detectSchemaVersion defaults to v1 when missing', () => {
  assert.equal(detectSchemaVersion({}), 1);
});

test('migrateV1PayloadToV2 maps settings and telemetry', () => {
  const migrated = migrateV1PayloadToV2({
    userData: {
      trackingStartDate: '2026-02-01T00:00:00.000Z',
      settings: {
        isTracking: false,
        interventionLevel: 'strict',
        lowCredibilityThreshold: 5.2,
        credibilityGuidance: 'strong',
        enableSameStoryUpgrade: false,
        sameStoryThreshold: 8.3,
        enableEchoChamberBreaker: false,
        echoChamberBreakerThreshold: 12
      },
      weeklyData: {}
    },
    credibilityLoad: 34,
    lastCredibilityEventTs: 1700000010000,
    recentBiasHistory: ['left', 'left', 'center'],
    echoChamberDebt: true,
    echoChamberDebtBias: 'left',
    echoChamberDebtTimestamp: 1700000020000,
    echoStateDateKey: '2026-02-20'
  });

  assert.equal(migrated.schemaVersion, SCHEMA_VERSION);
  assert.equal(migrated.profile.trackingStartDate, '2026-02-01T00:00:00.000Z');
  assert.equal(migrated.settings.trackingEnabled, false);
  assert.equal(migrated.settings.interventionLevel, 'strict');
  assert.equal(migrated.settings.lowCredibilityThreshold, 5.2);
  assert.equal(migrated.telemetry.credibilityLoad, 34);
  assert.equal(migrated.telemetry.echoChamberDebt, true);
  assert.equal(migrated.telemetry.echoChamberDebtBias, 'left');
  assert.equal(migrated.meta.migratedFrom, 1);
});

test('migrateV1PayloadToV2 normalizes weekly visits and domains', () => {
  const migrated = migrateV1PayloadToV2({
    userData: {
      weeklyData: {
        '2026-W08': {
          domains: {},
          categories: { news: 2, educational: 1 },
          visits: [
            {
              domain: 'NYTimes.com',
              path: '/world',
              title: 'Headline',
              timestamp: 1700000030000,
              duration: 3,
              category: 'news',
              credibility: 8.1,
              credibilityKnown: true,
              politicalBias: 'left',
              tone: 'neutral',
              sourceName: 'NY Times'
            },
            {
              domain: 'example.com',
              title: 'Example'
            }
          ]
        }
      }
    }
  });

  const week = migrated.weekly['2026-W08'];
  assert.equal(week.visits.length, 2);
  assert.deepEqual(week.aggregates.categories, { news: 2, educational: 1 });
  assert.deepEqual(week.aggregates.domains.sort(), ['example.com', 'nytimes.com']);
  assert.equal(week.visits[0].durationMins, 3);
  assert.equal(week.visits[1].category, 'other');
});

test('migrateToCurrentSchema passes through current payloads', () => {
  const current = { schemaVersion: SCHEMA_VERSION, weekly: { 'x': {} } };
  const result = migrateToCurrentSchema(current);
  assert.equal(result, current);
});
