const SOURCE_MAP = Object.freeze({
  'apnews.com': { name: 'AP News', credibility: 9.0, category: 'news', bias: 'center' },
  'reuters.com': { name: 'Reuters', credibility: 9.2, category: 'news', bias: 'center' },
  'bbc.com': { name: 'BBC', credibility: 8.7, category: 'news', bias: 'center' },
  'npr.org': { name: 'NPR', credibility: 8.6, category: 'news', bias: 'center-left' },
  'foxnews.com': { name: 'Fox News', credibility: 6.1, category: 'news', bias: 'right' },
  'cnn.com': { name: 'CNN', credibility: 6.3, category: 'news', bias: 'left' },
  'msnbc.com': { name: 'MSNBC', credibility: 6.0, category: 'news', bias: 'left' },
  'breitbart.com': { name: 'Breitbart', credibility: 3.2, category: 'news', bias: 'right' },
  'infowars.com': { name: 'Infowars', credibility: 2.1, category: 'news', bias: 'right' },
  'right.local': { name: 'Right Local', credibility: 3.0, category: 'news', bias: 'right' },
  'left.local': { name: 'Left Local', credibility: 3.2, category: 'news', bias: 'left' },
  'facebook.com': { name: 'Facebook', credibility: 5.0, category: 'social', bias: 'mixed' },
  'x.com': { name: 'X', credibility: 4.8, category: 'social', bias: 'mixed' },
  'twitter.com': { name: 'Twitter', credibility: 4.8, category: 'social', bias: 'mixed' },
  'youtube.com': { name: 'YouTube', credibility: 6.0, category: 'entertainment', bias: 'mixed' },
  'reddit.com': { name: 'Reddit', credibility: 5.5, category: 'social', bias: 'mixed' },
  'wikipedia.org': { name: 'Wikipedia', credibility: 8.1, category: 'educational', bias: 'center' }
});

function normalizeDomain(domain = '') {
  return String(domain).toLowerCase().replace(/^www\./, '');
}

function matchKnownSource(domain) {
  const normalized = normalizeDomain(domain);
  const entries = Object.entries(SOURCE_MAP);
  for (const [key, value] of entries) {
    if (normalized === key || normalized.endsWith(`.${key}`)) return value;
  }
  return null;
}

function inferCategory(domain, title = '') {
  const combined = `${domain} ${title}`.toLowerCase();
  if (combined.includes('news')) return 'news';
  if (combined.includes('learn') || combined.includes('course') || combined.includes('edu')) return 'educational';
  if (combined.includes('video') || combined.includes('music') || combined.includes('movie')) return 'entertainment';
  if (combined.includes('forum') || combined.includes('social')) return 'social';
  return 'other';
}

export function assessSourceProfile(domain, title = '') {
  const normalized = normalizeDomain(domain);
  const known = matchKnownSource(domain);
  if (known) return { domain: normalized, ...known };
  return {
    domain: normalized,
    name: normalized || 'Unknown',
    credibility: null,
    category: inferCategory(domain, title),
    bias: 'unknown'
  };
}

export function getAlternativeSources(currentDomain, limit = 3) {
  const normalized = normalizeDomain(currentDomain);
  return Object.entries(SOURCE_MAP)
    .filter(([domain, data]) => domain !== normalized && data.credibility >= 8.5)
    .sort((a, b) => b[1].credibility - a[1].credibility)
    .slice(0, limit)
    .map(([domain, data]) => ({
      domain,
      name: data.name,
      credibility: data.credibility,
      bias: data.bias,
      url: `https://${domain}`
    }));
}
