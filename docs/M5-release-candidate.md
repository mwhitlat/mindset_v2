# Milestone 5 Release Candidate

## Candidate

Mindset v2 scaffold with modular background services, migration layer, safe rendering baseline, and CI-backed tests.

## Included

1. Background service split (`message-router`, `visit-service`, `score-service`, `storage-service`).
2. v1-to-v2 schema migration path.
3. Safe rendering utilities and static unsafe-pattern guard test.
4. Unit/integration/e2e test suites.
5. CI workflow and packaging script.

## Release Commands

From `/Users/matthewwhitlatch/mindset/mindset-v2`:

```bash
npm install
npm run test:all
npm run build:package
```

Packaged files output:

`/Users/matthewwhitlatch/mindset/mindset-v2/dist/mindset-v2-extension`
