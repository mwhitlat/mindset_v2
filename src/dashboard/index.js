import { ACTIONS } from '../shared/messages.js';
import { clearChildren, createSafeElement } from '../shared/security.js';
import { buildCategoryBars, buildHealthGaugeModel, buildTrendBars } from './visual-model.js';

function appendStatCard(container, label, value) {
  const card = createSafeElement('article', { classes: ['card'] });
  card.appendChild(createSafeElement('span', { classes: ['label'], text: label }));
  card.appendChild(createSafeElement('strong', { classes: ['value'], text: value }));
  container.appendChild(card);
}

function getNarrative(summary = {}) {
  const scores = summary.scores || {};
  const overall = Number(scores.overallHealth ?? 0);
  const credibility = Number(scores.credibility ?? 0);
  const diversity = Number(scores.sourceDiversity ?? 0);
  if (overall >= 8) {
    return {
      headline: 'Excellent digital diet this week.',
      body: 'Keep this source mix and momentum. You are in a high-quality pattern.'
    };
  }
  if (overall >= 6) {
    if (credibility < 6) {
      return {
        headline: 'Stable baseline with credibility risk.',
        body: 'Add one high-cred source today to pull your weekly score upward.'
      };
    }
    if (diversity < 4) {
      return {
        headline: 'Good quality, low variety.',
        body: 'Read 1-2 additional domains to reduce perspective blind spots.'
      };
    }
    return {
      headline: 'Healthy baseline with room to sharpen.',
      body: 'Continue balancing viewpoints and keep your source quality high.'
    };
  }
  return {
    headline: 'Recovery week recommended.',
    body: 'Prioritize trusted sources and broaden domain variety before long sessions.'
  };
}

function renderHero(root, detail = {}) {
  const summary = detail.summary || {};
  const narrative = getNarrative(summary);
  const hero = createSafeElement('section', { classes: ['hero'] });
  hero.appendChild(createSafeElement('h1', { classes: ['headline'], text: 'Mindset v2 Dashboard' }));
  hero.appendChild(createSafeElement('p', { classes: ['subline'], text: `Week ${detail.weekKey || '-'} overview` }));

  const narrativeCard = createSafeElement('div', { classes: ['narrative'] });
  narrativeCard.appendChild(createSafeElement('h2', { classes: ['narrativeTitle'], text: narrative.headline }));
  narrativeCard.appendChild(createSafeElement('p', { classes: ['narrativeBody'], text: narrative.body }));
  hero.appendChild(narrativeCard);
  root.appendChild(hero);
}

function renderVisitsTable(root, visits = []) {
  clearChildren(root);
  if (!visits.length) {
    root.appendChild(createSafeElement('p', { classes: ['muted'], text: 'No visits tracked this week yet.' }));
    return;
  }

  const table = createSafeElement('table');
  const thead = createSafeElement('thead');
  const headRow = createSafeElement('tr');
  ['Time', 'Domain', 'Category', 'Credibility', 'Title'].forEach((name) => {
    headRow.appendChild(createSafeElement('th', { text: name }));
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = createSafeElement('tbody');
  visits.slice(0, 50).forEach((visit) => {
    const row = createSafeElement('tr');
    const timestamp = new Date(visit.timestamp).toLocaleString();
    const cells = [
      timestamp,
      visit.domain || '-',
      visit.category || 'other',
      visit.credibility == null ? '-' : Number(visit.credibility).toFixed(1),
      visit.title || '-'
    ];
    cells.forEach((value) => row.appendChild(createSafeElement('td', { text: value })));
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  root.appendChild(table);
}

function renderVisitSection(root, visits = []) {
  root.appendChild(createSafeElement('h2', { classes: ['sectionTitle'], text: 'Recent Visits' }));
  const controlWrap = createSafeElement('section', { classes: ['visitControls'] });

  const categorySelect = createSafeElement('select');
  const allOption = createSafeElement('option', { text: 'All categories', attrs: { value: '' } });
  categorySelect.appendChild(allOption);
  const categories = Array.from(new Set(visits.map((visit) => visit.category || 'other'))).sort();
  categories.forEach((category) => {
    categorySelect.appendChild(createSafeElement('option', { text: category, attrs: { value: category } }));
  });

  const credibilityInput = createSafeElement('input', {
    attrs: { type: 'number', min: '0', max: '10', step: '0.1', placeholder: 'Min credibility' }
  });
  const searchInput = createSafeElement('input', {
    attrs: { type: 'text', placeholder: 'Filter domain/title' }
  });

  controlWrap.appendChild(categorySelect);
  controlWrap.appendChild(credibilityInput);
  controlWrap.appendChild(searchInput);
  root.appendChild(controlWrap);

  const tableWrap = createSafeElement('section');
  root.appendChild(tableWrap);

  const rerender = () => {
    const wantedCategory = categorySelect.value;
    const minCred = Number(credibilityInput.value);
    const query = searchInput.value.toLowerCase().trim();

    const filtered = visits.filter((visit) => {
      if (wantedCategory && (visit.category || 'other') !== wantedCategory) return false;
      if (Number.isFinite(minCred) && credibilityInput.value !== '') {
        if (visit.credibility == null || Number(visit.credibility) < minCred) return false;
      }
      if (query) {
        const hay = `${visit.domain || ''} ${visit.title || ''}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
    renderVisitsTable(tableWrap, filtered);
  };

  categorySelect.addEventListener('change', rerender);
  credibilityInput.addEventListener('input', rerender);
  searchInput.addEventListener('input', rerender);
  rerender();
}

function renderHealthGauge(root, summary = {}) {
  root.appendChild(createSafeElement('h2', { classes: ['sectionTitle'], text: 'Health Snapshot' }));
  const scores = summary.scores || {};
  const gauge = buildHealthGaugeModel(scores.overallHealth);

  const card = createSafeElement('section', { classes: ['healthGaugeCard'] });
  const header = createSafeElement('div', { classes: ['healthHeader'] });
  header.appendChild(createSafeElement('span', { classes: ['label'], text: 'Overall health' }));
  header.appendChild(createSafeElement('strong', { classes: ['healthScore'], text: `${gauge.scoreLabel}/10` }));
  card.appendChild(header);

  const track = createSafeElement('div', { classes: ['healthGaugeTrack'] });
  const fill = createSafeElement('div', {
    classes: ['healthGaugeFill', gauge.bandClass],
    attrs: { style: `width:${gauge.percent}%;` }
  });
  track.appendChild(fill);
  card.appendChild(track);

  card.appendChild(createSafeElement('p', { classes: ['muted'], text: `${gauge.bandLabel} range` }));
  root.appendChild(card);
}

function renderCategoryDistribution(root, categories = {}) {
  root.appendChild(createSafeElement('h2', { classes: ['sectionTitle'], text: 'Category Mix' }));
  const wrap = createSafeElement('section', { classes: ['categoryBars'] });
  const bars = buildCategoryBars(categories);
  if (!bars.length) {
    wrap.appendChild(createSafeElement('p', { classes: ['muted'], text: 'No category data yet.' }));
    root.appendChild(wrap);
    return;
  }

  bars.forEach((bar) => {
    const row = createSafeElement('article', { classes: ['categoryRow'] });
    const labels = createSafeElement('div', { classes: ['categoryLabels'] });
    labels.appendChild(createSafeElement('span', { text: bar.name }));
    labels.appendChild(createSafeElement('strong', { text: `${bar.count} (${bar.percent}%)` }));
    row.appendChild(labels);

    const track = createSafeElement('div', { classes: ['categoryTrack'] });
    track.appendChild(createSafeElement('div', {
      classes: ['categoryFill'],
      attrs: { style: `width:${bar.percent}%;` }
    }));
    row.appendChild(track);
    wrap.appendChild(row);
  });
  root.appendChild(wrap);
}

function renderTrend(root, points = []) {
  root.appendChild(createSafeElement('h2', { classes: ['sectionTitle'], text: 'Trend (Last Weeks)' }));
  const bars = buildTrendBars(points);
  if (!bars.length) {
    root.appendChild(createSafeElement('p', { classes: ['muted'], text: 'Not enough weekly history yet.' }));
    return;
  }
  const chart = createSafeElement('div', { classes: ['trendChart'] });
  bars.forEach((point) => {
    const row = createSafeElement('article', { classes: ['trendRow'] });
    row.appendChild(createSafeElement('strong', { text: point.weekKey }));

    const visitsTrack = createSafeElement('div', { classes: ['trendTrack'] });
    visitsTrack.appendChild(createSafeElement('div', {
      classes: ['trendFill', 'trendVisits'],
      attrs: { style: `width:${point.visitsPercent}%;` }
    }));
    row.appendChild(createSafeElement('span', { classes: ['muted'], text: `Visits ${point.visits}` }));
    row.appendChild(visitsTrack);

    const healthTrack = createSafeElement('div', { classes: ['trendTrack'] });
    healthTrack.appendChild(createSafeElement('div', {
      classes: ['trendFill', 'trendHealth'],
      attrs: { style: `width:${point.healthPercent}%;` }
    }));
    row.appendChild(createSafeElement('span', { classes: ['muted'], text: `Health ${point.health ?? '-'}` }));
    row.appendChild(healthTrack);

    chart.appendChild(row);
  });
  root.appendChild(chart);
}

function renderActions(root) {
  const wrap = createSafeElement('section', { classes: ['dashActions'] });
  const exportBtn = createSafeElement('button', { text: 'Export CSV', attrs: { type: 'button' } });
  const shareBtn = createSafeElement('button', { text: 'Copy Summary', attrs: { type: 'button' } });
  const reportBtn = createSafeElement('button', { text: 'Report Issue', attrs: { type: 'button' } });

  exportBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: ACTIONS.EXPORT_STATE }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) return;
      const blob = new Blob([response.csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  shareBtn.addEventListener('click', async () => {
    const text = 'Mindset v2 weekly report is available in dashboard.';
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    }
  });

  reportBtn.addEventListener('click', () => {
    window.open('mailto:mindset.extension.beta@gmail.com?subject=Mindset%20v2%20Issue', '_blank');
  });

  wrap.appendChild(exportBtn);
  wrap.appendChild(shareBtn);
  wrap.appendChild(reportBtn);
  root.appendChild(wrap);
}

export function renderDashboard(root, detail = {}) {
  if (!root) return;
  clearChildren(root);

  const summary = detail.summary || {};
  const scores = summary.scores || {};
  const totals = summary.totals || {};
  const categories = summary.categories || {};

  renderHero(root, detail);

  const statGrid = createSafeElement('section', { classes: ['statGrid'] });
  appendStatCard(statGrid, 'Overall Health', scores.overallHealth == null ? '-' : Number(scores.overallHealth).toFixed(1));
  appendStatCard(statGrid, 'Tracked Visits', String(totals.visits ?? 0));
  appendStatCard(statGrid, 'Unique Domains', String(totals.domains ?? 0));
  root.appendChild(statGrid);

  renderHealthGauge(root, summary);
  renderCategoryDistribution(root, categories);

  renderVisitSection(root, detail.visits || []);
  renderTrend(root, detail.trend || []);
  renderActions(root);
}

function loadDashboard() {
  const root = document.getElementById('dashboardRoot');
  if (!root) return;

  if (!globalThis.chrome?.runtime?.sendMessage) {
    renderDashboard(root, {
      weekKey: 'local-preview',
      summary: {
        totals: { visits: 0, domains: 0 },
        scores: { overallHealth: null },
        categories: {}
      },
      visits: [],
      trend: []
    });
    return;
  }

  chrome.runtime.sendMessage({ action: ACTIONS.GET_WEEKLY_DETAIL }, (response) => {
    if (chrome.runtime.lastError || !response?.ok) {
      renderDashboard(root, { weekKey: '-', summary: { totals: { visits: 0, domains: 0 }, scores: {} }, visits: [] });
      return;
    }
    chrome.runtime.sendMessage({ action: ACTIONS.GET_TREND, maxWeeks: 8 }, (trendResponse) => {
      const trend = (trendResponse && trendResponse.ok) ? trendResponse.points : [];
      renderDashboard(root, { ...response, trend });
    });
  });
}

if (typeof document !== 'undefined') {
  loadDashboard();
}
