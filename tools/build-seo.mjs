import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const files = fs.readdirSync(root).filter(file => file.endsWith('.html'));

const plain = value => value
  .replace(/<br\s*\/?\s*>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const escapeAttribute = value => value
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

for (const file of files) {
  const filename = path.join(root, file);
  let html = fs.readFileSync(filename, 'utf8');
  const noindex = file === 'figma-hero-concepts.html';
  const h1 = plain(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || 'Bymac Pharmacon');
  const subtitle = plain(html.match(/<p class="product-subtitle"[^>]*>([\s\S]*?)<\/p>/i)?.[1] || '');
  const isProduct = file.startsWith('produto-');

  const pageTitles = {
    'index.html': 'Bymac Pharmacon | Saúde, bem-estar e curadoria especializada',
    'sobre.html': 'Sobre a Bymac Pharmacon | Curadoria e atendimento especializado',
    'produtos.html': 'Produtos | Suplementos, dermocosméticos e bem-estar | Bymac',
    'contato.html': 'Contato e localização | Bymac Pharmacon',
    'politica-de-privacidade.html': 'Política de Privacidade | Bymac Pharmacon',
    'termos-e-condicoes.html': 'Termos e Condições | Bymac Pharmacon'
  };
  const title = isProduct ? `${h1} | Informações e disponibilidade | Bymac` : (pageTitles[file] || `${h1} | Bymac Pharmacon`);
  const defaultDescriptions = {
    'index.html': 'Conheça a Bymac Pharmacon e explore uma curadoria de suplementos, nutrição esportiva, dermocosméticos e produtos para saúde e bem-estar.',
    'sobre.html': 'Conheça a Bymac Pharmacon, nossa curadoria especializada, critérios de qualidade e atendimento no Shopping Barcelona, em Ciudad del Este.',
    'produtos.html': 'Explore o catálogo Bymac Pharmacon por nome e categoria e consulte informações e disponibilidade de produtos pelo WhatsApp.',
    'contato.html': 'Fale com a Bymac Pharmacon pelo WhatsApp, e-mail ou visite nossa loja no Shopping Barcelona, em Ciudad del Este, Paraguai.'
  };
  const description = escapeAttribute((subtitle || defaultDescriptions[file] || `Conheça ${h1} na Bymac Pharmacon. Consulte características, público indicado, cuidados e disponibilidade pelo WhatsApp.`).slice(0, 220));
  const image = html.match(/class="product-main-image[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i)?.[1]
    || html.match(/class="hero-slide-product"[^>]+src="([^"]+)"/i)?.[1]
    || html.match(/<img[^>]+src="([^"]+)"/i)?.[1]
    || './assets/figma/logo-small.svg';

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttribute(title)}</title>`);
  html = html.replace(/\s*<meta name="description"[^>]*\/>?/gi, '');
  html = html.replace(/\s*<meta name="robots"[^>]*\/>?/gi, '');
  html = html.replace(/\s*<meta name="theme-color"[^>]*\/>?/gi, '');
  html = html.replace(/\s*<link rel="canonical"[^>]*\/>?/gi, '');
  html = html.replace(/\s*<meta (?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*\/>?/gi, '');
  const seoHead = `
    <meta name="description" content="${description}" />
    <meta name="robots" content="${noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'}" />
    <link rel="canonical" href="./${file}" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:type" content="${isProduct ? 'product' : 'website'}" />
    <meta property="og:site_name" content="Bymac Pharmacon" />
    <meta property="og:title" content="${escapeAttribute(title)}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="./${file}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttribute(title)}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="theme-color" content="#31b436" />`;
  html = html.replace(/(<meta name="viewport"[^>]*\/>?)/i, `$1${seoHead}`);

  if (isProduct && subtitle) {
    const visible = `
          <p>${escapeAttribute(subtitle)}</p>
          <p><strong>Informações importantes:</strong> confira a composição, a porção, os alergênicos, as advertências e as condições de conservação na embalagem da apresentação disponível.</p>
          <p><strong>Uso responsável:</strong> a indicação depende da categoria do produto e das necessidades individuais. Produtos de uso especializado não devem ser utilizados sem avaliação e acompanhamento de profissional habilitado.</p>`;
    html = html.replace(/(<div class="product-description-copy" id="descricao">)[\s\S]*?(<\/div>\s*<div class="benefit-grid">)/i, `$1${visible}
        $2`);
  }

  html = html.replace(/<script src="\.\/seo-runtime\.js[^>]*><\/script>\s*/g, '');
  html = html.replace(/<\/body>/i, '    <script src="./seo-runtime.js?v=seo-20260816-1"></script>\n  </body>');
  if (!html.includes('rel="manifest"')) {
    html = html.replace(/(<link rel="stylesheet"[^>]*>)/i, '    <link rel="manifest" href="./manifest.webmanifest" />\n$1');
  }

  html = html.replace(/<img\s+([^>]*?)>/gi, (match, attrs) => {
    let next = attrs.replace(/\s+\/\s+(?=decoding=)/g, ' ').replace(/\s*\/\s*$/, '');
    if (!/\bdecoding=/.test(next)) next += ' decoding="async"';
    return `<img ${next} />`;
  });
  if (file === 'index.html') {
    html = html.replace(/\s+fetchpriority="high"/g, '');
    let heroIndex = 0;
    html = html.replace(/<img class="hero-slide-product"([^>]*)>/g, (match, attrs) => {
      attrs = attrs.replace(/\s+(?:fetchpriority="high"|loading="lazy")/g, '');
      const priority = heroIndex++ === 0 ? ' fetchpriority="high"' : ' loading="lazy"';
      return `<img class="hero-slide-product"${priority}${attrs}>`;
    });
  }
  fs.writeFileSync(filename, html);
}

console.log(`SEO aplicado em ${files.length} páginas.`);
