import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const v2Root = path.resolve(__dirname, '../..');
const v1Root = path.resolve(v2Root, '..');
const outDir = path.join(v2Root, 'dist', 'compare-screenshots', 'v1');
fs.mkdirSync(outDir, { recursive: true });

const harnessBase = 'http://127.0.0.1:4173/tests/harness';

async function isUp() {
  try {
    const res = await fetch(`${harnessBase}/index.html`);
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForUp(ms = 10000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    if (await isUp()) return true;
    await delay(150);
  }
  return false;
}

let serverProc = null;
let owned = false;
if (!(await isUp())) {
  owned = true;
  serverProc = spawn(process.execPath, ['scripts/serve-harness.mjs'], {
    cwd: v1Root,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const ready = await waitForUp(12000);
  if (!ready) {
    if (serverProc) serverProc.kill('SIGTERM');
    throw new Error('Could not start v1 harness server on :4173');
  }
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  await page.goto(`${harnessBase}/harness.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: path.join(outDir, 'v1-content-harness.png'), fullPage: true });

  await page.goto(`${harnessBase}/popup-harness.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#previewFrame');
  await page.waitForTimeout(1800);
  await page.locator('#previewFrame').screenshot({ path: path.join(outDir, 'v1-popup.png') });

  await page.goto(`${harnessBase}/dashboard-harness.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#previewFrame');
  await page.waitForTimeout(2200);
  await page.locator('#previewFrame').screenshot({ path: path.join(outDir, 'v1-dashboard.png') });

  console.log(`v1 screenshots saved to ${outDir}`);
} finally {
  await browser.close();
  if (owned && serverProc) serverProc.kill('SIGTERM');
}
