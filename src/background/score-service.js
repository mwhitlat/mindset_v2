function average(values) {
  if (!values.length) return null;
  const total = values.reduce((sum, v) => sum + v, 0);
  return total / values.length;
}

export function computeWeekSummary(week = {}) {
  const visits = Array.isArray(week.visits) ? week.visits : [];
  const domains = new Set();
  const credibilityValues = [];
  const categories = {};

  visits.forEach((visit) => {
    if (visit.domain) domains.add(visit.domain);
    if (typeof visit.credibility === 'number') credibilityValues.push(visit.credibility);
    const category = visit.category || 'other';
    categories[category] = (categories[category] || 0) + 1;
  });

  const credibility = average(credibilityValues);
  const sourceDiversity = domains.size;
  const overallHealth = credibility === null
    ? null
    : Math.max(0, Math.min(10, Number((credibility * 0.7 + Math.min(sourceDiversity, 10) * 0.3).toFixed(2))));

  return {
    totals: {
      visits: visits.length,
      domains: sourceDiversity
    },
    categories,
    scores: {
      credibility: credibility === null ? null : Number(credibility.toFixed(2)),
      sourceDiversity,
      overallHealth
    }
  };
}
