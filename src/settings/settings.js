import { ACTIONS } from '../shared/messages.js';
import { setSafeText } from '../shared/security.js';

const statusText = document.getElementById('statusText');
const saveBtn = document.getElementById('saveBtn');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');

const fields = {
  trackingEnabled: document.getElementById('trackingEnabled'),
  credibilityGuidance: document.getElementById('credibilityGuidance'),
  lowCredibilityThreshold: document.getElementById('lowCredibilityThreshold'),
  enableSameStoryUpgrade: document.getElementById('enableSameStoryUpgrade'),
  sameStoryThreshold: document.getElementById('sameStoryThreshold'),
  enableEchoChamberBreaker: document.getElementById('enableEchoChamberBreaker'),
  echoChamberBreakerThreshold: document.getElementById('echoChamberBreakerThreshold'),
  dataRetentionDays: document.getElementById('dataRetentionDays')
};

function collectPatch() {
  return {
    trackingEnabled: fields.trackingEnabled.checked,
    credibilityGuidance: fields.credibilityGuidance.value,
    lowCredibilityThreshold: Number(fields.lowCredibilityThreshold.value),
    enableSameStoryUpgrade: fields.enableSameStoryUpgrade.checked,
    sameStoryThreshold: Number(fields.sameStoryThreshold.value),
    enableEchoChamberBreaker: fields.enableEchoChamberBreaker.checked,
    echoChamberBreakerThreshold: Number(fields.echoChamberBreakerThreshold.value),
    dataRetentionDays: Number(fields.dataRetentionDays.value)
  };
}

function hydrate(settings) {
  fields.trackingEnabled.checked = settings.trackingEnabled;
  fields.credibilityGuidance.value = settings.credibilityGuidance;
  fields.lowCredibilityThreshold.value = String(settings.lowCredibilityThreshold);
  fields.enableSameStoryUpgrade.checked = settings.enableSameStoryUpgrade;
  fields.sameStoryThreshold.value = String(settings.sameStoryThreshold);
  fields.enableEchoChamberBreaker.checked = settings.enableEchoChamberBreaker;
  fields.echoChamberBreakerThreshold.value = String(settings.echoChamberBreakerThreshold);
  fields.dataRetentionDays.value = String(settings.dataRetentionDays);
}

function loadSettings() {
  chrome.runtime.sendMessage({ action: ACTIONS.GET_SETTINGS }, (response) => {
    if (chrome.runtime.lastError || !response?.ok) {
      setSafeText(statusText, 'Failed to load settings');
      return;
    }
    hydrate(response.settings);
    setSafeText(statusText, 'Settings loaded');
  });
}

saveBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    action: ACTIONS.UPDATE_SETTINGS,
    patch: collectPatch()
  }, (response) => {
    if (chrome.runtime.lastError || !response?.ok) {
      setSafeText(statusText, 'Failed to save settings');
      return;
    }
    hydrate(response.settings);
    setSafeText(statusText, 'Settings saved');
  });
});

exportBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: ACTIONS.EXPORT_STATE }, (response) => {
    if (chrome.runtime.lastError || !response?.ok) {
      setSafeText(statusText, 'Export failed');
      return;
    }
    const blob = new Blob([JSON.stringify(response.state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setSafeText(statusText, 'Export opened in new tab');
  });
});

clearBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: ACTIONS.CLEAR_DATA }, (response) => {
    if (chrome.runtime.lastError || !response?.ok) {
      setSafeText(statusText, 'Clear failed');
      return;
    }
    setSafeText(statusText, 'Data cleared');
    loadSettings();
  });
});

loadSettings();
