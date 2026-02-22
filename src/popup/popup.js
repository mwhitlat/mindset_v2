import { ACTIONS } from '../shared/messages.js';
import { setSafeText } from '../shared/security.js';

const statusEl = document.getElementById('status');
const summaryEl = document.getElementById('summary');
const visitsEl = document.getElementById('visitsValue');
const domainsEl = document.getElementById('domainsValue');
const credibilityEl = document.getElementById('credibilityValue');
const refreshBtn = document.getElementById('refreshBtn');
const dashboardBtn = document.getElementById('dashboardBtn');
const settingsBtn = document.getElementById('settingsBtn');
const exportBtn = document.getElementById('exportBtn');

function summarizeCategories(categories = {}) {
  const ranked = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  if (!ranked.length) return 'No category signal yet.';
  return ranked.map(([name, count]) => `${name} (${count})`).join(', ');
}

function updateSummary(detail) {
  const visits = detail?.summary?.totals?.visits ?? 0;
  const domains = detail?.summary?.totals?.domains ?? 0;
  const credibility = detail?.summary?.scores?.credibility;
  const overall = detail?.summary?.scores?.overallHealth;

  setSafeText(visitsEl, String(visits));
  setSafeText(domainsEl, String(domains));
  setSafeText(credibilityEl, credibility == null ? '-' : credibility.toFixed(1));
  setSafeText(
    summaryEl,
    `Overall ${overall == null ? '-' : overall.toFixed(1)}. Top mix: ${summarizeCategories(detail?.summary?.categories)}`
  );
}

function refreshPopup() {
  if (!globalThis.chrome?.runtime?.sendMessage) {
    setSafeText(statusEl, 'Preview mode');
    setSafeText(summaryEl, 'Extension runtime unavailable outside Chrome extension context.');
    setSafeText(visitsEl, '-');
    setSafeText(domainsEl, '-');
    setSafeText(credibilityEl, '-');
    return;
  }

  chrome.runtime.sendMessage({ action: ACTIONS.HEALTH_PING }, (response) => {
    if (chrome.runtime.lastError || !response?.ok) {
      setSafeText(statusEl, 'Background unavailable');
      setSafeText(summaryEl, 'Summary unavailable');
      return;
    }
    setSafeText(statusEl, `Background OK (schema v${response.schemaVersion})`);

    chrome.runtime.sendMessage({ action: ACTIONS.GET_WEEKLY_DETAIL }, (detailResponse) => {
      if (chrome.runtime.lastError || !detailResponse?.ok) {
        setSafeText(summaryEl, 'Summary unavailable');
        return;
      }
      updateSummary(detailResponse);
    });
  });
}

refreshBtn.addEventListener('click', refreshPopup);
dashboardBtn.addEventListener('click', () => {
  if (!globalThis.chrome?.runtime?.getURL) return;
  const url = chrome.runtime.getURL('src/dashboard/dashboard.html');
  chrome.tabs.create({ url });
});
settingsBtn.addEventListener('click', () => {
  if (!globalThis.chrome?.runtime?.openOptionsPage) return;
  chrome.runtime.openOptionsPage();
});
exportBtn.addEventListener('click', () => {
  if (!globalThis.chrome?.runtime?.sendMessage) return;
  chrome.runtime.sendMessage({ action: ACTIONS.EXPORT_STATE }, (response) => {
    if (chrome.runtime.lastError || !response?.ok) {
      setSafeText(summaryEl, 'Export failed');
      return;
    }
    const blob = new Blob([response.csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    chrome.tabs.create({ url });
  });
});

refreshPopup();
