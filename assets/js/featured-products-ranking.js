const FEATURED_STORAGE_KEY = "bymac-product-interest-v1";
const FEATURED_SESSION_KEY = "bymac-product-session-v1";

const normalizeFeaturedValue = (value = "") =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const productSlugFromHref = (href = "") => {
  const match = href.match(/produto-([^/?#]+)\.html/i);
  return match ? match[1] : "";
};

const initialTrendWeights = {
  "creatine-monohydrate": 100,
  "creatine-micronized-plus": 96,
  "gold-standard-whey": 92,
  "iso100": 88,
  "good-whey-protein": 82,
  "serious-mass": 76,
  "c4-original": 72,
  "gnc-triple-strength-fish-oil": 68,
  "proteimax-omega-3-ts": 66,
  "omega-3-1000mg": 64,
  "medicube-retinol-nmn-boosting-serum": 62,
  "celimax-retinol-shot": 60,
  "gnc-vitamin-d-3": 58,
  "gnc-magnesium": 56,
};

const excludedFromAutomaticHighlight =
  /retatrut|\breta\b|tirzep|tirzec|synedica|\btg\b|bpc|tb-500|ipamorelin|ghk|hgh-fragment|kpv|pt-141|ss-31|mostc|hutox|israderm|dysport|nad-plus|klow/i;

const readFeaturedStore = () => {
  try {
    return JSON.parse(localStorage.getItem(FEATURED_STORAGE_KEY)) || {};
  } catch (_) {
    return {};
  }
};

const writeFeaturedStore = (store) => {
  try {
    localStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(store));
  } catch (_) {}
};

const incrementInterest = (slug, field, amount = 1) => {
  if (!slug || excludedFromAutomaticHighlight.test(slug)) return;
  const store = readFeaturedStore();
  const entry = store[slug] || { clicks: 0, views: 0, searches: 0, updatedAt: 0 };
  entry[field] = Math.min(10000, (entry[field] || 0) + amount);
  entry.updatedAt = Date.now();
  store[slug] = entry;
  writeFeaturedStore(store);
};

const trackProductPageView = () => {
  const slug = productSlugFromHref(location.pathname);
  if (!slug) return;
  try {
    const session = JSON.parse(sessionStorage.getItem(FEATURED_SESSION_KEY)) || {};
    if (session[slug]) return;
    session[slug] = true;
    sessionStorage.setItem(FEATURED_SESSION_KEY, JSON.stringify(session));
    incrementInterest(slug, "views");
  } catch (_) {
    incrementInterest(slug, "views");
  }
};

const trackProductClicks = () => {
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href*="produto-"][href$=".html"]');
    if (!link) return;
    incrementInterest(productSlugFromHref(link.getAttribute("href")), "clicks");
  });
};

const trackCatalogSearches = () => {
  const input = document.querySelector("#catalog-search");
  if (!input) return;
  let timer;
  const recordedQueries = new Set();
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const query = normalizeFeaturedValue(input.value);
      if (query.length < 3 || recordedQueries.has(query)) return;
      recordedQueries.add(query);
      [...document.querySelectorAll(".catalog-card")]
        .filter((card) => !card.hidden)
        .slice(0, 3)
        .forEach((card, index) => {
          const href = card.querySelector('a[href*="produto-"]')?.getAttribute("href");
          incrementInterest(productSlugFromHref(href), "searches", index === 0 ? 2 : 1);
        });
    }, 800);
  });
};

const featuredScore = (slug, entry = {}) => {
  const trend = initialTrendWeights[slug] || 12;
  const behavior =
    (entry.clicks || 0) * 28 +
    (entry.searches || 0) * 22 +
    (entry.views || 0) * 10;
  const daysSinceUpdate = entry.updatedAt
    ? (Date.now() - entry.updatedAt) / 86400000
    : Infinity;
  const recentBonus = daysSinceUpdate <= 7 ? 10 : daysSinceUpdate <= 30 ? 4 : 0;
  return trend + behavior + recentBonus;
};

const createFeaturedCard = ({ name, image, href }) => {
  const article = document.createElement("article");
  article.className = "product-card";
  article.innerHTML = `
    <div class="product-image"><img loading="lazy" /></div>
    <h2></h2>
    <p class="price"><strong>Consulte</strong><span>/ WhatsApp</span></p>
    <a>Ver produto</a>
  `;
  const img = article.querySelector("img");
  img.src = image;
  img.alt = name;
  article.querySelector("h2").textContent = name;
  article.querySelector("a").href = href;
  return article;
};

const updateHomeFeaturedProducts = async () => {
  const section = document.querySelector(".products-section");
  const grid = section?.querySelector(".products-grid");
  if (!section || !grid) return;

  try {
    const response = await fetch("./produtos.html");
    if (!response.ok) return;
    const catalog = new DOMParser().parseFromString(await response.text(), "text/html");
    const store = readFeaturedStore();
    const products = [...catalog.querySelectorAll(".catalog-card")]
      .map((card) => {
        const href = card.querySelector('a[href*="produto-"]')?.getAttribute("href") || "";
        const slug = productSlugFromHref(href);
        return {
          slug,
          href,
          name: card.querySelector("h4")?.textContent.trim() || "",
          image: card.querySelector(".catalog-image img")?.getAttribute("src") || "",
          score: featuredScore(slug, store[slug]),
        };
      })
      .filter((product) =>
        product.slug &&
        product.name &&
        product.image &&
        !excludedFromAutomaticHighlight.test(product.slug)
      )
      .sort((first, second) => second.score - first.score || first.name.localeCompare(second.name))
      .slice(0, 4);

    if (products.length !== 4) return;
    grid.replaceChildren(...products.map(createFeaturedCard));
    section.dataset.ranking = "trend-and-interest";
    const eyebrow = section.querySelector(".section-heading > p");
    if (eyebrow) eyebrow.textContent = "Em destaque agora";
  } catch (_) {
    // Preserva a seleção editorial original como fallback.
  }
};

trackProductPageView();
trackProductClicks();
trackCatalogSearches();
updateHomeFeaturedProducts();
