import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../../src');

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const output = [];
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...walkFiles(fullPath));
      return;
    }
    if (entry.name.endsWith('.js') || entry.name.endsWith('.html')) {
      output.push(fullPath);
    }
  });
  return output;
}

test('source files do not use unsafe render patterns', () => {
  const files = walkFiles(SRC_DIR);
  const findings = [];
  const patterns = [
    { name: 'innerHTML', regex: /\binnerHTML\b/ },
    { name: 'insertAdjacentHTML', regex: /\binsertAdjacentHTML\b/ },
    { name: 'outerHTML', regex: /\bouterHTML\b/ },
    { name: 'inline-on-event', regex: /\son[a-z]+\s*=/i }
  ];

  files.forEach((filePath) => {
    const contents = fs.readFileSync(filePath, 'utf8');
    patterns.forEach((pattern) => {
      if (pattern.regex.test(contents)) {
        findings.push(`${pattern.name}: ${filePath}`);
      }
    });
  });

  assert.deepEqual(findings, []);
});
