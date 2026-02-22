# Milestone 1 Prioritized Refactor Map

## Priority 0

1. Replace unsafe rendering paths in popup/dashboard/content overlays.
2. Define and enforce message schema at runtime boundaries.

## Priority 1

1. Split `background` into:
   1. `message-router.js`
   2. `visit-service.js`
   3. `score-service.js`
   4. `storage-service.js`
2. Split content interventions into isolated components.

## Priority 2

1. Isolate dashboard transformations from DOM rendering.
2. Add migration adapter for v1 data import.

## Priority 3

1. Performance profiling and micro-optimizations.
