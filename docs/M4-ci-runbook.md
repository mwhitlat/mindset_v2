# Milestone 4 CI Runbook

## Required Checks

1. `npm run test:unit`
2. `npm run test:integration`
3. `npm run test:e2e`
4. `npm run test:browser`
5. `npm run test:all`

## Local Verification

From `/Users/matthewwhitlatch/mindset/mindset-v2`:

```bash
npm install
npx playwright install chromium
npm run test:all
```

## CI Workflow

Workflow file:

`/Users/matthewwhitlatch/mindset/.github/workflows/mindset-v2-ci.yml`

Behavior:

1. Runs on push/PR when `mindset-v2/**` changes.
2. Tests Node 20.x and 22.x.
3. Executes full test suite in `mindset-v2`.

## Failure Triage

1. Reproduce failure locally with `npm run test:all`.
2. If integration test fails on unsafe patterns, remove forbidden APIs (`innerHTML`, `outerHTML`, `insertAdjacentHTML`, inline `on*=`).
3. If schema or migration tests fail, verify contract changes in `src/shared/schema.js` and `src/shared/migration.js`.
4. Re-run all suites after fix before merging.
