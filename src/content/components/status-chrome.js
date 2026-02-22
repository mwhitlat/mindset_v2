import { createSafeElement, setSafeAttr, setSafeText } from '../../shared/security.js';

function ensureTopBar() {
  let topBar = document.getElementById('mindset-v2-topbar');
  if (topBar) return topBar;

  topBar = createSafeElement('div', { attrs: { id: 'mindset-v2-topbar' } });
  setSafeAttr(
    topBar,
    'style',
    'position:fixed;top:0;left:0;right:0;z-index:2147483645;background:linear-gradient(90deg,#0f172a,#1e3a8a);color:#fff;padding:6px 12px;font:12px/1.3 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;display:flex;justify-content:space-between;gap:8px;box-shadow:0 2px 10px rgba(0,0,0,0.25);'
  );

  const left = createSafeElement('span', { attrs: { id: 'mindset-v2-topbar-left' } });
  const right = createSafeElement('span', { attrs: { id: 'mindset-v2-topbar-right' } });
  topBar.appendChild(left);
  topBar.appendChild(right);
  document.body.appendChild(topBar);
  return topBar;
}

function ensureFooterBar() {
  let footer = document.getElementById('mindset-v2-footer');
  if (footer) return footer;

  footer = createSafeElement('div', { attrs: { id: 'mindset-v2-footer' } });
  setSafeAttr(
    footer,
    'style',
    'position:fixed;left:0;right:0;bottom:0;z-index:2147483645;background:rgba(15,23,42,0.92);color:#f8fafc;padding:8px 12px;font:12px/1.3 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;display:flex;justify-content:space-between;gap:10px;align-items:center;backdrop-filter:blur(8px);border-top:1px solid rgba(255,255,255,0.15);'
  );

  const summary = createSafeElement('span', { attrs: { id: 'mindset-v2-footer-summary' } });
  const meta = createSafeElement('span', { attrs: { id: 'mindset-v2-footer-meta' } });
  footer.appendChild(summary);
  footer.appendChild(meta);
  document.body.appendChild(footer);
  return footer;
}

export function renderStatusChrome(payload = {}) {
  ensureTopBar();
  ensureFooterBar();

  const left = document.getElementById('mindset-v2-topbar-left');
  const right = document.getElementById('mindset-v2-topbar-right');
  const summary = document.getElementById('mindset-v2-footer-summary');
  const meta = document.getElementById('mindset-v2-footer-meta');

  const sourceName = payload.sourceName || payload.domain || 'Unknown source';
  const credibility = payload.credibility == null ? '?' : Number(payload.credibility).toFixed(1);
  const bias = payload.bias || 'unknown';
  const load = payload.credibilityLoad == null ? '?' : Number(payload.credibilityLoad).toFixed(1);
  const visits = payload.weeklyVisits ?? 0;
  const domains = payload.weeklyDomains ?? 0;
  const interventions = payload.interventionCount ?? 0;

  setSafeText(left, `Mindset v2 | ${sourceName} | Cred ${credibility}/10 | Bias ${bias}`);
  setSafeText(right, `Guidance ${payload.guidanceLevel || 'normal'} | Load ${load}`);
  setSafeText(summary, `This week: ${visits} visits across ${domains} domains`);
  setSafeText(meta, `${interventions} intervention${interventions === 1 ? '' : 's'} active`);
}
