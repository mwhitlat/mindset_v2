# Milestone 1 Architecture Map

## Runtime Boundaries

1. `src/background/`
   1. Message router.
   2. Visit ingestion and scoring domain services.
   3. Storage adapter.
2. `src/content/`
   1. Page signal extraction.
   2. Intervention renderer (safe DOM APIs only).
3. `src/popup/`
   1. Read-only UI over message contracts.
4. `src/dashboard/`
   1. Weekly reports and trends with escaped/safe rendering.
5. `src/shared/`
   1. Schema contracts.
   2. Validation utilities.
   3. Security helpers.

## Data Contracts

1. Storage schema versioned in `src/shared/schema.js`.
2. Runtime messages defined in `src/shared/messages.js`.
3. All inbound content data validated before persistence.
