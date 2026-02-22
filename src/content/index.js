(function mindsetV2Content() {
  const ACTIONS = {
    GET_INTERVENTION_STATE: 'intervention:get-state',
    GET_WEEKLY_SUMMARY: 'summary:get-weekly'
  };

  const SOURCE_MAP = {
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
    'left.local': { name: 'Left Local', credibility: 3.2, category: 'news', bias: 'left' }
  };

  function normalizeDomain(domain) {
    return String(domain || '').toLowerCase().replace(/^www\./, '');
  }

  function assessSourceProfile(domain, title) {
    const normalized = normalizeDomain(domain);
    const entries = Object.entries(SOURCE_MAP);
    for (const [key, value] of entries) {
      if (normalized === key || normalized.endsWith(`.${key}`)) {
        return { domain: normalized, ...value };
      }
    }
    const lower = `${normalized} ${String(title || '').toLowerCase()}`;
    let category = 'other';
    if (lower.includes('news')) category = 'news';
    else if (lower.includes('learn') || lower.includes('course') || lower.includes('edu')) category = 'educational';
    else if (lower.includes('video') || lower.includes('music')) category = 'entertainment';
    else if (lower.includes('social') || lower.includes('forum')) category = 'social';
    return { domain: normalized, name: normalized || 'Unknown', credibility: null, category, bias: 'unknown' };
  }

  function setSafeAttr(node, attr, value) {
    node.setAttribute(attr, String(value == null ? '' : value));
  }

  function setSafeText(node, value) {
    node.textContent = String(value == null ? '' : value);
  }

  function clearChildren(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function createSafeElement(tag, options) {
    const node = document.createElement(tag);
    const opts = options || {};
    if (opts.text != null) setSafeText(node, opts.text);
    (opts.classes || []).forEach((cls) => cls && node.classList.add(cls));
    Object.entries(opts.attrs || {}).forEach(([k, v]) => setSafeAttr(node, k, v));
    return node;
  }

  function isSafeHttpUrl(value) {
    try {
      const parsed = new URL(String(value || ''));
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_error) {
      return false;
    }
  }

  function buildAlternativeLink(link) {
    const href = isSafeHttpUrl(link && link.url) ? link.url : 'https://example.com';
    const anchor = createSafeElement('a', {
      text: `${(link && link.name) || 'Alternative Source'} (${(link && link.credibility) || '?'}/10)`,
      attrs: { target: '_blank', rel: 'noopener noreferrer' }
    });
    setSafeAttr(anchor, 'href', href);
    return anchor;
  }

  function renderInterventionBanner(payload) {
    const rootId = 'mindset-v2-banner';
    let root = document.getElementById(rootId);
    if (!root) {
      root = createSafeElement('aside', { attrs: { id: rootId } });
      setSafeAttr(
        root,
        'style',
        'position:fixed;right:12px;bottom:12px;z-index:2147483646;max-width:360px;background:#0f172a;color:#f8fafc;padding:12px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.35);font:13px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;'
      );
      document.body.appendChild(root);
    }

    clearChildren(root);
    root.appendChild(createSafeElement('strong', { text: (payload && payload.title) || 'Mindset Guidance' }));
    const body = createSafeElement('p', { text: (payload && payload.message) || '' });
    setSafeAttr(body, 'style', 'margin:8px 0;');
    root.appendChild(body);

    const links = Array.isArray(payload && payload.alternatives) ? payload.alternatives.slice(0, 3) : [];
    if (links.length) {
      const list = createSafeElement('div');
      links.forEach((item) => {
        const row = createSafeElement('div', { attrs: { style: 'margin:4px 0;' } });
        row.appendChild(buildAlternativeLink(item));
        list.appendChild(row);
      });
      root.appendChild(list);
    }

    const closeBtn = createSafeElement('button', { text: 'Dismiss', attrs: { type: 'button' } });
    setSafeAttr(closeBtn, 'style', 'margin-top:10px;cursor:pointer;');
    closeBtn.addEventListener('click', () => root.remove());
    root.appendChild(closeBtn);
  }

  function renderInterventionModal(payload) {
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
    panel.appendChild(createSafeElement('h2', { text: (payload && payload.title) || 'Mindset Intervention' }));
    panel.appendChild(createSafeElement('p', { text: (payload && payload.message) || '' }));

    const alts = Array.isArray(payload && payload.alternatives) ? payload.alternatives : [];
    if (alts.length) {
      const list = createSafeElement('div');
      alts.forEach((item) => {
        const row = createSafeElement('div', { attrs: { style: 'margin:8px 0;' } });
        row.appendChild(buildAlternativeLink(item));
        list.appendChild(row);
      });
      panel.appendChild(list);
    }

    const actions = createSafeElement('div', { attrs: { style: 'margin-top:12px;display:flex;justify-content:flex-end;' } });
    const dismiss = createSafeElement('button', { text: 'Dismiss', attrs: { type: 'button' } });
    setSafeAttr(dismiss, 'style', 'border:0;border-radius:9px;padding:8px 12px;cursor:pointer;background:#dbeafe;color:#1e3a8a;font-weight:600;');
    dismiss.addEventListener('click', () => root.remove());
    actions.appendChild(dismiss);
    panel.appendChild(actions);
    root.appendChild(panel);
  }

  function renderStatusChrome(payload) {
    let topBar = document.getElementById('mindset-v2-topbar');
    if (!topBar) {
      topBar = createSafeElement('div', { attrs: { id: 'mindset-v2-topbar' } });
      setSafeAttr(topBar, 'style', 'position:fixed;top:0;left:0;right:0;z-index:2147483645;background:linear-gradient(90deg,#0f172a,#1e3a8a);color:#fff;padding:6px 12px;font:12px/1.3 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;display:flex;justify-content:space-between;gap:8px;box-shadow:0 2px 10px rgba(0,0,0,0.25);');
      topBar.appendChild(createSafeElement('span', { attrs: { id: 'mindset-v2-topbar-left' } }));
      topBar.appendChild(createSafeElement('span', { attrs: { id: 'mindset-v2-topbar-right' } }));
      document.body.appendChild(topBar);
    }

    let footer = document.getElementById('mindset-v2-footer');
    if (!footer) {
      footer = createSafeElement('div', { attrs: { id: 'mindset-v2-footer' } });
      setSafeAttr(footer, 'style', 'position:fixed;left:0;right:0;bottom:0;z-index:2147483645;background:rgba(15,23,42,0.92);color:#f8fafc;padding:8px 12px;font:12px/1.3 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;display:flex;justify-content:space-between;gap:10px;align-items:center;backdrop-filter:blur(8px);border-top:1px solid rgba(255,255,255,0.15);');
      footer.appendChild(createSafeElement('span', { attrs: { id: 'mindset-v2-footer-summary' } }));
      footer.appendChild(createSafeElement('span', { attrs: { id: 'mindset-v2-footer-meta' } }));
      document.body.appendChild(footer);
    }

    const left = document.getElementById('mindset-v2-topbar-left');
    const right = document.getElementById('mindset-v2-topbar-right');
    const summary = document.getElementById('mindset-v2-footer-summary');
    const meta = document.getElementById('mindset-v2-footer-meta');

    const sourceName = payload.sourceName || payload.domain || 'Unknown source';
    const credibility = payload.credibility == null ? '?' : Number(payload.credibility).toFixed(1);
    const bias = payload.bias || 'unknown';
    const load = payload.credibilityLoad == null ? '?' : Number(payload.credibilityLoad).toFixed(1);
    const visits = payload.weeklyVisits || 0;
    const domains = payload.weeklyDomains || 0;
    const interventions = payload.interventionCount || 0;

    setSafeText(left, `Mindset v2 | ${sourceName} | Cred ${credibility}/10 | Bias ${bias}`);
    setSafeText(right, `Guidance ${payload.guidanceLevel || 'normal'} | Load ${load}`);
    setSafeText(summary, `This week: ${visits} visits across ${domains} domains`);
    setSafeText(meta, `${interventions} intervention${interventions === 1 ? '' : 's'} active`);
  }

  function maybeRenderGuidance() {
    const domain = normalizeDomain(window.location.hostname);
    const profile = assessSourceProfile(domain, document.title || '');

    renderStatusChrome({
      domain,
      sourceName: profile.name,
      credibility: profile.credibility,
      bias: profile.bias,
      credibilityLoad: 0,
      guidanceLevel: 'normal',
      weeklyVisits: 0,
      weeklyDomains: 0,
      interventionCount: 0
    });

    const fetchGuidance = (attempt) => {
      chrome.runtime.sendMessage({
        action: ACTIONS.GET_INTERVENTION_STATE,
        payload: { domain, title: document.title || '' }
      }, (response) => {
        if (chrome.runtime.lastError || !response || !response.ok) {
          if (attempt < 2) setTimeout(() => fetchGuidance(attempt + 1), 300 * (attempt + 1));
          return;
        }
        const interventions = Array.isArray(response.interventions) ? response.interventions : [];
        chrome.runtime.sendMessage({ action: ACTIONS.GET_WEEKLY_SUMMARY }, (summaryResponse) => {
          const weekly = summaryResponse && summaryResponse.ok ? summaryResponse.summary : null;
          renderStatusChrome({
            domain,
            sourceName: profile.name,
            credibility: profile.credibility,
            bias: profile.bias,
            credibilityLoad: response.credibilityLoad,
            guidanceLevel: response.guidanceLevel,
            weeklyVisits: weekly && weekly.totals ? weekly.totals.visits : 0,
            weeklyDomains: weekly && weekly.totals ? weekly.totals.domains : 0,
            interventionCount: interventions.length
          });
        });

        if (!interventions.length) return;
        const primary = interventions[0];
        const title = primary.kind === 'same-story-upgrade'
          ? 'Same Story, Better Source'
          : primary.kind === 'echo-chamber-breaker'
            ? 'Echo Chamber Breaker'
            : 'Credibility Guidance';
        if (primary.kind === 'echo-chamber-breaker') {
          renderInterventionModal({ title, message: primary.message, alternatives: primary.alternatives || [] });
        } else {
          renderInterventionBanner({ title, message: primary.message, alternatives: primary.alternatives || [] });
        }
      });
    };

    fetchGuidance(0);
  }

  maybeRenderGuidance();
})();
