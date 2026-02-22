# Mindset v2 Workspace

Clean workspace for rebuilding Mindset with a modular architecture and stronger security/testing defaults.

## Goals

1. Preserve v1 feature intent (privacy-first, local-first digital diet guidance).
2. Remove legacy coupling and unsafe render patterns.
3. Ship with stronger automated verification.

## Initial Structure

1. `docs/` architecture and milestone documents.
2. `src/` modular extension code.
3. `tests/` unit/integration/e2e test suites.
4. `assets/` vetted static assets only.

## Commands

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:all
```
