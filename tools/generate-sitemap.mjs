import fs from 'node:fs';
import path from 'node:path';

const base = (process.env.SITE_URL || '').replace(/\/$/, '');
if (!/^https:\/\//.test(base)) {
  console.error('Informe o domínio público: SITE_URL=https://seudominio.com node tools/generate-sitemap.mjs');
  process.exit(1);
}
const root = path.resolve(import.meta.dirname, '..');
const excluded = new Set(['figma-hero-concepts.html']);
const pages = fs.readdirSync(root).filter(file => file.endsWith('.html') && !excluded.has(file));
const urls = pages.map(file => `  <url><loc>${base}/${file === 'index.html' ? '' : file}</loc></url>`).join('\n');
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log(`sitemap.xml criado com ${pages.length} URLs.`);
