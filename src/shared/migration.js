import { SCHEMA_VERSION, DEFAULT_SETTINGS, createInitialState } from './schema.js';

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asNullableString(value) {
  return typeof value === 'string' ? value : null;
}

function asNullableNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDomainList(weekData) {
  if (Array.isArray(weekData?.domains)) {
    return Array.from(new Set(weekData.domains.filter((item) => typeof item === 'string' && item.length > 0)));
  }

  const visits = Array.isArray(weekData?.visits) ? weekData.visits : [];
  const fromVisits = visits
    .map((visit) => asString(visit?.domain, '').toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(fromVisits));
}

function normalizeVisit(visit) {
  return {
    domain: asString(visit?.domain, ''),
    path: asString(visit?.path, '/'),
    title: asString(visit?.title, ''),
    timestamp: asNumber(visit?.timestamp, Date.now()),
    durationMins: Math.max(0, asNumber(visit?.duration, 0)),
    category: asString(visit?.category, 'other'),
    credibility: asNullableNumber(visit?.credibility),
    credibilityKnown: visit?.credibilityKnown !== false,
    politicalBias: asString(visit?.politicalBias, 'unknown'),
    tone: asString(visit?.tone, 'neutral'),
    sourceName: asString(visit?.sourceName, '')
  };
}

function normalizeWeeklyData(v1WeeklyData) {
  if (!v1WeeklyData || typeof v1WeeklyData !== 'object') return {};

  const result = {};
  Object.entries(v1WeeklyData).forEach(([weekKey, weekData]) => {
    const visits = Array.isArray(weekData?.visits) ? weekData.visits.map(normalizeVisit) : [];
    const categories = (weekData?.categories && typeof weekData.categories === 'object') ? weekData.categories : {};

    result[weekKey] = {
      visits,
      aggregates: {
        categories: { ...categories },
        domains: toDomainList({ ...weekData, visits })
      },
      scores: {
        overallHealth: asNullableNumber(weekData?.scores?.overallHealth),
        contentBalance: asNullableNumber(weekData?.scores?.contentBalance),
        sourceDiversity: asNullableNumber(weekData?.scores?.sourceDiversity),
        timeManagement: asNullableNumber(weekData?.scores?.timeManagement),
        credibility: asNullableNumber(weekData?.scores?.credibility),
        contentTone: asNullableNumber(weekData?.scores?.contentTone),
        politicalBalance: asNullableNumber(weekData?.scores?.politicalBalance)
      }
    };
  });

  return result;
}

function normalizeSettings(v1Settings = {}) {
  return {
    trackingEnabled: v1Settings.isTracking !== false,
    interventionLevel: asString(v1Settings.interventionLevel, DEFAULT_SETTINGS.interventionLevel),
    lowCredibilityThreshold: asNumber(
      v1Settings.lowCredibilityThreshold,
      DEFAULT_SETTINGS.lowCredibilityThreshold
    ),
    credibilityGuidance: asString(v1Settings.credibilityGuidance, DEFAULT_SETTINGS.credibilityGuidance),
    enableSameStoryUpgrade: asBoolean(
      v1Settings.enableSameStoryUpgrade,
      DEFAULT_SETTINGS.enableSameStoryUpgrade
    ),
    sameStoryThreshold: asNumber(v1Settings.sameStoryThreshold, DEFAULT_SETTINGS.sameStoryThreshold),
    enableEchoChamberBreaker: asBoolean(
      v1Settings.enableEchoChamberBreaker,
      DEFAULT_SETTINGS.enableEchoChamberBreaker
    ),
    echoChamberBreakerThreshold: asNumber(
      v1Settings.echoChamberBreakerThreshold,
      DEFAULT_SETTINGS.echoChamberBreakerThreshold
    ),
    dataRetentionDays: asNumber(v1Settings.dataRetentionDays, DEFAULT_SETTINGS.dataRetentionDays)
  };
}

function normalizeTelemetry(input) {
  return {
    credibilityLoad: asNumber(input?.credibilityLoad, 0),
    lastCredibilityEventTs: asNullableNumber(input?.lastCredibilityEventTs),
    lastCredibilityInterventionTs: asNullableNumber(input?.lastCredibilityInterventionTs),
    recentBiasHistory: Array.isArray(input?.recentBiasHistory) ? input.recentBiasHistory.slice(0, 50) : [],
    echoChamberDebt: asBoolean(input?.echoChamberDebt, false),
    echoChamberDebtBias: asNullableString(input?.echoChamberDebtBias),
    echoChamberDebtTimestamp: asNullableNumber(input?.echoChamberDebtTimestamp),
    echoStateDateKey: asNullableString(input?.echoStateDateKey),
    sameStoryShown: asNumber(input?.sameStoryShown, 0),
    sameStoryClicked: asNumber(input?.sameStoryClicked, 0)
  };
}

export function detectSchemaVersion(payload) {
  if (payload && typeof payload.schemaVersion === 'number') return payload.schemaVersion;
  return 1;
}

export function migrateV1PayloadToV2(v1Payload = {}) {
  const initial = createInitialState();
  const v1UserData = v1Payload.userData && typeof v1Payload.userData === 'object' ? v1Payload.userData : {};

  return {
    ...initial,
    schemaVersion: SCHEMA_VERSION,
    profile: {
      trackingStartDate: asString(
        v1UserData.trackingStartDate,
        initial.profile.trackingStartDate
      )
    },
    settings: normalizeSettings(v1UserData.settings),
    telemetry: normalizeTelemetry({
      credibilityLoad: v1Payload.credibilityLoad,
      lastCredibilityEventTs: v1Payload.lastCredibilityEventTs,
      lastCredibilityInterventionTs: v1Payload.lastCredibilityInterventionTs,
      recentBiasHistory: v1Payload.recentBiasHistory,
      echoChamberDebt: v1Payload.echoChamberDebt,
      echoChamberDebtBias: v1Payload.echoChamberDebtBias,
      echoChamberDebtTimestamp: v1Payload.echoChamberDebtTimestamp,
      echoStateDateKey: v1Payload.echoStateDateKey
    }),
    weekly: normalizeWeeklyData(v1UserData.weeklyData),
    meta: {
      migratedFrom: 1,
      migratedAt: new Date().toISOString()
    }
  };
}

export function migrateToCurrentSchema(payload = {}) {
  const version = detectSchemaVersion(payload);
  if (version >= SCHEMA_VERSION) return payload;
  return migrateV1PayloadToV2(payload);
}
