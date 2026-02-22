# Milestone 1 Threat Model Checklist

## Input/Output Safety

1. No `innerHTML` with untrusted values.
2. No inline event handlers in generated markup.
3. Use `textContent`/`setAttribute` via safe helpers.

## Extension Boundaries

1. Keep permissions at least privilege.
2. Restrict host permissions unless required for shipped feature.
3. Validate all message payloads crossing runtime boundaries.

## Data Protection

1. Store only required fields.
2. Version and validate stored payloads before use.
3. No external transmission of browsing data by default.

## Release Gating

1. Block merge on failing tests.
2. Block merge on known high-severity security finding.
