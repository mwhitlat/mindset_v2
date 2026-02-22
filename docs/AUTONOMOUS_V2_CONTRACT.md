## Mindset v2 AI Execution Charter
**Project:** Mindset v2 (Privacy-First Digital Diet Extension)  
**Charter Date:** February 22, 2026  
**Execution Mode:** Autonomous in-repo delivery by AI agent, sequentially through milestones until blocker.

### 1. Objective
Deliver a better Mindset extension version with stronger security, clearer architecture, and higher delivery confidence while preserving core product behavior.

### 2. Why v2 Is Required (Evidence)
The current repository works but has measurable technical debt and risk:

1. Dynamic HTML rendering with untrusted values exists (for example `/Users/matthewwhitlatch/mindset/dashboard.js:1411` and `/Users/matthewwhitlatch/mindset/dashboard.js:1412`).
2. Sanitization exists but is not a full output-encoding strategy (`/Users/matthewwhitlatch/mindset/background.js:2686`).
3. Large monolithic files raise change risk (`/Users/matthewwhitlatch/mindset/background.js` and `/Users/matthewwhitlatch/mindset/browser-status-indicator.js`).
4. Permission surface is broad (`/Users/matthewwhitlatch/mindset/manifest.json:19` and `/Users/matthewwhitlatch/mindset/manifest.json:34`).
5. Test depth is narrow for total behavior (`/Users/matthewwhitlatch/mindset/tests/logic/credibility-recovery.test.mjs`).

### 3. Scope
In scope for autonomous execution:

1. Refactor architecture into maintainable modules.
2. Remove unsafe render patterns and harden security.
3. Expand automated tests and quality gates.
4. Preserve and improve core UX flows.
5. Add migration-safe data handling and release readiness.
6. Deliver a first-pass presentation layer with required visual analytics components (or higher-quality alternatives).

Out of scope unless explicitly added:

1. Cloud backend features.
2. Mobile applications.
3. Net-new ML model training systems.

### 4. Non-Negotiable Quality Gates
A milestone is complete only if these pass:

1. `npm run test:logic` passes.
2. `npm run test:smoke` passes.
3. New/changed core modules include automated tests.
4. No known untrusted-content HTML interpolation remains in touched flows.
5. No regression in core features: tracking, credibility guidance, echo-chamber interventions, dashboard.
6. UX parity checks pass for popup, dashboard, and intervention surfaces on desktop Chrome.
7. User-facing defects found during manual validation are fixed before milestone closeout or explicitly deferred in writing.
8. Required visual components are present and data-wired (no placeholder-only completion claims).

### 5. Milestones and Timelines
These are execution estimates, not promises. They are based on current repository complexity and single-agent throughput.

1. Milestone 1: Baseline hardening, plan, and presentation pass
   1. Deliverables: architecture map, threat model checklist, prioritized refactor map, test expansion plan, and initial UX/presentation implementation.
   2. Required presentation deliverables:
      1. Trend visualization (line/bar/sparkline equivalent).
      2. Category distribution visualization (donut/bar/stack equivalent).
      3. Overall health visualization (gauge/score-card with visual scale).
      4. Intervention parity treatment (header/footer state chrome + modal/banner behavior).
   3. Estimate: 1-3 working days.
2. Milestone 2: Security and rendering hardening
   1. Deliverables: remove unsafe dynamic HTML paths in popup/dashboard/content UI; add safe rendering helpers.
   2. Estimate: 2-4 working days.
3. Milestone 3: Architecture split
   1. Deliverables: break `background.js` and `browser-status-indicator.js` into modules with clear boundaries.
   2. Estimate: 3-6 working days.
4. Milestone 4: Test expansion and CI hardening
   1. Deliverables: broader unit/integration coverage for scoring, messaging, migration paths; stable CI runbook.
   2. Estimate: 2-4 working days.
5. Milestone 5: Final stabilization and handoff
   1. Deliverables: release candidate, migration notes, rollback notes, final technical summary.
   2. Estimate: 1-2 working days.

Total expected window: 9-18 working days, assuming no major scope change and timely user decisions where required.

### 6. Timeline Accuracy Statement
The earlier 8-week timeline was a generic external template and is not the right execution model for this in-repo autonomous work.  
This charter replaces it with a realistic engineering range (9-18 working days) tied to concrete deliverables.

### 7. Operating Rules for Autonomous Execution
1. The agent proceeds sequentially through Milestones 1 -> 5 without waiting for user approval.
2. The only pause condition is a concrete blocker (technical, environment, or contradictory requirement).
3. Scope additions are tracked explicitly and can change timing, but do not require pre-approval to continue baseline milestone work.
4. The agent does not claim completion without test evidence and acceptance artifacts.

### 8. Reporting Format Per Milestone
Each milestone closeout must include:

1. What changed (files and behavior).
2. Test evidence run.
3. Remaining risks.
4. Next milestone start criteria.
5. UX validation notes (before/after behavior, known issues, and fixes).
6. Visual parity evidence (screenshot set + required-component checklist status).
7. Explicit note of any deferred gaps with owner and target milestone.

### 9. Parity and UX Validation Protocol
1. Maintain a v1->v2 parity checklist for each core workflow.
2. For each workflow, verify: discoverability, visual clarity, actionability, and state feedback.
3. Any workflow failing parity or usability must be remediated before declaring milestone completion.
4. "Visual equivalence" means matching information hierarchy and signal prominence, not pixel-identical styling.
5. v2 may modernize styling only if the required behaviors and visual signals remain equally or more discoverable.

### 10. Acceptance Criteria by Milestone
Milestone acceptance is objective and binary:

1. Code and behavior:
   1. Required features for the milestone are implemented and connected to live data.
2. Test and automation:
   1. Unit/integration/e2e suites pass.
   2. Browser UX checks pass, including required selector/component assertions.
3. Evidence:
   1. v1 and v2 screenshots are captured for comparable flows.
   2. Parity checklist is updated with pass/fail and notes.
4. Completion gate:
   1. A milestone is incomplete if required UI components are missing, hidden, non-functional, or placeholder-only, even if build/tests pass.

### 11. Definition of Done
Work is "done" only when all of the following exist:

1. Implemented code.
2. Passing tests and build/package output.
3. Screenshot evidence for core UX surfaces.
4. Updated parity checklist and documented deltas.
5. Any remaining gaps explicitly deferred in writing.

### 12. Start Condition
Execution can begin immediately under this charter, with Milestone 1 as the first active stage.
