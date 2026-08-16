import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const assets = path.join(root, 'assets');
const replacements = [];

const walk = directory => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filename);
    else if (entry.name.endsWith('.webp')) {
      const relative = path.relative(root, filename).split(path.sep).join('/');
      for (const extension of ['.png', '.jpg', '.jpeg']) {
        const original = relative.replace(/\.webp$/i, extension);
        if (!fs.existsSync(path.join(root, original))) continue;
        const encoded = original.split('/').map(segment => encodeURIComponent(segment)).join('/');
        replacements.push([original, relative], [encoded, relative.split('/').map(segment => encodeURIComponent(segment)).join('/')]);
      }
    }
  }
};
walk(assets);

const textExtensions = new Set(['.html', '.css', '.js']);
let changedFiles = 0;
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isFile() || !textExtensions.has(path.extname(entry.name))) continue;
  const filename = path.join(root, entry.name);
  let content = fs.readFileSync(filename, 'utf8');
  const before = content;
  for (const [from, to] of replacements) content = content.split(from).join(to);
  if (content !== before) {
    fs.writeFileSync(filename, content);
    changedFiles++;
  }
}
console.log(`Referências WebP atualizadas em ${changedFiles} arquivos.`);
