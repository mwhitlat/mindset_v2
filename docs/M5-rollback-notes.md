# Milestone 5 Rollback Notes

## Trigger Conditions

Rollback is recommended if any of the following occurs after deployment:

1. State load failures in background startup (`STATE_LOAD_FAILED`, `ROUTE_FAILED`).
2. Visit tracking data loss or incorrect week summaries.
3. New critical UI rendering issue in popup/content/dashboard.

## Rollback Procedure

1. Revert extension package to last known v1 release artifact.
2. Disable v2 deployment channel / unpublish v2 candidate.
3. Preserve failing v2 state payload samples for debugging.
4. Open fix branch in `mindset-v2` and patch with tests.
5. Re-run `npm run test:all` before redeploying.

## Data Safety

1. v2 migration reads v1-shape payload and writes normalized state under `state`.
2. During early rollout, keep v1-compatible backup export path available before enabling v2 widely.
