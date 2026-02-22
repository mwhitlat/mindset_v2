import { clearChildren, createSafeElement, isSafeHttpUrl, setSafeAttr } from '../../shared/security.js';

function buildAlternativeLink(link) {
  const href = isSafeHttpUrl(link?.url) ? link.url : 'https://example.com';
  const anchor = createSafeElement('a', {
    text: `${link?.name || 'Alternative Source'} (${link?.credibility ?? '?'}/10)`,
    classes: ['mindset-v2-alt-link'],
    attrs: { target: '_blank', rel: 'noopener noreferrer' }
  });
  setSafeAttr(anchor, 'href', href);
  return anchor;
}

export function renderInterventionBanner(payload = {}) {
  const rootId = 'mindset-v2-banner';
  let root = document.getElementById(rootId);
  if (!root) {
    root = createSafeElement('aside', { attrs: { id: rootId } });
    setSafeAttr(
      root,
      'style',
      'position:fixed;right:12px;bottom:12px;z-index:2147483646;max-width:360px;background:#0f172a;color:#f8fafc;padding:12px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.35);font:13px/1.4 system-ui;'
    );
    document.body.appendChild(root);
  }

  clearChildren(root);
  const title = createSafeElement('strong', {
    text: payload.title || 'Mindset Guidance'
  });
  const body = createSafeElement('p', {
    text: payload.message || 'Consider reading a higher-credibility source for this topic.'
  });
  setSafeAttr(body, 'style', 'margin:8px 0;');

  root.appendChild(title);
  root.appendChild(body);

  const links = Array.isArray(payload.alternatives) ? payload.alternatives.slice(0, 3) : [];
  if (links.length > 0) {
    const list = createSafeElement('div');
    links.forEach((item) => {
      const row = createSafeElement('div', { attrs: { style: 'margin:4px 0;' } });
      row.appendChild(buildAlternativeLink(item));
      list.appendChild(row);
    });
    root.appendChild(list);
  }

  const closeBtn = createSafeElement('button', {
    text: 'Dismiss',
    attrs: { type: 'button', style: 'margin-top:10px;cursor:pointer;' }
  });
  closeBtn.addEventListener('click', () => {
    root.remove();
  });
  root.appendChild(closeBtn);
}

export function renderInterventionModal(payload = {}) {
  const rootId = 'mindset-v2-intervention-modal';
  let root = document.getElementById(rootId);
  if (!root) {
    root = createSafeElement('div', { attrs: { id: rootId } });
    setSafeAttr(
      root,
      'style',
      'position:fixed;inset:0;z-index:2147483647;background:rgba(2,6,23,0.62);display:flex;align-items:center;justify-content:center;padding:16px;'
    );
    document.body.appendChild(root);
  }

  clearChildren(root);
  const panel = createSafeElement('section');
  setSafeAttr(
    panel,
    'style',
    'width:min(560px,95vw);background:#fff;color:#0f172a;border-radius:14px;padding:18px;box-shadow:0 20px 48px rgba(0,0,0,0.28);font:14px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;'
  );
  panel.appendChild(createSafeElement('h2', { text: payload.title || 'Mindset Intervention' }));
  panel.appendChild(createSafeElement('p', { text: payload.message || '' }));

  const alts = Array.isArray(payload.alternatives) ? payload.alternatives : [];
  if (alts.length) {
    const list = createSafeElement('div');
    alts.forEach((link) => {
      const row = createSafeElement('div', { attrs: { style: 'margin:8px 0;' } });
      row.appendChild(buildAlternativeLink(link));
      list.appendChild(row);
    });
    panel.appendChild(list);
  }

  const actions = createSafeElement('div', { attrs: { style: 'margin-top:12px;display:flex;gap:8px;justify-content:flex-end;' } });
  const dismiss = createSafeElement('button', { text: 'Dismiss', attrs: { type: 'button' } });
  setSafeAttr(dismiss, 'style', 'border:0;border-radius:9px;padding:8px 12px;cursor:pointer;background:#dbeafe;color:#1e3a8a;font-weight:600;');
  dismiss.addEventListener('click', () => root.remove());
  actions.appendChild(dismiss);
  panel.appendChild(actions);
  root.appendChild(panel);
}
