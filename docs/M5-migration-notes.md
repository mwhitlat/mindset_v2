# Milestone 5 Migration Notes

## Source and Target

1. Source: v1 storage payload using top-level keys (`userData`, `credibilityLoad`, `recentBiasHistory`, echo keys).
2. Target: v2 state with `schemaVersion=2`, normalized `settings`, `telemetry`, and `weekly` records.

## Migration Entry

Code path:

1. `/Users/matthewwhitlatch/mindset/mindset-v2/src/background/storage-service.js`
2. `/Users/matthewwhitlatch/mindset/mindset-v2/src/shared/migration.js`

## Important Mapping Rules

1. `userData.settings.isTracking` -> `settings.trackingEnabled`.
2. Legacy credibility/echo top-level keys -> `telemetry`.
3. `weeklyData[weekKey].visits[]` normalized into consistent visit shape.
4. Domain aggregates rebuilt from visits where needed.
5. `meta.migratedFrom=1` and `meta.migratedAt` set on migrated payloads.

## Validation

Migration behavior is covered in:

1. `/Users/matthewwhitlatch/mindset/mindset-v2/tests/unit/migration.test.mjs`
2. `/Users/matthewwhitlatch/mindset/mindset-v2/tests/unit/storage-service.test.mjs`
