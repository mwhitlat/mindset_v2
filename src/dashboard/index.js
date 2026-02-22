import { ACTIONS } from '../shared/messages.js';
import { clearChildren, createSafeElement } from '../shared/security.js';

function appendStatCard(container, label, value) {
  const card = createSafeElement('article', { classes: ['card'] });
  card.appendChild(createSafeElement('span', { classes: ['label'], text: label }));
  card.appendChild(createSafeElement('strong', { classes: ['value'], text: value }));
  container.appendChild(card);
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

function renderTrend(root, points = []) {
  root.appendChild(createSafeElement('h2', { classes: ['sectionTitle'], text: 'Trend (Last Weeks)' }));
  if (!points.length) {
    root.appendChild(createSafeElement('p', { classes: ['muted'], text: 'Not enough weekly history yet.' }));
    return;
  }
  const list = createSafeElement('div', { classes: ['trendList'] });
  points.forEach((point) => {
    const row = createSafeElement('div', { classes: ['trendRow'] });
    row.appendChild(createSafeElement('span', { text: point.weekKey }));
    row.appendChild(createSafeElement('span', { text: `Visits ${point.visits}` }));
    row.appendChild(createSafeElement('span', { text: `Health ${point.overallHealth ?? '-'}` }));
    list.appendChild(row);
  });
  root.appendChild(list);
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

  root.appendChild(createSafeElement('h1', { classes: ['headline'], text: 'Mindset v2 Dashboard' }));
  root.appendChild(
    createSafeElement('p', { classes: ['subline'], text: `Week ${detail.weekKey || '-'} overview` })
  );

  const statGrid = createSafeElement('section', { classes: ['statGrid'] });
  appendStatCard(statGrid, 'Overall Health', scores.overallHealth == null ? '-' : Number(scores.overallHealth).toFixed(1));
  appendStatCard(statGrid, 'Tracked Visits', String(totals.visits ?? 0));
  appendStatCard(statGrid, 'Unique Domains', String(totals.domains ?? 0));
  root.appendChild(statGrid);

  root.appendChild(createSafeElement('h2', { classes: ['sectionTitle'], text: 'Category Mix' }));
  const categoryWrap = createSafeElement('section', { classes: ['categoryList'] });
  const entries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    categoryWrap.appendChild(createSafeElement('p', { classes: ['muted'], text: 'No category data yet.' }));
  } else {
    entries.forEach(([name, count]) => {
      categoryWrap.appendChild(createSafeElement('span', { classes: ['pill'], text: `${name}: ${count}` }));
    });
  }
  root.appendChild(categoryWrap);

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
