import { copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
copyFileSync(join(root, 'dist', 'index.html'), join(root, 'dist', 'spa-shell.html'));
console.log('Wrote dist/spa-shell.html for server SEO.');
