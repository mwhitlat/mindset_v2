import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../..');
const extensionPath = path.join(root, 'dist', 'mindset-v2-extension');
const screenshotDir = path.join(root, 'dist', 'ux-screenshots');

if (!fs.existsSync(extensionPath)) {
  throw new Error(`Extension package missing at ${extensionPath}. Run npm run build:package first.`);
}

fs.mkdirSync(screenshotDir, { recursive: true });

const server = http.createServer((req, res) => {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Policy Headline</title></head><body><h1>Test page</h1></body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(html);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();

const userDataDir = path.join(root, '.pw-ux-profile');
if (fs.existsSync(userDataDir)) {
  fs.rmSync(userDataDir, { recursive: true, force: true });
}
fs.mkdirSync(userDataDir, { recursive: true });

const context = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
    `--host-resolver-rules=MAP foxnews.com 127.0.0.1,MAP breitbart.com 127.0.0.1,MAP right.local 127.0.0.1`
  ]
});

try {
  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent('serviceworker', { timeout: 15000 });
  }
  const extensionId = serviceWorker.url().split('/')[2];

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/src/popup/popup.html`, { waitUntil: 'domcontentloaded' });
  await popup.waitForSelector('h1');
  await popup.screenshot({ path: path.join(screenshotDir, 'popup.png'), fullPage: true });

  // Prime right-leaning streak to trigger echo debt.
  const seedVisits = ['foxnews.com', 'breitbart.com', 'right.local', 'foxnews.com'];
  for (const domain of seedVisits) {
    await popup.evaluate(async (payload) => {
      await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { action: 'visit:track', payload: { ...payload, title: 'Policy Update', timestamp: Date.now() } },
          () => resolve()
        );
      });
    }, { domain });
  }

  const interventionProbe = await popup.evaluate(async () => {
    return await new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'intervention:get-state', payload: { domain: 'right.local', title: 'Policy Update' } },
        (response) => resolve(response)
      );
    });
  });

  const dashboard = await context.newPage();
  await dashboard.goto(`chrome-extension://${extensionId}/src/dashboard/dashboard.html`, { waitUntil: 'domcontentloaded' });
  await dashboard.waitForSelector('.headline');
  await dashboard.screenshot({ path: path.join(screenshotDir, 'dashboard.png'), fullPage: true });

  const content = await context.newPage();
  await content.goto(`http://right.local:${port}/`, { waitUntil: 'domcontentloaded' });
  await content.waitForSelector('#mindset-v2-topbar', { timeout: 15000 });
  await content.waitForSelector('#mindset-v2-footer', { timeout: 15000 });
  await content.waitForTimeout(2500);
  await content.screenshot({ path: path.join(screenshotDir, 'content-echo-modal.png'), fullPage: true });

  // Assertions in-page for UX essentials.
  const popupChecks = await popup.evaluate(() => ({
    hasStatus: Boolean(document.getElementById('status')?.textContent),
    hasMetrics: Boolean(document.getElementById('visitsValue')) && Boolean(document.getElementById('domainsValue')),
    hasActions: Boolean(document.getElementById('dashboardBtn')) && Boolean(document.getElementById('settingsBtn'))
  }));

  const dashboardChecks = await dashboard.evaluate(() => ({
    hasTrend: Boolean(document.querySelector('.trendList')),
    hasFilters: Boolean(document.querySelector('.visitControls')),
    hasActions: Boolean(document.querySelector('.dashActions'))
  }));

  const contentChecks = await content.evaluate(() => ({
    hasTopbar: Boolean(document.getElementById('mindset-v2-topbar')),
    hasFooter: Boolean(document.getElementById('mindset-v2-footer')),
    hasEchoModal: Boolean(document.getElementById('mindset-v2-intervention-modal'))
  }));

  if (!popupChecks.hasStatus || !popupChecks.hasMetrics || !popupChecks.hasActions) {
    throw new Error(`Popup UX checks failed: ${JSON.stringify(popupChecks)}`);
  }
  if (!dashboardChecks.hasTrend || !dashboardChecks.hasFilters || !dashboardChecks.hasActions) {
    throw new Error(`Dashboard UX checks failed: ${JSON.stringify(dashboardChecks)}`);
  }
  if (!contentChecks.hasTopbar || !contentChecks.hasFooter || !contentChecks.hasEchoModal) {
    throw new Error(`Content UX checks failed: ${JSON.stringify(contentChecks)} | probe=${JSON.stringify(interventionProbe)}`);
  }

  console.log(`UX verification passed. Screenshots: ${screenshotDir}`);
} finally {
  await context.close();
  server.close();
}
