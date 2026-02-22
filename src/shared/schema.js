export const SCHEMA_VERSION = 2;

export const DEFAULT_SETTINGS = Object.freeze({
  trackingEnabled: true,
  interventionLevel: 'balanced',
  lowCredibilityThreshold: 6.0,
  credibilityGuidance: 'standard',
  enableSameStoryUpgrade: true,
  sameStoryThreshold: 7.0,
  enableEchoChamberBreaker: true,
  echoChamberBreakerThreshold: 4,
  dataRetentionDays: 90
});

export function createInitialState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      trackingStartDate: new Date().toISOString()
    },
    settings: { ...DEFAULT_SETTINGS },
    telemetry: {
      credibilityLoad: 0,
      lastCredibilityEventTs: null,
      lastCredibilityInterventionTs: null,
      recentBiasHistory: [],
      echoChamberDebt: false,
      echoChamberDebtBias: null,
      echoChamberDebtTimestamp: null,
      echoStateDateKey: null,
      sameStoryShown: 0,
      sameStoryClicked: 0
    },
    weekly: {},
    meta: {
      migratedFrom: null,
      migratedAt: null
    }
  };
}
