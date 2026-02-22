import path from 'node:path';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

function contentTypeFor(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

const server = http.createServer((req, res) => {
  const rawUrl = req.url || '/';
  const pathname = rawUrl.split('?')[0];
  const requested = pathname === '/' ? '/src/popup/popup.html' : pathname;
  const safePath = path.normalize(requested).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(rootDir, safePath);
  if (!filePath.startsWith(rootDir)) {
    res.statusCode = 403;
    res.end('forbidden');
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.statusCode = 404;
    res.end('not found');
    return;
  }
  res.setHeader('Content-Type', contentTypeFor(filePath));
  res.end(fs.readFileSync(filePath));
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const popupUrl = `http://127.0.0.1:${port}/src/popup/popup.html`;

let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch (error) {
  console.error('Playwright Chromium failed to launch. Install browser with: npx playwright install chromium');
  throw error;
}

const page = await browser.newPage();
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});

await page.goto(popupUrl, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('h1');
const title = await page.textContent('h1');
if (!title || !title.includes('Mindset v2')) {
  throw new Error(`Unexpected popup title: ${title || '(empty)'}`);
}

if (consoleErrors.length > 0) {
  throw new Error(`Console errors detected:\n${consoleErrors.join('\n')}`);
}

await browser.close();
server.close();
console.log('Playwright smoke passed');
