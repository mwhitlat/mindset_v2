import { createInitialState, SCHEMA_VERSION } from '../shared/schema.js';
import { migrateToCurrentSchema } from '../shared/migration.js';

export function normalizeStoragePayload(raw = {}) {
  const payload = raw?.state && typeof raw.state === 'object'
    ? raw.state
    : raw;

  if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) {
    return createInitialState();
  }

  const migrated = migrateToCurrentSchema(payload);
  if (!migrated.schemaVersion) {
    return { ...migrated, schemaVersion: SCHEMA_VERSION };
  }
  return migrated;
}

export async function loadState(storage = chrome.storage.local) {
  const raw = await storage.get(['state', 'userData', 'credibilityLoad', 'recentBiasHistory']);
  return normalizeStoragePayload(raw);
}

export async function saveState(state, storage = chrome.storage.local) {
  const nextState = state?.schemaVersion ? state : { ...state, schemaVersion: SCHEMA_VERSION };
  await storage.set({ state: nextState });
}
