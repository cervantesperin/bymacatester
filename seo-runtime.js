(() => {
  const cleanUrl = new URL(window.location.href);
  cleanUrl.search = '';
  cleanUrl.hash = '';
  const pathSegments = cleanUrl.pathname.split('/').filter(Boolean);
  const pagesBasePath = cleanUrl.hostname.endsWith('.github.io') && pathSegments.length
    ? `/${pathSegments[0]}`
    : '';
  const siteBase = `${cleanUrl.origin}${pagesBasePath}/`;

  const title = document.title.trim();
  const description = document.querySelector('meta[name="description"]')?.content?.trim() || '';
  const h1 = document.querySelector('h1')?.textContent?.trim() || title.split('|')[0].trim();
  const productImage = document.querySelector('.product-main-image img, .hero-slide.active .hero-slide-product, main img');
  const imageUrl = productImage ? new URL(productImage.getAttribute('src'), cleanUrl).href : '';
  const isProduct = document.body.classList.contains('product-detail-page') || /^produto-/.test(cleanUrl.pathname.split('/').pop() || '');

  const setMeta = (selector, attribute, value) => {
    const element = document.querySelector(selector);
    if (element && value) element.setAttribute(attribute, value);
  };

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = cleanUrl.href;
  setMeta('meta[property="og:url"]', 'content', cleanUrl.href);
  setMeta('meta[property="og:image"]', 'content', imageUrl);
  setMeta('meta[name="twitter:image"]', 'content', imageUrl);

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'LocalBusiness'],
        '@id': `${siteBase}#organization`,
        name: 'Bymac Pharmacon',
        url: siteBase,
        telephone: '+595972333177',
        sameAs: [
          'https://www.instagram.com/bymacpharmacon.py/',
          'https://www.tiktok.com/@bymacpharmacon'
        ],
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Shopping Barcelona, Av. Carlos Antonio López',
          addressLocality: 'Ciudad del Este',
          postalCode: '100136',
          addressCountry: 'PY'
        }
      },
      {
        '@type': 'WebSite',
        '@id': `${siteBase}#website`,
        url: siteBase,
        name: 'Bymac Pharmacon',
        inLanguage: 'pt-BR',
        publisher: { '@id': `${siteBase}#organization` }
      }
    ]
  };

  if (isProduct) {
    graph['@graph'].push({
      '@type': 'Product',
      '@id': `${cleanUrl.href}#product`,
      name: h1,
      description,
      image: imageUrl ? [imageUrl] : undefined,
      url: cleanUrl.href
    });
  }

  const breadcrumb = [...document.querySelectorAll('.breadcrumb a, .breadcrumb span')]
    .map((element, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: element.textContent.trim(),
      item: element.matches('a') ? new URL(element.getAttribute('href'), cleanUrl).href : cleanUrl.href
    }))
    .filter(item => item.name);
  if (breadcrumb.length > 1) {
    graph['@graph'].push({ '@type': 'BreadcrumbList', itemListElement: breadcrumb });
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(graph);
  document.head.append(script);
})();
