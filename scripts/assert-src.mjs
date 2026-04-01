import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const srcDir = join(root, '..', 'src');

if (!existsSync(srcDir)) {
  console.error('\n✖ Build failed: ./src directory is missing.\n');
  console.error('  Your GitHub repo must include the application source (React components, etc.).');
  console.error('  From your project folder run:\n');
  console.error('    git add src');
  console.error('    git commit -m "Add application source"');
  console.error('    git push origin main\n');
  process.exit(1);
}
