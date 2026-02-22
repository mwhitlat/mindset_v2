function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function buildHealthGaugeModel(score) {
  if (score === null || score === undefined || score === '') {
    return {
      scoreLabel: '-',
      percent: 0,
      bandLabel: 'No score yet',
      bandClass: 'bandNone'
    };
  }

  const numeric = Number(score);
  if (!Number.isFinite(numeric)) {
    return {
      scoreLabel: '-',
      percent: 0,
      bandLabel: 'No score yet',
      bandClass: 'bandNone'
    };
  }

  const clamped = clamp(numeric, 0, 10);
  let bandLabel = 'Recovery';
  let bandClass = 'bandLow';
  if (clamped >= 8) {
    bandLabel = 'Excellent';
    bandClass = 'bandHigh';
  } else if (clamped >= 6) {
    bandLabel = 'Stable';
    bandClass = 'bandMid';
  }

  return {
    scoreLabel: clamped.toFixed(1),
    percent: Math.round(clamped * 10),
    bandLabel,
    bandClass
  };
}

export function buildCategoryBars(categories = {}) {
  const entries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, count]) => sum + Number(count || 0), 0);
  if (!entries.length || total <= 0) return [];

  return entries.map(([name, count]) => {
    const value = Number(count || 0);
    return {
      name,
      count: value,
      percent: Math.round((value / total) * 100)
    };
  });
}

export function buildTrendBars(points = []) {
  if (!points.length) return [];
  const maxVisits = Math.max(1, ...points.map((point) => Number(point.visits || 0)));

  return points.map((point) => {
    const visits = Number(point.visits || 0);
    const health = Number(point.overallHealth);
    return {
      weekKey: point.weekKey || '-',
      visits,
      health: Number.isFinite(health) ? health : null,
      visitsPercent: Math.round((visits / maxVisits) * 100),
      healthPercent: Number.isFinite(health) ? Math.round(clamp(health, 0, 10) * 10) : 0
    };
  });
}
