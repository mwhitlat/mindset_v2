import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const packageDir = path.join(distDir, 'mindset-v2-extension');

const includePaths = [
  'manifest.json',
  'src',
  'assets'
];

function rmrf(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src);
    entries.forEach((entry) => {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    });
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function ensureManifest() {
  const manifestPath = path.join(root, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('manifest.json missing');
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!manifest.manifest_version || !manifest.name || !manifest.version) {
    throw new Error('manifest.json missing required fields');
  }
}

function main() {
  ensureManifest();
  rmrf(packageDir);
  fs.mkdirSync(packageDir, { recursive: true });

  includePaths.forEach((entry) => {
    const src = path.join(root, entry);
    if (fs.existsSync(src)) {
      copyRecursive(src, path.join(packageDir, entry));
    }
  });

  console.log(`Packaged extension files in ${packageDir}`);
}

main();
