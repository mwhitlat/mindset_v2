import { ACTIONS, isKnownAction } from '../shared/messages.js';
import { loadState, saveState } from './storage-service.js';
import { routeMessage } from './message-router.js';

let runtimeState = null;
const lastTrackedByTab = new Map();

async function ensureState() {
  if (!runtimeState) {
    runtimeState = await loadState();
  }
  return runtimeState;
}

ensureState().catch(() => {
  runtimeState = null;
});

async function setState(nextState) {
  runtimeState = nextState;
  await saveState(runtimeState);
}

function shouldTrackUrl(url) {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}

function toVisitPayloadFromTab(tab) {
  if (!tab?.url || !shouldTrackUrl(tab.url)) return null;
  try {
    const parsed = new URL(tab.url);
    return {
      domain: parsed.hostname,
      title: tab.title || '',
      timestamp: Date.now()
    };
  } catch (_error) {
    return null;
  }
}

async function trackVisitFromTab(tab) {
  const payload = toVisitPayloadFromTab(tab);
  if (!payload) return;
  const state = await ensureState();
  if (!state.settings.trackingEnabled) return;

  const dedupeKey = `${tab.id}:${payload.domain}:${tab.url}`;
  if (lastTrackedByTab.get(tab.id) === dedupeKey) return;
  lastTrackedByTab.set(tab.id, dedupeKey);

  const response = await routeMessage(
    { action: ACTIONS.TRACK_VISIT, payload },
    { getState: ensureState, setState }
  );
  if (!response?.ok) {
    console.error('Failed to track visit from tab:', response?.error || 'unknown');
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tabId >= 0) {
    trackVisitFromTab(tab).catch((error) => {
      console.error('Tab update tracking failed:', error);
    });
  }
});

chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      trackVisitFromTab(tabs[0]).catch((error) => {
        console.error('Startup tracking failed:', error);
      });
    }
  });
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (!isKnownAction(request?.action)) {
    sendResponse({ ok: false, error: 'UNKNOWN_ACTION' });
    return;
  }

  routeMessage(request, { getState: ensureState, setState })
    .then((response) => sendResponse(response))
    .catch(() => sendResponse({ ok: false, error: 'ROUTE_FAILED' }));
  return true;
});
