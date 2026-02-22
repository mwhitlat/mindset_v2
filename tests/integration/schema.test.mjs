import test from 'node:test';
import assert from 'node:assert/strict';
import { SCHEMA_VERSION, createInitialState } from '../../src/shared/schema.js';

test('initial state uses current schema version', () => {
  const state = createInitialState();
  assert.equal(state.schemaVersion, SCHEMA_VERSION);
});
