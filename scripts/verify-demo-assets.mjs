import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const browserDir = join(process.cwd(), 'dist', 'demo', 'browser');
const files = readdirSync(browserDir, { recursive: true })
  .filter((file) => typeof file === 'string' && (file.endsWith('.css') || file.endsWith('.js')));

const bundles = files.map((file) => readFileSync(join(browserDir, file), 'utf8')).join('\n');

if (bundles.includes('/ngx-radiant/demo-art/')) {
  throw new Error('Demo bundles must not hard-code /ngx-radiant/demo-art/ asset URLs.');
}

if (!/\.\/media\/aurora-landscape-[A-Z0-9]+\.png/.test(bundles)) {
  throw new Error('Built demo CSS is missing the bundled aurora media-card background URL.');
}

if (!/\.\/media\/canyon-prism-[A-Z0-9]+\.png/.test(bundles)) {
  throw new Error('Built demo CSS is missing the bundled canyon media-card background URL.');
}

console.log('Demo asset URLs verified.');
