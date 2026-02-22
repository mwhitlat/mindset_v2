import { getAlternativeSources } from '../shared/source-profile.js';

const GUIDANCE_LEVELS = Object.freeze({
  off: { elevated: 999, high: 999 },
  gentle: { elevated: 55, high: 82 },
  standard: { elevated: 45, high: 72 },
  strong: { elevated: 35, high: 62 }
});

function levelFromLoad(load, mode = 'standard') {
  const config = GUIDANCE_LEVELS[mode] || GUIDANCE_LEVELS.standard;
  if (load >= config.high) return 'high';
  if (load >= config.elevated) return 'elevated';
  return 'normal';
}

function clampLoad(value) {
  return Math.max(0, Math.min(100, value));
}

function applyCredibilityDelta(load, credibility, threshold) {
  if (credibility == null) return load;
  if (credibility < threshold) {
    const deficit = threshold - credibility;
    return clampLoad(load + (8 + deficit * 8 + (credibility < 3 ? 8 : 0)));
  }
  if (credibility >= 8) return clampLoad(load - 22);
  if (credibility >= 7) return clampLoad(load - 8);
  return load;
}

function normalizeBias(bias) {
  if (!bias) return 'unknown';
  if (bias.startsWith('left')) return 'left';
  if (bias.startsWith('right')) return 'right';
  return bias;
}

export function updateTelemetryFromVisit(state, visit) {
  const next = structuredClone(state);
  const threshold = next.settings.lowCredibilityThreshold;
  const prevLoad = next.telemetry.credibilityLoad || 0;
  next.telemetry.credibilityLoad = applyCredibilityDelta(prevLoad, visit.credibility, threshold);
  next.telemetry.lastCredibilityEventTs = visit.timestamp;

  const bias = normalizeBias(visit.bias);
  if (bias === 'left' || bias === 'right') {
    next.telemetry.recentBiasHistory = [...(next.telemetry.recentBiasHistory || []), bias].slice(-20);
    const recent = next.telemetry.recentBiasHistory.slice(-next.settings.echoChamberBreakerThreshold);
    const sameSideStreak = recent.length >= next.settings.echoChamberBreakerThreshold &&
      recent.every((item) => item === bias);
    if (next.settings.enableEchoChamberBreaker && sameSideStreak) {
      next.telemetry.echoChamberDebt = true;
      next.telemetry.echoChamberDebtBias = bias;
      next.telemetry.echoChamberDebtTimestamp = visit.timestamp;
    }

    if (next.telemetry.echoChamberDebt && next.telemetry.echoChamberDebtBias && bias !== next.telemetry.echoChamberDebtBias) {
      next.telemetry.echoChamberDebt = false;
      next.telemetry.echoChamberDebtBias = null;
      next.telemetry.echoChamberDebtTimestamp = null;
    }
  }

  return next;
}

export function buildInterventionState(state, pageProfile, pageTitle = '') {
  const settings = state.settings;
  const telemetry = state.telemetry;
  const interventions = [];
  const guidanceLevel = levelFromLoad(telemetry.credibilityLoad || 0, settings.credibilityGuidance);

  if (settings.credibilityGuidance !== 'off' && guidanceLevel !== 'normal') {
    interventions.push({
      kind: 'credibility-load',
      severity: guidanceLevel,
      message: guidanceLevel === 'high'
        ? 'Your credibility load is high. Consider a high-quality source reset.'
        : 'Your credibility load is elevated. Balance with stronger reporting sources.'
    });
  }

  if (
    settings.enableSameStoryUpgrade &&
    pageProfile.credibility != null &&
    pageProfile.credibility < settings.sameStoryThreshold &&
    pageTitle.trim().length > 0
  ) {
    interventions.push({
      kind: 'same-story-upgrade',
      severity: 'medium',
      message: `${pageProfile.name} is below your same-story threshold.`,
      alternatives: getAlternativeSources(pageProfile.domain, 3)
    });
  }

  const pageBias = normalizeBias(pageProfile.bias);
  if (settings.enableEchoChamberBreaker && telemetry.echoChamberDebt) {
    if (pageBias === telemetry.echoChamberDebtBias) {
      interventions.push({
        kind: 'echo-chamber-breaker',
        severity: 'high',
        message: `You are in a ${telemetry.echoChamberDebtBias}-leaning streak. Read one opposing view to clear debt.`,
        alternatives: getAlternativeSources(pageProfile.domain, 3)
      });
    }
  }

  const priority = {
    'echo-chamber-breaker': 3,
    'same-story-upgrade': 2,
    'credibility-load': 1
  };
  interventions.sort((a, b) => (priority[b.kind] || 0) - (priority[a.kind] || 0));

  return {
    ok: true,
    page: pageProfile,
    credibilityLoad: telemetry.credibilityLoad || 0,
    guidanceLevel,
    interventions
  };
}
