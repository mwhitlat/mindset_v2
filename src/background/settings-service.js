import { DEFAULT_SETTINGS } from '../shared/schema.js';

function boundedNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function boundedBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback;
}

function boundedEnum(value, fallback, allowed) {
  return allowed.includes(value) ? value : fallback;
}

export function normalizeSettingsPatch(input = {}) {
  return {
    trackingEnabled: boundedBoolean(input.trackingEnabled, DEFAULT_SETTINGS.trackingEnabled),
    interventionLevel: boundedEnum(input.interventionLevel, DEFAULT_SETTINGS.interventionLevel, ['minimal', 'balanced', 'strict']),
    lowCredibilityThreshold: boundedNumber(input.lowCredibilityThreshold, DEFAULT_SETTINGS.lowCredibilityThreshold, 1, 9.5),
    credibilityGuidance: boundedEnum(input.credibilityGuidance, DEFAULT_SETTINGS.credibilityGuidance, ['off', 'gentle', 'standard', 'strong']),
    enableSameStoryUpgrade: boundedBoolean(input.enableSameStoryUpgrade, DEFAULT_SETTINGS.enableSameStoryUpgrade),
    sameStoryThreshold: boundedNumber(input.sameStoryThreshold, DEFAULT_SETTINGS.sameStoryThreshold, 1, 9.5),
    enableEchoChamberBreaker: boundedBoolean(input.enableEchoChamberBreaker, DEFAULT_SETTINGS.enableEchoChamberBreaker),
    echoChamberBreakerThreshold: boundedNumber(input.echoChamberBreakerThreshold, DEFAULT_SETTINGS.echoChamberBreakerThreshold, 3, 15),
    dataRetentionDays: boundedNumber(input.dataRetentionDays, DEFAULT_SETTINGS.dataRetentionDays, 7, 365)
  };
}

export function mergeSettings(state, patch = {}) {
  const normalized = normalizeSettingsPatch({ ...state.settings, ...patch });
  const next = structuredClone(state);
  next.settings = normalized;
  return next;
}
